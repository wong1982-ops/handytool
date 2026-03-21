import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'

export interface GeneratedPost {
  slug: string
  title: string
  description: string
  content: {
    markdown: string
    toc: { id: string; title: string; level: number }[]
    faq: { question: string; answer: string }[]
  }
  post_type: 'tool-announcement' | 'how-to-guide'
  category: string
  tags: string[]
  keywords: string[]
  reading_time_min: number
  tool_slug: string | null
  author: string
}

export interface GenerateInput {
  type: 'tool-announcement' | 'how-to-guide'
  toolName?: string
  toolSlug?: string
  toolDescription?: string
  toolHref?: string
  customTopic?: string
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const SYSTEM_PROMPTS: Record<GenerateInput['type'], string> = {
  'tool-announcement':
    'You are an SEO content writer for Toolk1t (https://toolk1t.com), a free online tools website. Write a blog post announcing a new tool. Structure: engaging intro paragraph → What is [Tool Name]? → Key Features (3-5 with ### subheadings) → How to Use It (step-by-step) → Real-World Use Cases (3 examples) → Why It\'s Free → Conclusion with CTA. Use markdown ## and ### headings. Include a link to the tool page. Write 800-1200 words. Make it SEO-friendly targeting long-tail keywords.',
  'how-to-guide':
    'You are an SEO content writer for Toolk1t. Write a comprehensive how-to guide. Structure: intro explaining the problem → What You\'ll Need → Step-by-Step Guide (### numbered steps) → Pro Tips → Common Mistakes to Avoid → Frequently Asked Questions → Conclusion with CTA. Use markdown ## and ### headings. Write 1000-1500 words.',
}


function buildUserMessage(input: GenerateInput): string {
  if (input.type === 'tool-announcement') {
    const parts = [`Write a blog post announcing the "${input.toolName}" tool.`]
    if (input.toolDescription) parts.push(`Tool description: ${input.toolDescription}`)
    if (input.toolHref) parts.push(`Tool URL: https://toolk1t.com${input.toolHref}`)
    return parts.join('\n')
  }

  // how-to-guide
  const parts: string[] = []
  if (input.customTopic) {
    parts.push(`Write a how-to guide about: ${input.customTopic}`)
  } else if (input.toolName) {
    parts.push(`Write a how-to guide for using the "${input.toolName}" tool.`)
    if (input.toolDescription) parts.push(`Tool description: ${input.toolDescription}`)
    if (input.toolHref) parts.push(`Tool URL: https://toolk1t.com${input.toolHref}`)
  }
  return parts.join('\n')
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

function generateToc(markdown: string): { id: string; title: string; level: number }[] {
  const toc: { id: string; title: string; level: number }[] = []
  const lines = markdown.split('\n')

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const title = match[2].trim()
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
      toc.push({ id, title, level })
    }
  }

  return toc
}

function calculateReadingTime(markdown: string): number {
  const wordCount = markdown.split(/\s+/).length
  return Math.max(2, Math.ceil(wordCount / 200))
}

export async function generateBlogPost(input: GenerateInput): Promise<GeneratedPost> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-preview-04-17',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: 'SEO-optimized blog post title' },
          description: { type: SchemaType.STRING, description: 'Meta description, max 160 characters' },
          markdown: { type: SchemaType.STRING, description: 'Full blog post in markdown with ## and ### headings' },
          faq: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                question: { type: SchemaType.STRING },
                answer: { type: SchemaType.STRING },
              },
              required: ['question', 'answer'] as string[],
            },
            description: '3-5 FAQ items related to the post',
          },
          keywords: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: '5-10 SEO keywords/phrases',
          },
          tags: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: '3-6 content tags',
          },
        },
        required: ['title', 'description', 'markdown', 'faq', 'keywords', 'tags'] as string[],
      },
    },
  })

  const result = await model.generateContent({
    systemInstruction: SYSTEM_PROMPTS[input.type],
    contents: [{ role: 'user', parts: [{ text: buildUserMessage(input) }] }],
  })

  const text = result.response.text()
  const parsed = JSON.parse(text) as {
    title: string
    description: string
    markdown: string
    faq: { question: string; answer: string }[]
    keywords: string[]
    tags: string[]
  }

  return {
    slug: slugify(parsed.title),
    title: parsed.title,
    description: parsed.description.slice(0, 160),
    content: {
      markdown: parsed.markdown,
      toc: generateToc(parsed.markdown),
      faq: parsed.faq,
    },
    post_type: input.type,
    category: input.type === 'tool-announcement' ? 'tool-announcement' : 'how-to-guide',
    tags: parsed.tags,
    keywords: parsed.keywords,
    reading_time_min: calculateReadingTime(parsed.markdown),
    tool_slug: input.toolSlug ?? null,
    author: 'Toolk1t Team',
  }
}
