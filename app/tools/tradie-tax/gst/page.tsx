import type { Metadata } from 'next'
import GstCalculator from '@/tools/tradie-tax/gst-calculator'

export const metadata: Metadata = {
  title: 'NZ GST Calculator — Inclusive & Exclusive Converter | Toolk1t',
  description:
    'Instantly convert between GST-inclusive and GST-exclusive amounts at the NZ 15% rate. See the GST component of any amount.',
}

export default function GstPage() {
  return <GstCalculator />
}
