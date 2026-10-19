import { describe, it, expect, beforeAll } from 'vitest';
import { LOTS, PERKS, EVENTS } from '../src/data/content.js';
import { playRun, setLots, quantile } from '../scripts/strategies.js';

let api;
beforeAll(async () => {
  document.body.innerHTML = '<div id="app"></div><div id="toast" hidden></div>';
  ({ api } = await import('../src/game.js'));
  setLots(LOTS);
});

describe('content', () => {
  it('has 16 lots in 4 districts with rising prices', () => {
    expect(LOTS).toHaveLength(16);
    for (let i = 1; i < LOTS.length; i++) expect(LOTS[i].price).toBeGreaterThan(LOTS[i - 1].price);
  });
  it('has unique perk and event ids', () => {
    expect(new Set(PERKS.map(p => p.id)).size).toBe(PERKS.length);
    expect(new Set(EVENTS.map(e => e.id)).size).toBe(EVENTS.length);
  });
});

describe('every screen renders', () => {
  it('walks through a full day, town, quarter, shop and game over', () => {
    const app = document.getElementById('app');
    api.resetMeta(); api.newRun(); api.render();
    expect(app.innerHTML).toContain('Your portfolio');
    const run = api.run;
    run.pitch = run.pitch || api.makePitch();
    for (const s of ['pitch', 'play', 'town', 'news']) { api.setScene(s); api.render(); expect(app.innerHTML.length).toBeGreaterThan(100); }
    for (let d = 0; d < 4; d++) { api.run.hand.forEach(c => api.choose(true)); if (api.run.dead) break; if (d < 3) api.startDay(); }
    api.setScene('quarter'); if (api.run.qres) api.render();
    api.openShop(); expect(app.innerHTML).toContain('THE BROKER');
    api.run.cash = 1e9; LOTS.forEach(l => api.buyLot(l.id));
    expect(api.run.tycoon).toBe(true);
    expect(app.innerHTML).toContain('TYCOON');
  });
});

describe('balance', () => {
  it('runs last a sensible number of days and property helps', () => {
    api.setHeadless(true);
    const N = 150;
    const stocks = Array.from({ length: N }, () => playRun(api, { strategy: 'stocks' }).days);
    const bal = Array.from({ length: N }, () => playRun(api, { strategy: 'balanced' }).days);
    const ms = quantile(stocks, .5), mb = quantile(bal, .5);
    expect(ms).toBeGreaterThanOrEqual(6); expect(ms).toBeLessThanOrEqual(16);
    expect(mb).toBeGreaterThanOrEqual(ms);
    api.setHeadless(false);
  }, 60000);
});
