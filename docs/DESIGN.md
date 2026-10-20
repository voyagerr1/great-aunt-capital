# Great Aunt Capital — Design Notes

Version 0.5. Numbers live in `src/data/content.js` and `src/game.js`; this doc explains them.

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
2. **Pitch (sometimes).** From day 2, 45% chance (80% Seed Fund, +15% per Rolodex level), at most 3 open startups.
3. **Market.** 4 certificates (+1 per Longer Ticker Tape level, +1 Day Trader). Each has sector, risk 1–3,
   price per share, a rumor (65% accurate), sparkline. Pick a position size
   (10/25/50% of morning cash, or Max) and swipe right to buy whole shares, left to pass.
4. **Closing bell.** Every stock's move is revealed, including passed ones. Then property
   income, then rent. Quarter end (every 4 days): startup reports, then the broker.

## Stock math
- Trend sector up: 78% chance to rise; down: 26%; otherwise 52%. Bear Hug event −17 points.
- Move size: `rand(0.25..1) × vol` where vol = 0.2 / 0.45 / 0.9 by risk. Up moves ×1.5.
- Editions (`EDITIONS`): Gold Leaf (+50% gains), Volatile (×2 moves), Unlisted (no rumor, ×2 moves),
  Blue Chip (×0.5 moves, +10 points to rise), Penny Stock ($0.20–$3, risk 3, ×1.6 moves),
  Dividend (pays 4% of the stake at close either way). About 33% of certificates have one.
- **Big orders.** Gains on a buy are multiplied by `depth / (depth + stake)`. Depth (`DEPTH`) is
  $2M / $900K / $400K by risk, ×3 Blue Chip, ×0.5 Unlisted, ×0.4 Penny. The buy line warns when a
  buy loses more than 5% of its gain. This is what stops 50%/Max sizing from snowballing.

## Startups (quarterly)
- Stats 1–5: Team, Product, Market, Hype. Traits nudge stats; "Already profitable" flags
  the company as profitable.
- Ask: 12–25% of current cash. Your stake value = ask × valuation multiple `m`.
- Each quarter end: bust chance `0.38 − q·0.32` (q = (team+product+market)/15; profitable ×0.4;
  Angel Wings −0.10). Exit chance `0.10 + 0.18·round` (+0.15 profitable).
  Exit is IPO (likelier with Hype) or buyout for cash. Otherwise 12% pivot (new idea, every stat
  shifts −2..+2, `m` × 0.5–1.3), else a funding round re-prices `m` and shifts one stat up or down.
- **Follow-on rounds.** After an up round, 50% chance the startup asks for 25–50% of your stake's
  value. Pay: the cash joins your stake at the current price and you keep your %. Pass (or leave
  for the broker without deciding): `m` ×0.75 and your % shrinks by a quarter.
- IPO shares become listed holdings that move daily (bigger swings the first 2 days). You sell
  when you like. Morning news hints their direction.

## Real estate (Mildred's Town)
- 16 lots, 4 districts (Old Town, Suburbs, Harbor, Skyline), $15K to $20M.
- Nightly income = price × yield (16% down to 12% per day) × renovation (1 / 1.5 / 2.2)
  × monopoly (1.5 if the whole district is owned, 2 with Zoning Board) × Slumlord Sal (1.4)
  × district events (Tourist Season, Block Party, Blackout).
- A housing index moves −2.5% to +3.5% per day and scales prices and values.
- Renovate: 40% of price × level. Termites cut a building 20% until repaired.
- Selling returns 95% of value (120% with House Flipper). If you go broke, listed shares are
  sold first, then the cheapest properties at 70%.
- Own all 16 lots: **Tycoon** ending (+25 pearls now, +10 at run end). You can keep playing.

## Rent
`(3 + day^1.5 × 1.2) × $1,000` per night (Tax Haven −40%, Rent Control −5% per level,
Umbrella Policy: free on quarter-end days). Day 10 ≈ $41K, day 30 ≈ $200K.
Gentle enough that compounding property income can outrun it.

## Events (one per day, day 1 is always quiet)
Each event is data with an `fx` object (keys documented above `EVENTS`), so new events need no code.
- Market: Bull Run (gains ×1.5), Bear Hug (−17 points to rise), Flash Crash (all moves ×2),
  Solar Flare (all hints are coin flips), SEC Raid (one stock is a fraud, −100%),
  Margin Call (no buy over 25% of morning cash).
- Sectors (forced trend, always reported truthfully): Meme Season (MEME ×3), Heat Wave (FOOD ▲),
  Crypto Winter (CRYPTO ▼), Launch Day (SPACE ▲), Kibble Recall (PETS ▼).
- Property: Housing Boom (+12%), Rate Hike (−8%), Termites, Tourist Season (Harbor ×2 tonight),
  Block Party (Suburbs ×2), Blackout (Skyline pays nothing).
- Money: Aunt Calls (+$25K), Family Reunion (−5% cash), Landlord Vacation (no rent),
  Rent Hike (rent ×1.5), Dividend Day (listed shares pay 8%).

## Perks (broker, end of each quarter, hold 5)
Insider Pigeon, Diamond Hands, Meme Lord, Tax Haven, Compound Cat, Contrarian, Lucky Penny,
Leverage Larry, Doomscroller, Pump Club, Aunt's Pearls, Fortune Cookie, Anchor's Nephew,
Slumlord Sal, House Flipper, Angel Wings, Day Trader, Hedge Hog, Property Manager, Seed Fund,
Zoning Board, Ticker Whisperer, Scalper, Rex's Biggest Fan, Umbrella Policy.
Prices $8K–$15K, rerolls start at $5K.

## Meta progression (The Will)
Pearls on death = days − 1 + ⌊3·log2(peak net worth / $100K)⌋ (+10 if Tycoon).
Upgrades: Bigger Allowance, Longer Ticker Tape, Premium Cable, Better Gossip, Broker Friend,
Old Family Deed, Family Heirloom, Rent Control, Rolodex.

## Balance snapshot (`npm run sim`, 400 runs each, naive bots)
| Strategy | Days p10/med/p90 | Tycoon |
|---|---|---|
| Stocks only, 25% | 7 / 9 / 13 | 0% |
| Balanced, 25% | 9 / 10 / 14 | 0% |
| Balanced, 50% | 8 / 12 / 23 | 5.3% |
| Balanced, Max | 6 / 12 / 27 | 4.8% |

Target: a typical run lasts 8–15 days. Tycoon should take skill, perks and upgrades, and be
rare. Big-order slippage (v0.5) brought 50%/Max Tycoon rates down from 11–18%.
