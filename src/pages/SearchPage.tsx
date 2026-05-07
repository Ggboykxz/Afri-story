import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Search, Loader2, ArrowRight, X } from 'lucide-react';
import { workService, Work } from '../lib/workService';
import { motion } from 'motion/react';
import { EmptyState, LoadingState } from '../components/EmptyState';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, []);

  const handleSearch = async (searchTerm?: string) => {
    const term = searchTerm || query;
    if (!term.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    try {
      const works = await workService.searchWorks(term);
      setResults(works);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query)}`);
    handleSearch();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-display font-black uppercase tracking-tighter">
          Recherche
        </h1>
        <form onSubmit={handleSubmit} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher une œuvre, un auteur..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-14 pr-24 text-lg outline-none focus:border-brand-gold/50 transition-all"
            autoFocus
          />
          {query && (
            <button 
              type="button"
              onClick={() => { setQuery(''); setResults([]); setHasSearched(false); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </form>
      </div>

      {loading ? (
        <LoadingState text="Recherche en cours..." />
      ) : hasSearched ? (
        results.length > 0 ? (
          <div className="space-y-6">
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">
              {results.length} résultat{results.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map(work => (
                <motion.div
                  key={work.id}
                  whileHover={{ y: -5 }}
                >
                  <Link to={`/work/${work.id}`} className="block">
                    <div className="aspect-[3/4] rounded-xl overflow-hidden glass-card shadow-lg">
                      {work.coverURL ? (
                        <img src={work.coverURL} alt={work.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-brand-brown" />
                      )}
                    </div>
                    <h4 className="font-bold text-sm mt-2 line-clamp-1">{work.title}</h4>
                    <p className="text-xs text-gray-500">{work.author}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="Aucun résultat"
            description={`Aucun œuvre trouvée pour "${query}"`}
            actionLabel="Explorer"
            actionHref="/explore"
          />
        )
      ) : (
        <EmptyState
          icon={Search}
          title="Rechercher"
          description="Entrez un titre ou nom d'auteur pour trouver des œuvres"
        />
      )}
    </div>
  );
}