'use server'

// LAURA VERISSIMO ATELIER - NANO BANANA PRO (AI ACTIONS)
// Integração com OpenAI para refinamento de prompts de arte

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import OpenAI from 'openai'

// ========================================
// INICIALIZAR OPENAI CLIENT
// ========================================

let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY não configurada nas variáveis de ambiente')
    }

    openaiClient = new OpenAI({
      apiKey,
    })
  }

  return openaiClient
}

// ========================================
// TIPOS & INTERFACES
// ========================================

export interface PromptRefinementResult {
  success: boolean
  originalPrompt: string
  refinedPrompt?: string
  error?: string
}

export interface ArtGenerationResult {
  success: boolean
  artId?: string
  imageUrl?: string
  error?: string
}

// ========================================
// REFINAR PROMPT DE ARTE (Nano Banana Pro)
// ========================================

export async function refineArtPrompt(
  originalPrompt: string,
  style?: string
): Promise<PromptRefinementResult> {
  try {
    const client = getOpenAIClient()

    // Prompt para o GPT refinar
    const systemPrompt = `Você é um especialista em arte e design para taças e cristais pintados à mão.
Sua missão é transformar prompts simples em descrições detalhadas e artísticas para geração de imagens.

REGRAS:
- Sempre mantenha o tema luxuoso e artesanal
- Foque em paletas de cores sofisticadas (esmeralda, dourado, prata, aquarela)
- Inclua texturas e detalhes de pintura manual
- Evite elementos muito complexos ou impossíveis de pintar à mão
- O resultado deve ser algo que possa ser pintado em uma taça ou cristal
- Seja poético e detalhado, mas conciso (máximo 300 caracteres)

Estilo preferencial: ${style || 'Aquarela elegante com toques dourados'}

Responda APENAS com o prompt refinado, sem explicações adicionais.`

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: originalPrompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 200,
    })

    const refinedPrompt = response.choices[0]?.message?.content?.trim()

    if (!refinedPrompt) {
      throw new Error('Nenhum prompt refinado foi gerado')
    }

    return {
      success: true,
      originalPrompt,
      refinedPrompt,
    }
  } catch (error: any) {
    console.error('[NANO BANANA PRO] Erro ao refinar prompt:', error)
    return {
      success: false,
      originalPrompt,
      error: error.message || 'Erro ao refinar prompt',
    }
  }
}

// ========================================
// GERAR ARTE COM DALL-E (Simulação/Real)
// ========================================

export async function generateArtImage(
  refinedPrompt: string,
  originalPrompt: string,
  style: string = 'Aquarela elegante'
): Promise<ArtGenerationResult> {
  try {
    const client = getOpenAIClient()

    // Adicionar contexto artístico ao prompt
    const fullPrompt = `${refinedPrompt}. Estilo: ${style}. Arte para pintura manual em taça de cristal. Alta qualidade, fundo transparente ou neutro.`

    // Gerar imagem com DALL-E 3
    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt: fullPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'natural',
    })

    const imageUrl = response.data[0]?.url

    if (!imageUrl) {
      throw new Error('Nenhuma imagem foi gerada')
    }

    // Salvar no banco de dados
    const art = await prisma.aIGeneratedArt.create({
      data: {
        originalPrompt,
        refinedPrompt,
        imageUrl,
        style,
        colors: extractColors(refinedPrompt), // Função auxiliar
        approved: false,
        usedInProduct: false,
      },
    })

    revalidatePath('/admin/marketing')

    return {
      success: true,
      artId: art.id,
      imageUrl: art.imageUrl,
    }
  } catch (error: any) {
    console.error('[NANO BANANA PRO] Erro ao gerar imagem:', error)
    return {
      success: false,
      error: error.message || 'Erro ao gerar imagem',
    }
  }
}

// ========================================
// GERAR ARTE COMPLETA (Refinar + Gerar)
// ========================================

export async function generateCompleteArt(
  originalPrompt: string,
  style?: string
): Promise<ArtGenerationResult & { refinedPrompt?: string }> {
  try {
    // Passo 1: Refinar o prompt
    const refinementResult = await refineArtPrompt(originalPrompt, style)

    if (!refinementResult.success || !refinementResult.refinedPrompt) {
      return {
        success: false,
        error: refinementResult.error || 'Erro ao refinar prompt',
      }
    }

    // Passo 2: Gerar a imagem
    const generationResult = await generateArtImage(
      refinementResult.refinedPrompt,
      originalPrompt,
      style || 'Aquarela elegante'
    )

    if (!generationResult.success) {
      return {
        success: false,
        error: generationResult.error,
      }
    }

    return {
      success: true,
      artId: generationResult.artId,
      imageUrl: generationResult.imageUrl,
      refinedPrompt: refinementResult.refinedPrompt,
    }
  } catch (error: any) {
    console.error('[NANO BANANA PRO] Erro ao gerar arte completa:', error)
    return {
      success: false,
      error: error.message || 'Erro ao gerar arte',
    }
  }
}

// ========================================
// APROVAR ARTE GERADA
// ========================================

export async function approveGeneratedArt(artId: string) {
  try {
    const art = await prisma.aIGeneratedArt.update({
      where: { id: artId },
      data: {
        approved: true,
      },
    })

    revalidatePath('/admin/marketing')
    return { success: true, art }
  } catch (error) {
    console.error('[NANO BANANA PRO] Erro ao aprovar arte:', error)
    return { success: false, error: 'Erro ao aprovar arte' }
  }
}

// ========================================
// UPLOAD DE IMAGEM SEM MARCA D'ÁGUA
// ========================================

export async function updateArtWithCleanImage(artId: string, cleanImageUrl: string) {
  try {
    const art = await prisma.aIGeneratedArt.update({
      where: { id: artId },
      data: {
        imageUrlNoWatermark: cleanImageUrl,
      },
    })

    revalidatePath('/admin/marketing')
    return { success: true, art }
  } catch (error) {
    console.error('[NANO BANANA PRO] Erro ao atualizar imagem:', error)
    return { success: false, error: 'Erro ao atualizar imagem' }
  }
}

// ========================================
// LISTAR ARTES GERADAS
// ========================================

export async function getGeneratedArts(filters?: {
  approved?: boolean
  usedInProduct?: boolean
  limit?: number
}) {
  try {
    const where: any = {}

    if (filters?.approved !== undefined) {
      where.approved = filters.approved
    }

    if (filters?.usedInProduct !== undefined) {
      where.usedInProduct = filters.usedInProduct
    }

    const arts = await prisma.aIGeneratedArt.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: filters?.limit || 50,
    })

    return arts
  } catch (error) {
    console.error('[NANO BANANA PRO] Erro ao listar artes:', error)
    return []
  }
}

// ========================================
// HELPER: EXTRAIR CORES DO PROMPT
// ========================================

function extractColors(prompt: string): string[] {
  const colorKeywords = [
    'verde',
    'esmeralda',
    'dourado',
    'ouro',
    'prata',
    'azul',
    'roxo',
    'rosa',
    'vermelho',
    'amarelo',
    'laranja',
    'turquesa',
    'violeta',
    'coral',
    'champagne',
  ]

  const lowerPrompt = prompt.toLowerCase()
  const foundColors = colorKeywords.filter((color) => lowerPrompt.includes(color))

  // Se não encontrou cores específicas, retornar paleta padrão
  return foundColors.length > 0 ? foundColors : ['esmeralda', 'dourado']
}
