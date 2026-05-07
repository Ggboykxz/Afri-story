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
  type: 'system' | 'work' | 'forum' | 'chat';
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
