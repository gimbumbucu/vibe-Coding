---
name: Clarity Narrative
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#434655'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1200px
  gutter: 20px
---

## Brand & Style

The design system focuses on cognitive ease and functional clarity. It is tailored for individuals who require a focused environment for capturing thoughts, organizing tasks, and managing information without visual noise. The aesthetic is rooted in **Modern Minimalism** with a "light and airy" feel, prioritizing content over container.

The target emotional response is one of calm, order, and reliability. By utilizing generous whitespace and a restrained color palette, the interface recedes into the background, allowing the user's notes to become the primary focus. The style is professional yet approachable, avoiding the coldness of pure brutalism in favor of soft, refined edges and subtle depth.

## Colors

The palette is built upon a foundation of soft neutrals to reduce eye strain during long writing sessions.

- **Primary**: A professional Indigo (#2563EB) used exclusively for primary actions, active states, and focus indicators. 
- **Neutral/Background**: An off-white (#F8FAFC) serves as the main application canvas, providing a subtle contrast against white card elements.
- **Surface**: Pure white (#FFFFFF) is reserved for the note "paper" or card surfaces to create a clear mental model of physical notes.
- **Text**: Deep slate (#0F172A) provides high legibility for body content, while a softer slate (#475569) is used for metadata and secondary labels.

## Typography

The typography system utilizes **Inter** for its exceptional readability and systematic feel. 

- **Headlines**: Use a tighter letter-spacing and bold weights to provide a strong anchor for note titles.
- **Body Text**: Optimized for long-form reading with a comfortable 1.5x line height and standard 16px/18px sizing.
- **Labels**: Small caps or semi-bold weights are used for tags and timestamps to differentiate metadata from note content.
- **Scaling**: On mobile devices, the largest headlines scale down to prevent awkward word wrapping while maintaining the bold visual hierarchy.

## Layout & Spacing

The layout follows a **Fluid Grid** model with strict maximum widths to maintain optimal line lengths for reading. 

- **Desktop**: A centered 12-column layout with a max-width of 1200px. Content margins are generous (40px) to enhance the "airy" feel.
- **Tablet**: Transition to an 8-column layout with 24px margins.
- **Mobile**: A single-column flow with 16px horizontal margins.
- **Spacing Rhythm**: All margins and paddings are multiples of a 4px base unit. Component internal padding should generally be 16px (md) or 20px to ensure touch targets are accessible and content has "room to breathe."

## Elevation & Depth

This design system uses **Tonal Layers** and **Ambient Shadows** to create a subtle sense of hierarchy without clutter.

- **Level 0 (Base)**: The background layer (#F8FAFC), completely flat.
- **Level 1 (Cards)**: Note cards use a pure white surface with a very soft, diffused shadow (0px 2px 4px rgba(0,0,0,0.04)) and a thin 1px border (#E2E8F0) to define edges.
- **Level 2 (Interactive/Hover)**: On hover, cards lift slightly with a more pronounced shadow (0px 10px 15px -3px rgba(0,0,0,0.08)).
- **Level 3 (Modals/Popovers)**: Used for note editors or menus, utilizing a backdrop blur (8px) on the layer below to maintain context while focusing the user's attention.

## Shapes

The shape language is consistently **Rounded**, reflecting a modern and friendly toolset.

- **Standard Elements**: Buttons, input fields, and note cards use a 0.5rem (8px) corner radius.
- **Large Elements**: Dialogs and expanded note views use 1rem (16px) for a softer, more approachable appearance.
- **Small Elements**: Tags and badges use a fully pill-shaped (100px) radius to distinguish them from actionable buttons.

## Components

- **Buttons**: Primary actions use a solid Indigo fill with white text. Secondary actions use a ghost style (transparent fill, indigo border) or a subtle gray tonal fill.
- **Note Cards**: High-contrast white containers. They should feature a clear `headline-md` title and a truncated `body-md` preview. Metadata (date, tags) should use `label-sm`.
- **Input Fields**: Minimalist design with a 1px border (#CBD5E1). On focus, the border transitions to the primary Indigo color with a subtle 2px outer glow.
- **Chips/Tags**: Small, pill-shaped elements with a light tint of the primary color (Indigo 5%) and `label-sm` text.
- **Lists**: Clean, borderless list items separated by whitespace or a very faint horizontal rule (#F1F5F9).
- **Floating Action Button (FAB)**: A primary indigo circle with a white icon, used for the "New Note" action on mobile to ensure ease of use.