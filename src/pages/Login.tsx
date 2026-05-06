import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Chrome, ArrowRight, Loader2, MailQuestion } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { motion } from 'motion/react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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
              <span className="font-display font-black text-2xl">A</span>
           </div>
           <h1 className="text-3xl font-display font-black uppercase tracking-tighter text-white">Ravi de vous revoir</h1>
           <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Connectez-vous à votre sanctuaire créatif</p>
        </div>

        {error && (
          <div className="p-4 bg-brand-red/10 border border-brand-red/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-brand-red text-center">
             {error}
          </div>
        )}

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
                 <Link to="#" className="text-[10px] font-black uppercase text-brand-gold tracking-widest hover:underline">Oublié ?</Link>
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
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>CONNEXION <ArrowRight className="w-4 h-4" /></>}
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
          className="w-full py-4 bg-white text-brand-black font-black uppercase text-xs rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
        >
           <Chrome className="w-5 h-5" /> Google
        </button>

        <p className="text-center text-xs text-gray-500 font-bold">
           Pas encore membre ? {' '}
           <Link to="/signup" className="text-brand-gold uppercase tracking-widest font-black hover:underline">S'inscrire</Link>
        </p>
      </motion.div>
    </div>
  );
};
