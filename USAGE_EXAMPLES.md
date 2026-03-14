# 📘 USAGE EXAMPLES - Server Actions & Contexts

Exemplos práticos de como usar as Server Actions e Contexts no frontend.

---

## 🎯 CRM - Listar Clientes VIP

```typescript
// app/admin/clientes/page.tsx
'use server'

import { getTopClients } from '@/lib/actions'
import { formatCurrency } from '@/lib/utils/formatters'

export default async function ClientesVIPPage() {
  const topClients = await getTopClients(10)

  return (
    <div>
      <h1>Top 10 Clientes VIP</h1>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Ranking</th>
            <th>LTV</th>
            <th>Total de Pedidos</th>
          </tr>
        </thead>
        <tbody>
          {topClients.map((client) => (
            <tr key={client.id}>
              <td>{client.name}</td>
              <td>{client.ranking}</td>
              <td>{formatCurrency(client.lifetimeValue)}</td>
              <td>{client.totalOrders}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## 📊 Dashboard - Métricas em Tempo Real

```typescript
// app/admin/page.tsx (Server Component)
import { getDashboardMetrics, getMonthlyRevenue } from '@/lib/actions'
import { formatCurrency, formatPercentage } from '@/lib/utils/formatters'

export default async function DashboardPage() {
  const [metrics, monthlyData] = await Promise.all([
    getDashboardMetrics(),
    getMonthlyRevenue(6),
  ])

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <h3>Faturamento Total</h3>
          <p>{formatCurrency(metrics.totalRevenue)}</p>
        </Card>

        <Card>
          <h3>Faturamento Mensal</h3>
          <p>{formatCurrency(metrics.monthlyRevenue)}</p>
          <small>
            {metrics.revenueGrowth > 0 ? '📈' : '📉'}
            {formatPercentage(metrics.revenueGrowth)}
          </small>
        </Card>

        <Card>
          <h3>Pedidos em Produção</h3>
          <p>{metrics.ordersInProduction}</p>
        </Card>

        <Card>
          <h3>Estoque Baixo</h3>
          <p>{metrics.lowStockItems} itens</p>
        </Card>
      </div>

      {/* Gráfico de Receita */}
      <div className="mt-8">
        <h2>Receita Mensal</h2>
        <BarChart data={monthlyData} />
      </div>
    </div>
  )
}
```

---

## 🛒 Carrinho - Adicionar Produto (Client Component)

```typescript
// components/ProductCard.tsx
'use client'

import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { formatCurrency } from '@/lib/utils/formatters'

interface ProductCardProps {
  product: {
    id: string
    name: string
    basePrice: number
    variants: Array<{
      id: string
      model: string
      color: string
      capacity: string
      imageUrls: string[]
      sku: string
    }>
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0])
  const [quantity, setQuantity] = useState(1)

  function handleAddToCart() {
    addItem({
      productId: product.id,
      productName: product.name,
      variantId: selectedVariant.id,
      variantModel: selectedVariant.model,
      variantColor: selectedVariant.color,
      variantCapacity: selectedVariant.capacity,
      imageUrl: selectedVariant.imageUrls[0],
      quantity,
      unitPrice: product.basePrice,
      sku: selectedVariant.sku,
    })

    alert('Produto adicionado ao carrinho! 💚')
  }

  return (
    <div className="product-card">
      <img src={selectedVariant.imageUrls[0]} alt={product.name} />

      <h3>{product.name}</h3>
      <p className="price">{formatCurrency(product.basePrice)}</p>

      {/* Seletor de Variante */}
      <select
        value={selectedVariant.id}
        onChange={(e) => {
          const variant = product.variants.find(v => v.id === e.target.value)
          if (variant) setSelectedVariant(variant)
        }}
      >
        {product.variants.map((v) => (
          <option key={v.id} value={v.id}>
            {v.color} - {v.capacity}
          </option>
        ))}
      </select>

      {/* Quantidade */}
      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
      />

      <button onClick={handleAddToCart}>
        Adicionar ao Carrinho
      </button>
    </div>
  )
}
```

---

## 💬 Checkout - Finalizar no WhatsApp

```typescript
// components/CartCheckout.tsx
'use client'

import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { generateWhatsAppURL } from '@/lib/utils/whatsapp'
import { formatCurrency } from '@/lib/utils/formatters'

export function CartCheckout() {
  const { items, subtotal, shippingFee, total, clearCart } = useCart()

  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    specialMessage: '',
  })

  function handleCheckout() {
    if (!customerData.name || !customerData.email || !customerData.phone) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    const whatsappURL = generateWhatsAppURL({
      items,
      subtotal,
      shippingFee,
      total,
      customerName: customerData.name,
      customerEmail: customerData.email,
      customerPhone: customerData.phone,
      specialMessage: customerData.specialMessage,
    })

    // Abrir WhatsApp
    window.open(whatsappURL, '_blank')

    // Limpar carrinho
    clearCart()
  }

  if (items.length === 0) {
    return <p>Seu carrinho está vazio 🛒</p>
  }

  return (
    <div className="checkout">
      <h2>Finalizar Pedido</h2>

      {/* Resumo do Carrinho */}
      <div className="cart-summary">
        {items.map((item) => (
          <div key={item.variantId} className="cart-item">
            <img src={item.imageUrl} alt={item.productName} />
            <div>
              <h4>{item.productName}</h4>
              <p>{item.variantColor} - {item.variantCapacity}</p>
              <p>Qtd: {item.quantity}x {formatCurrency(item.unitPrice)}</p>
            </div>
            <p>{formatCurrency(item.subtotal)}</p>
          </div>
        ))}
      </div>

      {/* Totais */}
      <div className="totals">
        <p>Subtotal: {formatCurrency(subtotal)}</p>
        <p>Frete: {formatCurrency(shippingFee)}</p>
        <h3>Total: {formatCurrency(total)}</h3>
      </div>

      {/* Formulário */}
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Seu nome completo *"
          value={customerData.name}
          onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
          required
        />

        <input
          type="email"
          placeholder="Seu email *"
          value={customerData.email}
          onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
          required
        />

        <input
          type="tel"
          placeholder="WhatsApp (11) 99999-9999 *"
          value={customerData.phone}
          onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
          required
        />

        <textarea
          placeholder="Recadinho especial (opcional) 💚"
          value={customerData.specialMessage}
          onChange={(e) => setCustomerData({ ...customerData, specialMessage: e.target.value })}
          rows={3}
        />

        <button type="button" onClick={handleCheckout}>
          Finalizar no WhatsApp 💬
        </button>
      </form>
    </div>
  )
}
```

---

## 🎨 Marketing - Gerar Arte com IA

```typescript
// components/AIArtGenerator.tsx
'use client'

import { useState } from 'react'
import { generateCompleteArt } from '@/lib/actions'

export function AIArtGenerator() {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('Aquarela elegante')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function handleGenerate() {
    setLoading(true)
    setResult(null)

    const res = await generateCompleteArt(prompt, style)

    if (res.success) {
      setResult(res)
    } else {
      alert(`Erro: ${res.error}`)
    }

    setLoading(false)
  }

  return (
    <div className="ai-art-generator">
      <h2>Nano Banana Pro - Gerador de Arte IA</h2>

      <input
        type="text"
        placeholder="Descreva a arte que você quer (ex: flores tropicais douradas)"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <select value={style} onChange={(e) => setStyle(e.target.value)}>
        <option>Aquarela elegante</option>
        <option>Abstrato moderno</option>
        <option>Floral delicado</option>
        <option>Geométrico dourado</option>
      </select>

      <button onClick={handleGenerate} disabled={loading || !prompt}>
        {loading ? 'Gerando...' : 'Gerar Arte com IA'}
      </button>

      {result && (
        <div className="result">
          <h3>Arte Gerada! ✨</h3>
          <img src={result.imageUrl} alt="Arte gerada" />

          <div className="prompts">
            <p><strong>Seu Prompt:</strong> {prompt}</p>
            <p><strong>Prompt Refinado:</strong> {result.refinedPrompt}</p>
          </div>

          <button onClick={() => {
            // Salvar/Usar imagem
            alert('Arte salva com sucesso!')
          }}>
            Usar esta Arte
          </button>
        </div>
      )}
    </div>
  )
}
```

---

## 📦 Estoque - Alertas de Estoque Baixo

```typescript
// app/admin/estoque/page.tsx
import { getCriticalStockAlerts } from '@/lib/actions'
import { formatCurrency } from '@/lib/utils/formatters'

export default async function EstoquePage() {
  const alerts = await getCriticalStockAlerts()

  return (
    <div>
      <h1>Estoque Crítico</h1>

      {alerts.length === 0 ? (
        <p>Nenhum item em estoque baixo! ✅</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Insumo</th>
              <th>Categoria</th>
              <th>Estoque Atual</th>
              <th>Mínimo</th>
              <th>Fornecedor</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr key={alert.supplyId}>
                <td>{alert.supplyName}</td>
                <td>{alert.category}</td>
                <td className="text-red-600">{alert.currentStock}</td>
                <td>{alert.minStockLevel}</td>
                <td>{alert.supplierName || 'Sem fornecedor'}</td>
                <td>
                  {alert.supplierWhatsappUrl ? (
                    <a
                      href={alert.supplierWhatsappUrl}
                      target="_blank"
                      className="btn-whatsapp"
                    >
                      Pedir no WhatsApp
                    </a>
                  ) : (
                    <button>Adicionar Fornecedor</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
```

---

## 💰 Financeiro - Insights por Categoria

```typescript
// app/admin/financeiro/page.tsx
import { getCategoryInsights, getMonthlyFinanceData } from '@/lib/actions'
import { formatCurrency } from '@/lib/utils/formatters'

export default async function FinanceiroPage() {
  const [insights, monthlyData] = await Promise.all([
    getCategoryInsights(),
    getMonthlyFinanceData(6),
  ])

  return (
    <div>
      <h1>Financeiro</h1>

      {/* Insights por Categoria */}
      <section>
        <h2>Lucro por Categoria</h2>
        <table>
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Receita</th>
              <th>Despesas</th>
              <th>Lucro</th>
            </tr>
          </thead>
          <tbody>
            {insights.map((insight) => (
              <tr key={insight.category}>
                <td>{insight.category}</td>
                <td className="text-green-600">{formatCurrency(insight.totalRevenue)}</td>
                <td className="text-red-600">{formatCurrency(insight.totalExpenses)}</td>
                <td className={insight.profit > 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(insight.profit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Gráfico Mensal */}
      <section className="mt-8">
        <h2>Evolução Mensal</h2>
        <LineChart data={monthlyData} />
      </section>
    </div>
  )
}
```

---

## 🎯 Pedidos - Atualizar Status com Workflow

```typescript
// components/OrderStatusUpdater.tsx
'use client'

import { useState } from 'react'
import { updateProductionStatus } from '@/lib/actions'
import { ProductionStatus } from '@prisma/client'

interface OrderStatusUpdaterProps {
  orderId: string
  currentStatus: ProductionStatus
}

export function OrderStatusUpdater({ orderId, currentStatus }: OrderStatusUpdaterProps) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  async function handleUpdateStatus(newStatus: ProductionStatus) {
    setLoading(true)

    const result = await updateProductionStatus(orderId, newStatus)

    if (result.success) {
      setStatus(newStatus)
      alert('Status atualizado! ✅')
    } else {
      alert(`Erro: ${result.error}`)
    }

    setLoading(false)
  }

  const workflow: ProductionStatus[] = [
    'NAO_INICIADO',
    'PREPARO',
    'PINTURA',
    'CURA',
    'INSPECAO',
    'ACABAMENTO',
    'EMBALAGEM',
    'CONCLUIDO',
  ]

  const currentIndex = workflow.indexOf(status)

  return (
    <div className="order-workflow">
      <h3>Status de Produção</h3>

      <div className="workflow-steps">
        {workflow.map((step, index) => (
          <div
            key={step}
            className={`step ${index <= currentIndex ? 'completed' : ''}`}
          >
            <div className="step-icon">{index + 1}</div>
            <p>{formatProductionStatus(step)}</p>
          </div>
        ))}
      </div>

      {currentIndex < workflow.length - 1 && (
        <button
          onClick={() => handleUpdateStatus(workflow[currentIndex + 1])}
          disabled={loading}
        >
          {loading ? 'Atualizando...' : `Avançar para ${formatProductionStatus(workflow[currentIndex + 1])}`}
        </button>
      )}
    </div>
  )
}
```

---

## ✅ Validação de Formulários com Zod

```typescript
// components/ClientForm.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/actions'
import { clientSchema } from '@/lib/validations/schemas'
import { z } from 'zod'

export function ClientForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    try {
      // Validar com Zod
      const validated = clientSchema.parse(formData)

      // Criar cliente
      const result = await createClient(validated)

      if (result.success) {
        alert('Cliente criado com sucesso! ✅')
        setFormData({ name: '', email: '', phone: '' })
      } else {
        alert(`Erro: ${result.error}`)
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nome completo"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      {errors.name && <span className="error">{errors.name}</span>}

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      {errors.email && <span className="error">{errors.email}</span>}

      <input
        type="tel"
        placeholder="Telefone"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      />
      {errors.phone && <span className="error">{errors.phone}</span>}

      <button type="submit">Criar Cliente</button>
    </form>
  )
}
```

---

🎉 **Pronto!** Estes são exemplos completos de como usar o backend implementado no frontend do Laura Verissimo Atelier.
