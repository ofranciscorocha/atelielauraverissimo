import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, Check, ShoppingBag, Heart, Star, ShieldCheck, Plus, Minus,
  Palette, MessageSquare
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const models = [
  { id: "vinho", name: "Taça de Vinho Cristal", desc: "Clássica e elegante para vinhos finos.", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=1000&fit=crop" },
  { id: "champagne", name: "Taça Champagne Cristal", desc: "Fina e delicada para momentos de celebração.", image: "https://images.unsplash.com/photo-1590001150536-1e0e850b5514?w=800&h=1000&fit=crop" },
  { id: "gin", name: "Taça de Gin Cristal", desc: "Robusta e moderna com bojo largo.", image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&h=1000&fit=crop" },
  { id: "copo", name: "Copo Long Drink Cristal", desc: "Versatilidade e sofisticação para drinks.", image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=1000&fit=crop" },
];

// Cores pré-definidas — serão carregadas do admin no futuro via Supabase
const colors = [
  { id: "gold", name: "Ouro 24k", hex: "#C9A84C" },
  { id: "rosegold", name: "Rosé Gold", hex: "#C8957A" },
  { id: "silver", name: "Prata Luna", hex: "#C0C6CC" },
  { id: "white", name: "Branco Pérola", hex: "#F5F0E8" },
  { id: "blue", name: "Azul Cobalto", hex: "#1E3A8A" },
  { id: "green", name: "Verde Esmeralda", hex: "#2D6A4F" },
  { id: "pink", name: "Rosa Quartzo", hex: "#D4A0A0" },
  { id: "black", name: "Preto Elegance", hex: "#1C1C1E" },
];

const sizes = [
  { id: "m", name: "Média (350ml)", price: 0 },
  { id: "g", name: "Grande (500ml)", price: 20 },
  { id: "xl", name: "Extra (650ml)", price: 45 },
];

const CustomizerPage = () => {
  const [selections, setSelections] = useState({
    model: models[0],
    color: colors[0],
    size: sizes[0],
    quantity: 1,
    paintingDescription: ""
  });

  const { addItem, openCart } = useCart();

  const handleFinish = () => {
    const customProduct = {
      id: `custom-${Date.now()}`,
      name: `Taça Personalizada — ${selections.model.name}`,
      price: 180 + selections.size.price,
      image: selections.model.image,
      category: "Crie sua Taça",
      description: `Modelo: ${selections.model.name} | Cor: ${selections.color.name} | Tamanho: ${selections.size.name}`,
      technique: "Pintura Personalizada",
      inStock: true,
      stock: 999
    } as any;

    addItem(customProduct, selections.quantity, {
      model: selections.model.name,
      color: selections.color.name,
      size: selections.size.name,
      extras: selections.paintingDescription ? [selections.paintingDescription] : []
    });

    toast.success("Adicionado ao carrinho!", {
      description: `${selections.model.name} — ${selections.color.name}`,
    });

    openCart();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container mx-auto px-6 pt-32 lg:pt-40">
        <nav className="flex items-center gap-2 text-[0.6rem] uppercase tracking-widest text-muted-foreground mb-8">
           <Link to="/" className="hover:text-primary transition-colors">Início</Link>
           <ChevronRight size={10} />
           <span className="text-foreground font-bold">Crie sua Taça</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div className="space-y-6 lg:sticky lg:top-32 h-fit">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="aspect-[4/5] rounded-[3rem] overflow-hidden bg-secondary/30 relative glass-card p-4"
            >
               <AnimatePresence mode="wait">
                  <motion.img 
                    key={selections.model.id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    src={selections.model.image} 
                    alt={selections.model.name} 
                    className="w-full h-full object-cover rounded-[2.5rem]"
                  />
               </AnimatePresence>
               
               <div className="absolute top-10 right-10 flex flex-col items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-full border-4 border-white shadow-2xl"
                    style={{ backgroundColor: selections.color.hex }}
                  />
                  <div className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg">
                    {selections.color.name}
                  </div>
               </div>

               <button className="absolute bottom-8 right-8 p-4 bg-white/80 backdrop-blur-md rounded-full text-foreground hover:text-primary transition-all shadow-lg">
                  <Heart size={20} />
               </button>

               <div className="absolute bottom-10 left-10 text-white drop-shadow-lg">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-80">Sua Obra de Arte</span>
                  <h2 className="text-display text-3xl">{selections.model.name}</h2>
               </div>
            </motion.div>
          </div>

          <div className="flex flex-col">
             <div className="mb-8">
                <span className="font-sans text-[0.65rem] uppercase tracking-[0.4em] text-accent border-l-2 border-accent pl-3 font-black">
                   Personalização Exclusiva
                </span>
                <h1 className="text-display text-4xl md:text-5xl lg:text-6xl text-foreground mt-4 leading-tight">
                   Crie sua Própria <span className="italic gold-accent">Taça</span>
                </h1>
                <div className="flex items-center gap-4 mt-6">
                   <div className="flex text-accent">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                   </div>
                   <span className="font-sans text-xs text-muted-foreground uppercase tracking-widest">+500 Clientes Felizes</span>
                </div>
                <p className="text-3xl font-display mt-8 text-primary">R$ {(180 + selections.size.price).toFixed(2).replace(".", ",")}</p>
             </div>

             <div className="space-y-10">
                <div>
                   <p className="font-sans text-[0.65rem] uppercase font-black tracking-widest text-muted-foreground mb-4">1. Escolha o Modelo</p>
                   <div className="grid grid-cols-2 gap-3">
                      {models.map(m => (
                        <button 
                          key={m.id}
                          onClick={() => setSelections({ ...selections, model: m })}
                          className={`px-4 py-8 rounded-2xl transition-all border text-center flex flex-col items-center gap-2 ${selections.model.id === m.id ? "bg-primary text-white border-primary shadow-lg" : "bg-white border-primary/5 text-muted-foreground hover:border-primary/20"}`}
                        >
                          <span className="font-display text-sm leading-tight">{m.name}</span>
                        </button>
                      ))}
                   </div>
                </div>

                <div className="p-6 rounded-3xl bg-secondary/20 border border-primary/5">
                   <div className="flex items-center gap-2 mb-4">
                      <Palette size={16} className="text-accent" />
                      <p className="font-sans text-[0.65rem] uppercase font-black tracking-widest text-muted-foreground">2. Cor da Pintura</p>
                   </div>
                   
                   <div className="grid grid-cols-4 gap-3">
                      {colors.map(c => (
                        <button
                          key={c.id}
                          onClick={() => setSelections(s => ({ ...s, color: c }))}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 transition-all ${
                            selections.color.id === c.id
                              ? "border-primary bg-primary/5 scale-105 shadow-md"
                              : "border-transparent hover:border-primary/20"
                          }`}
                        >
                          <div
                            className="w-8 h-8 rounded-full shadow-inner border border-white/50"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="text-[9px] font-black text-center uppercase tracking-tight text-primary/60 leading-tight">
                            {c.name}
                          </span>
                        </button>
                      ))}
                   </div>
                </div>

                <div className="p-6 rounded-3xl bg-secondary/20 border border-primary/5">
                   <div className="flex items-center gap-2 mb-4">
                      <MessageSquare size={16} className="text-accent" />
                      <p className="font-sans text-[0.65rem] uppercase font-black tracking-widest text-muted-foreground">3. Detalhes da Obra</p>
                   </div>
                   <textarea 
                      value={selections.paintingDescription}
                      onChange={(e) => setSelections(s => ({ ...s, paintingDescription: e.target.value }))}
                      placeholder="Descreva aqui o que você imagina: iniciais, flores específicas, um nome ou um estilo de traço..."
                      className="w-full min-h-[120px] bg-white border border-primary/10 rounded-2xl p-4 font-sans text-sm focus:ring-2 focus:ring-accent outline-none resize-none placeholder:text-muted-foreground/50 transition-all"
                   />
                   <p className="text-[9px] text-muted-foreground mt-2 italic">* Nossa equipe entrará em contato para alinhar cada detalhe da sua arte.</p>
                </div>

                <div>
                   <p className="font-sans text-[0.65rem] uppercase font-black tracking-widest text-muted-foreground mb-4">4. Capacidade</p>
                   <div className="flex gap-3">
                      {sizes.map(s => (
                        <button 
                          key={s.id}
                          onClick={() => setSelections({ ...selections, size: s })}
                          className={`flex-1 px-4 py-4 rounded-2xl transition-all border text-center ${selections.size.id === s.id ? "bg-primary text-white border-primary shadow-lg" : "bg-white border-primary/5 text-muted-foreground hover:border-primary/20"}`}
                        >
                          <span className="block font-sans text-[10px] uppercase font-bold tracking-widest">{s.name}</span>
                          {s.price > 0 && <span className="block text-[8px] opacity-70 mt-1">+ R$ {s.price}</span>}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                   <div className="flex items-center justify-between bg-secondary/50 p-2 rounded-full border border-primary/5 min-w-[140px]">
                      <button 
                        onClick={() => setSelections(s => ({ ...s, quantity: Math.max(1, s.quantity - 1) }))}
                        className="p-3 hover:bg-white rounded-full transition-all text-primary"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="font-display text-xl w-10 text-center">{selections.quantity}</span>
                      <button 
                        onClick={() => setSelections(s => ({ ...s, quantity: s.quantity + 1 }))}
                        className="p-3 hover:bg-white rounded-full transition-all text-primary"
                      >
                        <Plus size={18} />
                      </button>
                   </div>
                   <button 
                     onClick={handleFinish}
                     className="btn-gold flex-1 flex items-center justify-center gap-3 py-6 text-[0.7rem] tracking-[0.2em] font-black"
                   >
                      <ShoppingBag size={20} /> ADICIONAR AO CARRINHO
                   </button>
                </div>

                 <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-primary/5">
                    <div className="flex items-center gap-3 text-muted-foreground">
                       <ShieldCheck size={18} className="text-primary" />
                       <span className="text-[10px] uppercase font-black tracking-widest text-primary">Pintura Sob Encomenda</span>
                    </div>
                 </div>
             </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomizerPage;
