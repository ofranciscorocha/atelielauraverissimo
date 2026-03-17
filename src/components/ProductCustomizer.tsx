'use client'

import React, { useState, useMemo } from 'react'
import { ShoppingBag, Sparkles, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Variant {
  id: string
  model: string
  color: string
  capacity: string
  priceAdjust: number
  stockQty: number
  imageUrls: string[]
}

interface Product {
  id: string
  name: string
  description: string
  basePrice: number
  variants: Variant[]
}

interface ProductCustomizerProps {
  product: Product
}

export function ProductCustomizer({ product }: ProductCustomizerProps) {
  const router = useRouter()

  // Extrair opções únicas
  const models = useMemo(() => {
    const uniqueModels = Array.from(new Set(product.variants.map(v => v.model)))
    return uniqueModels
  }, [product.variants])

  const [selectedModel, setSelectedModel] = useState<string>(models[0] || '')

  // Filtrar variantes pelo modelo selecionado
  const variantsForModel = useMemo(() => {
    return product.variants.filter(v => v.model === selectedModel)
  }, [product.variants, selectedModel])

  // Extrair tamanhos (capacidades) para o modelo selecionado
  const sizes = useMemo(() => {
    const uniqueSizes = Array.from(new Set(variantsForModel.map(v => v.capacity)))
    return uniqueSizes
  }, [variantsForModel])

  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || '')

  // Filtrar variantes pelo modelo e tamanho selecionados
  const variantsForModelAndSize = useMemo(() => {
    return variantsForModel.filter(v => v.capacity === selectedSize)
  }, [variantsForModel, selectedSize])

  // Extrair cores para o modelo e tamanho selecionados
  const colors = useMemo(() => {
    const uniqueColors = Array.from(new Set(variantsForModelAndSize.map(v => v.color)))
    return uniqueColors
  }, [variantsForModelAndSize])

  const [selectedColor, setSelectedColor] = useState<string>(colors[0] || '')

  // Atualizar tamanho quando modelo muda
  React.useEffect(() => {
    if (sizes.length > 0 && !sizes.includes(selectedSize)) {
      setSelectedSize(sizes[0])
    }
  }, [sizes, selectedSize])

  // Atualizar cor quando tamanho muda
  React.useEffect(() => {
    if (colors.length > 0 && !colors.includes(selectedColor)) {
      setSelectedColor(colors[0])
    }
  }, [colors, selectedColor])

  // Variante selecionada final
  const selectedVariant = useMemo(() => {
    return product.variants.find(
      v => v.model === selectedModel && v.capacity === selectedSize && v.color === selectedColor
    )
  }, [product.variants, selectedModel, selectedSize, selectedColor])

  // Preço final
  const finalPrice = useMemo(() => {
    if (!selectedVariant) return product.basePrice
    return product.basePrice + Number(selectedVariant.priceAdjust)
  }, [product.basePrice, selectedVariant])

  const handleAddToCart = () => {
    if (!selectedVariant) {
      alert('Por favor, selecione todas as opções')
      return
    }

    // Recuperar carrinho do localStorage
    const cartStr = localStorage.getItem('cart')
    const cart = cartStr ? JSON.parse(cartStr) : []

    // Verificar se já existe no carrinho
    const existingItemIndex = cart.findIndex((item: any) => item.variant.id === selectedVariant.id)

    if (existingItemIndex >= 0) {
      // Incrementar quantidade
      cart[existingItemIndex].quantity += 1
    } else {
      // Adicionar novo item
      cart.push({
        product: {
          id: product.id,
          name: product.name,
          slug: '', // Será preenchido se necessário
        },
        variant: selectedVariant,
        quantity: 1,
        price: finalPrice
      })
    }

    localStorage.setItem('cart', JSON.stringify(cart))

    // Disparar evento customizado para atualizar header
    window.dispatchEvent(new Event('cartUpdated'))

    // Redirecionar para carrinho
    
  }

  return (
    <div className="space-y-8">
      {/* Seletor de Modelo */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
          Escolha o Modelo
        </p>
        <div className="flex flex-wrap gap-3">
          {models.map((model) => (
            <button
              key={model}
              onClick={() => setSelectedModel(model)}
              className={`px-6 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white active:scale-95 ${
                selectedModel === model
                  ? 'border-[#304930] bg-[#304930] text-white'
                  : 'border-black/10 hover:border-[#304930]/40'
              }`}
            >
              {model}
            </button>
          ))}
        </div>
      </div>

      {/* Seletor de Tamanho */}
      {sizes.length > 1 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
            Escolha o Tamanho
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sizes.map((size) => {
              // Pegar uma variante com este tamanho para mostrar o preço
              const variantForSize = variantsForModel.find(v => v.capacity === size)
              const priceForSize = variantForSize
                ? product.basePrice + Number(variantForSize.priceAdjust)
                : product.basePrice

              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`p-4 rounded-2xl border transition-all hover:bg-white active:scale-95 ${
                    selectedSize === size
                      ? 'border-[#304930] bg-[#304930]/5 ring-2 ring-[#304930]'
                      : 'border-black/10 hover:border-[#304930]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black uppercase tracking-widest text-[#304930]">
                      {size}
                    </span>
                    {selectedSize === size && (
                      <Check className="w-4 h-4 text-[#304930]" />
                    )}
                  </div>
                  <p className="text-sm font-bold text-[#304930]/60">
                    R$ {priceForSize.toFixed(2)}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Seletor de Cor */}
      {colors.length > 1 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
            Escolha a Cor
          </p>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-6 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white active:scale-95 ${
                  selectedColor === color
                    ? 'border-[#D6B799] bg-[#D6B799]/10 ring-2 ring-[#D6B799]'
                    : 'border-black/10 hover:border-[#304930]/40'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preço Final */}
      <div className="flex items-end gap-4 py-6 border-t border-black/5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            Valor Unitário
          </p>
          <p className="text-4xl font-black text-[#304930] tracking-tighter">
            R$ {finalPrice.toFixed(2)}
          </p>
        </div>
        <p className="text-xs font-bold text-emerald-600 mb-1">Até 3x sem juros</p>
      </div>

      {/* Informações da Seleção */}
      {selectedVariant && (
        <div className="bg-[#304930]/5 rounded-2xl p-4 border border-[#304930]/10">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#D6B799] mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-widest text-[#304930] mb-1">
                Sua Configuração:
              </p>
              <p className="text-sm text-[#304930]/70">
                {selectedModel} • {selectedSize} • {selectedColor}
              </p>
              {selectedVariant.stockQty > 0 ? (
                <p className="text-xs text-emerald-600 font-bold mt-2">
                  ✓ {selectedVariant.stockQty} unidades disponíveis
                </p>
              ) : (
                <p className="text-xs text-orange-600 font-bold mt-2">
                  ⚠ Sob encomenda (7-15 dias)
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Botão Adicionar ao Carrinho */}
      <button
        onClick={handleAddToCart}
        disabled={!selectedVariant}
        className="w-full bg-[#304930] text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-[#3F5F3F] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Adicionar ao Carrinho
        <ShoppingBag className="w-5 h-5" />
      </button>
    </div>
  )
}
