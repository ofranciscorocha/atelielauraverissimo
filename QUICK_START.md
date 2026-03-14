# 🚀 QUICK START - Laura Verissimo Atelier

## 📦 Instalação Rápida

### 1. Instalar Dependências
```bash
cd d:\PROJETOS-ROCHINHA\PROJETOS\laura-verissimo-atelier
npm install
```

### 2. Configurar Banco de Dados (Supabase)

1. Acesse [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Copie a `DATABASE_URL` em Settings → Database
4. Cole no arquivo `.env`

### 3. Configurar Variáveis de Ambiente

Edite o arquivo `.env`:

```env
# DATABASE
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# SUPABASE
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON_KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE_ROLE_KEY]"

# OPENAI (Nano Banana Pro)
OPENAI_API_KEY="sk-proj-..."

# WHATSAPP
NEXT_PUBLIC_WHATSAPP_NUMBER="5511999999999"

# NEXTAUTH
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere-um-secret-seguro-aqui"
```

### 4. Rodar Migrations

```bash
npx prisma generate
npx prisma db push
```

### 5. (Opcional) Popular Banco com Dados de Teste

Crie um arquivo `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Criar configurações padrão
  await prisma.settings.create({
    data: {
      logoUrl: '/logo.png',
      primaryColor: '#304930',
      secondaryColor: '#F0F4F0',
      accentColor: '#D4AF37',
      whatsappNumber: '5511999999999',
    },
  })

  // Criar cliente de teste
  await prisma.client.create({
    data: {
      name: 'Cliente Teste',
      email: 'teste@exemplo.com',
      phone: '11999999999',
      ranking: 'NOVO',
      segment: 'POTENCIAL',
    },
  })

  // Criar produto de teste
  const product = await prisma.product.create({
    data: {
      name: 'Taça Gin Premium',
      description: 'Taça de cristal pintada à mão com design exclusivo',
      category: 'Taças',
      basePrice: 120,
      slug: 'taca-gin-premium',
      isActive: true,
    },
  })

  // Criar variante
  await prisma.productVariant.create({
    data: {
      productId: product.id,
      model: 'Taça Gin',
      color: 'Verde Esmeralda',
      capacity: '650ml',
      sku: 'TGP-VE-650',
      stockQty: 10,
      imageUrls: ['https://via.placeholder.com/400'],
    },
  })

  console.log('✅ Seed concluído!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Adicione no `package.json`:
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

Execute:
```bash
npm install -D ts-node
npx prisma db seed
```

### 6. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 📚 Próximos Passos

### Acessar Admin
```
http://localhost:3000/admin
```

### Testar Server Actions

Exemplo de uso em uma página:

```typescript
'use client'

import { useState } from 'react'
import { getDashboardMetrics } from '@/lib/actions'

export default function TestPage() {
  const [metrics, setMetrics] = useState(null)

  async function loadMetrics() {
    const data = await getDashboardMetrics()
    setMetrics(data)
  }

  return (
    <div>
      <button onClick={loadMetrics}>Carregar Métricas</button>
      <pre>{JSON.stringify(metrics, null, 2)}</pre>
    </div>
  )
}
```

### Usar o Carrinho

```typescript
'use client'

import { useCart } from '@/contexts/CartContext'

export function ProductCard() {
  const { addItem } = useCart()

  function handleAddToCart() {
    addItem({
      productId: '...',
      productName: 'Taça Gin Premium',
      variantId: '...',
      variantModel: 'Taça Gin',
      variantColor: 'Verde Esmeralda',
      variantCapacity: '650ml',
      imageUrl: '...',
      quantity: 1,
      unitPrice: 120,
      sku: 'TGP-VE-650',
    })
  }

  return <button onClick={handleAddToCart}>Adicionar ao Carrinho</button>
}
```

### Gerar Mensagem de WhatsApp

```typescript
import { generateWhatsAppURL } from '@/lib/utils/whatsapp'
import { useCart } from '@/contexts/CartContext'

export function CheckoutButton() {
  const { items, subtotal, shippingFee, total } = useCart()

  function handleCheckout() {
    const url = generateWhatsAppURL({
      items,
      subtotal,
      shippingFee,
      total,
      customerName: 'Fulana Silva',
      customerEmail: 'fulana@example.com',
      customerPhone: '11999999999',
      specialMessage: 'Quero a taça bem caprichada! 💚',
    })

    window.open(url, '_blank')
  }

  return <button onClick={handleCheckout}>Finalizar no WhatsApp</button>
}
```

---

## 🎨 Estrutura de Pastas Criada

```
✅ prisma/schema.prisma           # Modelagem completa
✅ src/lib/prisma.ts              # Cliente Prisma
✅ src/lib/actions/               # 6 módulos de Server Actions
✅ src/lib/validations/schemas.ts # Validações Zod
✅ src/lib/utils/                 # Formatters & WhatsApp
✅ src/contexts/CartContext.tsx   # Provider do Carrinho
✅ .env.example                   # Template de variáveis
✅ BACKEND_DOCUMENTATION.md       # Documentação técnica completa
```

---

## 🔧 Comandos Úteis

```bash
# Gerar Prisma Client após mudanças no schema
npx prisma generate

# Push schema para o banco (desenvolvimento)
npx prisma db push

# Abrir Prisma Studio (GUI do banco)
npx prisma studio

# Criar migration (produção)
npx prisma migrate dev --name nome_da_migration

# Resetar banco (CUIDADO!)
npx prisma db push --force-reset

# Build para produção
npm run build

# Iniciar servidor de produção
npm run start
```

---

## 🐛 Troubleshooting

### Erro: "Prisma Client not found"
```bash
npx prisma generate
```

### Erro: "DATABASE_URL não configurada"
Verifique se o `.env` está no diretório raiz e possui a `DATABASE_URL` correta.

### Erro: OpenAI API
Se não for usar o Nano Banana Pro imediatamente, deixe a key em branco. As actions de IA retornarão erro gracefully.

### Erro: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Suporte

Dúvidas? Consulte:
- [BACKEND_DOCUMENTATION.md](BACKEND_DOCUMENTATION.md) - Documentação técnica completa
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js 15 Docs](https://nextjs.org/docs)

---

**Pronto!** Agora você tem um backend completo e operacional. 🎉

O Antigravity (Gemini) cuidou da beleza visual, e este sistema cuida da lógica operacional com máxima performance! 💚✨
