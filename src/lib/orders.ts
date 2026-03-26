/**
 * ATELIER LAURA VERISSIMO — Orders
 * Usa tabela: orders (com endereço embutido)
 */
import { supabase } from "@/integrations/supabase/client";

export interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  product_description?: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_whatsapp: string;
  // Endereço embutido
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  // Frete
  shipping_company: string;
  shipping_method: string;
  shipping_price: number;
  shipping_days: number;
  // Pagamento
  payment_method: string;
  payment_status: string;
  mp_preference_id?: string;
  mp_init_point?: string;
  mp_payment_id?: string;
  // Valores
  subtotal: number;
  shipping_total: number;
  total: number;
  // Status
  status: string;
  observations?: string;
  tracking_number?: string;
  is_gift?: boolean;
  gift_recipient_name?: string;
  // Timestamps
  created_at: string;
  updated_at: string;
  paid_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  // Items (join)
  items?: OrderItem[];
  // Campos extras para compatibilidade com Profile
  shipping_cost?: number;
  discount?: number;
  tracking_code?: string;
}

/**
 * Buscar pedidos do usuário logado
 */
export async function getUserOrders(userId: string): Promise<{ orders: Order[]; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const email = user?.email;

    let query = supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false });

    // Busca por user_id OU email (para pedidos feitos antes do login)
    if (userId) {
      query = query.or(`user_id.eq.${userId},customer_email.eq.${email || ''}`);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Normalizar campos para compatibilidade
    const normalized = (data || []).map((o: any) => ({
      ...o,
      shipping_cost: o.shipping_total,
      discount: 0,
      tracking_code: o.tracking_number,
    }));

    return { orders: normalized as Order[], error: null };
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return { orders: [], error };
  }
}

/**
 * Buscar todos os pedidos — Admin
 */
export async function getAllOrders(filters?: { status?: string; limit?: number }): Promise<{ orders: Order[]; error: any }> {
  try {
    let query = supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.limit) query = query.limit(filters.limit);

    const { data, error } = await query;
    if (error) throw error;

    return { orders: data as Order[], error: null };
  } catch (error) {
    console.error('Erro ao buscar todos os pedidos:', error);
    return { orders: [], error };
  }
}

/**
 * Atualizar status do pedido — Admin
 */
export async function updateOrderStatus(orderId: string, newStatus: string): Promise<{ success: boolean; error: any }> {
  try {
    const updates: any = { status: newStatus, updated_at: new Date().toISOString() };
    if (newStatus === 'confirmed') updates.paid_at = new Date().toISOString();
    if (newStatus === 'shipped') updates.shipped_at = new Date().toISOString();
    if (newStatus === 'delivered') updates.delivered_at = new Date().toISOString();

    const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return { success: false, error };
  }
}

/**
 * Adicionar código de rastreamento
 */
export async function addTrackingCode(orderId: string, trackingCode: string): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ tracking_number: trackingCode, status: 'shipped', shipped_at: new Date().toISOString() })
      .eq('id', orderId);
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Estatísticas — Admin
 */
export async function getOrderStats() {
  try {
    const { data, error } = await supabase.from('orders').select('status, total, payment_status');
    if (error) throw error;

    return {
      stats: {
        total_orders: data.length,
        total_revenue: data.filter(o => o.payment_status === 'approved').reduce((s, o) => s + Number(o.total), 0),
        pending_orders: data.filter(o => o.payment_status === 'pending').length,
        in_production: data.filter(o => o.status === 'preparing').length,
        in_transit: data.filter(o => o.status === 'shipped').length,
      },
      error: null,
    };
  } catch (error) {
    return { stats: { total_orders: 0, total_revenue: 0, pending_orders: 0, in_production: 0, in_transit: 0 }, error };
  }
}

/** Subscribe realtime para status do pedido */
export function subscribeToOrderStatus(orderId: string, callback: (order: Partial<Order>) => void) {
  const channel = supabase
    .channel(`order:${orderId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
      (payload) => callback(payload.new as Partial<Order>)
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
