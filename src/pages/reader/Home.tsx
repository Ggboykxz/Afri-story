import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChefHat, TrendingUp, Sparkles, BookOpen, Search, Loader2, ShieldCheck, Smartphone, Download, Play, Apple, ChevronRight, Bookmark, Clock } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { workService } from "@/lib/workService";
import { Work } from "@/lib/types";
import { WorkCardSkeleton, Skeleton } from '@/components/common/Skeleton';
import { AdCarousel, CarouselItem } from '@/components/carousel/AdCarousel';
import { carouselService } from '@/lib/carouselService';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const GENRES = [
  { id: 'action', name: 'Action', emoji: '⚔️', color: 'from-red-500/20 to-red-900/10' },
  { id: 'romance', name: 'Romance', emoji: '💕', color: 'from-pink-500/20 to-pink-900/10' },
  { id: 'fantasy', name: 'Fantasy', emoji: '🧙', color: 'from-purple-500/20 to-purple-900/10' },
  { id: 'comedy', name: 'Comédie', emoji: '😂', color: 'from-yellow-500/20 to-yellow-900/10' },
  { id: 'drama', name: 'Drame', emoji: '🎭', color: 'from-blue-500/20 to-blue-900/10' },
  { id: 'horror', name: 'Horreur', emoji: '👻', color: 'from-gray-500/20 to-gray-900/10' },
  { id: 'scifi', name: 'Sci-Fi', emoji: '🚀', color: 'from-cyan-500/20 to-cyan-900/10' },
  { id: 'slice-of-life', name: 'Tranche de vie', emoji: '☀️', color: 'from-green-500/20 to-green-900/10' },
  { id: 'adventure', name: 'Aventure', emoji: '🗺️', color: 'from-amber-500/20 to-amber-900/10' },
  { id: 'mystery', name: 'Mystère', emoji: '🔍', color: 'from-indigo-500/20 to-indigo-900/10' },
  { id: 'sport', name: 'Sport', emoji: '⚽', color: 'from-emerald-500/20 to-emerald-900/10' },
  { id: 'historical', name: 'Historique', emoji: '📜', color: 'from-orange-500/20 to-orange-900/10' },
];

export const Home = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search')?.toLowerCase() || "";
  
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [carouselLoading, setCarouselLoading] = useState(true);
  const [readingHistory, setReadingHistory] = useState<any[]>([]);
  const [recommendedWorks, setRecommendedWorks] = useState<Work[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'works'), orderBy('views', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const worksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Work[];
      setWorks(worksData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadCarouselData = async () => {
      setCarouselLoading(true);
      try {
        const [featuredContent, topWorks] = await Promise.all([
          carouselService.getFeaturedContent({ maxItems: 5 }),
          carouselService.getTopWorksForCarousel(3),
        ]);
        const allItems = [...featuredContent, ...topWorks];
        if (allItems.length > 0) {
          setCarouselItems(carouselService.transformToCarouselItems(allItems));
        } else {
          setCarouselItems([]);
        }
      } catch (error) {
        console.error('Error loading carousel:', error);
        setCarouselItems([]);
      } finally {
        setCarouselLoading(false);
      }
    };
    loadCarouselData();
  }, []);

  useEffect(() => {
    if (user && profile) {
      fetchReadingHistory();
    }
  }, [user, profile]);

  const fetchReadingHistory = async () => {
    if (!user) return;
    try {
      const historyRef = collection(db, 'users', user.uid, 'reading_history');
      const q = query(historyRef, orderBy('lastReadAt', 'desc'));
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const history = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const workPromises = history.slice(0, 4).map(async (h: any) => {
          const workDoc = await getDoc(doc(db, 'works', h.workId));
          if (workDoc.exists()) {
            return { id: workDoc.id, ...workDoc.data(), chapterId: h.chapterId, chapterNumber: h.chapterNumber };
          }
          return null;
        });
        const works = (await Promise.all(workPromises)).filter(Boolean);
        setReadingHistory(works);
      });
      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching reading history:', error);
    }
  };

  useEffect(() => {
    if (works.length > 0) {
      const readIds = readingHistory.map((w: any) => w.id);
      const unread = works.filter(w => !readIds.includes(w.id));
      if (readingHistory.length > 0) {
        const lastRead = readingHistory[0];
        const genre = lastRead?.category;
        const similar = unread.filter(w => w.category === genre || w.authorId === lastRead?.authorId);
        setRecommendedWorks(similar.length > 0 ? similar.slice(0, 8) : unread.slice(0, 8));
      } else {
        setRecommendedWorks(unread.slice(0, 8));
      }
    }
  }, [works, readingHistory]);

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
      {!searchQuery && !user && (
        <section className="relative min-h-[80vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden px-4 md:px-6 pt-12 pb-20 md:pb-24">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-b from-brand-gold/20 via-brand-black/80 to-brand-black z-10" />
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [12, 10, 12] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="hidden md:grid grid-cols-4 gap-4 rotate-12 scale-150 opacity-10"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-brand-brown rounded-2xl h-[500px] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-t from-brand-black to-transparent opacity-60" />
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative z-20 max-w-5xl text-center space-y-6 md:space-y-10">
            <div className="flex flex-col items-center gap-4 md:gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-3 bg-brand-gold/10 border border-brand-gold/20 px-4 md:px-5 py-2 md:py-2.5 rounded-full text-brand-gold text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
              <Sparkles className="w-3 md:w-4 h-3 md:h-4" />
              <span>Nouveauté : AfriStory Draft</span>
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-display font-black tracking-tighter leading-[0.9]">
              L'HISTOIRE <br />
              <span className="gradient-text">IMMERSIVE</span>
            </motion.h1>
            
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-sm md:text-base lg:text-lg text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed px-4">
              La destination ultime pour les webtoons, BD et romans illustrés panafricains. 
              Découvrez des récits authentiques portés par une nouvelle génération de créateurs.
            </motion.p>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
            <button onClick={() => navigate('/explore')} className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-brand-gold text-brand-black font-black rounded-xl md:rounded-2xl hover:bg-white transition-all transform hover:-translate-y-1 shadow-2xl shadow-brand-gold/20 uppercase tracking-widest text-[10px] md:text-xs">
              COMMENCER À LIRE
            </button>
            <button onClick={() => navigate('/become-pro')} className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-white/5 border border-white/10 text-white font-black rounded-xl md:rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-[10px] md:text-xs">
              DEVENIR CRÉATEUR
            </button>
          </motion.div>
        </div>
      </section>
      )}

      {/* Continue Reading (for logged-in users) */}
      {!searchQuery && user && readingHistory.length > 0 && (
        <section className="px-4 md:px-12 mt-8 md:mt-12 space-y-6 md:space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Bookmark className="w-5 md:w-6 h-5 md:h-6 text-brand-gold" />
              <h2 className="text-xl md:text-2xl lg:text-3xl font-display font-bold">Reprendre la lecture</h2>
            </div>
            <Link to="/library" className="text-brand-gold text-xs md:text-sm font-bold hover:underline">Ma bibliothèque</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {readingHistory.map((work: any) => (
              <Link key={work.id} to={`/read/${work.id}/${work.chapterId || ''}`} className="group">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden glass-card relative shadow-xl mb-3">
                  {work.coverURL ? (
                    <img src={work.coverURL} alt={work.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-brand-brown" />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-brand-black via-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-gold rounded-full" style={{ width: `${Math.random() * 80 + 20}%` }} />
                    </div>
                  </div>
                </div>
                <h4 className="font-display font-bold text-sm line-clamp-1 group-hover:text-brand-gold transition-colors">{work.title}</h4>
                <p className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Chapitre {work.chapterNumber || '?'}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Promotional Carousel */}
      {!searchQuery && !carouselLoading && carouselItems.length > 0 && (
        <section className="px-4 md:px-12 mb-12 md:mb-24">
          <AdCarousel items={carouselItems} autoPlay={true} autoPlayInterval={6000} aspectRatio="video" variant="featured" />
        </section>
      )}

      {/* Trending & Rankings Section */}
      {!searchQuery && (
        <section className="px-4 md:px-12 mt-16 md:mt-24 grid lg:grid-cols-3 gap-8 md:gap-12">
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-display font-bold flex items-center gap-3">
                <TrendingUp className="w-5 md:w-6 h-5 md:h-6 text-brand-gold" />
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

          <div className="glass-card p-4 md:p-8 space-y-6 md:space-y-8 h-fit">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl lg:text-2xl font-display font-bold">Classement Top 5</h2>
              <Link to="/rankings" className="text-brand-gold text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:underline">Voir Tout</Link>
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
      <section className="px-4 md:px-12 space-y-8 md:space-y-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <TrendingUp className="w-5 md:w-6 h-5 md:h-6 text-brand-gold" />
            <h2 className="text-xl md:text-2xl lg:text-3xl font-display font-bold">Populaires en ce moment</h2>
          </div>
          <Link to="/explore" className="text-brand-gold text-xs md:text-sm font-bold hover:underline">Voir tout</Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {loading ? (
             Array(5).fill(0).map((_, i) => <WorkCardSkeleton key={i} />)
          ) : (
            filteredWorks.filter(w => w.isPro).slice(0, 10).map((work) => (
              <WorkCard key={work.id} work={work} />
            ))
          )}
        </div>
      </section>

      {/* Genre Discovery */}
      {!searchQuery && (
        <section className="px-4 md:px-12 mt-16 md:mt-24 space-y-6 md:space-y-8">
          <div className="flex items-center gap-4">
            <Sparkles className="w-5 md:w-6 h-5 md:h-6 text-brand-gold" />
            <h2 className="text-xl md:text-2xl lg:text-3xl font-display font-bold">Explorer par genre</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
            {GENRES.map(genre => (
              <Link
                key={genre.id}
                to={`/explore?genre=${genre.name}`}
                className={`group glass-card p-4 md:p-6 rounded-xl md:rounded-2xl bg-linear-to-br ${genre.color} border-white/5 hover:border-brand-gold/30 transition-all text-center`}
              >
                <div className="text-2xl md:text-3xl mb-2 group-hover:scale-110 transition-transform">{genre.emoji}</div>
                <div className="text-[10px] md:text-xs font-black uppercase tracking-wider group-hover:text-brand-gold transition-colors">{genre.name}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recommendations (for logged-in users) */}
      {!searchQuery && user && recommendedWorks.length > 0 && (
        <section className="px-4 md:px-12 mt-16 md:mt-24 space-y-6 md:space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Sparkles className="w-5 md:w-6 h-5 md:h-6 text-brand-green" />
              <div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-display font-bold">Recommandé pour vous</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Basé sur vos lectures</p>
              </div>
            </div>
            <Link to="/explore" className="text-brand-green text-xs md:text-sm font-bold hover:underline">Découvrir plus</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {recommendedWorks.slice(0, 10).map(work => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        </section>
      )}

      {/* Promotional Banner 2 */}
      {!searchQuery && (
        <section className="px-4 md:px-12 mt-16 md:mt-32">
          <div className="bg-brand-brown rounded-2xl md:rounded-[3rem] p-6 md:p-12 lg:p-20 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 md:gap-12 border border-white/5 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-brand-gold/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="w-24 h-24 md:w-32 md:h-32 lg:w-56 lg:h-56 bg-brand-black rounded-2xl md:rounded-[2.5rem] flex items-center justify-center flex-shrink-0 shadow-2xl relative z-10">
               <ShieldCheck className="w-10 md:w-16 md:w-24 lg:w-24 h-10 md:h-16 md:h-24 lg:h-24 text-brand-gold opacity-40" />
            </div>
            <div className="flex-1 space-y-4 md:space-y-6 relative z-10 text-center md:text-left">
              <h2 className="text-2xl md:text-4xl lg:text-6xl font-display font-black uppercase tracking-tighter leading-none">Protection <br /> des <span className="text-brand-gold">Droits d'Auteurs</span></h2>
              <p className="text-gray-400 font-medium max-w-xl text-sm md:text-base">Chaque œuvre publiée sur AfriStory bénéficie d'un horodatage numérique certifiant votre propriété intellectuelle dès la mise en ligne.</p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center md:justify-start">
                 <button className="px-6 md:px-8 py-2.5 md:py-3 bg-white text-brand-black font-black rounded-xl text-[10px] md:text-xs uppercase tracking-widest hover:bg-brand-gold transition-all duration-300">En savoir plus</button>
                 <button className="px-6 md:px-8 py-2.5 md:py-3 bg-white/5 border border-white/10 text-white font-black rounded-xl text-[10px] md:text-xs uppercase tracking-widest hover:bg-white/10 transition-all duration-300">Consulter la charte</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Draft Spotlight */}
      <section className="px-4 md:px-12 mt-16 md:mt-24 space-y-8 md:space-y-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sparkles className="w-5 md:w-6 h-5 md:h-6 text-brand-green" />
            <div>
               <h2 className="text-xl md:text-2xl lg:text-3xl font-display font-bold">AfriStory <span className="text-brand-green">Draft</span></h2>
               <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest">Les pépites de demain — Espace communautaire</p>
            </div>
          </div>
          <Link to="/explore?format=Tous&genre=Tous&type=Draft" className="text-brand-green text-xs md:text-sm font-bold hover:underline">Explorer le Draft</Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
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
      <section className="px-4 md:px-12 mt-16 md:mt-32 grid md:grid-cols-2 gap-6 md:gap-8">
        <div className="glass-card p-6 md:p-12 space-y-4 md:space-y-6 group hover:border-brand-gold/30 transition-all cursor-pointer">
          <div className="w-12 md:w-16 h-12 md:h-16 bg-brand-gold/10 rounded-xl md:rounded-2xl flex items-center justify-center text-brand-gold font-display text-xl md:text-2xl font-bold">PRO</div>
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold">AfriStory Pro</h3>
          <p className="text-gray-400 text-sm md:text-base">Pour les professionnels. Monétisez vos œuvres, accédez à des statistiques avancées et construisez votre empire médiatique.</p>
          <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-500">
            <li>• Part de revenus de 70% à 90%</li>
            <li>• Micro-transactions (AfriCoins)</li>
            <li>• Badge Certifié</li>
          </ul>
        </div>
        <div className="glass-card p-6 md:p-12 space-y-4 md:space-y-6 group hover:border-brand-green/30 transition-all cursor-pointer">
          <div className="w-12 md:w-16 h-12 md:h-16 bg-brand-green/10 rounded-xl md:rounded-2xl flex items-center justify-center text-brand-green font-display text-xl md:text-2xl font-bold">DRAFT</div>
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold">AfriStory Draft</h3>
          <p className="text-gray-400 text-sm md:text-base">L'espace communautaire. Publiez librement, recevez des feedbacks et progressez vers le statut Pro.</p>
          <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-500">
            <li>• Publication gratuite et illimitée</li>
            <li>• Ateliers et concours</li>
            <li>• Système de mentorat Pro</li>
          </ul>
        </div>
      </section>

      {/* Mobile App Promo */}
      {!searchQuery && (
        <section className="px-4 md:px-12 mt-16 md:mt-32">
          <div className="glass-card rounded-2xl md:rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-brand-gold/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-48 md:w-72 h-48 md:h-72 bg-brand-green/10 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16">
              <div className="flex-1 space-y-6 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-4 py-2">
                  <Smartphone className="w-4 h-4 text-brand-gold" />
                  <span className="text-brand-gold text-[10px] font-black uppercase tracking-widest">Bientôt disponible</span>
                </div>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-black uppercase tracking-tighter leading-none">
                  AfriStory <span className="text-brand-gold">Mobile</span>
                </h2>
                <p className="text-gray-400 text-base md:text-lg max-w-lg">
                  Emportez vos histoires préférées partout. Lecture hors-ligne, notifications push, et une expérience optimisée pour mobile.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <button className="flex items-center gap-3 px-6 py-3 bg-white text-brand-black rounded-xl hover:bg-white/90 transition-colors group">
                    <Apple className="w-6 h-6" />
                    <div className="text-left">
                      <div className="text-[8px] font-bold uppercase">Télécharger sur</div>
                      <div className="text-sm font-black -mt-0.5">App Store</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 px-6 py-3 bg-white text-brand-black rounded-xl hover:bg-white/90 transition-colors group">
                    <Play className="w-6 h-6" />
                    <div className="text-left">
                      <div className="text-[8px] font-bold uppercase">Disponible sur</div>
                      <div className="text-sm font-black -mt-0.5">Google Play</div>
                    </div>
                  </button>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-48 md:w-64 h-80 md:h-[500px] bg-brand-black rounded-[2rem] border-4 border-white/10 flex items-center justify-center shadow-2xl">
                  <div className="text-center space-y-4">
                    <Download className="w-12 h-12 text-brand-gold mx-auto" />
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">En développement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const TrendingWorkCard = ({ work, index }: { work: any, index: number }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/work/${work.id}`)}
      className="flex items-center gap-3 md:gap-6 group cursor-pointer glass-card p-3 md:p-4 hover:border-brand-gold/30 transition-all"
    >
      <div className="w-16 md:w-20 h-24 md:h-28 bg-brand-brown rounded-lg md:rounded-xl flex-shrink-0 relative overflow-hidden">
         {work.coverURL && <img src={work.coverURL} alt={work.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
         <div className="absolute top-0 right-0 bg-brand-gold text-brand-black text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5">#{index}</div>
      </div>
      <div className="space-y-1 md:space-y-2">
        <div className="text-[7px] md:text-[8px] font-black text-brand-gold uppercase tracking-[0.2em]">{work.category}</div>
        <h4 className="font-display font-bold text-sm md:text-lg leading-tight group-hover:text-brand-gold transition-colors">{work.title}</h4>
        <div className="flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[10px] text-gray-500 font-bold">
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
