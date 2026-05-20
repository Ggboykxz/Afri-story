const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cloudinary = require('cloudinary').v2;

admin.initializeApp();

// Configuration validation helper
const checkConfig = (keys) => {
  const missing = keys.filter(k => !process.env[k]);
  if (missing.length > 0) {
    console.warn(`WARNING: Missing configuration for: ${missing.join(', ')}`);
    return false;
  }
  return true;
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

checkConfig(['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']);

// ============= UPLOAD FUNCTIONS =============

exports.uploadImage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { imageData, folder, fileName } = data;
  
  if (!imageData || typeof imageData !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'imageData is required');
  }

  // Security: Restrict folder path to prevent arbitrary path injection
  const safeFolder = folder && folder.startsWith('afristory/') ? folder : `afristory/users/${context.auth.uid}`;

  try {
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: safeFolder,
          public_id: fileName,
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return {
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to upload image');
  }
});

// ============= NOTIFICATION FUNCTIONS =============

exports.sendPushNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, title, body, data: payload } = data;

  if (!userId || !title || !body) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    const fcmTokenDoc = await admin.firestore().collection('fcmTokens').doc(userId).get();
    
    if (!fcmTokenDoc.exists || !fcmTokenDoc.data().token) {
      return { success: false, reason: 'no_token' };
    }

    const message = {
      notification: { title, body },
      data: payload || {},
      token: fcmTokenDoc.data().token,
    };

    const response = await admin.messaging().send(message);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send notification');
  }
});

// ============= EMAIL SERVICE (Service-ready architecture) =============

const emailService = {
  send: async (options) => {
    const { to, subject, templateName, data } = options;
    console.log(`[EmailService] Sending ${templateName} to ${to}`, data);
    
    // Logic for SendGrid/Resend would go here
    // return sgMail.send({ to, from: 'noreply@afristory.com', subject, ... });

    return true;
  }
};

exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  await admin.firestore().collection('users').doc(user.uid).set({
    email: user.email,
    displayName: user.displayName || 'Voyageur',
    role: 'reader',
    afriCoins: 100,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  await emailService.send({
    to: user.email,
    subject: 'Bienvenue sur AfriStory !',
    templateName: 'welcome',
    data: { name: user.displayName }
  });
});

// ============= CLEANUP FUNCTIONS (Scalable) =============

exports.cleanupOldNotifications = functions.pubsub
  .schedule('every day 03:00')
  .onRun(async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldNotifsQuery = admin.firestore()
      .collection('notifications')
      .where('createdAt', '<', admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
      .where('isRead', '==', true)
      .limit(500); // Respect batch limit

    const snapshot = await oldNotifsQuery.get();
    if (snapshot.empty) return null;

    const batch = admin.firestore().batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));

    await batch.commit();
    console.log(`Deleted ${snapshot.size} notifications`);
  });

// ============= FIRESTORE TRIGGERS =============

exports.onChapterPublish = functions.firestore.document('works/{workId}/chapters/{chapterId}')
  .onCreate(async (snap, context) => {
    const workId = context.params.workId;
    const workRef = admin.firestore().collection('works').doc(workId);
    
    await workRef.update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      'stats.chapters': admin.firestore.FieldValue.increment(1),
    });
  });
