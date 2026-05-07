import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, ChevronUp, ChevronDown, List, Share2, Lock, Loader2, Heart, Star, X, ChevronLeft, ChevronRight, Bookmark, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { workService } from '../lib/workService';
import { Skeleton } from '../components/Skeleton';

export const Reader = () => {
  const { workId, chapterId } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [showControls, setShowControls] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
      setShowControls(progress < 5 || scrollTop < 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [readerMode, setReaderMode] = useState<'webtoon' | 'bd'>('webtoon');
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isLocked, setIsLocked] = useState(true); 
  const [unlocking, setUnlocking] = useState(false);

  const handleUnlock = async () => {
    if (!user || !workId || !chapterId) return alert("Veuillez vous connecter.");
    if ((profile?.afriCoins || 0) < 50) return alert("AfriCoins insuffisants.");
    
    setUnlocking(true);
    try {
      await workService.unlockChapter(workId, chapterId, 50);
      setIsLocked(false);
      alert("Chapitre débloqué !");
    } catch (error) {
      console.error(error);
      alert("Erreur lors du déverrouillage.");
    } finally {
      setUnlocking(false);
    }
  };

  const [chapterContent, setChapterContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchChapter();
  }, [workId, chapterId]);

  useEffect(() => {
    if (workId && chapterId) {
      setCommentsLoading(true);
      const unsubscribe = workService.subscribeToComments(workId, chapterId, (data) => {
        setComments(data);
        setCommentsLoading(false);
      });
      return () => unsubscribe();
    }
  }, [workId, chapterId]);

  const handleAddComment = async () => {
    if (!user || !newComment.trim() || !workId || !chapterId) return;
    await workService.addComment(
      workId, 
      chapterId, 
      user.uid, 
      profile?.displayName || 'Anonyme', 
      newComment
    );
    setNewComment('');
  };

  const fetchChapter = async () => {
    if (!workId || !chapterId) return;
    try {
      setLoading(true);
      const workData = await workService.getWork(workId);
      // In a real subcollection setup, we'd fetch the specific chapter doc.
      // Here we simulate finding it in the array or a mock.
      const found = workData?.chapters?.find((c: any) => c.id === chapterId);
      if (found) {
        setChapterContent(found);
        setIsLocked(found.isPremium && !profile?.unlockedChapters?.includes(chapterId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Mock content (vertical scroll images)
  const pages = [
     'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1000',
     'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1000',
     'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=1000',
  ];

  return (
    <div className="bg-brand-black min-h-screen">
      {/* Top Bar */}
      <AnimatePresence>
        {(showControls || scrollProgress < 5) && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 h-16 bg-brand-black/90 backdrop-blur-md z-50 border-b border-white/10 px-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(`/work/${workId}`)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Retour"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-display font-bold text-sm truncate max-w-[150px] md:max-w-none">Légendes d'Oyo</h1>
                <p className="text-[10px] text-brand-gold font-bold uppercase tracking-widest">Épisode 1</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 rounded-full transition-colors ${isBookmarked ? 'text-brand-gold' : 'hover:bg-white/10 text-gray-400'}`}
                aria-label="Marquer comme lu"
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Paramètres"
              >
                <Settings className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
                 <button 
                   onClick={() => setReaderMode('webtoon')}
                   className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${readerMode === 'webtoon' ? 'bg-brand-gold text-brand-black' : 'text-gray-400 hover:text-white'}`}
                 >
                    Webtoon
                 </button>
                 <button 
                   onClick={() => setReaderMode('bd')}
                   className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${readerMode === 'bd' ? 'bg-brand-gold text-brand-black' : 'text-gray-400 hover:text-white'}`}
                 >
                    BD
                 </button>
              </div>
              <button 
                onClick={() => setShowComments(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-brand-gold rounded-full" />
              </button>
              <button 
                onClick={() => setShowShare(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-[60]">
        <div 
          className="h-full bg-brand-gold transition-all duration-100" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Content */}
      <div className={`max-w-3xl mx-auto pt-4 flex flex-col items-center min-h-screen ${readerMode === 'bd' ? 'px-6' : ''}`}>
        {loading ? (
          <div className="w-full space-y-4">
             {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="w-full aspect-[2/3]" />
             ))}
          </div>
        ) : isLocked ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8 bg-linear-to-b from-brand-black/0 via-brand-black to-brand-black py-40">
             <div className="w-24 h-24 bg-brand-gold/10 rounded-[2.5rem] flex items-center justify-center text-brand-gold relative">
                <Lock className="w-10 h-10" />
                <div className="absolute inset-0 border-2 border-brand-gold/20 rounded-[2.5rem] animate-pulse" />
             </div>
             <div className="space-y-4">
                <h2 className="text-3xl font-display font-black uppercase tracking-tighter">Chapitre Premium</h2>
                <p className="text-gray-400 max-w-sm mx-auto">
                   Ce chapitre nécessite <span className="text-brand-gold font-bold">50 AfriCoins</span> pour être déverrouillé définitivement.
                </p>
             </div>
             <div className="flex flex-col gap-3 w-full max-w-xs">
                <button 
                  onClick={handleUnlock}
                  disabled={unlocking}
                  className="w-full py-4 bg-brand-gold text-brand-black font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-gold/20"
                >
                   {unlocking ? <Loader2 className="w-6 h-6 animate-spin" /> : "DÉBLOQUER (50 🪙)"}
                </button>
                <Link to="/shop" className="text-xs font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors">Acheter des AfriCoins</Link>
             </div>
          </div>
        ) : (
          pages.map((page, index) => (
            <div key={index} className={`w-full relative ${readerMode === 'bd' ? 'mb-12 aspect-[3/4] bg-brand-brown rounded-2xl overflow-hidden shadow-2xl' : ''}`}>
              <img 
                src={page} 
                alt={`Page ${index + 1}`} 
                className={`w-full h-auto ${readerMode === 'bd' ? 'h-full object-cover' : ''}`}
                draggable={false}
              />
              {readerMode === 'webtoon' && (
                <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-brand-black to-transparent pointer-events-none" />
              )}
              {readerMode === 'bd' && (
                 <div className="absolute bottom-4 right-4 bg-brand-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-bold border border-white/10 uppercase tracking-widest">
                    Page {index + 1}
                 </div>
              )}
            </div>
          ))
        )}

        {/* End of chapter */}
        <div className="py-24 px-6 text-center space-y-8 w-full">
          <div className="h-[1px] w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />
          <h2 className="text-3xl font-display font-black uppercase tracking-tighter">FIN DU CHAPITRE</h2>
          <div className="space-y-4 py-8 border-y border-white/5">
             <h3 className="text-sm font-black uppercase tracking-widest text-brand-gold">Donnez votre avis sur cet épisode</h3>
             <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                   <button key={star} className="p-2 hover:scale-125 transition-transform">
                      <Star className={`w-10 h-10 ${star <= 4 ? 'fill-brand-gold text-brand-gold' : 'text-gray-700'}`} />
                   </button>
                ))}
             </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <button className="w-full sm:w-auto px-8 py-4 bg-brand-gold text-brand-black font-black rounded-2xl flex items-center justify-center gap-2 group">
               ÉPISODE SUIVANT
               <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
             </button>
             <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10">
               <MessageSquare className="w-5 h-5" />
               COMMENTER
             </button>
          </div>
          <Link to={`/work/${workId}`} className="block text-sm text-gray-500 hover:text-brand-gold font-bold uppercase tracking-widest">Voir tous les épisodes</Link>
          
          {/* Comment Section UI */}
          <div className="text-left mt-16 glass-card p-8 space-y-6">
             <h3 className="font-display font-bold flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-brand-gold" />
                Commentaires (24)
             </h3>
             <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-brand-brown flex-shrink-0" />
                <div className="flex-1 space-y-3">
                   <textarea 
                     placeholder="Ajouter un commentaire..." 
                     className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-brand-gold/50 transition-all min-h-[100px]"
                   />
                   <div className="flex justify-end">
                      <button className="px-6 py-2 bg-brand-gold text-brand-black font-black text-xs rounded-lg uppercase">Publier</button>
                   </div>
                </div>
             </div>

             <div className="space-y-6 pt-6 border-t border-white/10">
                {[1, 2].map(i => (
                  <div key={i} className="flex gap-4">
                     <div className="w-10 h-10 rounded-full bg-brand-brown flex-shrink-0" />
                     <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-sm">Aurore_K</span>
                           <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Il y a 2h</span>
                        </div>
                        <p className="text-sm text-gray-400">Incroyable ce chapitre ! Le design des esprits est vraiment unique. J'ai hâte de voir la suite.</p>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase text-gray-500 mt-2">
                           <button className="hover:text-white">Répondre</button>
                           <button className="hover:text-brand-red flex items-center gap-1"><Heart className="w-3 h-3" /> 12</button>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
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
              className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 inset-y-0 w-full max-w-md bg-brand-black border-l border-white/10 shadow-2xl flex flex-col"
            >
               <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-xl font-display font-black uppercase tracking-tighter">Commentaires</h3>
                  <button onClick={() => setShowComments(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
               </div>
<div className="flex-1 overflow-y-auto p-6 space-y-6">
                   {commentsLoading ? (
                     <div className="text-center text-gray-500">Chargement...</div>
                   ) : comments.length > 0 ? (
                     comments.map((comment: any) => (
                       <div key={comment.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                             <span className="font-black text-xs uppercase tracking-widest">{comment.authorName}</span>
                             <span className="text-[10px] text-gray-500 font-bold uppercase">
                               {comment.createdAt?.toDate?.() ? comment.createdAt.toDate().toLocaleDateString() : 'Maintenant'}
                             </span>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed font-medium bg-white/5 p-4 rounded-xl border border-white/5">{comment.content}</p>
                          <div className="flex items-center gap-4 text-[10px] font-black uppercase text-gray-500">
                             <button className="hover:text-white" onClick={() => user && workService.likeComment(workId!, chapterId!, comment.id)}>
                               <Heart className="w-3 h-3 inline mr-1" /> {comment.likes || 0}
                             </button>
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="text-center text-gray-500 py-8">Aucun commentaire. Soyez le premier !</div>
                   )}
                </div>
                <div className="p-6 border-t border-white/10 bg-white/5">
                   <div className="relative">
                      <textarea 
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder={user ? "Votre commentaire..." : "Connectez-vous pour commenter"}
                        disabled={!user}
                        className="w-full bg-brand-black border border-white/10 rounded-xl p-4 pr-12 text-sm outline-none focus:border-brand-gold transition-colors resize-none"
                        rows={3}
                      />
                      <button 
                        onClick={handleAddComment}
                        disabled={!user || !newComment.trim()}
                        className="absolute bottom-4 right-4 p-2 text-brand-gold hover:scale-110 transition-transform disabled:opacity-30"
                      >
                        <ArrowLeft className="w-5 h-5 rotate-180" />
                      </button>
                   </div>
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
              className="absolute inset-0 bg-brand-black/90 backdrop-blur-md"
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
              <button onClick={() => setShowShare(false)} className="text-xs font-black text-gray-500 uppercase hover:text-white transition-colors">Fermer</button>
           </motion.div>
         </div>
       )}
      </AnimatePresence>

      {/* Floating Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-40">
         <motion.button 
           whileHover={{ scale: 1.1 }}
           whileTap={{ scale: 0.9 }}
           className="w-12 h-12 bg-white/5 backdrop-blur-lg border border-white/10 rounded-full flex items-center justify-center text-white"
           onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
         >
           <ChevronUp className="w-6 h-6" />
         </motion.button>
      </div>
    </div>
  );
};
