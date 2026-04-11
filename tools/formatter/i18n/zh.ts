import type { I18nStrings } from './en'

export const zh: I18nStrings = {
  pageTitle: '格式化工具',
  pageSubtitle: '12 种格式的格式化、压缩、验证、转换和对比',

  formatLabel: '格式',
  auto: '自动',
  detected: '已检测',

  actions: {
    format: '格式化',
    minify: '压缩',
    validate: '验证',
    convert: '转换',
    diff: '对比',
  },

  convertTo: '转换为',

  panes: {
    input: '输入',
    inputA: '输入 A',
    inputB: '输入 B',
    output: '输出',
    diffResult: '对比结果',
    inputPlaceholder: '在此粘贴你的内容…',
    outputPlaceholder: '格式化结果将显示在此',
  },

  status: {
    pasteToBegin: '粘贴内容以开始',
    valid: '有效',
    invalid: '无效',
    loading: '处理中…',
    bytes: '字节',
    lines: '行',
    privacy: '你的内容永远不会被存储',
    addBothSides: '请在两侧添加内容以进行对比',
    copied: '已复制到剪贴板',
    minifyUnsupported: '此格式不支持压缩',
    convertUnsupported: '此格式没有可转换的目标',
  },

  errors: {
    empty: '输入为空',
    tooLarge: '输入超过 1MB 限制',
    parseError: '解析错误',
    serverError: '服务器错误——请重试',
    networkError: '网络错误——请检查你的连接',
    unknownFormat: '无法检测格式——请手动选择',
  },

  buttons: {
    copy: '复制',
    download: '下载',
    clear: '清空',
  },
}
