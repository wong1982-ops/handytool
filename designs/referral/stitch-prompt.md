# Google Stitch Prompt — Referral System (Profile Section)

## Screen Overview

A referral section embedded within the user's profile/account page on Toolk1t. It shows a shareable referral link, sharing buttons, referral stats, and a list of recent referrals.

**Platform:** Responsive web (desktop-first, 1440px)
**Theme:** Dark mode with Toolk1t design tokens

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
purple:         #7C3AED
success:        #10B981
```

---

## Section: Invite Friends & Earn Credits

This is a **section within a profile page**, not a standalone page. Design only the referral card/section, not the full profile.

### Referral Link Card

**Container:** `max-w-2xl`, card-bg background, border, 16px radius, 24px padding.

**Header row:**
- Left: gift/invite icon (24px, primary blue) + heading `"Invite Friends, Earn Credits"` (18px, bold, white)
- Right: badge showing `"15 credits each"` (purple-500/20 bg, purple-400 text, rounded-full, 12px)

**Subtitle:** `"Share your link — you both get 15 credits when they sign up"` (14px, text-secondary). Below heading, 8px gap.

**Referral URL row** (mt-4):
- Readonly text input: full width, card-hover bg, border, 12px radius, 44px height
  - Shows: `"https://toolk1t.com/?ref=abc12345"` (14px, text-primary, truncated)
- "Copy" button: attached to right end of input (primary gradient, white text, 44px height, 12px right radius)
  - Clicked state: text changes to `"✓ Copied!"` briefly (success green)

**Share buttons row** (mt-3):
- 3 buttons in a row, gap-2:
  - `"𝕏 Share on Twitter"` — card-bg, border, text-secondary, hover to card-hover, 12px radius, 40px height
  - `"in Share on LinkedIn"` — same style
  - `"📋 Copy Link"` — same style (secondary copy option)
- Each button: 13px font, icon prefix, min-h-[40px]

---

### Stats Row (mt-6)

3 metric cards in a row, gap-3, equal width.

**Each card:** card-bg, border, 12px radius, 16px padding, text-center.

**Card 1 — Total Referrals:**
- Large number: `"7"` (28px, bold, white)
- Label: `"Total Referrals"` (12px, text-muted)

**Card 2 — Credits Earned:**
- Large number: `"105"` (28px, bold, success green #10B981)
- Label: `"Credits Earned"` (12px, text-muted)

**Card 3 — This Month:**
- Progress text: `"3 / 10"` (28px, bold, white)
- Label: `"This Month"` (12px, text-muted)
- Below label: thin progress bar (4px height, card-hover track, primary fill at 30%, 8px radius)

---

### Recent Referrals List (mt-6)

**Section header:** `"Recent Referrals"` (14px, semibold, white)

**List container:** card-bg, border, 12px radius, overflow hidden.

**Each row:** flex row, px-4 py-3, border-b border-[#1e2631] (last row no border).
- Left: user avatar placeholder (32px circle, card-hover bg, text-muted initials centered)
- Middle: name `"John D."` (14px, white) + date `"Apr 3, 2026"` (12px, text-muted) below
- Right: `"+15 credits"` badge (success green text, 13px, font-medium)

**5 sample rows** with different names and dates.

**Empty state** (when no referrals):
- Centered in card: gift icon (32px, text-muted) + `"No referrals yet"` (14px, text-secondary) + `"Share your link to get started!"` (13px, text-muted)

---

## Mobile Responsive (< 768px)

- Referral link card: full width
- Share buttons: stack vertically (full width each)
- Stats: stack vertically (full width cards)
- Recent list: same layout, full width

---

## Interaction Notes

- Copy button shows "Copied!" for 2 seconds
- Twitter share opens new window with pre-filled tweet
- LinkedIn share opens new window with pre-filled post
- Stats update in real-time when returning to profile after a referral
- Progress bar animates on mount (0 → current value, 300ms ease)
