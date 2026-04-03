# OpenClaw Chat — Google Stitch Design Prompt

## Tool Summary

OpenClaw is a WebSocket-based AI agent chat interface that connects to a self-hosted OpenClaw gateway. Users configure a gateway URL and auth token, then chat in real time with a remote AI agent. The interface supports streaming responses (typing indicator), connection status tracking (idle / connecting / connected / disconnected / error), chat history, and a clear-history action. The tool is a full-viewport chat shell — no secondary pages.

---

## Stitch Prompt

Full-viewport AI agent chat interface for a dark-themed developer tool platform called Toolk1t.

**Screens to generate (single-screen, show all states):**

### Screen 1 — Connected chat view (primary state)

Layout: Full-height column, no external scrolling. Three horizontal zones stacked.

**Zone 1 — Top bar (48px tall):**
- Left: back-arrow icon button (44px hit area), then "OpenClaw Chat" as page title in white, 16px semibold
- Right: bookmark/heart icon button (44px hit area) for favoriting the tool
- Background: card-bg `#131a23`, bottom border `#1e2631`

**Zone 2 — Connection bar (40px tall):**
- Left: small filled circle status dot (10px) in success green `#10B981` + label "Connected" in text-secondary `#a6abb5`, 13px. Beside label, muted URL text `ws://192.168.1.50:18789` in text-muted `#70767f`, 11px
- Right: Settings button — gear icon + "Settings" label, text-secondary `#a6abb5`, rounded pill, hover state has subtle `#1e2631` background. Minimum 44px height.
- Background: page-bg `#090f16`, bottom border `#1e2631`

**Zone 3 — Chat messages area (flex-1, scrollable internally):**
- Background: page-bg `#090f16`
- Messages grouped with 12px gap between bubbles
- User messages: right-aligned bubble, primary blue `#3D6AF2` background, white text, 14px, border-radius 18px with 4px bottom-right radius. Max width 80%.
- Assistant messages: left-aligned bubble, card-bg `#131a23` background, text-primary `#ffffff`, 14px, border-radius 18px with 4px bottom-left radius. Max width 80%.
- Timestamps shown on hover in text-muted `#70767f`, 10px, below bubble content
- Streaming assistant message: show three animated bouncing dots (4px circles, text-muted color) below partial text

**Realistic mock conversation (use this exact content):**
1. User: "Can you check the disk usage on the home server and tell me which directories are the largest?"
2. Assistant: "Sure! Running `df -h` and `du -sh /*` now. Give me a moment to analyse the output." *(completed)*
3. User: "Focus on anything over 10GB."
4. Assistant (streaming, partial text visible + typing dots): "Got it. Here are the directories over 10GB:\n\n- `/home` — 47 GB\n- `/var` — 23 GB\n- `/opt` — 14 GB\n\nThe `/home` directory is the largest. Would you like me to drill down further into `/home` to see which user folders are taking up the most space?"

**Zone 4 — Input bar (shrink-0, bottom):**
- Background: card-bg `#131a23`, top border `#1e2631`
- Padding: 12px horizontal and vertical
- Textarea: auto-growing, single-row default. Background `#090f16`, border `#1e2631`, border-radius 12px, text-primary `#ffffff`, placeholder text-muted `#70767f`. Focus ring: primary `#3D6AF2`.
- Send button: 44x44px, border-radius 12px, primary `#3D6AF2` background, white arrow-up icon. Disabled state: 40% opacity.

---

### Screen 2 — Settings modal (overlay state)

Show as a slide-up sheet or centered modal over the connected chat.

- Backdrop: `rgba(0,0,0,0.7)` overlay
- Modal: card-bg `#131a23`, border `#1e2631`, border-radius 20px, max-width 448px, padding 24px
- Header: "Connection Settings" title (white, 18px semibold) + close X button (top right, text-muted, 44px hit area)
- Two form fields stacked with 16px gap:
  - "Gateway URL" label (text-secondary `#a6abb5`, 13px semibold) + input with placeholder `ws://192.168.1.50:18789`
  - "Auth Token" label + password input with placeholder "Enter your token"
  - Inputs: full-width, background `#090f16`, border `#1e2631`, border-radius 10px, text-primary, 14px, height 44px, focus ring primary blue
- Connected state: fields are disabled (50% opacity). Show red "Disconnect" button (full-width, height 44px, border-radius 10px, border `#ef4444`, text `#ef4444`, transparent background).
- Disconnected state: show "Connect" button (full-width, 44px, border-radius 10px, solid primary `#3D6AF2` background, white text, 14px semibold).
- Below buttons: "Clear History" text link (text-muted `#70767f`, 13px, centered, hover turns text-muted/red).

---

### Screen 3 — Empty / not configured state

Show when no gateway is configured.

- Top bar same as Screen 1
- Connection bar: status dot gray `#70767f` + "Not connected" label
- Center of remaining viewport: vertical flex column, centered
  - Robot icon (use a Material Symbol: `smart_toy`) at 48px, color text-muted `#70767f`
  - "Connect to OpenClaw" heading, white, 18px semibold, margin-top 16px
  - "Enter your OpenClaw Gateway URL and auth token to start chatting with your AI agent." subtext, text-secondary `#a6abb5`, 14px, max-width 280px, text-center
  - "Open Settings" CTA button: primary `#3D6AF2`, white text, 14px semibold, border-radius 10px, height 44px, padding 0 24px, margin-top 24px

---

## Visual Style Specification

| Token | Value |
|---|---|
| Page background | `#090f16` |
| Card / surface | `#131a23` |
| Border | `#1e2631` |
| Primary (blue) | `#3D6AF2` |
| Text primary | `#ffffff` |
| Text secondary | `#a6abb5` |
| Text muted | `#70767f` |
| Success green | `#10B981` |
| Error / disconnect | `#ef4444` |
| Warning / connecting | `#F59E0B` (pulsing) |
| Font | Inter, system-ui fallback |

**Design style:** Dark, developer-tool aesthetic. High contrast, minimal chrome. No gradients on backgrounds. Cards use subtle 1px borders rather than shadows. Bubbles use solid fills. Interactive states are communicated through opacity and border changes, not drop shadows.

**Spacing:** 16px base grid. Chat bubbles have 12px top/bottom, 16px left/right padding. Touch targets minimum 44px on all interactive elements.

**Icons:** Material Symbols Rounded (`arrow_back`, `bookmark`, `settings`, `send`, `smart_toy`, `close`).

**Platform:** Responsive web. Mobile-first (375px base). Desktop: max-width 768px chat shell centered on wide screens.

---

## Notes for Stitch

- Show Screens 1, 2, and 3 side-by-side or as a multi-screen flow
- Screen 1 is the hero/primary screen — give it the most detail
- The streaming state (Screen 1, message 4) should visually show the typing dots inside the assistant bubble
- The Settings modal (Screen 2) should overlay Screen 1 behind it
- Do not add any features not listed above — this is a UI consistency redesign, not a feature expansion
