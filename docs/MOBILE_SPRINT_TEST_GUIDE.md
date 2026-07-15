# Mobile Optimization Sprint Test Guide

## Implemented
- Landscape-only mobile experience with rotate-device overlay.
- Safe fullscreen CSS and notch-aware viewport.
- Mobile device quality detection: low / medium / high.
- Reduced space dust and decorative asteroids on weaker phones.
- Smoother relative-drag ship controls (the ship no longer jumps to the touch point).
- Compact Pause and Settings panels on mobile.
- Persistent mobile Pause button.
- Touch defaults and two active pointers.

## Test
1. Run `npm install` then `npm run dev`.
2. Open Chrome DevTools device toolbar.
3. Test landscape sizes: 844x390, 915x412, 740x360.
4. In portrait, the rotate-device screen must appear.
5. In landscape, drag anywhere in the gameplay area; the ship should move relative to finger movement.
6. Open Pause and Settings; all buttons must remain inside the screen.
7. Play Stage 2+ and verify stable FPS with fewer background objects on mobile.
