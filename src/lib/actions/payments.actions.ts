'use server'

// LAURA VERISSIMO ATELIER - PAYMENTS ACTIONS
// Gestão de Pagamentos e Rastreamento

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { PaymentMethod, PaymentStatus } from '@prisma/client'
import { updateOrderStatus } from './orders.actions'

// ========================================
// TIPOS
// ========================================

export interface CreatePaymentData {
  orderId: string
  paymentMethod: 'PIX' | 'MERCADO_PAGO' | 'TRANSFERENCIA' | 'DINHEIRO'
  amount: number
  externalId?: string
  preferenceId?: string
  payerEmail?: string
  payerName?: string
  pixQrCode?: string
  pixKey?: string
}

export interface PaymentWithOrder {
  id: string
  createdAt: Date
  paymentMethod: PaymentMethod
  amount: number
  status: PaymentStatus
  externalId?: string | null
  paidAt?: Date | null
  order: {
    id: string
    status: string
    total: number
    client: {
      name: string
      email: string
    }
  }
}

// ========================================
// CRIAR PAGAMENTO
// ========================================

export async function createPayment(data: CreatePaymentData) {
  try {
    const {
      orderId,
      paymentMethod,
      amount,
      externalId,
      preferenceId,
      payerEmail,
      payerName,
      pixQrCode,
      pixKey
    } = data

    // Verifica se pedido existe
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return { success: false, error: 'Pedido não encontrado' }
    }

    // Verifica se já existe pagamento para este pedido
    const existingPayment = await prisma.payment.findUnique({
      where: { orderId }
    })

    if (existingPayment) {
      return { success: false, error: 'Pagamento já registrado para este pedido' }
    }

    // Cria o pagamento
    const payment = await prisma.payment.create({
      data: {
        orderId,
        paymentMethod,
        amount,
        status: 'PENDENTE',
        externalId,
        preferenceId,
        payerEmail,
        payerName,
        pixQrCode,
        pixKey
      }
    })

    revalidatePath('/admin/orders')
    revalidatePath(`/profile`)

    return {
      success: true,
      payment: {
        id: payment.id,
        orderId: payment.orderId,
        paymentMethod: payment.paymentMethod,
        amount: payment.amount.toNumber(),
        status: payment.status
      }
    }
  } catch (error: any) {
    console.error('Create payment error:', error)
    return { success: false, error: 'Erro ao criar pagamento. Tente novamente.' }
  }
}

// ========================================
// ATUALIZAR STATUS DO PAGAMENTO
// ========================================

export async function updatePaymentStatus(
  paymentId: string,
  status: 'PENDENTE' | 'APROVADO' | 'RECUSADO' | 'CANCELADO' | 'ESTORNADO',
  externalId?: string
) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true }
    })

    if (!payment) {
      return { success: false, error: 'Pagamento não encontrado' }
    }

    // Atualiza o pagamento
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        externalId: externalId || payment.externalId,
        paidAt: status === 'APROVADO' ? new Date() : payment.paidAt
      }
    })

    // Se aprovado, atualiza status do pedido
    if (status === 'APROVADO') {
      await updateOrderStatus(payment.orderId, 'PAGO')
    }

    // Se cancelado/recusado, cancela o pedido
    if (status === 'CANCELADO' || status === 'RECUSADO') {
      await updateOrderStatus(payment.orderId, 'CANCELADO')
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/profile`)

    return {
      success: true,
      payment: {
        id: updatedPayment.id,
        status: updatedPayment.status,
        paidAt: updatedPayment.paidAt
      }
    }
  } catch (error) {
    console.error('Update payment status error:', error)
    return { success: false, error: 'Erro ao atualizar status do pagamento' }
  }
}

// ========================================
// OBTER PAGAMENTO POR ID DO PEDIDO
// ========================================

export async function getPaymentByOrderId(orderId: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: {
        order: {
          include: {
            client: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!payment) {
      return { success: false, error: 'Pagamento não encontrado', payment: null }
    }

    return {
      success: true,
      payment: {
        id: payment.id,
        createdAt: payment.createdAt,
        paymentMethod: payment.paymentMethod,
        amount: payment.amount.toNumber(),
        status: payment.status,
        externalId: payment.externalId,
        paidAt: payment.paidAt,
        order: {
          id: payment.order.id,
          status: payment.order.status,
          total: payment.order.total.toNumber(),
          client: {
            name: payment.order.client.name,
            email: payment.order.client.email
          }
        }
      }
    }
  } catch (error) {
    console.error('Get payment by order error:', error)
    return { success: false, error: 'Erro ao buscar pagamento', payment: null }
  }
}

// ========================================
// OBTER PAGAMENTO POR ID EXTERNO (MERCADO PAGO)
// ========================================

export async function getPaymentByExternalId(externalId: string) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { externalId },
      include: {
        order: {
          include: {
            client: true
          }
        }
      }
    })

    if (!payment) {
      return { success: false, error: 'Pagamento não encontrado', payment: null }
    }

    return {
      success: true,
      payment: {
        id: payment.id,
        orderId: payment.orderId,
        paymentMethod: payment.paymentMethod,
        amount: payment.amount.toNumber(),
        status: payment.status,
        externalId: payment.externalId,
        paidAt: payment.paidAt
      }
    }
  } catch (error) {
    console.error('Get payment by external ID error:', error)
    return { success: false, error: 'Erro ao buscar pagamento', payment: null }
  }
}

// ========================================
// PROCESSAR WEBHOOK DO MERCADO PAGO
// ========================================

export async function processMercadoPagoWebhook(data: any) {
  try {
    const { type, action, data: paymentData } = data

    // Apenas processa atualizações de pagamento
    if (type !== 'payment') {
      return { success: true, message: 'Tipo de webhook ignorado' }
    }

    const externalPaymentId = paymentData?.id?.toString()

    if (!externalPaymentId) {
      return { success: false, error: 'ID de pagamento não encontrado no webhook' }
    }

    // Busca pagamento pelo ID externo
    const result = await getPaymentByExternalId(externalPaymentId)

    if (!result.success || !result.payment) {
      console.warn('Pagamento não encontrado para webhook:', externalPaymentId)
      return { success: false, error: 'Pagamento não encontrado' }
    }

    // Mapeia status do Mercado Pago para nosso status
    const mpStatus = paymentData?.status
    let newStatus: PaymentStatus = 'PENDENTE'

    switch (mpStatus) {
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
      default:
        newStatus = 'PENDENTE'
    }

    // Atualiza status do pagamento
    await updatePaymentStatus(result.payment.id, newStatus, externalPaymentId)

    return {
      success: true,
      message: `Pagamento ${result.payment.id} atualizado para ${newStatus}`
    }
  } catch (error) {
    console.error('Process webhook error:', error)
    return { success: false, error: 'Erro ao processar webhook' }
  }
}

// ========================================
// LISTAR TODOS OS PAGAMENTOS
// ========================================

export async function getAllPayments(filters?: {
  status?: PaymentStatus
  paymentMethod?: PaymentMethod
  limit?: number
}) {
  try {
    const { status, paymentMethod, limit = 100 } = filters || {}

    const payments = await prisma.payment.findMany({
      where: {
        ...(status && { status }),
        ...(paymentMethod && { paymentMethod })
      },
      include: {
        order: {
          include: {
            client: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return {
      success: true,
      payments: payments.map(p => ({
        id: p.id,
        createdAt: p.createdAt,
        paymentMethod: p.paymentMethod,
        amount: p.amount.toNumber(),
        status: p.status,
        externalId: p.externalId,
        paidAt: p.paidAt,
        order: {
          id: p.order.id,
          status: p.order.status,
          total: p.order.total.toNumber(),
          client: {
            name: p.order.client.name,
            email: p.order.client.email
          }
        }
      }))
    }
  } catch (error) {
    console.error('Get all payments error:', error)
    return { success: false, error: 'Erro ao buscar pagamentos', payments: [] }
  }
}

// ========================================
// ADICIONAR COMPROVANTE DE PAGAMENTO
// ========================================

export async function addPaymentProof(paymentId: string, proofImageUrl: string) {
  try {
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: { proofImageUrl }
    })

    revalidatePath('/admin/orders')

    return { success: true, payment }
  } catch (error) {
    console.error('Add payment proof error:', error)
    return { success: false, error: 'Erro ao adicionar comprovante' }
  }
}
