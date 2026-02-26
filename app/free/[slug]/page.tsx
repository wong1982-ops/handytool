import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { landingPages } from '@/lib/seo/landing-pages'
import { tools } from '@/lib/tools'
import { buildWebAppSchema, buildBreadcrumbSchema } from '@/lib/seo/schemas'
import { LandingPageTemplate } from '@/components/seo/landing-page-template'

export const revalidate = 86400

export function generateStaticParams() {
  return landingPages.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = landingPages.find((p) => p.slug === slug)
  if (!page) return {}
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/free/${page.slug}` },
    openGraph: { title: `${page.title} | Toolk1t`, description: page.description, url: `/free/${page.slug}` },
  }
}

export default async function FreeLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = landingPages.find((p) => p.slug === slug)
  if (!page) notFound()

  const relatedTools = tools
    .filter((t) => t.href !== `/tools/${page.toolSlug}`)
    .slice(0, 4)
    .map((t) => ({ name: t.name, href: t.href }))

  const jsonLd = [
    buildWebAppSchema({ name: page.title, description: page.description, url: `/free/${page.slug}` }),
    buildBreadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Free Tools', path: '/free' }, { name: page.h1 }]),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LandingPageTemplate
        h1={page.h1}
        description={page.description}
        toolHref={`/tools/${page.toolSlug}`}
        toolName={page.toolName}
        howToTitle={`How to use the ${page.toolName}`}
        steps={page.howTo}
        features={page.features}
        relatedTools={relatedTools}
      />
    </>
  )
}
