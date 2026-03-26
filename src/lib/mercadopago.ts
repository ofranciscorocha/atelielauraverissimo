import { supabase } from "@/integrations/supabase/client";

export const createOrderAndPreference = async (orderData: any) => {
  console.log("Criando pedido → Mercado Pago...", orderData);

  try {
    const { data, error } = await supabase.functions.invoke("create-order", {
      body: orderData,
    });

    if (error) throw error;

    if (!data.success) {
      throw new Error(data.error || "Erro ao criar pedido");
    }

    return {
      order_id: data.order_id,
      payment_url: data.payment_url,        // URL do checkout MP
      init_point: data.payment_url,          // alias para compatibilidade
      preference_id: data.preference_id,
      payment_method: data.payment_method,
      total: data.total,
      pix_discount: data.pix_discount,
    };
  } catch (err) {
    console.error("Erro na integração Mercado Pago:", err);
    throw err;
  }
};
