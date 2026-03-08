# Cleanup Audit: Duplicate Routes and Renderers

Date: 2026-03-08
Scope: Public photo/blog flows, viewer/renderer duplication, station-era overlap, admin station overlap.

## 1. Canonical Public Routes To Keep

These are the routes currently aligned with the redesigned public UI and active navigation patterns.

| Domain | Canonical route(s) | Why canonical |
|---|---|---|
| Home section UI | `/` | Main redesigned shell (`app/page.tsx`) uses `CharacterInterfaceLayout` + `SectionContentPanel` with section switching and inline viewers. |
| Photo public | `/photo`, `/photo/[slug]`, `/photo/[slug]/[photoId]` | This family has full album -> grid -> viewer behavior, likes/comments integration, keyboard navigation, and is referenced across notifications/nav/components. |
| Blog public | `/blog`, `/blog/[slug]` | Dedicated redesigned blog index/detail flow with scene layout, cards, and comments. |
| Music public | `/music` | Uses redesigned scene wrapper and active station audio module. |
| Video public | `/video` | Top-nav canonical endpoint for public video section. |

## 2. Duplicate or Legacy Route Trees

| Route tree | Current role | Assessment |
|---|---|---|
| `/photos`, `/photos/[albumId]` | Alternate/legacy photo tree; `/photos/[albumId]` already redirects to `/photo/{slug}`. | Keep as compatibility alias for now. Good deprecation candidate after telemetry confirms low usage. |
| `/post/[slug]` | Generic post renderer used for multiple post types, including BLOG. | Functional but overlaps with `/blog/[slug]` for BLOG posts. Should become compatibility route for BLOG only, canonicalize BLOG to `/blog/[slug]`. |
| `/(sections)/[section]` (public dynamic section route) | Older section hub style; for `video` path it mounts `StationShell`. | Legacy/parallel experience compared to dedicated redesigned routes. Keep until explicit redirect strategy is ready. |
| `/admin/photos/*`, `/admin/videos/*`, `/admin/blog/*` pages | Many pages now redirect into station-style admin query flows (`/admin/photo`, `/admin/video`, `/admin/blog`). | Transitional wrappers; safe to keep until admin station is fully stabilized and documented. |

## 3. Duplicate Viewer/Rendering Components

### Photo

| Component | Active usage |
|---|---|
| `app/components/photo/PhotoViewer.tsx` | Canonical for route detail viewer (`/photo/[slug]/[photoId]`). |
| `app/components/viewers/PhotoViewer.tsx` | Canonical for Home interface inline viewer (`SectionContentPanel` viewer mode). |
| `app/photos/[albumId]/PhotosGrid.tsx` | Appears unused in active flow; legacy candidate. |

### Blog

| Component | Active usage |
|---|---|
| `app/components/blog/BlogContentRenderer.tsx` + blocks | Shared canonical renderer for block content (used by `/blog/[slug]`, `/post/[slug]`, station blog module, and inline viewer). |
| `app/components/blog/LegacyTextRenderer.tsx` | Canonical fallback for legacy text-only posts. |
| `app/components/viewers/BlogViewer.tsx` | Home interface inline blog viewer (active in `/`). |
| `app/blog/[slug]/page.tsx` | Canonical dedicated public blog detail route. |
| `app/post/[slug]/page.tsx` | Overlapping generic renderer; partially duplicates BLOG detail behavior. |

### Likely unused/low-use blog UI remnants

- `app/blog/BlogSection.tsx` (placeholder-style section component; no active imports found).
- `app/blog/BlogSidebar.tsx` (no active imports found).
- `app/blog/AnimatedContent.tsx` (no active imports found).

## 4. Safe Deprecation Candidates (Non-Destructive)

No deletion in this phase. Mark candidates with comments/docs and usage checks first.

1. `app/photos/[albumId]/PhotosGrid.tsx`.
2. `app/blog/BlogSection.tsx`.
3. `app/blog/BlogSidebar.tsx`.
4. `app/blog/AnimatedContent.tsx`.
5. Legacy aliases after migration window:
   - `/photos/*` -> keep redirect compatibility.
   - BLOG handling in `/post/[slug]` -> eventually redirect to `/blog/[slug]` for BLOG type only.

## 5. Recommended Refactor Order

### Phase 1: Observability and invariants (no behavior changes)

1. Add route-usage logging/analytics for `/photos/*`, `/post/[slug]` (BLOG), and `/(sections)/[section]`.
2. Add architecture note defining canonical families:
   - Photo: `/photo/*`
   - Blog: `/blog/*`
   - Generic post route: non-BLOG primarily.
3. Add clear ownership comments in duplicated viewer files (`route viewer` vs `home inline viewer`).

### Phase 2: Reduce duplication safely

1. Extract shared data normalizers for blog and photo into `lib/*` utilities used by both route and inline viewers.
2. Standardize blog render entrypoints on the same normalization path (`parseBlogContentForRender` where rendering tolerance is needed).
3. Standardize photo tile/view link builders in one helper to prevent path drift.

### Phase 3: Route canonicalization (compat mode)

1. Keep `/photos/*` serving redirects only; ensure all internal links point to `/photo/*`.
2. For BLOG posts accessed via `/post/[slug]`, add safe server redirect to `/blog/[slug]` (retain non-BLOG behavior in `/post/[slug]`).
3. Document deprecation window for compatibility routes and monitor 404/redirect stats.

### Phase 4: Removal phase (only after evidence)

1. Remove unused components only after import graph + runtime telemetry confirm no access.
2. Remove legacy wrappers/routes in small PRs with rollback-friendly commits.

## 6. Risks and Migration Notes

1. Risk: hidden deep links/bookmarks to `/photos/*` and `/post/*`.
   - Mitigation: keep redirects and monitor access logs before removal.
2. Risk: blog content format drift (flat blocks vs `data.*` blocks vs text legacy).
   - Mitigation: keep tolerant render normalization for public readers; keep strict validation in admin write APIs.
3. Risk: duplicated viewer logic diverges again (inline home viewer vs route viewer).
   - Mitigation: move shared mapping/URL helpers to `lib/` and add tests for route generation.
4. Risk: station modules are still used in selected public/admin flows.
   - Mitigation: treat station components as active, not dead code, until route-level replacement is complete.
5. Risk: visual regression while consolidating renderers.
   - Mitigation: change one surface at a time (photo first, blog second), validate with snapshot/manual smoke checks.

## Suggested Next Step PRs (small and safe)

1. Add `docs/routes-canonical.md` + comments in duplicated viewers clarifying active scope.
2. Introduce shared `lib/routes.ts` helpers for photo/blog URL building.
3. Add BLOG redirect logic from `/post/[slug]` when `post.type === BLOG` (compat-preserving).
