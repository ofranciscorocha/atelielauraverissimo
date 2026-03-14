import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando Seed...')

  // 1. Criar Categorias/Produtos de Exemplo
  const taçaCrystal = await prisma.product.upsert({
    where: { slug: 'taca-crystal-gin' },
    update: {},
    create: {
      name: 'Taça Crystal Gin',
      description: 'Taça de cristal premium para Gin, 650ml, com pintura artesanal exclusiva.',
      category: 'TAÇAS',
      basePrice: 85.00,
      slug: 'taca-crystal-gin',
      isActive: true,
      tags: ['gin', 'crystal', 'luxo'],
      variants: {
        create: [
          {
            model: 'Floral Elegance',
            color: 'Gold/White',
            capacity: '650ml',
            stockQty: 10,
            sku: 'TACA-GIN-001',
            priceAdjust: 0
          },
          {
            model: 'Tropical Summer',
            color: 'Vibrant Green',
            capacity: '650ml',
            stockQty: 5,
            sku: 'TACA-GIN-002',
            priceAdjust: 10
          }
        ]
      }
    }
  })

  // 2. Criar Cliente de Teste
  const client = await prisma.client.upsert({
    where: { email: 'teste@exemplo.com' },
    update: {},
    create: {
      name: 'Cliente de Teste',
      email: 'teste@exemplo.com',
      phone: '5521999999999',
      address: 'Rua das Flores, 123, Rio de Janeiro - RJ',
      ranking: 'NOVO',
      segment: 'POTENCIAL',
      styleVibe: 'Gosta de cores vibrantes e temas florais.'
    }
  })

  console.log('✅ Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
