import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, TrendingUp, Users, Plus, Hash, ChevronRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { id: 'webtoons', name: 'Webtoons & BD', description: 'Discutez de vos oeuvres préférées et des dernières sorties.', icon: MessageCircle, count: '1.2K', color: 'text-brand-gold' },
  { id: 'artists', name: 'Espace Artistes', description: 'Partagez vos techniques, demandez des avis et progressez ensemble.', icon: Zap, count: '850', color: 'text-brand-green' },
  { id: 'theories', name: 'Théories & Lore', description: 'Partagez vos théories les plus folles sur les univers du Nexus.', icon: Hash, count: '420', color: 'text-purple-400' },
  { id: 'general', name: 'Général', description: 'Pour tout ce qui ne rentre pas ailleurs.', icon: Users, count: '2.5K', color: 'text-blue-400' },
];

export function ForumHome() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-12">
      {/* Header */}
      <section className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter">
          Nexus <span className="gradient-text">Forums</span>
        </h1>
        <p className="text-gray-400 max-w-2xl text-lg font-medium">
          L'agora du continent. Échangez avec des milliers de passionnés et créateurs.
        </p>
      </section>

      {/* Grid Categories */}
      <div className="grid md:grid-cols-2 gap-6">
        {CATEGORIES.map((cat) => (
          <Link key={cat.id} to={`/forum/category/${cat.id}`}>
            <motion.div 
              whileHover={{ y: -5, borderColor: 'rgba(196, 160, 108, 0.3)' }}
              className="glass-card p-8 group cursor-pointer border border-white/5 h-full flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${cat.color}`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-black uppercase tracking-tight group-hover:text-brand-gold transition-colors">{cat.name}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mt-2">{cat.description}</p>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>{cat.count} Discussions</span>
                  <span className="w-1 h-1 bg-gray-700 rounded-full" />
                  <span className="text-brand-gold">15 Actifs</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-brand-gold transition-colors" />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Trending / Recent Topics */}
      <section className="grid lg:grid-cols-3 gap-12 pt-12 border-t border-white/5">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-black uppercase tracking-tight flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-brand-gold" />
              Discussions Populaires
            </h2>
            <button className="bg-brand-gold text-brand-black text-[10px] font-black px-4 py-2 rounded-lg uppercase tracking-widest flex items-center gap-2">
              <Plus className="w-3 h-3" /> Nouveau Sujet
            </button>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-full bg-brand-brown flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <h4 className="font-bold group-hover:text-brand-gold transition-colors cursor-pointer">
                    Théorie : L'origine secrète du masque dans "The Last Nomad" ?
                  </h4>
                  <p className="text-xs text-gray-500">Par <span className="text-gray-300">Amani_Arts</span> • Il y a 2 heures</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black">24</div>
                  <div className="text-[8px] font-black uppercase text-gray-600 tracking-widest">Réponses</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight">Top Contributeurs</h2>
          <div className="glass-card p-6 space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-black text-brand-gold">
                  {i}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-black uppercase">User_Name_{i}</div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase">1.2K Points de Karma</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-black uppercase text-brand-gold tracking-widest">Guide du Forum</h4>
            <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-tighter">
              Restez respectueux, évitez le spoil sans balise, et aidez les nouveaux arrivants !
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
