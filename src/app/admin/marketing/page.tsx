import React from 'react';
import { 
  getGeneratedArts 
} from '@/lib/actions';
import { 
  Sparkles, 
  Send, 
  Search, 
  Image as ImageIcon, 
  Layers,
  Star,
  Zap,
  CheckCircle2,
  Trash2,
  Download,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function MarketingPage() {
  const generatedArts = await getGeneratedArts({ limit: 12 });

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif text-[#304930]">Marketing & IA</h1>
          <p className="text-sm text-slate-500 font-medium">Geração de arte com Nano Banana Pro e gestão de campanhas.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button className="flex items-center gap-2 bg-[#304930] text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#304930]/10 transition-all hover:scale-105 active:scale-95">
             <Zap className="w-4 h-4 text-emerald-400" />
             Novo Post IA
           </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
         {/* AI Generator Control */}
         <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="titan-card p-10 bg-[#304930] text-white relative overflow-hidden">
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                     <div className="p-2 bg-white/10 rounded-xl">
                        <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                     </div>
                     <h3 className="text-sm font-black uppercase tracking-[0.2em]">Nano Banana Pro</h3>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-emerald-100/40">Conceito da Arte</label>
                        <textarea 
                          rows={4}
                          placeholder="Ex: Flores tropicais em tons de esmeralda com bordas douradas..."
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400/30 transition-all font-medium placeholder:text-white/20"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-emerald-100/40">Estilo Artístico</label>
                        <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400/30 font-medium">
                           <option>Aquarela Elegante</option>
                           <option>Minimalista Traço Fino</option>
                           <option>Clássico Ornamental</option>
                           <option>Moderno Geométrico</option>
                        </select>
                     </div>

                     <button className="w-full py-5 bg-emerald-500 text-[#304930] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 active:scale-95">
                        Gerar Obra Prima
                        <Send className="w-4 h-4" />
                     </button>
                  </div>
               </div>
               <Palette className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 rotate-12" />
            </div>

            {/* Campaign Summary */}
            <div className="titan-card p-10 bg-white">
               <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#304930] mb-8">Estatísticas de Alcance</h3>
               <div className="space-y-6">
                  <CampaignStat label="Clipe de Venda (IG)" value="12k" trend="+5%" active />
                  <CampaignStat label="CTR Catálogo" value="4.2%" trend="+1.2%" />
                  <CampaignStat label="Pedidos via IA" value="28" trend="+8" />
               </div>
            </div>
         </div>

         {/* Generated Gallery */}
         <div className="col-span-12 lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
               <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#304930]">Galeria de Inspirações Geradas</h3>
               <div className="flex items-center gap-2 text-[#304930]/40">
                  <Search className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Filtrar por Estilo</span>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {generatedArts.map((art) => (
                 <div key={art.id} className="titan-card p-0 overflow-hidden group">
                    <div className="aspect-square bg-slate-100 relative overflow-hidden">
                       <img 
                         src={art.imageUrl} 
                         alt={art.originalPrompt}
                         className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                          <button className="w-full py-3 bg-white text-[#304930] rounded-xl text-[9px] font-black uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                             <Download className="w-3 h-3" /> Baixar HD
                          </button>
                          <div className="flex gap-2">
                             <button className="flex-1 py-3 bg-[#304930] text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Usar em Peça</button>
                             <button className="p-3 bg-rose-500 text-white rounded-xl"><Trash2 className="w-3 h-3" /></button>
                          </div>
                       </div>
                       {art.approved && (
                          <div className="absolute top-4 right-4 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
                             <CheckCircle2 className="w-3 h-3" />
                          </div>
                       )}
                    </div>
                    <div className="p-6">
                       <p className="text-[10px] font-black text-[#304930] uppercase tracking-tighter mb-1 line-clamp-1">{art.originalPrompt}</p>
                       <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.2em]">{art.style}</p>
                    </div>
                 </div>
               ))}
               
               {generatedArts.length === 0 && (
                 <div className="col-span-full py-32 flex flex-col items-center justify-center space-y-6 titan-card border-dashed">
                    <ImageIcon className="w-16 h-16 text-slate-200" />
                    <p className="text-sm text-slate-400 font-medium italic">Sua galeria de IA está vazia. Gere sua primeira arte!</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

function CampaignStat({ label, value, trend, active }: any) {
  return (
    <div className={cn(
      "p-5 rounded-2xl border transition-all",
      active ? "bg-[#304930]/5 border-[#304930]/10" : "border-black/5 hover:border-[#304930]/20"
    )}>
       <div className="flex justify-between items-start mb-2">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <span className="text-[9px] font-black text-emerald-600">{trend}</span>
       </div>
       <p className="text-xl font-black text-[#304930] tracking-tighter">{value}</p>
    </div>
  );
}
