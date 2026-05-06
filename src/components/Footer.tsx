import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, BookOpen, MessageCircle, BarChart3, Globe, Shield, Instagram, Twitter, Youtube } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 pt-24 pb-12 mt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-2 group">
             <div className="w-10 h-10 bg-brand-gold rounded-xl flex items-center justify-center text-brand-black rotate-[-5deg] group-hover:rotate-0 transition-transform">
                <span className="font-display font-black text-2xl">N</span>
             </div>
             <span className="text-xl font-display font-black uppercase tracking-tighter">Nexus-Hub</span>
          </Link>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            La destination ultime pour le webtoon africain. Racontez votre histoire, bâtissez votre communauté, et vivez de votre art.
          </p>
          <div className="flex gap-4">
             {[Instagram, Twitter, Youtube].map((Icon, i) => (
               <a key={i} href="#" className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-brand-gold hover:bg-brand-gold/10 transition-all border border-transparent hover:border-brand-gold/20">
                  <Icon className="w-5 h-5" />
               </a>
             ))}
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-6">Plateforme</h4>
          <ul className="space-y-4">
             {['Découvrir', 'Dernières Sorties', 'Classements', 'Boutique Nexus-Coins'].map(item => (
               <li key={item}>
                 <Link to="#" className="text-sm font-bold text-gray-500 hover:text-brand-gold transition-colors">{item}</Link>
               </li>
             ))}
          </ul>
        </div>

        <div>
           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-6">Communauté</h4>
           <ul className="space-y-4">
              {['Forum Général', 'Espace Créateurs', 'Support & Aide', 'Contact Pro'].map(item => (
                <li key={item}>
                  <Link to="#" className="text-sm font-bold text-gray-500 hover:text-brand-gold transition-colors">{item}</Link>
                </li>
              ))}
           </ul>
        </div>

        <div className="glass-card p-6 border-brand-gold/20 space-y-4 relative overflow-hidden group">
           <div className="absolute -top-12 -right-12 w-24 h-24 bg-brand-gold opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity" />
           <h4 className="font-display font-black text-lg">Prêt à créer ?</h4>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Rejoignez plus de 5,000 artistes africains.</p>
           <Link to="/artist-dashboard" className="block w-full py-3 bg-brand-gold text-brand-black text-center text-[10px] font-black uppercase tracking-wider rounded-lg hover:scale-[1.02] transition-transform">
              DEVENIR CRÉATEUR
           </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            © {currentYear} AFRISTORY INC • TOUS DROITS RÉSERVÉS
         </div>
         <div className="flex gap-8">
            {['Mentions Légales', 'Confidentialité', 'Cookies'].map(item => (
              <Link key={item} to="#" className="text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-colors">
                 {item}
              </Link>
            ))}
         </div>
      </div>
    </footer>
  );
};
