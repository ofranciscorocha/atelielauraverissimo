export const dynamic = 'force-dynamic';

import React from 'react';
import { 
  getOrders 
} from '@/lib/actions';
import { 
  Palette, 
  Hourglass, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  User,
  Package,
  ArrowRight,
  Sparkles,
  Layers,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function ProducaoPage() {
  const activeOrders = await getOrders({
    status: 'EM_PRODUCAO',
    limit: 20
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PREPARO': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'PINTURA': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'SECAGEM': return 'bg-[#D6B799]/10 text-[#D6B799] border-[#D6B799]/20';
      case 'FINALIZACAO': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'EMBALAGEM': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PREPARO': return <Layers className="w-4 h-4" />;
      case 'PINTURA': return <Palette className="w-4 h-4" />;
      case 'SECAGEM': return <Clock className="w-4 h-4" />;
      case 'FINALIZACAO': return <Sparkles className="w-4 h-4" />;
      case 'EMBALAGEM': return <Package className="w-4 h-4" />;
      default: return <Hourglass className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif text-[#304930]">Fila de Produção</h1>
          <p className="text-sm text-slate-500 font-medium">Acompanhamento granular do fluxo artístico do atelier.</p>
        </div>
        
        <div className="flex items-center bg-white border border-[#304930]/10 rounded-2xl p-1 shadow-sm">
           <button className="px-6 py-2 bg-[#304930] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Timeline</button>
           <button className="px-6 py-2 text-[#304930]/40 text-[10px] font-black uppercase tracking-widest">Kanban</button>
        </div>
      </div>

      {/* Production Stages summary */}
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
         {['TODOS', 'PREPARO', 'PINTURA', 'SECAGEM', 'FINALIZACAO', 'EMBALAGEM'].map((stage) => (
           <button 
             key={stage}
             className={cn(
               "flex items-center gap-3 px-6 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
               stage === 'TODOS' ? "bg-[#304930] text-white border-[#304930] shadow-xl" : "bg-white text-[#304930]/40 border-black/5 hover:border-[#304930]/20"
             )}
           >
              {stage === 'TODOS' ? <Layers className="w-4 h-4" /> : getStatusIcon(stage)}
              {stage}
           </button>
         ))}
      </div>

      {/* Production Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
         {activeOrders.map((order) => (
           <div key={order.id} className="titan-card p-0 overflow-hidden flex flex-col group hover:border-[#304930]/30 transition-all">
              {/* Card Header Status */}
              <div className={cn(
                "px-8 py-3 border-b flex justify-between items-center",
                getStatusColor(order.productionStatus)
              )}>
                 <div className="flex items-center gap-2">
                    {getStatusIcon(order.productionStatus)}
                    <span className="text-[10px] font-black uppercase tracking-widest">{order.productionStatus}</span>
                 </div>
                 <span className="text-[10px] font-black opacity-40 uppercase tracking-tighter">Pedido #{order.id.slice(-6)}</span>
              </div>

              <div className="p-8 space-y-6 flex-1">
                 <div className="flex items-start justify-between">
                    <div>
                       <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Cliente</h3>
                       <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[#304930]/40" />
                          <p className="text-sm font-bold text-[#304930]">{order.client.name}</p>
                       </div>
                    </div>
                    {order.specialMessage && (
                       <div className="w-8 h-8 rounded-full bg-[#D6B799]/10 flex items-center justify-center text-[#D6B799] border border-[#D6B799]/20" title="Possui Mensagem Especial">
                          <Sparkles className="w-4 h-4" />
                       </div>
                    )}
                 </div>

                 <div className="space-y-3">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Peças em Produção</h3>
                    <div className="space-y-2">
                       {order.items.map((item: any, idx) => (
                          <div key={idx} className="p-3 bg-[#F8FAF8] rounded-xl border border-black/5 flex justify-between items-center text-[10px] font-bold text-[#304930]">
                             <span>{item.quantity}x {item.productName}</span>
                             <span className="opacity-40 uppercase">{item.variantModel}</span>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Progress Bar (Fictitious based on index of status) */}
                 <div className="space-y-2">
                    <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                       <span>Progresso</span>
                       <span className="text-[#304930]">75%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#101010]/5 rounded-full overflow-hidden">
                       <div className="h-full bg-[#304930] w-3/4 rounded-full" />
                    </div>
                 </div>
              </div>

              {/* Action Area */}
              <div className="p-6 bg-[#304930]/5 border-t border-[#304930]/10 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-rose-500">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase">Atraso 2h</span>
                 </div>
                 <button className="px-6 py-2.5 bg-[#304930] text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg group-hover:scale-105 transition-all flex items-center gap-2">
                    Avançar Fluxo
                    <ArrowRight className="w-3 h-3" />
                 </button>
              </div>
           </div>
         ))}

         {activeOrders.length === 0 && (
           <div className="col-span-full py-40 titan-card border-dashed flex flex-col items-center justify-center space-y-6">
              <CheckCircle2 className="w-16 h-16 text-emerald-100" />
              <div className="text-center">
                 <h3 className="text-xl font-serif text-[#304930] mb-2">Tudo em dia!</h3>
                 <p className="text-sm text-slate-400 font-medium">Não há pedidos pendentes de produção no momento.</p>
              </div>
           </div>
         )}
      </div>
    </div>
  );
}
