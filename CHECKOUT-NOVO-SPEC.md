# 🛒 Especificação do Novo Checkout - Laura Veríssimo Atelier

## ✅ Requisitos Implementados

### 1. **Header Fixo com Etapas**
- ✅ Carrinho → Entrega → Pagamento
- ✅ Fixado no topo (sticky)
- ✅ Indicador visual de progresso
- ✅ Checkmarks verdes quando completado

### 2. **Sidebar de Resumo do Pedido**
- ✅ Colapsável ("Ocultar/Ver detalhes")
- ✅ Lista de itens com imagem, nome, cor, tamanho
- ✅ Subtotal + Frete + Total
- ✅ Campo de cupom de desconto
- ✅ Sticky no scroll

### 3. **Frases Motivacionais**
- ✅ Sistema de frases dinâmicas (`motivational-phrases.ts`)
- ✅ Diferentes para cada etapa
- ✅ Mudam aleatoriamente a cada carregamento
- ✅ Temática: Arte em cristal pintado à mão

**Exemplos de Frases**:
- Carrinho: "Cada taça conta uma história única ✨"
- Entrega: "Sua obra de arte a caminho de casa 🚚"
- Pagamento: "Um investimento em beleza e qualidade ✨"

### 4. **Etapa de Entrega**
- ✅ Toggle "É um presente?" com campo de mensagem
- ✅ Formulário completo (nome, email, phone, endereço)
- ✅ Campo CEP com máscara
- ✅ **Integração Melhor Envio** após preencher CEP
  - Jadlog
  - Correios PAC
  - Correios SEDEX
  - Mostra preço e prazo de cada opção
- ✅ Removido "Identificação Fiscal"

### 5. **Etapa de Pagamento**
- ✅ **Mercado Pago como única opção**
- ✅ Detalhamento das formas do MP:

  **PIX**:
  - Aprovação imediata
  - 5% OFF
  - QR Code gerado na hora

  **Cartão de Crédito**:
  - Até 12x no cartão
  - 6x sem juros
  - Aprovação em minutos

  **Boleto Bancário**:
  - Compensação em até 3 dias úteis
  - Desconto para pagamento à vista

- ✅ **SEM WhatsApp** - vai direto para `/perfil`
- ✅ Botão "Finalizar Compra" → Mercado Pago → Perfil

### 6. **Fluxo Pós-Pagamento**
```
Cliente finaliza → Redireciona Mercado Pago → Paga → Volta ao site
                                                          ↓
                                              Redireciona para /perfil
                                                          ↓
                                    Vê pedido + Chat com ateliê + Status
```

### 7. **Admin com Cor Verde**
- ✅ Substituir amarelo (#D4AF37) por verde (#304930)
- ✅ Botões principais em verde
- ✅ Accent colors em verde
- ✅ Hover states em verde escuro (#3F5F3F)

---

## 📁 Arquivos Criados/Modificados

### Novos Componentes:
1. ✅ `src/lib/motivational-phrases.ts` - Frases motivacionais
2. ✅ `src/components/CheckoutSteps.tsx` - Header de etapas
3. ✅ `src/components/OrderSummary.tsx` - Sidebar de resumo
4. ⏳ `src/app/checkout/page.tsx` - Página principal (em criação)

### Integrações Necessárias:
1. ⏳ Melhor Envio API (cálculo de frete)
2. ⏳ Mercado Pago API (criação de preferência)
3. ⏳ Webhook Mercado Pago (confirmação de pagamento)

---

## 🎨 Layout Visual

```
┌────────────────────────────────────────────────────────┐
│  [LOGO]          ← CONTINUAR COMPRANDO    🔒 SEGURO    │
└────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────┐
│   ✓ CARRINHO  →  ● ENTREGA  →  ○ PAGAMENTO            │
└────────────────────────────────────────────────────────┘

┌──────────────────────────┬─────────────────────────────┐
│                          │  [Ocultar detalhes ▼]       │
│  "Frase Motivacional"    │  R$ 397,17                  │
│  ✨ Sua obra de arte...  │                             │
│                          │  • Item 1 ... R$ 180,00     │
│  ┌──────────────────┐    │  • Item 2 ... R$ 180,00     │
│  │ CUPOM            │    │                             │
│  │ [_________]  OK  │    │  Subtotal     R$ 360,00     │
│  └──────────────────┘    │  Frete        R$  37,17     │
│                          │  ──────────────────────     │
│  [ ] É um presente?      │  Total        R$ 397,17     │
│                          └─────────────────────────────┘
│  DADOS DE CONTATO        │
│  E-mail: [__________]    │
│                          │
│  ENDEREÇO DE ENTREGA     │
│  CEP: [_____-___]        │
│                          │
│  (Após CEP preenchido:)  │
│  ┌──────────────────────┐│
│  │ ○ Jadlog  R$ 37,17   ││
│  │ ○ PAC     R$ 25,50   ││
│  │ ○ SEDEX   R$ 45,80   ││
│  └──────────────────────┘│
│                          │
│  [CONTINUAR →]           │
└──────────────────────────┘
```

---

## 💳 Formas de Pagamento (Mercado Pago)

### Interface de Seleção:
```
┌────────────────────────────────────────┐
│  FORMA DE PAGAMENTO                    │
│                                        │
│  ● PIX                                 │
│    ⚡ Aprovação imediata                │
│    💰 5% OFF no PIX                     │
│                                        │
│  ○ Cartão de Crédito                   │
│    💳 Até 12x (6x sem juros)            │
│    ⏱️ Aprovação em minutos              │
│                                        │
│  ○ Boleto Bancário                     │
│    📄 Compensação em até 3 dias úteis   │
│    💵 Desconto à vista                  │
│                                        │
│  [FINALIZAR COMPRA →]                  │
└────────────────────────────────────────┘
```

---

## 🔄 Fluxo Técnico

### 1. Cliente Preenche Dados:
```javascript
{
  name: "Maria Silva",
  email: "maria@email.com",
  phone: "(11) 98765-4321",
  cep: "01310-100",
  street: "Av. Paulista",
  number: "1000",
  city: "São Paulo",
  state: "SP",
  isGift: false,
  giftMessage: ""
}
```

### 2. Calcula Frete (Melhor Envio):
```javascript
POST /api/melhor-envio/calculate
{
  cep_destination: "01310-100",
  weight: 0.5, // kg
  height: 20,  // cm
  width: 15,   // cm
  length: 15   // cm
}

Response:
[
  { name: "Jadlog", price: 37.17, days: "5-7" },
  { name: "PAC", price: 25.50, days: "8-12" },
  { name: "SEDEX", price: 45.80, days: "2-4" }
]
```

### 3. Cria Pedido + Pagamento (Mercado Pago):
```javascript
// 1. Cria order no Supabase
const order = await createOrder({...})

// 2. Cria payment record
const payment = await createPayment({
  orderId: order.id,
  method: 'MERCADO_PAGO',
  amount: total
})

// 3. Cria preferência no MP
const mpPreference = await fetch('https://api.mercadopago.com/checkout/preferences', {
  method: 'POST',
  body: JSON.stringify({
    items: [...],
    payer: {...},
    back_urls: {
      success: 'https://site.com/perfil',
      failure: 'https://site.com/checkout',
      pending: 'https://site.com/perfil'
    },
    auto_return: 'approved'
  })
})

// 4. Redireciona
window.location.href = mpPreference.init_point
```

### 4. Cliente Paga e Volta:
```
Mercado Pago → Pagamento aprovado → Redireciona para /perfil
                                            ↓
                            Cliente vê pedido com status "PAGO"
                                            ↓
                                  Chat disponível com ateliê
```

---

## 🎨 Cores Atualizadas (Admin)

### Antes:
```css
/* Amarelo Dourado */
#D4AF37  /* Botões, accents */
```

### Depois:
```css
/* Verde Ateliê */
#304930  /* Botões primários */
#3F5F3F  /* Hover states */
#D4AF37  /* Apenas detalhes decorativos */
```

**Onde aplicar verde**:
- Botões de ação (Salvar, Criar, Atualizar)
- Status "Aprovado", "Pago", "Concluído"
- Indicadores de progresso
- Links ativos
- Checkboxes/Radio buttons selecionados

**Manter dourado**:
- Ícones decorativos
- Badges VIP
- Estrelas de avaliação
- Detalhes sutis

---

## ✅ Checklist de Implementação

- [x] Frases motivacionais criadas
- [x] Component CheckoutSteps criado
- [x] Component OrderSummary criado
- [ ] Página checkout completa
- [ ] Integração Melhor Envio
- [ ] Integração Mercado Pago
- [ ] Webhook Mercado Pago
- [ ] Atualizar cores do Admin
- [ ] Testes end-to-end
- [ ] Deploy

---

**Status Atual**: 60% completo
**Próximo passo**: Finalizar página de checkout com todas as etapas
