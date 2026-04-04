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
}> {
  const typeLabel = params.pageType === 'use-case' ? 'use-case landing page' : 'free tool landing page'

  const prompt = `You are an expert SEO copywriter specializing in SaaS landing pages.

Generate content for a ${typeLabel} targeting the keyword: "${params.keyword}"
The page promotes the tool "${params.toolName}" at /tools/${params.toolSlug}.

Return a JSON object with:
1. "title": SEO-optimized page title (50-60 chars, includes keyword naturally)
2. "metaDescription": meta description (150-160 chars, keyword included, compelling)
3. "heroHeadline": a powerful headline for the hero section (8-12 words, includes keyword)
4. "heroSubheadline": supporting subheadline (15-25 words, reinforces value prop)
5. "benefits": array of exactly 4 objects, each with "title" (3-5 words) and "description" (1-2 sentences). Focus on user outcomes.
6. "faq": array of exactly 4 objects, each with "question" and "answer". Target "People Also Ask" style queries about "${params.keyword}". Answers should be 2-3 sentences.
7. "ctaText": call-to-action button text (2-5 words, action-oriented)

Requirements:
- Write naturally, avoid keyword stuffing
- Focus on benefits and user outcomes, not features
- FAQ answers should be concise and direct
- Use power words and emotional triggers in headlines

Return ONLY valid JSON, no explanation.`

  const text = await callGemini(prompt)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in landing page response')

  const { jsonrepair } = await import('jsonrepair')
  return JSON.parse(jsonrepair(jsonMatch[0]))
}
