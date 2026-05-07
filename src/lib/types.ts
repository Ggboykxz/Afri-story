import { UserRole, Badge, SubscriptionPlan } from '../lib/roles';

export type { UserRole, Badge, SubscriptionPlan };

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

export interface Work {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  description: string;
  coverUrl: string;
  genre: string;
  tags: string[];
  status: 'draft' | 'published' | 'completed';
  type: 'webtoon' | 'bd' | 'novel' | 'hybrid';
  isPremium: boolean;
  isEarlyAccess: boolean;
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id: string;
  workId: string;
  number: number;
  title: string;
  pages: string[];
  isFree: boolean;
  isEarlyAccess: boolean;
  publishedAt?: Date;
}

export interface Comment {
  id: string;
  chapterId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  createdAt: Date;
}

export interface ForumThread {
  id: string;
  categoryId: string;
  title: string;
  authorId: string;
  authorName: string;
  content: string;
  isPinned: boolean;
  isLocked: boolean;
  replyCount: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
}