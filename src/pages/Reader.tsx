import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, ChevronUp, ChevronDown, List, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Reader = () => {
  const { workId, chapterId } = useParams();
  const navigate = useNavigate();
  const [showControls, setShowControls] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);
      
      if (winScroll > 50) {
        setShowControls(false);
      } else {
        setShowControls(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mock content (vertical scroll images)
  const pages = [
     'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1000',
     'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1000',
     'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=1000',
  ];

  return (
    <div className="bg-brand-black min-h-screen">
      {/* Top Bar */}
      <AnimatePresence>
        {(showControls || scrollProgress < 5) && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 h-16 bg-brand-black/90 backdrop-blur-md z-50 border-b border-white/10 px-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(`/work/${workId}`)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Retour"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-display font-bold text-sm truncate max-w-[150px] md:max-w-none">Légendes d'Oyo</h1>
                <p className="text-[10px] text-brand-gold font-bold uppercase tracking-widest">Épisode 1</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><List className="w-5 h-5" /></button>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><Share2 className="w-5 h-5" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-[60]">
        <div 
          className="h-full bg-brand-gold transition-all duration-100" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto pt-4 flex flex-col items-center">
        {pages.map((page, index) => (
          <div key={index} className="w-full relative">
            <img 
              src={page} 
              alt={`Page ${index + 1}`} 
              className="w-full h-auto"
              draggable={false}
            />
            {/* Minimalist divider */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-brand-black to-transparent pointer-events-none" />
          </div>
        ))}

        {/* End of chapter */}
        <div className="py-24 px-6 text-center space-y-8 w-full">
          <div className="h-[1px] w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />
          <h2 className="text-3xl font-display font-black uppercase tracking-tighter">FIN DU CHAPITRE</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <button className="w-full sm:w-auto px-8 py-4 bg-brand-gold text-brand-black font-black rounded-2xl flex items-center justify-center gap-2 group">
               ÉPISODE SUIVANT
               <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
             </button>
             <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10">
               <MessageSquare className="w-5 h-5" />
               COMMENTER
             </button>
          </div>
          <Link to={`/work/${workId}`} className="block text-sm text-gray-500 hover:text-brand-gold font-bold uppercase tracking-widest">Voir tous les épisodes</Link>
        </div>
      </div>

      {/* Floating Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-40">
         <motion.button 
           whileHover={{ scale: 1.1 }}
           whileTap={{ scale: 0.9 }}
           className="w-12 h-12 bg-white/5 backdrop-blur-lg border border-white/10 rounded-full flex items-center justify-center text-white"
           onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
         >
           <ChevronUp className="w-6 h-6" />
         </motion.button>
      </div>
    </div>
  );
};
