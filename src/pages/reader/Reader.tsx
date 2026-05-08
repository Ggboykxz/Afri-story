import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, MessageSquare, ChevronUp, ChevronDown, Share2, 
  Lock, Loader2, Heart, Star, X, ChevronLeft, ChevronRight, 
  Bookmark, Settings, Moon, Sun, List, Check, Eye, EyeOff,
  Wifi, WifiOff, Volume2, VolumeX, ZoomIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { workService, Work } from '@/lib/workService';
import { Skeleton } from '@/components/common/Skeleton';
import { doc, updateDoc, onSnapshot, query, orderBy, limit, getDocs, where, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Chapter = {
  id: string;
  number?: number;
  title?: string;
  pages?: string[];
  isPremium?: boolean;
  createdAt?: any;
};

type ReadingMode = 'webtoon' | 'bd';
type BackgroundTheme = 'dark' | 'sepia' | 'light';

export const Reader = () => {
  const { workId, chapterId } = useParams();
  const { user, profile, hasPermission } = useAuth();
  const navigate = useNavigate();
  
  const [work, setWork] = useState<Work | null>(null);
  const [chapterContent, setChapterContent] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [showControls, setShowControls] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showChapterList, setShowChapterList] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const [readerMode, setReaderMode] = useState<ReadingMode>('webtoon');
  const [backgroundTheme, setBackgroundTheme] = useState<BackgroundTheme>('dark');
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isLocked, setIsLocked] = useState(true); 
  const [unlocking, setUnlocking] = useState(false);

  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const [likeAnimation, setLikeAnimation] = useState(false);
  const [autoHideControls, setAutoHideControls] = useState(true);
  const [keepScreenOn, setKeepScreenOn] = useState(false);
  const [showWakeLockTip, setShowWakeLockTip] = useState(false);

  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [readingProgress, setReadingProgress] = useState(0);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const canReadPremium = hasPermission('read_premium_chapters');
  const canComment = hasPermission('comment');

  const prevChapter = chapters[currentChapterIndex - 1];
  const nextChapter = chapters[currentChapterIndex + 1];

  useEffect(() => {
    window.scrollTo(0, 0);
    setShowControls(true);
    resetControlsTimer();
  }, [chapterId]);

  useEffect(() => {
    if (workId && chapterId) {
      fetchChapterData();
      subscribeToComments();
      checkBookmark();
      loadReadingProgress();
    }
  }, [workId, chapterId]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = 
      backgroundTheme === 'dark' ? '#0F0F0F' :
      backgroundTheme === 'sepia' ? '#F5E6D3' : '#FFFFFF';
    return () => { document.body.style.backgroundColor = ''; };
  }, [backgroundTheme]);

  useEffect(() => {
    if (keepScreenOn && 'wakeLock' in navigator) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => { releaseWakeLock(); };
  }, [keepScreenOn]);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch (err) {
      console.log('Wake Lock error:', err);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  const resetControlsTimer = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (autoHideControls && !showSettings && !showChapterList) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    }
  }, [autoHideControls, showSettings, showChapterList]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
      setReadingProgress(Math.round(progress));
      setShowControls(scrollTop < 100);
      resetControlsTimer();
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [resetControlsTimer]);

  const handleImageTap = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    if (lastTapRef.current && now - lastTapRef.current.time < 300) {
      const dx = Math.abs(x - lastTapRef.current.x);
      const dy = Math.abs(y - lastTapRef.current.y);
      
      if (dx < 30 && dy < 30) {
        setLikeAnimation(true);
        setTimeout(() => setLikeAnimation(false), 800);
        if (user) workService.likeChapter(workId!, chapterId!);
      }
      lastTapRef.current = null;
    } else {
      lastTapRef.current = { time: now, x, y };
    }
  };

  const handleLongPress = (imageUrl: string) => {
    if (readerMode === 'bd') {
      setZoomedImage(imageUrl);
    }
  };

  const fetchChapterData = async () => {
    if (!workId || !chapterId) return;
    try {
      setLoading(true);
      const workData = await workService.getWork(workId);
      if (workData) {
        setWork(workData);
        
        const chaptersData = await workService.getChapters(workId);
        const sorted = (chaptersData || []).sort((a, b) => (a.number || 0) - (b.number || 0));
        setChapters(sorted);

        const idx = sorted.findIndex((c) => c.id === chapterId);
        setCurrentChapterIndex(idx >= 0 ? idx : 0);

        const found = sorted.find((c) => c.id === chapterId);
        if (found) {
          setChapterContent(found);
          setIsLocked(found.isPremium && !canReadPremium);
        }
      }
    } catch (err) {
      console.error('Error fetching chapter:', err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToComments = () => {
    if (!workId || !chapterId) return;
    setCommentsLoading(true);
    
    const q = query(
      collection(db, 'works', workId, 'chapters', chapterId, 'comments'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(data);
      setCommentsLoading(false);
    }, () => setCommentsLoading(false));
    
    return unsubscribe;
  };

  const checkBookmark = async () => {
    if (!user || !workId || !chapterId) return;
    try {
      const snap = await getDocs(query(
        collection(db, 'users', user.uid, 'readHistory'),
        where('workId', '==', workId),
        where('chapterId', '==', chapterId)
      ));
      setIsBookmarked(!snap.empty);
    } catch (err) {
      console.error('Error checking bookmark:', err);
    }
  };

  const loadReadingProgress = async () => {
    if (!user || !workId || !chapterId) return;
    try {
      const snap = await getDocs(query(
        collection(db, 'users', user.uid, 'readingProgress'),
        where('workId', '==', workId),
        where('chapterId', '==', chapterId)
      ));
      if (!snap.empty) {
        const data = snap.docs[0].data();
        if (data.progress > 0 && scrollProgress === 0) {
          setTimeout(() => {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo(0, (docHeight * data.progress) / 100);
          }, 100);
        }
      }
    } catch (err) {
      console.error('Error loading progress:', err);
    }
  };

  const saveReadingProgress = async (progress: number) => {
    if (!user || !workId || !chapterId) return;
    try {
      const progressRef = doc(db, 'users', user.uid, 'readingProgress', `${workId}_${chapterId}`);
      await updateDoc(progressRef, {
        workId,
        chapterId,
        workTitle: work?.title,
        chapterNumber: chapterContent?.number,
        progress,
        lastReadAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  useEffect(() => {
    if (readingProgress > 0 && readingProgress % 10 === 0) {
      saveReadingProgress(readingProgress);
    }
  }, [readingProgress]);

  const handleBookmark = async () => {
    if (!user) { navigate('/login'); return; }
    setBookmarkLoading(true);
    try {
      const ref = doc(db, 'users', user.uid, 'readHistory', `${workId}_${chapterId}`);
      if (isBookmarked) {
        await import('firebase/firestore').then(({ deleteDoc }) => deleteDoc(ref));
        setIsBookmarked(false);
      } else {
        await updateDoc(ref, {
          workId, chapterId, workTitle: work?.title,
          chapterTitle: chapterContent?.title,
          chapterNumber: chapterContent?.number,
          readAt: serverTimestamp(), progress: readingProgress
        });
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (!user) { navigate('/login'); return; }
    if (!canReadPremium && (profile?.afriCoins || 0) < 50) {
      navigate('/subscription');
      return;
    }
    setUnlocking(true);
    try {
      await workService.unlockChapter(workId!, chapterId!, 50);
      setIsLocked(false);
    } catch (error) {
      console.error(error);
    } finally {
      setUnlocking(false);
    }
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;
    setCommentSubmitting(true);
    try {
      await workService.addComment(workId!, chapterId!, user.uid, profile?.displayName || 'Anonyme', newComment, profile?.photoURL);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const navigateToChapter = (id: string) => {
    setShowChapterList(false);
    navigate(`/read/${workId}/${id}`);
  };

  const getThemeStyles = (): string => {
    switch (backgroundTheme) {
      case 'sepia': return 'bg-[#F5E6D3] text-gray-900';
      case 'light': return 'bg-white text-gray-900';
      default: return 'bg-[#0F0F0F] text-white';
    }
  };

  const pages = chapterContent?.pages || [];
  const chapterNumber = chapterContent?.number || 1;

  return (
    <div className={`min-h-screen ${getThemeStyles()} transition-colors duration-300`}>
      {/* Like Animation Overlay */}
      <AnimatePresence>
        {likeAnimation && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
          >
            <Heart className="w-32 h-32 text-brand-red fill-current" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoomed Image Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black flex items-center justify-center"
            onClick={() => setZoomedImage(null)}
          >
            <img src={zoomedImage} alt="Zoomed" className="max-w-full max-h-full object-contain" />
            <button className="absolute top-4 right-4 p-2 bg-white/20 rounded-full">
              <X className="w-6 h-6 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between shadow-xl ${
              backgroundTheme === 'dark' ? 'bg-[#0F0F0F]/95 border-white/10' : 
              backgroundTheme === 'sepia' ? 'bg-[#F5E6D3]/95 border-amber-200/30' : 
              'bg-white/95 border-gray-200'
            }`}
            onClick={() => resetControlsTimer()}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button onClick={() => navigate(`/work/${workId}`)} className="p-2 rounded-full hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0 flex-1" onClick={() => setShowChapterList(true)}>
                <h1 className="font-bold text-sm truncate">{work?.title || '...'}</h1>
                <p className="text-[10px] text-brand-gold font-bold uppercase tracking-widest">
                  Ep.{chapterNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {isOffline && (
                <div className="p-1.5 bg-red-500/20 rounded-lg" title="Hors ligne">
                  <WifiOff className="w-4 h-4 text-red-400" />
                </div>
              )}
              
              <button onClick={handleBookmark} disabled={bookmarkLoading} className="p-2 rounded-full hover:bg-white/10">
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'text-brand-gold fill-current' : ''}`} />
              </button>
              
              <button onClick={() => { setShowSettings(!showSettings); setAutoHideControls(false); }} className="p-2 rounded-full hover:bg-white/10">
                <Settings className="w-5 h-5" />
              </button>
              
              <button onClick={() => setShowChapterList(true)} className="p-2 rounded-full hover:bg-white/10">
                <List className="w-5 h-5" />
              </button>
              
              <button onClick={() => setShowComments(true)} className="p-2 rounded-full hover:bg-white/10 relative">
                <MessageSquare className="w-5 h-5" />
                {comments.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-gold text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                    {comments.length > 9 ? '9+' : comments.length}
                  </span>
                )}
              </button>
              
              <button onClick={() => setShowShare(true)} className="p-2 rounded-full hover:bg-white/10">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-4 z-50 rounded-2xl p-4 shadow-2xl border w-64 ${
              backgroundTheme === 'light' ? 'bg-white border-gray-200' : 'glass-card'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-black uppercase tracking-widest">Paramètres</h4>
              <button onClick={() => { setShowSettings(false); setAutoHideControls(true); }} className="p-1 hover:bg-white/10 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 block">Mode</label>
                <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                  {(['dark', 'sepia', 'light'] as BackgroundTheme[]).map(t => (
                    <button key={t} onClick={() => setBackgroundTheme(t)}
                      className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase transition-all ${
                        backgroundTheme === t ? 'bg-brand-gold text-black' : ''
                      }`}>
                      {t === 'dark' ? '🌙' : t === 'sepia' ? '☀️' : '☀️'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 block">Lecture</label>
                <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                  <button onClick={() => setReaderMode('webtoon')}
                    className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase transition-all ${
                      readerMode === 'webtoon' ? 'bg-brand-gold text-black' : ''
                    }`}>
                    Scroll
                  </button>
                  <button onClick={() => setReaderMode('bd')}
                    className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase transition-all ${
                      readerMode === 'bd' ? 'bg-brand-gold text-black' : ''
                    }`}>
                    Pages
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs font-bold">Masquer auto</span>
                </div>
                <button onClick={() => setAutoHideControls(!autoHideControls)}
                  className={`w-10 h-6 rounded-full transition-all ${autoHideControls ? 'bg-brand-gold' : 'bg-white/20'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-all ${autoHideControls ? 'ml-5' : 'ml-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  <span className="text-xs font-bold">Écran allumé</span>
                </div>
                <button onClick={() => {
                  setKeepScreenOn(!keepScreenOn);
                  if (!keepScreenOn) setShowWakeLockTip(true);
                  setTimeout(() => setShowWakeLockTip(false), 3000);
                }}
                  className={`w-10 h-6 rounded-full transition-all ${keepScreenOn ? 'bg-brand-gold' : 'bg-white/20'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-all ${keepScreenOn ? 'ml-5' : 'ml-1'}`} />
                </button>
              </div>

              {showWakeLockTip && (
                <p className="text-[10px] text-gray-500 bg-white/5 p-2 rounded-lg">
                  💡 L'écran restera allumé pendant la lecture
                </p>
              )}

              <div className="pt-2 border-t border-white/10 text-center">
                <span className="text-[10px] text-gray-500">
                  Progression: {readingProgress}%
                </span>
                <div className="h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-brand-gold transition-all" style={{ width: `${readingProgress}%` }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chapter List Modal */}
      <AnimatePresence>
        {showChapterList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowChapterList(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className={`absolute right-0 top-0 bottom-0 w-80 max-w-full shadow-2xl overflow-hidden flex flex-col ${
                backgroundTheme === 'light' ? 'bg-white' : 'bg-[#0F0F0F]'
              }`}
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold">Chapitres ({chapters.length})</h3>
                <button onClick={() => setShowChapterList(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {chapters.map((ch, idx) => (
                  <button
                    key={ch.id}
                    onClick={() => navigateToChapter(ch.id)}
                    className={`w-full p-4 flex items-center gap-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                      ch.id === chapterId ? 'bg-brand-gold/10' : ''
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      ch.id === chapterId ? 'bg-brand-gold text-black' : 'bg-white/10'
                    }`}>
                      {ch.number}
                    </span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold truncate">{ch.title || `Épisode ${ch.number}`}</p>
                      {ch.isPremium && <span className="text-[10px] text-brand-gold">🔒 Premium</span>}
                    </div>
                    {ch.id === chapterId && <Check className="w-5 h-5 text-brand-gold" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[60]">
        <div className="h-full bg-brand-gold transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* Content */}
      <div ref={contentRef} className="pt-20 pb-32">
        {loading ? (
          <div className="w-full space-y-4 px-4 pt-4">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-full aspect-[2/3] rounded-xl" />
            ))}
          </div>
        ) : isLocked ? (
          <div className="flex flex-col items-center justify-center py-40 px-8 text-center">
            <div className="w-20 h-20 bg-brand-gold/10 rounded-[2rem] flex items-center justify-center relative">
              <Lock className="w-8 h-8 text-brand-gold" />
              <div className="absolute inset-0 border-2 border-brand-gold/20 rounded-[2rem] animate-pulse" />
            </div>
            <h2 className="text-2xl font-black uppercase mt-6 tracking-tight">Chapitre Premium</h2>
            <p className="text-gray-400 mt-2 max-w-xs">
              Ce chapitre nécessite <span className="text-brand-gold font-bold">50 AfriCoins</span>
            </p>
            <button onClick={handleUnlock} disabled={unlocking}
              className="mt-8 px-8 py-4 bg-brand-gold text-black font-black rounded-2xl flex items-center gap-3 hover:scale-105 transition-transform">
              {unlocking ? <Loader2 className="w-5 h-5 animate-spin" /> : 'DÉBLOQUER (50 🪙)'}
            </button>
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>Aucune page disponible.</p>
          </div>
        ) : (
          <div className={`${readerMode === 'bd' && backgroundTheme !== 'dark' ? 'px-4' : ''}`}>
            {pages.map((page, idx) => (
              <div 
                key={idx}
                className={`relative ${readerMode === 'bd' ? 'mb-8' : 'mb-1'}`}
                onClick={handleImageTap}
                onContextMenu={(e) => { e.preventDefault(); handleLongPress(page); }}
              >
                <img 
                  src={page} 
                  alt={`Page ${idx + 1}`}
                  className={`w-full h-auto ${readerMode === 'bd' ? 'rounded-xl shadow-2xl' : ''}`}
                  loading={idx < 2 ? 'eager' : 'lazy'}
                />
                {readerMode === 'bd' && (
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                    {idx + 1}/{pages.length}
                  </div>
                )}
                {readerMode === 'webtoon' && idx === pages.length - 1 && (
                  <div className="h-20 bg-gradient-to-t from-[#0F0F0F] to-transparent pointer-events-none" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Chapter Navigation */}
        {!loading && !isLocked && (
          <div className="px-4 py-16 text-center space-y-6">
            <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <h2 className="text-2xl font-black uppercase tracking-tight">Fin - Épisode {chapterNumber}</h2>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {prevChapter ? (
                <button onClick={() => navigateToChapter(prevChapter.id)}
                  className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform ${
                    backgroundTheme === 'light' ? 'bg-gray-100' : 'bg-white/5'
                  }`}>
                  <ChevronLeft className="w-4 h-4" /> Précédent
                </button>
              ) : (
                <span className="px-6 py-3 text-gray-600 text-sm font-bold uppercase">Début</span>
              )}
              
              {nextChapter ? (
                <button onClick={() => navigateToChapter(nextChapter.id)}
                  className="w-full sm:w-auto px-6 py-3 bg-brand-gold text-black font-bold rounded-xl flex items-center gap-2 hover:scale-105 transition-transform">
                  Suivant <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <span className="px-6 py-3 text-gray-600 text-sm font-bold uppercase">Fin</span>
              )}
            </div>
            
            <Link to={`/work/${workId}`} className="block text-sm text-gray-500 hover:text-brand-gold font-bold uppercase tracking-widest">
              Tous les épisodes ({chapters.length})
            </Link>
          </div>
        )}
      </div>

      {/* Floating Scroll-to-Top */}
      {scrollProgress > 30 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-12 h-12 bg-brand-gold text-black rounded-full shadow-lg flex items-center justify-center z-40 hover:scale-110 transition-transform"
        >
          <ChevronUp className="w-6 h-6" />
        </motion.button>
      )}

      {/* Comments Drawer */}
      <AnimatePresence>
        {showComments && (
          <div className="fixed inset-0 z-50">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowComments(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#0F0F0F] border-l border-white/10 shadow-2xl flex flex-col">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold">Commentaires ({comments.length})</h3>
                <button onClick={() => setShowComments(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {commentsLoading ? (
                  <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div>
                ) : comments.length > 0 ? (
                  comments.map(c => (
                    <div key={c.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold text-xs font-bold">
                          {c.authorName?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="text-xs font-bold uppercase">{c.authorName}</span>
                        <span className="text-[10px] text-gray-500">
                          {c.createdAt?.toDate()?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-sm bg-white/5 p-3 rounded-xl">{c.content}</p>
                      <div className="flex items-center gap-4 text-[10px] text-gray-500">
                        <button onClick={() => user && workService.likeComment(workId!, chapterId!, c.id)} className="hover:text-white flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {c.likes || 0}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-bold">Aucun commentaire</p>
                    <p className="text-xs mt-1">Soyez le premier !</p>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-white/10 bg-white/5">
                <div className="relative">
                  <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
                    placeholder={user ? "Votre commentaire..." : "Connectez-vous"}
                    disabled={!user || commentSubmitting}
                    className="w-full bg-[#0F0F0F] border border-white/10 rounded-xl p-3 pr-12 text-sm outline-none focus:border-brand-gold resize-none"
                    rows={3}
                  />
                  <button onClick={handleAddComment} disabled={!user || !newComment.trim() || commentSubmitting}
                    className="absolute bottom-3 right-3 text-brand-gold disabled:opacity-30">
                    {commentSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowLeft className="w-5 h-5 rotate-180" />}
                  </button>
                </div>
                {!user && (
                  <button onClick={() => navigate('/login')}
                    className="w-full mt-3 py-2 bg-brand-gold text-black font-bold rounded-xl text-sm uppercase">
                    Se connecter
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShare && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowShare(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card max-w-sm w-full p-6 relative z-10 text-center space-y-4">
              <h3 className="text-xl font-black uppercase">Partager</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'WhatsApp', color: 'bg-green-500/20 text-green-400 border-green-500/30', url: `https://wa.me/?text=${encodeURIComponent(window.location.href)}` },
                  { name: 'Facebook', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}` },
                  { name: 'Twitter', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}` },
                  { name: 'Copier', color: 'bg-white/5 border-white/10', action: () => { navigator.clipboard.writeText(window.location.href); setShowShare(false); } },
                ].map(btn => (
                  <button key={btn.name} onClick={() => btn.action ? btn.action() : window.open(btn.url, '_blank')}
                    className={`p-4 rounded-xl border transition-all hover:scale-105 text-[10px] font-black uppercase tracking-widest ${btn.color}`}>
                    {btn.name}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowShare(false)} className="text-xs text-gray-500 hover:text-white uppercase font-bold">
                Fermer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reader;