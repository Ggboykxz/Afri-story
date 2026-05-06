import React, { useState } from 'react';
import { Shield, CheckCircle, AlertTriangle, MessageSquare, BarChart2, Eye, Flag, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const AdminDashboard = () => {
  const [validating, setValidating] = useState<string | null>(null);

  const approveArtist = async (userId: string) => {
    setValidating(userId);
    try {
      // In a real app, this would be a cloud function to ensure security
      // Here we assume the user has admin rights in Firestore rules
      await updateDoc(doc(db, 'users', userId), { 
        role: 'artist_pro',
        isVerified: true 
      });
      alert("Artiste promu en Pro avec succès !");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la validation. Vérifiez vos droits.");
    } finally {
      setValidating(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-12">
      <div className="flex flex-col md:flex-row items-end justify-between gap-6">
        <div>
           <div className="text-brand-red font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Espace Administration
           </div>
           <h1 className="text-4xl font-display font-black uppercase tracking-tighter">Moderation Hub</h1>
        </div>
        <div className="flex gap-4">
           <div className="glass-card px-6 py-4 border-white/10">
              <div className="text-[10px] font-black text-gray-500 uppercase">Signalements</div>
              <div className="text-2xl font-display font-black text-brand-red">14</div>
           </div>
           <div className="glass-card px-6 py-4 border-white/10">
              <div className="text-[10px] font-black text-gray-500 uppercase">Validations Pro</div>
              <div className="text-2xl font-display font-black text-brand-gold">3</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Pending Validations */}
         <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-display font-black flex items-center gap-3">
               <CheckCircle className="w-5 h-5 text-brand-gold" />
               Demande de statut Pro
            </h2>
            <div className="space-y-4">
               {['user_id_1', 'user_id_2'].map(id => (
                 <div key={id} className="glass-card p-6 flex items-center justify-between group hover:border-brand-gold/30 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-brand-brown" />
                       <div>
                          <h4 className="font-bold text-sm">Candidat #{id.slice(-1)} (Artiste Draft)</h4>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Oeuvre : 'Esprit de Savane' • 12K vues</p>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => approveArtist(id)}
                         disabled={validating === id}
                         className="px-4 py-2 bg-brand-gold text-brand-black text-[10px] font-black rounded-lg flex items-center gap-2"
                       >
                          {validating === id ? <Loader2 className="w-3 h-3 animate-spin" /> : "APPROUVER"}
                       </button>
                       <button className="px-4 py-2 bg-white/5 border border-white/10 text-[10px] font-black rounded-lg">REJETER</button>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Alerts & Reports */}
         <div className="space-y-6">
            <h2 className="text-xl font-display font-black flex items-center gap-3 text-brand-red">
               <Flag className="w-5 h-5" />
               Signalements Récents
            </h2>
            <div className="space-y-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="glass-card p-4 border-brand-red/20 space-y-3">
                    <div className="flex items-center justify-between">
                       <span className="text-[8px] font-black px-2 py-0.5 bg-brand-red/20 text-brand-red rounded uppercase">Violation : Spam</span>
                       <span className="text-[8px] text-gray-500 font-bold uppercase">Il y a 10m</span>
                    </div>
                    <p className="text-xs text-gray-400 italic">"Ce commentaire contient des liens vers des sites malveillants..."</p>
                    <div className="flex justify-end gap-2">
                       <button className="text-[8px] font-black uppercase text-gray-500 hover:text-white">Ignorer</button>
                       <button className="text-[8px] font-black uppercase text-brand-red hover:underline">Supprimer</button>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};
