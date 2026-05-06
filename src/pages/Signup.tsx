import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Chrome, ArrowRight, Loader2, BookOpen, PenTool } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { motion } from 'motion/react';

export const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      setError("Erreur lors de l'inscription avec Google.");
      console.error(err);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
       setError("Le mot de passe doit faire au moins 6 caractères.");
       return;
    }
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });
      navigate('/');
    } catch (err: any) {
      setError("Cette adresse e-mail est déjà utilisée ou invalide.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-brand-black/90 backdrop-blur-sm" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card max-w-lg w-full p-10 relative z-10 space-y-8 backdrop-blur-xl border-white/10"
      >
        <div className="text-center space-y-2">
           <h1 className="text-4xl font-display font-black uppercase tracking-tighter text-white">Rejoindre la Légende</h1>
           <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Créez votre compte Nexus-Hub aujourd'hui</p>
        </div>

        {error && (
          <div className="p-4 bg-brand-red/10 border border-brand-red/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-brand-red text-center">
             {error}
          </div>
        )}

        <form onSubmit={handleEmailSignup} className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Nom d'artiste / Lecteur</label>
                 <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-brand-gold outline-none transition-all"
                      placeholder="Ex: Moussa Draw"
                    />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">E-mail</label>
                 <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-brand-gold outline-none transition-all"
                      placeholder="vou@exemple.com"
                    />
                 </div>
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Mot de passe</label>
              <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                 <input 
                   type="password" 
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                   required
                   className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-brand-gold outline-none transition-all"
                   placeholder="Minimum 6 caractères"
                 />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center gap-2 cursor-pointer hover:border-brand-blue/50 transition-all group">
                 <BookOpen className="w-5 h-5 text-brand-blue group-hover:scale-110 transition-transform" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Lecteur</span>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center gap-2 cursor-pointer hover:border-brand-gold/50 transition-all group border-brand-gold/20">
                 <PenTool className="w-5 h-5 text-brand-gold group-hover:scale-110 transition-transform" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-brand-gold">Artiste</span>
              </div>
           </div>

           <button 
             type="submit"
             disabled={loading}
             className="w-full py-4 bg-brand-gold text-brand-black font-black uppercase text-xs rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4 shadow-xl shadow-brand-gold/20"
           >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>CRÉER MON COMPTE <ArrowRight className="w-4 h-4" /></>}
           </button>
        </form>

        <div className="relative">
           <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
           <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="bg-brand-black px-4 text-gray-600">Ou s'inscrire avec</span>
           </div>
        </div>

        <button 
          onClick={handleGoogleSignup}
          className="w-full py-4 bg-white text-brand-black font-black uppercase text-xs rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
        >
           <Chrome className="w-5 h-5" /> Google
        </button>

        <p className="text-center text-xs text-gray-500 font-bold">
           Déjà un compte ? {' '}
           <Link to="/login" className="text-brand-gold uppercase tracking-widest font-black hover:underline">Se connecter</Link>
        </p>

        <div className="text-[9px] text-gray-600 text-center font-medium leading-relaxed uppercase tracking-widest">
           En vous inscrivant, vous acceptez nos <Link to="#" className="underline">Conditions d'Utilisation</Link> <br /> et notre <Link to="#" className="underline">Politique de Confidentialité</Link>.
        </div>
      </motion.div>
    </div>
  );
};
