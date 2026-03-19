"use client";

import React, { useState, useEffect } from 'react';
import { 
  Bot, Zap, Play, Activity, Clock, Layers, 
  ShieldCheck, Settings, Palette, ShoppingBag,
  RefreshCw, CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'WORKING' | 'IDLE' | 'SLEEPING';
  tasksCompleted: number;
}

export default function VirtualOfficePage() {
  const [activeTab, setActiveTab] = useState('agents');
  const [loading, setLoading] = useState(false);

  const agents: Agent[] = [
    { id: '1', name: 'Art Director AI', type: 'Nano Banana Pro', status: 'WORKING', tasksCompleted: 142 },
    { id: '2', name: 'Sales Concierge', type: 'WhatsApp B2C', status: 'IDLE', tasksCompleted: 890 },
    { id: '3', name: 'Inventory Manager', type: 'Stock Control', status: 'SLEEPING', tasksCompleted: 56 },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-[#304930] border-t-transparent animate-spin"></div>
          <Palette className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#304930]" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#304930] animate-pulse">Sincronizando Nodes do Ateliê...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 font-sans">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#304930]/10 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="bg-[#304930]/10 p-2 rounded-xl border border-[#304930]/20">
               <Bot className="w-6 h-6 text-[#304930]" />
             </div>
             <h1 className="text-4xl font-serif tracking-tight text-[#304930] italic">Virtual Office Engine</h1>
          </div>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] ml-1">
            Gestão Autônoma de Produção & Marketing
          </p>
        </div>

        <div className="flex gap-4">
           <button className="titan-card px-6 py-4 flex items-center gap-3 bg-[#304930]/5 hover:bg-[#304930]/10 transition-all border-[#304930]/20">
              <Zap className="w-4 h-4 text-[#D6B799]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#304930]">Boot System</span>
           </button>
           <button className="titan-card px-8 py-4 flex items-center gap-3 bg-[#304930] text-white hover:scale-105 transition-all border-none shadow-xl shadow-[#304930]/20">
              <Play className="w-4 h-4 fill-current" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Daily Routine Sync</span>
           </button>
        </div>
      </div>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatItem label="Agentes Ativos" value={2} total={3} icon={Activity} color="text-emerald-600" />
        <StatItem label="Pinturas em Andamento" value={14} icon={Palette} color="text-[#304930]" />
        <StatItem label="Aguardando Forno" value={3} icon={Zap} color="text-[#D6B799]" />
        <StatItem label="Fila de Aprovação" value={2} icon={ShieldCheck} color="text-rose-500" active />
      </div>

      {/* Main Control Center */}
      <div className="titan-card min-h-[600px] flex flex-col p-0 overflow-hidden bg-white border-[#304930]/5 shadow-2xl relative">
        {/* Navigation Tabs */}
        <div className="flex border-b border-black/5 bg-[#F8FAF8] sticky top-0 z-30 overflow-x-auto">
          <TabButton active={activeTab === 'agents'} onClick={() => setActiveTab('agents')} label="Agentes & Nodes" icon={Bot} />
          <TabButton active={activeTab === 'production'} onClick={() => setActiveTab('production')} label="Pátio de Produção" icon={Layers} />
          <TabButton active={activeTab === 'approvals'} onClick={() => setActiveTab('approvals')} label="Aprovações de Arte" icon={ShieldCheck} count={2} />
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Configurações Core" icon={Settings} />
        </div>

        <div className="flex-1 p-8">
          {activeTab === 'agents' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
               {agents.map((agent) => (
                 <div key={agent.id} className="titan-card p-6 border-[#304930]/5 hover:border-[#304930]/30 transition-all group bg-[#F8FAF8]">
                    <div className="flex justify-between items-start mb-6">
                       <div className="p-3 bg-white rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
                          <Bot className="w-6 h-6 text-[#304930]" />
                       </div>
                       <div className={cn("px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                         agent.status === 'WORKING' ? "text-emerald-600 bg-emerald-50 border-emerald-100" :
                         agent.status === 'IDLE' ? "text-[#D6B799] bg-[#D6B799]/10 border-[#D6B799]/20" :
                         "text-slate-400 bg-slate-50 border-slate-100"
                       )}>
                          {agent.status}
                       </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-[#304930] italic tracking-tight mb-1">{agent.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">{agent.type}</p>

                    <div className="space-y-3 border-t border-black/5 pt-4">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-slate-400 uppercase">Tasks Executadas</span>
                          <span className="text-xs font-black text-[#304930]">{agent.tasksCompleted}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-slate-400 uppercase">Eficiência</span>
                          <span className="text-xs font-black text-emerald-600">98.2%</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          )}

          {activeTab === 'production' && (
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-right-4 duration-500">
                <KanbanColumn title="Pintura" color="border-emerald-500" tasks={[{id: '1', title: 'Taça Esmeralda Gold (Set of 6)'}, {id: '2', title: 'Vaso Murano Sunset'}]} />
                <KanbanColumn title="Secagem/Forno" color="border-[#D6B799]" tasks={[{id: '3', title: 'Centro de Mesa Safira'}]} isProcessing />
                <KanbanColumn title="Lapidação" color="border-[#304930]" tasks={[]} />
                <KanbanColumn title="Pronto / Embalar" color="border-rose-500" tasks={[{id: '4', title: 'Prato Colecionador Cristal'}]} />
             </div>
          )}

          {activeTab === 'approvals' && (
             <div className="max-w-4xl mx-auto space-y-6 animate-in zoom-in-95 duration-500">
                <ApprovalItem 
                   title="Nova Arte: Campanha Coleção Outono" 
                   agent="Art Director AI" 
                   type="MARKETING_ASSET"
                   time="Há 12 min"
                />
                <ApprovalItem 
                   title="Alteração de Preço: Taça Murano" 
                   agent="Inventory AI" 
                   type="PRICING_UPDATE"
                   time="Há 45 min"
                />
             </div>
          )}
        </div>

        {/* HUD Scanner Effect */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#304930]/30 to-transparent animate-[scan_6s_linear_infinite] pointer-events-none"></div>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function StatItem({ label, value, total, icon: Icon, color, active }: any) {
  return (
    <div className={cn(
      "titan-card p-6 border-black/5 transition-all hover:border-[#304930]/30 group",
      active && "border-[#304930]/30 bg-[#304930]/5"
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2 rounded-lg bg-[#F8FAF8] border border-black/5", color)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-[#304930] tracking-tighter">{value}</span>
        {total && <span className="text-xs font-bold text-slate-300">/ {total}</span>}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, icon: Icon, count }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-8 py-5 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all border-b-2 whitespace-nowrap",
        active ? "text-[#304930] border-[#304930] bg-white" : "text-slate-400 border-transparent hover:text-[#304930]"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
      {count > 0 && <span className="bg-[#304930] text-white px-1.5 py-0.5 rounded text-[8px]">{count}</span>}
    </button>
  );
}

function KanbanColumn({ title, color, tasks, isProcessing }: any) {
  return (
    <div className="flex flex-col gap-4">
       <div className={cn("px-4 py-2 border-l-2 text-[10px] font-black uppercase tracking-widest text-[#304930] bg-[#F8FAF8]", color)}>
          {title} ({tasks.length})
       </div>
       <div className="space-y-4">
          {tasks.map((task: any) => (
            <div key={task.id} className="p-4 bg-white border border-black/5 rounded-2xl hover:border-[#304930]/20 transition-all shadow-sm">
               <p className="text-[11px] font-bold text-[#304930] leading-relaxed mb-3">{task.title}</p>
               <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase text-slate-400 px-2 py-0.5 bg-slate-50 rounded-md">ID-{task.id}</span>
                  {isProcessing && <RefreshCw className="w-3 h-3 text-[#304930] animate-spin" />}
               </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="py-8 border border-dashed border-black/5 rounded-2xl text-center">
               <span className="text-[8px] font-black uppercase text-slate-300">Vazio</span>
            </div>
          )}
       </div>
    </div>
  );
}

function ApprovalItem({ title, agent, type, time }: any) {
  return (
    <div className="titan-card p-8 bg-[#F8FAF8] border-black/5 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-[#304930]/20 transition-all">
       <div className="flex items-center gap-6">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-black/5 group-hover:scale-110 transition-transform">
             <Sparkles className="w-6 h-6 text-[#D6B799]" />
          </div>
          <div>
             <h4 className="text-lg font-bold text-[#304930]">{title}</h4>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Gatilhada por {agent} • {time}</p>
          </div>
       </div>
       
       <div className="flex gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-8 py-3 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 border border-black/5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Rejeitar</button>
          <button className="flex-1 md:flex-none px-10 py-3 bg-[#304930] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#304930]/10 hover:scale-105 transition-all">Aprovar Execução</button>
       </div>
    </div>
  );
}
