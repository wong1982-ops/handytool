'use client'

import { useLocalServices } from '../local-services-provider'
import { ResultCard } from './result-card'

interface ResultsPanelProps {
  onSuggest: () => void
}

export function ResultsPanel({ onSuggest }: ResultsPanelProps) {
  const { state, dispatch } = useLocalServices()

  const communityResults = state.results.filter(r => r.source === 'community')
  const googleResults = state.results.filter(r => r.source === 'google')
  const isFav = (id: string) => state.favourites.some(f => f.id === id)

  return (
    <div
      className="w-[380px] max-lg:w-full max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:top-auto max-lg:max-h-[50vh] h-full shadow-2xl flex flex-col rounded-r-2xl max-lg:rounded-t-2xl max-lg:rounded-r-none"
      style={{ background: '#131a23', borderRight: '1px solid #1e2631' }}
    >
      {/* Header — sticky */}
      <div
        className="shrink-0 z-10 px-4 py-3"
        style={{ borderBottom: '1px solid #1e2631' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold" style={{ color: '#ffffff' }}>
            {state.results.length} results nearby
          </h2>
          {state.resultsLoading && (
            <div
              className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: '#3D6AF2', borderTopColor: 'transparent' }}
            />
          )}
        </div>
        {/* Mobile drag handle */}
        <div className="lg:hidden flex justify-center pt-1">
          <div className="w-10 h-1 rounded-full" style={{ background: '#1e2631' }} />
        </div>
      </div>

      {/* Scrollable results list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Community results */}
        {communityResults.length > 0 && (
          <div className="px-3 pt-3">
            <p
              className="text-[10px] font-bold uppercase tracking-wider mb-2 px-1"
              style={{ color: '#10B981', letterSpacing: '0.08em' }}
            >
              Community Recommended 社区推荐
            </p>
            <div className="space-y-2">
              {communityResults.map(r => (
                <ResultCard
                  key={r.id}
                  result={r}
                  isSelected={state.selectedPlaceId === r.id}
                  isFavourite={isFav(r.id)}
                  onSelect={() => dispatch({ type: 'SET_SELECTED_PLACE', payload: r.id })}
                  onToggleFavourite={() => {
                    if (isFav(r.id)) dispatch({ type: 'REMOVE_FAVOURITE', payload: r.id })
                    else dispatch({ type: 'ADD_FAVOURITE', payload: r })
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Google results */}
        {googleResults.length > 0 && (
          <div className="px-3 pt-3 pb-3">
            {communityResults.length > 0 && (
              <p
                className="text-[10px] font-bold uppercase tracking-wider mb-2 px-1"
                style={{ color: '#70767f', letterSpacing: '0.08em' }}
              >
                Google Places
              </p>
            )}
            <div className="space-y-2">
              {googleResults.map(r => (
                <ResultCard
                  key={r.id}
                  result={r}
                  isSelected={state.selectedPlaceId === r.id}
                  isFavourite={isFav(r.id)}
                  onSelect={() => dispatch({ type: 'SET_SELECTED_PLACE', payload: r.id })}
                  onToggleFavourite={() => {
                    if (isFav(r.id)) dispatch({ type: 'REMOVE_FAVOURITE', payload: r.id })
                    else dispatch({ type: 'ADD_FAVOURITE', payload: r })
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Suggest a provider — sticky footer */}
      <div
        className="shrink-0 px-4 py-3"
        style={{ borderTop: '1px solid #1e2631', background: '#131a23' }}
      >
        <button
          onClick={onSuggest}
          className="w-full h-11 rounded-xl text-xs font-semibold transition-colors"
          style={{ border: '2px dashed #1e2631', color: '#70767f' }}
        >
          + Suggest a local provider
        </button>
      </div>
    </div>
  )
}
