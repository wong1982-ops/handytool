import type { I18nStrings } from './en'

export const zh: I18nStrings = {
  pageTitle: 'OpenClaw 聊天',
  pageDescription: '与你的 OpenClaw AI 助手对话',

  header: {
    title: 'OpenClaw 聊天',
    settings: '设置',
  },

  connection: {
    idle: '未连接',
    connecting: '连接中...',
    connected: '已连接',
    disconnected: '已断开',
    error: '连接错误',
    reconnect: '重新连接',
  },

  settings: {
    title: '连接设置',
    gatewayUrl: '网关地址',
    gatewayUrlPlaceholder: 'ws://192.168.1.50:18789',
    authToken: '认证令牌',
    authTokenPlaceholder: '输入令牌',
    connect: '连接',
    disconnect: '断开',
    clearHistory: '清空历史',
    close: '关闭',
  },

  chat: {
    placeholder: '输入消息...',
    send: '发送',
    empty: '发送消息开始聊天',
    streaming: '思考中...',
  },

  setup: {
    title: '连接到 OpenClaw',
    description: '输入你的 OpenClaw 网关地址和认证令牌，开始与 AI 助手对话。',
    openSettings: '打开设置',
  },
} as const
