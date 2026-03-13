import { z } from 'zod'

// --- Concept sections ---

export const conceptSectionsSchema = z.object({
  premise: z.string(),
  authorIntent: z.string(),
  messageToAudience: z.string(),
  narrativeArc: z.string(),
  tone: z.string(),
  visualStyle: z.string(),
})

// --- Concept generation ---

export const conceptsRequestSchema = z.object({
  plot: z.string().min(10, 'Plot must be at least 10 characters').max(2000),
  seriesId: z.string().uuid().optional(),
})

export const storyConceptSchema = z.object({
  id: z.string(),
  title: z.string(),
  coverDescription: z.string(),
  sections: conceptSectionsSchema,
  tags: z.object({
    style: z.string(),
    audience: z.string(),
    pageCount: z.number().int().min(6).max(16),
    tone: z.string(),
  }),
})

// --- Full generation ---

export const generateRequestSchema = z.object({
  plot: z.string().min(10).max(2000),
  concept: storyConceptSchema,
  seriesId: z.string().uuid().optional(),
  skipIllustration: z.boolean().optional(),
  skipAudio: z.boolean().optional(),
  skipValidation: z.boolean().optional(),
})

// --- Concept refinement ---

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
})

export const refineRequestSchema = z.object({
  concept: storyConceptSchema,
  message: z.string().min(1).max(1000),
  history: z.array(chatMessageSchema).max(6),
})

// --- Regeneration (kept from editor) ---

export const regenerateStoryRequestSchema = z.object({
  book: z.object({
    title: z.string(),
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
    concept: storyConceptSchema,
  }),
  pageCount: z.number().int().min(6).max(16),
})

// --- Regenerate single image (kept from editor) ---

export const regenerateImageRequestSchema = z.object({
  imagePrompt: z.string().min(10).max(2000),
  characters: z.array(z.object({
    name: z.string(),
    description: z.string(),
  })).optional(),
})

// --- PDF export ---

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

// --- Save / Share ---

export const saveBookRequestSchema = z.object({
  book: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    concept: storyConceptSchema,
    theme: z.string(),
    setting: z.string(),
    characters: z.array(z.any()),
    pages: z.array(z.any()),
    status: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
})

export const shareBookRequestSchema = z.object({
  bookId: z.string().uuid(),
  isPublic: z.boolean(),
})

export type ConceptsRequest = z.infer<typeof conceptsRequestSchema>
export type StoryConcept = z.infer<typeof storyConceptSchema>
export type GenerateRequest = z.infer<typeof generateRequestSchema>
export type RefineRequest = z.infer<typeof refineRequestSchema>
export type ChatMessage = z.infer<typeof chatMessageSchema>
export type RegenerateStoryRequest = z.infer<typeof regenerateStoryRequestSchema>
export type RegenerateImageRequest = z.infer<typeof regenerateImageRequestSchema>
export type ExportPdfRequest = z.infer<typeof exportPdfRequestSchema>
