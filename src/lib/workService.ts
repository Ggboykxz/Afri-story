import { 
  collection, 
  addDoc, 
  setDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  increment,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { handleFirestoreError, OperationType } from './firestore-errors';

export interface Work {
  id: string;
  title: string;
  description: string;
  author: string;
  authorId: string;
  type: string;
  category: string;
  status?: string;
  isPro: boolean;
  coverURL?: string;
  views: number;
  likes: number;
  chapters?: any[];
  createdAt: any;
}

export const workService = {
  // Create a new work
  createWork: async (workData: any) => {
    const path = 'works';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...workData,
        authorId: auth.currentUser?.uid,
        authorName: auth.currentUser?.displayName,
        author: auth.currentUser?.displayName, // Compatibility fix
        createdAt: serverTimestamp(),
        views: 0,
        likes: 0,
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // Get a single work
  getWork: async (id: string): Promise<Work | null> => {
    const path = `works/${id}`;
    try {
      const docSnap = await getDoc(doc(db, 'works', id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Fetch chapters subcollection
        const chapSnap = await getDocs(query(collection(db, 'works', id, 'chapters'), orderBy('publishedAt', 'asc')));
        const chapters = chapSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        return { 
          id: docSnap.id, 
          ...data,
          chapters,
          author: data.authorName || data.author // Fallback
        } as Work;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  // Get popular works
  getPopularWorks: async (limitCount: number = 10): Promise<Work[]> => {
    const path = 'works';
    try {
      const q = query(
        collection(db, path), 
        orderBy('views', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.slice(0, limitCount).map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        author: doc.data().authorName || doc.data().author
      })) as Work[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  // Add a chapter to a work
  addChapter: async (workId: string, chapterData: any) => {
    const path = `works/${workId}/chapters`;
    try {
      const docRef = await addDoc(collection(db, 'works', workId, 'chapters'), {
        ...chapterData,
        workId,
        publishedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // Get works (can filter by type or author)
  getWorks: async (filters: { isPro?: boolean, authorId?: string } = {}): Promise<Work[]> => {
    const path = 'works';
    try {
      let q = query(collection(db, path), orderBy('createdAt', 'desc'));
      
      if (filters.isPro !== undefined) {
        q = query(q, where('isPro', '==', filters.isPro));
      }
      if (filters.authorId) {
        q = query(q, where('authorId', '==', filters.authorId));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Work[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  // Post a message in forum
  postInForum: async (forumId: string, content: string, authorName: string, isSpoiler: boolean = false) => {
    const path = `forums/${forumId}/posts`;
    try {
      const docRef = await addDoc(collection(db, 'forums', forumId, 'posts'), {
        forumId,
        content,
        authorId: auth.currentUser?.uid,
        authorName,
        isSpoiler,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // Unlock a premium chapter
  unlockChapter: async (workId: string, chapterId: string, price: number) => {
    if (!auth.currentUser) throw new Error("Non authentifié");
    const userId = auth.currentUser.uid;
    const userRef = doc(db, 'users', userId);
    const unlockRef = doc(db, 'users', userId, 'unlocks', chapterId);
    
    try {
      const userDoc = await getDoc(userRef);
      const coins = userDoc.data()?.afriCoins || 0;
      
      if (coins < price) throw new Error("AfriCoins insuffisants");

      // Transaction-like update (simplified for brevity)
      await updateDoc(userRef, { afriCoins: increment(-price) });
      await setDoc(unlockRef, {
        workId,
        chapterId,
        unlockedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}/unlocks/${chapterId}`);
    }
  },

  // Rate a work (1-5 stars)
  rateWork: async (workId: string, rating: number) => {
    const path = `works/${workId}/ratings`;
    try {
      await setDoc(doc(db, 'works', workId, 'ratings', auth.currentUser!.uid), {
        rating,
        userId: auth.currentUser?.uid,
        updatedAt: serverTimestamp()
      });
      // In real app, we'd trigger a cloud function to update works/{workId}/averageRating
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Purchase AfriCoins (Simulated increment)
  purchaseCoins: async (userId: string, amount: number) => {
    const path = `users/${userId}`;
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        afriCoins: increment(amount)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // User Favorites
  addToFavorites: async (userId: string, workId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        favorites: increment(1)
      });
      await setDoc(doc(db, 'users', userId, 'favorites', workId), {
        addedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  },

  removeFromFavorites: async (userId: string, workId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId, 'favorites', workId));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  },

  getFavorites: async (userId: string): Promise<string[]> => {
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'favorites'));
      return snap.docs.map(d => d.id);
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  },

  // Reading History
  addToHistory: async (userId: string, workId: string, chapterId?: string, chapterNumber?: number) => {
    try {
      await setDoc(doc(db, 'users', userId, 'reading_history', workId), {
        workId,
        chapterId,
        chapterNumber,
        lastReadAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding to history:', error);
    }
  },

  getReadingHistory: async (userId: string): Promise<{workId: string, chapterId?: string, chapterNumber?: number, lastReadAt: any}[]> => {
    try {
      const q = query(
        collection(db, 'users', userId, 'reading_history'),
        orderBy('lastReadAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data()) as any[];
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  }
};
