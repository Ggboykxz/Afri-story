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
  updateDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { handleFirestoreError, OperationType } from './firestore-errors';

export const workService = {
  // Create a new work
  createWork: async (workData: any) => {
    const path = 'works';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...workData,
        authorId: auth.currentUser?.uid,
        authorName: auth.currentUser?.displayName,
        createdAt: serverTimestamp(),
        views: 0,
        likes: 0,
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
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
  getWorks: async (filters: { isPro?: boolean, authorId?: string } = {}) => {
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
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
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
      
      if (coins < price) throw new Error("Nexus-Coins insuffisants");

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

  // Purchase Nexus-Coins (Simulated increment)
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
  }
};
