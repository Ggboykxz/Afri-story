const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cloudinary = require('cloudinary').v2;
const cors = require('cors')({ origin: true });

admin.initializeApp();

cloudinary.config({
  cloud_name: 'dfzrjuaap',
  api_key: '324446924179216',
  api_secret: 'CaSV4Q1Ik9Xb2vuK7-NbXtQLa_s'
});

// ============= UPLOAD FUNCTIONS =============

exports.uploadImage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { imageData, folder, fileName } = data;
  
  if (!imageData) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'imageData is required'
    );
  }

  try {
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folder || 'afristory',
          public_id: fileName,
          resource_type: 'image'
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
    throw new functions.https.HttpsError(
      'internal',
      'Failed to upload image'
    );
  }
});

exports.deleteImage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { publicId } = data;
  
  if (!publicId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'publicId is required'
    );
  }

  try {
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to delete image'
    );
  }
});

// ============= NOTIFICATION FUNCTIONS =============

exports.sendPushNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, title, body, data: payload } = data;

  if (!userId || !title || !body) {
    throw new functions.https.HttpsError('invalid-argument', 'userId, title, and body are required');
  }

  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const fcmTokenDoc = await admin.firestore().collection('fcmTokens').doc(userId).get();
    
    if (!fcmTokenDoc.exists || !fcmTokenDoc.data().token) {
      console.log('No FCM token for user:', userId);
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
    throw new functions.https.HttpsError('internal', 'Failed to send push notification');
  }
});

exports.sendBulkPushNotifications = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userIds, title, body, data: payload } = data;

  if (!userIds || !Array.isArray(userIds) || !title || !body) {
    throw new functions.https.HttpsError('invalid-argument', 'userIds array, title, and body are required');
  }

  try {
    const tokensSnapshot = await admin.firestore()
      .collection('fcmTokens')
      .where(admin.firestore.FieldPath.documentId(), 'in', userIds)
      .get();

    const tokens = [];
    tokensSnapshot.docs.forEach(doc => {
      if (doc.data().token && !doc.data().deletedAt) {
        tokens.push(doc.data().token);
      }
    });

    if (tokens.length === 0) {
      return { success: false, reason: 'no_tokens' };
    }

    const message = {
      notification: { title, body },
      data: payload || {},
      tokens: tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error('Error sending bulk push notifications:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send bulk push notifications');
  }
});

// ============= EMAIL FUNCTIONS (placeholder - nécessite SendGrid/Resend) =============

exports.sendEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { to, subject, html } = data;

  if (!to || !subject || !html) {
    throw new functions.https.HttpsError('invalid-argument', 'to, subject, and html are required');
  }

  // Placeholder - Intégrer SendGrid, Resend, ou Mailgun
  console.log('Email would be sent:', { to, subject });
  
  return {
    success: true,
    message: 'Email queued (placeholder - configure SendGrid/Resend)',
    preview: { to, subject }
  };
});

exports.sendWelcomeEmail = functions.firestore.document('users/{userId}')
  .onCreate(async (snap, context) => {
    const user = snap.data();
    const email = user.email;
    const displayName = user.displayName;

    if (!email) return;

    console.log(`Welcome email queued for ${email}`);
    
    // Intégrer SendGrid/Resend pour l'envoi réel
    // await sendEmail({
    //   to: email,
    //   subject: 'Bienvenue sur AfriStory !',
    //   html: `<h1>Bienvenue ${displayName}!</h1><p>Commencez à explorer les webtoons africains...</p>`
    // });
  });

exports.sendNewChapterEmail = functions.firestore.document('works/{workId}/chapters/{chapterId}')
  .onCreate(async (snap, context) => {
    const chapter = snap.data();
    const workId = context.params.workId;

    console.log(`New chapter notification queued for work ${workId}`);
    
    // Récupérer les followers de l'auteur et leur envoyer des notifications
  });

exports.sendSubscriptionExpiringEmail = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const expiringQuery = admin.firestore()
      .collection('users')
      .where('subscriptionExpiresAt', '<=', threeDaysLater)
      .where('subscriptionExpiresAt', '>', now);

    const snapshot = await expiringQuery.get();

    for (const doc of snapshot.docs) {
      const user = doc.data();
      console.log(`Subscription expiring email queued for ${user.email}`);
      
      // await sendEmail({
      //   to: user.email,
      //   subject: 'Votre abonnement AfriStory expire bientôt',
      //   html: `<h2>Bonjour ${user.displayName}</h2><p>Votre abonnement expire dans 3 jours...</p>`
      // });
    }
  });

// ============= ANALYTICS FUNCTIONS =============

exports.incrementWorkViews = functions.firestore.document('works/{workId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data().views || 0;
    const after = change.after.data().views || 0;

    if (after > before) {
      await admin.firestore().collection('analytics').add({
        workId: context.params.workId,
        type: 'view',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        viewsDelta: after - before,
      });
    }
  });

// ============= CLEANUP FUNCTIONS =============

exports.cleanupOldNotifications = functions.pubsub
  .schedule('every day 03:00')
  .onRun(async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldNotifsQuery = admin.firestore()
      .collection('notifications')
      .where('createdAt', '<', admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
      .where('isRead', '==', true);

    const batch = admin.firestore().batch();
    const docs = await oldNotifsQuery.get();

    docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Deleted ${docs.size} old notifications`);
  });

// ============= FIRESTORE TRIGGERS =============

exports.onUserDelete = functions.auth.user().onDelete(async (user) => {
  await admin.firestore().collection('users').doc(user.uid).delete();
  
  await admin.firestore().collection('fcmTokens').doc(user.uid).delete();
  
  console.log(`Cleaned up data for deleted user: ${user.uid}`);
});

exports.onWorkCreate = functions.firestore.document('works/{workId}')
  .onCreate(async (snap, context) => {
    await snap.ref.update({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      stats: {
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0,
      }
    });
  });

exports.onChapterPublish = functions.firestore.document('works/{workId}/chapters/{chapterId}')
  .onCreate(async (snap, context) => {
    const workId = context.params.workId;
    const chapter = snap.data();

    const workRef = admin.firestore().collection('works').doc(workId);
    
    await workRef.update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      'stats.chapters': admin.firestore.FieldValue.increment(1),
    });

    console.log(`Chapter ${chapter.number} published for work ${workId}`);
  });