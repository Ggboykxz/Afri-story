import React, { useState } from 'react';
import { ShoppingBag, Box, Truck, Star, Filter, ArrowRight, Loader2, Coins, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { workService } from '../lib/workService';

export const Shop = () => {
  const { user, profile } = useAuth();
  const [buyingCoins, setBuyingCoins] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const handleBuyCoins = async (amount: number) => {
    if (!user) return alert("Veuillez vous connecter pour acheter des Nexus-Coins");
    setBuyingCoins(true);
    try {
      // Simulate real transaction delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      await workService.purchaseCoins(user.uid, amount);
      alert(`Succès ! ${amount} Nexus-Coins ajoutés à votre compte.`);
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'achat.");
    } finally {
      setBuyingCoins(false);
    }
  };

  const handleBuyMerch = () => {
    setPurchaseSuccess(true);
    setTimeout(() => setPurchaseSuccess(false), 3000);
  };

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // Simulate fetching products added by artists
    // In a real app, this would be a Firestore query on 'shop_items'
    setLoading(false);
  }, []);

  const transactions: any[] = [];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-24">
      {/* Purchase Notification */}
      <AnimatePresence>
        {purchaseSuccess && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-12 right-12 z-50 glass-card p-6 border-brand-green/30 flex items-center gap-4 shadow-2xl"
          >
             <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center text-brand-black">
                <Check className="w-6 h-6" />
             </div>
             <div>
                <h4 className="font-bold">Commande reçue !</h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Consultez vos messages pour le suivi.</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            {/* Nexus-Coins Section */}
            <section className="mb-12 glass-card p-8 border-brand-gold/30 bg-linear-to-r from-brand-gold/5 via-transparent to-transparent">
               <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-brand-gold/20 rounded-2xl flex items-center justify-center text-brand-gold">
                        <Coins className="w-10 h-10" />
                     </div>
                     <div>
                        <h2 className="text-2xl font-display font-black uppercase tracking-tighter">Votre solde : <span className="text-brand-gold">{profile?.nexusCoins || 0} Nexus-Coins</span></h2>
                        <p className="text-sm text-gray-500">Utilisez vos crédits pour débloquer des chapitres premium.</p>
                     </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                     {[500, 1000, 2500].map(amount => (
                       <button 
                         key={amount}
                         onClick={() => handleBuyCoins(amount)}
                         disabled={buyingCoins}
                         className="px-6 py-2 bg-white/5 border border-brand-gold/30 rounded-xl text-xs font-black hover:bg-brand-gold hover:text-brand-black transition-all flex items-center gap-2 disabled:opacity-50"
                       >
                         {buyingCoins ? <Loader2 className="w-3 h-3 animate-spin" /> : `+${amount}`} 
                         <span className="opacity-50 text-[8px]">({amount === 500 ? '599 FCFA' : amount === 1000 ? '1199 FCFA' : '2499 FCFA'})</span>
                       </button>
                     ))}
                  </div>
               </div>
            </section>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="glass-card p-4 space-y-4">
                    <Skeleton className="aspect-square rounded-xl" />
                    <div className="space-y-2">
                       <Skeleton variant="text" className="w-1/2 h-3" />
                       <Skeleton variant="text" className="w-3/4 h-5" />
                       <Skeleton variant="text" className="w-1/3 h-6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
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
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               handleBuyMerch();
                             }}
                             className="w-full py-3 bg-white text-black font-black text-xs rounded-lg flex items-center justify-center gap-2"
                           >
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
            ) : (
              <div className="py-24 text-center glass-card border-dashed border-white/10 opacity-50 space-y-4">
                 <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto" />
                 <h3 className="text-xl font-display font-bold uppercase tracking-tighter text-gray-400">Aucun produit disponible</h3>
                 <p className="text-sm font-bold uppercase tracking-widest text-gray-600">Revenez bientôt pour découvrir les articles de nos artistes.</p>
              </div>
            )}

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

      {/* Transaction History - Section 4.5 */}
      <section className="glass-card overflow-hidden">
         <div className="p-8 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-xl font-display font-black uppercase tracking-tighter">Historique des Transactions</h3>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">30 derniers jours</div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-white/5">
                  <tr>
                     <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Date</th>
                     <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Type</th>
                     <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Détails</th>
                     <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Montant</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                       <td className="px-8 py-4 text-xs font-bold text-gray-400">{tx.date}</td>
                       <td className="px-8 py-4">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                            tx.type === 'Achat' ? 'bg-blue-500/10 text-blue-400' :
                            tx.type === 'Shop' ? 'bg-brand-gold/10 text-brand-gold' :
                            'bg-brand-green/10 text-brand-green'
                          }`}>
                            {tx.type}
                          </span>
                       </td>
                       <td className="px-8 py-4 text-xs font-bold text-white">{tx.item}</td>
                       <td className={`px-8 py-4 text-xs font-black text-right ${tx.amount.startsWith('+') ? 'text-brand-green' : 'text-red-400'}`}>
                          {tx.amount}
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </section>
    </div>
  );
};
