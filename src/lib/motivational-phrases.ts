// Frases motivacionais do Ateliê Laura Veríssimo
// Cada etapa do checkout terá frases diferentes

export const MOTIVATIONAL_PHRASES = {
  cart: [
    "Cada taça conta uma história única ✨",
    "Arte que brilha em suas mãos 🎨",
    "Transformando cristal em poesia 💎",
    "Seu momento merece esse brilho ⭐",
    "Cada pincelada carrega amor e dedicação 💚",
    "Cristais que celebram sua essência ✨",
    "Arte artesanal que toca o coração 🎨",
    "Exclusividade em cada detalhe pintado 💎"
  ],

  delivery: [
    "Sua obra de arte a caminho de casa 🚚",
    "Preparando seu tesouro com todo carinho 📦",
    "Cada embalagem é feita com amor 💝",
    "Levando magia até você ✨",
    "Arte que viaja com segurança 🎁",
    "Seu pedido será um presente especial 💚",
    "Cuidamos de cada detalhe da entrega 🌟",
    "Cristais protegidos, emoções garantidas 💎"
  ],

  payment: [
    "Um investimento em beleza e qualidade ✨",
    "Seu momento de brilhar começa agora 💎",
    "Arte que vale cada centavo 🎨",
    "Garantindo sua satisfação em cada detalhe 💚",
    "Pagamento seguro para sua tranquilidade 🔒",
    "Finalizando sua experiência única ⭐",
    "Um brinde à arte e à sofisticação 🥂",
    "Seu pedido exclusivo quase pronto! 💫"
  ]
}

export function getRandomPhrase(step: 'cart' | 'delivery' | 'payment'): string {
  const phrases = MOTIVATIONAL_PHRASES[step]
  const randomIndex = Math.floor(Math.random() * phrases.length)
  return phrases[randomIndex]
}
