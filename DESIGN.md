---
name: Obsidian // 75
colors:
  surface: '#111415'
  surface-dim: '#111415'
  surface-bright: '#37393b'
  surface-container-lowest: '#0c0e10'
  surface-container-low: '#1a1c1d'
  surface-container: '#1e2021'
  surface-container-high: '#282a2c'
  surface-container-highest: '#333537'
  on-surface: '#e2e2e4'
  on-surface-variant: '#c4c7c7'
  inverse-surface: '#e2e2e4'
  inverse-on-surface: '#2f3132'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c9c6c5'
  primary: '#c9c6c5'
  on-primary: '#313030'
  primary-container: '#050505'
  on-primary-container: '#797777'
  inverse-primary: '#5f5e5e'
  secondary: '#d3fbff'
  on-secondary: '#00363a'
  secondary-container: '#00eefc'
  on-secondary-container: '#00686f'
  tertiary: '#c8c5cb'
  on-tertiary: '#303034'
  tertiary-container: '#050508'
  on-tertiary-container: '#78777c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c9c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#7df4ff'
  secondary-fixed-dim: '#00dbe9'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#004f54'
  tertiary-fixed: '#e4e1e7'
  tertiary-fixed-dim: '#c8c5cb'
  on-tertiary-fixed: '#1b1b1f'
  on-tertiary-fixed-variant: '#47464b'
  background: '#111415'
  on-background: '#e2e2e4'
  surface-variant: '#333537'
typography:
  display-xl:
    fontFamily: Playfair Display
    fontSize: 84px
    fontWeight: '700'
    lineHeight: 90px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 38px
  body-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
  spec-code:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.01em
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  container-max: 1440px
---

## Brand & Style

The brand personality is clinical, ultra-premium, and unapologetically technical. It is designed for high-end enthusiasts, tech architects, and luxury hardware collectors who value precision over approachable softness. The UI should evoke the sensation of interacting with a high-performance laboratory instrument or a luxury timepiece.

The design style is **Hard-Edge Minimalism mixed with Technical Noir**. It leverages a "Dark Mode First" philosophy where depth is communicated through light-refraction (glowing borders) rather than shadows. The aesthetic is inspired by obsidian glass, architectural blueprints, and high-frequency trading terminals. Use heavy whitespace to create a sense of exclusivity and "quiet luxury."

## Colors

The palette is anchored in high-contrast extremes.

- **Primary (Obsidian):** `#050505`. Used for the global background and core surfaces. It should feel like an infinite void.
- **Secondary (Ice-Blue):** `#00F0FF`. Used sparingly for high-energy interactions, data points, and status indicators. This is the "current" flowing through the obsidian.
- **Tertiary (Carbon):** `#1A1A1E`. Used for secondary containers, cards, and surface elevation tiers.
- **Neutral (Chalk):** `#F5F5F7`. Reserved for primary typography and high-contrast iconography.

Use a 10% opacity version of the Ice-Blue for hover states and subtle glow effects on borders.

## Typography

This system uses a high-contrast typographic pairing to balance editorial luxury with technical precision.

**Playfair Display** is used for large, expressive headlines. It should be typeset with tight tracking to emphasize its razor-sharp serifs. Use it for impact statements and section titles.

**JetBrains Mono** handles all functional UI, body copy, and metadata. Its monospaced nature reinforces the architectural and technical narrative of the system. All labels should be uppercase with wide tracking (+10%) to create a "blueprint" feel.

## Elevation & Depth

In this design system, depth is not achieved through shadows, but through **light-wireframes and tonal stacking**.

- **Level 0 (Base):** Deep Matte Obsidian (`#050505`).
- **Level 1 (Containers):** Slate Carbon (`#1A1A1E`) with a 1px border of `#2A2A2E`.
- **Active State (Focus):** Containers gain a 1px Ice-Blue (`#00F0FF`) inner glow or border.
- **Interaction:** Use "Backdrop Blur" (20px) only for overlays and navigation bars to maintain the feeling of glass floating over the obsidian void. No shadows should be used anywhere; the UI should appear as a singular, flat, backlit panel.

## Shapes

The shape language is strictly **Architectural & Sharp**. 

All corners are set to `0px` (Sharp). This reinforces the technical, engineered feel of the brand. Buttons, inputs, and cards are all rectangular blocks. 

To provide visual separation without using rounded corners, use 1px borders or "optical notches" (clipped corners) on decorative elements to suggest high-precision milling.

## Components

- **Buttons:** Rectangular with no radius. Primary buttons are solid Chalk White with Obsidian text. Secondary buttons are transparent with a 1px Ice-Blue border and Ice-Blue text. Hover states should trigger a "glow" fill of 10% Ice-Blue.
- **Inputs:** Underlined or fully boxed 1px Carbon borders. The label sits above in the "Label-sm" style. On focus, the border color snaps to Ice-Blue.
- **Chips / Tags:** Small, sharp-edged boxes with 1px borders. Use for technical specifications or status.
- **Cards:** Use Slate Carbon for the background. Headlines in Playfair Display, subtext in JetBrains Mono. Borders are 1px and visible only on the top and bottom to create a "stacked sheet" effect.
- **Lists:** Separated by 1px rules (`#1A1A1E`). Use the monospaced font for all list items to maintain alignment across columns.
- **Progress Indicators:** Thin 2px lines of Ice-Blue. No rounded caps; everything must be square-ended.