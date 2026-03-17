export const dynamic = 'force-dynamic';

import React from 'react';
import { 
  MessageCircle, 
  Smartphone, 
  Zap, 
  Settings, 
  History, 
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  ToggleLeft as Toggle,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RoboPage() {
  const automations = [
    { title: 'Boas-vindas', description: 'Envia mensagem fofa ao primeiro contato.', active: true, usage: '842 envios' },
    { title: 'Carrinho Abandonado', description: 'Recupera vendas após 2h de inatividade.', active: true, usage: '128 recuperações' },
    { title: 'Status de Produção', description: 'Atualiza o cliente em cada fase artística.', active: true, usage: '2.4k avisos' },
    { title: 'Pós-Venda (7 dias)', description: 'Pede feedback e envia guia de cuidados.', active: false, usage: '0 envios' },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif text-[#304930]">Centro de Mensageria</h1>
          <p className="text-sm text-slate-500 font-medium">Automação de atendimento e fluxo de fidelização via WhatsApp.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-3 px-6 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">Bot Conectado</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
         {/* Device Status */}
         <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="titan-card p-10 flex flex-col items-center text-center">
               <div className="relative mb-8">
                  <div className="w-40 h-40 rounded-full border-4 border-[#304930]/5 flex items-center justify-center bg-white shadow-xl relative overflow-hidden">
                     <Smartphone className="w-16 h-16 text-[#304930]" />
                     <div className="absolute inset-0 bg-gradient-to-tr from-[#304930]/5 to-transparent" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-3 rounded-full shadow-lg border-4 border-white">
                     <ShieldCheck className="w-6 h-6" />
                  </div>
               </div>
               
               <h3 className="text-xl font-bold text-[#304930] mb-2">WhatsApp Pessoal</h3>
               <p className="text-xs font-medium text-slate-400 mb-8">+55 (11) 9****-**42</p>
               
               <div className="grid grid-cols-2 gap-4 w-full">
                  <button className="py-4 bg-[#304930]/5 text-[#304930] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#304930]/10 transition-all">Sincronizar</button>
                  <button className="py-4 bg-rose-50 text-rose-500 border border-rose-100 rounded-2xl text-[10px] font-black uppercase tracking-widest">Desconectar</button>
               </div>
            </div>

            <div className="titan-card p-8 space-y-6">
               <h3 className="text-xs font-black text-[#304930] uppercase tracking-widest flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Configurações do Robô
               </h3>
               <div className="space-y-4">
                  <ConfigToggle label="Atraso humano (Random delay)" active />
                  <ConfigToggle label="Responder fora de horário" active={false} />
                  <ConfigToggle label="Uso IA no atendimento" active />
               </div>
            </div>
         </div>

         {/* Automations Control */}
         <div className="col-span-12 lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
               <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#304930]">Automações de Relacionamento</h3>
               <button className="text-[10px] font-black uppercase tracking-widest text-[#304930] flex items-center gap-2">
                  Nova Automação <Zap className="w-4 h-4 text-[#D6B799]" />
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {automations.map((item, idx) => (
                 <div key={idx} className="titan-card p-8 group hover:border-[#304930]/30 transition-all">
                    <div className="flex justify-between items-start mb-6">
                       <div className={cn(
                          "p-3 rounded-2xl border transition-all",
                          item.active ? "bg-[#304930] text-white" : "bg-slate-50 text-slate-300 border-black/5"
                       )}>
                          <Zap className="w-5 h-5" />
                       </div>
                       <button className={cn(
                          "px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border",
                          item.active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                       )}>
                          {item.active ? 'Ativo' : 'Pausado'}
                       </button>
                    </div>

                    <h4 className="text-lg font-bold text-[#304930] mb-2">{item.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-8">{item.description}</p>

                    <div className="flex items-center justify-between pt-6 border-t border-black/5">
                       <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase">
                          <CheckCircle2 className="w-3 h-3" /> {item.usage}
                       </div>
                       <button className="p-2 text-slate-300 hover:text-[#304930] transition-colors">
                          <Settings className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
               ))}
            </div>

            {/* Recent Activity */}
            <div className="titan-card p-0 overflow-hidden">
               <div className="px-8 py-6 border-b border-black/5 flex justify-between items-center">
                  <h3 className="text-xs font-black text-[#304930] uppercase tracking-widest flex items-center gap-2">
                     <History className="w-4 h-4" /> Logs Recentes
                  </h3>
                  <button className="text-[10px] font-black uppercase text-[#304930]/40">Ver Tudo</button>
               </div>
               <div className="divide-y divide-black/5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="px-8 py-6 flex items-center justify-between group hover:bg-[#304930]/5 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center text-[#304930]">
                             <MessageCircle className="w-4 h-4" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-[#304930] uppercase mb-1">Status Enviado: Pintura</p>
                             <p className="text-xs text-slate-400 font-medium">Cliente: Mariana Souza • pedido #9283</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <span className="text-[10px] font-black text-slate-300 uppercase">Há 4 min</span>
                          <button className="p-2 text-slate-300 group-hover:text-[#304930] transition-colors"><ArrowUpRight className="w-4 h-4" /></button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function ConfigToggle({ label, active }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#F8FAF8] rounded-2xl border border-black/5">
       <span className="text-xs font-bold text-[#304930]">{label}</span>
       <button className={cn(
          "w-12 h-6 rounded-full relative transition-all",
          active ? "bg-[#304930]" : "bg-slate-200"
       )}>
          <div className={cn(
             "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
             active ? "right-1" : "left-1"
          )} />
       </button>
    </div>
  );
}
