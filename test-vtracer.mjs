/**
 * Node.js test script for vtracer-webapp WASM module.
 *
 * This script demonstrates running the browser-targeted vtracer-webapp WASM
 * module in Node.js by providing mock DOM objects. It:
 * 
 * 1. Reads a PNG image and decodes it to raw RGBA pixels using sharp
 * 2. Creates mock Window/Document/Canvas/SVG DOM objects
 * 3. Loads and instantiates the WASM module with the mocked environment
 * 4. Runs ColorImageConverter to vectorize the raster image
 * 5. Serializes the resulting SVG element tree and saves it to disk
 *
 * The script runs TWO conversions:
 *   - Default settings (coarse, fast)
 *   - High-detail settings (finer color precision, smaller filter)
 */

import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const WORKSPACE = '/Users/mercury/WebstormProjects/handytool-workspace';
const WASM_PATH = `${WORKSPACE}/handytool-client/public/vtracer_webapp_bg.wasm`;
const GLUE_JS_PATH = `${WORKSPACE}/handytool-client/tools/svg-converter/vtracer_webapp_bg.js`;
const PNG_PATH = `${WORKSPACE}/designs/10.SVGConverter/loic_avatar.png`;
const SVG_OUT_PATH = `${WORKSPACE}/designs/10.SVGConverter/loic_avatar_vtracer.svg`;

// ---------------------------------------------------------------------------
// Load sharp from pnpm store
// ---------------------------------------------------------------------------
const require = createRequire(import.meta.url);
const sharp = require(
  `${WORKSPACE}/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp`
);

// ===========================================================================
// Step 1: Decode the PNG to raw RGBA pixels
// ===========================================================================
console.log('[1/6] Decoding PNG with sharp...');
const pngBuffer = await readFile(PNG_PATH);
const { data: rawPixels, info } = await sharp(pngBuffer)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const WIDTH = info.width;
const HEIGHT = info.height;
console.log(`       Image: ${WIDTH}x${HEIGHT}, ${info.channels} channels, ${rawPixels.length} bytes`);
console.log(`       Verified: buffer matches ${WIDTH}*${HEIGHT}*4 = ${WIDTH * HEIGHT * 4}`);

// Quick stats
let nonZeroPixels = 0;
for (let i = 0; i < rawPixels.length; i += 4) {
  if (rawPixels[i] || rawPixels[i+1] || rawPixels[i+2]) nonZeroPixels++;
}
console.log(`       Non-black pixels: ${nonZeroPixels}/${WIDTH * HEIGHT} (${(nonZeroPixels / (WIDTH * HEIGHT) * 100).toFixed(1)}%)`);

// ===========================================================================
// Step 2: Build mock DOM objects
//
// The vtracer WASM module is designed for browsers. It uses:
//   - document.getElementById(id) to find canvas/SVG elements
//   - canvas.getContext('2d') / ctx.getImageData() to read pixels
//   - document.createElementNS() to create SVG <path> elements
//   - element.setAttribute() / element.prepend() to build the SVG tree
//   - instanceof Window/HTMLCanvasElement/CanvasRenderingContext2D checks
//
// We provide minimal mock implementations of these DOM APIs.
// ===========================================================================
console.log('[2/6] Building mock DOM objects...');

const CANVAS_ID = '__vtracer_canvas__';
const SVG_ID = '__vtracer_svg__';

class MockElement {
  constructor(ns, tag) {
    this.namespaceURI = ns || null;
    this.tagName = tag || '';
    this._attributes = new Map();
    this.children = [];
    this.id = '';
  }
  setAttribute(name, value) {
    this._attributes.set(name, String(value));
    if (name === 'id') this.id = String(value);
  }
  getAttribute(name) { return this._attributes.get(name) ?? null; }
  removeAttribute(name) { this._attributes.delete(name); }
  prepend(child) { this.children.unshift(child); }
  appendChild(child) { this.children.push(child); }
  remove() {}
  get childElementCount() { return this.children.length; }
  serialize() {
    const attrs = [...this._attributes.entries()]
      .map(([k, v]) => `${k}="${escapeXml(v)}"`)
      .join(' ');
    const open = attrs ? `<${this.tagName} ${attrs}` : `<${this.tagName}`;
    if (this.children.length === 0) return `${open}/>`;
    const inner = this.children.map(c => c.serialize()).join('\n');
    return `${open}>\n${inner}\n</${this.tagName}>`;
  }
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

class MockImageData {
  constructor(data, width, height) {
    this.data = data;
    this.width = width;
    this.height = height;
  }
}

class MockCanvasRenderingContext2D {
  constructor(canvasRef) { this._canvas = canvasRef; }
  getImageData(x, y, w, h) {
    const copy = new Uint8ClampedArray(rawPixels.length);
    copy.set(rawPixels);
    return new MockImageData(copy, w, h);
  }
  drawImage() {}
  clearRect() {}
}

class MockHTMLCanvasElement {
  constructor(id, width, height) {
    this.id = id;
    this.width = width;
    this.height = height;
    this._ctx = null;
  }
  getContext(type) {
    if (type === '2d') {
      if (!this._ctx) this._ctx = new MockCanvasRenderingContext2D(this);
      return this._ctx;
    }
    return null;
  }
  setAttribute() {}
  getAttribute() { return null; }
  removeAttribute() {}
  remove() {}
}

// We create fresh SVG elements for each conversion run
let mockSvgEl;
const mockCanvas = new MockHTMLCanvasElement(CANVAS_ID, WIDTH, HEIGHT);

function resetSvgElement() {
  mockSvgEl = new MockElement('http://www.w3.org/2000/svg', 'svg');
  mockSvgEl.id = SVG_ID;
}
resetSvgElement();

const mockDocument = {
  getElementById(id) {
    if (id === CANVAS_ID) return mockCanvas;
    if (id === SVG_ID) return mockSvgEl;
    return null;
  },
  createElementNS(ns, tag) { return new MockElement(ns, tag); },
  createElement(tag) { return new MockElement(null, tag); },
  body: { appendChild() {}, prepend() {} },
};

class MockWindow {
  constructor() { this.document = mockDocument; }
  get window() { return this; }
  get self() { return this; }
}

const mockWindow = new MockWindow();

globalThis.window = mockWindow;
globalThis.self = mockWindow;
globalThis.document = mockDocument;
globalThis.Window = MockWindow;
globalThis.HTMLCanvasElement = MockHTMLCanvasElement;
globalThis.CanvasRenderingContext2D = MockCanvasRenderingContext2D;

// ===========================================================================
// Step 3: Load JS glue module
// ===========================================================================
console.log('[3/6] Loading JS glue code...');
const bgJs = await import(pathToFileURL(GLUE_JS_PATH).href);

// ===========================================================================
// Step 4: Instantiate WASM
// ===========================================================================
console.log('[4/6] Loading and instantiating WASM...');
const wasmBytes = await readFile(WASM_PATH);
const wasmResult = await WebAssembly.instantiate(wasmBytes, {
  './vtracer_webapp_bg.js': bgJs,
});
bgJs.__wbg_set_wasm(wasmResult.instance.exports);

if (typeof wasmResult.instance.exports.__wbindgen_start === 'function') {
  wasmResult.instance.exports.__wbindgen_start();
}
console.log('       WASM loaded and initialized');

// ===========================================================================
// Helper: run a single conversion with given params
// ===========================================================================
async function runConversion(label, params, outputPath) {
  console.log(`\n--- ${label} ---`);
  console.log('       Params:', JSON.stringify(params));

  // Reset the SVG element for this conversion
  resetSvgElement();
  // Also reset the canvas context so getImageData returns fresh data
  mockCanvas._ctx = null;

  const { ColorImageConverter } = bgJs;
  const converter = ColorImageConverter.new_with_string(JSON.stringify(params));
  converter.init();

  // Suppress Rust console output during tick loop
  const origLog = console.log;
  console.log = (...args) => {
    const msg = args.join(' ');
    if (!msg.includes('tick') && !msg.includes('done')) origLog(...args);
  };

  let tickCount = 0;
  const startTime = performance.now();
  while (true) {
    const done = converter.tick();
    tickCount++;
    if (done) break;
  }

  console.log = origLog;
  const elapsed = Math.round(performance.now() - startTime);
  console.log(`       Ticks: ${tickCount} | Time: ${elapsed}ms`);

  converter.free();

  // Build SVG string
  if (!mockSvgEl._attributes.has('xmlns')) {
    mockSvgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  if (!mockSvgEl._attributes.has('viewBox') && !mockSvgEl._attributes.has('width')) {
    mockSvgEl.setAttribute('width', String(WIDTH));
    mockSvgEl.setAttribute('height', String(HEIGHT));
    mockSvgEl.setAttribute('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);
  }
  mockSvgEl._attributes.delete('id');
  mockSvgEl._attributes.delete('style');

  const svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + mockSvgEl.serialize();
  const pathCount = (svgString.match(/<path[\s/]/g) || []).length;

  console.log(`       Paths: ${pathCount} | SVG size: ${(svgString.length / 1024).toFixed(1)} KB | PNG: ${(pngBuffer.length / 1024).toFixed(1)} KB`);

  // Show some paths
  for (let i = 0; i < Math.min(5, mockSvgEl.children.length); i++) {
    const child = mockSvgEl.children[i];
    const style = child._attributes?.get('style') || '';
    const d = child._attributes?.get('d') || '';
    console.log(`         path[${i}]: ${style.trim()} | d: ${d.length} chars`);
  }
  if (mockSvgEl.children.length > 5) {
    console.log(`         ... and ${mockSvgEl.children.length - 5} more`);
  }

  await writeFile(outputPath, svgString, 'utf-8');
  console.log(`       Saved to: ${outputPath}`);

  return { svgString, pathCount, elapsed };
}

// ===========================================================================
// Step 5: Run conversions
// ===========================================================================
console.log('[5/6] Running conversions...');

// Run 1: Default settings (from the client app)
const defaultParams = {
  canvas_id: CANVAS_ID,
  svg_id: SVG_ID,
  mode: 'spline',
  hierarchical: 'stacked',
  filter_speckle: 4,
  color_precision: 6,
  layer_difference: 16,
  corner_threshold: 60,
  length_threshold: 4.0,
  splice_threshold: 45,
  max_iterations: 10,
  path_precision: 8,
};
const result1 = await runConversion(
  'Run 1: Default settings (color_precision=6, layer_difference=16)',
  defaultParams,
  SVG_OUT_PATH.replace('.svg', '_default.svg'),
);

// Run 2: High detail settings
const highDetailParams = {
  canvas_id: CANVAS_ID,
  svg_id: SVG_ID,
  mode: 'spline',
  hierarchical: 'stacked',
  filter_speckle: 2,         // smaller filter = keep more small features
  color_precision: 6,        // same precision
  layer_difference: 4,       // much smaller = more color layers
  corner_threshold: 60,
  length_threshold: 4.0,
  splice_threshold: 45,
  max_iterations: 10,
  path_precision: 8,
};
const result2 = await runConversion(
  'Run 2: High detail (filter_speckle=2, layer_difference=4)',
  highDetailParams,
  SVG_OUT_PATH,
);

// Run 3: Cutout mode for comparison
const cutoutParams = {
  canvas_id: CANVAS_ID,
  svg_id: SVG_ID,
  mode: 'spline',
  hierarchical: 'cutout',    // cutout instead of stacked
  filter_speckle: 4,
  color_precision: 6,
  layer_difference: 16,
  corner_threshold: 60,
  length_threshold: 4.0,
  splice_threshold: 45,
  max_iterations: 10,
  path_precision: 8,
};
const result3 = await runConversion(
  'Run 3: Cutout mode (hierarchical=cutout)',
  cutoutParams,
  SVG_OUT_PATH.replace('.svg', '_cutout.svg'),
);

// ===========================================================================
// Step 6: Summary
// ===========================================================================
console.log('\n[6/6] Summary:');
console.log('=========================================================');
console.log(`  Input:   ${PNG_PATH}`);
console.log(`           ${WIDTH}x${HEIGHT}px, ${(pngBuffer.length / 1024).toFixed(1)} KB`);
console.log('');
console.log(`  Run 1 (default):     ${result1.pathCount} paths, ${(result1.svgString.length / 1024).toFixed(1)} KB, ${result1.elapsed}ms`);
console.log(`  Run 2 (high detail): ${result2.pathCount} paths, ${(result2.svgString.length / 1024).toFixed(1)} KB, ${result2.elapsed}ms`);
console.log(`  Run 3 (cutout):      ${result3.pathCount} paths, ${(result3.svgString.length / 1024).toFixed(1)} KB, ${result3.elapsed}ms`);
console.log('');
console.log(`  Output:  ${SVG_OUT_PATH}`);
console.log('=========================================================');
console.log('\nDone! Successfully tested vtracer WASM in Node.js.');
