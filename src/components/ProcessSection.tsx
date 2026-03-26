import { motion } from "framer-motion";
import { Paintbrush, Sparkles, Thermometer, SwatchBook } from "lucide-react";

const steps = [
  {
    icon: <SwatchBook className="w-8 h-8" />,
    title: "Conceito & Esboço",
    description: "Cada obra começa com a compreensão da alma da peça. Desenhamos o fluxo que a pintura seguirá no vidro.",
    delay: 0.1
  },
  {
    icon: <Paintbrush className="w-8 h-8" />,
    title: "Pintura à Mão",
    description: "Utilizamos pigmentos importados e pincéis de cerdas finas para dar vida aos detalhes mais delicados.",
    delay: 0.2
  },
  {
    icon: <Thermometer className="w-8 h-8" />,
    title: "Cura Térmica",
    description: "As peças passam por um processo de queima controlada, garantindo que a arte se funda permanentemente ao cristal.",
    delay: 0.3
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: "Brilho & Alma",
    description: "O estágio final onde cada taça é polida e revisada, pronta para transformar sua mesa em uma galeria.",
    delay: 0.4
  }
];

const ProcessSection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-white">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-forest/10 to-transparent" />
      
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-primary font-bold text-[0.65rem] uppercase tracking-[0.4em] mb-4"
          >
            O Segredo por Trás da Obra
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-display text-4xl md:text-5xl text-primary"
          >
            Nossa <span className="italic gold-accent">Alquimia</span> Artesanal
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: step.delay, duration: 0.6 }}
              className="group"
            >
              <div className="glass-card h-full p-8 bg-secondary/30 border-primary/5 hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-secondary/50 rounded-[2.5rem] flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 mb-6 border border-primary/5">
                  {step.icon}
                </div>
                <h3 className="text-display text-xl mb-4 text-primary">{step.title}</h3>
                <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
                <div className="mt-8 text-[0.6rem] font-bold text-accent tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                  ETAPA 0{index + 1}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Motivational Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="mt-20 p-12 rounded-[3.5rem] bg-[#304930] text-white text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 max-w-2xl mx-auto italic font-display text-2xl md:text-3xl font-light opacity-90 leading-relaxed">
            "Não é apenas tinta no vidro, é a eternização de sentimentos através da arte."
          </div>
          <div className="mt-6 text-[10px] uppercase font-bold tracking-[0.3em] gold-accent">
            Laura Veríssimo
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessSection;
