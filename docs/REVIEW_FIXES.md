# Review fixes and validation

October 20, 2026. Implements the findings from the full-game review. No package/version-number change; run schema advances from 10 to 11.

## Behavior changes

- House Flipper still pays 120%, but a lot sold by the player cannot be repurchased until the next day. The property panel explains the cooldown, and resume preserves it.
- Boss suppression follows the chosen perk through reordering, sales of other perks, and copying. It resets at the next day's setup. Disabled perks do not supply passive rescue/eating effects, and Intern cannot copy a disabled neighbor.
- Rex's Closing Bell reaction is computed from seed/day without consuming gameplay RNG. Redraws, sheets, and Town visits do not alter subsequent offers or events.
- Tycoon continuation preserves the originating screen. Buying the last lot from morning news, the shop, or Closing Bell returns to the correct phase without skipping rent or trading.
- Loyalty Card triggers on Closing Bells 4, 8, 12, etc.
- Insider Ring verifies remaining cards immediately if the market is still open and covers that day plus two more. After resolution it covers the next three days.
- Save/resume uses one atomic localStorage entry for progression and the checkpoint: run, screen, shop purchases/offers, and RNG state. Loading reconnects certificates to their persistent company objects. Resolution is guarded against repeat application; death and Tycoon rewards cannot be duplicated by ordinary reload/resume.
- Existing permanent progression is retained. Invalid/incompatible checkpoints are ignored; storage write failures leave the previous save intact and show a visible warning. Headless bots do not autosave.
- Perk/item slots support Enter/Space. Modal sheets trap Tab, support Escape, and restore focus. Seed text is escaped on the results screen.
- The market now scrolls independently instead of shrinking the certificate until rumor text disappears. Buy/pass controls stay visible. Vertical/cancelled gestures do not trade.
- Documentation removes the retired startups pitch, corrects Compound Cat's reset condition, and documents saving, item timing, and the new transaction rules.

## Validation

- 49 Vitest tests: the original 20 plus 29 regressions covering the findings, atomic resume, shared company identity, shop purchase persistence, corrupt saves/storage failure, reward safety, keyboard behavior, gesture cancellation, and repeatable simulations.
- Event/boss smoke coverage now runs effects through start-of-day setup, including card count, fraud, and suppression checks.
- Standard production build and self-contained HTML build checked with Vite.
- Seven strategies × 400 fixed seeds = 2,800 simulated runs, including a visible-information item/hand/perk-order heuristic and an endless variant. The heuristic is additional coverage, not an optimal player.
- Browser: seed `FIX-CHECK`, one full quarter through the first boss and Broker; reload/resume mid-hand and after purchasing Lawn Gnome; sold offer and cash retained; Town navigation; Enter-opened perk sheet and Escape close.
- Responsive browser checks at 380×780 and 380×640. At 380×640 the document scroll width is 380, action buttons end at y=630, and certificate text has its full content height within the scrollable market.

No real-device touch feel, native mobile share sheet, audible audio mix, or deployed GitHub Pages verification is claimed. The browser walkthrough used an isolated localhost test origin, not an existing player's production save.

## Before / after balance

Both runs use identical `SIM-0` through `SIM-399` seeds for each baseline strategy. The before run uses the original source and bots, with a wrapper supplying those seeds. No economy constants were retuned.

| Strategy | Before days p10/median/p90 | After days p10/median/p90 | Before Tycoon | After Tycoon |
|---|---:|---:|---:|---:|
| Stocks only, 25% | 7/11/48 | 7/11/48 | 0% | 0% |
| Balanced, 25% | 9/12/27 | 9/12/28 | 9.25% | 8.75% |
| Balanced, 50% | 8/12/29 | 8/12/29 | 18.75% | 17.75% |
| Balanced, Max | 8/12/32 | 8/12/32 | 13.25% | 13.00% |
| No shop, 25% | 10/12/16 | 10/12/16 | 0% | 0% |

### Before output

```text
stocks only, 25%: days 7/11/48 peak90=83855901 mult90=46.5 tycoon=0%
balanced, 25%: days 9/12/27 peak90=46740088 mult90=16 tycoon=9.25%
balanced, 50%: days 8/12/29 peak90=70256440 mult90=27 tycoon=18.75%
balanced, max: days 8/12/32 peak90=68390567 mult90=25 tycoon=13.25%
no shop, 25%: days 10/12/16 peak90=267157 mult90=5 tycoon=0%
```

### After output

```text
stocks only, 25%   days p10/med/p90 7/11/48  peak NW med $121K p90 $75.2M  best MULT med 5.0 p90 46.5  bosses med 2  tycoon 0.0%
balanced, 25%      days p10/med/p90 9/12/28  peak NW med $123K p90 $37.7M  best MULT med 4.0 p90 15.0  bosses med 2  tycoon 8.8%
balanced, 50%      days p10/med/p90 8/12/29  peak NW med $133K p90 $70.5M  best MULT med 3.0 p90 26.0  bosses med 2  tycoon 17.8%
balanced, max      days p10/med/p90 8/12/32  peak NW med $132K p90 $68.4M  best MULT med 3.0 p90 25.0  bosses med 2  tycoon 13.0%
no shop, 25%       days p10/med/p90 10/12/16  peak NW med $132K p90 $267K  best MULT med 3.0 p90 5.0  bosses med 2  tycoon 0.0%
smart, 25%         days p10/med/p90 8/12/23  peak NW med $119K p90 $18.7M  best MULT med 5.0 p90 16.0  bosses med 2  tycoon 8.8%
smart endless, 25% days p10/med/p90 8/12/34  peak NW med $119K p90 $18.7M  best MULT med 5.0 p90 16.0  bosses med 2  tycoon 8.8%
```

Median run length stays within the intended 8–15 days. Extra item spending in the heuristic does not improve Tycoon frequency in this batch; further balance changes should follow observed player decisions.
