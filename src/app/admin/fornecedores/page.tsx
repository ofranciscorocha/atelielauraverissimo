import React from 'react';
import { 
  getSuppliers 
} from '@/lib/actions';
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Truck, 
  ExternalLink,
  Edit2,
  Package,
  Star,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function FornecedoresPage() {
  const suppliers = await getSuppliers();

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif text-[#304930]">Rede de Suprimentos</h1>
          <p className="text-sm text-slate-500 font-medium">Gestão de parceiros, artistas e fornecedores de matéria-prima.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button className="flex items-center gap-2 bg-[#304930] text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#304930]/10 transition-all hover:scale-105 active:scale-95">
             <Plus className="w-4 h-4" />
             Novo Parceiro
           </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <SupplierStatCard label="Parceiros Ativos" value={suppliers.length.toString()} icon={ShieldCheck} color="text-emerald-500" />
         <SupplierStatCard label="Entregas no Prazo" value="98%" icon={Truck} color="text-[#304930]" />
         <SupplierStatCard label="Qualidade Média" value="4.9" icon={Star} color="text-[#D4AF37]" />
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {suppliers.map((supplier) => (
           <div key={supplier.id} className="titan-card p-10 flex flex-col md:flex-row gap-8 group hover:border-[#304930]/30 transition-all">
              {/* Profile Image/Initial */}
              <div className="w-24 h-24 rounded-[2rem] bg-[#304930]/5 border border-black/5 flex items-center justify-center text-[#304930] font-serif text-3xl font-bold shrink-0">
                 {supplier.name.charAt(0)}
              </div>

              {/* info */}
              <div className="flex-1 space-y-6">
                 <div className="flex justify-between items-start">
                    <div>
                       <h3 className="text-xl font-bold text-[#304930] mb-1">{supplier.name}</h3>
                       <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] bg-white border border-[#D4AF37]/20 px-2 py-0.5 rounded-lg flex items-center gap-1 w-fit">
                          <ShieldCheck className="w-3 h-3" /> Verificado
                       </span>
                    </div>
                    <div className="flex gap-2">
                       <button className="p-2 text-slate-300 hover:text-[#304930] transition-colors"><Edit2 className="w-4 h-4" /></button>
                       <button className="p-2 text-slate-300 hover:text-[#304930] transition-colors"><ExternalLink className="w-4 h-4" /></button>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-medium text-slate-600">{supplier.phone}</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-medium text-slate-600 truncate max-w-[140px]">{supplier.email}</span>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <Package className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-black text-[#304930] uppercase tracking-tighter">{supplier._count?.supplies || 0} Insumos</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-medium text-slate-600">Brasil</span>
                       </div>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-black/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="flex -space-x-2">
                          {[1, 2, 3].map((i) => (
                             <div key={i} className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-400">P{i}</div>
                          ))}
                       </div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Principais Materiais</p>
                    </div>
                    <button className="text-[10px] font-black uppercase tracking-widest text-[#304930] flex items-center gap-2 group">
                       Ver Catálogo <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
                    </button>
                 </div>
              </div>
           </div>
         ))}

         {suppliers.length === 0 && (
            <div className="col-span-full py-20 titan-card border-dashed flex flex-col items-center justify-center space-y-4">
               <Package className="w-12 h-12 text-slate-200" />
               <p className="text-sm text-slate-400 font-medium italic">Nenhum fornecedor cadastrado.</p>
            </div>
         )}
      </div>
    </div>
  );
}

function SupplierStatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="titan-card p-6 border-black/5 bg-white">
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
