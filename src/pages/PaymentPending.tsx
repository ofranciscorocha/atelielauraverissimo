
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, ShoppingBag } from "lucide-react";

export default function PaymentPendingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card p-10 text-center bg-white border-accent/20"
      >
        <div className="w-20 h-20 bg-accent/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-accent/10">
          <Clock className="w-10 h-10 text-accent" />
        </div>

        <h1 className="text-display text-3xl text-forest mb-4">Pagamento em Análise</h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Seu pagamento está sendo processado pelo <span className="font-bold">Mercado Pago</span>. 
          Isso geralmente leva alguns minutos. Assim que aprovado, seu pedido entrará em produção.
        </p>

        <div className="space-y-4">
          <button 
            onClick={() => navigate("/")}
            className="w-full bg-forest text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-forest/10 hover:bg-forest/90 transition-all flex items-center justify-center gap-2"
          >
            Continuar Navegando
          </button>
        </div>
        
        <p className="mt-8 text-[10px] uppercase font-bold text-slate-400 tracking-widest leading-relaxed">
           Você receberá uma confirmação no seu e-mail assim que o status for atualizado.
        </p>
      </motion.div>
    </div>
  );
}
