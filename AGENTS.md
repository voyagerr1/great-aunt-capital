# AGENTS.md — Great Aunt Capital

Guidance for AI coding agents (Codex, Claude) working in this repo.

## What this is
A mobile-first pixel roguelite with a Balatro-style scoring engine. You inherit $100,000 from
your great aunt (never named) and try to become the richest person in the world. Each in-game day you watch a morning finance news show, swipe right/left on stocks from a
persistent market deck, and at the Closing Bell your gains are multiplied by MULT built from your
portfolio hand and perks (triggered left to right). Every quarter ends with a Boss Landlord. Buy a
procedurally drawn town, buy Memos/Almanacs/Envelopes (they take effect on purchase; nothing is activated), and pay rising rent. Go broke
and you earn Pearls for permanent upgrades, new aunts and harder moods. Own all 16 lots to become a
Tycoon, then keep going in endless mode.

Full rules and current numbers: `docs/DESIGN.md`.

## Commands
- `npm install` once.
- `npm run dev` starts Vite with `--host`, so a phone on the same Wi-Fi can open it.
- `npm test` runs vitest (content checks, every screen renders, balance bounds). Must pass before committing.
- `npm run sim` prints the balance report (bot strategies × position sizes). Run it after any change to numbers.
- `npm run build` builds `dist/` for GitHub Pages (CI does this on push to `main`).
- `npm run build:single` builds `dist-single/index.html`, one self-contained file for quick sharing.

## Layout
```
index.html            page shell, fonts
src/main.js           entry: styles + boot() (dev builds expose the test api as window.gac)
src/game.js           state, day flow, Closing Bell scoring, shop, consumables, rendering, input
src/engine/hands.js   which portfolio hands a day's buys qualify for (pure)
src/engine/perks.js   Closing Bell hooks per perk (card / end), +MULT and xMULT
src/data/content.js   ALL content and tuning tables (perks, hands, memos, bosses, arcs, districts, aunts...)
src/util.js           seeded RNG, money + big-number formatting, QUARTER/SIZES/ROUNDS constants
src/persistence.js    versioned checkpoints and shared company reference restoration
src/audio.js          WebAudio chiptune blips (unlocked on first tap)
src/juice.js          cosmetic celebration effects: count-ups, popups, bill bursts, the Solitaire money cascade
src/share.js          end-of-run certificate PNG + share sheet
src/sprites.js        16x16 pixel sprites drawn on canvas (people, buildings)
src/styles.css        the whole look (tokens at :root)
src/ux.css            player-facing hierarchy and feedback
src/layout.css        viewport-fitting trading layout and compact breakpoints
scripts/sim.mjs       balance simulator; scripts/strategies.js holds the bot players
tests/                vitest + jsdom
```

## How the code works
- One mutable `run` object (the current run) and `meta`. The localStorage entry
  `greataunt.meta.v1` saves progression and a versioned checkpoint atomically, after each rendered action.
  Checkpoints include the run, scene, shop and RNG state. Headless bots do not write saves.
  `scene` picks the screen. Keep checkpoint validation aligned with changes to run state.
- `run.perks` is an ordered list of `{id, ed, st}` slots; always go through `has(id)` / `activePerks()`
  (they handle the Intern and boss-disabled perks). Suppression follows the perk object for the day,
  including copies; clear it at the next day's setup. `run.deck` holds the persistent companies; a day's
  certificates are `{co, up, hint, ...}` wrappers around them.
- Today's effects are merged into `run.fx` by `buildFx()` (event + story-arc step + boss). Read them with `fx(key)`.
- `render()` rebuilds `#app` from template strings for the current `scene`, then appends the perk/consumable
  sheet (`run.modal`) and starts the Closing Bell animation. Buttons use `data-act` attributes, handled by one
  delegated click listener in the Input section.
- Day flow: `startDay()` → scene `news` → `play` (swipe cards) → `resolveDay()`
  (`scoreMoves()` then `closingBell()`) → `resolve` → `shop` (Newsstand, or the Broker on boss days)
  → next `startDay()`. `town` opens from most screens. Hands, boss, perk and item details are sheets (`run.modal.kind`).
- `api` (bottom of game.js) exposes hooks for tests and the sim. `setHeadless(true)` skips rendering.
- The RNG is seeded per run. Use `R()`/`pick`/`rr`/`shuffle` from util.js, never `Math.random`, in game logic.

## Conventions
- Phone first: test layouts at ~380px wide and 320×568. Trading fits the viewport without page, stock or account scrolling; reserve scrolling for dialogs and menu lists. The trading window caps at 1100px on normal desktops, with a three-column layout for short landscape windows. Other menus retain the 960px cap.
- Keep it focused: every system should feed the swipe → Closing Bell loop. Prefer a sheet over a new screen.
- Keep the look: Windows 95–98 personal finance software. Teal desktop, gray beveled windows,
  navy title bars, Tahoma/system text, white stock order documents and spreadsheet reports.
  Keep pixel portraits/buildings, clear gain/loss colors, and plain readable labels. No CRT overlay,
  external font dependency, or layered playing-card deck. Mobile trading condenses account controls and keeps the full stock and decision panel visible. Complete modifiers and market news open in dialogs. Trading geometry is owned by src/layout.css.
- Copy is short, plain and funny. Name things by what players recognize. No emoji in UI.
- Money is big ($100K start). Use `fmt` for full amounts and `fmtK` for compact chips.
- New content goes in `src/data/content.js` as data, not as special cases scattered in logic.
- When you change balance, paste the before/after `npm run sim` output in the PR description.
- If you change the shape of `run`, bump `run.v`.

- New perk with scoring? Add the row to `PERKS` and its hook to `PERK_FX`. New boss/arc/event? Data only,
  reusing the `fx` keys listed above `EVENTS`, `BOSSES` and `ARCS`; add a new key's handling in one place.

## Backlog (suggested next tasks)
1. **Improve the heuristic bot** using playtest evidence; fixed-seed smart and endless variants now order perks, use selected items and consider hand completion.
2. **Drag to reorder perks** in the HUD (the sheet's Move buttons work today).
3. **Split `game.js`:** move each scene's render function into `src/ui/scenes/*.js`.
4. **Phone QA:** validate layout, swipe feel, browser resume and native sharing on real devices.
5. **PWA:** manifest + icon so it can be added to a phone home screen.
6. **Booster packs** at the Broker (pick 1 of 3 Memos / Almanacs).
