'use client'

import { useRef } from 'react'
import { useResume } from '../resume-provider'
import { FormField } from '../shared/form-field'

export function BaseInfoEditor() {
  const { state, dispatch, t } = useResume()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const baseInfo = state.resume.baseInfo

  const updateField = (field: string, value: string) => {
    dispatch({ type: 'SET_BASE_INFO', payload: { [field]: value } })
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      dispatch({ type: 'SET_BASE_INFO', payload: { photo: base64 } })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-4">
      {/* Photo upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t.baseInfo.photo}
        </label>
        <div
          className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer overflow-hidden hover:border-blue-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {baseInfo.photo ? (
            <img
              src={baseInfo.photo}
              alt={t.baseInfo.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-gray-400 text-center px-1">
              {t.baseInfo.photoHint}
            </span>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />
      </div>

      {/* Name */}
      <FormField
        label={t.baseInfo.name}
        value={baseInfo.name}
        onChange={(value) => updateField('name', value)}
        placeholder={t.baseInfo.namePlaceholder}
      />

      {/* Phone & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label={t.baseInfo.phone}
          value={baseInfo.phone}
          onChange={(value) => updateField('phone', value)}
          placeholder={t.baseInfo.phonePlaceholder}
          type="tel"
        />
        <FormField
          label={t.baseInfo.email}
          value={baseInfo.email}
          onChange={(value) => updateField('email', value)}
          placeholder={t.baseInfo.emailPlaceholder}
          type="email"
        />
      </div>

      {/* WeChat & Date of Birth */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label={t.baseInfo.wechat}
          value={baseInfo.wechat}
          onChange={(value) => updateField('wechat', value)}
          placeholder={t.baseInfo.wechatPlaceholder}
        />
        <FormField
          label={t.baseInfo.dateOfBirth}
          value={baseInfo.dateOfBirth}
          onChange={(value) => updateField('dateOfBirth', value)}
          placeholder={t.baseInfo.dateOfBirthPlaceholder}
          type="date"
        />
      </div>
    </div>
  )
}
