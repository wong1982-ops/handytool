'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import type { ComponentSession, Framework, GeneratedCode, ComponentSettings } from './types'
import { DEFAULT_SESSION } from './types'
import LivePreview from './live-preview'
import CodeEditor from './code-editor'
import PromptPanel from './prompt-panel'
import ChatBar from './chat-bar'

type MobileTab = 'preview' | 'code' | 'chat'

export default function ComponentLab() {
  const [session, setSession] = useState<ComponentSession>({ ...DEFAULT_SESSION })
  const [generating, setGenerating] = useState(false)
  const [refining, setRefining] = useState(false)
  const [viewportWidth, setViewportWidth] = useState(1280)
  const [background, setBackground] = useState<'white' | 'dark' | 'checker'>('white')
  const [showPromptPanel, setShowPromptPanel] = useState(false)
  const [mobileTab, setMobileTab] = useState<MobileTab>('preview')

  // --- Handlers ---

  const handleGenerate = useCallback(async () => {
    if (!session.prompt.trim() || generating) return
    setGenerating(true)
    try {
      const res = await fetch('/api/v1/component-lab/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: session.prompt,
          settings: session.settings,
          referenceImageBase64: session.referenceImageBase64,
        }),
      })
      if (!res.ok) throw new Error('Generation failed')
      const json = await res.json()
      const code: GeneratedCode = json.data ?? json
      const version = { code, timestamp: Date.now() }
      setSession((s) => ({
        ...s,
        code,
        versions: [...s.versions, version],
        versionIndex: s.versions.length,
        chatHistory: [],
      }))
    } catch {
      // TODO: show toast
    } finally {
      setGenerating(false)
    }
  }, [session.prompt, session.settings, session.referenceImageBase64, generating])

  const handleRefine = useCallback(
    async (instruction: string) => {
      if (refining) return
      setRefining(true)
      try {
        const res = await fetch('/api/v1/component-lab/refine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: session.prompt,
            currentCode: session.code[session.activeFramework],
            framework: session.activeFramework,
            instruction,
            settings: session.settings,
          }),
        })
        if (!res.ok) throw new Error('Refinement failed')
        const json = await res.json()
        const result = json.data ?? json
        const code: GeneratedCode = result.code ?? result
        const summary: string = result.summary ?? 'Changes applied'
        const version = { code, timestamp: Date.now() }
        setSession((s) => ({
          ...s,
          code,
          versions: [...s.versions, version],
          versionIndex: s.versions.length,
          chatHistory: [
            ...s.chatHistory,
            { role: 'user' as const, content: instruction, timestamp: Date.now() },
            { role: 'assistant' as const, content: summary, timestamp: Date.now() },
          ],
        }))
      } catch {
        // TODO: show toast
      } finally {
        setRefining(false)
      }
    },
    [refining, session.prompt, session.code, session.activeFramework, session.settings],
  )

  const handleCodeChange = useCallback((fw: Framework, code: string) => {
    setSession((s) => ({
      ...s,
      code: { ...s.code, [fw]: code },
    }))
  }, [])

  const handleUndo = useCallback(() => {
    setSession((s) => {
      if (s.versionIndex <= 0) return s
      const newIndex = s.versionIndex - 1
      return {
        ...s,
        versionIndex: newIndex,
        code: { ...s.versions[newIndex].code },
      }
    })
  }, [])

  const handleRedo = useCallback(() => {
    setSession((s) => {
      if (s.versionIndex >= s.versions.length - 1) return s
      const newIndex = s.versionIndex + 1
      return {
        ...s,
        versionIndex: newIndex,
        code: { ...s.versions[newIndex].code },
      }
    })
  }, [])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(session.code[session.activeFramework])
    } catch {
      // silent
    }
  }, [session.code, session.activeFramework])

  const handleReset = useCallback(() => {
    setSession((s) => {
      if (s.versions.length === 0) return s
      const latest = s.versions[s.versionIndex]
      if (!latest) return s
      return { ...s, code: { ...latest.code } }
    })
  }, [])

  const handlePromptChange = useCallback((p: string) => {
    setSession((s) => ({ ...s, prompt: p }))
  }, [])

  const handleSettingsChange = useCallback((partial: Partial<ComponentSettings>) => {
    setSession((s) => ({ ...s, settings: { ...s.settings, ...partial } }))
  }, [])

  const handleReferenceChange = useCallback((base64: string | null) => {
    setSession((s) => ({ ...s, referenceImageBase64: base64 }))
  }, [])

  const handleFrameworkChange = useCallback((fw: Framework) => {
    setSession((s) => ({ ...s, activeFramework: fw }))
  }, [])

  // --- Layout ---

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-[#1e2631] shrink-0 bg-[#090f16]">
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#70767f]">
            Tools&nbsp;/&nbsp;<span className="text-[#3D6AF2]">Component Lab</span>
          </span>
          <span className="w-px h-4 bg-[#1e2631]" aria-hidden="true" />
          <h1 className="text-base font-bold text-white tracking-tight">
            Component{' '}
            <span className="bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] bg-clip-text text-transparent">
              Lab
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          <Link
            href="/tools/component-lab/library"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#a6abb5] hover:text-white hover:bg-[#1e2631] transition-colors min-h-[36px] flex items-center"
          >
            Library
          </Link>
          <Link
            href="/tools/component-lab/explore"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#a6abb5] hover:text-white hover:bg-[#1e2631] transition-colors min-h-[36px] flex items-center"
          >
            Explore
          </Link>
          <button
            type="button"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white min-h-[36px] flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            disabled={!session.code.react && !session.code.html}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
            Save
            <span className="text-[10px] opacity-65 font-normal">1cr</span>
          </button>
        </div>
      </header>

      {/* Desktop layout (lg+) */}
      <div className="hidden lg:flex flex-row flex-1 min-h-0">
        {/* Prompt Panel */}
        <aside className="w-72 shrink-0 overflow-y-auto border-r border-[#1e2631] bg-[#090f16]">
          <PromptPanel
            prompt={session.prompt}
            settings={session.settings}
            referenceImage={session.referenceImageBase64}
            generating={generating}
            onPromptChange={handlePromptChange}
            onSettingsChange={handleSettingsChange}
            onReferenceChange={handleReferenceChange}
            onGenerate={handleGenerate}
          />
        </aside>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Preview + Editor row */}
          <div className="flex flex-row flex-1 min-h-0">
            {/* Live Preview */}
            <div className="flex-1 min-w-0">
              <LivePreview
                code={session.code[session.activeFramework]}
                framework={session.activeFramework}
                viewportWidth={viewportWidth}
                background={background}
                onViewportChange={setViewportWidth}
                onBackgroundChange={setBackground}
              />
            </div>

            {/* Code Editor */}
            <div className="w-[480px] shrink-0 border-l border-[#1e2631]">
              <CodeEditor
                code={session.code}
                activeFramework={session.activeFramework}
                onFrameworkChange={handleFrameworkChange}
                onCodeChange={handleCodeChange}
                onCopy={handleCopy}
                onReset={handleReset}
              />
            </div>
          </div>

          {/* Chat Bar */}
          <ChatBar
            chatHistory={session.chatHistory}
            versionIndex={session.versionIndex}
            totalVersions={session.versions.length}
            refining={refining}
            onSend={handleRefine}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />
        </div>
      </div>

      {/* Mobile layout (< lg) */}
      <div className="flex lg:hidden flex-col flex-1 min-h-0">
        {/* Tab bar */}
        <div className="flex border-b border-[#1e2631] shrink-0">
          {(['preview', 'code', 'chat'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setMobileTab(tab)}
              className={[
                'flex-1 py-2.5 text-xs font-medium text-center transition-all min-h-[44px] cursor-pointer',
                mobileTab === tab
                  ? 'text-white border-b-2 border-[#3D6AF2]'
                  : 'text-[#70767f] border-b-2 border-transparent hover:text-[#a6abb5]',
              ].join(' ')}
            >
              {tab === 'preview' ? 'Preview' : tab === 'code' ? 'Code' : 'Chat'}
            </button>
          ))}
        </div>

        {/* Active tab content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {mobileTab === 'preview' && (
            <LivePreview
              code={session.code[session.activeFramework]}
              framework={session.activeFramework}
              viewportWidth={viewportWidth}
              background={background}
              onViewportChange={setViewportWidth}
              onBackgroundChange={setBackground}
            />
          )}
          {mobileTab === 'code' && (
            <CodeEditor
              code={session.code}
              activeFramework={session.activeFramework}
              onFrameworkChange={handleFrameworkChange}
              onCodeChange={handleCodeChange}
              onCopy={handleCopy}
              onReset={handleReset}
            />
          )}
          {mobileTab === 'chat' && (
            <div className="flex flex-col h-full">
              <div className="flex-1" />
              <ChatBar
                chatHistory={session.chatHistory}
                versionIndex={session.versionIndex}
                totalVersions={session.versions.length}
                refining={refining}
                onSend={handleRefine}
                onUndo={handleUndo}
                onRedo={handleRedo}
              />
            </div>
          )}
        </div>

        {/* FAB to open prompt panel as bottom sheet */}
        <button
          type="button"
          onClick={() => setShowPromptPanel(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white shadow-lg flex items-center justify-center z-40 cursor-pointer lg:hidden"
          aria-label="Open prompt panel"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
        </button>

        {/* Bottom sheet overlay */}
        {showPromptPanel && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setShowPromptPanel(false)}
              aria-hidden="true"
            />
            {/* Sheet */}
            <div className="fixed inset-x-0 bottom-0 z-50 bg-[#090f16] rounded-t-2xl max-h-[85vh] overflow-y-auto border-t border-[#1e2631] lg:hidden animate-slide-up">
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-[#2a3444]" />
              </div>
              {/* Close button */}
              <div className="flex justify-end px-4">
                <button
                  type="button"
                  onClick={() => setShowPromptPanel(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[#70767f] hover:text-white hover:bg-[#1e2631] transition-colors cursor-pointer"
                  aria-label="Close prompt panel"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <PromptPanel
                prompt={session.prompt}
                settings={session.settings}
                referenceImage={session.referenceImageBase64}
                generating={generating}
                onPromptChange={handlePromptChange}
                onSettingsChange={handleSettingsChange}
                onReferenceChange={handleReferenceChange}
                onGenerate={() => {
                  handleGenerate()
                  setShowPromptPanel(false)
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
