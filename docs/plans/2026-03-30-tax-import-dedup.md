# Tax Manager — Import Deduplication

## Understanding

- Deduplication system for tax transaction CSV imports
- Primary match: `source_ref` (bank's Unique Id) per entity
- Fallback match: `date + description + amount + entity_id`
- When duplicates found: preview list with bulk "Skip All" or "Replace All"
- New `source_ref` column on `tax_transactions`
- Scoped to same `entity_id`, not global

## Design

### Schema
- `ALTER TABLE tax_transactions ADD COLUMN source_ref TEXT`
- Partial index: `(entity_id, source_ref) WHERE source_ref IS NOT NULL`

### API
- **New**: `POST /api/v1/tax-manager/transactions/check-duplicates` — returns duplicate list with match type
- **Modified**: `POST /api/v1/tax-manager/transactions` — accepts `on_duplicate: "skip" | "replace"`

### Parser
- Add `sourceRef` to `ParsedTransaction`
- Map Unique Id column from bank CSVs where available

### Client
- After parse, call check-duplicates before importing
- If duplicates: show modal with preview table + Skip/Replace/Cancel
- Default action: Skip (safer)

## Decision Log

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Match by date+desc+amount+entity | Scoped, universal fallback |
| 2 | Store source_ref column | Reliable future dedup |
| 3 | Bulk Skip/Replace dialog | Visibility without tedium |
| 4 | Server-side dedup check | Avoids downloading all txns |
| 5 | on_duplicate param on POST | Minimal API surface change |
| 6 | Nullable source_ref, no DB constraint | Dedup is app logic |
