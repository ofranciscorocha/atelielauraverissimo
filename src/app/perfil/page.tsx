'use client'

// LAURA VERISSIMO ATELIER - PROFILE PAGE
// Perfil do Cliente com Pedidos, Chat e Dados

import { useEffect, useState, useCallback } from 'react'
import { getCurrentSession } from '@/lib/actions/auth.actions'
import { getUserOrders } from '@/lib/actions/orders.actions'
import { getUserMessages, sendMessage, markAllUserMessagesAsRead, getUnreadCount } from '@/lib/actions/messages.actions'
import { useRouter } from 'next/navigation'
import { Clock, Package, Truck, CheckCircle, MessageCircle, Send, User, Crown, ShoppingBag, X } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Tab = 'pedidos' | 'chat' | 'dados'

interface Order {
  id: string
  createdAt: Date
  status: string
  productionStatus: string
  subtotal: number
  shippingFee: number
  total: number
  items: any[]
}

interface Message {
  id: string
  createdAt: Date
  senderType: 'CUSTOMER' | 'ADMIN' | 'SYSTEM'
  senderName: string
  content: string
  read: boolean
}

interface SessionData {
  userId: string
  email: string
  name: string
  clientId?: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  AGUARDANDO_PAGAMENTO: { label: 'Aguardando Pagamento', color: 'text-orange-600 bg-orange-50', icon: Clock },
  PAGO: { label: 'Pago', color: 'text-green-600 bg-green-50', icon: CheckCircle },
  EM_PRODUCAO: { label: 'Em Produção', color: 'text-blue-600 bg-blue-50', icon: Package },
  PRONTO_PARA_ENVIO: { label: 'Pronto para Envio', color: 'text-purple-600 bg-purple-50', icon: CheckCircle },
  ENVIADO: { label: 'Enviado', color: 'text-indigo-600 bg-indigo-50', icon: Truck },
  ENTREGUE: { label: 'Entregue', color: 'text-green-700 bg-green-100', icon: CheckCircle },
  CANCELADO: { label: 'Cancelado', color: 'text-red-600 bg-red-50', icon: X },
}

export default function PerfilPage() {
  const router = useRouter()
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('pedidos')

  // Orders state
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Load session
  useEffect(() => {
    async function loadSession() {
      const sessionData = await getCurrentSession()
      if (!sessionData) {
        router.push('/login')
        return
      }
      setSession(sessionData)
      setLoading(false)
    }
    loadSession()
  }, [router])

  // Load orders
  useEffect(() => {
    if (!session) return

    async function loadOrders() {
      try {
        const result = await getUserOrders(session.clientId || '')
        if (result.success && result.orders) {
          setOrders(result.orders as any)
        }
      } catch (error) {
        console.error('Error loading orders:', error)
      }
    }

    if (session.clientId) {
      loadOrders()
    }
  }, [session])

  // Load messages
  useEffect(() => {
    if (!session) return

    async function loadMessages() {
      try {
        const result = await getUserMessages(session.userId)
        if (result.success && result.messages) {
          setMessages(result.messages as any)
        }

        const unreadResult = await getUnreadCount(session.userId)
        if (unreadResult.success) {
          setUnreadCount(unreadResult.count)
        }
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }

    loadMessages()

    // Auto-refresh messages every 10 seconds
    const interval = setInterval(loadMessages, 10000)
    return () => clearInterval(interval)
  }, [session])

  // Mark all messages as read when chat tab is opened
  useEffect(() => {
    if (tab === 'chat' && session && unreadCount > 0) {
      markAllUserMessagesAsRead(session.userId)
      setUnreadCount(0)
    }
  }, [tab, session, unreadCount])

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !session || sendingMessage) return

    setSendingMessage(true)

    try {
      const result = await sendMessage({
        userId: session.userId,
        senderType: 'CUSTOMER',
        senderName: session.name,
        content: newMessage.trim()
      })

      if (result.success && result.message) {
        setMessages(prev => [...prev, result.message as any])
        setNewMessage('')

        // Scroll to bottom
        setTimeout(() => {
          const chatContainer = document.getElementById('chat-messages')
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight
          }
        }, 100)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSendingMessage(false)
    }
  }, [newMessage, session, sendingMessage])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0F4F0] to-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#304930]/20 border-t-[#304930] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#304930] font-medium">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F4F0] to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-t-4 border-[#D6B799]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#304930] to-[#456745] flex items-center justify-center text-white text-2xl font-bold">
              {session.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#304930]">Olá, {session.name}!</h1>
              <p className="text-gray-600">{session.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setTab('pedidos')}
              className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
                tab === 'pedidos'
                  ? 'bg-[#304930] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              Meus Pedidos
            </button>
            <button
              onClick={() => setTab('chat')}
              className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 relative ${
                tab === 'chat'
                  ? 'bg-[#304930] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              Chat com Ateliê
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('dados')}
              className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
                tab === 'dados'
                  ? 'bg-[#304930] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User className="w-5 h-5" />
              Meus Dados
            </button>
          </div>

          <div className="p-8">
            {/* Pedidos Tab */}
            {tab === 'pedidos' && (
              <div>
                <h2 className="text-2xl font-bold text-[#304930] mb-6">Meus Pedidos</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Você ainda não fez nenhum pedido</p>
                    <button
                      onClick={() => router.push('/produtos')}
                      className="bg-[#304930] text-white px-6 py-3 rounded-lg hover:bg-[#456745] transition-colors"
                    >
                      Ver Produtos
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const StatusIcon = STATUS_CONFIG[order.status]?.icon || Clock
                      return (
                        <div
                          key={order.id}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setSelectedOrder(order === selectedOrder ? null : order)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${STATUS_CONFIG[order.status]?.color || 'text-gray-600 bg-gray-50'}`}>
                                  <StatusIcon className="w-4 h-4" />
                                  {STATUS_CONFIG[order.status]?.label || order.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                Pedido em {format(new Date(order.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-[#304930]">
                                R$ {order.total.toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                              </p>
                            </div>
                          </div>

                          {selectedOrder?.id === order.id && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                              <h4 className="font-semibold text-[#304930] mb-3">Itens do Pedido:</h4>
                              <div className="space-y-2">
                                {order.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex justify-between text-sm">
                                    <span>{item.quantity}x {item.productName || 'Produto'}</span>
                                    <span className="font-medium">R$ {item.subtotal.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-4 pt-4 border-t border-gray-100 space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Subtotal:</span>
                                  <span>R$ {order.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Frete:</span>
                                  <span>R$ {order.shippingFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-base text-[#304930] pt-2 border-t">
                                  <span>Total:</span>
                                  <span>R$ {order.total.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Chat Tab */}
            {tab === 'chat' && (
              <div>
                <h2 className="text-2xl font-bold text-[#304930] mb-6">Chat com o Ateliê</h2>
                <div className="bg-gray-50 rounded-lg p-4 h-[500px] flex flex-col">
                  {/* Messages */}
                  <div id="chat-messages" className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhuma mensagem ainda</p>
                        <p className="text-sm text-gray-400 mt-2">Envie uma mensagem para o ateliê!</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isCustomer = msg.senderType === 'CUSTOMER'
                        return (
                          <div key={msg.id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-lg p-4 ${
                              isCustomer
                                ? 'bg-[#304930] text-white'
                                : 'bg-white border border-gray-200'
                            }`}>
                              <p className="text-sm font-medium mb-1">{msg.senderName}</p>
                              <p className="text-sm">{msg.content}</p>
                              <p className="text-xs opacity-70 mt-2">
                                {format(new Date(msg.createdAt), 'HH:mm', { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#304930]"
                      disabled={sendingMessage}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !newMessage.trim()}
                      className="bg-[#304930] text-white px-6 py-3 rounded-lg hover:bg-[#456745] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Dados Tab */}
            {tab === 'dados' && (
              <div>
                <h2 className="text-2xl font-bold text-[#304930] mb-6">Meus Dados</h2>
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-[#D6B799]/10 to-[#304930]/5 rounded-lg p-6 border-l-4 border-[#D6B799]">
                    <div className="flex items-center gap-3 mb-4">
                      <Crown className="w-8 h-8 text-[#D6B799]" />
                      <div>
                        <h3 className="text-lg font-bold text-[#304930]">Status VIP</h3>
                        <p className="text-sm text-gray-600">
                          {orders.length >= 3 ? 'Cliente VIP 💎' : `Faltam ${3 - orders.length} pedidos para VIP`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-[#304930] mb-4">Informações Pessoais</h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-gray-500">Nome</p>
                          <p className="font-medium text-[#304930]">{session.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Email</p>
                          <p className="font-medium text-[#304930]">{session.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-[#304930] mb-4">Estatísticas</h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-gray-500">Total de Pedidos</p>
                          <p className="font-medium text-2xl text-[#304930]">{orders.length}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Valor Total Gasto</p>
                          <p className="font-medium text-2xl text-[#304930]">
                            R$ {orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
