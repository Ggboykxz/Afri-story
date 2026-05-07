import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, CheckCircle2, Facebook } from 'lucide-react';
import { auth } from '../lib/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signInWithEmailAndPassword,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      setError("Erreur de connexion avec Google.");
      console.error(err);
    }
  };

  const handleFacebookLogin = async () => {
    const provider = new FacebookAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      setError("Erreur de connexion avec Facebook.");
      console.error(err);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError("Email ou mot de passe incorrect.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Veuillez saisir votre e-mail pour réinitialiser votre mot de passe.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (err: any) {
      setError("Erreur : Impossible d'envoyer l'e-mail de réinitialisation.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[url('https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=2000')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-brand-black/90 backdrop-blur-sm" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card max-w-md w-full p-10 relative z-10 space-y-8 backdrop-blur-xl border-white/10"
      >
        <div className="text-center space-y-2">
           <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-gold rounded-xl text-brand-black mb-4 rotate-[-5deg]">
              <span className="font-display font-black text-2xl">N</span>
           </div>
           <h1 className="text-3xl font-display font-black uppercase tracking-tighter text-white">Ravi de vous revoir</h1>
           <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Connectez-vous à votre sanctuaire créatif</p>
        </div>

        <AnimatePresence>
          {(error || resetSent) && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`p-4 border rounded-xl text-[10px] font-black uppercase tracking-widest text-center ${
                resetSent ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-brand-red/10 border-brand-red/20 text-brand-red'
              }`}
            >
               {resetSent ? (
                 <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-3 h-3" /> E-mail de réinitialisation envoyé !
                 </div>
               ) : error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleEmailLogin} className="space-y-4">
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

           <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                 <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Mot de passe</label>
                 <button 
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[10px] font-black uppercase text-brand-gold tracking-widest hover:underline"
                >
                  Oublié ?
                </button>
              </div>
              <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                 <input 
                   type="password" 
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                   required
                   className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-brand-gold outline-none transition-all"
                   placeholder="••••••••"
                 />
              </div>
           </div>

           <button 
             type="submit"
             disabled={loading}
             className="w-full py-4 bg-brand-gold text-brand-black font-black uppercase text-xs rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-8 shadow-xl shadow-brand-gold/20"
           >
              {loading && !resetSent ? <Loader2 className="w-5 h-5 animate-spin" /> : <>CONNEXION <ArrowRight className="w-4 h-4" /></>}
           </button>
        </form>

        <div className="relative">
           <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
           <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="bg-brand-black px-4 text-gray-600">Ou continuer avec</span>
           </div>
        </div>

<button 
           onClick={handleGoogleLogin}
           className="w-full py-4 bg-white text-brand-black font-bold text-sm rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3 border border-gray-200"
         >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
               <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
               <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
               <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
               <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Se connecter avec Google
         </button>

         <button 
           onClick={handleFacebookLogin}
           className="w-full py-4 bg-[#1877F2] text-white font-bold text-sm rounded-xl hover:bg-[#0d65d9] transition-all flex items-center justify-center gap-3"
         >
            <Facebook className="w-5 h-5" />
            Se connecter avec Facebook
         </button>

        <p className="text-center text-xs text-gray-500 font-bold">
           Pas encore membre ? {' '}
           <Link to="/signup" className="text-brand-gold uppercase tracking-widest font-black hover:underline">S'inscrire</Link>
        </p>
      </motion.div>
    </div>
  );
};

