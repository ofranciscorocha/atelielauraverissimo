import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  product_name: string;
  product_description?: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
}

interface CreateOrderRequest {
  customer: {
    name: string;
    email: string;
    whatsapp: string;
  };
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
  };
  shipping: {
    company: string;
    method: string;
    price: number;
    days: number;
  };
  payment_method: "pix" | "credit_card" | "boleto";
  items: OrderItem[];
  observations?: string;
  // FIX: campos de desconto agora aceitos
  coupon_discount?: number;
  pix_discount?: number;
  coupon_code?: string;
  user_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const requestData: CreateOrderRequest = await req.json();

    // FIX: calcular total incluindo descontos
    const subtotal = requestData.items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );
    const shipping_total = requestData.shipping.price;
    const coupon_discount = requestData.coupon_discount ?? 0;
    const pix_discount = requestData.pix_discount ?? 0;
    const total = Math.max(0, subtotal + shipping_total - coupon_discount - pix_discount);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: requestData.customer.name,
        customer_email: requestData.customer.email,
        customer_whatsapp: requestData.customer.whatsapp,
        street: requestData.address.street,
        number: requestData.address.number,
        complement: requestData.address.complement,
        neighborhood: requestData.address.neighborhood,
        city: requestData.address.city,
        state: requestData.address.state,
        cep: requestData.address.cep,
        shipping_company: requestData.shipping.company,
        shipping_method: requestData.shipping.method,
        shipping_price: requestData.shipping.price,
        shipping_days: requestData.shipping.days,
        payment_method: requestData.payment_method,
        subtotal,
        shipping_total,
        total,
        observations: requestData.observations,
        // FIX: salvar user_id quando disponível
        user_id: requestData.user_id ?? null,
      })
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    // Create order items
    const orderItems = requestData.items.map((item) => ({
      order_id: order.id,
      product_name: item.product_name,
      product_description: item.product_description,
      product_image: item.product_image,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      throw itemsError;
    }

    // Get MP token from env (SystemSettings is optional/secondary)
    const mpAccessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");

    if (!mpAccessToken) {
      console.warn("MercadoPago access token not configured");
      return new Response(
        JSON.stringify({
          order_id: order.id,
          success: true,
          payment_url: null,
          message: "Pedido criado. Aguardando configuração de pagamento.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // FIX: back_urls usando variável de ambiente (não depende do header Origin)
    const appUrl = Deno.env.get("APP_URL") ?? "https://atelielauraverissimo.com.br";

    const preferenceData = {
      items: requestData.items.map((item) => ({
        title: item.product_name,
        description: item.product_description || "",
        picture_url: item.product_image,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: "BRL",
      })),
      // FIX: incluir descontos na preferência do MP
      ...(coupon_discount > 0 || pix_discount > 0
        ? {
            discounts: [
              {
                name: coupon_discount > 0 ? `Cupom ${requestData.coupon_code ?? ""}` : "Desconto PIX 5%",
                amount: coupon_discount + pix_discount,
              },
            ],
          }
        : {}),
      shipments: {
        cost: requestData.shipping.price,
        mode: "not_specified",
      },
      payer: {
        name: requestData.customer.name,
        email: requestData.customer.email,
        phone: {
          number: requestData.customer.whatsapp,
        },
        address: {
          street_name: requestData.address.street,
          street_number: requestData.address.number,
          zip_code: requestData.address.cep,
        },
      },
      back_urls: {
        success: `${appUrl}/payment/success`,
        failure: `${appUrl}/payment/failure`,
        pending: `${appUrl}/payment/pending`,
      },
      auto_return: "approved",
      external_reference: order.id,
      notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mercadopago-webhook`,
    };

    const mpResponse = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mpAccessToken}`,
        },
        body: JSON.stringify(preferenceData),
      }
    );

    if (!mpResponse.ok) {
      const error = await mpResponse.text();
      console.error("MercadoPago error:", error);
      throw new Error(`MercadoPago API error: ${error}`);
    }

    const preference = await mpResponse.json();

    // Update order with MP data
    await supabase
      .from("orders")
      .update({
        mp_preference_id: preference.id,
        mp_init_point: preference.init_point,
      })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({
        order_id: order.id,
        success: true,
        payment_url: preference.init_point,
        preference_id: preference.id,
        total,
        pix_discount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
