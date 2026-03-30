# Resume Builder Tool — Design Document

**Date:** 2026-03-31
**Status:** DESIGN COMPLETE — Ready for implementation

---

## Understanding Summary

- **What:** A modular resume builder tool for the Toolk1t platform
- **Why:** Provide a free, AI-assisted resume creation tool with live preview, theming, and PDF export
- **Who:** Job seekers (students and professionals), Chinese and English speaking users
- **Storage:** Hybrid — localStorage for instant no-login use, Supabase sync when logged in
- **Scale:** Moderate (hundreds to low thousands of users)

### Non-Goals (v1)
- No Word/image export
- No collaborative editing
- No AI-generated full resume from scratch (only polish/continue/expand on existing content)

---

## Architecture: Single-Page Editor with State-Driven Preview

```
┌─────────────────────────────────────────────────────────┐
│  Header (existing site header)                          │
├────────┬──────────────────────┬─────────────────────────┤
│        │                      │                         │
│  Left  │   Center Panel       │   Right Panel           │
│ Sidebar│   (Editor)           │   (Live Preview)        │
│  220px │   flex-1             │   flex-1                │
│        │                      │                         │
│ ┌────┐ │  Module form fields  │  Rendered resume        │
│ │Home│ │  + TipTap editors    │  in selected theme      │
│ ├────┤ │                      │  (scrollable A4 page)   │
│ │Mods│ │                      │                         │
│ ├────┤ │                      │                         │
│ │Beau│ │                      │                         │
│ ├────┤ │                      │                         │
│ │Tool│ │                      │                         │
│ ├────┤ │                      │                         │
│ │Expo│ │                      │                         │
│ └────┘ │                      │                         │
│        │                      │                         │
├────────┴──────────────────────┴─────────────────────────┤
│  (Footer hidden in editor mode)                         │
└─────────────────────────────────────────────────────────┘
```

**Sidebar modes:**

| Sidebar Item | Center Panel Shows |
|---|---|
| **Home / Edit** | List of enabled modules as clickable cards. Click one → shows that module's edit form |
| **Module Management** | Toggle switches for all 11 modules + drag-to-reorder list |
| **Beautify** | Theme gallery + color picker + font selector |
| **Toolbox** | Resume samples browser + "AI Analyze My Resume" button |
| **Export** | Export options (PDF) + preview controls (zoom, page count) |

**Mobile (< 768px):** Sidebar collapses to bottom tab bar (matching original mobile designs). Preview panel becomes a toggle — user taps "Preview" to swap from editor to preview.

---

## Data Model

```typescript
interface ResumeState {
  id: string
  title: string
  locale: 'en' | 'zh'

  // Module visibility & order
  enabledModules: ModuleType[]

  // Module data
  baseInfo: BaseInfo              // always present (mandatory)
  jobIntention?: JobIntention
  education?: EducationEntry[]
  workExperience?: WorkExperienceEntry[]
  projects?: ProjectEntry[]
  skillsCertificates?: RichTextContent
  selfEvaluation?: RichTextContent
  training?: TrainingEntry[]
  awards?: AwardEntry[]
  internships?: InternshipEntry[]
  customSections?: CustomSection[]

  // Theme & layout
  theme: ThemeConfig

  // Meta
  createdAt: string
  updatedAt: string
}

interface ThemeConfig {
  templateId: 'classic' | 'blue-minimal' | 'yellow-minimal'
  primaryColor: string
  fontFamily: 'system' | 'serif' | 'mono'
  fontSize: 'sm' | 'md' | 'lg'
}
```

**Modules (11 total, Base Info mandatory):**

| # | Module | Type | Fields |
|---|---|---|---|
| 1 | Base Information | mandatory | name, photo, phone, email, WeChat, DOB |
| 2 | Job Intention | structured | position, type, salary, city + optional (status, industry, location, hukou, work start date) |
| 3 | Education | array of entries | school, major, degree, start/end date, description (rich text) |
| 4 | Work Experience | array of entries | company, position, industry, start/end date, description (rich text) |
| 5 | Projects | array of entries | project name, role, start/end date, description (rich text) |
| 6 | Skills & Certificates | rich text only | TipTap editor |
| 7 | Self Evaluation | rich text only | TipTap editor |
| 8 | Training | array of entries | institution, course, dates, description (rich text) |
| 9 | Awards & Certificates | array of entries | name, issuer, date, description (rich text) |
| 10 | Internships | array of entries | company, position, dates, description (rich text) |
| 11 | Custom | user-defined | type: 'richtext' (title + TipTap) or 'structured' (title + key-value rows) |

**State management:** `useReducer` + React Context. No external state library.

---

## Module Editor Forms

**Structured form modules** (education, work, projects, training, awards, internships):
- Multiple entries via "+ Add" button
- Each entry is a collapsible card with drag handle for reordering
- Structured fields at top, TipTap rich text description below
- AI action bar (Polish / Continue / Expand) below each TipTap editor

**Rich text only modules** (skills, self-evaluation):
- Full TipTap editor with toolbar + AI action buttons

**Base Info module:**
- Photo upload (drag/drop or click)
- Standard input fields (no rich text)

**Custom sections:**
- User picks type on creation: "Free-form" or "Structured"
- Free-form: title input + TipTap editor
- Structured: title input + dynamic field builder (add rows of label + value)

---

## TipTap Configuration

Reuse the whatscheap TipTap v3 pattern. Extracted as `useResumeEditor` hook.

**Extensions (lean set for resume content):**
- StarterKit (bold, italic, lists, headings 1-3, paragraph, code, blockquote, strike)
- Link
- Underline
- TextAlign (left, center, right)
- Highlight
- Placeholder

**Excluded:** Image, Table, YouTube, SlashCommands — not needed for resume descriptions.

---

## Theme System & Live Preview

**3 base templates:**

| Template | Style | Default Accent |
|---|---|---|
| Classic Solid | Clean, warm header with photo left-aligned, gold/orange accent | `#D4A052` |
| Blue Minimal | Modern, blue sidebar or header accent, structured blocks | `#3D6AF2` |
| Yellow Minimal | Bright, friendly, yellow highlights on section headers | `#F2C94C` |

**Customization:** Base template + primaryColor (color picker) + fontFamily (system/serif/mono) + fontSize (sm/md/lg).

**Live preview rendering:**
- `<ResumeDocument>` component renders at A4 aspect ratio (210mm x 297mm)
- Scaled to fit preview panel via CSS `transform: scale()`
- Each theme is a separate layout component receiving the same `ResumeState` props
- Same component used for PDF export

---

## AI Features

**Three AI actions per rich-text field:**

| Action | Behavior | Prompt Strategy |
|---|---|---|
| AI Polish | Rewrites for clarity, grammar, professional tone | "Polish this resume section for a professional audience" |
| AI Continue | Appends more content based on existing text | "Continue writing this resume section with relevant details" |
| AI Expand | Elaborates on points, adds quantifiable achievements | "Expand each point with specific details and metrics" |

**API endpoints (toolk1t-api):**

```
POST /api/v1/resume/ai-assist
Body: {
  action: 'polish' | 'continue' | 'expand'
  content: string
  context: { module: string, locale: 'en' | 'zh', jobTitle?: string }
}
Response: { result: string }

POST /api/v1/resume/ai-analyze
Body: { resumeData: ResumeState }
Response: { score: number, strengths: string[], improvements: string[], suggestions: string[] }
```

**Rate limiting:** 20 AI requests per hour per user (IP-based for anonymous, user-based for logged in).

---

## PDF Export

**Primary:** `window.print()` with `@media print` CSS — vector text, zero bundle cost, cleanest output.
**Fallback:** `html2canvas` + `jsPDF` for programmatic download.
**Filename:** `{name}_{title}_{date}.pdf`

---

## Persistence

**Auto-save flow:**
```
Field change → dispatch to reducer → debounce 1s → localStorage (key: "resume_{id}")
Explicit "Save" or page unload → if logged in → POST to Supabase
```

**Supabase tables:**

```sql
resumes
  id          uuid PK
  user_id     uuid FK → auth.users
  title       text
  locale      text
  data        jsonb        -- full ResumeState
  created_at  timestamptz
  updated_at  timestamptz

resume_photos
  id          uuid PK
  resume_id   uuid FK → resumes
  file_path   text         -- Supabase Storage path
  created_at  timestamptz
```

---

## i18n

- String map approach: `tools/resume/i18n/en.ts` and `tools/resume/i18n/zh.ts`
- Locale toggle in sidebar or editor header
- All labels, placeholders, AI prompts, and theme names are translatable

---

## File Structure

```
toolk1t-client/
├── app/tools/resume/
│   └── page.tsx                    # Route entry, ResumeProvider wrapper
│
├── tools/resume/
│   ├── resume-provider.tsx         # ResumeContext + useReducer + auto-save hook
│   ├── resume-types.ts             # All TypeScript interfaces
│   ├── resume-reducer.ts           # State reducer (all actions)
│   ├── resume-sidebar.tsx          # Left nav (5 modes)
│   ├── resume-editor.tsx           # Center panel router
│   ├── resume-preview.tsx          # Right panel (live A4 preview)
│   │
│   ├── editors/                    # One editor per module
│   │   ├── base-info-editor.tsx
│   │   ├── job-intention-editor.tsx
│   │   ├── education-editor.tsx
│   │   ├── work-experience-editor.tsx
│   │   ├── project-editor.tsx
│   │   ├── skills-editor.tsx
│   │   ├── self-evaluation-editor.tsx
│   │   ├── training-editor.tsx
│   │   ├── awards-editor.tsx
│   │   ├── internship-editor.tsx
│   │   └── custom-section-editor.tsx
│   │
│   ├── themes/                     # One layout per theme
│   │   ├── classic-layout.tsx
│   │   ├── blue-minimal-layout.tsx
│   │   └── yellow-minimal-layout.tsx
│   │
│   ├── panels/                     # Sidebar mode panels
│   │   ├── module-management.tsx
│   │   ├── beautify-panel.tsx
│   │   ├── toolbox-panel.tsx
│   │   └── export-panel.tsx
│   │
│   ├── shared/                     # Shared within resume tool
│   │   ├── use-resume-editor.ts    # TipTap hook (shared config)
│   │   ├── ai-action-bar.tsx       # [Polish] [Continue] [Expand]
│   │   ├── entry-card.tsx          # Collapsible card for array entries
│   │   └── date-range-picker.tsx   # Start/end date selector
│   │
│   └── i18n/
│       ├── en.ts
│       └── zh.ts
│
toolk1t-api/
├── app/api/v1/resume/
│   ├── ai-assist/route.ts          # POST — polish/continue/expand
│   └── ai-analyze/route.ts         # POST — resume scoring
```

---

## Decision Log

| # | Decision | Alternatives | Why Chosen |
|---|---|---|---|
| 1 | Hybrid storage (localStorage + Supabase) | Client-only, Supabase-only | Best UX: instant no-login start, persist when ready |
| 2 | Full AI in v1 | UI-only stubs, skip AI | Core differentiator |
| 3 | 3+ themes with customization | 1 theme, 3 fixed | Low incremental effort once theme system built |
| 4 | PDF only export | PDF + Word + Image | PDF covers 95% of cases |
| 5 | Left sidebar nav | Top tabs, wizard | Natural on desktop, collapses to bottom tabs on mobile |
| 6 | Split pane: editor + live preview | Separate page, WYSIWYG inline | Proven pattern, instant feedback, single render source |
| 7 | TipTap v3 | Slate, Quill | Already proven in whatscheap project |
| 8 | useReducer + Context | Zustand, Redux | Single-page scope, no external deps |
| 9 | i18n from day one (EN + ZH) | English only | Avoids costly retrofit |
| 10 | Auto-save debounced to localStorage | Manual save, auto to both | Fast local UX, explicit cloud save |
| 11 | JSONB column for resume data | Normalized tables | Simpler, flexible, sufficient at moderate scale |
| 12 | window.print() for PDF | react-pdf, html2canvas only | Vector text, zero bundle cost |
| 13 | Theme = template + color/font/size overrides | Fully custom CSS, fixed only | Good variety, minimal complexity |
| 14 | Custom sections: free-form OR structured | One type only | Maximum flexibility |
| 15 | Lean TipTap config | Full whatscheap config | Resume descriptions don't need media embeds |
