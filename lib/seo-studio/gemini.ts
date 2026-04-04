const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
const TEXT_MODEL = 'gemini-2.5-flash'

async function callGemini(prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent?key=${GEMINI_API_KEY}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    }),
  })
  if (!response.ok) throw new Error(`Gemini API ${response.status}`)
  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

export async function analyzeKeywords(query: string, autocomplete: string[]): Promise<{
  suggestions: { keyword: string; volume: string; competition: string; relevance: number }[]
  questions: string[]
  longTail: string[]
}> {
  const prompt = `You are an SEO expert. Analyze the seed keyword: "${query}"

Given these Google autocomplete suggestions: ${JSON.stringify(autocomplete)}

Return a JSON object with:
1. "suggestions": array of 10-15 keyword objects, each with:
   - "keyword": the keyword phrase
   - "volume": "high", "medium", or "low" (estimate based on commercial intent and search patterns)
   - "competition": "easy", "medium", or "hard" (estimate based on how many tools/sites target this)
   - "relevance": 0-100 score of relevance to the seed keyword
2. "questions": array of 6-8 "People also ask" style questions related to this keyword
3. "longTail": array of 8-10 long-tail (3-5 word) keyword variations

Return ONLY valid JSON, no explanation.`

  const text = await callGemini(prompt)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in keyword analysis response')

  const { jsonrepair } = await import('jsonrepair')
  return JSON.parse(jsonrepair(jsonMatch[0]))
}

export async function generateBlogDraft(params: {
  keyword: string
  topic?: string | null
  toolSlug?: string | null
  toolName?: string | null
}): Promise<{
  title: string
  metaDescription: string
  body: string
  suggestedLinks: { label: string; href: string }[]
}> {
  const toolContext = params.toolSlug && params.toolName
    ? `This post should naturally reference the tool "${params.toolName}" at /tools/${params.toolSlug} as a solution.`
    : ''
  const topicContext = params.topic ? `Angle/topic: ${params.topic}.` : ''

  const prompt = `You are an expert SEO content writer. Write a blog post targeting the keyword: "${params.keyword}"

${topicContext}
${toolContext}

Return a JSON object with:
1. "title": SEO-optimized title (50-60 chars, includes the keyword naturally)
2. "metaDescription": meta description (150-160 chars, includes keyword, compelling CTA)
3. "body": the full blog post in Markdown format (800-1200 words). Requirements:
   - Include the keyword in the first paragraph
   - Use 3-5 H2 headings (## format)
   - Use 1-2 H3 subheadings where appropriate
   - Write naturally — no keyword stuffing
   - Include a brief FAQ section at the end with 3 questions
   - End with a clear call-to-action
4. "suggestedLinks": array of 2-3 objects with "label" and "href" for internal links to relevant tools (use /tools/{slug} format)

Return ONLY valid JSON, no explanation.`

  const text = await callGemini(prompt)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in blog draft response')

  const { jsonrepair } = await import('jsonrepair')
  return JSON.parse(jsonrepair(jsonMatch[0]))
}

export async function generateLandingPage(params: {
  toolName: string
  toolSlug: string
  keyword: string
  pageType: 'use-case' | 'free-tool'
}): Promise<{
  heroHeadline: string
  heroSubheadline: string
  benefits: { title: string; description: string }[]
  faq: { question: string; answer: string }[]
  ctaText: string
  title: string
  metaDescription: string
  structuredData: Record<string, unknown>
}> {
  const pageContext = params.pageType === 'use-case'
    ? `This is a use-case landing page showing how "${params.toolName}" solves a specific problem.`
    : `This is a free-tool landing page promoting "${params.toolName}" as a free online tool.`

  const prompt = `You are an expert SEO copywriter. Create landing page content targeting the keyword: "${params.keyword}"

Tool: "${params.toolName}" at /tools/${params.toolSlug}
${pageContext}

Return a JSON object with:
1. "title": SEO page title (50-60 chars, includes keyword)
2. "metaDescription": meta description (150-160 chars, includes keyword, compelling)
3. "heroHeadline": bold headline for the hero section (6-10 words, includes keyword)
4. "heroSubheadline": supporting subtitle (15-25 words)
5. "benefits": array of 4 objects, each with "title" (short) and "description" (2-3 sentences)
6. "faq": array of 5 objects, each with "question" and "answer" (target "People also ask" queries)
7. "ctaText": call-to-action button text (3-5 words, action-oriented)
8. "structuredData": a FAQPage JSON-LD schema object with the FAQ questions/answers

Return ONLY valid JSON, no explanation.`

  const text = await callGemini(prompt)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in landing page response')

  const { jsonrepair } = await import('jsonrepair')
  return JSON.parse(jsonrepair(jsonMatch[0]))
}

export type SocialContentType = 'announcement' | 'tips' | 'engagement'
export type SocialPlatform = 'twitter' | 'linkedin' | 'instagram' | 'facebook' | 'tiktok'

export interface SocialVariant {
  content: string
  hashtags: string[]
  charCount: number
}

export interface SocialPostSet {
  platform: SocialPlatform
  variants: SocialVariant[]
}

const PLATFORM_RULES: Record<SocialPlatform, { maxChars: number; hashtagCount: string; tone: string }> = {
  twitter: { maxChars: 280, hashtagCount: '2-3', tone: 'Punchy, casual, emojis OK. Short and impactful.' },
  linkedin: { maxChars: 500, hashtagCount: '3-5 at end', tone: 'Professional, can include a question to drive engagement.' },
  instagram: { maxChars: 2200, hashtagCount: '5-10 in separate block', tone: 'Storytelling, emoji-heavy, visually descriptive.' },
  facebook: { maxChars: 500, hashtagCount: '1-2', tone: 'Conversational, can ask questions, friendly.' },
  tiktok: { maxChars: 2200, hashtagCount: '3-5', tone: 'Hook-style opening, casual/Gen-Z, trending language.' },
}

const CONTENT_TYPE_INSTRUCTIONS: Record<SocialContentType, string> = {
  announcement: 'Write promotional posts announcing this tool. Focus on what it does and why people should try it. Include a call-to-action.',
  tips: 'Write educational posts sharing tips about how to use this tool effectively. Provide real value and practical advice.',
  engagement: 'Write engaging posts that spark discussion — polls, questions, hot takes, or surprising facts related to what this tool does.',
}

export async function generateSocialPosts(params: {
  toolName: string
  toolSlug: string
  toolDescription: string
  contentType: SocialContentType
  customAngle?: string
}): Promise<SocialPostSet[]> {
  const { toolName, toolSlug, toolDescription, contentType, customAngle } = params
  const angleNote = customAngle ? `\nCustom angle to emphasize: "${customAngle}"` : ''

  const platformSpecs = Object.entries(PLATFORM_RULES)
    .map(([p, r]) => `- ${p}: max ${r.maxChars} chars, ${r.hashtagCount} hashtags. Tone: ${r.tone}`)
    .join('\n')

  const prompt = `You are an expert social media marketer. Generate social media posts for the tool "${toolName}".

Tool description: ${toolDescription}
Tool URL: https://toolk1t.com/tools/${toolSlug}

Content type: ${CONTENT_TYPE_INSTRUCTIONS[contentType]}
${angleNote}

Generate posts for these 5 platforms, with 3 unique variants per platform:

${platformSpecs}

Return a JSON object with this exact structure:
{
  "posts": [
    {
      "platform": "twitter",
      "variants": [
        { "content": "post text here", "hashtags": ["#tag1", "#tag2"] },
        { "content": "another version", "hashtags": ["#tag1", "#tag3"] },
        { "content": "third version", "hashtags": ["#tag2", "#tag4"] }
      ]
    }
  ]
}

Rules:
- Each variant MUST be unique — different angle, different wording
- Hashtags as separate array, NOT in the content text
- Content must be within the platform's character limit
- Include the tool URL naturally where appropriate (not in every post)
- Write in English
- No placeholder text — write real, ready-to-post content

Return ONLY valid JSON, no explanation.`

  const text = await callGemini(prompt)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in social posts response')

  const { jsonrepair } = await import('jsonrepair')
  const parsed = JSON.parse(jsonrepair(jsonMatch[0]))

  const posts: SocialPostSet[] = (parsed.posts || []).map((p: { platform: SocialPlatform; variants: { content: string; hashtags: string[] }[] }) => ({
    platform: p.platform,
    variants: p.variants.map(v => ({
      content: v.content,
      hashtags: v.hashtags || [],
      charCount: v.content.length,
    })),
  }))

  return posts
}
