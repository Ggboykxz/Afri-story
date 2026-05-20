import { UserRole, Badge, SubscriptionPlan } from './roles';

export type { UserRole, Badge, SubscriptionPlan };

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
  subscriptionExpiresAt?: any;
  following?: string[];
  favorites?: string[];
  createdAt: any;
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
}

export interface ArtistProfile extends UserProfile {
  isVerified?: boolean;
  followers: string[];
}

export interface Work {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  author?: string; // For compatibility
  description: string;
  coverUrl?: string;
  coverURL?: string; // For compatibility
  genre?: string;
  category?: string; // For compatibility
  tags: string[];
  status: 'draft' | 'published' | 'completed' | 'hidden' | 'archived';
  type: 'webtoon' | 'bd' | 'novel' | 'hybrid' | string;
  isPremium: boolean;
  isPro?: boolean; // For compatibility
  isEarlyAccess?: boolean;
  earlyAccessChapters?: number;
  views: number;
  likes: number;
  ratings?: {
    average: number;
    count: number;
  };
  chapters?: Chapter[];
  adsEnabled?: boolean;
  featured?: boolean;
  featuredAt?: any;
  createdAt: any;
  updatedAt: any;
}

export interface Chapter {
  id: string;
  workId: string;
  number: number;
  title: string;
  pages?: string[];
  images?: string[]; // For compatibility
  isFree?: boolean;
  isPremium?: boolean;
  isEarlyAccess?: boolean;
  publishedAt?: any;
  viewCount?: number;
  likes?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface Comment {
  id: string;
  chapterId: string;
  userId: string;
  userName?: string;
  authorName?: string; // For compatibility
  userPhoto?: string;
  content: string;
  isSpoiler?: boolean;
  likes?: number;
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
  startDate: any;
  endDate: any;
  status: 'upcoming' | 'active' | 'completed';
  winnerId?: string;
  participantIds: string[];
  createdAt: any;
}

export interface AfriCoinTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'purchase' | 'spent' | 'donation' | 'refund' | 'monthly_bonus';
  description: string;
  relatedWorkId?: string;
  relatedChapterId?: string;
  relatedUserId?: string;
  createdAt: any;
}
