import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';

export const Forbidden = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center space-y-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-brand-red/10 flex items-center justify-center">
          <ShieldX className="w-16 h-16 md:w-20 md:h-20 text-brand-red" />
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h1 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter">
          Accès <span className="text-brand-red">Refusé</span>
        </h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Vous n'avez pas les permissions nécessaires pour accéder à cette ressource.
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <button 
          onClick={() => window.history.back()}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 font-black rounded-xl hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          RETOUR
        </button>
        <Link 
          to="/"
          className="flex items-center justify-center gap-2 px-8 py-4 bg-brand-gold text-brand-black font-black rounded-xl hover:scale-105 transition-transform"
        >
          <Home className="w-5 h-5" />
          ACCUEIL
        </Link>
      </motion.div>
    </div>
  );
};

export default Forbidden;