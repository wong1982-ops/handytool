import type { Metadata } from 'next'
import HazardRegister from '@/tools/worksafe-toolkit/hazard-register'

export const metadata: Metadata = {
  title: 'Hazard Register — NZ WorkSafe Toolkit | Toolk1t',
  description:
    'Manage workplace hazards with our digital hazard register. Add, edit, and track risks with risk levels, controls, and review dates for your NZ business.',
}

export default function HazardsPage() {
  return <HazardRegister />
}
