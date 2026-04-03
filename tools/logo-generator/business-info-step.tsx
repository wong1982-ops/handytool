'use client'

import { useState, useRef, useEffect } from 'react'
import { INDUSTRIES } from './types'

interface BusinessInfoStepProps {
  businessName: string
  tagline: string
  industry: string
  onBusinessNameChange: (v: string) => void
  onTaglineChange: (v: string) => void
  onIndustryChange: (v: string) => void
  onNext: () => void
}

export function BusinessInfoStep({
  businessName,
  tagline,
  industry,
  onBusinessNameChange,
  onTaglineChange,
  onIndustryChange,
  onNext,
}: BusinessInfoStepProps) {
  const [industryInput, setIndustryInput] = useState(industry)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const comboboxRef = useRef<HTMLDivElement>(null)

  const filteredIndustries = industryInput.trim()
    ? INDUSTRIES.filter((ind) =>
        ind.toLowerCase().includes(industryInput.toLowerCase())
      )
    : INDUSTRIES

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleIndustryInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setIndustryInput(val)
    onIndustryChange(val)
    setIsDropdownOpen(true)
  }

  function handleIndustrySelect(ind: string) {
    setIndustryInput(ind)
    onIndustryChange(ind)
    setIsDropdownOpen(false)
  }

  function handleIndustryFocus() {
    setIsDropdownOpen(true)
  }

  const isNextEnabled = businessName.trim().length > 0

  return (
    <div className="space-y-5">
      {/* Business Name */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-[#a6abb5] mb-1.5">
          Business Name <span className="text-[#3D6AF2]">*</span>
        </label>
        <input
          type="text"
          value={businessName}
          onChange={(e) => onBusinessNameChange(e.target.value)}
          placeholder="e.g. Bright Spark Creative"
          className="w-full bg-[#131a23] text-white rounded-xl px-4 py-3 min-h-[44px] outline-none focus:ring-2 focus:ring-[#3D6AF2]/50 border border-[#1e2631] focus:border-[#3D6AF2] placeholder:text-[#70767f] transition-all"
        />
      </div>

      {/* Tagline */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-[#a6abb5] mb-1.5">
          Tagline <span className="text-[#70767f] font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={tagline}
          onChange={(e) => onTaglineChange(e.target.value)}
          placeholder="e.g. Illuminating Ideas"
          className="w-full bg-[#131a23] text-white rounded-xl px-4 py-3 min-h-[44px] outline-none focus:ring-2 focus:ring-[#3D6AF2]/50 border border-[#1e2631] focus:border-[#3D6AF2] placeholder:text-[#70767f] transition-all"
        />
      </div>

      {/* Industry Combobox */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-[#a6abb5] mb-1.5">
          Industry
        </label>
        <div ref={comboboxRef} className="relative">
          <input
            type="text"
            value={industryInput}
            onChange={handleIndustryInputChange}
            onFocus={handleIndustryFocus}
            placeholder="Search or type your industry"
            className="w-full bg-[#131a23] text-white rounded-xl px-4 py-3 min-h-[44px] outline-none focus:ring-2 focus:ring-[#3D6AF2]/50 border border-[#1e2631] focus:border-[#3D6AF2] placeholder:text-[#70767f] transition-all"
          />
          {isDropdownOpen && filteredIndustries.length > 0 && (
            <ul className="absolute z-20 mt-1.5 w-full bg-[#1e2631] rounded-xl shadow-2xl max-h-52 overflow-y-auto border border-[#2a3344]">
              {filteredIndustries.map((ind) => (
                <li
                  key={ind}
                  onMouseDown={() => handleIndustrySelect(ind)}
                  className={`flex items-center px-4 py-2.5 min-h-[44px] cursor-pointer text-white text-sm transition-colors first:rounded-t-xl last:rounded-b-xl ${
                    ind === industry
                      ? 'bg-[#3D6AF2]/25 border-l-[3px] border-l-[#3D6AF2]'
                      : 'hover:bg-[#3D6AF2]/20'
                  }`}
                >
                  {ind}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Hint */}
      <p className="text-xs text-[#70767f] -mt-1 flex items-center gap-1">
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        A clear business name helps the AI create more relevant logos
      </p>

      {/* Next Button */}
      <button
        type="button"
        onClick={onNext}
        disabled={!isNextEnabled}
        className="w-full flex items-center justify-center gap-2 font-semibold text-white rounded-xl min-h-[44px] cursor-pointer transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed mt-2"
        style={{ background: 'linear-gradient(135deg, #3D6AF2, #7C3AED)', boxShadow: '0 4px 20px rgba(61,106,242,0.3)' }}
      >
        Continue to Style
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  )
}
