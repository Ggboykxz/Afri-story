import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from '../userService';
import { doc, getDoc, updateDoc, runTransaction } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
  arrayUnion: vi.fn(val => val),
  arrayRemove: vi.fn(val => val),
  increment: vi.fn(val => val),
  runTransaction: vi.fn()
}));

vi.mock('../firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'test-user-id' } }
}));

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getArtistProfile', () => {
    it('should fetch and return an artist profile', async () => {
      const mockDocSnap = {
        exists: () => true,
        id: 'user-1',
        data: () => ({ displayName: 'Test Artist', role: 'artist_pro' })
      };
      (getDoc as any).mockResolvedValue(mockDocSnap);

      const profile = await userService.getArtistProfile('user-1');
      expect(profile).toEqual({ userId: 'user-1', displayName: 'Test Artist', role: 'artist_pro' });
    });

    it('should return null if profile does not exist', async () => {
      (getDoc as any).mockResolvedValue({ exists: () => false });
      const profile = await userService.getArtistProfile('non-existent');
      expect(profile).toBeNull();
    });
  });

  describe('addFollower', () => {
    it('should call updateDoc with arrayUnion', async () => {
      await userService.addFollower('artist-1', 'follower-1');
      expect(updateDoc).toHaveBeenCalled();
    });
  });

  describe('addCommentReaction', () => {
    it('should use a transaction to update counts', async () => {
      (runTransaction as any).mockImplementation(async (_db: any, cb: any) => {
        const mockTransaction = {
          get: vi.fn().mockResolvedValue({ exists: () => false }),
          set: vi.fn(),
          update: vi.fn()
        };
        return cb(mockTransaction);
      });

      await userService.addCommentReaction('comment-1', 'love');
      expect(runTransaction).toHaveBeenCalled();
    });
  });
});
