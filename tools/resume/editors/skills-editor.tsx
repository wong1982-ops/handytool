'use client'

import { useResume } from '../resume-provider'
import { RichTextField } from '../shared/rich-text-field'
import type { JSONContent } from '@tiptap/core'

export function SkillsEditor() {
  const { state, dispatch, t } = useResume()

  return (
    <div className="space-y-4">
      <RichTextField
        content={state.resume.skillsCertificates}
        placeholder={t.skillsCertificates.placeholder}
        module="skillsCertificates"
        onUpdate={(content: JSONContent | null) =>
          dispatch({ type: 'SET_SKILLS_CERTIFICATES', payload: content })
        }
      />
    </div>
  )
}
