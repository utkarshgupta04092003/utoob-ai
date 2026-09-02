# uToob AI — UI Revamp Plan

**Goal:** replace the current "generic AI-generated SaaS landing page" look with a deliberate, opinionated product design. **Zero feature changes.** Every API route, Prisma query, provider, state hook and analytics event stays exactly as-is. Only presentation markup, tokens, and component shells change.

---

## 1. What currently reads as "vibe coded"

Diagnosed from the actual source, not vibes:

| # | Symptom | Where |
|---|---------|-------|
| 1 | **Indigo→purple→cyan gradient text** on the hero — the most recognizable AI-slop tell | `globals.css` `.gradient-text`, `app/page.tsx` |
| 2 | **Six feature cards, six unrelated accent colors** (blue/purple/orange/pink/cyan/yellow), each in a tinted rounded square | `app/page.tsx` features section |
| 3 | **Blur-glow halos everywhere** — `-inset-1 blur opacity-20`, `blur-[100px]`, `blur-2xl` across 4 sections | `app/page.tsx` |
| 4 | **Radius inflation**: `rounded-[3rem]`, `rounded-[2.5rem]`, `rounded-[2rem]`, `rounded-2xl`, `rounded-xl`, `rounded-full` on one page. `--radius: 1rem` is already huge as a base | globals.css + everywhere |
| 5 | **`text-8xl font-extrabold tracking-tighter`** hero — oversized, no type scale discipline | `app/page.tsx` |
| 6 | **Fake dashboard mockup hand-built in divs** (~180 lines) with dummy pulse bars and hardcoded fake video titles. An unused `public/hero-mockup.png` sits next to it | `app/page.tsx` |
| 7 | **Shadow overuse**: the `Card` base is `shadow-xl`, so *every* card in the app floats | `components/ui/card.tsx` |
| 8 | **Landing and app look like two different products.** Landing = glassmorphism + gradients. Dashboard = plain bordered cards | `app/page.tsx` vs `app/dashboard/` |
| 9 | **Three separate headers**, none shared — inconsistent heights (16/16/20) and contents | landing, dashboard, video |
| 10 | **`alert()` for errors**, raw `<select>` in settings, no toast system | `video-tabs.tsx`, `settings/page.tsx` |
| 11 | **Empty states are one italic gray line** — "No summary yet" with no affordance | `video-tabs.tsx` ×4 |
| 12 | **Loading = button text swaps to "Generating…"** — no skeleton, no progress, on a 30s AI call | `video-tabs.tsx` |
| 13 | **Inter at default tracking everywhere** — no typographic identity | `app/layout.tsx` |
| 14 | **`text-primary font-bold` on channel names** — indigo used as decoration, not meaning | dashboard, video page |
| 15 | **727-line `video-tabs.tsx`** holding 5 tab bodies, all fetch logic, and 2 sub-components | `video-tabs.tsx` |

---

## 2. The design direction

**"Editorial workbench."** The product turns video into *text you read and study*. The UI should feel like a well-set reading tool — closer to Linear / Readwise / Things than to a gradient AI landing page.

Three rules that kill the vibe-coded look:

1. **One accent color, used only for action and state.** Everything else neutral. Color earns its place; it is never decoration.
2. **Contrast from typography and spacing, not from glow.** No blur halos, no gradient text, at most one soft shadow tier.
3. **The landing page is the product.** Show real cropped app surfaces, not a hand-drawn div mockup.

### Palette

Neutral base with a slight warm shift so it doesn't read as "default shadcn slate".

```
                Light                        Dark
--background    40 12% 98%  (warm paper)     240 6%  7%   (near-black, not blue-black)
--surface        0  0% 100%                  240 5%  10%
--foreground    30  8% 12%                    40 10% 96%
--muted-fg      30  5% 45%                    40  5% 62%
--border        30  8% 89%                   240  4% 17%
--accent        15 78% 52%  (ember orange — YouTube's family without being its red)
```

Semantic-only extras: `--success` (quiz correct), `--destructive` (quiz wrong, delete). Nothing else colored. This alone removes symptoms #1, #2, #14.

**Cooler alternative** if orange feels too close to the YouTube brand: `--accent: 200 90% 40%` (deep cyan-blue). Pick one; do not ship both.

### Type

- **Display / headings:** a real display face — `Instrument Serif` or `Fraunces` via `next/font` — for h1/h2 on the landing and for page titles. A serif headline over a sans body is the cheapest way to stop looking templated.
- **Body / UI:** keep `Inter` (or move to `Geist Sans`).
- **Mono:** `JetBrains Mono` for video ids, model names, the API key field.
- **Scale — fixed, 6 steps.** No more `text-8xl`: `display 3.5rem / h1 2.25 / h2 1.5 / h3 1.125 / body 0.9375 / small 0.8125`.

### Shape and depth

- `--radius: 0.625rem` base. Allowed radii: `sm 6px / md 10px / lg 14px / full`. Nothing above 14px except pills. Kills #4.
- **Shadows:** exactly two tiers — `sm` for raised cards, `md` for overlays. `Card` default becomes `border` + `shadow-none`. Kills #7.
- **No blur halos anywhere.** Depth comes from a 1px border and a background step.

---

## 3. Screen by screen

### 3.1 Landing — `app/page.tsx`
Rewrite. Currently ~430 lines with an embedded fake dashboard.

- **Hero:** left-aligned, not centered. Serif display headline at `3.5rem`, two lines max, no gradient. One-line subhead. Single primary CTA plus a ghost "See how it works". A small mono eyebrow (`GEMINI · OPENAI`) replaces the sparkle pill.
- **Hero visual:** a real cropped screenshot of the video page (Summary tab) in a plain bordered frame, offset right and bleeding off the viewport edge — no glow, no `rounded-[2rem]`, no fake cards. Delete the 180-line div mockup.
- **Features:** drop the 6-card color grid. Replace with **three horizontal bands**, each one row: short serif heading, one sentence, and a *real UI fragment* (a quiz question, a chat bubble, a notes block) rendered from the actual components. Alternating left/right. This is what makes it look designed rather than generated.
- **Quiz section:** keep the idea but render the real `QuizQuestion` component with static props instead of re-implementing it in divs.
- **CTA:** a bordered band. No `blur-[100px]` orb, no `rounded-[3rem]`.
- **Footer:** three columns, mono small-caps labels.

### 3.2 App shell — new, shared
Currently three hand-rolled headers. Extract `components/layout/app-shell.tsx`:

- **Left sidebar, 220px** (icon rail below `lg`, bottom bar on mobile): wordmark, "Library", "Settings", spacer, theme toggle, user menu with sign out.
- **Per-page header**: title plus page actions only, `h-14`, light border.
- The video page uses the *same* shell — today it escapes it entirely.

Fixes #8, #9, #14.

### 3.3 Library — `app/dashboard/page.tsx`
Same query, same data.

- **Ingest field promoted:** full-width input row at the top with the YouTube glyph inline and a mono placeholder — not a cramped `w-80` next to the title.
- **Video cards:** thumbnail, title in body weight (not bold indigo), channel and relative time (`3 days ago`) in muted small. Hover raises border contrast only — no lift, no shadow jump.
- **Card actions** become an always-present `⋯` menu instead of `opacity-0`-on-hover, which is undiscoverable and broken on touch.
- **Empty state:** illustration slot, one line of copy, the ingest field focused, and two example URLs as clickable chips.
- Add a **grid/list toggle** and a client-side filter box — pure UI, no backend.

### 3.4 Video page — `app/video/[id]/` (the important one)

Currently header plus 5 tabs stacked in a `max-w-5xl` column.

**New layout — two panes on `lg+`:**

```
┌──────────────────────────────────────────────────────────┐
│ ← Library    Mastering React 19            [YouTube ↗]   │
├────────────────────────┬─────────────────────────────────┤
│  thumbnail             │  Summary  Notes  Quiz  Social   │
│  title / channel       │  Chat                           │
│  ─────────────         │ ────────────────────────────    │
│  ▸ Summary    ✓        │                                 │
│  ▸ Notes      ✓        │   [ generated content,          │
│  ▸ Quiz       —        │     serif body, 68ch measure ]  │
│  ▸ Social     —        │                                 │
│  ▸ Chat       3        │                                 │
│                        │                                 │
│  [ Generate all ]      │                                 │
└────────────────────────┴─────────────────────────────────┘
```

- **Left rail, 280px:** video meta plus a **status list** of the five artifacts with a state dot (generated / not yet / message count). This turns the tabs from navigation into progress — you see at a glance what exists. On mobile the rail collapses and the current horizontal tab scroller stays.
- **Reading column:** `max-w-[68ch]`, serif body at `1.0625rem/1.7` for summary and notes. This single change is what makes AI output feel premium instead of dumped.
- **Generate** moves to a sticky action in the content pane, with a **skeleton and progress line** on the content area while loading (fixes #12).
- **Quiz tab:** one question per screen with a progress bar, prev/next, and a score card at the end — instead of a flat list of all questions.
- **Social tab:** real platform cards (X / LinkedIn) in a faux post frame with a proper Copy button and toast.
- **Chat tab:** full-height pane, tighter bubble radius, composer pinned with Enter-to-send and a hint row.

### 3.5 Auth — `app/(auth)/login`, `signup`
Split layout: left 40% is an accent-tinted panel with the wordmark and a single product line; right is the form — no card, no backdrop blur. Real labels and inline field errors instead of a red box above the form.

### 3.6 Settings
Replace the raw `<select>` with a styled select. Group into two sections using Stripe-style split rows (description on the left, control on the right). API key field in mono with a masked reveal. Test-key result becomes an inline status row, not a colored alert box.

---

## 4. Component work

**New primitives** (`components/ui/`): `badge` · `select` · `skeleton` · `tabs` (Radix is already installed — wire it) · `toast` (replaces every `alert()`) · `tooltip` · `dropdown-menu` · `separator` · `empty-state` · `avatar`

**Refactors:**
- `card.tsx` — drop `shadow-xl`, tighten padding to `p-5`, radius `lg`.
- `button.tsx` — add an `xs` size and a `subtle` variant; replace the hardcoded `bg-red-500` in `destructive` with the token.
- `markdown-renderer.tsx` — real prose scale, serif body, and `p` in `foreground` rather than `muted-foreground` (AI output currently renders as if it were secondary text). Styled tables and code blocks.
- **Split `video-tabs.tsx` (727 lines)** into `_components/tabs/{summary,notes,quiz,social,chat}-panel.tsx` plus `use-generation.ts` holding the existing fetch logic verbatim. A pure move — no logic edits.

---

## 5. Execution order

| Phase | Work | Risk |
|-------|------|------|
| **0** | Branch `ui-revamp`. Screenshot every current screen for before/after. | none |
| **1** | Tokens: rewrite `globals.css` vars and the `tailwind.config.ts` scale, load fonts in `layout.tsx`. The app looks different immediately; nothing breaks. | low |
| **2** | Primitives: card/button/input refactor plus new badge, skeleton, toast, select, dropdown. | low |
| **3** | App shell and sidebar; move dashboard, settings, and video page onto it. | medium — layout only, routing untouched |
| **4** | Library redesign. | low |
| **5** | Video page two-pane split, and split `video-tabs.tsx` into panels. **Logic moved, never rewritten.** | **highest — own commit, diff the extracted logic line by line** |
| **6** | Auth and settings. | low |
| **7** | Landing rewrite; take the real screenshots for the hero once 3–6 have landed. | low |
| **8** | Pass: focus rings, keyboard nav, `prefers-reduced-motion`, 375px width, light mode on every screen. | low |

### Non-negotiable guardrails
- No changes under `app/api/`, `lib/`, `prisma/`, `providers/`.
- `useAPIKey`, `ENDPOINTS`, and all `ANALYTICS_EVENTS` calls preserved verbatim.
- Every existing `posthog.capture` stays attached to the same element.
- The `?tab=` query-param behavior on the video page is preserved.
- After each phase: `npm run check-types && npm run lint && npm run build`.

### Rough effort
Phases 1–2: half a day. 3–4: one day. 5: one day. 6–8: one day. **~3.5 focused days.**

---

## 6. What it will look like, in one paragraph

Warm off-white — or near-black in dark mode — canvas. A quiet 220px sidebar with a small wordmark and two nav items. The library is a calm grid of video cards: thumbnail, plain title, gray channel and date, hairline borders, no shadows. Open a video and the page splits: on the left the poster and a checklist showing which of the five artifacts exist; on the right a wide reading column where the AI summary is set in a serif face at a comfortable measure, like an article rather than a chat dump. One ember accent appears only on the active tab underline, the primary button, and the "generated" dots. The landing page opens with a left-aligned serif headline, no gradient, and a real screenshot of that video page bleeding off the right edge.
