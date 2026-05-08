import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, X, Upload, ShieldCheck } from 'lucide-react';
import { workService, Work } from '@/lib/workService';
import { useAuth } from '@/context/AuthContext';
import cloudinaryService from '@/lib/cloudinaryService';
import { Skeleton } from '@/components/common/Skeleton';

type WorkStatus = 'draft' | 'published' | 'hidden' | 'archived';

export const EditWork = () => {
  const { workId } = useParams<{ workId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'WEBTOON',
    category: 'Fantaisie',
    status: 'draft' as WorkStatus,
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (workId) {
      loadWork();
    }
  }, [workId]);

  const loadWork = async () => {
    if (!workId) return;
    try {
      const data = await workService.getWork(workId);
      if (data) {
        setWork(data);
        setFormData({
          title: data.title || '',
          description: data.description || '',
          type: data.type || 'WEBTOON',
          category: data.category || 'Fantaisie',
          status: (data.status as WorkStatus) || 'draft',
        });
        setCoverPreview(data.coverURL || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    if (coverPreview && !work?.coverURL) {
      URL.revokeObjectURL(coverPreview);
    }
    setCoverPreview(null);
  };

  const handleSave = async () => {
    if (!workId || !formData.title.trim()) {
      alert('Le titre est requis');
      return;
    }
    
    setSaving(true);
    try {
      let coverURL = work?.coverURL;
      
      if (coverFile) {
        setUploadingCover(true);
        try {
          coverURL = await cloudinaryService.uploadCover(workId, coverFile);
        } catch (err) {
          console.error('Cover upload error:', err);
        }
        setUploadingCover(false);
      }
      
      await workService.updateWork(workId, {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        status: formData.status,
        coverURL,
      });
      
      alert('Modifications enregistrées !');
      navigate(`/work/${workId}`);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <Skeleton className="w-24 h-6" />
        <div className="space-y-4">
          <Skeleton variant="text" className="w-3/4 h-12" />
          <Skeleton variant="text" className="w-1/2 h-6" />
        </div>
        <div className="space-y-6">
          <Skeleton className="w-full h-16 rounded-xl" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="w-full h-16 rounded-xl" />
            <Skeleton className="w-full h-16 rounded-xl" />
          </div>
          <Skeleton className="w-full h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Œuvre non trouvée</p>
      </div>
    );
  }

  const isOwner = user?.uid === work.authorId;
  const categories = ['Fantaisie', 'Action', 'Sci-Fi', 'Romance', 'Mystère', 'Drame', 'Historique', 'Comédie', 'Slice of Life', 'Horreur'];

  if (!isOwner) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500">Vous n'avez pas l'autorisation de modifier cette œuvre.</p>
        <button onClick={() => navigate(`/work/${workId}`)} className="mt-4 text-brand-gold underline">
          Retourner à l'œuvre
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
      <button 
        onClick={() => navigate(`/work/${workId}`)} 
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-black">Modifier l'œuvre</h1>
          <p className="text-gray-400 mt-2">Mettez à jour les informations de votre création.</p>
        </div>

        <div className="glass-card p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-black uppercase tracking-widest text-gray-500">Couverture</label>
            <input 
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverSelect}
              className="hidden"
            />
            {!coverPreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-12 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-brand-gold/30 transition-all cursor-pointer"
              >
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest text-center">
                  Cliquez pour télécharger une couverture
                </p>
              </div>
            ) : (
              <div className="relative w-48 aspect-[3/4] rounded-2xl overflow-hidden">
                <img src={coverPreview} alt="Couverture" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={handleRemoveCover}
                  className="absolute top-2 right-2 p-2 bg-brand-black/80 rounded-full hover:bg-brand-red transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                {uploadingCover && (
                  <div className="absolute inset-0 bg-brand-black/60 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black uppercase tracking-widest text-gray-500">Titre *</label>
            <input
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-brand-gold/50 transition-all text-lg font-bold"
              placeholder="Titre de l'œuvre"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-gray-500">Format</label>
              <select 
                className="w-full bg-brand-black border border-white/10 rounded-xl p-4 outline-none focus:border-brand-gold/50 transition-all font-bold"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="WEBTOON">Webtoon</option>
                <option value="BD">Bande Dessinée</option>
                <option value="NOVEL">Roman Illustré</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-gray-500">Catégorie</label>
              <select 
                className="w-full bg-brand-black border border-white/10 rounded-xl p-4 outline-none focus:border-brand-gold/50 transition-all font-bold"
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
            <label className="text-sm font-black uppercase tracking-widest text-gray-500">Synopsis</label>
            <textarea 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-brand-gold/50 transition-all min-h-[150px] resize-none"
              placeholder="Décrivez votre histoire..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black uppercase tracking-widest text-gray-500">Statut de publication</label>
            <div className="grid grid-cols-3 gap-2">
              {(['draft', 'published', 'hidden'] as WorkStatus[]).map(status => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFormData({ ...formData, status })}
                  className={`p-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
                    formData.status === status 
                      ? status === 'draft' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' :
                        status === 'published' ? 'border-brand-green bg-brand-green/10 text-brand-green' :
                        'border-gray-500 bg-gray-500/10 text-gray-400'
                      : 'border-white/10 text-gray-400'
                  }`}
                >
                  {status === 'draft' ? 'Brouillon' : status === 'published' ? 'Publié' : 'Masqué'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-brand-gold/10 border border-brand-gold/20 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-brand-gold" />
            <div>
              <p className="text-sm font-black uppercase tracking-widest">
                Œuvre {work.isPro ? 'Pro' : 'Draft'}
              </p>
              <p className="text-[10px] text-gray-500">
                {work.isPro 
                  ? "Votre œuvre bénéficie de la monétisation." 
                  : "Passez au statut Pro pour activer la monétisation."}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || uploadingCover || !formData.title.trim()}
          className="w-full py-5 bg-brand-gold text-brand-black font-black rounded-2xl text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {saving || uploadingCover ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
          ENREGISTRER LES MODIFICATIONS
        </button>
      </div>
    </div>
  );
};

export default EditWork;