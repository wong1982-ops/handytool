import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { useCases } from '@/lib/seo/use-cases'
import { tools } from '@/lib/tools'
import { buildWebAppSchema, buildBreadcrumbSchema } from '@/lib/seo/schemas'
import { UseCaseTemplate } from '@/components/seo/use-case-template'

export const revalidate = 86400

export function generateStaticParams() {
  return useCases.map((uc) => ({ slug: uc.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const uc = useCases.find((u) => u.slug === slug)
  if (!uc) return {}
  return {
    title: uc.title,
    description: uc.description,
    alternates: { canonical: `/use-cases/${uc.slug}` },
    openGraph: { title: `${uc.title} | Toolk1t`, description: uc.description, url: `/use-cases/${uc.slug}` },
  }
}

export default async function UseCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const uc = useCases.find((u) => u.slug === slug)
  if (!uc) notFound()

  const relatedTools = tools
    .filter((t) => t.href !== `/tools/${uc.toolSlug}`)
    .slice(0, 4)
    .map((t) => ({ name: t.name, href: t.href }))

  const jsonLd = [
    buildWebAppSchema({ name: uc.title, description: uc.description, url: `/use-cases/${uc.slug}` }),
    buildBreadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Use Cases', path: '/use-cases' }, { name: uc.h1 }]),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <UseCaseTemplate
        h1={uc.h1}
        problem={uc.problem}
        solution={uc.solution}
        toolHref={`/tools/${uc.toolSlug}`}
        toolName={uc.toolName}
        steps={uc.steps}
        benefits={uc.benefits}
        relatedTools={relatedTools}
      />
    </>
  )
}
