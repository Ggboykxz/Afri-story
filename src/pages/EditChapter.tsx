import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Image, X, Trash2, Eye } from 'lucide-react';
import { workService } from '../lib/workService';
import { useAuth } from '../context/AuthContext';
import cloudinaryService from '../lib/cloudinaryService';
import { Skeleton } from '../components/Skeleton';
import { motion } from 'framer-motion';

interface ChapterImage {
  id: string;
  url: string;
}

export const EditChapter = () => {
  const { workId, chapterId } = useParams<{ workId: string; chapterId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [chapter, setChapter] = useState<any>(null);
  const [work, setWork] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<ChapterImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    number: 1,
    isPremium: false,
    price: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (workId && chapterId) {
      loadData();
    }
  }, [workId, chapterId]);

  const loadData = async () => {
    if (!workId || !chapterId) return;
    setLoading(true);
    try {
      const [chapterData, workData] = await Promise.all([
        workService.getChapter(workId, chapterId),
        workService.getWork(workId),
      ]);
      
      if (chapterData) {
        setChapter(chapterData);
        setFormData({
          title: chapterData.title || '',
          number: chapterData.number || 1,
          isPremium: chapterData.isPremium || false,
          price: chapterData.price || 0,
        });
        setImages(chapterData.images?.map((url: string, i: number) => ({ id: `img-${i}`, url })) || []);
      }
      if (workData) {
        setWork(workData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map(f => URL.createObjectURL(f));
    setNewImages(prev => [...prev, ...files]);
    setNewImagePreviews(prev => [...prev, ...previews]);
  };

  const handleRemoveNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSave = async () => {
    if (!workId || !chapterId) return;
    
    setSaving(true);
    try {
      const uploadedUrls: string[] = [];
      
      for (const file of newImages) {
        const url = await cloudinaryService.uploadChapterImage(file);
        if (url) uploadedUrls.push(url);
      }
      
      const allImages = [...images.map(i => i.url), ...uploadedUrls];
      
      await workService.updateChapter(workId, chapterId, {
        ...formData,
        images: allImages,
      });

      await workService.saveChapterVersion(workId, chapterId, {
        description: 'Modification du chapitre',
        imagesCount: allImages.length,
      });
      
      alert('Chapitre mis à jour !');
      navigate(`/work/${workId}`);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        <Skeleton className="w-24 h-6" />
        <Skeleton className="w-full h-48" />
        <div className="grid grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!chapter || !work) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Chapitre non trouvé</p>
      </div>
    );
  }

  const isOwner = user?.uid === work.authorId;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-32">
      <button 
        onClick={() => navigate(`/work/${workId}/chapters`)} 
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux chapitres
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form */}
        <div className="lg:w-72 flex-shrink-0 space-y-6">
          <div>
            <h1 className="text-2xl font-display font-black">Modifier Chapitre</h1>
            <p className="text-sm text-gray-400 mt-1">{work.title}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Titre</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-brand-gold/50 transition-all"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Numéro</label>
              <input
                type="number"
                min="1"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-brand-gold/50 transition-all"
                value={formData.number}
                onChange={e => setFormData({ ...formData, number: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPremium}
                  onChange={e => setFormData({ ...formData, isPremium: e.target.checked })}
                  className="w-5 h-5 rounded bg-white/5 border border-white/10"
                />
                <span className="text-sm font-bold">Chapitre Premium</span>
              </label>
            </div>

            {formData.isPremium && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Prix (AfriCoins)</label>
                <input
                  type="number"
                  min="1"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-brand-gold/50 transition-all"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                />
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-brand-gold text-brand-black font-black rounded-xl text-sm uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            ENREGISTRER
          </button>
        </div>

        {/* Images */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">
              Pages ({images.length + newImages.length})
            </h2>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-brand-black rounded-lg text-xs font-bold"
            >
              + Ajouter
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleAddNewImages}
              className="hidden"
            />
          </div>

          {images.length === 0 && newImages.length === 0 && (
            <div className="text-center py-16 glass-card border-dashed border-white/10">
              <Image className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 font-bold">Aucune image</p>
            </div>
          )}

          {images.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Images existantes</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {images.map((img, index) => (
                  <div key={img.id} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/5 group">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 w-6 h-6 bg-brand-black/60 rounded-full flex items-center justify-center text-[10px] font-black">
                      {index + 1}
                    </div>
                    <button
                      onClick={() => handleRemoveExistingImage(img.id)}
                      className="absolute top-2 right-2 w-6 h-6 bg-brand-red rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {newImages.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-green">Nouvelles images à ajouter</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {newImagePreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/5 group">
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 w-6 h-6 bg-brand-green rounded-full flex items-center justify-center text-[10px] font-black text-white">
                      +{images.length + index + 1}
                    </div>
                    <button
                      onClick={() => handleRemoveNewImage(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-brand-red rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditChapter;