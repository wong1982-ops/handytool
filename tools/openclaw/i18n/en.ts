export const en = {
  pageTitle: 'OpenClaw Chat',
  pageDescription: 'Chat with your OpenClaw AI agent',

  header: {
    title: 'OpenClaw Chat',
    settings: 'Settings',
  },

  connection: {
    idle: 'Not connected',
    connecting: 'Connecting...',
    connected: 'Connected',
    disconnected: 'Disconnected',
    error: 'Connection error',
    reconnect: 'Reconnect',
  },

  settings: {
    title: 'Connection Settings',
    gatewayUrl: 'Gateway URL',
    gatewayUrlPlaceholder: 'ws://192.168.1.50:18789',
    authToken: 'Auth Token',
    authTokenPlaceholder: 'Enter your token',
    connect: 'Connect',
    disconnect: 'Disconnect',
    clearHistory: 'Clear History',
    close: 'Close',
  },

  chat: {
    placeholder: 'Type a message...',
    send: 'Send',
    empty: 'Send a message to start chatting',
    streaming: 'Thinking...',
  },

  setup: {
    title: 'Connect to OpenClaw',
    description: 'Enter your OpenClaw Gateway URL and auth token to start chatting with your AI agent.',
    openSettings: 'Open Settings',
  },
} as const

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>
}

export type I18nStrings = DeepStringify<typeof en>
