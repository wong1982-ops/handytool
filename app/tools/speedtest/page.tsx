'use client'

import { useState, useCallback } from 'react'
import { ServerInfoBar } from '@/tools/speedtest/server-info-bar'
import { SpeedGauge } from '@/tools/speedtest/speed-gauge'
import { MetricCards } from '@/tools/speedtest/metric-cards'
import { StabilityGraph } from '@/tools/speedtest/stability-graph'
import { SpeedFooter } from '@/tools/speedtest/speed-footer'

interface SpeedTestData {
  server: { location: string; provider: string }
  isp: { name: string; ip: string }
  currentSpeed: number
  maxSpeed: number
  download: { speed: number; maxSpeed: number }
  upload: { speed: number; maxSpeed: number }
  latency: { ping: number; jitter: number }
  globalRank: string
  networkType: string
}

const mockData: SpeedTestData = {
  server: { location: 'New York City', provider: 'Verizon Fios' },
  isp: { name: 'Comcast Xfinity', ip: '192.168.1.1' },
  currentSpeed: 482,
  maxSpeed: 1000,
  download: { speed: 842.1, maxSpeed: 1000 },
  upload: { speed: 42.5, maxSpeed: 100 },
  latency: { ping: 12, jitter: 2 },
  globalRank: 'Top 12%',
  networkType: 'Fiber Optic',
}

type TestState = 'idle' | 'running' | 'complete'

export default function SpeedTestPage() {
  const [testState, setTestState] = useState<TestState>('complete')
  const [data] = useState<SpeedTestData>(mockData)

  const statusText = {
    idle: 'Press GO to start test',
    running: 'Testing Download Speed...',
    complete: 'Test Complete',
  }

  const handleStart = useCallback(() => {
    if (testState === 'running') {
      setTestState('complete')
    } else {
      setTestState('running')
      // TODO: Simulate speed test progression
      setTimeout(() => setTestState('complete'), 3000)
    }
  }, [testState])

  return (
    <main className="flex-1 flex flex-col items-center justify-start py-10 px-4 max-w-7xl mx-auto w-full">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="w-full mb-8">
        <ol className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          <li><a href="/tools" className="hover:text-[var(--ht-color-primary-500)] transition-colors">Home</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-slate-900 dark:text-white font-medium">Speed Test</li>
        </ol>
      </nav>

      {/* Server Info Bar */}
      <ServerInfoBar
        serverLocation={data.server.location}
        serverProvider={data.server.provider}
        ispName={data.isp.name}
        ispIp={data.isp.ip}
      />

      {/* Speed Gauge */}
      <SpeedGauge
        speed={testState === 'idle' ? 0 : data.currentSpeed}
        maxSpeed={data.maxSpeed}
        status={statusText[testState]}
        isRunning={testState === 'running'}
        onStart={handleStart}
      />

      {/* Metric Cards */}
      {testState !== 'idle' && (
        <MetricCards
          download={testState === 'running' ? { speed: data.currentSpeed, maxSpeed: data.download.maxSpeed } : data.download}
          upload={data.upload}
          latency={data.latency}
        />
      )}

      {/* Stability Graph */}
      {testState === 'complete' && <StabilityGraph />}

      {/* Footer */}
      {testState === 'complete' && (
        <SpeedFooter
          globalRank={data.globalRank}
          networkType={data.networkType}
        />
      )}
    </main>
  )
}
