# 💚 Laura Verissimo Atelier - Sistema Completo

> **E-commerce Artesanal Premium com CRM Persona-Centric e Inteligência Artificial**

---

## 🎨 Visão Geral

Sistema de gestão completo para ateliê de taças e cristais pintados à mão, combinando:
- 🛒 **E-commerce** com carrinho inteligente
- 👥 **CRM Avançado** com ranking VIP automático
- 🎨 **IA Generativa** (Nano Banana Pro - OpenAI)
- 📦 **Gestão de Estoque** com alertas críticos
- 💰 **Engenharia Financeira** com cálculo automático de lucro
- 📊 **Dashboard Analytics** em tempo real
- 💬 **Integração WhatsApp** para checkout e marketing

---

## 🏗️ Stack Tecnológica

- **Framework:** Next.js 15+ (App Router)
- **Linguagem:** TypeScript
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Validação:** Zod
- **IA:** OpenAI GPT-4o-mini + DALL-E 3
- **Estilo:** Tailwind CSS (Emerald Glass Theme #304930)
- **Deployment:** Vercel / Railway

---

## 📂 Estrutura do Projeto

```
laura-verissimo-atelier/
├── prisma/
│   └── schema.prisma              # Modelagem completa do banco
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── admin/                 # Interface Admin (Antigravity)
│   │   └── layout.tsx             # Layout com CartProvider
│   ├── lib/
│   │   ├── actions/               # Server Actions
│   │   │   ├── crm.actions.ts     # CRM & Ranking
│   │   │   ├── dashboard.actions.ts
│   │   │   ├── orders.actions.ts
│   │   │   ├── inventory.actions.ts
│   │   │   ├── finance.actions.ts
│   │   │   └── ai.actions.ts      # Nano Banana Pro
│   │   ├── validations/
│   │   │   └── schemas.ts         # Zod Schemas
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   └── whatsapp.ts        # Mensagens formatadas
│   │   └── prisma.ts              # Singleton Client
│   └── contexts/
│       └── CartContext.tsx        # Provider do Carrinho
├── .env                           # Variáveis de ambiente
├── BACKEND_DOCUMENTATION.md       # Documentação técnica completa
├── QUICK_START.md                 # Guia de instalação rápida
└── USAGE_EXAMPLES.md              # Exemplos de código
```

---

## 🚀 Quick Start

### 1. Instalação
```bash
npm install
```

### 2. Configurar `.env`
```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
OPENAI_API_KEY="sk-..."
NEXT_PUBLIC_WHATSAPP_NUMBER="5511999999999"
```

### 3. Setup Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Iniciar
```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

👉 **Para instruções detalhadas:** [QUICK_START.md](QUICK_START.md)

---

## 💎 Funcionalidades Principais

### 🎯 CRM Persona-Centric
- **Ranking Automático:** NOVO → BRONZE → PRATA → OURO → PLATINA → VIP
- **Segmentação Inteligente:** Potencial, Recorrente, Em Risco, Inativo, Champion
- **LTV Calculado:** Lifetime Value atualizado automaticamente
- **Perfil de Estilo:** Campo "Vibração de Estilo" para personalização

### 🛒 E-commerce
- Carrinho com Local Storage
- Produtos com múltiplas variantes (modelo, cor, capacidade)
- Checkout via WhatsApp com mensagem formatada e carinhosa
- Campo "Recadinho Especial" para personalização

### 🏭 Gestão de Produção
- Workflow granular: Preparo → Pintura → Cura → Inspeção → Acabamento → Embalagem
- Timeline visual de produção
- Alertas de prazo de entrega

### 📦 Estoque Inteligente
- Alertas automáticos de estoque crítico
- Histórico completo de movimentações
- Vínculo direto com fornecedores
- WhatsApp para pedidos rápidos

### 💰 Financeiro
- Cálculo automático de lucro por pedido
- Impostos: 6.93% (Simples Nacional)
- Taxas: 3% (Gateway de pagamento)
- Insights por categoria
- Gráficos de evolução

### 🤖 Nano Banana Pro (IA)
- Refinamento de prompts com GPT-4o-mini
- Geração de arte com DALL-E 3
- Armazenamento de imagens sem marca d'água
- Aprovação e uso em produtos

---

## 📊 Server Actions Disponíveis

### CRM
```typescript
getDashboardMetrics()
getClientsWithMetrics()
getTopClients()
updateClientMetrics()
calculateClientRanking()
```

### Pedidos
```typescript
createOrder()
updateOrderStatus()
updateProductionStatus()
getOrdersInProduction()
```

### Estoque
```typescript
getCriticalStockAlerts()
registerStockEntry()
registerProductionUsage()
```

### Financeiro
```typescript
calculateOrderProfit()
getFinanceMetrics()
getCategoryInsights()
```

### IA
```typescript
generateCompleteArt()
refineArtPrompt()
generateArtImage()
```

👉 **Documentação completa:** [BACKEND_DOCUMENTATION.md](BACKEND_DOCUMENTATION.md)
👉 **Exemplos de uso:** [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)

---

## 🔄 Workflows Automáticos

### Ao Pagar Pedido
1. ✅ Registra receita no financeiro
2. ✅ Calcula lucro líquido automaticamente
3. ✅ Inicia produção (status → PREPARO)
4. ✅ Reserva estoque de insumos
5. ✅ Atualiza métricas do cliente (LTV, Ranking)

### Ao Concluir Produção
1. ✅ Muda status para PRONTO_PARA_ENVIO
2. ✅ Notifica cliente (futuro)

### Ao Entregar Pedido
1. ✅ Recalcula todas as métricas do cliente
2. ✅ Atualiza Ranking e Segmentação

---

## 📈 Métricas & Analytics

### Dashboard em Tempo Real
- Faturamento total e mensal
- Crescimento percentual
- Pedidos em produção
- Novos clientes
- Itens de estoque em falta

### Gráficos
- Receita mensal (6 meses)
- Distribuição de produção
- Top 10 produtos
- Lucro por categoria

---

## 💬 Integração WhatsApp

### Mensagens Geradas Automaticamente
- ✅ Checkout (mensagem fofa e profissional)
- ✅ Boas-vindas (novos clientes)
- ✅ Recuperação (clientes em risco)
- ✅ Agradecimento pós-compra
- ✅ Atualização de status

---

## 🎨 Design Premium (Antigravity)

- **Cor Principal:** Emerald Green #304930
- **Estilo:** Glassmorphism Premium
- **Tipografia:** Elegante e sofisticada
- **UX:** Focada em luxo artesanal

---

## 📚 Documentação

- 📘 [BACKEND_DOCUMENTATION.md](BACKEND_DOCUMENTATION.md) - Documentação técnica completa
- 🚀 [QUICK_START.md](QUICK_START.md) - Guia de instalação rápida
- 💻 [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) - Exemplos práticos de código

---

## 🔒 Segurança & Validações

- ✅ Validação robusta com Zod em todos os inputs
- ✅ Sanitização de dados
- ✅ Server Actions (sem exposição de API)
- ✅ Variáveis de ambiente protegidas
- ✅ Prisma com prepared statements (anti-SQL injection)

---

## 🚀 Deploy

### Vercel (Recomendado)
```bash
vercel --prod
```

### Railway
```bash
railway up
```

👉 **Importante:** Configure as variáveis de ambiente no painel do serviço de deploy.

---

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm run start

# Prisma Studio (GUI do banco)
npx prisma studio

# Gerar Prisma Client
npx prisma generate

# Migrations
npx prisma db push
```

---

## 📦 Próximas Integrações

- [ ] WhatsApp Business API (Robô IA)
- [ ] Gateway de Pagamento (Stripe/Mercado Pago)
- [ ] Cálculo de Frete por CEP
- [ ] Sistema de Notificações (Email/Push)
- [ ] Upload de Imagens (Supabase Storage)
- [ ] Relacionamento Produto → Insumos (BOM)

---

## 👨‍💻 Desenvolvido por

**Engenheiro de Software Master**
- Backend & Lógica Operacional
- Especializado em Next.js 15+, Prisma, Server Actions
- Padrão de Alta Performance (Pátio Rocha Leilões)

**Antigravity (Gemini)**
- Interface Visual Premium
- Design Emerald Glass #304930
- UX Luxuosa e Sofisticada

---

## 📄 Licença

Proprietário - Laura Verissimo Atelier

---

## 💚 Filosofia do Sistema

✨ **Cada transação é ultra-rápida**
💚 **Cada mensagem é carinhosa**
🏆 **Cada cliente é tratado como VIP**
📊 **Cada decisão é baseada em dados**
🤖 **A IA ajuda, mas o toque humano comanda**

---

**Versão:** 1.0.0
**Data:** 2026-03-13
**Status:** ✅ Backend 100% Operacional
