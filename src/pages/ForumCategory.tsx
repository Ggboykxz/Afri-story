import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Plus, Search, Filter, Hash, User, Clock, ChevronRight, Bookmark, Loader2 } from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { forumService, Thread } from '../lib/forumService';
import { ForumThreadSkeleton } from '../components/Skeleton';

export function ForumCategory() {
  const { categoryId } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('new');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const categoryName = categoryId === 'webtoons' ? 'Webtoons & BD' : 
                      categoryId === 'artists' ? 'Espace Artistes' : 
                      categoryId === 'theories' ? 'Théories & Lore' : 'Général';

  useEffect(() => {
    fetchThreads();
  }, [categoryId, activeFilter]);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const data = await forumService.getThreads(categoryId);
      setThreads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !categoryId) return;
    try {
      await forumService.createThread({
        categoryId,
        authorId: user.uid,
        authorName: profile?.displayName || 'Anonyme',
        title: newTitle,
        content: newContent
      });
      setNewTitle('');
      setNewContent('');
      setShowCreateForm(false);
      fetchThreads();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
        <Link to="/forum" className="hover:text-brand-gold transition-colors">Forums</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-white">{categoryName}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter">{categoryName}</h1>
          <p className="text-gray-500 font-medium">Discutez, partagez et découvrez autour de ce thème.</p>
        </div>
        <button 
          onClick={() => user ? setShowCreateForm(true) : navigate('/login')}
          className="bg-brand-gold text-brand-black text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform w-fit"
        >
          <Plus className="w-4 h-4" /> Créer un sujet
        </button>
      </div>

      {showCreateForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 border-brand-gold/30 space-y-6">
           <h3 className="text-xl font-display font-black uppercase">Nouveau Sujet</h3>
           <form onSubmit={handleCreateThread} className="space-y-4">
              <input 
                type="text" 
                placeholder="Titre accrocheur..." 
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-gold/50"
                required
              />
              <textarea 
                placeholder="Détaillez votre pensée..." 
                rows={4}
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-gold/50"
                required
              />
              <div className="flex gap-4">
                 <button type="button" onClick={() => setShowCreateForm(false)} className="px-6 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400">Annuler</button>
                 <button type="submit" className="px-6 py-2 bg-brand-gold text-brand-black rounded-xl text-[10px] font-black uppercase tracking-widest">Publier</button>
              </div>
           </form>
        </motion.div>
      )}

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
           {/* Thread List */}
           <div className="space-y-4">
             {loading ? (
               Array(6).fill(0).map((_, i) => <ForumThreadSkeleton key={i} />)
             ) : threads.length > 0 ? (
               threads.map(thread => (
                <Link key={thread.id} to={`/forum/thread/${thread.id}`}>
                  <motion.div 
                    whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.03)' }}
                    className={`p-6 rounded-2xl border transition-all flex gap-6 items-center bg-transparent border-white/5`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                       <Hash className="w-5 h-5 text-gray-600" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <h3 className="font-bold text-lg leading-tight group-hover:text-brand-gold">
                        {thread.title}
                      </h3>
                      <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {thread.authorName}</span>
                        <span className="w-1 h-1 bg-gray-700 rounded-full" />
                        <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {thread.createdAt instanceof Date ? thread.createdAt.toLocaleDateString() : 'Récemment'}</span>
                      </div>
                    </div>

                    <div className="text-center w-20">
                       <div className="text-xl font-display font-black">{thread.repliesCount}</div>
                       <div className="text-[8px] font-black uppercase text-gray-600 tracking-widest">Réponses</div>
                    </div>
                  </motion.div>
                </Link>
              ))
             ) : (
               <div className="py-24 text-center glass-card border-white/5 opacity-50 font-black uppercase tracking-widest text-[10px]">
                 Aucune discussion pour le moment. Soyez le premier !
               </div>
             )}
           </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 space-y-8">
           <div className="glass-card p-8 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-gold">A propos</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-bold uppercase tracking-tighter">
                Cet espace est dédié aux {categoryName}. Assurez-vous de lire les règles avant de participer.
              </p>
           </div>
        </aside>
      </div>
    </div>
  );
}
