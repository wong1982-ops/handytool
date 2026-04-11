'use client'

import { useState } from 'react'
import { ActionGate } from '@/components/auth/action-gate'

interface AiToolsPanelProps {
  isReady: boolean
  aiProcessing: boolean
  aiError: string | null
  onClearError: () => void
  onRemoveBg: () => void
  onSegmentStart: () => void
  onInpaintStart: (brushSize: number) => void
  onInpaintExecute: (prompt: string) => void
  onInpaintCancel: () => void
  onEnhance: (mode: 'upscale' | 'denoise' | 'restore-faces' | 'sharpen') => void
  onGenerativeFillStart: (brushSize: number) => void
  onGenerativeFillExecute: (prompt: string) => void
  onGenerativeFillCancel: () => void
  activeAiTool: string | null
}

type EnhanceMode = 'upscale' | 'denoise' | 'restore-faces' | 'sharpen'

export function AiToolsPanel({
  isReady,
  aiProcessing,
  aiError,
  onClearError,
  onRemoveBg,
  onSegmentStart,
  onInpaintStart,
  onInpaintExecute,
  onInpaintCancel,
  onEnhance,
  onGenerativeFillStart,
  onGenerativeFillExecute,
  onGenerativeFillCancel,
  activeAiTool,
}: AiToolsPanelProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [brushSize, setBrushSize] = useState(30)
  const [inpaintPrompt, setInpaintPrompt] = useState('')
  const [genFillPrompt, setGenFillPrompt] = useState('')
  const [enhanceMode, setEnhanceMode] = useState<EnhanceMode>('upscale')

  const disabled = !isReady || aiProcessing

  return (
    <div className="p-4 border-b border-slate-700">
      {/* Collapsible header */}
      <button
        className="w-full text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2 cursor-pointer select-none hover:text-slate-400 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
        aria-expanded={!collapsed}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        AI Tools
        <svg
          className={`w-3 h-3 ml-auto transition-transform ${collapsed ? '' : 'rotate-180'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {collapsed ? null : (
        <ActionGate cost={1}>{() => (
        <div className="space-y-2">
          {/* Error banner */}
          {aiError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-2.5 flex items-start gap-2">
              <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-red-300 flex-1">{aiError}</p>
              <button onClick={onClearError} className="text-red-400 hover:text-red-300 cursor-pointer shrink-0" aria-label="Dismiss error">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Processing spinner */}
          {aiProcessing && (
            <div className="flex items-center gap-2 rounded-lg bg-[var(--tk-color-primary-500)]/10 border border-[var(--tk-color-primary-500)]/30 p-2.5">
              <svg className="w-4 h-4 text-[var(--tk-color-primary-500)] animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-xs text-[var(--tk-color-primary-500)] font-medium">Processing...</span>
            </div>
          )}

          {/* Active tool sub-panel or tool list */}
          {activeAiTool === 'segment' ? (
            <SubPanel title="Segment Object" onBack={() => onInpaintCancel()}>
              <div className="flex items-center gap-2 rounded-lg bg-slate-800 p-3">
                <svg className="w-5 h-5 text-[var(--tk-color-primary-500)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <p className="text-xs text-slate-300">Click on the object you want to segment</p>
              </div>
            </SubPanel>
          ) : activeAiTool === 'inpaint' ? (
            <SubPanel title="Inpaint" onBack={onInpaintCancel}>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span className="text-slate-400 font-medium">Brush Size</span>
                    <span className="text-[var(--tk-color-primary-500)] font-bold">{brushSize}px</span>
                  </div>
                  <input
                    type="range" min={10} max={100} value={brushSize}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      setBrushSize(v)
                      onInpaintStart(v)
                    }}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--tk-color-primary-500)]"
                    aria-label="Brush size"
                  />
                </div>
                <textarea
                  value={inpaintPrompt}
                  onChange={(e) => setInpaintPrompt(e.target.value)}
                  placeholder="Describe what to fill (optional)"
                  className="w-full rounded-lg bg-slate-800 border border-slate-600 text-xs text-slate-200 p-2.5 resize-none h-16 placeholder:text-slate-500 focus:outline-none focus:border-[var(--tk-color-primary-500)]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { onInpaintExecute(inpaintPrompt); setInpaintPrompt('') }}
                    disabled={disabled}
                    className="flex-1 py-2.5 rounded-lg bg-[var(--tk-color-primary-500)] hover:bg-[var(--tk-color-primary-600,#2d5ad2)] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Inpaint
                  </button>
                  <button
                    onClick={onInpaintCancel}
                    className="flex-1 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </SubPanel>
          ) : activeAiTool === 'enhance' ? (
            <SubPanel title="Enhance" onBack={onInpaintCancel}>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  {([
                    { value: 'upscale' as EnhanceMode, label: 'Upscale 2x', note: null },
                    { value: 'denoise' as EnhanceMode, label: 'Denoise', note: null },
                    { value: 'restore-faces' as EnhanceMode, label: 'Restore Faces', note: null },
                    { value: 'sharpen' as EnhanceMode, label: 'Sharpen', note: 'Free' },
                  ]).map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2.5 rounded-lg p-2.5 cursor-pointer transition-colors ${
                        enhanceMode === opt.value ? 'bg-[var(--tk-color-primary-500)]/10 border border-[var(--tk-color-primary-500)]/30' : 'bg-slate-800 border border-transparent hover:bg-slate-700'
                      }`}
                    >
                      <input
                        type="radio" name="enhance-mode" value={opt.value}
                        checked={enhanceMode === opt.value}
                        onChange={() => setEnhanceMode(opt.value)}
                        className="accent-[var(--tk-color-primary-500)]"
                      />
                      <span className="text-xs text-slate-200 font-medium flex-1">{opt.label}</span>
                      {opt.note && (
                        <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full font-medium">{opt.note}</span>
                      )}
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => onEnhance(enhanceMode)}
                  disabled={disabled}
                  className="w-full py-2.5 rounded-lg bg-[var(--tk-color-primary-500)] hover:bg-[var(--tk-color-primary-600,#2d5ad2)] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Enhance
                </button>
              </div>
            </SubPanel>
          ) : activeAiTool === 'generative-fill' ? (
            <SubPanel title="Generative Fill" onBack={onGenerativeFillCancel}>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span className="text-slate-400 font-medium">Brush Size</span>
                    <span className="text-[var(--tk-color-primary-500)] font-bold">{brushSize}px</span>
                  </div>
                  <input
                    type="range" min={10} max={100} value={brushSize}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      setBrushSize(v)
                      onGenerativeFillStart(v)
                    }}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--tk-color-primary-500)]"
                    aria-label="Brush size"
                  />
                </div>
                <textarea
                  value={genFillPrompt}
                  onChange={(e) => setGenFillPrompt(e.target.value)}
                  placeholder="Describe what to generate (required)"
                  className="w-full rounded-lg bg-slate-800 border border-slate-600 text-xs text-slate-200 p-2.5 resize-none h-16 placeholder:text-slate-500 focus:outline-none focus:border-[var(--tk-color-primary-500)]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { onGenerativeFillExecute(genFillPrompt); setGenFillPrompt('') }}
                    disabled={disabled || !genFillPrompt.trim()}
                    className="flex-1 py-2.5 rounded-lg bg-[var(--tk-color-primary-500)] hover:bg-[var(--tk-color-primary-600,#2d5ad2)] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Generate
                  </button>
                  <button
                    onClick={onGenerativeFillCancel}
                    className="flex-1 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </SubPanel>
          ) : (
            /* Tool list */
            <>
              <ToolButton
                icon={<WandIcon />}
                label="Remove Background"
                badge="1 cr"
                disabled={disabled}
                onClick={onRemoveBg}
              />
              <ToolButton
                icon={<ScissorsIcon />}
                label="Segment Object"
                badge="1 cr"
                disabled={disabled}
                onClick={onSegmentStart}
              />
              <ToolButton
                icon={<PaintbrushIcon />}
                label="Inpaint"
                badge="1 cr"
                disabled={disabled}
                onClick={() => onInpaintStart(brushSize)}
              />
              <ToolButton
                icon={<SparklesIcon />}
                label="Enhance"
                badge="1 cr"
                disabled={disabled}
                onClick={() => onEnhance(enhanceMode)}
              />
              <ToolButton
                icon={<ImagePlusIcon />}
                label="Generative Fill"
                badge="1 cr"
                disabled={disabled}
                onClick={() => onGenerativeFillStart(brushSize)}
              />
            </>
          )}
        </div>
        )}</ActionGate>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SubPanel({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
      <h4 className="text-xs font-semibold text-slate-300">{title}</h4>
      {children}
    </div>
  )
}

function ToolButton({ icon, label, badge, disabled, onClick }: {
  icon: React.ReactNode; label: string; badge: string; disabled: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 p-3 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <span className="text-[var(--tk-color-primary-500)]">{icon}</span>
      <span className="text-xs text-slate-200 font-medium flex-1 text-left">{label}</span>
      <span className="text-[9px] bg-[var(--tk-color-primary-500)]/15 text-[var(--tk-color-primary-500)] px-1.5 py-0.5 rounded-full font-medium">{badge}</span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function WandIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
    </svg>
  )
}

function ScissorsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
    </svg>
  )
}

function PaintbrushIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
    </svg>
  )
}

function SparklesIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  )
}

function ImagePlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}
