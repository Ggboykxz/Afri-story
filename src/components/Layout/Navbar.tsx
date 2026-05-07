import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User as UserIcon, Menu, LogIn, LayoutDashboard, MessageCircle, Shield, Loader2, Home, Library, Users, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { signInWithGoogle, auth } from '../../lib/firebase';
import { motion } from 'motion/react';
import { notificationService, Notification } from '../../lib/notificationService';

export const Navbar = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    const unsubscribe = notificationService.subscribe(user.uid, (data) => {
      setNotifications(data);
    });
    return () => unsubscribe();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await notificationService.markAllAsRead(user.uid);
  };

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 z-50 glass-navbar px-4 md:px-8 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 bg-brand-gold rounded-lg flex items-center justify-center text-brand-black rotate-[-5deg] group-hover:rotate-0 transition-transform">
           <span className="font-display font-black text-xl">A</span>
        </div>
        <span className="font-display text-xl font-bold tracking-tighter text-white">AfriStory</span>
      </Link>

      <div className="hidden md:flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.15em]">
        <Link to="/" className="text-gray-400 hover:text-white transition-colors">Accueil</Link>
        <Link to="/explore" className="text-gray-400 hover:text-white transition-colors">Explorer</Link>
        <Link to="/forum" className="text-gray-400 hover:text-white transition-colors">Forums</Link>
        <Link to="/library" className="text-gray-400 hover:text-white transition-colors">Ma Biblio</Link>
        <Link to="/collaboration" className="text-gray-400 hover:text-white transition-colors">Collabs</Link>
        <div className="h-4 w-[1px] bg-white/10 mx-2" />
        <Link to="/shop" className="text-gray-400 hover:text-white transition-colors">Boutique</Link>
      </div>

      <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-full px-3 py-1.5 focus-within:border-brand-gold/50 transition-all">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm px-2 w-32 md:w-48 placeholder:text-gray-600"
            />
          </form>

        {user ? (
          <div className="flex items-center gap-4">
            <Link to="/messages" className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full hover:border-brand-gold/30 transition-all">
              <MessageCircle className="w-4 h-4 text-brand-gold" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Messages</span>
            </Link>
            <div className="hidden lg:flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/20 px-3 py-1.5 rounded-full">
              <span className="text-[10px] font-black text-brand-gold uppercase tracking-widest">AfriCoins</span>
              <span className="text-sm font-display font-bold text-white">{profile?.afriCoins || 0}</span>
            </div>
            
            <div className="relative group">
              <button 
                onClick={() => navigate('/notifications')}
                className="relative p-2 text-gray-400 hover:text-white transition-colors"
                onMouseEnter={() => setShowNotifications(true)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-brand-red rounded-full animate-pulse" />
                )}
              </button>
              
              {/* Notification Dropdown */}
              <div 
                onMouseLeave={() => setShowNotifications(false)}
                className={`absolute right-0 top-full mt-2 w-80 glass-card p-4 transition-all z-50 ${showNotifications ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                   <h4 className="font-display font-bold">Notifications</h4>
                   {unreadCount > 0 && (
                     <button 
                       onClick={handleMarkAllRead}
                       className="text-[8px] font-black uppercase text-brand-gold hover:underline"
                     >
                       Tout marquer comme lu
                     </button>
                   )}
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                   {notifications.length > 0 ? (
                     notifications.map((notif) => (
                       <div 
                         key={notif.id} 
                         className={`flex gap-3 text-left p-2 rounded-lg transition-colors ${notif.isRead ? 'opacity-50' : 'bg-white/5'}`}
                         onClick={() => {
                           notificationService.markAsRead(notif.id);
                           if (notif.link) navigate(notif.link);
                           setShowNotifications(false);
                         }}
                       >
                         {!notif.isRead && <div className="w-2 h-2 rounded-full bg-brand-gold mt-1.5 flex-shrink-0" />}
                         <div className="flex-1">
                            <p className="text-xs text-white leading-relaxed">{notif.message}</p>
                            <span className="text-[8px] font-bold text-gray-500 uppercase mt-1 block">
                              {notif.createdAt?.toDate?.() ? notif.createdAt.toDate().toLocaleDateString() : 'Récemment'}
                            </span>
                         </div>
                       </div>
                     ))
                   ) : (
                     <div className="py-8 text-center space-y-2">
                       <Bell className="w-8 h-8 text-white/10 mx-auto" />
                       <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Aucune notification</p>
                     </div>
                   )}
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => {}}>
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white/10 group-hover:border-brand-gold transition-all" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-brown flex items-center justify-center border-2 border-white/10 group-hover:border-brand-gold transition-all">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-56 glass-card p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 translate-y-2 group-hover:translate-y-0 divide-y divide-white/5">
                <div className="p-3">
                   <div className="font-bold text-xs truncate text-white">{profile?.displayName || 'Utilisateur'}</div>
                   <div className="text-[8px] font-black uppercase text-brand-gold tracking-widest mt-0.5">{profile?.role || 'LECTEUR'}</div>
                </div>
                <div className="py-2">
                   <Link to={`/profile/${user.uid}`} className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-lg text-xs font-bold transition-all text-gray-300 hover:text-white">
                      <UserIcon className="w-4 h-4" /> Profil
                   </Link>
                   {['admin', 'moderator', 'supervisor'].includes(profile?.role) ? (
                     <Link to="/admin" className="flex items-center gap-3 w-full p-3 hover:bg-brand-gold/10 rounded-lg text-xs font-black transition-all text-brand-gold">
                        <Shield className="w-4 h-4" /> Panel Admin
                     </Link>
                   ) : ['artist_pro', 'artist_draft', 'artist_mentor'].includes(profile?.role) ? (
                     <Link to="/artist" className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-lg text-xs font-bold transition-all text-gray-300 hover:text-white">
                        <LayoutDashboard className="w-4 h-4" /> Studio Créateur
                     </Link>
                   ) : (
                     <Link to="/become-pro" className="flex items-center gap-3 w-full p-3 hover:bg-brand-gold/10 rounded-lg text-xs font-black transition-all text-brand-gold">
                        <LayoutDashboard className="w-4 h-4" /> Devenir Créateur
                     </Link>
                   )}
                   <Link to="/settings" className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-lg text-xs font-bold transition-all text-gray-300 hover:text-white">
                      <LogIn className="w-4 h-4 rotate-180" /> Paramètres
                   </Link>
                </div>
                <div className="pt-2">
                   <button 
                     onClick={() => auth.signOut()}
                     className="flex items-center gap-3 w-full p-3 hover:bg-red-500/10 rounded-lg text-xs font-black uppercase tracking-widest transition-all text-red-100"
                   >
                      Déconnexion
                   </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
             <Link to="/login" className="text-sm font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors hidden sm:block">
                Connexion
             </Link>
             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => navigate('/signup')}
               className="bg-brand-gold text-brand-black px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-brand-gold/10"
             >
               S'inscrire
             </motion.button>
          </div>
        )}
        
        <button className="md:hidden p-2 text-gray-400" onClick={() => setMobileMenuOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden" style={{ backgroundColor: 'black' }}>
          <div className="fixed inset-0 bg-black" onClick={() => setMobileMenuOpen(false)} style={{ opacity: 1 }} />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-72 z-[10000]"
            style={{ backgroundColor: '#000000' }}
          >
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <span className="font-display font-bold text-white">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400">
                ✕
              </button>
            </div>
            <div className="p-4 space-y-2">
              <Link to="/" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                <Home className="w-5 h-5" /> Accueil
              </Link>
              <Link to="/explore" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                <Search className="w-5 h-5" /> Explorer
              </Link>
              <Link to="/forum" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                <MessageCircle className="w-5 h-5" /> Forums
              </Link>
              <Link to="/library" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                <Library className="w-5 h-5" /> Ma Biblio
              </Link>
              <Link to="/collaboration" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                <Users className="w-5 h-5" /> Collabs
              </Link>
              <div className="h-px bg-white/10 my-4" />
              <Link to="/shop" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                <ShoppingBag className="w-5 h-5" /> Boutique
              </Link>
              {user ? (
                <>
                  <Link to="/messages" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                    <MessageCircle className="w-5 h-5" /> Messages
                  </Link>
                  <Link to="/notifications" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                    <Bell className="w-5 h-5" /> Notifications {unreadCount > 0 && <span className="ml-auto bg-brand-red text-xs px-2 rounded-full">{unreadCount}</span>}
                  </Link>
                </>
              ) : (
                <div className="pt-4 space-y-2">
                  <Link to="/login" className="flex items-center justify-center p-3 border border-white/10 rounded-lg text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                    Connexion
                  </Link>
                  <Link to="/signup" className="flex items-center justify-center p-3 bg-brand-gold rounded-lg text-brand-black font-bold" onClick={() => setMobileMenuOpen(false)}>
                    S'inscrire
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </nav>
  );
};
