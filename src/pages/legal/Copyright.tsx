import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Copyright, Mail, Globe } from 'lucide-react';

export function CopyrightPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-brand-gold/10 rounded-3xl flex items-center justify-center mx-auto">
          <Copyright className="w-10 h-10 text-brand-gold" />
        </div>
        <h1 className="text-4xl font-display font-black uppercase tracking-tighter">Droits d'Auteur</h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          AfriStory protège la propriété intellectuelle de tous les créateurs présents sur la plateforme.
        </p>
      </div>

      <div className="glass-card p-8 space-y-6">
        <h2 className="text-xl font-display font-black uppercase">Protection Automatique</h2>
        <p className="text-gray-400 leading-relaxed">
          Chaque œuvre publiée sur AfriStory bénéficie automatiquement d'un horodatage numérique certifiant votre propriété intellectuelle dès la mise en ligne. Nos systèmes enregistrent la date, l'heure et le contenu de votre création.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-4">
          <ShieldCheck className="w-8 h-8 text-brand-gold" />
          <h3 className="font-display font-bold">Dépôt Legal</h3>
          <p className="text-sm text-gray-500">
            Les œuvres publiées sont automatiquement enregistrées avec horodatage certifié pour usage légal.
          </p>
        </div>
        <div className="glass-card p-6 space-y-4">
          <Copyright className="w-8 h-8 text-brand-gold" />
          <h3 className="font-display font-bold">Licences Creative Commons</h3>
          <p className="text-sm text-gray-500">
            Les créateurs peuvent choisir le type de licence pour leurs œuvres (Tous droits réservés, CC BY, etc.)
          </p>
        </div>
      </div>

      <div className="glass-card p-8 space-y-6">
        <h2 className="text-xl font-display font-black uppercase">Signaler une Violation</h2>
        <p className="text-gray-400 leading-relaxed">
          Si vous constatez qu'une œuvre publiée sur AfriStory enfreint vos droits d'auteur, veuillez nous contacter immédiatement. Nous traiteons les demandes sous 24-48h.
        </p>
        <Link to="/faq" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-gold text-brand-black font-black rounded-xl">
          <Mail className="w-4 h-4" /> Signaler
        </Link>
      </div>

      <div className="text-center pt-12">
        <Link to="/terms" className="text-sm text-gray-500 hover:text-white transition-colors">
          Voir les Conditions Générales d'Utilisation
        </Link>
      </div>
    </div>
  );
}