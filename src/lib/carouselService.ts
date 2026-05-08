import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface FeaturedContent {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  link: string;
  linkType: 'work' | 'page' | 'external' | 'contest' | 'subscription';
  badge?: string;
  badgeColor?: string;
  badgeIcon?: string;
  ctaText?: string;
  category: 'promo' | 'event' | 'featured' | 'contest' | 'subscription';
  priority: number;
  startDate?: Timestamp;
  endDate?: Timestamp;
  isActive: boolean;
  viewCount: number;
  clickCount: number;
  createdAt: Timestamp;
}

export interface CarouselConfig {
  autoPlay: boolean;
  autoPlayInterval: number;
  showArrows: boolean;
  showDots: boolean;
  showProgress: boolean;
  aspectRatio: 'video' | 'tall' | 'wide';
  variant: 'featured' | 'spotlight' | 'event';
  maxItems: number;
}

const defaultConfig: CarouselConfig = {
  autoPlay: true,
  autoPlayInterval: 5000,
  showArrows: true,
  showDots: true,
  showProgress: true,
  aspectRatio: 'video',
  variant: 'featured',
  maxItems: 5,
};

export const carouselService = {
  async getFeaturedContent(config: Partial<CarouselConfig> = {}): Promise<FeaturedContent[]> {
    const mergedConfig = { ...defaultConfig, ...config };
    const now = Timestamp.now();
    
    try {
      const q = query(
        collection(db, 'featured_content'),
        where('isActive', '==', true),
        where('startDate', '<=', now),
        orderBy('startDate', 'desc'),
        orderBy('priority', 'desc'),
        limit(mergedConfig.maxItems)
      );
      
      const snapshot = await getDocs(q);
      const content = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as FeaturedContent))
        .filter(item => {
          if (item.endDate && item.endDate.toMillis() < now.toMillis()) return false;
          return true;
        });
      
      return content;
    } catch (error) {
      console.error('Error fetching featured content:', error);
      return [];
    }
  },

  async getPromoBanners(): Promise<FeaturedContent[]> {
    return this.getFeaturedContent({ category: 'promo' } as any);
  },

  async getEvents(): Promise<FeaturedContent[]> {
    return this.getFeaturedContent({ category: 'event' } as any);
  },

  async getTopWorksForCarousel(limitCount = 5): Promise<FeaturedContent[]> {
    try {
      const q = query(
        collection(db, 'works'),
        orderBy('views', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc, index) => {
        const work = doc.data();
        return {
          id: doc.id,
          title: work.title,
          subtitle: work.author,
          description: work.synopsis?.slice(0, 100) + '...',
          image: work.coverURL,
          link: `/work/${doc.id}`,
          linkType: 'work' as const,
          badge: index === 0 ? 'N°1' : index < 3 ? 'Top 5' : undefined,
          badgeColor: index === 0 ? 'bg-brand-gold' : index < 3 ? 'bg-brand-gold/70' : undefined,
          badgeIcon: 'crown',
          category: 'featured' as const,
          priority: 100 - index,
          isActive: true,
          viewCount: work.views || 0,
          clickCount: 0,
          createdAt: work.createdAt || Timestamp.now(),
        };
      });
    } catch (error) {
      console.error('Error fetching top works:', error);
      return [];
    }
  },

  async getSubscriptionPromos(): Promise<FeaturedContent[]> {
    return this.getFeaturedContent({ category: 'subscription' } as any);
  },

  async trackClick(contentId: string): Promise<void> {
    try {
      const { doc, updateDoc, increment } = await import('firebase/firestore');
      await updateDoc(doc(db, 'featured_content', contentId), {
        clickCount: increment(1),
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  },

  async trackView(contentId: string): Promise<void> {
    try {
      const { doc, updateDoc, increment } = await import('firebase/firestore');
      await updateDoc(doc(db, 'featured_content', contentId), {
        viewCount: increment(1),
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  },

  async createFeaturedContent(data: Omit<FeaturedContent, 'id' | 'viewCount' | 'clickCount' | 'createdAt'>): Promise<string | null> {
    try {
      const { addDoc, collection: coll, Timestamp: TS } = await import('firebase/firestore');
      const docRef = await addDoc(coll(db, 'featured_content'), {
        ...data,
        viewCount: 0,
        clickCount: 0,
        createdAt: TS.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating featured content:', error);
      return null;
    }
  },

  transformToCarouselItems(content: FeaturedContent[]) {
    return content.map(item => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      image: item.image,
      link: item.link,
      badge: item.badge,
      badgeColor: item.badgeColor,
      badgeIcon: item.badgeIcon,
      ctaText: item.ctaText,
    }));
  },
};

export default carouselService;