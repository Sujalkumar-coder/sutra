# Sutra Studio — CMS Build

This build keeps the existing Sutra visual language and adds the requested CMS/content behavior.

## One Supabase migration for this build

Run once in Supabase SQL Editor:

```sql
alter table public.projects
  add column if not exists work_type text;

create index if not exists projects_work_type_idx on public.projects(work_type);
```

The earlier service gradient migration remains required and is already included under `supabase/004_service_gradients.sql`.

## Local setup

Create/edit `.env.local` in the project root:

```env
VITE_SUPABASE_URL=YOUR_EXISTING_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_EXISTING_SUPABASE_PUBLISHABLE_KEY
```

Then:

```bash
npm install
npm run dev
```

Open the URL Vite prints, normally `/sutra/` for the GitHub Pages base path.

## Key behavior

- Hero note removed from the public homepage.
- Intro video uses minimal custom Sutra controls; YouTube/Vimeo provider controls are disabled for the public embed.
- Intro video pauses and mutes when it leaves the viewport and resumes from its current position when it returns.
- Selected Work keeps five visible media slots, pauses/mutes background media, blurs background cards, and warms the next/previous project media in a small off-screen cache to reduce transition waits.
- Selected Work active media retains compact custom controls.
- Clients use a left client selector, a full-frame multi-image center gallery with its own arrows, and a fixed-size client-photo panel on the right.
- Services keep configurable gradients in the CMS.
- Projects have a predefined Work Type field so service pages can group work cleanly (Short Form, Long Form, Commercial, Social / Reel, Explainer, Product / Launch, Brand Film, Other).
- Service pages are intentionally minimal: back link, service title, project count, grouped project list, no decorative service artwork and no footer.

SUTRA FINAL v8
- Shared global mute preference across hero/work media; persisted locally.
- Per-video pause memory in the current browser session; manual pause blocks automatic archive movement.
- Hero/work videos pause when their section leaves the viewport and resume only when not manually paused.
- Visible carousel media remains mounted; extended warm cache and eager iframe loading for faster transitions.
- Client portrait uses 4:5 presentation with full-frame photo and single-letter watermark at bottom-left.
- Service-page thumbnails fall back to uploaded thumbnail, poster, or YouTube poster.
- Admin CONTENT and SITE headings are visually non-clickable and visually distinct.
- Reset controls added to project/client/service/intro/site editors.
- Footer liquid emitter radius enlarged conservatively for a wider, more visible effect.


## V10 final fixes

- Fixed the Projects editor crash so New Project and Edit Project open normally.
- Manual pause in Selected Work is now a session-wide archive pause until Play is explicitly chosen again; automatic movement cannot start another project while paused.
- Removed the secondary “Open project” CTA from the Moving Archive; the project title is the only link to its detail page.
- Far background cards fade at their own edges instead of masking the complete Work section; section controls and project metadata remain crisp.
- Tightened the What We Do explorer height and spacing so the last service closes the composition cleanly.
- Reduced the footer SUTRA wordmark and kept the liquid emitter radius proportional to its height, with a 250px maximum.

## Live admin access

After GitHub Pages deployment, the public admin is available at:

`https://sujalkumar-coder.github.io/sutra/admin/`

Bookmark that URL. It uses the same Supabase Auth login; the admin is not a localhost-only feature.
