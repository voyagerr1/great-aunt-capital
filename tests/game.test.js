import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { LOTS, PERKS, EVENTS, EDITIONS, SECTORS, HANDS, MEMOS, ENVELOPES, BOSSES, FINALS, ARCS, DISTRICT_POOL, AUNTS } from '../src/data/content.js';
import { qualifying } from '../src/engine/hands.js';
import { PERK_FX } from '../src/engine/perks.js';
import { fmt, fmtK, big } from '../src/util.js';
import { playRun, quantile } from '../scripts/strategies.js';

let api;
beforeAll(async () => {
  document.body.innerHTML = '<div id="app"></div><div id="toast" hidden></div>';
  ({ api } = await import('../src/game.js'));
});
beforeEach(()=>localStorage.clear());
const fresh = (o = {}) => { api.setHeadless(true); api.resetMeta(); api.newRun(o); return api.run; };
// Make the current card a plain stock that will rise.
const finish = run => { while (run.idx < run.hand.length) api.choose(false); };
// Replace the shelf with exactly these offers.
const stock = (...offers) => { api.shop.length = 0; api.shop.push(...offers); };
const plainUp = c => { Object.assign(c.co, { ed: null, enh: null, seal: null, sec: 'TECH', vol: 2, price: 10 }); c.up = true; c.fraud = false; };

describe('content', () => {
  it('has 16 lots in 4 districts with rising prices, and enough districts for a town', () => {
    expect(LOTS).toHaveLength(16);
    for (let i = 1; i < LOTS.length; i++) expect(LOTS[i].price).toBeGreaterThan(LOTS[i - 1].price);
    for (const d of DISTRICT_POOL) expect(d.lots).toHaveLength(4);
    expect(DISTRICT_POOL.length).toBeGreaterThanOrEqual(4);
  });
  it('has unique ids and codes', () => {
    const uniq = (a, k) => expect(new Set(a.map(x => x[k])).size).toBe(a.length);
    uniq(PERKS, 'id'); uniq(PERKS, 'code'); uniq(EVENTS, 'id'); uniq(HANDS, 'id'); uniq(MEMOS, 'id'); uniq(ENVELOPES, 'id');
    uniq(BOSSES.concat(FINALS), 'id'); uniq(ARCS, 'id'); uniq(DISTRICT_POOL, 'id'); uniq(AUNTS, 'id');
  });
  it('effects point at real sectors', () => {
    const secs = SECTORS.map(s => s.id);
    const check = fx => { if (!fx) return; Object.keys(fx.trend || {}).concat(Object.keys(fx.sec || {})).forEach(k => expect(secs).toContain(k)); if (fx.addSector) expect(secs).toContain(fx.addSector); };
    EVENTS.concat(BOSSES, FINALS).forEach(e => check(e.fx));
    ARCS.forEach(a => a.steps.forEach(s => (s.pick || [s]).forEach(x => check(x.fx))));
    DISTRICT_POOL.forEach(d => expect(secs).toContain(d.sec));
  });
  it('every perk hook belongs to a real perk', () => {
    Object.keys(PERK_FX).forEach(id => expect(PERKS.map(p => p.id)).toContain(id));
  });
  it('edition chances leave room for plain certificates', () => {
    expect(Object.values(EDITIONS).reduce((s, e) => s + e.w, 0)).toBeLessThan(0.6);
  });
});

describe('numbers', () => {
  it('formats huge money', () => {
    expect(fmt(1234)).toBe('$1,234');
    expect(fmtK(2.5e9)).toBe('$2.50B');
    expect(big(1e40)).toBe('1.00e40');
    expect(big(1e101)).toBe('MORE MONEY THAN MONEY');
    expect(fmt(Infinity)).toBe('naneinf');
  });
});

describe('portfolio hands', () => {
  const card = (sec, vol = 2, ed = null) => ({ co: { sec, vol, ed } });
  it('spots each hand', () => {
    expect(qualifying([card('TECH')], [card('TECH')])).toEqual(['single']);
    expect(qualifying([card('TECH'), card('TECH')], Array(4))).toContain('pair');
    const sweep = [card('MEME'), card('MEME'), card('MEME'), card('OIL'), card('OIL')];
    expect(qualifying(sweep, sweep)).toEqual(expect.arrayContaining(['sweep', 'full', 'twopair', 'whole']));
    const idx = [card('TECH'), card('MEME'), card('OIL'), card('PETS')];
    expect(qualifying(idx, idx.concat(card('FOOD')))).toContain('index');
    expect(qualifying([card('A', 3), card('B', 3), card('C', 3)], Array(5))).toContain('yolo');
  });
});

describe('systems', () => {
  it('seeds replay the same town and market', () => {
    const a = fresh({ seed: 'GOOSE-1234' }), ticks = a.deck.map(c => c.tick).join(), town = a.town.map(d => d.id).join(), hand = a.hand.map(c => c.co.tick).join();
    const b = fresh({ seed: 'goose-1234' });
    expect(b.deck.map(c => c.tick).join()).toBe(ticks);
    expect(b.town.map(d => d.id).join()).toBe(town);
    expect(b.hand.map(c => c.co.tick).join()).toBe(hand);
    expect(b.deck.map(c => c.hist.join()).join()).toBe(a.deck.map(c => c.hist.join()).join());
  });
  it('companies keep a price chart that grows when they trade', () => {
    const run = fresh({ seed: 'CHART-1' });
    run.deck.forEach(co => { expect(co.hist.length).toBeGreaterThan(1); expect(co.hist.at(-1)).toBe(co.price); expect(co.lastDay).toBe(0); });
    const dealt = run.hand.map(c => c.co), before = dealt.map(co => co.hist.length);
    run.hand.slice().forEach(() => api.choose(false));
    dealt.filter(co => run.deck.includes(co)).forEach(co => {
      expect(co.hist.length).toBe(Math.min(12, before[dealt.indexOf(co)] + 1));
      expect(co.hist.at(-1)).toBe(co.price); expect(co.lastDay).toBe(1);
    });
  });
  it('every event, boss and story step can play out a full day', () => {
    const steps = ARCS.flatMap(a => a.steps.flatMap(s => s.pick || [s])).map((s, i) => ({ id: 'arc' + i, name: 'Arc', txt: s.txt, fx: s.fx }));
    for (const ev of EVENTS.concat(BOSSES, FINALS, steps)) {
      const run = fresh(); run.day = 3; run.cash = 5e5;
      run.props[run.lots[0].id] = { day: 0 };
      run.perks.push(api.newPerk('gnome'), api.newPerk('larry'));
      api.startDay(ev);
      if(ev.fx?.handSize) expect(run.hand).toHaveLength(ev.fx.handSize);
      if(ev.fx?.disableRight) expect(run.perks.at(-1).disabled).toBe(true);
      if(ev.fx?.disableRandom) expect(run.perks.some(p=>p.disabled)).toBe(true);
      if(ev.fx?.fraud) expect(run.hand.some(c=>c.fraud)).toBe(true);
      run.hand.forEach(() => api.choose(true));
      expect(Number.isFinite(run.cash)).toBe(true);
      expect(api.scene).toBe('resolve');
    }
  });
  it('perk order matters: +MULT before xMULT', () => {
    const play = order => {
      const run = fresh(); api.setEvent(EVENTS[0]);
      run.perks = order.map(id => api.newPerk(id));
      plainUp(run.hand[0]); api.choose(true); while (run.idx < run.hand.length) api.choose(false);
      return run.result.mult;
    };
    expect(play(['gnome', 'mcat'])).toBe(6);   // (1 + 1) x 3
    expect(play(['mcat', 'gnome'])).toBe(4);   // 1 x 3 + 1
  });
  it('the Intern copies its right neighbour', () => {
    const run = fresh(); api.setEvent(EVENTS[0]);
    run.perks = [api.newPerk('intern'), api.newPerk('mcat')];
    plainUp(run.hand[0]); api.choose(true); while (run.idx < run.hand.length) api.choose(false);
    expect(run.result.mult).toBe(9);
  });
  it('profit is gains x MULT and losses are not multiplied', () => {
    const run = fresh(); api.setEvent(EVENTS[0]);
    run.perks = [api.newPerk('mcat')];
    plainUp(run.hand[0]); api.choose(true); while (run.idx < run.hand.length) api.choose(false);
    const r = run.result;
    expect(r.total).toBeCloseTo(r.gains * r.mult, 6);
    expect(r.net).toBeCloseTo(r.total + r.losses + r.bonus, 6);
  });
  it('every memo and envelope takes effect the moment it is bought', () => {
    for (const m of MEMOS) {
      const run = fresh(); finish(run); api.openShop();
      const co = run.deck[0];
      stock({ t: 'cons', k: 'memo', id: m.id, price: 1, co: co.id });
      expect(api.buyOffer(0)).toBe(true);
      expect(run.cons).toBeUndefined();
    }
    for (const e of ENVELOPES) {
      const run = fresh(); finish(run); api.openShop();
      run.perks = [api.newPerk('gnome'), api.newPerk('larry')];
      stock({ t: 'cons', k: 'env', id: e.id, price: 1 });
      expect(api.buyOffer(0)).toBe(true);
      expect(Number.isFinite(run.cash)).toBe(true);
    }
  });
  it('stamps the named company on purchase', () => {
    const run = fresh(); finish(run); api.openShop();
    const co = run.deck[2]; co.ed = null;
    stock({ t: 'cons', k: 'memo', id: 'gild', price: 1, co: co.id });
    api.buyOffer(0);
    expect(co.ed).toBe('gold');
  });
  it('items that cannot take effect cannot be bought', () => {
    const run = fresh(); finish(run); api.openShop();
    run.perks = []; const cash = run.cash;
    stock({ t: 'cons', k: 'env', id: 'takeover', price: 1 });
    expect(api.buyOffer(0)).toBe(false);
    expect(run.cash).toBe(cash);
  });
  it('almanacs level up hands as soon as they are bought', () => {
    const run = fresh(); finish(run); api.openShop();
    const before = api.handMult('pair');
    stock({ t: 'cons', k: 'alm', id: 'pair', price: 1 });
    api.buyOffer(0);
    expect(api.handMult('pair')).toBe(before + 1);
  });
  it('big orders cut gains', () => {
    const run = fresh();
    const c = run.hand[0]; plainUp(c); c.co.vol = 3; c.co.price = 1;
    run.cash = 5e6; run.dayStart = 5e6; run.size = 1;
    api.choose(true); while (run.idx < run.hand.length) api.choose(false);
    expect(c.slip).toBeGreaterThan(0.5);
  });
  it('every aunt can start a run', () => {
    for (const a of AUNTS) { const run = fresh({ aunt: a.id, mood: 4 }); expect(run.deck.length).toBeGreaterThan(10); expect(Number.isFinite(run.cash)).toBe(true); }
  });
});

describe('every screen renders', () => {
  it('walks through setup, a full quarter, the sheets, shops, town and game over', () => {
    const app = document.getElementById('app');
    api.setHeadless(false); api.resetMeta();
    for (const s of ['title', 'setup', 'help', 'will']) { api.setScene(s); api.render(); expect(app.innerHTML.length).toBeGreaterThan(100); }
    api.newRun(); api.render();
    expect(app.innerHTML).toContain("Today's tips");
    const run = api.run;
    run.perks.push(api.newPerk('cat', 'holo'));
    for (const s of ['play', 'town', 'news']) { api.setScene(s); api.render(); expect(app.innerHTML.length).toBeGreaterThan(100); }
    run.modal = { kind: 'hands' }; api.setScene('play'); api.render(); expect(app.innerHTML).toContain('Cornered Market');
    run.modal = { kind: 'boss' }; api.render(); expect(app.innerHTML).toContain(run.boss.name);
    run.modal = { kind: 'perk', i: 0 }; api.setScene('news'); api.render(); expect(app.innerHTML).toContain('Compound Cat');
    run.modal = null;
    for (let d = 0; d < 4; d++) {
      run.hand.forEach(() => api.choose(true));
      expect(app.innerHTML).toContain('CLOSING BELL');
      if (run.dead) break;
      api.openShop(); expect(app.innerHTML).toMatch(/NEWSSTAND|THE BROKER/);
      if (d < 3) api.startDay();
    }
    run.cash = 1e9; run.lots.forEach(l => api.buyLot(l.id));
    expect(run.tycoon).toBe(true);
    expect(app.innerHTML).toContain('TYCOON');
    for (const s of ['ascend', 'over']) { api.setScene(s); api.render(); expect(app.innerHTML.length).toBeGreaterThan(100); }
  });
});

describe('balance', () => {
  it('runs last a sensible number of days and property helps', () => {
    api.setHeadless(true);
    const N = 150;
    const stocks = Array.from({ length: N }, (_,i) => playRun(api, { strategy: 'stocks',seed:'BALANCE-'+i }).days);
    const bal = Array.from({ length: N }, (_,i) => playRun(api, { strategy: 'balanced',seed:'BALANCE-'+i }).days);
    const ms = quantile(stocks, .5), mb = quantile(bal, .5);
    expect(ms).toBeGreaterThanOrEqual(6); expect(ms).toBeLessThanOrEqual(16);
    expect(mb).toBeGreaterThanOrEqual(ms);
    api.setHeadless(false);
  }, 60000);
});
