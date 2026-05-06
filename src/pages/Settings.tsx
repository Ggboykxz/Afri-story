import React, { useState } from 'react';
import { User, Bell, Shield, Eye, Palette, CreditCard, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export const Settings = () => {
  const { profile } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sections = [
    { id: 'profile', title: 'Profil Public', icon: User, desc: 'Gérez votre identité sur Nexus-Hub' },
    { id: 'notifications', title: 'Notifications', icon: Bell, desc: 'Alertes, e-mails et push' },
    { id: 'privacy', title: 'Privacité & Sécurité', icon: Shield, desc: 'Mot de passe et visibilité' },
    { id: 'display', title: 'Affichage', icon: Palette, desc: 'Mode sombre, lecteurs et polices' },
    { id: 'billing', title: 'Abonnements & Nexus-Coins', icon: CreditCard, desc: 'Historique et facturation' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Navigation */}
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

        {/* Content */}
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
                         <div className="w-24 h-24 bg-brand-brown rounded-3xl flex items-center justify-center font-display font-black text-3xl shadow-xl">
                            {profile?.displayName?.[0] || 'U'}
                         </div>
                         <div className="space-y-2">
                            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Changer l'avatar</button>
                            <p className="text-[10px] text-gray-500 font-bold italic">Format recommandé: 512x512 PNG/JPG</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Nom d'affichage</label>
                           <input type="text" defaultValue={profile?.displayName} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-brand-gold outline-none transition-all" />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Email</label>
                           <input type="email" defaultValue="user@example.com" disabled className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-3 text-sm text-gray-500 cursor-not-allowed" />
                         </div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Biographie</label>
                         <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-brand-gold outline-none transition-all resize-none" placeholder="Parlez-nous de vous..." />
                      </div>
                   </div>

                   <div className="flex items-center justify-between pt-8 border-t border-white/10">
                      <p className="text-[10px] text-gray-500 font-bold italic underline">Dernière mise à jour: Hier à 14:00</p>
                      <button 
                        onClick={handleSave}
                        className="px-8 py-3 bg-brand-gold text-brand-black font-black uppercase text-xs rounded-xl hover:scale-105 transition-all flex items-center gap-2"
                      >
                         {saved ? <Check className="w-4 h-4" /> : 'SAUVEGARDER'}
                      </button>
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
                         {[
                           { t: 'Nouveaux chapitres', d: 'Recevoir une alerte quand un webtoon suivi est mis à jour' },
                           { t: 'Messages privés', d: 'Être notifié quand vous recevez un nouveau message' },
                           { t: 'Activités sociales', d: 'Likes, commentaires et mentions sur vos publications' },
                           { t: 'Offres Boutique', d: 'Alertes sur les réductions Nexus-Coins et nouveaux goodies' },
                         ].map((item, i) => (
                           <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 group hover:border-brand-gold/30 transition-all">
                              <div>
                                 <div className="text-sm font-bold">{item.t}</div>
                                 <div className="text-[10px] text-gray-500 font-bold">{item.d}</div>
                              </div>
                              <div className="w-12 h-6 bg-brand-gold/20 rounded-full p-1 cursor-pointer">
                                 <div className="w-4 h-4 bg-brand-gold rounded-full ml-auto" />
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
