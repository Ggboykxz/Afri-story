import { collection, query, where, orderBy, limit, addDoc, getDocs, doc, getDoc, updateDoc, increment, serverTimestamp, Timestamp, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface Thread {
  id?: string;
  categoryId: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  views: number;
  repliesCount: number;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  lastReplyAt?: Timestamp | Date;
}

export interface Reply {
  id?: string;
  threadId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Timestamp | Date;
}

export const forumService = {
  async getThreads(categoryId?: string) {
    const threadsRef = collection(db, 'forum_threads');
    let q = query(threadsRef, orderBy('createdAt', 'desc'));
    
    if (categoryId) {
      q = query(threadsRef, where('categoryId', '==', categoryId), orderBy('createdAt', 'desc'));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Thread[];
  },

  async getPopularThreads(limit_count: number = 5) {
    const threadsRef = collection(db, 'forum_threads');
    const q = query(threadsRef, orderBy('views', 'desc'), limit(limit_count));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Thread[];
  },

  async createThread(data: Omit<Thread, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'repliesCount'>) {
    const threadsRef = collection(db, 'forum_threads');
    return await addDoc(threadsRef, {
      ...data,
      views: 0,
      repliesCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async getThread(threadId: string) {
    const threadRef = doc(db, 'forum_threads', threadId);
    const snap = await getDoc(threadRef);
    if (!snap.exists()) return null;
    
    // Increment views
    await updateDoc(threadRef, { views: increment(1) });
    
    return { id: snap.id, ...snap.data() } as Thread;
  },

  async getReplies(threadId: string) {
    const repliesRef = collection(db, 'forum_replies');
    const q = query(repliesRef, where('threadId', '==', threadId), orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Reply[];
  },

  async addReply(threadId: string, reply: Omit<Reply, 'id' | 'createdAt' | 'threadId'>) {
    const repliesRef = collection(db, 'forum_replies');
    const threadRef = doc(db, 'forum_threads', threadId);
    
    const newReply = await addDoc(repliesRef, {
      ...reply,
      threadId,
      createdAt: serverTimestamp(),
    });
    
    await updateDoc(threadRef, {
      repliesCount: increment(1),
      lastReplyAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return newReply;
  },

  subscribeToThreads: (categoryId: string | undefined, callback: (threads: Thread[]) => void) => {
    let q;
    if (categoryId) {
      q = query(collection(db, 'forum_threads'), where('categoryId', '==', categoryId), orderBy('createdAt', 'desc'), limit(50));
    } else {
      q = query(collection(db, 'forum_threads'), orderBy('createdAt', 'desc'), limit(50));
    }
    return onSnapshot(q, (snapshot) => {
      const threads = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Thread[];
      callback(threads);
    });
  },

  subscribeToReplies: (threadId: string, callback: (replies: Reply[]) => void) => {
    const q = query(collection(db, 'forum_replies'), where('threadId', '==', threadId), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const replies = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Reply[];
      callback(replies);
    });
  },

  deleteThread: async (threadId: string) => {
    try {
      await deleteDoc(doc(db, 'forum_threads', threadId));
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
  },

  incrementView: async (threadId: string) => {
    try {
      await updateDoc(doc(db, 'forum_threads', threadId), { views: increment(1) });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }
};
