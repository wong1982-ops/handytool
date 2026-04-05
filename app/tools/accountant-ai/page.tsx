import type { Metadata } from 'next'
import ChatPage from '@/tools/accountant-ai/chat-page'

export const metadata: Metadata = {
  title: 'Accountant AI — NZ Tax & Business Assistant | Toolk1t',
  description:
    'AI-powered NZ accounting assistant. Ask about GST, income tax, company registration, employment law, and more.',
}

export default function AccountantAiPage() {
  return <ChatPage />
}
