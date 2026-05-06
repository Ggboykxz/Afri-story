import React, { useState } from 'react';
import { LayoutDashboard, BookOpen, MessageCircle, BarChart3, Plus, Settings, TrendingUp, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export const ArtistDashboard = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

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
          <h2 className="text-4xl md:text-5xl font-display font-black leading-tight">Devenez Créateur <br /><span className="gradient-text">AfriStory</span></h2>
          <p className="text-gray-400 text-lg">
            Rejoignez le hub créatif africain. Publiez vos premières planches sur notre espace <strong>Draft</strong> gratuitement et commencez à bâtir votre communauté.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 w-full">
           <div className="glass-card p-6 text-left space-y-4 border-brand-green/20">
              <div className="text-brand-green font-display font-bold">AfriStory Draft</div>
              <p className="text-xs text-gray-500">Pour les amateurs et débutants. Feedback constructif et liberté totale de publication.</p>
           </div>
           <div className="glass-card p-6 text-left space-y-4 border-brand-gold/20">
              <div className="text-brand-gold font-display font-bold">AfriStory Pro</div>
              <p className="text-xs text-gray-500">Pour les professionnels. Monétisation, statistiques et visibilité premium.</p>
           </div>
        </div>
        <button 
          onClick={async () => {
            if (!user) return alert("Connectez-vous d'abord");
            // Simulate role update
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
          <h1 className="text-4xl font-display font-black">Tableau de Bord</h1>
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

          {/* Active Works */}
          <div className="glass-card overflow-hidden">
             <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-display font-bold text-lg">Œuvres Récentes</h3>
                <button className="text-xs font-black uppercase text-brand-gold hover:underline">Tout voir</button>
             </div>
             <div className="divide-y divide-white/5">
                {[1, 2].map((i) => (
                  <div key={i} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-16 bg-brand-brown rounded-lg" />
                       <div>
                          <h4 className="font-bold group-hover:text-brand-gold transition-colors">Légendes d'Oyo</h4>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Épisodes : 24 • Statut : En cours</p>
                       </div>
                    </div>
                    <div className="text-right flex items-center gap-6">
                       <div className="hidden sm:block">
                          <div className="text-sm font-bold">2.4K</div>
                          <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest text-right">Vues / Semaine</div>
                       </div>
                       <button className="p-2 hover:bg-white/10 rounded-lg"><Settings className="w-4 h-4 text-gray-400" /></button>
                    </div>
                  </div>
                ))}
             </div>
             <div className="p-6 bg-white/5 text-center">
                <button className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Gérer tout le catalogue</button>
             </div>
          </div>
        </div>
      </div>
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
