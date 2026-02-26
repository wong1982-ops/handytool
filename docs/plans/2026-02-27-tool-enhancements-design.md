# Tool Enhancements Design — Feature-Rich Upgrade

> Approved: 2026-02-27

## Scope

Deep enhancements to 4 high-traffic-potential tools: SVG Converter, Currency Exchange, JSON Converter, PDF Converter.

## SVG Converter

**Current:** Upload raster → SVG via potrace. Broken EPS/PDF export.

**Enhancements:**
- Fix EPS and PDF exports
- Algorithm controls (threshold, color count, smoothing, corners) with live preview
- Batch processing with ZIP download
- Black & white vs. full color tracing toggle
- SVG optimization (svgo client-side), show file size reduction
- Side-by-side preview (original vs. SVG) with synced zoom/pan
- Download as SVG, PNG (custom resolution), EPS, PDF

**Tech:** potrace-wasm, svgo, JSZip. All client-side.

## Currency Exchange

**Current:** Live fiat rates, basic converter.

**Enhancements:**
- Crypto support (top 20 via CoinGecko free API)
- Historical charts (1D/1W/1M/3M/1Y/5Y) via recharts
- Favorites & recent pairs (localStorage)
- Multi-currency calculator (one amount → many currencies)
- Rate alerts (Notification API + polling)
- Swap button, copy & share link
- Offline fallback (cached rates with staleness badge)

**Tech:** Existing fiat API + CoinGecko. Recharts for charts. localStorage for persistence.

## JSON Converter

**Current:** JSON ↔ YAML/CSV/TOML.

**Enhancements:**
- XML support (JSON ↔ XML via fast-xml-parser)
- JSON Schema validation with inline errors
- Diff viewer (two JSON objects, highlighted differences)
- Collapsible tree view of JSON structure
- Formatting controls (indent size, sort keys, minify/prettify)
- CSV options (delimiter, headers, flatten strategy)
- JMESPath/JSONPath query/filter
- Multiple document tabs
- Drag-and-drop file import

**Tech:** fast-xml-parser, json-diff. All client-side.

## PDF Converter

**Current:** Image → PDF only.

**Enhancements:**
- PDF merge (combine multiple PDFs, drag-to-reorder)
- PDF split (extract pages/ranges)
- PDF → Image (PNG/JPG at configurable DPI)
- Compress PDF (quality presets)
- Page management (thumbnails, reorder, rotate, delete)
- Watermark (text/image, position, opacity, size)
- Image → PDF options (page size, orientation, margins, fit mode)
- Batch support with ZIP download

**Tech:** pdf-lib, pdfjs-dist, JSZip. All client-side.
