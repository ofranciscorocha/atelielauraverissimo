'use server'

// LAURA VERISSIMO ATELIER - DASHBOARD ANALYTICS ACTIONS
// Métricas de Vendas, Produção e Estoque para o Admin

import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

// ========================================
// TIPOS & INTERFACES
// ========================================

export interface DashboardMetrics {
  // Vendas
  totalRevenue: number
  monthlyRevenue: number
  revenueGrowth: number // Percentual vs mês anterior
  totalOrders: number
  monthlyOrders: number

  // Clientes
  totalClients: number
  newClientsThisMonth: number

  // Produção
  ordersInProduction: number
  ordersReadyToShip: number
  ordersShipped: number

  // Estoque
  lowStockItems: number
  totalSupplies: number
}

export interface MonthlyRevenueData {
  month: string
  revenue: number
  orders: number
}

export interface ProductionStatusData {
  status: string
  count: number
  percentage: number
}

export interface TopProduct {
  id: string
  name: string
  totalSold: number
  revenue: number
}

// ========================================
// MÉTRICAS GERAIS DO DASHBOARD
// ========================================

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const now = new Date()
    const startOfThisMonth = startOfMonth(now)
    const endOfThisMonth = endOfMonth(now)
    const startOfLastMonth = startOfMonth(subMonths(now, 1))
    const endOfLastMonth = endOfMonth(subMonths(now, 1))

    // Vendas do mês atual
    const [thisMonthOrders, lastMonthOrders] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: startOfThisMonth,
            lte: endOfThisMonth,
          },
          status: {
            in: ['PAGO', 'EM_PRODUCAO', 'PRONTO_PARA_ENVIO', 'ENVIADO', 'ENTREGUE'],
          },
        },
      }),
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
          status: {
            in: ['PAGO', 'EM_PRODUCAO', 'PRONTO_PARA_ENVIO', 'ENVIADO', 'ENTREGUE'],
          },
        },
      }),
    ])

    const monthlyRevenue = thisMonthOrders.reduce((sum, o) => sum + Number(o.total), 0)
    const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + Number(o.total), 0)
    const revenueGrowth =
      lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

    // Total de vendas (all time)
    const [totalOrdersData, totalClients, newClientsThisMonth] = await Promise.all([
      prisma.order.findMany({
        where: {
          status: {
            in: ['PAGO', 'EM_PRODUCAO', 'PRONTO_PARA_ENVIO', 'ENVIADO', 'ENTREGUE'],
          },
        },
      }),
      prisma.client.count(),
      prisma.client.count({
        where: {
          createdAt: {
            gte: startOfThisMonth,
            lte: endOfThisMonth,
          },
        },
      }),
    ])

    const totalRevenue = totalOrdersData.reduce((sum, o) => sum + Number(o.total), 0)

    // Produção
    const [ordersInProduction, ordersReadyToShip, ordersShipped] = await Promise.all([
      prisma.order.count({
        where: { status: 'EM_PRODUCAO' },
      }),
      prisma.order.count({
        where: { status: 'PRONTO_PARA_ENVIO' },
      }),
      prisma.order.count({
        where: { status: 'ENVIADO' },
      }),
    ])

    // Estoque
    const [lowStockItems, totalSupplies] = await Promise.all([
      prisma.supply.count({
        where: { isLowStock: true },
      }),
      prisma.supply.count(),
    ])

    return {
      totalRevenue,
      monthlyRevenue,
      revenueGrowth,
      totalOrders: totalOrdersData.length,
      monthlyOrders: thisMonthOrders.length,
      totalClients,
      newClientsThisMonth,
      ordersInProduction,
      ordersReadyToShip,
      ordersShipped,
      lowStockItems,
      totalSupplies,
    }
  } catch (error) {
    console.error('[DASHBOARD] Erro ao buscar métricas:', error)
    return {
      totalRevenue: 0,
      monthlyRevenue: 0,
      revenueGrowth: 0,
      totalOrders: 0,
      monthlyOrders: 0,
      totalClients: 0,
      newClientsThisMonth: 0,
      ordersInProduction: 0,
      ordersReadyToShip: 0,
      ordersShipped: 0,
      lowStockItems: 0,
      totalSupplies: 0,
    }
  }
}

// ========================================
// FATURAMENTO POR MÊS (Últimos 6 meses)
// ========================================

export async function getMonthlyRevenue(months: number = 6): Promise<MonthlyRevenueData[]> {
  try {
    const data: MonthlyRevenueData[] = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(now, i)
      const start = startOfMonth(monthDate)
      const end = endOfMonth(monthDate)

      const orders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
          status: {
            in: ['PAGO', 'EM_PRODUCAO', 'PRONTO_PARA_ENVIO', 'ENVIADO', 'ENTREGUE'],
          },
        },
      })

      const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0)

      data.push({
        month: format(monthDate, 'MMM/yy'),
        revenue,
        orders: orders.length,
      })
    }

    return data
  } catch (error) {
    console.error('[DASHBOARD] Erro ao buscar faturamento mensal:', error)
    return []
  }
}

// ========================================
// DISTRIBUIÇÃO DOS STATUS DE PRODUÇÃO
// ========================================

export async function getProductionStatusDistribution(): Promise<ProductionStatusData[]> {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ['EM_PRODUCAO', 'PRONTO_PARA_ENVIO'],
        },
      },
      select: {
        productionStatus: true,
      },
    })

    const total = orders.length

    // Agrupar por status
    const grouped = orders.reduce((acc, order) => {
      const status = order.productionStatus
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Converter para array
    const data = Object.entries(grouped).map(([status, count]) => ({
      status: formatProductionStatus(status),
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))

    return data
  } catch (error) {
    console.error('[DASHBOARD] Erro ao buscar distribuição de produção:', error)
    return []
  }
}

// ========================================
// TOP 10 PRODUTOS MAIS VENDIDOS
// ========================================

export async function getTopProducts(limit: number = 10): Promise<TopProduct[]> {
  try {
    const orderItems = await prisma.orderItem.findMany({
      include: {
        product: true,
        order: true,
      },
      where: {
        order: {
          status: {
            in: ['PAGO', 'EM_PRODUCAO', 'PRONTO_PARA_ENVIO', 'ENVIADO', 'ENTREGUE'],
          },
        },
      },
    })

    // Agrupar por produto
    const grouped = orderItems.reduce((acc, item) => {
      const productId = item.product.id
      const productName = item.product.name

      if (!acc[productId]) {
        acc[productId] = {
          id: productId,
          name: productName,
          totalSold: 0,
          revenue: 0,
        }
      }

      acc[productId].totalSold += item.quantity
      acc[productId].revenue += Number(item.subtotal)

      return acc
    }, {} as Record<string, TopProduct>)

    // Converter para array e ordenar
    const products = Object.values(grouped)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)

    return products
  } catch (error) {
    console.error('[DASHBOARD] Erro ao buscar top produtos:', error)
    return []
  }
}

// ========================================
// ITENS DE ESTOQUE EM FALTA
// ========================================

export async function getLowStockSupplies() {
  try {
    const supplies = await prisma.supply.findMany({
      where: {
        isLowStock: true,
      },
      include: {
        supplier: {
          select: {
            name: true,
            phone: true,
            whatsappUrl: true,
          },
        },
      },
      orderBy: {
        currentStock: 'asc',
      },
    })

    return supplies.map(s => ({
      ...s,
      unitCost: Number(s.unitCost),
    }))
  } catch (error) {
    console.error('[DASHBOARD] Erro ao buscar itens em falta:', error)
    return []
  }
}

// ========================================
// PEDIDOS RECENTES (Últimos 10)
// ========================================

export async function getRecentOrders(limit: number = 10) {
  try {
    const orders = await prisma.order.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        client: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    return orders.map(o => ({
      ...o,
      subtotal: Number(o.subtotal),
      shippingFee: Number(o.shippingFee),
      total: Number(o.total),
    }))
  } catch (error) {
    console.error('[DASHBOARD] Erro ao buscar pedidos recentes:', error)
    return []
  }
}

// ========================================
// HELPER: FORMATAR STATUS DE PRODUÇÃO
// ========================================

function formatProductionStatus(status: string): string {
  const statusMap: Record<string, string> = {
    NAO_INICIADO: 'Não Iniciado',
    PREPARO: 'Preparo',
    PINTURA: 'Pintura',
    CURA: 'Cura',
    INSPECAO: 'Inspeção',
    ACABAMENTO: 'Acabamento',
    EMBALAGEM: 'Embalagem',
    CONCLUIDO: 'Concluído',
  }

  return statusMap[status] || status
}
