import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'system' | 'work' | 'forum' | 'chat' | 'contest' | 'chapter' | 'subscription' | 'milestone' | 'verification';
  isRead: boolean;
  link?: string;
  createdAt: any;
}

export const notificationService = {
  // Send a notification
  send: async (userId: string, data: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...data,
        isRead: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sending notification", error);
    }
  },

  // Quick notification helpers for different types
  notifyNewChapter: async (userId: string, workTitle: string, chapterNumber: number, link: string) => {
    return notificationService.send(userId, {
      userId,
      title: 'Nouveau chapitre !',
      message: `${workTitle} - Chapitre ${chapterNumber} est disponible`,
      type: 'chapter',
      link,
    });
  },

  notifyNewFollower: async (userId: string, followerName: string, link: string) => {
    return notificationService.send(userId, {
      userId,
      title: 'Nouvel abonné !',
      message: `${followerName} vous suit désormais`,
      type: 'work',
      link,
    });
  },

  notifyComment: async (userId: string, commenterName: string, preview: string, link: string) => {
    return notificationService.send(userId, {
      userId,
      title: 'Nouveau commentaire',
      message: `${commenterName}: ${preview.slice(0, 50)}...`,
      type: 'work',
      link,
    });
  },

  notifyMilestone: async (userId: string, milestone: string, link: string) => {
    return notificationService.send(userId, {
      userId,
      title: 'Félicitations !',
      message: milestone,
      type: 'milestone',
      link,
    });
  },

  notifyContest: async (userId: string, contestTitle: string, message: string, link: string) => {
    return notificationService.send(userId, {
      userId,
      title: contestTitle,
      message,
      type: 'contest',
      link,
    });
  },

  notifyVerification: async (userId: string, approved: boolean, message: string) => {
    return notificationService.send(userId, {
      userId,
      title: approved ? 'Compte vérifié !' : 'Demande de vérification',
      message,
      type: 'verification',
      link: approved ? '/profile' : '/become-pro',
    });
  },

  notifySubscription: async (userId: string, plan: string, expiring: boolean) => {
    return notificationService.send(userId, {
      userId,
      title: expiring ? 'Abonnement expirant' : 'Abonnement actif',
      message: expiring 
        ? `Votre abonnement ${plan} expire dans 3 jours`
        : `Votre abonnement ${plan} est confirmé`,
      type: 'subscription',
      link: '/subscription',
    });
  },

  // Listen for user notifications
  subscribe: (userId: string, callback: (notifications: Notification[]) => void) => {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      callback(notifications);
    });
  },

  // Mark as read
  markAsRead: async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true
      });
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  },

  // Mark all as read
  markAllAsRead: async (userId: string) => {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
      );
      const snapshot = await getDocs(q);
      const batch = snapshot.docs.map(d => updateDoc(d.ref, { isRead: true }));
      await Promise.all(batch);
    } catch (error) {
      console.error("Error marking all notifications as read", error);
    }
  }
};
