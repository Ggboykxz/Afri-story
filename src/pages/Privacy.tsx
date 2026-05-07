import React from 'react';
import { Eye, Shield, Lock } from 'lucide-react';

export function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12 pb-24">
      <header className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter">Politique de <span className="gradient-text">Confidentialité</span></h1>
        <p className="text-gray-400 font-medium lowercase tracking-tighter">Dernière mise à jour : Mai 2026</p>
      </header>

      <section className="space-y-8 text-gray-400 font-medium leading-relaxed">
        <div className="p-8 glass-card border-blue-500/20 bg-blue-500/5 space-y-4">
          <h2 className="text-xl font-display font-black uppercase text-blue-400 flex items-center gap-3">
             <Shield className="w-6 h-6" /> 1. Données Collectées
          </h2>
          <p>
            Nous collectons uniquement les données nécessaires à votre expérience de lecture : email pour l'authentification, historique de lecture et transactions de AfriCoins.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-display font-black uppercase text-white flex items-center gap-3">
             <Lock className="w-6 h-6 text-brand-gold" /> 2. Sécurité
          </h2>
          <p>
            Vos données sont protégées via les protocoles de sécurité de Firebase (Google Cloud). Nous ne vendons JAMAIS vos informations personnelles à des tiers.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-display font-black uppercase text-white flex items-center gap-3">
             <Eye className="w-6 h-6 text-brand-gold" /> 3. Cookies
          </h2>
          <p>
            Nous utilisons des jetons de session pour maintenir votre connexion active et des analyiques anonymes pour améliorer la plateforme.
          </p>
        </div>
      </section>

      <div className="bg-white/5 p-8 rounded-3xl border border-white/10 italic text-sm">
        Pour exercer vos droits de suppression de données, écrivez à privacy@afristory.africa
      </div>
    </div>
  );
}
