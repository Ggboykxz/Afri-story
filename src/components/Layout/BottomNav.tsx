import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Library, MessageCircle, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';

const navItems = [
  { to: '/', icon: Home, label: 'Accueil' },
  { to: '/explore', icon: Search, label: 'Explorer' },
  { to: '/library', icon: Library, label: 'Biblio', auth: true },
  { to: '/forum', icon: MessageCircle, label: 'Forum' },
  { to: '/profile', icon: User, label: 'Profil', auth: true },
];

export function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  const isHidden = !['/', '/explore', '/library', '/forum', '/profile'].includes(location.pathname) && 
                  !location.pathname.startsWith('/work/') &&
                  !location.pathname.startsWith('/read/');

  if (isHidden) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-brand-black/95 backdrop-blur-xl border-t border-white/10 md:hidden">
      <div className="flex items-center justify-around py-2 pb-safe">
        {navItems.map((item) => {
          if (item.auth && !user) return null;
          
          const Icon = item.icon;
          const isActive = location.pathname === item.to || 
                        (item.to !== '/' && location.pathname.startsWith(item.to));

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive ? 'text-brand-gold' : 'text-gray-500'
              }`}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="relative"
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-gold rounded-full"
                  />
                )}
              </motion.div>
              <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}