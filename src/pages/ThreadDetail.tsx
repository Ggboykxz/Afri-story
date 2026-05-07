import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, User, Clock, ChevronRight, Hash, Send, Flag, ThumbsUp, MessageSquare, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function ThreadDetail() {
  const { threadId } = useParams();
  const { user, profile } = useAuth();
  const [reply, setReply] = useState('');
  
  const thread = {
    id: threadId,
    title: "Quel est votre moment préféré dans 'Oyo' ?",
    author: "Seko_Fan",
    date: "Il y a 2 heures",
    category: "Webtoons & BD",
    content: "Moi perso c'est quand Shango utilise son tonnerre pour la première fois contre l'armée des ombres. Les graphismes étaient incroyables ! Et vous ?",
    replies: [
      { id: 'r1', author: 'Aurore_K', date: 'Il y a 1 heure', content: 'Totalement d\'accord ! La double page avec l\'éclair qui traverse le ciel était magique.' },
      { id: 'r2', author: 'MangaMaster', date: 'Il y a 45 min', content: 'Pour moi c\'est plus le moment d\'émotion avec sa soeur juste avant le combat.' },
    ]
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
        <Link to="/forum" className="hover:text-brand-gold transition-colors">Forums</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/forum/category/webtoons" className="hover:text-brand-gold transition-colors">{thread.category}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-white truncate">Discussion #{threadId}</span>
      </div>

      {/* Main Post */}
      <div className="glass-card p-8 space-y-6 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <Hash className="w-24 h-24" />
        </div>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-brown" />
              <div>
                <h4 className="font-bold text-lg">{thread.author}</h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase">{thread.date}</p>
              </div>
           </div>
           <button className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 hover:text-brand-red transition-colors">
              <Flag className="w-3 h-3" /> Signaler
           </button>
        </div>
        
        <div className="space-y-4 relative z-10">
          <h1 className="text-2xl md:text-3xl font-display font-black uppercase leading-tight">{thread.title}</h1>
          <p className="text-gray-300 leading-relaxed text-lg">
            {thread.content}
          </p>
        </div>

        <div className="flex items-center gap-6 pt-6 border-t border-white/5">
           <button className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-brand-gold transition-colors">
              <ThumbsUp className="w-4 h-4" /> 24 J'aime
           </button>
           <button className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-brand-gold transition-colors">
              <MessageSquare className="w-4 h-4" /> {thread.replies.length} Réponses
           </button>
        </div>
      </div>

      {/* Replies List */}
      <div className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-brand-gold border-b border-brand-gold/20 pb-2">Réponses</h3>
        
        {thread.replies.map((r, i) => (
          <motion.div 
            key={r.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-6 rounded-2xl border border-white/5 bg-white/2 flex gap-6 items-start`}
          >
            <div className="w-10 h-10 rounded-full bg-white/5 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="flex justify-between items-center">
                 <h4 className="font-bold text-sm">{r.author}</h4>
                 <span className="text-[8px] text-gray-600 font-black uppercase">{r.date}</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {r.content}
              </p>
              <div className="flex gap-4">
                 <button className="text-[10px] font-black uppercase text-gray-600 hover:text-white transition-colors">Répondre</button>
                 <button className="text-[10px] font-black uppercase text-gray-600 hover:text-white transition-colors">Utile</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Reply Form */}
      <div className="sticky bottom-6 left-0 right-0 z-40 bg-brand-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4">
        {user ? (
          <>
            <img src={user.photoURL || ''} alt="" className="w-10 h-10 rounded-xl bg-white/5 flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Écrire une réponse..." 
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-gray-600"
            />
            <button className="bg-brand-gold text-brand-black w-10 h-10 rounded-xl flex items-center justify-center hover:scale-105 transition-transform">
               <Send className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="w-full flex items-center justify-center gap-4 py-2">
             <AlertCircle className="w-4 h-4 text-brand-gold" />
             <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Connectez-vous pour participer à la discussion</p>
             <Link to="/login" className="text-brand-gold text-xs font-black uppercase hover:underline">Connexion</Link>
          </div>
        )}
      </div>
    </div>
  );
}
