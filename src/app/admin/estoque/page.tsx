import React from 'react';
import { 
  getSupplies, 
  getInventoryMetrics 
} from '@/lib/actions';
import { 
  Plus, 
  Search, 
  Grid2X2, 
  List, 
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Database,
  Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SupplyCategory } from '@prisma/client';

export default async function EstoquePage() {
  const [supplies, metrics] = await Promise.all([
    getSupplies(),
    getInventoryMetrics()
  ]);

  const getCategoryColor = (category: SupplyCategory) => {
    switch (category) {
      case 'CRISTAL': return 'bg-cyan-50 text-cyan-600 border-cyan-100';
      case 'TINTA': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'PINCEL': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'EMBALAGEM': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'ACESSORIO': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif text-[#304930]">Inventário de Insumos</h1>
          <p className="text-sm text-slate-500 font-medium">Controle de cristais, tintas e materiais do atelier.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-[#304930] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#304930]/10 transition-all hover:scale-105 active:scale-95">
            <Plus className="w-4 h-4" />
            Novo Insumo
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <InventoryMetricCard 
           label="Total de Itens" 
           value={metrics.totalSupplies.toString()} 
           icon={Database} 
           color="text-[#304930]" 
         />
         <InventoryMetricCard 
           label="Estoque Baixo" 
           value={metrics.lowStockCount.toString()} 
           icon={AlertTriangle} 
           color="text-amber-500" 
         />
         <InventoryMetricCard 
           label="Sem Estoque" 
           value={metrics.outOfStockCount.toString()} 
           icon={Tag} 
           color="text-rose-500" 
         />
         <InventoryMetricCard 
           label="Valor em Estoque" 
           value={`R$ ${metrics.totalValue.toLocaleString('pt-BR')}`} 
           icon={ArrowUpRight} 
           color="text-[#304930]" 
         />
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Buscar por nome ou SKU..." 
                 className="bg-white border border-[#304930]/10 rounded-2xl pl-12 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#304930]/10 w-full transition-all font-medium"
               />
            </div>
            <select className="bg-white border border-[#304930]/10 rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest text-[#304930] focus:outline-none">
               <option>Todas Categorias</option>
               <option>Cristais</option>
               <option>Tintas</option>
               <option>Embalagens</option>
            </select>
         </div>

         <div className="flex items-center bg-white border border-[#304930]/5 rounded-2xl p-1">
            <button className="p-2 bg-[#304930] text-white rounded-xl shadow-lg"><Grid2X2 className="w-4 h-4" /></button>
            <button className="p-2 text-slate-400 hover:text-[#304930] transition-colors"><List className="w-4 h-4" /></button>
         </div>
      </div>

      {/* Supply Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {supplies.map((supply) => (
           <div key={supply.id} className="titan-card p-6 flex flex-col justify-between group hover:border-[#304930]/30 transition-all">
              <div>
                 <div className="flex justify-between items-start mb-4">
                    <span className={cn(
                      "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border",
                      getCategoryColor(supply.category)
                    )}>
                      {supply.category}
                    </span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">SKU: {supply.sku}</p>
                 </div>
                 
                 <h3 className="text-sm font-bold text-[#304930] mb-1 line-clamp-1">{supply.name}</h3>
                 <p className="text-[10px] text-slate-400 font-medium mb-4">{supply.supplier?.name || 'Fornecedor não vinculado'}</p>

                 <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-[#F8FAF8] border border-black/5 rounded-2xl">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Atual</p>
                       <p className={cn(
                         "text-lg font-black tracking-tighter",
                         supply.isLowStock ? "text-rose-500" : "text-[#304930]"
                       )}>
                         {supply.currentStock} <span className="text-[10px] font-bold opacity-40">{supply.unit}</span>
                       </p>
                    </div>
                    <div className="p-3 bg-[#F8FAF8] border border-black/5 rounded-2xl">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Mínimo</p>
                       <p className="text-lg font-black text-[#304930] tracking-tighter">
                         {supply.minStockLevel} <span className="text-[10px] font-bold opacity-40">{supply.unit}</span>
                       </p>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-black/5">
                 <button className="flex-1 py-2 rounded-xl bg-[#304930]/5 text-[#304930] text-[9px] font-black uppercase tracking-widest hover:bg-[#304930] hover:text-white transition-all">
                   Ajustar
                 </button>
                 <button className="flex-1 py-2 rounded-xl bg-amber-500/10 text-amber-600 text-[9px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all">
                   Pedir
                 </button>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}

function InventoryMetricCard({ label, value, icon: Icon, color }: any) {
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
