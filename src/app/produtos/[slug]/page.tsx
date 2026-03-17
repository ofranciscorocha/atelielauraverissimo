import React from 'react';
import { Navbar } from '@/components/Navbar';
import { getProductBySlug } from '@/lib/actions';
import { ProductCustomizer } from '@/components/ProductCustomizer';
import {
  Sparkles,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw
} from 'lucide-react';
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
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D6B799]">{product.name}</span>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Gallery Section */}
            <div className="space-y-6">
               <div className="relative aspect-square bg-white rounded-3xl flex items-center justify-center p-20 overflow-hidden group border border-black/5">
                  <div className="absolute top-8 left-8 z-10 w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center border border-black/5 shadow-xl">
                     <Sparkles className="w-5 h-5 text-[#D6B799]" />
                  </div>
                  <div className="w-40 h-40 bg-gradient-to-br from-[#304930]/10 to-[#D6B799]/10 rounded-full group-hover:scale-110 transition-transform duration-700" />
               </div>

               <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-white rounded-3xl border border-black/5 flex items-center justify-center cursor-pointer hover:border-[#304930]/20 transition-all overflow-hidden p-4 group">
                       <div className="w-full h-full bg-gradient-to-br from-[#304930]/5 to-[#D6B799]/5 rounded-lg group-hover:scale-110 transition-transform" />
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
                       <Star key={s} className="w-3.5 h-3.5 fill-[#D6B799] text-[#D6B799]" />
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

               {/* PRODUCT CUSTOMIZER - Com seleção de Modelo, Tamanho e Cor */}
               <ProductCustomizer product={product} />

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
            <Link href="/produtos" className="text-[10px] font-black uppercase tracking-widest text-[#304930] border-b-2 border-[#304930] pb-1 hover:text-[#D6B799] hover:border-[#D6B799] transition-colors">Ver Completo</Link>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Minimal recommendation cards */}
            {[1, 2, 3, 4].map((i) => (
               <div key={i} className="group cursor-pointer">
                  <div className="aspect-square bg-white rounded-3xl border border-black/5 mb-4 group-hover:shadow-lg transition-all flex items-center justify-center overflow-hidden">
                     <div className="w-24 h-24 bg-gradient-to-br from-[#304930]/10 to-[#D6B799]/10 rounded-full group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-xs font-bold text-[#304930] uppercase mb-1">Peça Complementar {i}</p>
                  <p className="text-sm font-black text-[#D6B799]">R$ 189,00</p>
               </div>
            ))}
         </div>
      </section>
    </main>
  );
}
