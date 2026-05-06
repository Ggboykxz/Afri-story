import React from 'react';
import { motion } from 'motion/react';
import { ChefHat, TrendingUp, Sparkles, BookOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Home = () => {
  return (
    <div className="pb-24">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-b from-brand-black/20 via-brand-black/60 to-brand-black z-10" />
          <div className="grid grid-cols-4 gap-4 rotate-12 scale-150 opacity-20">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-brand-brown rounded-xl h-[400px] shadow-2xl" />
            ))}
          </div>
        </div>

        <div className="relative z-20 max-w-4xl text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/20 px-4 py-2 rounded-full text-brand-gold text-sm font-medium"
          >
            <Sparkles className="w-4 h-4" />
            <span>Nouveauté : Découvrez AfriStory Draft</span>
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter leading-[0.9]">
            RACONTÉ PAR <br />
            <span className="gradient-text">L'AFRIQUE</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            La destination ultime pour les webtoons, BD et romans illustrés panafricains. 
            Donnez vie à vos histoires.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-brand-gold text-brand-black font-black rounded-2xl hover:bg-white transition-all transform hover:-translate-y-1 shadow-lg shadow-brand-gold/10">
              COMMENCER À LIRE
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all">
              DEVENIR CRÉATEUR
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-6 md:px-12 space-y-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <TrendingUp className="w-6 h-6 text-brand-gold" />
            <h2 className="text-3xl font-display font-bold">Populaires en ce moment</h2>
          </div>
          <Link to="/explore" className="text-brand-gold text-sm font-bold hover:underline">Voir tout</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {mockWorks.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>
      </section>

      {/* Two Poles Section */}
      <section className="px-6 md:px-12 mt-32 grid md:grid-cols-2 gap-8">
        <div className="glass-card p-12 space-y-6 group hover:border-brand-gold/30 transition-all cursor-pointer">
          <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold font-display text-2xl font-bold">PRO</div>
          <h3 className="text-4xl font-display font-bold">AfriStory Pro</h3>
          <p className="text-gray-400">Pour les professionnels. Monétisez vos œuvres, accédez à des statistiques avancées et construisez votre empire médiatique.</p>
          <ul className="space-y-3 text-sm text-gray-500">
            <li>• Part de revenus de 70% à 90%</li>
            <li>• Micro-transactions (AfriCoins)</li>
            <li>• Badge Certifié</li>
          </ul>
        </div>
        <div className="glass-card p-12 space-y-6 group hover:border-brand-green/30 transition-all cursor-pointer">
          <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green font-display text-2xl font-bold">DRAFT</div>
          <h3 className="text-4xl font-display font-bold">AfriStory Draft</h3>
          <p className="text-gray-400">L'espace communautaire. Publiez librement, recevez des feedbacks et progressez vers le statut Pro.</p>
          <ul className="space-y-3 text-sm text-gray-500">
            <li>• Publication gratuite et illimitée</li>
            <li>• Ateliers et concours</li>
            <li>• Système de mentorat Pro</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

const WorkCard = ({ work }: { work: any }) => {
  const navigate = useNavigate();
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      onClick={() => navigate(`/work/${work.id}`)}
      className="group flex flex-col gap-3 cursor-pointer"
    >
      <div className="aspect-[3/4] rounded-2xl overflow-hidden glass-card relative shadow-xl">
        <div className="absolute top-3 left-3 z-10 bg-brand-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold border border-white/10 uppercase tracking-widest leading-none">
          {work.type}
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-brand-black via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <button className="w-full py-2 bg-brand-gold text-brand-black text-xs font-black rounded-lg">LIRE MAINTENANT</button>
        </div>
        <div className="w-full h-full bg-brand-brown" />
      </div>
      <div className="space-y-1">
        <h4 className="font-display font-bold leading-tight line-clamp-1">{work.title}</h4>
        <p className="text-xs text-gray-500">{work.author}</p>
        <div className="flex items-center gap-3 text-[10px] text-gray-600 font-bold">
          <span>{work.views} VUES</span>
          <span className="w-1 h-1 bg-gray-700 rounded-full" />
          <span className="text-brand-gold">{work.category}</span>
        </div>
      </div>
    </motion.div>
  );
};

const mockWorks = [
  { id: '1', title: 'Légendes d\'Oyo', author: 'Sola Adeyemi', type: 'WEBTOON', views: '24K', category: 'Fantaisie', cover: '' },
  { id: '2', title: 'Cyber-Dakar 2077', author: 'Mariama Diop', type: 'BD', views: '15K', category: 'Sci-Fi', cover: '' },
  { id: '3', title: 'L\'Esprit du Fleuve', author: 'Koffi Mensah', type: 'ROMAN', views: '8K', category: 'Mystère', cover: '' },
  { id: '4', title: 'Justice de Fer', author: 'Buchi Onyebuchi', type: 'WEBTOON', views: '42K', category: 'Action', cover: '' },
  { id: '5', title: 'Soleil de Minuit', author: 'Fatou Keita', type: 'BD', views: '19K', category: 'Drame', cover: '' },
];
