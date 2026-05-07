import React from 'react';
import { Shield, Book, CheckCircle } from 'lucide-react';

export function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12 pb-24">
      <header className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter">Conditions <span className="gradient-text">Générales</span></h1>
        <p className="text-gray-400 font-medium lowercase tracking-tighter">Dernière mise à jour : Mai 2026</p>
      </header>

      <section className="space-y-8 text-gray-400 font-medium leading-relaxed">
        <div className="p-8 glass-card border-brand-gold/20 bg-brand-gold/5 space-y-4">
          <h2 className="text-xl font-display font-black uppercase text-brand-gold flex items-center gap-3">
             <Shield className="w-6 h-6" /> 1. Acceptation
          </h2>
          <p>
            En accédant au Nexus-Hub, vous acceptez de respecter ces conditions. Si vous n'êtes pas d'accord, veuillez cesser toute utilisation du service.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-display font-black uppercase text-white flex items-center gap-3">
             <Book className="w-6 h-6 text-brand-gold" /> 2. Propriété Intellectuelle
          </h2>
          <p>
            Tous les contenus publiés sur le Nexus-Hub restent la propriété exclusive de leurs auteurs respectifs. La plateforme dispose d'une licence de diffusion non-exclusive.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-display font-black uppercase text-white flex items-center gap-3">
             <CheckCircle className="w-6 h-6 text-brand-gold" /> 3. Monétisation & Nexus-Coins
          </h2>
          <p>
            Les Nexus-Coins sont des crédits virtuels utilisables uniquement sur la plateforme. Tout achat est définitif et non remboursable, sauf erreur technique avérée.
          </p>
        </div>
      </section>

      <div className="bg-white/5 p-8 rounded-3xl border border-white/10 italic text-sm">
        Pour toute question relative à ces conditions, contactez legal@nexus-hub.africa
      </div>
    </div>
  );
}
