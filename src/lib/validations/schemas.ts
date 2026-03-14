// LAURA VERISSIMO ATELIER - ZOD VALIDATION SCHEMAS
// Validações robustas para todos os módulos

import { z } from 'zod'

// ========================================
// SCHEMAS DE CLIENTES (CRM)
// ========================================

export const clientSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone deve ter no mínimo 10 dígitos').max(15),
  cpf: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  zipCode: z.string().optional(),
  styleVibe: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  emailOptIn: z.boolean().optional().default(true),
  whatsappOptIn: z.boolean().optional().default(true),
})

export const updateClientSchema = clientSchema.partial()

// ========================================
// SCHEMAS DE PRODUTOS & VARIANTES
// ========================================

export const productSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(200),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  category: z.string().min(2),
  basePrice: z.number().positive('Preço deve ser maior que zero'),
  isActive: z.boolean().optional().default(true),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  tags: z.array(z.string()).optional(),
})

export const productVariantSchema = z.object({
  productId: z.string().cuid(),
  model: z.string().min(2, 'Modelo deve ter no mínimo 2 caracteres'),
  color: z.string().min(2, 'Cor deve ter no mínimo 2 caracteres'),
  capacity: z.string().min(2, 'Capacidade deve ter no mínimo 2 caracteres'),
  imageUrls: z.array(z.string().url('URL de imagem inválida')).optional(),
  stockQty: z.number().int().nonnegative('Estoque não pode ser negativo').optional().default(0),
  priceAdjust: z.number().optional().default(0),
  sku: z.string().min(3, 'SKU deve ter no mínimo 3 caracteres'),
})

// ========================================
// SCHEMAS DE PEDIDOS
// ========================================

export const orderSchema = z.object({
  clientId: z.string().cuid(),
  subtotal: z.number().positive(),
  shippingFee: z.number().nonnegative(),
  total: z.number().positive(),
  estimatedProductionDays: z.number().int().positive().min(7).max(30),
  estimatedDeliveryDate: z.date().optional(),
  specialMessage: z.string().max(500).optional(),
  internalNotes: z.string().max(1000).optional(),
})

export const orderItemSchema = z.object({
  orderId: z.string().cuid(),
  productId: z.string().cuid(),
  variantId: z.string().cuid(),
  quantity: z.number().int().positive('Quantidade deve ser maior que zero'),
  unitPrice: z.number().positive('Preço unitário deve ser maior que zero'),
  subtotal: z.number().positive(),
})

export const updateOrderStatusSchema = z.object({
  orderId: z.string().cuid(),
  status: z.enum([
    'AGUARDANDO_PAGAMENTO',
    'PAGO',
    'EM_PRODUCAO',
    'PRONTO_PARA_ENVIO',
    'ENVIADO',
    'ENTREGUE',
    'CANCELADO',
  ]),
})

export const updateProductionStatusSchema = z.object({
  orderId: z.string().cuid(),
  productionStatus: z.enum([
    'NAO_INICIADO',
    'PREPARO',
    'PINTURA',
    'CURA',
    'INSPECAO',
    'ACABAMENTO',
    'EMBALAGEM',
    'CONCLUIDO',
  ]),
})

// ========================================
// SCHEMAS DE ESTOQUE & FORNECEDORES
// ========================================

export const supplierSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(200),
  contactName: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().min(10, 'Telefone deve ter no mínimo 10 dígitos'),
  whatsappUrl: z.string().url('URL inválida').optional(),
  qualityRating: z.number().int().min(1).max(5).optional().default(3),
  leadTimeDays: z.number().int().positive().optional().default(7),
})

export const supplySchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(200),
  category: z.enum(['CRISTAL', 'TINTA', 'PINCEL', 'EMBALAGEM', 'ACESSORIO', 'OUTRO']),
  sku: z.string().min(3, 'SKU deve ter no mínimo 3 caracteres'),
  supplierId: z.string().cuid().optional(),
  currentStock: z.number().int().nonnegative().optional().default(0),
  minStockLevel: z.number().int().positive().optional().default(10),
  unit: z.string().min(1, 'Unidade deve ser informada'),
  unitCost: z.number().positive('Custo unitário deve ser maior que zero'),
})

export const stockMovementSchema = z.object({
  supplyId: z.string().cuid(),
  type: z.enum(['ENTRADA', 'SAIDA_PRODUCAO', 'AJUSTE', 'PERDA']),
  quantity: z.number().int().positive('Quantidade deve ser maior que zero'),
  orderId: z.string().cuid().optional(),
  supplierId: z.string().cuid().optional(),
  notes: z.string().max(500).optional(),
})

// ========================================
// SCHEMAS DE FINANCEIRO
// ========================================

export const financeEntrySchema = z.object({
  type: z.enum(['RECEITA', 'DESPESA']),
  category: z.string().min(2, 'Categoria deve ser informada'),
  amount: z.number().positive('Valor deve ser maior que zero'),
  description: z.string().min(5, 'Descrição deve ter no mínimo 5 caracteres'),
  orderId: z.string().cuid().optional(),
  costOfGoods: z.number().nonnegative().optional(),
  profit: z.number().optional(),
})

// ========================================
// SCHEMAS DE MARKETING
// ========================================

export const marketingLogSchema = z.object({
  clientId: z.string().cuid(),
  channel: z.enum(['EMAIL', 'WHATSAPP', 'SMS']),
  subject: z.string().max(200).optional(),
  content: z.string().min(10, 'Conteúdo deve ter no mínimo 10 caracteres'),
  status: z.enum(['ENVIADO', 'ENTREGUE', 'ABERTO', 'CLICADO', 'ERRO']).optional().default('ENVIADO'),
})

// ========================================
// SCHEMAS DE IA (Nano Banana Pro)
// ========================================

export const generateArtSchema = z.object({
  originalPrompt: z.string().min(5, 'Prompt deve ter no mínimo 5 caracteres').max(500),
  style: z.string().optional().default('Aquarela elegante'),
})

export const approveArtSchema = z.object({
  artId: z.string().cuid(),
})

export const updateArtImageSchema = z.object({
  artId: z.string().cuid(),
  cleanImageUrl: z.string().url('URL de imagem inválida'),
})

// ========================================
// SCHEMAS DE AGENDA
// ========================================

export const productionEventSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres').max(200),
  description: z.string().max(1000).optional(),
  date: z.date(),
  eventType: z.enum(['PRODUCAO', 'ENTREGA', 'FEIRA', 'OUTRO']),
  orderId: z.string().cuid().optional(),
  completed: z.boolean().optional().default(false),
})

// ========================================
// SCHEMAS DE CONFIGURAÇÕES
// ========================================

export const settingsSchema = z.object({
  logoUrl: z.string().url('URL de logo inválida').optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor primária inválida').optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor secundária inválida').optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor de destaque inválida').optional(),
  bannersJson: z.string().optional(),
  minProductionDays: z.number().int().positive().min(1).max(60).optional(),
  maxProductionDays: z.number().int().positive().min(1).max(90).optional(),
  shippingInfo: z.string().max(500).optional(),
  whatsappNumber: z.string().min(10).max(20).optional(),
  whatsappMessage: z.string().max(1000).optional(),
  openaiApiKey: z.string().optional(),
})

// ========================================
// SCHEMAS DE CHECKOUT (Frontend)
// ========================================

export const checkoutSchema = z.object({
  customerName: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  customerEmail: z.string().email('Email inválido'),
  customerPhone: z.string().min(10, 'Telefone deve ter no mínimo 10 dígitos'),
  specialMessage: z.string().max(500).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  zipCode: z.string().optional(),
})

// ========================================
// TIPOS INFERIDOS
// ========================================

export type ClientInput = z.infer<typeof clientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
export type ProductInput = z.infer<typeof productSchema>
export type ProductVariantInput = z.infer<typeof productVariantSchema>
export type OrderInput = z.infer<typeof orderSchema>
export type OrderItemInput = z.infer<typeof orderItemSchema>
export type SupplierInput = z.infer<typeof supplierSchema>
export type SupplyInput = z.infer<typeof supplySchema>
export type StockMovementInput = z.infer<typeof stockMovementSchema>
export type FinanceEntryInput = z.infer<typeof financeEntrySchema>
export type MarketingLogInput = z.infer<typeof marketingLogSchema>
export type GenerateArtInput = z.infer<typeof generateArtSchema>
export type ProductionEventInput = z.infer<typeof productionEventSchema>
export type SettingsInput = z.infer<typeof settingsSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
