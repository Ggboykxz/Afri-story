import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChefHat, TrendingUp, Sparkles, BookOpen, Search, Loader2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { workService, Work } from '../lib/workService';
import { WorkCardSkeleton, Skeleton } from '../components/Skeleton';

export const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search')?.toLowerCase() || "";
  
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorks = async () => {
      setLoading(true);
      try {
        const popular = await workService.getPopularWorks();
        setWorks(popular);
      } catch (err) {
        console.error("Error fetching works", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorks();
  }, []);

  const filteredWorks = useMemo(() => {
    if (!searchQuery) return works;
    return works.filter(w => 
      w.title.toLowerCase().includes(searchQuery) || 
      w.author.toLowerCase().includes(searchQuery) ||
      w.category.toLowerCase().includes(searchQuery)
    );
  }, [searchQuery, works]);

  return (
    <div className="pb-24">
      {searchQuery && (
        <section className="px-6 md:px-12 pt-12">
           <div className="glass-card p-12 bg-linear-to-r from-brand-gold/10 via-transparent to-transparent">
              <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter">Résultats : <span className="text-brand-gold">{searchQuery}</span></h1>
              <p className="text-gray-400 mt-4 font-bold uppercase tracking-widest">{filteredWorks.length} œuvres trouvées</p>
           </div>
        </section>
      )}

      {/* Hero Section */}
      {!searchQuery && (
        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-b from-brand-gold/10 via-brand-black/70 to-brand-black z-10" />
          <div className="grid grid-cols-4 gap-4 rotate-12 scale-150 opacity-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-brand-brown rounded-xl h-[400px] shadow-2xl" />
            ))}
          </div>
        </div>

        <div className="relative z-20 max-w-4xl text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/20 px-4 py-2 rounded-full text-brand-gold text-sm font-medium"
          >
            <Sparkles className="w-4 h-4" />
            <span>Nouveauté : Découvrez Nexus-Hub Draft</span>
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter leading-[0.9]">
            RACONTÉ PAR <br />
            <span className="gradient-text">L'AFRIQUE</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            La destination ultime pour les webtoons, BD et romans illustrés panafricains. 
            Donnez vie à vos histoires.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-brand-gold text-brand-black font-black rounded-2xl hover:bg-white transition-all transform hover:-translate-y-1 shadow-lg shadow-brand-gold/10">
              COMMENCER À LIRE
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all">
              DEVENIR CRÉATEUR
            </button>
          </div>
        </div>
      </section>
      )}

      {/* Trending & Rankings Section */}
      {!searchQuery && (
        <section className="px-6 md:px-12 mt-24 grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-display font-bold flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-brand-gold" />
                Tendances du moment
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-6 glass-card p-4">
                    <Skeleton className="w-20 h-28 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                       <Skeleton variant="text" className="w-1/3" />
                       <Skeleton variant="text" className="w-full h-6" />
                       <Skeleton variant="text" className="w-2/3" />
                    </div>
                  </div>
                ))
              ) : (
                works.slice(0, 4).map((work, i) => (
                  <TrendingWorkCard key={work.id} work={work} index={i + 1} />
                ))
              )}
            </div>
          </div>

          <div className="glass-card p-8 space-y-8 h-fit">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold">Classement Top 5</h2>
              <Link to="/rankings" className="text-brand-gold text-[10px] font-black uppercase tracking-widest hover:underline">Voir Tout</Link>
            </div>
            <div className="space-y-6">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton variant="text" className="w-6 h-10" />
                    <Skeleton className="w-12 h-16 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton variant="text" className="w-3/4" />
                      <Skeleton variant="text" className="w-1/2" />
                    </div>
                  </div>
                ))
              ) : (
                works.slice(0, 5).map((work, i) => (
                  <div key={work.id} className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/work/${work.id}`)}>
                    <span className="text-4xl font-display font-black text-white/10 group-hover:text-brand-gold transition-colors">{i + 1}</span>
                    <div className="w-12 h-16 bg-brand-brown rounded-lg flex-shrink-0 relative overflow-hidden">
                      {work.coverURL && <img src={work.coverURL} alt={work.title} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm line-clamp-1">{work.title}</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">{work.author}</p>
                    </div>
                    <div className="text-right">
                       <div className="text-xs font-black text-brand-gold">{work.views}</div>
                       <div className="text-[8px] text-gray-600 font-bold uppercase">Vues</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="px-6 md:px-12 space-y-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <TrendingUp className="w-6 h-6 text-brand-gold" />
            <h2 className="text-3xl font-display font-bold">Populaires en ce moment</h2>
          </div>
          <Link to="/explore" className="text-brand-gold text-sm font-bold hover:underline">Voir tout</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {loading ? (
             Array(5).fill(0).map((_, i) => <WorkCardSkeleton key={i} />)
          ) : (
            filteredWorks.filter(w => w.isPro).slice(0, 10).map((work) => (
              <WorkCard key={work.id} work={work} />
            ))
          )}
        </div>
      </section>

      {/* Draft Spotlight */}
      <section className="px-6 md:px-12 mt-24 space-y-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sparkles className="w-6 h-6 text-brand-green" />
            <div>
               <h2 className="text-3xl font-display font-bold">Nexus-Hub <span className="text-brand-green">Draft</span></h2>
               <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Les pépites de demain — Espace communautaire</p>
            </div>
          </div>
          <Link to="/explore?format=Tous&genre=Tous&type=Draft" className="text-brand-green text-sm font-bold hover:underline">Explorer le Draft</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {loading ? (
             Array(5).fill(0).map((_, i) => <WorkCardSkeleton key={i} />)
          ) : (
            filteredWorks.filter(w => !w.isPro).slice(0, 10).map((work) => (
              <WorkCard key={work.id} work={work} />
            ))
          )}
        </div>
      </section>

      {/* Two Poles Section */}
      <section className="px-6 md:px-12 mt-32 grid md:grid-cols-2 gap-8">
        <div className="glass-card p-12 space-y-6 group hover:border-brand-gold/30 transition-all cursor-pointer">
          <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold font-display text-2xl font-bold">PRO</div>
          <h3 className="text-4xl font-display font-bold">Nexus-Hub Pro</h3>
          <p className="text-gray-400">Pour les professionnels. Monétisez vos œuvres, accédez à des statistiques avancées et construisez votre empire médiatique.</p>
          <ul className="space-y-3 text-sm text-gray-500">
            <li>• Part de revenus de 70% à 90%</li>
            <li>• Micro-transactions (Nexus-Coins)</li>
            <li>• Badge Certifié</li>
          </ul>
        </div>
        <div className="glass-card p-12 space-y-6 group hover:border-brand-green/30 transition-all cursor-pointer">
          <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green font-display text-2xl font-bold">DRAFT</div>
          <h3 className="text-4xl font-display font-bold">Nexus-Hub Draft</h3>
          <p className="text-gray-400">L'espace communautaire. Publiez librement, recevez des feedbacks et progressez vers le statut Pro.</p>
          <ul className="space-y-3 text-sm text-gray-500">
            <li>• Publication gratuite et illimitée</li>
            <li>• Ateliers et concours</li>
            <li>• Système de mentorat Pro</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

const TrendingWorkCard = ({ work, index }: { work: any, index: number }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/work/${work.id}`)}
      className="flex items-center gap-6 group cursor-pointer glass-card p-4 hover:border-brand-gold/30 transition-all"
    >
      <div className="w-20 h-28 bg-brand-brown rounded-xl flex-shrink-0 relative overflow-hidden">
         {work.coverURL && <img src={work.coverURL} alt={work.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
         <div className="absolute top-0 right-0 bg-brand-gold text-brand-black text-[10px] font-black px-2 py-0.5">#{index}</div>
      </div>
      <div className="space-y-2">
        <div className="text-[8px] font-black text-brand-gold uppercase tracking-[0.2em]">{work.category}</div>
        <h4 className="font-display font-bold text-lg leading-tight group-hover:text-brand-gold transition-colors">{work.title}</h4>
        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold">
           <span>{work.author}</span>
           <span className="w-1 h-1 bg-gray-700 rounded-full" />
           <span>{work.views} vues</span>
        </div>
      </div>
    </div>
  );
};

const WorkCard = ({ work }: { work: any }) => {
  const navigate = useNavigate();
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      onClick={() => navigate(`/work/${work.id}`)}
      className="group flex flex-col gap-3 cursor-pointer"
    >
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
        <div className="absolute inset-0 bg-linear-to-t from-brand-black via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <button className="w-full py-2 bg-brand-gold text-brand-black text-xs font-black rounded-lg">LIRE MAINTENANT</button>
        </div>
        {work.coverURL ? (
          <img src={work.coverURL} alt={work.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full bg-brand-brown" />
        )}
      </div>
      <div className="space-y-1">
        <h4 className="font-display font-bold leading-tight line-clamp-1">{work.title}</h4>
        <p className="text-xs text-gray-500">{work.author}</p>
        <div className="flex items-center gap-3 text-[10px] text-gray-600 font-bold">
          <span>{work.views} VUES</span>
          <span className="w-1 h-1 bg-gray-700 rounded-full" />
          <span className="text-brand-gold">{work.category}</span>
        </div>
      </div>
    </motion.div>
  );
};
