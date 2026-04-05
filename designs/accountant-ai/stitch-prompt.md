# Google Stitch Prompt — Accountant AI Chat

## Screen Overview

AI accounting chatbot for Toolk1t. Full-screen chat interface with conversation sidebar, message bubbles with source citations, and fixed input bar. Dark theme.

**Platform:** Responsive web (desktop 1440px, mobile 390px)
**Theme:** Dark mode with Toolk1t utility blue theme

---

## Brand Tokens

```
page-bg:        #090f16
card-bg:        #131a23
card-hover:     #1e2631
border:         #1e2631
text-primary:   #ffffff
text-secondary: #a6abb5
text-muted:     #70767f
primary:        #3D6AF2
primary-light:  #3D9DF2
success:        #10B981
purple:         #7C3AED
```

---

## Layout

Uses ToolFrame with utility blue gradient header: back arrow + calculator/chat icon + "Accountant AI" title. The `actions` prop renders the chat input bar fixed at bottom.

### Desktop (md+)

```
┌──────────────────────────────────────────────┐
│  ToolFrame Header (blue gradient)            │
├────────────┬─────────────────────────────────┤
│  Sidebar   │  Chat Messages                  │
│  w-64      │  (scrollable)                   │
│            │                                  │
│  New Chat  │  [user bubble]                   │
│  ─────────│  [ai bubble + sources]            │
│  Conv 1    │  [user bubble]                   │
│  Conv 2    │  [ai bubble + sources]            │
│  Conv 3    │                                  │
│            │  [empty state / typing indicator] │
├────────────┴─────────────────────────────────┤
│  [Input bar — fixed bottom via actions prop]  │
└──────────────────────────────────────────────┘
```

### Mobile

```
┌──────────────────────┐
│  Header + ☰ toggle   │
├──────────────────────┤
│  Chat Messages       │
│  (full width)        │
│                      │
├──────────────────────┤
│  Input bar (fixed)   │
└──────────────────────┘
```

Hamburger opens conversation list as slide-over overlay from left.

---

## Sidebar (Desktop)

- Background: `#0d1117`, border-r `#1e2631`, w-64, full height
- Top: "New Chat" button — full width, gradient primary, 44px, sparkle icon + text
- Divider
- Conversation list (scrollable):
  - Each item: px-3 py-2.5, rounded-lg, hover card-hover
  - Active: card-hover bg, white text
  - Inactive: text-secondary
  - Title (14px, truncated) + date below (11px, text-muted)
  - Max display: 20 conversations
- Empty: "No conversations yet" (text-muted, centered)

---

## Chat Messages Area

**Background:** page-bg with subtle gradient

**User message bubble:**
- Right-aligned, max-w-[75%]
- `bg-[#3D6AF2]/15 border border-[#3D6AF2]/20`, 12px radius
- Text: 14px white, whitespace-pre-wrap
- Timestamp below: 11px text-muted, right-aligned

**AI message bubble:**
- Left-aligned, max-w-[85%]
- `bg-[#131a23] border border-[#1e2631]`, 12px radius
- Content: 14px text-secondary, rendered as Markdown (headings, lists, bold, links)
- Source citations (below content, inside bubble):
  - Label: "Sources:" (11px text-muted)
  - Pills: `rounded-full bg-[#1e2631] px-2.5 py-1 text-xs text-[#3D9DF2] hover:bg-[#3D6AF2]/20`, flex-wrap
  - Each pill: domain name as link (e.g. "ird.govt.nz")
- Disclaimer (below sources):
  - `text-xs text-[#70767f] italic mt-2`
  - "⚠️ This is general information only, not professional tax advice."
- Timestamp: 11px text-muted

**Typing indicator:**
- Left-aligned bubble, same AI styling
- 3 dots pulsing: `animate-bounce` with staggered delays
- "Thinking..." text (12px text-muted)

**Empty state (no messages):**
- Centered vertically in chat area
- Calculator/chat icon (48px, text-muted)
- Heading: "Ask me anything about NZ tax, accounting, or business compliance" (16px, text-secondary, text-center, max-w-md)
- 3 example chips below:
  - "What's the current GST rate?"
  - "How do I register a company in NZ?"
  - "What are the minimum wage rates?"
- Each chip: `rounded-full bg-[#131a23] border border-[#1e2631] px-4 py-2 text-sm text-[#a6abb5] hover:bg-[#1e2631] cursor-pointer`
- Clicking a chip fills it into the input and submits

---

## Input Bar (Fixed Bottom — ToolFrame actions)

- Full width, `border-t border-[#1e2631] bg-[#0d1117]/80 backdrop-blur-sm`
- Inner: max-w-3xl centered, flex row, gap-2, py-3 px-4
- Text input: flex-1, card-bg, border, 12px radius, 44px height
  - Placeholder: "Ask about NZ tax, GST, employment law..." (text-muted)
  - Shift+Enter: newline. Enter: send.
- Send button: 44px square, gradient primary, white arrow icon
  - Disabled when input empty or loading
  - Loading: spinner replaces arrow
- Credit badge: "1 credit" (12px, purple, below input right)

---

## Mobile Conversation Overlay

- Triggered by hamburger icon in ToolFrame header area
- `fixed inset-0 z-50 bg-black/40` backdrop
- Panel: `fixed left-0 top-0 bottom-0 w-72 bg-[#0d1117] border-r border-[#1e2631] shadow-2xl`
- Same content as desktop sidebar
- Close: X button or backdrop click

---

## Interaction Notes

- Messages auto-scroll to bottom on new message
- Chat input auto-focuses on page load
- Example chips disappear after first message
- Source pills open in new tab
- Conversation title auto-generated from first user message (first 40 chars)
- Loading state: typing indicator appears immediately after sending
- Error state: red error bubble "Something went wrong. Try again." with retry button
