'use client'

import { useCallback } from 'react'
import { useInvoice } from '../invoice-provider'
import { ContactForm } from './contact-form'

export function SenderEditor() {
  const { state, dispatch } = useInvoice()
  const { sender, logo } = state.invoice

  const processFile = useCallback(
    (file: File | undefined) => {
      if (!file) return
      if (file.size > 500 * 1024) {
        alert('Logo must be under 500KB')
        return
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Only JPG and PNG files are supported')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        dispatch({ type: 'SET_LOGO', payload: reader.result as string })
      }
      reader.readAsDataURL(file)
    },
    [dispatch]
  )

  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70767f] mb-2">
        From (Your Business)
      </div>
      <div className="bg-[#131a23] rounded-xl p-4 space-y-3">
        {/* Logo upload */}
        <label
          className="block border-2 border-dashed border-[#1e2631] rounded-lg p-6 text-center hover:border-[#3D6AF2]/50 transition-colors cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            processFile(e.dataTransfer.files[0])
          }}
        >
          {logo ? (
            <div className="flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt="Logo" className="max-h-16 max-w-[200px] object-contain" />
              <span className="text-xs text-[#70767f]">Click or drop to replace</span>
            </div>
          ) : (
            <>
              <span className="text-[#70767f] text-2xl block mb-1">+</span>
              <p className="text-sm text-[#70767f]">Drop logo here or click to upload</p>
              <p className="text-xs text-[#70767f] mt-1">JPG, PNG — max 500KB</p>
            </>
          )}
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png"
            onChange={(e) => processFile(e.target.files?.[0])}
          />
        </label>

        <ContactForm
          value={sender}
          onChange={(changes) => dispatch({ type: 'SET_SENDER', payload: changes })}
        />
      </div>
    </div>
  )
}
