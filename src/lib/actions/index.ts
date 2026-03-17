// LAURA VERISSIMO ATELIER - ACTIONS INDEX
// Centralizador de importações para facilitar o uso

// CRM Actions
export * from './crm.actions'
export { 
  getClientsWithMetrics as getClients, 
  getCRMMetrics as getClientMetrics 
} from './crm.actions'

// Dashboard Analytics
export * from './dashboard.actions'

// Orders Management
export * from './orders.actions'

// Inventory & Stock
export * from './inventory.actions'

// Finance Engine
export * from './finance.actions'

// AI (Nano Banana Pro)
export * from './ai.actions'

// Products & Catalog
export * from './products.actions'

// System Config
export * from './config.actions'

// Shipping (Melhor Envio)
export * from './shipping.actions'

// Payments (Mercado Pago)
export * from './payments.actions'
