import type { Metadata } from 'next'
import EcommerceReadiness from '@/tools/ecommerce-readiness/ecommerce-readiness'

export const metadata: Metadata = {
  title: 'E-commerce Readiness Calculator — NZ Small Business | Toolk1t',
  description:
    'Free assessment for NZ small businesses. Get your e-commerce readiness score, platform recommendation, cost estimate, and step-by-step launch plan.',
}

export default function EcommerceReadinessPage() {
  return <EcommerceReadiness />
}
