import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Heart, Share2, Award, User, Star, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

export const WorkDetail = () => {
  const { id } = useParams();

  // Mock data for the work
  const work = {
    id,
    title: "Légendes d'Oyo",
    author: "Sola Adeyemi",
    authorId: "auth123",
    description: "Dans un monde où les anciens dieux du panthéon Yoruba marchent parmi les hommes, un jeune guerrier doit retrouver le sceptre de Shango pour sauver son royaume d'une obscurité éternelle. Une épopée mêlant tradition et action frénétique.",
    type: "WEBTOON",
    category: "Fantaisie / Action",
    status: "EN COURS",
    isPro: true,
    views: "24.5K",
    likes: "1.2K",
    chapters: [
      { id: 'c1', number: 1, title: 'L\'Éveil du Guerrier', date: '20 Mai 2024', isPremium: false },
      { id: 'c2', number: 2, title: 'Les Plains de Savane', date: '27 Mai 2024', isPremium: false },
      { id: 'c3', number: 3, title: 'L\'Oracle d\'Ifa', date: '03 Juin 2024', isPremium: true },
      { id: 'c4', number: 4, title: 'La Colère de Shango', date: '10 Juin 2024', isPremium: true },
    ]
  };

  return (
    <div className="min-h-screen">
      {/* Header / Cover */}
      <div className="relative h-[50vh] overflow-hidden">
        <div className="absolute inset-0 bg-brand-brown opacity-20" />
        <div className="absolute inset-0 bg-linear-to-t from-brand-black via-brand-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 max-w-7xl mx-auto flex flex-col md:flex-row items-end gap-8">
          <div className="w-48 aspect-[3/4] rounded-2xl overflow-hidden glass-card shadow-2xl flex-shrink-0 -mb-24 relative z-10">
             <div className="w-full h-full bg-brand-brown/40" />
          </div>
          
          <div className="flex-1 space-y-4 mb-4">
            <div className="flex flex-wrap gap-2">
              <span className="bg-brand-gold text-brand-black text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">{work.type}</span>
              <span className="bg-white/10 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">{work.status}</span>
              {work.isPro && <span className="bg-brand-gold/20 text-brand-gold text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider border border-brand-gold/30">ARTISTE PRO</span>}
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black leading-[0.9]">{work.title}</h1>
            <div className="flex items-center gap-6 text-sm font-bold text-gray-400">
              <Link to={`/profile/${work.authorId}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <User className="w-4 h-4" />
                {work.author}
              </Link>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {work.category}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-brand-gold text-brand-black font-black rounded-xl hover:scale-105 transition-transform">
              S'ABONNER
            </button>
            <button className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-brand-gold/10 hover:border-brand-gold/50 transition-all font-bold text-sm">
              <DollarSign className="w-4 h-4 text-brand-gold" />
              DONNER
            </button>
            <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
              <Heart className="w-6 h-6" />
            </button>
            <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 md:px-12 pt-32 grid md:grid-cols-3 gap-12 pb-24">
        {/* Left Column: Chapters */}
        <div className="md:col-span-2 space-y-12">
          <section className="space-y-6">
            <h2 className="text-2xl font-display font-bold">À propos</h2>
            <p className="text-gray-400 leading-relaxed text-lg">{work.description}</p>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold">Chapitres</h2>
              <span className="text-gray-500 font-bold text-sm uppercase tracking-widest">{work.chapters.length} ÉPISODES</span>
            </div>
            
            <div className="space-y-3">
              {work.chapters.map((chapter) => (
                <Link 
                  key={chapter.id}
                  to={`/read/${work.id}/${chapter.id}`}
                  className="flex items-center justify-between p-4 glass-card hover:border-brand-gold/40 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center font-display font-bold text-gray-500 group-hover:text-brand-gold transition-colors">
                      {chapter.number}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{chapter.title}</h4>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{chapter.date}</p>
                    </div>
                  </div>
                  
                  {chapter.isPremium ? (
                    <div className="flex items-center gap-2 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                      <Star className="w-3 h-3 fill-current" />
                      Premium
                    </div>
                  ) : (
                    <button className="text-[10px] font-black uppercase text-gray-500 group-hover:text-white transition-colors">LIRE</button>
                  )}
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Stats & Author */}
        <div className="space-y-8">
          <div className="glass-card p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-display font-black text-white">{work.views}</div>
                <div className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Vues</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-display font-black text-white">{work.likes}</div>
                <div className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Likes</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">L'Artiste</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-brand-brown rounded-full border-2 border-brand-gold/30" />
              <div>
                <Link to={`/profile/${work.authorId}`} className="font-display font-bold text-lg hover:text-brand-gold transition-colors underline decoration-brand-gold/30 underline-offset-4">{work.author}</Link>
                <div className="flex items-center gap-1 text-xs text-brand-gold font-bold">
                  <Award className="w-3 h-3" />
                  Artiste Certifié
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-400">Dessinateur et illustrateur passionné par les récits mythologiques nigérians.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
