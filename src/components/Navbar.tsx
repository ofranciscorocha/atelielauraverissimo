"use client";

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, Heart, User } from 'lucide-react';
import { brandingConfig } from '@/lib/config';
import { useCart } from '@/contexts/CartContext';

export const Navbar = () => {
  const { itemCount } = useCart();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto frosted-glass rounded-full px-8 py-4 flex justify-between items-center shadow-lg border-whiteShadow">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#304930] rounded-2xl flex items-center justify-center text-white font-serif text-xl border border-white/20 shadow-inner">
            L
          </div>
          <span className="font-serif text-lg font-bold text-[#304930] tracking-tight hidden sm:block">
            {brandingConfig.name}
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-10">
          <Link href="/produtos" className="text-[10px] font-black text-[#304930]/70 hover:text-[#304930] transition-all uppercase tracking-[0.2em]">Cátalogo</Link>
          <Link href="/sob-medida" className="text-[10px] font-black text-[#304930]/70 hover:text-[#304930] transition-all uppercase tracking-[0.2em]">Sob Medida</Link>
          <Link href="/nossa-historia" className="text-[10px] font-black text-[#304930]/70 hover:text-[#304930] transition-all uppercase tracking-[0.2em]">A Laura</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/favoritos" className="p-2.5 text-[#304930] hover:bg-[#304930]/5 rounded-2xl transition-all relative group">
            <Heart className="w-5 h-5 group-hover:scale-110" />
          </Link>
          
          <Link href="/carrinho" className="p-2.5 bg-[#304930]/5 text-[#304930] hover:bg-[#304930] hover:text-white rounded-2xl transition-all relative group">
            <ShoppingBag className="w-5 h-5 group-hover:scale-110" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-in zoom-in">
                {itemCount}
              </span>
            )}
          </Link>

          <Link href="/admin" className="p-2.5 text-[#304930]/40 hover:text-[#304930] transition-all">
             <User className="w-5 h-5" />
          </Link>

          <button className="md:hidden p-2 text-[#304930]">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};
