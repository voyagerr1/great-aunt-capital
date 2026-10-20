import { describe, it, expect, beforeAll } from 'vitest';
import { LOTS, PERKS, EVENTS, EDITIONS, SECTORS, DISTRICTS } from '../src/data/content.js';
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
    expect(new Set(PERKS.map(p => p.code)).size).toBe(PERKS.length);
    expect(new Set(EVENTS.map(e => e.id)).size).toBe(EVENTS.length);
  });
  it('event effects point at real sectors and districts', () => {
    const secs = SECTORS.map(s => s.id), dists = DISTRICTS.map(d => d.id);
    for (const e of EVENTS) {
      const fx = e.fx || {};
      Object.keys(fx.trend || {}).concat(Object.keys(fx.sec || {})).forEach(k => expect(secs).toContain(k));
      Object.keys(fx.dist || {}).forEach(k => expect(dists).toContain(k));
    }
  });
  it('edition chances leave room for plain certificates', () => {
    const w = Object.values(EDITIONS).reduce((s, e) => s + e.w, 0);
    expect(w).toBeLessThan(0.6);
  });
});

describe('systems', () => {
  it('every event can play out a full day', () => {
    api.setHeadless(true);
    for (const ev of EVENTS) {
      api.resetMeta(); api.newRun(); api.run.day = 5; api.run.cash = 5e5;
      api.run.props.stand = { lvl: 1, dmg: 1 };
      api.run.holdings.push({ name: 'Testly', basis: 1e4, value: 2e4, age: 3, last: 0, drift: 0 });
      api.run.event = ev;
      api.run.hand.forEach(() => api.choose(true));
      expect(Number.isFinite(api.run.cash)).toBe(true);
    }
    api.setHeadless(false);
  });
  it('follow-on rounds keep or dilute your stake', () => {
    api.setHeadless(true);
    api.resetMeta(); api.newRun(); api.run.cash = 1e6;
    const mk = name => { api.run.ventures.push({ name, idea: 'x', ask: 1e4, paid: 1e4, eq: 20, st: { team: 3, product: 3, market: 3, hype: 3 }, m: 2, round: 1, since: 0, follow: 5000 }); };
    mk('Paid'); mk('Passed');
    api.followOn('Paid', true); api.followOn('Passed', false);
    const [a, b] = api.run.ventures;
    expect(a.ask * a.m).toBe(25000); expect(a.eq).toBe(20); expect(a.follow).toBe(null);
    expect(b.ask * b.m).toBe(15000); expect(b.eq).toBe(15);
    api.setHeadless(false);
  });
  it('big orders cut gains', () => {
    api.setHeadless(true);
    api.resetMeta(); api.newRun();
    const c = api.run.hand[0]; c.up = true; c.fraud = false; c.ed = null; c.vol = 3; c.price = 1;
    api.run.cash = 5e6; api.run.dayStart = 5e6; api.run.size = 1;
    api.choose(true); api.run.hand.slice(1).forEach(() => api.choose(false));
    expect(c.slip).toBeGreaterThan(0.5);
    api.setHeadless(false);
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
