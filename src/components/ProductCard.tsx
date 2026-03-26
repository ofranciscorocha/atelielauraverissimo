import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import type { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { Plus, Clock, Search } from "lucide-react";

interface ProductCardProps {
  product: Product;
  index: number;
}

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      if (difference <= 0) return null;

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/10 backdrop-blur-[2px]">
      <div className="glass-card bg-foreground/80 border-primary/20 p-4 text-center max-w-[200px] shadow-2xl">
        <div className="flex items-center justify-center gap-1.5 text-white mb-2">
          <Clock size={14} className="animate-pulse" />
          <span className="text-[0.65rem] uppercase tracking-widest font-sans font-semibold">Lançamento em</span>
        </div>
        <div className="flex justify-center gap-3">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div key={unit} className="flex flex-col">
              <span className="text-xl font-display text-white leading-none">
                {String(value).padStart(2, '0')}
              </span>
              <span className="text-[0.5rem] uppercase text-white/50 tracking-tighter">
                {unit === 'days' ? 'Dias' : unit === 'hours' ? 'Hrs' : unit === 'minutes' ? 'Min' : 'Seg'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, index }: ProductCardProps) => {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const isLaunched = !product.launchDate || new Date(product.launchDate).getTime() <= new Date().getTime();

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLaunched) return;
    
    if (product.id === "custom-order" || product.category === "Crie sua Taça") {
      navigate("/personalizar");
    } else {
      addItem(product);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group"
    >
      <div className="glass-card overflow-hidden h-full flex flex-col group/card relative">
        <Link to={product.id === "custom-order" ? "/personalizar" : `/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden rounded-t-atelier block">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <div className="p-4 bg-white/90 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500">
               <Search className="text-primary" size={24} />
             </div>
          </div>
          {!isLaunched && product.launchDate && (
            <CountdownTimer targetDate={product.launchDate} />
          )}
        </Link>

        {/* Info */}
        <div className="p-5 md:p-6 flex flex-col flex-grow">
          <Link to={product.id === "custom-order" ? "/personalizar" : `/product/${product.id}`} className="hover:text-primary transition-colors">
            <h3 className="text-display text-xl md:text-2xl text-foreground mb-1 leading-tight">
              {product.name}
            </h3>
          </Link>
          <p className="font-sans text-xs md:text-sm text-muted-foreground mb-4 line-clamp-2">
            {product.description}
          </p>
          <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-primary/5 pt-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Valor</span>
              <span className="font-sans text-lg md:text-xl font-bold text-primary tabular-nums">
                R$ {product.price.toFixed(2).replace(".", ",")}
              </span>
            </div>
            <motion.button
              whileHover={isLaunched ? { scale: 1.02 } : {}}
              whileTap={isLaunched ? { scale: 0.98 } : {}}
              onClick={handleAction}
              disabled={!isLaunched}
              className={`flex items-center justify-center gap-2 text-[10px] md:text-xs px-6 py-3 transition-all whitespace-nowrap w-full sm:w-auto ${
                isLaunched 
                  ? "btn-gold shadow-md" 
                  : "bg-secondary text-muted-foreground cursor-not-allowed opacity-50"
              }`}
            >
              {isLaunched ? (
                <>
                  <Plus className="h-3 md:h-3.5 w-3 md:w-3.5" />
                  <span className="font-black">
                    {product.id === "custom-order" ? "PERSONALIZAR" : "ADICIONAR"}
                  </span>
                </>
              ) : (
                "EM BREVE"
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
