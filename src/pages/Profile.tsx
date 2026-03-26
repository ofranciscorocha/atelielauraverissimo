/**
 * ATELIER LAURA VERISSIMO — Minha Conta
 * - Meus Pedidos com status realtime
 * - Chat com o Ateliê (realtime)
 * - Meus Dados
 */
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Package, MessageCircle, LogOut, ShoppingBag,
  Clock, CheckCircle, Truck, Star, Send, ChevronLeft,
  Eye, ArrowLeft, Mail, Phone, MapPin, RefreshCw, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { getUserOrders, Order, subscribeToOrderStatus } from "@/lib/orders";
import { getUserMessages, sendMessage, markAllMessagesAsRead, subscribeToMessages, Message } from "@/lib/chat";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Tab = 'pedidos' | 'chat' | 'perfil';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending:           { label: 'Aguardando Pagamento', color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',  icon: Clock },
  processing:        { label: 'Processando Pagamento',color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',    icon: RefreshCw },
  confirmed:         { label: 'Pagamento Confirmado', color: 'text-green-700',  bg: 'bg-green-50 border-green-200',  icon: CheckCircle },
  preparing:         { label: 'Em Produção 🎨',       color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200',icon: Package },
  shipped:           { label: 'Enviado / Em Trânsito',color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200',icon: Truck },
  delivered:         { label: 'Entregue ✓',           color: 'text-green-800',  bg: 'bg-green-100 border-green-300', icon: CheckCircle },
  cancelled:         { label: 'Cancelado',            color: 'text-red-700',    bg: 'bg-red-50 border-red-200',      icon: AlertCircle },
  // legados
  pendente_pagamento:{ label: 'Aguardando Pagamento', color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',  icon: Clock },
  pago:              { label: 'Pago ✓',               color: 'text-green-700',  bg: 'bg-green-50 border-green-200',  icon: CheckCircle },
  em_producao:       { label: 'Em Produção 🎨',       color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200',icon: Package },
  em_transito:       { label: 'Em Trânsito',          color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200',icon: Truck },
  entregue:          { label: 'Entregue ✓',           color: 'text-green-800',  bg: 'bg-green-100 border-green-300', icon: CheckCircle },
  cancelado:         { label: 'Cancelado',            color: 'text-red-700',    bg: 'bg-red-50 border-red-200',      icon: AlertCircle },
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('pedidos');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Badge de mensagens não lidas
  useEffect(() => {
    setUnreadCount(messages.filter(m => m.sender_type === 'atelier' && !m.is_read).length);
  }, [messages]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Você precisa estar logado');
      navigate('/');
      return;
    }

    setUser(session.user);
    await loadProfile(session.user.id);
    await loadOrders(session.user.id);
    await loadMessages(session.user.id);
    setLoading(false);

    // Realtime mensagens
    const unsubMsg = subscribeToMessages(session.user.id, (newMsg) => {
      setMessages(prev => [...prev, newMsg]);
      if (newMsg.sender_type === 'atelier') {
        toast.info('💬 Nova mensagem do Ateliê!');
        setUnreadCount(c => c + 1);
      }
    });

    return () => unsubMsg();
  };

  const loadProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  const loadOrders = async (userId: string) => {
    const { orders: data } = await getUserOrders(userId);
    setOrders(data);

    // Subscribe realtime para cada pedido
    data.forEach(order => {
      subscribeToOrderStatus(order.id, (updated) => {
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, ...updated } : o));
        // Atualiza pedido selecionado também
        setSelectedOrder(prev => prev?.id === order.id ? { ...prev, ...updated } : prev);
        toast.info(`📦 Seu pedido ${order.order_number} foi atualizado!`);
      });
    });
  };

  const loadMessages = async (userId: string) => {
    const { messages: data } = await getUserMessages(userId);
    setMessages(data);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    setSendingMessage(true);
    const { message, error } = await sendMessage({
      user_id: user.id,
      sender_type: 'customer',
      message: newMessage.trim(),
      order_id: selectedOrder?.id,
    });
    if (!error && message) {
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } else {
      toast.error('Erro ao enviar mensagem');
    }
    setSendingMessage(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleTabChange = async (newTab: Tab) => {
    setTab(newTab);
    if (newTab === 'chat' && user) {
      await markAllMessagesAsRead(user.id);
      setUnreadCount(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] to-[#fdf6f0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="mt-4 font-display italic text-primary text-xl">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] via-[#f1f8f1] to-[#fdf6f0]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#304930] to-[#3d5c3d] text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/')} className="hover:scale-110 transition-transform opacity-70 hover:opacity-100">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-display text-lg">
                  {(profile?.full_name || user?.email || '?')[0].toUpperCase()}
                </div>
                <div>
                  <h1 className="text-lg font-display italic">
                    {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Minha Conta'}
                  </h1>
                  <p className="text-xs opacity-60">{user?.email}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-primary/10 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 sm:gap-2">
            {([
              { id: 'pedidos' as Tab, label: 'Meus Pedidos', icon: Package },
              { id: 'chat' as Tab, label: 'Chat com Ateliê', icon: MessageCircle },
              { id: 'perfil' as Tab, label: 'Meus Dados', icon: User },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={`relative flex items-center gap-2 px-3 sm:px-5 py-4 text-sm font-bold transition-colors flex-1 justify-center sm:flex-none sm:justify-start ${
                  tab === id ? 'text-[#304930]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className="relative">
                  <Icon className="w-4 h-4" />
                  {id === 'chat' && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:block text-xs uppercase tracking-wider">{label}</span>
                {tab === id && (
                  <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#304930]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">

          {/* ═══ PEDIDOS ═══ */}
          {tab === 'pedidos' && (
            <motion.div key="pedidos" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {!selectedOrder ? (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-display italic text-[#304930]">Meus Pedidos ({orders.length})</h2>
                  </div>

                  {orders.length === 0 ? (
                    <div className="bg-white/80 rounded-3xl p-16 text-center border border-primary/5">
                      <ShoppingBag className="w-20 h-20 mx-auto text-gray-200 mb-4" />
                      <p className="text-gray-500 font-display text-xl italic mb-2">Nenhum pedido ainda</p>
                      <p className="text-sm text-gray-400 mb-6">Explore nossa coleção e faça seu primeiro pedido!</p>
                      <button onClick={() => navigate('/')} className="px-8 py-3 bg-[#304930] text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#3d5c3d] transition-colors">
                        Ver Coleção
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {orders.map((order) => {
                        const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                        const Icon = cfg.icon;
                        return (
                          <motion.div
                            key={order.id}
                            whileHover={{ y: -2 }}
                            className="bg-white/80 rounded-3xl border border-primary/5 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all"
                            onClick={() => setSelectedOrder(order)}
                          >
                            {/* Status bar */}
                            <div className={`px-6 py-2.5 border-b ${cfg.bg} flex items-center gap-2`}>
                              <Icon className={`w-4 h-4 ${cfg.color}`} />
                              <span className={`text-xs font-black uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                            </div>

                            <div className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <p className="font-bold text-lg text-[#304930]">{order.order_number || `#${order.id.slice(0,8)}`}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {format(new Date(order.created_at), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                                  </p>
                                </div>
                                <p className="text-2xl font-bold text-[#304930]">
                                  R$ {Number(order.total).toFixed(2).replace(".", ",")}
                                </p>
                              </div>

                              {/* Itens (preview) */}
                              {order.items && order.items.length > 0 && (
                                <div className="flex gap-2 mb-4">
                                  {order.items.slice(0, 3).map((item, i) => (
                                    item.product_image ? (
                                      <img key={i} src={item.product_image} alt={item.product_name} className="w-12 h-12 rounded-xl object-cover border border-primary/5" />
                                    ) : (
                                      <div key={i} className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center">
                                        <Package size={16} className="text-primary/30" />
                                      </div>
                                    )
                                  ))}
                                  {order.items.length > 3 && (
                                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary/50 text-xs font-bold">
                                      +{order.items.length - 3}
                                    </div>
                                  )}
                                </div>
                              )}

                              {order.tracking_number && (
                                <div className="flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 rounded-xl px-3 py-2">
                                  <Truck size={14} />
                                  Rastreio: <span className="font-mono">{order.tracking_number}</span>
                                </div>
                              )}

                              <button className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-primary/5 text-primary rounded-2xl text-sm font-bold hover:bg-primary/10 transition-colors">
                                <Eye className="w-4 h-4" /> Ver Detalhes
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <OrderDetail
                  order={selectedOrder}
                  onBack={() => setSelectedOrder(null)}
                  onChat={() => { setSelectedOrder(null); handleTabChange('chat'); }}
                />
              )}
            </motion.div>
          )}

          {/* ═══ CHAT ═══ */}
          {tab === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-white/80 rounded-3xl border border-primary/5 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: 400 }}>
                {/* Header chat */}
                <div className="bg-gradient-to-r from-[#304930] to-[#3d5c3d] text-white p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Ateliê Laura Veríssimo</p>
                    <p className="text-xs opacity-70">Estamos aqui para ajudar! ✨</p>
                  </div>
                </div>

                {/* Mensagens */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#f5faf5]" style={{ height: 'calc(100% - 130px)' }}>
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                      <p className="text-gray-500 text-sm">Nenhuma mensagem ainda</p>
                      <p className="text-xs text-gray-400 mt-2">Envie uma mensagem sobre seu pedido!</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender_type !== 'customer' && (
                          <div className="w-7 h-7 rounded-full bg-[#304930] text-white flex items-center justify-center text-xs font-bold mr-2 self-end mb-1 shrink-0">L</div>
                        )}
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                          msg.sender_type === 'customer'
                            ? 'bg-[#304930] text-white rounded-br-sm'
                            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                          <p className={`text-[10px] mt-1 ${msg.sender_type === 'customer' ? 'text-white/50' : 'text-gray-400'}`}>
                            {format(new Date(msg.created_at), 'HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-gray-100 p-4 bg-white flex items-center gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && !sendingMessage && handleSendMessage()}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#304930]/20"
                    disabled={sendingMessage}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="w-10 h-10 bg-[#304930] text-white rounded-full flex items-center justify-center hover:bg-[#3d5c3d] transition-colors disabled:opacity-40"
                  >
                    {sendingMessage
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Send className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ PERFIL ═══ */}
          {tab === 'perfil' && (
            <motion.div key="perfil" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <h2 className="text-2xl font-display italic text-[#304930]">Meus Dados</h2>

              <div className="bg-white/80 rounded-3xl border border-primary/5 shadow-sm p-6 sm:p-8 space-y-3">
                <InfoRow icon={<Mail className="w-4 h-4" />} label="E-mail" value={user?.email} />
                {profile?.full_name && <InfoRow icon={<User className="w-4 h-4" />} label="Nome" value={profile.full_name} />}
                {profile?.phone && <InfoRow icon={<Phone className="w-4 h-4" />} label="Telefone" value={profile.phone} />}

                {profile?.is_vip && (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200">
                    <Star className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-sm font-bold text-amber-700">Cliente VIP ⭐</p>
                      <p className="text-xs text-amber-600">Total em compras: R$ {Number(profile.total_spent || 0).toFixed(2).replace(".", ",")}</p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-primary/5">
                  <p className="text-xs text-gray-400 mb-1">Total de pedidos</p>
                  <p className="text-3xl font-display italic text-primary">{orders.length}</p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Detalhe do Pedido ────────────────────────────────────────────────────────
function OrderDetail({ order, onBack, onChat }: { order: Order; onBack: () => void; onChat: () => void }) {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  // Progresso visual
  const steps = [
    { key: ['pending', 'pendente_pagamento'], label: 'Aguardando' },
    { key: ['confirmed', 'pago', 'processing'], label: 'Pago' },
    { key: ['preparing', 'em_producao'], label: 'Produção' },
    { key: ['shipped', 'em_transito'], label: 'Enviado' },
    { key: ['delivered', 'entregue'], label: 'Entregue' },
  ];
  const currentStepIdx = steps.findIndex(s => s.key.includes(order.status));

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-primary/60 hover:text-primary transition-colors text-sm font-bold">
        <ChevronLeft className="w-4 h-4" /> Voltar aos Pedidos
      </button>

      {/* Header */}
      <div className="bg-white/80 rounded-3xl border border-primary/5 shadow-sm overflow-hidden">
        <div className={`px-6 py-3 border-b ${cfg.bg} flex items-center gap-2`}>
          <Icon className={`w-5 h-5 ${cfg.color}`} />
          <span className={`text-sm font-black uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display italic text-[#304930]">{order.order_number || `#${order.id.slice(0,8)}`}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
            <p className="text-2xl font-bold text-[#304930]">R$ {Number(order.total).toFixed(2).replace(".", ",")}</p>
          </div>

          {/* Barra de progresso */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-100 mx-6" />
              <div
                className="absolute top-3 left-0 h-0.5 bg-[#304930] mx-6 transition-all duration-1000"
                style={{ width: `${Math.max(0, (currentStepIdx / (steps.length - 1)) * 100)}%` }}
              />
              {steps.map((s, i) => (
                <div key={i} className="flex flex-col items-center z-10 gap-1">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px] font-black transition-all ${
                    i <= currentStepIdx
                      ? 'bg-[#304930] border-[#304930] text-white'
                      : 'bg-white border-gray-200 text-gray-400'
                  }`}>
                    {i < currentStepIdx ? '✓' : i + 1}
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wide ${i <= currentStepIdx ? 'text-[#304930]' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Rastreio */}
          {order.tracking_number && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center gap-3">
              <Truck className="w-5 h-5 text-orange-600 shrink-0" />
              <div>
                <p className="text-xs font-black uppercase text-orange-700 tracking-wider">Código de Rastreamento</p>
                <p className="font-mono font-bold text-orange-900">{order.tracking_number}</p>
              </div>
            </div>
          )}

          {/* Itens */}
          {order.items && order.items.length > 0 && (
            <div className="border-t border-gray-100 py-5 space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-primary/40">Itens do Pedido</p>
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.product_image
                    ? <img src={item.product_image} alt={item.product_name} className="w-14 h-14 rounded-2xl object-cover" />
                    : <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center"><Package size={20} className="text-primary/20" /></div>
                  }
                  <div className="flex-1">
                    <p className="text-sm font-bold text-primary">{item.product_name}</p>
                    <p className="text-xs text-gray-500">Qtd: {item.quantity} × R$ {Number(item.unit_price).toFixed(2).replace(".", ",")}</p>
                  </div>
                  <p className="font-bold text-sm text-primary">R$ {Number(item.total_price).toFixed(2).replace(".", ",")}</p>
                </div>
              ))}
            </div>
          )}

          {/* Resumo financeiro */}
          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>R$ {Number(order.subtotal).toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Frete ({order.shipping_company})</span>
              <span>R$ {Number(order.shipping_total || order.shipping_price).toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-[#304930] pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>R$ {Number(order.total).toFixed(2).replace(".", ",")}</span>
            </div>
          </div>

          {/* Endereço */}
          <div className="mt-5 p-4 bg-primary/5 rounded-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2 flex items-center gap-1.5">
              <MapPin size={12} /> Endereço de Entrega
            </p>
            <p className="text-sm text-primary/70">
              {order.street}, {order.number}{order.complement ? ` - ${order.complement}` : ''}<br />
              {order.neighborhood} — {order.city}/{order.state}<br />
              CEP: {order.cep}
            </p>
          </div>

          {/* Botão chat */}
          <button
            onClick={onChat}
            className="mt-5 w-full flex items-center justify-center gap-2 py-3 border-2 border-primary text-primary rounded-2xl text-sm font-bold hover:bg-primary hover:text-white transition-all"
          >
            <MessageCircle size={16} /> Falar com o Ateliê sobre este pedido
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Row de info ──────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-2xl">
      <div className="text-primary/40">{icon}</div>
      <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{label}</p>
        <p className="text-sm font-medium text-gray-700">{value}</p>
      </div>
    </div>
  );
}
