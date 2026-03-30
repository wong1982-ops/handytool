# Resume Builder Tool — Implementation Plan

**Date:** 2026-03-31
**Design:** [2026-03-31-resume-builder-design.md](./2026-03-31-resume-builder-design.md)
**Status:** READY

---

## Phase 1: Foundation (Types, State, Layout Shell)

### 1.1 — Types & i18n
- Create `tools/resume/resume-types.ts` — all interfaces (ResumeState, BaseInfo, EducationEntry, etc.)
- Create `tools/resume/i18n/en.ts` and `zh.ts` — all UI strings

### 1.2 — State management
- Create `tools/resume/resume-reducer.ts` — all actions (SET_MODULE_DATA, TOGGLE_MODULE, REORDER_MODULES, SET_THEME, etc.)
- Create `tools/resume/resume-provider.tsx` — ResumeContext, useReducer, auto-save to localStorage (debounced 1s)

### 1.3 — Page shell & layout
- Create `app/tools/resume/page.tsx` — route entry, wraps everything in ResumeProvider
- Create `tools/resume/resume-sidebar.tsx` — left nav with 5 modes (icons + labels, collapsible on mobile)
- Create `tools/resume/resume-editor.tsx` — center panel that renders active mode/module editor
- Create `tools/resume/resume-preview.tsx` — right panel placeholder (static mock resume for now)
- Wire up 3-column layout with responsive breakpoints

**Checkpoint:** Page loads, sidebar switches modes, state persists to localStorage.

---

## Phase 2: Shared Editor Components

### 2.1 — TipTap hook
- Install TipTap v3 dependencies (core, react, starter-kit, extensions)
- Create `tools/resume/shared/use-resume-editor.ts` — shared TipTap config hook

### 2.2 — Shared UI pieces
- Create `tools/resume/shared/entry-card.tsx` — collapsible card with drag handle, delete button
- Create `tools/resume/shared/date-range-picker.tsx` — start/end month-year picker
- Create `tools/resume/shared/ai-action-bar.tsx` — [AI Polish] [AI Continue] [AI Expand] buttons (wired to API later, show loading state for now)

**Checkpoint:** Shared components render correctly in isolation.

---

## Phase 3: Module Editors (Core Content)

### 3.1 — Base Info editor
- `editors/base-info-editor.tsx` — photo upload, name, phone, email, WeChat, DOB fields

### 3.2 — Job Intention editor
- `editors/job-intention-editor.tsx` — position, type, salary, city + collapsible optional fields

### 3.3 — Education editor
- `editors/education-editor.tsx` — array of entries using entry-card + TipTap description

### 3.4 — Work Experience editor
- `editors/work-experience-editor.tsx` — same pattern as education

### 3.5 — Project editor
- `editors/project-editor.tsx` — project name, role, dates, TipTap description

### 3.6 — Skills & Self Evaluation editors
- `editors/skills-editor.tsx` — TipTap only + AI action bar
- `editors/self-evaluation-editor.tsx` — TipTap only + AI action bar

### 3.7 — Remaining editors
- `editors/training-editor.tsx` — same array pattern
- `editors/awards-editor.tsx` — same array pattern
- `editors/internship-editor.tsx` — same array pattern

### 3.8 — Custom section editor
- `editors/custom-section-editor.tsx` — type picker (free-form / structured), dynamic rendering

**Checkpoint:** All 11 modules editable, data flows through reducer, auto-saves to localStorage.

---

## Phase 4: Sidebar Panels

### 4.1 — Module Management panel
- `panels/module-management.tsx` — toggle switches + drag-to-reorder for all modules (Base Info locked on)

### 4.2 — Beautify panel
- `panels/beautify-panel.tsx` — theme gallery (3 cards with thumbnails), color picker, font selector, font size selector

### 4.3 — Toolbox panel
- `panels/toolbox-panel.tsx` — resume samples list + "AI Analyze My Resume" button (wired later)

### 4.4 — Export panel
- `panels/export-panel.tsx` — PDF export button, zoom slider for preview

**Checkpoint:** All sidebar modes functional, theme selection updates state.

---

## Phase 5: Live Preview & Themes

### 5.1 — Classic Solid layout
- `themes/classic-layout.tsx` — warm header, photo left, gold accent, section blocks

### 5.2 — Blue Minimal layout
- `themes/blue-minimal-layout.tsx` — modern blue accent, structured blocks

### 5.3 — Yellow Minimal layout
- `themes/yellow-minimal-layout.tsx` — bright yellow section headers

### 5.4 — Preview integration
- Update `resume-preview.tsx` — render selected theme layout at A4 scale, apply customization (color/font/size)
- Add zoom controls

**Checkpoint:** Live preview updates in real-time as user edits. Theme switching works.

---

## Phase 6: AI Features (API + Client)

### 6.1 — AI assist API
- `toolk1t-api/app/api/v1/resume/ai-assist/route.ts` — POST endpoint, calls Claude API with action-specific prompts, locale-aware

### 6.2 — AI analyze API
- `toolk1t-api/app/api/v1/resume/ai-analyze/route.ts` — POST endpoint, scores resume, returns strengths/improvements/suggestions

### 6.3 — Wire AI action bar
- Update `shared/ai-action-bar.tsx` — call ai-assist endpoint, inject response into TipTap editor
- Polish: replace content; Continue/Expand: append content
- Undo support via TipTap history

### 6.4 — Wire Toolbox AI analysis
- Update `panels/toolbox-panel.tsx` — call ai-analyze, display score + feedback cards

**Checkpoint:** All 3 AI actions work on every rich-text field. Resume analysis returns meaningful feedback.

---

## Phase 7: PDF Export

### 7.1 — Print CSS
- Add `@media print` styles that hide editor UI, render only the resume at A4 size
- `window.print()` triggered from export panel

### 7.2 — Programmatic fallback
- html2canvas + jsPDF fallback for browsers with poor print support
- File named `{name}_{title}_{date}.pdf`

**Checkpoint:** PDF export produces clean A4 document matching the live preview.

---

## Phase 8: Supabase Persistence (Logged-in Users)

### 8.1 — Database migration
- Create Supabase migration: `resumes` table + `resume_photos` table

### 8.2 — API endpoints
- `POST /api/v1/resume/save` — upsert resume data (JSONB)
- `GET /api/v1/resume/list` — list user's resumes
- `GET /api/v1/resume/[id]` — load a specific resume
- `DELETE /api/v1/resume/[id]` — delete a resume

### 8.3 — Photo upload
- Upload to Supabase Storage, store path in resume_photos table

### 8.4 — Client sync
- Update resume-provider: on explicit "Save", POST to Supabase if logged in
- On page load: if logged in, fetch from Supabase; merge with localStorage (newer wins)
- Show "Log in to sync" hint for anonymous users

**Checkpoint:** Logged-in users can save/load multiple resumes. Photos persist in cloud.

---

## Phase 9: Polish & Homepage

### 9.1 — Add to homepage
- Add Resume Builder to `lib/tools.tsx` and homepage grid

### 9.2 — Mobile responsive
- Bottom tab bar on mobile
- Editor/preview toggle on small screens
- Touch-friendly form inputs (44px targets)

### 9.3 — Accessibility pass
- ARIA labels on all interactive elements
- Keyboard navigation through modules
- Screen reader support for preview

### 9.4 — Loading & error states
- Skeleton loader for initial page load
- Error boundaries around TipTap editors
- Network error handling for AI/save actions

**Checkpoint:** Tool is production-ready, accessible, responsive, and listed on homepage.
