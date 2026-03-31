# OpenClaw Chat Tool — Design Document

**Date:** 2026-03-31
**Status:** DESIGN COMPLETE — Ready for implementation

---

## Understanding Summary

- **What:** A chat tool in Toolk1t that connects to a user's self-hosted OpenClaw Gateway via WebSocket for real-time conversation
- **Why:** Provide a unified web interface to interact with OpenClaw, instead of relying on Telegram/Discord
- **Who:** Any logged-in Toolk1t user who runs their own OpenClaw instance
- **Storage:** localStorage for chat history and connection config
- **Transport:** Direct WebSocket from browser to OpenClaw Gateway (no server-side proxy)

### Non-Goals (v1)
- No task monitoring, skill management, or agent configuration
- No Supabase persistence for chat history
- No server-side proxy

### Assumptions
- User is responsible for exposing their OpenClaw Gateway to a reachable URL
- OpenClaw Gateway WebSocket uses JSON text frames
- Auth is via a token passed in the WebSocket handshake
- Exact frame format will be confirmed against OpenClaw docs during implementation; a thin adapter layer handles protocol differences

---

## Architecture: Direct WebSocket Client

```
┌──────────────┐    WebSocket (JSON frames)    ┌───────────────────┐
│  Toolk1t     │◄──────────────────────────────►│  OpenClaw Gateway │
│  Browser     │   ws://host:18789              │  (user's laptop)  │
│  (React)     │                                │                   │
└──────────────┘                                └───────────────────┘
```

No backend involvement. Browser connects directly to the user's Gateway.

---

## Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  Header: "OpenClaw Chat"    [⚙ Settings] [BackButton]  │
├─────────────────────────────────────────────────────────┤
│  Connection bar: 🟢 Connected to 192.168.1.x           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Chat messages (scrollable)                             │
│                                                         │
│  [User]  What files are in ~/projects?                  │
│                                                         │
│  [Claw]  Let me check...                                │
│          Found 12 files:                                │
│          - project-a/                                   │
│          ...                                            │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [Type a message...                    ] [Send ➤]       │
└─────────────────────────────────────────────────────────┘
```

**Settings panel** (slide-out or modal):
- Gateway URL input (e.g. `ws://192.168.1.50:18789`)
- Auth token input (password field)
- Connect / Disconnect button
- Connection status indicator

**Connection states:**

| State | UI |
|---|---|
| Not configured | Show setup prompt instead of chat |
| Connecting | Pulsing indicator, "Connecting..." |
| Connected | Green dot, Gateway URL shown |
| Disconnected | Red dot, "Reconnect" button |
| Error | Red dot, error message |

**Mobile:** Full-width single column. Settings via gear icon. Input sticky at bottom.

---

## WebSocket Hook

```typescript
interface UseOpenClawSocketOptions {
  url: string | null
  token: string | null
  onMessage: (msg: InboundMessage) => void
  onStatusChange: (status: ConnectionStatus) => void
}

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'
```

**Connection lifecycle:**
1. User provides URL + token → stored in localStorage
2. Hook opens `new WebSocket(url)`
3. On open → send auth handshake
4. On message → parse JSON, dispatch to onMessage
5. On close/error → update status, auto-reconnect with exponential backoff (1s, 2s, 4s, max 30s)
6. On unmount → clean close

**Message types:**

```typescript
// Outbound (user → Gateway)
interface OutboundMessage {
  type: 'user_message'
  content: string
  id: string
}

// Inbound (Gateway → client)
interface InboundMessage {
  type: 'assistant_message' | 'assistant_message_chunk' | 'status' | 'error'
  content?: string
  messageId?: string
  done?: boolean
}
```

**Streaming:** Gateway sends `assistant_message_chunk` frames. Each chunk appends to current assistant bubble. `done: true` marks completion.

**Adapter layer:** Thin mapping function between raw Gateway frames and our InboundMessage type, so protocol changes don't ripple through the UI.

---

## Chat State

```typescript
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  streaming: boolean
}

interface OpenClawConfig {
  gatewayUrl: string
  authToken: string
}

interface ChatState {
  config: OpenClawConfig | null
  messages: ChatMessage[]
  status: ConnectionStatus
  showSettings: boolean
}
```

**localStorage keys:**
- `openclaw_config` → connection settings
- `openclaw_history` → chat messages

**State management:** useReducer + React Context

**Actions:** SET_CONFIG, ADD_MESSAGE, APPEND_CHUNK, COMPLETE_MESSAGE, SET_STATUS, CLEAR_HISTORY, TOGGLE_SETTINGS

---

## File Structure

```
app/tools/openclaw/
├── layout.tsx                  # SEO metadata + JSON-LD
└── page.tsx                    # Route entry, ChatProvider wrapper

tools/openclaw/
├── openclaw-types.ts           # All TypeScript interfaces
├── openclaw-reducer.ts         # State reducer + default state
├── openclaw-provider.tsx       # ChatContext + useReducer + localStorage
├── use-openclaw-socket.ts      # WebSocket hook
├── chat-header.tsx             # Title, connection bar, settings gear
├── chat-messages.tsx           # Scrollable message list
├── chat-input.tsx              # Input bar + send button
├── chat-bubble.tsx             # Single message bubble
├── settings-panel.tsx          # Gateway URL + token config
└── i18n/
    ├── en.ts
    └── zh.ts
```

~12 files. No API routes. No new dependencies.

---

## Decision Log

| # | Decision | Alternatives | Why Chosen |
|---|---|---|---|
| 1 | Direct WebSocket from browser | Server-side proxy, REST polling | Zero backend, lowest latency |
| 2 | Chat only | Chat + monitoring, full panel | YAGNI — matches Telegram/Discord parity |
| 3 | Multi-user config | Hardcoded single instance | More flexible |
| 4 | localStorage for history | Ephemeral, Supabase | Survives refresh, no backend |
| 5 | Streaming responses | Full response only | Best UX for long-running tasks |
| 6 | In-page settings | Environment variable | Multi-user compatible |
| 7 | useReducer + Context | Zustand, Redux | Consistent with project pattern |
| 8 | Thin adapter layer | Hardcode frame format | Handles protocol variations |
| 9 | Auto-reconnect with backoff | Manual only | Resilient for long sessions |
