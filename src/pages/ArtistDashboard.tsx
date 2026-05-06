import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, MessageCircle, BarChart3, Plus, Settings, TrendingUp, DollarSign, Users, Award, Sparkles, X, Briefcase, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export const ArtistDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showRecruitModal, setShowRecruitModal] = useState(false);

  const recruits: any[] = [];
  const statsData: any[] = [];

  if (profile?.role === 'reader') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center space-y-8 max-w-2xl mx-auto">
        <div className="w-24 h-24 bg-brand-gold/10 rounded-[2.5rem] flex items-center justify-center text-brand-gold relative">
          <BookOpen className="w-10 h-10" />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center text-brand-black border-4 border-brand-black">
             <Plus className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl md:text-5xl font-display font-black leading-tight">Devenez Créateur <br /><span className="gradient-text">Nexus-Hub</span></h2>
          <p className="text-gray-400 text-lg">
            Rejoignez le hub créatif africain. Publiez vos premières planches sur notre espace <strong>Draft</strong> gratuitement et commencez à bâtir votre communauté.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 w-full">
           <div className="glass-card p-6 text-left space-y-4 border-brand-green/20">
              <div className="text-brand-green font-display font-bold">Nexus-Hub Draft</div>
              <p className="text-xs text-gray-500">Pour les amateurs et débutants. Feedback constructif et liberté totale de publication.</p>
           </div>
           <div className="glass-card p-6 text-left space-y-4 border-brand-gold/20">
              <div className="text-brand-gold font-display font-bold">Nexus-Hub Pro</div>
              <p className="text-xs text-gray-500">Pour les professionnels. Monétisation, statistiques et visibilité premium.</p>
           </div>
        </div>
        <button 
          onClick={async () => {
            if (!user) return alert("Connectez-vous d'abord");
            const { doc, updateDoc } = await import('firebase/firestore');
            const { db } = await import('../lib/firebase');
            await updateDoc(doc(db, 'users', user.uid), { role: 'artist_draft' });
            window.location.reload();
          }}
          className="px-12 py-5 bg-brand-gold text-brand-black font-black rounded-2xl text-lg hover:scale-105 transition-transform shadow-xl shadow-brand-gold/20"
        >
          OUVRIR MON STUDIO DE CRÉATION
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-display font-black uppercase tracking-tighter">Tableau de Bord</h1>
          <p className="text-gray-400">Bienvenue, {profile?.displayName}. Gérez vos créations et analysez vos revenus.</p>
        </div>
        <button 
          onClick={() => navigate('/artist/new-work')}
          className="flex items-center justify-center gap-2 bg-brand-gold text-brand-black px-6 py-3 rounded-xl font-black hover:scale-105 transition-transform shadow-lg shadow-brand-gold/20"
        >
          <Plus className="w-5 h-5" />
          NOUVELLE ŒUVRE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="space-y-2">
          <NavItem icon={<LayoutDashboard />} label="Vue d'ensemble" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={<BookOpen />} label="Mes Œuvres" active={activeTab === 'works'} onClick={() => setActiveTab('works')} />
          <NavItem icon={<BarChart3 />} label="Statistiques" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
          <NavItem icon={<MessageCircle />} label="Commentaires" active={activeTab === 'comments'} onClick={() => setActiveTab('comments')} />
          <NavItem icon={<DollarSign />} label="Revenus" active={activeTab === 'revenue'} onClick={() => setActiveTab('revenue')} />
          <div className="pt-4 border-t border-white/5 mt-4">
             <NavItem icon={<Settings />} label="Paramètres" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          </div>
        </aside>

        {/* Main Content */}
        <div className="md:col-span-3 space-y-8">
          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard title="Vues Totales" value="128.4K" trend="+12%" />
              <StatCard title="Abonnés" value="12.2K" trend="+5%" />
              <StatCard title="Revenus (est.)" value="450.000 FCFA" trend="+18%" />
          </div>

          {/* Analytics Chart - Section 4.1 */}
          <div className="glass-card p-8 space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-display font-black uppercase tracking-tighter">Performance de la semaine</h3>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-brand-gold" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Revenus</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-brand-green" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Lectures</span>
                   </div>
                </div>
             </div>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={statsData}>
                      <defs>
                         <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22C55E" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 10, fontWeight: 700}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 10, fontWeight: 700}} />
                      <Tooltip 
                        contentStyle={{backgroundColor: '#1a1816', border: '1px solid #ffffff10', borderRadius: '12px'}}
                        itemStyle={{fontSize: '12px', fontWeight: '900'}}
                      />
                      <Area type="monotone" dataKey="views" stroke="#22C55E" fillOpacity={1} fill="url(#colorViews)" strokeWidth={3} />
                      <Area type="monotone" dataKey="revenue" stroke="#D4AF37" fill="transparent" strokeWidth={3} />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Active Works */}
          <div className="glass-card overflow-hidden">
             <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-display font-bold text-lg">Œuvres Récentes</h3>
                <button className="text-xs font-black uppercase text-brand-gold hover:underline">Tout voir</button>
             </div>
             <div className="divide-y divide-white/5">
                <div className="p-12 text-center text-gray-600 font-bold uppercase tracking-widest text-xs">
                   Aucune œuvre publiée pour le moment
                </div>
             </div>
             <div className="p-6 bg-white/5 text-center">
                <button className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Gérer tout le catalogue</button>
             </div>
          </div>

          {/* Collaborators Section - Section 4.1 */}
          <div className="glass-card p-8 space-y-8 mt-8">
             <div className="flex items-center justify-between">
                <div>
                   <h2 className="text-2xl font-display font-black flex items-center gap-3">
                      <Users className="w-6 h-6 text-brand-green" />
                      Collaborateurs
                   </h2>
                   <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Gérez votre équipe créative</p>
                </div>
                <button 
                  onClick={() => setShowRecruitModal(true)}
                  className="px-4 py-2 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                   AJOUTER UN COLLAB
                </button>
             </div>

             <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                   <div className="w-12 h-12 rounded-xl bg-brand-brown flex items-center justify-center font-display font-bold">M</div>
                   <div className="flex-1">
                      <h4 className="font-bold text-sm">Mamadou G.</h4>
                      <p className="text-[10px] text-brand-gold font-bold uppercase tracking-widest">Scénariste</p>
                   </div>
                   <button className="p-2 text-gray-500 hover:text-brand-red text-xs font-bold uppercase">Retirer</button>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 opacity-50">
                   <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center font-display font-bold">+</div>
                   <div className="flex-1">
                      <h4 className="font-bold text-sm italic text-gray-400">Ajouter Coloriste</h4>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Poste vacant</p>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>

    {/* Recruitment Modal */}
       <AnimatePresence>
         {showRecruitModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowRecruitModal(false)}
                className="absolute inset-0 bg-brand-black/90 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card max-w-2xl w-full p-8 relative z-10 space-y-8"
              >
                 <button onClick={() => setShowRecruitModal(false)} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                 </button>

                 <div className="space-y-2">
                    <div className="flex items-center gap-3 text-brand-gold">
                       <Briefcase className="w-6 h-6" />
                       <h3 className="text-2xl font-display font-black uppercase tracking-tighter">Recrutement de Collaborateurs</h3>
                    </div>
                    <p className="text-sm text-gray-400">Trouvez les meilleurs talents pour accélérer votre production.</p>
                 </div>

                 <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-white/10 pb-2">Talents disponibles</h4>
                       <div className="space-y-3">
                          {recruits.map((r, i) => (
                            <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between group hover:border-brand-gold/30 transition-all cursor-pointer">
                               <div>
                                  <div className="font-bold text-sm">{r.name}</div>
                                  <div className="text-[10px] text-brand-gold font-black uppercase">{r.role} • {r.exp}</div>
                               </div>
                               <button className="p-2 bg-brand-gold/10 text-brand-gold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Plus className="w-4 h-4" />
                               </button>
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-white/10 pb-2">Publier une annonce</h4>
                       <div className="p-6 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-brand-gold/30 transition-all cursor-pointer group">
                          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gray-500 group-hover:text-brand-gold transition-colors">
                             <Plus className="w-6 h-6" />
                          </div>
                          <p className="text-xs font-bold text-gray-400 text-center">Besoin d'un scénariste ou d'un coloriste spécifique ? <br /> <span className="text-brand-gold">Créez un appel d'offre</span></p>
                       </div>
                    </div>
                 </div>

                 <div className="p-4 bg-brand-brown/10 rounded-xl border border-brand-brown/20 flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-brown rounded-lg flex items-center justify-center text-brand-gold">💡</div>
                    <p className="text-[10px] text-gray-400 font-medium italic">Astuce : Les artistes certifiés Pro reçoivent 3x plus de candidatures pour leurs projets.</p>
                 </div>
              </motion.div>
           </div>
         )}
       </AnimatePresence>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
      active ? 'bg-brand-gold text-brand-black shadow-lg shadow-brand-gold/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {React.cloneElement(icon, { className: 'w-5 h-5' })}
    {label}
  </button>
);

const StatCard = ({ title, value, trend }: { title: string, value: string, trend: string }) => (
  <div className="glass-card p-6 space-y-2">
    <div className="text-xs font-black uppercase tracking-widest text-gray-500">{title}</div>
    <div className="text-3xl font-display font-black">{value}</div>
    <div className="flex items-center gap-1 text-[10px] font-bold text-brand-green">
       <TrendingUp className="w-3 h-3" />
       {trend} ce mois
    </div>
  </div>
);

const ChefHat = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 13.8V21h12v-7.2" />
        <path d="M14 2h-4v3h4V2z" />
        <path d="M3 13h18c.5 0 1-.5 1-1V9c0-3.9-3.1-7-7-7H9C5.1 2 2 5.1 2 9v3c0 .5.5 1 1 1z" />
    </svg>
);
