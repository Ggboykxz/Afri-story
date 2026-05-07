import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  increment,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { auth } from './firebase';

export type UserRole = 
  | 'visitor'
  | 'reader'
  | 'reader_premium'
  | 'reader_supporter'
  | 'artist_draft'
  | 'artist_pro'
  | 'artist_mentor'
  | 'enterprise'
  | 'moderator'
  | 'supervisor'
  | 'admin';

export type SubscriptionPlan = 'free' | 'standard' | 'premium' | 'supporter';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: Date;
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
  createdAt: Date;
  following?: string[];
  favorites?: string[];
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

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  startedAt: Date;
  expiresAt: Date;
  autoRenew: boolean;
  paymentMethod: string;
  amount: number;
  currency: string;
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

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId?: string;
  contentId?: string;
  contentType: 'user' | 'work' | 'chapter' | 'comment' | 'forum_post';
  reason: 'spam' | 'harassment' | 'inappropriate' | 'spoiler' | 'plagiarism' | 'copyright';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  actionTaken?: 'warning' | 'deleted' | 'temporary_ban' | 'permanent_ban';
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  visitor: 0,
  reader: 1,
  reader_premium: 2,
  reader_supporter: 3,
  artist_draft: 4,
  artist_pro: 5,
  artist_mentor: 6,
  enterprise: 7,
  moderator: 8,
  supervisor: 9,
  admin: 10,
};

export const BADGES: Record<string, Badge> = {
  premium: {
    id: 'premium',
    name: 'Lecteur Premium',
    description: 'Abonnement premium actif',
    icon: '⭐',
  },
  supporter: {
    id: 'supporter',
    name: 'Supporter',
    description: 'Soutien régulier aux artistes',
    icon: '💪',
  },
  loyal: {
    id: 'loyal',
    name: 'Lecteur Fidèle',
    description: 'Plus de 6 mois sur la plateforme',
    icon: '🏆',
  },
  mega_reader: {
    id: 'mega_reader',
    name: 'Mega Lecteur',
    description: 'Plus de 100 heures de lecture',
    icon: '📚',
  },
  artist_pro_certified: {
    id: 'artist_pro_certified',
    name: 'Artiste Pro Certifié',
    description: 'Validation par l\'équipe AfriStory',
    icon: '✓',
  },
  artist_mentor: {
    id: 'artist_mentor',
    name: 'Artiste Mentor',
    description: 'Rôle Mentor activé',
    icon: '🎓',
  },
  top_artist: {
    id: 'top_artist',
    name: 'Top Artiste du Mois',
    description: 'Classement mensuel',
    icon: '🔥',
  },
  first_donation: {
    id: 'first_donation',
    name: 'Premier Soutien',
    description: 'Premier don à un artiste',
    icon: '💝',
  },
};

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, {
  name: string;
  price: number;
  currency: string;
  features: string[];
  afriCoinsMonthly: number;
}> = {
  free: {
    name: 'Lecteur Gratuit',
    price: 0,
    currency: 'EUR',
    features: [
      'Lecture gratuite',
      'Commentaire public',
      'Forum public',
    ],
    afriCoinsMonthly: 0,
  },
  standard: {
    name: 'Standard',
    price: 2.99,
    currency: 'EUR',
    features: [
      'Tout gratuit',
      'Lecture sans publicité',
      'Accès anticipé léger',
      'Badge Standard',
    ],
    afriCoinsMonthly: 0,
  },
  premium: {
    name: 'Premium',
    price: 4.99,
    currency: 'EUR',
    features: [
      'Tout Standard',
      'Accès anticipé complet',
      'Forum Premium',
      'Contenu exclusif',
      'Avatars exclusifs',
      'Sondages avancés',
      'Badge Premium',
    ],
    afriCoinsMonthly: 0,
  },
  supporter: {
    name: 'Supporter',
    price: 5.99,
    currency: 'EUR',
    features: [
      'Tout Premium',
      'AfriCoins mensuels',
      'Badge Supporter',
      'Poids renforcé signalements',
    ],
    afriCoinsMonthly: 50,
  },
};

export const PERMISSIONS_MATRIX: Record<UserRole, Record<string, boolean>> = {
  visitor: {
    see_home: true,
    see_catalog: true,
    read_free_chapters: true,
    read_premium_chapters: false,
    early_access: false,
    comment: false,
    like: false,
    follow_artist: false,
    forum_public: false,
    forum_premium: false,
    private_message_artist: false,
    publish_draft_work: false,
    publish_pro_work: false,
    monetize: false,
    advanced_stats: false,
    manage_team: false,
    mentor_draft: false,
    committee_draft_pro: false,
    buy_africoins: false,
    donate: false,
    report: false,
    moderate: false,
    validate_pro: false,
    configure_platform: false,
  },
  reader: {
    see_home: true,
    see_catalog: true,
    read_free_chapters: true,
    read_premium_chapters: false,
    early_access: false,
    comment: true,
    like: true,
    follow_artist: true,
    forum_public: true,
    forum_premium: false,
    private_message_artist: false,
    publish_draft_work: false,
    publish_pro_work: false,
    monetize: false,
    advanced_stats: false,
    manage_team: false,
    mentor_draft: false,
    committee_draft_pro: false,
    buy_africoins: true,
    donate: true,
    report: true,
    moderate: false,
    validate_pro: false,
    configure_platform: false,
  },
  reader_premium: {
    see_home: true,
    see_catalog: true,
    read_free_chapters: true,
    read_premium_chapters: true,
    early_access: true,
    comment: true,
    like: true,
    follow_artist: true,
    forum_public: true,
    forum_premium: true,
    private_message_artist: false,
    publish_draft_work: false,
    publish_pro_work: false,
    monetize: false,
    advanced_stats: false,
    manage_team: false,
    mentor_draft: false,
    committee_draft_pro: false,
    buy_africoins: true,
    donate: true,
    report: true,
    moderate: false,
    validate_pro: false,
    configure_platform: false,
  },
  reader_supporter: {
    see_home: true,
    see_catalog: true,
    read_free_chapters: true,
    read_premium_chapters: true,
    early_access: true,
    comment: true,
    like: true,
    follow_artist: true,
    forum_public: true,
    forum_premium: true,
    private_message_artist: false,
    publish_draft_work: false,
    publish_pro_work: false,
    monetize: false,
    advanced_stats: false,
    manage_team: false,
    mentor_draft: false,
    committee_draft_pro: false,
    buy_africoins: true,
    donate: true,
    report: true,
    moderate: false,
    validate_pro: false,
    configure_platform: false,
  },
  artist_draft: {
    see_home: true,
    see_catalog: true,
    read_free_chapters: true,
    read_premium_chapters: false,
    early_access: false,
    comment: true,
    like: true,
    follow_artist: true,
    forum_public: true,
    forum_premium: false,
    private_message_artist: false,
    publish_draft_work: true,
    publish_pro_work: false,
    monetize: false,
    advanced_stats: false,
    manage_team: false,
    mentor_draft: false,
    committee_draft_pro: false,
    buy_africoins: true,
    donate: true,
    report: true,
    moderate: false,
    validate_pro: false,
    configure_platform: false,
  },
  artist_pro: {
    see_home: true,
    see_catalog: true,
    read_free_chapters: true,
    read_premium_chapters: true,
    early_access: true,
    comment: true,
    like: true,
    follow_artist: true,
    forum_public: true,
    forum_premium: true,
    private_message_artist: true,
    publish_draft_work: false,
    publish_pro_work: true,
    monetize: true,
    advanced_stats: true,
    manage_team: true,
    mentor_draft: false,
    committee_draft_pro: false,
    buy_africoins: true,
    donate: true,
    report: true,
    moderate: false,
    validate_pro: false,
    configure_platform: false,
  },
  artist_mentor: {
    see_home: true,
    see_catalog: true,
    read_free_chapters: true,
    read_premium_chapters: true,
    early_access: true,
    comment: true,
    like: true,
    follow_artist: true,
    forum_public: true,
    forum_premium: true,
    private_message_artist: true,
    publish_draft_work: false,
    publish_pro_work: true,
    monetize: true,
    advanced_stats: true,
    manage_team: true,
    mentor_draft: true,
    committee_draft_pro: true,
    buy_africoins: true,
    donate: true,
    report: true,
    moderate: false,
    validate_pro: false,
    configure_platform: false,
  },
  enterprise: {
    see_home: true,
    see_catalog: true,
    read_free_chapters: true,
    read_premium_chapters: false,
    early_access: false,
    comment: false,
    like: false,
    follow_artist: true,
    forum_public: true,
    forum_premium: false,
    private_message_artist: true,
    publish_draft_work: false,
    publish_pro_work: false,
    monetize: false,
    advanced_stats: false,
    manage_team: false,
    mentor_draft: false,
    committee_draft_pro: false,
    buy_africoins: false,
    donate: false,
    report: true,
    moderate: false,
    validate_pro: false,
    configure_platform: false,
  },
  moderator: {
    see_home: true,
    see_catalog: true,
    read_free_chapters: true,
    read_premium_chapters: true,
    early_access: true,
    comment: true,
    like: true,
    follow_artist: true,
    forum_public: true,
    forum_premium: true,
    private_message_artist: false,
    publish_draft_work: false,
    publish_pro_work: false,
    monetize: false,
    advanced_stats: false,
    manage_team: false,
    mentor_draft: false,
    committee_draft_pro: false,
    buy_africoins: true,
    donate: true,
    report: true,
    moderate: true,
    validate_pro: false,
    configure_platform: false,
  },
  supervisor: {
    see_home: true,
    see_catalog: true,
    read_free_chapters: true,
    read_premium_chapters: true,
    early_access: true,
    comment: true,
    like: true,
    follow_artist: true,
    forum_public: true,
    forum_premium: true,
    private_message_artist: false,
    publish_draft_work: false,
    publish_pro_work: false,
    monetize: false,
    advanced_stats: false,
    manage_team: false,
    mentor_draft: false,
    committee_draft_pro: true,
    buy_africoins: true,
    donate: true,
    report: true,
    moderate: true,
    validate_pro: true,
    configure_platform: false,
  },
  admin: {
    see_home: true,
    see_catalog: true,
    read_free_chapters: true,
    read_premium_chapters: true,
    early_access: true,
    comment: true,
    like: true,
    follow_artist: true,
    forum_public: true,
    forum_premium: true,
    private_message_artist: true,
    publish_draft_work: true,
    publish_pro_work: true,
    monetize: true,
    advanced_stats: true,
    manage_team: true,
    mentor_draft: true,
    committee_draft_pro: true,
    buy_africoins: true,
    donate: true,
    report: true,
    moderate: true,
    validate_pro: true,
    configure_platform: true,
  },
};

export function hasPermission(role: UserRole, permission: string): boolean {
  return PERMISSIONS_MATRIX[role]?.[permission] ?? false;
}

export function isAtLeastRole(role: UserRole, minRole: UserRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRole];
}

export function hasAnyRole(role: UserRole, roles: UserRole[]): boolean {
  return roles.includes(role);
}