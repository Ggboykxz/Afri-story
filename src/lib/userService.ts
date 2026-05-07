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
  where
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
  }
};