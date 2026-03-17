import { NextRequest, NextResponse } from 'next/server'
import { getMercadoPagoPayment } from '@/lib/mercadopago'
import { updatePaymentStatus, getPaymentByOrderId, createPayment } from '@/lib/actions/payments.actions'

// POST /api/webhooks/mercadopago
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('[WEBHOOK MERCADO_PAGO] Recebido:', JSON.stringify(body, null, 2))

    // Mercado Pago envia notificações no formato:
    // { action: "payment.created", data: { id: "123456789" }, type: "payment" }
    const { action, data, type } = body

    // Apenas processar notificações de pagamento
    if (type !== 'payment') {
      console.log('[WEBHOOK MERCADO_PAGO] Tipo ignorado:', type)
      return NextResponse.json({ success: true, message: 'Tipo de webhook ignorado' })
    }

    const paymentId = data?.id

    if (!paymentId) {
      console.error('[WEBHOOK MERCADO_PAGO] Payment ID não encontrado')
      return NextResponse.json({ success: false, error: 'Payment ID não encontrado' }, { status: 400 })
    }

    // Buscar informações completas do pagamento no Mercado Pago
    const mpPaymentResult = await getMercadoPagoPayment(paymentId.toString())

    if (!mpPaymentResult.success || !mpPaymentResult.payment) {
      console.error('[WEBHOOK MERCADO_PAGO] Erro ao buscar pagamento:', mpPaymentResult.error)
      return NextResponse.json({ success: false, error: 'Erro ao buscar pagamento' }, { status: 500 })
    }

    const mpPayment = mpPaymentResult.payment

    // Obter external_reference (nosso orderId)
    const orderId = mpPayment.external_reference

    if (!orderId) {
      console.error('[WEBHOOK MERCADO_PAGO] Order ID (external_reference) não encontrado')
      return NextResponse.json({ success: false, error: 'Order ID não encontrado' }, { status: 400 })
    }

    console.log('[WEBHOOK MERCADO_PAGO] Pagamento do pedido:', orderId, 'Status:', mpPayment.status)

    // Buscar pagamento no banco pelo orderId
    const existingPaymentResult = await getPaymentByOrderId(orderId)

    // Se não existe, criar registro de pagamento
    if (!existingPaymentResult.success || !existingPaymentResult.payment) {
      console.log('[WEBHOOK MERCADO_PAGO] Criando novo registro de pagamento')

      await createPayment({
        orderId,
        paymentMethod: mpPayment.payment_type_id === 'credit_card' ? 'MERCADO_PAGO' : 'PIX',
        amount: mpPayment.transaction_amount,
        externalId: paymentId.toString(),
        preferenceId: mpPayment.id?.toString(),
        payerEmail: mpPayment.payer?.email,
        payerName: mpPayment.payer?.first_name || mpPayment.payer?.last_name,
      })
    }

    // Mapear status do Mercado Pago para nosso sistema
    let newStatus: 'PENDENTE' | 'APROVADO' | 'RECUSADO' | 'CANCELADO' | 'ESTORNADO' = 'PENDENTE'

    switch (mpPayment.status) {
      case 'approved':
        newStatus = 'APROVADO'
        break
      case 'rejected':
      case 'cancelled':
        newStatus = 'RECUSADO'
        break
      case 'refunded':
      case 'charged_back':
        newStatus = 'ESTORNADO'
        break
      case 'in_process':
      case 'in_mediation':
      case 'pending':
      case 'authorized':
      default:
        newStatus = 'PENDENTE'
    }

    // Atualizar status do pagamento
    if (existingPaymentResult.success && existingPaymentResult.payment) {
      await updatePaymentStatus(
        existingPaymentResult.payment.id,
        newStatus,
        paymentId.toString()
      )

      console.log('[WEBHOOK MERCADO_PAGO] Pagamento atualizado:', existingPaymentResult.payment.id, '→', newStatus)
    }

    // Enviar notificação por e-mail (futuro)
    if (newStatus === 'APROVADO') {
      console.log('[WEBHOOK MERCADO_PAGO] ✅ Pagamento APROVADO para pedido:', orderId)
      // TODO: Enviar e-mail de confirmação
    }

    return NextResponse.json({
      success: true,
      message: `Webhook processado: ${orderId} → ${newStatus}`,
    })
  } catch (error: any) {
    console.error('[WEBHOOK MERCADO_PAGO] Erro ao processar webhook:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno' },
      { status: 500 }
    )
  }
}

// GET /api/webhooks/mercadopago (para teste)
export async function GET() {
  return NextResponse.json({
    message: 'Webhook Mercado Pago ativo',
    url: '/api/webhooks/mercadopago',
  })
}
