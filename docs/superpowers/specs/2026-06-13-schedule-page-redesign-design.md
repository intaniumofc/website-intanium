# Design Specification: Schedule Page Redesign (INTANIUM #BERKILAU Theme)

This document outlines the detailed UI/UX design specifications for overhauling the Schedule Page on the Intanium Official Fanbase Website. The redesign moves away from generic templates toward a premium, highly interactive, and cohesive visual experience matching the website's brand identity.

## 1. Overview & Goals
The objective is to redesign the Schedule Page (`SchedulePage.jsx`) to feel cinematic, modern, and highly polished.
- **Brand Identity**: Align with the **INTANIUM #BERKILAU** theme (deep primary blues, glowing light pinks/cyan accents, and floating diamond/crystal star shapes).
- **Core Interactions**: 
  - **Desktop List View**: Cinematic Horizontal Scroll Timeline with scroll parallax background particles.
  - **Desktop Calendar View**: Full-Page Grid Calendar with event popovers.
  - **Mobile View**: Ergonomic Vertical Timeline (Responsive Swap) and Date Accordion Calendar View.

---

## 2. Design Tokens & Styling (Light Theme Aligned)
All styles will derive from the existing `src/styles/theme.css` parameters:

| Visual Element | Value / Rule | Description |
| :--- | :--- | :--- |
| **Main Page Background** | `--bg-primary: #FFF6F6` | Light pink-tinted white base background. |
| **Event Card Base** | `rgba(255, 255, 255, 0.85)` | Glassmorphic white semi-transparent card. |
| **Card Borders** | `1px solid rgba(23, 12, 121, 0.12)` | Subtle deep blue border to establish card shape. |
| **Card Blur** | `backdrop-filter: blur(12px)` | Premium glassmorphism backdrop blur. |
| **Card Shadow** | `0 10px 30px rgba(23, 12, 121, 0.05)` | Soft, diffused shadow based on the primary blue color. |
| **Hover Card State** | `border: rgba(23, 12, 121, 0.35)`, `shadow: 0 12px 40px rgba(23, 12, 121, 0.12)` | Glow and border thickness transition on hover. |
| **Primary Accent Color** | `--color-primary: #170C79` | Deep primary blue used for text headings and active borders. |
| **Secondary Accent Color** | `--color-secondary: #0891b2` | Cyan/Teal used for clock icons and subtle glow effects. |
| **Accent Glow** | `--color-accent: #ec4899` | Pink/Magenta accent used for status labels and nodes. |

---

## 3. Component Details & Interactivity

### A. List View (Horizontal Parallax Timeline)
The list view organizes events horizontally across a timeline.
- **Timeline Track**: A central horizontal line with a linear-gradient (`linear-gradient(to right, transparent, #170C79, #0891b2, #ec4899, transparent)`) cutting through the nodes.
- **Alternating Layout (Zigzag)**:
  - Event cards are placed alternately above and below the horizontal track.
  - Cards are connected to the central track via a small vertical glow line connecting to the timeline node.
- **Parallax Background**:
  - A background container rendered underneath the cards containing floating vector stars and crystal diamond icons.
  - As the user scrolls horizontally, these stars scroll at a slower speed (`x` position multiplier of `0.3`) relative to the cards, creating depth.
- **Card Hover 3D Tilt**:
  - Event cards (`ScheduleCard.jsx`) will feature a mouse-tilt interaction using Framer Motion. The card rotates on the X and Y axes depending on mouse coordinates.

### B. Calendar View (Full-Page Grid Calendar)
Instead of a simple mini-calendar sidebar, the calendar mode expands to a full month schedule grid:
- **Grid Structure**: 7 columns (Senin - Minggu) and 5-6 rows representing weeks of the month.
- **Date Cells**:
  - Each cell is a square box with a border.
  - Dates with events will list small horizontal tags (e.g., `14:00 - AAC Show` or `19:30 - IDN Live`) matching the platform's color.
- **Detailed Popover**:
  - Hovering (desktop) or tapping (mobile) a day's event tag triggers a beautiful floating details card (*popover*) containing:
    - Event image/poster thumbnail
    - Platform logo and title
    - Schedulable action button ("Set Reminder" or "Watch Live Stream")
    - Exact time and duration info.

### C. Responsive Mobile Adaptations (Mobile Layouts)
The interface dynamically morphs when screen width is `< 768px`:
- **Timeline**: Horizontal timeline collapses into a vertical single-column timeline. Garis timeline bergeser ke kiri, kartu berjejer di kanan.
- **Calendar**: The full-grid calendar collapses into a collapsible accordion-style monthly timeline where days with events can be tapped to expand details, preventing horizontal squeeze.

---

## 4. Animation Specifications (Framer Motion)
1. **Layout Switch (List ↔ Calendar)**:
   - Uses `AnimatePresence` with `mode="wait"`.
   - Exit animation: `opacity: 0, scale: 0.96` with `duration: 0.3`.
   - Enter animation: `opacity: 1, scale: 1` with `duration: 0.4, ease: [0.16, 1, 0.3, 1]`.
2. **Horizontal Card Entrance**:
   - Staggered child animation.
   - Cards slide up and fade in one-by-one: `y: 40, opacity: 0` to `y: 0, opacity: 1` with a delay factor of `0.06s` per card.
3. **Live Indicator Pulse**:
   - Pulsing ring animation for live event nodes using a keyframe loop: `scale: [1, 1.25, 1]` and `opacity: [0.8, 0.3, 0.8]` with duration `1.8s`.

---

## 5. Verification Plan
- **Aesthetics & Theme Check**: Ensure colors strictly derive from `--color-primary` (`#170C79`) and `--bg-primary` (`#FFF6F6`) with no generic flat gray or flat blue boxes.
- **Responsive Layout Verification**: Check mobile behavior at viewport widths of 375px (portrait) and desktop layouts at 1280px (landscape).
- **Animation Performance**: Ensure the 3D hover tilt and horizontal scroll parallax do not drop frames on lower-end devices.
- **Accessibility & Focus Rings**: Verify keyboard tab traversal through cards and popover controls, ensuring contrast ratios remain >= 4.5:1.
