import React from 'react';
import { MessageSquare, Users, ShieldAlert, Sparkles, MessageCircle } from 'lucide-react';

export const Forum = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/20 px-3 py-1 rounded-full text-brand-gold text-[10px] font-black uppercase tracking-widest">
             Communauté
          </div>
          <h1 className="text-5xl font-display font-black leading-none">Forums <br /><span className="gradient-text">AfriStory</span></h1>
          <p className="text-gray-400 max-w-xl">L'espace d'échange pour tous les passionnés de narration graphique africaine.</p>
        </div>

        <div className="flex gap-4">
           <div className="text-right">
              <div className="text-2xl font-display font-black">12.5K</div>
              <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none">Membres Actifs</div>
           </div>
           <div className="h-10 w-[1px] bg-white/10" />
           <div className="text-right">
              <div className="text-2xl font-display font-black">842</div>
              <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none">Discussions</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Forum List */}
        <div className="lg:col-span-2 space-y-8">
           <ForumSection 
             title="Discussions Générales" 
             icon={<MessageSquare className="w-5 h-5" />}
             topics={[
               { title: "Bienvenue sur AfriStory ! Présentez-vous ici", replies: 450, views: '12K', last: 'Il y a 2m' },
               { title: "Actualités de la plateforme & Mises à jour", replies: 89, views: '5K', last: 'Hier' },
               { title: "Vos Webtoons préférés du mois", replies: 234, views: '8K', last: 'Il y a 1h' },
             ]}
           />

           <ForumSection 
             title="Espace Créateurs" 
             icon={<Sparkles className="w-5 h-5 text-brand-gold" />}
             topics={[
               { title: "Conseils techniques : Dessiner les paysages de savane", replies: 56, views: '1.2K', last: 'Il y a 3h' },
               { title: "Recherche de scénariste pour un projet Cyberpunk", replies: 12, views: '400', last: 'Hier' },
               { title: "Comment passer d'artiste Draft à Pro ?", replies: 156, views: '3K', last: 'Il y a 12h' },
             ]}
           />
           
           <div className="p-12 glass-card border-brand-red/20 flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 bg-brand-red/10 rounded-full flex items-center justify-center text-brand-red">
                 <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-display font-bold inline-flex items-center gap-3">
                Espace Premium <span className="text-[10px] bg-brand-red text-white px-2 py-0.5 rounded">PRIVÉ</span>
              </h3>
              <p className="text-gray-400 max-w-sm">Rejoignez le club Premium pour accéder aux spoilers, aux coulisses et discuter directement avec vos artistes favoris.</p>
              <button className="px-8 py-4 bg-brand-red text-white font-black rounded-xl hover:scale-105 transition-transform">DEVENIR PREMIUM</button>
           </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
           <div className="glass-card p-8 space-y-6">
              <h3 className="font-display font-bold flex items-center gap-3">
                 <MessageCircle className="w-5 h-5 text-brand-gold" />
                 Dernières Réponses
              </h3>
              <div className="space-y-4">
                 {[1, 2, 3, 4].map(i => (
                   <div key={i} className="flex gap-4 group cursor-pointer">
                      <div className="w-10 h-10 bg-brand-brown rounded-full flex-shrink-0" />
                      <div className="space-y-1">
                         <p className="text-xs font-bold line-clamp-1 group-hover:text-brand-gold transition-colors">"Je pense que le chapitre 24 était..."</p>
                         <p className="text-[10px] text-gray-500">Par Malik • Dans Théories & Spoilers</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="glass-card p-8 space-y-6 bg-linear-to-br from-brand-gold/5 to-transparent border-brand-gold/20">
              <h3 className="font-display font-bold flex items-center gap-3">
                 <Users className="w-5 h-5 text-brand-gold" />
                 Membres en ligne
              </h3>
              <div className="flex flex-wrap gap-2">
                 {Array.from({ length: 12 }).map((_, i) => (
                   <div key={i} className="w-8 h-8 rounded-full bg-brand-brown border border-white/10" />
                 ))}
                 <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-bold">+124</div>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
};

const ForumSection = ({ title, icon, topics }: { title: string, icon: any, topics: any[] }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 px-2">
       {icon}
       <h2 className="text-xl font-display font-bold">{title}</h2>
    </div>
    <div className="glass-card divide-y divide-white/5 overflow-hidden">
       {topics.map((topic, i) => (
         <div key={i} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="space-y-1">
               <h4 className="font-bold group-hover:text-brand-gold transition-colors">{topic.title}</h4>
               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{topic.last}</p>
            </div>
            <div className="flex gap-8 text-right">
               <div className="hidden sm:block">
                  <div className="text-sm font-bold">{topic.replies}</div>
                  <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Rép.</div>
               </div>
               <div className="hidden sm:block">
                  <div className="text-sm font-bold">{topic.views}</div>
                  <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Vues</div>
               </div>
            </div>
         </div>
       ))}
    </div>
  </div>
);
