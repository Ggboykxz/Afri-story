import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserRole, ROLE_HIERARCHY } from '../lib/roles';
import { UserProfile } from '../lib/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  isAtLeastRole: (minRole: UserRole) => boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  followUser: (artistId: string) => Promise<void>;
  unfollowUser: (artistId: string) => Promise<void>;
  isFollowing: (artistId: string) => boolean;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  profile: null,
  loading: true,
  hasPermission: () => false,
  isAtLeastRole: () => false,
  updateProfile: async () => {},
  refreshProfile: async () => {},
  followUser: async () => {},
  unfollowUser: async () => {},
  isFollowing: () => false
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const hasPermission = (permission: string): boolean => {
    if (!profile) return false;
    const matrix: Record<string, boolean> = {
      see_home: true,
      see_catalog: true,
      read_free_chapters: !['artist_draft', 'artist_pro', 'artist_mentor'].includes(profile.role),
      read_premium_chapters: ['reader_premium', 'reader_supporter', 'artist_pro', 'artist_mentor', 'moderator', 'supervisor', 'admin'].includes(profile.role),
      early_access: ['artist_pro', 'artist_mentor', 'reader_premium', 'reader_supporter'].includes(profile.role),
      comment: profile.role !== 'visitor',
      like: profile.role !== 'visitor',
      follow_artist: profile.role !== 'visitor',
      forum_public: ['reader', 'reader_premium', 'reader_supporter', 'artist_draft', 'artist_pro', 'artist_mentor', 'enterprise', 'moderator', 'supervisor', 'admin'].includes(profile.role),
      forum_premium: ['reader_premium', 'reader_supporter', 'artist_pro', 'artist_mentor', 'moderator', 'supervisor', 'admin'].includes(profile.role),
      private_message_artist: ['artist_pro', 'artist_mentor', 'enterprise', 'admin'].includes(profile.role),
      publish_draft_work: profile.role === 'artist_draft',
      publish_pro_work: ['artist_pro', 'artist_mentor', 'admin'].includes(profile.role),
      monetize: ['artist_pro', 'artist_mentor'].includes(profile.role),
      advanced_stats: ['artist_pro', 'artist_mentor'].includes(profile.role),
      manage_team: ['artist_pro', 'artist_mentor'].includes(profile.role),
      mentor_draft: profile.role === 'artist_mentor',
      committee_draft_pro: ['artist_mentor', 'moderator', 'supervisor', 'admin'].includes(profile.role),
      buy_africoins: ['reader', 'reader_premium', 'reader_supporter', 'artist_draft'].includes(profile.role),
      donate: profile.role !== 'visitor' && profile.role !== 'enterprise',
      report: profile.role !== 'visitor',
      moderate: ['moderator', 'supervisor', 'admin'].includes(profile.role),
      validate_pro: ['supervisor', 'admin'].includes(profile.role),
      configure_platform: profile.role === 'admin',
    };
    return matrix[permission] ?? false;
  };

  const isAtLeastRole = (minRole: UserRole): boolean => {
    if (!profile) return false;
    return ROLE_HIERARCHY[profile.role] >= ROLE_HIERARCHY[minRole];
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), data);
    setProfile(prev => prev ? { ...prev, ...data } : null);
  };

  const mapProfileData = (uid: string, email: string | null, data: any): UserProfile => {
    return {
      userId: uid,
      email: email || '',
      displayName: data.displayName || 'Voyageur',
      photoURL: data.photoURL,
      role: data.role || 'reader',
      afriCoins: data.afriCoins || 0,
      badges: data.badges || [],
      subscription: data.subscription,
      subscriptionExpiresAt: data.subscriptionExpiresAt,
      following: data.following || [],
      favorites: data.favorites || [],
      createdAt: data.createdAt,
      bio: data.bio,
      socialLinks: data.socialLinks,
      preferences: data.preferences || {
        notifications: true,
        emailNotifications: true,
        darkMode: true,
      },
      statistics: data.statistics || {
        totalReads: 0,
        totalLikes: 0,
        totalComments: 0,
        readingTime: 0,
      }
    };
  };

  const refreshProfile = async () => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setProfile(mapProfileData(user.uid, user.email, docSnap.data()));
    }
  };

  const followUser = async (artistId: string) => {
    if (!user || !profile) return;
    if (!profile.following?.includes(artistId)) {
      const newFollowing = [...(profile.following || []), artistId];
      await updateDoc(doc(db, 'users', user.uid), { following: newFollowing });
      setProfile(prev => prev ? { ...prev, following: newFollowing } : null);
    }
  };

  const unfollowUser = async (artistId: string) => {
    if (!user || !profile) return;
    const newFollowing = (profile.following || []).filter(id => id !== artistId);
    await updateDoc(doc(db, 'users', user.uid), { following: newFollowing });
    setProfile(prev => prev ? { ...prev, following: newFollowing } : null);
  };

  const isFollowing = (artistId: string): boolean => {
    return profile?.following?.includes(artistId) ?? false;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      if (authUser) {
        const docRef = doc(db, 'users', authUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile(mapProfileData(authUser.uid, authUser.email, docSnap.data()));

          const unsubRealtime = onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
              setProfile(mapProfileData(authUser.uid, authUser.email, snap.data()));
            }
          });
          return () => unsubRealtime();
        } else {
          const newProfile: UserProfile = {
            userId: authUser.uid,
            email: authUser.email || '',
            displayName: authUser.displayName || authUser.email?.split('@')[0] || 'Voyageur',
            photoURL: authUser.photoURL,
            role: 'reader',
            afriCoins: 100,
            badges: [],
            createdAt: serverTimestamp(),
            following: [],
            favorites: [],
            bio: '',
            socialLinks: { instagram: '', twitter: '', website: '' },
            preferences: { notifications: true, emailNotifications: true, darkMode: true },
            statistics: { totalReads: 0, totalLikes: 0, totalComments: 0, readingTime: 0 },
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      hasPermission, 
      isAtLeastRole, 
      updateProfile: updateProfileData, 
      refreshProfile,
      followUser, 
      unfollowUser, 
      isFollowing 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
