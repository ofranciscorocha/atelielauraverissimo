'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { CheckoutSteps } from '@/components/CheckoutSteps'
import { OrderSummary } from '@/components/OrderSummary'
import { Navbar } from '@/components/Navbar'
import { getRandomPhrase } from '@/lib/motivational-phrases'
import { Shield, Truck, CreditCard, Tag, Gift, Mail } from 'lucide-react'

// Types
interface CartItem {
  product: { id: string; name: string }
  variant: { id: string; model: string; color: string; capacity: string }
  quantity: number
  price: number
}

interface ShippingOption {
  id: string
  name: string
  price: number
  deliveryTime: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<'cart' | 'delivery' | 'payment'>('delivery')
  const [motivationalPhrase, setMotivationalPhrase] = useState('')

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([])

  // Delivery state
  const [isGift, setIsGift] = useState(false)
  const [cep, setCep] = useState('')
  const [loadingCep, setLoadingCep] = useState(false)
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null)
  const [deliveryForm, setDeliveryForm] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    giftMessage: ''
  })

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'pix' | 'boleto' | null>(null)
  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  // Load cart on mount
  useEffect(() => {
    const cartStr = localStorage.getItem('cart')
    if (cartStr) {
      const cartData = JSON.parse(cartStr)
      setCart(cartData)
    }

    if (cartData.length === 0) {
      router.push('/carrinho')
    }
  }, [router])

  // Update motivational phrase when step changes
  useEffect(() => {
    setMotivationalPhrase(getRandomPhrase(currentStep))
  }, [currentStep])

  // Calculate shipping via Melhor Envio
  const calculateShipping = async () => {
    if (cep.length !== 8) return

    setLoadingCep(true)
    try {
      // TODO: Integrate with Melhor Envio API
      // For now, mock data
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockOptions: ShippingOption[] = [
        { id: '1', name: 'Jadlog', price: 37.17, deliveryTime: '5-7 dias úteis' },
        { id: '2', name: 'Correios PAC', price: 25.50, deliveryTime: '8-12 dias úteis' },
        { id: '3', name: 'Correios SEDEX', price: 45.80, deliveryTime: '2-4 dias úteis' },
      ]

      setShippingOptions(mockOptions)
      setSelectedShipping(mockOptions[0])
    } catch (error) {
      console.error('Error calculating shipping:', error)
    } finally {
      setLoadingCep(false)
    }
  }

  // Auto-calculate shipping when CEP is complete
  useEffect(() => {
    if (cep.replace(/\D/g, '').length === 8) {
      calculateShipping()
    }
  }, [cep])

  // Validate email
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Handle delivery form submit
  const handleDeliverySubmit = () => {
    if (!deliveryForm.name || !deliveryForm.email || !deliveryForm.phone) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    if (!isValidEmail(deliveryForm.email)) {
      alert('Por favor, insira um e-mail válido')
      return
    }

    if (!selectedShipping) {
      alert('Por favor, selecione uma opção de frete')
      return
    }

    setCurrentStep('payment')
  }

  // Apply coupon
  const handleApplyCoupon = () => {
    // Mock coupon validation
    if (coupon.toUpperCase() === 'PRIMEIRA') {
      setDiscount(20)
      alert('Cupom aplicado! R$ 20,00 de desconto')
    } else if (coupon.toUpperCase() === 'VIP10') {
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const discountValue = subtotal * 0.1
      setDiscount(discountValue)
      alert(`Cupom aplicado! ${(discountValue).toFixed(2)} de desconto (10%)`)
    } else {
      alert('Cupom inválido')
    }
  }

  // Process Mercado Pago payment
  const handleFinalizePurchase = async () => {
    if (!paymentMethod) {
      alert('Por favor, selecione uma forma de pagamento')
      return
    }

    setIsProcessing(true)

    try {
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const total = subtotal + (selectedShipping?.price || 0) - discount

      // TODO: Integrate with Mercado Pago API
      // Create preference and redirect
      
      // Mock: Simulate payment redirect
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert('Redirecionando para Mercado Pago...')
      // window.location.href = mercadoPagoUrl
      
      // For now, redirect to profile
      router.push('/perfil')
    } catch (error) {
      console.error('Payment error:', error)
      alert('Erro ao processar pagamento. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

