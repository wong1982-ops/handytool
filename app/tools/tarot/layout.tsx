import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tarot Card Reading — AI-Powered Divination | Toolk1t',
  description: 'Get personalized AI tarot card readings with 20+ spreads. Draw cards, watch immersive reveal animations, and receive Gemini AI interpretations in English and Chinese.',
  keywords: ['tarot', 'card reading', 'divination', 'AI tarot', 'tarot spread', 'fortune telling', '塔罗牌', '占卜'],
  openGraph: {
    title: 'Tarot Card Reading — AI-Powered Divination',
    description: 'Get personalized AI tarot card readings with 20+ spreads, immersive animations, and bilingual interpretations.',
    type: 'website',
  },
}

export default function TarotLayout({ children }: { children: React.ReactNode }) {
  return children
}
