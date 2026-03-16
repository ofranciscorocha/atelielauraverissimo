'use server'

// LAURA VERISSIMO ATELIER - AUTHENTICATION ACTIONS
// Autenticação e Gestão de Usuários

import { prisma } from '@/lib/prisma'
import { hash, compare } from 'bcryptjs'
import { sign, verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'laura-verissimo-secret-2026'
const SESSION_COOKIE_NAME = 'laura_session'

// ========================================
// TIPOS
// ========================================

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export interface SessionData {
  userId: string
  email: string
  name: string
  clientId?: string
}

// ========================================
// REGISTRO DE NOVO USUÁRIO
// ========================================

export async function registerUser(data: RegisterData) {
  try {
    const { name, email, password } = data

    // Validação básica
    if (!email || !password || !name) {
      return { success: false, error: 'Todos os campos são obrigatórios' }
    }

    if (password.length < 6) {
      return { success: false, error: 'Senha deve ter no mínimo 6 caracteres' }
    }

    // Verifica se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return { success: false, error: 'Email já cadastrado' }
    }

    // Hash da senha
    const passwordHash = await hash(password, 10)

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash,
      }
    })

    // Cria sessão
    const sessionData: SessionData = {
      userId: user.id,
      email: user.email,
      name: user.name,
      clientId: user.clientId || undefined
    }

    const token = sign(sessionData, JWT_SECRET, { expiresIn: '7d' })

    // Cria registro de sessão no DB
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken: token,
        expires: expiresAt
      }
    })

    // Salva cookie
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/'
    })

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }
  } catch (error: any) {
    console.error('Register error:', error)
    return { success: false, error: 'Erro ao criar conta. Tente novamente.' }
  }
}

// ========================================
// LOGIN
// ========================================

export async function loginUser(data: LoginData) {
  try {
    const { email, password } = data

    if (!email || !password) {
      return { success: false, error: 'Email e senha são obrigatórios' }
    }

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return { success: false, error: 'Email ou senha incorretos' }
    }

    // Verifica senha
    const passwordValid = await compare(password, user.passwordHash)

    if (!passwordValid) {
      return { success: false, error: 'Email ou senha incorretos' }
    }

    // Cria sessão
    const sessionData: SessionData = {
      userId: user.id,
      email: user.email,
      name: user.name,
      clientId: user.clientId || undefined
    }

    const token = sign(sessionData, JWT_SECRET, { expiresIn: '7d' })

    // Cria registro de sessão no DB
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken: token,
        expires: expiresAt
      }
    })

    // Salva cookie
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/'
    })

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        clientId: user.clientId
      }
    }
  } catch (error: any) {
    console.error('Login error:', error)
    return { success: false, error: 'Erro ao fazer login. Tente novamente.' }
  }
}

// ========================================
// LOGOUT
// ========================================

export async function logoutUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (token) {
      // Remove sessão do DB
      await prisma.session.deleteMany({
        where: { sessionToken: token }
      })
    }

    // Remove cookie
    cookieStore.delete(SESSION_COOKIE_NAME)

    return { success: true }
  } catch (error) {
    console.error('Logout error:', error)
    return { success: false }
  }
}

// ========================================
// OBTER SESSÃO ATUAL
// ========================================

export async function getCurrentSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!token) {
      return null
    }

    // Verifica JWT
    const decoded = verify(token, JWT_SECRET) as SessionData

    // Verifica se sessão ainda existe no DB
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true }
    })

    if (!session || session.expires < new Date()) {
      // Sessão expirada
      cookieStore.delete(SESSION_COOKIE_NAME)
      return null
    }

    return {
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
      clientId: session.user.clientId || undefined
    }
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
}

// ========================================
// VINCULAR CLIENTE AO USUÁRIO
// ========================================

export async function linkClientToUser(userId: string, clientId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { clientId }
    })

    return { success: true }
  } catch (error) {
    console.error('Link client error:', error)
    return { success: false, error: 'Erro ao vincular cliente' }
  }
}

// ========================================
// OBTER USUÁRIO POR ID
// ========================================

export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            ranking: true,
            lifetimeValue: true,
            totalOrders: true
          }
        }
      }
    })

    if (!user) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        client: user.client
      }
    }
  } catch (error) {
    console.error('Get user error:', error)
    return { success: false, error: 'Erro ao buscar usuário' }
  }
}
