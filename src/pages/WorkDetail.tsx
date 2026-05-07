import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BookOpen, Heart, Share2, Award, User, Star, DollarSign, X, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { workService, Work } from '../lib/workService';
import { useAuth } from '../context/AuthContext';

export const WorkDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDonate, setShowDonate] = useState(false);
  const [donated, setDonated] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchWork();
  }, [id]);

  const fetchWork = async () => {
    try {
      setLoading(true);
      const data = await workService.getWork(id!);
      setWork(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = () => {
    if (!user) return navigate('/login');
    setDonated(true);
    setTimeout(() => {
      setDonated(false);
      setShowDonate(false);
    }, 2000);
  };

  const toggleFavorite = () => {
    if (!user) return navigate('/login');
    setIsFavorited(!isFavorited);
    // Ideally this would sync with Firestore "favorites" collection
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-display font-bold">Œuvre introuvable</h2>
        <Link to="/" className="text-brand-gold hover:underline font-bold uppercase tracking-widest text-xs">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header / Cover */}
      <div className="relative h-[50vh] overflow-hidden">
        <div className="absolute inset-0 bg-brand-brown opacity-20" />
        <div className="absolute inset-0 bg-linear-to-t from-brand-black via-brand-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 max-w-7xl mx-auto flex flex-col md:flex-row items-end gap-8">
          <div className="w-48 aspect-[3/4] rounded-2xl overflow-hidden glass-card shadow-2xl flex-shrink-0 -mb-24 relative z-10">
             {work.coverURL ? (
               <img src={work.coverURL} alt={work.title} className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full bg-brand-brown/40" />
             )}
          </div>
          
          <div className="flex-1 space-y-4 mb-4">
            <div className="flex flex-wrap gap-2">
              <span className="bg-brand-gold text-brand-black text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">{work.type}</span>
              <span className="bg-white/10 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">{work.status || 'EN COURS'}</span>
              {work.isPro && <span className="bg-brand-gold/20 text-brand-gold text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider border border-brand-gold/30">ARTISTE PRO</span>}
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black leading-[0.9]">{work.title}</h1>
            <div className="flex items-center gap-6 text-sm font-bold text-gray-400">
              <Link to={`/profile/${work.authorId}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <User className="w-4 h-4" />
                {work.author}
              </Link>
              <div className="flex items-center gap-2 uppercase tracking-widest text-[10px]">
                <BookOpen className="w-4 h-4" />
                {work.category}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            <button 
              onClick={toggleFavorite}
              className={`flex items-center gap-2 px-6 py-3 font-black rounded-xl hover:scale-105 transition-all ${
                isFavorited ? 'bg-white text-brand-black' : 'bg-brand-gold text-brand-black shadow-lg shadow-brand-gold/10'
              }`}
            >
              {isFavorited ? 'ABONNÉ' : "S'ABONNER"}
            </button>
            <button 
              onClick={() => setShowDonate(true)}
              className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-brand-gold/10 hover:border-brand-gold/50 transition-all font-bold text-sm"
            >
              <DollarSign className="w-4 h-4 text-brand-gold" />
              DONNER
            </button>
            <button 
              onClick={toggleFavorite}
              className={`p-3 border rounded-xl transition-all ${isFavorited ? 'bg-brand-red/20 border-brand-red text-brand-red' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
            >
              <Heart className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 md:px-12 pt-32 grid md:grid-cols-3 gap-12 pb-24">
        {/* Left Column: Chapters */}
        <div className="md:col-span-2 space-y-12">
          <section className="space-y-6">
            <h2 className="text-2xl font-display font-bold">À propos</h2>
            <p className="text-gray-400 leading-relaxed text-lg">{work.description}</p>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold">Chapitres</h2>
              <span className="text-gray-500 font-bold text-sm uppercase tracking-widest">{work.chapters.length} ÉPISODES</span>
            </div>
            
            <div className="space-y-3">
              {work.chapters.map((chapter) => (
                <Link 
                  key={chapter.id}
                  to={`/read/${work.id}/${chapter.id}`}
                  className="flex items-center justify-between p-4 glass-card hover:border-brand-gold/40 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center font-display font-bold text-gray-500 group-hover:text-brand-gold transition-colors">
                      {chapter.number}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{chapter.title}</h4>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{chapter.date}</p>
                    </div>
                  </div>
                  
                  {chapter.isPremium ? (
                    <div className="flex items-center gap-2 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                      < Star className="w-3 h-3 fill-current" />
                      Premium
                    </div>
                  ) : (
                    <button className="text-[10px] font-black uppercase text-gray-500 group-hover:text-white transition-colors">LIRE</button>
                  )}
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Stats & Author */}
        <div className="space-y-8">
          <div className="glass-card p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-display font-black text-white">{work.views}</div>
                <div className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Vues</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-display font-black text-white">{work.likes}</div>
                <div className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Likes</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">L'Artiste</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-brand-brown rounded-full border-2 border-brand-gold/30" />
              <div>
                <Link to={`/profile/${work.authorId}`} className="font-display font-bold text-lg hover:text-brand-gold transition-colors underline decoration-brand-gold/30 underline-offset-4">{work.author}</Link>
                <div className="flex items-center gap-1 text-xs text-brand-gold font-bold">
                  <Award className="w-3 h-3" />
                  Artiste Certifié
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-400">Dessinateur et illustrateur passionné par les récits mythologiques nigérians.</p>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      <AnimatePresence>
         {showDonate && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowDonate(false)}
               className="absolute inset-0 bg-brand-black/90 backdrop-blur-md"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="glass-card w-full max-w-md p-8 relative z-10 space-y-8"
             >
               <button onClick={() => setShowDonate(false)} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
               </button>

               <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold mx-auto">
                     <DollarSign className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-display font-black uppercase tracking-tighter">Soutenir {work.author}</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Vos dons servent à faire avancer l'histoire !</p>
               </div>

               {donated ? (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="p-8 bg-brand-green/10 rounded-2xl flex flex-col items-center gap-4 text-brand-green"
                 >
                    <div className="w-12 h-12 bg-brand-green rounded-full flex items-center justify-center text-brand-black">
                       <Check className="w-8 h-8" />
                    </div>
                    <p className="font-black uppercase tracking-widest">MERCI POUR VOTRE DON !</p>
                 </motion.div>
               ) : (
                 <div className="grid grid-cols-2 gap-4">
                    {[100, 500, 1000, 5000].map(amount => (
                      <button 
                        key={amount}
                        onClick={handleDonate}
                        className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-brand-gold/10 hover:border-brand-gold transition-all text-center group"
                      >
                         <div className="text-xl font-display font-black text-white group-hover:text-brand-gold">{amount}</div>
                         <div className="text-[10px] font-bold text-gray-500 uppercase">FCFA</div>
                      </button>
                    ))}
                 </div>
               )}

               <p className="text-[10px] text-gray-600 text-center font-bold italic">Un don de 10% est prélevé pour la maintenance de Nexus-Hub.</p>
             </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
};
