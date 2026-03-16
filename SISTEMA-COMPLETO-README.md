# 🎨 Laura Veríssimo Atelier - Sistema Completo de E-commerce

## ✅ O QUE FOI IMPLEMENTADO

### 1. **Backend Completo com Prisma**

#### 🗄️ Novos Modelos de Banco de Dados:
- ✅ **User** - Sistema de autenticação de usuários
- ✅ **Session** - Gerenciamento de sessões de login
- ✅ **Message** - Sistema de chat em tempo real
- ✅ **Payment** - Rastreamento completo de pagamentos

#### 📋 Schema Atualizado:
Arquivo: `prisma/schema.prisma`
- Adicionadas relações entre User ↔ Client
- Adicionadas relações entre Order ↔ Payment
- Enums: SenderType, PaymentMethod, PaymentStatus

### 2. **Server Actions (src/lib/actions/)**

#### 🔐 Auth Actions (`auth.actions.ts`):
- `registerUser(data)` - Registro de novos usuários
- `loginUser(data)` - Login com email e senha
- `logoutUser()` - Encerrar sessão
- `getCurrentSession()` - Obter usuário logado
- `linkClientToUser(userId, clientId)` - Vincular cliente ao usuário
- `getUserById(userId)` - Buscar informações do usuário

#### 💬 Messages Actions (`messages.actions.ts`):
- `sendMessage(data)` - Enviar mensagem
- `getUserMessages(userId)` - Listar mensagens do usuário
- `getOrderMessages(orderId)` - Mensagens de um pedido específico
- `markMessageAsRead(messageId)` - Marcar como lida
- `markAllUserMessagesAsRead(userId)` - Marcar todas como lidas
- `getUnreadCount(userId)` - Contador de não lidas
- `getAllConversations()` - [ADMIN] Todas as conversas
- `deleteMessage(messageId)` - Deletar mensagem

#### 💳 Payments Actions (`payments.actions.ts`):
- `createPayment(data)` - Criar registro de pagamento
- `updatePaymentStatus(paymentId, status)` - Atualizar status
- `getPaymentByOrderId(orderId)` - Buscar pagamento por pedido
- `getPaymentByExternalId(externalId)` - Buscar por ID do Mercado Pago
- `processMercadoPagoWebhook(data)` - Processar webhook do MP
- `getAllPayments(filters)` - Listar todos pagamentos
- `addPaymentProof(paymentId, imageUrl)` - Adicionar comprovante

#### 📦 Orders Actions (atualizado em `orders.actions.ts`):
- `getUserOrders(clientId)` - **NOVO** - Listar pedidos do cliente logado
- (Mantidas todas as funções existentes)

### 3. **Página de Perfil do Cliente**

Arquivo: `src/app/perfil/page.tsx`

#### 📱 3 Abas Completas:

**Aba 1: Meus Pedidos**
- Lista todos os pedidos do cliente
- Status visual com ícones e cores
- Expansível para ver detalhes (itens, valores, frete)
- Status disponíveis:
  - ⏳ Aguardando Pagamento
  - ✅ Pago
  - 🎨 Em Produção
  - 📦 Pronto para Envio
  - 🚚 Enviado
  - 🎁 Entregue
  - ❌ Cancelado

**Aba 2: Chat com Ateliê**
- Chat em tempo real
- Auto-refresh a cada 10 segundos
- Contador de mensagens não lidas
- Diferenciação visual: mensagens do cliente (verde escuro) vs ateliê (branco)
- Input com botão de envio
- Scroll automático para última mensagem

**Aba 3: Meus Dados**
- Card de Status VIP (baseado em quantidade de pedidos)
- Informações pessoais (nome, email)
- Estatísticas:
  - Total de pedidos
  - Valor total gasto

### 4. **Arquivos de Documentação**

#### 📄 DATABASE-SETUP.md
Guia passo a passo para executar o SQL no Supabase

#### 📄 manual-migration.sql
Script SQL completo para criar as novas tabelas:
- User
- Session
- Message
- Payment
- Enums (SenderType, PaymentMethod, PaymentStatus)

---

## 🚀 PRÓXIMOS PASSOS PARA DEPLOY

### Passo 1: Executar SQL no Supabase

1. Acesse: https://supabase.com/dashboard/project/syilqqtgphpqdamvvazn/sql/new
2. Cole todo o conteúdo de `manual-migration.sql`
3. Execute o SQL
4. Verifique se as 4 tabelas foram criadas

### Passo 2: Instalar Dependências Faltantes

Adicione ao projeto:

```bash
npm install bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

### Passo 3: Criar Páginas de Login e Registro

Criar arquivos:
- `src/app/login/page.tsx` - Página de login
- `src/app/registro/page.tsx` - Página de cadastro

(Exemplos serão fornecidos se necessário)

### Passo 4: Atualizar o Checkout

Modificar `src/app/checkout/page.tsx` para:

1. **Antes de criar pedido**, verificar se usuário está logado:
```typescript
import { getCurrentSession } from '@/lib/actions/auth.actions'
import { createOrder } from '@/lib/actions/orders.actions'
import { createPayment } from '@/lib/actions/payments.actions'

const session = await getCurrentSession()
if (!session) {
  router.push('/login?redirect=/checkout')
  return
}
```

2. **Criar pedido no banco** antes de redirecionar para Mercado Pago:
```typescript
const orderResult = await createOrder({
  clientId: session.clientId,
  clientData: !session.clientId ? {
    name: form.name + ' ' + form.surname,
    email: form.email,
    phone: form.phone,
    address: `${form.street}, ${form.number}, ${form.city} - ${form.state}, ${form.cep}`
  } : undefined,
  items: items.map(item => ({
    productId: item.product.id,
    variantId: item.variant.id,
    quantity: item.quantity,
    unitPrice: item.variant.price
  })),
  shippingFee: selectedShipping.price,
  specialMessage: form.specialMessage,
  estimatedProductionDays: 7
})

if (!orderResult.success) {
  toast.error('Erro ao criar pedido')
  return
}

const order = orderResult.order
```

3. **Criar registro de pagamento**:
```typescript
await createPayment({
  orderId: order.id,
  paymentMethod: 'MERCADO_PAGO',
  amount: order.total,
  preferenceId: mercadoPagoPreferenceId,
  payerEmail: form.email,
  payerName: form.name + ' ' + form.surname
})
```

4. **Redirecionar** para Mercado Pago normalmente

### Passo 5: Configurar Webhook do Mercado Pago (Opcional)

Criar `src/app/api/webhooks/mercadopago/route.ts`:

```typescript
import { processMercadoPagoWebhook } from '@/lib/actions/payments.actions'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  await processMercadoPagoWebhook(body)
  return NextResponse.json({ received: true })
}
```

Configurar no Mercado Pago:
- URL: `https://seu-dominio.vercel.app/api/webhooks/mercadopago`
- Eventos: `payment.created`, `payment.updated`

### Passo 6: Deploy no Vercel

```bash
git add .
git commit -m "feat: Sistema completo de autenticação, pedidos, chat e pagamentos"
git push origin main
```

O Vercel fará deploy automático.

---

## 🎯 FLUXO COMPLETO DO USUÁRIO

### 1. Novo Usuário:
1. Acessa o site
2. Navega pelos produtos
3. Adiciona ao carrinho
4. Vai para checkout
5. **Precisa fazer login/registro** ← NOVO!
6. Preenche dados de entrega
7. Escolhe frete
8. Clica em "Finalizar Pedido"
9. **Sistema cria:**
   - Cliente (se novo)
   - Pedido
   - Itens do pedido
   - Registro de pagamento
10. Redireciona para Mercado Pago
11. Após pagar, volta para o site
12. **Acessa `/perfil`** para ver o pedido

### 2. Usuário Retornando:
1. Faz login
2. Acessa `/perfil`
3. Vê todos os pedidos anteriores
4. Pode conversar com o ateliê via chat
5. Acompanha status de produção em tempo real

---

## 📊 MÉTRICAS E ESTATÍSTICAS

O sistema agora rastreia:
- ✅ Total de pedidos por cliente
- ✅ Valor total gasto (Lifetime Value)
- ✅ Ranking automático (NOVO → BRONZE → PRATA → OURO → PLATINA → VIP)
- ✅ Segmentação (POTENCIAL, RECORRENTE, EM_RISCO, INATIVO, CHAMPION)
- ✅ Histórico completo de pagamentos
- ✅ Mensagens trocadas com cada cliente

---

## 🆘 TROUBLESHOOTING

### Erro: "Tabela não existe"
**Solução**: Execute o SQL em `manual-migration.sql` no Supabase

### Erro: "Cannot find module 'bcryptjs'"
**Solução**: Execute `npm install bcryptjs jsonwebtoken`

### Erro: "Session não encontrada"
**Solução**: Verifique se `NEXTAUTH_SECRET` está configurado no `.env`:
```
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
```

### Chat não atualiza em tempo real
**Solução**: O sistema usa polling (atualização a cada 10 segundos). Para real-time, considere implementar websockets ou Supabase Realtime.

---

## 🎨 PERSONALIZAÇÕES POSSÍVEIS

### Cores do Tema:
- Verde Principal: `#304930`
- Verde Secundário: `#456745`
- Dourado (Accent): `#D4AF37`
- Fundo: `#F0F4F0`

### Status VIP:
Atualmente, cliente vira VIP após 3 pedidos. Para alterar:

Em `src/app/perfil/page.tsx`, linha ~355:
```typescript
{orders.length >= 3 ? 'Cliente VIP 💎' : `Faltam ${3 - orders.length} pedidos para VIP`}
```

### Intervalo de Atualização do Chat:
Em `src/app/perfil/page.tsx`, linha ~138:
```typescript
const interval = setInterval(loadMessages, 10000) // 10 segundos
```

---

## 📱 FUNCIONALIDADES FUTURAS SUGERIDAS

1. **Real-time Chat** com Supabase Realtime ou Socket.io
2. **Notificações Push** quando status do pedido muda
3. **Avaliação de Produtos** após entrega
4. **Programa de Pontos** para clientes VIP
5. **Wishlist** de produtos favoritos
6. **Cupons de Desconto** personalizados
7. **Recompra Rápida** (repetir pedido anterior)

---

## 👨‍💻 DESENVOLVIDO COM

- **Next.js 15** - Framework React
- **Prisma** - ORM para PostgreSQL
- **Supabase** - Banco de dados PostgreSQL
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **date-fns** - Formatação de datas
- **bcryptjs** - Hash de senhas
- **jsonwebtoken** - Autenticação JWT

---

## 📄 LICENÇA

Sistema desenvolvido exclusivamente para **Laura Veríssimo Atelier**.

---

**Última atualização**: 16 de Março de 2026
**Versão**: 2.0.0 - Sistema Completo
