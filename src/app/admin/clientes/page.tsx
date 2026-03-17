import React from 'react';
import { 
  getClients, 
  getClientMetrics 
} from '@/lib/actions';
import { 
  Users, 
  Star, 
  Search, 
  Filter, 
  Crown, 
  MessageCircle, 
  TrendingUp,
  Award,
  Calendar,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function ClientesPage() {
  const [clients, metrics] = await Promise.all([
    getClients(),
    getClientMetrics()
  ]);

  const getRankingBadge = (ranking: string) => {
    switch (ranking) {
      case 'DIAMANTE': return 'bg-cyan-50 text-cyan-700 border-cyan-100';
      case 'OURO': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'PRATA': return 'bg-slate-50 text-slate-700 border-slate-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif text-[#304930]">Base de Admiradores</h1>
          <p className="text-sm text-slate-500 font-medium">Gestão de relacionamento e fidelidade (CRM).</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button className="flex items-center gap-2 bg-[#304930] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#304930]/10 transition-all hover:scale-105 active:scale-95">
             <MessageCircle className="w-4 h-4" />
             Disparar Campanha
           </button>
        </div>
      </div>

      {/* CRM Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <MetricCard 
           label="Total de Clientes" 
           value={metrics.totalClients.toString()} 
           icon={Users} 
           color="text-[#304930]" 
         />
         <MetricCard 
           label="Ticket Médio" 
           value={`R$ ${metrics.averageTicket.toLocaleString('pt-BR')}`} 
           icon={TrendingUp} 
           color="text-emerald-500" 
         />
         <MetricCard 
           label="Taxa de Retenção" 
           value={`${metrics.retentionRate.toFixed(1)}%`} 
           icon={Star} 
           color="text-[#D6B799]" 
         />
         <MetricCard 
           label="LTV Médio" 
           value={`R$ ${metrics.averageLTV.toLocaleString('pt-BR')}`} 
           icon={Award} 
           color="text-purple-500" 
         />
      </div>

      {/* List Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Buscar por nome, telefone ou email..." 
                 className="bg-white border border-[#304930]/10 rounded-2xl pl-12 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#304930]/10 w-full transition-all font-medium"
               />
            </div>
            <select className="bg-white border border-[#304930]/10 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#304930] focus:outline-none">
               <option>Todos Rankings</option>
               <option>Diamante</option>
               <option>Ouro</option>
               <option>Prata</option>
            </select>
         </div>

         <div className="flex items-center gap-2 p-1 bg-white border border-[#304930]/5 rounded-2xl">
            <button className="px-4 py-2 bg-[#304930] text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Ativos</button>
            <button className="px-4 py-2 text-slate-400 text-[9px] font-black uppercase tracking-widest">VIPs</button>
            <button className="px-4 py-2 text-slate-400 text-[9px] font-black uppercase tracking-widest">Inativos</button>
         </div>
      </div>

      {/* Clients Grid/Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {clients.map((client) => (
           <div key={client.id} className="titan-card p-8 group hover:border-[#304930]/30 transition-all">
              <div className="flex justify-between items-start mb-6">
                 <div className="w-14 h-14 rounded-2xl bg-[#304930]/5 border border-black/5 flex items-center justify-center text-[#304930] font-serif text-xl font-bold">
                    {client.name.charAt(0)}
                 </div>
                 <div className={cn(
                   "px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center gap-2",
                   getRankingBadge(client.ranking)
                 )}>
                    {client.ranking === 'DIAMANTE' && <Crown className="w-3 h-3" />}
                    {client.ranking}
                 </div>
              </div>

              <h3 className="text-lg font-bold text-[#304930] mb-1 line-clamp-1">{client.name}</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Calendar className="w-3 h-3" />
                 Cliente desde {new Date(client.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="p-4 bg-[#F8FAF8] rounded-2xl border border-black/5">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Pedidos</p>
                    <p className="text-lg font-black text-[#304930] tracking-tighter">{client.ordersCount}</p>
                 </div>
                 <div className="p-4 bg-[#F8FAF8] rounded-2xl border border-black/5">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total LTV</p>
                    <p className="text-lg font-black text-emerald-600 tracking-tighter">R$ {client.totalLTV.toLocaleString('pt-BR')}</p>
                 </div>
              </div>

              <div className="flex items-center gap-2">
                 <button className="flex-1 py-3 bg-[#304930] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#3F5F3F] transition-all flex items-center justify-center gap-2">
                    <MessageCircle className="w-3 h-3" />
                    WhatsApp
                 </button>
                 <button className="w-12 h-11 bg-[#304930]/5 text-[#304930] rounded-xl flex items-center justify-center hover:bg-[#304930]/10 transition-all">
                    <ChevronRight className="w-4 h-4" />
                 </button>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="titan-card p-6 border-black/5">
       <div className="flex justify-between items-start mb-4">
          <div className={cn("p-2 rounded-xl bg-white shadow-sm border border-black/5", color)}>
             <Icon className="w-5 h-5" />
          </div>
       </div>
       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
       <p className="text-2xl font-black text-[#304930] tracking-tighter">{value}</p>
    </div>
  );
}
