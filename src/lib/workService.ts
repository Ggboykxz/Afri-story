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
  serverTimestamp,
  increment,
  updateDoc,
  deleteDoc,
  onSnapshot
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

  // Update a work
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

  // Delete a work
  deleteWork: async (workId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'works', workId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `works/${workId}`);
      throw error;
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
  },

  // Comments on chapters
  addComment: async (workId: string, chapterId: string, userId: string, authorName: string, content: string, isSpoiler: boolean = false) => {
    try {
      await addDoc(collection(db, 'works', workId, 'chapters', chapterId, 'comments'), {
        userId,
        authorName,
        content,
        isSpoiler,
        likes: 0,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding comment:', error);
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
      console.error('Error liking comment:', error);
    }
  },

  // Upload chapter images
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

  // Search works
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
      console.error('Error searching:', error);
      return [];
    }
  },

  // Reviews
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
      console.error('Error adding review:', error);
      return null;
    }
  },

  getReviews: async (workId: string): Promise<Review[]> => {
    try {
      const snap = await getDocs(query(collection(db, 'works', workId, 'reviews'), orderBy('createdAt', 'desc'), limit(50)));
      return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Review[];
    } catch (error) {
      console.error('Error getting reviews:', error);
      return [];
    }
  },

  rateWork: async (workId: string, rating: number, userId: string) => {
    try {
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
      console.error('Error rating work:', error);
      return null;
    }
  },

  // AMA Sessions
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
      console.error('Error creating AMA session:', error);
      return null;
    }
  },

  getAMAWorks: async (artistId: string) => {
    try {
      const q = query(collection(db, 'ama_sessions'), where('artistId', '==', artistId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error getting AMA sessions:', error);
      return [];
    }
  },

  addAMAQuestion: async (sessionId: string, userId: string, userName: string, question: string) => {
    try {
      const sessionRef = doc(db, 'ama_sessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);
      if (!sessionSnap.exists()) return null;
      
      const data = sessionSnap.data();
      const questions = data.questions || [];
      questions.push({ userId, userName, question, answered: false, createdAt: new Date() });
      
      await updateDoc(sessionRef, { questions });
      return true;
    } catch (error) {
      console.error('Error adding AMA question:', error);
      return null;
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
      console.error('Error answering AMA question:', error);
      return null;
    }
  },

  // Chapter Timer
  scheduleChapter: async (workId: string, chapterData: any, publishAt: Date) => {
    try {
      const scheduledRef = await addDoc(collection(db, 'scheduled_chapters'), {
        workId,
        ...chapterData,
        publishAt,
        status: 'scheduled',
        createdAt: serverTimestamp(),
      });
      return scheduledRef.id;
    } catch (error) {
      console.error('Error scheduling chapter:', error);
      return null;
    }
  },

  getScheduledChapters: async (workId: string) => {
    try {
      const snap = await getDocs(query(collection(db, 'scheduled_chapters'), where('workId', '==', workId)));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error getting scheduled chapters:', error);
      return [];
    }
  },

  // Early Access Config
  updateEarlyAccess: async (workId: string, chaptersAhead: number) => {
    try {
      const workRef = doc(db, 'works', workId);
      await updateDoc(workRef, { earlyAccessChapters: chaptersAhead });
      return true;
    } catch (error) {
      console.error('Error updating early access:', error);
      return null;
    }
  },

  // Content Exclusives
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
      console.error('Error adding exclusive content:', error);
      return null;
    }
  },

  getExclusiveContent: async (workId: string) => {
    try {
      const snap = await getDocs(collection(db, 'works', workId, 'exclusives'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error getting exclusive content:', error);
      return [];
    }
  },

  // Spoiler Detection
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

  // Real-time Messaging (for artist-to-artist chat)
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
      console.error('Error creating conversation:', error);
      return null;
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
      console.error('Error sending message:', error);
      return null;
    }
  },

  getConversations: async (userId: string) => {
    try {
      const q = query(collection(db, 'conversations'), where('participants', 'array-contains', userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  },

  getMessages: async (conversationId: string) => {
    try {
      const q = query(collection(db, 'conversations', conversationId, 'messages'), orderBy('createdAt', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  },

  // Work Status Management
  updateWorkStatus: async (workId: string, status: Work['status']) => {
    try {
      const workRef = doc(db, 'works', workId);
      await updateDoc(workRef, { status });
      return true;
    } catch (error) {
      console.error('Error updating work status:', error);
      return null;
    }
  },

  // Ads Configuration
  toggleAds: async (workId: string, enabled: boolean) => {
    try {
      const workRef = doc(db, 'works', workId);
      await updateDoc(workRef, { adsEnabled: enabled });
      return true;
    } catch (error) {
      console.error('Error toggling ads:', error);
      return null;
    }
  },

  // Featured Works
  setFeatured: async (workId: string, featured: boolean) => {
    try {
      const workRef = doc(db, 'works', workId);
      await updateDoc(workRef, { 
        featured,
        featuredAt: featured ? serverTimestamp() : null
      });
      return true;
    } catch (error) {
      console.error('Error setting featured:', error);
      return null;
    }
  },

  getFeaturedWorks: async (): Promise<Work[]> => {
    try {
      const q = query(collection(db, 'works'), where('featured', '==', true));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Work[];
    } catch (error) {
      console.error('Error getting featured works:', error);
      return [];
    }
  },

  // Artist Verification
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
      console.error('Error requesting verification:', error);
      return null;
    }
  },

  getVerificationStatus: async (artistId: string) => {
    try {
      const q = query(collection(db, 'verification_requests'), where('artistId', '==', artistId));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return { id: snap.docs[0].id, ...snap.docs[0].data() };
    } catch (error) {
      console.error('Error getting verification status:', error);
      return null;
    }
  }
};
