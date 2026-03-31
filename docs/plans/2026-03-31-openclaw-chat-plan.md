# OpenClaw Chat Tool — Implementation Plan

**Date:** 2026-03-31
**Design:** [2026-03-31-openclaw-chat-design.md](./2026-03-31-openclaw-chat-design.md)
**Status:** READY

---

## Phase 1: Foundation (Types, State, Layout)

### 1.1 — Types & i18n
- Create `tools/openclaw/openclaw-types.ts` — all interfaces (ChatMessage, OpenClawConfig, ChatState, ConnectionStatus, message types)
- Create `tools/openclaw/i18n/en.ts` and `zh.ts` — all UI strings

### 1.2 — State management
- Create `tools/openclaw/openclaw-reducer.ts` — all actions + reducer + default state
- Create `tools/openclaw/openclaw-provider.tsx` — ChatContext, useReducer, localStorage load/save (debounced)

### 1.3 — Page shell
- Create `app/tools/openclaw/layout.tsx` — SEO metadata + JSON-LD
- Create `app/tools/openclaw/page.tsx` — route entry, ChatProvider wrapper, layout structure
- Create `tools/openclaw/chat-header.tsx` — title bar with settings gear + connection status

**Checkpoint:** Page loads, provider initializes, header renders.

---

## Phase 2: Settings Panel

### 2.1 — Settings UI
- Create `tools/openclaw/settings-panel.tsx` — slide-out panel with:
  - Gateway URL input
  - Auth token input (password field)
  - Connect / Disconnect button
  - Connection status display
  - "Clear History" button
- Wire to reducer (SET_CONFIG, TOGGLE_SETTINGS)
- Persist config to localStorage on save

**Checkpoint:** User can enter Gateway URL + token, saved to localStorage, persists across refresh.

---

## Phase 3: WebSocket Hook

### 3.1 — Core hook
- Create `tools/openclaw/use-openclaw-socket.ts`:
  - Opens WebSocket to configured URL
  - Sends auth handshake on connect
  - Parses incoming JSON frames via adapter layer
  - Dispatches onMessage / onStatusChange callbacks
  - Auto-reconnect with exponential backoff (1s → 2s → 4s → max 30s)
  - Clean close on unmount
  - Returns: `{ send, disconnect, status }`

### 3.2 — Protocol adapter
- Thin mapping function: raw Gateway JSON → our InboundMessage type
- Easy to adjust when referencing actual OpenClaw docs

**Checkpoint:** WebSocket connects to a Gateway, receives messages, auto-reconnects on drop.

---

## Phase 4: Chat UI

### 4.1 — Chat messages
- Create `tools/openclaw/chat-messages.tsx` — scrollable message list
  - Auto-scroll to bottom on new messages
  - Scroll lock: if user scrolls up, don't auto-scroll
  - Empty state: "Send a message to start chatting"

### 4.2 — Chat bubble
- Create `tools/openclaw/chat-bubble.tsx` — single message component
  - User messages: right-aligned, blue background
  - Assistant messages: left-aligned, gray background
  - Streaming indicator: pulsing dots while `streaming: true`
  - Timestamp shown on hover
  - Markdown/code rendering for assistant messages (use existing prose styles)

### 4.3 — Chat input
- Create `tools/openclaw/chat-input.tsx` — input bar
  - Text input with placeholder
  - Send button (disabled when empty or disconnected)
  - Enter to send, Shift+Enter for newline
  - Textarea auto-grows up to 4 lines

**Checkpoint:** Full chat flow works — type message, see streaming response, scroll through history.

---

## Phase 5: Polish & Homepage

### 5.1 — Add to homepage
- Add OpenClaw Chat to `lib/tools.tsx`

### 5.2 — Not-configured state
- When no config exists, show a friendly setup screen instead of empty chat
- Guide user to enter Gateway URL + token

### 5.3 — Mobile responsive
- Full-width layout, sticky input bar
- Settings as full-screen overlay on mobile

### 5.4 — Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation (Tab through messages, Enter to send)
- Screen reader: announce new messages via aria-live region

**Checkpoint:** Tool is production-ready, accessible, responsive, listed on homepage.
