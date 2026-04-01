'use client'
import { use, useState, useRef, useEffect } from 'react'
import { SlotsProvider, useSlots } from '@/tools/slots/slots-provider'
import { getGameById } from '@/tools/slots/games'
import { ReelBoard } from '@/tools/slots/components/machine/reel-board'
import { GameHud } from '@/tools/slots/components/machine/game-hud'
import { JackpotTickers } from '@/tools/slots/components/machine/jackpot-tickers'
import { BonusMeter } from '@/tools/slots/components/machine/bonus-meter'
import { SpinControls } from '@/tools/slots/components/machine/spin-controls'
import { PaytableModal } from '@/tools/slots/components/machine/paytable-modal'
import { AutoSpinDialog } from '@/tools/slots/components/machine/auto-spin-dialog'
import { BonusOverlay } from '@/tools/slots/components/bonus/bonus-overlay'
import { FreeSpinsBonus } from '@/tools/slots/components/bonus/free-spins-bonus'
import { PickPrizeBonus } from '@/tools/slots/components/bonus/pick-prize-bonus'
import { WheelBonus } from '@/tools/slots/components/bonus/wheel-bonus'
import { ExpandingWildsBonus } from '@/tools/slots/components/bonus/expanding-wilds-bonus'
import { CoinShower, type CoinShowerRef } from '@/tools/slots/components/effects/coin-shower'
import { Fireworks, type FireworksRef } from '@/tools/slots/components/effects/fireworks'
import { WinBanner } from '@/tools/slots/components/effects/win-banner'
import { useSpin } from '@/tools/slots/hooks/use-spin'
import type { BonusType, BonusProps, WinTier, SlotGameConfig } from '@/tools/slots/slots-types'
import { getWinTier } from '@/tools/slots/slots-types'
import Link from 'next/link'

const BONUS_COMPONENTS: Record<BonusType, React.ComponentType<BonusProps>> = {
  free_spins: FreeSpinsBonus,
  pick_prize: PickPrizeBonus,
  wheel: WheelBonus,
  expanding_wilds: ExpandingWildsBonus,
}

function GameNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] bg-black text-white">
      <p className="text-lg mb-4">Game not found</p>
      <Link href="/tools/slots" className="text-[#d4a052] hover:underline">Back to Lobby</Link>
    </div>
  )
}

function GameInner({ gameId }: { gameId: string }) {
  const config = getGameById(gameId)

  if (!config) return <GameNotFound />

  return <GamePlayer config={config} />
}

function GamePlayer({ config }: { config: SlotGameConfig }) {
  const { player } = useSlots()
  const [betPerLine, setBetPerLine] = useState(10)
  const [showPaytable, setShowPaytable] = useState(false)
  const [showAutoSpin, setShowAutoSpin] = useState(false)
  const [showBonusOverlay, setShowBonusOverlay] = useState(false)
  const [showStore, setShowStore] = useState(false)

  const coinShowerRef = useRef<CoinShowerRef>(null)
  const fireworksRef = useRef<FireworksRef>(null)
  const [winBannerVisible, setWinBannerVisible] = useState(false)
  const [lastWinTier, setLastWinTier] = useState<WinTier>('none')
  const [lastWinAmount, setLastWinAmount] = useState(0)

  // Track scatter count for bonus meter
  const [recentScatters, setRecentScatters] = useState(0)

  const {
    spinning, result, bonusActive, totalBet,
    doSpin, onAllReelsStopped, onBonusComplete, jackpotWin,
  } = useSpin({ config, betPerLine })

  const lines = config.useWays ? 243 : config.paylines.length
  const calculatedTotalBet = config.useWays ? betPerLine * 25 : betPerLine * lines
  const canSpin = player.coins >= calculatedTotalBet && !spinning
  const betIndex = config.betSteps.indexOf(betPerLine)

  const handleAllReelsStopped = () => {
    onAllReelsStopped()

    // Update scatter count for meter
    if (result?.scatterCount) {
      setRecentScatters(result.scatterCount)
    } else {
      setRecentScatters(prev => Math.max(0, prev - 1)) // decay
    }

    // Handle wins
    if (result?.totalWin && result.totalWin > 0) {
      const tier = getWinTier(result.totalWin, totalBet)
      setLastWinTier(tier)
      setLastWinAmount(result.totalWin)
      if (tier === 'medium' || tier === 'big') {
        coinShowerRef.current?.fire('big')
        setWinBannerVisible(true)
      } else if (tier === 'mega') {
        coinShowerRef.current?.fire('mega')
        fireworksRef.current?.fire()
        setWinBannerVisible(true)
      }
    }

    if (result?.bonusTriggered) {
      setShowBonusOverlay(true)
    }
  }

  // Handle jackpot win
  useEffect(() => {
    if (jackpotWin) {
      setLastWinAmount(jackpotWin.amount)
      setLastWinTier('mega')
      coinShowerRef.current?.fire('mega')
      fireworksRef.current?.fire()
      setWinBannerVisible(true)
    }
  }, [jackpotWin])

  const BonusComponent = BONUS_COMPONENTS[config.bonusConfig.type]

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[70]">
      {/* Portrait container */}
      <div className="w-full sm:w-[420px] lg:w-[480px] max-w-full h-[100dvh] relative overflow-hidden">
        {/* Background */}
        {config.theme.backgroundImage && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${config.theme.backgroundImage})` }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: config.theme.backgroundColor || '#0d0519',
            opacity: config.theme.backgroundImage ? 0.3 : 1,
          }}
        />

        {/* Content stack */}
        <div className="relative z-10 flex flex-col h-full">
          {/* HUD — top */}
          <div className="pt-2">
            <GameHud
              onBack={() => { window.location.href = '/tools/slots' }}
              onStore={() => setShowStore(true)}
            />
          </div>

          {/* Jackpot tickers */}
          <div className="mt-12 mb-2">
            <JackpotTickers />
          </div>

          {/* Bonus meter (free-spin games only) */}
          {config.theme.meterName && (
            <div className="mb-2">
              <BonusMeter
                meterName={config.theme.meterName}
                scatterCount={recentScatters}
                triggerCount={config.bonusConfig.triggerCount}
                accentColor={config.theme.cabinetAccent}
              />
            </div>
          )}

          {/* Reel board — center, takes available space */}
          <div className="flex-1 flex items-center justify-center px-2">
            <div className="w-full max-w-[400px] relative">
              <ReelBoard
                config={config}
                result={result}
                spinning={spinning}
                onAllReelsStopped={handleAllReelsStopped}
              />
            </div>
          </div>

          {/* Spin controls — bottom */}
          <SpinControls
            totalBet={calculatedTotalBet}
            totalWin={lastWinAmount}
            onSpin={doSpin}
            onIncreaseBet={() => { if (betIndex < config.betSteps.length - 1) setBetPerLine(config.betSteps[betIndex + 1]) }}
            onDecreaseBet={() => { if (betIndex > 0) setBetPerLine(config.betSteps[betIndex - 1]) }}
            onMaxBet={() => setBetPerLine(config.betSteps[config.betSteps.length - 1])}
            onOpenPaytable={() => setShowPaytable(true)}
            spinning={spinning}
            canSpin={canSpin}
            canDecrease={betIndex > 0}
            canIncrease={betIndex < config.betSteps.length - 1}
          />
        </div>

        {/* Effects layer */}
        <div className="absolute inset-0 pointer-events-none z-20">
          <CoinShower ref={coinShowerRef} />
          <Fireworks ref={fireworksRef} />
          <WinBanner
            tier={lastWinTier}
            amount={lastWinAmount}
            visible={winBannerVisible}
            onDismiss={() => setWinBannerVisible(false)}
          />
        </div>

        {/* Modals */}
        <PaytableModal config={config} open={showPaytable} onClose={() => setShowPaytable(false)} />
        <AutoSpinDialog open={showAutoSpin} onClose={() => setShowAutoSpin(false)} onStart={() => {}} />

        {/* Bonus */}
        <BonusOverlay visible={showBonusOverlay} onAnimationComplete={() => setShowBonusOverlay(false)} />
        {bonusActive && (
          <BonusComponent
            config={config}
            triggerScatterCount={result?.scatterCount || 3}
            betAmount={betPerLine}
            onComplete={onBonusComplete}
          />
        )}

        {/* Store modal */}
        {showStore && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" onClick={() => setShowStore(false)}>
            <div className="w-[400px] max-w-[90vw] max-h-[80vh] overflow-y-auto bg-[#1a0a2e] rounded-2xl p-4" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">Coin Shop</h2>
                <button onClick={() => setShowStore(false)} className="text-white/60 text-xl">&times;</button>
              </div>
              {[
                { name: 'Starter', coins: '100,000', price: '$0.99' },
                { name: 'Popular', coins: '550,000', price: '$3.99' },
                { name: 'Best Value', coins: '1,800,000', price: '$9.99' },
                { name: 'High Roller', coins: '6,500,000', price: '$24.99' },
                { name: 'Whale', coins: '22,500,000', price: '$49.99' },
              ].map(pack => (
                <div
                  key={pack.name}
                  className="flex items-center justify-between p-3 mb-2 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, #2d1052, #1a0a2e)',
                    border: '1px solid rgba(212,160,82,0.2)',
                  }}
                >
                  <div>
                    <div className="text-sm font-medium text-white">{pack.name}</div>
                    <div className="text-lg font-bold" style={{ color: '#f0d080' }}>&#x1FA99; {pack.coins}</div>
                  </div>
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-bold"
                    style={{ background: '#22c55e', color: 'white' }}
                  >
                    {pack.price}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SlotGamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = use(params)
  return (
    <SlotsProvider>
      <GameInner gameId={gameId} />
    </SlotsProvider>
  )
}
