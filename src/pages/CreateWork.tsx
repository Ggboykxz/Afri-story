import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workService } from '../lib/workService';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';

export const CreateWork = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'webtoon',
    category: 'Fantaisie',
    isPro: profile?.role === 'artist_pro',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const workId = await workService.createWork(formData);
      navigate(`/work/${workId}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8">
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-display font-black">Créer une nouvelle œuvre</h1>
          <p className="text-gray-400">Remplissez les détails de votre future série.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-black uppercase tracking-widest text-gray-500">Titre de l'œuvre</label>
            <input 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-brand-gold/50 transition-all"
              placeholder="Ex: Légendes d'Oyo"
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
                <option value="webtoon">Webtoon (Scroll vertical)</option>
                <option value="bd">Bande Dessinée (Pages fixes)</option>
                <option value="novel">Roman Illustré</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-gray-500">Catégorie</label>
              <select 
                className="w-full bg-brand-black border border-white/10 rounded-xl p-4 outline-none focus:border-brand-gold/50 transition-all font-bold"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Fantaisie">Fantaisie</option>
                <option value="Action">Action</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Drame">Drame</option>
                <option value="Slice of Life">Slice of Life</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black uppercase tracking-widest text-gray-500">Synopsis</label>
            <textarea 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-brand-gold/50 transition-all min-h-[150px]"
              placeholder="Décrivez votre histoire en quelques lignes..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="p-12 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-brand-gold/30 transition-all cursor-pointer group">
             <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 group-hover:text-brand-gold transition-colors">
                <ImageIcon className="w-8 h-8" />
             </div>
             <p className="text-sm font-bold text-gray-500 uppercase tracking-widest text-center">Glissez la couverture ici <br /><span className="text-[10px] opacity-50">JPG/PNG • 3:4 Ratio conseillé</span></p>
          </div>

          <div className="flex items-center gap-4 p-4 bg-brand-gold/10 border border-brand-gold/20 rounded-2xl">
             <div className={`w-4 h-4 rounded-full ${formData.isPro ? 'bg-brand-gold' : 'bg-brand-green'}`} />
             <div>
                <p className="text-sm font-black uppercase tracking-widest">Publication {formData.isPro ? 'Pro' : 'Draft'}</p>
                <p className="text-[10px] text-gray-500 font-bold">
                  {formData.isPro 
                    ? "Votre œuvre bénéficiera de la monétisation et d'une visibilité premium." 
                    : "Votre œuvre sera publiée dans l'espace communautaire pour feedback."}
                </p>
             </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-brand-gold text-brand-black font-black rounded-2xl text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "PUBLIER L'ŒUVRE"}
          </button>
        </form>
      </div>
    </div>
  );
};
