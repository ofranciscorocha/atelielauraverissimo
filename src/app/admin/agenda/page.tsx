import React from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  User, 
  Palette, 
  AlertCircle,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function AgendaPage() {
  const categories = [
    { name: 'Produção', color: 'bg-emerald-500' },
    { name: 'Pintura', color: 'bg-blue-500' },
    { name: 'Entrega', color: 'bg-[#D6B799]' },
    { name: 'Feedback', color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif text-[#304930]">Cronograma de Criação</h1>
          <p className="text-sm text-slate-500 font-medium">Gestão temporal do atelier e prazos de entrega extraordinários.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button className="flex md:hidden items-center justify-center bg-[#304930] text-white p-3 rounded-2xl shadow-lg">
              <Plus className="w-5 h-5" />
           </button>
           <button className="hidden md:flex items-center gap-2 bg-[#304930] text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all hover:scale-105 active:scale-95">
             <Plus className="w-4 h-4" />
             Novo Evento
           </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
         {/* Sidebar Controls */}
         <div className="col-span-12 lg:col-span-3 space-y-8">
            <div className="titan-card p-8">
               <h3 className="text-xs font-black text-[#304930] uppercase tracking-widest mb-6">Categorias</h3>
               <div className="space-y-4">
                  {categories.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between group cursor-pointer">
                       <div className="flex items-center gap-3">
                          <div className={cn("w-3 h-3 rounded-full", cat.color)} />
                          <span className="text-xs font-bold text-[#304930] group-hover:underline">{cat.name}</span>
                       </div>
                       <input type="checkbox" defaultChecked className="w-4 h-4 rounded-lg border-[#304930]/10 accent-[#304930]" />
                    </div>
                  ))}
               </div>
            </div>

            <div className="titan-card p-8 bg-[#304930] text-white">
               <div className="flex items-center gap-3 mb-6">
                  <AlertCircle className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Próximos Prazos</h3>
               </div>
               <div className="space-y-6">
                  <DeadlineItem title="Conjunto Bodas" date="Hoje, 17:00" />
                  <DeadlineItem title="Taça Individual G" date="Amanhã" />
                  <DeadlineItem title="Coleção Inverno" date="Sexta-feira" />
               </div>
            </div>
         </div>

         {/* Calendar View */}
         <div className="col-span-12 lg:col-span-9 space-y-8">
            <div className="titan-card p-0 overflow-hidden">
               {/* Calendar Toolbar */}
               <div className="px-8 py-6 border-b border-black/5 flex justify-between items-center bg-white">
                  <div className="flex items-center gap-6">
                     <h3 className="text-xl font-bold text-[#304930]">Março 2026</h3>
                     <div className="flex items-center p-1 bg-slate-50 border border-black/5 rounded-xl">
                        <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"><ChevronLeft className="w-4 h-4 text-slate-400" /></button>
                        <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"><ChevronRight className="w-4 h-4 text-slate-400" /></button>
                     </div>
                  </div>
                  <div className="flex items-center p-1 bg-slate-50 border border-black/5 rounded-xl">
                     <button className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400">Dia</button>
                     <button className="px-4 py-2 bg-white shadow-sm rounded-lg text-[8px] font-black uppercase tracking-widest text-[#304930]">Mês</button>
                     <button className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400">Ano</button>
                  </div>
               </div>

               {/* Grid */}
               <div className="grid grid-cols-7 border-b border-black/5 bg-[#F8FAF8]">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-[#304930]/40">{day}</div>
                  ))}
               </div>

               <div className="grid grid-cols-7 border-l border-t border-black/5">
                  {Array.from({ length: 35 }).map((_, i) => {
                    const day = i - 2; // Offset for Mar 1st
                    const isToday = day === 15;
                    const isCurrentMonth = day > 0 && day <= 31;
                    
                    return (
                      <div key={i} className={cn(
                        "h-32 p-4 border-r border-b border-black/5 transition-all hover:bg-white group relative",
                        !isCurrentMonth ? "bg-slate-50 opacity-20" : "bg-white/50"
                      )}>
                         <span className={cn(
                           "text-xs font-black",
                           isToday ? "w-6 h-6 bg-[#304930] text-white rounded-full flex items-center justify-center -mt-1 -ml-1 shadow-lg" : "text-[#304930]/40"
                         )}>
                            {isCurrentMonth ? day : ''}
                         </span>

                         {day === 10 && (
                           <div className="mt-2 p-2 bg-emerald-500/10 border-l-2 border-emerald-500 rounded-r-md">
                              <p className="text-[8px] font-black text-emerald-700 uppercase leading-tight line-clamp-2">Pintura Conjunto Ouro</p>
                           </div>
                         )}

                         {day === 15 && (
                           <div className="mt-2 p-2 bg-[#D6B799]/10 border-l-2 border-[#D6B799] rounded-r-md">
                              <p className="text-[8px] font-black text-[#D6B799] uppercase leading-tight line-clamp-2">Entrega Express #923</p>
                           </div>
                         )}

                         <button className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-[#304930]/20 hover:text-[#304930] transition-all">
                            <Plus className="w-4 h-4" />
                         </button>
                      </div>
                    );
                  })}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function DeadlineItem({ title, date }: any) {
  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer">
       <div>
          <p className="text-[10px] font-bold text-white mb-0.5">{title}</p>
          <p className="text-[8px] font-black text-emerald-100/40 uppercase tracking-widest">{date}</p>
       </div>
       <CheckCircle2 className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-all" />
    </div>
  );
}
