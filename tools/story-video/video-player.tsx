'use client'

import { useRef, useState } from 'react'
import type { StoryVideoJob } from '@/tools/story-video/types'

interface VideoPlayerProps {
  job: StoryVideoJob
}

export default function VideoPlayer({ job }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showScenes, setShowScenes] = useState(false)

  if (!job.artifacts.finalVideo) return null

  const scenes = job.scene_status.filter((s) => s.status === 'done' && s.clipUrl)

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium text-[#a6abb5]">Preview</h2>

      {/* Video Player */}
      <div className="rounded-xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={job.artifacts.finalVideo}
          poster={job.artifacts.thumbnail}
          controls
          className="w-full aspect-video"
          preload="metadata"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <a
          href={job.artifacts.finalVideo}
          download={`${job.book_title}-video.mp4`}
          className="
            bg-emerald-600 hover:bg-emerald-500 text-white font-semibold
            rounded-xl min-h-[44px] px-4 py-2 text-sm cursor-pointer
            inline-flex items-center gap-1.5 transition-colors
          "
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download Video
        </a>

        {scenes.length > 0 && (
          <button
            type="button"
            onClick={() => setShowScenes(!showScenes)}
            className="
              border border-[#1e2631] text-[#a6abb5] hover:text-white hover:bg-[#1e2631]
              font-semibold rounded-xl min-h-[44px] px-4 py-2 text-sm cursor-pointer
              inline-flex items-center gap-1.5 transition-colors
            "
          >
            <svg
              className={`w-4 h-4 transition-transform ${showScenes ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
            Scene Clips ({scenes.length})
          </button>
        )}
      </div>

      {/* Scene Clips List */}
      {showScenes && scenes.length > 0 && (
        <div className="space-y-2">
          {scenes.map((scene) => (
            <div
              key={scene.index}
              className="flex items-center justify-between rounded-xl bg-[#131a23] border border-[#1e2631] p-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-[#70767f] text-xs font-mono w-8">
                  #{scene.index + 1}
                </span>
                <span className="text-white text-sm">Scene {scene.index + 1}</span>
              </div>
              {scene.clipUrl && (
                <a
                  href={scene.clipUrl}
                  download={`scene-${scene.index + 1}.mp4`}
                  className="text-[#3D6AF2] text-xs font-semibold hover:underline cursor-pointer min-h-[44px] flex items-center px-2"
                >
                  Download
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
