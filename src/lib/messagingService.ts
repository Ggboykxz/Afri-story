import { 
  collection, 
  addDoc, 
  setDoc, 
  getDoc, 
  getDocs,
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc,
  doc, 
  serverTimestamp,
  limit,
  arrayUnion,
  increment,
  deleteDoc,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { notificationService } from './notificationService';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  readBy: string[];
  createdAt: any;
  updatedAt?: any;
  replyTo?: string;
  reactions?: Record<string, string[]>;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantPhotos: Record<string, string>;
  lastMessage?: string;
  lastMessageAt?: any;
  lastMessageSenderId?: string;
  unreadCount: Record<string, number>;
  type: 'private' | 'collab' | 'support';
  workId?: string;
  workTitle?: string;
  isTyping?: Record<string, boolean>;
  createdAt: any;
  updatedAt: any;
  isPinned?: boolean;
  isMuted?: boolean;
  isArchived?: boolean;
}

export interface TypingStatus {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: any;
}

export const messagingService = {
  subscribeToConversations: (userId: string, callback: (conversations: Conversation[]) => void) => {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Conversation[];
      callback(conversations);
    });
  },

  subscribeToMessages: (conversationId: string, callback: (messages: Message[]) => void, msgLimit: number = 50) => {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(msgLimit)
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      callback(messages);
    });
  },

  subscribeToTyping: (conversationId: string, currentUserId: string, callback: (typing: TypingStatus[]) => void) => {
    const q = query(
      collection(db, 'conversations', conversationId, 'typing'),
      where('timestamp', '>', Timestamp.fromDate(new Date(Date.now() - 10000)))
    );

    return onSnapshot(q, (snapshot) => {
      const typingStatuses = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as unknown as TypingStatus))
        .filter(t => t.userId !== currentUserId && t.isTyping);
      callback(typingStatuses);
    });
  },

  createConversation: async (participants: string[], type: 'private' | 'collab' | 'support' = 'private', workId?: string): Promise<string | null> => {
    try {
      const existingConv = await messagingService.findExistingConversation(participants);
      if (existingConv) {
        return existingConv;
      }

      const participantNames: Record<string, string> = {};
      const participantPhotos: Record<string, string> = {};

      for (const uid of participants) {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          participantNames[uid] = data.displayName || 'Utilisateur';
          participantPhotos[uid] = data.photoURL || '';
        }
      }

      const convRef = await addDoc(collection(db, 'conversations'), {
        participants,
        participantNames,
        participantPhotos,
        type,
        workId,
        unreadCount: participants.reduce((acc, uid) => ({ ...acc, [uid]: 0 }), {}),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return convRef.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  },

  findExistingConversation: async (participants: string[]): Promise<string | null> => {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', participants[0])
      );
      const snapshot = await getDocs(q);
      
      for (const docSnap of snapshot.docs) {
        const conv = docSnap.data() as Conversation;
        if (
          conv.participants.length === participants.length &&
          participants.every(p => conv.participants.includes(p))
        ) {
          return docSnap.id;
        }
      }
      return null;
    } catch (error) {
      console.error('Error finding conversation:', error);
      return null;
    }
  },

  sendMessage: async (
    conversationId: string, 
    content: string, 
    type: 'text' | 'image' | 'file' = 'text',
    fileUrl?: string,
    fileName?: string,
    fileSize?: number
  ): Promise<string | null> => {
    try {
      if (!auth.currentUser) return null;

      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const userData = userDoc.data();

      const messageRef = await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        conversationId,
        senderId: auth.currentUser.uid,
        senderName: userData?.displayName || 'Utilisateur',
        senderPhoto: userData?.photoURL || '',
        content,
        type,
        fileUrl,
        fileName,
        fileSize,
        readBy: [auth.currentUser.uid],
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: content.length > 100 ? content.slice(0, 100) + '...' : content,
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: auth.currentUser.uid,
        updatedAt: serverTimestamp(),
      });

      const convDoc = await getDoc(doc(db, 'conversations', conversationId));
      if (convDoc.exists()) {
        const conv = convDoc.data() as Conversation;
        const otherParticipants = conv.participants.filter(p => p !== auth.currentUser?.uid);

        for (const participantId of otherParticipants) {
          await updateDoc(doc(db, 'conversations', conversationId), {
            [`unreadCount.${participantId}`]: increment(1)
          });

          await notificationService.send(participantId, {
            userId: participantId,
            title: `${userData?.displayName || 'Quelqu\'un'} vous a envoyé un message`,
            message: content.length > 100 ? content.slice(0, 100) + '...' : content,
            type: 'chat',
            link: `/messages`,
          });
        }
      }

      await messagingService.stopTyping(conversationId);

      return messageRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  },

  markAsRead: async (conversationId: string, userId: string) => {
    try {
      const q = query(
        collection(db, 'conversations', conversationId, 'messages'),
        where('readBy', 'array-contains', userId),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      const snapshot = await getDocs(q);

      const batch = writeBatch(db);
      snapshot.docs.forEach(msgDoc => {
        const msg = msgDoc.data();
        if (!msg.readBy?.includes(userId)) {
          batch.update(msgDoc.ref, { readBy: arrayUnion(userId) });
        }
      });
      await batch.commit();

      await updateDoc(doc(db, 'conversations', conversationId), {
        [`unreadCount.${userId}`]: 0
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  },

  startTyping: async (conversationId: string) => {
    if (!auth.currentUser) return;
    try {
      await setDoc(doc(db, 'conversations', conversationId, 'typing', auth.currentUser.uid), {
        conversationId,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Utilisateur',
        isTyping: true,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error starting typing:', error);
    }
  },

  stopTyping: async (conversationId: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, 'conversations', conversationId, 'typing', auth.currentUser.uid));
    } catch (error) {
      console.error('Error stopping typing:', error);
    }
  },

  addReaction: async (conversationId: string, messageId: string, emoji: string, userId: string) => {
    try {
      const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
      await updateDoc(msgRef, {
        [`reactions.${emoji}`]: arrayUnion(userId)
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  },

  removeReaction: async (conversationId: string, messageId: string, emoji: string, userId: string) => {
    try {
      const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
      const msgDoc = await getDoc(msgRef);
      if (msgDoc.exists()) {
        const reactions = msgDoc.data().reactions?.[emoji] || [];
        const newReactions = reactions.filter((uid: string) => uid !== userId);
        
        if (newReactions.length === 0) {
          const updates: any = {};
          updates[`reactions.${emoji}`] = null;
          await updateDoc(msgRef, updates);
        } else {
          await updateDoc(msgRef, {
            [`reactions.${emoji}`]: newReactions
          });
        }
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  },

  deleteMessage: async (conversationId: string, messageId: string) => {
    try {
      await updateDoc(doc(db, 'conversations', conversationId, 'messages', messageId), {
        content: 'Ce message a été supprimé',
        type: 'system',
        deleted: true,
      });
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  },

  deleteConversation: async (conversationId: string, userId: string) => {
    try {
      await updateDoc(doc(db, 'conversations', conversationId), {
        isArchived: true,
        [`unreadCount.${userId}`]: 0,
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  },

  pinConversation: async (conversationId: string, pinned: boolean = true) => {
    try {
      await updateDoc(doc(db, 'conversations', conversationId), {
        isPinned: pinned,
      });
    } catch (error) {
      console.error('Error pinning conversation:', error);
    }
  },

  muteConversation: async (conversationId: string, muted: boolean = true) => {
    try {
      await updateDoc(doc(db, 'conversations', conversationId), {
        isMuted: muted,
      });
    } catch (error) {
      console.error('Error muting conversation:', error);
    }
  },

  searchUsers: async (searchTerm: string, excludeUserId?: string): Promise<Array<{uid: string; displayName: string; photoURL?: string; role?: string}>> => {
    try {
      const q = query(
        collection(db, 'users'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            uid: doc.id,
            displayName: data.displayName || data.email || 'Unknown User',
            photoURL: data.photoURL,
            role: data.role
          };
        })
        .filter((user: { displayName: string; email?: string; uid: string }) => 
          user.uid !== excludeUserId &&
          (user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .slice(0, 10);
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  },

  getConversation: async (conversationId: string): Promise<Conversation | null> => {
    try {
      const docSnap = await getDoc(doc(db, 'conversations', conversationId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Conversation;
      }
      return null;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return null;
    }
  },

  getTotalUnreadCount: async (userId: string): Promise<number> => {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId)
      );
      const snapshot = await getDocs(q);
      
      let total = 0;
      snapshot.docs.forEach(doc => {
        const conv = doc.data() as Conversation;
        total += conv.unreadCount?.[userId] || 0;
      });
      
      return total;
    } catch (error) {
      console.error('Error getting total unread:', error);
      return 0;
    }
  },

  getLastMessage: async (conversationId: string): Promise<Message | null> => {
    try {
      const q = query(
        collection(db, 'conversations', conversationId, 'messages'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Message;
      }
      return null;
    } catch (error) {
      console.error('Error getting last message:', error);
      return null;
    }
  },
};

export default messagingService;