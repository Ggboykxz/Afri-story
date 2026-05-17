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
  limit,
  startAfter,
  serverTimestamp,
  increment,
  updateDoc,
  deleteDoc,
  runTransaction
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { handleFirestoreError, OperationType } from './firestore-errors';
import { Work, Review } from './types';

export const workService = {
  createWork: async (workData: any) => {
    const path = 'works';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...workData,
        authorId: auth.currentUser?.uid,
        authorName: auth.currentUser?.displayName,
        author: auth.currentUser?.displayName,
        createdAt: serverTimestamp(),
        views: 0,
        likes: 0,
        ratings: { average: 0, count: 0 }
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  updateWork: async (workId: string, data: Partial<Work>): Promise<void> => {
    try {
      await updateDoc(doc(db, 'works', workId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `works/${workId}`);
      throw error;
    }
  },

  deleteWork: async (workId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'works', workId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `works/${workId}`);
      throw error;
    }
  },

  getWork: async (id: string): Promise<Work | null> => {
    const path = `works/${id}`;
    try {
      const docSnap = await getDoc(doc(db, 'works', id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        const chapSnap = await getDocs(query(collection(db, 'works', id, 'chapters'), orderBy('number', 'asc')));
        const chapters = chapSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        return { 
          id: docSnap.id, 
          ...data,
          chapters,
          author: data.authorName || data.author
        } as Work;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      throw error;
    }
  },

  getPopularWorks: async (limitCount: number = 10): Promise<Work[]> => {
    const path = 'works';
    try {
      const q = query(
        collection(db, path), 
        orderBy('views', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id, 
        ...doc.data(),
        author: doc.data().authorName || doc.data().author
      })) as Work[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      throw error;
    }
  },

  addChapter: async (workId: string, chapterData: any) => {
    const path = `works/${workId}/chapters`;
    try {
      const docRef = await addDoc(collection(db, 'works', workId, 'chapters'), {
        ...chapterData,
        workId,
        createdAt: serverTimestamp(),
        publishedAt: chapterData.isPublished ? serverTimestamp() : null,
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  getChapter: async (workId: string, chapterId: string): Promise<any | null> => {
    try {
      const docSnap = await getDoc(doc(db, 'works', workId, 'chapters', chapterId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `works/${workId}/chapters/${chapterId}`);
      throw error;
    }
  },

  getChapters: async (workId: string): Promise<any[]> => {
    try {
      const chaptersQuery = query(
        collection(db, 'works', workId, 'chapters'),
        orderBy('number', 'asc')
      );
      const snapshot = await getDocs(chaptersQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `works/${workId}/chapters`);
      throw error;
    }
  },

  updateChapter: async (workId: string, chapterId: string, data: any): Promise<void> => {
    try {
      await updateDoc(doc(db, 'works', workId, 'chapters', chapterId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `works/${workId}/chapters/${chapterId}`);
      throw error;
    }
  },

  deleteChapter: async (workId: string, chapterId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'works', workId, 'chapters', chapterId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `works/${workId}/chapters/${chapterId}`);
      throw error;
    }
  },

  unlockChapter: async (workId: string, chapterId: string, price: number) => {
    if (!auth.currentUser) throw new Error("Non authentifié");
    const userId = auth.currentUser.uid;
    
    if (price <= 0) throw new Error("Prix invalide");

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', userId);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) throw new Error("Utilisateur introuvable");

        const coins = userDoc.data()?.afriCoins || 0;
        if (coins < price) throw new Error("AfriCoins insuffisants");

        const unlockRef = doc(db, 'users', userId, 'unlocks', chapterId);
        const unlockDoc = await transaction.get(unlockRef);
        if (unlockDoc.exists()) throw new Error("Chapitre déjà débloqué");

        transaction.update(userRef, { afriCoins: increment(-price) });
        transaction.set(unlockRef, {
          workId,
          chapterId,
          unlockedAt: serverTimestamp()
        });
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}/unlocks/${chapterId}`);
      throw error;
    }
  },

  addComment: async (
    workId: string, 
    chapterId: string, 
    userId: string, 
    authorName: string, 
    content: string, 
    userPhoto?: string,
    isSpoiler: boolean = false
  ) => {
    try {
      await addDoc(collection(db, 'works', workId, 'chapters', chapterId, 'comments'), {
        userId,
        authorName,
        content,
        userPhoto: userPhoto || null,
        isSpoiler,
        likes: 0,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `works/${workId}/chapters/${chapterId}/comments`);
      throw error;
    }
  },

  addReview: async (workId: string, reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    try {
      const reviewRef = doc(collection(db, 'works', workId, 'reviews'));
      const workRef = doc(db, 'works', workId);

      await runTransaction(db, async (transaction) => {
        const workSnap = await transaction.get(workRef);
        if (!workSnap.exists()) throw new Error("Work not found");

        const ratings = workSnap.data().ratings || { average: 0, count: 0 };
        const newCount = ratings.count + 1;
        const newAverage = ((ratings.average * ratings.count) + reviewData.rating) / newCount;

        transaction.set(reviewRef, {
          ...reviewData,
          createdAt: serverTimestamp()
        });

        transaction.update(workRef, {
          ratings: {
            average: Math.round(newAverage * 10) / 10,
            count: newCount,
          }
        });
      });
      
      return reviewRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `works/${workId}/reviews`);
      throw error;
    }
  },

  getReviews: async (workId: string): Promise<Review[]> => {
    try {
      const snap = await getDocs(query(collection(db, 'works', workId, 'reviews'), orderBy('createdAt', 'desc'), limit(50)));
      return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Review[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `works/${workId}/reviews`);
      throw error;
    }
  },

  searchWorks: async (searchTerm: string): Promise<Work[]> => {
    try {
      const q = query(
        collection(db, 'works'),
        where('title', '>=', searchTerm),
        where('title', '<=', searchTerm + '\uf8ff'),
        limit(20)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Work[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'works');
      throw error;
    }
  },

  getWorks: async (filters: { isPro?: boolean, authorId?: string, limit?: number, lastDoc?: any } = {}): Promise<{ works: Work[], lastDoc: any }> => {
    const path = 'works';
    try {
      let q = query(collection(db, path), orderBy('createdAt', 'desc'));
      
      if (filters.isPro !== undefined) {
        q = query(q, where('isPro', '==', filters.isPro));
      }
      if (filters.authorId) {
        q = query(q, where('authorId', '==', filters.authorId));
      }
      if (filters.lastDoc) {
        q = query(q, startAfter(filters.lastDoc));
      }
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      const works = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Work[];
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
      return { works, lastDoc };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      throw error;
    }
  },

  // Helper for liking
  likeWork: async (workId: string) => {
    try {
      await updateDoc(doc(db, 'works', workId), {
        likes: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `works/${workId}`);
      throw error;
    }
  },

  likeChapter: async (workId: string, chapterId: string) => {
    try {
      await updateDoc(doc(db, 'works', workId, 'chapters', chapterId), {
        likes: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `works/${workId}/chapters/${chapterId}`);
      throw error;
    }
  },

  duplicateChapter: async (workId: string, chapterId: string, newNumber?: number): Promise<string | null> => {
    try {
      const original = await workService.getChapter(workId, chapterId);
      if (!original) return null;

      const chaptersSnap = await getDocs(
        query(collection(db, 'works', workId, 'chapters'), orderBy('number', 'desc'), limit(1))
      );
      const nextNumber = newNumber || (chaptersSnap.docs[0]?.data().number || 0) + 1;

      const docRef = await addDoc(collection(db, 'works', workId, 'chapters'), {
        ...original,
        id: undefined,
        number: nextNumber,
        title: `${original.title || 'Chapitre'} (copie)`,
        viewCount: 0,
        createdAt: serverTimestamp(),
        publishedAt: null,
        isDraft: true,
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `works/${workId}/chapters`);
      throw error;
    }
  },

  getChapterHistory: async (workId: string, chapterId: string): Promise<any[]> => {
    try {
      const q = query(
        collection(db, 'works', workId, 'chapters', chapterId, 'history'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `works/${workId}/chapters/${chapterId}/history`);
      throw error;
    }
  },

  saveChapterVersion: async (workId: string, chapterId: string, versionData: any): Promise<void> => {
    try {
      await addDoc(collection(db, 'works', workId, 'chapters', chapterId, 'history'), {
        ...versionData,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `works/${workId}/chapters/${chapterId}/history`);
      throw error;
    }
  },

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
      throw error;
    }
  },

  removeFromFavorites: async (userId: string, workId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId, 'favorites', workId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}/favorites/${workId}`);
      throw error;
    }
  },

  likeComment: async (workId: string, chapterId: string, commentId: string) => {
    try {
      await updateDoc(doc(db, 'works', workId, 'chapters', chapterId, 'comments', commentId), {
        likes: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `works/${workId}/chapters/${chapterId}/comments/${commentId}`);
      throw error;
    }
  },

  addToFavorites: async (userId: string, workId: string) => {
    try {
      await setDoc(doc(db, 'users', userId, 'favorites', workId), {
        addedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${userId}/favorites/${workId}`);
      throw error;
    }
  },

  purchaseCoins: async (userId: string, amount: number): Promise<void> => {
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
      throw new Error("Non autorisé");
    }
    const path = `users/${userId}/coin_purchases`;
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', userId);
        transaction.update(userRef, { afriCoins: increment(amount) });
        const purchaseRef = doc(collection(db, path));
        transaction.set(purchaseRef, {
          userId,
          amount,
          createdAt: serverTimestamp(),
          status: 'completed',
        });
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },

  getFeaturedWorks: async (): Promise<Work[]> => {
    try {
      const q = query(collection(db, 'works'), where('featured', '==', true));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Work[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'works');
      throw error;
    }
  }
};
