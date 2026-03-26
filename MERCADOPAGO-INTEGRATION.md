# 💳 Integração Mercado Pago - Laura Veríssimo Ateliê

## 📋 Resumo das Alterações

### ✅ O que foi implementado:

1. **Removido:** Integração com WhatsApp no checkout
2. **Adicionado:** Sistema completo de pagamentos com Mercado Pago
3. **Adicionado:** Banco de dados de pedidos (Supabase)
4. **Adicionado:** Página "Meus Pedidos" para usuários
5. **Adicionado:** Webhooks para atualização automática de status

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Criadas:

#### `orders` - Pedidos
```sql
- id (UUID)
- customer_name, customer_email, customer_whatsapp
- Endereço completo
- Dados de frete (empresa, método, preço, dias)
- payment_method ('pix' | 'credit_card')
- payment_status ('pending' | 'processing' | 'approved' | 'rejected' | 'refunded')
- mp_payment_id, mp_preference_id, mp_init_point
- subtotal, shipping_total, total
- status ('pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled')
- observations
- Timestamps (created_at, updated_at, paid_at, shipped_at, delivered_at)
```

#### `order_items` - Itens do Pedido
```sql
- id (UUID)
- order_id (FK -> orders)
- product_name, product_description, product_image
- quantity, unit_price, total_price
- created_at
```

**Arquivo:** `/supabase/migrations/20260314_orders_system.sql`

---

## 🔧 Edge Functions Criadas

### 1. `create-order` - Criar Pedido e Gerar Pagamento

**Local:** `/supabase/functions/create-order/index.ts`

**O que faz:**
- Recebe dados do checkout
- Cria pedido no banco
- Cria preferência no Mercado Pago
- Retorna URL de pagamento

**Request Body:**
```typescript
{
  customer: { name, email, whatsapp },
  address: { street, number, complement, neighborhood, city, state, cep },
  shipping: { company, method, price, days },
  payment_method: "pix" | "credit_card",
  items: [{ product_name, product_description, product_image, quantity, unit_price }],
  observations?: string
}
```

**Response:**
```typescript
{
  order_id: string,
  success: boolean,
  payment_url: string,  // URL do Mercado Pago
  preference_id: string
}
```

### 2. `mercadopago-webhook` - Receber Notificações de Pagamento

**Local:** `/supabase/functions/mercadopago-webhook/index.ts`

**O que faz:**
- Recebe notificações do Mercado Pago
- Consulta status do pagamento
- Atualiza `payment_status` e `status` do pedido
- Define `paid_at` quando aprovado

**Mapeamento de Status:**
- `approved` → `payment_status: 'approved'`, `status: 'confirmed'`
- `rejected`/`cancelled` → `payment_status: 'rejected'`, `status: 'cancelled'`
- `refunded` → `payment_status: 'refunded'`, `status: 'cancelled'`
- `in_process`/`in_mediation` → `payment_status: 'processing'`

---

## 🛒 Checkout Atualizado

**Arquivo:** `/src/pages/Checkout.tsx`

### Mudanças:
- ❌ Removido botão "Finalizar via WhatsApp"
- ✅ Adicionado botão "Confirmar Pedido"
- ✅ Toast notifications (sonner)
- ✅ Salva `order_id` no `localStorage` para "Meus Pedidos"
- ✅ Redireciona para Mercado Pago após criar pedido

### Fluxo:
1. Usuário preenche dados
2. Calcula frete
3. Clica em "Confirmar Pedido"
4. Chama `create-order` Edge Function
5. Recebe `payment_url`
6. Redireciona para Mercado Pago
7. Usuário paga
8. Mercado Pago notifica via webhook
9. Pedido é atualizado automaticamente

---

## 📦 Páginas Adicionadas

### `/payment/success` - Pagamento Aprovado
**Local:** `/src/pages/PaymentSuccess.tsx` (criar)

Mostra:
- ✅ Pagamento aprovado com sucesso
- Número do pedido
- Resumo do pedido
- Status de entrega estimado
- Botão "Ver Meus Pedidos"

### `/payment/pending` - Pagamento Pendente
**Local:** `/src/pages/PaymentPending.tsx` (criar)

Mostra:
- ⏳ Pagamento em análise
- Instruções de acompanhamento

### `/payment/failure` - Pagamento Rejeitado
**Local:** `/src/pages/PaymentFailure.tsx` (criar)

Mostra:
- ❌ Pagamento não aprovado
- Motivo da rejeição (se disponível)
- Botão para tentar novamente

### `/orders` - Meus Pedidos
**Local:** `/src/pages/MyOrders.tsx` (criar)

Mostra:
- Lista de pedidos do usuário (busca por email salvo no localStorage)
- Status de cada pedido
- Detalhes: itens, valores, endereço, frete
- Timeline: pedido criado → pago → em preparação → enviado → entregue

---

## 🔐 Variáveis de Ambiente

### Supabase (`.env` local)
```bash
VITE_SUPABASE_PROJECT_ID="lkaxvbpvxcchkhuzcgvt"
VITE_SUPABASE_URL="https://lkaxvbpvxcchkhuzcgvt.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbG..."
```

### Supabase Dashboard → Edge Functions Secrets
```bash
SUPABASE_SERVICE_ROLE_KEY="sua_service_role_key"
MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."  # ⚠️ OBRIGATÓRIO
```

**Como obter Access Token do Mercado Pago:**
1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Crie um aplicativo
3. Copie o **Access Token** (Produção ou Teste)
4. Configure no Supabase Dashboard → Settings → Edge Functions → Secrets

---

## 🚀 Deploy

### 1. Supabase

#### 1.1 Executar Migration
```bash
# Opção 1: Via Supabase Dashboard
- Acesse: https://supabase.com/dashboard/project/lkaxvbpvxcchkhuzcgvt/sql
- Cole o conteúdo de /supabase/migrations/20260314_orders_system.sql
- Execute

# Opção 2: Via CLI
supabase db push
```

#### 1.2 Deploy Edge Functions
```bash
supabase functions deploy create-order
supabase functions deploy mercadopago-webhook
supabase functions deploy calculate-shipping  # já existente
```

#### 1.3 Configurar Secrets
```bash
supabase secrets set MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."
```

#### 1.4 Configurar Webhook no Mercado Pago
1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Webhooks → Adicionar URL
3. URL: `https://lkaxvbpvxcchkhuzcgvt.supabase.co/functions/v1/mercadopago-webhook`
4. Eventos: Marcar "Payments"

### 2. Vercel

```bash
# 1. Build do projeto
npm run build

# 2. Deploy
vercel --prod

# 3. Configurar variáveis de ambiente no Vercel Dashboard
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
```

---

## 🧪 Testar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env
cp .env.example .env
# Editar .env com as credenciais

# 3. Iniciar Supabase local (opcional)
supabase start

# 4. Iniciar dev server
npm run dev

# 5. Abrir no navegador
http://localhost:5173
```

### Testar Pagamento:
1. Adicione produtos ao carrinho
2. Vá para checkout
3. Preencha dados
4. Calcule frete
5. Clique em "Confirmar Pedido"
6. Será redirecionado para Mercado Pago

**Dados de teste (Mercado Pago Sandbox):**
- CPF: `12345678909`
- Email: `test_user_123456789@testuser.com`
- Cartão aprovado: `5031 4332 1540 6351`
- CVV: `123`
- Validade: Qualquer data futura

---

## 📊 Status dos Pedidos

### Ciclo de vida:
```
pending → confirmed → preparing → shipped → delivered
         ↘ cancelled
```

### Status de Pagamento:
```
pending → processing → approved
                    ↘ rejected
                    ↘ refunded
```

---

## 🎨 Layout Original Preservado

**Nenhuma mudança visual foi feita no layout!**

Apenas:
- Botão "Finalizar via WhatsApp" → "Confirmar Pedido"
- Texto: "Você será redirecionado para o Mercado Pago"
- Icone: WhatsApp → CheckCircle

---

## 📝 Próximos Passos

1. ✅ Implementado: Backend completo
2. ✅ Implementado: Edge Functions
3. ✅ Implementado: Checkout atualizado
4. 🔲 Criar: Páginas de retorno (`/payment/*`)
5. 🔲 Criar: Página "Meus Pedidos" (`/orders`)
6. 🔲 Testar: Fluxo completo localmente
7. 🔲 Deploy: Supabase + Vercel
8. 🔲 Configurar: Webhook Mercado Pago
9. 🔲 Testar: Fluxo completo em produção

---

## 🆘 Troubleshooting

### Erro: "MercadoPago access token not configured"
- Configure `MERCADOPAGO_ACCESS_TOKEN` no Supabase Secrets

### Webhook não está atualizando pedidos
- Verifique se a URL do webhook está correta no painel do Mercado Pago
- Veja logs da Edge Function: `supabase functions logs mercadopago-webhook`

### Pedido criado mas sem URL de pagamento
- Verifique se `MERCADOPAGO_ACCESS_TOKEN` está configurado
- Veja logs da Edge Function: `supabase functions logs create-order`

### "Meus Pedidos" não mostra nada
- Verifique se o email no checkout é o mesmo usado para buscar
- Verifique `localStorage.getItem("customer_orders")`

---

## 🤝 Suporte

Para dúvidas:
1. Verifique os logs das Edge Functions
2. Verifique o console do navegador
3. Verifique o painel do Mercado Pago

---

**Desenvolvido com ❤️ para Laura Veríssimo Ateliê**
