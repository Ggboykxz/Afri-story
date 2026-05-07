import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, BookOpen, Award, Heart, Share2, MessageCircle, Zap, Loader2 } from 'lucide-react';
import { workService, Work } from '../lib/workService';

export function PublicArtistProfile() {
  const { artistId } = useParams();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtistData();
  }, [artistId]);

  const fetchArtistData = async () => {
    try {
      setLoading(true);
      // In a real app, we'd fetch profile + works separately
      const artistWorks = await workService.getWorks({ authorId: artistId });
      setWorks(artistWorks);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
     return (
       <div className="min-h-[60vh] flex items-center justify-center">
         <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
       </div>
     );
  }

  const artistName = works[0]?.author || "Artiste Nexus";
  const isPro = works.some(w => w.isPro);

  return (
    <div className="min-h-screen">
      {/* Cover Header */}
      <div className="h-64 bg-brand-brown/30 relative">
        <div className="absolute inset-0 bg-linear-to-t from-brand-black to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-20 relative z-10 space-y-12 pb-24">
        {/* Profile Card */}
        <div className="flex flex-col md:flex-row items-end gap-8 bg-brand-black/40 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-brand-brown border-4 border-brand-black overflow-hidden shadow-xl">
             <div className="w-full h-full flex items-center justify-center bg-brand-gold/10">
               <User className="w-16 h-16 text-brand-gold/40" />
             </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter">{artistName}</h1>
              {isPro && (
                <div className="bg-brand-gold/20 text-brand-gold px-3 py-1 rounded-full border border-brand-gold/30 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">Artiste Pro</span>
                </div>
              )}
            </div>
            <p className="text-gray-400 max-w-xl text-sm font-medium leading-relaxed">
              Créateur passionné explorant les frontières entre tradition et futur. Bienvenue dans mon univers sur le Nexus-Hub.
            </p>
            <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 italic">
               <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-brand-gold" /> {works.length} Œuvres</div>
               <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-brand-gold" /> 25.4K Vues Totales</div>
               <div className="flex items-center gap-2"><Heart className="w-4 h-4 text-brand-gold" /> 4.2K Abonnés</div>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-8 py-3 bg-brand-gold text-brand-black font-black rounded-xl hover:scale-105 transition-transform tracking-widest text-[10px] uppercase">
              S'ABONNER
            </button>
            <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Works Section */}
        <section className="space-y-8">
           <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-2xl font-display font-black uppercase tracking-tight">Toutes les œuvres</h2>
              <div className="flex gap-4">
                 <button className="text-[10px] font-black uppercase text-brand-gold tracking-widest">Populaires</button>
                 <button className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Récents</button>
              </div>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
             {works.map((work) => (
                <motion.div
                  key={work.id}
                  whileHover={{ y: -10 }}
                  className="group cursor-pointer flex flex-col gap-3"
                >
                  <Link to={`/work/${work.id}`} className="block">
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden glass-card relative shadow-xl">
                      <div className="absolute top-3 left-3 z-10">
                        <div className="bg-brand-black/60 backdrop-blur-md px-2 py-1 rounded text-[8px] font-black border border-white/10 uppercase tracking-widest">
                          {work.type}
                        </div>
                      </div>
                      {work.coverURL ? (
                        <img src={work.coverURL} alt={work.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full bg-brand-brown/40" />
                      )}
                    </div>
                  </Link>
                  <div className="space-y-1">
                    <h4 className="font-display font-bold leading-tight group-hover:text-brand-gold transition-colors truncate">
                      {work.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                      <Zap className="w-3 h-3 text-brand-gold" /> {work.views}
                    </div>
                  </div>
                </motion.div>
             ))}
           </div>
        </section>

        {/* Collaboration / Artist News */}
        <section className="grid md:grid-cols-2 gap-8">
           <div className="glass-card p-8 space-y-4 border border-white/10">
              <h3 className="text-xl font-display font-black uppercase flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-brand-gold" />
                Dernières Nouvelles
              </h3>
              <div className="space-y-4">
                 <div className="p-4 bg-white/5 rounded-xl space-y-2">
                    <p className="text-sm font-bold">Le chapitre 25 d'Oyo arrive bientôt ! Préparez-vous...</p>
                    <span className="text-[10px] text-gray-500 uppercase font-black">Il y a 2 jours</span>
                 </div>
                 <div className="p-4 bg-white/5 rounded-xl space-y-2">
                    <p className="text-sm font-bold">Petit sketch en attendant la sortie officielle.</p>
                    <span className="text-[10px] text-gray-500 uppercase font-black">Il y a 1 semaine</span>
                 </div>
              </div>
           </div>

           <div className="glass-card p-8 bg-brand-gold/5 border border-brand-gold/20 flex flex-col justify-center items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-brand-gold flex items-center justify-center text-brand-black">
                 <Zap className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-black uppercase text-brand-gold">Soutenir l'Artiste</h3>
                <p className="text-sm text-gray-400 font-medium">Contribuez directement au développement de nouvelles œuvres en offrant des Nexus-Coins.</p>
              </div>
              <button className="px-12 py-3 bg-brand-gold text-brand-black font-black rounded-xl text-[10px] uppercase tracking-widest">
                OFFRIR UN DON
              </button>
           </div>
        </section>
      </div>
    </div>
  );
}
