'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return products.map(p => ({
      ...p,
      basePrice: Number(p.basePrice),
      variants: p.variants.map(v => ({
        ...v,
        priceAdjust: Number(v.priceAdjust)
      }))
    }))
  } catch (error) {
    console.error('[PRODUCTS] Erro ao buscar produtos:', error)
    return []
  }
}

export async function getActiveProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        variants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return products.map(p => ({
      ...p,
      basePrice: Number(p.basePrice),
      variants: p.variants.map(v => ({
        ...v,
        priceAdjust: Number(v.priceAdjust)
      }))
    }))
  } catch (error) {
    console.error('[PRODUCTS] Erro ao buscar produtos ativos:', error)
    return []
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        variants: true,
      },
    })

    if (!product) return null

    return {
      ...product,
      basePrice: Number(product.basePrice),
      variants: product.variants.map(v => ({
        ...v,
        priceAdjust: Number(v.priceAdjust)
      }))
    }
  } catch (error) {
    console.error('[PRODUCTS] Erro ao buscar produto por slug:', error)
    return null
  }
}

export async function createProduct(data: {
  name: string
  description: string
  category: string
  basePrice: number
  slug: string
  tags?: string[]
}) {
  try {
    const product = await prisma.product.create({
      data: {
        ...data,
        basePrice: data.basePrice,
      },
    })

    revalidatePath('/admin/produtos')
    revalidatePath('/produtos')
    return { success: true, product }
  } catch (error) {
    console.error('[PRODUCTS] Erro ao criar produto:', error)
    return { success: false, error: 'Erro ao criar produto' }
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data,
    })

    revalidatePath('/admin/produtos')
    revalidatePath('/produtos')
    return { success: true, product }
  } catch (error) {
    console.error('[PRODUCTS] Erro ao atualizar produto:', error)
    return { success: false, error: 'Erro ao atualizar produto' }
  }
}

export async function createProductVariant(productId: string, data: {
  model: string
  color: string
  capacity: string
  imageUrls: string[]
  stockQty: number
  priceAdjust: number
  sku: string
}) {
  try {
    const variant = await prisma.productVariant.create({
      data: {
        ...data,
        productId,
      },
    })

    revalidatePath('/admin/produtos')
    return { success: true, variant }
  } catch (error) {
    console.error('[PRODUCTS] Erro ao criar variante:', error)
    return { success: false, error: 'Erro ao criar variante' }
  }
}
