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
  onSnapshot,
  runTransaction
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
  status?: 'draft' | 'published' | 'hidden' | 'archived';
  isPro: boolean;
  coverURL?: string;
  views: number;
  likes: number;
  chapters?: any[];
  ratings?: {
    average: number;
    count: number;
    userRating?: number;
  };
  adsEnabled?: boolean;
  featured?: boolean;
  featuredAt?: any;
  earlyAccessChapters?: number;
  updatedAt?: any;
  createdAt: any;
}

export interface Review {
  id: string;
  workId: string;
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  containsSpoiler: boolean;
  createdAt: any;
}

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
      throw error;
    }
  },

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

  duplicateChapter: async (workId: string, chapterId: string, newNumber?: number): Promise<string | null> => {
    try {
      const original = await workService.getChapter(workId, chapterId);
      if (!original) return null;

      const chaptersSnap = await getDocs(
        query(collection(db, 'works', workId, 'chapters'), orderBy('number', 'desc'))
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

  unlockChapter: async (workId: string, chapterId: string, price: number) => {
    if (!auth.currentUser) throw new Error("Non authentifié");
    const userId = auth.currentUser.uid;
    
    if (price <= 0) throw new Error("Prix invalide");
    if (price > 10000) throw new Error("Prix excessif");

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', userId);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error("Utilisateur introuvable");
        }

        const coins = userDoc.data()?.afriCoins || 0;
        
        if (coins < price) {
          throw new Error("AfriCoins insuffisants");
        }

        const unlockRef = doc(db, 'users', userId, 'unlocks', chapterId);
        const unlockDoc = await transaction.get(unlockRef);
        
        if (unlockDoc.exists()) {
          throw new Error("Chapitre déjà débloqué");
        }

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

  purchaseCoins: async (userId: string, amount: number): Promise<void> => {
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
      throw new Error("Non autorisé");
    }
    if (amount <= 0 || amount > 100000) {
      throw new Error("Montant invalide");
    }

    const path = `users/${userId}/coin_purchases`;
    try {
      const purchaseRef = doc(collection(db, path));
      await setDoc(purchaseRef, {
        userId,
        amount,
        createdAt: serverTimestamp(),
        status: 'pending',
      });

      await updateDoc(doc(db, 'users', userId), {
        afriCoins: increment(amount)
      });

      await updateDoc(purchaseRef, { status: 'completed' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
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

  removeFromFavorites: async (userId: string, workId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId, 'favorites', workId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}/favorites/${workId}`);
      throw error;
    }
  },

  getFavorites: async (userId: string): Promise<string[]> => {
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'favorites'));
      return snap.docs.map(d => d.id);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/favorites`);
      throw error;
    }
  },

  addToHistory: async (userId: string, workId: string, chapterId?: string, chapterNumber?: number) => {
    try {
      await setDoc(doc(db, 'users', userId, 'reading_history', workId), {
        workId,
        chapterId,
        chapterNumber,
        lastReadAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${userId}/reading_history/${workId}`);
      throw error;
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
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/reading_history`);
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

  subscribeToComments: (workId: string, chapterId: string, callback: (comments: any[]) => void) => {
    const q = query(
      collection(db, 'works', workId, 'chapters', chapterId, 'comments'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const comments = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(comments);
    });
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

  uploadChapterImages: async (workId: string, chapterId: string, images: File[]): Promise<string[]> => {
    const urls: string[] = [];
    const { storage } = await import('./firebase');
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    
    for (let i = 0; i < images.length; i++) {
      const imageRef = ref(storage, `works/${workId}/${chapterId}/page_${i}_${Date.now()}`);
      await uploadBytes(imageRef, images[i]);
      const url = await getDownloadURL(imageRef);
      urls.push(url);
    }
    return urls;
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

  addReview: async (workId: string, review: Omit<Review, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'works', workId, 'reviews'), {
        ...review,
        createdAt: serverTimestamp(),
      });
      
      const workRef = doc(db, 'works', workId);
      const workSnap = await getDoc(workRef);
      if (workSnap.exists()) {
        const ratings = workSnap.data().ratings || { average: 0, count: 0 };
        const newCount = ratings.count + 1;
        const newAverage = ((ratings.average * ratings.count) + review.rating) / newCount;
        await updateDoc(workRef, {
          ratings: {
            average: Math.round(newAverage * 10) / 10,
            count: newCount,
          }
        });
      }
      
      return docRef.id;
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

  rateWork: async (workId: string, rating: number, userId: string) => {
    try {
      if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5");
      
      const reviewsRef = collection(db, 'works', workId, 'reviews');
      const existingQ = query(reviewsRef, where('userId', '==', userId));
      const existing = await getDocs(existingQ);
      
      if (!existing.empty) {
        const existingDoc = existing.docs[0];
        await updateDoc(doc(db, 'works', workId, 'reviews', existingDoc.id), { rating });
        return existingDoc.id;
      }
      
      return await workService.addReview(workId, {
        workId,
        userId,
        userName: 'User',
        rating,
        containsSpoiler: false,
        createdAt: new Date(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `works/${workId}/reviews`);
      throw error;
    }
  },

  createAMASession: async (artistId: string, title: string, description: string, durationMinutes: number = 120) => {
    try {
      const endTime = new Date(Date.now() + durationMinutes * 60 * 1000);
      const docRef = await addDoc(collection(db, 'ama_sessions'), {
        artistId,
        title,
        description,
        durationMinutes,
        endTime,
        status: 'active',
        questions: [],
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'ama_sessions');
      throw error;
    }
  },

  getAMAWorks: async (artistId: string) => {
    try {
      const q = query(collection(db, 'ama_sessions'), where('artistId', '==', artistId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'ama_sessions');
      throw error;
    }
  },

  addAMAQuestion: async (sessionId: string, userId: string, userName: string, question: string) => {
    try {
      const sessionRef = doc(db, 'ama_sessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);
      if (!sessionSnap.exists()) throw new Error("Session introuvable");
      
      const data = sessionSnap.data();
      const questions = data.questions || [];
      questions.push({ userId, userName, question, answered: false, createdAt: new Date() });
      
      await updateDoc(sessionRef, { questions });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `ama_sessions/${sessionId}`);
      throw error;
    }
  },

  answerAMAQuestion: async (sessionId: string, questionIndex: number, answer: string) => {
    try {
      const sessionRef = doc(db, 'ama_sessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);
      if (!sessionSnap.exists()) return false;
      
      const data = sessionSnap.data();
      const questions = data.questions || [];
      if (questions[questionIndex]) {
        questions[questionIndex].answer = answer;
        questions[questionIndex].answered = true;
        await updateDoc(sessionRef, { questions });
        return true;
      }
      return false;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `ama_sessions/${sessionId}`);
      throw error;
    }
  },

  scheduleChapter: async (workId: string, chapterData: any, publishAt: Date) => {
    try {
      const docRef = await addDoc(collection(db, 'scheduled_chapters'), {
        workId,
        ...chapterData,
        publishAt,
        status: 'scheduled',
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'scheduled_chapters');
      throw error;
    }
  },

  getScheduledChapters: async (workId: string) => {
    try {
      const snap = await getDocs(query(collection(db, 'scheduled_chapters'), where('workId', '==', workId)));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'scheduled_chapters');
      throw error;
    }
  },

  updateEarlyAccess: async (workId: string, chaptersAhead: number) => {
    try {
      const workRef = doc(db, 'works', workId);
      await updateDoc(workRef, { earlyAccessChapters: chaptersAhead });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `works/${workId}`);
      throw error;
    }
  },

  addExclusiveContent: async (workId: string, title: string, content: string, type: 'making_of' | 'sketch' | 'notes') => {
    try {
      const docRef = await addDoc(collection(db, 'works', workId, 'exclusives'), {
        title,
        content,
        type,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `works/${workId}/exclusives`);
      throw error;
    }
  },

  getExclusiveContent: async (workId: string) => {
    try {
      const snap = await getDocs(collection(db, 'works', workId, 'exclusives'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `works/${workId}/exclusives`);
      throw error;
    }
  },

  checkForSpoilers: async (text: string, knownSpoilerTerms: string[]): Promise<{ hasSpoiler: boolean; terms: string[] }> => {
    const foundTerms: string[] = [];
    const lowerText = text.toLowerCase();
    
    for (const term of knownSpoilerTerms) {
      if (lowerText.includes(term.toLowerCase())) {
        foundTerms.push(term);
      }
    }
    
    return {
      hasSpoiler: foundTerms.length > 0,
      terms: foundTerms,
    };
  },

  createConversation: async (participants: string[]) => {
    try {
      const docRef = await addDoc(collection(db, 'conversations'), {
        participants,
        lastMessage: null,
        lastMessageAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'conversations');
      throw error;
    }
  },

  sendMessage: async (conversationId: string, senderId: string, content: string) => {
    try {
      const messageRef = await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        senderId,
        content,
        createdAt: serverTimestamp(),
      });
      
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: content,
        lastMessageAt: serverTimestamp(),
      });
      
      return messageRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `conversations/${conversationId}/messages`);
      throw error;
    }
  },

  getConversations: async (userId: string) => {
    try {
      const q = query(collection(db, 'conversations'), where('participants', 'array-contains', userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'conversations');
      throw error;
    }
  },

  getMessages: async (conversationId: string) => {
    try {
      const q = query(collection(db, 'conversations', conversationId, 'messages'), orderBy('createdAt', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `conversations/${conversationId}/messages`);
      throw error;
    }
  },

  updateWorkStatus: async (workId: string, status: Work['status']) => {
    try {
      const workRef = doc(db, 'works', workId);
      await updateDoc(workRef, { status });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `works/${workId}`);
      throw error;
    }
  },

  toggleAds: async (workId: string, enabled: boolean) => {
    try {
      const workRef = doc(db, 'works', workId);
      await updateDoc(workRef, { adsEnabled: enabled });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `works/${workId}`);
      throw error;
    }
  },

  setFeatured: async (workId: string, featured: boolean) => {
    try {
      const workRef = doc(db, 'works', workId);
      await updateDoc(workRef, { 
        featured,
        featuredAt: featured ? serverTimestamp() : null
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `works/${workId}`);
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
  },

  requestVerification: async (artistId: string, data: { portfolio: string; description: string; documents: string[] }) => {
    try {
      const docRef = await addDoc(collection(db, 'verification_requests'), {
        artistId,
        ...data,
        status: 'pending',
        submittedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'verification_requests');
      throw error;
    }
  },

  getVerificationStatus: async (artistId: string) => {
    try {
      const q = query(collection(db, 'verification_requests'), where('artistId', '==', artistId));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return { id: snap.docs[0].id, ...snap.docs[0].data() };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'verification_requests');
      throw error;
    }
  }
};
