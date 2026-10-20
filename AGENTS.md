# AGENTS.md — Great Aunt Capital

Guidance for AI coding agents (Codex, Claude) working in this repo.

## What this is
A mobile-first pixel roguelite. Great Aunt Mildred gives you $100,000. Each in-game day you
watch a morning finance news show, swipe right/left on made-up stocks, back startups that
report quarterly, buy real estate that pays nightly, and pay rising rent. Go broke and you earn
Pearls for permanent upgrades. Own all 16 lots and you become a Tycoon.

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
src/main.js           entry: styles + boot()
src/game.js           state, day flow, rendering (string templates), input
src/data/content.js   ALL content and tuning tables (perks, events, lots, news, names...)
src/util.js           random helpers, money formatting, QUARTER/SIZES/ROUNDS constants
src/sprites.js        16x16 pixel sprites drawn on canvas (people, buildings)
src/styles.css        the whole look (tokens at :root)
scripts/sim.mjs       balance simulator; scripts/strategies.js holds the bot players
tests/                vitest + jsdom
```

## How the code works
- One mutable `run` object (the current run) and `meta` (saved to localStorage under
  `greataunt.meta.v1`: pearls, upgrades, bests). `scene` picks the screen.
- `render()` rebuilds `#app` from template strings for the current `scene`. Buttons use
  `data-act` attributes, handled by one delegated click listener in the Input section.
- Day flow: `startDay()` → scene `news` (TV, portfolio, headlines, Rex) → optional `pitch`
  → `play` (swipe cards) → `resolveDay()` → `resolve` → (`quarter` every 4th day) → `shop`
  → next `startDay()`. `town` can be opened from most between-day screens.
- `api` (bottom of game.js) exposes hooks for tests and the sim. `setHeadless(true)` skips rendering.

## Conventions
- Phone first: test layouts at ~380px wide. Max content width 460px. No horizontal scroll.
- Keep the look: navy studio, yellow chyrons, Silkscreen (display) + VT323 (body), cream stock
  certificates, hard pixel shadows, no rounded corners except seals. Colors come from CSS tokens.
- Copy is short, plain and funny. Name things by what players recognize. No emoji in UI.
- Money is big ($100K start). Use `fmt` for full amounts and `fmtK` for compact chips.
- New content goes in `src/data/content.js` as data, not as special cases scattered in logic.
- When you change balance, paste the before/after `npm run sim` output in the PR description.
- If you change the shape of `run`, bump `run.v`.

## Backlog (suggested next tasks)
1. **Tap a headline** to jump to the matching stock or property.
2. **Sound:** small chiptune blips for buy/pass/closing bell (start audio from a user tap).
3. **Split `game.js`:** move each scene's render function into `src/ui/scenes/*.js`.
4. **Save mid-run** to localStorage so closing the browser doesn't end a run.
5. **PWA:** manifest + icon so it can be added to a phone home screen.
