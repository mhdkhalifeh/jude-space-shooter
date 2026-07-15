# CHANGELOG

## v0.1.0

- Player Movement
- Mouse Control
- Single Laser
- Scout Enemy
- Fighter Enemy
- Enemy Bullets
- Score System
- Lives System
- Game Over
- Restart

---

## v0.2.0

- Wave System
- Power Up System
- Double Laser
- Explosion FX
- Camera Motion
## Sprint 2 — Combat Expansion
- Added Spread Shot, Railgun and Homing Missile weapon modes.
- Added Overdrive, Damage Boost, EMP and Repair power-ups.
- Added Sniper, Kamikaze, Shield Carrier, Medic and Heavy Cruiser enemies.
- Added enemy shields, healing support, EMP stun and sniper telegraphs.
- Added Stage 4: Ion Storm Frontier.
- Expanded infinite wave generation with the new enemy roster.
- Added per-bullet damage and railgun piercing support.

## Sprint 3 — Fleet & Sector Expansion
- Added six original transparent player ship sprites: Phantom-X, Eclipse MK-II, Spectre-7, Guardian Aegis, Nova Reaper and Titan Prime.
- Expanded the Hangar catalog to seven ships with unique prices, level requirements, abilities and stat profiles.
- Player gameplay now uses the actual selected ship texture instead of tinting the Vanguard.
- Upgraded the Hangar viewer with faux-3D perspective motion, engine particles, reflection and active-ship stat comparison.
- Added Stage 5: Quantum Rift with a new original background and harder mixed formations.
- Added Stage 6: Frozen Void with a new original background and endgame enemy compositions.
- Expanded infinite background rotation to include the two new sectors.
- Production build verified successfully with Vite.

## Sprint 4 — Audio Lifecycle Fix

- Added global ownership for background music across Phaser scenes.
- Prevented duplicate menu tracks after opening and closing menu scenes.
- Guaranteed that menu, gameplay, and boss music are mutually exclusive.
- Added boss-music transition when a boss encounter starts.
- Restored gameplay music after boss defeat.
- Added safe cleanup of duplicated or stale music instances.
- Rebuilt production bundle successfully.
