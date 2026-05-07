import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Rocket, ShieldCheck, Award, Zap, CheckCircle, Info, ArrowRight, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function About() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-24">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-gold/5 rounded-full blur-[120px] -z-10" />
        <div className="space-y-4">
           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-gold">Le Futur de la BD Africaine</span>
           <h1 className="text-5xl md:text-8xl font-display font-black uppercase tracking-tighter leading-[0.8]">
             Nexus-<span className="gradient-text">Hub</span>
           </h1>
        </div>
        <p className="text-gray-400 text-lg md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed italic">
          "Un pont entre le talent brut et l'excellence mondiale."
        </p>
      </section>

      {/* Mission / Bento Grid */}
      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-12 bg-linear-to-br from-brand-brown/40 to-brand-black border-white/10 space-y-8 flex flex-col justify-center">
           <h2 className="text-3xl md:text-5xl font-display font-black uppercase leading-none">Notre <span className="text-brand-gold">Mission</span></h2>
           <p className="text-gray-400 text-lg leading-relaxed font-medium">
             Nous croyons que l'Afrique regorge de récits extraordinaires qui ne demandent qu'à être illustrés. Nexus-Hub est conçu pour offrir aux créateurs une plateforme de monétisation juste, une communauté engagée et les outils technologiques pour briller à l'international.
           </p>
           <div className="flex gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex-1 text-center space-y-2">
                 <div className="text-3xl font-display font-black text-brand-gold">100%</div>
                 <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Focus Afro-Centric</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex-1 text-center space-y-2">
                 <div className="text-3xl font-display font-black text-brand-gold">70%</div>
                 <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Revenus Artistes</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex-1 text-center space-y-2">
                 <div className="text-3xl font-display font-black text-brand-gold">∞</div>
                 <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Possibilités</p>
              </div>
           </div>
        </div>

        <div className="glass-card p-8 bg-brand-gold text-brand-black flex flex-col justify-between group cursor-pointer" onClick={() => navigate('/signup')}>
           <div className="space-y-6">
             <Rocket className="w-12 h-12" />
             <h3 className="text-3xl font-display font-black uppercase leading-tight">Rejoignez l'Aventure</h3>
             <p className="font-bold opacity-80">Que vous soyez un lecteur passionné ou un artiste en herbe, votre place est dans le Nexus.</p>
           </div>
           <div className="flex items-center justify-between pt-8">
              <span className="text-xs font-black uppercase tracking-widest underline decoration-2">S'inscrire</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
           </div>
        </div>
      </section>

      {/* Values */}
      <section className="space-y-12">
        <h2 className="text-center text-4xl font-display font-black uppercase tracking-tight">Les Piliers du <span className="text-brand-gold">Nexus</span></h2>
        <div className="grid md:grid-cols-3 gap-8">
           {[
             { icon: Award, title: "Excellence", desc: "Le programme Pro-Draft garantit une qualité éditoriale supérieure pour nos lecteurs." },
             { icon: ShieldCheck, title: "Équité", desc: "Une répartition transparente des revenus pour que les artistes vivent de leur talent." },
             { icon: Zap, title: "Innovation", desc: "Une expérience de lecture web-first fluide et immersive, optimisée pour tous les supports." }
           ].map((v, i) => (
             <div key={i} className="text-center space-y-4 p-8 rounded-3xl hover:bg-white/2 transition-colors border border-transparent hover:border-white/5">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-brand-gold border border-brand-gold/20">
                  <v.icon className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-display font-black uppercase">{v.title}</h4>
                <p className="text-sm text-gray-400 font-medium leading-relaxed">{v.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 text-center space-y-8 border-t border-white/5">
         <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter">Prêt à entrer dans <br /> le <span className="gradient-text">Nexus-Hub ?</span></h2>
         <div className="flex flex-wrap justify-center gap-6">
            <button 
              onClick={() => navigate('/explore')}
              className="px-12 py-4 bg-white text-brand-black font-black rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 transition-transform"
            >
              DÉCOUVRIR LES ŒUVRES
            </button>
            <button 
              onClick={() => navigate('/collaboration')}
              className="px-12 py-4 bg-white/5 border border-white/10 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-white transition-all hover:text-brand-black"
            >
              HUB COLLABORATION
            </button>
         </div>
      </section>
    </div>
  );
}
