export const en = {
  pageTitle: 'Formatter',
  pageSubtitle: 'Format, minify, validate, convert, and diff 12 formats',

  formatLabel: 'Format',
  auto: 'Auto',
  detected: 'Detected',

  actions: {
    format: 'Format',
    minify: 'Minify',
    validate: 'Validate',
    convert: 'Convert',
    diff: 'Diff',
  },

  convertTo: 'Convert to',

  panes: {
    input: 'Input',
    inputA: 'Input A',
    inputB: 'Input B',
    output: 'Output',
    diffResult: 'Diff result',
    inputPlaceholder: 'Paste your content here…',
    outputPlaceholder: 'Formatted output will appear here',
  },

  status: {
    pasteToBegin: 'Paste content to begin',
    valid: 'Valid',
    invalid: 'Invalid',
    loading: 'Working…',
    bytes: 'bytes',
    lines: 'lines',
    privacy: 'Your content is never stored',
    addBothSides: 'Add content to both sides to compare',
    copied: 'Copied to clipboard',
    minifyUnsupported: 'Minify is not supported for this format',
    convertUnsupported: 'No compatible convert targets for this format',
  },

  errors: {
    empty: 'Input is empty',
    tooLarge: 'Input exceeds 1MB limit',
    parseError: 'Parse error',
    serverError: 'Server error — please try again',
    networkError: 'Network error — check your connection',
    unknownFormat: 'Could not detect format — please select manually',
  },

  buttons: {
    copy: 'Copy',
    download: 'Download',
    clear: 'Clear',
  },
} as const

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>
}
export type I18nStrings = DeepStringify<typeof en>
