import { motion } from "framer-motion";
import { initialModels } from "@/data/products";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CategoriesSection = () => {
  const navigate = useNavigate();
  return (
    <section className="bg-white pt-8 pb-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 border-l-4 border-accent pl-6">
          <div className="max-w-xl text-left">
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-primary font-bold text-[0.6rem] uppercase tracking-[0.4em] mb-2"
            >
              Explorar Coleções
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-display text-4xl md:text-5xl text-primary leading-tight"
            >
              Navegue por <span className="italic gold-accent">Categorias</span>
            </motion.h2>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="font-sans text-xs text-muted-foreground md:max-w-[200px] text-left md:text-right italic leading-relaxed"
          >
            Cada peça guarda uma história única contada através de pinceladas exclusivas.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {initialModels.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => navigate(`/?model=${category.id}#galeria`)}
            >
              <div className="relative aspect-[1/1] sm:aspect-[4/5] rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                
                <div className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-end">
                   <h3 className="text-display text-base sm:text-2xl text-white mb-1 sm:mb-2 translate-y-0 sm:translate-y-4 sm:group-hover:translate-y-0 transition-transform duration-500 line-clamp-2">
                      {category.name.replace("Taça de Cristal ", "").replace("Copo de Cristal ", "")}
                   </h3>
                   <p className="text-[8px] sm:text-[10px] text-white/70 font-sans uppercase tracking-widest opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      Ver Obras
                   </p>
                   
                   <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white scale-75 sm:scale-100">
                      <ArrowRight size={14} className="sm:hidden" />
                      <ArrowRight size={18} className="hidden sm:block" />
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
