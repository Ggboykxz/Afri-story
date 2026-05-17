import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Loader2, X, GripVertical, Image, Eye, Save, Calendar, Clock } from 'lucide-react';
import { workService } from "@/lib/workService";
import { Work } from "@/lib/types";
import { useAuth } from '@/context/AuthContext';
import cloudinaryService from '@/lib/cloudinaryService';
import { Skeleton } from '@/components/common/Skeleton';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ChapterImage {
  id: string;
  file?: File;
  url?: string;
  preview?: string;
  uploading?: boolean;
  progress?: number;
}

export const AddChapter = () => {
  const { workId } = useParams<{ workId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<ChapterImage[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    number: 1,
    isPremium: false,
    price: 0,
    scheduledFor: '' as string | null,
    status: 'published' as 'published' | 'draft',
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    if (workId) {
      loadWork();
    }
  }, [workId]);

  const loadWork = async () => {
    if (!workId) return;
    try {
      const data = await workService.getWork(workId);
      setWork(data);
      const nextNumber = (data?.chapters?.length || 0) + 1;
      setFormData(prev => ({ ...prev, number: nextNumber }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addImages(files);
  };

  const addImages = (files: File[]) => {
    const newImages: ChapterImage[] = files.map((file, i) => ({
      id: `img-${Date.now()}-${i}`,
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img?.preview) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    addImages(files);
  };

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    
    const newImages = [...images];
    const dragItemImg = newImages[dragItem.current];
    newImages.splice(dragItem.current, 1);
    newImages.splice(dragOverItem.current, 0, dragItemImg);
    setImages(newImages);
    
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (img.url) {
        uploadedUrls.push(img.url);
        continue;
      }
      
      if (img.file) {
        setImages(prev => prev.map((im, idx) => 
          idx === i ? { ...im, uploading: true, progress: 0 } : im
        ));
        
        try {
          const url = await cloudinaryService.uploadChapterImage(img.file);
          uploadedUrls.push(url);
          setImages(prev => prev.map((im, idx) => 
            idx === i ? { ...im, uploading: false, progress: 100, url } : im
          ));
        } catch (err) {
          console.error('Upload error:', err);
          setImages(prev => prev.map((im, idx) => 
            idx === i ? { ...im, uploading: false } : im
          ));
        }
      }
    }
    
    return uploadedUrls;
  };

  const handlePublish = async (asDraft: boolean = false) => {
    if (!workId || !user || images.length === 0) {
      alert('Ajoutez au moins une image pour publier le chapitre.');
      return;
    }
    
    setSaving(true);
    try {
      const imageUrls = await uploadImages();
      
      const chapterData = {
        title: formData.title || `Chapitre ${formData.number}`,
        number: formData.number,
        isPremium: formData.isPremium,
        price: formData.isPremium ? formData.price : 0,
        pages: imageUrls,
        likes: 0,
        views: 0,
        createdAt: serverTimestamp(),
        publishedAt: formData.status === 'draft' || asDraft ? null : serverTimestamp(),
      };
      
      await workService.addChapter(workId, chapterData);
      
      if (formData.scheduledFor && !asDraft) {
        await updateDoc(doc(db, 'works', workId), {
          scheduledChapters: true,
        });
      }
      
      navigate(`/work/${workId}`);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la publication');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <Skeleton className="w-24 h-6" />
        <Skeleton className="w-full h-64" />
        <div className="grid grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)}
        </div>
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
  const canPublish = isOwner && ['artist_pro', 'artist_mentor', 'admin'].includes(profile?.role || '');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-32">
      <button 
        onClick={() => navigate(`/work/${workId}`)} 
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form Section */}
        <div className="lg:w-80 flex-shrink-0 space-y-6">
          <div>
            <h1 className="text-2xl font-display font-black">Nouveau Chapitre</h1>
            <p className="text-sm text-gray-400 mt-1">{work.title}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Titre du chapitre</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-brand-gold/50 transition-all"
                placeholder={`Chapitre ${formData.number}`}
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

            {canPublish && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Chapitre Premium</label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPremium}
                      onChange={e => setFormData({ ...formData, isPremium: e.target.checked })}
                      className="w-5 h-5 rounded bg-white/5 border border-white/10"
                    />
                    <span className="text-sm font-bold">AfriCoins requis</span>
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

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Programmer la publication</label>
                  <input
                    type="datetime-local"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-brand-gold/50 transition-all"
                    value={formData.scheduledFor || ''}
                    onChange={e => setFormData({ ...formData, scheduledFor: e.target.value || null })}
                  />
                </div>
              </>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-white/10">
            <button
              onClick={() => handlePublish(false)}
              disabled={saving || images.length === 0}
              className="w-full py-4 bg-brand-gold text-brand-black font-black rounded-xl text-sm uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {formData.status === 'draft' ? 'Enregistrer brouillon' : 'PUBLIER'}
            </button>
            
            <button
              onClick={() => handlePublish(true)}
              disabled={saving || images.length === 0}
              className="w-full py-3 bg-white/5 border border-white/10 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
            >
              Sauvegarder comme brouillon
            </button>
          </div>
        </div>

        {/* Images Section */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">
              Pages ({images.length})
            </h2>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-brand-black rounded-lg text-xs font-bold"
            >
              <Upload className="w-4 h-4" />
              Ajouter des images
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelect}
              className="hidden"
            />
          </div>

          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center cursor-pointer hover:border-brand-gold/30 transition-all"
          >
            <Image className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-500">Glissez-déposez vos images ici</p>
            <p className="text-[10px] text-gray-600 mt-2">ou cliquez pour sélectionner</p>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {images.map((img, index) => (
                <div
                  key={img.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={e => e.preventDefault()}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/5 group cursor-move"
                >
                  {img.preview && (
                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  )}
                  
                  <div className="absolute top-2 left-2 w-6 h-6 bg-brand-black/60 rounded-full flex items-center justify-center text-[10px] font-black">
                    {index + 1}
                  </div>
                  
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-6 h-6 text-white" />
                  </div>
                  
                  {img.uploading && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
                    </div>
                  )}
                  
                  <button
                    onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                    className="absolute top-2 right-2 w-6 h-6 bg-brand-red rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddChapter;