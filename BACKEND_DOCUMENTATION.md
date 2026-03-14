# 🎨 LAURA VERISSIMO ATELIER - BACKEND DOCUMENTATION

## 📋 Arquitetura Técnica

Sistema de E-commerce Artesanal Premium com CRM Persona-Centric, gestão de produção granular e inteligência artificial para criação de arte.

---

## 🏗️ Estrutura do Projeto

```
src/
├── lib/
│   ├── actions/           # Server Actions (Next.js 15+)
│   │   ├── crm.actions.ts        # CRM & Ranking VIP
│   │   ├── dashboard.actions.ts  # Analytics & Métricas
│   │   ├── orders.actions.ts     # Workflow de Pedidos
│   │   ├── inventory.actions.ts  # Gestão de Estoque
│   │   ├── finance.actions.ts    # Engenharia Financeira
│   │   └── ai.actions.ts         # Nano Banana Pro (OpenAI)
│   ├── validations/       # Schemas Zod
│   │   └── schemas.ts
│   ├── utils/             # Utilitários
│   │   ├── formatters.ts  # Formatação de dados
│   │   └── whatsapp.ts    # Geração de mensagens
│   └── prisma.ts          # Singleton Prisma Client
├── contexts/
│   └── CartContext.tsx    # Provider do Carrinho
└── app/
    └── admin/             # Interfaces Admin (Antigravity)

prisma/
└── schema.prisma          # Modelagem de Dados
```

---

## 🗄️ DATABASE SCHEMA (Prisma)

### 📊 Modelos Principais

#### 1. **Client** (CRM Persona-Centric)
```prisma
- Dados pessoais completos
- Ranking automático: NOVO → BRONZE → PRATA → OURO → PLATINA → VIP
- Segmentação comportamental: POTENCIAL, RECORRENTE, EM_RISCO, INATIVO, CHAMPION
- LTV (Lifetime Value) calculado automaticamente
- Campo styleVibe (Vibração de Estilo)
```

#### 2. **Product & ProductVariant**
```prisma
- Produtos base com preço e descrição
- Variantes: modelo, cor, capacidade
- Imagens específicas por variante
- Gestão de estoque por SKU
```

#### 3. **Order & OrderItem**
```prisma
- Workflow granular de status
- Produção: PREPARO → PINTURA → CURA → INSPEÇÃO → ACABAMENTO → EMBALAGEM
- Campo specialMessage ("Recadinho Especial")
- Cálculo automático de lucro
```

#### 4. **Supply & Supplier** (Gestão de Estoque)
```prisma
- Insumos categorizados (CRISTAL, TINTA, PINCEL, EMBALAGEM)
- Alerta automático de estoque baixo
- Fornecedores com rating de qualidade
- Histórico completo de movimentações
```

#### 5. **FinanceEntry** (Engenharia Financeira)
```prisma
- Entradas e saídas categorizadas
- Cálculo automático de lucro por pedido
- Impostos: 6.93% (Simples Nacional)
- Taxas: 3% (Gateway de pagamento)
```

#### 6. **AIGeneratedArt** (Nano Banana Pro)
```prisma
- Prompts originais e refinados
- URLs de imagens (com e sem marca d'água)
- Metadata: estilo, cores
- Status de aprovação
```

---

## 🔧 SERVER ACTIONS

### 📈 CRM Actions ([crm.actions.ts](src/lib/actions/crm.actions.ts))

```typescript
// Cálculo Automático de Ranking
calculateClientRanking(totalOrders) → ClientRanking

// Segmentação Comportamental
calculateClientSegment(totalOrders, lastPurchaseAt, LTV) → ClientSegment

// Atualizar Métricas (Chamado após cada compra)
updateClientMetrics(clientId) → { success, client }

// Listar Clientes com Filtros
getClientsWithMetrics({ segment?, ranking?, search? })

// Top Clientes (VIPs & Champions)
getTopClients(limit)

// Clientes em Risco (Para Marketing)
getAtRiskClients()
```

**Lógica de Ranking:**
- 1 pedido → NOVO
- 2-3 pedidos → BRONZE
- 4-6 pedidos → PRATA
- 7-10 pedidos → OURO
- 11+ pedidos → PLATINA
- Manual → VIP

**Lógica de Segmentação:**
- Sem compras → POTENCIAL
- Comprou < 90 dias → RECORRENTE
- 90-180 dias sem compra → EM_RISCO
- 180+ dias → INATIVO
- Alto LTV + Alta Frequência → CHAMPION

---

### 📊 Dashboard Actions ([dashboard.actions.ts](src/lib/actions/dashboard.actions.ts))

```typescript
// Métricas Gerais
getDashboardMetrics() → {
  totalRevenue, monthlyRevenue, revenueGrowth,
  totalOrders, monthlyOrders,
  totalClients, newClientsThisMonth,
  ordersInProduction, ordersReadyToShip,
  lowStockItems
}

// Faturamento por Mês (Gráfico)
getMonthlyRevenue(months) → { month, revenue, orders }[]

// Distribuição de Produção
getProductionStatusDistribution() → { status, count, percentage }[]

// Top 10 Produtos
getTopProducts(limit) → { id, name, totalSold, revenue }[]

// Itens em Falta
getLowStockSupplies() → Supply[]
```

---

### 🛒 Orders Actions ([orders.actions.ts](src/lib/actions/orders.actions.ts))

```typescript
// Criar Pedido
createOrder({ clientId, items, shippingFee, specialMessage })

// Atualizar Status
updateOrderStatus(orderId, newStatus)
// Automações:
// - PAGO → Registra receita + Inicia produção + Reserva estoque
// - ENTREGUE → Atualiza métricas do cliente

// Atualizar Produção
updateProductionStatus(orderId, newStatus)
// CONCLUIDO → Muda status para PRONTO_PARA_ENVIO

// Adicionar Rastreamento
addTrackingCode(orderId, trackingCode)

// Listar Pedidos
getOrders({ status?, productionStatus?, clientId? })

// Cancelar Pedido
cancelOrder(orderId, reason)
// - Estorna receita se já foi paga
// - Recalcula métricas do cliente
```

---

### 📦 Inventory Actions ([inventory.actions.ts](src/lib/actions/inventory.actions.ts))

```typescript
// Atualizar Status de Estoque Baixo (Cron)
updateLowStockStatus()

// Alertas Críticos
getCriticalStockAlerts() → StockAlert[]

// Registrar Movimentação
registerStockMovement({ supplyId, type, quantity, orderId? })
// Tipos: ENTRADA, SAIDA_PRODUCAO, AJUSTE, PERDA

// Entrada (Compra)
registerStockEntry({ supplyId, quantity, supplierId })

// Saída (Produção)
registerProductionUsage({ supplyId, quantity, orderId })

// Métricas
getInventoryMetrics() → {
  totalSupplies, lowStockCount, outOfStockCount,
  totalValue, categoryCounts
}
```

---

### 💰 Finance Actions ([finance.actions.ts](src/lib/actions/finance.actions.ts))

```typescript
// Calcular Lucro de Pedido
calculateOrderProfit(orderId) → {
  revenue, costOfGoods, grossProfit,
  taxes (6.93%), fees (3%),
  netProfit, profitMargin
}

// Registrar Venda (Automático ao Pagar)
registerSaleRevenue(orderId)

// Registrar Despesa
registerExpense({ category, amount, description })

// Métricas Financeiras
getFinanceMetrics(period?) → {
  totalRevenue, totalExpenses, netProfit, profitMargin,
  monthlyRevenue, monthlyExpenses, monthlyProfit
}

// Insights por Categoria
getCategoryInsights() → { category, revenue, expenses, profit }[]

// Dados Mensais (Gráfico)
getMonthlyFinanceData(months) → { month, revenue, expenses, profit }[]
```

**Fórmula de Lucro:**
```
Receita Bruta
- Custo dos Produtos (40% estimado)
= Lucro Bruto
- Impostos (6.93%)
- Taxas de Pagamento (3%)
= Lucro Líquido
```

---

### 🤖 AI Actions ([ai.actions.ts](src/lib/actions/ai.actions.ts))

```typescript
// Refinar Prompt (GPT-4o-mini)
refineArtPrompt(originalPrompt, style?) → {
  success, refinedPrompt
}

// Gerar Imagem (DALL-E 3)
generateArtImage(refinedPrompt, originalPrompt, style)

// Fluxo Completo
generateCompleteArt(originalPrompt, style?) → {
  success, artId, imageUrl, refinedPrompt
}

// Aprovar Arte
approveGeneratedArt(artId)

// Upload Imagem Limpa
updateArtWithCleanImage(artId, cleanImageUrl)
```

---

## 🛍️ CART PROVIDER ([CartContext.tsx](src/contexts/CartContext.tsx))

```typescript
// Estado do Carrinho (Local Storage)
interface CartItem {
  productId, productName,
  variantId, variantModel, variantColor, variantCapacity,
  imageUrl, quantity, unitPrice, subtotal, sku
}

// Métodos
addItem(item)           // Adiciona ou incrementa
removeItem(variantId)
updateQuantity(variantId, quantity)
clearCart()
calculateShipping()     // Frete fixo: R$ 25,00

// Métricas
itemCount, subtotal, shippingFee, total
```

---

## 💬 WHATSAPP UTILITIES ([whatsapp.ts](src/lib/utils/whatsapp.ts))

```typescript
// Mensagem de Checkout
generateWhatsAppCheckoutMessage(data: CheckoutData) → string
// Formato fofo e profissional com:
// - Dados do cliente
// - Itens do pedido detalhados
// - Valores formatados
// - Recadinho especial

// URL do WhatsApp
generateWhatsAppURL(data, whatsappNumber?) → string

// Mensagens de Marketing
generateRecoveryMessage(customerName, daysInactive)
generateWelcomeMessage(customerName)
generateThankYouMessage(customerName, orderNumber)
generateStatusUpdateMessage(customerName, orderNumber, status)
```

---

## ✅ VALIDATIONS (Zod)

Todos os schemas em [schemas.ts](src/lib/validations/schemas.ts):

```typescript
// Principais
clientSchema, productSchema, productVariantSchema
orderSchema, orderItemSchema
supplySchema, supplierSchema, stockMovementSchema
financeEntrySchema, generateArtSchema
checkoutSchema
```

---

## 🎯 WORKFLOWS AUTOMÁTICOS

### 1. **Ao Pagar Pedido (Status → PAGO)**
```
1. Registra receita no financeiro (com cálculo de lucro)
2. Inicia produção (PREPARO)
3. Reserva estoque de insumos
4. Atualiza métricas do cliente (LTV, Ranking, Segmento)
```

### 2. **Ao Concluir Produção (Status → CONCLUIDO)**
```
1. Muda status geral para PRONTO_PARA_ENVIO
```

### 3. **Ao Entregar Pedido (Status → ENTREGUE)**
```
1. Recalcula métricas do cliente
2. Incrementa totalOrders, LTV, averageTicket
3. Atualiza lastPurchaseAt
4. Recalcula Ranking e Segmentação
```

### 4. **Ao Adicionar Insumo (Estoque)**
```
1. Verifica se currentStock <= minStockLevel
2. Atualiza campo isLowStock automaticamente
```

---

## 🚀 SETUP & DEPLOYMENT

### 1. **Instalar Dependências**
```bash
npm install
```

### 2. **Configurar Variáveis de Ambiente (.env)**
```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
OPENAI_API_KEY="sk-..."
NEXT_PUBLIC_WHATSAPP_NUMBER="5511999999999"
NEXTAUTH_SECRET="..."
```

### 3. **Rodar Migrations**
```bash
npx prisma generate
npx prisma db push
```

### 4. **Seed Inicial (Opcional)**
```bash
npx prisma db seed
```

### 5. **Iniciar Servidor**
```bash
npm run dev
```

---

## 📌 PRÓXIMOS PASSOS

### Integrações Pendentes:
- [ ] **WhatsApp Business API** (Robô IA)
- [ ] **Cálculo de Frete por CEP** (API dos Correios)
- [ ] **Gateway de Pagamento** (Stripe/Mercado Pago)
- [ ] **Upload de Imagens** (Supabase Storage)
- [ ] **Relacionamento Produto → Insumos** (BOM - Bill of Materials)

### Melhorias Futuras:
- [ ] Sistema de Notificações (Email/Push)
- [ ] Relatórios PDF de Pedidos
- [ ] Exportação de Dados (Excel/CSV)
- [ ] Multi-tenancy (Vários Ateliês)
- [ ] App Mobile (React Native)

---

## 🎨 PADRÃO PREMIUM

✨ **Todas as transações são ultra-rápidas**
💚 **Mensagens sempre fofas e profissionais**
🏆 **CRM orientado a personas e relacionamento**
📊 **Analytics em tempo real**
🤖 **IA integrada para arte e marketing**

---

## 👨‍💻 Desenvolvido por

**Engenheiro de Software Master**
Especializado em Next.js 15+, Prisma, Supabase e Server Actions

**Padrão de Código:** Pátio Rocha Leilões
**Design Premium:** Antigravity (Gemini) - Emerald Glass #304930

---

**Versão:** 1.0.0
**Última Atualização:** 2026-03-13
