---
version: alpha
name: Jackson Classic Portfolio Design System
description: Formal design specification and token schema for the 2-column sidebar portfolio layout based on the Jackson design archetype.
colors:
  primary: "#2C98F0"
  secondary: "#EC5453"
  tertiary: "#F9BF3F"
  accent-purple: "#A84CB8"
  accent-teal: "#2FA499"
  accent-indigo: "#40ACFF"
  neutral-dark: "#000000"
  neutral-text: "rgba(0, 0, 0, 0.72)"
  neutral-muted: "rgba(0, 0, 0, 0.45)"
  neutral-light: "#F2F3F7"
  surface-sidebar: "#F2F3F7"
  surface-main: "#FFFFFF"
  surface-card: "#FFFFFF"
  surface-accordion-inactive: "#F2F3F7"
  banner-bg: "#F9BF3F"
  border-subtle: "rgba(0, 0, 0, 0.08)"
  border-medium: "rgba(0, 0, 0, 0.14)"
  dark-surface-sidebar: "#0B0F19"
  dark-surface-main: "#111827"
  dark-surface-card: "#192237"
  dark-text-primary: "#F8FAFC"
  dark-text-secondary: "#CBD5E1"
  dark-text-muted: "#8492A6"
typography:
  display-lg:
    fontFamily: MaruBuri
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.01em
  headline-xl:
    fontFamily: MaruBuri
    fontSize: 38px
    fontWeight: 700
    lineHeight: 1.25
  headline-lg:
    fontFamily: MaruBuri
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.35
  headline-md:
    fontFamily: MaruBuri
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.4
  headline-sm:
    fontFamily: MaruBuri
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.4
  body-lg:
    fontFamily: MaruBuri
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.8
  body-md:
    fontFamily: MaruBuri
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.8
  body-sm:
    fontFamily: MaruBuri
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.6
  heading-meta:
    fontFamily: Quicksand
    fontSize: 11px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: 5px
  sidebar-nav:
    fontFamily: Quicksand
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.0
    letterSpacing: 1.5px
  label-badge:
    fontFamily: Quicksand
    fontSize: 11px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: 1px
  code-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.6
rounded:
  none: 0px
  xs: 2px
  sm: 4px
  md: 8px
  lg: 16px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  4xl: 96px
  sidebar-width: 300px
  container-max: 1140px
  gutter: 30px
components:
  sidebar:
    backgroundColor: "{colors.surface-sidebar}"
    width: "{spacing.sidebar-width}"
    borderColor: "{colors.border-subtle}"
    padding: "{spacing.2xl} {spacing.xl}"
  nav-link-active:
    textColor: "{colors.primary}"
    underlineColor: "{colors.primary}"
    underlineWidth: 26px
    underlineHeight: 2px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.xs}"
    padding: "12px 24px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-dark}"
    borderColor: "{colors.neutral-dark}"
    rounded: "{rounded.none}"
    padding: "12px 24px"
  button-banner:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-dark}"
    borderColor: "{colors.neutral-dark}"
    rounded: "{rounded.none}"
    padding: "12px 28px"
  card-about-service:
    backgroundColor: "{colors.surface-card}"
    padding: "{spacing.xl} {spacing.lg}"
    rounded: "{rounded.xs}"
    borderBottomWidth: 3px
  banner-milestone:
    backgroundColor: "{colors.banner-bg}"
    padding: "{spacing.2xl} {spacing.xl}"
    textColor: "{colors.neutral-dark}"
    rounded: "{rounded.none}"
  accordion-header-active:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    padding: "16px 24px"
  accordion-header-inactive:
    backgroundColor: "{colors.surface-accordion-inactive}"
    textColor: "{colors.neutral-dark}"
    padding: "16px 24px"
---

# Jackson Classic Portfolio Design System

## Overview
Jackson Design System is an editorial, high-clarity portfolio aesthetic characterized by a classic **two-column split layout** (fixed navigation sidebar on the left and a continuous scrolling narrative canvas on the right). It merges timeless editorial serif typography with modern, vibrant multi-color accents.

- **Brand Personality**: Scholarly, confident, organized, creative, and structured.
- **Visual Tone**: Clean editorial white and cool gray foundations punctuated by a signature 6-color palette (Blue, Coral Red, Golden Yellow, Royal Purple, Mint Teal, and Sky Blue).
- **Target Experience**: Seamless storytelling for developers, designers, and engineers showcasing high-impact achievements and technical depth without visual clutter.

---

## Colors
The color architecture combines high-contrast neutral backgrounds with 6 signature accent colors that rotate across capability cards, progress bars, and timeline milestones.

- **Primary Blue (`#2C98F0`)**: The core brand color representing primary actions, active navigation items, accordion active states, and focal points.
- **Secondary Coral Red (`#EC5453`)**: High-energy accent used for deep-dive categories, alerts, and complementary service borders.
- **Tertiary Golden Yellow (`#F9BF3F`)**: Warm statement color for milestone callout banners, stat highlights, and attention blocks.
- **Royal Purple (`#A84CB8`)**: Prestige accent for fundamentals, architecture, and desktop native tools.
- **Mint Teal (`#2FA499`)**: Crisp technical accent for data, GIS, testing, and cloud infrastructure.
- **Sky Blue (`#40ACFF`)**: Vibrancy accent for AI orchestrations, streaming tokens, and secondary highlights.
- **Surface Sidebar (`#F2F3F7`)**: Subtle cool gray for the fixed sidebar canvas in light mode.
- **Surface Main (`#FFFFFF`)**: Pure white editorial background for primary content reading.

---

## Typography
A dual-font hierarchy creates an editorial balance between classical elegance and contemporary legibility.

- **Display & Headlines (`Playfair Display`, serif)**: Used for all major section titles, hero catchphrases, milestone banners, and card titles (`display-lg`, `headline-xl`, `headline-lg`, `headline-md`). Expresses authority and craftsmanship.
- **Body & Structural Text (`Quicksand` / `Pretendard`, sans-serif)**: Used for running paragraphs, bullet lists, descriptions, and captions (`body-lg`, `body-md`, `body-sm`). Features a generous line-height (`1.8`) for effortless long-form reading.
- **Section Meta Labels (`heading-meta`)**: Uppercase, tracked small labels (`11px`, `letterSpacing: 5px`, `fontWeight: 700`) preceding major headings (e.g., `ABOUT US`, `WHAT I DO?`, `MY SPECIALTY`, `EDUCATION`, `MY WORK`).
- **Sidebar Menu Items (`sidebar-nav`)**: Uppercase tracking (`13px`, `letterSpacing: 1.5px`, `fontWeight: 600`) with dynamic centered underline indicators on active state.
- **Code & Numeric Badges (`JetBrains Mono`, monospace)**: Used for milestone statistics, timestamps, technical tags, and architecture diagrams (`code-mono`).

---

## Layout
The viewport is divided into a dedicated navigation pillar and an expansive content canvas.

- **Split Grid Model**:
  - **Desktop (≥992px)**: Fixed left sidebar (`width: 300px`) locked to full viewport height (`position: fixed; top: 0; bottom: 0; left: 0;`). The main content scroll canvas sits at `margin-left: 300px` with a maximum container width of `1140px`.
  - **Mobile (<992px)**: Fluid off-canvas drawer. The sidebar translates off-screen (`transform: translateX(-100%)`) and slides in smoothly upon toggling the floating top-left hamburger button. Main content takes `100%` width with `24px` gutter padding.
- **Vertical Rhythm**:
  - Consistent section padding (`90px 0` desktop, `70px 0` mobile).
  - Each section is bounded by a subtle `1px` bottom border (`border-subtle`).
  - Strict spacing scale based on multiples of 4px and 8px (`sm: 8px`, `md: 16px`, `lg: 24px`, `xl: 32px`, `2xl: 48px`).

---

## Elevation & Depth
Depth is created through clean atmospheric layering and subtle structural borders rather than heavy, dramatic shadows.

- **Card Elevation**: Default cards utilize a soft dimensional drop shadow (`0 2px 8px rgba(0, 0, 0, 0.05)`) on white backgrounds. On hover, elements elevate with `transform: translateY(-6px)` and an expanded soft shadow (`0 20px 40px -15px rgba(0, 0, 0, 0.12)`).
- **Color Edge Anchoring**: Cards and information panels use solid `3px` or `4px` color borders on the bottom or left edge to define hierarchy without visual weight.
- **Off-Canvas Depth**: The active mobile sidebar projects a deep contextual drop shadow (`10px 0 40px rgba(0, 0, 0, 0.35)`) over the backdrop.

---

## Shapes
The design embraces a clean, rectangular editorial shape language with precise micro-radii.

- **Structural Cards & Buttons**: Minimal `4px` radius (`rounded.sm`) or crisp `0px` square borders (`rounded.none`) on outline buttons to evoke print publication aesthetics.
- **Profile Avatar & Status Badges**: Perfect `50%` circles (`rounded.full`) for the 140px profile avatar, social icon circles, status dots, and timeline node badges.
- **Pill Badges & Tabs**: `rounded.full` (9999px) for category filter buttons and technology skill badges to maintain interactive affordance.

---

## Components
Detailed token mappings and visual rules for core interactive atoms and composite molecules:

- **Sidebar Header**:
  - **Avatar**: 140px circular box with `3px` solid border, accompanied by a pulsing status indicator dot (`#10B981`).
  - **Author Title**: Serif author name (`Playfair Display`, `25px`) with uppercase muted subtitle (`13px`).
- **Sidebar Menu Navigation**:
  - Vertical list with `8px` vertical padding.
  - Active item features brand blue text (`#2C98F0`) and a centered `26px × 2px` bottom indicator bar.
- **About Capability Cards (4-Color Box Set)**:
  - White background, `24px` padding, light shadow, and colored bottom border (`color-1` to `color-4`).
  - Glyphic icon wrapped in a soft 12% tinted color container (`50px × 50px`).
- **Golden Milestone Banner**:
  - Full-width block in tertiary yellow (`#F9BF3F`).
  - High-contrast black serif title (`30px`) paired with a black rectangular outline button (`HIRE ME`).
- **Hexagon / Expertise Service Cards**:
  - Elevated card with a top-centered colored hexagon badge holding a white line icon.
  - Bold uppercase serif title with 3-line descriptive copy and bottom color border.
- **Skills Multi-Color Progress Bars**:
  - Dual-column layout where each skill features a custom color bar (`#2C98F0`, `#EC5453`, `#F9BF3F`, `#A84CB8`, `#2FA499`, `#40ACFF`).
  - Distinct colored indicator pin on the leading edge of the animated bar.
- **Education Accordion Panels**:
  - **Active Panel**: Solid Primary Blue header (`#2C98F0`), white text, and a minus (`−`) glyph. Body opens with a 2-column editorial summary on `#F2F3F7`.
  - **Inactive Panel**: Soft gray background (`#F2F3F7`), dark text, plus (`+`) glyph, with a 1px border separator.
- **Action Buttons**:
  - **Primary**: Solid blue fill, white text, subtle shadow (`rounded.sm`).
  - **Outline / Editorial**: Transparent fill, 2px dark border, uppercase text with tracking (`rounded.none`).

---

## Do's and Don'ts

### Do's
- **Do** precede every major section title with an uppercase, wide-tracked `.heading-meta` label.
- **Do** preserve the fixed 300px sidebar layout on screens 992px and above.
- **Do** rotate across the 6 signature colors (`color-1` through `color-6`) across repeated cards, progress bars, and timeline nodes.
- **Do** use `Playfair Display` exclusively for headings/titles and `Quicksand` for body and interactive labels.
- **Do** maintain a generous line-height of `1.8` on all body paragraphs for editorial comfort.
- **Do** ensure all outline buttons use uppercase text and sharp or minimal 4px corners.

### Don'ts
- **Don't** place navigation in a top horizontal bar on desktop; all navigation must live inside the left sidebar.
- **Don't** use generic default blue/red colors; always adhere to the calibrated Jackson hex codes.
- **Don't** mix heavy rounded pills (`radius > 8px`) on structural cards or editorial buttons.
- **Don't** omit the colored bottom border on About/Service cards.
- **Don't** allow the sidebar to overlap main content on desktop; always reserve the 300px left margin.
