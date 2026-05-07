import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';

export interface Ad {
  id: string;
  artistId: string;
  artistName: string;
  title: string;
  description: string;
  roleRequired: string;
  status: 'open' | 'closed';
  createdAt: any;
}

export const collaborationService = {
  // Create a recruitment ad
  createAd: async (artistId: string, artistName: string, data: Omit<Ad, 'id' | 'artistId' | 'artistName' | 'status' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'recruitment_ads'), {
        ...data,
        artistId,
        artistName,
        status: 'open',
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating ad", error);
      throw error;
    }
  },

  // Get all open ads
  getOpenAds: async () => {
    try {
      const q = query(collection(db, 'recruitment_ads'), where('status', '==', 'open'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Ad[];
    } catch (error) {
      console.error("Error fetching ads", error);
      return [];
    }
  },

  // Close an ad
  closeAd: async (adId: string) => {
    try {
      await updateDoc(doc(db, 'recruitment_ads', adId), { status: 'closed' });
    } catch (error) {
      console.error("Error closing ad", error);
    }
  }
};
