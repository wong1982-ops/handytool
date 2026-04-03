'use client'

import { useState, useEffect } from 'react'
import { useLocalServices } from '../local-services-provider'
import { ReviewForm } from './review-form'
import type { MergedResult, CommunityReview } from '../local-services-types'

interface DetailPanelProps {
  result: MergedResult
  onBack: () => void
}

export function DetailPanel({ result, onBack }: DetailPanelProps) {
  const { state, dispatch } = useLocalServices()
  const [details, setDetails] = useState<{ hours: any; reviews: any[] } | null>(null)
  const [communityReviews, setCommunityReviews] = useState<CommunityReview[]>([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const isFav = state.favourites.some(f => f.id === result.id)

  // Fetch details
  useEffect(() => {
    if (result.source === 'google') {
      fetch(`/api/v1/local-services/place?id=${result.id}`)
        .then(r => r.json())
        .then(json => setDetails(json.data || json))
        .catch(() => {})
    }
    if (result.source === 'community') {
      fetch(`/api/v1/local-services/reviews?providerId=${result.id}`)
        .then(r => r.json())
        .then(json => setCommunityReviews(json.data || []))
        .catch(() => {})
    }
  }, [result.id, result.source])

  const toggleFav = () => {
    if (isFav) dispatch({ type: 'REMOVE_FAVOURITE', payload: result.id })
    else dispatch({ type: 'ADD_FAVOURITE', payload: result })
  }

  const reviews = result.source === 'community' ? communityReviews : (details?.reviews || [])
  const hours = result.source === 'google' ? details?.hours : null

  return (
    <div
      className="w-[380px] max-w-[calc(100vw-2rem)] max-lg:w-full max-lg:max-w-full max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:top-auto max-lg:max-h-[50vh] h-full shadow-2xl overflow-y-auto rounded-r-2xl max-lg:rounded-t-2xl max-lg:rounded-r-none"
      style={{ background: '#131a23', borderRight: '1px solid #1e2631' }}
    >
      {/* Back + close */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
        style={{ background: '#131a23', borderBottom: '1px solid #1e2631' }}
      >
        <button
          onClick={onBack}
          className="w-11 h-11 rounded-full flex items-center justify-center"
          style={{ background: '#1e2631' }}
        >
          <svg className="w-4 h-4" style={{ color: '#a6abb5' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <span className="text-xs" style={{ color: '#70767f' }}>Back to results</span>
        {/* Mobile drag handle */}
        <div className="lg:hidden flex-1 flex justify-center">
          <div className="w-10 h-1 rounded-full" style={{ background: '#1e2631' }} />
        </div>
      </div>

      {/* Hero photo */}
      {(result.profilePhoto || result.photoUrl) && (
        <div className="h-48 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#0d1a28 0%,#1a2638 50%,#0a1520 100%)' }}>
          <img src={result.profilePhoto || result.photoUrl || ''} alt="" className="w-full h-full object-cover" />
          {result.source === 'community' && (
            <div
              className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"
              style={{ background: '#10B981', color: '#ffffff' }}
            >
              <span>&#9733;</span> Community 社区推荐
            </div>
          )}
          {result.isVerified && (
            <div
              className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold"
              style={{ background: '#3D6AF2', color: '#ffffff' }}
            >
              &#10003; Verified
            </div>
          )}
        </div>
      )}

      <div className="px-4 py-4 space-y-4">
        {/* Name + rating */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-lg font-bold" style={{ color: '#ffffff' }}>{result.name}</h2>
            <button onClick={toggleFav} className="shrink-0 mt-1 w-9 h-9 flex items-center justify-center" aria-label="Favourite">
              <svg className={`w-6 h-6 ${isFav ? 'text-red-500 fill-red-500' : ''}`} style={isFav ? {} : { color: '#70767f' }} fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
          </div>
          <p className="text-xs mt-0.5" style={{ color: '#70767f' }}>{result.category}</p>
          {result.rating && (
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-sm font-bold" style={{ color: '#ffffff' }}>{result.rating.toFixed(1)}</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg key={i} className={`w-3.5 h-3.5 ${i < Math.round(result.rating!) ? 'text-amber-400' : ''}`} style={i >= Math.round(result.rating!) ? { color: '#1e2631' } : {}} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs" style={{ color: '#70767f' }}>({result.reviewCount})</span>
            </div>
          )}
          {/* Open/closed */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: result.isOpenNow ? '#10B981' : '#ef4444' }} />
            <span className="text-xs font-medium" style={{ color: result.isOpenNow ? '#10B981' : '#ef4444' }}>
              {result.isOpenNow ? 'Open now' : 'Closed'}
            </span>
          </div>
        </div>

        {/* Description (community only) */}
        {result.description && (
          <p className="text-sm leading-relaxed" style={{ color: '#a6abb5' }}>{result.description}</p>
        )}

        {/* Pricing + Availability (community only) */}
        {(result.pricingInfo || result.availability) && (
          <div className="flex gap-3">
            {result.pricingInfo && (
              <div className="flex-1 p-3 rounded-xl" style={{ background: '#0d1420', border: '1px solid #1e2631' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#70767f' }}>Pricing</p>
                <p className="text-sm font-medium mt-0.5" style={{ color: '#ffffff' }}>{result.pricingInfo}</p>
              </div>
            )}
            {result.availability && (
              <div className="flex-1 p-3 rounded-xl" style={{ background: '#0d1420', border: '1px solid #1e2631' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#70767f' }}>Availability</p>
                <p className="text-sm font-medium mt-0.5" style={{ color: '#ffffff' }}>{result.availability}</p>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {result.phone && (
            <a
              href={`tel:${result.phone}`}
              className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold"
              style={{ background: '#3D6AF2', color: '#ffffff' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
              Call
            </a>
          )}
          {result.website && (
            <a
              href={result.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold"
              style={{ background: '#1e2631', color: '#a6abb5' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
              Website
            </a>
          )}
        </div>

        {/* Contact info */}
        <div className="space-y-2.5">
          {result.address && (
            <div className="flex items-start gap-3 text-sm" style={{ color: '#a6abb5' }}>
              <svg className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#70767f' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
              <span>{result.address}</span>
            </div>
          )}
          {result.phone && (
            <div className="flex items-center gap-3 text-sm">
              <svg className="w-4 h-4 shrink-0" style={{ color: '#70767f' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
              <a href={`tel:${result.phone}`} style={{ color: '#3D6AF2' }}>{result.phone}</a>
            </div>
          )}
          {result.serviceArea && result.serviceArea.length > 0 && (
            <div className="flex items-start gap-3 text-sm" style={{ color: '#a6abb5' }}>
              <svg className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#70767f' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" /></svg>
              <span>Serves: {result.serviceArea.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Social links (community) */}
        {result.socialLinks && Object.keys(result.socialLinks).length > 0 && (
          <div className="flex gap-2">
            {Object.entries(result.socialLinks).map(([platform, url]) => (
              <a
                key={platform}
                href={url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize"
                style={{ background: '#1e2631', color: '#a6abb5' }}
              >
                {platform}
              </a>
            ))}
          </div>
        )}

        {/* Portfolio photos (community) */}
        {result.portfolioPhotos && result.portfolioPhotos.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#70767f' }}>Portfolio</p>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {result.portfolioPhotos.map((photo, i) => (
                <img key={i} src={photo} alt="" className="w-24 h-24 rounded-xl object-cover shrink-0" />
              ))}
            </div>
          </div>
        )}

        {/* Hours (Google) */}
        {hours && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#70767f' }}>Hours</p>
            <div className="space-y-1">
              {hours.display.map((line: string, i: number) => (
                <p key={i} className="text-xs" style={{ color: '#a6abb5' }}>{line}</p>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#70767f' }}>
              Reviews ({reviews.length})
            </p>
            <div className="space-y-3">
              {reviews.map((review: any, i: number) => (
                <div key={i} className="p-3 rounded-xl" style={{ background: '#0d1420', border: '1px solid #1e2631' }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold" style={{ color: '#ffffff' }}>{review.author || review.authorName || 'User'}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.rating || 0 }, (_, j) => (
                        <svg key={j} className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: '#70767f' }}>{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Write review (community only) */}
        {result.source === 'community' && (
          <div>
            {showReviewForm ? (
              <ReviewForm providerId={result.id} onDone={() => setShowReviewForm(false)} />
            ) : (
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full h-11 rounded-xl text-sm font-medium transition-colors"
                style={{ border: '1px solid #1e2631', color: '#3D6AF2' }}
              >
                Write a Review
              </button>
            )}
          </div>
        )}

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>
    </div>
  )
}
