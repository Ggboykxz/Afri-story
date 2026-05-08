import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Briefcase, MapPin, Clock, Search, Filter, Plus, ChevronRight, UserPlus, Info } from 'lucide-react';
import { collaborationService, Ad } from '@/lib/collaborationService';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/common/Skeleton';

export function CollaborationHub() {
  const { user, profile } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState('Tous');

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const data = await collaborationService.getOpenAds();
      setAds(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const roles = ['Tous', 'Coloriste', 'Scénariste', 'Éditeur', 'Background Artist', 'Traducteur'];

  const filteredAds = ads.filter(ad => activeRole === 'Tous' || ad.roleRequired === activeRole);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-brand-brown/20 border border-white/5 p-8 md:p-16">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Briefcase className="w-64 h-64 rotate-12" />
        </div>
        <div className="relative z-10 space-y-6 max-w-2xl">
          <div className="flex items-center gap-2 bg-brand-gold/20 text-brand-gold w-fit px-3 py-1 rounded-full border border-brand-gold/30">
            <UserPlus className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Beta Collaboration</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter leading-[0.9]">
            Construisez votre <span className="gradient-text">Équipe de Rêve</span>
          </h1>
          <p className="text-gray-400 text-lg font-medium leading-relaxed">
            AfriStory n'est pas qu'un lieu de lecture. C'est l'endroit où les talents se rencontrent pour donner vie aux prochaines légendes de la BD africaine.
          </p>
        </div>
      </section>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-brand-black/50 backdrop-blur-xl p-4 sticky top-20 z-30 rounded-2xl border border-white/5">
        <div className="flex items-center gap-2 overflow-x-auto invisible-scrollbar w-full md:w-auto">
          {roles.map(role => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeRole === role ? 'bg-brand-gold text-brand-black' : 'bg-white/5 text-gray-500 hover:text-white'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
        
        {['artist_pro', 'artist_mentor', 'admin'].includes(profile?.role) && (
          <button className="w-full md:w-auto bg-white text-brand-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-gold transition-colors">
            <Plus className="w-4 h-4" /> Publier une annonce
          </button>
        )}
      </div>

      {/* Ads Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="glass-card p-6 border border-white/5 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                   <Skeleton className="w-16 h-4 rounded-md" />
                   <Skeleton className="w-12 h-3" />
                </div>
                <div className="space-y-2">
                   <Skeleton variant="text" className="w-3/4 h-6" />
                   <div className="space-y-1">
                     <Skeleton variant="text" className="w-full h-3" />
                     <Skeleton variant="text" className="w-full h-3" />
                     <Skeleton variant="text" className="w-2/3 h-3" />
                   </div>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                   <Skeleton variant="circle" className="w-8 h-8" />
                   <div className="space-y-1">
                      <Skeleton variant="text" className="w-24 h-3" />
                      <Skeleton variant="text" className="w-16 h-2" />
                   </div>
                </div>
                <Skeleton className="w-full h-12 rounded-xl" />
              </div>
            </div>
          ))
        ) : filteredAds.length > 0 ? (
          filteredAds.map((ad) => (
            <motion.div
              key={ad.id}
              whileHover={{ y: -5 }}
              className="glass-card p-6 border border-white/5 space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                   <div className="bg-brand-gold/10 text-brand-gold px-2 py-1 rounded text-[8px] font-black border border-brand-gold/20 uppercase tracking-widest">
                      {ad.roleRequired}
                   </div>
                   <span className="text-[10px] text-gray-600 font-bold uppercase">{ad.createdAt?.toDate?.() ? "Il y a 2j" : "Récent"}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-display font-black uppercase tracking-tight">{ad.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                    {ad.description}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-brown" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{ad.artistName}</p>
                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Artiste Pro</p>
                  </div>
                </div>
                <button className="w-full py-3 bg-white/5 hover:bg-white text-white hover:text-brand-black transition-all rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">
                  Postuler / Contacter
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center space-y-6">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-8 h-8 text-gray-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-bold">Aucune annonce trouvée</h3>
              <p className="text-gray-500">Revenez plus tard ou publiez votre propre annonce si vous êtes un artiste Pro.</p>
            </div>
          </div>
        )}
      </div>

      {/* Guide Section */}
      <section className="bg-brand-gold rounded-3xl p-8 md:p-12 text-brand-black flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h2 className="text-4xl font-display font-black uppercase tracking-tighter leading-none">Comment ça marche ?</h2>
          <div className="space-y-4">
             <div className="flex gap-4 items-start">
               <div className="w-6 h-6 rounded-full bg-brand-black text-brand-gold flex items-center justify-center text-xs font-black flex-shrink-0">1</div>
               <p className="text-sm font-bold opacity-80">Les artistes Pro publient leurs besoins pour des projets en cours.</p>
             </div>
             <div className="flex gap-4 items-start">
               <div className="w-6 h-6 rounded-full bg-brand-black text-brand-gold flex items-center justify-center text-xs font-black flex-shrink-0">2</div>
               <p className="text-sm font-bold opacity-80">N'importe quel membre peut postuler en envoyant son portfolio.</p>
             </div>
             <div className="flex gap-4 items-start">
               <div className="w-6 h-6 rounded-full bg-brand-black text-brand-gold flex items-center justify-center text-xs font-black flex-shrink-0">3</div>
               <p className="text-sm font-bold opacity-80">Si validé, l'équipe est formée et reçoit un accès partagé au projet dans le backend.</p>
             </div>
          </div>
        </div>
        <div className="w-full md:w-1/3 glass-card bg-brand-black/10 border-white/20 p-8 space-y-4">
           <Info className="w-8 h-8" />
           <p className="text-xs font-bold leading-relaxed">
             AfriStory ne prend aucune commission sur les collaborations. Les accords financiers sont gérés directement entre les parties.
           </p>
           <button className="w-full py-3 bg-brand-black text-brand-gold font-black uppercase text-[10px] rounded-xl tracking-widest">
             Lire la Charte
           </button>
        </div>
      </section>
    </div>
  );
}
