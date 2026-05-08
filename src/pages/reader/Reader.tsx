import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, MessageSquare, ChevronUp, ChevronDown, List, Share2, 
  Lock, Loader2, Heart, Star, X, ChevronLeft, ChevronRight, 
  Bookmark, Settings, Zap, Eye, Moon, Sun, Contrast
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { workService, Work } from '@/lib/workService';
import { Skeleton } from '@/components/common/Skeleton';
import { doc, updateDoc, onSnapshot, query, orderBy, limit, getDocs, where, collection } from 'firebase/firestore';
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

  const canReadPremium = hasPermission('read_premium_chapters');
  const canEarlyAccess = hasPermission('early_access');
  const canComment = hasPermission('comment');
  const canLike = hasPermission('like');

  const prevChapter = chapters[currentChapterIndex - 1];
  const nextChapter = chapters[currentChapterIndex + 1];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [chapterId]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
      setShowControls(scrollTop < 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (workId && chapterId) {
      fetchChapterData();
      subscribeToComments();
      checkBookmark();
    }
  }, [workId, chapterId]);

  useEffect(() => {
    if (readerMode === 'bd') {
      document.body.style.backgroundColor = 
        backgroundTheme === 'dark' ? '#0F0F0F' :
        backgroundTheme === 'sepia' ? '#F5E6D3' : '#FFFFFF';
    } else {
      document.body.style.backgroundColor = '#0F0F0F';
    }
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [readerMode, backgroundTheme]);

  const fetchChapterData = async () => {
    if (!workId || !chapterId) return;
    try {
      setLoading(true);
      const workData = await workService.getWork(workId);
      if (workData) {
        setWork(workData);
        
        const chaptersData = await workService.getChapters(workId);
        const sortedChapters = (chaptersData || []).sort((a: any, b: any) => 
          (a.number || 0) - (b.number || 0)
        );
        setChapters(sortedChapters);

        const idx = sortedChapters.findIndex((c: Chapter) => c.id === chapterId);
        setCurrentChapterIndex(idx >= 0 ? idx : 0);

        const found = sortedChapters.find((c: Chapter) => c.id === chapterId);
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
    
    const commentsQuery = query(
      collection(db, 'works', workId, 'chapters', chapterId, 'comments'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(data);
      setCommentsLoading(false);
    }, (error) => {
      console.error('Comments error:', error);
      setCommentsLoading(false);
    });
    
    return unsubscribe;
  };

  const checkBookmark = async () => {
    if (!user || !workId || !chapterId) return;
    try {
      const userDoc = await getDocs(query(
        collection(db, 'users', user.uid, 'readHistory'),
        where('workId', '==', workId),
        where('chapterId', '==', chapterId)
      ));
      setIsBookmarked(!userDoc.empty);
    } catch (err) {
      console.error('Error checking bookmark:', err);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setBookmarkLoading(true);
    try {
      const bookmarkRef = doc(db, 'users', user.uid, 'readHistory', `${workId}_${chapterId}`);
      if (isBookmarked) {
        await import('firebase/firestore').then(({ deleteDoc }) => deleteDoc(bookmarkRef));
        setIsBookmarked(false);
      } else {
        await updateDoc(bookmarkRef, {
          workId,
          chapterId,
          workTitle: work?.title,
          chapterTitle: chapterContent?.title,
          chapterNumber: chapterContent?.number,
          readAt: new Date(),
          progress: scrollProgress
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
    if (!user) return navigate('/login');
    if (!canReadPremium && (profile?.afriCoins || 0) < 50) {
      alert("AfriCoins insuffisants. Souscrivez à un abonnement ou achetez des AfriCoins.");
      navigate('/subscription');
      return;
    }
    
    setUnlocking(true);
    try {
      await workService.unlockChapter(workId!, chapterId!, 50);
      setIsLocked(false);
      alert("Chapitre débloqué !");
    } catch (error) {
      console.error(error);
      alert("Erreur lors du déverrouillage.");
    } finally {
      setUnlocking(false);
    }
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim() || !workId || !chapterId) return;
    if (!canComment) {
      alert("Vous devez être connecté pour commenter.");
      navigate('/login');
      return;
    }
    
    setCommentSubmitting(true);
    try {
      await workService.addComment(
        workId, 
        chapterId, 
        user.uid, 
        profile?.displayName || 'Anonyme', 
        newComment,
        profile?.photoURL
      );
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      alert("Erreur lors de l'ajout du commentaire");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const navigateToChapter = (targetChapterId: string) => {
    navigate(`/read/${workId}/${targetChapterId}`);
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
      {/* Top Bar */}
      <AnimatePresence>
        {(showControls || scrollProgress < 5) && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className={`fixed top-0 left-0 right-0 h-16 z-50 px-6 flex items-center justify-between shadow-lg ${
              backgroundTheme === 'dark' ? 'bg-[#0F0F0F]/95 border-white/10' : 
              backgroundTheme === 'sepia' ? 'bg-[#F5E6D3]/95 border-amber-200/30' : 
              'bg-white/95 border-gray-200'
            }`}
          >
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(`/work/${workId}`)}
                className={`p-2 rounded-full transition-colors ${
                  backgroundTheme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-display font-bold text-sm truncate max-w-[150px] md:max-w-none">
                  {work?.title || 'Chargement...'}
                </h1>
                <p className="text-[10px] text-brand-gold font-bold uppercase tracking-widest">
                  Épisode {chapterNumber} {chapterContent?.title ? `- ${chapterContent.title}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={handleBookmark}
                disabled={bookmarkLoading}
                className={`p-2 rounded-full transition-colors ${isBookmarked ? 'text-brand-gold' : 'text-gray-400 hover:text-white'}`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-full transition-colors ${
                  backgroundTheme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'
                }`}
              >
                <Settings className="w-5 h-5" />
              </button>
              
              {/* Reader Mode Toggle */}
              <div className={`hidden sm:flex rounded-xl p-1 gap-1 ${
                backgroundTheme === 'light' ? 'bg-gray-100' : 'bg-white/5'
              }`}>
                <button 
                  onClick={() => setReaderMode('webtoon')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    readerMode === 'webtoon' ? 'bg-brand-gold text-black' : ''
                  }`}
                >
                  Webtoon
                </button>
                <button 
                  onClick={() => setReaderMode('bd')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    readerMode === 'bd' ? 'bg-brand-gold text-black' : ''
                  }`}
                >
                  BD
                </button>
              </div>
              
              <button 
                onClick={() => setShowComments(true)}
                className={`p-2 rounded-full transition-colors relative ${
                  backgroundTheme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                {comments.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-brand-gold rounded-full" />
                )}
              </button>
              <button 
                onClick={() => setShowShare(true)}
                className={`p-2 rounded-full transition-colors ${
                  backgroundTheme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'
                }`}
              >
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
            className={`fixed top-20 right-6 z-50 rounded-2xl p-4 shadow-2xl border ${
              backgroundTheme === 'light' ? 'bg-white border-gray-200' : 'glass-card'
            }`}
          >
            <h4 className="text-xs font-black uppercase tracking-widest mb-3">Mode de lecture</h4>
            <div className="flex gap-2 mb-4">
              {(['dark', 'sepia', 'light'] as BackgroundTheme[]).map(theme => (
                <button
                  key={theme}
                  onClick={() => setBackgroundTheme(theme)}
                  className={`p-2 rounded-lg transition-all ${
                    backgroundTheme === theme ? 'bg-brand-gold text-black' : 'bg-white/5'
                  }`}
                >
                  {theme === 'dark' ? <Moon className="w-4 h-4" /> : theme === 'sepia' ? <Sun className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              <span className={`w-4 h-4 rounded ${backgroundTheme === 'dark' ? 'bg-[#0F0F0F] border border-white/20' : backgroundTheme === 'sepia' ? 'bg-[#F5E6D3] border border-amber-200' : 'bg-white border border-gray-300'}`} />
              <span className="capitalize">{backgroundTheme === 'dark' ? 'Sombre' : backgroundTheme === 'sepia' ? 'Sépia' : 'Clair'}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[60]">
        <div 
          className="h-full bg-brand-gold transition-all duration-100" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Content */}
      <div className={`max-w-3xl mx-auto pt-20 pb-32 flex flex-col items-center min-h-screen ${
        readerMode === 'bd' && backgroundTheme !== 'dark' ? 'px-4' : ''
      }`}>
        {loading ? (
          <div className="w-full space-y-4 pt-8">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-full aspect-[2/3]" />
            ))}
          </div>
        ) : isLocked ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center py-40">
            <div className="w-24 h-24 bg-brand-gold/10 rounded-[2.5rem] flex items-center justify-center text-brand-gold relative">
              <Lock className="w-10 h-10" />
              <div className="absolute inset-0 border-2 border-brand-gold/20 rounded-[2.5rem] animate-pulse" />
            </div>
            <div className="space-y-4 mt-8">
              <h2 className="text-3xl font-display font-black uppercase tracking-tighter">Chapitre Premium</h2>
              <p className="text-gray-400 max-w-sm mx-auto">
                Ce chapitre nécessite <span className="text-brand-gold font-bold">50 AfriCoins</span> pour être déverrouillé.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-xs mt-8">
              <button 
                onClick={handleUnlock}
                disabled={unlocking}
                className="w-full py-4 bg-brand-gold text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-gold/20"
              >
                {unlocking ? <Loader2 className="w-6 h-6 animate-spin" /> : "DÉBLOQUER (50 🪙)"}
              </button>
              <Link to="/shop" className="text-xs font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors text-center">
                Acheter des AfriCoins
              </Link>
            </div>
          </div>
        ) : pages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <p className="text-gray-500">Aucune page disponible pour ce chapitre.</p>
          </div>
        ) : (
          pages.map((page, index) => (
            <div 
              key={index} 
              className={`w-full relative ${
                readerMode === 'bd' 
                  ? 'mb-12 bg-brand-brown rounded-2xl overflow-hidden shadow-2xl' 
                  : 'mb-2'
              }`}
            >
              <img 
                src={page} 
                alt={`Page ${index + 1}`} 
                className={`w-full h-auto ${readerMode === 'bd' ? 'h-full object-cover' : ''}`}
                loading={index < 2 ? 'eager' : 'lazy'}
              />
              {readerMode === 'webtoon' && pages.length > 1 && index === pages.length - 1 && (
                <div className="h-24 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
              )}
              {readerMode === 'bd' && (
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-bold border border-white/10 uppercase tracking-widest">
                  Page {index + 1}/{pages.length}
                </div>
              )}
            </div>
          ))
        )}

        {/* Chapter Navigation & End Content */}
        {!loading && !isLocked && (
          <div className="w-full py-16 px-6 text-center space-y-8">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <h2 className="text-3xl font-display font-black uppercase tracking-tighter">FIN DU CHAPITRE {chapterNumber}</h2>
            
            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {prevChapter ? (
                <button 
                  onClick={() => navigateToChapter(prevChapter.id)}
                  className={`w-full sm:w-auto px-8 py-4 font-black rounded-2xl flex items-center justify-center gap-2 group transition-all ${
                    backgroundTheme === 'light' 
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-900' 
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  ÉPISODE PRÉCÉDENT
                </button>
              ) : (
                <div className="w-full sm:w-auto px-8 py-4 text-center text-gray-600 text-sm font-bold uppercase tracking-widest">
                  Début de l'histoire
                </div>
              )}
              
              {nextChapter ? (
                <button 
                  onClick={() => navigateToChapter(nextChapter.id)}
                  className="w-full sm:w-auto px-8 py-4 bg-brand-gold text-black font-black rounded-2xl flex items-center justify-center gap-2 group hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-gold/20"
                >
                  ÉPISODE SUIVANT
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <div className="w-full sm:w-auto px-8 py-4 text-center text-gray-600 text-sm font-bold uppercase tracking-widest">
                  Fin de l'histoire
                </div>
              )}
            </div>

            <Link 
              to={`/work/${workId}`} 
              className="block text-sm text-gray-500 hover:text-brand-gold font-bold uppercase tracking-widest transition-colors"
            >
              Voir tous les épisodes ({chapters.length})
            </Link>
          </div>
        )}
      </div>

      {/* Comment Drawer */}
      <AnimatePresence>
        {showComments && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComments(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-0 inset-y-0 w-full max-w-md bg-brand-black border-l border-white/10 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xl font-display font-black uppercase tracking-tighter">
                  Commentaires ({comments.length})
                </h3>
                <button onClick={() => setShowComments(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {commentsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment: any) => (
                    <div key={comment.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold font-bold text-xs">
                            {comment.userName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="font-black text-xs uppercase tracking-widest">{comment.userName}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-bold uppercase">
                          {comment.createdAt?.toDate?.()?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) || 'Maintenant'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed font-medium bg-white/5 p-4 rounded-xl border border-white/5">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase text-gray-500">
                        <button 
                          className="hover:text-white flex items-center gap-1"
                          onClick={() => user && workService.likeComment(workId!, chapterId!, comment.id)}
                        >
                          <Heart className="w-3 h-3" /> {comment.likes || 0}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-bold">Aucun commentaire</p>
                    <p className="text-xs mt-1">Soyez le premier à réagir !</p>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-white/10 bg-white/5">
                <div className="relative">
                  <textarea 
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder={user ? "Votre commentaire..." : "Connectez-vous pour commenter"}
                    disabled={!user || commentSubmitting}
                    className="w-full bg-brand-black border border-white/10 rounded-xl p-4 pr-12 text-sm outline-none focus:border-brand-gold transition-colors resize-none"
                    rows={3}
                  />
                  <button 
                    onClick={handleAddComment}
                    disabled={!user || !newComment.trim() || commentSubmitting}
                    className="absolute bottom-4 right-4 p-2 text-brand-gold hover:scale-110 transition-transform disabled:opacity-30"
                  >
                    {commentSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <ArrowLeft className="w-5 h-5 rotate-180" />
                    )}
                  </button>
                </div>
                {!user && (
                  <button 
                    onClick={() => navigate('/login')}
                    className="w-full mt-3 py-2 bg-brand-gold text-black font-black rounded-xl text-xs uppercase"
                  >
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
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShare(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card max-w-sm w-full p-8 relative z-10 text-center space-y-6"
            >
              <h3 className="text-2xl font-display font-black uppercase tracking-tighter">Partager l'œuvre</h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => {
                    const url = `${window.location.origin}/read/${workId}/${chapterId}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank');
                  }}
                  className="p-4 bg-green-500/20 border border-green-500/30 rounded-2xl hover:bg-green-500/30 transition-all text-[10px] font-black uppercase tracking-widest text-green-400"
                >
                  WhatsApp
                </button>
                <button 
                  onClick={() => {
                    const url = `${window.location.origin}/read/${workId}/${chapterId}`;
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                  }}
                  className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-2xl hover:bg-blue-500/30 transition-all text-[10px] font-black uppercase tracking-widest text-blue-400"
                >
                  Facebook
                </button>
                <button 
                  onClick={() => {
                    const url = `${window.location.origin}/read/${workId}/${chapterId}`;
                    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, '_blank');
                  }}
                  className="p-4 bg-sky-500/20 border border-sky-500/30 rounded-2xl hover:bg-sky-500/30 transition-all text-[10px] font-black uppercase tracking-widest text-sky-400"
                >
                  Twitter/X
                </button>
                <button 
                  onClick={() => {
                    const url = `${window.location.origin}/read/${workId}/${chapterId}`;
                    navigator.clipboard.writeText(url);
                    setShowShare(false);
                  }}
                  className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-brand-gold hover:text-brand-gold transition-all text-[10px] font-black uppercase tracking-widest"
                >
                  Copier Lien
                </button>
              </div>
              <button onClick={() => setShowShare(false)} className="text-xs font-black text-gray-500 uppercase hover:text-white transition-colors">
                Fermer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-40">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
            backgroundTheme === 'light' 
              ? 'bg-gray-100 border border-gray-200 text-gray-900' 
              : 'bg-white/10 backdrop-blur-lg border border-white/10 text-white'
          }`}
        >
          <ChevronUp className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Quick Navigation Dots */}
      {!loading && chapters.length > 3 && (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
          {chapters.slice(0, 10).map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => navigateToChapter(ch.id)}
              className={`w-2 h-2 rounded-full transition-all ${
                ch.id === chapterId ? 'bg-brand-gold scale-125' : 'bg-white/30 hover:bg-white/50'
              }`}
              title={`Épisode ${ch.number}`}
            />
          ))}
          {chapters.length > 10 && (
            <span className="text-[8px] text-gray-500 text-center">+{chapters.length - 10}</span>
        )}
        </div>
      )}
    </div>
  );
};

export default Reader;