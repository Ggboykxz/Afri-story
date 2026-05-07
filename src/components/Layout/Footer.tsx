import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, ChevronUp, MessageSquare, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-brand-black border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link to="/" className="text-2xl font-display font-black tracking-tighter flex items-center gap-2">
              <span className="text-brand-gold">AFRI</span>STORY
            </Link>
            <p className="text-gray-500 text-xs font-bold uppercase leading-relaxed tracking-wider">
              La plateforme n°1 dédiée au rayonnement des récits, BD et Webtoons africains originaux.
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-brand-gold hover:text-brand-black transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-brand-gold hover:text-brand-black transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-brand-gold hover:text-brand-black transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-brand-gold hover:text-brand-black transition-all">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-gold mb-6">Plateforme</h4>
            <ul className="space-y-4">
              <li><Link to="/explore" className="text-sm font-bold text-gray-500 hover:text-white transition-colors uppercase">Catalogue</Link></li>
              <li><Link to="/rankings" className="text-sm font-bold text-gray-500 hover:text-white transition-colors uppercase">Classements</Link></li>
              <li><Link to="/forum" className="text-sm font-bold text-gray-500 hover:text-white transition-colors uppercase">Forums</Link></li>
              <li><Link to="/shop" className="text-sm font-bold text-gray-500 hover:text-white transition-colors uppercase">Boutique</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-gold mb-6">Communauté</h4>
            <ul className="space-y-4">
              <li><Link to="/become-pro" className="text-sm font-bold text-gray-500 hover:text-white transition-colors uppercase">Devenir Créateur</Link></li>
              <li><Link to="/collaboration" className="text-sm font-bold text-gray-500 hover:text-white transition-colors uppercase">Collaboration Hub</Link></li>
              <li><Link to="/faq" className="text-sm font-bold text-gray-500 hover:text-white transition-colors uppercase">FAQ</Link></li>
              <li><Link to="/about" className="text-sm font-bold text-gray-500 hover:text-white transition-colors uppercase">À propos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-gold mb-6">Légal</h4>
            <ul className="space-y-4">
              <li><Link to="/terms" className="text-sm font-bold text-gray-500 hover:text-white transition-colors uppercase">Conditions</Link></li>
              <li><Link to="/privacy" className="text-sm font-bold text-gray-500 hover:text-white transition-colors uppercase">Confidentialité</Link></li>
              <li><Link to="/subscription" className="text-sm font-bold text-gray-500 hover:text-white transition-colors uppercase">Abonnements</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest text-center md:text-left">
            © {new Date().getFullYear()} AFRISTORY. TOUS DROITS RÉSERVÉS.
          </p>
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2 text-gray-600">
               <ShieldCheck className="w-4 h-4" />
               <span className="text-[9px] font-black uppercase tracking-tight">Sécurisé</span>
            </div>
            <button 
              onClick={scrollToTop}
              className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-gray-400 hover:bg-brand-gold hover:text-brand-black hover:border-brand-gold transition-all group"
            >
              Retour en haut <ChevronUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};