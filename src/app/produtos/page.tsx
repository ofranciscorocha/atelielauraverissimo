import React from 'react';
import { Navbar } from '@/components/Navbar';
import { getActiveProducts } from '@/lib/actions';
import { 
  Filter, 
  Search, 
  ShoppingBag, 
  Sparkles, 
  Star,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default async function CatalogoPage() {
  const products = await getActiveProducts();

  return (
    <main className="min-h-screen bg-[#F8FAF8] pb-20">
      <Navbar />
      
      {/* Header Section */}
      <section className="pt-40 pb-20 bg-white border-b border-[#304930]/5">
        <div className="container mx-auto px-6">
           <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 mb-6 text-[#304930]/40">
                 <Link href="/" className="text-[10px] font-black uppercase tracking-widest hover:text-[#304930] transition-colors">Início</Link>
                 <ArrowRight className="w-3 h-3" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-[#D6B799]">Catálogo</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif text-[#304930] mb-8">
                 Peças que contam <br />
                 <span className="italic">histórias.</span>
              </h1>
              <p className="text-lg text-[#304930]/60 max-w-2xl leading-relaxed">
                 Cada peça em nosso catálogo é fruto de um processo artesanal meticuloso. 
                 Do cristal cru à pintura manual finalizada no ateliê.
              </p>
           </div>
        </div>
      </section>

      {/* Catalog Control Bar */}
      <section className="sticky top-[80px] z-30 bg-white/80 backdrop-blur-md border-b border-[#304930]/5 py-6">
         <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-8 overflow-x-auto w-full md:w-auto no-scrollbar scroll-smooth">
               {['Todas', 'Taças', 'Copos', 'Decoração', 'Coleções'].map((cat) => (
                 <button 
                   key={cat} 
                   className={cn(
                     "text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all pb-1 border-b-2",
                     cat === 'Todas' ? "border-[#304930] text-[#304930]" : "border-transparent text-slate-400 hover:text-[#304930]"
                   )}
                 >
                   {cat}
                 </button>
               ))}
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
               <div className="relative flex-1 md:w-64">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    type="text" 
                    placeholder="O que você busca?" 
                    className="w-full bg-[#F8FAF8] border border-black/5 rounded-full px-6 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#304930]/20 transition-all"
                  />
               </div>
               <button className="flex items-center gap-2 px-6 py-3 bg-[#304930] text-white rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-[#3F5F3F] transition-all">
                  Ordenar <ChevronDown className="w-3 h-3" />
               </button>
            </div>
         </div>
      </section>

      {/* Products Grid */}
      <section className="py-20 container mx-auto px-6">
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
            {products.map((product) => (
               <Link 
                 href={`/produtos/${product.slug}`} 
                 key={product.id}
                 className="group"
               >
                  <div className="relative overflow-hidden rounded-[2.5rem] bg-white aspect-[4/5] shadow-sm border border-black/5 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 mb-6">
                     {/* Discount/Badge Icon */}
                     <div className="absolute top-6 left-6 z-10 w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center border border-whiteShadow animate-pulse">
                        <Sparkles className="w-4 h-4 text-[#D6B799]" />
                     </div>

                     {/* Product Image Placeholder (Using generate_image would be better for a real demo) */}
                     <div className="w-full h-full bg-[#304930]/5 flex items-center justify-center p-12 transition-transform duration-700 group-hover:scale-110">
                        {/* If no imageUrl, icon */}
                        <ShoppingBag className="w-20 h-20 text-[#304930]/10" />
                     </div>

                     {/* Hover Action Overlay */}
                     <div className="absolute inset-x-0 bottom-0 p-8 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex justify-center">
                        <div className="px-8 py-4 bg-[#304930] text-white rounded-full shadow-2xl flex items-center gap-3">
                           <span className="text-[10px] font-black uppercase tracking-widest">Ver Detalhes</span>
                           <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                              <ArrowRight className="w-3 h-3" />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-2 px-2">
                     <div className="flex justify-between items-start">
                        <h3 className="text-xl font-serif text-[#304930] group-hover:text-amber-700 transition-colors uppercase tracking-tight">{product.name}</h3>
                        <div className="flex items-center gap-1 text-[#D6B799]">
                           <Star className="w-3 h-3 fill-current" />
                           <span className="text-[10px] font-black tracking-widest">NEW</span>
                        </div>
                     </div>
                     <p className="text-xs text-[#304930]/40 font-medium line-clamp-1">{product.category}</p>
                     <div className="flex items-center gap-3 pt-2">
                        <span className="text-lg font-black text-[#304930] tracking-tighter">R$ {product.basePrice.toLocaleString('pt-BR')}</span>
                        <div className="h-4 w-[1px] bg-[#304930]/10" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#D6B799]">Em até 3x</p>
                     </div>
                  </div>
               </Link>
            ))}

            {products.length === 0 && (
               <div className="col-span-full py-40 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-700">
                  <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center border border-black/5">
                     <ShoppingBag className="w-10 h-10 text-[#304930]/20" />
                  </div>
                  <div className="text-center">
                     <h3 className="text-2xl font-serif text-[#304930] mb-2">Novas peças em breve.</h3>
                     <p className="text-sm text-slate-400 font-medium">Laura está finalizando novas artes em seu ateliê hoje.</p>
                  </div>
               </div>
            )}
         </div>
      </section>

      {/* Artisan Invite */}
      <section className="mt-20 container mx-auto px-6">
         <div className="titan-card p-12 bg-[#304930] text-white flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative">
            <div className="relative z-10 max-w-xl">
               <h3 className="text-4xl font-serif mb-6 leading-tight">Deseja uma personalização exclusiva?</h3>
               <p className="text-emerald-100/60 text-lg mb-8 leading-relaxed">
                  Podemos desenvolver artes exclusivas para seu evento, presente corporativo ou decoração pessoal.
               </p>
               <button className="bg-white text-[#304930] px-10 py-5 rounded-full font-bold text-sm uppercase tracking-widest shadow-2xl hover:bg-emerald-50 transition-all hover:scale-105">
                 Solicitar Orçamento
               </button>
            </div>
            
            <Sparkles className="absolute -top-10 -right-10 w-64 h-64 text-white/5 rotate-12" />
         </div>
      </section>
    </main>
  );
}
