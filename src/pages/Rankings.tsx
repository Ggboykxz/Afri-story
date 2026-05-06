import React, { useState } from 'react';
import { Award, TrendingUp, Star, Eye, Calendar, Filter, ChevronRight, Trophy, Flame, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export const Rankings = () => {
  const [timeframe, setTimeframe] = useState('Semaine');
  const [category, setCategory] = useState('Tous');

  const rankData: any[] = [];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-16">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-8">
         <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-gold/10 text-brand-gold rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-gold/20">
               <Trophy className="w-3 h-3" />
               Hall of Fame
            </div>
            <h1 className="text-5xl font-display font-black uppercase tracking-tighter leading-none">
               Classements <br /> <span className="text-gray-500">Nexus-Hub</span>
            </h1>
         </div>
         <div className="flex flex-wrap gap-4">
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
               {['Semaine', 'Mois', 'Annee'].map(t => (
                 <button 
                   key={t}
                   onClick={() => setTimeframe(t)}
                   className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${timeframe === t ? 'bg-brand-gold text-brand-black' : 'text-gray-400 hover:text-white'}`}
                 >
                    {t}
                 </button>
               ))}
            </div>
         </div>
      </section>

      {/* Podium - Top 3 */}
      {rankData.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
           {/* 2nd Place */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="order-2 md:order-1 glass-card p-8 text-center space-y-6 border-brand-blue/30 relative"
           >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center text-white font-display font-black shadow-xl">2</div>
              <div className="w-40 h-40 bg-brand-blue/20 rounded-2xl mx-auto overflow-hidden">
                 <div className="w-full h-full bg-brand-blue opacity-50" />
              </div>
              <div>
                 <h3 className="text-xl font-display font-black uppercase tracking-tighter">{rankData[1]?.title}</h3>
                 <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{rankData[1]?.author}</p>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs font-black">
                 <div className="flex items-center gap-1 text-brand-blue"><Eye className="w-4 h-4" /> {rankData[1]?.views}</div>
                 <div className="flex items-center gap-1 text-brand-gold"><Star className="w-4 h-4 fill-current" /> {rankData[1]?.rating}</div>
              </div>
           </motion.div>

           {/* 1st Place */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="order-1 md:order-2 glass-card p-10 text-center space-y-6 border-brand-gold bg-linear-to-b from-brand-gold/10 to-transparent relative md:scale-110 shadow-2xl z-10"
           >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-brand-gold rounded-full flex items-center justify-center text-brand-black text-2xl font-display font-black shadow-xl">1</div>
              <div className="w-48 h-48 bg-brand-gold/20 rounded-2xl mx-auto overflow-hidden shadow-2xl">
                 <div className="w-full h-full bg-brand-gold opacity-50" />
              </div>
              <div className="space-y-1">
                 <div className="text-brand-gold text-[10px] font-black uppercase tracking-[0.2em] mb-2 flex items-center justify-center gap-2">
                    <Flame className="w-3 h-3 fill-current" />
                    LÉGENDE DU MOIS
                 </div>
                 <h3 className="text-2xl font-display font-black uppercase tracking-tighter">{rankData[0]?.title}</h3>
                 <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{rankData[0]?.author}</p>
              </div>
              <div className="flex items-center justify-center gap-6 text-sm font-black">
                 <div className="flex items-center gap-2 text-brand-gold"><Eye className="w-5 h-5" /> {rankData[0]?.views}</div>
                 <div className="flex items-center gap-2 text-brand-gold"><Star className="w-5 h-5 fill-current" /> {rankData[0]?.rating}</div>
              </div>
           </motion.div>

           {/* 3rd Place */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="order-3 glass-card p-8 text-center space-y-6 border-brand-green/30 relative"
           >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-brand-green rounded-full flex items-center justify-center text-white font-display font-black shadow-xl">3</div>
              <div className="w-40 h-40 bg-brand-green/20 rounded-2xl mx-auto overflow-hidden">
                 <div className="w-full h-full bg-brand-green opacity-50" />
              </div>
              <div>
                 <h3 className="text-xl font-display font-black uppercase tracking-tighter">{rankData[2]?.title}</h3>
                 <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{rankData[2]?.author}</p>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs font-black">
                 <div className="flex items-center gap-1 text-brand-green"><Eye className="w-4 h-4" /> {rankData[2]?.views}</div>
                 <div className="flex items-center gap-1 text-brand-gold"><Star className="w-4 h-4 fill-current" /> {rankData[2]?.rating}</div>
              </div>
           </motion.div>
        </section>
      )}

      {rankData.length === 0 && (
        <div className="glass-card p-24 text-center space-y-6">
           <Trophy className="w-16 h-16 text-white/5 mx-auto" />
           <h3 className="text-2xl font-display font-black uppercase">Le classement attend ses premiers héros</h3>
           <p className="text-gray-500 max-w-sm mx-auto">Publiez votre œuvre et mobilisez votre communauté pour apparaître dans le Top légendaire.</p>
        </div>
      )}

      {/* Detailed List */}
      <section className="space-y-8">
         <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-8">
               {['Populaires', 'Mieux Notes', 'Nouveautes', 'Merites'].map(f => (
                 <button 
                  key={f}
                  onClick={() => setCategory(f)}
                  className={`text-sm font-black uppercase tracking-widest transition-colors ${category === f ? 'text-brand-gold' : 'text-gray-500 hover:text-white'}`}
                 >
                   {f}
                 </button>
               ))}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
               <Filter className="w-4 h-4" />
               Filtrer par Genre
            </div>
         </div>

         <div className="space-y-4">
            {rankData.map((item, index) => (
              <motion.div 
                key={item.id}
                whileHover={{ x: 10 }}
                className="glass-card p-6 flex items-center justify-between group hover:border-brand-gold/30 transition-all cursor-pointer"
              >
                 <div className="flex items-center gap-8">
                    <span className="w-8 font-display font-black text-2xl text-gray-800 group-hover:text-brand-gold transition-colors">{index + 1}</span>
                    <div className="flex items-center gap-6">
                       <div className={`w-16 h-20 rounded-xl ${item.cover} overflow-hidden shadow-lg`} />
                       <div>
                          <h4 className="font-bold text-lg group-hover:text-brand-gold transition-colors">{item.title}</h4>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{item.author}</p>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-12">
                    <div className="hidden md:flex flex-col items-end">
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Score de Tendance</span>
                       <div className="flex items-center gap-2 text-brand-gold font-display font-black">
                          {item.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : item.trend === 'down' ? <TrendingUp className="w-4 h-4 rotate-180 text-brand-red" /> : <div className="w-4 h-0.5 bg-gray-500" />}
                          +{(Math.random() * 100).toFixed(1)}%
                       </div>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-sm font-black text-white">{item.views}</span>
                       <span className="text-[10px] text-gray-500 font-bold uppercase">Lectures</span>
                    </div>
                    <Link to={`/work/${item.id}`} className="p-3 bg-white/5 rounded-xl group-hover:bg-brand-gold group-hover:text-brand-black transition-all">
                       <ChevronRight className="w-5 h-5" />
                    </Link>
                 </div>
              </motion.div>
            ))}
         </div>

         <button className="w-full py-6 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 hover:border-brand-gold transition-all text-gray-400">
            VOIR LE TOP 50 COMPLET
         </button>
      </section>
    </div>
  );
};
