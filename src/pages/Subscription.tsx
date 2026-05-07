import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Coins, 
  CreditCard, 
  Zap, 
  CheckCircle, 
  Gift, 
  Star, 
  Crown,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { afriCoinsService } from '../lib/subscriptionService';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';

const PACKS = [
  { id: 'discovery', name: 'Pack Découverte', coins: 100, price: 0.99, bonus: 0, popular: false },
  { id: 'standard', name: 'Pack Standard', coins: 500, price: 3.99, bonus: 50, popular: true },
  { id: 'premium', name: 'Pack Premium', coins: 1500, price: 9.99, bonus: 250, popular: false },
  { id: 'mega', name: 'Pack Méga', coins: 5000, price: 29.99, bonus: 1000, popular: false },
];

const SUBSCRIPTION_PLANS = [
  {
    id: 'standard',
    name: 'Standard',
    price: 2.99,
    features: ['Lecture sans publicité', 'Accès anticipé léger', 'Badge Standard'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 4.99,
    features: ['Tout Standard', 'Accès anticipé complet', 'Forum Premium', 'Contenu exclusif', 'Badge Premium'],
    recommended: true,
  },
  {
    id: 'supporter',
    name: 'Supporter',
    price: 5.99,
    features: ['Tout Premium', 'AfriCoins mensuels', 'Badge Supporter', 'Poids renforcé信号ements'],
  },
];

export function SubscriptionPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchaseCoins = async (packId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(packId);
    try {
      const pack = PACKS.find(p => p.id === packId);
      if (!pack) return;

      await updateDoc(doc(db, 'users', user.uid), {
        afriCoins: increment(pack.coins + pack.bonus)
      });

      alert(`Merci ! ${pack.coins + pack.bonus} AfriCoins ajoutés à votre compte !`);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'achat. Veuillez réessayer.');
    } finally {
      setLoading(null);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(planId);
    try {
      alert('Paiement simulé - Intégration Stripe à venir');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-16 pb-24">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/20">
          <Crown className="w-3 h-3 text-brand-gold" />
          <span className="text-[8px] font-black uppercase tracking-widest text-brand-gold">Soutenez vos artistes préférés</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-display font-black uppercase tracking-tighter">
          AfriCoins & <span className="gradient-text">Abonnements</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Débloquez des chapitres premium, soutenez vos artistes préférés et accédez à une expérience de lecture ultime.
        </p>
      </div>

      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <Coins className="w-6 h-6 text-brand-gold" />
          <h2 className="text-2xl font-display font-black uppercase tracking-tight">Packs AfriCoins</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {PACKS.map((pack) => (
            <motion.div
              key={pack.id}
              whileHover={{ y: -8 }}
              className={`glass-card p-6 space-y-4 relative ${pack.popular ? 'border-brand-gold shadow-lg shadow-brand-gold/10' : ''}`}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-gold text-brand-black text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  Populaire
                </div>
              )}
              <div className="text-center space-y-2">
                <div className="text-4xl font-display font-black">{pack.coins}</div>
                <div className="text-[10px] font-black uppercase text-gray-500 tracking-widest">AfriCoins</div>
                {pack.bonus > 0 && (
                  <div className="text-xs font-bold text-brand-green">+{pack.bonus} bonus</div>
                )}
              </div>
              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => handlePurchaseCoins(pack.id)}
                  disabled={loading === pack.id}
                  className="w-full py-3 bg-brand-gold text-brand-black font-black uppercase text-xs tracking-widest rounded-xl hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading === pack.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <><span>{pack.price}€</span> <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <Star className="w-6 h-6 text-brand-gold" />
          <h2 className="text-2xl font-display font-black uppercase tracking-tight">Plans d'Abonnement</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ y: -8 }}
              className={`glass-card p-8 space-y-6 relative ${plan.recommended ? 'border-brand-gold shadow-lg shadow-brand-gold/10' : ''}`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-gold text-brand-black text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  Recommandé
                </div>
              )}
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-display font-black uppercase">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-display font-black">{plan.price}</span>
                  <span className="text-gray-500 font-bold">€/mois</span>
                </div>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-brand-gold" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                className={`w-full py-4 font-black uppercase text-xs tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
                  plan.recommended
                    ? 'bg-brand-gold text-brand-black hover:scale-105'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                {loading === plan.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'S\'abonner'
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="glass-card p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 bg-brand-gold/5 border-brand-gold/20">
        <div className="w-16 h-16 bg-brand-gold rounded-2xl flex items-center justify-center flex-shrink-0">
          <Gift className="w-8 h-8 text-brand-black" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-display font-black uppercase">Pourquoi soutenir AfriStory ?</h3>
          <p className="text-gray-400 mt-2">
            70% des revenus d'abonnement et de dons vont directement aux artistes que vous lisez. Votre soutien compte !
          </p>
        </div>
        {user && profile?.role === 'artist_draft' && (
          <Link
            to="/become-pro"
            className="px-8 py-3 bg-brand-gold text-brand-black font-black uppercase text-xs tracking-widest rounded-xl hover:scale-105 transition-transform"
          >
            Devenir Pro
          </Link>
        )}
      </section>

      {!user && (
        <div className="text-center space-y-4">
          <p className="text-gray-500">Déjà des AfriCoins ?</p>
          <Link
            to="/login"
            className="inline-block px-8 py-3 bg-brand-gold text-brand-black font-black uppercase text-xs tracking-widest rounded-xl"
          >
            Se connecter
          </Link>
        </div>
      )}
    </div>
  );
}