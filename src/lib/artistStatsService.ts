import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  updateDoc,
  deleteDoc,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface ArtistStats {
  userId: string;
  totalViews: number;
  totalLikes: number;
  totalReads: number;
  totalChapters: number;
  totalWorks: number;
  totalAfriCoins: number;
  totalSubscribers: number;
  monthlyRevenue: number;
  totalRevenue: number;
  rank: number;
  lastUpdated: any;
}

export interface WorkComment {
  id: string;
  workId: string;
  chapterId?: string;
  chapterNumber?: number;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  likes: number;
  createdAt: any;
  replies?: CommentReply[];
}

export interface CommentReply {
  id: string;
  commentId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  createdAt: any;
}

export interface ChapterStats {
  workId: string;
  chapterId: string;
  title: string;
  number: number;
  views: number;
  likes: number;
  comments: number;
  createdAt: any;
}

export interface WorkWithChapterCount {
  id: string;
  title: string;
  status: string;
  isPro: boolean;
  views: number;
  likes: number;
  category: string;
  chapterCount: number;
  createdAt: any;
  updatedAt: any;
}

const BATCH_SIZE = 50;
const CACHE_DURATION = 5 * 60 * 1000;

let statsCache: Map<string, { stats: ArtistStats; timestamp: number }> = new Map();
let chapterCountsCache: Map<string, { count: number; timestamp: number }> = new Map();

function getDefaultStats(userId: string): ArtistStats {
  return {
    userId,
    totalViews: 0,
    totalLikes: 0,
    totalReads: 0,
    totalChapters: 0,
    totalWorks: 0,
    totalAfriCoins: 0,
    totalSubscribers: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    rank: 0,
    lastUpdated: null
  };
}

export const artistStatsService = {
  getStats: async (userId: string, useCache = true): Promise<ArtistStats> => {
    const cached = statsCache.get(userId);
    if (useCache && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.stats;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      const worksQuery = query(
        collection(db, 'works'),
        where('authorId', '==', userId)
      );
      const worksSnapshot = await getDocs(worksQuery);
      const works = worksSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      let totalChapters = 0;
      for (const work of works.slice(0, 10)) {
        const countCache = chapterCountsCache.get(work.id);
        if (countCache) {
          totalChapters += countCache.count;
        } else {
          const count = await artistStatsService.getChapterCount(work.id);
          totalChapters += count;
        }
      }

      const stats: ArtistStats = {
        userId,
        totalViews: works.reduce((sum: number, w: any) => sum + (w.views || 0), 0),
        totalLikes: works.reduce((sum: number, w: any) => sum + (w.likes || 0), 0),
        totalReads: Math.floor(works.reduce((sum: number, w: any) => sum + (w.views || 0), 0) * 0.7),
        totalChapters,
        totalWorks: works.length,
        totalAfriCoins: userData.afriCoins || 0,
        totalSubscribers: userData.followers?.length || 0,
        monthlyRevenue: userData.monthlyRevenue || 0,
        totalRevenue: userData.totalRevenue || 0,
        rank: userData.artistRank || 0,
        lastUpdated: serverTimestamp()
      };

      statsCache.set(userId, { stats, timestamp: Date.now() });
      return stats;
    } catch (error) {
      console.error('Error fetching artist stats:', error);
      return getDefaultStats(userId);
    }
  },

  subscribeToStats: (userId: string, callback: (stats: ArtistStats) => void) => {
    const unsubscribe = onSnapshot(doc(db, 'artist_stats', userId), (snap) => {
      if (snap.exists()) {
        callback({ userId, ...snap.data() } as ArtistStats);
      } else {
        artistStatsService.getStats(userId).then(callback);
      }
    });
    return unsubscribe;
  },

  getChapterCount: async (workId: string): Promise<number> => {
    const cached = chapterCountsCache.get(workId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.count;
    }

    try {
      const snapshot = await getDocs(query(
        collection(db, 'works', workId, 'chapters'),
        limit(1)
      ));
      const count = snapshot.size;
      chapterCountsCache.set(workId, { count, timestamp: Date.now() });
      return count;
    } catch {
      const snapshot = await getDocs(collection(db, 'works', workId, 'chapters'));
      const count = snapshot.size;
      chapterCountsCache.set(workId, { count, timestamp: Date.now() });
      return count;
    }
  },

  getWorkChapterStats: async (workId: string): Promise<ChapterStats[]> => {
    try {
      const chaptersQuery = query(
        collection(db, 'works', workId, 'chapters'),
        orderBy('number', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(chaptersQuery);
      
      return snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          workId,
          chapterId: docSnap.id,
          title: data.title || `Chapitre ${data.number}`,
          number: data.number || 0,
          views: data.views || 0,
          likes: data.likes || 0,
          comments: data.commentCount || 0,
          createdAt: data.createdAt
        };
      });
    } catch (error) {
      console.error('Error fetching chapter stats:', error);
      return [];
    }
  },

  getAllChapterCounts: async (workIds: string[]): Promise<Map<string, number>> => {
    const countsMap = new Map<string, number>();
    const uncached: string[] = [];

    for (const workId of workIds) {
      const cached = chapterCountsCache.get(workId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        countsMap.set(workId, cached.count);
      } else {
        uncached.push(workId);
      }
    }

    const batches: string[][] = [];
    for (let i = 0; i < uncached.length; i += BATCH_SIZE) {
      batches.push(uncached.slice(i, i + BATCH_SIZE));
    }

    for (const batch of batches) {
      const promises = batch.map(async (workId) => {
        try {
          const count = await artistStatsService.getChapterCount(workId);
          countsMap.set(workId, count);
        } catch {
          countsMap.set(workId, 0);
        }
      });
      await Promise.all(promises);
    }

    return countsMap;
  },

  deleteWorkWithChildren: async (workId: string): Promise<void> => {
    const batch = writeBatch(db);
    
    try {
      const chaptersQuery = query(collection(db, 'works', workId, 'chapters'));
      const chaptersSnapshot = await getDocs(chaptersQuery);
      
      for (const chapterDoc of chaptersSnapshot.docs) {
        const commentsQuery = query(
          collection(db, 'works', workId, 'chapters', chapterDoc.id, 'comments')
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        
        for (const commentDoc of commentsSnapshot.docs) {
          batch.delete(commentDoc.ref);
        }
        batch.delete(chapterDoc.ref);
      }

      const workCommentsQuery = query(collection(db, 'works', workId, 'comments'));
      const workCommentsSnapshot = await getDocs(workCommentsQuery);
      for (const commentDoc of workCommentsSnapshot.docs) {
        batch.delete(commentDoc.ref);
      }

      batch.delete(doc(db, 'works', workId));
      
      await batch.commit();
      
      chapterCountsCache.delete(workId);
    } catch (error) {
      console.error('Error deleting work:', error);
      throw error;
    }
  },

  clearCache: () => {
    statsCache.clear();
    chapterCountsCache.clear();
  },

  updateLocalStats: async (userId: string, stats: Partial<ArtistStats>): Promise<void> => {
    try {
      await updateDoc(doc(db, 'artist_stats', userId), {
        ...stats,
        lastUpdated: serverTimestamp()
      });
      statsCache.delete(userId);
    } catch (error) {
      console.error('Error updating local stats:', error);
    }
  }
};

export const commentService = {
  getWorkComments: async (workId: string, limitCount: number = 20): Promise<WorkComment[]> => {
    try {
      const commentsQuery = query(
        collection(db, 'works', workId, 'comments'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(commentsQuery);
      
      return snapshot.docs.slice(0, 5).map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          workId,
          chapterId: data.chapterId,
          chapterNumber: data.chapterNumber,
          userId: data.userId,
          userName: data.userName || 'Anonyme',
          userPhoto: data.userPhoto,
          content: data.content,
          likes: data.likes || 0,
          createdAt: data.createdAt,
          replies: []
        };
      });
    } catch (error) {
      console.error('Error fetching work comments:', error);
      return [];
    }
  },

  getAllArtistComments: async (workIds: string[], limitCount: number = 50): Promise<WorkComment[]> => {
    if (workIds.length === 0) return [];

    const allComments: WorkComment[] = [];
    const batches: string[][] = [];
    
    for (let i = 0; i < workIds.length; i += BATCH_SIZE) {
      batches.push(workIds.slice(i, i + BATCH_SIZE));
    }

    for (const batch of batches) {
      const promises = batch.map(async (workId) => {
        const comments = await commentService.getWorkComments(workId, 5);
        return comments;
      });
      
      const results = await Promise.all(promises);
      for (const comments of results) {
        allComments.push(...comments);
      }
    }
    
    allComments.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
    
    return allComments.slice(0, limitCount);
  },

  subscribeToWorkComments: (workId: string, callback: (comments: WorkComment[]) => void) => {
    const commentsQuery = query(
      collection(db, 'works', workId, 'comments'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    return onSnapshot(commentsQuery, (snapshot) => {
      const comments: WorkComment[] = snapshot.docs.slice(0, 10).map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          workId,
          chapterId: data.chapterId,
          chapterNumber: data.chapterNumber,
          userId: data.userId,
          userName: data.userName || 'Anonyme',
          userPhoto: data.userPhoto,
          content: data.content,
          likes: data.likes || 0,
          createdAt: data.createdAt,
          replies: []
        };
      });
      callback(comments);
    });
  },

  likeComment: async (workId: string, commentId: string): Promise<void> => {
    try {
      await updateDoc(doc(db, 'works', workId, 'comments', commentId), {
        likes: increment(1)
      });
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  },

  deleteComment: async (workId: string, commentId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'works', workId, 'comments', commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  }
};