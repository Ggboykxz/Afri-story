import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserRole, Badge, SubscriptionPlan, ROLE_HIERARCHY } from '../lib/roles';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  isAtLeastRole: (minRole: UserRole) => boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  followUser: (artistId: string) => Promise<void>;
  unfollowUser: (artistId: string) => Promise<void>;
  isFollowing: (artistId: string) => boolean;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  afriCoins: number;
  badges: Badge[];
  subscription?: SubscriptionPlan;
  subscriptionExpiresAt?: Date;
  following?: string[];
  favorites?: string[];
  createdAt: Date;
  bio?: string;
  unlockedChapters?: string[];
  statistics?: {
    totalReads: number;
    totalLikes: number;
    totalComments: number;
    readingTime: number;
  };
  preferences?: {
    notifications: boolean;
    emailNotifications: boolean;
    darkMode: boolean;
  };
}

const defaultAuthContext: AuthContextType = {
  user: null,
  profile: null,
  loading: true,
  hasPermission: () => false,
  isAtLeastRole: () => false,
  updateProfile: async () => {},
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
      early_access: profile.role === 'artist_pro' || profile.role === 'artist_mentor' || profile.role === 'reader_premium' || profile.role === 'reader_supporter',
      comment: profile.role !== 'visitor',
      like: profile.role !== 'visitor',
      follow_artist: profile.role !== 'visitor',
      forum_public: ['reader', 'reader_premium', 'reader_supporter', 'artist_draft', 'artist_pro', 'artist_mentor', 'enterprise', 'moderator', 'supervisor', 'admin'].includes(profile.role),
      forum_premium: ['reader_premium', 'reader_supporter', 'artist_pro', 'artist_mentor', 'moderator', 'supervisor', 'admin'].includes(profile.role),
      private_message_artist: profile.role === 'artist_pro' || profile.role === 'artist_mentor' || profile.role === 'enterprise' || profile.role === 'admin',
      publish_draft_work: profile.role === 'artist_draft',
      publish_pro_work: profile.role === 'artist_pro' || profile.role === 'artist_mentor' || profile.role === 'admin',
      monetize: profile.role === 'artist_pro' || profile.role === 'artist_mentor',
      advanced_stats: profile.role === 'artist_pro' || profile.role === 'artist_mentor',
      manage_team: profile.role === 'artist_pro' || profile.role === 'artist_mentor',
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            userId: user.uid,
            email: user.email || '',
            displayName: data.displayName || user.displayName || 'Voyageur',
            photoURL: data.photoURL || user.photoURL,
            role: data.role || 'reader',
            afriCoins: data.afriCoins || 0,
            badges: data.badges || [],
            subscription: data.subscription,
            subscriptionExpiresAt: data.subscriptionExpiresAt?.toDate?.() || data.subscriptionExpiresAt,
            following: data.following || [],
            favorites: data.favorites || [],
            createdAt: data.createdAt?.toDate?.() || new Date(),
            preferences: data.preferences || {
              notifications: true,
              emailNotifications: true,
              darkMode: true,
            },
          });
        } else {
          const newProfile: UserProfile = {
            userId: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Voyageur',
            photoURL: user.photoURL,
            role: 'reader',
            afriCoins: 0,
            badges: [],
            following: [],
            favorites: [],
            createdAt: new Date(),
            preferences: {
              notifications: true,
              emailNotifications: true,
              darkMode: true,
            },
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
    <AuthContext.Provider value={{ user, profile, loading, hasPermission, isAtLeastRole, updateProfile: updateProfileData, followUser, unfollowUser, isFollowing }}>
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
