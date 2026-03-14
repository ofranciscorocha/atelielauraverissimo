'use client'

// LAURA VERISSIMO ATELIER - CART PROVIDER
// Gerenciamento de Carrinho com Local Storage

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// ========================================
// TIPOS & INTERFACES
// ========================================

export interface CartItem {
  productId: string
  productName: string
  variantId: string
  variantModel: string
  variantColor: string
  variantCapacity: string
  imageUrl: string
  quantity: number
  unitPrice: number
  subtotal: number
  sku: string
}

export interface CartContextType {
  items: CartItem[]
  itemCount: number
  subtotal: number
  shippingFee: number
  total: number
  addItem: (item: Omit<CartItem, 'subtotal'>) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  calculateShipping: () => number
}

// ========================================
// CONTEXT
// ========================================

const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

// ========================================
// PROVIDER
// ========================================

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  // Hidratar do Local Storage (somente no cliente)
  useEffect(() => {
    setMounted(true)
    const savedCart = localStorage.getItem('laura-atelier-cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('[CART] Erro ao carregar carrinho:', error)
      }
    }
  }, [])

  // Salvar no Local Storage sempre que mudar
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('laura-atelier-cart', JSON.stringify(items))
    }
  }, [items, mounted])

  // ========================================
  // ADICIONAR ITEM
  // ========================================

  const addItem = (item: Omit<CartItem, 'subtotal'>) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.variantId === item.variantId)

      if (existingItem) {
        // Atualizar quantidade
        return prevItems.map((i) =>
          i.variantId === item.variantId
            ? {
                ...i,
                quantity: i.quantity + item.quantity,
                subtotal: (i.quantity + item.quantity) * i.unitPrice,
              }
            : i
        )
      }

      // Adicionar novo item
      return [
        ...prevItems,
        {
          ...item,
          subtotal: item.quantity * item.unitPrice,
        },
      ]
    })
  }

  // ========================================
  // REMOVER ITEM
  // ========================================

  const removeItem = (variantId: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.variantId !== variantId))
  }

  // ========================================
  // ATUALIZAR QUANTIDADE
  // ========================================

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId)
      return
    }

    setItems((prevItems) =>
      prevItems.map((i) =>
        i.variantId === variantId
          ? {
              ...i,
              quantity,
              subtotal: quantity * i.unitPrice,
            }
          : i
      )
    )
  }

  // ========================================
  // LIMPAR CARRINHO
  // ========================================

  const clearCart = () => {
    setItems([])
  }

  // ========================================
  // CALCULAR FRETE (Simplificado - fixo por enquanto)
  // ========================================

  const calculateShipping = () => {
    // Frete fixo de R$ 25,00 por enquanto
    // Pode ser expandido para calcular por CEP no futuro
    return items.length > 0 ? 25.0 : 0
  }

  // ========================================
  // MÉTRICAS DO CARRINHO
  // ========================================

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const shippingFee = calculateShipping()
  const total = subtotal + shippingFee

  // ========================================
  // EVITAR HYDRATION MISMATCH
  // ========================================

  if (!mounted) {
    return (
      <CartContext.Provider
        value={{
          items: [],
          itemCount: 0,
          subtotal: 0,
          shippingFee: 0,
          total: 0,
          addItem: () => {},
          removeItem: () => {},
          updateQuantity: () => {},
          clearCart: () => {},
          calculateShipping: () => 0,
        }}
      >
        {children}
      </CartContext.Provider>
    )
  }

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        shippingFee,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        calculateShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
