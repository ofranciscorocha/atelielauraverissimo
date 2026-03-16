'use server'

// LAURA VERISSIMO ATELIER - MESSAGES/CHAT ACTIONS
// Sistema de Chat entre Clientes e Ateliê

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { SenderType } from '@prisma/client'

// ========================================
// TIPOS
// ========================================

export interface SendMessageData {
  userId?: string
  senderType: 'CUSTOMER' | 'ADMIN' | 'SYSTEM'
  senderName: string
  content: string
  orderId?: string
  attachments?: string[]
}

export interface MessageWithUser {
  id: string
  createdAt: Date
  senderType: SenderType
  senderName: string
  content: string
  orderId?: string
  attachments: string[]
  read: boolean
  readAt?: Date | null
  user?: {
    id: string
    name: string
    email: string
  }
}

// ========================================
// ENVIAR MENSAGEM
// ========================================

export async function sendMessage(data: SendMessageData) {
  try {
    const { userId, senderType, senderName, content, orderId, attachments } = data

    if (!content || content.trim().length === 0) {
      return { success: false, error: 'Mensagem não pode estar vazia' }
    }

    const message = await prisma.message.create({
      data: {
        userId,
        senderType,
        senderName,
        content: content.trim(),
        orderId,
        attachments: attachments || []
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Revalidate relevant paths
    if (userId) {
      revalidatePath(`/profile`)
    }
    revalidatePath('/admin/chat')

    return {
      success: true,
      message: {
        id: message.id,
        createdAt: message.createdAt,
        senderType: message.senderType,
        senderName: message.senderName,
        content: message.content,
        orderId: message.orderId || undefined,
        attachments: message.attachments,
        read: message.read,
        readAt: message.readAt,
        user: message.user || undefined
      }
    }
  } catch (error: any) {
    console.error('Send message error:', error)
    return { success: false, error: 'Erro ao enviar mensagem. Tente novamente.' }
  }
}

// ========================================
// OBTER MENSAGENS DE UM USUÁRIO
// ========================================

export async function getUserMessages(userId: string, limit: number = 100) {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { userId },
          { senderType: 'ADMIN' },
          { senderType: 'SYSTEM' }
        ]
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return {
      success: true,
      messages: messages.map(m => ({
        id: m.id,
        createdAt: m.createdAt,
        senderType: m.senderType,
        senderName: m.senderName,
        content: m.content,
        orderId: m.orderId || undefined,
        attachments: m.attachments,
        read: m.read,
        readAt: m.readAt,
        user: m.user || undefined
      }))
    }
  } catch (error) {
    console.error('Get user messages error:', error)
    return { success: false, error: 'Erro ao buscar mensagens', messages: [] }
  }
}

// ========================================
// OBTER MENSAGENS DE UM PEDIDO
// ========================================

export async function getOrderMessages(orderId: string) {
  try {
    const messages = await prisma.message.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return {
      success: true,
      messages: messages.map(m => ({
        id: m.id,
        createdAt: m.createdAt,
        senderType: m.senderType,
        senderName: m.senderName,
        content: m.content,
        orderId: m.orderId || undefined,
        attachments: m.attachments,
        read: m.read,
        readAt: m.readAt,
        user: m.user || undefined
      }))
    }
  } catch (error) {
    console.error('Get order messages error:', error)
    return { success: false, error: 'Erro ao buscar mensagens do pedido', messages: [] }
  }
}

// ========================================
// MARCAR MENSAGEM COMO LIDA
// ========================================

export async function markMessageAsRead(messageId: string) {
  try {
    await prisma.message.update({
      where: { id: messageId },
      data: {
        read: true,
        readAt: new Date()
      }
    })

    revalidatePath('/profile')
    revalidatePath('/admin/chat')

    return { success: true }
  } catch (error) {
    console.error('Mark as read error:', error)
    return { success: false, error: 'Erro ao marcar mensagem como lida' }
  }
}

// ========================================
// MARCAR TODAS MENSAGENS DO USUÁRIO COMO LIDAS
// ========================================

export async function markAllUserMessagesAsRead(userId: string) {
  try {
    await prisma.message.updateMany({
      where: {
        userId,
        read: false
      },
      data: {
        read: true,
        readAt: new Date()
      }
    })

    revalidatePath('/profile')
    revalidatePath('/admin/chat')

    return { success: true }
  } catch (error) {
    console.error('Mark all as read error:', error)
    return { success: false, error: 'Erro ao marcar mensagens como lidas' }
  }
}

// ========================================
// OBTER CONTAGEM DE MENSAGENS NÃO LIDAS
// ========================================

export async function getUnreadCount(userId: string) {
  try {
    const count = await prisma.message.count({
      where: {
        userId,
        read: false,
        senderType: { not: 'CUSTOMER' } // Não conta as próprias mensagens
      }
    })

    return { success: true, count }
  } catch (error) {
    console.error('Get unread count error:', error)
    return { success: false, count: 0 }
  }
}

// ========================================
// ADMIN: OBTER TODAS AS CONVERSAS
// ========================================

export async function getAllConversations() {
  try {
    // Busca todos usuários que têm mensagens
    const usersWithMessages = await prisma.user.findMany({
      where: {
        messages: {
          some: {}
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1 // Última mensagem
        },
        client: {
          select: {
            id: true,
            name: true,
            ranking: true
          }
        }
      }
    })

    // Para cada usuário, conta mensagens não lidas
    const conversations = await Promise.all(
      usersWithMessages.map(async (user) => {
        const unreadCount = await prisma.message.count({
          where: {
            userId: user.id,
            read: false,
            senderType: 'CUSTOMER'
          }
        })

        return {
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          client: user.client,
          lastMessage: user.messages[0] ? {
            content: user.messages[0].content,
            createdAt: user.messages[0].createdAt,
            senderType: user.messages[0].senderType
          } : null,
          unreadCount
        }
      })
    )

    // Ordena por última mensagem
    conversations.sort((a, b) => {
      if (!a.lastMessage) return 1
      if (!b.lastMessage) return -1
      return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
    })

    return { success: true, conversations }
  } catch (error) {
    console.error('Get conversations error:', error)
    return { success: false, error: 'Erro ao buscar conversas', conversations: [] }
  }
}

// ========================================
// DELETAR MENSAGEM
// ========================================

export async function deleteMessage(messageId: string) {
  try {
    await prisma.message.delete({
      where: { id: messageId }
    })

    revalidatePath('/profile')
    revalidatePath('/admin/chat')

    return { success: true }
  } catch (error) {
    console.error('Delete message error:', error)
    return { success: false, error: 'Erro ao deletar mensagem' }
  }
}
