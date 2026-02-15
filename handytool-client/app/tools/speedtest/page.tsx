'use client'

import { useState, useEffect } from 'react'
import { ServerInfoBar } from '@/tools/speedtest/server-info-bar'
import { SpeedGauge } from '@/tools/speedtest/speed-gauge'
import { MetricCards } from '@/tools/speedtest/metric-cards'
import { StabilityGraph } from '@/tools/speedtest/stability-graph'
import { SpeedFooter } from '@/tools/speedtest/speed-footer'
import { useSpeedTest, type TestPhase } from '@/tools/speedtest/use-speed-test'

interface IspInfo {
  ip: string
  isp: string
}

const STATUS_TEXT: Record<TestPhase, string> = {
  idle: 'Press GO to start test',
  ping: 'Testing Latency...',
  download: 'Testing Download Speed...',
  upload: 'Testing Upload Speed...',
  complete: 'Test Complete',
}

export default function SpeedTestPage() {
  const { phase, currentSpeed, result, start, stop } = useSpeedTest()
  const [isp, setIsp] = useState<IspInfo | null>(null)

  useEffect(() => {
    fetch('/api/v1/myip')
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setIsp({
            ip: json.data.ip,
            isp: json.data.isp || 'Unknown ISP',
          })
        }
      })
      .catch(() => { /* ignore */ })
  }, [])

  const isRunning = phase !== 'idle' && phase !== 'complete'
  const gaugeSpeed = phase === 'complete'
    ? (result?.download ?? 0)
    : currentSpeed

  const handleStartStop = () => {
    if (isRunning) stop()
    else start()
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-start py-8 md:py-4 px-4 max-w-7xl mx-auto w-full">
      <nav aria-label="Breadcrumb" className="w-full mb-6 md:mb-3">
        <ol className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          <li><a href="/tools" className="hover:text-[var(--ht-color-primary-500)] transition-colors">Home</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-slate-900 dark:text-white font-medium">Speed Test</li>
        </ol>
      </nav>

      <ServerInfoBar
        ispName={isp?.isp ?? 'Detecting...'}
        ispIp={isp?.ip ?? ''}
      />

      <SpeedGauge
        speed={gaugeSpeed}
        maxSpeed={1000}
        status={STATUS_TEXT[phase]}
        isRunning={isRunning}
        onStart={handleStartStop}
      />

      {(phase !== 'idle' || result) && (
        <MetricCards
          download={{
            speed: phase === 'complete' ? (result?.download ?? 0) : (phase === 'download' ? currentSpeed : 0),
            maxSpeed: 1000,
          }}
          upload={{
            speed: phase === 'complete' ? (result?.upload ?? 0) : (phase === 'upload' ? currentSpeed : 0),
            maxSpeed: 1000,
          }}
          latency={{
            ping: result?.ping ?? 0,
            jitter: result?.jitter ?? 0,
          }}
        />
      )}

      {phase === 'complete' && result && (
        <StabilityGraph
          downloadSamples={result.downloadSamples}
          uploadSamples={result.uploadSamples}
        />
      )}

      {phase === 'complete' && <SpeedFooter />}
    </main>
  )
}
