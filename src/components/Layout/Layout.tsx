import React from 'react';
import { Navbar } from './Navbar';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="py-12 px-6 border-t border-white/10 bg-brand-black flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <span className="font-display text-2xl font-bold gradient-text">AfriStory</span>
          <p className="text-sm text-gray-500">Le hub créatif de la narration africaine.</p>
        </div>
        <div className="flex gap-8 text-sm text-gray-400">
          <a href="#" className="hover:text-brand-gold">À propos</a>
          <a href="#" className="hover:text-brand-gold">Artistes</a>
          <a href="#" className="hover:text-brand-gold">Conditions</a>
          <a href="#" className="hover:text-brand-gold">Confidentialité</a>
        </div>
      </footer>
    </div>
  );
};
