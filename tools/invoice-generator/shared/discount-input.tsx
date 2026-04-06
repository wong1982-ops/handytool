'use client'

interface DiscountInputProps {
  type: 'none' | 'percent' | 'fixed'
  value: number
  onTypeChange: (type: 'none' | 'percent' | 'fixed') => void
  onValueChange: (value: number) => void
}

const SELECT_CLASS =
  'min-h-[44px] px-3 py-2 pr-8 bg-[#090f16] border border-[#1e2631] rounded-lg text-white text-sm appearance-none focus:border-[#3D6AF2] outline-none transition-colors bg-[right_8px_center] bg-no-repeat bg-[length:14px]'

const INPUT_CLASS =
  'min-h-[44px] px-3 py-2 bg-[#090f16] border border-[#1e2631] rounded-lg text-white text-sm text-right focus:border-[#3D6AF2] outline-none transition-colors'

const CHEVRON_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2370767f'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`

export function DiscountInput({ type, value, onTypeChange, onValueChange }: DiscountInputProps) {
  return (
    <div className="flex gap-2">
      <select
        className={`flex-1 ${SELECT_CLASS}`}
        style={{ backgroundImage: CHEVRON_BG }}
        value={type}
        onChange={(e) => onTypeChange(e.target.value as 'none' | 'percent' | 'fixed')}
      >
        <option value="none">None</option>
        <option value="percent">%</option>
        <option value="fixed">Fixed</option>
      </select>
      {type !== 'none' && (
        <input
          type="number"
          className={`w-20 ${INPUT_CLASS}`}
          min={0}
          step={type === 'percent' ? 1 : 0.01}
          value={value || ''}
          onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)}
          placeholder={type === 'percent' ? '%' : '0.00'}
        />
      )}
    </div>
  )
}
