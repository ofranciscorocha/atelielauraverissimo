'use server'

// LAURA VERISSIMO ATELIER - INVENTORY MASTER ACTIONS
// Gestão Completa de Estoque, Reservas e Alertas Críticos

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { MovementType, SupplyCategory } from '@prisma/client'

// ========================================
// TIPOS & INTERFACES
// ========================================

export interface StockAlert {
  supplyId: string
  supplyName: string
  category: SupplyCategory
  currentStock: number
  minStockLevel: number
  supplierName?: string
  supplierPhone?: string
  supplierWhatsappUrl?: string
}

export interface InventoryMetrics {
  totalSupplies: number
  lowStockCount: number
  outOfStockCount: number
  totalValue: number
  categoryCounts: Record<string, number>
}

// ========================================
// VERIFICAR E ATUALIZAR STATUS DE ESTOQUE BAIXO
// ========================================

export async function updateLowStockStatus() {
  try {
    // Buscar todos os insumos
    const supplies = await prisma.supply.findMany()

    for (const supply of supplies) {
      const isLowStock = supply.currentStock <= supply.minStockLevel

      // Atualizar apenas se houve mudança
      if (supply.isLowStock !== isLowStock) {
        await prisma.supply.update({
          where: { id: supply.id },
          data: { isLowStock },
        })
      }
    }

    revalidatePath('/admin/estoque')
    return { success: true }
  } catch (error) {
    console.error('[INVENTORY] Erro ao atualizar status de estoque:', error)
    return { success: false, error: 'Erro ao atualizar status' }
  }
}

// ========================================
// BUSCAR ALERTAS DE ESTOQUE CRÍTICO
// ========================================

export async function getCriticalStockAlerts(): Promise<StockAlert[]> {
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

    return supplies.map((s) => ({
      supplyId: s.id,
      supplyName: s.name,
      category: s.category,
      currentStock: s.currentStock,
      minStockLevel: s.minStockLevel,
      supplierName: s.supplier?.name,
      supplierPhone: s.supplier?.phone,
      supplierWhatsappUrl: s.supplier?.whatsappUrl,
    }))
  } catch (error) {
    console.error('[INVENTORY] Erro ao buscar alertas críticos:', error)
    return []
  }
}

// ========================================
// RESERVAR ESTOQUE PARA PEDIDO
// ========================================

export async function reserveStockForOrder(orderId: string, items: { variantId: string; quantity: number }[]) {
  try {
    // Nesta versão simplificada, assumimos que cada variante de produto
    // consome insumos específicos. Você pode expandir isso criando uma
    // tabela de relacionamento ProductVariant -> Supply

    // Por enquanto, vamos apenas registrar a movimentação de saída
    // quando o pedido entrar em produção

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
      return { success: false, error: 'Pedido não encontrado' }
    }

    // Aqui você implementaria a lógica de reserva baseada nas variantes
    // Por exemplo: cada taça consome 1 cristal + 50ml de tinta + 1 embalagem

    // Por enquanto, retornamos sucesso (implementação futura)
    return { success: true, message: 'Estoque reservado' }
  } catch (error) {
    console.error('[INVENTORY] Erro ao reservar estoque:', error)
    return { success: false, error: 'Erro ao reservar estoque' }
  }
}

// ========================================
// REGISTRAR MOVIMENTAÇÃO DE ESTOQUE
// ========================================

export async function registerStockMovement(data: {
  supplyId: string
  type: MovementType
  quantity: number
  orderId?: string
  supplierId?: string
  notes?: string
}) {
  try {
    const { supplyId, type, quantity, orderId, supplierId, notes } = data

    // Buscar o insumo atual
    const supply = await prisma.supply.findUnique({
      where: { id: supplyId },
    })

    if (!supply) {
      return { success: false, error: 'Insumo não encontrado' }
    }

    // Calcular novo estoque
    let newStock = supply.currentStock

    if (type === 'ENTRADA') {
      newStock += quantity
    } else if (type === 'SAIDA_PRODUCAO' || type === 'PERDA') {
      newStock -= quantity
    } else if (type === 'AJUSTE') {
      newStock = quantity // Ajuste define o valor absoluto
    }

    // Garantir que não fique negativo
    if (newStock < 0) {
      return { success: false, error: 'Estoque insuficiente' }
    }

    // Registrar movimentação
    await prisma.stockMovement.create({
      data: {
        supplyId,
        type,
        quantity,
        orderId,
        supplierId,
        notes,
      },
    })

    // Atualizar estoque
    const updatedSupply = await prisma.supply.update({
      where: { id: supplyId },
      data: {
        currentStock: newStock,
        isLowStock: newStock <= supply.minStockLevel,
      },
    })

    revalidatePath('/admin/estoque')
    return { success: true, supply: updatedSupply }
  } catch (error) {
    console.error('[INVENTORY] Erro ao registrar movimentação:', error)
    return { success: false, error: 'Erro ao registrar movimentação' }
  }
}

// ========================================
// ENTRADA DE ESTOQUE (Compra de Fornecedor)
// ========================================

export async function registerStockEntry(data: {
  supplyId: string
  quantity: number
  supplierId: string
  notes?: string
}) {
  return registerStockMovement({
    supplyId: data.supplyId,
    type: 'ENTRADA',
    quantity: data.quantity,
    supplierId: data.supplierId,
    notes: data.notes,
  })
}

// ========================================
// SAÍDA DE ESTOQUE (Uso em Produção)
// ========================================

export async function registerProductionUsage(data: {
  supplyId: string
  quantity: number
  orderId: string
  notes?: string
}) {
  return registerStockMovement({
    supplyId: data.supplyId,
    type: 'SAIDA_PRODUCAO',
    quantity: data.quantity,
    orderId: data.orderId,
    notes: data.notes,
  })
}

// ========================================
// MÉTRICAS GERAIS DO INVENTÁRIO
// ========================================

export async function getInventoryMetrics(): Promise<InventoryMetrics> {
  try {
    const supplies = await prisma.supply.findMany()

    const totalSupplies = supplies.length
    const lowStockCount = supplies.filter((s) => s.isLowStock).length
    const outOfStockCount = supplies.filter((s) => s.currentStock === 0).length
    const totalValue = supplies.reduce((sum, s) => sum + s.currentStock * Number(s.unitCost), 0)

    // Contagem por categoria
    const categoryCounts = supplies.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalSupplies,
      lowStockCount,
      outOfStockCount,
      totalValue,
      categoryCounts,
    }
  } catch (error) {
    console.error('[INVENTORY] Erro ao buscar métricas:', error)
    return {
      totalSupplies: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      totalValue: 0,
      categoryCounts: {},
    }
  }
}

// ========================================
// LISTAR INSUMOS COM FILTROS
// ========================================

export async function getSupplies(filters?: {
  category?: SupplyCategory
  lowStockOnly?: boolean
  search?: string
}) {
  try {
    const where: any = {}

    if (filters?.category) {
      where.category = filters.category
    }

    if (filters?.lowStockOnly) {
      where.isLowStock = true
    }

    if (filters?.search) {
      where.name = {
        contains: filters.search,
        mode: 'insensitive',
      }
    }

    const supplies = await prisma.supply.findMany({
      where,
      include: {
        supplier: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return supplies.map((s) => ({
      ...s,
      unitCost: Number(s.unitCost),
    }))
  } catch (error) {
    console.error('[INVENTORY] Erro ao listar insumos:', error)
    return []
  }
}

// ========================================
// CRIAR NOVO INSUMO
// ========================================

export async function createSupply(data: {
  name: string
  category: SupplyCategory
  sku: string
  supplierId?: string
  currentStock?: number
  minStockLevel?: number
  unit: string
  unitCost: number
}) {
  try {
    const supply = await prisma.supply.create({
      data: {
        ...data,
        isLowStock: (data.currentStock || 0) <= (data.minStockLevel || 10),
      },
    })

    revalidatePath('/admin/estoque')
    return { success: true, supply }
  } catch (error) {
    console.error('[INVENTORY] Erro ao criar insumo:', error)
    return { success: false, error: 'Erro ao criar insumo' }
  }
}

// ========================================
// ATUALIZAR INSUMO
// ========================================

export async function updateSupply(
  supplyId: string,
  data: {
    name?: string
    category?: SupplyCategory
    supplierId?: string
    minStockLevel?: number
    unit?: string
    unitCost?: number
  }
) {
  try {
    const supply = await prisma.supply.update({
      where: { id: supplyId },
      data,
    })

    // Recalcular status de estoque baixo
    await updateLowStockStatus()

    revalidatePath('/admin/estoque')
    return { success: true, supply }
  } catch (error) {
    console.error('[INVENTORY] Erro ao atualizar insumo:', error)
    return { success: false, error: 'Erro ao atualizar insumo' }
  }
}

// ========================================
// HISTÓRICO DE MOVIMENTAÇÕES
// ========================================

export async function getStockMovements(filters?: {
  supplyId?: string
  orderId?: string
  type?: MovementType
  limit?: number
}) {
  try {
    const where: any = {}

    if (filters?.supplyId) {
      where.supplyId = filters.supplyId
    }

    if (filters?.orderId) {
      where.orderId = filters.orderId
    }

    if (filters?.type) {
      where.type = filters.type
    }

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        supply: {
          select: {
            name: true,
            category: true,
          },
        },
        supplier: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: filters?.limit || 50,
    })

    return movements
  } catch (error) {
    console.error('[INVENTORY] Erro ao buscar movimentações:', error)
    return []
  }
}
