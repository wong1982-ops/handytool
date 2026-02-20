# Workstream A: Quick Wins — Strip Dead UI & Fix Accessibility

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix 13 issues across 7 tools — remove fake features, fix accessibility, correct misleading text.

**Architecture:** Pure edits to existing client components. No new files, no new dependencies, no API changes.

**Tech Stack:** React, TypeScript, ARIA attributes

---

## Task 1: Remove VPN/Tor badges from My IP

**Files:**
- Modify: `toolk1t-client/tools/myip/tech-info-panel.tsx`
- Modify: `toolk1t-client/app/tools/myip/page.tsx`

**Step 1: Remove vpn and tor from TechInfoData interface**

In `tools/myip/tech-info-panel.tsx`, remove lines 9-10 from the interface:

```typescript
// REMOVE these two lines:
  vpn: boolean
  tor: boolean
```

**Step 2: Remove VPN and Tor FlagItems, change grid to 2-column**

In the same file, replace the Flags Row (lines 78-84):

```tsx
// BEFORE:
<div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4">
  <FlagItem label="Proxy" value={data.proxy ? 'Yes' : 'No'} variant={data.proxy ? 'danger' : 'danger'} />
  <FlagItem label="VPN" value={data.vpn ? 'Yes' : 'No'} variant={data.vpn ? 'success' : 'default'} />
  <FlagItem label="Tor" value={data.tor ? 'Yes' : 'No'} variant={data.tor ? 'danger' : 'default'} />
  <FlagItem label="Timezone" value={data.timezone} variant="default" />
</div>

// AFTER:
<div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
  <FlagItem label="Proxy" value={data.proxy ? 'Detected' : 'None'} variant={data.proxy ? 'danger' : 'success'} />
  <FlagItem label="Timezone" value={data.timezone} variant="default" />
</div>
```

Also fix the Proxy variant — currently shows `'danger'` for both true and false. Now: `'danger'` when detected, `'success'` when none.

**Step 3: Remove vpn/tor from page.tsx data mapping**

In `app/tools/myip/page.tsx`, remove the hardcoded `vpn: false, tor: false` lines (around lines 53-54).

**Step 4: Verify build**

Run: `cd toolk1t-client && npx tsc --noEmit`
Expected: 0 errors

**Step 5: Commit**

```bash
git add tools/myip/tech-info-panel.tsx app/tools/myip/page.tsx
git commit -m "fix(myip): remove fake VPN/Tor badges, fix proxy variant"
```

---

## Task 2: Remove non-functional fullscreen button from My IP map

**Files:**
- Modify: `toolk1t-client/tools/myip/live-location-panel.tsx`

**Step 1: Remove the fullscreen button**

In `tools/myip/live-location-panel.tsx`, replace lines 26-37 (the header div) with just the title:

```tsx
// BEFORE:
<div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
  <h2 className="text-slate-900 dark:text-white text-lg font-bold">Live Location</h2>
  <button
    className="text-[var(--ht-color-primary-500)] text-sm font-semibold flex items-center gap-1 hover:underline cursor-pointer"
    aria-label="Open map fullscreen"
  >
    <svg ...>...</svg>
    Fullscreen
  </button>
</div>

// AFTER:
<div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
  <h2 className="text-slate-900 dark:text-white text-lg font-bold">Live Location</h2>
</div>
```

**Step 2: Verify build**

Run: `cd toolk1t-client && npx tsc --noEmit`
Expected: 0 errors

**Step 3: Commit**

```bash
git add tools/myip/live-location-panel.tsx
git commit -m "fix(myip): remove non-functional fullscreen button from map panel"
```

---

## Task 3: Fix Speed Test silent ISP failure + metric card timing

**Files:**
- Modify: `toolk1t-client/app/tools/speedtest/page.tsx`

**Step 1: Add error handling for ISP detection**

Replace lines 28-40 (the useEffect):

```tsx
// BEFORE:
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

// AFTER:
useEffect(() => {
  fetch('/api/v1/myip')
    .then((r) => r.json())
    .then((json) => {
      if (json.data) {
        setIsp({
          ip: json.data.ip,
          isp: json.data.isp || 'Unknown ISP',
        })
      } else {
        setIsp({ ip: '', isp: 'Unknown ISP' })
      }
    })
    .catch(() => {
      setIsp({ ip: '', isp: 'Unknown ISP' })
    })
}, [])
```

**Step 2: Hide metric cards until download phase**

Replace line 75:

```tsx
// BEFORE:
{(phase !== 'idle' || result) && (

// AFTER:
{(phase === 'download' || phase === 'upload' || phase === 'complete') && (
```

This hides the metric cards during the ping phase (where they show confusing zeros).

**Step 3: Verify build**

Run: `cd toolk1t-client && npx tsc --noEmit`
Expected: 0 errors

**Step 4: Commit**

```bash
git add app/tools/speedtest/page.tsx
git commit -m "fix(speedtest): handle ISP detection failure, hide metrics until download phase"
```

---

## Task 4: Increase PDF Converter reorder button touch targets

**Files:**
- Modify: `toolk1t-client/tools/pdf-converter/file-list.tsx`

**Step 1: Increase button padding from p-0.5 to p-2**

In `tools/pdf-converter/file-list.tsx`, find the two reorder buttons (lines 145-164) and change their classes:

```tsx
// BEFORE (line 148):
className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"

// AFTER:
className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
```

Apply the same change to the second button (line 158): `p-0.5` → `p-2`.

Also increase icon size from `w-3.5 h-3.5` to `w-4 h-4` on both SVGs (lines 151, 162).

**Step 2: Verify build**

Run: `cd toolk1t-client && npx tsc --noEmit`
Expected: 0 errors

**Step 3: Commit**

```bash
git add tools/pdf-converter/file-list.tsx
git commit -m "fix(pdf-converter): increase reorder button touch targets to 44px"
```

---

## Task 5: Add confirmation before Clear in JSON Converter

**Files:**
- Modify: `toolk1t-client/app/tools/json-converter/page.tsx`

**Step 1: Add confirmation to handleClearAll**

Find `handleClearAll` (around line 318) and add a confirm dialog:

```tsx
// BEFORE:
const handleClearAll = useCallback(() => {
  setInput('')
  setOutput('')
  setActiveTab('input')
  setActiveAction(undefined)
}, [])

// AFTER:
const handleClearAll = useCallback(() => {
  if (!input && !output) return
  if (!confirm('Clear all content? This cannot be undone.')) return
  setInput('')
  setOutput('')
  setActiveTab('input')
  setActiveAction(undefined)
}, [input, output])
```

**Step 2: Verify build**

Run: `cd toolk1t-client && npx tsc --noEmit`
Expected: 0 errors

**Step 3: Commit**

```bash
git add app/tools/json-converter/page.tsx
git commit -m "fix(json-converter): add confirmation before clearing all content"
```

---

## Task 6: Fix download MIME types in JSON Converter

**Files:**
- Modify: `toolk1t-client/app/tools/json-converter/page.tsx`

**Step 1: Fix input download MIME type**

Find `handleDownloadInput` (around line 281). Replace:

```tsx
// BEFORE (line 285):
const blob = new Blob([input], { type: 'text/plain' })

// AFTER:
const mimeType = isYaml ? 'application/x-yaml' : 'application/json'
const blob = new Blob([input], { type: mimeType })
```

**Step 2: Fix output download MIME type**

Find `handleDownloadOutput` (around line 294). Replace:

```tsx
// BEFORE (line 297):
const blob = new Blob([output], { type: 'text/plain' })

// AFTER:
const mimeType = outputFormat === 'YAML' ? 'application/x-yaml' : outputFormat === 'CSV' ? 'text/csv' : 'application/json'
const blob = new Blob([output], { type: mimeType })
```

**Step 3: Verify build**

Run: `cd toolk1t-client && npx tsc --noEmit`
Expected: 0 errors

**Step 4: Commit**

```bash
git add app/tools/json-converter/page.tsx
git commit -m "fix(json-converter): use correct MIME types for download (json, yaml, csv)"
```

---

## Task 7: Fix "% today" label in Currency Exchange

**Files:**
- Modify: `toolk1t-client/tools/currency-exchange/converter-bar.tsx`

**Step 1: Change label text**

Find line 146:

```tsx
// BEFORE:
{result.changePercent >= 0 ? '+' : ''}{result.changePercent.toFixed(2)}% today

// AFTER:
{result.changePercent >= 0 ? '+' : ''}{result.changePercent.toFixed(2)}% vs yesterday
```

**Step 2: Verify build**

Run: `cd toolk1t-client && npx tsc --noEmit`
Expected: 0 errors

**Step 3: Commit**

```bash
git add tools/currency-exchange/converter-bar.tsx
git commit -m "fix(currency-exchange): correct rate change label from 'today' to 'vs yesterday'"
```

---

## Task 8: Dynamic "Convert Now" text per PDF mode

**Files:**
- Modify: `toolk1t-client/app/tools/pdf-converter/page.tsx`

**Step 1: Add a mode-to-label map and replace button text**

Add this map near the top of the component (after state declarations):

```typescript
const CONVERT_LABEL: Record<string, string> = {
  'pdf-to-images': 'Convert to Images',
  'images-to-pdf': 'Create PDF',
  'merge-pdf': 'Merge Files',
  'split-pdf': 'Split PDF',
  'compress-pdf': 'Compress PDF',
  'pdf-to-word': 'Convert to Word',
  'word-to-pdf': 'Convert to PDF',
  'pdf-to-excel': 'Convert to Excel',
}
```

Then find line 323 (`Convert Now`) and replace:

```tsx
// BEFORE:
Convert Now

// AFTER:
{CONVERT_LABEL[activeMode] || 'Convert Now'}
```

**Step 2: Verify build**

Run: `cd toolk1t-client && npx tsc --noEmit`
Expected: 0 errors

**Step 3: Commit**

```bash
git add app/tools/pdf-converter/page.tsx
git commit -m "fix(pdf-converter): dynamic convert button text per conversion mode"
```

---

## Task 9: Add ARIA tab semantics to Swagger Editor mobile tabs

**Files:**
- Modify: `toolk1t-client/app/tools/swagger-editor/page.tsx`

**Step 1: Add role="tablist" to tab container**

Find the mobile tab container (around line 256):

```tsx
// BEFORE:
<div className="flex p-0.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg w-full">

// AFTER:
<div className="flex p-0.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg w-full" role="tablist" aria-label="Editor navigation">
```

**Step 2: Add role="tab" and aria-selected to each button**

Find the button inside the map (around line 258-265):

```tsx
// BEFORE:
<button
  key={tab}
  onClick={() => setActiveTab(tab)}
  className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer capitalize flex items-center justify-center gap-1.5 ${
    activeTab === tab
      ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
      : 'text-slate-500 dark:text-slate-400'
  }`}
>

// AFTER:
<button
  key={tab}
  role="tab"
  aria-selected={activeTab === tab}
  onClick={() => setActiveTab(tab)}
  className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer capitalize flex items-center justify-center gap-1.5 ${
    activeTab === tab
      ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
      : 'text-slate-500 dark:text-slate-400'
  }`}
>
```

**Step 3: Add aria-live to validation badge**

Find the validation badge (around line 232-241):

```tsx
// BEFORE:
{isValid !== null && (
  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border ${

// AFTER:
{isValid !== null && (
  <div role="status" aria-live="polite" className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border ${
```

**Step 4: Verify build**

Run: `cd toolk1t-client && npx tsc --noEmit`
Expected: 0 errors

**Step 5: Commit**

```bash
git add app/tools/swagger-editor/page.tsx
git commit -m "fix(swagger-editor): add ARIA tab semantics and live validation status"
```

---

## Task 10: Add role="alert" to PDF Converter error state

**Files:**
- Modify: `toolk1t-client/tools/pdf-converter/file-list.tsx`

**Step 1: Find the error display in FileList**

Search for where `processing.error` is rendered. Add `role="alert"` and `aria-live="assertive"` to the error container:

```tsx
// When you find the error display element, add:
role="alert" aria-live="assertive"
```

If the error is displayed inline (e.g., in a `<p>` or `<div>`), wrap it:

```tsx
{processing.error && (
  <div role="alert" aria-live="assertive" className="...existing classes...">
    {processing.error}
  </div>
)}
```

**Step 2: Verify build**

Run: `cd toolk1t-client && npx tsc --noEmit`
Expected: 0 errors

**Step 3: Commit**

```bash
git add tools/pdf-converter/file-list.tsx
git commit -m "fix(pdf-converter): add role=alert to error state for screen readers"
```

---

## Summary

| Task | Tool | Fix | Commit message |
|------|------|-----|----------------|
| 1 | My IP | Remove VPN/Tor badges, fix proxy variant | `fix(myip): remove fake VPN/Tor badges, fix proxy variant` |
| 2 | My IP | Remove dead fullscreen button | `fix(myip): remove non-functional fullscreen button from map panel` |
| 3 | Speed Test | ISP error handling + metric card timing | `fix(speedtest): handle ISP detection failure, hide metrics until download phase` |
| 4 | PDF Converter | Reorder button touch targets | `fix(pdf-converter): increase reorder button touch targets to 44px` |
| 5 | JSON Converter | Clear confirmation | `fix(json-converter): add confirmation before clearing all content` |
| 6 | JSON Converter | Download MIME types | `fix(json-converter): use correct MIME types for download` |
| 7 | Currency Exchange | "% today" → "vs yesterday" | `fix(currency-exchange): correct rate change label` |
| 8 | PDF Converter | Dynamic convert button text | `fix(pdf-converter): dynamic convert button text per conversion mode` |
| 9 | Swagger Editor | ARIA tabs + live validation | `fix(swagger-editor): add ARIA tab semantics and live validation status` |
| 10 | PDF Converter | Error role="alert" | `fix(pdf-converter): add role=alert to error state` |
