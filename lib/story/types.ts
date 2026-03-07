import { z } from 'zod'

export const audienceSchema = z.enum(['toddler', 'early-reader', 'middle-grade', 'young-adult', 'all-ages'])
export const stylePresetSchema = z.enum(['watercolor', 'cartoon', 'anime', 'realistic', 'paper-craft', 'custom'])

export const enrichRequestSchema = z.object({
  plot: z.string().min(20, 'Plot must be at least 20 characters').max(2000),
  title: z.string().max(200).optional(),
  audience: audienceSchema,
  pageCount: z.number().int().min(8).max(16),
  style: z.object({
    preset: stylePresetSchema,
    customPrompt: z.string().max(500).optional(),
  }),
})

export const illustrateRequestSchema = z.object({
  imagePrompt: z.string().min(10).max(2000),
  style: z.object({
    preset: stylePresetSchema,
    customPrompt: z.string().max(500).optional(),
  }),
  characters: z.array(z.object({
    name: z.string(),
    description: z.string(),
  })).optional(),
})

export const regenerateStoryRequestSchema = z.object({
  book: z.object({
    title: z.string(),
    audience: audienceSchema,
    theme: z.string(),
    setting: z.string(),
    characters: z.array(z.object({
      name: z.string(),
      role: z.enum(['protagonist', 'antagonist', 'supporting']),
      description: z.string(),
      age: z.string().optional(),
    })),
    pages: z.array(z.object({
      sequence: z.number(),
      sceneDescription: z.string(),
      narrativeText: z.string(),
      dialogue: z.array(z.object({
        speaker: z.string(),
        line: z.string(),
      })).optional(),
      mood: z.string(),
    })),
    style: z.object({
      preset: stylePresetSchema,
      customPrompt: z.string().max(500).optional(),
    }),
  }),
  pageCount: z.number().int().min(8).max(16),
})

export const exportPdfRequestSchema = z.object({
  title: z.string(),
  pages: z.array(z.object({
    sequence: z.number(),
    narrativeText: z.string(),
    dialogue: z.array(z.object({
      speaker: z.string(),
      line: z.string(),
    })).optional(),
    imageUrl: z.string().url(),
  })),
})

export type EnrichRequest = z.infer<typeof enrichRequestSchema>
export type IllustrateRequest = z.infer<typeof illustrateRequestSchema>
export type RegenerateStoryRequest = z.infer<typeof regenerateStoryRequestSchema>
export type ExportPdfRequest = z.infer<typeof exportPdfRequestSchema>
