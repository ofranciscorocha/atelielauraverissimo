'use client'

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { useCart } from '@/contexts/CartContext';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowLeft, 
  ChevronRight,
  ShieldCheck,
  Truck,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function CarrinhoPage() {
  const { items, subtotal, shippingFee, total, updateQuantity, removeItem } = useCart();

  return (
    <main className="min-h-screen bg-[#F8FAF8] pb-20">
      <Navbar />
      
      <section className="pt-32 container mx-auto px-6">
         <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-serif text-[#304930] mb-12">Meu Carrinho</h1>

            <div className="grid grid-cols-12 gap-10">
               {/* Items List */}
               <div className="col-span-12 lg:col-span-8 space-y-6">
                  {items.length > 0 ? (
                    items.map((item) => (
                      <div key={item.variantId} className="titan-card p-6 flex flex-col sm:flex-row items-center gap-8 group">
                         {/* Product Image */}
                         <div className="w-24 h-24 bg-[#304930]/5 rounded-3xl flex-shrink-0 flex items-center justify-center p-4 border border-black/5">
                            <ShoppingBag className="w-10 h-10 text-[#304930]/10" />
                         </div>

                         {/* Details */}
                         <div className="flex-1 text-center sm:text-left">
                            <h3 className="text-lg font-serif text-[#304930] mb-1 uppercase tracking-tight">{item.productName}</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">
                               {item.variantModel} • {item.variantColor} • {item.variantCapacity}
                            </p>
                            
                            <div className="flex items-center justify-center sm:justify-start gap-4">
                               <div className="flex items-center bg-[#F8FAF8] border border-black/5 rounded-full p-1">
                                  <button 
                                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white transition-all text-[#304930]"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-10 text-center text-xs font-black text-[#304930]">{item.quantity}</span>
                                  <button 
                                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white transition-all text-[#304930]"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                               </div>
                               <button 
                                 onClick={() => removeItem(item.variantId)}
                                 className="p-2 text-rose-300 hover:text-rose-500 transition-colors"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                         </div>

                         {/* Price */}
                         <div className="text-right flex flex-col items-center sm:items-end justify-center min-w-[100px]">
                            <p className="text-sm font-black text-[#304930] tracking-tighter">R$ {item.subtotal.toLocaleString('pt-BR')}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">R$ {item.unitPrice.toLocaleString('pt-BR')} cada</p>
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center space-y-8 titan-card border-dashed">
                       <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-black/5">
                          <ShoppingBag className="w-10 h-10 text-[#304930]/10" />
                       </div>
                       <div className="text-center">
                          <h3 className="text-xl font-serif text-[#304930] mb-2">Seu carrinho está vazio.</h3>
                          <p className="text-sm text-slate-400 font-medium">Explore nossas coleções e encontre algo especial.</p>
                       </div>
                       <Link href="/produtos" className="bg-[#304930] text-white px-10 py-5 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-2xl hover:bg-[#3F5F3F] transition-all">
                          Ver Produtos
                       </Link>
                    </div>
                  )}

                  {items.length > 0 && (
                    <Link href="/produtos" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#304930] hover:translate-x-1 transition-all">
                       <ArrowLeft className="w-3 h-3" />
                       Continuar Comprando
                    </Link>
                  )}
               </div>

               {/* Summary */}
               <div className="col-span-12 lg:col-span-4 h-fit">
                  <div className="titan-card p-10 bg-[#304930] text-white">
                     <h2 className="text-xl font-serif mb-8 text-emerald-100 flex items-center gap-3">
                        Resumo do Pedido
                        <ShoppingBag className="w-5 h-5 opacity-40 text-[#D6B799]" />
                     </h2>

                     <div className="space-y-6 mb-10">
                        <div className="flex justify-between items-center text-xs font-black uppercase tracking-[0.2em] text-emerald-100/60">
                           <span>Subtotal</span>
                           <span>R$ {subtotal.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-black uppercase tracking-[0.2em] text-emerald-100/60">
                           <span>Entrega</span>
                           <span>{shippingFee > 0 ? `R$ ${shippingFee.toLocaleString('pt-BR')}` : '--'}</span>
                        </div>
                        <div className="h-[1px] w-full bg-white/10" />
                        <div className="flex justify-between items-center text-lg font-black tracking-tighter text-white">
                           <span>Total</span>
                           <span className="text-[#D6B799]">R$ {total.toLocaleString('pt-BR')}</span>
                        </div>
                     </div>

                     <Link href="/checkout" className={cn(
                       "w-full py-6 rounded-[2rem] bg-white text-[#304930] font-black text-xs uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3 transition-all",
                       items.length === 0 ? "opacity-50 pointer-events-none" : "hover:bg-emerald-50 hover:scale-[1.03] active:scale-95"
                     )}>
                        Finalizar Compra
                        <ChevronRight className="w-5 h-5" />
                     </Link>

                     <div className="mt-10 pt-8 border-t border-white/5 space-y-4">
                        <div className="flex items-center gap-3">
                           <ShieldCheck className="w-4 h-4 text-emerald-400" />
                           <p className="text-[9px] font-black uppercase tracking-widest text-emerald-100/40">Ambiente 100% Seguro</p>
                        </div>
                        <div className="flex items-center gap-3">
                           <CreditCard className="w-4 h-4 text-emerald-400" />
                           <p className="text-[9px] font-black uppercase tracking-widest text-emerald-100/40">Pix, Cartão ou Boleto</p>
                        </div>
                        <div className="flex items-center gap-3">
                           <Truck className="w-4 h-4 text-emerald-400" />
                           <p className="text-[9px] font-black uppercase tracking-widest text-emerald-100/40">Frete especial para frageis</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
    </main>
  );
}
