import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, Trash2, Clock, Info, MessageSquare, Book, Heart, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationService, Notification } from '../lib/notificationService';

export function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'unread'>('all');

  React.useEffect(() => {
    if (!user) return;
    const unsubscribe = notificationService.subscribe(user.uid, (data) => {
      setNotifications(data);
    });
    return () => unsubscribe();
  }, [user]);

  const filtered = notifications.filter(n => activeFilter === 'all' || !n.isRead);

  const getIcon = (type: string) => {
    switch (type) {
      case 'work': return <Book className="w-4 h-4 text-brand-gold" />;
      case 'forum': return <MessageSquare className="w-4 h-4 text-brand-green" />;
      case 'chat': return <Heart className="w-4 h-4 text-brand-red" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const handleMarkAllRead = () => {
    if (user) notificationService.markAllAsRead(user.uid);
  };

  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
       <AlertCircle className="w-12 h-12 text-brand-red" />
       <h2 className="text-2xl font-display font-bold">Veuillez vous connecter</h2>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-4xl font-display font-black uppercase tracking-tighter">Centre de <span className="gradient-text">Notifications</span></h1>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setActiveFilter('all')}
             className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === 'all' ? 'bg-white text-brand-black' : 'bg-white/5 text-gray-500'}`}
           >
             Toutes
           </button>
           <button 
             onClick={() => setActiveFilter('unread')}
             className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === 'unread' ? 'bg-white text-brand-black' : 'bg-white/5 text-gray-500'}`}
           >
             Non lues
           </button>
           <div className="w-[1px] h-6 bg-white/10 mx-2" />
           <button 
             onClick={handleMarkAllRead}
             className="text-[10px] font-black uppercase tracking-widest text-brand-gold hover:underline"
           >
             Tout marquer comme lu
           </button>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map((notif) => (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`glass-card p-6 flex gap-6 items-start group transition-all cursor-pointer ${notif.isRead ? 'opacity-60' : 'border-l-4 border-l-brand-gold bg-white/5'}`}
                onClick={() => notificationService.markAsRead(notif.id)}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  {getIcon(notif.type)}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg leading-tight">{notif.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                       <Clock className="w-3 h-3" /> 
                       {notif.createdAt?.toDate?.() ? notif.createdAt.toDate().toLocaleDateString() : 'Aujourd\'hui'}
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   {!notif.isRead && (
                     <button className="p-2 bg-brand-gold/10 text-brand-gold rounded-lg hover:bg-brand-gold hover:text-brand-black transition-all">
                       <Check className="w-4 h-4" />
                     </button>
                   )}
                   <button className="p-2 bg-brand-red/10 text-brand-red rounded-lg hover:bg-brand-red hover:text-white transition-all">
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="py-24 text-center space-y-4"
            >
               <Bell className="w-16 h-16 text-white/5 mx-auto" />
               <p className="text-gray-500 font-bold uppercase tracking-widest">Le silence est d'or. Aucune notification.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
