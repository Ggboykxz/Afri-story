import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, Users, Award, Clock, ChevronRight, Sparkles, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';

export interface Contest {
  id: string;
  title: string;
  description: string;
  type: string;
  startDate: any;
  endDate: any;
  status: 'upcoming' | 'active' | 'ended';
  prizes: string[];
  rules: string;
  entries: any[];
  participantCount: number;
  coverImage?: string;
  createdAt: any;
}

export const ContestsPage = () => {
  const { user, profile } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'ended'>('active');
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionData, setSubmissionData] = useState({ workId: '', message: '' });

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'contests'), orderBy('endDate', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Contest[];
      setContests(data);
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEntry = async () => {
    if (!user || !selectedContest || !submissionData.workId) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'contests', selectedContest.id, 'entries'), {
        userId: user.uid,
        userName: profile?.displayName,
        workId: submissionData.workId,
        message: submissionData.message,
        submittedAt: serverTimestamp(),
        status: 'pending',
      });
      await updateDoc(doc(db, 'contests', selectedContest.id), {
        participantCount: (selectedContest.participantCount || 0) + 1,
      });
      setShowSubmitModal(false);
      setSubmissionData({ workId: '', message: '' });
    } catch (error) {
      console.error('Error submitting entry:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-brand-green" />;
      case 'upcoming': return <Clock className="w-4 h-4 text-brand-gold" />;
      case 'ended': return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'EN COURS';
      case 'upcoming': return 'À VENIR';
      case 'ended': return 'TERMINÉ';
      default: return status;
    }
  };

  const filteredContests = contests.filter(c => c.status === activeTab);

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getTimeRemaining = (endDate: any) => {
    if (!endDate) return '';
    const end = endDate.toDate ? endDate.toDate() : new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return 'Terminé';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}j ${hours}h restants`;
    return `${hours}h restantes`;
  };

  return (
    <div className="min-h-screen pt-20 pb-20">
      {/* Hero */}
      <div className="relative overflow-hidden bg-linear-to-br from-brand-brown/30 via-brand-black to-brand-black/90 py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-brand-gold rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-red rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-4 py-2 mb-6"
          >
            <Sparkles className="w-4 h-4 text-brand-gold" />
            <span className="text-brand-gold text-xs font-black uppercase tracking-widest">Compétitions Créatives</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter mb-4">
            Concours <span className="text-brand-gold">&</span> Événements
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Participez aux concours AfriStory, faites-vous connaître et remportez des prix exceptionnels.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-8 mt-8">
        <div className="flex gap-2 border-b border-white/10">
          {(['active', 'upcoming', 'ended'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-black text-sm uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab
                  ? 'border-brand-gold text-brand-gold'
                  : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              {tab === 'active' ? 'En cours' : tab === 'upcoming' ? 'À venir' : 'Terminés'}
              <span className="ml-2 text-[10px] opacity-60">
                ({contests.filter(c => c.status === tab).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Contest List */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="glass-card p-6 space-y-4">
                <Skeleton className="w-full h-40 rounded-xl" />
                <Skeleton variant="text" className="w-3/4 h-6" />
                <Skeleton variant="text" className="w-full h-4" />
                <Skeleton variant="text" className="w-1/2 h-4" />
              </div>
            ))}
          </div>
        ) : filteredContests.length === 0 ? (
          <EmptyState
            icon={<Trophy className="w-12 h-12" />}
            title="Aucun concours"
            description={`Il n'y a pas de concours ${activeTab === 'active' ? 'en cours' : activeTab === 'upcoming' ? 'à venir' : 'terminés'} pour le moment.`}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContests.map((contest, index) => (
              <motion.div
                key={contest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card overflow-hidden group cursor-pointer hover:border-brand-gold/30 transition-all"
                onClick={() => setSelectedContest(contest)}
              >
                <div className="h-40 bg-linear-to-br from-brand-brown/40 to-brand-black/60 flex items-center justify-center relative">
                  <Trophy className="w-16 h-16 text-brand-gold/30 group-hover:scale-110 transition-transform" />
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-brand-black/80 backdrop-blur-sm rounded-full px-3 py-1">
                    {getStatusIcon(contest.status)}
                    <span className="text-[10px] font-black uppercase tracking-wider">{getStatusLabel(contest.status)}</span>
                  </div>
                  {contest.status === 'active' && (
                    <div className="absolute top-3 left-3 bg-brand-green/90 text-brand-black text-[10px] font-black px-2 py-1 rounded-full">
                      {getTimeRemaining(contest.endDate)}
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-display font-bold group-hover:text-brand-gold transition-colors">{contest.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2">{contest.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {contest.participantCount || 0} participants
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(contest.endDate)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(contest.prizes || []).slice(0, 3).map((prize: string, i: number) => (
                      <span key={i} className="bg-brand-gold/10 text-brand-gold text-[10px] font-black px-2 py-1 rounded-full">
                        {prize}
                      </span>
                    ))}
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-brand-gold/10 hover:border-brand-gold/30 transition-all font-black text-sm uppercase tracking-wider">
                    Voir les détails
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Contest Detail Modal */}
      <AnimatePresence>
        {selectedContest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedContest(null)}
              className="absolute inset-0 bg-brand-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-2xl max-h-[85vh] overflow-y-auto relative z-10"
            >
              <div className="sticky top-0 bg-brand-black/80 backdrop-blur-md border-b border-white/10 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedContest.status)}
                  <h2 className="text-2xl font-display font-black">{selectedContest.title}</h2>
                </div>
                <button onClick={() => setSelectedContest(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-8">
                <p className="text-gray-300 leading-relaxed">{selectedContest.description}</p>

                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-3">Prix</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(selectedContest.prizes || []).map((prize: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-brand-gold/5 border border-brand-gold/20 rounded-xl">
                        <Award className="w-5 h-5 text-brand-gold flex-shrink-0" />
                        <span className="text-sm font-bold">{prize}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-3">Règlement</h3>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">{selectedContest.rules}</pre>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl font-display font-black">{selectedContest.participantCount || 0}</div>
                    <div className="text-[10px] text-gray-500 font-black uppercase">Participants</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl font-display font-black">{formatDate(selectedContest.startDate)}</div>
                    <div className="text-[10px] text-gray-500 font-black uppercase">Début</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl font-display font-black">{formatDate(selectedContest.endDate)}</div>
                    <div className="text-[10px] text-gray-500 font-black uppercase">Fin</div>
                  </div>
                </div>

                {selectedContest.status === 'active' && user && (
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="w-full py-4 bg-brand-gold text-brand-black font-black uppercase tracking-widest rounded-xl hover:bg-brand-gold/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trophy className="w-5 h-5" />
                    Participer au concours
                  </button>
                )}

                {selectedContest.status === 'active' && !user && (
                  <Link to="/login" className="block w-full py-4 bg-white/10 text-center font-black uppercase tracking-widest rounded-xl hover:bg-white/20 transition-colors">
                    Connectez-vous pour participer
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Submit Entry Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSubmitModal(false)}
              className="absolute inset-0 bg-brand-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-md p-8 relative z-10 space-y-6"
            >
              <h3 className="text-2xl font-display font-black">Soumettre une œuvre</h3>
              <p className="text-sm text-gray-400">Pour "{selectedContest?.title}"</p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">ID de l'œuvre</label>
                  <input
                    type="text"
                    value={submissionData.workId}
                    onChange={e => setSubmissionData(prev => ({ ...prev, workId: e.target.value }))}
                    placeholder="Entrez l'ID de votre œuvre"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:border-brand-gold focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">Message (optionnel)</label>
                  <textarea
                    value={submissionData.message}
                    onChange={e => setSubmissionData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Présentez votre œuvre..."
                    rows={3}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:border-brand-gold focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl font-black uppercase tracking-wider text-sm hover:bg-white/10 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmitEntry}
                  disabled={submitting || !submissionData.workId}
                  className="flex-1 py-3 bg-brand-gold text-brand-black rounded-xl font-black uppercase tracking-wider text-sm hover:bg-brand-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
                  {submitting ? 'Envoi...' : 'Soumettre'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
