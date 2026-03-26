import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Sparkles, Paintbrush } from "lucide-react";
import { useLocation } from "react-router-dom";

const WelcomePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Não mostrar no admin ou se já viu nesta visita/dispositivo
    const hasSeen = localStorage.getItem("hasSeenWelcomePopup");
    if (location.pathname.startsWith('/admin') || hasSeen === "true") {
      setIsOpen(false);
      return;
    }
    
    const timer = setTimeout(() => setIsOpen(true), 1500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const closePopup = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenWelcomePopup", "true");
  };

  if (location.pathname.startsWith('/admin')) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-24 md:pt-32">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePopup}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="relative w-full max-w-[calc(100vw-2rem)] sm:max-w-lg glass-card overflow-hidden bg-[#fdfaf6] border-primary/20"
          >
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={closePopup}
                className="p-2 text-primary/40 hover:text-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-10 text-center">
              <motion.div
                initial={{ rotate: -10, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="w-20 h-20 bg-accent/20 rounded-[2.5rem] flex items-center justify-center text-accent mx-auto mb-8"
              >
                <Paintbrush size={32} />
              </motion.div>

              <h2 className="text-display text-3xl text-primary mb-4 leading-tight">
                Seja bem-vindo ao <br /><span className="italic gold-accent">nosso ateliê</span>
              </h2>

              <div className="space-y-4 font-sans text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                <p>
                  Estamos apenas no começo dessa jornada, pincelando cada detalhe com muito amor e dedicação.
                </p>
                <p className="italic font-display text-primary text-base">
                  "O presente é nossa tela, mas o futuro... <br /> ah, o futuro a gente pinta juntos."
                </p>
                <div className="flex justify-center gap-2 pt-2 text-accent">
                   <Sparkles size={16} />
                   <Heart size={16} fill="currentColor" />
                   <Sparkles size={16} />
                </div>
              </div>

              <button
                onClick={closePopup}
                className="mt-10 btn-gold px-12 py-4 w-full text-[10px]"
              >
                COMEÇAR A EXPLORAR
              </button>
            </div>

            {/* Decor */}
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WelcomePopup;
