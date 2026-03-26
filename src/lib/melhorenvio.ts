import { supabase } from "@/integrations/supabase/client";

export interface ShippingOption {
  id: string | number;
  name: string;
  company: string;
  price: number;
  delivery_time: number;
  currency: string;
  logo?: string;
}

interface ShippingProduct {
  id: string;
  quantity: number;
  price: number;
  weight?: number;
  width?: number;
  height?: number;
  length?: number;
  insurance_value?: number;
}

interface CalculateShippingInput {
  postal_code: string;
  products: ShippingProduct[];
}

/**
 * Gera estimativas realistas como fallback quando a API do Melhor Envio não responde.
 * Preços baseados em taça de cristal (fragil, pequena) para diferentes regiões.
 */
function generateFallbackOptions(cep: string): ShippingOption[] {
  const prefix = parseInt(cep.substring(0, 3));
  // BA = 40000-48999
  const isLocal = prefix >= 400 && prefix <= 489;
  // Sudeste SP/RJ/MG = 01000-39999
  const isSudeste = prefix < 400;

  const basePrice = isLocal ? 12 : isSudeste ? 22 : 28;

  return [
    {
      id: "sedex",
      name: "SEDEX",
      company: "Correios",
      price: parsedPrice(basePrice * 1.8),
      delivery_time: isLocal ? 2 : isSudeste ? 3 : 5,
      currency: "BRL",
    },
    {
      id: "pac",
      name: "PAC",
      company: "Correios",
      price: parsedPrice(basePrice),
      delivery_time: isLocal ? 4 : isSudeste ? 7 : 12,
      currency: "BRL",
    },
    {
      id: "mini",
      name: "SEDEX 10",
      company: "Correios",
      price: parsedPrice(basePrice * 2.5),
      delivery_time: 1,
      currency: "BRL",
    },
  ];
}

function parsedPrice(value: number): number {
  return Math.round(value * 100) / 100;
}

export const calculateShipping = async (
  input: CalculateShippingInput | string,
  legacyItems?: any[]
): Promise<{ options: ShippingOption[]; isFallback?: boolean }> => {
  // Suporte ao formato legado (string, items[])
  let body: any;
  let cep: string;

  if (typeof input === "string") {
    cep = input.replace(/\D/g, "");
    body = {
      postal_code: cep,
      products: (legacyItems || []).map((item: any) => ({
        id: item.product?.id || item.id,
        quantity: item.quantity || 1,
        price: item.product?.price || item.price || 0,
        weight: 0.5,
        width: 15, height: 15, length: 15,
        insurance_value: item.product?.price || item.price || 0,
      })),
    };
  } else {
    cep = input.postal_code.replace(/\D/g, "");
    body = {
      postal_code: cep,
      products: input.products.map((p) => ({
        id: p.id,
        quantity: p.quantity,
        price: p.price,
        weight: p.weight || 0.5,
        width: p.width || 15,
        height: p.height || 15,
        length: p.length || 15,
        insurance_value: p.insurance_value || p.price || 0,
      })),
    };
  }

  console.log("📦 Calculando frete para CEP:", cep);

  try {
    const { data, error } = await supabase.functions.invoke("calculate-shipping", {
      body,
    });

    if (error) throw error;

    const options: ShippingOption[] = (data?.options || []).map((o: any) => ({
      id: o.id,
      name: o.name,
      company: o.company?.name || o.company || "Correios",
      price: parseFloat(o.price) || 0,
      delivery_time: o.delivery_time || o.custom?.estimated_delivery?.week || 7,
      currency: o.currency || "BRL",
      logo: o.company?.picture,
    }));

    if (options.length > 0) {
      return { options };
    }

    // Se veio dados mas sem opções, usa fallback
    console.warn("🔁 Nenhuma opção retornada, usando estimativa");
    return { options: generateFallbackOptions(cep), isFallback: true };

  } catch (err) {
    console.warn("⚠️ Melhor Envio offline, usando estimativa de frete:", err);
    // Fallback: usa estimativas realistas para não travar o checkout
    return { options: generateFallbackOptions(cep), isFallback: true };
  }
};
