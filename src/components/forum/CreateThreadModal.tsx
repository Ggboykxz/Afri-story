import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, AlertTriangle, Loader2 } from 'lucide-react';
import { forumService } from '@/lib/forumService';
import { useAuth } from '@/context/AuthContext';

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId?: string;
  onSuccess: () => void;
}

export const CreateThreadModal: React.FC<CreateThreadModalProps> = ({ isOpen, onClose, categoryId, onSuccess }) => {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!user || !profile) return;
    if (!title.trim()) { setError('Le titre est requis'); return; }
    if (!content.trim()) { setError('Le contenu est requis'); return; }
    if (title.length > 200) { setError('Le titre ne peut pas dépasser 200 caractères'); return; }
    if (content.length > 10000) { setError('Le contenu ne peut pas dépasser 10 000 caractères'); return; }

    setSubmitting(true);
    setError('');

    try {
      await forumService.createThread({
        categoryId: categoryId || 'general',
        authorId: user.uid,
        authorName: profile.displayName || 'Utilisateur',
        title: title.trim(),
        content: content.trim(),
      });
      setTitle('');
      setContent('');
      setIsSpoiler(false);
      onSuccess();
      onClose();
    } catch (err) {
      setError('Erreur lors de la création du sujet. Réessayez.');
    } finally {
      setSubmitting(false);
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
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="glass-card w-full max-w-2xl max-h-[85vh] overflow-y-auto relative z-10"
      >
        <div className="sticky top-0 bg-brand-black/80 backdrop-blur-md border-b border-white/10 p-6 flex items-center justify-between">
          <h2 className="text-xl font-display font-black">Nouveau sujet</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-brand-red/10 border border-brand-red/20 rounded-xl text-brand-red text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">Titre</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Un titre accrocheur..."
              maxLength={200}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:border-brand-gold focus:outline-none transition-colors"
            />
            <p className="text-[10px] text-gray-600 mt-1">{title.length}/200</p>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">Contenu</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Développez votre sujet..."
              rows={8}
              maxLength={10000}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:border-brand-gold focus:outline-none transition-colors resize-none"
            />
            <p className="text-[10px] text-gray-600 mt-1">{content.length}/10 000</p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-3 bg-white/5 rounded-xl">
            <input
              type="checkbox"
              checked={isSpoiler}
              onChange={e => setIsSpoiler(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-brand-gold focus:ring-brand-gold"
            />
            <span className="text-sm font-bold">Ce sujet contient des spoilers</span>
          </label>

          <button
            onClick={handleSubmit}
            disabled={submitting || !title.trim() || !content.trim()}
            className="w-full py-4 bg-brand-gold text-brand-black font-black uppercase tracking-widest rounded-xl hover:bg-brand-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {submitting ? 'Publication...' : 'Publier le sujet'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
