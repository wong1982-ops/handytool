import type { Metadata } from 'next'
import VisaPathway from '@/tools/visa-pathway/visa-pathway'

export const metadata: Metadata = {
  title: 'NZ Visa Pathway Finder — Immigration Guide | Toolk1t',
  description:
    'Free NZ immigration tool. Find which visa you qualify for, calculate SMC points, check the Green List, and get document checklists.',
}

export default function VisaPathwayPage() {
  return <VisaPathway />
}
