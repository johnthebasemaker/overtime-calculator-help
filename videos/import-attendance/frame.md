---
name: Overtime Calculator help
source: glass-ot-green/src/index.css (the app's own tokens, dark theme)
---

# Palette (by role)

| Role | Hex | From the app |
|---|---|---|
| Background | #0A2620 | brand-900 deepened, the app's dark glass backdrop |
| Surface (glass) | #16382F | --glass-bg dark 165 30% 22% |
| Foreground (ink) | #ECF7F2 | --ink dark 150 30% 95% |
| Ink soft | #C3D9CF | --ink-soft dark |
| Accent (one) | #10B981 | --brand-500 160 84% 39% |
| Accent deep | #059669 | --brand-600, buttons and the result header |
| Accent light | #6EE7B7 | --brand-300, ticks and figures on dark |
| Functional amber | #F59E0B | only where the app uses it: "check this", missed punch, the empty salary ring |

# Type

| Role | Family | Use |
|---|---|---|
| Display | Montserrat 900 / 700 | headlines, chapter cards, big figures |
| Captions | Montserrat 700 | voice captions, bottom band |
| UI | Roboto 400 / 700 | anything inside the phone (the app and the portal render in Android's Roboto) |

Sizes at 1080 wide: headline 96-120px, caption 46px, UI text inside the phone at its real scale.

# Shapes and motion

- Radii from the app: cards 24px, buttons 16px, phone 72px.
- Easing: out-expo for entrances, power2.inOut for camera and scroll.
- Direction rule: every seam moves leftward.

# Do / don't

- Do show real app screens (captured with invented figures) inside a phone outline.
- Do keep content in the top 83%; captions own the bottom band.
- Don't show any company name, logo, worker name, photo, code, department or real time.
- Don't use glow blooms, gradient text, or full-screen linear gradients (they band).
- Don't make every beat a fresh card (slideshow) or move things that say nothing (screensaver).
