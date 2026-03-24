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
          className="bg-[#131a23] text-white rounded-xl px-4 py-3 min-h-[44px] outline-none focus:ring-2 focus:ring-[#3D6AF2]/50 placeholder:text-[#70767f] transition-shadow"
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
          className="bg-[#131a23] text-white rounded-xl px-4 py-3 min-h-[44px] outline-none focus:ring-2 focus:ring-[#3D6AF2]/50 placeholder:text-[#70767f] transition-shadow"
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
            className="w-full bg-[#131a23] text-white rounded-xl px-4 py-3 min-h-[44px] outline-none focus:ring-2 focus:ring-[#3D6AF2]/50 placeholder:text-[#70767f] transition-shadow"
          />
          {isDropdownOpen && filteredIndustries.length > 0 && (
            <ul className="absolute z-10 mt-1.5 w-full bg-[#1e2631] rounded-xl shadow-xl max-h-52 overflow-y-auto">
              {filteredIndustries.map((ind) => (
                <li
                  key={ind}
                  onMouseDown={() => handleIndustrySelect(ind)}
                  className="hover:bg-[#3D6AF2]/20 px-4 py-2.5 cursor-pointer text-white text-sm transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  {ind}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Next Button */}
      <button
        type="button"
        onClick={onNext}
        disabled={!isNextEnabled}
        className="w-full bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white font-semibold rounded-xl min-h-[44px] cursor-pointer transition-opacity disabled:opacity-40 disabled:cursor-not-allowed mt-2"
      >
        Next
      </button>
    </div>
  )
}
