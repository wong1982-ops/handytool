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
  characterIds: z.array(z.string().uuid()).optional(),
  artStyle: z.string().max(100).optional(),
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
  characterIds: z.array(z.string().uuid()).optional(),
  artStyle: z.string().max(100).optional(),
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

// --- Modular Story Studio types ---

// Character (top-level entity)
export const characterSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  age: z.string().max(50).nullable().optional(),
  role: z.enum(['protagonist', 'antagonist', 'supporting']).nullable().optional(),
  personality: z.string().max(1000).nullable().optional(),
  physicalDescription: z.string().max(2000).nullable().optional(),
  referenceImageUrl: z.string().url().nullable().optional(),
  voice: z.string().nullable().optional(),
  status: z.enum(['draft', 'approved']),
  refinementCount: z.number().int().min(0).default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
  series: z.array(z.object({ id: z.string().uuid(), title: z.string() })).optional(),
})

export type Character = z.infer<typeof characterSchema>

// Create/update character requests
export const createCharacterRequestSchema = z.object({
  name: z.string().min(1).max(100),
  age: z.string().max(50).optional(),
  role: z.enum(['protagonist', 'antagonist', 'supporting']).optional(),
  personality: z.string().max(1000).optional(),
  physicalDescription: z.string().max(2000).optional(),
  voice: z.string().optional(),
  seriesIds: z.array(z.string().uuid()).optional(),
})

export const updateCharacterRequestSchema = createCharacterRequestSchema.partial().extend({
  status: z.enum(['draft', 'approved']).optional(),
  referenceImageUrl: z.string().url().optional(),
  refinementCount: z.number().int().optional(),
})

export type CreateCharacterRequest = z.infer<typeof createCharacterRequestSchema>
export type UpdateCharacterRequest = z.infer<typeof updateCharacterRequestSchema>

// Book page (normalized)
export const bookPageSchema = z.object({
  id: z.string().uuid(),
  bookId: z.string().uuid(),
  sequence: z.number().int().min(1),
  sceneDescription: z.string().nullable().optional(),
  narrativeText: z.string().nullable().optional(),
  imagePrompt: z.string().nullable().optional(),
  dialogue: z.array(z.object({
    speaker: z.string(),
    line: z.string(),
  })).default([]),
  mood: z.string().nullable().optional(),
  // Media status (joined from page_illustrations / page_audio)
  illustrationId: z.string().uuid().nullable().optional(),
  illustrationUrl: z.string().url().nullable().optional(),
  illustrationStatus: z.enum(['pending', 'generating', 'done', 'error']).nullable().optional(),
  audioId: z.string().uuid().nullable().optional(),
  audioUrl: z.string().url().nullable().optional(),
  audioStatus: z.enum(['pending', 'generating', 'done', 'error']).nullable().optional(),
  audioDuration: z.number().nullable().optional(),
})

export type BookPage = z.infer<typeof bookPageSchema>

// Illustration generation request
export const generateIllustrationRequestSchema = z.object({
  bookPageId: z.string().uuid(),
  qualityMode: z.enum(['fast', 'quality']).default('quality'),
  characterIds: z.array(z.string().uuid()).optional(),
})

export const generateBatchIllustrationRequestSchema = z.object({
  bookId: z.string().uuid(),
  pageIds: z.array(z.string().uuid()).min(1),
  qualityMode: z.enum(['fast', 'quality']).default('quality'),
})

export type GenerateIllustrationRequest = z.infer<typeof generateIllustrationRequestSchema>
export type GenerateBatchIllustrationRequest = z.infer<typeof generateBatchIllustrationRequestSchema>

// Audio generation request
export const generateAudioRequestSchema = z.object({
  bookPageId: z.string().uuid(),
  narratorVoice: z.string(),
  voiceMap: z.record(z.string(), z.string()).optional(),
})

export const generateBatchAudioRequestSchema = z.object({
  bookId: z.string().uuid(),
  pageIds: z.array(z.string().uuid()).min(1),
  narratorVoice: z.string(),
  voiceMap: z.record(z.string(), z.string()).optional(),
})

export type GenerateAudioRequest = z.infer<typeof generateAudioRequestSchema>
export type GenerateBatchAudioRequest = z.infer<typeof generateBatchAudioRequestSchema>

// Cover generation request
export const generateCoverRequestSchema = z.object({
  bookId: z.string().uuid(),
  prompt: z.string().min(10).max(2000).optional(),
  qualityMode: z.enum(['fast', 'quality']).default('quality'),
})

export type GenerateCoverRequest = z.infer<typeof generateCoverRequestSchema>

// Story generation request (new — text only, no media)
export const generateStoryRequestSchema = z.object({
  plot: z.string().min(10).max(2000),
  seriesId: z.string().uuid().optional(),
  pageCount: z.number().int().min(6).max(20).default(12),
  style: z.string().optional(),
  audience: z.string().optional(),
})

export type GenerateStoryRequest = z.infer<typeof generateStoryRequestSchema>
