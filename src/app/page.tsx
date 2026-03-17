import { Navbar } from '@/components/Navbar';
import { brandingConfig } from '@/lib/config';
import { Sparkles, ArrowRight, Heart, GlassWater, Palette, Star } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const banner = brandingConfig.banners[0];

  return (
    <main className="min-h-screen bg-[#F8FAF8] selection:bg-[#304930] selection:text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src={banner.url} 
            alt="Atelier Background" 
            className="w-full h-full object-cover transform scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAF8] via-[#F8FAF8]/40 to-transparent"></div>
          <div className="absolute inset-0 bg-[#304930]/20 pointer-events-none"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full frosted-glass border-white/40 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4 text-[#D6B799]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#304930]">Arte que brilha, Alma que encanta</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-serif text-[#304930] leading-tight animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            A leveza do cristal, <br />
            <span className="italic">a alma da cor.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-[#304930]/80 font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            Peças exclusivas em vidro e cristal, pintadas à mão no coração do ateliê. 
            Transforme seus momentos com sofisticação e afeto.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-700">
            <button className="bg-[#304930] text-white px-10 py-5 rounded-full font-bold text-sm uppercase tracking-widest shadow-2xl hover:bg-[#3F5F3F] transition-all hover:scale-105 flex items-center gap-3 group">
              Explorar Coleções
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </button>
            <button className="frosted-glass text-[#304930] px-10 py-5 rounded-full font-bold text-sm uppercase tracking-widest border-[#304930]/10 hover:bg-white/80 transition-all flex items-center gap-3 group">
              Peças sob Medida
              <Heart className="w-4 h-4 text-[#304930]" />
            </button>
          </div>
        </div>

        {/* Floating Details */}
        <div className="absolute bottom-12 left-12 hidden lg:flex items-center gap-4 px-6 py-4 frosted-glass rounded-3xl border-white/40">
           <div className="w-12 h-12 bg-[#304930] rounded-2xl flex items-center justify-center">
             <GlassWater className="w-6 h-6 text-white" />
           </div>
           <div>
             <p className="text-[10px] font-black text-[#304930] uppercase tracking-widest">Qualidade Premium</p>
             <p className="text-xs text-[#304930]/60">Cristal Genuíno</p>
           </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <FeatureCard 
            icon={Palette} 
            title="Pintura Manual" 
            desc="Cada pincelada é única, fruto de horas de dedicação e técnica artística exclusiva."
          />
          <FeatureCard 
            icon={Star} 
            title="Design Exclusivo" 
            desc="Modelos desenvolvidos para serem o centro das atenções em sua mesa ou decoração."
          />
          <FeatureCard 
            icon={Heart} 
            title="Feito com Afeto" 
            desc="Embalagens especiais e a possibilidade de incluir recadinhos personalizados."
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="titan-card p-10 hover:shadow-2xl hover:-translate-y-2 transition-all group">
      <div className="w-16 h-16 rounded-[2rem] bg-[#304930]/5 flex items-center justify-center mb-8 group-hover:bg-[#304930] transition-colors">
        <Icon className="w-8 h-8 text-[#304930] group-hover:text-white transition-colors" />
      </div>
      <h3 className="text-xl font-serif text-[#304930] mb-4">{title}</h3>
      <p className="text-sm text-[#304930]/60 leading-relaxed font-medium">
        {desc}
      </p>
    </div>
  );
}
