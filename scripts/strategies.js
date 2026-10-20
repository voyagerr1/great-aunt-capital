// Simple bot players used by the balance sim and tests.
// They are deliberately naive: a real player reading the news, ordering perks and building hands should beat them.
export function playRun(api, { strategy = 'balanced', size = 0.25, shop = true, maxDays = 120 } = {}) {
  api.resetMeta();
  api.newRun();
  let run = api.run;
  run.size = size;
  for (let g = 0; g < maxDays && !run.dead; g++) {
    if (run.pitch && run.cash > run.pitch.ask * 2) api.decidePitch(true);
    else if (run.pitch) api.decidePitch(false);
    run.hand.forEach(c => api.choose(c.hint === 'bull'));
    if (run.dead) break;
    run.ventures.forEach(v => { if (v.follow) api.followOn(v.name, run.cash > v.follow * 3); });
    run.holdings.forEach(h => { if (h.value > h.basis * 2.5 || h.age > 3) { run.cash += h.value; h.sold = true; } });
    run.holdings = run.holdings.filter(h => !h.sold);
    if (shop) {
      api.openShop();
      const keep = 3 * api.rentFor(run.day + 1);
      api.shop.forEach((o, i) => { if ((o.t === 'perk' || o.k === 'alm') && run.cash - o.price > keep) api.buyOffer(i); });
      for (let i = run.cons.length - 1; i >= 0; i--) if (run.cons[i].k === 'alm') api.useCons(i);
    }
    if (strategy !== 'stocks') {
      const keep = 2 * api.rentFor(run.day + 1);
      for (const l of run.lots) if (!run.props[l.id] && run.cash - api.lotPrice(l) > keep) api.buyLot(l.id);
    }
    if (run.tycoon) break;
    api.startDay();
    run = api.run;
  }
  return { days: run.day, peak: run.peak, tycoon: !!run.tycoon, bestMult: run.best ? run.best.mult : 1, bosses: run.bossesBeat };
}
export const quantile = (arr, q) => [...arr].sort((a, b) => a - b)[Math.floor(q * (arr.length - 1))];
