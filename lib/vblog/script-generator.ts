// lib/vblog/script-generator.ts
import type { ScriptData, ScriptStyle } from '@/tools/vblog/types'

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()

const FEATURE_WALKTHROUGH_PROMPT = `You are a video script writer for software tool demos. Write a script for a marketing video about the tool described below.

Structure:
1. Hook (2-3s): A compelling question or statement
2. Intro (5-8s): Brief personal introduction, "talking-head" visual
3. Features (3-5 demo sections, 10-20s each): Each shows a specific feature with step-by-step browser actions
4. Outro (5s): Call to action, "talking-head" visual

For each demo section, provide an "actions" array with Playwright-compatible commands:
- "goto /tools/tool-name" — navigate to URL
- "click selector" — click an element
- "type selector 'text'" — type into an input
- "wait 2000" — pause in milliseconds
- "scroll down 300" — scroll the page

Return ONLY valid JSON matching this schema (no markdown, no explanation):
{
  "title": "string",
  "hook": "string",
  "sections": [{ "type": "intro|demo|feature|outro", "text": "string", "duration": number, "visualNote": "talking-head|screen-recording", "actions": ["string"] }],
  "hashtags": ["string"],
  "description": "string"
}`

const PROBLEM_SOLUTION_PROMPT = `You are a storytelling video script writer. Write a narrative-style marketing video script about the tool described below.

Structure:
1. Problem (5-8s): "Have you ever struggled with...?" — talking-head
2. Solution intro (3-5s): "Meet [Tool Name]..." — talking-head
3. Demo (3-4 sections, 10-20s each): Show the tool solving the problem step-by-step with browser actions
4. Result (5-8s): Show the impressive output — screen recording
5. CTA (3-5s): "Try it free at..." — talking-head

For each demo section, provide Playwright-compatible "actions" array (same format as above).

Return ONLY valid JSON (no markdown, no explanation):
{
  "title": "string",
  "hook": "string",
  "sections": [{ "type": "intro|demo|feature|outro", "text": "string", "duration": number, "visualNote": "talking-head|screen-recording", "actions": ["string"] }],
  "hashtags": ["string"],
  "description": "string"
}`

export async function generateScript(
  toolName: string,
  toolSlug: string,
  toolDescription: string,
  style: ScriptStyle,
  targetDuration: number,
): Promise<ScriptData> {
  const systemPrompt = style === 'feature-walkthrough' ? FEATURE_WALKTHROUGH_PROMPT : PROBLEM_SOLUTION_PROMPT

  const userPrompt = `Tool: ${toolName}
URL: https://toolk1t.com/tools/${toolSlug}
Description: ${toolDescription}
Target duration: ${targetDuration} seconds

Generate the video script now.`

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Gemini script generation failed: ${response.status}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in script response')

  const script: ScriptData = JSON.parse(jsonMatch[0])

  // Validate required fields
  if (!script.title || !script.sections?.length) {
    throw new Error('Invalid script structure')
  }

  return script
}
