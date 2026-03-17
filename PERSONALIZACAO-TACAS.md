# 🎨 Sistema de Personalização de Taças - Laura Veríssimo Atelier

## ✅ IMPLEMENTADO

Sistema completo de personalização de taças com **tamanhos diferentes** e **preços dinâmicos**.

---

## 🎯 Como Funciona

### 1. **Seleção de Modelo**
O cliente escolhe o tipo de taça:
- Taça Gin
- Taça Vinho
- Taça Champagne
- Copo Long Drink
- etc.

### 2. **Seleção de Tamanho** (NOVO!)
Cada modelo pode ter **múltiplos tamanhos** com preços diferentes:
- **400ml** - R$ 89,00
- **650ml** - R$ 129,00
- **850ml** - R$ 159,00

O **preço atualiza automaticamente** quando o cliente seleciona um tamanho diferente!

### 3. **Seleção de Cor**
Depois de escolher modelo e tamanho, o cliente escolhe a cor:
- Verde Esmeralda
- Dourado
- Rosé Gold
- Azul Turquesa
- etc.

### 4. **Adicionar ao Carrinho**
Ao clicar em "Adicionar ao Carrinho":
- ✅ Produto é adicionado ao carrinho (localStorage)
- ✅ **NÃO redireciona** automaticamente
- ✅ Aparece um **popup fixo no rodapé** mostrando o carrinho

### 5. **Mini Cart Popup**
Popup discreto que aparece no rodapé da tela:
- Mostra quantos itens tem no carrinho
- Mostra o valor total
- Preview dos primeiros 3 itens
- Botão "Ir para Checkout"
- Pode ser fechado temporariamente (botão X)

---

## 🎨 Componentes Criados

### **ProductCustomizer.tsx**
Localização: `src/components/ProductCustomizer.tsx`

**Funcionalidades**:
- Seleção inteligente de variantes
- Filtragem automática de opções disponíveis
- Preço dinâmico em tempo real
- Validação de estoque
- Indicador visual da configuração escolhida
- Integração com localStorage do carrinho

**Props**:
```typescript
interface ProductCustomizerProps {
  product: {
    id: string
    name: string
    description: string
    basePrice: number
    variants: Array<{
      id: string
      model: string
      color: string
      capacity: string  // TAMANHO!
      priceAdjust: number  // Ajuste sobre o basePrice
      stockQty: number
      imageUrls: string[]
    }>
  }
}
```

**Exemplo de Uso**:
```tsx
<ProductCustomizer product={product} />
```

---

### **MiniCartPopup.tsx**
Localização: `src/components/MiniCartPopup.tsx`

**Funcionalidades**:
- Aparece automaticamente quando há itens no carrinho
- Escuta evento `cartUpdated` do window
- Animação suave (Framer Motion)
- Responsivo (mobile-friendly)
- Pode ser fechado temporariamente

**Auto-inicialização**:
O componente já está integrado no `layout.tsx` global, então funciona em **todas as páginas**.

---

## 💰 Como Configurar Preços por Tamanho

No Prisma/Supabase, cada **variante** tem um campo `priceAdjust` que é **somado** ao `basePrice` do produto.

### Exemplo:

**Produto**: Taça Gin Personalizada
- `basePrice`: R$ 100,00

**Variantes**:

| Modelo | Tamanho | Cor | priceAdjust | **Preço Final** |
|--------|---------|-----|-------------|-----------------|
| Taça Gin | 400ml | Verde | -11.00 | R$ 89,00 |
| Taça Gin | 650ml | Verde | 29.00 | R$ 129,00 |
| Taça Gin | 850ml | Verde | 59.00 | R$ 159,00 |
| Taça Gin | 400ml | Dourado | -11.00 | R$ 89,00 |
| Taça Gin | 650ml | Dourado | 29.00 | R$ 129,00 |

Assim, você pode ter:
- **Mesmo modelo** com **tamanhos diferentes** = preços diferentes
- **Mesma cor** em **modelos diferentes** = preços diferentes

---

## 🔄 Fluxo do Cliente

```
1. Cliente navega produtos
         ↓
2. Clica em um produto
         ↓
3. Vê página de detalhes
         ↓
4. ESCOLHE O MODELO
   (ex: "Taça Gin")
         ↓
5. ESCOLHE O TAMANHO  ← NOVO!
   (ex: "650ml - R$ 129,00")
   → Preço atualiza automaticamente
         ↓
6. ESCOLHE A COR
   (ex: "Verde Esmeralda")
         ↓
7. Vê configuração final:
   "Taça Gin • 650ml • Verde Esmeralda"
   "R$ 129,00"
         ↓
8. Clica "Adicionar ao Carrinho"
         ↓
9. Produto adicionado ao localStorage
         ↓
10. POPUP APARECE NO RODAPÉ
    "🛒 Carrinho: 1 item - R$ 129,00"
    "→ Ir para Checkout"
         ↓
11. Cliente PODE:
    a) Continuar comprando (fecha popup)
    b) Ir direto pro checkout
```

---

## 📱 Responsividade

✅ Mobile-first design
✅ Popup adapta-se à tela pequena
✅ Seletores em grid responsivo
✅ Botões com touch-friendly size

---

## 🎯 Benefícios

### **Para o Cliente**:
- Vê TODAS as opções antes de decidir
- Preço transparente e dinâmico
- Não perde contexto (não redireciona)
- Popup discreto lembra do carrinho

### **Para Laura**:
- Pode ter MÚLTIPLOS tamanhos com preços diferentes
- Fácil adicionar novos tamanhos/cores
- Sistema flexível e escalável
- Melhor controle de estoque por variante

---

## 🛠️ Como Adicionar Novos Produtos

### No Admin/Supabase:

1. **Criar Produto**:
```sql
INSERT INTO "Product" (id, name, description, basePrice, category, slug, isActive)
VALUES (
  'prod_123',
  'Taça Gin Artesanal',
  'Taça de cristal pintada à mão com arte exclusiva',
  100.00,
  'Taças',
  'taca-gin-artesanal',
  true
);
```

2. **Criar Variantes** (uma para cada combinação):
```sql
-- Tamanho 400ml, Verde
INSERT INTO "ProductVariant" (id, productId, model, color, capacity, priceAdjust, stockQty, sku)
VALUES ('var_001', 'prod_123', 'Taça Gin', 'Verde Esmeralda', '400ml', -11.00, 10, 'TG-400-VE');

-- Tamanho 650ml, Verde
INSERT INTO "ProductVariant" (id, productId, model, color, capacity, priceAdjust, stockQty, sku)
VALUES ('var_002', 'prod_123', 'Taça Gin', 'Verde Esmeralda', '650ml', 29.00, 8, 'TG-650-VE');

-- Tamanho 850ml, Verde
INSERT INTO "ProductVariant" (id, productId, model, color, capacity, priceAdjust, stockQty, sku)
VALUES ('var_003', 'prod_123', 'Taça Gin', 'Verde Esmeralda', '850ml', 59.00, 5, 'TG-850-VE');

-- Tamanho 400ml, Dourado
INSERT INTO "ProductVariant" (id, productId, model, color, capacity, priceAdjust, stockQty, sku)
VALUES ('var_004', 'prod_123', 'Taça Gin', 'Dourado', '400ml', -11.00, 12, 'TG-400-DO');

-- ... e assim por diante para todas combinações
```

3. **O Sistema Automaticamente**:
   - Agrupa por modelo
   - Mostra tamanhos disponíveis
   - Filtra cores disponíveis
   - Calcula preço final
   - Valida estoque

---

## 🎨 Personalização Visual

### Cores do Tema:
```css
/* Verde Principal */
#304930

/* Verde Hover */
#3F5F3F

/* Dourado (Accent) */
#D4AF37

/* Fundo Claro */
#F8FAF8
```

### Animações:
- Framer Motion para popup
- Transições suaves nos botões
- Hover effects elegantes

---

## 📊 Estrutura de Dados

### localStorage - Cart:
```json
[
  {
    "product": {
      "id": "prod_123",
      "name": "Taça Gin Artesanal",
      "slug": "taca-gin-artesanal"
    },
    "variant": {
      "id": "var_002",
      "model": "Taça Gin",
      "color": "Verde Esmeralda",
      "capacity": "650ml",
      "priceAdjust": 29,
      "stockQty": 8,
      "sku": "TG-650-VE",
      "imageUrls": []
    },
    "quantity": 2,
    "price": 129.00
  }
]
```

---

## 🚀 Deploy

✅ Código já commitado e enviado ao GitHub
✅ Vercel fará deploy automático
✅ Funciona em produção sem configuração adicional

---

## 🆘 Troubleshooting

### Popup não aparece:
- Verifique se `MiniCartPopup` está no `layout.tsx`
- Confirme que `framer-motion` está instalado: `npm install framer-motion`

### Preço não atualiza:
- Verifique se variantes têm campo `priceAdjust` correto
- Confirme que `basePrice` do produto está definido

### Tamanhos não aparecem:
- Verifique se existem variantes com `capacity` diferente
- Confirme que todas variantes têm o mesmo `model`

---

## 🎉 Próximas Melhorias Sugeridas

1. **Imagens por Variante**: Trocar imagem quando seleciona cor
2. **Zoom de Imagem**: Ampliar ao passar mouse
3. **Comparar Tamanhos**: Modal mostrando diferenças visuais
4. **Favoritos**: Salvar configurações favoritas
5. **Compartilhar**: Compartilhar configuração personalizada

---

**Desenvolvido com**: Next.js 15 + Prisma + Framer Motion + TypeScript
**Status**: ✅ 100% Funcional
**Última atualização**: 16 de Março de 2026
