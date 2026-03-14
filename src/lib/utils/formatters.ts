// LAURA VERISSIMO ATELIER - FORMATTERS & UTILITIES
// Funções utilitárias para formatação de dados

import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ========================================
// FORMATAÇÃO MONETÁRIA
// ========================================

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatCurrencyCompact(value: number): string {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1)}K`
  }
  return formatCurrency(value)
}

// ========================================
// FORMATAÇÃO DE DATAS
// ========================================

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR })
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function formatDateShort(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'dd/MM/yy', { locale: ptBR })
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(dateObj, {
    addSuffix: true,
    locale: ptBR,
  })
}

// ========================================
// FORMATAÇÃO DE TELEFONE
// ========================================

export function formatPhone(phone: string): string {
  // Remove tudo que não é número
  const cleaned = phone.replace(/\D/g, '')

  // Formata (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }

  return phone
}

// ========================================
// FORMATAÇÃO DE CPF
// ========================================

export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '')

  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`
  }

  return cpf
}

// ========================================
// FORMATAÇÃO DE CEP
// ========================================

export function formatZipCode(zipCode: string): string {
  const cleaned = zipCode.replace(/\D/g, '')

  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
  }

  return zipCode
}

// ========================================
// FORMATAÇÃO DE STATUS
// ========================================

export function formatOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    AGUARDANDO_PAGAMENTO: 'Aguardando Pagamento',
    PAGO: 'Pago',
    EM_PRODUCAO: 'Em Produção',
    PRONTO_PARA_ENVIO: 'Pronto para Envio',
    ENVIADO: 'Enviado',
    ENTREGUE: 'Entregue',
    CANCELADO: 'Cancelado',
  }

  return statusMap[status] || status
}

export function formatProductionStatus(status: string): string {
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

export function formatClientRanking(ranking: string): string {
  const rankingMap: Record<string, string> = {
    NOVO: 'Novo',
    BRONZE: 'Bronze',
    PRATA: 'Prata',
    OURO: 'Ouro',
    PLATINA: 'Platina',
    VIP: 'VIP',
  }

  return rankingMap[ranking] || ranking
}

export function formatClientSegment(segment: string): string {
  const segmentMap: Record<string, string> = {
    POTENCIAL: 'Potencial',
    RECORRENTE: 'Recorrente',
    EM_RISCO: 'Em Risco',
    INATIVO: 'Inativo',
    CHAMPION: 'Champion',
  }

  return segmentMap[segment] || segment
}

// ========================================
// CORES DE STATUS (Para UI)
// ========================================

export function getOrderStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    AGUARDANDO_PAGAMENTO: 'yellow',
    PAGO: 'blue',
    EM_PRODUCAO: 'purple',
    PRONTO_PARA_ENVIO: 'orange',
    ENVIADO: 'cyan',
    ENTREGUE: 'green',
    CANCELADO: 'red',
  }

  return colorMap[status] || 'gray'
}

export function getProductionStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    NAO_INICIADO: 'gray',
    PREPARO: 'blue',
    PINTURA: 'purple',
    CURA: 'orange',
    INSPECAO: 'yellow',
    ACABAMENTO: 'cyan',
    EMBALAGEM: 'lime',
    CONCLUIDO: 'green',
  }

  return colorMap[status] || 'gray'
}

export function getRankingColor(ranking: string): string {
  const colorMap: Record<string, string> = {
    NOVO: 'gray',
    BRONZE: 'orange',
    PRATA: 'gray',
    OURO: 'yellow',
    PLATINA: 'cyan',
    VIP: 'purple',
  }

  return colorMap[ranking] || 'gray'
}

export function getSegmentColor(segment: string): string {
  const colorMap: Record<string, string> = {
    POTENCIAL: 'blue',
    RECORRENTE: 'green',
    EM_RISCO: 'yellow',
    INATIVO: 'red',
    CHAMPION: 'purple',
  }

  return colorMap[segment] || 'gray'
}

// ========================================
// FORMATAÇÃO DE PERCENTUAIS
// ========================================

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`
}

export function formatPercentageCompact(value: number): string {
  return `${Math.round(value)}%`
}

// ========================================
// FORMATAÇÃO DE NÚMEROS
// ========================================

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function formatNumberCompact(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return formatNumber(value)
}

// ========================================
// TRUNCAR TEXTO
// ========================================

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

// ========================================
// GERAR INICIAIS
// ========================================

export function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

// ========================================
// SLUGIFY
// ========================================

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim()
}

// ========================================
// VALIDAÇÕES
// ========================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '')
  return cleaned.length === 11
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length >= 10 && cleaned.length <= 11
}
