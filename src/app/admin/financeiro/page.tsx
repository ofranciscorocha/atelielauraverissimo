import React from 'react';
import { 
  getFinanceMetrics, 
  getFinanceEntries,
  getMonthlyFinanceData,
  getCategoryInsights
} from '@/lib/actions';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  PieChart,
  ArrowRight,
  ChevronRight,
  Download,
  Calendar,
  Layers,
  ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function FinanceiroPage() {
  const [metrics, entries, monthlyData, insights] = await Promise.all([
    getFinanceMetrics(),
    getFinanceEntries({ limit: 10 }),
    getMonthlyFinanceData(6),
    getCategoryInsights()
  ]);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif text-[#304930]">Engenharia Financeira</h1>
          <p className="text-sm text-slate-500 font-medium">Análise de lucro, margem e fluxo de caixa do atelier.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button className="flex items-center gap-2 bg-white border border-[#304930]/10 text-[#304930] px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-[#304930]/5">
             <Download className="w-4 h-4" />
             Exportar
           </button>
           <button className="flex items-center gap-2 bg-[#304930] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#304930]/10 transition-all hover:scale-105 active:scale-95">
             <DollarSign className="w-4 h-4" />
             Nova Entrada
           </button>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <FinanceCard 
           label="Receita Total" 
           value={`R$ ${metrics.totalRevenue.toLocaleString('pt-BR')}`} 
           trend="+8.2%"
           icon={TrendingUp} 
           color="text-[#304930]" 
         />
         <FinanceCard 
           label="Despesas Totais" 
           value={`R$ ${metrics.totalExpenses.toLocaleString('pt-BR')}`} 
           trend="+2.4%"
           icon={TrendingDown} 
           color="text-rose-500" 
         />
         <FinanceCard 
           label="Lucro Líquido" 
           value={`R$ ${metrics.netProfit.toLocaleString('pt-BR')}`} 
           icon={Wallet} 
           color="text-[#D4AF37]" 
           highlight
         />
         <FinanceCard 
           label="Margem Média" 
           value={`${metrics.profitMargin.toFixed(1)}%`} 
           icon={PieChart} 
           color="text-emerald-500" 
         />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Monthly Performance Chart Area (Conceptual) */}
        <div className="col-span-12 lg:col-span-8 titan-card p-8 bg-white border-[#304930]/5">
           <div className="flex justify-between items-center mb-10">
              <div>
                 <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#304930]">Performance Mensal</h3>
                 <p className="text-[10px] text-slate-400 font-black uppercase mt-1">Comparativo de Receita vs Despesa</p>
              </div>
              <div className="flex items-center gap-2 bg-[#F0F4F0] p-1 rounded-xl">
                 <button className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-white text-[#304930] shadow-sm">6 Meses</button>
                 <button className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#304930]/40">12 Meses</button>
              </div>
           </div>

           <div className="h-64 flex items-end justify-between gap-4 px-4">
              {monthlyData.map((data, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3 group relative">
                   <div className="w-full flex justify-center gap-1">
                      <div 
                        className="w-4 bg-[#304930]/10 rounded-t-lg transition-all group-hover:bg-[#304930]/20" 
                        style={{ height: `${(data.revenue / (metrics.totalRevenue || 1)) * 200}px` }} 
                      />
                      <div 
                        className="w-4 bg-[#D4AF37]/40 rounded-t-lg transition-all group-hover:bg-[#D4AF37]/60" 
                        style={{ height: `${(data.profit / (metrics.totalRevenue || 1)) * 180}px` }} 
                      />
                   </div>
                   <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">{data.month}</p>
                   
                   {/* Tooltip */}
                   <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-[#304930] text-white p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 min-w-[120px] shadow-xl">
                      <p className="text-[8px] font-black uppercase tracking-widest text-emerald-400 mb-1">{data.month}</p>
                      <p className="text-[10px] font-bold">Rec: R$ {data.revenue.toLocaleString('pt-BR')}</p>
                      <p className="text-[10px] font-bold text-emerald-400">Luc: R$ {data.profit.toLocaleString('pt-BR')}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Categories Analysis */}
        <div className="col-span-12 lg:col-span-4 titan-card p-8 bg-[#304930] text-white overflow-hidden relative">
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                 <Layers className="w-5 h-5 text-emerald-400" />
                 <h3 className="text-sm font-black uppercase tracking-[0.2em]">Lucro por Categoria</h3>
              </div>
              
              <div className="space-y-5">
                 {insights.slice(0, 4).map((insight) => (
                   <div key={insight.category} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                         <span>{insight.category}</span>
                         <span className="text-emerald-400">R$ {insight.profit.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-emerald-400 rounded-full" 
                           style={{ width: `${(insight.profit / (metrics.monthlyRevenue || 1)) * 100}%` }} 
                         />
                      </div>
                   </div>
                 ))}
                 {insights.length === 0 && (
                   <div className="text-center py-10 text-white/40 italic text-xs">Aguardando dados...</div>
                 )}
              </div>

              <button className="w-full mt-10 py-4 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                Relatório Geral
                <ArrowRight className="w-4 h-4" />
              </button>
           </div>
           <PieChart className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 rotate-12" />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="titan-card p-8 border-[#304930]/5">
         <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-[#304930] uppercase tracking-widest">Movimentação Recente</h3>
            <button className="text-[10px] font-black text-[#304930]/40 uppercase tracking-[0.2em] hover:text-[#304930] transition-colors">Ver Todo o Livro-Caixa</button>
         </div>

         <div className="space-y-3">
            {entries.map((entry) => (
               <div key={entry.id} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-[#F8FAF8] border border-transparent hover:border-black/5 transition-all group">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center border transition-colors",
                    entry.type === 'RECEITA' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
                  )}>
                    {entry.type === 'RECEITA' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>
                  
                  <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                     <div className="col-span-12 md:col-span-5">
                        <p className="text-xs font-bold text-[#304930] mb-0.5">{entry.description}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{entry.category}</p>
                     </div>
                     <div className="col-span-6 md:col-span-3">
                        <div className="flex items-center gap-2">
                           <Calendar className="w-3 h-3 text-slate-300" />
                           <p className="text-[10px] text-slate-400 font-medium">{new Date(entry.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                     </div>
                     <div className="col-span-6 md:col-span-3 text-right">
                        <p className={cn(
                           "text-sm font-black",
                           entry.type === 'RECEITA' ? "text-emerald-600" : "text-rose-600"
                        )}>
                           {entry.type === 'RECEITA' ? '+' : '-'} R$ {entry.amount.toLocaleString('pt-BR')}
                        </p>
                        {entry.profit && (
                           <p className="text-[9px] text-emerald-500 font-bold uppercase">Lucro: R$ {entry.profit.toLocaleString('pt-BR')}</p>
                        )}
                     </div>
                     <div className="hidden md:block col-span-1 text-right">
                        <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight className="w-4 h-4 text-[#304930]" /></button>
                     </div>
                  </div>
               </div>
            ))}
            {entries.length === 0 && (
               <div className="text-center py-20 text-slate-400 italic text-sm">Nenhuma transação registrada.</div>
            )}
         </div>
      </div>
    </div>
  );
}

function FinanceCard({ label, value, trend, icon: Icon, color, highlight }: any) {
  return (
    <div className={cn(
      "titan-card p-6 transition-all duration-300 hover:scale-[1.02] group",
      highlight && "bg-white border-[#304930]/15 shadow-xl shadow-[#304930]/5"
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-xl bg-white shadow-sm border border-black/5 group-hover:scale-110 transition-transform", color)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
           <span className={cn(
             "text-[10px] font-black px-2 py-1 rounded-lg",
             trend.startsWith('+') ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
           )}>{trend}</span>
        )}
      </div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-[#304930] tracking-tighter">{value}</p>
    </div>
  );
}
