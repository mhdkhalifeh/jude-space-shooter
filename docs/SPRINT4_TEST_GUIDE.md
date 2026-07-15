# JUDE Space Shooter — Sprint 4 Test Guide

## Main fix: global music ownership

Sprint 4 prevents duplicated music instances across Phaser scenes.
Only one of these tracks can play at a time:

- `menu_music`
- `game_music`
- `boss_music`

## Test sequence

1. Run `npm install` once.
2. Run `npm run dev`.
3. Stay on the main menu and confirm only menu music is audible.
4. Open Hangar, Profile, and Information, then return to Menu several times.
   - Menu music must not become louder or duplicate.
5. Start a new game.
   - Menu music must stop completely.
   - Gameplay music must start alone.
6. Reach any boss.
   - Gameplay music must stop.
   - Boss music must play alone.
7. Defeat the boss.
   - Boss music must stop.
   - Gameplay music must return alone.
8. Pause and return to the main menu.
   - Gameplay music must stop.
   - Menu music must play alone.

## Production test

Run:

```bash
npm run build
```

Sprint 4 was built successfully before packaging.
