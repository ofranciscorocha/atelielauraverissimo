'use server'

// LAURA VERISSIMO ATELIER - SHIPPING ACTIONS (MELHOR ENVIO)
// Cálculo de frete dinâmico via API Melhor Envio

// ========================================
// TIPOS & INTERFACES
// ========================================

export interface ShippingOption {
  id: number
  name: string
  company: {
    id: number
    name: string
    picture: string
  }
  price: string
  customPrice: string
  discount: string
  currency: string
  deliveryTime: number
  deliveryRange: {
    min: number
    max: number
  }
  packages: Array<{
    price: string
    discount: string
    format: string
    weight: string
    insuranceValue: string
    products: any[]
  }>
}

export interface ShippingCalculateRequest {
  from: {
    postalCode: string
  }
  to: {
    postalCode: string
  }
  package: {
    height: number
    width: number
    length: number
    weight: number
  }
  options?: {
    insuranceValue?: number
    receipt?: boolean
    ownHand?: boolean
  }
}

// ========================================
// CONFIGURAÇÃO MELHOR ENVIO
// ========================================

const MELHOR_ENVIO_API_URL = process.env.MELHOR_ENVIO_API_URL || 'https://melhorenvio.com.br/api/v2/me'
const MELHOR_ENVIO_TOKEN = process.env.MELHOR_ENVIO_TOKEN

// CEP de origem (Laura Verissimo Atelier - Feira de Santana, BA)
const ORIGIN_POSTAL_CODE = process.env.ORIGIN_POSTAL_CODE || '44053-744'

// Dimensões padrão de uma taça (em cm e kg)
const DEFAULT_PACKAGE = {
  height: 20,
  width: 15,
  length: 15,
  weight: 0.5, // 500g
}

// ========================================
// CALCULAR FRETE MELHOR ENVIO
// ========================================

export async function calculateShipping(
  destinationPostalCode: string,
  itemsQuantity: number = 1
): Promise<{ success: boolean; options?: ShippingOption[]; error?: string }> {
  try {
    // Validar CEP
    const cleanCep = destinationPostalCode.replace(/\D/g, '')
    if (cleanCep.length !== 8) {
      return {
        success: false,
        error: 'CEP inválido. Digite um CEP válido com 8 dígitos.',
      }
    }

    // Calcular peso total baseado na quantidade de itens
    const totalWeight = DEFAULT_PACKAGE.weight * itemsQuantity

    // Montar request
    const requestBody: ShippingCalculateRequest = {
      from: {
        postalCode: ORIGIN_POSTAL_CODE,
      },
      to: {
        postalCode: `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`,
      },
      package: {
        ...DEFAULT_PACKAGE,
        weight: totalWeight,
      },
      options: {
        insuranceValue: 100, // Valor do seguro (ajustar conforme necessário)
        receipt: false,
        ownHand: false,
      },
    }

    console.log('[SHIPPING] Calculando frete:', requestBody)

    // Fazer request para API Melhor Envio
    const response = await fetch(`${MELHOR_ENVIO_API_URL}/shipment/calculate`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MELHOR_ENVIO_TOKEN}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[SHIPPING] Erro na API Melhor Envio:', errorText)

      return {
        success: false,
        error: `Erro ao calcular frete: ${response.status} - ${response.statusText}`,
      }
    }

    const data: ShippingOption[] = await response.json()

    console.log('[SHIPPING] Opções recebidas:', data)

    // Filtrar apenas as opções viáveis
    const validOptions = data.filter(
      (option) => option.price && parseFloat(option.price) > 0
    )

    if (validOptions.length === 0) {
      return {
        success: false,
        error: 'Nenhuma opção de frete disponível para este CEP.',
      }
    }

    return {
      success: true,
      options: validOptions,
    }
  } catch (error: any) {
    console.error('[SHIPPING] Erro ao calcular frete:', error)
    return {
      success: false,
      error: error.message || 'Erro inesperado ao calcular frete',
    }
  }
}

// ========================================
// FORMATAR OPÇÃO DE FRETE PARA DISPLAY
// ========================================

export async function formatShippingOption(option: ShippingOption): Promise<{
  id: string
  name: string
  price: number
  deliveryTime: string
  company: string
}> {
  return {
    id: option.id.toString(),
    name: option.name,
    price: parseFloat(option.price),
    deliveryTime: `${option.deliveryRange.min} a ${option.deliveryRange.max} dias úteis`,
    company: option.company.name,
  }
}

// ========================================
// OPÇÕES DE FRETE ESTÁTICAS (FALLBACK)
// ========================================

export async function getStaticShippingOptions(): Promise<
  Array<{
    id: string
    name: string
    price: number
    deliveryTime: string
    company: string
  }>
> {
  return [
    {
      id: 'sedex',
      name: 'SEDEX',
      price: 25.0,
      deliveryTime: '3 a 5 dias úteis',
      company: 'Correios',
    },
    {
      id: 'pac',
      name: 'PAC',
      price: 15.0,
      deliveryTime: '7 a 12 dias úteis',
      company: 'Correios',
    },
    {
      id: 'jadlog',
      name: 'Jadlog Express',
      price: 30.0,
      deliveryTime: '2 a 4 dias úteis',
      company: 'Jadlog',
    },
  ]
}
