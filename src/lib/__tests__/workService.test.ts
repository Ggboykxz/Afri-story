import { describe, it, expect, vi, beforeEach } from 'vitest';
import { workService } from '../workService';
import { addDoc, getDoc, runTransaction, doc, collection } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
  increment: vi.fn(val => val),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
  runTransaction: vi.fn()
}));

vi.mock('../firebase', () => ({
  db: {},
  auth: {
    currentUser: {
        uid: 'test-user-id',
        displayName: 'Test User'
    }
  }
}));

vi.mock('../firestore-errors', () => ({
  handleFirestoreError: vi.fn((e) => { throw e; }),
  OperationType: {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    LIST: 'list',
    GET: 'get',
    WRITE: 'write',
  }
}));

describe('workService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createWork', () => {
    it('should create a work and return its ID', async () => {
      (addDoc as any).mockResolvedValue({ id: 'new-work-id' });
      const workId = await workService.createWork({ title: 'New Work' });
      expect(workId).toBe('new-work-id');
      expect(addDoc).toHaveBeenCalled();
    });
  });

  describe('unlockChapter', () => {
    it('should use a transaction to unlock a chapter', async () => {
      (runTransaction as any).mockImplementation(async (_db: any, cb: any) => {
        const mockTransaction = {
          get: vi.fn((ref) => {
            if (ref.id === 'chapter-1') {
                return Promise.resolve({ exists: () => false });
            }
            return Promise.resolve({
                exists: () => true,
                data: () => ({ afriCoins: 500 })
            });
          }),
          set: vi.fn(),
          update: vi.fn()
        };
        return cb(mockTransaction);
      });

      (doc as any).mockImplementation((_db: any, _col: any, ...parts: any[]) => {
          return { id: parts[parts.length - 1] };
      });

      await workService.unlockChapter('work-1', 'chapter-1', 100);
      expect(runTransaction).toHaveBeenCalled();
    });

    it('should throw error if insufficient coins', async () => {
        (runTransaction as any).mockImplementation(async (_db: any, cb: any) => {
          const mockTransaction = {
            get: vi.fn().mockResolvedValue({
                exists: () => true,
                data: () => ({ afriCoins: 50 })
            }),
            set: vi.fn(),
            update: vi.fn()
          };
          return cb(mockTransaction);
        });

        await expect(workService.unlockChapter('work-1', 'chapter-1', 100)).rejects.toThrow();
      });
  });

  describe('addReview', () => {
    it('should use a transaction to update ratings', async () => {
        const mockReviewRef = { id: 'new-review-id' };

        (collection as any).mockReturnValue({ id: 'mock-col-id' });
        (doc as any).mockReturnValue(mockReviewRef);

        (runTransaction as any).mockImplementation(async (_db: any, cb: any) => {
            const mockTransaction = {
              get: vi.fn().mockResolvedValue({
                  exists: () => true,
                  data: () => ({ ratings: { average: 4, count: 1 } })
              }),
              set: vi.fn(),
              update: vi.fn()
            };
            return cb(mockTransaction);
          });

          const result = await workService.addReview('work-1', {
              workId: 'work-1',
              userId: 'user-1',
              userName: 'User 1',
              rating: 5,
              containsSpoiler: false
          });
          expect(runTransaction).toHaveBeenCalled();
          expect(result).toBe('new-review-id');
    });
  });
});
