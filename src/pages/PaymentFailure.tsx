
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, RefreshCw, MessageCircle } from "lucide-react";

export default function PaymentFailurePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass-card p-10 text-center bg-white border-destructive/10"
      >
        <div className="w-20 h-20 bg-destructive/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-destructive/10">
          <XCircle className="w-10 h-10 text-destructive" />
        </div>

        <h1 className="text-display text-3xl text-forest mb-4">Ops! Algo deu errado.</h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Infelizmente não conseguimos processar o seu pagamento no momento. 
          Pode ser uma instabilidade no cartão ou conexão.
        </p>

        <div className="space-y-4">
          <button 
            onClick={() => navigate("/checkout")}
            className="w-full bg-forest text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-forest/10 hover:bg-forest/90 transition-all flex items-center justify-center gap-2"
          >
            Tentar Novamente <RefreshCw size={14} />
          </button>
          
          <button 
             onClick={() => window.open('https://wa.me/5575991610314', '_blank')}
             className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-green-500/10 hover:bg-green-600 transition-all flex items-center justify-center gap-2"
          >
            Pagar via WhatsApp <MessageCircle size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
