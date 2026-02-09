# Plan: ID Photo Editor Tool

**Date:** 2026-02-10
**BA:** Claude (AI)
**Status:** DEV COMPLETE

## Overview

Build an ID Photo Editor tool from `designs/6.IDPhoto`. Four design screens provided — we combine the best elements from all into a unified 3-panel editor. Users upload a photo, select an ID format (passport/visa), adjust alignment guides, tweak brightness/contrast, pick background color, and download the result.

This tool is **fully client-side** — image editing uses Canvas API + CSS filters. No server-side AI. Face detection/background removal are simulated UI states.

## Design Reference

- `screen.png` (Design 1) — Full 3-panel editor: left presets, center canvas with guides, right print preview
- `screen_1.png` (Design 2) — Alignment wizard with compliance checklist
- `screen_2.png` (Design 3) — Editor suite with AI enhancements panel
- `screen_3.png` (Design 4) — Simple editor with background color picker + export settings

## Design Analysis — Combined Features

### From Design 1 (Primary Layout)
- 3-panel layout: left sidebar, center canvas, right panel
- Format presets: US Passport, UK Visa, Schengen Visa, Driving License
- Country search input
- Adjustments: Brightness/Contrast sliders
- Photo canvas with guide overlay (TOP OF HEAD, EYE LINE, CHIN LEVEL)
- Oval face mask with center vertical line
- Floating zoom/rotate controls
- Bottom bar: Face Detected badge, Head size, Reset, Download
- Print preview grid (2x3 thumbnails on 4x6 sheet)
- "Generate Print Layout" button

### From Design 4 (Key Additions)
- Background Color picker: White, Blue, Grey, Custom
- Export Settings: Digital ID Photo vs Printable 4"x6" Sheet
- "DOWNLOAD PHOTO" primary action
- Progress hint / validation status

### From Design 2 (Compliance UI)
- Compliance checklist items (simplified)

### Dependencies
- No additional npm packages needed
- Uses Canvas API for image rendering, CSS filters for brightness/contrast

## Task Breakdown

### UI Tasks

| # | Task | Description | Depends On |
|---|------|-------------|------------|
| U1 | Create format-sidebar | Left sidebar: search input, format presets list (US Passport, UK Visa, Schengen Visa, Driving License), adjustments (brightness/contrast sliders), "Generate Print Layout" button | — |
| U2 | Create photo-canvas | Center area: drag-drop/file-pick upload zone (empty state), photo display with guide overlay (TOP OF HEAD, EYE LINE, CHIN LEVEL, center vertical, oval mask), floating zoom controls, bottom action bar | — |
| U3 | Create settings-panel | Right panel: background color picker (White/Blue/Grey/Custom), export settings radios (Digital/Print), print preview grid, paper size dropdown, download button | — |
| U4 | Create id-photo page | Compose page: breadcrumb, 3-panel layout, state management (image, format, adjustments, bg color, export mode). File input + FileReader, CSS filter application. | U1, U2, U3 |
| U5 | Add to homepage grid | Add "ID Photo Editor" to `lib/tools.tsx` | U4 |

## ID Format Presets

| Format | Dimensions | Aspect |
|--------|-----------|--------|
| US Passport | 2 × 2 in (51 × 51 mm) | 1:1 |
| UK Visa | 35 × 45 mm | 7:9 |
| Schengen Visa | 35 × 45 mm | 7:9 |
| Driving License | Standard Card (ID-1) | 3:4 |

## Acceptance Criteria

- [ ] Page renders at `/tools/id-photo`
- [ ] Empty state with drag-drop/file-pick upload area
- [ ] Photo displays after upload with guide overlay lines
- [ ] Format presets change aspect ratio and dimension labels
- [ ] Brightness/Contrast sliders apply CSS filters in real-time
- [ ] Background color picker (White, Blue, Grey, Custom)
- [ ] Export settings: Digital vs Printable sheet
- [ ] Download button generates photo file
- [ ] Print preview shows tiled thumbnails
- [ ] Floating zoom in/out controls
- [ ] Bottom bar shows mock face detection status
- [ ] Responsive: panels collapse on mobile
- [ ] Breadcrumb navigation present
- [ ] Build passes (`pnpm build`)
- [ ] Tool appears on homepage grid
