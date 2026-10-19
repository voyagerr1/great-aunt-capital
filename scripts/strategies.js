// Simple bot players used by the balance sim and tests.
// They are deliberately naive: a real player reading the news should beat them.
export function playRun(api, { strategy = 'balanced', size = 0.25, maxDays = 120 } = {}) {
  api.resetMeta();
  api.newRun();
  let run = api.run;
  run.size = size;
  for (let g = 0; g < maxDays && !run.dead; g++) {
    if (run.pitch && run.cash > run.pitch.ask * 2) api.decidePitch(true);
    else if (run.pitch) api.decidePitch(false);
    run.hand.forEach(c => api.choose(c.hint === 'bull'));
    if (run.dead) break;
    run.holdings.forEach(h => { if (h.value > h.basis * 2.5 || h.age > 3) { run.cash += h.value; h.sold = true; } });
    run.holdings = run.holdings.filter(h => !h.sold);
    if (strategy !== 'stocks') {
      const keep = 2 * api.rentFor(run.day + 1);
      for (const id of LOT_ORDER) if (!run.props[id] && run.cash - api.lotPrice(LOTS_BY_ID[id]) > keep) api.buyLot(id);
    }
    if (run.tycoon) break;
    api.startDay();
    run = api.run;
  }
  return { days: run.day, peak: run.peak, tycoon: !!run.tycoon };
}
let LOT_ORDER = [], LOTS_BY_ID = {};
export function setLots(lots) { LOT_ORDER = lots.map(l => l.id); LOTS_BY_ID = Object.fromEntries(lots.map(l => [l.id, l])); }
export const quantile = (arr, q) => [...arr].sort((a, b) => a - b)[Math.floor(q * (arr.length - 1))];
