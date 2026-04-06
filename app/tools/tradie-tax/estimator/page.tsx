import type { Metadata } from 'next'
import TaxEstimator from '@/tools/tradie-tax/tax-estimator'

export const metadata: Metadata = {
  title: 'NZ Tax Estimator — Income Tax, Provisional Tax & ACC | Toolk1t',
  description:
    'Estimate your NZ income tax, provisional tax, and ACC levy based on 2025/26 tax brackets. For sole traders and tradies.',
}

export default function EstimatorPage() {
  return <TaxEstimator />
}
