import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft, Frown } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center space-y-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        <div className="text-[150px] md:text-[200px] font-display font-black text-white/5 leading-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Frown className="w-24 h-24 text-brand-gold/30" />
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h1 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter">
          Page <span className="text-brand-gold">Non Trouvée</span>
        </h1>
        <p className="text-gray-500 max-w-md mx-auto">
          La page que vous recherchez semble avoir disparu dans les méandres du continent.
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Link 
          to="/"
          className="flex items-center justify-center gap-2 px-8 py-4 bg-brand-gold text-brand-black font-black rounded-xl hover:scale-105 transition-transform"
        >
          <Home className="w-5 h-5" />
          ACCUEIL
        </Link>
        <Link 
          to="/explore"
          className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 font-black rounded-xl hover:bg-white/10 transition-all"
        >
          <Search className="w-5 h-5" />
          EXPLORER
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;