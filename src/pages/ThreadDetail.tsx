import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, User, Clock, ChevronRight, Hash, Send, Flag, ThumbsUp, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { forumService, Thread, Reply } from '../lib/forumService';
import { Skeleton } from '../components/Skeleton';

export function ThreadDetail() {
  const { threadId } = useParams();
  const { user, profile } = useAuth();
  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (threadId) {
      fetchThreadData();
    }
  }, [threadId]);

  const fetchThreadData = async () => {
    if (!threadId) return;
    try {
      setLoading(true);
      const t = await forumService.getThread(threadId);
      if (t) {
        setThread(t);
        const rs = await forumService.getReplies(threadId);
        setReplies(rs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !threadId || !replyText) return;
    try {
      await forumService.addReply(threadId, {
        authorId: user.uid,
        authorName: profile?.displayName || 'Anonyme',
        content: replyText
      });
      setReplyText('');
      const rs = await forumService.getReplies(threadId);
      setReplies(rs);
      if (thread) setThread({ ...thread, repliesCount: thread.repliesCount + 1 });
    } catch (err) {
      console.error(err);
    }
  };

  const categoryName = thread?.categoryId === 'webtoons' ? 'Webtoons & BD' : 
                      thread?.categoryId === 'artists' ? 'Espace Artistes' : 
                      thread?.categoryId === 'theories' ? 'Théories & Lore' : 'Général';

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
        <Link to="/forum" className="hover:text-brand-gold transition-colors">Forums</Link>
        <ChevronRight className="w-3 h-3" />
        {loading ? (
          <Skeleton variant="text" className="w-24 h-3" />
        ) : (
          <Link to={`/forum/category/${thread?.categoryId}`} className="hover:text-brand-gold transition-colors">{categoryName}</Link>
        )}
        <ChevronRight className="w-3 h-3" />
        <Skeleton variant="text" className={`w-32 h-3 ${!loading && 'hidden'}`} />
        {!loading && <span className="text-white truncate">Discussion #{threadId?.slice(0, 8)}</span>}
      </div>

      {/* Main Post */}
      {loading ? (
        <div className="glass-card p-8 space-y-6 border border-white/10">
          <div className="flex items-center gap-4">
            <Skeleton variant="circle" className="w-12 h-12" />
            <div className="space-y-2">
              <Skeleton variant="text" className="w-32" />
              <Skeleton variant="text" className="w-24 h-3" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton variant="text" className="w-3/4 h-8" />
            <Skeleton variant="text" className="w-full h-24" />
          </div>
        </div>
      ) : !thread ? (
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
          <AlertCircle className="w-16 h-16 text-gray-700" />
          <h2 className="text-xl font-bold uppercase tracking-widest text-gray-500">Discussion Introuvable</h2>
          <Link to="/forum" className="text-brand-gold font-black uppercase text-xs hover:underline">Retour au forum</Link>
        </div>
      ) : (
        <div className="glass-card p-8 space-y-6 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
             <Hash className="w-24 h-24" />
          </div>
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-brown/40 flex items-center justify-center font-display font-black text-brand-gold">
                  {thread.authorName?.[0]}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{thread.authorName}</h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Publié le {thread.createdAt instanceof Date ? thread.createdAt.toLocaleDateString() : 'il y a peu'}</p>
                </div>
             </div>
             <button className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 hover:text-brand-red transition-colors">
                <Flag className="w-3 h-3" /> Signaler
             </button>
          </div>
          
          <div className="space-y-4 relative z-10">
            <h1 className="text-2xl md:text-3xl font-display font-black uppercase leading-tight">{thread.title}</h1>
            <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
              {thread.content}
            </p>
          </div>

          <div className="flex items-center gap-6 pt-6 border-t border-white/5">
             <button className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-brand-gold transition-colors">
                <ThumbsUp className="w-4 h-4" /> {thread.views} Vues
             </button>
             <button className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-brand-gold transition-colors">
                <MessageSquare className="w-4 h-4" /> {thread.repliesCount} Réponses
             </button>
          </div>
        </div>
      )}

      {/* Replies List */}
      <div className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-brand-gold border-b border-brand-gold/20 pb-2">Réponses</h3>
        
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="p-6 rounded-2xl border border-white/5 flex gap-6 items-start">
              <Skeleton variant="circle" className="w-10 h-10 flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton variant="text" className="w-32" />
                <Skeleton variant="text" className="w-full h-12" />
              </div>
            </div>
          ))
        ) : replies.length > 0 ? (
          replies.map((r, i) => (
            <motion.div 
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-2xl border border-white/5 bg-white/2 flex gap-6 items-start`}
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                {r.authorName?.[0]}
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-center">
                   <h4 className="font-bold text-sm">{r.authorName}</h4>
                   <span className="text-[8px] text-gray-600 font-black uppercase italic">{r.createdAt instanceof Date ? r.createdAt.toLocaleDateString() : ''}</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                  {r.content}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center opacity-30 italic font-black uppercase tracking-widest text-xs">
            Soyez le premier à répondre !
          </div>
        )}
      </div>

      {/* Quick Reply Form */}
      <form onSubmit={handleReply} className="sticky bottom-6 left-0 right-0 z-40 bg-brand-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4">
        {user ? (
          <>
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-brand-gold flex-shrink-0">
              {profile?.displayName?.[0] || 'U'}
            </div>
            <input 
              type="text" 
              placeholder="Écrire une réponse..." 
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-gray-600"
              required
            />
            <button type="submit" className="bg-brand-gold text-brand-black w-10 h-10 rounded-xl flex items-center justify-center hover:scale-105 transition-transform">
               <Send className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="w-full flex items-center justify-center gap-4 py-2">
             <AlertCircle className="w-4 h-4 text-brand-gold" />
             <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Connectez-vous pour participer à la discussion</p>
             <Link to="/login" className="text-brand-gold text-xs font-black uppercase hover:underline">Connexion</Link>
          </div>
        )}
      </form>
    </div>
  );
}
