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
  Timestamp,
  runTransaction,
  Transaction 
} from 'firebase/firestore';
import { db } from './firebase';
import { Report, Report as ReportType } from './roles';

type ReportReason = 'spam' | 'harassment' | 'inappropriate' | 'spoiler' | 'plagiarism' | 'copyright';
type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';
type ActionTaken = 'warning' | 'deleted' | 'temporary_ban' | 'permanent_ban';

export interface ModerationAction {
  id: string;
  userId: string;
  targetUserId?: string;
  contentId?: string;
  contentType?: string;
  action: ActionTaken;
  reason: ReportReason;
  description?: string;
  duration?: number;
  createdAt: Date;
  createdBy: string;
}

const AUTOMATED_RESPONSES: Record<string, { action: ActionTaken; duration?: number }> = {
  hateful_speech: { action: 'warning', duration: 0 },
  explicit_content: { action: 'permanent_ban', duration: 0 },
  violence: { action: 'deleted', duration: 0 },
  spam: { action: 'warning', duration: 0 },
  dangerous_link: { action: 'deleted', duration: 0 },
};

export const moderationService = {
  async createReport(
    reporterId: string,
    data: {
      reportedUserId?: string;
      contentId?: string;
      contentType?: 'user' | 'work' | 'chapter' | 'comment' | 'forum_post';
      reason: ReportReason;
      description?: string;
    }
  ): Promise<string> {
    try {
      const docRef = doc(collection(db, 'reports'));
      await setDoc(docRef, {
        ...data,
        reporterId,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  },

  async getReportsByStatus(status: ReportStatus, limitCount: number = 50): Promise<ReportType[]> {
    try {
      const q = query(
        collection(db, 'reports'),
        where('status', '==', status),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ReportType[];
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  },

  async getReportsByUser(userId: string): Promise<ReportType[]> {
    try {
      const q = query(
        collection(db, 'reports'),
        where('reportedUserId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ReportType[];
    } catch (error) {
      console.error('Error fetching user reports:', error);
      return [];
    }
  },

  async processReport(
    reportId: string,
    moderatorId: string,
    action: ActionTaken,
    duration?: number
  ): Promise<void> {
    try {
      const reportDoc = await getDoc(doc(db, 'reports', reportId));
      if (!reportDoc.exists()) return;

      const reportData = reportDoc.data();

      await updateDoc(doc(db, 'reports', reportId), {
        status: 'resolved',
        actionTaken: action,
        resolvedAt: serverTimestamp(),
        resolvedBy: moderatorId,
      });

      if (reportData.reportedUserId) {
        let userUpdate: Record<string, any> = {};
        
        switch (action) {
          case 'warning':
            userUpdate = {
              warnings: increment(1),
              lastWarningAt: serverTimestamp(),
            };
            break;
          case 'temporary_ban':
            userUpdate = {
              status: 'suspended',
              suspensionEndsAt: Timestamp.fromDate(
                new Date(Date.now() + (duration || 7) * 24 * 60 * 60 * 1000)
              ),
            };
            break;
          case 'permanent_ban':
            userUpdate = {
              status: 'banned',
              role: 'reader',
            };
            break;
        }

        if (Object.keys(userUpdate).length > 0) {
          await updateDoc(doc(db, 'users', reportData.reportedUserId), userUpdate);
        }
      }

      if (reportData.contentId && action === 'deleted') {
        const contentType = reportData.contentType;
        if (contentType === 'work') {
          await updateDoc(doc(db, 'works', reportData.contentId), {
            status: 'deleted',
            deletedAt: serverTimestamp(),
            deletedBy: moderatorId,
          });
        } else if (contentType === 'chapter') {
          await updateDoc(doc(db, 'works', reportData.workId, 'chapters', reportData.contentId), {
            status: 'deleted',
          });
        }
      }
    } catch (error) {
      console.error('Error processing report:', error);
      throw error;
    }
  },

  async dismissReport(reportId: string, moderatorId: string): Promise<void> {
    await updateDoc(doc(db, 'reports', reportId), {
      status: 'dismissed',
      resolvedAt: serverTimestamp(),
      resolvedBy: moderatorId,
    });
  },

  async banUser(userId: string, moderatorId: string, reason: string, permanent: boolean = false): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: permanent ? 'banned' : 'suspended',
        role: 'reader',
        banReason: reason,
        bannedAt: serverTimestamp(),
        bannedBy: moderatorId,
      });
    } catch (error) {
      console.error('Error banning user:', error);
      throw error;
    }
  },

  async unbanUser(userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: 'active',
        role: 'reader',
        banReason: null,
        suspensionEndsAt: null,
      });
    } catch (error) {
      console.error('Error unbanning user:', error);
      throw error;
    }
  },

  async getModerationStats(): Promise<{
    pending: number;
    resolved: number;
    bansThisMonth: number;
    avgResponseTime: number;
  }> {
    try {
      const pendingQ = query(
        collection(db, 'reports'),
        where('status', '==', 'pending')
      );
      const resolvedQ = query(
        collection(db, 'reports'),
        where('status', '==', 'resolved')
      );
      
      const pendingSnap = await getDocs(pendingQ);
      const resolvedSnap = await getDocs(resolvedQ);

      return {
        pending: pendingSnap.size,
        resolved: resolvedSnap.size,
        bansThisMonth: 0,
        avgResponseTime: 3600000,
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return { pending: 0, resolved: 0, bansThisMonth: 0, avgResponseTime: 0 };
    }
  },

  async getUserWarningHistory(userId: string): Promise<ModerationAction[]> {
    try {
      const q = query(
        collection(db, 'moderation_actions'),
        where('targetUserId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ModerationAction[];
    } catch (error) {
      console.error('Error getting warning history:', error);
      return [];
    }
  },
};