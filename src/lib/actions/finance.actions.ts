'use server'

// LAURA VERISSIMO ATELIER - FINANCE ENGINE ACTIONS
// Engenharia Financeira: Lucro, Impostos, Insights e Categorias

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { FinanceType } from '@prisma/client'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

// ========================================
// TIPOS & INTERFACES
// ========================================

export interface FinanceMetrics {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number // Percentual
  monthlyRevenue: number
  monthlyExpenses: number
  monthlyProfit: number
}

export interface CategoryInsight {
  category: string
  totalRevenue: number
  totalExpenses: number
  profit: number
  count: number
}

export interface ProfitCalculation {
  revenue: number
  costOfGoods: number
  grossProfit: number
  taxes: number // 6.93% (Simples Nacional Presumido)
  fees: number // 3% (taxas de pagamento)
  netProfit: number
  profitMargin: number
}

// ========================================
// CONSTANTES FISCAIS
// ========================================

const TAX_RATE = 0.0693 // 6.93% Simples Nacional (Atividade Artesanal)
const PAYMENT_FEE_RATE = 0.03 // 3% taxas de pagamento (PIX/Cartão)

// ========================================
// CALCULAR LUCRO DE UM PEDIDO
// ========================================

export async function calculateOrderProfit(orderId: string): Promise<ProfitCalculation> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            variant: true,
          },
        },
      },
    })

    if (!order) {
      throw new Error('Pedido não encontrado')
    }

    const revenue = Number(order.total)

    // Calcular custo dos produtos vendidos (simplificado)
    // Na prática, você vincularia cada variante aos insumos consumidos
    // Por enquanto, vamos estimar 40% do valor como custo
    const costOfGoods = revenue * 0.4

    const grossProfit = revenue - costOfGoods
    const taxes = revenue * TAX_RATE
    const fees = revenue * PAYMENT_FEE_RATE

    const netProfit = grossProfit - taxes - fees
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0

    return {
      revenue,
      costOfGoods,
      grossProfit,
      taxes,
      fees,
      netProfit,
      profitMargin,
    }
  } catch (error) {
    console.error('[FINANCE] Erro ao calcular lucro do pedido:', error)
    return {
      revenue: 0,
      costOfGoods: 0,
      grossProfit: 0,
      taxes: 0,
      fees: 0,
      netProfit: 0,
      profitMargin: 0,
    }
  }
}

// ========================================
// REGISTRAR ENTRADA/SAÍDA DE CAIXA
// ========================================

export async function registerFinanceEntry(data: {
  type: FinanceType
  category: string
  amount: number
  description: string
  orderId?: string
  costOfGoods?: number
}) {
  try {
    const { type, category, amount, description, orderId, costOfGoods } = data

    let profit: number | undefined

    // Se for uma receita de pedido, calcular lucro
    if (type === 'RECEITA' && orderId) {
      const profitCalc = await calculateOrderProfit(orderId)
      profit = profitCalc.netProfit
    }

    const entry = await prisma.financeEntry.create({
      data: {
        type,
        category,
        amount,
        description,
        orderId,
        costOfGoods: costOfGoods || undefined,
        profit,
      },
    })

    revalidatePath('/admin/financeiro')
    return { success: true, entry }
  } catch (error) {
    console.error('[FINANCE] Erro ao registrar entrada financeira:', error)
    return { success: false, error: 'Erro ao registrar entrada' }
  }
}

// ========================================
// REGISTRAR VENDA (Automático ao Pagar Pedido)
// ========================================

export async function registerSaleRevenue(orderId: string) {
  try {
    // Verificar se já existe entrada para este pedido
    const existingEntry = await prisma.financeEntry.findUnique({
      where: { orderId },
    })

    if (existingEntry) {
      return { success: true, message: 'Venda já registrada' }
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!order) {
      return { success: false, error: 'Pedido não encontrado' }
    }

    const profitCalc = await calculateOrderProfit(orderId)

    const entry = await prisma.financeEntry.create({
      data: {
        type: 'RECEITA',
        category: 'Vendas',
        amount: Number(order.total),
        description: `Venda para ${order.client.name} - Pedido #${orderId.slice(-8)}`,
        orderId,
        costOfGoods: profitCalc.costOfGoods,
        profit: profitCalc.netProfit,
      },
    })

    revalidatePath('/admin/financeiro')
    return { success: true, entry }
  } catch (error) {
    console.error('[FINANCE] Erro ao registrar venda:', error)
    return { success: false, error: 'Erro ao registrar venda' }
  }
}

// ========================================
// REGISTRAR DESPESA
// ========================================

export async function registerExpense(data: {
  category: string
  amount: number
  description: string
}) {
  return registerFinanceEntry({
    type: 'DESPESA',
    category: data.category,
    amount: data.amount,
    description: data.description,
  })
}

// ========================================
// MÉTRICAS FINANCEIRAS GERAIS
// ========================================

export async function getFinanceMetrics(period?: {
  startDate?: Date
  endDate?: Date
}): Promise<FinanceMetrics> {
  try {
    const now = new Date()
    const startOfThisMonth = startOfMonth(now)
    const endOfThisMonth = endOfMonth(now)

    // Filtro de período
    const periodFilter: any = {}
    if (period?.startDate && period?.endDate) {
      periodFilter.createdAt = {
        gte: period.startDate,
        lte: period.endDate,
      }
    }

    // Todas as entradas
    const [allEntries, monthlyEntries] = await Promise.all([
      prisma.financeEntry.findMany({
        where: periodFilter,
      }),
      prisma.financeEntry.findMany({
        where: {
          createdAt: {
            gte: startOfThisMonth,
            lte: endOfThisMonth,
          },
        },
      }),
    ])

    // Calcular totais gerais
    const totalRevenue = allEntries
      .filter((e) => e.type === 'RECEITA')
      .reduce((sum, e) => sum + Number(e.amount), 0)

    const totalExpenses = allEntries
      .filter((e) => e.type === 'DESPESA')
      .reduce((sum, e) => sum + Number(e.amount), 0)

    const netProfit = totalRevenue - totalExpenses
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    // Calcular totais mensais
    const monthlyRevenue = monthlyEntries
      .filter((e) => e.type === 'RECEITA')
      .reduce((sum, e) => sum + Number(e.amount), 0)

    const monthlyExpenses = monthlyEntries
      .filter((e) => e.type === 'DESPESA')
      .reduce((sum, e) => sum + Number(e.amount), 0)

    const monthlyProfit = monthlyRevenue - monthlyExpenses

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      monthlyRevenue,
      monthlyExpenses,
      monthlyProfit,
    }
  } catch (error) {
    console.error('[FINANCE] Erro ao buscar métricas financeiras:', error)
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      profitMargin: 0,
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      monthlyProfit: 0,
    }
  }
}

// ========================================
// INSIGHTS POR CATEGORIA
// ========================================

export async function getCategoryInsights(): Promise<CategoryInsight[]> {
  try {
    const entries = await prisma.financeEntry.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Agrupar por categoria
    const grouped = entries.reduce((acc, entry) => {
      const category = entry.category

      if (!acc[category]) {
        acc[category] = {
          category,
          totalRevenue: 0,
          totalExpenses: 0,
          profit: 0,
          count: 0,
        }
      }

      if (entry.type === 'RECEITA') {
        acc[category].totalRevenue += Number(entry.amount)
      } else {
        acc[category].totalExpenses += Number(entry.amount)
      }

      acc[category].count += 1

      return acc
    }, {} as Record<string, CategoryInsight>)

    // Calcular lucro por categoria
    const insights = Object.values(grouped).map((insight) => ({
      ...insight,
      profit: insight.totalRevenue - insight.totalExpenses,
    }))

    // Ordenar por lucro
    insights.sort((a, b) => b.profit - a.profit)

    return insights
  } catch (error) {
    console.error('[FINANCE] Erro ao buscar insights de categoria:', error)
    return []
  }
}

// ========================================
// RECEITA/DESPESA POR MÊS (Gráfico)
// ========================================

export async function getMonthlyFinanceData(months: number = 6) {
  try {
    const data: Array<{
      month: string
      revenue: number
      expenses: number
      profit: number
    }> = []

    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(now, i)
      const start = startOfMonth(monthDate)
      const end = endOfMonth(monthDate)

      const entries = await prisma.financeEntry.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      })

      const revenue = entries
        .filter((e) => e.type === 'RECEITA')
        .reduce((sum, e) => sum + Number(e.amount), 0)

      const expenses = entries
        .filter((e) => e.type === 'DESPESA')
        .reduce((sum, e) => sum + Number(e.amount), 0)

      data.push({
        month: format(monthDate, 'MMM/yy'),
        revenue,
        expenses,
        profit: revenue - expenses,
      })
    }

    return data
  } catch (error) {
    console.error('[FINANCE] Erro ao buscar dados mensais:', error)
    return []
  }
}

// ========================================
// LISTAR ENTRADAS FINANCEIRAS
// ========================================

export async function getFinanceEntries(filters?: {
  type?: FinanceType
  category?: string
  startDate?: Date
  endDate?: Date
  limit?: number
}) {
  try {
    const where: any = {}

    if (filters?.type) {
      where.type = filters.type
    }

    if (filters?.category) {
      where.category = filters.category
    }

    if (filters?.startDate && filters?.endDate) {
      where.createdAt = {
        gte: filters.startDate,
        lte: filters.endDate,
      }
    }

    const entries = await prisma.financeEntry.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            client: {
              select: {
                name: true,
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

    return entries.map((e) => ({
      ...e,
      amount: Number(e.amount),
      costOfGoods: e.costOfGoods ? Number(e.costOfGoods) : null,
      profit: e.profit ? Number(e.profit) : null,
    }))
  } catch (error) {
    console.error('[FINANCE] Erro ao listar entradas:', error)
    return []
  }
}

// ========================================
// DELETAR ENTRADA FINANCEIRA
// ========================================

export async function deleteFinanceEntry(entryId: string) {
  try {
    await prisma.financeEntry.delete({
      where: { id: entryId },
    })

    revalidatePath('/admin/financeiro')
    return { success: true }
  } catch (error) {
    console.error('[FINANCE] Erro ao deletar entrada:', error)
    return { success: false, error: 'Erro ao deletar entrada' }
  }
}
