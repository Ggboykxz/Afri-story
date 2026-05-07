import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  increment,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { 
  SubscriptionPlan, 
  Subscription, 
  AfriCoinTransaction,
  SUBSCRIPTION_PLANS 
} from './roles';

export const subscriptionService = {
  async getSubscription(userId: string): Promise<Subscription | null> {
    try {
      const docRef = doc(db, 'subscriptions', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Subscription;
      }
      return null;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  },

  async createSubscription(
    userId: string, 
    plan: SubscriptionPlan,
    paymentMethod: string,
    amount: number
  ): Promise<void> {
    try {
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      await setDoc(doc(db, 'subscriptions', userId), {
        userId,
        plan,
        startedAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
        autoRenew: true,
        paymentMethod,
        amount,
        currency: SUBSCRIPTION_PLANS[plan].currency,
      });

      await updateDoc(doc(db, 'users', userId), {
        subscription: plan,
        subscriptionExpiresAt: Timestamp.fromDate(expiresAt),
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  async cancelSubscription(userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'subscriptions', userId), {
        autoRenew: false,
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  },

  async checkAndDowngradeExpired(userId: string): Promise<void> {
    try {
      const sub = await this.getSubscription(userId);
      if (sub && sub.expiresAt && new Date(sub.expiresAt) < new Date() && !sub.autoRenew) {
        await updateDoc(doc(db, 'users', userId), {
          subscription: 'free',
          role: 'reader',
        });
        await updateDoc(doc(db, 'subscriptions', userId), {
          status: 'expired',
        });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  },

  async getSubscriptionPlans(): Promise<typeof SUBSCRIPTION_PLANS> {
    return SUBSCRIPTION_PLANS;
  },
};

export const afriCoinsService = {
  async getBalance(userId: string): Promise<number> {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      return docSnap.data()?.afriCoins || 0;
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  },

  async purchaseCoins(userId: string, amount: number, paymentMethod: string): Promise<void> {
    try {
      const transaction: Omit<AfriCoinTransaction, 'id'> = {
        userId,
        amount,
        type: 'purchase',
        description: `Achat de ${amount} AfriCoins via ${paymentMethod}`,
        createdAt: new Date(),
      };

      await updateDoc(doc(db, 'users', userId), {
        afriCoins: increment(amount),
      });

      await setDoc(doc(collection(db, 'africoins_transactions')), transaction);
    } catch (error) {
      console.error('Error purchasing coins:', error);
      throw error;
    }
  },

  async spendCoins(
    userId: string, 
    amount: number, 
    description: string,
    workId?: string,
    chapterId?: string
  ): Promise<boolean> {
    try {
      const balance = await this.getBalance(userId);
      if (balance < amount) return false;

      const transaction: Omit<AfriCoinTransaction, 'id'> = {
        userId,
        amount: -amount,
        type: 'spent',
        description,
        relatedWorkId: workId,
        relatedChapterId: chapterId,
        createdAt: new Date(),
      };

      await updateDoc(doc(db, 'users', userId), {
        afriCoins: increment(-amount),
      });

      await setDoc(doc(collection(db, 'africoins_transactions')), transaction);
      return true;
    } catch (error) {
      console.error('Error spending coins:', error);
      return false;
    }
  },

  async donateToArtist(
    donorId: string,
    artistId: string,
    amount: number,
    workId?: string
  ): Promise<boolean> {
    try {
      const balance = await this.getBalance(donorId);
      if (balance < amount) return false;
      if (amount < 10) return false;

      await updateDoc(doc(db, 'users', donorId), {
        afriCoins: increment(-amount),
      });

      await updateDoc(doc(db, 'users', artistId), {
        afriCoins: increment(Math.floor(amount * 0.9)),
      });

      const donationTx: Omit<AfriCoinTransaction, 'id'> = {
        userId: donorId,
        amount: -amount,
        type: 'donation',
        description: `Don à un artiste`,
        relatedUserId: artistId,
        relatedWorkId: workId,
        createdAt: new Date(),
      };

      await setDoc(doc(collection(db, 'africoins_transactions')), donationTx);
      return true;
    } catch (error) {
      console.error('Error donating:', error);
      return false;
    }
  },

  async getTransactionHistory(userId: string, limitCount: number = 20): Promise<AfriCoinTransaction[]> {
    try {
      const q = query(
        collection(db, 'africoins_transactions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AfriCoinTransaction[];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  },

  async awardMonthlyBonus(userId: string, amount: number): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        afriCoins: increment(amount),
      });

      const bonusTx: Omit<AfriCoinTransaction, 'id'> = {
        userId,
        amount,
        type: 'monthly_bonus',
        description: 'Bonus mensuel Supporter',
        createdAt: new Date(),
      };

      await setDoc(doc(collection(db, 'africoins_transactions')), bonusTx);
    } catch (error) {
      console.error('Error awarding bonus:', error);
    }
  },

  PRICES: {
    discovery: { coins: 100, price: 0.99, bonus: 0 },
    standard: { coins: 500, price: 3.99, bonus: 50 },
    premium: { coins: 1500, price: 9.99, bonus: 250 },
    mega: { coins: 5000, price: 29.99, bonus: 1000 },
  },
};