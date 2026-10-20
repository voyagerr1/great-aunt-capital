# Great Aunt Capital — Design Notes

Version 0.7 ("the focus update": startups cut, town simplified, clearer UI). Numbers live in `src/data/content.js`, `src/engine/` and `src/game.js`; this doc explains them.

## Pitch
You've inherited $100,000 from your great aunt (she is never named). Try to become the richest person in the world. Read the morning news, swipe on stock certificates, stack MULT
at the Closing Bell, survive the Boss Landlords and buy the town. Most runs end
broke. A few break wide open, and those are the ones people remember.

Look: your great aunt's Windows 95–98 personal finance software. Teal desktop, gray beveled application
windows, navy title bars, Tahoma/system fonts and the existing pixel portraits and buildings.
Morning news arrives in Market Mail. Stocks appear one at a time as white order documents, with
their chart, sector, risk and rumor. Closing Bell calculations fill a segmented progress bar above
a spreadsheet-style statement. Town lots read as a Property Explorer, and details open as dialogs.
The desktop account sidebar stacks above the market on phones. No CRT overlay or downloaded fonts.

## Run setup
- **Aunts** (starting decks): Your Great Aunt (classic), The Crypto Aunt (CRYPTO/MEME market, moves 1.5x; 3 runs),
  The Frugal Aunt ($25K + the cheapest lot in district 2, no market on day 1; last 10 days),
  The Twin Aunts (+2 broker offers, +1 Newsstand item, rent +20%; own a district),
  The Haunted Aunt ($10K + 10% of best peak, 4 Haunted companies; reach $5M).
- **Her mood** (stakes, cumulative): Pleased → Concerned (rent +25%) → Disappointed (rumors −10%)
  → Furious (perks +50% price, one fewer offer) → Haunting You (−$50K start, Final Boss every
  other quarter). Beat a Final Boss on your highest mood to unlock the next. Pearls +25% per mood level.
- **Seeds.** Every run is seeded (mulberry32 in `util.js`). Same seed = same town, market and boss order
  (as long as you make the same choices). The **Daily Market** uses `DAILY-YYYYMMDD`.

## The day loop
1. **Morning news.** "Today's tips" first: two sector headlines (80% accurate, the accuracy is shown), a story-arc
   headline if one is running, Rex Shouter's hot pick (55%, shown), the daily event. Net worth from day 2. Fluff rides the crawl.
2. **Market.** 4 certificates (+1 per Longer Ticker Tape level, +1 Day Trader) dealt from **your market deck**.
   Pick a position size and swipe. The play screen shows your hand so far and what this buy would make it.
3. **Closing Bell.** The scoring tally (below). Then property income, rent, and on boss days the bounty.
4. **Newsstand** every day (3 items). On boss days it is **the Broker**: 3 perks + 2 items. Items take effect when bought.

## The Closing Bell (scoring)
```
MULT  = portfolio hand MULT
for each buy, left to right:
    if it rose: GAINS += stake x move     (Red Seal / Goose Lord / Echo Chamber retrigger this)
                Hot Tip stamp +4 MULT, then every perk's card hook, left to right
    else:       LOSSES += stake x move    (never multiplied)
for each perk, left to right: its end hook (+MULT or xMULT), then its edition (Embossed +3, Holographic x1.5)
event: Bull Run x1.5
PROFIT = GAINS x MULT + LOSSES + cash bonuses (dividends, Order Flow Kickback, Gold Seal, Hedge Hog)
```
Order matters: +MULT perks belong to the left of xMULT perks. The Intern copies the perk to its right.
Studio heat: MULT 10+ sets the LIVE bug on fire, 100+ speeds up the ticker, 1000+ turns the set red.

### Portfolio hands (`HANDS`)
| Hand | Needs | Base | +per level |
|---|---|---|---|
| Single Bet | 1 buy | 1 | 1 |
| Spread Bet | 2+ buys, no pattern | 1 | 1 |
| Pair Trade | 2 in one sector | 2 | 1 |
| Two Pair Trade | 2 + 2 | 3 | 1 |
| Safe Haven | 3+ buys, all risk 1 | 3 | 1 |
| Index Fund | 4+ buys, all different sectors | 3 | 1 |
| Sector Sweep | 3+ in one sector | 4 | 2 |
| YOLO | 3+ buys, all risk 3 | 4 | 2 |
| The Whole Market | buy every certificate (4+) | 5 | 2 |
| Full Portfolio | 3 + 2 | 6 | 2 |
| Penny Parade | 3+ Penny Stocks | 6 | 3 |
| Cornered Market | 4+ in one sector | 7 | 3 |

The best hand you qualify for (by current MULT) counts. Almanacs level a hand up.

## Stock math
- Trend sector up: 78% chance to rise; down: 26%; otherwise 52%. Bear Hug −17 points.
- Move size: `rand(0.25..1) × vol`, vol = 0.08 / 0.17 / 0.34 by risk. Up moves ×1.3. (v0.5 was 0.2/0.45/0.9 with ×1.5;
  MULT does the heavy lifting now.)
- Editions (company-level, persist): Gold Leaf (+50% gains), Volatile (×2), Unlisted (no rumor, ×2),
  Blue Chip (×0.5, +10 points), Penny Stock ($0.20–$3, risk 3, ×1.6), Dividend (4% of stake either way).
- **Big orders.** Gains on a buy are multiplied by `depth / (depth + stake)`; depth $2M / $900K / $400K by risk.
  The Whale ignores it.

## The market deck
- Each run starts with 20 companies spread across the 7 base sectors (Bernice: CRYPTO/MEME). Every morning a
  random handful is dealt. Companies keep their price, edition, stamp and seal; the certificate shows how often
  you have seen it and its last move (▲/▼).
- **Charts.** Each company keeps its last 12 closes (`co.hist`), drawn as a sparkline on the certificate. Only dealt companies trade, so a newcomer arrives with
  5 closes from before it joined your market, hashed from its serial (never `R()`, so charts don't change what a
  seed deals). Charts show the past only. The news crawl lists the last close's movers.
- **Stamps** (`ENH`): Notarized (loses at most 10%), Haunted (copies the move of the certificate before it),
  Glass (×3 moves, 25% chance to shatter out of the market when bought), Hot Tip (+4 MULT when bought and up).
- **Seals** (`SEALS`): Red (retrigger), Gold (buying pays half of tonight's rent), Blue (buying levels up
  today's hand).
- A company whose price falls below 15% of its listing price, or turns out to be a fraud, is delisted.
  The market is topped back up to 12 companies.
- Story arcs can add hidden sectors (ALIEN, BEES) with 3 new companies.

## Items (all passive)
Nothing is carried or activated. Every item takes effect the moment you buy it, and the shelf says exactly what it
will do. An item that cannot take effect (an envelope that needs perks you lack, a memo whose company left the
market) cannot be bought, and the shelf says why.
- **Memos** (`MEMOS`, $5K × inflation): stamp one company in your market, named on the shelf. The target is a
  stock you bought today when there is one, else any company. Stock Split (that company's buys count double for
  good, both ways), Gold Leaf, Notary Stamp, Glass Job, Seance, Hot Tip, Red/Gold/Blue Seal, Shredder (your worst
  performer leaves the market), Photocopier (copies your best performer), Paid Influencer (its sector up tomorrow).
- **Almanacs** ($4K × inflation): +1 level to one hand. Half of them favor your most-played hand.
- **Brown Envelopes** ($10K × inflation): Legendary Tip (Legendary perk, lose half your cash), Hostile Takeover,
  Black Swan (all hands +1), Shell Company (3 Glass companies), Counterfeit, Insider Ring (next 3 days of true rumors),
  Offshore Will (copy one perk, destroy the rest), Offshore Account (3 nights of rent now, rent 1.5x to quarter end).
- Inflation = `max(1, baseRent(day) / $12K)`, so prices keep pace with rent.

## Perks (hold 5; Counterfeit takes no slot)
Rarity weights in the Broker: Common 70, Uncommon 25, Rare 5. Legendary only from Brown Envelopes.
Editions roll on 17% of offers (Embossed 10%, Holographic 5%, Counterfeit 2%) and cost 1.5x.
Sell any perk for half its price; Ponzi Pete counts every sale. Hooks live in `src/engine/perks.js`.
42 perks; see `PERKS` for the list. Scaling ones: Compound Cat (+x0.2 per day held, reset by selling a
lot), Lawn Gnome (+2 per boss beaten), Swipe Right Sally (+0.25 per
stock bought), Great Aunt's Ghost (x1 per 4 days).

## Boss Landlords
- The last day of every quarter (day 4, 8, 12...). The boss is drawn at the start of the quarter and shown in
  the boss bar under your perks (tap it for details). Boss rent is 1.5x on top of the boss's own effect.
- Bosses (`BOSSES`): The Goose, The Auditor, The Funeral Home, The Shortseller, Blackout Barry,
  Rex Shouter Himself, The Tax Man, The Hedge Fund Bro, The Margin Clerk, Wall Street, The SEC Investigator, The Repo Man.
- Final Bosses every 4th quarter (`FINALS`): The Estate Accountant, The Family Lawyer, The Estranged Cousin, The Executor.
- Survive: bounty of one night's rent, a free Memo applied to one of today's buys, +1 bosses beaten (Lawn Gnome, pearls).

## Events and story arcs
- One event per day (day 1 is quiet, boss days use the boss). Each event is data with `fx` (keys listed above
  `EVENTS`). District events (Tourist Season, Block Party, Blackout) hit a random district of this run's town.
- Tone: GTA-style satire of finance. Parody insider trading, bailouts, buybacks, lobbying and crypto collapses
  with invented people and companies only; never name real people or real tickers.
- **Story arcs** (`ARCS`): from day 3, 14% chance per day to start one you haven't seen this run. 3 steps told
  through the news, each with optional fx: The Goose Lawsuit (branching verdict), Rex's Comeback Tour,
  First Contact (adds ALIEN), The Bee Situation (adds BEES), The Safe Deposit Box, The Great Pickle Heist,
  The Toaster Uprising, The Senator's Portfolio, The Pump and Dump, The Exchange Collapse (branching verdict).

## Real estate (procedural town)
- Each run draws 4 of 8 districts (`DISTRICT_POOL`). District slot sets the price tier ($15K to $20M, yields 16%
  down to 12% per night). Each district is tied to a stock sector (Vertical Integration: +1 MULT per lot).
- Gimmicks: Casino Strip (0–3x nightly), Moon Base (monopoly 2.5x), Goose Sanctuary (1.5x, can't sell),
  Mega Mall (2.5x on boss days). The other four are plain.
- Nightly income = price × yield × monopoly (1.5, 2 Bribed Zoning Board) × Slumlord Sal (1.4) × gimmick × events.
  Lots are worth their price; sell for 95% (House Flipper 120%). A lot you sell is off the market until
  tomorrow, so profitable flips require time. v0.7 cut renovation, termites and the housing index.
- Own all 16 lots: **Tycoon** (+25 pearls now, +10 at run end). Keep playing for **endless mode**.

## Rent
`(3 + day^1.5 × 1.2) × $1,000 × 1.12^(day − 12 if > 0)`, then Tax Haven −40%, Rent Control −5%/level,
Concerned+ +25%, Twin Aunts +20%. Boss days ×1.5 (Golden Parachute: free). Endless mode: ×1.35 per day since Tycoon.
Day 10 ≈ $41K, day 20 ≈ $273K, day 30 ≈ $1.5M.

## Big numbers
`fmt`/`fmtK` go K, M, B, T, Qa, Qi, Sx, Sp, Oc, No, Dc, then e-notation. At 1e100 net worth the screen cuts to
static and your great aunt says one line.

## The goal
Passing $500B net worth (`RICHEST`) makes you the richest person in the world: a milestone screen, +50 pearls
once per run, and the share certificate says so. The run keeps going after it. Infinity prints as `naneinf`.

## Celebration (payoff for growth, and for losses)
The core pleasure is watching the number grow, so every gain and every loss gets ceremony. All of it is cosmetic:
it moves no money and draws nothing from the seeded RNG (`npm run sim` output is unchanged).
- **Wealth ladder (`RUNGS`).** Net-worth milestones from $125K to 1e50, each celebrated once per run with a dialog
  and the money cascade. A Windows progress bar shows the way to the next rung (log scale between rungs) in the HUD,
  on the morning net-worth box and in the settlement, where it slides from this morning's net worth to tonight's,
  red when it shrinks. The early rungs are close together because the median run peaks near $120K.
- **Closing Bell.** Each tally step floats its number off the board; MULT crossing 10, 100 and 1000 heats the board up
  on the spot. Then profit counts up and a verdict stamp (`VERDICTS`) slams onto the settlement: Record Day, Boss
  Beaten, Big Day, Green Day, Paid Rent, Red Day, Bloodbath, Account Closed. Wins throw paper money and flash the
  title bar; losses drop red arrows, shake the window and, for disasters, turn it "Not Responding".
- **The Solitaire win, with money.** Record days, beaten bosses, milestones, Tycoon and richest-in-the-world launch
  bills and stock certificates that bounce along the bottom of the screen leaving trails. Tap to dismiss.
- **Streaks and records.** Three or more green or red days in a row get a line (`STREAK_LINES`); a day that leaves
  you short of tomorrow's rent is a close call. The run report shows your fortune over the run, the highest rung and
  New Best badges, and counts up the pearls.
- Reduced motion keeps the stamps and final numbers and drops the movement.

## Meta progression (The Will)
Pearls on death = (days − 1 + ⌊3·log2(peak / $100K)⌋ + bosses beaten + 10 if Tycoon) × (1 + 0.25 × mood).
Upgrades: Bigger Allowance, Longer Ticker Tape, Premium Cable, Better Gossip, Broker Friend,
Old Family Deed, Family Heirloom, Rent Control, Family Almanac (start with a random hand at level 2).
Game over shows the seed, offers **Same seed**, and **Share certificate** (a PNG drawn on canvas; uses the
share sheet on phones, downloads elsewhere).

### Resume and timing rules
- Runs save after each action in the same browser, together with progression, shop offers, purchases,
  and the exact gameplay RNG state. The title screen offers **Resume run**. Starting a new run replaces
  the previous run checkpoint. Death removes the checkpoint and saves earned Pearls in the same write.
- Existing permanent progression is retained; incompatible run checkpoints are ignored. Clearing browser
  storage removes both progression and the current run. Headless simulations never save automatically.
- Boss suppression follows the affected perk through moves, sales of other perks, and copies. It clears
  at the next day's setup. An Intern cannot copy a disabled perk.
- Loyalty Card fires on Closing Bells 4, 8, 12, and so on.
- Insider Ring, bought after the market closes, covers the next three trading days.
- Becoming Tycoon preserves the screen from which Town was opened; continuing cannot skip trading or rent.
- Cosmetic reactions do not consume gameplay randomness. Opening sheets or revisiting screens does not
  change subsequent events, offers, or deals.
- Perk slots support Enter and Space. Sheets keep keyboard focus inside and return it when closed.

## Screens and help
- **HUD** on every in-run screen: cash, day and tonight's rent; labeled Perk slots (tap one for its sheet);
  the boss bar (tap for the boss sheet) and a **Hands** button (every hand, its level and MULT; today's hand is marked).
  The play screen's hand line opens the same sheet.
- **First-run tips**: one dashed yellow line on the news, play, Closing Bell and shop screens, day 1 of a player's first run.

## Balance snapshot (`npm run sim`, 400 fixed seeds per strategy)
| Strategy | Days p10/med/p90 | Peak NW p90 | Best MULT p90 | Tycoon |
|---|---|---|---|---|
| Stocks only, 25% | 7 / 10 / 54 | $176.2M | 81.8 | 0% |
| Balanced, 25% | 9 / 12 / 24 | $64.7M | 18 | 9.8% |
| Balanced, 50% | 8 / 12 / 28 | $73.6M | 40 | 18.5% |
| Balanced, Max | 8 / 12 / 29 | $69.7M | 36 | 13.3% |
| No shop, 25% | 10 / 12 / 16 | $300K | 5 | 0% |
| Item/hand heuristic, 25% | 8 / 11 / 20 | $3.4M | 14 | 9.5% |
| Same heuristic, endless | 8 / 11 / 28 | $3.4M | 14 | 9.5% |

Target: a typical run lasts 8–15 days. The tail should be fat: a run whose engine comes together should feel
broken. The first five strategies remain naive for comparison. The heuristic orders perks, buys items with no
hidden downside and considers hand completion using visible hints. It is not an optimal player: its item
spending does not outperform the baseline in this batch, and it lost its old edge from Insider Tip and Short Sell
when items became passive. Endless continues after Tycoon rather than
stopping at the first win. Seeds are `SIM-0` through `SIM-399`; runs stop at day 120 at the latest.
v0.7 runs are longer and Tycoon is more common than in v0.6 (bots no longer lose cash on startups that bust, and
lot prices no longer drift up with a housing index).
