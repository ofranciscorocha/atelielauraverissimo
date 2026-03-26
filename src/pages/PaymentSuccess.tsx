
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ShoppingBag, ArrowRight, Star } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("external_reference") || searchParams.get("order_id");
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card p-10 text-center bg-white shadow-2xl shadow-forest/5 border-forest/10"
      >
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-100">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>

        <h1 className="text-display text-3xl text-forest mb-4">Pagamento Confirmado!</h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Obrigada por escolher o <span className="italic font-display">Ateliê Laura Veríssimo</span>. 
          Seu pedido já está em nossa fila de produção artesanal.
        </p>

        {orderId && (
          <div className="bg-forest/5 p-4 rounded-2xl mb-8 border border-forest/5">
            <span className="text-[10px] uppercase font-bold text-forest/50 tracking-widest block mb-1">Número do Pedido</span>
            <span className="text-forest font-bold font-mono text-sm">#{orderId.slice(-8).toUpperCase()}</span>
          </div>
        )}

        <div className="space-y-4">
          <button 
            onClick={() => navigate("/")}
            className="w-full bg-forest text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-forest/10 hover:bg-forest/90 transition-all flex items-center justify-center gap-2"
          >
            Voltar para a Loja
          </button>
          
          <button 
             onClick={() => navigate("/admin")} // Provisório enquanto não tem MyOrders
             className="w-full bg-white border border-forest/10 text-forest py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-forest/5 transition-all flex items-center justify-center gap-2"
          >
            Acompanhar Pedido <ArrowRight size={14} />
          </button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 opacity-30 grayscale scale-75">
           <Star size={12} fill="currentColor" />
           <Star size={12} fill="currentColor" />
           <Star size={12} fill="currentColor" />
           <Star size={12} fill="currentColor" />
           <Star size={12} fill="currentColor" />
        </div>
      </motion.div>
    </div>
  );
}
