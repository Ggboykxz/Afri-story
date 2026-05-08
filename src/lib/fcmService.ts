import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const VAPID_KEY = '';

let messaging: Messaging | null = null;

export const fcmService = {
  init: async (): Promise<boolean> => {
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        console.log('FCM not supported in this environment');
        return false;
      }

      const swRegistration = await navigator.serviceWorker.ready;
      
      try {
        messaging = getMessaging();
        
        onMessage(messaging, (payload) => {
          console.log('Foreground message received:', payload);
          
          const notificationTitle = payload.notification?.title || 'AfriStory';
          const notificationOptions = {
            body: payload.notification?.body || 'Nouvelle notification',
            icon: '/logo192.png',
            badge: '/badge-32.png',
            tag: payload.data?.notificationId || 'default',
            data: payload.data,
          };

          if (Notification.permission === 'granted') {
            new Notification(notificationTitle, notificationOptions);
          }
        });

        return true;
      } catch (e) {
        console.log('Firebase Messaging not initialized:', e);
        return false;
      }
    } catch (error) {
      console.error('FCM init error:', error);
      return false;
    }
  },

  requestPermission: async (userId: string): Promise<string | null> => {
    try {
      if (!('Notification' in window)) {
        console.log('Notifications not supported');
        return null;
      }

      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return null;
      }

      return await fcmService.getToken(userId);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return null;
    }
  },

  getToken: async (userId: string): Promise<string | null> => {
    try {
      if (!messaging) {
        await fcmService.init();
      }
      
      if (!messaging) return null;

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: await navigator.serviceWorker.ready,
      });

      if (token) {
        await fcmService.saveToken(userId, token);
      }

      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  },

  saveToken: async (userId: string, token: string) => {
    try {
      const tokenRef = doc(db, 'fcmTokens', userId);
      await setDoc(tokenRef, {
        token,
        userId,
        updatedAt: new Date(),
      }, { merge: true });
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  },

  deleteToken: async (userId: string) => {
    try {
      await updateDoc(doc(db, 'fcmTokens', userId), {
        deletedAt: new Date(),
      });
    } catch (error) {
      console.error('Error deleting FCM token:', error);
    }
  },

  showNotification: (title: string, options?: NotificationOptions) => {
    if (typeof window === 'undefined') return;
    
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/logo192.png',
        badge: '/badge-32.png',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    }
    return null;
  },

  requestBrowserPermission: async (): Promise<NotificationPermission | null> => {
    if (!('Notification' in window)) {
      return null;
    }
    return await Notification.requestPermission();
  },

  isSupported: (): boolean => {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  getPermissionStatus: (): NotificationPermission | null => {
    if (typeof window === 'undefined') return null;
    return Notification.permission;
  },
};

export const notificationSound = {
  play: (volume: number = 0.5) => {
    if (typeof window === 'undefined') return;
    
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = volume;
    audio.play().catch(() => {});
  },
  
  playCustom: (url: string, volume: number = 0.5) => {
    if (typeof window === 'undefined') return;
    
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch(() => {});
  },
};

export const badgeService = {
  setBadgeCount: async (count: number) => {
    if (typeof navigator !== 'undefined' && 'setAppBadge' in navigator) {
      try {
        if (count > 0) {
          await (navigator as any).setAppBadge(count);
        } else {
          await (navigator as any).clearAppBadge();
        }
      } catch (e) {
        console.log('Badge API not supported');
      }
    }
  },

  updateBrowserBadge: (count: number) => {
    if (typeof document !== 'undefined') {
      const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (favicon) {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = count > 0 ? '#A52A2A' : '#D4AF37';
          ctx.beginPath();
          ctx.arc(16, 16, 16, 0, Math.PI * 2);
          ctx.fill();
          
          if (count > 0) {
            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(count > 99 ? '99+' : String(count), 16, 16);
          }
          
          favicon.href = canvas.toDataURL();
        }
      }
    }
  },
};

export default fcmService;