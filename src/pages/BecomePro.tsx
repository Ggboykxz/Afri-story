import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, ShieldCheck, Zap, Star, ChevronRight, CheckCircle, Info, Rocket, Send, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Skeleton } from '../components/Skeleton';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function BecomePro() {
  const { user, profile, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12 pb-24">
         <div className="space-y-4">
            <Skeleton className="w-32 h-6 rounded-full" />
            <Skeleton variant="text" className="w-1/2 h-16" />
            <Skeleton variant="text" className="w-3/4 h-8" />
         </div>
         <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3 space-y-8">
               <Skeleton className="w-full h-96 rounded-3xl" />
            </div>
            <div className="lg:col-span-2">
               <Skeleton className="w-full h-64 rounded-3xl" />
            </div>
         </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <Award className="w-16 h-16 text-brand-gold opacity-30" />
        <div className="text-center space-y-2">
           <h2 className="text-2xl font-display font-bold">Rejoignez les Pros</h2>
           <p className="text-gray-500">Veuillez vous connecter pour postuler au statut Artiste Pro.</p>
        </div>
        <Link to="/login" className="px-8 py-3 bg-brand-gold text-brand-black font-black rounded-xl uppercase tracking-widest text-[10px]">
          CONNEXION
        </Link>
      </div>
    );
  }

  if (profile?.role === 'artist_pro') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 text-center px-6">
         <div className="w-20 h-20 bg-brand-gold rounded-full flex items-center justify-center shadow-lg shadow-brand-gold/20">
            <CheckCircle className="w-10 h-10 text-brand-black" />
         </div>
         <div className="space-y-2">
           <h2 className="text-3xl font-display font-black uppercase text-brand-gold">Félicitations, vous êtes Pro !</h2>
           <p className="text-gray-400 font-medium">Vous bénéficiez déjà de tous les avantages d'AfriStory pour les créateurs certifiés.</p>
         </div>
         <Link to="/artist" className="px-8 py-3 bg-white/5 border border-white/10 text-white font-black rounded-xl uppercase tracking-widest text-[10px] hover:bg-white hover:text-brand-black transition-all">
           ACCÉDER AU DASHBOARD
         </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      // We'll store requests in a 'pro_applications' collection
      await setDoc(doc(db, 'pro_applications', user.uid), {
        userId: user.uid,
        userName: profile?.displayName || 'Anonyme',
        email: user.email,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de l'envoi de votre candidature.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12 pb-24">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-brand-gold bg-brand-gold/10 w-fit px-3 py-1 rounded-full border border-brand-gold/20">
           <Star className="w-3 h-3 fill-current" />
           <span className="text-[8px] font-black uppercase tracking-widest">Certification Créateur</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter">Devenir <span className="gradient-text">Artiste Pro</span></h1>
        <p className="text-gray-400 max-w-xl text-lg font-medium leading-relaxed">
          Passez du Draft au niveau supérieur. Monétisez vos œuvres et accédez à des outils de production professionnels.
        </p>
      </div>

      {!submitted ? (
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Main Form Area */}
          <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center gap-8 mb-8">
               {[1, 2, 3].map((s) => (
                 <div key={s} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= s ? 'bg-brand-gold text-brand-black' : 'bg-white/5 text-gray-500'}`}>
                      {s}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest hidden md:block ${step === s ? 'text-white' : 'text-gray-600'}`}>
                      {s === 1 ? 'Identité' : s === 2 ? 'Portfolio' : 'Validation'}
                    </span>
                 </div>
               ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 glass-card p-8 border-white/10 shadow-2xl">
               <AnimatePresence mode="wait">
                 {step === 1 && (
                   <motion.div 
                     initial={{ opacity: 0, x: 20 }} 
                     animate={{ opacity: 1, x: 0 }} 
                     exit={{ opacity: 0, x: -20 }}
                     className="space-y-6"
                   >
                     <h3 className="text-xl font-display font-black uppercase tracking-tight">Vos Informations</h3>
                     <div className="grid gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nom complet / Studio</label>
                           <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-gold/50" placeholder="Ex: Studio Oyo" required />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Ville / Pays de résidence</label>
                           <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-gold/50" placeholder="Lagos, Nigeria" required />
                        </div>
                     </div>
                     <button type="button" onClick={() => setStep(2)} className="w-full py-4 bg-brand-gold text-brand-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:scale-105 transition-transform">
                       CONTINUER
                     </button>
                   </motion.div>
                 )}

                 {step === 2 && (
                   <motion.div 
                     initial={{ opacity: 0, x: 20 }} 
                     animate={{ opacity: 1, x: 0 }} 
                     exit={{ opacity: 0, x: -20 }}
                     className="space-y-6"
                   >
                     <h3 className="text-xl font-display font-black uppercase tracking-tight">Votre Portfolio</h3>
                     <div className="space-y-6">
                        <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl text-center space-y-4 hover:border-brand-gold/30 transition-all cursor-pointer">
                           <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-500">
                              <Rocket className="w-6 h-6" />
                           </div>
                           <p className="text-gray-400 text-xs font-bold">Téléchargez un extrait de votre œuvre la plus aboutie (PDF ou images)</p>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Lien vers vos travaux (Instagram, ArtStation, Behance...)</label>
                           <input type="url" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-gold/50" placeholder="https://..." />
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 bg-white/5 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl">RETOUR</button>
                        <button type="button" onClick={() => setStep(3)} className="flex-1 py-4 bg-brand-gold text-brand-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl">CONTINUER</button>
                     </div>
                   </motion.div>
                 )}

                 {step === 3 && (
                   <motion.div 
                     initial={{ opacity: 0, x: 20 }} 
                     animate={{ opacity: 1, x: 0 }} 
                     exit={{ opacity: 0, x: -20 }}
                     className="space-y-6"
                   >
                     <h3 className="text-xl font-display font-black uppercase tracking-tight">Charte de Qualité</h3>
                     <div className="bg-brand-gold/5 border border-brand-gold/20 p-6 rounded-2xl space-y-4">
                        <div className="flex gap-3 text-sm font-medium text-gray-300">
                           <CheckCircle className="w-5 h-5 text-brand-gold flex-shrink-0" />
                           <p>Je m'engage à publier des contenus originaux dont je détiens les droits.</p>
                        </div>
                        <div className="flex gap-3 text-sm font-medium text-gray-300">
                           <CheckCircle className="w-5 h-5 text-brand-gold flex-shrink-0" />
                           <p>Je m'engage à respecter les délais de publication annoncés à ma communauté.</p>
                        </div>
                        <div className="flex gap-3 text-sm font-medium text-gray-300">
                           <CheckCircle className="w-5 h-5 text-brand-gold flex-shrink-0" />
                           <p>Je m'engage à respecter la Charte de la communauté AfriStory.</p>
                        </div>
                     </div>
                     <button type="submit" className="w-full py-4 bg-brand-gold text-brand-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:shadow-xl hover:shadow-brand-gold/20 flex items-center justify-center gap-3 transition-all">
                       <Send className="w-4 h-4" /> ENVOYER MA CANDIDATURE
                     </button>
                   </motion.div>
                 )}
               </AnimatePresence>
            </form>
          </div>

          {/* Perks Sidebar */}
          <div className="lg:col-span-2 space-y-8">
             <div className="glass-card p-8 border-brand-gold/20 bg-brand-gold/5 space-y-6">
                <h4 className="text-sm font-black uppercase tracking-widest text-brand-gold">Avantages Artiste Pro</h4>
                <div className="space-y-4">
                   {[
                     { t: "Certification de Compte", d: "Badge Pro et inclusion dans les classements officiels." },
                     { t: "Monétisation Directe", d: "Gain d'AfriCoins sur chaque chapitre Early Access." },
                     { t: "Outils de Collaboration", d: "Créez des annonces prioritaires pour recruter vos coloristes." },
                     { t: "Support Dédié", d: "Accès prioritaire à notre équipe de modération et technique." },
                   ].map((perk, i) => (
                     <div key={i} className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-black uppercase">
                           <Zap className="w-3 h-3 text-brand-gold" /> {perk.t}
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{perk.d}</p>
                     </div>
                   ))}
                </div>
             </div>

             <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex gap-4 items-start">
               <AlertCircle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
               <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed">
                 Votre dossier sera examiné par notre équipe éditoriale sous 5 à 7 jours ouvrés. Vous recevrez une notification au terme de l'examen.
               </p>
             </div>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-24 text-center space-y-8 glass-card border-brand-gold/30"
        >
          <div className="w-20 h-20 bg-brand-gold/20 text-brand-gold rounded-full flex items-center justify-center mx-auto border border-brand-gold/40">
             <Rocket className="w-10 h-10" />
          </div>
          <div className="space-y-3">
             <h2 className="text-3xl font-display font-black uppercase">Candidature Envoyée !</h2>
             <p className="text-gray-400 font-medium max-w-md mx-auto">Merci pour votre intérêt ! Notre équipe examine votre portfolio avec attention. Une notification vous sera envoyée très prochainement.</p>
          </div>
          <Link to="/artist" className="inline-block px-12 py-4 bg-white text-brand-black font-black rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">
            RETOURNER AU DASHBOARD
          </Link>
        </motion.div>
      )}
    </div>
  );
}
