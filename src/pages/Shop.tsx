import React from 'react';
import { ShoppingBag, Box, Truck, Star, Filter, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const Shop = () => {
  const products = [
    { id: 1, name: "T-Shirt 'Légendes d'Oyo'", price: "12,000 FCFA", category: "Vêtements", tag: "Best-seller" },
    { id: 2, name: "Art Book Vol. 1 - Edition Limitée", price: "25,000 FCFA", category: "Livres", tag: "Nouveauté" },
    { id: 3, name: "Stickers Pack 'Cyber-Dakar'", price: "3,500 FCFA", category: "Goodies", tag: "" },
    { id: 4, name: "Affiche 'Justice de Fer' (A2)", price: "8,000 FCFA", category: "Décoration", tag: "" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      {/* Hero */}
      <section className="relative h-[40vh] rounded-3xl overflow-hidden glass-card flex items-center px-12 mb-16">
         <div className="absolute inset-0 bg-brand-gold/10 -z-10" />
         <div className="max-w-xl space-y-6">
            <h1 className="text-5xl font-display font-black uppercase tracking-tighter">Boutique <span className="text-brand-gold underline decoration-brand-gold/30 underline-offset-8">Officielle</span></h1>
            <p className="text-gray-400 font-medium">Soutenez vos artistes préférés en achetant des produits dérivés exclusifs de haute qualité.</p>
            <div className="flex gap-4">
               <button className="px-6 py-3 bg-brand-gold text-brand-black rounded-xl font-black text-sm">NOUVELLES ARRIVÉES</button>
               <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-black text-sm">PROMOTIONS</button>
            </div>
         </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
         {/* Filters */}
         <aside className="space-y-8">
            <div className="space-y-4">
               <h3 className="font-display font-bold text-sm uppercase tracking-widest text-gray-500 flex items-center gap-2">
                 <Filter className="w-4 h-4" />
                 Filtrer
               </h3>
               <div className="space-y-2">
                  {['Tous', 'Vêtements', 'Livres', 'Goodies', 'Décoration', 'Figurines'].map(cat => (
                    <button key={cat} className="block w-full text-left py-2 text-sm font-bold text-gray-400 hover:text-brand-gold transition-colors">{cat}</button>
                  ))}
               </div>
            </div>

            <div className="p-6 rounded-2xl bg-brand-brown/10 border border-brand-brown/20 space-y-4">
               <div className="flex items-center gap-3 text-brand-gold">
                  <Truck className="w-5 h-5" />
                  <h4 className="font-bold text-sm uppercase tracking-widest">Livraison</h4>
               </div>
               <p className="text-xs text-brand-brown-lighter font-medium">Nous livrons dans toute l'Afrique de l'Ouest et à l'international.</p>
            </div>
         </aside>

         {/* Product Grid */}
         <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
               {products.map(product => (
                 <motion.div 
                   key={product.id}
                   whileHover={{ y: -10 }}
                   className="group p-4 glass-card space-y-4 cursor-pointer"
                 >
                    <div className="aspect-square bg-brand-brown rounded-xl relative overflow-hidden">
                       {product.tag && (
                         <div className="absolute top-2 left-2 px-2 py-1 bg-brand-gold text-brand-black text-[8px] font-black uppercase tracking-widest rounded">
                            {product.tag}
                         </div>
                       )}
                       <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                          <button className="w-full py-3 bg-white text-black font-black text-xs rounded-lg flex items-center justify-center gap-2">
                             AJOUTER AU PANIER
                             <ShoppingBag className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                    <div className="space-y-1">
                       <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{product.category}</div>
                       <h4 className="font-bold group-hover:text-brand-gold transition-colors">{product.name}</h4>
                       <div className="text-brand-gold font-display font-black text-lg">{product.price}</div>
                    </div>
                 </motion.div>
               ))}
            </div>

            {/* Featured Artist Merch */}
            <section className="mt-24 p-12 rounded-3xl bg-linear-to-br from-brand-black to-brand-brown border border-white/10 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
               <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 blur-3xl -z-10" />
               <div className="w-48 h-48 bg-brand-brown rounded-2xl flex-shrink-0 rotate-12 shadow-2xl" />
               <div className="space-y-6">
                  <div className="flex items-center gap-2 text-brand-gold text-[10px] font-black uppercase tracking-widest">
                     <Star className="w-4 h-4 fill-current" />
                     Collection d'Artiste
                  </div>
                  <h2 className="text-4xl font-display font-black leading-tight">La Collection <br /> 'Cyber-Dakar' de Mariama</h2>
                  <p className="text-gray-400 max-w-md">Une ligne exclusive de vêtements et accessoires inspirée de l'univers Afropunk de Cyber-Dakar.</p>
                  <button className="inline-flex items-center gap-2 font-display font-black text-brand-gold hover:gap-4 transition-all uppercase tracking-widest">
                     DÉCOUVRIR LA SÉRIE
                     <ArrowRight className="w-5 h-5" />
                  </button>
               </div>
            </section>
         </div>
      </div>
    </div>
  );
};
