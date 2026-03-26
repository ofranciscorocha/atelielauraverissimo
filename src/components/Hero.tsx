import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-[70vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Image Banner */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/banner-hero.png" 
          alt="Ateliê Banner" 
          className="w-full h-full object-cover"
        />
        {/* Whitish Overlay - Mais esbranquiçado para destacar o texto */}
        <div className="absolute inset-0 bg-white/55 backdrop-blur-[1.5px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/40 to-background" />
      </div>

      <div className="container mx-auto px-6 text-center relative z-10 text-primary pt-32 md:pt-40">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.8 }}
        >
          <span className="inline-block font-sans text-[0.7rem] md:text-[0.8rem] uppercase tracking-[0.4em] text-gold-gradient font-black mb-4 md:mb-6">
            Arte Pintada à Mão
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl mb-4 md:mb-6 leading-[1.1] px-2"
          style={{ color: '#1a2e1a', textShadow: '0 1px 4px rgba(255,255,255,0.4)' }}
        >
          Em cada peça, <span className="italic text-gold-gradient">uma pintura</span>,
          <br className="hidden sm:block" /> um processo, uma história
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-sans text-base md:text-xl max-w-2xl mx-auto mb-10 md:mb-12 leading-relaxed px-4 font-medium"
          style={{ color: '#304930', opacity: 0.85 }}
        >
          Taças transformadas em obras únicas através da pintura artesanal. Do ateliê para a sua mesa.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="flex flex-col items-center gap-4"
        >
          <a href="#galeria" className="btn-gold px-8 py-3.5 text-[0.65rem] font-black shadow-xl">
            Explorar Coleção
          </a>

          {/* Animated Down Arrow in Gold Gradient */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="cursor-pointer"
            onClick={() => document.getElementById('galeria')?.scrollIntoView({ behavior: 'smooth' })}
          >
             <ChevronDown size={40} strokeWidth={2} stroke="url(#gold-gradient)" />
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
