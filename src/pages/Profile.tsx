import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Award, Zap, Book, ShieldCheck, Heart, Grid, List as ListIcon, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Profile = () => {
  const { userId } = useParams();
  const { user, profile } = useAuth();
  const [showProModal, setShowProModal] = React.useState(false);
  
  const isOwnProfile = user?.uid === userId;
  const displayProfile = isOwnProfile ? profile : null; 

  const badges = [
    { label: 'Pionnier', icon: <Zap className="w-4 h-4" />, color: 'bg-brand-gold' },
    { label: 'Abonné Premium', icon: <ShieldCheck className="w-4 h-4" />, color: 'bg-brand-red' },
    { label: 'Super Lecteur', icon: <Book className="w-4 h-4" />, color: 'bg-brand-green' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      {/* Pro Status Modal */}
      <AnimatePresence>
        {showProModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowProModal(false)}
               className="absolute inset-0 bg-brand-black/90 backdrop-blur-md"
            />
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="glass-card max-w-lg w-full p-8 relative z-10 space-y-6"
            >
               <button onClick={() => setShowProModal(false)} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
               </button>

               <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-brand-gold/10 rounded-[2rem] flex items-center justify-center text-brand-gold mx-auto">
                     <ShieldCheck className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-display font-black uppercase tracking-tighter">Devenir Artiste Pro</h3>
                  <p className="text-sm text-gray-400">Le statut Pro vous permet de monétiser vos œuvres, de vendre du merchandising et de figurer en tête des classements.</p>
               </div>
               
               <div className="space-y-4 py-4 border-y border-white/10">
                  <div className="flex items-start gap-4">
                     <div className="w-6 h-6 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center flex-shrink-0 text-[10px] font-black">1</div>
                     <div>
                        <h4 className="text-[10px] font-black uppercase text-white">Portfolio Minimum</h4>
                        <p className="text-xs text-gray-500">Avoir au moins une œuvre publiée avec plus de 1000 vues.</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-4">
                     <div className="w-6 h-6 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center flex-shrink-0 text-[10px] font-black">2</div>
                     <div>
                        <h4 className="text-[10px] font-black uppercase text-white">Vérification d'Identité</h4>
                        <p className="text-xs text-gray-500">Nos modérateurs vérifient l'originalité de vos créations.</p>
                     </div>
                  </div>
               </div>

               <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                       alert("Demande envoyée ! Nos modérateurs vous contacteront sous 48h.");
                       setShowProModal(false);
                    }}
                    className="w-full py-4 bg-brand-gold text-brand-black font-black rounded-xl hover:scale-105 transition-all text-sm"
                  >
                     ENVOYER MA CANDIDATURE
                  </button>
                  <button onClick={() => setShowProModal(false)} className="py-2 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors">Plus tard</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Header */}
      <div className="relative">
         <div className="h-64 rounded-3xl bg-linear-to-tr from-brand-brown to-brand-black border border-white/10" />
         <div className="absolute -bottom-16 left-8 flex flex-col md:flex-row items-end gap-6">
            <div className="w-32 h-32 rounded-3xl bg-brand-black border-4 border-brand-black shadow-2xl relative overflow-hidden">
               {displayProfile?.photoURL ? (
                 <img src={displayProfile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full bg-brand-brown flex items-center justify-center">
                    <span className="text-4xl font-display font-black">{displayProfile?.displayName?.[0] || 'U'}</span>
                 </div>
               )}
            </div>
            <div className="pb-4 space-y-1">
               <h1 className="text-4xl font-display font-black inline-flex items-center gap-3">
                  {displayProfile?.displayName || 'Utilisateur Nexus-Hub'}
                  {displayProfile?.role === 'artist_pro' && <Award className="w-6 h-6 text-brand-gold" />}
               </h1>
               <div className="flex flex-wrap gap-2">
                  {badges.map((badge, i) => (
                    <div key={i} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white ${badge.color}`}>
                       {badge.icon}
                       {badge.label}
                    </div>
                  ))}
                  {displayProfile?.role !== 'reader' && (
                    <button 
                      onClick={() => setShowProModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] font-black uppercase tracking-wider text-white hover:bg-brand-gold hover:text-brand-black transition-all"
                    >
                       <MessageCircle className="w-4 h-4" />
                       Demande Professionnelle
                    </button>
                  )}
               </div>
            </div>
         </div>
      </div>

      <div className="mt-32 grid grid-cols-1 lg:grid-cols-4 gap-12">
         {/* Sidebar Stats */}
         <div className="space-y-6">
            <div className="glass-card p-8 space-y-6">
               <h3 className="font-display font-bold text-sm uppercase tracking-widest text-gray-500">Statistiques</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <div className="text-sm font-black text-white">42</div>
                     <div className="text-[10px] text-gray-500 font-bold uppercase">Lectures</div>
                  </div>
                  <div className="space-y-1">
                     <div className="text-sm font-black text-white">12</div>
                     <div className="text-[10px] text-gray-500 font-bold uppercase">Favoris</div>
                  </div>
                  <div className="space-y-1">
                     <div className="text-sm font-black text-white">{displayProfile?.nexusCoins || 0}</div>
                     <div className="text-[10px] text-gray-500 font-bold uppercase">Nexus-Coins</div>
                  </div>
                  <div className="space-y-1">
                     <div className="text-sm font-black text-white">324</div>
                     <div className="text-[10px] text-gray-500 font-bold uppercase">Points</div>
                  </div>
               </div>
            </div>

            <div className="glass-card p-8 space-y-4">
               <h3 className="font-display font-bold text-sm uppercase tracking-widest text-gray-500">Biographie</h3>
               <p className="text-sm text-gray-400 leading-relaxed italic">
                 "{displayProfile?.bio || "Passionné par les récits et l'art africain. Je suis ici pour explorer les légendes du continent."}"
               </p>
            </div>

            {/* External Links - Section 4.2 */}
            {displayProfile?.role !== 'reader' && (
              <div className="glass-card p-8 space-y-4">
                <h3 className="font-display font-bold text-sm uppercase tracking-widest text-gray-500">Liens Externe</h3>
                <div className="space-y-3">
                   <a href="#" className="flex items-center gap-3 text-sm text-gray-400 hover:text-brand-gold font-bold transition-all">
                      <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">📦</span>
                      Amazon Store
                   </a>
                   <a href="#" className="flex items-center gap-3 text-sm text-gray-400 hover:text-brand-gold font-bold transition-all">
                      <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">🌐</span>
                      Site Personnel
                   </a>
                   <a href="#" className="flex items-center gap-3 text-sm text-gray-400 hover:text-brand-gold font-bold transition-all">
                      <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">🎨</span>
                      Portfolio ArtStation
                   </a>
                </div>
              </div>
            )}
         </div>

         {/* Main Content: Library */}
         <div className="lg:col-span-3 space-y-12">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
               <div className="flex gap-8">
                  <button className="font-display font-black text-2xl border-b-2 border-brand-gold pb-6 -mb-6.5 text-white">Ma Bibliothèque</button>
                  <button className="font-display font-black text-2xl text-gray-500 hover:text-white transition-colors pb-6">Favoris</button>
                  {displayProfile?.role !== 'reader' && (
                    <button className="font-display font-black text-2xl text-gray-500 hover:text-white transition-colors pb-6">Portfolio Artistique</button>
                  )}
                  <button className="font-display font-black text-2xl text-gray-500 hover:text-white transition-colors pb-6">Activités</button>
               </div>
               <div className="flex gap-2 text-gray-500">
                  <button className="p-2 hover:text-white"><Grid className="w-5 h-5" /></button>
                  <button className="p-2 hover:text-white"><ListIcon className="w-5 h-5" /></button>
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {[1, 2, 3].map(i => (
                 <motion.div 
                   key={i} 
                   whileHover={{ y: -8 }}
                   className="space-y-3 group cursor-pointer"
                 >
                    <div className="aspect-[3/4] bg-brand-brown rounded-2xl border border-white/10 overflow-hidden relative">
                       <div className="absolute inset-0 bg-linear-to-t from-brand-black via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <div className="text-[10px] font-bold text-white uppercase tracking-widest">Chapitre 12 / 24</div>
                       </div>
                    </div>
                    <div>
                       <h4 className="font-bold text-sm">L'Esprit du Fleuve</h4>
                       <div className="h-1 w-full bg-white/10 rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-brand-gold w-1/2" />
                       </div>
                    </div>
                 </motion.div>
               ))}
               <div className="aspect-[3/4] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-6 text-center gap-4 hover:border-brand-gold/30 transition-all cursor-pointer group">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gray-500 group-hover:text-brand-gold">
                     <Grid className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Explorer plus d'œuvres</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
