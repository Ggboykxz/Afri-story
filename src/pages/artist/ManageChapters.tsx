import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Trash2, Copy, Eye, Clock, History, X, CheckCircle } from 'lucide-react';
import { workService, Work } from '@/lib/workService';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/common/Skeleton';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

interface ChapterItem {
  id: string;
  number: number;
  title: string;
  viewCount?: number;
  isPremium?: boolean;
  price?: number;
  publishedAt?: any;
  createdAt?: any;
}

export const ManageChapters = () => {
  const { workId } = useParams<{ workId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [work, setWork] = useState<Work | null>(null);
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [previewChapter, setPreviewChapter] = useState<any | null>(null);
  const [historyChapter, setHistoryChapter] = useState<string | null>(null);

  useEffect(() => {
    if (workId) {
      loadData();
    }
  }, [workId]);

  const loadData = async () => {
    if (!workId) return;
    setLoading(true);
    try {
      const data = await workService.getWork(workId);
      if (data) {
        setWork(data);
        setChapters((data.chapters || []) as ChapterItem[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce chapitre ? Cette action est irréversible.')) return;
    if (!workId) return;
    
    try {
      await workService.deleteChapter(workId, chapterId);
      setChapters(prev => prev.filter(c => c.id !== chapterId));
      setMenuOpen(null);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleDuplicateChapter = async (chapterId: string) => {
    if (!workId) return;
    
    try {
      const newId = await workService.duplicateChapter(workId, chapterId);
      if (newId) {
        await loadData();
      }
      setMenuOpen(null);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la duplication');
    }
  };

  const handleTogglePublish = async (chapter: ChapterItem) => {
    if (!workId) return;
    
    try {
      const newPublishedAt = chapter.publishedAt ? null : serverTimestamp();
      await workService.updateChapter(workId, chapter.id, { publishedAt: newPublishedAt });
      await loadData();
      setMenuOpen(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="glass-card p-6 flex items-center gap-6">
            <Skeleton className="w-12 h-6" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="w-48 h-5" />
              <Skeleton variant="text" className="w-24 h-3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!work) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Œuvre non trouvée</p>
      </div>
    );
  }

  const isOwner = user?.uid === work.authorId;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      <button 
        onClick={() => navigate(`/work/${workId}`)} 
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-black">Chapitres</h1>
          <p className="text-sm text-gray-400 mt-1">{work.title} • {chapters.length} chapitres</p>
        </div>
        <button
          onClick={() => navigate(`/work/${workId}/add-chapter`)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-brand-black rounded-lg text-sm font-bold"
        >
          + NOUVEAU CHAPITRE
        </button>
      </div>

      {chapters.length === 0 ? (
        <div className="text-center py-16 glass-card border-dashed border-white/10">
          <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 font-bold">Aucun chapitre</p>
          <p className="text-sm text-gray-600 mt-2">Commencez par ajouter votre premier chapitre</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chapters.map((chapter, index) => (
            <div 
              key={chapter.id} 
              className="glass-card p-4 flex items-center gap-4 group"
            >
              <div className="w-12 text-center">
                <span className="text-2xl font-display font-black text-gray-600">
                  {String(chapter.number).padStart(2, '0')}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold truncate">{chapter.title || `Chapitre ${chapter.number}`}</h3>
                  {chapter.isPremium && (
                    <span className="px-2 py-0.5 bg-brand-gold/20 text-brand-gold text-[8px] font-black uppercase rounded">
                      PREMIUM
                    </span>
                  )}
                  {chapter.publishedAt ? (
                    <span className="px-2 py-0.5 bg-brand-green/20 text-brand-green text-[8px] font-black uppercase rounded">
                      PUBLIÉ
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-[8px] font-black uppercase rounded">
                      BROUILLON
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  {chapter.viewCount || 0} vues
                  {chapter.publishedAt && chapter.publishedAt.toDate && (
                    <span> • {chapter.publishedAt.toDate().toLocaleDateString()}</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {isOwner && (
                  <>
                    <button
                      onClick={() => setPreviewChapter(chapter)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      title="Aperçu"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/work/${workId}/edit-chapter/${chapter.id}`)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      title="Modifier"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === chapter.id ? null : chapter.id)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <span className="text-xs">•••</span>
                      </button>
                      
                      <AnimatePresence>
                        {menuOpen === chapter.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 top-full mt-2 w-48 glass-card py-2 z-50"
                          >
                            <button 
                              onClick={() => { handleDuplicateChapter(chapter.id); }}
                              className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-white/10 flex items-center gap-3"
                            >
                              <Copy className="w-4 h-4" /> Dupliquer
                            </button>
                            <button 
                              onClick={() => handleTogglePublish(chapter)}
                              className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-white/10 flex items-center gap-3"
                            >
                              <CheckCircle className="w-4 h-4" /> 
                              {chapter.publishedAt ? 'Mettre en brouillon' : 'Publier'}
                            </button>
                            <button 
                              onClick={() => { setHistoryChapter(chapter.id); setMenuOpen(null); }}
                              className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-white/10 flex items-center gap-3"
                            >
                              <History className="w-4 h-4" /> Historique
                            </button>
                            <button 
                              onClick={() => { handleDeleteChapter(chapter.id); }}
                              className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-white/10 flex items-center gap-3 text-brand-red"
                            >
                              <Trash2 className="w-4 h-4" /> Supprimer
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewChapter && (
          <ChapterPreview 
            chapter={previewChapter} 
            onClose={() => setPreviewChapter(null)}
            onEdit={() => {
              navigate(`/work/${workId}/edit-chapter/${previewChapter.id}`);
              setPreviewChapter(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {historyChapter && (
          <ChapterHistory 
            workId={workId!}
            chapterId={historyChapter}
            onClose={() => setHistoryChapter(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ChapterPreview = ({ chapter, onClose, onEdit }: { 
  chapter: any; 
  onClose: () => void;
  onEdit: () => void;
}) => {
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
        className="glass-card max-w-2xl w-full max-h-[80vh] overflow-auto p-6 relative z-10"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-black">{chapter.title || `Chapitre ${chapter.number}`}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Numéro</span>
            <span className="font-bold">{chapter.number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Premium</span>
            <span className={chapter.isPremium ? 'text-brand-gold' : 'text-gray-400'}>
              {chapter.isPremium ? `Oui (${chapter.price} AC)` : 'Non'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Vues</span>
            <span className="font-bold">{chapter.viewCount || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Statut</span>
            <span className={chapter.publishedAt ? 'text-brand-green' : 'text-yellow-500'}>
              {chapter.publishedAt ? 'Publié' : 'Brouillon'}
            </span>
          </div>
        </div>

        <button
          onClick={onEdit}
          className="w-full mt-6 py-3 bg-brand-gold text-brand-black font-black rounded-xl text-sm uppercase tracking-widest"
        >
          MODIFIER CE CHAPITRE
        </button>
      </motion.div>
    </div>
  );
};

const ChapterHistory = ({ workId, chapterId, onClose }: {
  workId: string;
  chapterId: string;
  onClose: () => void;
}) => {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [workId, chapterId]);

  const loadHistory = async () => {
    try {
      const data = await workService.getChapterHistory(workId, chapterId);
      setVersions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
        className="glass-card max-w-xl w-full max-h-[80vh] overflow-auto p-6 relative z-10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-black">Historique des versions</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="glass-card p-4">
                <Skeleton className="w-24 h-4 mb-2" />
                <Skeleton className="w-full h-3" />
              </div>
            ))}
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p>Aucune version sauvegardée</p>
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((version, i) => (
              <div key={version.id} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold">Version {versions.length - i}</span>
                  {version.createdAt?.toDate && (
                    <span className="text-[10px] text-gray-500">
                      {version.createdAt.toDate().toLocaleString()}
                    </span>
                  )}
                </div>
                {version.description && (
                  <p className="text-xs text-gray-400">{version.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ManageChapters;