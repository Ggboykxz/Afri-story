import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, Zap, Star, Crown, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface CarouselItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  link: string;
  badge?: string;
  badgeIcon?: React.ReactNode;
  badgeColor?: string;
  ctaText?: string;
}

interface AdCarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  showProgress?: boolean;
  aspectRatio?: 'video' | 'tall' | 'wide';
  variant?: 'featured' | 'spotlight' | 'event';
  title?: string;
  className?: string;
  onItemClick?: (item: CarouselItem) => void;
}

const variantStyles = {
  featured: {
    container: 'rounded-[2rem] overflow-hidden',
    content: 'p-10 md:p-16',
  },
  spotlight: {
    container: 'rounded-3xl overflow-hidden',
    content: 'p-8 md:p-12',
  },
  event: {
    container: 'rounded-[2.5rem] overflow-hidden',
    content: 'p-6 md:p-10',
  },
};

const aspectRatioStyles = {
  video: 'aspect-video',
  tall: 'aspect-[3/4]',
  wide: 'aspect-[21/9]',
};

export const AdCarousel = ({
  items,
  autoPlay = true,
  autoPlayInterval = 5000,
  showArrows = true,
  showDots = true,
  showProgress = true,
  aspectRatio = 'video',
  variant = 'featured',
  title,
  className = '',
  onItemClick,
}: AdCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const safeItems = items.length > 0 ? items : demoItems;

  const startProgress = useCallback(() => {
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(0);
    progressRef.current = setInterval(() => {
      setProgress(p => Math.min(p + (100 / (autoPlayInterval / 100)), 100));
    }, 100);
  }, [autoPlayInterval]);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex(prev => (prev + 1) % safeItems.length);
    startProgress();
  }, [safeItems.length, startProgress]);

  const goToPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex(prev => (prev - 1 + safeItems.length) % safeItems.length);
    startProgress();
  }, [safeItems.length, startProgress]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    startProgress();
  };

  useEffect(() => {
    if (isPlaying && safeItems.length > 1) {
      intervalRef.current = setInterval(goToNext, autoPlayInterval);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, autoPlayInterval, goToNext, safeItems.length]);

  useEffect(() => {
    startProgress();
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [autoPlayInterval, startProgress]);

  const currentItem = safeItems[currentIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  const currentVariant = variantStyles[variant];
  const currentAspect = aspectRatioStyles[aspectRatio];

  return (
    <div className={`relative group ${className}`}>
      {title && (
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-6 h-6 text-brand-gold" />
          <h2 className="text-2xl md:text-3xl font-display font-bold">{title}</h2>
        </div>
      )}

      <div
        className={`relative ${currentAspect} ${currentVariant.container} bg-brand-black cursor-pointer`}
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
        onClick={() => onItemClick?.(currentItem)}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0"
          >
            <Link to={currentItem.link} onClick={e => e.stopPropagation()}>
              <img
                src={currentItem.image}
                alt={currentItem.title}
                className="w-full h-full object-cover"
              />
            </Link>
            <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-black/80 via-transparent to-transparent" />

            <div className={`absolute inset-0 flex flex-col justify-end ${currentVariant.content}`}>
              {currentItem.badge && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`inline-flex items-center gap-2 ${currentItem.badgeColor || 'bg-brand-gold'} text-brand-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mb-4`}
                >
                  {currentItem.badgeIcon}
                  {currentItem.badge}
                </motion.div>
              )}

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-5xl font-display font-black text-white leading-tight mb-2"
              >
                {currentItem.title}
              </motion.h3>

              {currentItem.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-lg md:text-xl text-brand-gold font-bold mb-2"
                >
                  {currentItem.subtitle}
                </motion.p>
              )}

              {currentItem.description && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-300 text-sm md:text-base max-w-xl line-clamp-2 mb-6"
                >
                  {currentItem.description}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Link
                  to={currentItem.link}
                  onClick={e => e.stopPropagation()}
                  className="inline-flex items-center gap-3 bg-brand-gold text-brand-black px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-white transition-colors"
                >
                  {currentItem.ctaText || 'Découvrir'}
                  <TrendingUp className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {showProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <motion.div
              className="h-full bg-brand-gold"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        )}

        {showArrows && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goToPrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-brand-black/50 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-gold hover:text-brand-black text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-brand-black/50 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-gold hover:text-brand-black text-white"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
          className="absolute top-4 right-4 w-10 h-10 bg-brand-black/50 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-gold hover:text-brand-black text-white"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        {showDots && safeItems.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {safeItems.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-brand-gold'
                    : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const demoItems: CarouselItem[] = [
  {
    id: '1',
    title: 'Les Origins du Lion',
    subtitle: 'Par Awa Kouyaté',
    description: 'Une épopée familiale retraçant les origines d\'une dynastie royale dans l\'Afrique de l\'Ouest.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&auto=format&fit=crop',
    link: '/work/1',
    badge: 'Top de la semaine',
    badgeIcon: <Crown className="w-3 h-3" />,
    badgeColor: 'bg-gradient-to-r from-brand-gold to-yellow-600',
    ctaText: 'Lire Maintenant',
  },
  {
    id: '2',
    title: 'AfriStory Pro',
    subtitle: 'Rejoignez l\'élite créative',
    description: 'Monétisez vos œuvres, accédez à des statistiques avancées et construisez votre empire médiatique.',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&auto=format&fit=crop',
    link: '/become-pro',
    badge: 'Exclusivité',
    badgeIcon: <Star className="w-3 h-3" />,
    badgeColor: 'bg-gradient-to-r from-brand-gold to-yellow-600',
    ctaText: 'Devenir Pro',
  },
  {
    id: '3',
    title: 'Concours AfriStory 2026',
    subtitle: '50 000€ de prix',
    description: 'Participez au plus grand concours de BD panafricain. Deadline : 30 Juin 2026.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&auto=format&fit=crop',
    link: '/contests',
    badge: 'Événement',
    badgeIcon: <Zap className="w-3 h-3" />,
    badgeColor: 'bg-brand-green',
    ctaText: 'Participer',
  },
];

export default AdCarousel;