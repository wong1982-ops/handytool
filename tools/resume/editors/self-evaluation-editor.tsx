'use client'

import { useResume } from '../resume-provider'
import { RichTextField } from '../shared/rich-text-field'
import type { JSONContent } from '@tiptap/core'

export function SelfEvaluationEditor() {
  const { state, dispatch, t } = useResume()

  return (
    <div className="space-y-4">
      <RichTextField
        content={state.resume.selfEvaluation}
        placeholder={t.selfEvaluation.placeholder}
        module="selfEvaluation"
        onUpdate={(content: JSONContent | null) =>
          dispatch({ type: 'SET_SELF_EVALUATION', payload: content })
        }
      />
    </div>
  )
}
