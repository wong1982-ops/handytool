// tools/component-lab/prompts.ts

import type { ComponentSettings, Framework } from './types'

function settingsToPrompt(settings: ComponentSettings): string {
  const parts: string[] = []
  if (settings.theme === 'both') parts.push('Include both light and dark mode variants.')
  else parts.push(`Use a ${settings.theme} theme.`)
  if (settings.responsive) parts.push('Make it fully responsive with mobile breakpoints.')
  if (settings.animations === 'subtle') parts.push('Add subtle hover/transition animations.')
  else if (settings.animations === 'rich') parts.push('Add rich animations (enter, hover, click feedback, transitions).')
  if (settings.accessibility === 'wcag-aa') parts.push('Ensure WCAG AA: proper aria labels, focus states, 4.5:1 contrast ratio, keyboard navigation.')
  if (settings.cssFramework === 'tailwind') parts.push('Use Tailwind CSS utility classes for styling.')
  else if (settings.cssFramework === 'vanilla') parts.push('Use vanilla CSS with a <style> block.')
  else parts.push('Use inline styles only, no external CSS framework.')
  return parts.join(' ')
}

export function buildGeneratePrompt(description: string, settings: ComponentSettings): string {
  const settingsText = settingsToPrompt(settings)

  return `You are an expert frontend developer. Generate a UI component based on this description:

"${description}"

Requirements:
${settingsText}

Generate the component in ALL 4 frameworks. Each must be a complete, self-contained, production-ready component that looks visually identical across frameworks.

Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "react": "// Complete React component with JSX. Export default function. Include all imports. If Tailwind, use className.",
  "vue": "<!-- Complete Vue 3 SFC with <template>, <script setup>, and <style scoped> sections -->",
  "svelte": "<!-- Complete Svelte component with <script>, HTML, and <style> sections -->",
  "html": "<!-- Complete standalone HTML with inline <style> and <script> if needed. No framework dependencies. -->"
}

Rules:
- Each framework output must be COMPLETE and SELF-CONTAINED (no external imports except the framework itself)
- React: use functional component with hooks, export default
- Vue: use Composition API with <script setup>
- Svelte: standard Svelte component syntax
- HTML: pure HTML + CSS + vanilla JS, no framework
- All outputs must look visually identical when rendered
- Use modern, clean code. No comments unless complex logic.`
}

export function buildRefinePrompt(
  originalPrompt: string,
  currentCode: string,
  framework: Framework,
  instruction: string,
  settings: ComponentSettings,
): string {
  const settingsText = settingsToPrompt(settings)

  return `You are an expert frontend developer iterating on a UI component.

Original request: "${originalPrompt}"
Settings: ${settingsText}

Current ${framework} code:
\`\`\`
${currentCode}
\`\`\`

User wants this change: "${instruction}"

Apply the requested change and regenerate ALL 4 framework versions. Keep the same visual design, just apply the refinement.

Return ONLY valid JSON (no markdown):
{
  "react": "...",
  "vue": "...",
  "svelte": "...",
  "html": "...",
  "summary": "Brief description of what changed"
}`
}
