---
name: RMS Manager
description: Rental property management for Thai landlords — friendly, clear, confident.
colors:
  primary: "#2c4f8a"
  primary-hover: "#1e3a6b"
  accent: "#d97706"
  accent-hover: "#b45309"
  bg: "#ffffff"
  surface: "#f5f6f8"
  surface-raised: "#ffffff"
  ink: "#1a1d23"
  muted: "#6b7280"
  border: "#e2e5ea"
  border-subtle: "#eef0f3"
  success: "#15803d"
  warning: "#b45309"
  error: "#dc2626"
  info: "#2563eb"
typography:
  display:
    fontFamily: "Kanit, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Kanit, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.005em"
  title:
    fontFamily: "Kanit, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "Inter, Kanit, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, Kanit, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
  mono:
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-danger:
    backgroundColor: "{colors.error}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  input-default:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  card-default:
    backgroundColor: "{colors.surface-raised}"
    rounded: "{rounded.lg}"
    padding: "24px"
  chip-status:
    rounded: "{rounded.full}"
    padding: "4px 12px"
  nav-item:
    rounded: "{rounded.md}"
    padding: "10px 16px"
---

# Design System: RMS Manager

## 1. Overview

**Creative North Star: "The Landlord's Ledger"**

A well-organized personal notebook: clean pages, clear numbers, the satisfaction of everything accounted for. RMS Manager is a tool that disappears into the task. The design earns trust through clarity, not ornamentation — every pixel serves the landlord's need to see what's happening across their properties at a glance.

The system is restrained by default. A single cobalt blue accent handles primary actions and current state; everything else is tonal neutrals. The interface feels airy and lifted — soft ambient shadows give panels a gentle sense of separation without heaviness. Components are tactile and confident: buttons feel solid when you press them, inputs feel grounded when you type, controls respond clearly to every action.

This system explicitly rejects: overly complex enterprise tools (SAP-style density), generic bland SaaS gray aesthetics, and dark-mode developer-facing tool styling. It also rejects decorative motion, gradient text, glassmorphism, and any visual complexity that doesn't serve the task.

**Key Characteristics:**
- **Clean pages, clear numbers.** Data density is comfortable, not cramped. White space is structural, not decorative.
- **One accent, used with intent.** Cobalt blue marks the active thing, the primary action, the current state — nothing else.
- **Ambient lift.** Cards and panels float gently above the surface. Depth is subtle and consistent.
- **Thai-first typography.** Kanit leads for headings and navigation; Inter supports body text and data. Both tested for legibility at all weights.
- **State-complete components.** Every interactive element ships with default, hover, focus, active, disabled, loading, and error states. No half-built controls.

## 2. Colors

A restrained palette: tinted cool-neutral surfaces with a single cobalt accent used at ≤10% of any screen. Warmth comes from the amber accent on status elements and the Kanit typeface's inherent personality, not from the background.

### Primary

- **Ledger Cobalt** `oklch(0.420 0.120 255)` — Primary actions, active navigation, selected state, focus rings. The brand's single voice color. Used on filled buttons, active sidebar items, and the current-page indicator. White text always.

### Secondary

- **Amber Signal** `oklch(0.600 0.160 75)` — Status accents, warnings, attention-worthy badges. Complements cobalt without competing. Used for overdue invoices, pending states, and late-fee warnings. Readable as "needs attention" without reading as "error."

### Neutral

- **Pure White** `oklch(1.000 0.000 0)` — Primary background. The page itself. Clean, unambiguous, no hidden warmth tint.
- **Cool Paper** `oklch(0.960 0.005 250)` — Card and panel surfaces. A barely-there blue-gray that reads as "slightly above the page" without competing with content.
- **Cool Slate** `oklch(0.900 0.008 250)` — Borders, dividers, table headers. Visible enough to structure, invisible enough to forget.
- **Pencil Gray** `oklch(0.550 0.010 250)` — Secondary text, placeholders, metadata, timestamps. Meets 3.5:1 contrast on white.
- **Graphite** `oklch(0.180 0.015 250)` — Primary text (ink). Deep near-black with a whisper of cool. 15.5:1 contrast on white.

### Semantic

- **Ledger Green** `oklch(0.500 0.140 155)` — Success, paid, vacant (positive status). Filled badges use white text.
- **Alert Red** `oklch(0.500 0.200 25)` — Error, overdue, destructive actions. Used sparingly and always with a text explanation.
- **Info Blue** `oklch(0.520 0.140 255)` — Informational badges, links. Distinct from primary by lightness.

### Named Rules

**The One Accent Rule.** Ledger Cobalt is the only saturated color on routine screens. Amber Signal and semantic colors appear only in response to state (a paid badge, an overdue warning, an error). If a screen uses more than two saturated colors simultaneously, the hierarchy has collapsed; fix the data, not the palette.

**The No-Tint-Background Rule.** The page background is pure white `oklch(1.000 0.000 0)`. Warmth and brand feeling come from the cobalt accent and the Kanit typeface. Adding cream, sand, or warm tints to the background is forbidden — it's the AI-monoculture move for property/management tools and it makes the interface feel dated.

## 3. Typography

**Display Font:** Kanit (with system sans-serif fallback)
**Body Font:** Inter (with Kanit, sans-serif fallback)
**Mono Font:** JetBrains Mono (with Fira Code, monospace fallback)

**Character:** Kanit brings Thai-native warmth and a confident geometric quality to headings and navigation. Its personality carries the "friendly" half of the brand. Inter handles body text, table data, labels, and form content — optically precise, x-height optimized, and proven at small sizes. The pairing works because Kanit (geometric-humanist Thai) and Inter (neo-grotesque Latin) share compatible x-heights but differ in stroke personality, creating hierarchy through contrast rather than weight alone.

### Hierarchy

- **Display** (Kanit 600, 1.875rem / 30px, line-height 1.2): Page titles only. One per screen. Letter-spacing -0.01em to keep Thai characters from gapping.
- **Headline** (Kanit 600, 1.5rem / 24px, line-height 1.3): Section headers within a page (card group headers, modal titles).
- **Title** (Kanit 500, 1.125rem / 18px, line-height 1.4): Card headers, sidebar labels, table group headers.
- **Body** (Inter 400, 0.875rem / 14px, line-height 1.6): All prose, table cell data, form help text, descriptions. Max line length 65–75ch for readable paragraphs; tables exempt.
- **Label** (Inter 500, 0.75rem / 12px, line-height 1.4, letter-spacing 0.01em): Form labels, table column headers, filter labels, metadata, timestamps.
- **Mono** (JetBrains Mono 400, 0.8125rem / 13px, line-height 1.5): Invoice numbers, ID card numbers, meter readings, any numeric data where alignment matters.

### Named Rules

**The Fixed Scale Rule.** No fluid typography (`clamp()`). Product UI is viewed at consistent DPI on laptops and desktops. Fixed rem values at each step. Responsive behavior is structural (sidebar collapse, table reformatting), not typographic.

**The Kanit-for-Structure Rule.** Kanit sets the tone; Inter does the work. If you're unsure which font to use, ask: "Is this a heading or a label?" Headings get Kanit. Everything else gets Inter. Thai body text uses Inter with Kanit fallback — Inter handles Thai adequately at body sizes, and the consistency with Latin data in the same tables matters more than the personality Kanit would add.

## 4. Elevation

Soft ambient shadows provide gentle lift. Cards and panels feel slightly above the page at rest — like paper on a desk, not glued to it. The shadow vocabulary is small and consistent.

### Shadow Vocabulary

- **Ambient Low** (`0 1px 3px oklch(0 0 0 / 0.06), 0 1px 2px oklch(0 0 0 / 0.04)`): Default card and panel shadow. Barely visible. The most common shadow in the system.
- **Ambient Medium** (`0 4px 12px oklch(0 0 0 / 0.08), 0 2px 4px oklch(0 0 0 / 0.04)`): Hover-state lift on cards, dropdown panels, popovers. Visible but still diffuse.
- **Elevated** (`0 8px 24px oklch(0 0 0 / 0.12), 0 4px 8px oklch(0 0 0 / 0.06)`): Modal dialogs, confirmation overlays. The deepest shadow; used only for stacking context jumps.
- **Focus Ring** (`0 0 0 3px oklch(0.420 0.120 255 / 0.25)`): Focus indicator on all interactive elements. Uses primary (Ledger Cobalt) at 25% opacity. Applied via `box-shadow` so it doesn't affect layout.

### Named Rules

**The Lift-on-Interact Rule.** Cards at rest use Ambient Low. On hover, they transition to Ambient Medium over 150ms. Shadows are feedback, not decoration — the card lifts to say "I'm interactive." Transition: `box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)`.

## 5. Components

### Buttons

Tactile and confident. Buttons feel solid — they have enough padding to feel grounded, and clear state changes on every interaction.

- **Shape:** Gently curved edges (10px radius, `{rounded.md}`). Not pill-shaped, not sharp.
- **Primary:** Ledger Cobalt fill, white text, padding 10px 20px. The main action on any screen.
- **Hover:** Darkens to `oklch(0.340 0.120 255)`. `translateY(-1px)` lift, shadow transitions to Ambient Medium.
- **Active:** Returns to rest position (`translateY(0)`), background darkens further to `oklch(0.300 0.110 255)`.
- **Focus:** 3px cobalt ring (Focus Ring shadow), no background change.
- **Disabled:** 40% opacity, `cursor: not-allowed`, no hover/active response.
- **Loading:** Spinner replaces text, button width maintained (`min-width`), disabled styling.
- **Secondary:** Cool Paper fill (`{colors.surface}`), Graphite text, 1px Cool Slate border. On hover: border darkens, background stays.
- **Danger / Destructive:** Alert Red fill, white text. Appears only in delete confirmations — never inline in tables. Always paired with a cancel button.
- **Ghost (text-only):** No fill, no border, primary-colored text. Padding matches other buttons. On hover: Cool Paper background appears.

### Chips / Status Badges

Status communication. Pill-shaped (full radius), compact, always paired with an icon.

- **Paid / Success:** Ledger Green background at 15% opacity, Ledger Green text at full strength, CheckCircle icon.
- **Pending / Warning:** Amber Signal background at 15% opacity, Amber text at full strength, Clock icon.
- **Overdue / Error:** Alert Red background at 15% opacity, Alert Red text at full strength, AlertCircle icon.
- **Cancelled / Neutral:** Cool Slate background, Pencil Gray text, X icon.

All badges use Label typography (Inter 500, 12px). Icons at 14px, inline.

### Cards / Containers

The ledger page. Clean, lifted, structured.

- **Corner Style:** Softly rounded (14px, `{rounded.lg}`).
- **Background:** Pure White (`{colors.surface-raised}`) on Cool Paper page background.
- **Shadow:** Ambient Low at rest, Ambient Medium on hover.
- **Border:** None by default. 1px Cool Slate border added only when cards are tightly packed in a grid (e.g., room dashboard cards) to prevent shadow overlap.
- **Internal Padding:** 24px (`{spacing.lg}`). Consistent on all four sides.
- **Table container cards:** No internal padding on the table itself — the table occupies edge to edge. Card padding applies only to non-table header/footer content.

### Inputs / Fields

Grounded and responsive. Inputs feel solid to type into.

- **Style:** Pure White fill, 1px Cool Slate border, 10px radius.
- **Padding:** 10px 14px. Comfortable for Thai characters at body size.
- **Focus:** Border transitions to Ledger Cobalt, Focus Ring shadow appears. 150ms transition.
- **Error:** Border turns Alert Red, Focus Ring uses red. Error message appears below in Alert Red at Label size.
- **Disabled:** Cool Paper fill, 60% opacity text, `cursor: not-allowed`.
- **Placeholder:** Pencil Gray text. Must pass 4.5:1 contrast on white.
- **Select / Dropdown:** Same base styling. Custom chevron icon (Lucide ChevronDown).
- **Textarea:** Same styling, resizable vertically only.

### Navigation (Sidebar)

The spine of the ledger. Always visible, structurally quiet.

- **Background:** Graphite `oklch(0.180 0.015 250)`. Deep, solid, contrasts with the white content area.
- **Width:** 256px fixed. Collapses to icon-only (64px) below 1024px viewport.
- **Logo area:** Kanit 600 at Title size. Solid white text — no gradient text (absolute ban). Building icon in a 40px rounded square with Ledger Cobalt fill.
- **Nav items:** Inter 500 at Body size (14px). Default: Pencil Gray text `oklch(0.550 0.010 250)` on transparent.
- **Active item:** Ledger Cobalt fill at 15% opacity `oklch(0.420 0.120 255 / 0.15)`, white text, 2px left indicator in solid Ledger Cobalt. Transition: 150ms ease-out.
- **Hover (inactive):** Background `oklch(1 0 0 / 0.05)`, text brightens to `oklch(0.800 0.005 250)`.
- **Logout:** Same as nav items. On hover: text turns Alert Red `oklch(0.500 0.200 25)`, background `oklch(0.500 0.200 25 / 0.08)`.

### Tables

The core ledger view. Dense, scannable, efficient.

- **Header:** Cool Paper background (`{colors.surface}`), Label typography (Inter 500, 12px), Pencil Gray text. No uppercase — Thai in uppercase looks incorrect.
- **Rows:** Alternating pure white / Cool Paper for zebra striping. Hover: Cool Paper with Ledger Cobalt left edge indicator (2px).
- **Cell padding:** 12px horizontal, 16px vertical. Comfortable for Thai text.
- **Borders:** 1px Cool Slate between rows. No vertical borders.
- **Monospace data:** Invoice numbers, meter readings, ID numbers use Mono typography for alignment.
- **Actions column:** Icon buttons (Lucide, 18px) in Pencil Gray. On hover: primary or danger color. Tooltip on hover.
- **Empty state:** Centered message with a subtle illustration or icon, body text explaining what to do. Not just "ไม่พบข้อมูล."

### Dialogs / Modals

Information focused. Clean entry, clear exit.

- **Overlay:** `oklch(0 0 0 / 0.40)` with `backdrop-filter: blur(4px)`.
- **Card:** Pure White, Elevated shadow, 14px radius. Max width by size variant (sm: 28rem, md: 32rem, lg: 42rem, xl: 56rem).
- **Header:** Headline typography, 1px Cool Slate bottom border.
- **Close button:** X icon in Pencil Gray, top-right. On hover: Cool Paper background circle.
- **Entry animation:** Fade in (overlay 200ms) + scale from 95% (card 200ms, ease-out-quart `cubic-bezier(0.25, 1, 0.5, 1)`).
- **Exit:** Reverse at 150ms. Faster out than in.

### Pagination

Consistent, compact, informative.

- **Style:** Ghost buttons for page numbers, outlined previous/next buttons.
- **Active page:** Ledger Cobalt fill, white text, no shadow.
- **Info text:** "แสดง X ถึง Y จาก Z รายการ" in Label typography on the left.

## 6. Do's and Don'ts

### Do:

- **Do** use Ledger Cobalt (`oklch(0.420 0.120 255)`) exclusively for primary actions and active state. One blue per screen.
- **Do** use white text on all saturated color fills — primary buttons, status badges, filled chips. Dark text on saturated fills is forbidden.
- **Do** provide all interactive states: default, hover, focus-visible, active, disabled, loading, error. Ship nothing incomplete.
- **Do** use skeleton loading states for content areas. Spinners only for in-button loading.
- **Do** write empty states that teach: "ยังไม่มีผู้เช่า — เพิ่มผู้เช่าคนแรกเพื่อเริ่มต้น" with a primary action button, not just "ไม่พบข้อมูล."
- **Do** maintain consistent spacing: 24px card padding, 16px element gaps, 32px page margins. Never arbitrary values.
- **Do** test Thai text (Kanit + Inter) at every weight used. Thai glyphs render wider than Latin; test with real Thai content, not placeholder English.
- **Do** use `prefers-reduced-motion: reduce` for every animation. Provide crossfade or instant alternatives.

### Don't:

- **Don't** use gradient text (`background-clip: text` with gradient). This is an absolute ban. The sidebar logo must be solid white text.
- **Don't** use glassmorphism or blur effects decoratively (login page floating orbs, card blur effects). Blur is reserved for modal overlays only.
- **Don't** use cream, sand, beige, or warm-tinted backgrounds. The body background is pure white. Warmth comes from accent colors and typography, not from surface tinting.
- **Don't** mix inline styles and Tailwind classes on the same element. Choose one approach per component. The new system uses CSS custom properties with Tailwind utilities.
- **Don't** add border-left or border-right greater than 1px as a colored accent stripe on cards or list items. Use background tints or icons instead.
- **Don't** use uppercase text transforms on Thai text. Thai has no uppercase; forced uppercase on mixed Thai-English text breaks visual rhythm.
- **Don't** use decorative motion that doesn't convey state change. No animated blob backgrounds, no gradient-shift animations, no parallax on product screens.
- **Don't** use bounce or elastic easing curves. Ease-out-quart / quint / expo only.
- **Don't** use arbitrary z-index values (999, 9999). Use the semantic scale: dropdown (10), sticky (20), modal-backdrop (30), modal (40), toast (50), tooltip (60).
- **Don't** build overly complex enterprise-style interfaces — keep each screen focused on one task per PRODUCT.md principle "One thing per screen, done well."
- **Don't** use the hero-metric template (big number + small label + gradient accent). Show room/invoice counts as inline summary, not as dashboard hero cards.
