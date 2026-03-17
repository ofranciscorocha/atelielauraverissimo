'use client'

import React, { useState, useEffect } from 'react'
import { ShoppingBag, X, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export function MiniCartPopup() {
  const router = useRouter()
  const [cart, setCart] = useState<any[]>([])
  const [isVisible, setIsVisible] = useState(false)

  // Carregar carrinho do localStorage
  useEffect(() => {
    const loadCart = () => {
      const cartStr = localStorage.getItem('cart')
      const cartData = cartStr ? JSON.parse(cartStr) : []
      setCart(cartData)

      // Mostrar popup apenas se tiver itens
      setIsVisible(cartData.length > 0)
    }

    loadCart()

    // Escutar evento customizado
    const handleCartUpdate = () => loadCart()
    window.addEventListener('cartUpdated', handleCartUpdate)

    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalValue = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleClose = () => {
    setIsVisible(false)
  }

  const handleGoToCheckout = () => {
    router.push('/checkout')
  }

  if (!isVisible || cart.length === 0) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
      >
        <div className="bg-white rounded-[2rem] shadow-2xl border border-black/10 p-6 backdrop-blur-xl">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#304930] flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#304930]/60">
                  Carrinho
                </p>
                <p className="text-lg font-black text-[#304930]">
                  {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-[#304930]/40" />
            </button>
          </div>

          {/* Mini lista de itens */}
          <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
            {cart.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-[#D6B799]" />
                <span className="flex-1 text-[#304930]/70 truncate">
                  {item.quantity}x {item.product.name}
                </span>
                <span className="font-bold text-[#304930]">
                  R$ {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            {cart.length > 3 && (
              <p className="text-xs text-[#304930]/40 text-center pt-2">
                + {cart.length - 3} {cart.length - 3 === 1 ? 'outro item' : 'outros itens'}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-[#304930]/5 rounded-2xl mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#304930]/60">
              Total
            </span>
            <span className="text-2xl font-black text-[#304930]">
              R$ {totalValue.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleGoToCheckout}
            className="w-full bg-[#304930] text-white py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-[#3F5F3F] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
          >
            Ir para Checkout
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
