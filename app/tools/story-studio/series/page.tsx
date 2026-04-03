'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/use-auth'
import { useSeriesList } from '@/tools/story-studio/use-series'
import { signInWithOAuth } from '@/lib/supabase/auth'
import { ART_STYLES } from '@/lib/story/styles'

export default function SeriesListPage() {
  const { user, loading: authLoading } = useAuth()
  const { series, loading, needsAuth, createSeries, deleteSeries } = useSeriesList()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', setting: '', artStyle: '' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleteInput, setDeleteInput] = useState('')
  const [rephrasing, setRephrasing] = useState<'description' | 'setting' | null>(null)

  if (needsAuth || (!authLoading && !user && process.env.NODE_ENV !== 'development')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-2">
          <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Please Sign In</h1>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-xs">
          Sign in to create and manage your story series with consistent characters.
        </p>
        <button
          onClick={() => signInWithOAuth('google')}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold transition-colors cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
          </svg>
          Sign in with Google
        </button>
      </div>
    )
  }

  const handleRephrase = async (field: 'description' | 'setting') => {
    const text = form[field].trim()
    if (!text || text.length < 5 || rephrasing) return
    setRephrasing(field)
    try {
      const res = await fetch('/api/v1/story/rephrase-plot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plot: text }),
      })
      if (res.ok) {
        const { data } = await res.json()
        if (data?.rephrasedPlot) {
          setForm(f => ({ ...f, [field]: data.rephrasedPlot }))
        }
      }
    } catch { /* silently fail */ }
    finally { setRephrasing(null) }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError(null)
    try {
      const id = await createSeries(form)
      setShowCreate(false)
      setForm({ title: '', description: '', setting: '', artStyle: '' })
      window.location.href = `/tools/story-studio/series/${id}`
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create series')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteSeries(id)
    setDeleteConfirm(null)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              My Series
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Create character universes with consistent looks across books.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Series
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-5 animate-pulse">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-4" />
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        ) : series.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-amber-500/20 flex items-center justify-center">
              <svg className="w-9 h-9 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No series yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              Create a series to keep your characters consistent across multiple story books.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold transition-colors cursor-pointer"
              style={{ minHeight: '44px' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Create Your First Series
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {series.map((s) => (
              <div
                key={s.id}
                className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                <Link href={`/tools/story-studio/series/${s.id}`} className="block p-5 flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {s.title}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {s.artStyle}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                    {s.description}
                  </p>

                  {/* Characters preview */}
                  {s.characters.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-2">
                      {s.characters.map((c, i) => (
                        <div key={i} className="relative">
                          {c.referenceImageUrl ? (
                            <img
                              src={c.referenceImageUrl}
                              alt={c.name}
                              className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-slate-800"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-2 border-white dark:border-slate-800">
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                {c.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          {c.status === 'approved' && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                              <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-1">
                        {s.characters.length} character{s.characters.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                    <span>{s.bookCount} book{s.bookCount !== 1 ? 's' : ''}</span>
                    <span>{new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </Link>

                <div className="px-4 pb-4 flex gap-1.5">
                  <Link
                    href={`/tools/story-studio?seriesId=${s.id}`}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium text-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                    style={{ minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    New Book
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(s.id)}
                    className="py-1.5 px-3 rounded-lg text-xs font-medium border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                    style={{ minHeight: '44px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {/* Create new series card */}
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-3 min-h-[200px] hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
                <svg className="w-6 h-6 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">New Series</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Create a character universe</p>
              </div>
            </button>
          </div>
        )}

      {/* Create series modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Create New Series</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              Define the universe for your characters to live in.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Series Title
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. The Adventures of Katherine & Sophone"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  style={{ minHeight: '44px' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="What is this series about? Describe the world, characters, and themes..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                  disabled={rephrasing === 'description'}
                />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-slate-400">{form.description.length} characters</span>
                  <button
                    type="button"
                    onClick={() => handleRephrase('description')}
                    disabled={form.description.trim().length < 5 || rephrasing !== null}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors disabled:opacity-40 disabled:cursor-default cursor-pointer"
                  >
                    {rephrasing === 'description' ? (
                      <>
                        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                        Rephrasing...
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" /></svg>
                        Rephrase with AI
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-700/40">1 credit</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Setting
                </label>
                <textarea
                  required
                  rows={2}
                  value={form.setting}
                  onChange={(e) => setForm(f => ({ ...f, setting: e.target.value }))}
                  placeholder="e.g. A cozy modern-day suburb where magic hides in everyday objects..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                  disabled={rephrasing === 'setting'}
                />
                <div className="flex items-center justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => handleRephrase('setting')}
                    disabled={form.setting.trim().length < 5 || rephrasing !== null}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors disabled:opacity-40 disabled:cursor-default cursor-pointer"
                  >
                    {rephrasing === 'setting' ? (
                      <>
                        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                        Rephrasing...
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" /></svg>
                        Rephrase with AI
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-700/40">1 credit</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Art Style
                </label>
                <div className="flex flex-wrap gap-2">
                  {ART_STYLES.map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, artStyle: style }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        form.artStyle === style
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
                {!(ART_STYLES as readonly string[]).includes(form.artStyle) && (
                  <input
                    type="text"
                    value={form.artStyle}
                    onChange={(e) => setForm(f => ({ ...f, artStyle: e.target.value }))}
                    placeholder="Or type a custom style..."
                    className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  style={{ minHeight: '44px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !form.title || !form.description || !form.setting || !form.artStyle}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ minHeight: '44px' }}
                >
                  {creating ? 'Creating...' : 'Create Series'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => { setDeleteConfirm(null); setDeleteInput('') }}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Series</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-white">{series.find(s => s.id === deleteConfirm)?.title}</span>?
            </p>
            <p className="text-xs text-red-500 dark:text-red-400 mb-4">
              This will delete all characters and their portraits. Books in this series will remain but lose their series connection.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Type <span className="font-mono font-semibold text-red-500">permanent delete</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="permanent delete"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-red-500 mb-4"
              style={{ minHeight: '44px' }}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteConfirm(null); setDeleteInput('') }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { handleDelete(deleteConfirm); setDeleteInput('') }}
                disabled={deleteInput !== 'permanent delete'}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ minHeight: '44px' }}
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
