import React, { useState } from 'react';
import { MessageSquare, Users, ShieldAlert, Sparkles, MessageCircle, Send, Loader2, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { workService } from '../lib/workService';
import { motion, AnimatePresence } from 'motion/react';

export const Forum = () => {
  const { user, profile } = useAuth();
  const [posting, setPosting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState("");

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPost.trim()) return;
    setPosting(true);
    try {
      await workService.postInForum('general_1', newPost, profile?.displayName || "Anonyme");
      setNewPost("");
      setShowModal(false);
    } catch (error) {
      console.error(error);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/20 px-3 py-1 rounded-full text-brand-gold text-[10px] font-black uppercase tracking-widest">
             Communauté
          </div>
          <h1 className="text-5xl font-display font-black leading-none">Forums <br /><span className="gradient-text">Nexus-Hub</span></h1>
          <p className="text-gray-400 max-w-xl">L'espace d'échange pour tous les passionnés de narration graphique africaine.</p>
        </div>

        <div className="flex flex-col md:items-end gap-6">
           <div className="flex gap-4">
              <div className="text-right">
                 <div className="text-2xl font-display font-black">0</div>
                 <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none">Membres Actifs</div>
              </div>
              <div className="h-10 w-[1px] bg-white/10" />
              <div className="text-right">
                 <div className="text-2xl font-display font-black">0</div>
                 <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none">Discussions</div>
              </div>
           </div>
           {user && (
             <button 
               onClick={() => setShowModal(true)}
               className="px-8 py-3 bg-brand-gold text-brand-black font-black text-xs rounded-xl uppercase flex items-center gap-2 hover:scale-105 transition-transform"
             >
                <Plus className="w-4 h-4" />
                Démarrer une discussion
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
           <ForumSection 
             title="Discussions Générales" 
             icon={<MessageSquare className="w-5 h-5 text-brand-blue" />}
             topics={[]}
           />

           <ForumSection 
             title="Espace Créateurs" 
             icon={<Sparkles className="w-5 h-5 text-brand-gold" />}
             topics={[]}
           />
           
           <div className="p-12 glass-card border-brand-red/20 flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 bg-brand-red/10 rounded-full flex items-center justify-center text-brand-red">
                 <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-display font-bold inline-flex items-center gap-3">
                Espace Premium <span className="text-[10px] bg-brand-red text-white px-2 py-0.5 rounded">PRIVÉ</span>
              </h3>
              <p className="text-gray-400 max-w-sm">Rejoignez le club Premium pour accéder aux spoilers, aux coulisses et discuter directement avec vos artistes favoris.</p>
              <button className="px-8 py-4 bg-brand-red text-white font-black rounded-xl hover:scale-105 transition-transform">DEVENIR PREMIUM</button>
           </div>
        </div>

        <aside className="space-y-8">
           <div className="glass-card p-8 space-y-6">
              <h3 className="font-display font-bold flex items-center gap-3">
                 <MessageCircle className="w-5 h-5 text-brand-gold" />
                 Dernières Réponses
              </h3>
              <div className="space-y-4">
                 {[1, 2, 3, 4].map(i => (
                   <div key={i} className="flex gap-4 group cursor-pointer">
                      <div className="w-10 h-10 bg-brand-brown rounded-full flex-shrink-0" />
                      <div className="space-y-1">
                         <p className="text-xs font-bold line-clamp-1 group-hover:text-brand-gold transition-colors">"Je pense que le chapitre 24 était..."</p>
                         <p className="text-[10px] text-gray-500">Par Malik • Dans Théories & Spoilers</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="glass-card p-8 space-y-6 bg-linear-to-br from-brand-gold/5 to-transparent border-brand-gold/20">
              <h3 className="font-display font-bold flex items-center gap-3">
                 <Users className="w-5 h-5 text-brand-gold" />
                 Membres en ligne
              </h3>
              <div className="flex flex-wrap gap-2">
                 {Array.from({ length: 12 }).map((_, i) => (
                   <div key={i} className="w-8 h-8 rounded-full bg-brand-brown border border-white/10" />
                 ))}
                 <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-bold">+124</div>
              </div>
           </div>
        </aside>
      </div>

      <AnimatePresence>
         {showModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-left">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                className="absolute inset-0 bg-brand-black/90 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="glass-card max-w-xl w-full p-8 relative z-10 space-y-6"
              >
                 <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                 </button>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-display font-black uppercase tracking-tighter">Nouveau Sujet</h3>
                    <p className="text-sm text-gray-400">Partagez vos idées ou posez une question à la communauté.</p>
                 </div>
                 <form onSubmit={handlePost} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Contenu du message</label>
                       <textarea 
                        value={newPost}
                        onChange={e => setNewPost(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-brand-gold/50 transition-all min-h-[150px] resize-none"
                        placeholder="Écrivez ici..."
                       />
                    </div>
                    <button 
                      disabled={posting || !newPost.trim()}
                      className="w-full py-4 bg-brand-gold text-brand-black font-black text-xs rounded-xl uppercase flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                       {posting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                       PUBLIER LA DISCUSSION
                    </button>
                 </form>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
};

const SpoilerText = ({ children }: { children: React.ReactNode }) => {
  const [show, setShow] = useState(false);
  return (
    <span 
      onClick={(e) => {
        e.stopPropagation();
        setShow(true);
      }}
      className={`cursor-pointer transition-all ${!show ? 'bg-white/10 text-transparent blur-sm hover:bg-white/20 px-1 rounded' : ''}`}
    >
      {children}
      {!show && <span className="text-[10px] font-black uppercase text-brand-gold ml-2 blur-none">SPOILER (Cliquer)</span>}
    </span>
  );
};

const ForumSection = ({ title, icon, topics }: { title: string, icon: any, topics: any[] }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 px-2">
       {icon}
       <h2 className="text-xl font-display font-bold">{title}</h2>
    </div>
    <div className="glass-card divide-y divide-white/5 overflow-hidden">
       {topics.map((topic, i) => (
         <div key={i} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="space-y-1">
               <div className="flex items-center gap-2">
                  <h4 className="font-bold group-hover:text-brand-gold transition-colors">{topic.title}</h4>
                  {topic.isSpoiler && <span className="px-1.5 py-0.5 bg-brand-red/20 text-brand-red text-[8px] font-black rounded uppercase">Spoiler</span>}
               </div>
               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                 {topic.isSpoiler ? <SpoilerText>Preview du message spoiler ici...</SpoilerText> : topic.last}
               </p>
            </div>
            <div className="flex gap-8 text-right">
               <div className="hidden sm:block">
                  <div className="text-sm font-bold">{topic.replies}</div>
                  <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Rép.</div>
               </div>
               <div className="hidden sm:block">
                  <div className="text-sm font-bold">{topic.views}</div>
                  <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Vues</div>
               </div>
            </div>
         </div>
       ))}
    </div>
  </div>
);
