import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, MessageCircle, BarChart3, Plus, Settings, 
  TrendingUp, DollarSign, Users, Award, Sparkles, X, Briefcase, 
  UserPlus, ShieldAlert, Loader2, ShoppingBag, Eye, Edit2, Trash2,
  Image, Calendar, Clock, CheckCircle, MoreVertical, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { workService, Work } from '../lib/workService';
import { Skeleton } from '../components/Skeleton';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { collaborationService } from '../lib/collaborationService';

type WorkStatus = 'draft' | 'published' | 'hidden' | 'archived';

export const ArtistDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('works');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const isPro = ['artist_pro', 'artist_mentor', 'admin'].includes(profile?.role || '');

  useEffect(() => {
    if (user) {
      loadWorks();
    }
  }, [user]);

  const loadWorks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await workService.getWorks({ authorId: user.uid });
      setWorks(data as Work[]);
    } catch (err) {
      console.error('Error loading works:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWork = async (workId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette œuvre ? Cette action est irréversible.')) return;
    try {
      await deleteDoc(doc(db, 'works', workId));
      setWorks(prev => prev.filter(w => w.id !== workId));
    } catch (err) {
      console.error('Error deleting work:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleUpdateStatus = async (workId: string, status: WorkStatus) => {
    try {
      await workService.updateWork(workId, { status });
      setWorks(prev => prev.map(w => w.id === workId ? { ...w, status } : w));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleWorkCreated = (newWork: Work) => {
    setWorks(prev => [newWork, ...prev]);
    setShowCreateModal(false);
  };

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
            Rejoignez le hub créatif africain. Publiez vos premières planches sur notre espace <strong>Draft</strong> gratuitement et commencez à bâtit votre communauté.
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
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tighter">Mon Studio</h1>
          <p className="text-gray-400 text-sm md:text-base">Bienvenue, {profile?.displayName}. Gérez vos créations.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 bg-brand-gold text-brand-black px-6 py-3 rounded-xl font-black hover:scale-105 transition-transform shadow-lg shadow-brand-gold/20"
        >
          <Plus className="w-5 h-5" />
          NOUVELLE ŒUVRE
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
        {['works', 'stats', 'comments'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
              activeTab === tab 
                ? 'bg-brand-gold text-brand-black' 
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'works' ? 'Mes Œuvres' : tab === 'stats' ? 'Statistiques' : 'Commentaires'}
          </button>
        ))}
      </div>

      {activeTab === 'works' && (
        <WorksTab 
          works={works} 
          loading={loading} 
          onRefresh={loadWorks}
          onDelete={handleDeleteWork}
          onUpdateStatus={handleUpdateStatus}
          onAddChapter={(workId) => navigate(`/work/${workId}/add-chapter`)}
          onEditWork={(workId) => navigate(`/work/${workId}/edit`)}
          onViewWork={(workId) => navigate(`/work/${workId}`)}
        />
      )}

      {activeTab === 'stats' && (
        <StatsTab works={works} isPro={isPro} />
      )}

      <CreateWorkModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onWorkCreated={handleWorkCreated}
      />
    </div>
  );
};

const WorksTab = ({ 
  works, loading, onRefresh, onDelete, onUpdateStatus, onAddChapter, onEditWork, onViewWork 
}: {
  works: Work[];
  loading: boolean;
  onRefresh: () => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: WorkStatus) => void;
  onAddChapter: (id: string) => void;
  onEditWork: (id: string) => void;
  onViewWork: (id: string) => void;
}) => {
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'hidden' | 'archived'>('all');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const filteredWorks = works.filter(w => filter === 'all' || w.status === filter);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="glass-card p-6 flex items-center gap-6">
            <Skeleton className="w-16 h-20" />
            <div className="flex-1 space-y-3">
              <Skeleton variant="text" className="w-48 h-6" />
              <Skeleton variant="text" className="w-24 h-4" />
            </div>
            <Skeleton className="w-20 h-8" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(['all', 'draft', 'published', 'hidden', 'archived'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              filter === f ? 'bg-white text-brand-black' : 'bg-white/5 text-gray-400'
            }`}
          >
            {f === 'all' ? 'Tout' : f === 'draft' ? 'Brouillons' : f === 'published' ? 'Publiés' : f === 'hidden' ? 'Masqués' : 'Archivés'}
          </button>
        ))}
      </div>

      {filteredWorks.length === 0 ? (
        <div className="text-center py-16 glass-card border-dashed border-white/10">
          <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 font-bold">Aucune œuvre{filter !== 'all' ? ` ${filter}` : ''}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWorks.map(work => (
            <div key={work.id} className="glass-card p-4 md:p-6 flex items-center gap-4 md:gap-6 group">
              <div 
                onClick={() => onViewWork(work.id)}
                className="w-14 h-18 md:w-16 md:h-20 rounded-lg bg-brand-brown/40 overflow-hidden cursor-pointer flex-shrink-0"
              >
                {work.coverURL && <img src={work.coverURL} alt="" className="w-full h-full object-cover" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm md:text-base truncate">{work.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                    work.status === 'published' ? 'bg-brand-green/20 text-brand-green' :
                    work.status === 'draft' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {work.status}
                  </span>
                  {!work.isPro && (
                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-brand-green/20 text-brand-green">
                      DRAFT
                    </span>
                  )}
                  {work.isPro && (
                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-brand-gold/20 text-brand-gold">
                      PRO
                    </span>
                  )}
                </div>
                <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                  {work.category} • {work.type} • {work.views || 0} vues • {work.likes || 0} likes
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAddChapter(work.id)}
                  className="px-3 py-2 bg-brand-gold text-brand-black rounded-lg text-[10px] font-black uppercase hover:scale-105 transition-all"
                >
                  + Chapitre
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(menuOpen === work.id ? null : work.id)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  <AnimatePresence>
                    {menuOpen === work.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-48 glass-card py-2 z-50"
                      >
                        <button 
                          onClick={() => { onEditWork(work.id); setMenuOpen(null); }}
                          className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-white/10 flex items-center gap-3"
                        >
                          <Edit2 className="w-4 h-4" /> Modifier
                        </button>
                        <button 
                          onClick={() => { onViewWork(work.id); setMenuOpen(null); }}
                          className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-white/10 flex items-center gap-3"
                        >
                          <Eye className="w-4 h-4" /> Voir
                        </button>
                        {work.status === 'published' ? (
                          <button 
                            onClick={() => { onUpdateStatus(work.id, 'hidden'); setMenuOpen(null); }}
                            className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-white/10 flex items-center gap-3"
                          >
                            <Eye className="w-4 h-4" /> Masquer
                          </button>
                        ) : work.status === 'hidden' ? (
                          <button 
                            onClick={() => { onUpdateStatus(work.id, 'published'); setMenuOpen(null); }}
                            className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-white/10 flex items-center gap-3"
                          >
                            <CheckCircle className="w-4 h-4" /> Publier
                          </button>
                        ) : (
                          <button 
                            onClick={() => { onUpdateStatus(work.id, 'published'); setMenuOpen(null); }}
                            className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-white/10 flex items-center gap-3 text-brand-green"
                          >
                            <CheckCircle className="w-4 h-4" /> Publier
                          </button>
                        )}
                        {work.status !== 'archived' && (
                          <button 
                            onClick={() => { onUpdateStatus(work.id, 'archived'); setMenuOpen(null); }}
                            className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-white/10 flex items-center gap-3"
                          >
                            <CheckCircle className="w-4 h-4" /> Archiver
                          </button>
                        )}
                        <button 
                          onClick={() => { onDelete(work.id); setMenuOpen(null); }}
                          className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-white/10 flex items-center gap-3 text-brand-red"
                        >
                          <Trash2 className="w-4 h-4" /> Supprimer
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StatsTab = ({ works, isPro }: { works: Work[]; isPro: boolean }) => {
  const totals = works.reduce((acc, w) => ({
    views: acc.views + (w.views || 0),
    likes: acc.likes + (w.likes || 0),
    chapters: acc.chapters + (w.chapters?.length || 0),
  }), { views: 0, likes: 0, chapters: 0 });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Vues totales" value={totals.views.toLocaleString()} />
        <StatCard title="Likes" value={totals.likes.toLocaleString()} />
        <StatCard title="Chapitres" value={totals.chapters.toString()} />
        <StatCard title="Œuvres" value={works.length.toString()} />
      </div>

      {!isPro && (
        <div className="p-6 rounded-2xl bg-brand-gold/10 border border-brand-gold/20">
          <div className="flex items-center gap-4">
            <Sparkles className="w-8 h-8 text-brand-gold" />
            <div>
              <h4 className="font-bold">Passez au statut Pro</h4>
              <p className="text-xs text-gray-400 mt-1">Accédez à des statistiques détaillées et à la monétisation.</p>
            </div>
            <button onClick={() => window.location.href = '/become-pro'} className="ml-auto px-4 py-2 bg-brand-gold text-brand-black rounded-lg text-xs font-bold">
              En savoir plus
            </button>
          </div>
        </div>
      )}

      {works.length > 0 && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-lg">Performance par œuvre</h3>
          {works.map(work => (
            <div key={work.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
              <div className="w-10 h-12 bg-brand-brown/40 rounded">
                {work.coverURL && <img src={work.coverURL} alt="" className="w-full h-full object-cover rounded" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{work.title}</p>
                <p className="text-[10px] text-gray-500">{work.chapters?.length || 0} chapitres</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{work.views?.toLocaleString() || 0}</p>
                <p className="text-[8px] text-gray-500 uppercase">vues</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value }: { title: string; value: string }) => (
  <div className="glass-card p-6">
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">{title}</p>
    <p className="text-3xl font-display font-black">{value}</p>
  </div>
);

const CreateWorkModal = ({ isOpen, onClose, onWorkCreated }: {
  isOpen: boolean;
  onClose: () => void;
  onWorkCreated: (work: Work) => void;
}) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'WEBTOON',
    category: 'Fantaisie',
    status: 'draft' as WorkStatus,
  });

  const categories = ['Fantaisie', 'Action', 'Sci-Fi', 'Romance', 'Mystère', 'Drame', 'Historique', 'Comédie', 'Slice of Life', 'Horreur'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title.trim()) return;
    
    setLoading(true);
    try {
      const workId = await workService.createWork({
        ...formData,
        isPro: profile?.role === 'artist_pro',
        views: 0,
        likes: 0,
        authorId: user.uid,
        author: profile?.displayName || 'Artiste',
      });
      
      navigate(`/work/${workId}/edit`);
      onClose();
    } catch (err) {
      console.error('Error creating work:', err);
      alert('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand-black/90 backdrop-blur-md"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-card max-w-xl w-full p-6 md:p-8 relative z-10 space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-display font-black">Nouvelle Œuvre</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Titre *</label>
            <input
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-brand-gold/50 transition-all"
              placeholder="Ex: Légendes d'Oyo"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Format</label>
              <select
                className="w-full bg-brand-black border border-white/10 rounded-xl p-3 outline-none focus:border-brand-gold/50 transition-all"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="WEBTOON">Webtoon</option>
                <option value="BD">Bande Dessinée</option>
                <option value="NOVEL">Roman Illustré</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Catégorie</label>
              <select
                className="w-full bg-brand-black border border-white/10 rounded-xl p-3 outline-none focus:border-brand-gold/50 transition-all"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Synopsis</label>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-brand-gold/50 transition-all min-h-[100px] resize-none"
              placeholder="Décrivez votre histoire..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Statut initial</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'draft' })}
                className={`flex-1 p-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
                  formData.status === 'draft' 
                    ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' 
                    : 'border-white/10 text-gray-400'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  Brouillon
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'published' })}
                className={`flex-1 p-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
                  formData.status === 'published' 
                    ? 'border-brand-green bg-brand-green/10 text-brand-green' 
                    : 'border-white/10 text-gray-400'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Publié
                </div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.title.trim()}
            className="w-full py-4 bg-brand-gold text-brand-black font-black rounded-xl text-sm uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'CRÉER L\'ŒUVRE'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ArtistDashboard;