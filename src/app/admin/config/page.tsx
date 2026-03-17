import React from 'react';
import { 
  getAppConfig 
} from '@/lib/actions';
import { 
  Settings, 
  Palette, 
  Image as ImageIcon, 
  Shield, 
  CheckCircle2,
  Bell,
  Smartphone,
  Info,
  Save,
  Truck
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function ConfigPage() {
  const config = await getAppConfig();

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif text-[#304930]">Configurações do Sistema</h1>
          <p className="text-sm text-slate-500 font-medium">Controle de branding, taxas, e regras de negócio.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button className="flex items-center gap-2 bg-[#304930] text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#304930]/10 transition-all hover:scale-105 active:scale-95">
             <Save className="w-4 h-4" />
             Salvar Alterações
           </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
         {/* Navigation Tabs (Conceptual Sidebar for Settings) */}
         <div className="col-span-12 lg:col-span-3 space-y-2">
            <SettingsTab icon={Settings} label="Geral" active />
            <SettingsTab icon={Palette} label="Aparência & Logos" />
            <SettingsTab icon={ImageIcon} label="Banner Home" />
            <SettingsTab icon={Smartphone} label="Canais de Venda" />
            <SettingsTab icon={Truck} label="Frete & Logística" />
            <SettingsTab icon={Shield} label="Segurança" />
         </div>

         {/* Content Area */}
         <div className="col-span-12 lg:col-span-9 space-y-8">
            {/* General Section */}
            <div className="titan-card p-10 bg-white">
               <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#304930] mb-8 border-b border-black/5 pb-4">Identidade da Marca</h3>
               
               <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome do Atelier</label>
                        <input type="text" defaultValue="Laura Verissimo Atelier" className="w-full bg-[#F8FAF8] border border-black/5 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#304930]/20 font-medium" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Moeda Padrão</label>
                        <select className="w-full bg-[#F8FAF8] border border-black/5 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#304930]/20 font-medium">
                           <option>BRL - Real Brasileiro</option>
                           <option>USD - Dólar Americano</option>
                        </select>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Slogan / Headline</label>
                     <input type="text" defaultValue="Arte que brilha, Alma que encanta" className="w-full bg-[#F8FAF8] border border-black/5 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#304930]/20 font-medium" />
                  </div>
               </div>
            </div>

            {/* Design System Preview (Emerald Glass) */}
            <div className="titan-card p-10 bg-[#304930] text-white">
               <div className="flex justify-between items-start mb-10">
                  <div>
                     <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-2">Design System</h3>
                     <p className="text-[10px] text-emerald-100/40 font-black uppercase tracking-widest">Tema: Emerald Glass Premium</p>
                  </div>
                  <div className="flex gap-2">
                     <div className="w-8 h-8 rounded-full bg-[#304930] border border-white/20" />
                     <div className="w-8 h-8 rounded-full bg-[#D6B799]" />
                     <div className="w-8 h-8 rounded-full bg-[#F8FAF8]" />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                     <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-2">Primária</p>
                     <p className="text-xs font-mono">#304930</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                     <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-2">Destaque</p>
                     <p className="text-xs font-mono">#D6B799</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                     <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-2">Fundo</p>
                     <p className="text-xs font-mono">#F8FAF8</p>
                  </div>
               </div>
            </div>

            {/* Business Rules */}
            <div className="titan-card p-10 bg-white">
               <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#304930] mb-8 border-b border-black/5 pb-4">Regras de Produção</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="flex items-start gap-4">
                     <div className="mt-1">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-[#304930]">Estoque Automático</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">Baixar insumos ao criar pedido</p>
                     </div>
                     <div className="ml-auto">
                        <div className="w-10 h-5 bg-emerald-500 rounded-full flex items-center px-1">
                           <div className="w-3 h-3 bg-white rounded-full ml-auto" />
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                     <div className="mt-1">
                        <Bell className="w-5 h-5 text-[#304930]/20" />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-[#304930]">Alertas de Produção</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">Notificar atrasos de 24h+</p>
                     </div>
                     <div className="ml-auto">
                        <div className="w-10 h-5 bg-slate-200 rounded-full flex items-center px-1">
                           <div className="w-3 h-3 bg-white rounded-full" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100 flex gap-4">
               <Info className="w-5 h-5 text-amber-600 shrink-0" />
               <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  Algumas configurações de segurança avançada requerem acesso de nível Administrador Master. 
                  Entre em contato com o suporte técnico para alterações no banco de dados.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

function SettingsTab({ icon: Icon, label, active }: any) {
  return (
    <button className={cn(
      "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all",
      active ? "bg-[#304930] text-white shadow-lg" : "text-[#304930]/40 hover:bg-[#304930]/5 hover:text-[#304930]"
    )}>
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
