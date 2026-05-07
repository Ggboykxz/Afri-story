import { 
  doc, 
  getDoc, 
  updateDoc, 
  increment,
  getCountFromServer,
  collection,
  addDoc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface ArtistProfile {
  userId: string;
  displayName: string;
  photoURL?: string;
  role: string;
  bio?: string;
  followers: string[];
  following?: string[];
  badges?: string[];
  afriCoins?: number;
  isVerified?: boolean;
}

export interface Collection {
  id: string;
  userId: string;
  title: string;
  description?: string;
  workIds: string[];
  isPrivate: boolean;
  createdAt: any;
}

export interface BookClub {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  workId: string;
  memberIds: string[];
  currentChapter: number;
  status: 'active' | 'completed';
  createdAt: any;
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  type: 'artistic' | 'writing' | 'collab';
  prizes: string[];
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed';
  winnerId?: string;
  participantIds: string[];
  createdAt: any;
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
      const artist = await getDoc(artistDoc);
      if (artist.exists()) {
        const data = artist.data();
        const followers = data.followers || [];
        if (!followers.includes(followerId)) {
          await updateDoc(artistDoc, { followers: [...followers, followerId] });
        }
      }
    } catch (error) {
      console.error('Error adding follower:', error);
    }
  },

  removeFollower: async (artistId: string, followerId: string) => {
    try {
      const artistDoc = doc(db, 'users', artistId);
      const artist = await getDoc(artistDoc);
      if (artist.exists()) {
        const data = artist.data();
        const followers = (data.followers || []).filter((id: string) => id !== followerId);
        await updateDoc(artistDoc, { followers });
      }
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
        createdAt: new Date(),
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
      const colSnap = await getDoc(colRef);
      if (colSnap.exists()) {
        const data = colSnap.data();
        const workIds = data.workIds || [];
        if (!workIds.includes(workId)) {
          await updateDoc(colRef, { workIds: [...workIds, workId] });
        }
      }
    } catch (error) {
      console.error('Error adding to collection:', error);
    }
  },

  removeFromCollection: async (collectionId: string, workId: string) => {
    try {
      const colRef = doc(db, 'collections', collectionId);
      const colSnap = await getDoc(colRef);
      if (colSnap.exists()) {
        const data = colSnap.data();
        const workIds = (data.workIds || []).filter((id: string) => id !== workId);
        await updateDoc(colRef, { workIds });
      }
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
      const clubSnap = await getDoc(clubRef);
      if (clubSnap.exists()) {
        const data = clubSnap.data();
        const memberIds = data.memberIds || [];
        if (!memberIds.includes(userId)) {
          await updateDoc(clubRef, { memberIds: [...memberIds, userId] });
        }
      }
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
      const contestSnap = await getDoc(contestRef);
      if (contestSnap.exists()) {
        const data = contestSnap.data();
        const participantIds = data.participantIds || [];
        if (!participantIds.includes(userId)) {
          await updateDoc(contestRef, { participantIds: [...participantIds, userId] });
        }
      }
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
      const reactionSnap = await getDoc(reactionRef);
      
      if (reactionSnap.exists()) {
        const data = reactionSnap.data();
        const counts = data.counts || { like: 0, love: 0, laugh: 0, wow: 0, sad: 0 };
        counts[reaction] = (counts[reaction] || 0) + 1;
        await updateDoc(reactionRef, { counts });
      } else {
        await setDoc(reactionRef, { counts: { [reaction]: 1 } });
      }
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