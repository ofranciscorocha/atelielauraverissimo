/**
 * ATELIER LAURA VERISSIMO — Chat
 * Usa tabela: chat_messages
 */
import { supabase } from "@/integrations/supabase/client";

export interface Message {
  id: string;
  order_id?: string;
  user_id: string;
  sender_type: 'customer' | 'atelier' | 'admin';
  message: string;
  is_read: boolean;
  created_at: string;
}

/** Enviar mensagem */
export async function sendMessage(data: {
  user_id: string;
  order_id?: string;
  sender_type: 'customer' | 'atelier' | 'admin';
  message: string;
}): Promise<{ message: Message | null; error: any }> {
  try {
    const { data: msg, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: data.user_id,
        order_id: data.order_id || null,
        sender_type: data.sender_type === 'admin' ? 'atelier' : data.sender_type,
        message: data.message,
        is_read: false,
      })
      .select()
      .single();

    if (error) throw error;
    return { message: msg as Message, error: null };
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return { message: null, error };
  }
}

/** Buscar mensagens do usuário */
export async function getUserMessages(userId: string): Promise<{ messages: Message[]; error: any }> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { messages: data as Message[], error: null };
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return { messages: [], error };
  }
}

/** Buscar mensagens de um pedido */
export async function getOrderMessages(orderId: string): Promise<{ messages: Message[]; error: any }> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { messages: data as Message[], error: null };
  } catch (error) {
    console.error('Erro ao buscar mensagens do pedido:', error);
    return { messages: [], error };
  }
}

/** Marcar mensagens como lidas */
export async function markAllMessagesAsRead(userId: string, orderId?: string): Promise<{ success: boolean; error: any }> {
  try {
    let query = supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('sender_type', 'atelier');

    if (orderId) query = query.eq('order_id', orderId);

    const { error } = await query;
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

/** Subscribe realtime */
export function subscribeToMessages(userId: string, callback: (message: Message) => void) {
  const channel = supabase
    .channel(`chat:${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `user_id=eq.${userId}` },
      (payload) => callback(payload.new as Message)
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

/** Admin: buscar todas as conversas */
export async function getAdminConversations() {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const map = new Map<string, any>();
    data?.forEach((msg: any) => {
      if (!map.has(msg.user_id)) {
        map.set(msg.user_id, {
          user_id: msg.user_id,
          last_message: msg.message,
          last_message_time: msg.created_at,
          unread_count: msg.sender_type === 'customer' && !msg.is_read ? 1 : 0,
        });
      } else {
        if (msg.sender_type === 'customer' && !msg.is_read) {
          map.get(msg.user_id).unread_count++;
        }
      }
    });

    return { conversations: Array.from(map.values()), error: null };
  } catch (error) {
    return { conversations: [], error };
  }
}
