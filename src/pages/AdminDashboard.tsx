import React, { useState, useEffect } from 'react';
import { Shield, Clock, CheckCircle, XCircle, Users, BookOpen, AlertTriangle, ArrowRight, BarChart3, TrendingUp, Search, Ban, Eye, Trash2, Edit, Crown, DollarSign, MessageCircle, Flag, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { workService } from '@/lib/workService';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, orderBy, limit, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/common/Skeleton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export function AdminDashboard() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('pro_requests');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void; variant: 'danger' | 'warning' | 'info' }>({ open: false, title: '', message: '', onConfirm: () => {}, variant: 'warning' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (profile?.role === 'admin') {
      if (activeTab === 'pro_requests') fetchProRequests();
      else if (activeTab === 'moderation') fetchReports();
      else if (activeTab === 'users') fetchUsers();
      else if (activeTab === 'stats') fetchStats();
    }
  }, [profile, activeTab]);

  const fetchProRequests = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'verification_requests'), where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);
      setRequests(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'reports'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      setReports(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'users'), limit(100));
      const snapshot = await getDocs(q);
      setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [usersSnap, worksSnap, reportsSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'), limit(1))),
        getDocs(query(collection(db, 'works'), limit(1))),
        getDocs(query(collection(db, 'reports'), limit(1))),
      ]);
      setStats({
        totalUsers: usersSnap.size > 0 ? 'Calculating...' : 0,
        totalWorks: worksSnap.size > 0 ? 'Calculating...' : 0,
        totalReports: reportsSnap.size > 0 ? 'Calculating...' : 0,
      });
      const [userCount, worksCount, reportsCount] = await Promise.all([
        getDocs(collection(db, 'users')).then(s => s.size),
        getDocs(collection(db, 'works')).then(s => s.size),
        getDocs(query(collection(db, 'reports'), where('status', '==', 'pending'))).then(s => s.size),
      ]);
      setStats({ totalUsers: userCount, totalWorks: worksCount, pendingReports: reportsCount });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePro = async (applicationId: string, userId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Approuver la demande PRO',
      message: 'Cet utilisateur deviendra un artiste Pro certifié. Confirmer ?',
      variant: 'info',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await updateDoc(doc(db, 'users', userId), { role: 'artist_pro' });
          await updateDoc(doc(db, 'verification_requests', applicationId), { status: 'approved', reviewedBy: user?.uid, reviewedAt: serverTimestamp() });
          fetchProRequests();
        } catch (error) {
          console.error(error);
        } finally {
          setActionLoading(false);
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleRejectPro = async (applicationId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Rejeter la demande',
      message: 'Cette demande sera marquée comme rejetée.',
      variant: 'warning',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await updateDoc(doc(db, 'verification_requests', applicationId), { status: 'rejected', reviewedBy: user?.uid, reviewedAt: serverTimestamp() });
          fetchProRequests();
        } catch (error) {
          console.error(error);
        } finally {
          setActionLoading(false);
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleResolveReport = async (reportId: string, action: string) => {
    setConfirmDialog({
      open: true,
      title: action === 'dismissed' ? 'Ignorer le signalement' : 'Résoudre le signalement',
      message: 'Cette action est irréversible.',
      variant: action === 'dismissed' ? 'warning' : 'info',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await updateDoc(doc(db, 'reports', reportId), { status: action, resolvedBy: user?.uid, resolvedAt: serverTimestamp() });
          fetchReports();
        } catch (error) {
          console.error(error);
        } finally {
          setActionLoading(false);
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleBanUser = async (userId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Bannir cet utilisateur',
      message: 'Cet utilisateur sera banni de la plateforme. Confirmer ?',
      variant: 'danger',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await updateDoc(doc(db, 'users', userId), { role: 'reader', status: 'banned', bannedAt: serverTimestamp(), bannedBy: user?.uid });
          fetchUsers();
        } catch (error) {
          console.error(error);
        } finally {
          setActionLoading(false);
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    setConfirmDialog({
      open: true,
      title: 'Changer le rôle',
      message: `Changer le rôle de cet utilisateur en "${newRole}" ?`,
      variant: 'warning',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await updateDoc(doc(db, 'users', userId), { role: newRole });
          fetchUsers();
        } catch (error) {
          console.error(error);
        } finally {
          setActionLoading(false);
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      },
    });
  };

  const filteredUsers = users.filter(u =>
    (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Shield className="w-16 h-16 text-brand-red opacity-20" />
        <h1 className="text-2xl font-display font-black uppercase">Accès Refusé</h1>
        <p className="text-gray-500">Seuls les administrateurs de AfriStory peuvent accéder à cet espace.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
      <aside className="w-full md:w-64 space-y-2 flex-shrink-0">
        <div className="p-4 mb-6 bg-brand-gold/10 border border-brand-gold/20 rounded-2xl flex items-center gap-3">
           <Shield className="w-6 h-6 text-brand-gold" />
           <div className="leading-none">
              <div className="text-[10px] font-black uppercase text-brand-gold brightness-125">Administrateur</div>
              <div className="text-sm font-bold truncate">{profile.displayName}</div>
           </div>
        </div>

        {[
          { id: 'pro_requests', icon: Clock, label: 'Demandes PRO' },
          { id: 'moderation', icon: AlertTriangle, label: 'Modération' },
          { id: 'users', icon: Users, label: 'Utilisateurs' },
          { id: 'stats', icon: BarChart3, label: 'Stats Plateforme' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-brand-gold text-brand-black shadow-lg shadow-brand-gold/20' : 'text-gray-500 hover:bg-white/5'}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
            {tab.id === 'pro_requests' && requests.length > 0 && <span className="ml-auto bg-brand-red text-white text-[8px] px-1.5 py-0.5 rounded-full">{requests.length}</span>}
            {tab.id === 'moderation' && reports.length > 0 && <span className="ml-auto bg-brand-red text-white text-[8px] px-1.5 py-0.5 rounded-full">{reports.length}</span>}
          </button>
        ))}
      </aside>

      <main className="flex-1 space-y-12">
        <header className="flex items-center justify-between">
           <h2 className="text-3xl font-display font-black uppercase tracking-tighter">
             {activeTab === 'pro_requests' ? 'Candidatures Artistes Pro' : 
              activeTab === 'moderation' ? 'Modération Contenu' : 
              activeTab === 'users' ? 'Gestion Utilisateurs' : 'Analytics Global'}
           </h2>
           <div className="flex bg-white/5 border border-white/10 rounded-xl px-4 py-2">
              <Search className="w-4 h-4 text-gray-500 mr-3" />
              <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-xs font-bold w-48" />
           </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'pro_requests' && (
            <motion.div key="pro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="glass-card p-8 flex items-center gap-8">
                    <Skeleton variant="circle" className="w-20 h-20" />
                    <div className="flex-1 space-y-3">
                      <Skeleton variant="text" className="w-48 h-6" />
                      <Skeleton variant="text" className="w-32 h-4" />
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
                           <h4 className="font-display font-black uppercase text-xl">{req.artistName || req.displayName || 'Utilisateur'}</h4>
                           <p className="text-xs text-gray-500 font-bold uppercase">{req.email || '—'}</p>
                           {req.portfolioUrl && <p className="text-xs text-brand-gold font-bold truncate">{req.portfolioUrl}</p>}
                           {req.description && <p className="text-sm text-gray-400 mt-2">{req.description}</p>}
                           <div className="flex gap-2 justify-center md:justify-start pt-2">
                              <span className="bg-white/5 text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">Draft Artist</span>
                              <span className="bg-brand-gold/10 text-brand-gold text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">En attente</span>
                           </div>
                        </div>
                        <div className="flex gap-4">
                           <button onClick={() => handleApprovePro(req.id, req.artistId || req.userId)} className="bg-brand-gold text-brand-black p-4 rounded-xl hover:scale-105 transition-transform" title="Approuver">
                              <CheckCircle className="w-6 h-6" />
                           </button>
                           <button onClick={() => handleRejectPro(req.id)} className="bg-white/5 border border-white/10 text-gray-500 p-4 rounded-xl hover:bg-brand-red/10 hover:text-brand-red transition-all" title="Rejeter">
                              <XCircle className="w-6 h-6" />
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'moderation' && (
            <motion.div key="mod" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {loading ? (
                Array(5).fill(0).map((_, i) => <Skeleton key={i} className="w-full h-24 rounded-xl" />)
              ) : reports.length === 0 ? (
                <div className="glass-card p-12 text-center space-y-4">
                  <CheckCircle className="w-12 h-12 text-brand-green mx-auto" />
                  <p className="text-xs font-black uppercase tracking-widest">Aucun signalement en attente.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {reports.map(report => (
                    <div key={report.id} className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                      <div className="w-12 h-12 rounded-xl bg-brand-red/10 flex items-center justify-center flex-shrink-0">
                        <Flag className="w-6 h-6 text-brand-red" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{report.reason}</span>
                          <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full font-black uppercase">{report.targetType}</span>
                        </div>
                        <p className="text-xs text-gray-500">Signalé par: {report.reporterId}</p>
                        {report.description && <p className="text-sm text-gray-400">{report.description}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleResolveReport(report.id, 'resolved')} className="px-4 py-2 bg-brand-green/10 text-brand-green rounded-lg text-xs font-black uppercase hover:bg-brand-green/20 transition-colors">
                          Résoudre
                        </button>
                        <button onClick={() => handleResolveReport(report.id, 'dismissed')} className="px-4 py-2 bg-white/5 text-gray-400 rounded-lg text-xs font-black uppercase hover:bg-white/10 transition-colors">
                          Ignorer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {loading ? (
                Array(5).fill(0).map((_, i) => <Skeleton key={i} className="w-full h-16 rounded-xl" />)
              ) : (
                <div className="space-y-3">
                  {filteredUsers.map(u => (
                    <div key={u.id} className="glass-card p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand-brown/50 flex items-center justify-center flex-shrink-0">
                        {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full rounded-full object-cover" /> : <Users className="w-5 h-5 text-white/30" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{u.displayName || u.email || '—'}</p>
                        <p className="text-[10px] text-gray-500">{u.email}</p>
                      </div>
                      <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-white/5">{u.role}</span>
                      <div className="flex gap-2">
                        <select
                          value={u.role}
                          onChange={e => handleChangeRole(u.id, e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold focus:border-brand-gold focus:outline-none"
                        >
                          {['visitor', 'reader', 'reader_premium', 'reader_supporter', 'artist_draft', 'artist_pro', 'artist_mentor', 'moderator', 'supervisor', 'admin'].map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <button onClick={() => handleBanUser(u.id)} className="p-2 bg-white/5 rounded-lg hover:bg-brand-red/10 hover:text-brand-red transition-colors" title="Bannir">
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="w-full h-32 rounded-2xl" />)}
                </div>
              ) : stats ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="glass-card p-8 space-y-4">
                       <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Total Utilisateurs</h4>
                       <div className="text-4xl font-display font-black text-brand-gold">{stats.totalUsers}</div>
                       <div className="flex items-center gap-1 text-brand-green text-xs font-bold"><TrendingUp className="w-3 h-3" /> Actifs</div>
                    </div>
                    <div className="glass-card p-8 space-y-4">
                       <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Total Œuvres</h4>
                       <div className="text-4xl font-display font-black text-brand-green">{stats.totalWorks}</div>
                       <div className="flex items-center gap-1 text-gray-500 text-xs font-bold"><BookOpen className="w-3 h-3" /> Publiées</div>
                    </div>
                    <div className="glass-card p-8 space-y-4">
                       <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Signalements en attente</h4>
                       <div className="text-4xl font-display font-black text-brand-red">{stats.pendingReports}</div>
                       <div className="flex items-center gap-1 text-gray-500 text-xs font-bold"><Flag className="w-3 h-3" /> À traiter</div>
                    </div>
                  </div>
                  <div className="glass-card p-12 bg-brand-gold/5 border-brand-gold/20 flex flex-col justify-center items-center text-center space-y-6">
                     <Shield className="w-12 h-12 text-brand-gold" />
                     <div className="space-y-2">
                        <h3 className="text-2xl font-display font-black uppercase">Tableau de bord AfriStory</h3>
                        <p className="text-sm text-gray-400 font-medium max-w-lg">Les données sont collectées en temps réel depuis Firestore. Les statistiques détaillées seront disponibles prochainement.</p>
                     </div>
                  </div>
                </>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <ConfirmDialog
        isOpen={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        loading={actionLoading}
      />
    </div>
  );
}
