import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * FIX: Verificação de assinatura do Mercado Pago
 * Docs: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
 */
function verifyMPSignature(req: Request, rawBody: string): boolean {
  const secret = Deno.env.get("MERCADOPAGO_WEBHOOK_SECRET");
  // Se não houver secret configurado, pula verificação (backward compat)
  if (!secret) {
    console.warn("MERCADOPAGO_WEBHOOK_SECRET not set — skipping signature check");
    return true;
  }

  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  const url = new URL(req.url);
  const dataId = url.searchParams.get("data.id");

  if (!xSignature) return false;

  // Montar template string conforme documentação do MP
  const parts: string[] = [];
  if (xRequestId) parts.push(`id:${xRequestId}`);
  if (dataId) parts.push(`request-id:${dataId}`);
  parts.push(`ts:${Date.now()}`); // MP inclui timestamp

  // Extrair ts e v1 do header x-signature
  const sigParts: Record<string, string> = {};
  xSignature.split(",").forEach((part) => {
    const [k, v] = part.trim().split("=");
    sigParts[k] = v;
  });

  if (!sigParts.ts || !sigParts.v1) return false;

  const template = `id:${dataId};request-id:${xRequestId};ts:${sigParts.ts};`;
  const hmac = createHmac("sha256", secret);
  hmac.update(template);
  const computed = hmac.digest("hex");

  return computed === sigParts.v1;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();

    // FIX: verificar assinatura antes de processar
    if (!verifyMPSignature(req, rawBody)) {
      console.error("Invalid MercadoPago webhook signature");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = JSON.parse(rawBody);
    console.log("MercadoPago webhook received:", body);

    if (body.type === "payment") {
      const paymentId = body.data.id;
      const mpAccessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");

      if (!mpAccessToken) {
        throw new Error("MercadoPago access token not configured");
      }

      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: { Authorization: `Bearer ${mpAccessToken}` },
        }
      );

      if (!paymentResponse.ok) {
        throw new Error("Failed to fetch payment from MercadoPago");
      }

      const payment = await paymentResponse.json();
      const orderId = payment.external_reference;

      let orderStatus = "pending";
      let paymentStatus = "pending";

      switch (payment.status) {
        case "approved":
          orderStatus = "confirmed";
          paymentStatus = "approved";
          break;
        case "rejected":
        case "cancelled":
          orderStatus = "cancelled";
          paymentStatus = "rejected";
          break;
        case "refunded":
          orderStatus = "cancelled";
          paymentStatus = "refunded";
          break;
        case "in_process":
        case "in_mediation":
          paymentStatus = "processing";
          break;
      }

      const updateData: any = {
        payment_status: paymentStatus,
        status: orderStatus,
        mp_payment_id: paymentId,
      };

      if (payment.status === "approved") {
        updateData.paid_at = new Date().toISOString();
      }

      await supabase.from("orders").update(updateData).eq("id", orderId);

      console.log(`Order ${orderId} updated: ${paymentStatus} / ${orderStatus}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
