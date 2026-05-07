import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Plus, Search, Filter, Hash, User, Clock, ChevronRight, Bookmark } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';

interface Thread {
  id: string;
  title: string;
  author: string;
  replies: number;
  lastActive: string;
  isPinned?: boolean;
}

export function ForumCategory() {
  const { categoryId } = useParams();
  const [activeFilter, setActiveFilter] = useState('new');

  const categoryName = categoryId === 'webtoons' ? 'Webtoons & BD' : 
                      categoryId === 'artists' ? 'Espace Artistes' : 
                      categoryId === 'theories' ? 'Théories & Lore' : 'Général';

  const mockThreads: Thread[] = [
    { id: '1', title: 'Quel est votre moment préféré dans "Oyo" ?', author: 'Seko_Fan', replies: 45, lastActive: 'Il y a 5 min', isPinned: true },
    { id: '2', title: '[TUTO] Comment dessiner des décors de savane réalistes', author: 'Artist_Kojo', replies: 120, lastActive: 'Il y a 20 min' },
    { id: '3', title: 'Aide : Je ne trouve pas le bouton pour débloquer le chap 5', author: 'Newbie01', replies: 3, lastActive: 'Il y a 1h' },
    { id: '4', title: 'Review : Pourquoi le Pro-Draft est une révolution', author: 'Nexus_Critique', replies: 89, lastActive: 'Il y a 3h' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
        <Link to="/forum" className="hover:text-brand-gold transition-colors">Forums</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-white">{categoryName}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter">{categoryName}</h1>
          <p className="text-gray-500 font-medium">Discutez, partagez et découvrez autour de ce thème.</p>
        </div>
        <button className="bg-brand-gold text-brand-black text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform w-fit">
          <Plus className="w-4 h-4" /> Créer un sujet
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
           {/* Search & Tabs */}
           <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-white/5 pb-6">
              <div className="flex gap-6">
                <button onClick={() => setActiveFilter('new')} className={`text-[10px] font-black uppercase tracking-widest relative pb-2 ${activeFilter === 'new' ? 'text-white' : 'text-gray-500'}`}>
                  Nouveaux
                  {activeFilter === 'new' && <motion.div layoutId="f-tab" className="absolute bottom-0 inset-x-0 h-1 bg-brand-gold" />}
                </button>
                <button onClick={() => setActiveFilter('hot')} className={`text-[10px] font-black uppercase tracking-widest relative pb-2 ${activeFilter === 'hot' ? 'text-white' : 'text-gray-500'}`}>
                  Populaires
                  {activeFilter === 'hot' && <motion.div layoutId="f-tab" className="absolute bottom-0 inset-x-0 h-1 bg-brand-gold" />}
                </button>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                <input type="text" placeholder="Filtrer les sujets..." className="bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs w-full focus:border-brand-gold/50 transition-all outline-none" />
              </div>
           </div>

           {/* Thread List */}
           <div className="space-y-4">
             {mockThreads.map(thread => (
               <Link key={thread.id} to={`/forum/thread/${thread.id}`}>
                 <motion.div 
                   whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.03)' }}
                   className={`p-6 rounded-2xl border transition-all flex gap-6 items-center ${thread.isPinned ? 'bg-brand-gold/5 border-brand-gold/20' : 'bg-transparent border-white/5'}`}
                 >
                   <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      {thread.isPinned ? <Bookmark className="w-5 h-5 text-brand-gold fill-current" /> : <Hash className="w-5 h-5 text-gray-600" />}
                   </div>
                   
                   <div className="flex-1 space-y-2">
                     <h3 className="font-bold text-lg leading-tight group-hover:text-brand-gold">
                       {thread.title}
                     </h3>
                     <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                       <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {thread.author}</span>
                       <span className="w-1 h-1 bg-gray-700 rounded-full" />
                       <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {thread.lastActive}</span>
                     </div>
                   </div>

                   <div className="text-center w-20">
                      <div className="text-xl font-display font-black">{thread.replies}</div>
                      <div className="text-[8px] font-black uppercase text-gray-600 tracking-widest">Réponses</div>
                   </div>
                 </motion.div>
               </Link>
             ))}
           </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 space-y-8">
           <div className="glass-card p-8 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-gold">A propos</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-bold uppercase tracking-tighter">
                Cet espace est dédié aux {categoryName}. Assurez-vous de lire les règles épinglées avant de participer.
              </p>
           </div>

           <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-gold pl-2">Membres Actifs</h4>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-brand-brown border border-white/10" />
                ))}
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}
