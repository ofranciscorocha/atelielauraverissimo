'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Sparkles, CheckCircle, Package, ArrowRight } from 'lucide-react'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id') || searchParams.get('external_reference')
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          window.location.href = '/'
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <main className="min-h-screen bg-[#F8FAF8] flex items-center justify-center p-6">
      <Navbar />
      <div className="max-w-2xl w-full titan-card p-12 text-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-emerald-100 relative">
          <CheckCircle className="w-16 h-16 text-emerald-600" />
          <div className="absolute -top-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl animate-bounce">
            <Sparkles className="w-6 h-6 text-[#D6B799]" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-serif text-[#304930]">Pagamento Aprovado!</h1>
          <p className="text-2xl text-emerald-600 font-bold">Seu pedido foi confirmado com sucesso ✨</p>
        </div>

        {orderId && (
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-900 mb-2">
              Número do Pedido
            </p>
            <p className="text-2xl font-black text-emerald-700">
              #{orderId.slice(-8).toUpperCase()}
            </p>
          </div>
        )}

        <div className="space-y-4 pt-6">
          <p className="text-lg text-slate-600 leading-relaxed">
            Recebemos a confirmação do seu pagamento! 🎉
          </p>
          <p className="text-slate-500">
            Sua taça personalizada já está na fila de produção. Laura começará a pintar sua obra em breve.
            Você receberá atualizações por WhatsApp durante todo o processo.
          </p>
        </div>

        <div className="grid gap-4 pt-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Próximos Passos</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-4 bg-white p-6 rounded-2xl text-left border border-black/5">
              <Package className="w-6 h-6 text-[#304930] shrink-0 mt-1" />
              <div>
                <p className="text-xs font-black text-[#304930] mb-1">Produção Artesanal</p>
                <p className="text-xs text-slate-500">Sua taça será pintada à mão com todo carinho</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white p-6 rounded-2xl text-left border border-black/5">
              <Sparkles className="w-6 h-6 text-[#D6B799] shrink-0 mt-1" />
              <div>
                <p className="text-xs font-black text-[#304930] mb-1">Envio com Cuidado</p>
                <p className="text-xs text-slate-500">Embalagem especial e código de rastreio</p>
              </div>
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

        <p className="text-xs text-slate-400 pt-4">
          Redirecionando automaticamente em {countdown} segundos...
        </p>
      </div>
    </main>
  )
}

export default function PedidoSucessoPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
