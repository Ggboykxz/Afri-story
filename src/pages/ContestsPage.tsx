import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Target,
  Users,
  Calendar,
  ArrowRight,
  Flame,
  Clock,
  Award,
  Filter,
  Search,
  ChevronRight,
  Info,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/lib/userService';
import { Contest } from '@/lib/types';

const CATEGORIES = [
  { id: 'all', label: 'Tous', icon: Award },
  { id: 'artistic', label: 'Dessin', icon: Target },
  { id: 'writing', label: 'Scénario', icon: Trophy },
  { id: 'collab', label: 'Collaboration', icon: Users },
];

export const ContestsPage = () => {
  const { user } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadContests();
  }, []);

  const loadContests = async () => {
    try {
      const data = await userService.getActiveContests();
      setContests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredContests = contests.filter(contest => {
    const matchesCategory = selectedCategory === 'all' || contest.type === selectedCategory;
    const matchesSearch = contest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contest.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-brand-green/20 text-brand-green border-brand-green/20';
      case 'upcoming': return 'bg-brand-gold/20 text-brand-gold border-brand-gold/20';
      case 'completed': return 'bg-white/10 text-gray-400 border-white/10';
      default: return 'bg-white/10 text-white border-white/10';
    }
  };

  return (
    <div className="min-h-screen bg-brand-black pb-20">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80"
            alt="Contest Hero"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 px-3 py-1 bg-brand-gold/20 border border-brand-gold/30 rounded-full w-fit mb-6">
              <Flame className="w-3 h-3 text-brand-gold" />
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold">Événements en cours</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter leading-none mb-6">
              Exprimez votre <span className="text-brand-gold italic text-glow">Talent</span>
            </h1>
            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
              Participez à nos concours exclusifs, gagnez des prix incroyables et faites-vous remarquer par les plus grands studios du continent.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-brand-gold text-brand-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform">
                Voir les prix
              </button>
              <button className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-colors">
                Règlement
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        {/* Search & Filter Bar */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher un concours..."
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-brand-gold/50 transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-brand-gold text-brand-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-12">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
            </div>
          ) : filteredContests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredContests.map((contest, i) => (
                <motion.div
                  key={contest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative bg-white/5 border border-white/10 rounded-[32px] overflow-hidden hover:border-brand-gold/30 transition-all flex flex-col"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/photo-154${i}701494587-cb58502866ab?auto=format&fit=crop&q=80`}
                      alt={contest.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full border backdrop-blur-md text-[10px] font-black uppercase tracking-widest ${getStatusColor(contest.status)}`}>
                      {contest.status === 'active' ? 'En cours' : contest.status === 'upcoming' ? 'Bientôt' : 'Terminé'}
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                        {contest.type === 'artistic' ? <Target className="w-5 h-5" /> : contest.type === 'writing' ? <Trophy className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-display font-black text-xl uppercase tracking-tight line-clamp-1">{contest.title}</h3>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{contest.endDate?.toDate?.().toLocaleDateString() || new Date(contest.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm line-clamp-2 mb-6 leading-relaxed flex-1">
                      {contest.description}
                    </p>

                    <div className="space-y-4 pt-6 border-t border-white/10">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-bold uppercase tracking-widest">Récompense</span>
                        <span className="text-brand-gold font-black">{contest.prizes[0] || 'TBA'}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-bold uppercase tracking-widest">Participants</span>
                        <span className="text-white font-black">{contest.participantIds.length}</span>
                      </div>

                      <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] group-hover:bg-brand-gold group-hover:text-brand-black group-hover:border-brand-gold transition-all flex items-center justify-center gap-2">
                        {contest.status === 'active' ? 'Participer' : 'Voir les détails'}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-[40px] border border-white/10 border-dashed">
              <Award className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-2xl font-display font-black uppercase tracking-tighter mb-2">Aucun concours trouvé</h3>
              <p className="text-gray-500">Revenez plus tard pour de nouveaux défis !</p>
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-20">
          <div className="p-8 bg-white/5 rounded-[40px] border border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold mb-6">
              <Info className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black uppercase tracking-tight mb-4">Critères de sélection</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Nos juges évaluent l'originalité, la maîtrise technique et la pertinence culturelle de chaque œuvre soumise.
            </p>
          </div>

          <div className="p-8 bg-white/5 rounded-[40px] border border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-brand-green/10 flex items-center justify-center text-brand-green mb-6">
              <ExternalLink className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black uppercase tracking-tight mb-4">Opportunités Pro</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Les gagnants des concours "Collab" obtiennent souvent des contrats directs avec nos studios partenaires.
            </p>
          </div>

          <div className="p-8 bg-white/5 rounded-[40px] border border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-brand-brown/10 flex items-center justify-center text-brand-brown mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black uppercase tracking-tight mb-4">Vote du public</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Certains concours incluent une phase de vote communautaire via les likes et commentaires.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestsPage;