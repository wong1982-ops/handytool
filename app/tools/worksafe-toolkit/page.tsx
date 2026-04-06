import type { Metadata } from 'next'
import PlanGenerator from '@/tools/worksafe-toolkit/plan-generator'

export const metadata: Metadata = {
  title: 'NZ WorkSafe H&S Toolkit — Health & Safety Plan Generator | Toolk1t',
  description:
    'Free NZ Health & Safety toolkit. Generate a customised H&S plan, maintain your hazard register, record incidents, and assess worker engagement — built for NZ businesses.',
}

export default function WorksafeToolkitPage() {
  return <PlanGenerator />
}
