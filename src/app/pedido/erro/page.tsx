'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { XCircle, ArrowRight, MessageCircle } from 'lucide-react'
import Link from 'next/link'

function ErrorContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id') || searchParams.get('external_reference')

  const whatsappMsg = `Olá Laura! Tive um problema com o pagamento do pedido ${orderId ? `#${orderId.slice(-8)}` : ''}. Pode me ajudar? 🙏`
  const whatsappNumber = '5524992982442'

  return (
    <main className="min-h-screen bg-[#F8FAF8] flex items-center justify-center p-6">
      <Navbar />
      <div className="max-w-2xl w-full titan-card p-12 text-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="w-32 h-32 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-100">
          <XCircle className="w-16 h-16 text-red-600" />
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-serif text-[#304930]">Ops! Algo deu errado</h1>
          <p className="text-xl text-red-600 font-bold">Não conseguimos processar seu pagamento</p>
        </div>

        <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
          <p className="text-sm text-red-900 leading-relaxed">
            Seu pagamento foi recusado ou cancelado. Isso pode acontecer por diversos motivos:
            limite do cartão, dados incorretos, ou problemas temporários no processamento.
          </p>
        </div>

        <div className="space-y-4 pt-6">
          <p className="text-lg text-slate-600 font-bold">O que você pode fazer:</p>
          <div className="grid gap-4 text-left">
            <div className="flex items-start gap-4 bg-white p-6 rounded-2xl border border-black/5">
              <div className="w-8 h-8 rounded-full bg-[#304930] text-white flex items-center justify-center font-black text-sm shrink-0">
                1
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#304930] mb-1">Tente Novamente</p>
                <p className="text-xs text-slate-500">
                  Volte ao carrinho e tente finalizar o pedido novamente com outro método de pagamento
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white p-6 rounded-2xl border border-black/5">
              <div className="w-8 h-8 rounded-full bg-[#304930] text-white flex items-center justify-center font-black text-sm shrink-0">
                2
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#304930] mb-1">Entre em Contato</p>
                <p className="text-xs text-slate-500">
                  Fale conosco pelo WhatsApp para receber ajuda personalizada
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-8">
          <Link
            href="/carrinho"
            className="flex-1 py-6 rounded-[2rem] bg-[#304930] text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-[#3F5F3F] transition-all shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
          >
            Tentar Novamente
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-6 rounded-[2rem] border-2 border-emerald-600 text-emerald-700 font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-50 transition-all flex items-center justify-center gap-3"
          >
            Falar no WhatsApp
            <MessageCircle className="w-5 h-5" />
          </a>
        </div>

        <Link
          href="/"
          className="inline-block text-sm text-slate-400 hover:text-[#304930] transition-colors underline"
        >
          Voltar para o início
        </Link>
      </div>
    </main>
  )
}

export default function PedidoErroPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ErrorContent />
    </Suspense>
  )
}
