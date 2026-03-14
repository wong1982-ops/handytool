import { withJobStep } from '@/lib/story/job-step'
import { generateIllustration, type CharacterReference } from '@/lib/story/illustrate'
import { uploadSeedBuffer, downloadSeedBuffer } from '@/lib/story/r2-seeds'
import type { StoryConcept } from '@/lib/story/types'

export const POST = withJobStep('illustrate_page', async (ctx) => {
  const { job, supabase } = ctx
  const pageNum = parseInt(ctx.params.page, 10)
  const { concept, seriesId, characterIds } = job.input as {
    concept: StoryConcept
    seriesId?: string
    characterIds?: string[]
  }

  // Idempotent: check if this page is already illustrated
  const existingPages = (job.state.pages as { seq: number; imageUrl: string }[] | undefined) ?? []
  if (existingPages.find(p => p.seq === pageNum)) {
    return { statePatch: {} }
  }

  const storyData = job.state.storyData as Record<string, unknown>
  const bookSeed = job.state.bookSeed as number | undefined
  const allPages = (storyData?.pages || []) as { sequence: number; imagePrompt: string }[]
  const page = allPages.find(p => p.sequence === pageNum)

  if (!page) {
    throw new Error(`Page ${pageNum} not found in story data`)
  }

  const characters = ((storyData?.characters || []) as { name: string; description: string }[]).map(c => ({
    name: c.name,
    description: c.description,
  }))

  // Load character references
  let referenceImage: Buffer | undefined
  let characterReferences: CharacterReference[] = []

  if (job.state.characterRefMode === 'series' && seriesId) {
    try {
      const { data: seriesData } = await supabase.rpc('get_series_with_characters', {
        p_series_id: seriesId,
        p_user_id: job.user_id,
      })
      const series = Array.isArray(seriesData) ? seriesData?.[0] : seriesData
      if (series) {
        const chars = (series.characters as { name: string; description: string; referenceImageUrl?: string; status: string }[]) || []
        const approvedChars = chars.filter(c => c.status === 'approved' && c.referenceImageUrl)
        for (const c of approvedChars) {
          try {
            const res = await fetch(c.referenceImageUrl!)
            if (res.ok) {
              const buf = Buffer.from(await res.arrayBuffer())
              characterReferences.push({ name: c.name, description: c.description, buffer: buf })
            }
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      console.error(`[illustrate-page] Failed to reload series characters for page ${pageNum}:`, err)
    }
  } else if (job.state.characterRefMode === 'standalone' && characterIds?.length) {
    // Standalone characters selected by user — load their primary portraits
    for (const cid of characterIds) {
      try {
        const { data: charData } = await supabase.rpc('get_character_detail', {
          p_character_id: cid,
          p_user_id: job.user_id,
        })
        if (!charData) continue
        const c = charData as { name: string; physical_description?: string; reference_image_url?: string }
        if (c.reference_image_url) {
          const res = await fetch(c.reference_image_url)
          if (res.ok) {
            const buf = Buffer.from(await res.arrayBuffer())
            characterReferences.push({ name: c.name, description: c.physical_description || '', buffer: buf })
          }
        }
      } catch { /* skip */ }
    }
  } else if (job.state.characterRefUrl) {
    try {
      const res = await fetch(job.state.characterRefUrl as string)
      if (res.ok) {
        referenceImage = Buffer.from(await res.arrayBuffer())
      }
    } catch (err) {
      console.error(`[illustrate-page] Failed to download character reference for page ${pageNum}:`, err)
    }
  }

  // Download previous page's seed buffer for visual continuity (Strategy 5)
  // Page 1 uses seed-0 (cover buffer), page 2 uses seed-1, etc.
  const previousPageSeed = await downloadSeedBuffer(job.id, pageNum - 1)

  const result = await generateIllustration({
    imagePrompt: page.imagePrompt,
    characters,
    referenceImage,
    characterReferences: characterReferences.length > 0 ? characterReferences : undefined,
    previousPageImage: previousPageSeed ?? undefined,
    seed: bookSeed,
    style: concept.tags.style,
  })

  // Upload this page's buffer as seed for the next page
  if (result.buffer) {
    await uploadSeedBuffer(job.id, pageNum, result.buffer)
  }

  // Append to pages array in state
  const updatedPages = [...existingPages, { seq: pageNum, imageUrl: result.url }]

  return {
    statePatch: { pages: updatedPages },
  }
})
