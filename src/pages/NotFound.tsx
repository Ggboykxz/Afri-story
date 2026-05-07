import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-8">
      <div className="relative">
        <h1 className="text-[150px] md:text-[200px] font-display font-black text-brand-gold/10 leading-none">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 bg-brand-gold rounded-full flex items-center justify-center">
            <span className="text-6xl font-display font-black text-brand-black">?</span>
          </div>
        </div>
      </div>

      <div className="text-center space-y-4 -mt-12">
        <h2 className="text-3xl font-display font-black uppercase tracking-tighter">
          Page Non Trouvée
        </h2>
        <p className="text-gray-500 max-w-md">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <Link
          to="/"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-gold text-brand-black rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform"
        >
          <Home className="w-4 h-4" /> Accueil
        </Link>
        <Link
          to="/explore"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
        >
          <Search className="w-4 h-4" /> Explorer
        </Link>
      </div>
    </div>
  );
}