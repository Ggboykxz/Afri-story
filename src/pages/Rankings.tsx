import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Award, Zap, Heart, Eye, Loader2, ChevronRight } from 'lucide-react';
import { workService, Work } from '../lib/workService';
import { Link } from 'react-router-dom';
import { Skeleton } from '../components/Skeleton';

export function Rankings() {
  const [activeType, setActiveType] = useState('PRO');
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, [activeType]);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      // Fetching all works and sorting by views for rankings
      const data = await workService.getWorks() as any[];
      if (!data) return;
      
      const filtered = data
        .filter(w => activeType === 'ALL' || (activeType === 'PRO' ? w.isPro : !w.isPro))
        .sort((a, b) => (b.views || 0) - (a.views || 0));
      setWorks(filtered as Work[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <header className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter">
          Top <span className="gradient-text">Classements</span>
        </h1>
        <p className="text-gray-400 max-w-2xl text-lg font-medium">
          Les œuvres les plus populaires et les plus suivies du continent.
        </p>
      </header>

      <div className="flex gap-4 border-b border-white/5 pb-6">
        {['PRO', 'DRAFT', 'ALL'].map(type => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              activeType === type ? 'bg-brand-gold text-brand-black' : 'bg-white/5 text-gray-500 hover:text-white'
            }`}
          >
            {type === 'PRO' ? 'Séries Pro' : type === 'DRAFT' ? 'Draft Oasis' : 'Tout'}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="grid gap-4">
            {Array(10).fill(0).map((_, i) => (
              <div key={i} className="glass-card p-6 flex items-center gap-6">
                <Skeleton className="w-12 h-12" />
                <Skeleton className="w-16 h-20 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" className="w-48 h-6" />
                  <Skeleton variant="text" className="w-24 h-3" />
                </div>
                <div className="hidden md:flex gap-8 px-8">
                   <Skeleton className="w-12 h-8" />
                   <Skeleton className="w-12 h-8" />
                </div>
              </div>
            ))}
          </div>
        ) : works.length > 0 ? (
          <div className="grid gap-4">
            {works.slice(0, 10).map((work, index) => (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/work/${work.id}`} className="glass-card p-6 flex items-center gap-6 group hover:border-brand-gold/30 transition-all">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-black text-2xl ${index < 3 ? 'text-brand-gold' : 'text-gray-600'}`}>
                    {index + 1}
                  </div>
                  
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                    {work.coverURL ? (
                      <img src={work.coverURL} alt={work.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-brand-brown/40" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-black uppercase text-xl group-hover:text-brand-gold transition-colors truncate">
                      {work.title}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">{work.author}</p>
                  </div>

                  <div className="hidden md:flex gap-8 px-8">
                    <div className="text-center">
                      <div className="text-sm font-black flex items-center gap-1.5"><Eye className="w-3 h-3 text-brand-gold" /> {work.views}</div>
                      <div className="text-[8px] font-black uppercase text-gray-600 tracking-widest">Vues</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-black flex items-center gap-1.5"><Heart className="w-3 h-3 text-brand-red" /> {work.likes}</div>
                      <div className="text-[8px] font-black uppercase text-gray-600 tracking-widest">Likes</div>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-brand-gold" />
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center text-gray-500 font-black uppercase tracking-widest">
            Aucune œuvre classée pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
