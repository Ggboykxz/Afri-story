import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, Plus, Sparkles, X, Loader2, Eye, Edit2, Trash2,
  Clock, CheckCircle, MoreVertical, FileStack, MessageCircle,
  Heart, TrendingUp, Award, UserPlus, ThumbsUp, Reply,
  DollarSign, Users, Star, ChevronDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { workService, Work } from '@/lib/workService';
import { Skeleton } from '@/components/common/Skeleton';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  artistStatsService, 
  ArtistStats, 
  commentService, 
  WorkComment,
  ChapterStats 
} from '@/lib/artistStatsService';

type WorkStatus = 'draft' | 'published' | 'hidden' | 'archived';

const PAGE_SIZE = 10;

export const ArtistDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('works');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [works, setWorks] = useState<Work[]>([]);
  const [chapterCounts, setChapterCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  
  const isDraft = profile?.role === 'artist_draft';
  const isPro = ['artist_pro', 'artist_mentor', 'admin'].includes(profile?.role || '');
  const isMentor = profile?.role === 'artist_mentor';

  const loadWorks = useCallback(async (reset = false) => {
    if (!user) return;
    
    if (reset) {
      setLoading(true);
      setHasMore(true);
      setLastDoc(null);
    }
    
    try {
      const { works: newWorks, lastDoc: newLastDoc } = await workService.getWorks({ 
        authorId: user.uid, 
        limit: PAGE_SIZE,
        lastDoc: reset ? undefined : lastDoc
      });
      
      if (reset) {
        setWorks(newWorks as Work[]);
      } else {
        setWorks(prev => [...prev, ...newWorks as Work[]]);
      }
      
      setLastDoc(newLastDoc);
      setHasMore(newWorks.length === PAGE_SIZE);
      
      const workIds = newWorks.map((w: Work) => w.id);
      const counts = await artistStatsService.getAllChapterCounts(workIds);
      setChapterCounts(prev => ({ ...prev, ...Object.fromEntries(counts) }));
      
    } catch (err) {
      console.error('Error loading works:', err);
    } finally {
      setLoading(false);
    }
  }, [user, lastDoc]);

  useEffect(() => {
    if (user) {
      loadWorks(true);
      artistStatsService.clearCache();
    }
  }, [user]);

  const handleDeleteWork = async (workId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette œuvre ? Tous les chapitres et commentaires seront également supprimés. Cette action est irréversible.')) return;
    
    try {
      setWorks(prev => prev.filter(w => w.id !== workId));
      await artistStatsService.deleteWorkWithChildren(workId);
    } catch (err) {
      console.error('Error deleting work:', err);
      alert('Erreur lors de la suppression');
      loadWorks(true);
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
          <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tighter">
            {isMentor ? 'Studio Mentor' : isPro ? 'Studio Pro' : 'Mon Studio Draft'}
          </h1>
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

      {isDraft && (
        <div className="mb-8 p-4 rounded-xl bg-brand-green/10 border border-brand-green/20 flex items-center gap-4">
          <Sparkles className="w-6 h-6 text-brand-green flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-brand-green font-bold">Bienvenue dans AfriStory Draft !</p>
            <p className="text-xs text-gray-400 mt-1">Vous pouvez publier des œuvres librement, mais sans monétisation. Passez à Pro pour accéder à la monétisation.</p>
          </div>
          <Link 
            to="/become-pro"
            className="px-4 py-2 bg-brand-gold text-brand-black rounded-lg text-xs font-bold hover:scale-105 transition-transform"
          >
            Passer Pro
          </Link>
        </div>
      )}

      {isPro && !isDraft && (
        <div className="mb-8 p-4 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center gap-4">
          <Award className="w-6 h-6 text-brand-gold flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-brand-gold font-bold">Studio Pro Activé</p>
            <p className="text-xs text-gray-400 mt-1">Accédez à la monétisation, aux statistiques avancées et à une visibilité premium.</p>
          </div>
        </div>
      )}

      {isMentor && (
        <div className="mb-8 p-4 rounded-xl bg-brand-brown/20 border border-brand-brown/40 flex items-center gap-4">
          <UserPlus className="w-6 h-6 text-brand-brown flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-brand-brown font-bold">Outils Mentor</p>
            <p className="text-xs text-gray-400 mt-1">Encadrez les artistes Draft et validez les demandes de passage Pro.</p>
          </div>
          <Link 
            to="/collaboration"
            className="px-4 py-2 bg-brand-brown text-white rounded-lg text-xs font-bold hover:scale-105 transition-transform"
          >
            Voir Mentions
          </Link>
        </div>
      )}

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
          chapterCounts={chapterCounts}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={() => loadWorks(false)}
          onRefresh={() => loadWorks(true)}
          onDelete={handleDeleteWork}
          onUpdateStatus={handleUpdateStatus}
          isDraft={isDraft}
        />
      )}

      {activeTab === 'stats' && user && (
        <StatsTab works={works} userId={user.uid} isPro={isPro} isDraft={isDraft} />
      )}

      {activeTab === 'comments' && user && works.length > 0 && (
        <CommentsTab works={works} userId={user.uid} />
      )}

      {activeTab === 'comments' && user && works.length === 0 && (
        <div className="text-center py-16 glass-card border-dashed border-white/10">
          <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 font-bold">Aucun commentaire</p>
          <p className="text-xs text-gray-600 mt-2">Créez une œuvre pour voir ses commentaires ici</p>
        </div>
      )}

      <CreateWorkModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onWorkCreated={(newWork) => {
          setWorks(prev => [newWork, ...prev]);
          setShowCreateModal(false);
        }}
        isDraft={isDraft}
        isPro={isPro}
      />
    </div>
  );
};

interface WorksTabProps {
  works: Work[];
  chapterCounts: Record<string, number>;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: WorkStatus) => void;
  isDraft: boolean;
}

const WorksTab: React.FC<WorksTabProps> = ({
  works, chapterCounts, loading, hasMore, onLoadMore, onDelete, onUpdateStatus, isDraft
}) => {
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'hidden' | 'archived'>('all');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const navigate = useNavigate();

  const filteredWorks = works.filter(w => filter === 'all' || w.status === filter);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await onLoadMore();
    setLoadingMore(false);
  };

  if (loading && works.length === 0) {
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
      <div className="flex gap-2 items-center">
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
        <div className="ml-auto text-xs text-gray-500">
          {filteredWorks.length} œuvre{filteredWorks.length > 1 ? 's' : ''}
        </div>
      </div>

      {filteredWorks.length === 0 ? (
        <div className="text-center py-16 glass-card border-dashed border-white/10">
          <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 font-bold">Aucune œuvre{filter !== 'all' ? ` ${filter}` : ''}</p>
          <Link to="/artist/new-work" className="mt-4 inline-flex items-center gap-2 text-brand-gold text-sm font-bold">
            <Plus className="w-4 h-4" /> Créer une œuvre
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {filteredWorks.map(work => (
              <div key={work.id} className="glass-card p-4 md:p-6 flex items-center gap-4 md:gap-6 group">
                <div 
                  onClick={() => navigate(`/work/${work.id}`)}
                  className="w-14 h-18 md:w-16 md:h-20 rounded-lg bg-brand-brown/40 overflow-hidden cursor-pointer flex-shrink-0"
                >
                  {work.coverURL && <img src={work.coverURL} alt="" className="w-full h-full object-cover" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm md:text-base truncate">{work.title}</h3>
                    {work.status === 'draft' && (
                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-yellow-500/20 text-yellow-500">
                        BROUILLON
                      </span>
                    )}
                    {work.status === 'published' && work.isPro && (
                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-brand-gold/20 text-brand-gold">
                        PRO
                      </span>
                    )}
                    {work.status === 'published' && !work.isPro && (
                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-brand-green/20 text-brand-green">
                        PUBLIÉ
                      </span>
                    )}
                    {work.status === 'hidden' && (
                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-gray-500/20 text-gray-400">
                        MASQUÉ
                      </span>
                    )}
                    {work.status === 'archived' && (
                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-gray-600/20 text-gray-500">
                        ARCHIVÉ
                      </span>
                    )}
                    {isDraft && work.status === 'published' && (
                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-brand-red/20 text-brand-red">
                        Non monétisable
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] md:text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <FileStack className="w-3 h-3" />
                      {chapterCounts[work.id] || 0} chap.
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {work.views || 0} vues
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {work.likes || 0}
                    </span>
                    <span className="hidden sm:inline">{work.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/artist/work/${work.id}/chapters`}
                    className="px-3 py-2 bg-brand-brown/30 text-brand-brown rounded-lg text-[10px] font-bold uppercase hover:scale-105 transition-all"
                  >
                    Gérer
                  </Link>
                  
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
                          <Link 
                            to={`/work/${work.id}/edit`}
                            className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-white/10 flex items-center gap-3"
                          >
                            <Edit2 className="w-4 h-4" /> Modifier
                          </Link>
                          <Link 
                            to={`/work/${work.id}`}
                            target="_blank"
                            className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-white/10 flex items-center gap-3"
                          >
                            <Eye className="w-4 h-4" /> Voir
                          </Link>
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
                              className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-white/10 flex items-center gap-3 text-brand-green"
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
                              <Clock className="w-4 h-4" /> Archiver
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

          {hasMore && (
            <button 
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full py-3 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-2"
            >
              {loadingMore ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Chargement...</>
              ) : (
                <><ChevronDown className="w-4 h-4" /> Charger plus</>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
};

interface StatsTabProps {
  works: Work[];
  userId: string;
  isPro: boolean;
  isDraft: boolean;
}

const StatsTab: React.FC<StatsTabProps> = ({ works, userId, isPro, isDraft }) => {
  const [stats, setStats] = useState<ArtistStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [chapterStats, setChapterStats] = useState<Record<string, ChapterStats[]>>({});
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    
    const loadInitial = async () => {
      setLoading(true);
      const data = await artistStatsService.getStats(userId, false);
      setStats(data);
      setLoading(false);
    };
    
    loadInitial();

    const unsubscribe = artistStatsService.subscribeToStats(userId, (newStats) => {
      setStats(newStats);
    });

    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    if (works.length > 0 && !selectedWorkId) {
      setSelectedWorkId(works[0].id);
    }
  }, [works]);

  useEffect(() => {
    if (selectedWorkId) {
      artistStatsService.getWorkChapterStats(selectedWorkId).then(stats => {
        setChapterStats(prev => ({ ...prev, [selectedWorkId]: stats }));
      });
    }
  }, [selectedWorkId]);

  const currentChapterStats = selectedWorkId ? chapterStats[selectedWorkId] || [] : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="Vues totales" 
          value={(stats?.totalViews || 0).toLocaleString()} 
          icon={<TrendingUp className="w-5 h-5" />}
          color="text-brand-gold"
        />
        <StatCard 
          title="Likes" 
          value={(stats?.totalLikes || 0).toLocaleString()} 
          icon={<Heart className="w-5 h-5" />}
          color="text-brand-red"
        />
        <StatCard 
          title="Chapitres" 
          value={(stats?.totalChapters || 0).toString()} 
          icon={<FileStack className="w-5 h-5" />}
          color="text-brand-green"
        />
        <StatCard 
          title="Œuvres" 
          value={(stats?.totalWorks || 0).toString()} 
          icon={<BookOpen className="w-5 h-5" />}
          color="text-brand-brown"
        />
      </div>

      {isDraft && (
        <div className="p-6 rounded-2xl bg-brand-gold/10 border border-brand-gold/20">
          <div className="flex items-center gap-4">
            <Sparkles className="w-8 h-8 text-brand-gold" />
            <div>
              <h4 className="font-bold">Passez au statut Pro</h4>
              <p className="text-xs text-gray-400 mt-1">Accédez à des statistiques détaillées et à la monétisation.</p>
            </div>
            <Link to="/become-pro" className="ml-auto px-4 py-2 bg-brand-gold text-brand-black rounded-lg text-xs font-bold hover:scale-105 transition-transform">
              En savoir plus
            </Link>
          </div>
        </div>
      )}

      {isPro && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            title="AfriCoins" 
            value={(stats?.totalAfriCoins || 0).toString()} 
            icon={<Star className="w-5 h-5" />}
            color="text-brand-gold"
          />
          <StatCard 
            title="Abonnés" 
            value={(stats?.totalSubscribers || 0).toString()} 
            icon={<Users className="w-5 h-5" />}
            color="text-brand-green"
          />
          <StatCard 
            title="Revenus" 
            value={`${(stats?.totalRevenue || 0).toFixed(2)}€`} 
            icon={<DollarSign className="w-5 h-5" />}
            color="text-brand-red"
          />
          <StatCard 
            title="Classement" 
            value={stats?.rank ? `#${stats.rank}` : '--'} 
            icon={<Award className="w-5 h-5" />}
            color="text-brand-brown"
          />
        </div>
      )}

      {works.length > 0 && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Performance par Œuvre</h3>
            {works.length > 1 && (
              <select 
                value={selectedWorkId || ''}
                onChange={(e) => setSelectedWorkId(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs"
              >
                {works.map(w => (
                  <option key={w.id} value={w.id}>{w.title}</option>
                ))}
              </select>
            )}
          </div>
          
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : currentChapterStats.length > 0 ? (
            <div className="space-y-2">
              {currentChapterStats.map(chapter => (
                <div key={chapter.chapterId} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                  <div className="w-12 text-center">
                    <span className="text-sm font-bold">#{chapter.number}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{chapter.title}</p>
                    <p className="text-[10px] text-gray-500">
                      {chapter.createdAt?.toDate?.()?.toLocaleDateString('fr-FR') || 'Date inconnue'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {chapter.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" /> {chapter.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> {chapter.comments}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">Aucun chapitre pour cette œuvre</p>
          )}
        </div>
      )}

      {stats && stats.totalViews > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-bold text-lg mb-4">Lecture estimée</h3>
          <div className="text-3xl font-display font-black text-brand-gold">
            {Math.floor((stats.totalViews || 0) * 0.7).toLocaleString()}
          </div>
          <p className="text-xs text-gray-500 mt-1">pages lues (estimation basée sur {stats.totalViews} vues)</p>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: { title: string; value: string; icon?: React.ReactNode; color?: string }) => (
  <div className="glass-card p-6 space-y-2">
    <div className={`flex items-center gap-2 ${color || 'text-gray-400'}`}>
      {icon && <span className="w-5 h-5">{icon}</span>}
      <p className="text-[10px] font-black uppercase tracking-widest">{title}</p>
    </div>
    <p className="text-2xl md:text-3xl font-display font-black">{value}</p>
  </div>
);

interface CommentsTabProps {
  works: Work[];
  userId: string;
}

const CommentsTab: React.FC<CommentsTabProps> = ({ works, userId }) => {
  const [comments, setComments] = useState<WorkComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkId, setSelectedWorkId] = useState<string>('all');
  const [filter, setFilter] = useState<'all' | 'chapter' | 'work'>('all');
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [unsubscribes, setUnsubscribes] = useState<Array<() => void>>([]);

  useEffect(() => {
    loadComments();

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [userId, works]);

  const loadComments = async () => {
    if (works.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const workIds = works.map(w => w.id);
      const allComments = await commentService.getAllArtistComments(workIds, 30);
      setComments(allComments);
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredComments = comments.filter(c => {
    if (selectedWorkId !== 'all' && c.workId !== selectedWorkId) return false;
    if (filter === 'chapter' && !c.chapterId) return false;
    if (filter === 'work' && c.chapterId) return false;
    return true;
  });

  const getWorkTitle = (workId: string) => {
    const work = works.find(w => w.id === workId);
    return work?.title || 'Œuvre inconnue';
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 items-center">
        <select 
          value={selectedWorkId}
          onChange={(e) => setSelectedWorkId(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs"
        >
          <option value="all">Toutes les œuvres</option>
          {works.map(w => (
            <option key={w.id} value={w.id}>{w.title}</option>
          ))}
        </select>
        <div className="flex gap-1">
          {(['all', 'chapter', 'work'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                filter === f ? 'bg-brand-gold text-brand-black' : 'bg-white/5 text-gray-400'
              }`}
            >
              {f === 'all' ? 'Tout' : f === 'chapter' ? 'Chapitres' : 'Œuvre'}
            </button>
          ))}
        </div>
        <div className="ml-auto text-xs text-gray-500">
          {filteredComments.length} commentaire{filteredComments.length > 1 ? 's' : ''}
        </div>
      </div>

      {filteredComments.length === 0 ? (
        <div className="text-center py-16 glass-card border-dashed border-white/10">
          <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 font-bold">Aucun commentaire</p>
          <p className="text-xs text-gray-600 mt-2">Les commentaires de vos œuvres apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComments.map(comment => (
            <div key={`${comment.workId}-${comment.id}`} className="glass-card p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold font-bold text-xs">
                  {comment.userName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm">{comment.userName}</span>
                    {comment.chapterNumber && (
                      <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-brand-gold/10 text-brand-gold">
                        Ch. {comment.chapterNumber}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{comment.content}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" /> {comment.likes || 0}
                    </span>
                    {comment.replies && comment.replies.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Reply className="w-3 h-3" /> {comment.replies.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-10 pl-4 border-l-2 border-white/10 space-y-2">
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-brand-brown/20 flex items-center justify-center text-brand-brown text-[10px]">
                        {reply.userName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs">{reply.userName}</span>
                          <span className="text-[10px] text-gray-500">{formatDate(reply.createdAt)}</span>
                        </div>
                        <p className="text-xs text-gray-300">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-[10px] text-gray-600">
                Sur : <span className="text-brand-gold">{getWorkTitle(comment.workId)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <button 
        onClick={loadComments}
        className="w-full py-3 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-2"
      >
        <Loader2 className="w-4 h-4" /> Actualiser
      </button>
    </div>
  );
};

interface CreateWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkCreated: (work: Work) => void;
  isDraft: boolean;
  isPro: boolean;
}

const CreateWorkModal: React.FC<CreateWorkModalProps> = ({ isOpen, onClose, onWorkCreated, isDraft, isPro }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'WEBTOON',
    category: 'Fantaisie',
    status: 'draft' as WorkStatus,
    isPremiumContent: false,
    earlyAccessDays: 0,
  });

  const categories = ['Fantaisie', 'Action', 'Sci-Fi', 'Romance', 'Mystère', 'Drame', 'Historique', 'Comédie', 'Slice of Life', 'Horreur'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title.trim()) return;
    
    setLoading(true);
    try {
      const workData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        status: isDraft ? 'draft' : formData.status,
        isPro: isPro,
        views: 0,
        likes: 0,
        authorId: user.uid,
        author: profile?.displayName || 'Artiste',
        isPremiumContent: isPro ? formData.isPremiumContent : false,
        earlyAccessDays: isPro ? formData.earlyAccessDays : 0,
      };
      
      const workId = await workService.createWork(workData);
      navigate(`/work/${workId}/edit`);
      onClose();
    } catch (err) {
      console.error('Error creating work:', err);
      alert('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const canPublish = isPro;

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
        className="glass-card max-w-xl w-full p-6 md:p-8 relative z-10 space-y-6 max-h-[90vh] overflow-y-auto"
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

          {isPro && (
            <>
              <div className="space-y-3 pt-2 border-t border-white/10">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPremiumContent}
                    onChange={e => setFormData({ ...formData, isPremiumContent: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-brand-gold focus:ring-brand-gold"
                  />
                  <div>
                    <span className="text-sm font-bold">Contenu Premium</span>
                    <p className="text-[10px] text-gray-500">Réservé aux abonnés premium</p>
                  </div>
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Jours d'accès anticipé</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-brand-gold/50 transition-all"
                  placeholder="0"
                  value={formData.earlyAccessDays}
                  onChange={e => setFormData({ ...formData, earlyAccessDays: parseInt(e.target.value) || 0 })}
                />
                <p className="text-[10px] text-gray-500">Nombre de jours avant que les lecteurs gratuits puissent lire</p>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Statut initial {isDraft && <span className="text-brand-green">(Draft - toujours brouillon)</span>}
            </label>
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
                disabled={!canPublish}
                className={`flex-1 p-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
                  formData.status === 'published' 
                    ? 'border-brand-green bg-brand-green/10 text-brand-green' 
                    : 'border-white/10 text-gray-400'
                } ${!canPublish ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Publié
                </div>
              </button>
            </div>
            {isDraft && (
              <p className="text-[10px] text-brand-gold">Les artistes Draft ne peuvent créer que des brouillons</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !formData.title.trim()}
            className="w-full py-4 bg-brand-gold text-brand-black font-black rounded-xl text-sm uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "CRÉER L'ŒUVRE"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ArtistDashboard;