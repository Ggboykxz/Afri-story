import React, { useState, useEffect } from 'react';
import { Shield, Clock, CheckCircle, XCircle, Users, BookOpen, AlertTriangle, ArrowRight, BarChart3, TrendingUp, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { workService } from '../lib/workService';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Skeleton } from '../components/Skeleton';

export function AdminDashboard() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('pro_requests');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchProRequests();
    }
  }, [profile]);

  const fetchProRequests = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'pro_applications'), where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(docs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePro = async (applicationId: string, userId: string) => {
    try {
      // 1. Update user role
      await updateDoc(doc(db, 'users', userId), {
        role: 'artist_pro'
      });
      // 2. Update application status
      await updateDoc(doc(db, 'pro_applications', applicationId), {
        status: 'approved',
        updatedAt: new Date()
      });
      alert('Artiste promu au statut PRO !');
      fetchProRequests();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRejectPro = async (applicationId: string) => {
    try {
      await updateDoc(doc(db, 'pro_applications', applicationId), {
        status: 'rejected',
        updatedAt: new Date()
      });
      alert('Demande rejetée.');
      fetchProRequests();
    } catch (error) {
      console.error(error);
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Shield className="w-16 h-16 text-brand-red opacity-20" />
        <h1 className="text-2xl font-display font-black uppercase">Accès Refusé</h1>
        <p className="text-gray-500">Seuls les administrateurs du Nexus peuvent accéder à cet espace.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
      {/* Sidebar */}
      <aside className="w-full md:w-64 space-y-2">
        <div className="p-4 mb-6 bg-brand-gold/10 border border-brand-gold/20 rounded-2xl flex items-center gap-3">
           <Shield className="w-6 h-6 text-brand-gold" />
           <div className="leading-none">
              <div className="text-[10px] font-black uppercase text-brand-gold brightness-125">Administrateur</div>
              <div className="text-sm font-bold truncate">{profile.displayName}</div>
           </div>
        </div>

        <button 
          onClick={() => setActiveTab('pro_requests')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'pro_requests' ? 'bg-brand-gold text-brand-black shadow-lg shadow-brand-gold/20' : 'text-gray-500 hover:bg-white/5'}`}
        >
          <Clock className="w-4 h-4" /> Demandes PRO
          {requests.length > 0 && <span className="ml-auto bg-brand-red text-white text-[8px] px-1.5 py-0.5 rounded-full">{requests.length}</span>}
        </button>
        <button 
          onClick={() => setActiveTab('moderation')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'moderation' ? 'bg-brand-gold text-brand-black shadow-lg shadow-brand-gold/20' : 'text-gray-500 hover:bg-white/5'}`}
        >
          <AlertTriangle className="w-4 h-4" /> Modération
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-brand-gold text-brand-black shadow-lg shadow-brand-gold/20' : 'text-gray-500 hover:bg-white/5'}`}
        >
          <Users className="w-4 h-4" /> Utilisateurs
        </button>
        <button 
          onClick={() => setActiveTab('stats')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'stats' ? 'bg-brand-gold text-brand-black shadow-lg shadow-brand-gold/20' : 'text-gray-500 hover:bg-white/5'}`}
        >
          <BarChart3 className="w-4 h-4" /> Stats Plateforme
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 space-y-12">
        <header className="flex items-center justify-between">
           <h2 className="text-3xl font-display font-black uppercase tracking-tighter">
             {activeTab === 'pro_requests' ? 'Candidatures Artistes Pro' : 
              activeTab === 'moderation' ? 'Modération Contenu' : 
              activeTab === 'users' ? 'Gestion Utilisateurs' : 'Analytics Global'}
           </h2>
           <div className="flex bg-white/5 border border-white/10 rounded-xl px-4 py-2">
              <Search className="w-4 h-4 text-gray-500 mr-3" />
              <input type="text" placeholder="Rechercher..." className="bg-transparent border-none outline-none text-xs font-bold w-48" />
           </div>
        </header>

        {activeTab === 'pro_requests' && (
          <div className="space-y-6">
             {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="glass-card p-8 flex items-center gap-8">
                    <Skeleton variant="circle" className="w-20 h-20" />
                    <div className="flex-1 space-y-3">
                      <Skeleton variant="text" className="w-48 h-6" />
                      <Skeleton variant="text" className="w-32 h-4" />
                      <div className="flex gap-2">
                        <Skeleton className="w-16 h-4 rounded-full" />
                        <Skeleton className="w-24 h-4 rounded-full" />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Skeleton className="w-12 h-12 rounded-xl" />
                      <Skeleton className="w-12 h-12 rounded-xl" />
                    </div>
                  </div>
                ))
             ) : requests.length === 0 ? (
               <div className="glass-card p-12 text-center border-white/5 opacity-50 space-y-4">
                  <CheckCircle className="w-12 h-12 text-gray-600 mx-auto" />
                  <p className="text-xs font-black uppercase tracking-widest">Aucune demande en attente. Tout est à jour !</p>
               </div>
             ) : (
               <div className="grid gap-6">
                  {requests.map(req => (
                    <div key={req.id} className="glass-card p-8 flex flex-col md:flex-row items-center gap-8 group">
                       <div className="w-20 h-20 rounded-2xl bg-brand-brown/50 border border-white/10 flex items-center justify-center">
                          <Users className="w-10 h-10 text-brand-gold/30" />
                       </div>
                       <div className="flex-1 space-y-1 text-center md:text-left">
                          <h4 className="font-display font-black uppercase text-xl">{req.userName || 'Utilisateur Anonyme'}</h4>
                          <p className="text-xs text-gray-500 font-bold uppercase">{req.email}</p>
                          <div className="flex gap-2 justify-center md:justify-start pt-2">
                             <span className="bg-white/5 text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">Draft Artist</span>
                             <span className="bg-brand-gold/10 text-brand-gold text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">Attente Validation</span>
                          </div>
                       </div>
                       <div className="flex gap-4">
                          <button 
                            onClick={() => handleApprovePro(req.id, req.userId)}
                            className="bg-brand-gold text-brand-black p-4 rounded-xl hover:scale-105 transition-transform"
                          >
                             <CheckCircle className="w-6 h-6" />
                          </button>
                          <button 
                            onClick={() => handleRejectPro(req.id)}
                            className="bg-white/5 border border-white/10 text-gray-500 p-4 rounded-xl hover:bg-brand-red/10 hover:text-brand-red transition-all"
                          >
                             <XCircle className="w-6 h-6" />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-12">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="glass-card p-8 space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Lecture Mensuelles</h4>
                  <div className="text-4xl font-display font-black">1.2M</div>
                  <div className="text-brand-green text-[10px] font-black flex items-center gap-2"><TrendingUp className="w-3 h-3" /> +24.5%</div>
               </div>
               <div className="glass-card p-8 space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Nexus-Coins Vendus</h4>
                  <div className="text-4xl font-display font-black">450K</div>
                  <div className="text-brand-green text-[10px] font-black flex items-center gap-2"><TrendingUp className="w-3 h-3" /> +12.8%</div>
               </div>
               <div className="glass-card p-8 space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Nouveaux Artistes</h4>
                  <div className="text-4xl font-display font-black">+84</div>
                  <div className="text-brand-red text-[10px] font-black flex items-center gap-2">Stagnation</div>
               </div>
             </div>
             
             <div className="glass-card p-12 bg-brand-gold/5 border-brand-gold/20 flex flex-col justify-center items-center text-center space-y-6">
                <Shield className="w-12 h-12 text-brand-gold" />
                <div className="space-y-2">
                   <h3 className="text-2xl font-display font-black uppercase">Sécurité du Nexus</h3>
                   <p className="text-sm text-gray-400 font-medium max-w-lg">Tous les systèmes de surveillance sont opérationnels. Aucune intrusion détectée dans les transactions Nexus-Coins.</p>
                </div>
             </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {(activeTab === 'moderation' || activeTab === 'users') && (
           <div className="py-20 text-center opacity-30 italic font-black uppercase tracking-[0.5em] text-xs">
              Module en cours d'optimisation...
           </div>
        )}
      </main>
    </div>
  );
}
