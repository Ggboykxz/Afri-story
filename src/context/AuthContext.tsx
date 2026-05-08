import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserRole, Badge, SubscriptionPlan, ROLE_HIERARCHY } from '../lib/roles';

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

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  coverURL?: string;
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
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
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
  profileVisibility?: 'public' | 'private' | 'friends';
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

  const refreshProfile = async () => {
    if (!user) return;
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
        bio: data.bio,
        socialLinks: data.socialLinks,
        preferences: data.preferences || {
          notifications: true,
          emailNotifications: true,
          darkMode: true,
        },
      });
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        
        // GET initial profile
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            userId: user.uid,
            email: user.email || '',
            displayName: data.displayName || user.displayName || 'Voyageur',
            photoURL: data.photoURL || user.photoURL,
            coverURL: data.coverURL,
            role: data.role || 'reader',
            afriCoins: data.afriCoins || 0,
            badges: data.badges || [],
            subscription: data.subscription,
            subscriptionExpiresAt: data.subscriptionExpiresAt?.toDate?.() || data.subscriptionExpiresAt,
            following: data.following || [],
            favorites: data.favorites || [],
            createdAt: data.createdAt?.toDate?.() || new Date(),
            bio: data.bio,
            socialLinks: data.socialLinks,
            profileVisibility: data.profileVisibility || 'public',
            preferences: data.preferences || {
              notifications: true,
              emailNotifications: true,
              darkMode: true,
            },
          });

          // REAL-TIME SYNC - automatically updates when Firestore changes
          const unsubRealtime = onSnapshot(doc(db, 'users', user.uid), (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              setProfile({
                userId: user.uid,
                email: user.email || '',
                displayName: data.displayName || user.displayName || 'Voyageur',
                photoURL: data.photoURL || user.photoURL,
                coverURL: data.coverURL,
                role: data.role || 'reader',
                afriCoins: data.afriCoins || 0,
                badges: data.badges || [],
                subscription: data.subscription,
                subscriptionExpiresAt: data.subscriptionExpiresAt?.toDate?.() || data.subscriptionExpiresAt,
                following: data.following || [],
                favorites: data.favorites || [],
                createdAt: data.createdAt?.toDate?.() || new Date(),
                bio: data.bio,
                socialLinks: data.socialLinks,
                profileVisibility: data.profileVisibility || 'public',
                preferences: data.preferences || {
                  notifications: true,
                  emailNotifications: true,
                  darkMode: true,
                },
              });
            }
          });

          return () => unsubRealtime();
        } else {
          // CREATE new profile for first-time users
          const newProfile: UserProfile = {
            userId: user.uid,
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || 'Voyageur',
            photoURL: user.photoURL,
            role: 'reader',
            afriCoins: 100,
            badges: [],
            createdAt: new Date(),
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