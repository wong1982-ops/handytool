'use client'

import { useState } from 'react'
import { useResume } from '../resume-provider'
import { FormField } from '../shared/form-field'

export function JobIntentionEditor() {
  const { state, dispatch, t } = useResume()
  const [expanded, setExpanded] = useState(false)
  const jobIntention = state.resume.jobIntention

  const updateField = (field: string, value: string) => {
    dispatch({ type: 'SET_JOB_INTENTION', payload: { [field]: value } })
  }

  return (
    <div className="space-y-4">
      {/* Top 4 fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label={t.jobIntention.position}
          value={jobIntention.position}
          onChange={(value) => updateField('position', value)}
          placeholder={t.jobIntention.positionPlaceholder}
        />
        <FormField
          label={t.jobIntention.jobType}
          value={jobIntention.jobType}
          onChange={(value) => updateField('jobType', value)}
          placeholder={t.jobIntention.jobTypePlaceholder}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label={t.jobIntention.expectedSalary}
          value={jobIntention.expectedSalary}
          onChange={(value) => updateField('expectedSalary', value)}
          placeholder={t.jobIntention.expectedSalaryPlaceholder}
        />
        <FormField
          label={t.jobIntention.targetCity}
          value={jobIntention.targetCity}
          onChange={(value) => updateField('targetCity', value)}
          placeholder={t.jobIntention.targetCityPlaceholder}
        />
      </div>

      {/* Collapsible section */}
      <button
        type="button"
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        {t.jobIntention.moreInfo}
      </button>

      {expanded && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label={t.jobIntention.currentStatus}
              value={jobIntention.currentStatus}
              onChange={(value) => updateField('currentStatus', value)}
              placeholder={t.jobIntention.currentStatusPlaceholder}
            />
            <FormField
              label={t.jobIntention.desiredIndustry}
              value={jobIntention.desiredIndustry}
              onChange={(value) => updateField('desiredIndustry', value)}
              placeholder={t.jobIntention.desiredIndustryPlaceholder}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label={t.jobIntention.currentLocation}
              value={jobIntention.currentLocation}
              onChange={(value) => updateField('currentLocation', value)}
              placeholder={t.jobIntention.currentLocationPlaceholder}
            />
            <FormField
              label={t.jobIntention.hukou}
              value={jobIntention.hukou}
              onChange={(value) => updateField('hukou', value)}
              placeholder={t.jobIntention.hukouPlaceholder}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label={t.jobIntention.workStartDate}
              value={jobIntention.workStartDate}
              onChange={(value) => updateField('workStartDate', value)}
              placeholder={t.jobIntention.workStartDatePlaceholder}
            />
          </div>
        </div>
      )}
    </div>
  )
}
