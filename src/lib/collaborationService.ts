import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  getDoc
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

export interface TeamMember {
  id: string;
  userId: string;
  workId: string;
  role: 'scripwriter' | 'colorist' | 'assistant' | 'translator';
  permissions: string[];
  joinedAt: any;
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
  },

  // Team Management
  addTeamMember: async (workId: string, userId: string, role: TeamMember['role'], permissions: string[]) => {
    try {
      const docRef = await addDoc(collection(db, 'team_members'), {
        workId,
        userId,
        role,
        permissions,
        joinedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding team member:', error);
      return null;
    }
  },

  getTeamMembers: async (workId: string): Promise<TeamMember[]> => {
    try {
      const q = query(collection(db, 'team_members'), where('workId', '==', workId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() })) as TeamMember[];
    } catch (error) {
      console.error('Error getting team members:', error);
      return [];
    }
  },

  updateTeamPermissions: async (memberId: string, permissions: string[]) => {
    try {
      await updateDoc(doc(db, 'team_members', memberId), { permissions });
      return true;
    } catch (error) {
      console.error('Error updating permissions:', error);
      return null;
    }
  },

  removeTeamMember: async (memberId: string) => {
    try {
      await deleteDoc(doc(db, 'team_members', memberId));
      return true;
    } catch (error) {
      console.error('Error removing team member:', error);
      return null;
    }
  }
};
