# PDF Converter — Real Client-Side Processing

**Date**: 2026-02-11
**Status**: Approved
**Scope**: Replace simulated PDF conversion with real client-side processing

## Modes

| Mode | Input | Output | Library |
|------|-------|--------|---------|
| PDF to Images | 1 PDF | ZIP of PNGs | pdfjs-dist + jszip |
| Images to PDF | Multiple images | 1 PDF | pdf-lib |
| Merge PDF | Multiple PDFs | 1 merged PDF | pdf-lib |
| Split PDF | 1 PDF + page ranges | ZIP of PDFs | pdf-lib + jszip |
| Compress PDF | 1 PDF | 1 smaller PDF | pdf-lib |

## Dependencies

- `pdf-lib` — PDF creation & manipulation
- `pdfjs-dist` — PDF rendering to canvas
- `jszip` — Bundle multiple outputs into ZIP

## UX Flow

1. User selects mode from sidebar
2. User uploads file(s) via drag-drop or file picker
3. User configures mode-specific options (page range, quality, etc.)
4. User clicks **Convert** button
5. Real progress bar updates via processor callback
6. Download button appears with real output file

## Mode-Specific Options

- **PDF to Images**: Scale factor (1x, 2x, 3x)
- **Images to PDF**: Drag-to-reorder
- **Merge PDF**: Drag-to-reorder
- **Split PDF**: Page range input (e.g. "1-3, 5, 8-10")
- **Compress PDF**: Quality (Low / Medium / High)

## File Structure

```
tools/pdf-converter/
├── converter-nav.tsx       # Updated mode definitions
├── upload-zone.tsx         # Dynamic accept types
├── file-list.tsx           # Real downloads + thumbnails
├── mode-options.tsx        # Per-mode configuration UI
├── file-preview.tsx        # Thumbnail preview + reorder
└── processors/
    ├── pdf-to-images.ts
    ├── images-to-pdf.ts
    ├── merge-pdf.ts
    ├── split-pdf.ts
    └── compress-pdf.ts
```

## Implementation Order

1. Install dependencies (pdf-lib, pdfjs-dist, jszip)
2. Build 5 processor functions
3. Update converter-nav with new modes
4. Create mode-options component
5. Update upload-zone and file-list
6. Rewire page.tsx with Convert button flow
7. Add E2E tests
