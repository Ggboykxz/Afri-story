import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, Grid, Clock, ChevronDown, Check, Star, Heart, Eye } from 'lucide-react';
import { Layout } from '@/components/Layout/Layout';
import { Skeleton, WorkCardSkeleton } from '@/components/common/Skeleton';
import { workService } from '@/lib/workService';
import { Work } from '@/lib/types';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Link } from 'react-router-dom';

const GENRES = [
  'Tous', 'Action', 'Romance', 'Fantasy', 'Drame', 'Comédie', 'Horreur', 'Tranche de vie', 'Sci-Fi'
];

const SORT_OPTIONS = [
  { label: 'Plus récents', value: 'createdAt' },
  { label: 'Plus populaires', value: 'views' },
  { label: 'Mieux notés', value: 'ratings.average' },
  { label: 'Plus aimés', value: 'likes' }
];

const WorkCard = ({ work }: { work: Work }) => {
  return (
    <Link to={`/work/${work.id}`} className="group space-y-3">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/5">
        <img
          src={work.coverUrl || work.coverURL || 'https://placehold.co/400x600'}
          alt={work.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {work.isPremium && (
          <div className="absolute top-2 right-2 bg-brand-gold text-brand-black text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-lg">
            Premium
          </div>
        )}
      </div>

      <div>
        <h3 className="font-display font-black text-sm uppercase tracking-tight line-clamp-1 group-hover:text-brand-gold transition-colors">
          {work.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-1">{work.authorName || work.author}</p>

        <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{work.views || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-brand-gold fill-brand-gold" />
            <span>{work.ratings?.average || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const Explore = () => {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Tous');
  const [sortBy, setSortBy] = useState('createdAt');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'works'), orderBy(sortBy, 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const worksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Work[];
      setWorks(worksData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sortBy]);

  const filteredWorks = works.filter(work => {
    const matchesSearch = work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (work.authorName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'Tous' || (work.tags && work.tags.includes(selectedGenre)) || (work.genre === selectedGenre) || (work.category === selectedGenre);
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="min-h-screen bg-brand-black pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-display font-black uppercase tracking-tighter mb-2">
              Explorer
            </h1>
            <p className="text-gray-500">Découvrez les meilleures œuvres panafricaines</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher une œuvre, un auteur..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-brand-gold/50 transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-2xl border transition-all ${showFilters ? 'bg-brand-gold border-brand-gold text-brand-black' : 'bg-white/5 border-white/10 text-white'}`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Genres */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <Filter className="w-3 h-3" /> Genres
                </h3>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map(genre => (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedGenre === genre ? 'bg-brand-gold text-brand-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sorting */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Trier par
                </h3>
                <div className="space-y-2">
                  {SORT_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${sortBy === option.value ? 'bg-white/10 text-brand-gold' : 'text-gray-400 hover:bg-white/5'}`}
                    >
                      {option.label}
                      {sortBy === option.value && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {Array(12).fill(0).map((_, i) => (
              <WorkCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredWorks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
            {filteredWorks.map(work => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Aucun résultat</h3>
            <p className="text-gray-500">Essayez de modifier vos filtres ou votre recherche</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;