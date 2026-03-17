import React from 'react';
import { 
  TrendingUp, Users, ShoppingBag, Palette, 
  ArrowUpRight, Clock, Star, Heart, TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  getDashboardMetrics, 
  getTopClients, 
  getRecentOrders 
} from '@/lib/actions';

export default async function AdminDashboard() {
  const [metrics, topClients, recentOrders] = await Promise.all([
    getDashboardMetrics(),
    getTopClients(5),
    getRecentOrders(5)
  ]);

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif text-[#304930]">Bem-vinda de volta, Laura.</h1>
          <p className="text-sm text-slate-500 font-medium">Seu ateliê está com {metrics.ordersInProduction} pinturas em andamento hoje.</p>
        </div>
        <div className="flex gap-4">
           <button className="bg-[#304930] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#304930]/10 transition-all hover:scale-105 active:scale-95">
             Novo Pedido
           </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Vendas Mensais" 
          value={`R$ ${metrics.monthlyRevenue.toLocaleString('pt-BR')}`} 
          trend={metrics.revenueGrowth >= 0 ? `+${metrics.revenueGrowth.toFixed(1)}%` : `${metrics.revenueGrowth.toFixed(1)}%`}
          icon={metrics.revenueGrowth >= 0 ? TrendingUp : TrendingDown} 
          color={metrics.revenueGrowth >= 0 ? "text-[#304930]" : "text-rose-500"} 
        />
        <MetricCard 
          label="Novos Clientes" 
          value={metrics.newClientsThisMonth.toString()} 
          icon={Users} 
          color="text-amber-500" 
        />
        <MetricCard 
          label="Em Produção" 
          value={metrics.ordersInProduction.toString()} 
          icon={ShoppingBag} 
          color="text-blue-500" 
          highlight 
        />
        <MetricCard 
          label="Estoque Baixo" 
          value={metrics.lowStockItems.toString()} 
          icon={Palette} 
          color="text-rose-500" 
        />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Production Flow / Recent Orders */}
        <div className="col-span-12 lg:col-span-8 titan-card p-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-lg font-bold text-[#304930] uppercase tracking-widest">Últimos Pedidos</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase mt-1">Status em tempo real das encomendas</p>
            </div>
          </div>

          <div className="space-y-4">
             {recentOrders.map((order) => (
                <ProductionItem 
                  key={order.id}
                  client={order.client.name} 
                  product={order.items[0]?.product.name || "Pedido Especial"} 
                  status={order.status.replace('_', ' ')} 
                  progress={
                    order.productionStatus === 'CONCLUIDO' ? 100 :
                    order.productionStatus === 'EMBALAGEM' ? 90 :
                    order.productionStatus === 'ACABAMENTO' ? 75 :
                    order.productionStatus === 'INSPECAO' ? 60 :
                    order.productionStatus === 'CURA' ? 45 :
                    order.productionStatus === 'PINTURA' ? 30 :
                    order.productionStatus === 'PREPARO' ? 15 : 0
                  } 
                  date={`Total: R$ ${Number(order.total).toLocaleString('pt-BR')}`}
                />
             ))}
             {recentOrders.length === 0 && (
               <div className="text-center py-10 text-slate-400 italic text-sm">Nenhum pedido encontrado.</div>
             )}
          </div>
        </div>

        {/* Favorite Clients ranking */}
        <div className="col-span-12 lg:col-span-4 titan-card p-8 bg-[#304930] text-white">
           <div className="flex items-center gap-3 mb-8">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em]">Clientes Favoritos</h3>
           </div>

           <div className="space-y-6">
              {topClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold border border-white/20 uppercase">
                       {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-none mb-1">{client.name}</p>
                      <p className="text-[9px] text-emerald-300 font-black uppercase tracking-widest italic">
                        {client.ranking} • {client.segment}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-amber-400 transition-colors" />
                </div>
              ))}
              {topClients.length === 0 && (
                <div className="text-center py-4 text-white/40 italic text-[10px]">Nenhum cliente VIP ainda.</div>
              )}
           </div>
           
           <button className="w-full mt-10 py-4 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">
             Ver Ranking de Fidelidade
           </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="titan-card p-6 flex flex-col items-center text-center space-y-3 cursor-pointer hover:border-[#304930]/30 transition-all">
            <Heart className="w-6 h-6 text-[#304930]" />
            <h4 className="text-[10px] font-black uppercase tracking-widest">Ver Recadinhos</h4>
         </div>
         <div className="titan-card p-6 flex flex-col items-center text-center space-y-3 cursor-pointer hover:border-[#304930]/30 transition-all">
            <Clock className="w-6 h-6 text-[#304930]" />
            <h4 className="text-[10px] font-black uppercase tracking-widest">Ajustar Prazos</h4>
         </div>
         <div className="titan-card p-6 flex flex-col items-center text-center space-y-3 cursor-pointer hover:border-[#304930]/30 transition-all">
            <Palette className="w-6 h-6 text-[#304930]" />
            <h4 className="text-[10px] font-black uppercase tracking-widest">Novas Cores</h4>
         </div>
         <div className="titan-card p-6 flex flex-col items-center text-center space-y-3 cursor-pointer hover:border-[#304930]/30 transition-all">
            <Users className="w-6 h-6 text-[#304930]" />
            <h4 className="text-[10px] font-black uppercase tracking-widest">Base de Leads</h4>
         </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, trend, icon: Icon, color, highlight }: any) {
  return (
    <div className={cn(
      "titan-card p-6 transition-all duration-300 hover:scale-[1.02] group",
      highlight && "border-[#304930]/20 bg-[#304930]/5"
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-xl bg-white shadow-sm border border-black/5 group-hover:scale-110 transition-transform", color)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
           <span className="text-[10px] font-black text-[#304930] bg-[#304930]/10 px-2 py-1 rounded-lg">{trend}</span>
        )}
      </div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-[#304930] tracking-tighter">{value}</p>
    </div>
  );
}

function ProductionItem({ client, product, status, progress, date }: any) {
  return (
    <div className="flex items-center gap-6 p-4 rounded-3xl bg-[#F8FAF8] border border-black/5 transition-all hover:border-[#304930]/20 group">
       <div className="w-12 h-12 rounded-2xl bg-white border border-black/5 flex items-center justify-center font-bold text-[#304930] group-hover:bg-[#304930] group-hover:text-white transition-all uppercase">
          {client.charAt(0)}
       </div>
       <div className="flex-1">
          <div className="flex justify-between mb-2">
            <div>
              <h4 className="text-xs font-bold text-[#304930] leading-none mb-1">{product}</h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{client}</p>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-black uppercase text-[#D6B799] text-glow-emerald">{status}</span>
              <p className="text-[9px] text-slate-400 font-medium">{date}</p>
            </div>
          </div>
          <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-black/5">
             <div 
               className="h-full bg-gradient-to-r from-[#304930] to-emerald-400 transition-all duration-1000" 
               style={{ width: `${progress}%` }}
             />
          </div>
       </div>
    </div>
  );
}
