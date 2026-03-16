'use server'

// LAURA VERISSIMO ATELIER - ORDERS WORKFLOW ACTIONS
// Gestão Completa de Pedidos, Status e Workflow de Produção

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { OrderStatus, ProductionStatus } from '@prisma/client'
import { updateClientMetrics } from './crm.actions'
import { registerSaleRevenue } from './finance.actions'
import { reserveStockForOrder } from './inventory.actions'

// ========================================
// TIPOS & INTERFACES
// ========================================

export interface CreateOrderData {
  clientId?: string
  clientData?: {
    name: string
    email: string
    phone: string
    address?: string
  }
  items: Array<{
    productId: string
    variantId: string
    quantity: number
    unitPrice: number
  }>
  shippingFee: number
  specialMessage?: string
  internalNotes?: string
  estimatedProductionDays?: number
}

export interface OrderWithDetails {
  id: string
  createdAt: Date
  status: OrderStatus
  productionStatus: ProductionStatus
  client: {
    id: string
    name: string
    email: string
    phone: string
  }
  items: Array<{
    id: string
    productName: string
    variantModel: string
    variantColor: string
    variantCapacity: string
    quantity: number
    unitPrice: number
    subtotal: number
  }>
  subtotal: number
  shippingFee: number
  total: number
  specialMessage?: string
  estimatedDeliveryDate?: Date
  shippingTrackingCode?: string
}

// ========================================
// CRIAR NOVO PEDIDO
// ========================================

export async function createOrder(data: CreateOrderData) {
  try {
    const { clientId, clientData, items, shippingFee, specialMessage, internalNotes, estimatedProductionDays } = data

    let finalClientId = clientId

    // Se passou dados do cliente em vez de ID, cria ou busca o cliente
    if (!finalClientId && clientData) {
      const existingClient = await prisma.client.findFirst({
        where: { 
          OR: [
            { email: clientData.email },
            { phone: clientData.phone }
          ]
        }
      })

      if (existingClient) {
        finalClientId = existingClient.id
      } else {
        const newClient = await prisma.client.create({
          data: {
            name: clientData.name,
            email: clientData.email,
            phone: clientData.phone,
            address: clientData.address,
            ranking: 'NOVO',
            segment: 'POTENCIAL'
          }
        })
        finalClientId = newClient.id
      }
    }

    if (!finalClientId) {
      return { success: false, error: 'Cliente não identificado' }
    }

    // Calcular subtotal
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const total = subtotal + shippingFee

    // Calcular data estimada de entrega
    const productionDays = estimatedProductionDays || 10
    const estimatedDeliveryDate = new Date()
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + productionDays)

    // Criar pedido
    const order = await prisma.order.create({
      data: {
        clientId: finalClientId,
        status: 'AGUARDANDO_PAGAMENTO',
        productionStatus: 'NAO_INICIADO',
        subtotal,
        shippingFee,
        total,
        estimatedProductionDays: productionDays,
        estimatedDeliveryDate,
        specialMessage,
        internalNotes,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        client: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    })

    revalidatePath('/admin/pedidos')
    return { success: true, order }
  } catch (error) {
    console.error('[ORDERS] Erro ao criar pedido:', error)
    return { success: false, error: 'Erro ao criar pedido' }
  }
}

// ========================================
// ATUALIZAR STATUS DO PEDIDO
// ========================================

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return { success: false, error: 'Pedido não encontrado' }
    }

    // Atualizar status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
      },
    })

    // Ações automáticas baseadas no status
    if (newStatus === 'PAGO') {
      // Registrar receita no financeiro
      await registerSaleRevenue(orderId)

      // Iniciar produção automaticamente
      await updateProductionStatus(orderId, 'PREPARO')

      // Reservar estoque
      const items = await prisma.orderItem.findMany({
        where: { orderId },
      })
      await reserveStockForOrder(
        orderId,
        items.map((item) => ({ variantId: item.variantId, quantity: item.quantity }))
      )

      // Atualizar métricas do cliente
      await updateClientMetrics(order.clientId)
    }

    if (newStatus === 'ENTREGUE') {
      // Atualizar métricas do cliente
      await updateClientMetrics(order.clientId)
    }

    revalidatePath('/admin/pedidos')
    return { success: true, order: updatedOrder }
  } catch (error) {
    console.error('[ORDERS] Erro ao atualizar status:', error)
    return { success: false, error: 'Erro ao atualizar status' }
  }
}

// ========================================
// ATUALIZAR STATUS DE PRODUÇÃO
// ========================================

export async function updateProductionStatus(orderId: string, newStatus: ProductionStatus) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        productionStatus: newStatus,
      },
    })

    // Se concluiu produção, mudar status geral para "pronto para envio"
    if (newStatus === 'CONCLUIDO') {
      await updateOrderStatus(orderId, 'PRONTO_PARA_ENVIO')
    }

    revalidatePath('/admin/pedidos')
    revalidatePath('/admin')
    return { success: true, order }
  } catch (error) {
    console.error('[ORDERS] Erro ao atualizar status de produção:', error)
    return { success: false, error: 'Erro ao atualizar status de produção' }
  }
}

// ========================================
// ADICIONAR CÓDIGO DE RASTREAMENTO
// ========================================

export async function addTrackingCode(orderId: string, trackingCode: string) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        shippingTrackingCode: trackingCode,
        status: 'ENVIADO',
      },
    })

    revalidatePath('/admin/pedidos')
    return { success: true, order }
  } catch (error) {
    console.error('[ORDERS] Erro ao adicionar código de rastreamento:', error)
    return { success: false, error: 'Erro ao adicionar código' }
  }
}

// ========================================
// LISTAR PEDIDOS COM FILTROS
// ========================================

export async function getOrders(filters?: {
  status?: OrderStatus
  productionStatus?: ProductionStatus
  clientId?: string
  search?: string
  limit?: number
}) {
  try {
    const where: any = {}

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.productionStatus) {
      where.productionStatus = filters.productionStatus
    }

    if (filters?.clientId) {
      where.clientId = filters.clientId
    }

    if (filters?.search) {
      where.OR = [
        { id: { contains: filters.search } },
        { client: { name: { contains: filters.search, mode: 'insensitive' } } },
      ]
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
            variant: {
              select: {
                model: true,
                color: true,
                capacity: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: filters?.limit || 100,
    })

    return orders.map((order) => ({
      id: order.id,
      createdAt: order.createdAt,
      status: order.status,
      productionStatus: order.productionStatus,
      client: order.client,
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.product.name,
        variantModel: item.variant.model,
        variantColor: item.variant.color,
        variantCapacity: item.variant.capacity,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      })),
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shippingFee),
      total: Number(order.total),
      specialMessage: order.specialMessage,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      shippingTrackingCode: order.shippingTrackingCode,
    }))
  } catch (error) {
    console.error('[ORDERS] Erro ao listar pedidos:', error)
    return []
  }
}

// ========================================
// BUSCAR PEDIDO POR ID
// ========================================

export async function getOrderById(orderId: string): Promise<OrderWithDetails | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
            variant: {
              select: {
                model: true,
                color: true,
                capacity: true,
              },
            },
          },
        },
      },
    })

    if (!order) return null

    return {
      id: order.id,
      createdAt: order.createdAt,
      status: order.status,
      productionStatus: order.productionStatus,
      client: order.client,
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.product.name,
        variantModel: item.variant.model,
        variantColor: item.variant.color,
        variantCapacity: item.variant.capacity,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      })),
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shippingFee),
      total: Number(order.total),
      specialMessage: order.specialMessage || undefined,
      estimatedDeliveryDate: order.estimatedDeliveryDate || undefined,
      shippingTrackingCode: order.shippingTrackingCode || undefined,
    }
  } catch (error) {
    console.error('[ORDERS] Erro ao buscar pedido:', error)
    return null
  }
}

// ========================================
// PEDIDOS EM PRODUÇÃO (Para Timeline)
// ========================================

export async function getOrdersInProduction() {
  try {
    const orders = await getOrders({
      status: 'EM_PRODUCAO',
      limit: 50,
    })

    return orders
  } catch (error) {
    console.error('[ORDERS] Erro ao buscar pedidos em produção:', error)
    return []
  }
}

// ========================================
// CANCELAR PEDIDO
// ========================================

export async function cancelOrder(orderId: string, reason?: string) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELADO',
        internalNotes: reason ? `CANCELADO: ${reason}` : 'CANCELADO',
      },
    })

    // Estornar receita se já foi paga
    const financeEntry = await prisma.financeEntry.findUnique({
      where: { orderId },
    })

    if (financeEntry) {
      await prisma.financeEntry.delete({
        where: { orderId },
      })
    }

    // Atualizar métricas do cliente
    await updateClientMetrics(order.clientId)

    revalidatePath('/admin/pedidos')
    return { success: true, order }
  } catch (error) {
    console.error('[ORDERS] Erro ao cancelar pedido:', error)
    return { success: false, error: 'Erro ao cancelar pedido' }
  }
}

// ========================================
// ATUALIZAR OBSERVAÇÕES INTERNAS
// ========================================

export async function updateOrderNotes(orderId: string, notes: string) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        internalNotes: notes,
      },
    })

    revalidatePath('/admin/pedidos')
    return { success: true, order }
  } catch (error) {
    console.error('[ORDERS] Erro ao atualizar observações:', error)
    return { success: false, error: 'Erro ao atualizar observações' }
  }
}

// ========================================
// OBTER PEDIDOS DO CLIENTE (BY CLIENT ID)
// ========================================

export async function getUserOrders(clientId: string) {
  try {
    if (!clientId) {
      return { success: true, orders: [] }
    }

    const orders = await prisma.order.findMany({
      where: { clientId },
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        },
        client: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return {
      success: true,
      orders: orders.map(order => ({
        id: order.id,
        createdAt: order.createdAt,
        status: order.status,
        productionStatus: order.productionStatus,
        subtotal: order.subtotal.toNumber(),
        shippingFee: order.shippingFee.toNumber(),
        total: order.total.toNumber(),
        estimatedDeliveryDate: order.estimatedDeliveryDate,
        shippingTrackingCode: order.shippingTrackingCode,
        items: order.items.map(item => ({
          id: item.id,
          productName: item.product.name,
          variantModel: item.variant.model,
          variantColor: item.variant.color,
          variantCapacity: item.variant.capacity,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toNumber(),
          subtotal: item.subtotal.toNumber()
        }))
      }))
    }
  } catch (error) {
    console.error('Get user orders error:', error)
    return { success: false, error: 'Erro ao buscar pedidos', orders: [] }
  }
}
