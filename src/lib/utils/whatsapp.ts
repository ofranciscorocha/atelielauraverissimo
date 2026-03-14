// LAURA VERISSIMO ATELIER - WHATSAPP UTILITIES
// Geração de Mensagens Formatadas e Fofas para Checkout

import { CartItem } from '@/contexts/CartContext'

// ========================================
// TIPOS & INTERFACES
// ========================================

export interface CheckoutData {
  items: CartItem[]
  subtotal: number
  shippingFee: number
  total: number
  customerName: string
  customerEmail: string
  customerPhone: string
  specialMessage?: string // "Recadinho Especial"
  address?: string
  city?: string
  state?: string
  zipCode?: string
}

// ========================================
// FORMATAR VALOR MONETÁRIO
// ========================================

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// ========================================
// GERAR MENSAGEM DE CHECKOUT PARA WHATSAPP
// ========================================

export function generateWhatsAppCheckoutMessage(data: CheckoutData): string {
  const {
    items,
    subtotal,
    shippingFee,
    total,
    customerName,
    customerEmail,
    customerPhone,
    specialMessage,
    address,
    city,
    state,
    zipCode,
  } = data

  // Linha de separação fofa
  const separator = '─'.repeat(30)

  // Header
  let message = `💚 *Olá Laura!* 💚\n\n`
  message += `Gostaria de finalizar meu pedido no Ateliê Laura Verissimo! ✨\n\n`
  message += `${separator}\n\n`

  // Dados do Cliente
  message += `👤 *DADOS DO CLIENTE*\n\n`
  message += `Nome: ${customerName}\n`
  message += `Email: ${customerEmail}\n`
  message += `Telefone: ${customerPhone}\n\n`

  // Endereço de Entrega (se fornecido)
  if (address && city && state) {
    message += `📍 *ENDEREÇO DE ENTREGA*\n\n`
    message += `${address}\n`
    message += `${city} - ${state}\n`
    if (zipCode) {
      message += `CEP: ${zipCode}\n`
    }
    message += `\n`
  }

  message += `${separator}\n\n`

  // Itens do Pedido
  message += `🛍️ *MEU PEDIDO*\n\n`

  items.forEach((item, index) => {
    message += `*${index + 1}. ${item.productName}*\n`
    message += `   • Modelo: ${item.variantModel}\n`
    message += `   • Cor: ${item.variantColor}\n`
    message += `   • Capacidade: ${item.variantCapacity}\n`
    message += `   • Quantidade: ${item.quantity}x\n`
    message += `   • Valor Unit.: ${formatCurrency(item.unitPrice)}\n`
    message += `   • Subtotal: ${formatCurrency(item.subtotal)}\n\n`
  })

  message += `${separator}\n\n`

  // Valores
  message += `💰 *RESUMO DO PEDIDO*\n\n`
  message += `Subtotal: ${formatCurrency(subtotal)}\n`
  message += `Frete: ${formatCurrency(shippingFee)}\n`
  message += `*Total: ${formatCurrency(total)}*\n\n`

  message += `${separator}\n\n`

  // Recadinho Especial (se houver)
  if (specialMessage) {
    message += `💌 *MEU RECADINHO ESPECIAL*\n\n`
    message += `"${specialMessage}"\n\n`
    message += `${separator}\n\n`
  }

  // Footer
  message += `Aguardo seu retorno para confirmar o pedido e combinarmos o pagamento! 🌟\n\n`
  message += `Com carinho,\n`
  message += `${customerName} 💚`

  return message
}

// ========================================
// GERAR URL DO WHATSAPP COM MENSAGEM PRÉ-PREENCHIDA
// ========================================

export function generateWhatsAppURL(data: CheckoutData, whatsappNumber?: string): string {
  const message = generateWhatsAppCheckoutMessage(data)
  const encodedMessage = encodeURIComponent(message)

  // Número padrão ou variável de ambiente
  const phone = whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'

  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '')

  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}

// ========================================
// GERAR MENSAGEM DE RECUPERAÇÃO (Marketing)
// ========================================

export function generateRecoveryMessage(customerName: string, daysInactive: number): string {
  const messages = [
    `Oi ${customerName}! Sentimos sua falta aqui no Ateliê 💚 Já faz ${daysInactive} dias que você não aparece... Preparei algo especial pra você! ✨`,
    `${customerName}, suas taças estão com saudade! 🥂 Que tal criar uma nova peça exclusiva? Estou aqui esperando por você 💚`,
    `Olá ${customerName}! Vi que você gostou das nossas criações e fiquei curiosa... Não quer dar uma olhadinha nas novidades? 🎨✨`,
    `${customerName}, tenho certeza que aquela taça pintada à mão ficaria perfeita na sua casa! Vamos conversar? 💚`,
  ]

  // Escolher mensagem aleatória
  const randomIndex = Math.floor(Math.random() * messages.length)
  return messages[randomIndex]
}

// ========================================
// GERAR MENSAGEM DE BOAS-VINDAS (Novo Cliente)
// ========================================

export function generateWelcomeMessage(customerName: string): string {
  return `Olá ${customerName}! 🌟 Seja muito bem-vinda(o) ao Ateliê Laura Verissimo! 💚\n\nCada peça aqui é pintada à mão com muito amor e exclusividade. Fico feliz em ter você por aqui!\n\nQualquer dúvida, estou à disposição! ✨\n\nCom carinho,\nLaura 💚`
}

// ========================================
// GERAR MENSAGEM DE AGRADECIMENTO PÓS-COMPRA
// ========================================

export function generateThankYouMessage(customerName: string, orderNumber: string): string {
  return `${customerName}, muito obrigada pela confiança! 💚\n\nSeu pedido #${orderNumber} já está sendo preparado com todo carinho e atenção aos detalhes.\n\nVou te manter atualizada(o) sobre cada etapa da produção! ✨\n\nEstou ansiosa para você receber sua peça exclusiva!\n\nCom gratidão,\nLaura 💚`
}

// ========================================
// GERAR MENSAGEM DE ATUALIZAÇÃO DE STATUS
// ========================================

export function generateStatusUpdateMessage(
  customerName: string,
  orderNumber: string,
  status: string
): string {
  const statusMessages: Record<string, string> = {
    PINTURA: `${customerName}, sua peça entrou na fase de pintura! 🎨 Estou caprichando em cada detalhe para ficar perfeita! 💚`,
    CURA: `${customerName}, a pintura está pronta! Agora sua peça está no processo de cura para garantir durabilidade e qualidade. ✨`,
    INSPECAO: `${customerName}, estou fazendo a inspeção final da sua peça! Garantindo que cada detalhe esteja impecável! 👀💚`,
    EMBALAGEM: `${customerName}, sua peça está sendo embalada com muito carinho! Logo estará pronta para partir! 📦✨`,
    ENVIADO: `${customerName}, sua peça já foi enviada! 🚚💚 Em breve você terá em mãos essa exclusividade! Código de rastreio: `,
  }

  const baseMessage = statusMessages[status] || `${customerName}, seu pedido foi atualizado! 💚`

  return `${baseMessage}\n\nPedido: #${orderNumber}\n\nQualquer dúvida, estou aqui! ✨\n\nCom carinho,\nLaura 💚`
}
