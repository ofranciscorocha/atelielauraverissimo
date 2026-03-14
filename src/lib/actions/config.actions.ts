'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getAppConfig() {
  try {
    const settings = await prisma.settings.findFirst()
    
    if (!settings) {
      // Retornar configurações padrão se não existir no banco
      return {
        logoUrl: null,
        primaryColor: '#304930',
        secondaryColor: '#F0F4F0',
        accentColor: '#D4AF37',
        banners: [],
        minProductionDays: 7,
        maxProductionDays: 15,
        shippingInfo: 'Frete fixo para todo o Brasil. Consulte condições.',
        whatsappNumber: '5511999999999',
        whatsappMessage: 'Olá! Gostaria de finalizar meu pedido 💚',
        deliveryOptions: [
          { id: 'sedex', name: 'SEDEX', price: 25, time: '3-5 dias úteis' },
          { id: 'jadlog', name: 'Jadlog', price: 18, time: '5-8 dias úteis' }
        ]
      }
    }

    return {
      ...settings,
      banners: JSON.parse(settings.bannersJson || '[]'),
      deliveryOptions: [
        { id: 'sedex', name: 'SEDEX', price: 25, time: '3-5 dias úteis' },
        { id: 'jadlog', name: 'Jadlog', price: 18, time: '5-8 dias úteis' }
      ]
    }
  } catch (error) {
    console.error('[CONFIG] Erro ao buscar configurações:', error)
    return null
  }
}

export async function updateAppConfig(data: any) {
  try {
    const current = await prisma.settings.findFirst()
    
    if (current) {
      await prisma.settings.update({
        where: { id: current.id },
        data: {
          ...data,
          bannersJson: data.banners ? JSON.stringify(data.banners) : current.bannersJson
        }
      })
    } else {
      await prisma.settings.create({
        data: {
          ...data,
          bannersJson: data.banners ? JSON.stringify(data.banners) : '[]'
        }
      })
    }

    revalidatePath('/admin/config')
    return { success: true }
  } catch (error) {
    console.error('[CONFIG] Erro ao atualizar configurações:', error)
    return { success: false, error: 'Erro ao salvar configurações' }
  }
}
