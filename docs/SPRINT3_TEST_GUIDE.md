# Sprint 3 Test Guide

## Hangar
1. Open HANGAR from the main menu.
2. Use left/right arrows or keyboard arrows.
3. Confirm each ship has a distinct sprite, signature ability, price, level lock and stat comparison.
4. Purchase/select an available ship, return to PLAY, and confirm the chosen sprite appears in gameplay.

## New sectors
- Reach Stage 5 to test QUANTUM RIFT.
- Reach Stage 6 to test FROZEN VOID.
- Confirm each sector loads its own background and completes all five waves.

## Build verification
Run:

```bash
npm install
npm run build
```

The production build should complete successfully. The large Phaser bundle warning is informational only.
