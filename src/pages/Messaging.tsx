import React, { useState } from 'react';
import { Send, User, Search, MessageCircle, Lock, Layout } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Skeleton } from '../components/Skeleton';

export const Messaging = () => {
  const { user, profile } = useAuth();
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // Simulate loading conversations
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const chats: any[] = [];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 h-[calc(100vh-120px)]">
      <div className="flex flex-col md:flex-row h-full glass-card overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-80 border-r border-white/10 flex flex-col">
          <div className="p-6 border-b border-white/10 space-y-4">
            <h2 className="text-xl font-display font-bold">Messages</h2>
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
               <input 
                 type="text" 
                 placeholder="Rechercher..." 
                 className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-brand-gold/50 transition-all font-medium"
               />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {loading ? (
               Array(6).fill(0).map((_, i) => (
                 <div key={i} className="p-6 flex items-center gap-4">
                    <Skeleton variant="circle" className="w-12 h-12 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                       <Skeleton variant="text" className="w-24 h-4" />
                       <Skeleton variant="text" className="w-full h-3" />
                    </div>
                 </div>
               ))
            ) : chats.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => setSelectedChat(chat)}
                className={`p-6 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-all relative ${selectedChat?.id === chat.id ? 'bg-white/5' : ''}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-brown flex-shrink-0 flex items-center justify-center font-display font-black text-xl">
                  {chat.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm truncate">{chat.name}</h4>
                      <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{chat.time}</span>
                   </div>
                   <p className="text-xs text-gray-400 truncate mt-1">{chat.lastMsg}</p>
                   <div className="mt-2 text-[8px] font-black uppercase text-brand-gold tracking-widest">{chat.type}</div>
                </div>
                {chat.unread > 0 && (
                   <div className="absolute top-6 right-2 w-4 h-4 bg-brand-red rounded-full flex items-center justify-center text-[8px] font-black text-white">{chat.unread}</div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col bg-brand-black/20">
          {selectedChat ? (
            <>
              <header className="p-6 border-b border-white/10 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-brown flex items-center justify-center font-display font-bold">{selectedChat.name[0]}</div>
                    <div>
                       <h3 className="font-display font-bold text-lg leading-none">{selectedChat.name}</h3>
                       <p className="text-[10px] text-brand-green font-bold uppercase tracking-widest mt-1">En ligne</p>
                    </div>
                 </div>
                 {selectedChat.type === 'Collab' && (
                    <div className="bg-brand-gold/10 text-brand-gold px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 border border-brand-gold/20">
                       <Lock className="w-3 h-3" />
                       Privé - Collab
                    </div>
                 )}
              </header>
              <div className="flex-1 p-8 overflow-y-auto space-y-6">
                 <div className="max-w-md bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10">
                    <p className="text-sm">Bonjour ! On avance bien sur les planches du chapitre 5.</p>
                 </div>
                 <div className="max-w-md bg-brand-gold/10 p-4 rounded-2xl rounded-tr-none border border-brand-gold/20 ml-auto text-right">
                    <p className="text-sm">Génial, j'ai hâte de voir ça. Tu penses que ça sera prêt pour lundi ?</p>
                 </div>
              </div>
              <footer className="p-6 border-t border-white/10">
                 <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-brand-gold/50 transition-all">
                    <input 
                      type="text" 
                      placeholder="Écrire un message..."
                      className="flex-1 bg-transparent border-none outline-none px-4 text-sm"
                    />
                    <button className="w-10 h-10 bg-brand-gold text-brand-black rounded-xl flex items-center justify-center hover:scale-105 transition-transform">
                       <Send className="w-5 h-5" />
                    </button>
                 </div>
              </footer>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
               <div className="w-20 h-20 bg-brand-gold/10 rounded-[2rem] flex items-center justify-center text-brand-gold">
                  <MessageCircle className="w-10 h-10" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-2xl font-display font-black">Votre Messagerie</h3>
                  <p className="text-gray-400 max-w-sm">Sélectionnez une conversation pour discuter avec vos collaborateurs ou votre communauté.</p>
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
