# Player UX and feedback pass

October 20, 2026. Continues the Windows 95–98 presentation. No economy, content, save-schema or scoring changes.

## Player-facing changes

- Daily progress identifies News, Trade, Results and Shop. Primary actions use navy buttons.
- Inventory replaces empty slot chrome with clear counts, named item/perk details, empty-state guidance and direct access to the existing use/reorder/sell controls. Help and sound are available during a run.
- Trading prioritizes the rumor above price history on phones. Risk has a written label; rumors are explicitly uncertain and the chart describes past prices.
- The decision panel explains stake sizing, the actual investment cost, cash left uninvested, rent exposure and large-order impact. Boss-required buys and blocked purchases use the same read-only decision path as execution. Hand previews show starting ×MULT and only advertise numerical improvements.
- Buy/pass receipts identify the completed order. Order progress and distinct action emphasis make the next decision visible. Short phones scroll the order with the controls pinned in place.
- Closing Bell has a keyboard-accessible Show total button, current-step highlighting, perk trigger highlights and a final settlement summary. Winning gains, cash bonuses, unmultiplied losses and tax are distinguished. The displayed multiplication shows the gross product before tax.
- Paid rent uses the amount charged at settlement; a defeated boss is marked cleared. Shop buttons explain full inventory or insufficient cash, and purchase receipts explain where the item went.
- Starting over, including Daily Market, requires an explicit replacement choice when a resumable run exists. Cancelling preserves the checkpoint.
- Keyboard focus stays on the selected stake and inside an open dialog. Scene changes return the page to the top. Motion is brief and respects reduced-motion preferences; settlement chimes distinguish a strong result from a quiet settlement or bankruptcy.

## Validation

- 58 Vitest tests, including 9 player-UX regressions: quote/execution agreement, stake focus, rent exposure, forced/blocked trades, boss multiplier suppression, dialog focus, shop capacity explanations, paid-rent labels, tally skipping and checkpoint replacement safety.
- Standard Vite production build and self-contained HTML build.
- 200 fixed-seed before/after run pairs (baseline and heuristic/endless bots) produced identical outcomes and full run states, checking that the presentation and input refactor preserved the game rules.
- Browser: an isolated `UX-PASS` run through the first boss and Broker, trading, purchasing and using an Almanac through Inventory, required-buy messaging and the settlement summary.
- Responsive inspection at 380×780, 320×568 and the default desktop viewport. At 320×568, the document width is 320 and the trading actions remain within the app viewport; the stock document scrolls behind the pinned decision controls.
- This is browser and source validation. Physical touch feel, audible audio mix and native mobile sharing still require device playtesting.
