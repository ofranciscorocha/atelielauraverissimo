'use server'

// LAURA VERISSIMO ATELIER - CRM PERSONA-CENTRIC ACTIONS
// Lógica de Ranking, LTV, Segmentação e Analytics de Clientes

import { prisma } from '@/lib/prisma'
import { ClientRanking, ClientSegment } from '@prisma/client'
import { revalidatePath } from 'next/cache'

// ========================================
// TIPOS & INTERFACES
// ========================================

export interface ClientMetrics {
  totalClients: number
  newClients: number
  recurringClients: number
  atRiskClients: number
  inactiveClients: number
  championClients: number
  averageLTV: number
  averageTicket: number
}

export interface ClientWithMetrics {
  id: string
  name: string
  email: string
  phone: string
  ranking: ClientRanking
  segment: ClientSegment
  lifetimeValue: number
  totalOrders: number
  averageTicket: number
  lastPurchaseAt: Date | null
  createdAt: Date
}

// ========================================
// CÁLCULO AUTOMÁTICO DE RANKING
// ========================================

export async function calculateClientRanking(totalOrders: number): Promise<ClientRanking> {
  if (totalOrders === 1) return 'NOVO'
  if (totalOrders >= 2 && totalOrders <= 3) return 'BRONZE'
  if (totalOrders >= 4 && totalOrders <= 6) return 'PRATA'
  if (totalOrders >= 7 && totalOrders <= 10) return 'OURO'
  if (totalOrders >= 11) return 'PLATINA'
  return 'NOVO'
}

// ========================================
// CÁLCULO AUTOMÁTICO DE SEGMENTAÇÃO
// ========================================

export async function calculateClientSegment(
  totalOrders: number,
  lastPurchaseAt: Date | null,
  lifetimeValue: number
): Promise<ClientSegment> {
  const now = new Date()

  // Cliente sem compras
  if (totalOrders === 0) return 'POTENCIAL'

  // Cliente sem data de última compra (inconsistência)
  if (!lastPurchaseAt) return 'POTENCIAL'

  const daysSinceLastPurchase = Math.floor(
    (now.getTime() - lastPurchaseAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Champion: Alto valor (>R$1000) + alta frequência (<90 dias)
  if (lifetimeValue >= 1000 && daysSinceLastPurchase <= 90) return 'CHAMPION'

  // Recorrente: Comprou nos últimos 90 dias
  if (daysSinceLastPurchase <= 90) return 'RECORRENTE'

  // Em risco: 90-180 dias sem comprar
  if (daysSinceLastPurchase > 90 && daysSinceLastPurchase <= 180) return 'EM_RISCO'

  // Inativo: mais de 180 dias
  return 'INATIVO'
}

// ========================================
// ATUALIZAR MÉTRICAS DE UM CLIENTE
// ========================================

export async function updateClientMetrics(clientId: string) {
  try {
    // Buscar todos os pedidos pagos/concluídos do cliente
    const orders = await prisma.order.findMany({
      where: {
        clientId,
        status: {
          in: ['PAGO', 'EM_PRODUCAO', 'PRONTO_PARA_ENVIO', 'ENVIADO', 'ENTREGUE'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const totalOrders = orders.length
    const lifetimeValue = orders.reduce((sum, order) => sum + Number(order.total), 0)
    const averageTicket = totalOrders > 0 ? lifetimeValue / totalOrders : 0
    const lastPurchaseAt = orders.length > 0 ? orders[0].createdAt : null

    // Calcular ranking e segmento
    const ranking = await calculateClientRanking(totalOrders)
    const segment = await calculateClientSegment(totalOrders, lastPurchaseAt, lifetimeValue)

    // Atualizar cliente
    await prisma.client.update({
      where: { id: clientId },
      data: {
        totalOrders,
        lifetimeValue,
        averageTicket,
        lastPurchaseAt,
        ranking,
        segment,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('[CRM] Erro ao atualizar métricas:', error)
    return { success: false, error: 'Erro ao atualizar métricas do cliente' }
  }
}

// ========================================
// RECALCULAR MÉTRICAS DE TODOS OS CLIENTES
// ========================================

export async function recalculateAllClientsMetrics() {
  try {
    const clients = await prisma.client.findMany()

    for (const client of clients) {
      await updateClientMetrics(client.id)
    }

    revalidatePath('/admin/clientes')
    return { success: true, updated: clients.length }
  } catch (error) {
    console.error('[CRM] Erro ao recalcular métricas:', error)
    return { success: false, error: 'Erro ao recalcular métricas' }
  }
}

// ========================================
// BUSCAR MÉTRICAS GERAIS DO CRM
// ========================================

export async function getCRMMetrics(): Promise<ClientMetrics> {
  try {
    const [
      totalClients,
      newClients,
      recurringClients,
      atRiskClients,
      inactiveClients,
      championClients,
      allClients,
    ] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { segment: 'POTENCIAL' } }),
      prisma.client.count({ where: { segment: 'RECORRENTE' } }),
      prisma.client.count({ where: { segment: 'EM_RISCO' } }),
      prisma.client.count({ where: { segment: 'INATIVO' } }),
      prisma.client.count({ where: { segment: 'CHAMPION' } }),
      prisma.client.findMany({
        select: {
          lifetimeValue: true,
          averageTicket: true,
        },
      }),
    ])

    const totalLTV = allClients.reduce((sum, c) => sum + Number(c.lifetimeValue), 0)
    const totalTicket = allClients.reduce((sum, c) => sum + Number(c.averageTicket), 0)

    return {
      totalClients,
      newClients,
      recurringClients,
      atRiskClients,
      inactiveClients,
      championClients,
      averageLTV: totalClients > 0 ? totalLTV / totalClients : 0,
      averageTicket: totalClients > 0 ? totalTicket / totalClients : 0,
    }
  } catch (error) {
    console.error('[CRM] Erro ao buscar métricas:', error)
    return {
      totalClients: 0,
      newClients: 0,
      recurringClients: 0,
      atRiskClients: 0,
      inactiveClients: 0,
      championClients: 0,
      averageLTV: 0,
      averageTicket: 0,
    }
  }
}

// ========================================
// LISTAR CLIENTES COM MÉTRICAS
// ========================================

export async function getClientsWithMetrics(
  filters?: {
    segment?: ClientSegment
    ranking?: ClientRanking
    search?: string
  }
): Promise<ClientWithMetrics[]> {
  try {
    const where: any = {}

    if (filters?.segment) {
      where.segment = filters.segment
    }

    if (filters?.ranking) {
      where.ranking = filters.ranking
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } },
      ]
    }

    const clients = await prisma.client.findMany({
      where,
      orderBy: {
        lifetimeValue: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        ranking: true,
        segment: true,
        lifetimeValue: true,
        totalOrders: true,
        averageTicket: true,
        lastPurchaseAt: true,
        createdAt: true,
      },
    })

    return clients.map(c => ({
      ...c,
      lifetimeValue: Number(c.lifetimeValue),
      averageTicket: Number(c.averageTicket),
    }))
  } catch (error) {
    console.error('[CRM] Erro ao listar clientes:', error)
    return []
  }
}

// ========================================
// BUSCAR TOP CLIENTES (CHAMPIONS & VIPs)
// ========================================

export async function getTopClients(limit: number = 10) {
  try {
    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { ranking: 'VIP' },
          { ranking: 'PLATINA' },
          { segment: 'CHAMPION' },
        ],
      },
      orderBy: {
        lifetimeValue: 'desc',
      },
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        ranking: true,
        segment: true,
        lifetimeValue: true,
        totalOrders: true,
        styleVibe: true,
      },
    })

    return clients.map(c => ({
      ...c,
      lifetimeValue: Number(c.lifetimeValue),
    }))
  } catch (error) {
    console.error('[CRM] Erro ao buscar top clientes:', error)
    return []
  }
}

// ========================================
// BUSCAR CLIENTES EM RISCO (Para Marketing)
// ========================================

export async function getAtRiskClients() {
  try {
    const clients = await prisma.client.findMany({
      where: {
        segment: 'EM_RISCO',
        whatsappOptIn: true,
      },
      orderBy: {
        lastPurchaseAt: 'asc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        lastPurchaseAt: true,
        lifetimeValue: true,
        styleVibe: true,
      },
    })

    return clients.map(c => ({
      ...c,
      lifetimeValue: Number(c.lifetimeValue),
    }))
  } catch (error) {
    console.error('[CRM] Erro ao buscar clientes em risco:', error)
    return []
  }
}

// ========================================
// CRIAR NOVO CLIENTE
// ========================================

export async function createClient(data: {
  name: string
  email: string
  phone: string
  cpf?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  styleVibe?: string
  emailOptIn?: boolean
  whatsappOptIn?: boolean
}) {
  try {
    const client = await prisma.client.create({
      data: {
        ...data,
        ranking: 'NOVO',
        segment: 'POTENCIAL',
      },
    })

    revalidatePath('/admin/clientes')
    return { success: true, client }
  } catch (error) {
    console.error('[CRM] Erro ao criar cliente:', error)
    return { success: false, error: 'Erro ao criar cliente' }
  }
}

// ========================================
// ATUALIZAR CLIENTE
// ========================================

export async function updateClient(
  clientId: string,
  data: {
    name?: string
    email?: string
    phone?: string
    cpf?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    styleVibe?: string
    notes?: string
    tags?: string[]
    emailOptIn?: boolean
    whatsappOptIn?: boolean
  }
) {
  try {
    const client = await prisma.client.update({
      where: { id: clientId },
      data,
    })

    revalidatePath('/admin/clientes')
    return { success: true, client }
  } catch (error) {
    console.error('[CRM] Erro ao atualizar cliente:', error)
    return { success: false, error: 'Erro ao atualizar cliente' }
  }
}

// ========================================
// PROMOVER CLIENTE PARA VIP (Manual)
// ========================================

export async function promoteClientToVIP(clientId: string) {
  try {
    const client = await prisma.client.update({
      where: { id: clientId },
      data: {
        ranking: 'VIP',
      },
    })

    revalidatePath('/admin/clientes')
    return { success: true, client }
  } catch (error) {
    console.error('[CRM] Erro ao promover cliente:', error)
    return { success: false, error: 'Erro ao promover cliente' }
  }
}
