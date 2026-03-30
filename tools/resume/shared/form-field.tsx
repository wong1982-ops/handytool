'use client'

interface FormFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'email' | 'tel' | 'date' | 'month'
}

export function FormField({ label, value, onChange, placeholder, type = 'text' }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
      />
    </div>
  )
}
