'use client'

interface TransportBarProps {
  status: 'idle' | 'connecting' | 'playing' | 'paused' | 'error'
  isRecording: boolean
  recordingDuration: number
  clipCount: number
  maxClips: number
  onConnect: () => void
  onPlay: () => void
  onPause: () => void
  onStartRecording: () => void
  onStopRecording: () => void
  onDisconnect: () => void
}

function formatDuration(d: number): string {
  return (
    Math.floor(d / 60)
      .toString()
      .padStart(2, '0') +
    ':' +
    (d % 60).toString().padStart(2, '0')
  )
}

/* ─── Inline SVG Icons ─── */

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36A1 1 0 008 5.14z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

export function TransportBar({
  status,
  isRecording,
  recordingDuration,
  clipCount,
  maxClips,
  onConnect,
  onPlay,
  onPause,
  onStartRecording,
  onStopRecording,
  onDisconnect,
}: TransportBarProps) {
  /* ─── Idle ─── */
  if (status === 'idle') {
    return (
      <div className="flex items-center justify-center py-4">
        <button
          onClick={onConnect}
          className="min-h-[44px] cursor-pointer rounded-full bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Start Session
        </button>
      </div>
    )
  }

  /* ─── Connecting ─── */
  if (status === 'connecting') {
    return (
      <div className="flex items-center justify-center gap-2 py-4 text-sm text-[#a6abb5]">
        <SpinnerIcon />
        <span>Connecting...</span>
      </div>
    )
  }

  /* ─── Error ─── */
  if (status === 'error') {
    return (
      <div className="flex items-center justify-center gap-3 py-4">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
        <span className="text-sm text-red-400">Connection error</span>
        <button
          onClick={onConnect}
          className="min-h-[44px] cursor-pointer rounded-full border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
        >
          Retry
        </button>
      </div>
    )
  }

  /* ─── Connected (playing | paused) ─── */
  const isConnectedPlaying = status === 'playing'

  return (
    <div className="flex items-center justify-between px-4 py-3">
      {/* Left: status */}
      <div className="flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            isConnectedPlaying ? 'bg-green-500' : 'bg-yellow-500'
          }`}
        />
        <span className="text-xs font-medium text-[#a6abb5]">Connected</span>
      </div>

      {/* Center: controls */}
      <div className="flex items-center gap-3">
        {/* Play / Pause */}
        <button
          onClick={isConnectedPlaying ? onPause : onPlay}
          className="flex h-12 w-12 min-h-[44px] cursor-pointer items-center justify-center rounded-full bg-[#3D6AF2] text-white transition-opacity hover:opacity-90"
          aria-label={isConnectedPlaying ? 'Pause' : 'Play'}
        >
          {isConnectedPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        {/* Record */}
        <button
          onClick={isRecording ? onStopRecording : onStartRecording}
          className={`relative flex h-12 w-12 min-h-[44px] cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-90 ${
            isRecording
              ? 'bg-red-500 text-white'
              : 'bg-red-500/20 text-red-400'
          }`}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {/* Pulsing ring when recording */}
          {isRecording && (
            <span className="absolute inset-0 animate-pulse rounded-full ring-2 ring-red-500/50" />
          )}
          <span
            className={`block rounded-full ${
              isRecording ? 'h-4 w-4 rounded-sm bg-white' : 'h-4 w-4 bg-red-400'
            }`}
          />
        </button>

        {/* Stop / Disconnect */}
        <button
          onClick={onDisconnect}
          className="flex h-12 w-12 min-h-[44px] cursor-pointer items-center justify-center rounded-full bg-[#131a23] text-[#a6abb5] transition-colors hover:bg-[#1e2631] hover:text-white"
          aria-label="Stop session"
        >
          <StopIcon />
        </button>
      </div>

      {/* Right: timer + clip count */}
      <div className="flex items-center gap-3">
        <span
          className={`font-mono text-sm ${
            isRecording ? 'text-red-400' : 'text-[#a6abb5]'
          }`}
        >
          {formatDuration(recordingDuration)}
        </span>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-[#a6abb5]">
          {clipCount}/{maxClips}
        </span>
      </div>
    </div>
  )
}
