import type { Metadata } from 'next'
import IncidentReport from '@/tools/worksafe-toolkit/incident-report'

export const metadata: Metadata = {
  title: 'Incident Report — NZ WorkSafe Toolkit | Toolk1t',
  description:
    'Record workplace incidents, near misses, and notifiable events. Generate a signed PDF incident report for your NZ business.',
}

export default function IncidentsPage() {
  return <IncidentReport />
}
