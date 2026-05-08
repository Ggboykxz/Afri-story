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
  getDocs,
  deleteDoc,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'system' | 'work' | 'forum' | 'chat' | 'contest' | 'chapter' | 'subscription' | 'milestone' | 'verification' | 'shop' | 'social';
  isRead: boolean;
  link?: string;
  createdAt: any;
  relatedId?: string;
  actorId?: string;
  actorName?: string;
  actorPhoto?: string;
}

export interface GroupedNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  items?: Notification[];
  count: number;
  isRead: boolean;
  createdAt: any;
  link?: string;
}

export interface NotificationPreferences {
  newChapter: boolean;
  messages: boolean;
  social: boolean;
  contests: boolean;
  shop: boolean;
  system: boolean;
  email: boolean;
}

export const notificationService = {
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

  subscribeWithGrouping: (userId: string, callback: (notifications: Notification[]) => void) => {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      callback(notifications);
    });
  },

  getUnreadCount: async (userId: string): Promise<number> => {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },

  send: async (userId: string, data: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...data,
        userId,
        isRead: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error sending notification', error);
    }
  },

  sendToMultiple: async (userIds: string[], data: Omit<Notification, 'id' | 'userId' | 'isRead' | 'createdAt'>) => {
    try {
      const batch = writeBatch(db);
      const timestamp = serverTimestamp();
      
      userIds.forEach(userId => {
        const notifRef = doc(collection(db, 'notifications'));
        batch.set(notifRef, {
          ...data,
          userId,
          isRead: false,
          createdAt: timestamp,
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
    }
  },

  notifyNewChapter: async (userId: string, workTitle: string, chapterNumber: number, link: string) => {
    return notificationService.send(userId, {
      userId,
      title: 'Nouveau chapitre !',
      message: `${workTitle} - Chapitre ${chapterNumber} est disponible`,
      type: 'chapter',
      link,
    });
  },

  notifyNewWork: async (userId: string, artistName: string, workTitle: string, workId: string, coverUrl?: string) => {
    return notificationService.send(userId, {
      userId,
      title: 'Nouvelle œuvre',
      message: `${artistName} a publié "${workTitle}"`,
      type: 'work',
      link: `/work/${workId}`,
    });
  },

  notifyNewFollower: async (userId: string, followerName: string, followerId: string, link: string) => {
    return notificationService.send(userId, {
      userId,
      title: 'Nouvel abonné',
      message: `${followerName} vous suit désormais`,
      type: 'social',
      link,
      actorId: followerId,
      actorName: followerName,
    });
  },

  notifyLike: async (userId: string, likerName: string, workTitle: string, workId: string) => {
    return notificationService.send(userId, {
      userId,
      title: 'Nouveau like',
      message: `${likerName} a aimé "${workTitle}"`,
      type: 'social' as any,
      link: `/work/${workId}`,
    });
  },

  notifyComment: async (userId: string, commenterName: string, workTitle: string, preview: string, link: string) => {
    return notificationService.send(userId, {
      userId,
      title: 'Nouveau commentaire',
      message: `${commenterName}: ${preview.slice(0, 80)}...`,
      type: 'forum',
      link,
    });
  },

  notifyMilestone: async (userId: string, milestone: string, link: string, type: string = 'milestone') => {
    return notificationService.send(userId, {
      userId,
      title: 'Succès débloqué !',
      message: milestone,
      type: type as any,
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
        ? `Votre abonnement ${plan} expire dans 3 jours. Renouvelez pour continuer à profiter de vos avantages.`
        : `Votre abonnement ${plan} est confirmé. Profitez de vos avantages Premium !`,
      type: 'subscription',
      link: '/subscription',
    });
  },

  notifyChapterUnlock: async (userId: string, workTitle: string, chapterNumber: number, afriCoinsSpent: number) => {
    return notificationService.send(userId, {
      userId,
      title: 'Chapitre débloqué',
      message: `Vous avez débloqué le Chapitre ${chapterNumber} de "${workTitle}" pour ${afriCoinsSpent} AfriCoins`,
      type: 'chapter',
      link: '/library',
    });
  },

  notifyDonationReceived: async (userId: string, donorName: string, amount: number, workTitle?: string) => {
    const message = workTitle 
      ? `${donorName} vous a offert ${amount} AfriCoins pour "${workTitle}"`
      : `${donorName} vous a offert ${amount} AfriCoins`;
    
    return notificationService.send(userId, {
      userId,
      title: 'Don reçu !',
      message,
      type: 'milestone',
      link: '/artist',
    });
  },

  notifyMentorRequest: async (userId: string, menteeName: string, workTitle: string, link: string) => {
    return notificationService.send(userId, {
      userId,
      title: 'Demande de mentorat',
      message: `${menteeName} demande votre aide pour "${workTitle}"`,
      type: 'work',
      link,
    });
  },

  notifyAMAStart: async (userId: string, artistName: string, sessionTitle: string, link: string) => {
    return notificationService.send(userId, {
      userId,
      title: 'Session AMA starts !',
      message: `${artistName} commence une session AMA: "${sessionTitle}"`,
      type: 'milestone',
      link,
    });
  },

  notifyNewCollaborationAd: async (userId: string, artistName: string, roleRequired: string, link: string) => {
    return notificationService.send(userId, {
      userId,
      title: 'Nouvelle opportunité',
      message: `${artistName} cherche un ${roleRequired} pour un projet`,
      type: 'contest',
      link,
    });
  },

  markAsRead: async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllAsRead: async (userId: string) => {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
      );
      const snapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach(d => {
        batch.update(d.ref, { isRead: true });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  markAsReadAndNavigate: async (notificationId: string, link: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true
      });
      if (link) {
        window.location.href = link;
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  },

  deleteNotification: async (notificationId: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  },

  deleteAllRead: async (userId: string) => {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', true)
      );
      const snapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach(d => {
        batch.delete(d.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error deleting read notifications:', error);
    }
  },

  deleteOldNotifications: async (userId: string, daysOld: number = 30) => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('createdAt', '<', cutoffDate)
      );
      const snapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach(d => {
        batch.delete(d.ref);
      });
      
      await batch.commit();
      return snapshot.size;
    } catch (error) {
      console.error('Error deleting old notifications:', error);
      return 0;
    }
  },

  getNotificationTemplates: () => ({
    chapter: {
      title: 'Nouveau chapitre',
      description: 'Quand un de vos webtoons préférés est mis à jour',
      defaultEnabled: true,
    },
    follow: {
      title: 'Nouveaux abonnés',
      description: 'Quand quelqu\'un vous suit',
      defaultEnabled: true,
    },
    like: {
      title: 'Likes',
      description: 'Quand quelqu\'un aime votre travail',
      defaultEnabled: true,
    },
    comment: {
      title: 'Commentaires',
      description: 'Quand quelqu\'un commente votre œuvre',
      defaultEnabled: true,
    },
    contest: {
      title: 'Concours',
      description: 'Nouveaux concours et résultats',
      defaultEnabled: true,
    },
    shop: {
      title: 'Boutique',
      description: 'Promotions et nouveautés boutique',
      defaultEnabled: false,
    },
    subscription: {
      title: 'Abonnements',
      description: 'Rappels et confirmations d\'abonnement',
      defaultEnabled: true,
    },
  }),
};

export default notificationService;