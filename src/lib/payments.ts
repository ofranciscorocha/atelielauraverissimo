/**
 * ATELIER LAURA VERISSIMO
 * Funções para gerenciamento de pagamentos
 */

import { supabase } from "@/integrations/supabase/client";

export interface Payment {
  id: string;
  order_id: string;
  status: string;
  payment_method: string;
  gateway: string;
  external_payment_id?: string;
  external_preference_id?: string;
  amount: number;
  currency: string;
  payment_data?: any;
  payer_email?: string;
  payer_name?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  expires_at?: string;
}

/**
 * Criar registro de pagamento
 */
export async function createPayment(data: {
  order_id: string;
  payment_method: string;
  amount: number;
  external_preference_id?: string;
  payer_email?: string;
  payer_name?: string;
}): Promise<{ payment: Payment | null; error: any }> {
  try {
    const { data: paymentData, error } = await supabase
      .from('payments')
      .insert({
        order_id: data.order_id,
        payment_method: data.payment_method,
        gateway: 'mercadopago',
        amount: data.amount,
        currency: 'BRL',
        status: 'pending',
        external_preference_id: data.external_preference_id,
        payer_email: data.payer_email,
        payer_name: data.payer_name,
      })
      .select()
      .single();

    if (error) throw error;

    return { payment: paymentData as Payment, error: null };
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    return { payment: null, error };
  }
}

/**
 * Atualizar status do pagamento
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: string,
  externalPaymentId?: string,
  paymentData?: any
): Promise<{ success: boolean; error: any }> {
  try {
    const updates: any = {
      status,
      payment_data: paymentData,
    };

    if (externalPaymentId) {
      updates.external_payment_id = externalPaymentId;
    }

    if (status === 'approved') {
      updates.paid_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', paymentId);

    if (error) throw error;

    // Se aprovado, atualizar o pedido também
    if (status === 'approved') {
      const { data: payment } = await supabase
        .from('payments')
        .select('order_id')
        .eq('id', paymentId)
        .single();

      if (payment) {
        await supabase
          .from('orders')
          .update({
            status: 'pago',
            paid_at: new Date().toISOString(),
          })
          .eq('id', payment.order_id);
      }
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Erro ao atualizar status do pagamento:', error);
    return { success: false, error };
  }
}

/**
 * Buscar pagamento por ID do pedido
 */
export async function getPaymentByOrderId(orderId: string): Promise<{ payment: Payment | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

    return { payment: data as Payment | null, error: null };
  } catch (error) {
    console.error('Erro ao buscar pagamento:', error);
    return { payment: null, error };
  }
}

/**
 * Buscar pagamento por ID externo (Mercado Pago)
 */
export async function getPaymentByExternalId(externalId: string): Promise<{ payment: Payment | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('external_payment_id', externalId)
      .single();

    if (error) throw error;

    return { payment: data as Payment, error: null };
  } catch (error) {
    console.error('Erro ao buscar pagamento por ID externo:', error);
    return { payment: null, error };
  }
}

/**
 * Processar webhook do Mercado Pago
 */
export async function processPaymentWebhook(webhookData: any): Promise<{ success: boolean; error: any }> {
  try {
    const { type, data } = webhookData;

    if (type === 'payment') {
      const paymentId = data.id;

      // Buscar informações do pagamento no Mercado Pago
      // (Isso seria feito via API do Mercado Pago)
      // Por enquanto, vamos simular a atualização

      const { payment } = await getPaymentByExternalId(paymentId);

      if (payment) {
        await updatePaymentStatus(
          payment.id,
          data.status === 'approved' ? 'approved' : data.status,
          paymentId,
          data
        );
      }
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return { success: false, error };
  }
}

/**
 * Cancelar pagamento
 */
export async function cancelPayment(paymentId: string): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase
      .from('payments')
      .update({ status: 'cancelled' })
      .eq('id', paymentId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Erro ao cancelar pagamento:', error);
    return { success: false, error };
  }
}
