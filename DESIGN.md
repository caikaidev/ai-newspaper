# DESIGN.md — The Daily Byte

Canonical design system for The Daily Byte retro AI newspaper web app.
Created by /plan-design-review on 2026-03-24.

## Aesthetic Identity

**The metaphor:** A 1920s inter-war era technology broadsheet. Aged parchment, ink-bleed typography, blackletter masthead, columnar layouts, double-rule borders. Every pixel should feel like it was set in hot metal type.

**Anti-pattern warning:** NO card grids, NO rounded corners, NO shadow boxes, NO sans-serif body text, NO modern UI patterns. If a component could appear on any SaaS dashboard, it is wrong.

---

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--ink-black` | `#0d0a04` | Primary text, borders, rules |
| `--ink-dark` | `#1a1008` | Headlines, masthead text |
| `--sepia-dark` | `#5a3a10` | Score badges, kickers, source labels |
| `--sepia-medium` | `#7a5a30` | Captions, bylines, footer text |
| `--sepia-light` | `#b8a080` | Faint dividers, dotted rules |
| `--parchment` | `#e8dcc8` | Primary background |
| `--parchment-warm` | `#f0e8d4` | Slightly lighter, used in gradients |

Background technique (body):
```css
background: #e8dcc8;
background-image:
  radial-gradient(ellipse at 20% 10%, rgba(180,140,80,0.15) 0%, transparent 60%),
  radial-gradient(ellipse at 80% 90%, rgba(140,100,50,0.12) 0%, transparent 50%),
  repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(0,0,0,0.025) 28px);
```

Vignette (fixed overlay, `pointer-events: none`, `z-index: 10`):
```css
box-shadow: inset 0 0 80px rgba(80,50,10,0.25);
```

---

## Typography

### Font Stack
| Role | Font | Fallback | Size |
|------|------|----------|------|
| Masthead | UnifrakturMaguntia | cursive | 80px desktop / 56px tablet / 40px mobile |
| Section mastheads | UnifrakturMaguntia | cursive | 24px |
| Hero headline | Playfair Display Black (900) | Georgia, serif | 40px desktop / 32px tablet / 28px mobile |
| Secondary headlines | Playfair Display Bold (700) | Georgia, serif | 16-18px |
| Body / captions | IM Fell English | Georgia, serif | 11-13px |
| Score badges / kickers | IM Fell English Italic | Georgia, serif | 8-9px |
| Code / commands | monospace (system) | Courier New | 12px |

### Text Effects
- Hero headline ink-bleed: `text-shadow: 0.5px 0.5px 0 rgba(0,0,0,0.2)`
- Masthead shadow: `text-shadow: 2px 2px 0 rgba(0,0,0,0.12)`
- No text effects on body copy — ink-bleed on small text reduces legibility

### Type Scale (line-height)
- Headlines: `line-height: 1.1`
- Decks / subheads: `line-height: 1.4`
- Body / captions: `line-height: 1.55`

---

## Spacing Scale

Base unit: 4px

| Scale | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tight padding (badge, kicker) |
| `sm` | 8px | Component internal padding |
| `md` | 12-14px | Section padding |
| `lg` | 20-24px | Between major sections |
| `xl` | 40-48px | Page margins |

Column gaps: use `border-right: 1px solid var(--ink-dark)` with `padding: 0 14px` — no CSS gap property (preserves the column-rule aesthetic).

---

## Border & Rule Patterns

| Pattern | CSS | Usage |
|---------|-----|-------|
| Masthead frame | `border-top: 6px double #1a1008; border-bottom: 6px double #1a1008` | Masthead wrapper |
| Section separator | `border-top: 3px double #1a1008` | Between major sections |
| Column rule | `border-right: 1px solid #1a1008` | Between columns |
| Thin rule | `border-top: 1px solid #1a1008` | Within sections |
| Faint dotted | `border-bottom: 1px dotted #b8a080` | Section item separators |
| Hero deck accent | `border-left: 3px solid #1a1008; padding-left: 8px` | Pull-quote style |

**Critical rule:** NO `border-radius` anywhere. NO `box-shadow` on content elements (vignette overlay only). Straight edges only.

---

## Component Vocabulary

### Score Badge
```
┌─────────────┐
│ ★ 9.4 / 10  │   border: 1px solid #5a3a10
│  HACKER NEWS│   font: IM Fell English Italic, 8-9px
└─────────────┘   color: #5a3a10
                  NO background-color (transparent)
                  NO border-radius
                  padding: 1px 5px
```

### Section Header
```
╔══════════════════════════════════════╗
║  ✦ FURTHER DISPATCHES BY SOURCE ✦   ║   font-size: 9px
╚══════════════════════════════════════╝   letter-spacing: 0.35em
                                           text-transform: uppercase
                                           border-top: 1px + border-bottom: 1px
                                           text-align: center
```

### Section Column Item
```
Title text here goes here          ★ 7.2   NO cards. NO rounded corners.
─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    border-bottom: 1px dotted #b8a080
Another item title here            ★ 6.8   padding: 4px 0
```
**Explicit anti-pattern:** Never add `background`, `rounded`, `shadow`, or `hover: background-change` to section items.

### DateNav
```
[← Previous Edition]  Monday, 24 March 2026  [Today →] [Next Edition →]
                       Edition No. 83
```
- "Today →" button: only visible when NOT viewing the latest edition
- Buttons: `border: 1px solid #1a1008`, no fill, hover: `background: #1a1008; color: #e8dcc8`
- Font: IM Fell English, 9px, uppercase, letter-spacing: 0.1em

---

## Responsive Breakpoints

### Desktop (>1024px)
- Full 3-column layout as wireframed
- Masthead: 80px UnifrakturMaguntia
- Hero headline: 40px Playfair Display
- Page max-width: 1100px centered

### Tablet (640–1024px)
- Secondary stories: 2-col grid (Col 1 + Col 2), then Col 3 full-width below
- Section columns: §HN + §Reddit in 2-col, §GitHub full-width below
- Masthead: 56px
- Hero headline: 32px
- Column padding reduced to 10px

### Mobile (<640px)
- All columns: single-column stacked
- Masthead: 40px (ensure UnifrakturMaguntia legible — test this)
- Hero headline: 28px
- DateNav: compact (prev/next on ends, date centered, "Today" icon only)
- Section items: slightly larger font (12px) for touch readability
- Vignette reduced: `box-shadow: inset 0 0 40px rgba(80,50,10,0.2)` (less heavy on small screen)

---

## Print Stylesheet (@media print)

```css
@media print {
  /* Remove interactive elements */
  .DateNav, .ai-score-badge, footer { display: none; }

  /* Remove background effects */
  body { background: white; box-shadow: none; }
  body::after { display: none; } /* vignette */

  /* Preserve column layout */
  .col-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; }
  .sections-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; }

  /* Page breaks */
  .hero { page-break-after: avoid; }
  .col-story { page-break-inside: avoid; }
  .section-item { page-break-inside: avoid; }

  /* Typography for print (72dpi) */
  .masthead-title { font-size: 48pt; }
  .hero-headline { font-size: 24pt; }
  body { font-size: 10pt; color: #000; }

  /* Preserve borders */
  * { -webkit-print-color-adjust: exact; }
}
```

---

## Accessibility Requirements

### Color Contrast (verified)
| Foreground | Background | Ratio | Passes |
|------------|------------|-------|--------|
| `#0d0a04` ink-black | `#e8dcc8` parchment | ~18:1 | AAA ✓ |
| `#1a1008` ink-dark | `#e8dcc8` parchment | ~15:1 | AAA ✓ |
| `#5a3a10` sepia-dark | `#e8dcc8` parchment | ~8:1 | AA + AAA ✓ |
| `#7a5a30` sepia-medium | `#e8dcc8` parchment | ~4.7:1 | AA ✓ (barely) |
| `#b8a080` sepia-light | `#e8dcc8` parchment | ~1.9:1 | FAIL ✗ — use only for decorative borders, never text |

**Rule:** `--sepia-light` (#b8a080) must NEVER be used for text. Decorative borders and dotted rules only.

### ARIA Landmarks
```html
<header role="banner">     <!-- Masthead -->
<nav aria-label="Edition navigation">  <!-- DateNav -->
<main>                     <!-- Front page content -->
  <section aria-label="Front page">
  <section aria-label="Hacker News dispatches">
  <section aria-label="Reddit dispatches">
  <section aria-label="GitHub trending">
<footer>
```

### Skip Link
```html
<a href="#main-content" class="skip-link">Skip to main content</a>
<!-- Visible on focus only, styled in newspaper aesthetic -->
```

### Keyboard Navigation
- All interactive elements reachable via Tab
- Focus style: `outline: 2px solid #5a3a10; outline-offset: 2px` (sepia-dark, visible against parchment)
- DateNav buttons: full keyboard activation (Enter + Space)
- Links in stories: standard underline on focus, plus focus outline
- No keyboard traps

### Touch Targets (mobile)
- DateNav prev/next buttons: minimum 44×44px
- Section item links: padding ensures 44px touch height
- Score badges are NOT interactive (no tap target needed)

### Screen Readers
- Score badge: `aria-label="AI score: 9.4 out of 10"` (not just "★ 9.4")
- Section headers: use `<h2>` for section names (§ HN, §Reddit, §GitHub)
- Hero headline: `<h1>` — only one per page
- Secondary story headlines: `<h2>` or `<h3>` depending on hierarchy
- Decorative ✦ symbols: `aria-hidden="true"`
