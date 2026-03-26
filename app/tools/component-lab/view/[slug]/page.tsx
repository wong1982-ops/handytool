import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import ComponentViewer from '@/tools/component-lab/component-viewer'
import type { SavedComponent } from '@/tools/component-lab/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getComponent(slug: string): Promise<SavedComponent | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('components_library')
    .select(
      'id, name, slug, tags, prompt, settings, code_react, code_vue, code_svelte, code_html, thumbnail_url, is_public, copy_count, created_at, updated_at',
    )
    .eq('slug', slug)
    .eq('is_public', true)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    tags: data.tags ?? [],
    prompt: data.prompt ?? '',
    settings: data.settings as SavedComponent['settings'],
    codeReact: data.code_react ?? '',
    codeVue: data.code_vue ?? '',
    codeSvelte: data.code_svelte ?? '',
    codeHtml: data.code_html ?? '',
    thumbnailUrl: data.thumbnail_url,
    isPublic: data.is_public,
    copyCount: data.copy_count ?? 0,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const component = await getComponent(slug)

  if (!component) {
    return { title: 'Component Not Found | Toolk1t' }
  }

  return {
    title: `${component.name} — Component Lab | Toolk1t`,
    description: `View and copy the "${component.name}" component. Built with AI in Component Lab.`,
  }
}

export default async function ComponentViewPage({ params }: PageProps) {
  const { slug } = await params
  const component = await getComponent(slug)

  if (!component) {
    notFound()
  }

  return (
    <main
      className="flex-1 flex flex-col bg-[#090f16] min-h-screen"
      style={{ overscrollBehaviorX: 'none' } as React.CSSProperties}
    >
      <div className="px-4 md:px-6 pt-4">
        <ToolBreadcrumb toolName="Component Lab" toolSlug="component-lab" />
      </div>

      <div className="px-4 md:px-6 pb-8 max-w-6xl mx-auto w-full">
        <ComponentViewer component={component} />
      </div>
    </main>
  )
}
