import { 
  doc, 
  getDoc, 
  updateDoc, 
  increment,
  collection,
  addDoc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, Collection, BookClub, Contest } from './types';

export interface ArtistProfile extends UserProfile {
  isVerified?: boolean;
  followers: string[];
}

export const userService = {
  getArtistProfile: async (userId: string): Promise<ArtistProfile | null> => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { userId: docSnap.id, ...docSnap.data() } as ArtistProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching artist profile:', error);
      return null;
    }
  },

  getFollowerCount: async (userId: string): Promise<number> => {
    try {
      const user = await userService.getArtistProfile(userId);
      return user?.followers?.length || 0;
    } catch (error) {
      console.error('Error getting follower count:', error);
      return 0;
    }
  },

  addFollower: async (artistId: string, followerId: string) => {
    try {
      const artistDoc = doc(db, 'users', artistId);
      await updateDoc(artistDoc, {
        followers: arrayUnion(followerId)
      });
    } catch (error) {
      console.error('Error adding follower:', error);
    }
  },

  removeFollower: async (artistId: string, followerId: string) => {
    try {
      const artistDoc = doc(db, 'users', artistId);
      await updateDoc(artistDoc, {
        followers: arrayRemove(followerId)
      });
    } catch (error) {
      console.error('Error removing follower:', error);
    }
  },

  updateFollowerCount: async (userId: string, delta: number) => {
    try {
      const userDoc = doc(db, 'users', userId);
      await updateDoc(userDoc, { followerCount: increment(delta) });
    } catch (error) {
      console.error('Error updating follower count:', error);
    }
  },

  // Collections
  createCollection: async (userId: string, title: string, description?: string, isPrivate: boolean = true) => {
    try {
      const docRef = await addDoc(collection(db, 'collections'), {
        userId,
        title,
        description,
        isPrivate,
        workIds: [],
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating collection:', error);
      return null;
    }
  },

  getCollections: async (userId: string): Promise<Collection[]> => {
    try {
      const q = query(collection(db, 'collections'), where('userId', '==', userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Collection[];
    } catch (error) {
      console.error('Error getting collections:', error);
      return [];
    }
  },

  addToCollection: async (collectionId: string, workId: string) => {
    try {
      const colRef = doc(db, 'collections', collectionId);
      await updateDoc(colRef, {
        workIds: arrayUnion(workId)
      });
    } catch (error) {
      console.error('Error adding to collection:', error);
    }
  },

  removeFromCollection: async (collectionId: string, workId: string) => {
    try {
      const colRef = doc(db, 'collections', collectionId);
      await updateDoc(colRef, {
        workIds: arrayRemove(workId)
      });
    } catch (error) {
      console.error('Error removing from collection:', error);
    }
  },

  // Book Clubs
  createBookClub: async (name: string, description: string, creatorId: string, workId: string) => {
    try {
      const docRef = await addDoc(collection(db, 'book_clubs'), {
        name,
        description,
        creatorId,
        workId,
        memberIds: [creatorId],
        currentChapter: 1,
        status: 'active',
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating book club:', error);
      return null;
    }
  },

  joinBookClub: async (clubId: string, userId: string) => {
    try {
      const clubRef = doc(db, 'book_clubs', clubId);
      await updateDoc(clubRef, {
        memberIds: arrayUnion(userId)
      });
    } catch (error) {
      console.error('Error joining book club:', error);
    }
  },

  getBookClubs: async (workId?: string): Promise<BookClub[]> => {
    try {
      const q = workId 
        ? query(collection(db, 'book_clubs'), where('workId', '==', workId))
        : query(collection(db, 'book_clubs'), where('status', '==', 'active'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() })) as BookClub[];
    } catch (error) {
      console.error('Error getting book clubs:', error);
      return [];
    }
  },

  updateReadingProgress: async (clubId: string, chapter: number) => {
    try {
      const clubRef = doc(db, 'book_clubs', clubId);
      await updateDoc(clubRef, { currentChapter: chapter });
      return true;
    } catch (error) {
      console.error('Error updating reading progress:', error);
      return null;
    }
  },

  // Contests
  createContest: async (data: Omit<Contest, 'id' | 'status' | 'participantIds' | 'winnerId'>) => {
    try {
      const docRef = await addDoc(collection(db, 'contests'), {
        ...data,
        status: 'upcoming',
        participantIds: [],
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating contest:', error);
      return null;
    }
  },

  joinContest: async (contestId: string, userId: string) => {
    try {
      const contestRef = doc(db, 'contests', contestId);
      await updateDoc(contestRef, {
        participantIds: arrayUnion(userId)
      });
    } catch (error) {
      console.error('Error joining contest:', error);
    }
  },

  getActiveContests: async (): Promise<Contest[]> => {
    try {
      const q = query(collection(db, 'contests'), where('status', 'in', ['upcoming', 'active']));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Contest[];
    } catch (error) {
      console.error('Error getting contests:', error);
      return [];
    }
  },

  endContest: async (contestId: string, winnerId: string) => {
    try {
      const contestRef = doc(db, 'contests', contestId);
      await updateDoc(contestRef, { status: 'completed', winnerId });
      return true;
    } catch (error) {
      console.error('Error ending contest:', error);
      return null;
    }
  },

  // Comment Reactions
  addCommentReaction: async (commentId: string, reaction: 'like' | 'love' | 'laugh' | 'wow' | 'sad') => {
    try {
      const reactionRef = doc(collection(db, 'comment_reactions'), commentId);
      await runTransaction(db, async (transaction) => {
        const reactionSnap = await transaction.get(reactionRef);
        if (reactionSnap.exists()) {
          const counts = reactionSnap.data().counts || {};
          counts[reaction] = (counts[reaction] || 0) + 1;
          transaction.update(reactionRef, { counts });
        } else {
          transaction.set(reactionRef, { counts: { [reaction]: 1 } });
        }
      });
      return true;
    } catch (error) {
      console.error('Error adding reaction:', error);
      return null;
    }
  },

  getCommentReactions: async (commentId: string) => {
    try {
      const reactionRef = doc(db, 'comment_reactions', commentId);
      const reactionSnap = await getDoc(reactionRef);
      return reactionSnap.exists() ? reactionSnap.data().counts : null;
    } catch (error) {
      console.error('Error getting reactions:', error);
      return null;
    }
  }
};
