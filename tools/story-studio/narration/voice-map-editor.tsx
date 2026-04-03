'use client'

import { GEMINI_VOICES } from '@/lib/story/voices'
import type { CharacterItem } from '@/tools/story-studio/use-characters'

interface VoiceMapEditorProps {
  characters: CharacterItem[]
  voiceMap: Record<string, string>
  onChange: (voiceMap: Record<string, string>) => void
}

export function VoiceMapEditor({ characters, voiceMap, onChange }: VoiceMapEditorProps) {
  if (characters.length === 0) return null

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Character Voices</label>
      <div className="space-y-2">
        {characters.map(char => {
          const currentVoice = voiceMap[char.name] || char.voice || ''
          return (
            <div key={char.id} className="flex items-center gap-3">
              <div className="flex items-center gap-2 min-w-[120px]">
                {char.referenceImageUrl ? (
                  <img src={char.referenceImageUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700" />
                )}
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                  {char.name}
                </span>
              </div>
              <select
                value={currentVoice}
                onChange={e => onChange({ ...voiceMap, [char.name]: e.target.value })}
                className="flex-1 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600
                  bg-white dark:bg-slate-800 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]"
              >
                <option value="">Select voice...</option>
                {GEMINI_VOICES.map(v => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.gender} · {v.age} · {v.style})
                  </option>
                ))}
              </select>
            </div>
          )
        })}
      </div>
    </div>
  )
}
