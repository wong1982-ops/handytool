'use client'

import { useResume } from './resume-provider'
import { BaseInfoEditor } from './editors/base-info-editor'
import { JobIntentionEditor } from './editors/job-intention-editor'
import { EducationEditor } from './editors/education-editor'
import { WorkExperienceEditor } from './editors/work-experience-editor'
import { ProjectEditor } from './editors/project-editor'
import { SkillsEditor } from './editors/skills-editor'
import { SelfEvaluationEditor } from './editors/self-evaluation-editor'
import { TrainingEditor } from './editors/training-editor'
import { AwardsEditor } from './editors/awards-editor'
import { InternshipEditor } from './editors/internship-editor'
import { CustomSectionEditor } from './editors/custom-section-editor'
import { ModuleManagementPanel } from './panels/module-management'
import { BeautifyPanel } from './panels/beautify-panel'
import { ToolboxPanel } from './panels/toolbox-panel'
import { ExportPanel } from './panels/export-panel'
import type { ModuleType } from './resume-types'

const MODULE_EDITORS: Record<ModuleType, React.ComponentType> = {
  baseInfo: BaseInfoEditor,
  jobIntention: JobIntentionEditor,
  education: EducationEditor,
  workExperience: WorkExperienceEditor,
  projects: ProjectEditor,
  skillsCertificates: SkillsEditor,
  selfEvaluation: SelfEvaluationEditor,
  training: TrainingEditor,
  awards: AwardsEditor,
  internships: InternshipEditor,
  custom: CustomSectionEditor,
}

export function ResumeEditor() {
  const { state, t } = useResume()
  const { sidebarMode, activeModule } = state

  // Non-edit modes render their panels
  if (sidebarMode === 'modules') return <ModuleManagementPanel />
  if (sidebarMode === 'beautify') return <BeautifyPanel />
  if (sidebarMode === 'toolbox') return <ToolboxPanel />
  if (sidebarMode === 'export') return <ExportPanel />

  // Edit mode: render active module editor
  if (!activeModule) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
        <p className="text-sm">Select a module to edit</p>
      </div>
    )
  }

  const EditorComponent = MODULE_EDITORS[activeModule]
  const moduleName = t.modules[activeModule as keyof typeof t.modules] ?? activeModule

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {moduleName}
        </h2>
        <EditorComponent />
      </div>
    </div>
  )
}
