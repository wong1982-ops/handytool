import { withJobStep } from '@/lib/story/job-step'
import { generateCharacterReference } from '@/lib/story/illustrate'
import { uploadToR2 } from '@/lib/storage/r2'
import type { StoryConcept } from '@/lib/story/types'

export const POST = withJobStep('character_ref', async (ctx) => {
  const { job, supabase } = ctx
  const { concept, seriesId } = job.input as {
    concept: StoryConcept
    seriesId?: string
  }

  // Idempotent
  if (job.state.characterRefUrl || job.state.characterRefSkipped) {
    return { statePatch: {} }
  }

  const storyData = job.state.storyData as Record<string, unknown>
  const characters = ((storyData?.characters || []) as { name: string; description: string }[]).map(c => ({
    name: c.name,
    description: c.description,
  }))

  // Check for existing series character portraits
  let seriesReferenceImages: { name: string; description: string; buffer: Buffer }[] = []

  if (seriesId) {
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
              seriesReferenceImages.push({ name: c.name, description: c.description, buffer: buf })
            }
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      console.error('[character-ref] Failed to load series characters:', err)
    }
  }

  if (seriesReferenceImages.length > 0) {
    // Series mode: store character ref metadata (buffers re-fetched by illustrate step)
    const charNames = seriesReferenceImages.map(r => r.name)
    return {
      statePatch: {
        characterRefMode: 'series',
        characterRefNames: charNames,
      },
    }
  }

  // Standalone mode: generate new reference sheet
  let referenceImage = await generateCharacterReference(characters, concept.tags.style)

  // Retry once
  if (!referenceImage) {
    referenceImage = await generateCharacterReference(characters, concept.tags.style)
  }

  if (referenceImage) {
    const refPath = `jobs/${job.id}/character-ref.png`
    const refUrl = await uploadToR2(refPath, referenceImage, 'image/png', { upsert: true })
    return {
      statePatch: {
        characterRefUrl: refUrl,
        characterRefMode: 'standalone',
      },
    }
  }

  // No reference available — continue without it
  return {
    statePatch: { characterRefSkipped: true },
  }
})
