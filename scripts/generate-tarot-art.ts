#!/usr/bin/env tsx
/**
 * Tarot Card Art Generation Script
 * Generates all 78 tarot card images using Gemini Imagen.
 *
 * Usage: GEMINI_API_KEY=xxx npx tsx scripts/generate-tarot-art.ts
 */

import fs from 'fs'
import path from 'path'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY environment variable is required.')
  process.exit(1)
}

const MODEL = 'gemini-3.1-flash-image-preview'
const ART_STYLE =
  'art nouveau illustration with rich jewel tones, gold leaf accents, intricate borders, mystical atmosphere'
const RATE_LIMIT_MS = 2000
const OUTPUT_BASE = path.resolve(process.cwd(), 'public/tarot')

// ---------------------------------------------------------------------------
// Card definitions
// ---------------------------------------------------------------------------

interface CardDef {
  name: string
  prompt: string
  outputPath: string
}

const MAJOR_ARCANA: Array<{ num: number; name: string; slug: string }> = [
  { num: 0, name: 'The Fool', slug: 'the-fool' },
  { num: 1, name: 'The Magician', slug: 'the-magician' },
  { num: 2, name: 'The High Priestess', slug: 'the-high-priestess' },
  { num: 3, name: 'The Empress', slug: 'the-empress' },
  { num: 4, name: 'The Emperor', slug: 'the-emperor' },
  { num: 5, name: 'The Hierophant', slug: 'the-hierophant' },
  { num: 6, name: 'The Lovers', slug: 'the-lovers' },
  { num: 7, name: 'The Chariot', slug: 'the-chariot' },
  { num: 8, name: 'Strength', slug: 'strength' },
  { num: 9, name: 'The Hermit', slug: 'the-hermit' },
  { num: 10, name: 'Wheel of Fortune', slug: 'wheel-of-fortune' },
  { num: 11, name: 'Justice', slug: 'justice' },
  { num: 12, name: 'The Hanged Man', slug: 'the-hanged-man' },
  { num: 13, name: 'Death', slug: 'death' },
  { num: 14, name: 'Temperance', slug: 'temperance' },
  { num: 15, name: 'The Devil', slug: 'the-devil' },
  { num: 16, name: 'The Tower', slug: 'the-tower' },
  { num: 17, name: 'The Star', slug: 'the-star' },
  { num: 18, name: 'The Moon', slug: 'the-moon' },
  { num: 19, name: 'The Sun', slug: 'the-sun' },
  { num: 20, name: 'Judgement', slug: 'judgement' },
  { num: 21, name: 'The World', slug: 'the-world' },
]

const SUITS = ['wands', 'cups', 'swords', 'pentacles'] as const
const RANKS = [
  'ace',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'page',
  'knight',
  'queen',
  'king',
] as const

function buildCardList(): CardDef[] {
  const cards: CardDef[] = []

  // Major Arcana
  for (const { num, name, slug } of MAJOR_ARCANA) {
    const nn = String(num).padStart(2, '0')
    cards.push({
      name,
      prompt: `Tarot card "${name}" (Major Arcana), ${ART_STYLE}`,
      outputPath: path.join(OUTPUT_BASE, 'major', `${nn}-${slug}.webp`),
    })
  }

  // Minor Arcana
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      const displayRank = rank.charAt(0).toUpperCase() + rank.slice(1)
      const displaySuit = suit.charAt(0).toUpperCase() + suit.slice(1)
      cards.push({
        name: `${displayRank} of ${displaySuit}`,
        prompt: `Tarot card "${displayRank} of ${displaySuit}" (Minor Arcana), ${ART_STYLE}`,
        outputPath: path.join(OUTPUT_BASE, suit, `${rank}.webp`),
      })
    }
  }

  return cards
}

// ---------------------------------------------------------------------------
// Gemini API call
// ---------------------------------------------------------------------------

async function generateImage(prompt: string): Promise<Buffer> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API error ${response.status}: ${errorText}`)
  }

  const data = await response.json()

  // Extract image data — handle both camelCase and snake_case field names
  const candidates = data.candidates ?? []
  for (const candidate of candidates) {
    const parts = candidate.content?.parts ?? []
    for (const part of parts) {
      const inlineData = part.inlineData ?? part.inline_data
      if (inlineData?.data) {
        return Buffer.from(inlineData.data, 'base64')
      }
    }
  }

  throw new Error('No image data found in Gemini response')
}

// ---------------------------------------------------------------------------
// Sleep helper
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const cards = buildCardList()
  console.log(`Tarot art generation — ${cards.length} cards total\n`)

  let generated = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i]
    const { name, prompt, outputPath } = card

    // Skip existing images
    if (fs.existsSync(outputPath)) {
      console.log(`[${i + 1}/${cards.length}] SKIP  ${name}`)
      skipped++
      continue
    }

    // Ensure output directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })

    console.log(`[${i + 1}/${cards.length}] GEN   ${name} ...`)

    try {
      const imageBuffer = await generateImage(prompt)
      fs.writeFileSync(outputPath, imageBuffer)
      console.log(`              → saved to ${path.relative(process.cwd(), outputPath)}`)
      generated++
    } catch (err) {
      console.error(`              → FAILED: ${(err as Error).message}`)
      failed++
    }

    // Rate limit between requests (skip delay after last card)
    if (i < cards.length - 1) {
      await sleep(RATE_LIMIT_MS)
    }
  }

  console.log('\n--- Summary ---')
  console.log(`Generated : ${generated}`)
  console.log(`Skipped   : ${skipped}`)
  console.log(`Failed    : ${failed}`)
  console.log(`Total     : ${cards.length}`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
