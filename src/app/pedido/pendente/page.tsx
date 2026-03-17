'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Clock, ArrowRight, Info } from 'lucide-react'
import Link from 'next/link'

function PendingContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id') || searchParams.get('external_reference')

  return (
    <main className="min-h-screen bg-[#F8FAF8] flex items-center justify-center p-6">
      <Navbar />
      <div className="max-w-2xl w-full titan-card p-12 text-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="w-32 h-32 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-amber-100">
          <Clock className="w-16 h-16 text-amber-600 animate-pulse" />
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-serif text-[#304930]">Pagamento Pendente</h1>
          <p className="text-xl text-amber-600 font-bold">Estamos aguardando a confirmação</p>
        </div>

        {orderId && (
          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
            <p className="text-xs font-black uppercase tracking-widest text-amber-900 mb-2">
              Número do Pedido
            </p>
            <p className="text-2xl font-black text-amber-700">
              #{orderId.slice(-8).toUpperCase()}
            </p>
          </div>
        )}

        <div className="space-y-4 pt-6">
          <p className="text-lg text-slate-600 leading-relaxed">
            Seu pedido foi registrado e estamos aguardando a confirmação do pagamento.
          </p>

          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex items-start gap-4 text-left">
            <Info className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
            <div className="space-y-2">
              <p className="text-sm font-bold text-blue-900">Pagamentos que ficam pendentes:</p>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>Boleto bancário (aguardando compensação)</li>
                <li>PIX aguardando confirmação</li>
                <li>Transferência bancária em análise</li>
              </ul>
            </div>
          </div>

          <p className="text-slate-500">
            Assim que o pagamento for confirmado, você receberá uma notificação e sua taça
            entrará na fila de produção. Acompanhe o status do seu pedido na área "Meus Pedidos".
          </p>
        </div>

        <div className="grid gap-4 pt-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tempo Médio de Confirmação</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-black/5">
              <p className="text-xs font-black text-[#304930] mb-1">PIX</p>
              <p className="text-2xl font-black text-[#D6B799]">Instantâneo</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-black/5">
              <p className="text-xs font-black text-[#304930] mb-1">Cartão</p>
              <p className="text-2xl font-black text-[#D6B799]">Minutos</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-black/5">
              <p className="text-xs font-black text-[#304930] mb-1">Boleto</p>
              <p className="text-2xl font-black text-[#D6B799]">1-3 dias</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-8">
          <Link
            href="/"
            className="flex-1 py-6 rounded-[2rem] bg-[#304930] text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-[#3F5F3F] transition-all shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
          >
            Voltar para Início
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/perfil"
            className="flex-1 py-6 rounded-[2rem] border-2 border-[#304930] text-[#304930] font-black text-xs uppercase tracking-[0.2em] hover:bg-[#304930]/5 transition-all flex items-center justify-center gap-3"
          >
            Meus Pedidos
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function PedidoPendentePage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <PendingContent />
    </Suspense>
  )
}
