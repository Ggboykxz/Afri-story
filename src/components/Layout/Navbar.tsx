import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User as UserIcon, Menu, LogIn, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { signInWithGoogle, auth } from '../../lib/firebase';
import { motion } from 'motion/react';

export const Navbar = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 z-50 glass-navbar px-4 md:px-8 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-linear-to-tr from-brand-gold to-brand-red rounded-lg" />
        <span className="font-display text-xl font-bold tracking-tighter">AfriStory</span>
      </Link>

      <div className="hidden md:flex items-center gap-6 text-sm font-medium">
        <Link to="/" className="text-gray-300 hover:text-white transition-colors">Accueil</Link>
        <Link to="/forum" className="text-gray-300 hover:text-white transition-colors">Forums</Link>
        <Link to="/artist" className="text-gray-300 hover:text-white transition-colors">Artistes</Link>
        <div className="h-4 w-[1px] bg-white/10" />
        <Link to="/shop" className="text-gray-300 hover:text-white transition-colors">Boutique</Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-full px-3 py-1.5 focus-within:border-brand-gold/50 transition-all">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="bg-transparent border-none outline-none text-sm px-2 w-32 md:w-48 placeholder:text-gray-600"
          />
        </div>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/20 px-3 py-1.5 rounded-full">
              <span className="text-[10px] font-black text-brand-gold uppercase tracking-widest">AfriCoins</span>
              <span className="text-sm font-display font-bold text-white">{profile?.afriCoins || 0}</span>
            </div>
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-red rounded-full" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate(`/profile/${user.uid}`)}>
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white/10 group-hover:border-brand-gold transition-all" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-brand-brown flex items-center justify-center border-2 border-white/10 group-hover:border-brand-gold transition-all">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            className="flex items-center gap-2 bg-brand-gold text-brand-black px-4 py-2 rounded-full font-bold text-sm"
          >
            <LogIn className="w-4 h-4" />
            Connexion
          </motion.button>
        )}
        
        <button className="md:hidden p-2 text-gray-400">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
};
