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
      return <p key={i} className="mb-1 leading-relaxed">{text}</p>
    }
    if (node.type === 'bulletList') {
      return (
        <ul key={i} className="pl-4 mb-1 space-y-0.5">
          {node.content?.map((li, k) => (
            <li key={k} className="flex gap-1.5">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'currentColor', opacity: 0.4 }} />
              <span>{li.content?.map((p, m) => p.content?.map((c, n) => <span key={`${m}-${n}`}>{c.text}</span>))}</span>
            </li>
          ))}
        </ul>
      )
    }
    if (node.type === 'orderedList') {
      return (
        <ol key={i} className="list-decimal pl-4 mb-1 space-y-0.5">
          {node.content?.map((li, k) => (
            <li key={k}>{li.content?.map((p, m) => p.content?.map((c, n) => <span key={`${m}-${n}`}>{c.text}</span>))}</li>
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

// Modules that render in the left sidebar
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
    <div className="flex min-h-full" style={{ color: '#1a1a2e' }}>
      {/* ── Left sidebar ──────────────────────────────────── */}
      <div
        className="flex flex-col"
        style={{ width: '35%', backgroundColor: `${color}12`, flexShrink: 0 }}
      >
        <div className="px-5 pt-7 pb-5 flex flex-col items-center">
          {/* Photo */}
          {baseInfo.photo && (
            <div
              className="mb-4 overflow-hidden rounded-lg shadow-sm"
              style={{ width: 90, height: 110, flexShrink: 0 }}
            >
              <img
                src={baseInfo.photo}
                alt={baseInfo.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Name */}
          <h1
            className="text-[18px] font-bold text-center tracking-tight mb-1"
            style={{ color: '#1a1a2e' }}
          >
            {baseInfo.name}
          </h1>

          {/* Subtle accent line under name */}
          <div className="mt-1 mb-4 rounded-full" style={{ width: 28, height: 2, backgroundColor: color }} />

          {/* Contact info */}
          <div className="w-full space-y-2">
            {baseInfo.phone && (
              <div className="flex items-center gap-2 text-[10px]" style={{ color: '#4b5563' }}>
                <div
                  className="flex items-center justify-center rounded"
                  style={{ width: 20, height: 20, backgroundColor: `${color}18`, flexShrink: 0 }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <span className="truncate">{baseInfo.phone}</span>
              </div>
            )}
            {baseInfo.email && (
              <div className="flex items-center gap-2 text-[10px]" style={{ color: '#4b5563' }}>
                <div
                  className="flex items-center justify-center rounded"
                  style={{ width: 20, height: 20, backgroundColor: `${color}18`, flexShrink: 0 }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <span className="truncate">{baseInfo.email}</span>
              </div>
            )}
            {baseInfo.wechat && (
              <div className="flex items-center gap-2 text-[10px]" style={{ color: '#4b5563' }}>
                <div
                  className="flex items-center justify-center rounded"
                  style={{ width: 20, height: 20, backgroundColor: `${color}18`, flexShrink: 0 }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <span className="truncate">{baseInfo.wechat}</span>
              </div>
            )}
            {baseInfo.dateOfBirth && (
              <div className="flex items-center gap-2 text-[10px]" style={{ color: '#4b5563' }}>
                <div
                  className="flex items-center justify-center rounded"
                  style={{ width: 20, height: 20, backgroundColor: `${color}18`, flexShrink: 0 }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
                </div>
                <span>{baseInfo.dateOfBirth}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar divider */}
        <div className="mx-5" style={{ height: 1, backgroundColor: `${color}20` }} />

        {/* Left sections (skills, self-evaluation) */}
        <div className="px-5 py-4 space-y-4 flex-1">
          {leftModules.map((mod) => {
            const content = renderLeftSection(mod, resume, color)
            if (content === null) return null
            return (
              <div key={mod} style={{ breakInside: 'avoid' }}>
                <h2
                  className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2 pb-1.5"
                  style={{ color, borderBottom: `1px solid ${color}25` }}
                >
                  {t.modules[mod as keyof typeof t.modules] ?? mod}
                </h2>
                {content}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Right main column ─────────────────────────────── */}
      <div className="flex-1 min-w-0 px-6 py-7">
        <div className="space-y-5">
          {rightModules.map((mod) => {
            const content = renderRightSection(mod, resume, t, color)
            if (content === null) return null
            return (
              <div key={mod} style={{ breakInside: 'avoid' }}>
                <h2
                  className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2.5 pb-1.5"
                  style={{ color, borderBottom: `1px solid ${color}20` }}
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

function renderLeftSection(
  mod: string,
  resume: ResumeState,
  _color: string
): React.ReactNode | null {
  switch (mod) {
    case 'skillsCertificates':
      if (!resume.skillsCertificates) return null
      return (
        <div className="text-[10px] leading-relaxed" style={{ color: '#4b5563' }}>
          {renderRichText(resume.skillsCertificates)}
        </div>
      )
    case 'selfEvaluation':
      if (!resume.selfEvaluation) return null
      return (
        <div className="text-[10px] leading-relaxed" style={{ color: '#4b5563' }}>
          {renderRichText(resume.selfEvaluation)}
        </div>
      )
    default:
      return null
  }
}

/* ── Right-side section renderers ────────────────────────── */

function renderRightSection(
  mod: string,
  resume: ResumeState,
  t: any,
  color: string
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
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px]">
          {pairs.map(([label, value]) => (
            <div key={label} className="flex gap-1">
              <span style={{ color: '#9ca3af' }}>{label}:</span>
              <span className="font-medium" style={{ color: '#374151' }}>{value}</span>
            </div>
          ))}
        </div>
      )
    }

    case 'education': {
      if (!resume.education.length) return null
      return (
        <div className="space-y-2.5">
          {resume.education.map((entry, idx) => (
            <div key={entry.id} style={{ breakInside: 'avoid' }}>
              {idx > 0 && <div className="mb-2.5" style={{ height: 1, backgroundColor: '#f3f4f6' }} />}
              <div className="flex justify-between items-baseline gap-2">
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <span className="font-bold text-[11px]" style={{ color: '#1a1a2e' }}>{entry.school}</span>
                  {entry.major && (
                    <span className="text-[10px]" style={{ color: '#6b7280' }}>{entry.major}</span>
                  )}
                  {entry.degree && (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: `${color}10`, color }}
                    >
                      {entry.degree}
                    </span>
                  )}
                </div>
                <span className="text-[9px] whitespace-nowrap" style={{ color: '#9ca3af' }}>
                  {formatDates(entry.startDate, entry.endDate)}
                </span>
              </div>
              {entry.description && (
                <div className="text-[10px] mt-1 leading-relaxed" style={{ color: '#4b5563' }}>
                  {renderRichText(entry.description)}
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }

    case 'workExperience': {
      if (!resume.workExperience.length) return null
      return (
        <div className="space-y-2.5">
          {resume.workExperience.map((entry, idx) => (
            <div key={entry.id} style={{ breakInside: 'avoid' }}>
              {idx > 0 && <div className="mb-2.5" style={{ height: 1, backgroundColor: '#f3f4f6' }} />}
              <div className="flex justify-between items-baseline gap-2">
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <span className="font-bold text-[11px]" style={{ color: '#1a1a2e' }}>{entry.company}</span>
                  {entry.position && (
                    <span className="text-[10px] font-medium" style={{ color: '#374151' }}>
                      {entry.position}
                    </span>
                  )}
                  {entry.industry && (
                    <span className="text-[9px]" style={{ color: '#9ca3af' }}>
                      {entry.industry}
                    </span>
                  )}
                </div>
                <span className="text-[9px] whitespace-nowrap" style={{ color: '#9ca3af' }}>
                  {formatDates(entry.startDate, entry.endDate)}
                </span>
              </div>
              {entry.description && (
                <div className="text-[10px] mt-1 leading-relaxed" style={{ color: '#4b5563' }}>
                  {renderRichText(entry.description)}
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }

    case 'projects': {
      if (!resume.projects.length) return null
      return (
        <div className="space-y-2.5">
          {resume.projects.map((entry, idx) => (
            <div key={entry.id} style={{ breakInside: 'avoid' }}>
              {idx > 0 && <div className="mb-2.5" style={{ height: 1, backgroundColor: '#f3f4f6' }} />}
              <div className="flex justify-between items-baseline gap-2">
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <span className="font-bold text-[11px]" style={{ color: '#1a1a2e' }}>{entry.projectName}</span>
                  {entry.role && (
                    <span className="text-[10px]" style={{ color: '#6b7280' }}>{entry.role}</span>
                  )}
                </div>
                <span className="text-[9px] whitespace-nowrap" style={{ color: '#9ca3af' }}>
                  {formatDates(entry.startDate, entry.endDate)}
                </span>
              </div>
              {entry.description && (
                <div className="text-[10px] mt-1 leading-relaxed" style={{ color: '#4b5563' }}>
                  {renderRichText(entry.description)}
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }

    case 'training': {
      if (!resume.training.length) return null
      return (
        <div className="space-y-2.5">
          {resume.training.map((entry, idx) => (
            <div key={entry.id} style={{ breakInside: 'avoid' }}>
              {idx > 0 && <div className="mb-2.5" style={{ height: 1, backgroundColor: '#f3f4f6' }} />}
              <div className="flex justify-between items-baseline gap-2">
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <span className="font-bold text-[11px]" style={{ color: '#1a1a2e' }}>{entry.institution}</span>
                  {entry.course && (
                    <span className="text-[10px]" style={{ color: '#6b7280' }}>{entry.course}</span>
                  )}
                </div>
                <span className="text-[9px] whitespace-nowrap" style={{ color: '#9ca3af' }}>
                  {formatDates(entry.startDate, entry.endDate)}
                </span>
              </div>
              {entry.description && (
                <div className="text-[10px] mt-1 leading-relaxed" style={{ color: '#4b5563' }}>
                  {renderRichText(entry.description)}
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }

    case 'awards': {
      if (!resume.awards.length) return null
      return (
        <div className="space-y-2.5">
          {resume.awards.map((entry, idx) => (
            <div key={entry.id} style={{ breakInside: 'avoid' }}>
              {idx > 0 && <div className="mb-2.5" style={{ height: 1, backgroundColor: '#f3f4f6' }} />}
              <div className="flex justify-between items-baseline gap-2">
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <span className="font-bold text-[11px]" style={{ color: '#1a1a2e' }}>{entry.name}</span>
                  {entry.issuer && (
                    <span className="text-[10px]" style={{ color: '#6b7280' }}>{entry.issuer}</span>
                  )}
                </div>
                {entry.date && (
                  <span className="text-[9px] whitespace-nowrap" style={{ color: '#9ca3af' }}>{entry.date}</span>
                )}
              </div>
              {entry.description && (
                <div className="text-[10px] mt-1 leading-relaxed" style={{ color: '#4b5563' }}>
                  {renderRichText(entry.description)}
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }

    case 'internships': {
      if (!resume.internships.length) return null
      return (
        <div className="space-y-2.5">
          {resume.internships.map((entry, idx) => (
            <div key={entry.id} style={{ breakInside: 'avoid' }}>
              {idx > 0 && <div className="mb-2.5" style={{ height: 1, backgroundColor: '#f3f4f6' }} />}
              <div className="flex justify-between items-baseline gap-2">
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <span className="font-bold text-[11px]" style={{ color: '#1a1a2e' }}>{entry.company}</span>
                  {entry.position && (
                    <span className="text-[10px] font-medium" style={{ color: '#374151' }}>
                      {entry.position}
                    </span>
                  )}
                </div>
                <span className="text-[9px] whitespace-nowrap" style={{ color: '#9ca3af' }}>
                  {formatDates(entry.startDate, entry.endDate)}
                </span>
              </div>
              {entry.description && (
                <div className="text-[10px] mt-1 leading-relaxed" style={{ color: '#4b5563' }}>
                  {renderRichText(entry.description)}
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }

    case 'custom': {
      if (!resume.customSections.length) return null
      return (
        <div className="space-y-2.5">
          {resume.customSections.map((section) => (
            <div key={section.id} style={{ breakInside: 'avoid' }}>
              <h3 className="font-bold text-[11px] mb-1" style={{ color: '#1a1a2e' }}>{section.title}</h3>
              {section.type === 'richtext' && section.richTextContent && (
                <div className="text-[10px] leading-relaxed" style={{ color: '#4b5563' }}>
                  {renderRichText(section.richTextContent)}
                </div>
              )}
              {section.type === 'structured' && section.structuredFields.length > 0 && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                  {section.structuredFields.map((f, idx) => (
                    <div key={idx} className="flex gap-1">
                      <span style={{ color: '#9ca3af' }}>{f.label}:</span>
                      <span style={{ color: '#374151' }}>{f.value}</span>
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
