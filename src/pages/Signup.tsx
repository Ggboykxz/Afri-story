import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Chrome, ArrowRight, Loader2, BookOpen, PenTool } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';

export const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<'reader' | 'artist_draft'>('reader');
  const navigate = useNavigate();

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if profile exists, if not create with selected role
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          userId: user.uid,
          email: user.email,
          displayName: user.displayName || username || user.email?.split('@')[0] || "Voyageur",
          photoURL: user.photoURL,
          role: selectedRole,
          afriCoins: 0,
          badges: [],
          createdAt: new Date().toISOString()
        });
      }
      
      navigate('/profile');
    } catch (err: any) {
      setError("Erreur lors de l'inscription avec Google. " + (err.message || ""));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
       setError("Le mot de passe doit faire au moins 6 caractères.");
       return;
    }
    if (!username.trim()) {
       setError("Le nom d'utilisateur est requis.");
       return;
    }
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: username });

      // Create profile document
      await setDoc(doc(db, 'users', user.uid), {
        userId: user.uid,
        email: user.email,
        displayName: username,
        role: selectedRole,
        afriCoins: 0,
        badges: [],
        createdAt: new Date().toISOString()
      });

      navigate('/profile');
    } catch (err: any) {
      setError("Erreur : " + (err.message || "Cette adresse e-mail est déjà utilisée ou invalide."));
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
           <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Créez votre compte AfriStory aujourd'hui</p>
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
              <div 
                onClick={() => setSelectedRole('reader')}
                className={`p-4 bg-white/5 border rounded-xl flex flex-col items-center gap-2 cursor-pointer transition-all group ${selectedRole === 'reader' ? 'border-brand-blue bg-brand-blue/5' : 'border-white/10 hover:border-brand-blue/50'}`}
              >
                 <BookOpen className={`w-5 h-5 ${selectedRole === 'reader' ? 'text-brand-blue' : 'text-gray-500'} group-hover:scale-110 transition-transform`} />
                 <span className={`text-[9px] font-black uppercase tracking-widest ${selectedRole === 'reader' ? 'text-brand-blue' : 'text-gray-400'}`}>Lecteur</span>
              </div>
              <div 
                onClick={() => setSelectedRole('artist_draft')}
                className={`p-4 bg-white/5 border rounded-xl flex flex-col items-center gap-2 cursor-pointer transition-all group ${selectedRole === 'artist_draft' ? 'border-brand-gold bg-brand-gold/5' : 'border-white/10 hover:border-brand-gold/50'}`}
              >
                 <PenTool className={`w-5 h-5 ${selectedRole === 'artist_draft' ? 'text-brand-gold' : 'text-gray-500'} group-hover:scale-110 transition-transform`} />
                 <span className={`text-[9px] font-black uppercase tracking-widest ${selectedRole === 'artist_draft' ? 'text-brand-gold' : 'text-gray-400'}`}>Artiste</span>
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
          disabled={loading}
          className="w-full py-4 bg-white text-brand-black font-black uppercase text-xs rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3 shadow-md"
        >
           <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
           </svg>
           Google
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
