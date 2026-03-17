export const dynamic = 'force-dynamic';

import React from 'react';
import { 
  getProducts 
} from '@/lib/actions';
import { 
  Plus, 
  Search, 
  Edit3,
  Trash2,
  ExternalLink,
  Tag,
  Box,
  Layers,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default async function ProdutosPage() {
  const products = await getProducts();

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif text-[#304930]">Catálogo de Produtos</h1>
          <p className="text-sm text-slate-500 font-medium">Gestão de peças artísticas e coleções exclusivas.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button className="flex items-center gap-2 bg-[#304930] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#304930]/10 transition-all hover:scale-105 active:scale-95">
             <Plus className="w-4 h-4" />
             Novo Produto
           </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Buscar por nome, tag ou categoria..." 
                 className="bg-white border border-[#304930]/10 rounded-2xl pl-12 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#304930]/10 w-full transition-all font-medium"
               />
            </div>
            <select className="bg-white border border-[#304930]/10 rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest text-[#304930] focus:outline-none">
               <option>Categorias</option>
               <option>Taças</option>
               <option>Copos</option>
               <option>Decoração</option>
            </select>
         </div>

         <div className="flex items-center gap-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total: <span className="text-[#304930]">{products.length}</span></p>
         </div>
      </div>

      {/* Products Table (Titan Style) */}
      <div className="titan-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#304930]/5 text-[#304930] border-b border-[#304930]/10">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Peça / Coleção</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Categoria</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center">Variantes</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Preço Base</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#304930]/5">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-[#F8FAF8] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border border-black/5 flex-shrink-0 relative">
                       {product.isActive && (
                         <div className="absolute top-1 right-1 z-10 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
                       )}
                       <div className="w-full h-full flex items-center justify-center text-[#304930]/20 bg-[#304930]/5">
                          <Box className="w-6 h-6" />
                       </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#304930] group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{product.name}</p>
                      <div className="flex gap-1 mt-1">
                         {product.tags.slice(0, 2).map((tag: string) => (
                           <span key={tag} className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded-md">#{tag}</span>
                         ))}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                     <Tag className="w-3.5 h-3.5 text-slate-400" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{product.category}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <div className="flex justify-center flex-wrap gap-1 max-w-[150px] mx-auto">
                      {product.variants.map((v: any) => (
                        <div 
                          key={v.id} 
                          className="w-4 h-4 rounded-full border border-black/10 shadow-sm"
                          style={{ backgroundColor: v.color.toLowerCase() }} 
                          title={`${v.model} - ${v.color}`}
                        />
                      ))}
                      {product.variants.length === 0 && (
                        <span className="text-[10px] text-slate-300 italic">Sem variantes</span>
                      )}
                   </div>
                </td>
                <td className="px-8 py-6 text-right">
                   <p className="text-xs font-black text-[#304930]">R$ {product.basePrice.toLocaleString('pt-BR')}</p>
                </td>
                <td className="px-8 py-6">
                   <div className={cn(
                     "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest",
                     product.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                   )}>
                      {product.isActive ? 'Ativo' : 'Inativo'}
                   </div>
                </td>
                <td className="px-8 py-6 text-right">
                   <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-[#304930] transition-colors hover:bg-[#304930]/5 rounded-xl">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors hover:bg-emerald-50 rounded-xl">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-rose-600 transition-colors hover:bg-rose-50 rounded-xl">
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center">
                   <div className="flex flex-col items-center gap-4">
                      <Sparkles className="w-12 h-12 text-slate-200" />
                      <p className="text-sm text-slate-400 font-medium italic">Seu catálogo está vazio. Comece a criar arte!</p>
                      <button className="text-[10px] font-black bg-[#304930] text-white px-8 py-4 rounded-2xl uppercase tracking-[0.2em] shadow-xl transition-all hover:scale-105 active:scale-95">
                        Lançar Primeira Peça
                      </button>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Collections Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="titan-card p-6 border-emerald-100 bg-emerald-50/30 flex flex-col justify-between">
            <div>
               <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 text-emerald-600">
                  <Sparkles className="w-5 h-5" />
               </div>
               <h4 className="text-sm font-bold text-[#304930] mb-2">Coleção de Verão</h4>
               <p className="text-[10px] text-slate-500 font-medium">8 produtos ativos vinculados a esta coleção sazonal.</p>
            </div>
            <button className="mt-6 text-[9px] font-black uppercase text-emerald-600 flex items-center gap-2 group">
               Ver Detalhes <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-all" />
            </button>
         </div>
         {/* More summary cards could go here */}
      </div>
    </div>
  );
}
