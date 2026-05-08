import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, Check, Trash2, Clock, Info, MessageSquare, Book, Heart, 
  AlertCircle, Filter, Volume2, VolumeX, Settings, CheckCircle2,
  BookOpen, Star, MessageCircle, ShoppingBag, Award, Users, Zap
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { notificationService, Notification, GroupedNotification } from '@/lib/notificationService';
import { Skeleton } from '@/components/common/Skeleton';
import { doc, deleteDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type FilterType = 'all' | 'unread' | 'work' | 'forum' | 'chat' | 'chapter' | 'subscription' | 'milestone';
type GroupBy = 'none' | 'type' | 'day';

export function NotificationsPage() {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [groupedNotifications, setGroupedNotifications] = useState<GroupedNotification[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [groupBy, setGroupBy] = useState<GroupBy>('type');
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const playNotificationSound = () => {
    if (typeof window === 'undefined' || !soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    
    const unsubscribe = notificationService.subscribe(user.uid, (data) => {
      setNotifications(data);
      setLoading(false);
      
      if (soundEnabled && data.length > 0) {
        const hasUnread = data.some(n => !n.isRead);
        if (hasUnread) {
          playNotificationSound();
        }
      }
    });
    
    return () => unsubscribe();
  }, [user, soundEnabled]);

  const groupNotificationsByType = (notifs: Notification[]): GroupedNotification[] => {
    const groups: Record<string, Notification[]> = {};
    
    notifs.forEach(n => {
      const key = n.type || 'other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    });

    return Object.entries(groups).map(([type, items]) => ({
      id: type,
      type: type as any,
      title: getTypeTitle(type),
      message: items.length === 1 
        ? items[0].message 
        : `${items.length} nouvelles notifications`,
      items,
      count: items.length,
      isRead: items.every(i => i.isRead),
      createdAt: items[0].createdAt,
      link: items[0].link,
    }));
  };

  const groupNotificationsByDay = (notifs: Notification[]): GroupedNotification[] => {
    const groups: Record<string, Notification[]> = {};
    
    notifs.forEach(n => {
      const date = n.createdAt?.toDate?.() || new Date();
      const dayKey = date.toDateString();
      if (!groups[dayKey]) groups[dayKey] = [];
      groups[dayKey].push(n);
    });

    return Object.entries(groups).map(([day, items]) => ({
      id: day,
      type: 'grouped' as any,
      title: formatDayHeader(day),
      message: `${items.length} notification${items.length > 1 ? 's' : ''}`,
      items,
      count: items.length,
      isRead: items.every(i => i.isRead),
      createdAt: items[0].createdAt,
    }));
  };

  const getTypeTitle = (type: string): string => {
    const titles: Record<string, string> = {
      chapter: 'Nouveaux Chapitres',
      work: 'Œuvres',
      forum: 'Forums & Discussions',
      chat: 'Messages Privés',
      contest: 'Concours',
      subscription: 'Abonnements',
      milestone: 'Succès & Badges',
      verification: 'Vérification',
      system: 'Système',
      shop: 'Boutique',
    };
    return titles[type] || 'Autres Notifications';
  };

  const formatDayHeader = (day: string): string => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (day === today) return "Aujourd'hui";
    if (day === yesterday) return 'Hier';
    return new Date(day).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const getIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      chapter: <BookOpen className="w-5 h-5" />,
      work: <Book className="w-5 h-5" />,
      forum: <MessageSquare className="w-5 h-5" />,
      chat: <MessageCircle className="w-5 h-5" />,
      social: <Heart className="w-5 h-5" />,
      contest: <Award className="w-5 h-5" />,
      subscription: <Star className="w-5 h-5" />,
      milestone: <Zap className="w-5 h-5" />,
      verification: <CheckCircle2 className="w-5 h-5" />,
      shop: <ShoppingBag className="w-5 h-5" />,
      system: <Info className="w-5 h-5" />,
      grouped: <Bell className="w-5 h-5" />,
    };
    const colors: Record<string, string> = {
      chapter: 'text-brand-gold',
      work: 'text-brand-gold',
      forum: 'text-brand-green',
      chat: 'text-brand-red',
      social: 'text-pink-400',
      contest: 'text-purple-400',
      subscription: 'text-blue-400',
      milestone: 'text-yellow-400',
      verification: 'text-brand-gold',
      shop: 'text-brand-brown',
      system: 'text-gray-400',
      grouped: 'text-brand-gold',
    };
    return (
      <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${colors[type] || 'text-gray-400'}`}>
        {icons[type] || <Bell className="w-5 h-5" />}
      </div>
    );
  };

  const filteredNotifications = groupedNotifications.filter(group => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !group.isRead;
    return group.type === activeFilter;
  });

  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

  const handleMarkGroupRead = async (group: GroupedNotification) => {
    if (user) {
      for (const item of group.items) {
        if (!item.isRead) {
          await notificationService.markAsRead(item.id);
        }
      }
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleDeleteAllRead = async () => {
    if (!user) return;
    const readNotifs = notifications.filter(n => n.isRead);
    for (const n of readNotifs) {
      await deleteDoc(doc(db, 'notifications', n.id));
    }
  };

  const filterButtons: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Toutes' },
    { key: 'unread', label: 'Non lues' },
    { key: 'chapter', label: 'Chapitres' },
    { key: 'work', label: 'Œuvres' },
    { key: 'forum', label: 'Forums' },
    { key: 'chat', label: 'Messages' },
    { key: 'milestone', label: 'Succès' },
  ];

  const handleMarkAllRead = async () => {
    if (user) await notificationService.markAllAsRead(user.uid);
  };

  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
       <AlertCircle className="w-16 h-16 text-brand-red" />
       <h2 className="text-3xl font-display font-bold">Veuillez vous connecter</h2>
       <p className="text-gray-500">Connectez-vous pour voir vos notifications</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-display font-black uppercase tracking-tighter">
            Notifications
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="ml-3 inline-flex items-center justify-center w-8 h-8 bg-brand-red text-white text-sm font-bold rounded-full animate-pulse">
                {notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3 rounded-xl transition-all ${soundEnabled ? 'bg-brand-gold/20 text-brand-gold' : 'bg-white/5 text-gray-500'}`}
            title={soundEnabled ? 'Son activé' : 'Son désactivé'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-3 rounded-xl transition-all ${showSettings ? 'bg-brand-gold/20 text-brand-gold' : 'bg-white/5 text-gray-500 hover:text-white'}`}
            title="Paramètres"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6 space-y-4"
          >
            <h3 className="font-display font-bold text-lg">Paramètres de Notification</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {['Nouveaux chapitres', 'Messages', 'Activités sociales', 'Concours', 'Boutique'].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-sm font-bold">{item}</span>
                  <ToggleSwitch enabled={true} onChange={() => {}} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 invisible-scrollbar">
        {filterButtons.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setActiveFilter(key); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              activeFilter === key ? 'bg-white text-brand-black' : 'bg-white/5 text-gray-500 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <Filter className="w-4 h-4" />
          <span>Grouper par:</span>
          <select 
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold"
          >
            <option value="none">Aucune</option>
            <option value="type">Type</option>
            <option value="day">Date</option>
          </select>
        </div>
        
        <div className="flex items-center gap-3 text-[10px]">
          <button 
            onClick={handleMarkAllRead}
            className="text-brand-gold font-bold uppercase hover:underline"
          >
            Tout marquer comme lu
          </button>
          <span className="text-gray-600">|</span>
          <button 
            onClick={handleDeleteAllRead}
            className="text-brand-red font-bold uppercase hover:underline"
          >
            Supprimer les lues
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="glass-card p-6 flex gap-6 items-start">
              <Skeleton variant="circle" className="w-12 h-12 flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-start">
                  <Skeleton variant="text" className="w-48 h-6" />
                  <Skeleton variant="text" className="w-20 h-3" />
                </div>
                <Skeleton variant="text" className="w-full h-4" />
              </div>
            </div>
          ))
        ) : (
          <AnimatePresence mode="popLayout">
            {paginatedNotifications.length > 0 ? (
              <>
                {paginatedNotifications.map((group) => (
                  <motion.div
                    key={group.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`glass-card overflow-hidden ${group.isRead ? 'opacity-70' : 'border-l-4 border-l-brand-gold'}`}
                  >
                    <div 
                      className="p-6 flex gap-6 items-start cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => group.link && window.location.href.startsWith(window.location.origin) && (window.location.href = group.link)}
                    >
                      {getIcon(group.type)}
                      
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
                            {group.title}
                            {group.count > 1 && (
                              <span className="px-2 py-0.5 bg-brand-gold/20 text-brand-gold text-[10px] font-black rounded-full">
                                {group.count}
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest flex-shrink-0">
                            <Clock className="w-3 h-3" /> 
                            {group.createdAt?.toDate?.() ? formatRelativeTime(group.createdAt.toDate()) : 'Maintenant'}
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                          {group.message}
                        </p>
                        
                        {group.items.length > 1 && group.count <= 5 && (
                          <div className="mt-3 space-y-2">
                            {group.items.slice(0, 3).map((item) => (
                              <div key={item.id} className="text-xs text-gray-500 pl-4 border-l-2 border-white/10">
                                • {item.message}
                              </div>
                            ))}
                            {group.items.length > 3 && (
                              <div className="text-xs text-brand-gold font-bold">
                                +{group.items.length - 3} autres...
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {!group.isRead && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleMarkGroupRead(group); }}
                            className="p-2 bg-brand-gold/10 text-brand-gold rounded-lg hover:bg-brand-gold hover:text-brand-black transition-all"
                            title="Marquer comme lu"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); group.items.forEach(i => handleDeleteNotification(i.id)); }}
                          className="p-2 bg-brand-red/10 text-brand-red rounded-lg hover:bg-brand-red hover:text-white transition-all"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 py-8">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white/5 rounded-lg disabled:opacity-30"
                    >
                      Précédent
                    </button>
                    <span className="text-sm font-bold">
                      Page {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white/5 rounded-lg disabled:opacity-30"
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-24 text-center space-y-6"
              >
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <Bell className="w-12 h-12 text-white/10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-display font-bold">Aucune notification</h3>
                  <p className="text-gray-500">Vous êtes à jour, pas de nouvelles notifications pour le moment.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: (val: boolean) => void }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative w-11 h-6 rounded-full p-1 transition-colors ${enabled ? 'bg-brand-gold' : 'bg-white/20'}`}
  >
    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes}min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};