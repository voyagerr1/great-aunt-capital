# Great Aunt Capital — Design Notes

Version 0.4. Numbers live in `src/data/content.js` and `src/game.js`; this doc explains them.

## Pitch
Great Aunt Mildred hands you $100,000. Read the morning news, swipe on stock certificates,
back weird startups, buy the town, and stay ahead of rent. Every run ends broke, except for a
truly great run, where you own everything and live off passive income.

Look: a 1980s cable finance channel (GAC-TV). Navy studio, yellow chyrons, LIVE bug, ticker
crawl, pixel anchors. Stocks are engraved certificates.

## The day loop
1. **Morning news (GAC-TV Market Morning).**
   - Portfolio report: net worth, change since yesterday, all-time vs the starting gift, and a
     breakdown by cash, property, startups and listed shares.
   - Two sector headlines (▲/▼). Each day two sectors have a hidden trend. Headlines report it
     correctly 80% of the time (Premium Cable upgrade and Anchor's Nephew perk raise this).
   - One extra headline about a listed share you own (hints its next move), else fluff.
   - Rex Shouter's hot pick on one stock: right 55% of the time.
   - Daily event chyron (see Events).
2. **Pitch (sometimes).** From day 2, 45% chance, at most 3 open startups.
3. **Market.** 4 certificates (+1 per Longer Ticker Tape level). Each has sector, risk 1–3,
   price per share, a rumor (65% accurate), sparkline. Pick a position size
   (10/25/50% of morning cash, or Max) and swipe right to buy whole shares, left to pass.
4. **Closing bell.** Every stock's move is revealed, including passed ones. Then property
   income, then rent. Quarter end (every 4 days): startup reports, then the broker.

## Stock math
- Trend sector up: 78% chance to rise; down: 26%; otherwise 52%. Bear Hug event −17 points.
- Move size: `rand(0.25..1) × vol` where vol = 0.2 / 0.45 / 0.9 by risk. Up moves ×1.5.
- Editions: Gold Leaf (+50% gains), Volatile (×2 moves), Unlisted (no rumor, ×2 moves).

## Startups (quarterly)
- Stats 1–5: Team, Product, Market, Hype. Traits nudge stats; "Already profitable" flags
  the company as profitable.
- Ask: 12–25% of current cash. Your stake value = ask × valuation multiple `m`.
- Each quarter end: bust chance `0.38 − q·0.32` (q = (team+product+market)/15; profitable ×0.4;
  Angel Wings −0.10). Exit chance `0.10 + 0.18·round` (+0.15 profitable).
  Exit is IPO (likelier with Hype) or buyout for cash. Otherwise a funding round re-prices
  `m` and shifts one stat up or down.
- IPO shares become listed holdings that move daily (bigger swings the first 2 days). You sell
  when you like. Morning news hints their direction.

## Real estate (Mildred's Town)
- 16 lots, 4 districts (Old Town, Suburbs, Harbor, Skyline), $15K to $20M.
- Nightly income = price × yield (16% down to 12% per day) × renovation (1 / 1.5 / 2.2)
  × monopoly (1.5 if the whole district is owned) × Slumlord Sal (1.4).
- A housing index moves −2.5% to +3.5% per day and scales prices and values.
- Renovate: 40% of price × level. Termites cut a building 20% until repaired.
- Selling returns 95% of value (120% with House Flipper). If you go broke, listed shares are
  sold first, then the cheapest properties at 70%.
- Own all 16 lots: **Tycoon** ending (+25 pearls now, +10 at run end). You can keep playing.

## Rent
`(3 + day^1.5 × 1.2) × $1,000` per night (Tax Haven −40%). Day 10 ≈ $41K, day 30 ≈ $200K.
Gentle enough that compounding property income can outrun it.

## Events (one per day, day 1 is always quiet)
Quiet Day, Bull Run (gains ×1.5), Bear Hug, Aunt Calls (+$25K), Solar Flare (all hints are
coin flips), Meme Season (MEME ×3), SEC Raid (one stock is a fraud, −100%), Landlord Vacation
(no rent), Housing Boom (+12% property values), Termites.

## Perks (broker, end of each quarter, hold 5)
Insider Pigeon, Diamond Hands, Meme Lord, Tax Haven, Compound Cat, Contrarian, Lucky Penny,
Leverage Larry, Doomscroller, Pump Club, Aunt's Pearls, Fortune Cookie, Anchor's Nephew,
Slumlord Sal, House Flipper, Angel Wings. Prices $8K–$15K, rerolls start at $5K.

## Meta progression (The Will)
Pearls on death = days − 1 + ⌊3·log2(peak net worth / $100K)⌋ (+10 if Tycoon).
Upgrades: Bigger Allowance, Longer Ticker Tape, Premium Cable, Better Gossip, Broker Friend,
Old Family Deed, Family Heirloom.

## Balance snapshot (`npm run sim`, 400 runs each, naive bots)
| Strategy | Days p10/med/p90 | Tycoon |
|---|---|---|
| Stocks only, 25% | 7 / 9 / 13 | 0% |
| Balanced, 25% | 9 / 11 / 15 | 0.3% |
| Balanced, 50% | 8 / 13 / 46 | 13% |
| Balanced, Max | 7 / 13 / 49 | 18.5% |

Target: a typical run lasts 8–15 days. Tycoon should take skill, perks and upgrades, and be
rare. 50%/Max sizing currently snowballs too easily (see AGENTS.md backlog).
