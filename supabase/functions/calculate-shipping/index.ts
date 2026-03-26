import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: settings } = await supabase
      .from("SystemSettings")
      .select("melhorenvio_token, melhorenvio_sandbox")
      .eq("id", "SETTINGS")
      .single();

    const token = Deno.env.get("MELHOR_ENVIO_TOKEN") || settings?.melhorenvio_token;
    const isSandbox = settings?.melhorenvio_sandbox ?? true;

    if (!token) {
      throw new Error("Melhor Envio token not configured");
    }

    const MELHOR_ENVIO_API = isSandbox 
      ? "https://sandbox.melhorenvio.com.br/api/v2" 
      : "https://www.melhorenvio.com.br/api/v2";

    const { postal_code, products } = await req.json();

    if (!postal_code || !products?.length) {
      return new Response(
        JSON.stringify({ error: "postal_code and products are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = {
      from: { postal_code: "44001370" }, // CEP origem do ateliê
      to: { postal_code: postal_code.replace(/\D/g, "") },
      products: products.map((p: any) => ({
        id: p.id,
        width: p.width || 15,
        height: p.height || 15,
        length: p.length || 15,
        weight: p.weight || 0.5,
        insurance_value: p.insurance_value || p.price || 0,
        quantity: p.quantity || 1,
      })),
    };

    const response = await fetch(`${MELHOR_ENVIO_API}/me/shipment/calculate`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "LauraVerissimoAtelie contato@lauraverissimo.com",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Melhor Envio error:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "Shipping calculation failed", details: data }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter valid options (no errors, with price)
    const options = Array.isArray(data)
      ? data
          .filter((s: any) => !s.error && s.price)
          .map((s: any) => ({
            id: s.id,
            name: s.name,
            company: s.company?.name || s.name,
            price: parseFloat(s.price),
            delivery_time: s.delivery_time,
            currency: s.currency,
          }))
      : [];

    return new Response(JSON.stringify({ options }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
