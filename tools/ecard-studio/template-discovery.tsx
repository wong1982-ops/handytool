'use client'

import { useState } from 'react'
import type { TemplateId } from '@/tools/ecard-studio/types'
import { TEMPLATES } from '@/tools/ecard-studio/templates'
import CardPreview from '@/tools/ecard-studio/card-preview'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const INTENT_PILLS = [
  'New Product Launch',
  'Client Anniversary',
  'Employee Welcome',
  'Quarterly Milestone',
  'Holiday Greetings',
  'Thank You Note',
] as const

/* ------------------------------------------------------------------ */
/*  SVG Icons                                                          */
/* ------------------------------------------------------------------ */

function BookmarkIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function LogoIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function ColorsIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18" />
      <path d="M3 12h18" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface TemplateDiscoveryProps {
  onSelectTemplate: (templateId: TemplateId) => void
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function TemplateDiscovery({ onSelectTemplate }: TemplateDiscoveryProps) {
  const [activeIntent, setActiveIntent] = useState(0)

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* ---- Hero Section ---- */}
      <section className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          What&rsquo;s the occasion?
        </h1>
        <p className="text-slate-400 text-center max-w-xl mx-auto mb-8">
          Select your intent to generate smart recommendations tailored for your
          business relationships.
        </p>

        {/* Intent Pills */}
        <div className="flex flex-wrap justify-center gap-3">
          {INTENT_PILLS.map((pill, idx) => (
            <button
              key={pill}
              type="button"
              onClick={() => setActiveIntent(idx)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors cursor-pointer ${
                idx === activeIntent
                  ? 'border-blue-500 bg-blue-500/20 text-white'
                  : 'border-slate-700 text-slate-300 hover:border-blue-500 hover:text-white'
              }`}
            >
              {pill}
            </button>
          ))}
        </div>
      </section>

      {/* ---- Section Heading ---- */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Recommended for You
          </h2>
          <p className="text-slate-400">
            Based on &ldquo;{INTENT_PILLS[activeIntent]}&rdquo; Intent
          </p>
        </div>
        <span className="text-blue-400 text-sm cursor-pointer hover:text-blue-300 transition-colors hidden sm:inline">
          View All Templates &rarr;
        </span>
      </div>

      {/* ---- Template Grid ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {/* Template Cards */}
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelectTemplate(template.id)}
            className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-600 transition-colors cursor-pointer text-left"
          >
            {/* Thumbnail area */}
            <div className="relative w-full overflow-hidden" style={{ height: 180 }}>
              <span className="absolute top-3 left-3 z-10 bg-slate-800/80 text-[10px] font-semibold uppercase tracking-wider text-slate-300 px-2 py-1 rounded">
                {template.categoryLabel}
              </span>
              <div className="w-full h-full flex items-start justify-center">
                <CardPreview data={template.defaults} scale={0.4} />
              </div>
            </div>

            {/* Info area */}
            <div className="flex items-start justify-between p-4">
              <div>
                <p className="font-semibold text-white">{template.name}</p>
                <p className="text-sm text-slate-400">{template.description}</p>
              </div>
              <span className="text-slate-500 ml-3 mt-0.5 flex-shrink-0">
                <BookmarkIcon />
              </span>
            </div>
          </button>
        ))}

        {/* Start from Scratch Card */}
        <button
          type="button"
          onClick={() => onSelectTemplate('blank')}
          className="border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center text-center p-8 hover:border-slate-500 transition-colors cursor-pointer min-h-[280px]"
        >
          <span className="text-slate-500 mb-3">
            <PlusIcon />
          </span>
          <p className="font-semibold text-white mb-1">Start from Scratch</p>
          <p className="text-sm text-slate-400 max-w-[200px]">
            Define your own patterns, colors, and layouts.
          </p>
        </button>
      </div>

      {/* ---- Bottom Editor Preview Section ---- */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left — Editor mock */}
          <div className="p-8 md:p-10">
            <span className="text-blue-400 text-xs font-bold tracking-widest uppercase">
              Editor
            </span>
            <h3 className="text-2xl font-bold text-white mt-2 mb-8">
              Personalize Design
            </h3>

            {/* Typography dropdown (mock) */}
            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-2">
                Typography
              </label>
              <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm">
                <span>Space Grotesk (Default)</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* Message textarea (mock) */}
            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-2">
                Message
              </label>
              <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-500 text-sm min-h-[80px]">
                We are excited to announce...
              </div>
            </div>

            {/* Brand Identity icons (mock) */}
            <div className="mb-8">
              <label className="block text-sm text-slate-400 mb-2">
                Brand Identity
              </label>
              <div className="flex gap-3">
                <div className="flex flex-col items-center justify-center bg-slate-800 border border-slate-700 rounded-lg w-24 h-20 text-slate-400">
                  <LogoIcon />
                  <span className="text-[10px] uppercase tracking-wider mt-1.5 font-semibold">
                    Logo
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center bg-slate-800 border border-slate-700 rounded-lg w-24 h-20 text-slate-400">
                  <ColorsIcon />
                  <span className="text-[10px] uppercase tracking-wider mt-1.5 font-semibold">
                    Colors
                  </span>
                </div>
              </div>
            </div>

            {/* Generate Preview button (mock) */}
            <button
              type="button"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 py-3 text-sm transition-colors cursor-pointer"
            >
              <SendIcon />
              Generate Preview
            </button>
          </div>

          {/* Right — Live Preview */}
          <div className="bg-slate-800/50 p-8 md:p-10 flex flex-col">
            <div className="flex justify-end mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-blue-400">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                Live Preview
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <CardPreview
                data={TEMPLATES[0].defaults}
                scale={0.42}
                className="rounded-lg overflow-hidden"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
