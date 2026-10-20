# Great Aunt Capital

A stock-trading roguelite inside Great Aunt Mildred's late-90s personal finance software. She gives you $100,000.
Watch the morning news, swipe on stock certificates, and at the Closing Bell multiply your gains
with portfolio hands and perks that trigger left to right. Beat the Boss Landlord every quarter,
build your own market with Memos and seals, buy up a different town every run,
and stay ahead of rent. Go broke, earn Pearls, unlock new aunts, come back meaner.

## Play
Once GitHub Pages is on, the game lives at `https://<your-username>.github.io/great-aunt-capital/`.
Open it on your phone. Every push to `main` redeploys automatically.

Runs save automatically in this browser after each action. Choose **Resume run** on the title screen
to continue after closing the tab. Permanent upgrades remain compatible with existing saves.
If browser storage is unavailable, the game shows a warning; keep the tab open to continue that run.
Arrow keys buy/pass; Enter or Space opens a focused perk/item, and Escape closes its sheet.

## Develop
```bash
npm install
npm run dev      # open the printed Network URL on your phone (same Wi-Fi)
npm test         # tests, including balance bounds
npm run sim      # balance report
```

The simulation uses fixed `SIM-0` through `SIM-399` seeds for repeatable comparisons. It includes
the original naive strategies, an item/hand/perk-order heuristic, and an endless-mode variant.
Both builds use local system fonts, with no external font download. The interface borrows Windows 95–98's
teal desktop, gray beveled windows, blue title bars and stock order documents. At desktop widths an account
sidebar sits beside the market; phones stack the same panels with the trading controls below.

See `AGENTS.md` for how the code is organized and `docs/DESIGN.md` for the rules and numbers.
