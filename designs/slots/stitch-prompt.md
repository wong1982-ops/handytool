# Google Stitch Prompt — Toolk1t Slots Casino

## Context

Redesign of the Toolk1t Slots casino tool lobby and game machine screens.
UI redesign for visual consistency with the Toolk1t dark design system only.
No feature changes — all existing functionality is preserved exactly as-is.

---

## Screen 1 — Casino Lobby (default view)

Casino lobby for a social slots game called "TOOLK1T CASINO"

### Layout (mobile-first, full viewport height)

**Header bar** (sticky, top):
- Left: back arrow icon button + app title "TOOLK1T CASINO" in gold (#f0d080), bold, tracking-wide
- Right: coin balance pill (gold coin icon + formatted number) + "Store" button (green, small, rounded-lg)
- Background: dark navy (#131a23), bottom border in primary blue (#3D6AF2) at 30% opacity

**Events Banner** (below header, conditional):
- Horizontal card inside 16px horizontal margin, rounded-xl
- Left: event type icon + event name in gold + subtitle "Ends: [date]" in muted text
- Border: primary blue (#3D6AF2) at 30% opacity
- Background: card-bg (#131a23)

**Daily Bonus strip** (below events banner):
- Horizontal card inside 16px margin, rounded-xl
- Left: "Daily Bonus — Day 3" label in gold, "25,000 coins" subtitle in muted gold
- Right: green "Claim!" button (rounded-lg, 44px min-height)
- Background: subtle gradient from card-bg (#131a23) to page-bg (#090f16)
- Border: primary blue (#3D6AF2) at 40% opacity

**Game grid / carousel** (horizontally scrollable, snap):
- Horizontal scroll with 16px start padding, 16px gap between cards
- Each game card: 160px wide × ~213px tall (3:4 aspect ratio), rounded-xl
- Card front: full-bleed gradient background (each game has unique theme color) with large emoji icon centered
- Bottom overlay: gradient-to-top from black/80 → transparent, game name in white bold
- Card border: 2px primary blue (#3D6AF2) at 30%, hover → 70%
- 10 game cards total: Wild Stampede 🦬, Nile Queen 👸, Golden Dragon 🐉, Tiki Fire 🌺, Ocean Treasure 🌊, Lucky 88 🀄, Sakura Garden 🌸, Chilli Fiesta 🌶️, Fortune Clover 🍀, Safari King 🦁

**Bottom navigation** (fixed, bottom):
- 5 tabs: Lobby 🎰, Friends 👥, Leaderboard 🏆, Gifts 🎁, Shop 🛒
- Active tab: gold (#f0d080) label, tiny gold dot indicator above icon
- Inactive tab: muted gold at 40% opacity
- Background: #131a23 at 95% opacity, backdrop blur, top border primary blue at 20%
- Each tab: flex-col, icon (text-lg) + label (text-xs), py-2.5

### Visual Style
- Dark casino aesthetic adapted to Toolk1t design system
- Page background: #090f16
- Card backgrounds: #131a23
- Border color: #1e2631 (default), #3D6AF2 at varied opacity (accents)
- Text hierarchy: white for primary, #a6abb5 for secondary, #70767f for muted
- Gold accent (#f0d080 / #d4a052) used for casino-specific highlights (names, coin values, active states)
- Primary blue (#3D6AF2) replaces old purple for borders and interactive accents

---

## Screen 2 — Leaderboard Tab

Same header + bottom nav as lobby.
Content area replaces game grid:

**Section header**: "Leaderboard" in white bold, text-lg
**Period toggle**: two pill buttons — "Weekly" | "All Time". Active: primary blue bg (#3D6AF2), white text. Inactive: card-bg (#131a23), muted text
**Ranking list**:
- Each row: horizontal flex, rounded-lg, card-bg (#131a23), border #1e2631
- Rank number (bold): #1 gold, #2 silver (#d1d5db), #3 bronze (#d4a052), others muted
- Username: white text-sm
- Right column: coins won (gold bold text-sm) + "Biggest win: X" (muted text-xs)
- Top 3 rows get subtle left border in their rank color

---

## Screen 3 — Friends Tab

Same header + bottom nav.
Content:

**Section header**: "Friends" white bold text-lg
**Add friend row**: full-width text input (bg #090f16, border #1e2631, text white, placeholder muted, focus ring primary blue) + "Send Request" green button (44px min-height)
**Pending requests section** (if any): amber "Pending" label, rows with username + Accept (green) / Decline (card-bg) buttons
**Friends list**: rows showing username (white) + online status dot (green #10B981)

---

## Screen 4 — Gifts Tab

Same header + bottom nav.
Content:

**Header row**: "Gifts" white bold + "Claim All (N)" gold button (44px min-height)
**Empty state**: large 🎁 emoji centered + "No gifts yet" muted text
**Gift list**: rows with sender name (white) + "Coins" label + amount (gold bold)

---

## Screen 5 — Coin Shop Tab

Same header + bottom nav.
Content:

**Section header**: "Coin Shop" white bold
**Pack list** (5 items, vertical stack):
- Each row: rounded-xl card-bg (#131a23), border #1e2631, horizontal layout
- Left: pack name (white text-sm) + total coins with bonus (gold bold text-lg) + bonus % label (green text-xs)
- Right: buy button showing price "$X.XX" (green, rounded-lg, 44px min-height)
- "Popular" pack: amber badge "-top-2 right-3" rounded-full
- "Best Value" pack: green badge same position

Packs: Starter (100,000 coins, $0.99), Popular (550,000 coins, +10%, $3.99), Best Value (1,800,000 coins, +20%, $9.99), High Roller (6,500,000 coins, +30%, $24.99), Whale (22,500,000 coins, +50%, $49.99)

---

## Screen 6 — Game Machine (in-game view)

Full-viewport game screen when a specific slot game is selected.

**HUD overlay** (top, semi-transparent):
- Background: rgba(0,0,0,0.3) blur
- Left: round back button (←) + level badge "LV 12" (primary blue bg pill)
- Right: coin balance (gold text) + "STORE" green pill button

**Jackpot tickers row** (below HUD):
- 3 horizontal segments: GRAND (red gradient), MAJOR (blue gradient), MINOR (green gradient)
- Each: tier label (white/70, uppercase, tracking-wider, 8px) + animated count (gold, monospace, 11px)
- Live counter animation: values increment continuously (RAF loop)

**Reel board** (center, dominant):
- 5×3 grid of symbol cells inside a themed frame
- Frame: themed gradient border (matches selected game), rounded-2xl, shadow
- Each cell: dark bg (#090f16), centered symbol emoji text-4xl
- Active payline highlight: cells in winning line glow with game accent color
- Reel spin animation: vertical blur/scroll effect per reel

**Bonus meter** (below reels, conditional):
- Thin horizontal progress bar
- Label: "FREE SPINS" or custom meter name (from game config)
- Fill color: game accent color, rounded-full

**Spin controls panel** (bottom):
- LCD panels row: "TOTAL BET" | "TOTAL WIN" — each metallic gold-bordered panel, dark interior, gold monospace value
- Spin button row: − button (blue circle, 48px) + SPIN button (green, large pill, 140px min-width, "▶ SPIN" / "■ STOP") + + button (blue circle, 48px)
- Bottom row: ⓘ paytable button (small circle, muted) + "MAX BET" gold pill button
- Background: gradient to dark from transparent

---

## Design System Reference

| Token | Value |
|---|---|
| `--page-bg` | `#090f16` |
| `--card-bg` | `#131a23` |
| `--border` | `#1e2631` |
| `--primary` | `#3D6AF2` |
| `--text-primary` | `#ffffff` |
| `--text-secondary` | `#a6abb5` |
| `--text-muted` | `#70767f` |
| `--success` | `#10B981` |
| `--warning` | `#F59E0B` |
| `--gold-light` | `#f0d080` (casino accent) |
| `--gold-mid` | `#d4a052` (casino accent) |

## Platform
Mobile-first (375px), full viewport height, dark mode only.

## Key Consistency Changes vs Original
- Replace purple palette (`#0d0519`, `#1a0a2e`, `#2d1052`) with Toolk1t dark palette (`#090f16`, `#131a23`, `#1e2631`)
- Replace purple border accents with primary blue `#3D6AF2` at varied opacity
- Keep gold casino accents (`#f0d080`, `#d4a052`) for coin values, titles, active nav
- Consistent `rounded-xl` / `rounded-lg` radius system
- All interactive elements: 44px min-height touch targets
- System font stack (no external fonts)
- Keep all functional states, tabs, buttons, and data intact
