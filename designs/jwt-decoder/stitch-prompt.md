# JWT Decoder — Google Stitch Prompt

## Main Prompt

Design a dark-themed **JWT Decoder** tool page for the Toolk1t design system. The tool lets developers decode, verify, and generate JSON Web Tokens — all client-side. It has three functional sections: Decode (always visible), Verify (collapsible), and Generate (collapsible).

**Theme tokens:**
- Page background: `#090f16` (near-black deep space)
- Card background: `#131a23`
- Card hover: `#1e2631`
- Border: `#1e2631`
- Primary: `#3D6AF2` (blue), Primary-light: `#3D9DF2`, Secondary: `#32A9D9` (cyan)
- Text: `#ffffff` / `#a6abb5` / `#70767f`
- Success: `#10B981`, Danger: `#EF4444`
- Font: Inter (body/UI), system monospace (`ui-monospace, 'Cascadia Code', Menlo, monospace`) for code/token content

**Layout:**
1. **Themed header** — deep space gradient (`#0c1424` → `#111b2e` → `#0c1424`) with subtle radial dot starfield particles in blue/cyan. Contains: breadcrumb (Home › Tools › JWT Decoder), tool icon (`token` Material Symbol in `#3D6AF2`), title "JWT Decoder" in bold white, and subtitle "Decode, verify, and generate JSON Web Tokens — 100% client-side, your tokens stay in your browser." in muted text.

2. **Single-column content area** (max-width 860px, centered) with three stacked sections:

---

**Section 1 — Decode (always expanded)**

A flat content block (no outer card wrapper — blends into page). No section header needed.

- **Token input area:** Label "Paste your JWT" in `#a6abb5`. Monospace textarea (`min-height: 100px`, border `#1e2631`, bg `#131a23`, rounded-xl) pre-filled with the sample JWT. On focus: `ring-2 ring-[#3D6AF2]`.

- **Color-coded JWT token preview strip** (directly below the textarea, `rounded-xl`, `bg-[#0d1420]`, `px-4 py-3`): The raw JWT string displayed as three inline spans with `word-break: break-all`:
  - Header part: `#f87171` (red-400)
  - `.` separator: `#70767f`
  - Payload part: `#818cf8` (indigo-400)
  - `.` separator: `#70767f`
  - Signature part: `#2dd4bf` (teal-400)

- **Three decoded section cards** stacked below, each a `rounded-xl` card (`bg-[#131a23]`, border-left 4px solid matching its color):

  **Header card** (border-left `#f87171`):
  - Card bar: label "HEADER" in `#f87171` (uppercase, 11px, tracking-widest), right-aligned "Copy" ghost button with clipboard icon
  - Content: syntax-highlighted JSON — `{ "alg": "HS256", "typ": "JWT" }`

  **Payload card** (border-left `#818cf8`):
  - Card bar: label "PAYLOAD" in `#818cf8`, optional "Expired" pill badge (`bg-red-500/20 text-red-400 border border-red-500/30`, rounded-full, 11px), right-aligned "Copy" ghost button
  - Content: syntax-highlighted JSON with timestamp annotations:
    ```json
    {
      "sub": "1234567890",
      "name": "Sarah Chen",
      "email": "sarah.chen@company.io",
      "role": "admin",
      "iss": "https://auth.company.io",
      "aud": "company-app",
      "iat": 1716239022,  // May 20, 2024, 10:23:42 AM PDT
      "exp": 1716242622   // May 20, 2024, 11:23:42 AM PDT
    }
    ```
  - Timestamp annotations (`iat`, `exp`, `nbf`) shown as inline comments after the value in muted `#70767f` text: `// May 20, 2024, 10:23:42 AM PDT`

  **Signature card** (border-left `#2dd4bf`):
  - Card bar: label "SIGNATURE" in `#2dd4bf`, right-aligned "Copy" ghost button
  - Content: raw base64url signature string in monospace, `#a6abb5`, `word-break: break-all`

---

**Section 2 — Verify (collapsible, expanded by default)**

A full-width card (`bg-[#131a23]`, `border border-[#1e2631]`, `rounded-2xl`, `overflow-hidden`).

- **Collapsible header button** (`min-height: 44px`, `px-5 py-3`, `hover:bg-[#1a2230]`): Left — "Verify Signature" label (white, 14px semibold) + `verified` Material Symbol icon in `#3D6AF2` (16px). Right — chevron-down icon (`#70767f`), rotated 180° when expanded.

- **Expanded content** (`border-t border-[#1e2631]`, `px-5 pb-5 pt-4`, `space-y-4`):

  **Algorithm selector:** Label "Algorithm" in `#a6abb5` (12px). Full-width `<select>` (`bg-[#0d1420]`, `border border-[#1e2631]`, `rounded-lg`, `min-height: 44px`, `font-mono`, `text-sm`). Options grouped: HMAC (HS256 ✓ selected, HS384, HS512), RSA (RS256, RS384, RS512, PS256, PS384, PS512), ECDSA (ES256, ES384, ES512), EdDSA.

  **Secret field (HMAC mode):** Label "Secret" in `#a6abb5` (12px). Single-line text input (`bg-[#0d1420]`, `border border-[#1e2631]`, `rounded-lg`, `min-height: 44px`, `font-mono`, `text-sm`, placeholder "your-256-bit-secret" in `#70767f`). Show value `your-super-secret-key`.

  **Verification status — Valid state:** Full-width status banner (`bg-[#10B981]/10`, `border border-[#10B981]/30`, `rounded-xl`, `px-4 py-3`): `check_circle` Material Symbol in `#10B981` (20px) + text "Signature verified" in `#10B981` (14px, semibold).

---

**Section 3 — Generate (collapsible, collapsed by default)**

A full-width card (`bg-[#131a23]`, `border border-[#1e2631]`, `rounded-2xl`, `overflow-hidden`).

- **Collapsible header button** (`min-height: 44px`, `px-5 py-3`, `hover:bg-[#1a2230]`): Left — "Generate Token" label (white, 14px semibold) + `add_circle` Material Symbol icon in `#3D6AF2` (16px). Right — chevron-down icon (`#70767f`).

- **Collapsed state shown** — just the header button, content hidden. The chevron points right/down to indicate expandable.

---

**Interaction patterns:**
- All interactive elements `min-height: 44px`
- Textarea and inputs: `bg-[#0d1420]` (darker than card), `border border-[#1e2631]`, `rounded-xl` or `rounded-lg`
- Focus ring: `ring-2 ring-[#3D6AF2]/50`
- Copy buttons: ghost style — `bg-transparent`, `border border-[#1e2631]`, `text-[#a6abb5]`, `hover:border-[#3D6AF2] hover:text-white`, `rounded-lg`, `px-3 py-1.5`, `text-xs`, icon + label
- Card bar (header row of each decoded section): `bg-[#0d1420]`, `border-b border-[#1e2631]`, `px-4 py-2`
- Chevron transitions: `transition-transform duration-200`
- Scrollable panels use styled scrollbars (thin, dark track)

---

## Screen-by-Screen Refinement

### Screen 1 — Default State (Decoded, Verify expanded + valid)

The page loads with the sample JWT pre-filled. The color-coded token strip shows header/payload/signature in red/indigo/teal. All three decoded cards are visible. The Verify section is expanded showing algorithm HS256 selected, secret entered, and the green "Signature verified" banner. The Generate section is collapsed.

**Prompt addition:** "Show the tool in its natural loaded state — JWT decoded, all three colored section cards visible with realistic JSON content and timestamp annotations, Verify expanded with a green verified banner, Generate collapsed."

---

### Screen 2 — Invalid / Error State

The textarea contains a malformed or invalid JWT string. A red error banner appears directly below the textarea (`bg-red-500/10`, `border border-red-500/30`, `rounded-xl`, `px-4 py-3`, `text-red-400`): `error` Material Symbol icon + "Invalid JWT structure: expected 3 dot-separated parts." The three decoded section cards are hidden (no content to show). The Verify section shows no status banner (idle state).

**Prompt addition:** "Show the error state — malformed JWT, red error banner below textarea, decoded cards hidden, verify section idle."

---

### Screen 3 — Verify Section (Asymmetric / RSA Mode)

The Verify section is open. Algorithm is RS256. The "Secret" field is replaced by a multi-line "Public Key (PEM)" textarea (6 rows, `font-mono`, `text-xs`) pre-filled with a mock PEM key block:
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOC...
...AQ8AMIIBCgKCAQEA2a7...
-----END PUBLIC KEY-----
```
The verification status shows the invalid/error state: red banner (`bg-red-500/10`, `border border-red-500/30`, `text-red-400`): `cancel` icon + "Key mismatch: signature verification failed."

**Prompt addition:** "Show RSA verification mode — RS256 selected, PEM public key textarea visible, red invalid signature banner."

---

### Screen 4 — Generate Section (Expanded)

The Generate section is now open (chevron rotated). Content shows:
- Algorithm dropdown (HS256 selected)
- Header textarea (4 rows) with `{ "alg": "HS256", "typ": "JWT" }`
- Payload textarea (6 rows) with `{ "sub": "1234567890", "name": "John Doe", "iat": 1716239022 }`
- Secret input with placeholder "your-256-bit-secret"
- "Generate Token" CTA button: `bg-[#3D6AF2]`, white text, full-width, `rounded-xl`, `min-height: 44px`, `key` Material Symbol icon + label
- Generated output block below the button: card (`bg-[#0d1420]`, `border border-[#1e2631]`, `rounded-lg`) showing the generated JWT in `font-mono`, `text-xs`, `word-break: break-all`, `text-[#a6abb5]`. Below: right-aligned "Copy Token" button.

**Prompt addition:** "Show Generate section fully expanded — all inputs filled in, blue Generate button, and the generated JWT output card with Copy Token."

---

### Screen 5 — Mobile Layout (390px)

Full-width single-column on 390px viewport. Header is compact. Token textarea is full-width. Color-coded preview strip wraps naturally. Decoded section cards are full-width, card bar Copy buttons use icon-only (no label). Verify and Generate sections stack below. All touch targets 44px+. Algorithm select is full-width with native picker.

**Prompt addition:** "Show the mobile layout at 390px — compact header, full-width decoded cards, copy buttons icon-only, all touch-friendly 44px targets."
