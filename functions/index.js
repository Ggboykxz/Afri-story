const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Auto-moderation: detect spam in content
exports.moderateContent = functions.firestore
  .document('forum_threads/{threadId}')
  .onCreate(async (snapshot, context) => {
    const data = snapshot.data();
    const spamWords = ['buy cheap', 'click here', 'free money', 'winner', 'congratulations'];
    const content = (data.title + ' ' + data.content).toLowerCase();
    
    const isSpam = spamWords.some(word => content.includes(word));
    
    if (isSpam) {
      await snapshot.ref.update({
        isLocked: true,
        moderationNote: 'Auto-locked due to potential spam content'
      });
      
      // Notify moderators
      const modsSnapshot = await admin.firestore()
        .collection('users')
        .where('role', 'in', ['moderator', 'supervisor', 'admin'])
        .get();
      
      const batch = admin.firestore().batch();
      modsSnapshot.docs.forEach(doc => {
        batch.set(admin.firestore().collection('notifications').doc(), {
          userId: doc.id,
          type: 'moderation',
          message: 'New spam content detected and auto-locked',
          link: `/forum/thread/${context.params.threadId}`,
          isRead: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      await batch.commit();
    }
    
    return { moderated: isSpam };
  });

// Auto-approve AMA sessions
exports.scheduleAMASession = functions.firestore
  .document('ama_sessions/{sessionId}')
  .onCreate(async (snapshot, context) => {
    const data = snapshot.data();
    const sessionTime = data.endTime.toDate();
    const now = new Date();
    
    if (sessionTime > now) {
      // Schedule to auto-change status when session ends
      const delay = sessionTime.getTime() - now.getTime();
      
      setTimeout(async () => {
        await snapshot.ref.update({
          status: 'ended'
        });
      }, delay);
    }
    
    return { scheduled: true };
  });

// Update work statistics on chapter publish
exports.updateWorkStatsOnChapter = functions.firestore
  .document('works/{workId}/chapters/{chapterId}')
  .onCreate(async (snapshot, context) => {
    const workId = context.params.workId;
    const workRef = admin.firestore().doc('works/' + workId);
    const workDoc = await workRef.get();
    
    if (workDoc.exists) {
      const data = workDoc.data();
      await workRef.update({
        totalChapters: (data.totalChapters || 0) + 1,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    return { updated: true };
  });

// Delete user data on account deletion
exports.deleteUserData = functions.auth
  .user()
  .onDelete(async (user) => {
    const userId = user.uid;
    const db = admin.firestore();
    
    // Delete user profile
    await db.collection('users').doc(userId).delete();
    
    // Delete user's favorites
    const favorites = await db.collection('users/' + userId + '/favorites').get();
    const favBatch = db.batch();
    favorites.docs.forEach(doc => favBatch.delete(doc.ref));
    await favBatch.commit();
    
    // Delete reading history
    const history = await db.collection('users/' + userId + '/reading_history').get();
    const histBatch = db.batch();
    history.docs.forEach(doc => histBatch.delete(doc.ref));
    await histBatch.commit();
    
    // Delete notifications
    const notifications = await db.collection('notifications')
      .where('userId', '==', userId)
      .get();
    const notifBatch = db.batch();
    notifications.docs.forEach(doc => notifBatch.delete(doc.ref));
    await notifBatch.commit();
    
    return { deleted: true };
  });

// Stripe payment webhook
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const stripe = require('stripe')(functions.config().stripe.secret);
  
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      functions.config().stripe.webhook_secret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send('Webhook Error');
  }
  
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const userId = session.metadata.userId;
      const amount = session.metadata.amount;
      
      // Add AfriCoins to user account
      await admin.firestore().collection('africoins_transactions').add({
        userId,
        amount: parseInt(amount),
        type: 'purchase',
        description: 'AfriCoins purchase via Stripe',
        stripePaymentId: session.payment_intent,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Update user balance
      const userRef = admin.firestore().doc('users/' + userId);
      await userRef.update({
        afriCoins: admin.firestore.FieldValue.increment(parseInt(amount))
      });
      break;
      
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      const customerId = subscription.customer;
      
      // Downgrade user subscription
      const users = await admin.firestore()
        .collection('users')
        .where('stripeCustomerId', '==', customerId)
        .get();
      
      users.docs.forEach(async doc => {
        await doc.ref.update({
          subscription: null,
          subscriptionExpiresAt: null
        });
      });
      break;
  }
  
  return res.json({ received: true });
});