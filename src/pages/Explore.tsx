import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, BookOpen, Clock, Zap, Award, ChevronDown } from 'lucide-react';
import { workService, Work } from '../lib/workService';
import { Link } from 'react-router-dom';
import { WorkCardSkeleton } from '../components/Skeleton';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function Explore() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState('Tous');
  const [activeFormat, setActiveFormat] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const genres = ['Tous', 'Fantaisie', 'Action', 'Sci-Fi', 'Romance', 'Mystère', 'Slice of Life', 'Historique'];
  const formats = ['Tous', 'WEBTOON', 'BD', 'ROMAN'];

  useEffect(() => {
    // REAL-TIME: Subscribe to all works
    const q = query(collection(db, 'works'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const worksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Work[];
      setWorks(worksData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredWorks = works.filter(work => {
    const matchesGenre = activeGenre === 'Tous' || work.category.includes(activeGenre);
    const matchesFormat = activeFormat === 'Tous' || work.type === activeFormat;
    const matchesSearch = work.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         work.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesFormat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-12">
      {/* Header Section */}
      <section className="space-y-6">
        <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter">
          Explorer le <span className="gradient-text">AfriStory</span>
        </h1>
        <p className="text-gray-400 max-w-2xl text-lg font-medium">
          Découvrez les meilleures histoires du continent. Des talents émergents du Draft aux icônes du Pro.
        </p>
      </section>

      {/* Promotional Banner */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="relative h-64 md:h-80 rounded-[2.5rem] overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-r from-brand-black via-brand-black/60 to-transparent z-10" />
          <img src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80" alt="Draft Banner" className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000" />
          <div className="relative z-20 h-full flex flex-col justify-center p-12 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 bg-brand-gold/20 border border-brand-gold/30 px-3 py-1 rounded-full text-brand-gold text-[10px] font-black uppercase tracking-widest w-fit">
              AfriStory Draft
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter leading-none">Soutenez les <span className="text-brand-gold">Talents</span> de demain</h2>
            <p className="text-gray-300 text-sm font-medium">Les créateurs amateurs ont besoin de vos retours. Lisez, likez et commentez pour les aider à atteindre le statut Pro.</p>
            <button className="bg-white text-brand-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest w-fit hover:bg-brand-gold transition-colors shadow-2xl">Explorer le Draft</button>
          </div>
        </div>
      </section>

      {/* Filters & Search bar */}
      <section className="sticky top-16 z-30 py-4 -mx-6 px-6 bg-brand-black/80 backdrop-blur-md border-y border-white/5">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Rechercher une oeuvre, un auteur..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-brand-gold/50 transition-all text-sm"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto invisible-scrollbar">
            {genres.slice(0, 5).map(genre => (
              <button
                key={genre}
                onClick={() => setActiveGenre(genre)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeGenre === genre ? 'bg-brand-gold text-brand-black' : 'bg-white/5 text-gray-500 hover:text-white'
                }`}
              >
                {genre}
              </button>
            ))}
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="px-4 py-2 bg-white/5 text-gray-400 rounded-full flex items-center gap-2 hover:text-white transition-all border border-white/10"
            >
              <Filter className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">Plus</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-brand-brown/5 mt-4 rounded-2xl border border-white/5 p-6 space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-gold">Format</h4>
                  <div className="flex flex-wrap gap-2">
                    {formats.map(f => (
                      <button
                        key={f}
                        onClick={() => setActiveFormat(f)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                          activeFormat === f ? 'bg-white text-brand-black' : 'bg-white/5 text-gray-400'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-gold">Tous les genres</h4>
                  <div className="flex flex-wrap gap-2">
                    {genres.map(g => (
                      <button
                        key={g}
                        onClick={() => setActiveGenre(g)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeGenre === g ? 'bg-white text-brand-black' : 'bg-white/5 text-gray-400'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Results Grid */}
      <section className="min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array(10).fill(0).map((_, i) => <WorkCardSkeleton key={i} />)}
          </div>
        ) : filteredWorks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {filteredWorks.map((work) => (
              <motion.div
                key={work.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -10 }}
                className="group cursor-pointer flex flex-col gap-3"
              >
                <Link to={`/work/${work.id}`} className="block">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden glass-card relative shadow-xl">
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                      <div className="bg-brand-black/60 backdrop-blur-md px-2 py-1 rounded text-[8px] font-black border border-white/10 uppercase tracking-widest leading-none w-fit">
                        {work.type}
                      </div>
                      {!work.isPro && (
                        <div className="bg-brand-green/80 backdrop-blur-md px-2 py-1 rounded text-[8px] font-black border border-brand-green/20 uppercase tracking-widest leading-none w-fit text-white">
                          DRAFT
                        </div>
                      )}
                    </div>
                    {work.isPro && (
                      <div className="absolute top-3 right-3 z-10">
                        <Award className="w-5 h-5 text-brand-gold drop-shadow-lg" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-brand-black via-brand-black/40 to-transparent flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                      <button className="w-full py-2.5 bg-white text-brand-black text-[10px] font-black uppercase tracking-widest rounded-lg">
                        Lire Maintenant
                      </button>
                    </div>
                    {work.coverURL ? (
                      <img src={work.coverURL} alt={work.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full bg-brand-brown/40 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-white/10" />
                      </div>
                    )}
                  </div>
                </Link>
                <div className="space-y-1">
                  <h4 className="font-display font-bold leading-tight group-hover:text-brand-gold transition-colors truncate">
                    {work.title}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-1">{work.author}</p>
                  <div className="flex items-center gap-3 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-brand-gold" /> {work.views}</span>
                    <span className="w-1 h-1 bg-gray-700 rounded-full" />
                    <span className="text-brand-gold">{work.category}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-8 h-8 text-gray-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-display font-bold">Aucun résultat</h3>
              <p className="text-gray-500">Essayez avec d'autres filtres ou une autre recherche.</p>
            </div>
            <button 
              onClick={() => { setActiveGenre('Tous'); setActiveFormat('Tous'); setSearchQuery(''); }}
              className="text-xs font-black uppercase text-brand-gold hover:underline mt-4"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </section>

      {/* Featured Creators Section */}
      <section className="pt-12 border-t border-white/5 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold">Artistes Pro en vedette</h2>
          <Link to="/rankings" className="text-brand-gold text-[10px] font-black uppercase tracking-widest hover:underline">
            Voir le classement complet
          </Link>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-8 invisible-scrollbar">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 w-48 text-center space-y-3"
            >
              <div className="w-24 h-24 rounded-full bg-brand-brown/40 border-2 border-brand-gold/30 mx-auto overflow-hidden">
                {/* Artist avatar */}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm">Artiste #{i}</h4>
                <div className="flex items-center justify-center gap-1 text-[8px] font-black text-brand-gold uppercase tracking-[0.2em]">
                  <Award className="w-3 h-3" /> Certifié
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
