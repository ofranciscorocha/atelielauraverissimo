'use client'

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { useCart } from '@/contexts/CartContext';
import { createOrder } from '@/lib/actions';
import { 
  ShoppingBag, 
  ChevronRight,
  ShieldCheck,
  CreditCard,
  User,
  MapPin,
  MessageCircle,
  Sparkles,
  Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { items, total, subtotal, shippingFee, clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    observation: ''
  });

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      // Simplificado: criaremos um cliente (ou buscaremos) e o pedido
      const orderData = {
        clientData: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        },
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        total: total,
        paymentMethod: 'WHATSAPP', // Or specify another
      };

      const result = await createOrder(orderData);

      if (result.success) {
        // Enviar para WhatsApp
        const whatsappMsg = `Olá Laura! Gostaria de finalizar meu pedido no Atelier:%0A%0A*Pedido:* %23${result.order.id.slice(-8)}%0A*Cliente:* ${formData.name}%0A*Total:* R$ ${total.toLocaleString('pt-BR')}%0A%0A*Itens:*%0A${items.map(i => `- ${i.quantity}x ${i.productName} (${i.variantModel})`).join('%0A')}%0A%0A*Endereço:* ${formData.address}`;
        
        const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5521999999999';
        
        clearCart();
        window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`, '_blank');
        router.push('/');
      }
    } catch (error) {
       console.error('[CHECKOUT] Erro:', error);
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAF8] pb-20">
      <Navbar />
      
      <section className="pt-32 container mx-auto px-6">
         <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-serif text-[#304930] mb-12">Finalizar Compra</h1>

            <div className="grid grid-cols-12 gap-10">
               {/* Forms Section */}
               <form onSubmit={handleCreateOrder} className="col-span-12 lg:col-span-7 space-y-8">
                  {/* Identification */}
                  <div className="titan-card p-10">
                     <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 bg-[#304930]/5 rounded-xl flex items-center justify-center text-[#304930]">
                           <User className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-serif uppercase tracking-widest text-[#304930]">Identificação</h2>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome Completo</label>
                           <input 
                             required
                             value={formData.name}
                             onChange={(e) => setFormData({...formData, name: e.target.value})}
                             type="text" 
                             placeholder="Como devemos lhe chamar?" 
                             className="w-full bg-[#F8FAF8] border border-black/5 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#304930]/20 transition-all font-medium"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">WhatsApp</label>
                           <input 
                             required
                             value={formData.phone}
                             onChange={(e) => setFormData({...formData, phone: e.target.value})}
                             type="tel" 
                             placeholder="(00) 00000-0000" 
                             className="w-full bg-[#F8FAF8] border border-black/5 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#304930]/20 transition-all font-medium"
                           />
                        </div>
                        <div className="col-span-full space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">E-mail (Opcional)</label>
                           <input 
                             value={formData.email}
                             onChange={(e) => setFormData({...formData, email: e.target.value})}
                             type="email" 
                             placeholder="para acompanhamento do pedido" 
                             className="w-full bg-[#F8FAF8] border border-black/5 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#304930]/20 transition-all font-medium"
                           />
                        </div>
                     </div>
                  </div>

                  {/* Delivery */}
                  <div className="titan-card p-10">
                     <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 bg-[#304930]/5 rounded-xl flex items-center justify-center text-[#304930]">
                           <MapPin className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-serif uppercase tracking-widest text-[#304930]">Entrega</h2>
                     </div>

                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Endereço Completo</label>
                           <textarea 
                             required
                             value={formData.address}
                             onChange={(e) => setFormData({...formData, address: e.target.value})}
                             rows={3}
                             placeholder="Rua, número, bairro, cidade e CEP..." 
                             className="w-full bg-[#F8FAF8] border border-black/5 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#304930]/20 transition-all font-medium resize-none"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Observações da Arte</label>
                           <textarea 
                             value={formData.observation}
                             onChange={(e) => setFormData({...formData, observation: e.target.value})}
                             rows={2}
                             placeholder="Algum detalhe especial para a pintura?" 
                             className="w-full bg-[#F8FAF8] border border-black/5 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#304930]/20 transition-all font-medium resize-none outline-dashed outline-1 outline-black/5"
                           />
                        </div>
                     </div>
                  </div>

                  {/* Payment Info */}
                  <div className="titan-card p-10 bg-[#304930] text-white">
                     <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                           <CreditCard className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h2 className="text-lg font-serif uppercase tracking-widest text-emerald-100">Pagamento & Conclusão</h2>
                     </div>
                     <p className="text-sm text-emerald-100/60 leading-relaxed mb-10">
                        Seu pedido será enviado para o WhatsApp de Laura Verissimo. Lá você poderá combinar a forma de pagamento (Pix ou Link de Cartão) e tirar dúvidas sobre a personalização.
                     </p>
                     
                     <button 
                       type="submit"
                       disabled={isSubmitting || items.length === 0}
                       className={cn(
                        "w-full py-8 rounded-[2.5rem] bg-white text-[#304930] font-black text-xs uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-4 transition-all",
                        isSubmitting ? "opacity-70" : "hover:bg-emerald-50 hover:scale-[1.02] active:scale-95"
                       )}
                     >
                        {isSubmitting ? 'Gerando Pedido...' : 'Finalizar via WhatsApp'}
                        <MessageCircle className="w-6 h-6 text-emerald-600" />
                     </button>
                  </div>
               </form>

               {/* Cart Summary (Review) */}
               <div className="col-span-12 lg:col-span-5">
                  <div className="titan-card h-fit overflow-hidden border-black/5">
                     <div className="p-8 bg-[#F8FAF8] border-b border-black/5">
                        <h3 className="text-sm font-black uppercase tracking-widest text-[#304930]">Resumo da Compra</h3>
                     </div>
                     
                     <div className="p-8 space-y-6 max-h-[400px] overflow-y-auto no-scrollbar">
                        {items.map((item) => (
                           <div key={item.variantId} className="flex gap-4">
                              <div className="w-16 h-16 bg-[#304930]/5 rounded-2xl flex-shrink-0 flex items-center justify-center border border-black/5">
                                 <ShoppingBag className="w-6 h-6 text-[#304930]/10" />
                              </div>
                              <div className="flex-1">
                                 <p className="text-xs font-bold text-[#304930] line-clamp-1">{item.productName}</p>
                                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{item.quantity}x • {item.variantModel}</p>
                                 <p className="text-xs font-black text-[#304930]/60 mt-1">R$ {item.subtotal.toLocaleString('pt-BR')}</p>
                              </div>
                           </div>
                        ))}
                     </div>

                     <div className="p-8 bg-[#F8FAF8] border-t border-black/5 space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                           <span>Subtotal</span>
                           <span>R$ {subtotal.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                           <span>Entrega Estimada</span>
                           <span>R$ {shippingFee.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between items-center text-xl font-black tracking-tighter text-[#304930] pt-2">
                           <span>Total</span>
                           <span className="text-[#D4AF37]">R$ {total.toLocaleString('pt-BR')}</span>
                        </div>
                     </div>

                     <div className="p-8 flex flex-col items-center gap-6">
                         <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#304930]">Checkout Seguro</p>
                         </div>
                         <div className="w-full p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-4">
                            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                            <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                               Sua peça começará a ser produzida assim que o pagamento for confirmado no WhatsApp.
                            </p>
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
