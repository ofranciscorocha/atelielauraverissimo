import React from 'react';
import { Navbar } from '@/components/Navbar';
import { getActiveProducts } from '@/lib/actions';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ProductCatalog } from '@/components/ProductCatalog';

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

      <ProductCatalog products={products} />
    </main>
  );
}
