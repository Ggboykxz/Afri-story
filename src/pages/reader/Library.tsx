import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Bookmark, Clock, Zap, Award, Search, Loader2, Heart, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { workService } from "@/lib/workService";
import { Work } from "@/lib/types";
import { Link, useNavigate } from 'react-router-dom';
import { WorkCardSkeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function Library() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Work[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reading' | 'favorites' | 'finished'>('reading');

  useEffect(() => {
    if (!user) return;

    // REAL-TIME: Subscribe to user's favorites
    const favQuery = query(collection(db, 'users', user.uid, 'favorites'));
    const unsubFavorites = onSnapshot(favQuery, async (snap) => {
      const favIds = snap.docs.map(d => d.id);
      
      // Fetch full work data for each favorite
      const favWorks: Work[] = [];
      for (const id of favIds) {
        const w = await workService.getWork(id);
        if (w) favWorks.push(w);
      }
      setFavorites(favWorks);
      setLoading(false);
    });

    // REAL-TIME: Subscribe to reading history
    const historyQuery = query(collection(db, 'users', user.uid, 'reading_history'));
    const unsubHistory = onSnapshot(historyQuery, (snap) => {
      const histData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setHistory(histData);
    });

    return () => {
      unsubFavorites();
      unsubHistory();
    };
  }, [user]);

  const handleRemoveFavorite = async (workId: string) => {
    if (!user) return;
    await workService.removeFromFavorites(user.uid, workId);
    setFavorites(prev => prev.filter(w => w.id !== workId));
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-gray-500" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold">Votre Bibliothèque</h2>
          <p className="text-gray-500">Connectez-vous pour voir vos favoris et votre historique.</p>
        </div>
        <button onClick={() => navigate('/login')} className="px-8 py-3 bg-brand-gold text-brand-black font-black rounded-xl">
          CONNEXION
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'reading', label: 'En cours', icon: Clock, count: history.length },
    { id: 'favorites', label: 'Favoris', icon: Heart, count: favorites.length },
    { id: 'finished', label: 'Terminés', icon: Zap, count: 0 },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 pb-24 space-y-8">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-display font-black uppercase tracking-tighter">Ma Bibliothèque</h1>
        <div className="text-xs text-gray-500 font-bold uppercase">{profile?.favorites?.length || 0} œuvres</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-brand-gold text-brand-black' 
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array(5).fill(0).map((_, i) => <WorkCardSkeleton key={i} />)}
        </div>
      ) : activeTab === 'favorites' ? (
        favorites.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favorites.map(work => (
              <motion.div
                key={work.id}
                whileHover={{ y: -5 }}
                className="group relative"
              >
                <Link to={`/work/${work.id}`} className="block">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden glass-card relative shadow-xl">
                    {work.coverURL ? (
                      <img src={work.coverURL} alt={work.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-brand-brown" />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-brand-black via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <span className="text-xs font-black text-white">LIRE</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-sm mt-2 line-clamp-1">{work.title}</h4>
                </Link>
                <button
                  onClick={(e) => { e.preventDefault(); handleRemoveFavorite(work.id); }}
                  className="absolute -top-2 -right-2 p-1.5 bg-brand-red rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Heart}
            title="Aucun favori"
            description="Ajoutez des œuvres à vos favoris pour les retrouver ici"
            actionLabel="Explorer"
            actionHref="/explore"
          />
        )
      ) : activeTab === 'reading' ? (
        history.length > 0 ? (
          <div className="space-y-4">
            {history.map((item, i) => (
              <div key={i} className="flex items-center gap-4 glass-card p-4">
                <div className="w-12 h-16 bg-brand-brown rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-bold">Œuvre en cours</h4>
                  <p className="text-xs text-gray-500">Chapitre {item.chapterNumber || 1}</p>
                </div>
                <Link to={`/work/${item.workId}`} className="text-brand-gold text-xs font-black uppercase">
                  Reprendre
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="Rien en cours"
            description="Commencez à lire une œuvre pour suivre votre progression"
            actionLabel="Explorer"
            actionHref="/explore"
          />
        )
      ) : (
        <EmptyState
          icon={Zap}
          title="Aucun terminé"
          description="Vos œuvres terminées apparaîtront ici"
          actionLabel="Explorer"
          actionHref="/explore"
        />
      )}
    </div>
  );
}