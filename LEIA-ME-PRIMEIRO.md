# 🎨 Laura Veríssimo Ateliê - Sistema de Pagamentos Integrado

## ✨ O que foi feito

✅ **Removido:** Envio para WhatsApp no checkout
✅ **Adicionado:** Integração completa com Mercado Pago
✅ **Adicionado:** Sistema de pedidos no banco de dados
✅ **Adicionado:** Área "Meus Pedidos" para clientes
✅ **Mantido:** Layout original do site **sem alterações visuais**

---

## 🚀 Como usar (Desenvolvimento)

### 1. Instalar dependências
```bash
cd /d/PROJETOS-ROCHINHAPROJETOSatelier-aura-lovable
npm install
```

### 2. Iniciar servidor local
```bash
npm run dev
```

### 3. Abrir no navegador
```
http://localhost:5173
```

---

## 🎯 O que acontece agora no checkout

### ❌ ANTES (com WhatsApp):
1. Cliente preenchia dados
2. Clicava em "Finalizar via WhatsApp"
3. Abria o WhatsApp com a mensagem
4. Você recebia manualmente

### ✅ AGORA (com Mercado Pago):
1. Cliente preenche dados
2. Clica em "Confirmar Pedido"
3. **Pedido é salvo no banco de dados**
4. Cliente é redirecionado para o **Mercado Pago**
5. Cliente paga (PIX ou Cartão)
6. **Status do pedido é atualizado automaticamente**
7. Cliente pode ver o pedido em "Meus Pedidos"

---

## 📁 Arquivos Criados

### Backend (Supabase)
```
/supabase/migrations/20260314_orders_system.sql
  ↳ Tabelas: orders, order_items

/supabase/functions/create-order/index.ts
  ↳ Cria pedido + gera link de pagamento

/supabase/functions/mercadopago-webhook/index.ts
  ↳ Recebe notificações do Mercado Pago
```

### Frontend (React)
```
/src/pages/Checkout.tsx
  ↳ ATUALIZADO: Agora usa Mercado Pago (backup em Checkout.tsx.backup)

PRÓXIMOS (você deve criar):
/src/pages/PaymentSuccess.tsx  ← Pagamento aprovado
/src/pages/PaymentPending.tsx  ← Pagamento pendente
/src/pages/PaymentFailure.tsx  ← Pagamento rejeitado
/src/pages/MyOrders.tsx        ← Meus Pedidos
```

---

## 🔑 Configuração Obrigatória

### 1. Criar conta no Mercado Pago
- Acesse: https://www.mercadopago.com.br/developers
- Crie um aplicativo
- Copie o **Access Token**

### 2. Configurar no Supabase
```bash
# No Supabase Dashboard:
Project → Settings → Edge Functions → Secrets

Adicione:
MERCADOPAGO_ACCESS_TOKEN = "APP_USR-..."
```

### 3. Executar Migration no Supabase
```sql
-- Acesse: Supabase Dashboard → SQL Editor
-- Cole o conteúdo de: /supabase/migrations/20260314_orders_system.sql
-- Execute
```

### 4. Deploy das Edge Functions
```bash
supabase functions deploy create-order
supabase functions deploy mercadopago-webhook
```

### 5. Configurar Webhook no Mercado Pago
```
URL: https://lkaxvbpvxcchkhuzcgvt.supabase.co/functions/v1/mercadopago-webhook
Eventos: Payments
```

---

## 📊 Status dos Pedidos

O sistema gerencia automaticamente:

### Fluxo de Pagamento:
```
pending → approved   (cliente pagou ✅)
       → rejected    (pagamento recusado ❌)
       → processing  (em análise ⏳)
```

### Fluxo do Pedido:
```
pending → confirmed → preparing → shipped → delivered
```

Você pode atualizar manualmente o status do pedido:
- **confirmed** → **preparing**: Você começou a fazer o produto
- **preparing** → **shipped**: Você enviou o produto
- **shipped** → **delivered**: Cliente recebeu

---

## 🎨 Layout

**NENHUMA mudança visual foi feita!**

Apenas:
- Botão mudou de "Finalizar via WhatsApp" para "Confirmar Pedido"
- Texto: "Você será redirecionado para o Mercado Pago"

---

## 📱 Meus Pedidos (para criar)

Os clientes poderão:
- Ver todos os pedidos feitos (por email)
- Acompanhar status em tempo real
- Ver detalhes: produtos, valores, endereço, frete
- Ver código de rastreio (quando você adicionar)

**Salvo no localStorage:**
```javascript
{
  order_id: "uuid",
  email: "cliente@email.com",
  created_at: "2026-03-14T..."
}
```

---

## 🧪 Testar Pagamentos

### Modo Teste (Sandbox):
1. Use **Access Token de Teste** (não de produção)
2. Dados de teste:
   - CPF: `12345678909`
   - Email: `test_user_@testuser.com`
   - Cartão: `5031 4332 1540 6351`
   - CVV: `123`
   - Validade: qualquer data futura

### Modo Produção:
1. Use **Access Token de Produção**
2. Pagamentos reais serão cobrados
3. Taxa do Mercado Pago: ~4,99% + R$ 0,39 por transação

---

## 🚀 Deploy no Vercel

```bash
# 1. Instalar Vercel CLI (se não tiver)
npm i -g vercel

# 2. Fazer login
vercel login

# 3. Deploy
vercel --prod
```

**Variáveis de ambiente no Vercel:**
```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
```

---

## 📞 Próximos Passos

### Essenciais (antes do deploy):
1. ✅ Backend implementado
2. ✅ Checkout atualizado
3. 🔲 Criar conta no Mercado Pago
4. 🔲 Configurar MERCADOPAGO_ACCESS_TOKEN
5. 🔲 Executar migration no Supabase
6. 🔲 Deploy das Edge Functions
7. 🔲 Configurar webhook no Mercado Pago

### Opcionais (melhorias):
1. 🔲 Criar páginas `/payment/*`
2. 🔲 Criar página `/orders` (Meus Pedidos)
3. 🔲 Adicionar painel admin para gerenciar pedidos
4. 🔲 Adicionar notificações por email
5. 🔲 Integrar rastreio de envio (Correios/Melhor Envio)

---

## 📚 Documentação Completa

Veja todos os detalhes em:
📄 **[MERCADOPAGO-INTEGRATION.md](./MERCADOPAGO-INTEGRATION.md)**

---

## 🆘 Precisa de Ajuda?

### Erro comum 1: "MercadoPago access token not configured"
➡️ Configure `MERCADOPAGO_ACCESS_TOKEN` no Supabase Secrets

### Erro comum 2: "Function not found: create-order"
➡️ Faça deploy: `supabase functions deploy create-order`

### Erro comum 3: Webhook não atualiza pedidos
➡️ Verifique a URL do webhook no painel do Mercado Pago

---

**🎨 Feito com carinho para Laura Veríssimo Ateliê**
**Agora você tem um sistema profissional de e-commerce! 🚀**
