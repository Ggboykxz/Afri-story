import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Github, Instagram, Twitter, MessageCircle, Youtube } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-black border-t border-white/5 pt-24 pb-12 mt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
        <div className="col-span-2 space-y-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-brand-gold rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-brand-gold/20">
               <span className="font-display font-black text-brand-black text-xl">N</span>
            </div>
            <span className="font-display text-2xl font-black uppercase tracking-tighter text-white">Nexus-Hub</span>
          </Link>
          <p className="text-gray-500 text-sm max-w-sm font-medium leading-relaxed italic">
            La première destination pour la BD africaine moderne. Lisez, créez, et connectez-vous avec le futur de la narration afro-centrée.
          </p>
          <div className="flex gap-4">
             {[Twitter, Instagram, Youtube, MessageCircle].map((Icon, i) => (
               <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-brand-gold hover:text-brand-black transition-all">
                  <Icon className="w-5 h-5" />
               </a>
             ))}
          </div>
        </div>

        <div className="space-y-6">
           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold">Plateforme</h4>
           <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-gray-400">
              <li><Link to="/explore" className="hover:text-white transition-colors">Explorer</Link></li>
              <li><Link to="/forum" className="hover:text-white transition-colors">Forums</Link></li>
              <li><Link to="/rankings" className="hover:text-white transition-colors">Classements</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Boutique</Link></li>
           </ul>
        </div>

        <div className="space-y-6">
           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold">Communauté</h4>
           <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-gray-400">
              <li><Link to="/collaboration" className="hover:text-white transition-colors">Hub Collab</Link></li>
              <li><Link to="/become-pro" className="hover:text-white transition-colors">Devenir Pro</Link></li>
              <li><Link to="/artist" className="hover:text-white transition-colors">Tableau de Bord</Link></li>
           </ul>
        </div>

        <div className="space-y-6">
           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold">Aide & Info</h4>
           <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-gray-400">
              <li><Link to="/about" className="hover:text-white transition-colors">À Propos</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ / Aide</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">TOS</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Confidentialité</Link></li>
           </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
         <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-600">
            © {currentYear} NEXUS-HUB • TOUS DROITS RÉSERVÉS
         </p>
         <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400">Système Nexus Opérationnel</span>
         </div>
      </div>
    </footer>
  );
};
