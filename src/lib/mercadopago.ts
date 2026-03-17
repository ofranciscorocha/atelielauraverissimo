'use server'

// LAURA VERISSIMO ATELIER - MERCADO PAGO INTEGRATION
// Geração de links de pagamento (PIX + Cartão)

const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN
const MERCADO_PAGO_API_URL = 'https://api.mercadopago.com'

export interface MercadoPagoPreferenceItem {
  title: string
  description?: string
  quantity: number
  unit_price: number
  currency_id: string
}

export interface MercadoPagoPreferenceData {
  items: MercadoPagoPreferenceItem[]
  payer?: {
    name?: string
    email?: string
    phone?: {
      area_code?: string
      number?: string
    }
  }
  back_urls?: {
    success?: string
    failure?: string
    pending?: string
  }
  auto_return?: 'approved' | 'all'
  notification_url?: string
  external_reference?: string
  metadata?: Record<string, any>
}

export interface MercadoPagoPreferenceResponse {
  id: string
  init_point: string // URL para abrir o checkout
  sandbox_init_point: string
}

// ========================================
// CRIAR PREFERÊNCIA DE PAGAMENTO
// ========================================

export async function createMercadoPagoPreference(
  data: MercadoPagoPreferenceData
): Promise<{ success: boolean; preference?: MercadoPagoPreferenceResponse; error?: string }> {
  try {
    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      console.error('[MERCADO_PAGO] Access token não configurado')
      return { success: false, error: 'Mercado Pago não configurado' }
    }

    console.log('[MERCADO_PAGO] Criando preferência:', data)

    const response = await fetch(`${MERCADO_PAGO_API_URL}/checkout/preferences`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[MERCADO_PAGO] Erro na API:', response.status, errorText)
      return {
        success: false,
        error: `Erro ao criar link de pagamento: ${response.status}`,
      }
    }

    const preference: MercadoPagoPreferenceResponse = await response.json()

    console.log('[MERCADO_PAGO] Preferência criada:', preference.id)

    return {
      success: true,
      preference,
    }
  } catch (error: any) {
    console.error('[MERCADO_PAGO] Erro ao criar preferência:', error)
    return {
      success: false,
      error: error.message || 'Erro inesperado ao criar link de pagamento',
    }
  }
}

// ========================================
// OBTER INFORMAÇÕES DE UM PAGAMENTO
// ========================================

export async function getMercadoPagoPayment(paymentId: string) {
  try {
    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      return { success: false, error: 'Mercado Pago não configurado' }
    }

    const response = await fetch(`${MERCADO_PAGO_API_URL}/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[MERCADO_PAGO] Erro ao buscar pagamento:', errorText)
      return { success: false, error: 'Erro ao buscar pagamento' }
    }

    const payment = await response.json()

    return {
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
        transaction_amount: payment.transaction_amount,
        payment_method_id: payment.payment_method_id,
        payment_type_id: payment.payment_type_id,
        date_created: payment.date_created,
        date_approved: payment.date_approved,
        payer: payment.payer,
        external_reference: payment.external_reference,
      },
    }
  } catch (error: any) {
    console.error('[MERCADO_PAGO] Erro ao buscar pagamento:', error)
    return { success: false, error: error.message || 'Erro inesperado' }
  }
}

// ========================================
// HELPER: CRIAR LINK DE PAGAMENTO PARA PEDIDO
// ========================================

export async function createPaymentLinkForOrder(orderData: {
  orderId: string
  items: Array<{
    productName: string
    variantModel: string
    quantity: number
    unitPrice: number
  }>
  shippingFee: number
  total: number
  customerName?: string
  customerEmail?: string
  customerPhone?: string
}) {
  try {
    const { orderId, items, shippingFee, total, customerName, customerEmail, customerPhone } = orderData

    // Montar itens do Mercado Pago
    const mpItems: MercadoPagoPreferenceItem[] = items.map((item) => ({
      title: `${item.productName} - ${item.variantModel}`,
      description: `Taça pintada à mão - ${item.variantModel}`,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      currency_id: 'BRL',
    }))

    // Adicionar frete como item separado
    if (shippingFee > 0) {
      mpItems.push({
        title: 'Frete',
        description: 'Envio via Correios/Transportadora',
        quantity: 1,
        unit_price: shippingFee,
        currency_id: 'BRL',
      })
    }

    // URLs de retorno
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://atelielauraverissimo.vercel.app'
    const backUrls = {
      success: `${baseUrl}/pedido/sucesso?order_id=${orderId}`,
      failure: `${baseUrl}/pedido/erro?order_id=${orderId}`,
      pending: `${baseUrl}/pedido/pendente?order_id=${orderId}`,
    }

    // Dados do pagador
    const payer = {
      name: customerName,
      email: customerEmail || 'cliente@atelielauraverissimo.com',
      ...(customerPhone && {
        phone: {
          area_code: customerPhone.replace(/\D/g, '').substring(0, 2),
          number: customerPhone.replace(/\D/g, '').substring(2),
        },
      }),
    }

    // Criar preferência
    const result = await createMercadoPagoPreference({
      items: mpItems,
      payer,
      back_urls: backUrls,
      auto_return: 'approved',
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      external_reference: orderId,
      metadata: {
        order_id: orderId,
        customer_name: customerName,
        total_amount: total,
      },
    })

    if (!result.success || !result.preference) {
      return {
        success: false,
        error: result.error || 'Erro ao criar link de pagamento',
      }
    }

    return {
      success: true,
      paymentLink: result.preference.init_point,
      preferenceId: result.preference.id,
    }
  } catch (error: any) {
    console.error('[MERCADO_PAGO] Erro ao criar link de pagamento:', error)
    return {
      success: false,
      error: error.message || 'Erro inesperado',
    }
  }
}
