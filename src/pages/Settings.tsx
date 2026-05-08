import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Shield, Eye, Palette, CreditCard, ChevronRight, Check, LayoutDashboard, Sparkles, Moon, Sun, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { updateProfile as firebaseUpdateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Skeleton } from '../components/Skeleton';

export const Settings = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, updateProfile: updateUserProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [website, setWebsite] = useState('');
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [newChapterNotif, setNewChapterNotif] = useState(true);
  const [messageNotif, setMessageNotif] = useState(true);
  const [socialNotif, setSocialNotif] = useState(true);
  const [shopNotif, setShopNotif] = useState(false);
  
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private' | 'friends'>('public');

  React.useEffect(() => {
    if (profile) {
      setEditName(profile.displayName || '');
      setEditBio(profile.bio || '');
      setInstagram(profile.socialLinks?.instagram || '');
      setTwitter(profile.socialLinks?.twitter || '');
      setWebsite(profile.socialLinks?.website || '');
      setNotificationsEnabled(profile.preferences?.notifications ?? true);
      setEmailNotificationsEnabled(profile.preferences?.emailNotifications ?? true);
    }
  }, [profile]);

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
         <div className="flex flex-col md:flex-row gap-12">
            <aside className="w-full md:w-72 space-y-6">
               <Skeleton variant="text" className="w-3/2 h-10" />
               <div className="space-y-2">
                  {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="w-full h-16 rounded-xl" />)}
               </div>
            </aside>
            <main className="flex-1 max-w-2xl space-y-12">
               <Skeleton className="w-full h-96 rounded-3xl" />
            </main>
         </div>
      </div>
    );
  }

  const handleProfileSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      await firebaseUpdateProfile(auth.currentUser, { displayName: editName.trim() });
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        displayName: editName.trim(),
        bio: editBio.trim(),
        socialLinks: {
          instagram: instagram.trim(),
          twitter: twitter.trim(),
          website: website.trim(),
        }
      });
      await updateUserProfile({ 
        displayName: editName.trim(), 
        bio: editBio.trim(),
        socialLinks: {
          instagram: instagram.trim(),
          twitter: twitter.trim(),
          website: website.trim(),
        }
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        preferences: {
          notifications: notificationsEnabled,
          emailNotifications: emailNotificationsEnabled,
          darkMode: theme === 'dark',
        }
      });
      await updateUserProfile({
        preferences: {
          notifications: notificationsEnabled,
          emailNotifications: emailNotificationsEnabled,
          darkMode: theme === 'dark',
        }
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving notifications:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePrivacySave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        profileVisibility,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving privacy settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return;
    if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          deletedAt: new Date(),
          role: 'visitor',
        });
        await auth.currentUser.delete();
        navigate('/');
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Impossible de supprimer le compte. Vérifiez que vous êtes bien connecté.');
      }
    }
  };

  const sections = [
    { id: 'profile', title: 'Profil Public', icon: User, desc: 'Gérez votre identité sur AfriStory' },
    { id: 'notifications', title: 'Notifications', icon: Bell, desc: 'Alertes, e-mails et push' },
    { id: 'privacy', title: 'Privacité & Sécurité', icon: Shield, desc: 'Mot de passe et visibilité' },
    { id: 'display', title: 'Affichage', icon: Palette, desc: 'Mode sombre, lecteurs et polices' },
    { id: 'billing', title: 'Abonnements & AfriCoins', icon: CreditCard, desc: 'Historique et facturation' },
  ];

  if (['artist_pro', 'artist_draft', 'artist_mentor'].includes(profile?.role)) {
    sections.splice(1, 0, { id: 'artist', title: 'Profil Artiste', icon: LayoutDashboard, desc: 'Gérez votre page de créateur' });
  }

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: (val: boolean) => void }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-12 h-6 rounded-full p-1 transition-colors ${enabled ? 'bg-brand-gold' : 'bg-white/20'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      <div className="flex flex-col md:flex-row gap-12">
        <aside className="w-full md:w-72 space-y-6">
           <div>
              <h1 className="text-3xl font-display font-black uppercase tracking-tighter">Paramètres</h1>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Gérez votre compte</p>
           </div>
           
           <nav className="space-y-1">
              {sections.map(section => (
                <button 
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${activeSection === section.id ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                   <section.icon className="w-5 h-5 flex-shrink-0" />
                   <div className="text-left">
                      <div className="text-sm font-black uppercase tracking-wider leading-none mb-1">{section.title}</div>
                      <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest truncate">{section.desc}</div>
                   </div>
                   {activeSection === section.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              ))}
           </nav>
        </aside>

        <main className="flex-1 max-w-2xl space-y-12">
           <AnimatePresence mode="wait">
             {activeSection === 'profile' && (
               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="space-y-8"
               >
                  <div className="space-y-6">
                     <div className="flex items-center gap-8">
                        <div className="w-24 h-24 bg-brand-brown rounded-3xl flex items-center justify-center font-display font-black text-3xl shadow-xl overflow-hidden">
                           {profile?.photoURL ? (
                             <img src={profile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                           ) : (
                             profile?.displayName?.[0] || 'U'
                           )}
                        </div>
                        <div className="space-y-2">
                           <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Changer l'avatar</button>
                           <p className="text-[10px] text-gray-500 font-bold italic">Format recommandé: 512x512 PNG/JPG</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Nom d'affichage</label>
                          <input 
                            type="text" 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-brand-gold outline-none transition-all" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Email</label>
                          <input type="email" value={profile?.email || ''} disabled className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-3 text-sm text-gray-500 cursor-not-allowed" />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Biographie</label>
                        <textarea 
                          rows={4} 
                          value={editBio}
                          onChange={(e) => setEditBio(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-brand-gold outline-none transition-all resize-none" 
                          placeholder="Parlez-nous de vous..."
                        />
                     </div>

                     <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Instagram</label>
                          <input 
                            type="text" 
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            placeholder="@votre_compte" 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Twitter / X</label>
                          <input 
                            type="text" 
                            value={twitter}
                            onChange={(e) => setTwitter(e.target.value)}
                            placeholder="@votre_compte" 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Site web</label>
                          <input 
                            type="text" 
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://..." 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm" 
                          />
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center justify-between pt-8 border-t border-white/10">
                     <p className="text-[10px] text-gray-500 font-bold italic">Rôle actuel: <span className="text-brand-gold uppercase">{profile?.role || 'LECTEUR'}</span></p>
                     <button 
                       onClick={handleProfileSave}
                       disabled={saving}
                       className="px-8 py-3 bg-brand-gold text-brand-black font-black uppercase text-xs rounded-xl hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
                     >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : 'SAUVEGARDER'}
                     </button>
                  </div>
               </motion.div>
             )}

               {activeSection === 'artist' && (
                <motion.div 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="space-y-8"
                >
                   <div className="glass-card p-8 space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold">
                            <LayoutDashboard className="w-8 h-8" />
                         </div>
                         <div>
                            <h3 className="text-xl font-display font-black uppercase tracking-tighter">Profil Créateur</h3>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Gérez votre image de marque</p>
                         </div>
                      </div>
                      
                      <div className="space-y-6 pt-6 border-t border-white/5">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Nom d'Artiste Professionnel</label>
                           <input type="text" defaultValue={profile?.displayName} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-brand-gold outline-none transition-all" />
                        </div>
                        
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Bio Artiste (Public)</label>
                           <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-brand-gold outline-none transition-all resize-none" placeholder="Partagez votre parcours artistique..." />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Instagram</label>
                              <input type="text" placeholder="@votre_compte" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Twitter / X</label>
                              <input type="text" placeholder="@votre_compte" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm" />
                           </div>
                        </div>
                      </div>

                      <div className="p-4 bg-brand-gold/10 rounded-xl border border-brand-gold/20 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <Sparkles className="w-4 h-4 text-brand-gold" />
                            <span className="text-[10px] font-black uppercase tracking-widest">AfriStory Studio</span>
                         </div>
                         <button onClick={() => navigate('/artist')} className="text-[10px] font-black uppercase text-brand-gold hover:underline">Accéder au dashboard</button>
                      </div>
                   </div>
                </motion.div>
              )}

{activeSection === 'notifications' && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                   <div className="glass-card p-8 space-y-6">
                      <h3 className="font-display font-bold text-xl">Préférences de Notification</h3>
                      <div className="space-y-4">
                         <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                            <div>
                               <div className="text-sm font-bold">Notifications Push</div>
                               <div className="text-[10px] text-gray-500 font-bold">Recevoir des alertes sur le navigateur</div>
                            </div>
                            <ToggleSwitch enabled={notificationsEnabled} onChange={setNotificationsEnabled} />
                         </div>
                         <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                            <div>
                               <div className="text-sm font-bold">Notifications Email</div>
                               <div className="text-[10px] text-gray-500 font-bold">Recevoir des alertes par e-mail</div>
                            </div>
                            <ToggleSwitch enabled={emailNotificationsEnabled} onChange={setEmailNotificationsEnabled} />
                         </div>
                         <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                            <div>
                               <div className="text-sm font-bold">Nouveaux chapitres</div>
                               <div className="text-[10px] text-gray-500 font-bold">Alerte quand un webtoon suivi est mis à jour</div>
                            </div>
                            <ToggleSwitch enabled={newChapterNotif} onChange={setNewChapterNotif} />
                         </div>
                         <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                            <div>
                               <div className="text-sm font-bold">Messages privés</div>
                               <div className="text-[10px] text-gray-500 font-bold">Être notifié des nouveaux messages</div>
                            </div>
                            <ToggleSwitch enabled={messageNotif} onChange={setMessageNotif} />
                         </div>
                         <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                            <div>
                               <div className="text-sm font-bold">Activités sociales</div>
                               <div className="text-[10px] text-gray-500 font-bold">Likes, commentaires et mentions</div>
                            </div>
                            <ToggleSwitch enabled={socialNotif} onChange={setSocialNotif} />
                         </div>
                         <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                            <div>
                               <div className="text-sm font-bold">Offres Boutique</div>
                               <div className="text-[10px] text-gray-500 font-bold">Promotions AfriCoins et nouveaux goodies</div>
                            </div>
                            <ToggleSwitch enabled={shopNotif} onChange={setShopNotif} />
                         </div>
                      </div>
                      <div className="flex justify-end pt-4 border-t border-white/10">
                         <button 
                           onClick={handleNotificationSave}
                           disabled={saving}
                           className="px-6 py-2 bg-brand-gold text-brand-black font-black uppercase text-xs rounded-xl hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
                         >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : 'SAUVEGARDER'}
                         </button>
                      </div>
                   </div>
                </motion.div>
              )}

{activeSection === 'display' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    <div className="glass-card p-8 space-y-6">
                       <h3 className="font-display font-bold text-xl">Options d'Affichage</h3>
                       
                       <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="flex items-center gap-4">
                             {theme === 'dark' ? <Moon className="w-5 h-5 text-brand-gold" /> : <Sun className="w-5 h-5 text-brand-gold" />}
                             <div>
                                <div className="text-sm font-bold">Mode {theme === 'dark' ? 'Sombre' : 'Clair'}</div>
                                <div className="text-[10px] text-gray-500 font-bold">Changer le thème de l'interface</div>
                             </div>
                          </div>
                          <button 
                            onClick={toggleTheme}
                            className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-colors ${
                              theme === 'dark' ? 'bg-brand-brown' : 'bg-brand-gold'
                            }`}
                          >
                             <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                               theme === 'dark' ? 'translate-x-7' : 'translate-x-0'
                             }`} />
                          </button>
                       </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === 'privacy' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    <div className="glass-card p-8 space-y-6">
                       <h3 className="font-display font-bold text-xl">Privacité & Sécurité</h3>
                       
                       <div className="space-y-4">
                         <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Visibilité du Profil</label>
                           <div className="grid grid-cols-3 gap-3">
                             {(['public', 'private', 'friends'] as const).map(vis => (
                               <button
                                 key={vis}
                                 onClick={() => setProfileVisibility(vis)}
                                 className={`p-4 rounded-xl border text-sm font-bold transition-all ${
                                   profileVisibility === vis 
                                     ? 'border-brand-gold bg-brand-gold/10 text-brand-gold' 
                                     : 'border-white/10 text-gray-400 hover:border-white/30'
                                 }`}
                               >
                                 {vis === 'public' ? 'Public' : vis === 'private' ? 'Privé' : 'Amis'}
                               </button>
                             ))}
                           </div>
                         </div>

                         <div className="pt-6 border-t border-white/10 space-y-4">
                           <h4 className="text-sm font-black uppercase text-gray-400">Modifier le Mot de Passe</h4>
                           <div className="space-y-3">
                             <input type="password" placeholder="Mot de passe actuel" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm" />
                             <input type="password" placeholder="Nouveau mot de passe" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm" />
                             <input type="password" placeholder="Confirmer le nouveau mot de passe" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm" />
                           </div>
                         </div>

                         <div className="pt-6 border-t border-white/10 space-y-4">
                           <h4 className="text-sm font-black uppercase text-brand-red">Zone Dangereuse</h4>
                           <div className="p-4 bg-brand-red/5 border border-brand-red/20 rounded-xl flex items-center justify-between">
                              <div>
                                 <div className="text-sm font-bold text-brand-red">Supprimer mon Compte</div>
                                 <div className="text-[10px] text-gray-500 font-bold">Action irréversible</div>
                              </div>
                              <button 
                                onClick={handleDeleteAccount}
                                className="px-4 py-2 bg-brand-red/20 text-brand-red rounded-lg text-xs font-black uppercase"
                              >
                                Supprimer
                              </button>
                           </div>
                         </div>
                       </div>

                       <div className="flex justify-end pt-4 border-t border-white/10">
                         <button 
                           onClick={handlePrivacySave}
                           disabled={saving}
                           className="px-6 py-2 bg-brand-gold text-brand-black font-black uppercase text-xs rounded-xl hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
                         >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : 'SAUVEGARDER'}
                         </button>
                       </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === 'billing' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    <div className="glass-card p-8 space-y-6">
                       <h3 className="font-display font-bold text-xl">Abonnement Actuel</h3>
                       <div className="p-6 bg-brand-gold/10 border border-brand-gold/20 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <CreditCard className="w-8 h-8 text-brand-gold" />
                             <div>
                                <div className="text-lg font-black">{profile?.subscription?.toUpperCase() || 'FREE'}</div>
                                <div className="text-[10px] text-gray-500 font-bold">
                                  {profile?.subscriptionExpiresAt 
                                    ? `Expire le ${new Date(profile.subscriptionExpiresAt).toLocaleDateString()}` 
                                    : 'Aucun abonnement actif'}
                                </div>
                             </div>
                          </div>
                          <button 
                            onClick={() => navigate('/subscription')}
                            className="px-6 py-3 bg-brand-gold text-brand-black rounded-xl font-black text-xs uppercase"
                          >
                            {profile?.subscription ? 'Gérer' : "S'abonner"}
                          </button>
                       </div>
                    </div>

                    <div className="glass-card p-8 space-y-6">
                       <h3 className="font-display font-bold text-xl">Solde AfriCoins</h3>
                       <div className="flex items-center justify-between p-6 bg-white/5 rounded-xl">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-brand-gold/20 rounded-xl flex items-center justify-center text-brand-gold text-xl font-black">
                               {profile?.afriCoins || 0}
                             </div>
                             <div>
                                <div className="text-sm font-bold">AfriCoins disponibles</div>
                                <div className="text-[10px] text-gray-500 font-bold">Utilisés pour débloquer des chapitres premium</div>
                             </div>
                          </div>
                          <button 
                            onClick={() => navigate('/subscription')}
                            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-sm"
                          >
                            Acheter
                          </button>
                       </div>
                    </div>

                    {profile?.role && ['artist_pro', 'artist_mentor'].includes(profile.role) && (
                      <div className="glass-card p-8 space-y-6">
                         <h3 className="font-display font-bold text-xl">Revenus Artiste</h3>
                         <div className="grid grid-cols-3 gap-4">
                           <div className="p-4 bg-white/5 rounded-xl text-center">
                              <div className="text-2xl font-black text-brand-green">0€</div>
                              <div className="text-[10px] text-gray-500 font-bold uppercase">Ce mois</div>
                           </div>
                           <div className="p-4 bg-white/5 rounded-xl text-center">
                              <div className="text-2xl font-black">0€</div>
                              <div className="text-[10px] text-gray-500 font-bold uppercase">Total</div>
                           </div>
                           <div className="p-4 bg-white/5 rounded-xl text-center">
                              <div className="text-2xl font-black">0€</div>
                              <div className="text-[10px] text-gray-500 font-bold uppercase">En attente</div>
                           </div>
                         </div>
                         <button className="w-full py-3 bg-brand-gold text-brand-black rounded-xl font-black text-xs uppercase">
                           Voir les Transactions
                         </button>
                      </div>
                    )}
                  </motion.div>
                )}
            </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
