# Plan: Speed Test Tool

**Date:** 2026-02-10
**BA:** Claude (AI)
**Status:** DEV COMPLETE

## Overview

Build the "Speed Test" tool page from the `designs/speedtest` mockup. This tool simulates an internet speed test with a circular gauge/speedometer, download/upload/latency metrics, and a connection stability graph. The design has a distinctive dark tech aesthetic with cyan (#25d1f4) as primary, glow effects, and a dot-pattern background.

## Design Reference

- Screenshot: `designs/speedtest/screen.png`
- HTML reference: `designs/speedtest/code.html`

## Design Analysis

### Layout Structure (top to bottom)
1. **Header** — Shared app header (reuse existing `components/layout/header.tsx`)
2. **Server Info Bar** — Two cards: "Current Server" (with Change button) + "Internet Service Provider" (with IP)
3. **Speed Gauge** — Central SVG circular speedometer with speed value, "Mbps" unit, pulsing "GO" button, background glow
4. **Test Status** — Status label with pulsing indicator dot
5. **Metric Cards** — 3-column grid: Download (cyan), Upload (green), Latency/Jitter (amber)
6. **Stability Graph** — SVG area/line chart with Download (solid cyan) and Upload (dashed green) lines, Y-axis labels, legend
7. **Speed Footer** — Global Rank, Network Type, Share Results, Export PDF buttons, copyright

### Visual Style
- Dark-first aesthetic: `bg-[#0b0e14]` base, cards `bg-[#16222a]`
- Primary cyan: `#25d1f4` (maps to our `--ht-color-secondary-*` tokens / direct Tailwind)
- Dot-pattern background (radial gradient pattern)
- Glow/shadow effects: `drop-shadow`, `box-shadow` with cyan
- Progress bars: thin 1px-height bars with glow
- Gauge: SVG circle with `stroke-dasharray` animation
- Tabular nums for metrics display
- Cards: `rounded-xl`, `border border-white/5`

### Components to Reuse
- `components/layout/header.tsx` — existing shared header

### New Components Needed
- `tools/speedtest/server-info-bar.tsx` — Two info cards (server + ISP)
- `tools/speedtest/speed-gauge.tsx` — SVG circular speedometer + GO button + speed display
- `tools/speedtest/metric-cards.tsx` — 3-col grid: Download, Upload, Latency
- `tools/speedtest/stability-graph.tsx` — SVG line chart with legend
- `tools/speedtest/speed-footer.tsx` — Custom footer with rank, network type, actions

## Task Breakdown

### UI Tasks

| # | Task | Description | Depends On | Assigned To |
|---|------|-------------|------------|-------------|
| U1 | Create server-info-bar | Two side-by-side cards: Current Server (location + provider + Change btn) and ISP (name + IP). Responsive: stack on mobile. | — | Dev |
| U2 | Create speed-gauge | SVG circular gauge with gradient arc, large speed value (7xl→9xl), "Mbps" unit, pulsing GO button (rounded, glow shadow), background blur glow. Accept speed value + max as props. | — | Dev |
| U3 | Create metric-cards | 3-column grid: Download (cyan, arrow down), Upload (emerald, arrow up), Latency (amber, equalizer icon) with jitter sub-metric. Each card has: icon label header, large value + unit, progress bar. Background watermark icon on hover. | — | Dev |
| U4 | Create stability-graph | SVG chart: download line (solid cyan with fill gradient), upload line (dashed green). Y-axis labels (0M, 500M, 1Gbps). Header with title + legend dots. Accept data points as props. | — | Dev |
| U5 | Create speed-footer | Custom footer: Global Rank (primary color), Network Type, Share Results button, Export PDF button, copyright text. Responsive layout. | — | Dev |
| U6 | Create speedtest page route | Compose `app/tools/speedtest/page.tsx`: breadcrumb, server info, gauge, test status, metrics, graph, footer. Wire mock data. Add loading skeleton + idle/testing/complete states. Dark background style. | U1–U5 | Dev |
| U7 | Add speedtest to homepage grid | Add "Speed Test" tool entry to homepage at `app/page.tsx`. | U6 | Dev |

### API Tasks

None — UI-only with mock data. API integration is a future task.

## Mock Data

```typescript
const mockData = {
  server: { location: 'New York City', provider: 'Verizon Fios' },
  isp: { name: 'Comcast Xfinity', ip: '192.168.1.1' },
  currentSpeed: 482,
  maxSpeed: 1000,
  download: { speed: 842.1, maxSpeed: 1000 },
  upload: { speed: 42.5, maxSpeed: 100 },
  latency: { ping: 12, jitter: 2 },
  testStatus: 'Testing Download Speed...',
  globalRank: 'Top 12%',
  networkType: 'Fiber Optic',
  graphData: {
    download: [80, 40, 30, 50, 20, 35],
    upload: [90, 88, 82, 89, 85],
  },
}
```

## Acceptance Criteria

- [ ] Page renders at `/tools/speedtest` matching the design
- [ ] Circular SVG gauge displays speed value with gradient arc
- [ ] GO button has pulse animation and hover/active states
- [ ] Test status with pulsing indicator dot
- [ ] 3 metric cards show Download, Upload, Latency with progress bars
- [ ] Latency card includes Jitter sub-metric
- [ ] Stability graph renders SVG lines with legend
- [ ] Server info bar shows current server + ISP with Change button
- [ ] Footer shows rank, network type, Share/Export buttons
- [ ] Dark theme styling with cyan glow effects
- [ ] Responsive: stacks to single column on mobile
- [ ] Breadcrumb navigation present (Home / Tools / Speed Test)
- [ ] Accessibility: semantic HTML, aria labels, keyboard navigable
- [ ] Build passes (`pnpm build`)
- [ ] Speed Test tool appears on homepage grid

## Notes

- The design uses "SpeedTestPro" branding but our app is "Toolk1t" — we keep shared header
- The design's primary cyan (#25d1f4) is close to our secondary tokens — use CSS vars where possible
- The dark theme is inherent to this tool's aesthetic, not the global theme toggle
- The dot-pattern background and gauge glow effects are tool-specific styles
- SVG gauge progress is controlled by `stroke-dasharray` — proportion of arc filled
- Graph is static SVG for now (no charting library needed for mock)
