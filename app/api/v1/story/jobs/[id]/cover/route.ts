import { withJobStep } from '@/lib/story/job-step'
import { generateIllustration, type CharacterReference } from '@/lib/story/illustrate'
import { uploadSeedBuffer } from '@/lib/story/r2-seeds'
import type { StoryConcept } from '@/lib/story/types'

export const POST = withJobStep('cover', async (ctx) => {
  const { job, supabase } = ctx
  const { concept, seriesId } = job.input as {
    concept: StoryConcept
    seriesId?: string
  }

  // Idempotent
  if (job.state.coverUrl) {
    return { statePatch: {} }
  }

  const storyData = job.state.storyData as Record<string, unknown>
  const characters = ((storyData?.characters || []) as { name: string; description: string }[]).map(c => ({
    name: c.name,
    description: c.description,
  }))

  // Load character references based on mode
  let referenceImage: Buffer | undefined
  let characterReferences: CharacterReference[] = []

  if (job.state.characterRefMode === 'series' && seriesId) {
    // Re-fetch series character portraits
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
      console.error('[cover] Failed to reload series characters:', err)
    }
  } else if (job.state.characterRefUrl) {
    // Standalone mode: download the generated reference
    try {
      const res = await fetch(job.state.characterRefUrl as string)
      if (res.ok) {
        referenceImage = Buffer.from(await res.arrayBuffer())
      }
    } catch (err) {
      console.error('[cover] Failed to download character reference:', err)
    }
  }

  // Lock seed for this book
  const bookSeed = Math.floor(Math.random() * 2147483647)

  const coverPrompt = `${concept.tags.style} style book cover illustration. ${concept.coverDescription}. Beautiful, cinematic, no text or words in the image.`

  const coverResult = await generateIllustration({
    imagePrompt: coverPrompt,
    characters,
    referenceImage,
    characterReferences: characterReferences.length > 0 ? characterReferences : undefined,
    seed: bookSeed,
    style: concept.tags.style,
  })

  // Store cover's buffer as seed-0 for page 1 chaining
  if (coverResult.buffer) {
    await uploadSeedBuffer(job.id, 0, coverResult.buffer)
  }

  return {
    statePatch: {
      coverUrl: coverResult.url,
      bookSeed,
    },
  }
})
