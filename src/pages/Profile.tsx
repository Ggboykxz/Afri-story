import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Award, Zap, BookOpen, ShieldCheck, Heart, Grid, List as ListIcon, MessageCircle, X, Camera, Loader2, Star, Pencil, Check, Trash2, Clock, Eye, Heart as HeartIcon, BookMarked } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { workService, Work } from '../lib/workService';
import { Skeleton } from '../components/Skeleton';
import { BADGES } from '../lib/roles';

export const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, profile, updateProfile: updateUserProfile } = useAuth();
  const [showProModal, setShowProModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'favorites' | 'portfolio' | 'activity'>('library');
  const [favoriteWorks, setFavoriteWorks] = useState<Work[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const currentUserId = userId || user?.uid;

  // Fetch favorite works
  useEffect(() => {
    if (!user || !profile?.favorites?.length) {
      setFavoriteWorks([]);
      return;
    }

    const fetchFavorites = async () => {
      const works: Work[] = [];
      for (const id of profile.favorites) {
        const w = await workService.getWork(id);
        if (w) works.push(w);
      }
      setFavoriteWorks(works);
    };

    fetchFavorites();
  }, [user, profile?.favorites]);

  // Fetch recent activities from reading history
  useEffect(() => {
    if (!user) return;

    const historyQuery = query(
      collection(db, 'users', user.uid, 'reading_history'),
      orderBy('lastReadAt', 'desc'),
      limit(10)
    );

    const unsub = onSnapshot(historyQuery, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setActivities(items);
    });

    return () => unsub();
  }, [user]);

  const isOwnProfile = user?.uid === currentUserId;
  const displayProfile = profile;

  const handleSaveProfile = async () => {
    if (!user || !editName.trim()) return;
    setSaving(true);
    try {
      if (editName.trim()) {
        await updateProfile(auth.currentUser!, { displayName: editName.trim() });
        await updateDoc(doc(db, 'users', user.uid), {
          displayName: editName.trim(),
          bio: editBio.trim(),
        });
        await updateUserProfile({ displayName: editName.trim(), bio: editBio.trim() });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const startEditing = () => {
    setEditName(profile?.displayName || '');
    setEditBio(profile?.bio || '');
    setIsEditing(true);
  }; 

  const getBadgeDisplay = (badgeId: string) => {
    const badgeInfo = BADGES[badgeId];
    if (!badgeInfo) return null;
    const colors: Record<string, string> = {
      premium: 'bg-purple-500',
      supporter: 'bg-brand-gold text-brand-black',
      loyal: 'bg-brand-green',
      megareader: 'bg-brand-red',
      pro: 'bg-brand-gold',
      mentor: 'bg-brand-brown',
    };
    return {
      label: badgeInfo.name,
      icon: <Star className="w-4 h-4" />,
      color: colors[badgeId] || 'bg-gray-500',
    };
  };

  const userBadges = profile?.badges?.map(b => getBadgeDisplay(b.id)).filter(Boolean) || [];

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
               {loading ? (
                 <Skeleton className="w-full h-full" />
               ) : displayProfile?.photoURL ? (
                 <img src={displayProfile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full bg-brand-brown flex items-center justify-center">
                    <span className="text-4xl font-display font-black">{displayProfile?.displayName?.[0] || 'U'}</span>
                 </div>
               )}
            </div>
            <div className="pb-4 space-y-1">
{loading ? (
                  <div className="space-y-2">
                     <Skeleton variant="text" className="w-64 h-10" />
                     <div className="flex gap-2">
                        <Skeleton className="w-24 h-6 rounded-full" />
                        <Skeleton className="w-32 h-6 rounded-full" />
                     </div>
                  </div>
                ) : (
                  <>
                    {isOwnProfile && !isEditing && (
                      <button onClick={startEditing} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:border-brand-gold/50 transition-all">
                        <Pencil className="w-4 h-4 text-gray-400" />
                        <span className="text-[10px] font-black uppercase text-gray-400">Modifier</span>
                      </button>
                    )}
                    {isEditing ? (
                      <div className="flex flex-col gap-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Votre nom"
                          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xl font-black text-white placeholder:text-gray-500 outline-none focus:border-brand-gold"
                        />
                        <textarea
                          value={editBio}
                          onChange={(e) => setEditBio(e.target.value)}
                          placeholder="Bio (optionnel)"
                          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-300 placeholder:text-gray-500 outline-none focus:border-brand-gold w-full max-w-md"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-brand-black rounded-lg font-bold hover:scale-105 transition-all">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            <span className="text-sm">Enregistrer</span>
                          </button>
                          <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm">
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <h1 className="text-4xl font-display font-black inline-flex items-center gap-3">
                        {displayProfile?.displayName || 'Utilisateur AfriStory'}
                        {displayProfile?.role === 'artist_pro' && <Award className="w-6 h-6 text-brand-gold" />}
                      </h1>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {userBadges.length > 0 ? (
                        userBadges.map((badge, i) => badge && (
                          <div key={i} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white ${badge.color}`}>
                             {badge.icon}
                             {badge.label}
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] font-black uppercase tracking-wider text-gray-400">
                           <Zap className="w-4 h-4" />
                           Lecteur
                        </div>
                      )}
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
                 </>
               )}
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
                       <div className="text-sm font-black text-white">{(displayProfile?.statistics as any)?.totalReads || 0}</div>
                       <div className="text-[10px] text-gray-500 font-bold uppercase">Lectures</div>
                    </div>
                   <div className="space-y-1">
                      <div className="text-sm font-black text-white">{displayProfile?.favorites?.length || 0}</div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase">Favoris</div>
                   </div>
                   <div className="space-y-1">
                      <div className="text-sm font-black text-white">{displayProfile?.afriCoins || 0}</div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase">AfriCoins</div>
                   </div>
                   <div className="space-y-1">
                      <div className="text-sm font-black text-white">{displayProfile?.following?.length || 0}</div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase">Abonnements</div>
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
                   <a href="https://amazon.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-400 hover:text-brand-gold font-bold transition-all">
                      <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">📦</span>
                      Amazon Store
                   </a>
                   <a href="https://linktr.ee" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-400 hover:text-brand-gold font-bold transition-all">
                      <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">🌐</span>
                      Site Personnel
                   </a>
                   <a href="https://artstation.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-400 hover:text-brand-gold font-bold transition-all">
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
                  <button 
                    onClick={() => setActiveTab('library')}
                    className={`font-display font-black text-2xl pb-6 -mb-6.5 transition-colors ${activeTab === 'library' ? 'border-b-2 border-brand-gold text-white' : 'text-gray-500 hover:text-white'}`}
                  >
                    Ma Bibliothèque
                  </button>
                  <button 
                    onClick={() => setActiveTab('favorites')}
                    className={`font-display font-black text-2xl pb-6 -mb-6.5 transition-colors ${activeTab === 'favorites' ? 'border-b-2 border-brand-gold text-white' : 'text-gray-500 hover:text-white'}`}
                  >
                    Favoris
                  </button>
                  {displayProfile?.role !== 'reader' && (
                    <button 
                      onClick={() => setActiveTab('portfolio')}
                      className={`font-display font-black text-2xl pb-6 -mb-6.5 transition-colors ${activeTab === 'portfolio' ? 'border-b-2 border-brand-gold text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                      Portfolio Artistique
                    </button>
                  )}
                  <button 
                    onClick={() => setActiveTab('activity')}
                    className={`font-display font-black text-2xl pb-6 -mb-6.5 transition-colors ${activeTab === 'activity' ? 'border-b-2 border-brand-gold text-white' : 'text-gray-500 hover:text-white'}`}
                  >
                    Activités
                  </button>
               </div>
               <div className="flex gap-2 text-gray-500">
                  <button className="p-2 hover:text-white"><Grid className="w-5 h-5" /></button>
                  <button className="p-2 hover:text-white"><ListIcon className="w-5 h-5" /></button>
               </div>
            </div>

            {activeTab === 'library' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {favoriteWorks.length > 0 ? (
                 favoriteWorks.slice(0, 4).map((work) => (
                   <motion.div 
                     key={work.id}
                     whileHover={{ y: -8 }}
                     className="space-y-3 group cursor-pointer"
                   >
                      <Link to={`/work/${work.id}`}>
                        <div className="aspect-[3/4] bg-brand-brown rounded-2xl border border-white/10 overflow-hidden relative">
                           {work.coverURL ? (
                             <img src={work.coverURL} alt={work.title} className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full bg-brand-brown" />
                           )}
                           <div className="absolute inset-0 bg-linear-to-t from-brand-black via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                              <div className="text-[10px] font-bold text-white uppercase tracking-widest">LIRE</div>
                           </div>
                        </div>
                        <h4 className="font-bold text-sm mt-2">{work.title}</h4>
                      </Link>
                   </motion.div>
                 ))
               ) : (
                 <div className="col-span-full py-12 text-center">
                    <p className="text-gray-500">Aucune œuvre dans votre bibliothèque</p>
                    <Link to="/explore" className="text-brand-gold text-sm">Explorer</Link>
                 </div>
               )}
            </div>
            )}

            {activeTab === 'favorites' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {favoriteWorks.length > 0 ? (
                 favoriteWorks.map((work) => (
                   <motion.div 
                     key={work.id}
                     whileHover={{ y: -8 }}
                     className="space-y-3 group cursor-pointer relative"
                   >
                      <Link to={`/work/${work.id}`}>
                        <div className="aspect-[3/4] bg-brand-brown rounded-2xl border border-white/10 overflow-hidden relative">
                           {work.coverURL ? (
                             <img src={work.coverURL} alt={work.title} className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full bg-brand-brown" />
                           )}
                        </div>
                        <h4 className="font-bold text-sm mt-2">{work.title}</h4>
                      </Link>
                   </motion.div>
                 ))
               ) : (
                 <div className="col-span-full py-12 text-center">
                    <p className="text-gray-500">Aucun favori</p>
                    <Link to="/explore" className="text-brand-gold text-sm">Ajouter des favoris</Link>
                 </div>
               )}
            </div>
            )}

            {activeTab === 'portfolio' && displayProfile?.role !== 'reader' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               <div className="col-span-full py-12 text-center">
                  <p className="text-gray-500">Pas encore de portfolio</p>
               </div>
            </div>
            )}

            {activeTab === 'activity' && (
            <div className="space-y-4">
               {activities.length > 0 ? (
                 activities.map((item, i) => (
                   <div key={i} className="flex items-center gap-4 glass-card p-4">
                      <div className="w-12 h-16 bg-brand-brown rounded-lg flex-shrink-0 overflow-hidden">
                        {item.coverURL ? (
                          <img src={item.coverURL} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-brand-brown" />
                        )}
                      </div>
                      <div className="flex-1">
                         <h4 className="font-bold">{item.title || 'Œuvre'}</h4>
                         <div className="flex items-center gap-3 text-xs text-gray-500">
                           <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Chapitre {item.chapterNumber || 1}</span>
                           <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {item.views || 0} vues</span>
                         </div>
                      </div>
                      <Link to={`/work/${item.workId}`} className="text-brand-gold text-xs font-black uppercase">
                        Reprendre
                      </Link>
                   </div>
                 ))
               ) : (
                 <div className="glass-card p-8 text-center">
                    <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune activité récente</p>
                    <Link to="/explore" className="text-brand-gold text-sm mt-2 inline-block">Commencer à lire</Link>
                 </div>
               )}
            </div>
            )}
         </div>
      </div>
    </div>
  );
};
