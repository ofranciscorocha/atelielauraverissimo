import React from 'react';
import { 
  getOrders 
} from '@/lib/actions';
import { 
  Package, 
  Search, 
  Filter, 
  MoreVertical,
  ChevronRight,
  Truck,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { OrderStatus, ProductionStatus } from '@prisma/client';

export default async function PedidosPage() {
  const orders = await getOrders();

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'AGUARDANDO_PAGAMENTO': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'PAGO': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'EM_PRODUCAO': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PRONTO_PARA_ENVIO': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'ENVIADO': return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'ENTREGUE': return 'bg-green-100 text-green-700 border-green-200';
      case 'CANCELADO': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getProductionStatusLabel = (status: ProductionStatus) => {
    return status.replace('_', ' ');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif text-[#304930]">Gestão de Pedidos</h1>
          <p className="text-sm text-slate-500 font-medium">Controle granular do fluxo de vendas e produção.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-[#304930] transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por ID ou Cliente..." 
              className="bg-white border border-[#304930]/10 rounded-2xl pl-12 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#304930]/10 w-full md:w-80 transition-all font-medium"
            />
          </div>
          <button className="p-3 bg-white border border-[#304930]/10 rounded-2xl text-[#304930] hover:bg-[#304930]/5 transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <StatsMiniCard label="Aguardando Pgto" value={orders.filter(o => o.status === 'AGUARDANDO_PAGAMENTO').length} color="text-amber-500" />
         <StatsMiniCard label="Em Produção" value={orders.filter(o => o.status === 'EM_PRODUCAO').length} color="text-blue-500" />
         <StatsMiniCard label="Prontos p/ Envio" value={orders.filter(o => o.status === 'PRONTO_PARA_ENVIO').length} color="text-emerald-500" />
         <StatsMiniCard label="Enviados Hoje" value={orders.filter(o => o.status === 'ENVIADO').length} color="text-teal-500" />
      </div>

      {/* Orders Table */}
      <div className="titan-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#304930]/5 text-[#304930] border-b border-[#304930]/10">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Pedido</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Cliente</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Status Geral</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Produção</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Total</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#304930]/5">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-[#F8FAF8] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#304930]/5 rounded-xl text-[#304930]">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#304930]">#{order.id.slice(-6).toUpperCase()}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div>
                    <p className="text-xs font-bold text-[#304930]">{order.client.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{order.client.email}</p>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
                    getStatusColor(order.status)
                  )}>
                    {order.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-[#304930] uppercase tracking-widest">
                      {getProductionStatusLabel(order.productionStatus)}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <p className="text-xs font-black text-[#304930]">R$ {order.total.toLocaleString('pt-BR')}</p>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="p-2 text-slate-400 hover:text-[#304930] transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center">
                   <div className="flex flex-col items-center gap-4">
                      <AlertCircle className="w-12 h-12 text-slate-200" />
                      <p className="text-sm text-slate-400 font-medium italic">Nenhum pedido registrado no sistema.</p>
                      <button className="text-[10px] font-black border border-[#304930]/20 text-[#304930] px-6 py-3 rounded-2xl uppercase tracking-[0.2em] hover:bg-[#304930] hover:text-white transition-all">
                        Criar Primeiro Pedido
                      </button>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delivery Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="titan-card p-8 bg-gradient-to-br from-[#304930] to-[#1E2E1E] text-white overflow-hidden relative">
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                  <Truck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-black uppercase tracking-[0.2em]">Próximos Envios</h3>
               </div>
               <div className="space-y-4">
                  {orders.filter(o => o.status === 'PRONTO_PARA_ENVIO').slice(0, 3).map(order => (
                     <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-[10px]">
                              {order.client.name.charAt(0)}
                           </div>
                           <div>
                              <p className="text-xs font-bold">{order.client.name}</p>
                              <p className="text-[9px] text-emerald-300/60 font-black uppercase tracking-widest italic">{order.items[0]?.productName}</p>
                           </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/40 group-hover:translate-x-1 transition-all" />
                     </div>
                  ))}
                  {orders.filter(o => o.status === 'PRONTO_PARA_ENVIO').length === 0 && (
                     <p className="text-xs text-white/40 italic">Nenhum pedido pronto para envio no momento.</p>
                  )}
               </div>
            </div>
            <Package className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 rotate-12" />
         </div>

         <div className="titan-card p-8 border-[#304930]/10">
            <div className="flex items-center gap-3 mb-6">
               <AlertCircle className="w-5 h-5 text-amber-500" />
               <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#304930]">Alertas de Produção</h3>
            </div>
            <div className="space-y-4">
               {/* Mock alerts or filtering orders with late estimation */}
               <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
                  <div className="flex-1">
                     <p className="text-xs font-bold text-amber-900">3 Pedidos próximos ao prazo</p>
                     <p className="text-[10px] text-amber-900/60 font-medium">Estágio de Pintura requer atenção imediata.</p>
                  </div>
                  <button className="text-[10px] font-black uppercase text-amber-900 px-4 py-2 bg-amber-200/50 rounded-xl">Ver</button>
               </div>
               <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50" />
                  <div className="flex-1">
                     <p className="text-xs font-bold text-rose-900">1 Insumo em falta crítico</p>
                     <p className="text-[10px] text-rose-900/60 font-medium">Taça Crystal Gin 650ml sem estoque.</p>
                  </div>
                  <button className="text-[10px] font-black uppercase text-rose-900 px-4 py-2 bg-rose-200/50 rounded-xl">Repor</button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function StatsMiniCard({ label, value, color }: any) {
  return (
    <div className="titan-card p-6 flex items-center justify-between border-black/5 hover:border-[#304930]/20 transition-all cursor-default">
       <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className={cn("text-2xl font-black tracking-tighter", color)}>{value.toString().padStart(2, '0')}</p>
       </div>
       <div className={cn("w-1 h-8 rounded-full bg-current opacity-20", color)} />
    </div>
  );
}
