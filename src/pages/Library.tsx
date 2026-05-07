import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Bookmark, Clock, Zap, Award, Search, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { workService, Work } from '../lib/workService';
import { Link, useNavigate } from 'react-router-dom';
import { WorkCardSkeleton } from '../components/Skeleton';

export function Library() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reading' | 'favorites' | 'finished'>('reading');

  useEffect(() => {
    if (!user) return;
    fetchLibrary();
  }, [user]);

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      // Conceptually, we'd fetch specific IDs from user's favorites/history
      // For now, let's fetch popular works to show SOMETHING in the library
      const all = await workService.getPopularWorks();
      setWorks(all);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-gray-500" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold">Votre Bibliothèque</h2>
          <p className="text-gray-500">Connectez-vous pour voir vos favoris et votre historique.</p>
        </div>
        <button onClick={() => navigate('/login')} className="px-8 py-3 bg-brand-gold text-brand-black font-black rounded-xl">
          CONNEXION
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter">Votre <span className="gradient-text">Bibliothèque</span></h1>
          <p className="text-gray-500 font-medium">Gérez vos lectures en cours et vos coups de cœur.</p>
        </div>
        <div className="flex gap-4 border-b border-white/10">
          {(['reading', 'favorites', 'finished'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                activeTab === tab ? 'text-brand-gold' : 'text-gray-600 hover:text-white'
              }`}
            >
              {tab === 'reading' ? 'En cours' : tab === 'favorites' ? 'Favoris' : 'Terminés'}
              {activeTab === tab && (
                <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-gold" />
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
           {Array(5).fill(0).map((_, i) => <WorkCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {works.map((work) => (
            <motion.div
              key={work.id}
              whileHover={{ y: -10 }}
              className="group flex flex-col gap-3 cursor-pointer"
              onClick={() => navigate(`/work/${work.id}`)}
            >
              <div className="aspect-[3/4] rounded-2xl overflow-hidden glass-card relative shadow-xl">
                 <div className="absolute top-3 left-3 z-10">
                    <div className="bg-brand-black/60 backdrop-blur-md px-2 py-1 rounded text-[8px] font-black border border-white/10 uppercase tracking-widest text-white">
                      CH. 12/24
                    </div>
                 </div>
                 {work.coverURL ? (
                   <img src={work.coverURL} alt={work.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                 ) : (
                   <div className="w-full h-full bg-brand-brown" />
                 )}
                 <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-brand-black via-brand-black/40 to-transparent flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                    <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full h-1 overflow-hidden mb-3">
                       <div className="bg-brand-gold h-full w-1/2" />
                    </div>
                    <button className="w-full py-2 bg-white text-brand-black text-[10px] font-black uppercase tracking-widest rounded-lg">
                      REPRENDRE
                    </button>
                 </div>
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold leading-tight line-clamp-1">{work.title}</h4>
                <p className="text-xs text-gray-500">{work.author}</p>
                <div className="flex items-center gap-3 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                   <Clock className="w-3 h-3" /> Lu il y a 2j
                </div>
              </div>
            </motion.div>
          ))}
          
          <Link to="/explore" className="aspect-[3/4] rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center p-6 space-y-4 hover:border-brand-gold/30 hover:bg-white/5 transition-all group">
             <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Search className="w-6 h-6 text-gray-600" />
             </div>
             <div>
                <p className="text-xs font-black uppercase tracking-widest">Ajouter</p>
                <p className="text-[10px] text-gray-600 font-bold">Trouvez votre prochaine obsession</p>
             </div>
          </Link>
        </div>
      )}
    </div>
  );
}
