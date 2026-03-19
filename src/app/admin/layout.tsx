"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, Calendar, ClipboardList, Mail, Settings, 
  Package, ShoppingCart, UserCheck, Wallet, Bot, Home,
  Menu, Bell, ChevronRight, Truck, Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';

const adminNav = [
  { icon: BarChart3, label: 'Analytics', href: '/admin' },
  { icon: Calendar, label: 'Diário & Agenda', href: '/admin/agenda' },
  { icon: ClipboardList, label: 'Produção', href: '/admin/producao' },
  { icon: ShoppingCart, label: 'Pedidos', href: '/admin/pedidos' },
  { icon: Package, label: 'Produtos', href: '/admin/produtos' },
  { icon: Package, label: 'Estoque', href: '/admin/estoque' },
  { icon: Truck, label: 'Fornecedores', href: '/admin/fornecedores' },
  { icon: Mail, label: 'Marketing', href: '/admin/marketing' },
  { icon: Bot, label: 'Robô Whats', href: '/admin/robo' },
  { icon: Wallet, label: 'Financeiro', href: '/admin/financeiro' },
  { icon: UserCheck, label: 'Ranking Clientes', href: '/admin/clientes' },
  { icon: Settings, label: 'Configurações', href: '/admin/config' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F0F4F0] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-[#304930] text-white flex flex-col fixed h-full z-50">
        <div className="p-8 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 backdrop-blur-md">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-serif text-lg font-bold leading-none">Laura</p>
              <p className="text-[10px] uppercase font-black tracking-widest text-emerald-400 mt-1">Admin Panel</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          {adminNav.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group",
                pathname === item.href 
                  ? "bg-white text-[#304930] shadow-xl" 
                  : "text-emerald-100/60 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-5 h-5", pathname === item.href ? "text-[#304930]" : "group-hover:scale-110 transition-transform")} />
              <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
              {pathname === item.href && (
                <ChevronRight className="w-4 h-4 ml-auto opacity-40" />
              )}
            </Link>
          ))}
        </nav>

        <div className="p-6">
           <Link href="/" className="flex items-center gap-3 px-4 py-4 bg-white/5 rounded-2xl border border-white/10 text-emerald-100/60 hover:text-white transition-colors">
              <Home className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Ver Site Público</span>
           </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72">
        {/* Header */}
        <header className="h-20 border-b border-[#304930]/5 bg-white flex items-center justify-between px-10 sticky top-0 z-40">
           <div className="flex items-center gap-4">
              <div className="md:hidden p-2 bg-[#304930]/5 rounded-xl"><Menu className="w-5 h-5 text-[#304930]" /></div>
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Dashboard / <span className="text-[#304930]">Visão Geral</span></p>
           </div>

           <div className="flex items-center gap-6">
              <div className="relative">
                <Bell className="w-5 h-5 text-slate-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#D6B799] rounded-full border-2 border-white"></span>
              </div>
              <div className="flex items-center gap-3 border-l border-black/5 pl-6">
                 <div className="text-right">
                   <p className="text-[10px] font-black uppercase tracking-widest text-[#304930]">Laura Verissimo</p>
                   <p className="text-[9px] text-slate-400 font-bold uppercase">Administradora</p>
                 </div>
                 <div className="w-10 h-10 bg-[#304930]/10 rounded-full border-2 border-[#304930]/20 flex items-center justify-center overflow-hidden">
                   <div className="w-full h-full bg-[#304930] flex items-center justify-center">L</div>
                 </div>
              </div>
           </div>
        </header>

        <div className="p-10 animate-in fade-in duration-700">
          {children}
        </div>
      </main>
    </div>
  );
}

function CustomPaletteIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.32 2.1-.96.38-.64.44-1.34.42-2.04-.03-1.03.11-2 1.3-2.9 1.1-.8 1.1-2 .1-2.9-1-.9-2.2-.1-3.1-.1s-2-1.1-2-2.1c0-1.1-1.1-2-2.1-2h-3c-1.1 0-2-1.1-2-2.1 0-1.1 1.1-2 2.1-2H12z" />
    </svg>
  );
}
