import React from 'react';
import { Navbar } from '@/components/Navbar';
import { getProductBySlug } from '@/lib/actions';
import { 
  ShoppingBag, 
  Sparkles, 
  ArrowLeft, 
  Check, 
  Star,
  ShieldCheck,
  Truck,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#F8FAF8] pb-20">
      <Navbar />
      
      <section className="pt-32 container mx-auto px-6">
         {/* Breadcrumbs */}
         <div className="flex items-center gap-3 mb-12 text-[#304930]/40">
            <Link href="/" className="text-[10px] font-black uppercase tracking-widest hover:text-[#304930] transition-colors">Início</Link>
            <div className="w-1 h-1 bg-slate-200 rounded-full" />
            <Link href="/produtos" className="text-[10px] font-black uppercase tracking-widest hover:text-[#304930] transition-colors">Catálogo</Link>
            <div className="w-1 h-1 bg-slate-200 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">{product.name}</span>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Gallery Section */}
            <div className="space-y-6">
               <div className="titan-card aspect-square bg-white flex items-center justify-center p-20 overflow-hidden group">
                  <div className="absolute top-8 left-8 z-10 w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center border border-black/5 shadow-xl">
                     <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <ShoppingBag className="w-40 h-40 text-[#304930]/5 group-hover:scale-110 transition-transform duration-700" />
               </div>

               <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-white rounded-3xl border border-black/5 flex items-center justify-center cursor-pointer hover:border-[#304930]/20 transition-all overflow-hidden p-4 group">
                       <ShoppingBag className="w-8 h-8 text-[#304930]/10 group-hover:scale-110 transition-transform" />
                    </div>
                  ))}
               </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col justify-center max-w-xl">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-6 w-fit">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Disponível no Ateliê</span>
               </div>

               <h1 className="text-5xl font-serif text-[#304930] leading-tight mb-4">{product.name}</h1>
               
               <div className="flex items-center gap-6 mb-8">
                  <div className="flex items-center gap-1.5">
                     {[1, 2, 3, 4, 5].map((s) => (
                       <Star key={s} className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                     ))}
                     <span className="text-xs font-bold text-[#304930] ml-2">4.9/5.0</span>
                  </div>
                  <div className="h-4 w-[1px] bg-slate-200" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Arte Original</p>
               </div>

               <p className="text-lg text-[#304930]/60 leading-relaxed mb-10">
                  {product.description}
                  <br /><br />
                  Cada detalhe desta peça foi meticulosamente pensado por Laura Verissimo para transmitir 
                  sofisticação e o brilho característico do cristal pintado à mão.
               </p>

               {/* Configuration Selection */}
               <div className="space-y-8 mb-12">
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Escolha o Modelo</p>
                     <div className="flex flex-wrap gap-3">
                        {product.variants.map((v: any) => (
                          <button 
                            key={v.id} 
                            className="px-6 py-3 rounded-2xl border border-black/10 hover:border-[#304930]/40 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white active:scale-95"
                          >
                            {v.model}
                          </button>
                        ))}
                     </div>
                  </div>

                  <div className="flex items-end gap-4">
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Valor Unitário</p>
                        <p className="text-4xl font-black text-[#304930] tracking-tighter">R$ {product.basePrice.toLocaleString('pt-BR')}</p>
                     </div>
                     <p className="text-xs font-bold text-emerald-600 mb-1">Até 3x sem juros</p>
                  </div>
               </div>

               {/* Action Buttons */}
               <div className="flex items-center gap-4">
                  <button className="flex-1 bg-[#304930] text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-[#3F5F3F] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3">
                     Adicionar ao Carrinho
                     <ShoppingBag className="w-5 h-5" />
                  </button>
                  <button className="w-16 h-16 rounded-[2rem] border border-black/5 flex items-center justify-center hover:bg-white transition-all group">
                     <Heart className="w-6 h-6 text-[#304930]/20 group-hover:text-rose-500 group-hover:fill-rose-500 transition-colors" />
                  </button>
               </div>

               {/* Trust Badges */}
               <div className="grid grid-cols-3 gap-6 mt-16 pt-10 border-t border-black/5">
                  <div className="flex flex-col items-center text-center gap-3">
                     <ShieldCheck className="w-6 h-6 text-[#304930]/30" />
                     <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Pagamento Seguro</p>
                  </div>
                  <div className="flex flex-col items-center text-center gap-3">
                     <Truck className="w-6 h-6 text-[#304930]/30" />
                     <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Entrega Especial</p>
                  </div>
                  <div className="flex flex-col items-center text-center gap-3">
                     <RotateCcw className="w-6 h-6 text-[#304930]/30" />
                     <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Garantia de Arte</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Recommended Section (Contextual) */}
      <section className="py-32 container mx-auto px-6">
         <div className="flex justify-between items-end mb-12">
            <div>
               <h2 className="text-3xl font-serif text-[#304930] mb-2">Completam o brilho.</h2>
               <p className="text-sm text-slate-400 font-medium">Outras peças que você pode amar.</p>
            </div>
            <Link href="/produtos" className="text-[10px] font-black uppercase tracking-widest text-[#304930] border-b-2 border-[#304930] pb-1 hover:text-[#D4AF37] transition-colors">Ver Completo</Link>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Minimal recommendation cards */}
            {[1, 2, 3, 4].map((i) => (
               <div key={i} className="group cursor-pointer">
                  <div className="aspect-square bg-white rounded-3xl border border-black/5 mb-4 group-hover:shadow-lg transition-all" />
                  <p className="text-xs font-bold text-[#304930] uppercase mb-1">Peça Complementar {i}</p>
                  <p className="text-sm font-black text-[#D4AF37]">R$ 189,00</p>
               </div>
            ))}
         </div>
      </section>
    </main>
  );
}
