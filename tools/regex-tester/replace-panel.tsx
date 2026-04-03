'use client'

interface ReplacePanelProps {
  replaceInput: string
  onReplaceInputChange: (value: string) => void
  replaceResult: string | null
}

export function ReplacePanel({ replaceInput, onReplaceInputChange, replaceResult }: ReplacePanelProps) {
  return (
    <div className="space-y-4">
      {/* Replace input */}
      <div>
        <label
          htmlFor="replace-input"
          className="block text-[10px] font-bold uppercase tracking-widest text-[#70767f] mb-2"
        >
          Replace With
        </label>
        <input
          id="replace-input"
          type="text"
          value={replaceInput}
          onChange={(e) => onReplaceInputChange(e.target.value)}
          placeholder="Replacement string ($1, $2, $&, etc.)"
          spellCheck={false}
          autoComplete="off"
          className="w-full h-12 px-4 font-mono text-sm rounded-xl border border-[#1e2631] bg-[#131a23] text-white placeholder-[#70767f] focus:outline-none focus:border-[#3D6AF2] focus:ring-2 focus:ring-[rgba(61,106,242,0.3)] transition-colors"
        />
      </div>

      {/* Result preview */}
      {replaceResult !== null && (
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#70767f] mb-2">
            Result Preview
          </label>
          <div className="max-h-[200px] overflow-y-auto p-4 rounded-xl border border-[#1e2631] bg-[#0d1420] font-mono text-sm text-white whitespace-pre-wrap break-words">
            {replaceResult || <span className="text-[#70767f] italic">Empty result</span>}
          </div>
        </div>
      )}
    </div>
  )
}
