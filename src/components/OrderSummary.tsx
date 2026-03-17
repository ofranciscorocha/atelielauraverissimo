'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Tag } from 'lucide-react'

interface CartItem {
  product: {
    id: string
    name: string
  }
  variant: {
    id: string
    model: string
    color: string
    capacity: string
  }
  quantity: number
  price: number
}

interface OrderSummaryProps {
  cart: CartItem[]
  shippingCost: number
  shippingMethod?: string
  discount?: number
}

export function OrderSummary({ cart, shippingCost, shippingMethod, discount = 0 }: OrderSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const total = subtotal + shippingCost - discount

  return (
    <div className="bg-white rounded-3xl border border-black/5 overflow-hidden sticky top-32">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#304930]/60">
            {isExpanded ? 'Ocultar' : 'Ver'} detalhes
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-2xl font-black text-[#304930]">
            R$ {total.toFixed(2).replace('.', ',')}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-[#304930]/60" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#304930]/60" />
          )}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-6">
          {/* Items */}
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {cart.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#304930]/10 to-[#D4AF37]/10 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-[#304930] truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-xs text-[#304930]/60 mt-1">
                    {item.variant.color} • {item.variant.capacity}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-[#304930]/60">
                      Qtd: {item.quantity}
                    </span>
                    <span className="font-bold text-sm text-[#304930]">
                      R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="pt-6 border-t border-black/5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#304930]/60">Subtotal</span>
              <span className="font-bold text-[#304930]">
                R$ {subtotal.toFixed(2).replace('.', ',')}
              </span>
            </div>

            {shippingMethod && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#304930]/60">
                  Frete ({shippingMethod})
                </span>
                <span className="font-bold text-[#304930]">
                  R$ {shippingCost.toFixed(2).replace('.', ',')}
                </span>
              </div>
            )}

            {discount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-600 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Desconto
                </span>
                <span className="font-bold text-emerald-600">
                  - R$ {discount.toFixed(2).replace('.', ',')}
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-black/5 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#304930]/60">
                Total
              </span>
              <span className="text-3xl font-black text-[#304930]">
                R$ {total.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
