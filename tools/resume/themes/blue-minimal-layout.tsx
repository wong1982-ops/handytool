'use client'

import type { ResumeState } from '../resume-types'
import type { JSONContent } from '@tiptap/core'

interface ThemeLayoutProps {
  resume: ResumeState
  t: any
}

function renderRichText(content: JSONContent | null): React.ReactNode {
  if (!content || !content.content) return null
  return content.content.map((node, i) => {
    if (node.type === 'paragraph') {
      const text = node.content?.map((c, j) => {
        let el: React.ReactNode = c.text || ''
        if (c.marks) {
          for (const mark of c.marks) {
            if (mark.type === 'bold') el = <strong key={j}>{el}</strong>
            if (mark.type === 'italic') el = <em key={j}>{el}</em>
            if (mark.type === 'underline') el = <u key={j}>{el}</u>
            if (mark.type === 'strike') el = <s key={j}>{el}</s>
          }
        }
        return <span key={j}>{el}</span>
      })
      return <p key={i} className="mb-1">{text}</p>
    }
    if (node.type === 'bulletList') {
      return (
        <ul key={i} className="list-disc pl-4 mb-1">
          {node.content?.map((li, k) => (
            <li key={k}>
              {li.content?.map((p, m) =>
                p.content?.map((c, n) => <span key={`${m}-${n}`}>{c.text}</span>)
              )}
            </li>
          ))}
        </ul>
      )
    }
    if (node.type === 'orderedList') {
      return (
        <ol key={i} className="list-decimal pl-4 mb-1">
          {node.content?.map((li, k) => (
            <li key={k}>
              {li.content?.map((p, m) =>
                p.content?.map((c, n) => <span key={`${m}-${n}`}>{c.text}</span>)
              )}
            </li>
          ))}
        </ol>
      )
    }
    return null
  })
}

function formatDates(start: string, end: string): string {
  if (!start && !end) return ''
  return `${start || '?'} — ${end || 'Present'}`
}

// Modules that go in the left sidebar
const LEFT_MODULES = new Set(['skillsCertificates', 'selfEvaluation'])

export function BlueMinimalLayout({ resume, t }: ThemeLayoutProps) {
  const { baseInfo, theme } = resume
  const color = theme.primaryColor

  const leftModules = resume.enabledModules.filter(
    (m) => m !== 'baseInfo' && LEFT_MODULES.has(m)
  )
  const rightModules = resume.enabledModules.filter(
    (m) => m !== 'baseInfo' && !LEFT_MODULES.has(m)
  )

  return (
    <div className="flex min-h-full">
      {/* ── Left sidebar ──────────────────────────────────── */}
      <div
        className="w-[30%] p-5 flex flex-col items-center"
        style={{ backgroundColor: `${color}1A` }}
      >
        {/* Photo */}
        {baseInfo.photo && (
          <img
            src={baseInfo.photo}
            alt={baseInfo.name}
            className="w-20 h-20 rounded-full object-cover mb-3"
          />
        )}

        {/* Name */}
        <h1 className="text-base font-bold text-gray-900 text-center mb-3">{baseInfo.name}</h1>

        {/* Contact info */}
        <div className="w-full text-xs text-gray-600 space-y-1 mb-5">
          {baseInfo.phone && <div className="truncate">{baseInfo.phone}</div>}
          {baseInfo.email && <div className="truncate">{baseInfo.email}</div>}
          {baseInfo.wechat && <div className="truncate">{baseInfo.wechat}</div>}
          {baseInfo.dateOfBirth && <div>{baseInfo.dateOfBirth}</div>}
        </div>

        {/* Left sections */}
        {leftModules.map((mod) => {
          const content = renderLeftSection(mod, resume)
          if (content === null) return null
          return (
            <div key={mod} className="w-full mb-4">
              <h2
                className="text-[10px] font-bold uppercase tracking-widest mb-2"
                style={{ color }}
              >
                {t.modules[mod as keyof typeof t.modules] ?? mod}
              </h2>
              {content}
            </div>
          )
        })}
      </div>

      {/* ── Right column ──────────────────────────────────── */}
      <div className="w-[70%] p-6">
        <div className="space-y-5">
          {rightModules.map((mod) => {
            const content = renderRightSection(mod, resume, t)
            if (content === null) return null
            return (
              <div key={mod}>
                <h2
                  className="text-[10px] font-bold uppercase tracking-widest mb-2"
                  style={{ color }}
                >
                  {t.modules[mod as keyof typeof t.modules] ?? mod}
                </h2>
                {content}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── Left-side section renderers ─────────────────────────── */

function renderLeftSection(mod: string, resume: ResumeState): React.ReactNode | null {
  switch (mod) {
    case 'skillsCertificates':
      if (!resume.skillsCertificates) return null
      return <div className="text-xs text-gray-700">{renderRichText(resume.skillsCertificates)}</div>
    case 'selfEvaluation':
      if (!resume.selfEvaluation) return null
      return <div className="text-xs text-gray-700">{renderRichText(resume.selfEvaluation)}</div>
    default:
      return null
  }
}

/* ── Right-side section renderers ────────────────────────── */

function renderRightSection(
  mod: string,
  resume: ResumeState,
  t: any
): React.ReactNode | null {
  switch (mod) {
    case 'jobIntention': {
      const ji = resume.jobIntention
      if (!ji.position && !ji.jobType && !ji.expectedSalary && !ji.targetCity) return null
      const pairs = [
        ji.position && [t.fields?.position ?? 'Position', ji.position],
        ji.jobType && [t.fields?.jobType ?? 'Job Type', ji.jobType],
        ji.expectedSalary && [t.fields?.expectedSalary ?? 'Expected Salary', ji.expectedSalary],
        ji.targetCity && [t.fields?.targetCity ?? 'Target City', ji.targetCity],
      ].filter(Boolean) as [string, string][]
      return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-700">
          {pairs.map(([label, value]) => (
            <div key={label}>
              <span className="font-semibold">{label}: </span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      )
    }

    case 'education': {
      if (!resume.education.length) return null
      return (
        <div className="space-y-3">
          {resume.education.map((entry) => (
            <div key={entry.id}>
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="font-semibold text-xs text-gray-900">{entry.school}</span>
                  {entry.major && <span className="text-xs text-gray-600 ml-2">{entry.major}</span>}
                  {entry.degree && <span className="text-xs text-gray-500 ml-1">({entry.degree})</span>}
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                  {formatDates(entry.startDate, entry.endDate)}
                </span>
              </div>
              {entry.description && (
                <div className="text-xs text-gray-600 mt-1">{renderRichText(entry.description)}</div>
              )}
            </div>
          ))}
        </div>
      )
    }

    case 'workExperience': {
      if (!resume.workExperience.length) return null
      return (
        <div className="space-y-3">
          {resume.workExperience.map((entry) => (
            <div key={entry.id}>
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="font-semibold text-xs text-gray-900">{entry.company}</span>
                  {entry.position && <span className="text-xs text-gray-600 ml-2">{entry.position}</span>}
                  {entry.industry && <span className="text-xs text-gray-500 ml-1">({entry.industry})</span>}
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                  {formatDates(entry.startDate, entry.endDate)}
                </span>
              </div>
              {entry.description && (
                <div className="text-xs text-gray-600 mt-1">{renderRichText(entry.description)}</div>
              )}
            </div>
          ))}
        </div>
      )
    }

    case 'projects': {
      if (!resume.projects.length) return null
      return (
        <div className="space-y-3">
          {resume.projects.map((entry) => (
            <div key={entry.id}>
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="font-semibold text-xs text-gray-900">{entry.projectName}</span>
                  {entry.role && <span className="text-xs text-gray-600 ml-2">{entry.role}</span>}
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                  {formatDates(entry.startDate, entry.endDate)}
                </span>
              </div>
              {entry.description && (
                <div className="text-xs text-gray-600 mt-1">{renderRichText(entry.description)}</div>
              )}
            </div>
          ))}
        </div>
      )
    }

    case 'training': {
      if (!resume.training.length) return null
      return (
        <div className="space-y-3">
          {resume.training.map((entry) => (
            <div key={entry.id}>
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="font-semibold text-xs text-gray-900">{entry.institution}</span>
                  {entry.course && <span className="text-xs text-gray-600 ml-2">{entry.course}</span>}
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                  {formatDates(entry.startDate, entry.endDate)}
                </span>
              </div>
              {entry.description && (
                <div className="text-xs text-gray-600 mt-1">{renderRichText(entry.description)}</div>
              )}
            </div>
          ))}
        </div>
      )
    }

    case 'awards': {
      if (!resume.awards.length) return null
      return (
        <div className="space-y-3">
          {resume.awards.map((entry) => (
            <div key={entry.id}>
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="font-semibold text-xs text-gray-900">{entry.name}</span>
                  {entry.issuer && <span className="text-xs text-gray-600 ml-2">{entry.issuer}</span>}
                </div>
                {entry.date && (
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{entry.date}</span>
                )}
              </div>
              {entry.description && (
                <div className="text-xs text-gray-600 mt-1">{renderRichText(entry.description)}</div>
              )}
            </div>
          ))}
        </div>
      )
    }

    case 'internships': {
      if (!resume.internships.length) return null
      return (
        <div className="space-y-3">
          {resume.internships.map((entry) => (
            <div key={entry.id}>
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="font-semibold text-xs text-gray-900">{entry.company}</span>
                  {entry.position && <span className="text-xs text-gray-600 ml-2">{entry.position}</span>}
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                  {formatDates(entry.startDate, entry.endDate)}
                </span>
              </div>
              {entry.description && (
                <div className="text-xs text-gray-600 mt-1">{renderRichText(entry.description)}</div>
              )}
            </div>
          ))}
        </div>
      )
    }

    case 'custom': {
      if (!resume.customSections.length) return null
      return (
        <div className="space-y-3">
          {resume.customSections.map((section) => (
            <div key={section.id}>
              <h3 className="font-semibold text-xs text-gray-900 mb-1">{section.title}</h3>
              {section.type === 'richtext' && section.richTextContent && (
                <div className="text-xs text-gray-700">{renderRichText(section.richTextContent)}</div>
              )}
              {section.type === 'structured' && section.structuredFields.length > 0 && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-700">
                  {section.structuredFields.map((f, idx) => (
                    <div key={idx}>
                      <span className="font-semibold">{f.label}: </span>
                      <span>{f.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }

    default:
      return null
  }
}
