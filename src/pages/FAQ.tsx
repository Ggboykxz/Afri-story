import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, ChevronUp, Book, User, CreditCard, ShieldCheck, Mail, MessageSquare } from 'lucide-react';

const FAQ_ITEMS = [
  {
    category: 'Général',
    icon: HelpCircle,
    questions: [
      { q: "Qu'est-ce que le Nexus-Hub ?", a: "Nexus-Hub est la première plateforme dédiée à la promotion des créateurs de BD, Webtoons et Romans africains, mêlant lecture, communauté et économie créative." },
      { q: "Comment fonctionne le système Pro-Draft ?", a: "Le Draft est l'espace communautaire où chacun peut publier. Le statut Pro est réservé aux artistes certifiés qui bénéficient de la monétisation et d'une visibilité accrue." }
    ]
  },
  {
    category: 'Nexus-Coins & Boutique',
    icon: CreditCard,
    questions: [
      { q: "À quoi servent les Nexus-Coins ?", a: "Ils permettent de débloquer les chapitres premium 'Early Access' et de soutenir directement les artistes via des dons." },
      { q: "Comment obtenir des Nexus-Coins ?", a: "Vous pouvez en acheter dans la boutique via divers moyens de paiement locaux et internationaux." }
    ]
  },
  {
    category: 'Créateurs',
    icon: Book,
    questions: [
      { q: "Comment devenir un artiste Pro ?", a: "Vous devez d'abord publier dans le Draft. Une fois une audience établie, vous pouvez demander une certification via votre tableau de bord." },
      { q: "Quelle est la part de revenu des artistes ?", a: "Nexus-Hub reverse jusqu'à 70% des revenus générés par les Nexus-Coins directement aux créateurs." }
    ]
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter">Centre d'<span className="gradient-text">Aide</span></h1>
        <p className="text-gray-400 font-medium text-lg">Tout ce que vous devez savoir pour naviguer dans le Nexus.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { icon: MessageSquare, label: "Forum", desc: "Posez vos questions à la communauté." },
          { icon: Mail, label: "Support", desc: "Contactez notre équipe technique." },
          { icon: ShieldCheck, label: "Sécurité", desc: "Règles de vie et modération." },
        ].map((box, i) => (
          <div key={i} className="glass-card p-6 border border-white/5 text-center space-y-3 hover:border-brand-gold/30 transition-all cursor-pointer group">
             <box.icon className="w-8 h-8 text-brand-gold mx-auto group-hover:scale-110 transition-transform" />
             <h4 className="text-xs font-black uppercase tracking-widest">{box.label}</h4>
             <p className="text-[10px] text-gray-500 font-bold uppercase">{box.desc}</p>
          </div>
        ))}
      </div>

      <div className="space-y-12 pt-8">
        {FAQ_ITEMS.map((section, sIdx) => (
          <div key={section.category} className="space-y-6">
             <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <section.icon className="w-5 h-5 text-brand-gold" />
                <h2 className="text-xl font-display font-black uppercase tracking-tight">{section.category}</h2>
             </div>
             
             <div className="space-y-4">
                {section.questions.map((item, qIdx) => {
                  const id = `${sIdx}-${qIdx}`;
                  const isOpen = openIndex === id;
                  return (
                    <div key={id} className="rounded-2xl border border-white/5 bg-white/2 overflow-hidden">
                       <button 
                         onClick={() => setOpenIndex(isOpen ? null : id)}
                         className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                       >
                          <span className="font-bold text-gray-200">{item.q}</span>
                          {isOpen ? <ChevronUp className="w-5 h-5 text-brand-gold" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                       </button>
                       <AnimatePresence>
                         {isOpen && (
                           <motion.div 
                             initial={{ height: 0, opacity: 0 }}
                             animate={{ height: 'auto', opacity: 1 }}
                             exit={{ height: 0, opacity: 0 }}
                             className="px-6 pb-6"
                           >
                              <p className="text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                                {item.a}
                              </p>
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </div>
                  );
                })}
             </div>
          </div>
        ))}
      </div>

      {/* Still need help? */}
      <section className="bg-brand-brown/20 border border-brand-gold/20 rounded-3xl p-12 text-center space-y-6">
         <h2 className="text-2xl font-display font-black uppercase">Encore des questions ?</h2>
         <p className="text-gray-400 max-w-lg mx-auto font-medium">Notre équipe est là pour vous aider à chaque étape de votre aventure dans le Nexus.</p>
         <button className="px-12 py-4 bg-brand-gold text-brand-black font-black rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">
           NOUS CONTACTER
         </button>
      </section>
    </div>
  );
}
