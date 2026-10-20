import { describe,it,expect,beforeAll,beforeEach,vi } from 'vitest';
import { BOSSES,FINALS,EVENTS } from '../src/data/content.js';
import { SAVE_KEY,readCheckpoint } from '../src/persistence.js';
import { rngState } from '../src/util.js';
import {playRun} from '../scripts/strategies.js';
let api;
beforeAll(async()=>{
  document.body.innerHTML='<div id="app"></div><div id="toast" hidden></div>';
  ({api}=await import('../src/game.js'));
});
beforeEach(()=>{localStorage.clear();api.setHeadless(true);api.resetMeta()});
const fresh=(seed='REGRESSION')=>{api.newRun({seed});return api.run};
const finish=()=>{while(api.run.idx<api.run.hand.length)api.choose(false)};
const show=scene=>{api.setHeadless(false);api.setScene(scene);api.render()};
const click=act=>document.querySelector(`[data-act="${act}"]`).click();
const bossDay=boss=>{const r=fresh();r.day=3;r.boss=boss;r.cash=1e8;return r};

describe('property transactions and Tycoon continuation',()=>{
  it('allows profitable flips but blocks rebuying sold lots until the next day, including after resume',()=>{
    const r=fresh();r.perks=[api.newPerk('flipper')];
    const l=r.lots.find(l=>!r.town.find(d=>d.id===l.dist).gim?.noSell),start=r.cash;
    expect(api.buyLot(l.id)).toBe(true);expect(api.sellLot(l.id)).toBe(true);
    expect(r.cash).toBeCloseTo(start+l.price*.2);
    expect(api.buyLot(l.id)).toBe(false);
    api.saveSession();expect(api.resumeRun()).toBe(true);expect(api.buyLot(l.id)).toBe(false);
    api.run.cash=1e9;api.startDay();expect(api.buyLot(l.id)).toBe(true);
  });
  it.each(['news','shop','resolve'])('returns to %s after buying the final lot',origin=>{
    const r=fresh();if(origin!=='news')finish();if(origin==='shop')api.openShop();
    r.cash=1e9;show(origin);click('town');
    for(const l of r.lots)api.buyLot(l.id);
    expect(api.scene).toBe('tycoon');const pearls=api.meta.pearls;
    api.saveSession();expect(api.resumeRun()).toBe(true);click('town2');click('back');
    expect(api.scene).toBe(origin);expect(r.day).toBe(api.run.day);
    expect(api.meta.pearls).toBe(pearls);
    if(origin==='news'){expect(api.run.resolvedDay).toBe(0);expect(api.run.result).toBeUndefined()}
  });
});

describe('boss suppression survives inventory changes',()=>{
  it.each([BOSSES.find(b=>b.id==='goose'),FINALS.find(b=>b.id==='cousin')])('$name keeps its target disabled when moved or another perk is sold',boss=>{
    const r=bossDay(boss);r.perks=[api.newPerk('gnome'),api.newPerk('mcat'),api.newPerk('larry')];api.startDay();
    const target=r.perks.find(p=>p.disabled);expect(target).toBeDefined();
    const i=r.perks.indexOf(target);api.movePerk(i,i? -1:1);
    expect(api.activePerks().some(a=>a.p===target)).toBe(false);
    api.sellPerk(r.perks.findIndex(p=>p!==target));
    expect(target.disabled).toBe(true);expect(api.activePerks().some(a=>a.p===target)).toBe(false);
    api.startDay();expect(target.disabled).toBe(false);
  });
  it('does not let an Intern copy its disabled neighbor',()=>{
    const r=bossDay(BOSSES.find(b=>b.id==='goose'));r.perks=[api.newPerk('intern'),api.newPerk('mcat')];api.startDay();
    expect(api.activePerks().map(p=>p.id)).toEqual(['intern']);
    api.movePerk(1,-1);expect(api.activePerks().map(p=>p.id)).toEqual(['intern']);
  });
  it('cannot pawn a disabled Aunt\'s Pearls to survive',()=>{
    const r=bossDay(BOSSES.find(b=>b.id==='goose'));r.perks=[api.newPerk('pearls')];api.startDay();r.cash=1;finish();
    expect(r.dead).toBe(true);expect(r.result.saved).toBe(false);
  });
  it('copies the disable state with Offshore Will',()=>{
    const r=bossDay(BOSSES.find(b=>b.id==='goose'));r.perks=[api.newPerk('mcat')];api.startDay();
    r.cons=[{k:'env',id:'crypt'}];api.useCons(0);expect(api.activePerks()).toHaveLength(0);
  });
});

describe('determinism and item timing',()=>{
  it('produces identical gameplay after redraws, sheets, Town, and headless execution',()=>{
    const play=ui=>{
      localStorage.clear();api.resetMeta();api.setHeadless(true);const r=fresh('DRAW-TEST');finish();
      if(ui){show('resolve');click('hands');click('closemodal');click('town');click('back');api.render()}
      api.setHeadless(true);api.openShop();const offers=JSON.stringify(api.shop);api.startDay();
      return {offers,run:JSON.stringify(r),rng:rngState()};
    };
    const headless=play(false),rendered=play(true);
    // Only the animation visibility flag is presentation state.
    const normalized=x=>JSON.parse(x.run);const a=normalized(headless),b=normalized(rendered);delete a.back;delete b.back;
    expect(b).toEqual(a);expect(rendered.offers).toBe(headless.offers);expect(rendered.rng).toBe(headless.rng);
  });
  it('fires Loyalty Card on bells four and eight, including an Intern',()=>{
    const r=fresh();r.perks=[api.newPerk('intern'),api.newPerk('loyalty')];const counts=[];
    for(let n=1;n<=8;n++){r.cash=1e9;api.setEvent(EVENTS[0]);finish();counts.push(r.result.steps.filter(s=>s.who.includes('Loyalty Card')).length);api.startDay()}
    expect(counts).toEqual([0,0,0,2,0,0,0,2]);
  });
  it.each(['news','play','town'])('verifies unplayed cards immediately when Ring is used in %s',scene=>{
    const r=fresh();api.setScene(scene);if(scene==='town')r.back='news';
    r.cons=[{k:'env',id:'ring'}];expect(api.useCons(0)).toBe(true);
    expect(r.hand.every(c=>c.verified&&c.hint===(c.up?'bull':'bear'))).toBe(true);
    for(let n=0;n<3;n++){r.cash=1e9;finish();expect(r.ring).toBe(2-n);api.startDay();if(n<2)expect(r.hand.every(c=>c.verified)).toBe(true)}
  });
  it.each(['resolve','shop','town'])('gives three future days when Ring is used after resolution in %s',scene=>{
    const r=fresh();finish();if(scene==='shop')api.openShop();api.setScene(scene);if(scene==='town')r.back='resolve';
    r.cons=[{k:'env',id:'ring'}];api.useCons(0);
    for(let n=0;n<3;n++){r.cash=1e9;api.startDay();expect(r.hand.every(c=>c.verified)).toBe(true);finish()}
    expect(r.ring).toBe(0);
  });
  it('verifies only the remaining certificates when used mid-market',()=>{
    const r=fresh();api.setScene('play');api.choose(false);r.cons=[{k:'env',id:'ring'}];api.useCons(0);
    expect(r.hand[0].verified).toBe(false);expect(r.hand.slice(1).every(c=>c.verified)).toBe(true);
  });
});

describe('atomic resume and storage failure',()=>{
  it('resumes a partially played hand with shared company identity and identical future results',()=>{
    const r=fresh('SAVE-EXACT');api.setScene('play');api.choose(true);r.cons=[{k:'memo',id:'gild'}];api.useCons(0);api.saveSession();
    const disk=localStorage.getItem(SAVE_KEY);finish();api.openShop();const expected={cash:r.cash,deck:JSON.stringify(r.deck),shop:JSON.stringify(api.shop),rng:rngState()};
    localStorage.setItem(SAVE_KEY,disk);expect(api.resumeRun()).toBe(true);const restored=api.run;
    expect(restored.idx).toBe(1);for(const c of restored.hand)expect(c.co).toBe(restored.deck.find(co=>co.id===c.co.id));
    finish();api.openShop();expect({cash:restored.cash,deck:JSON.stringify(restored.deck),shop:JSON.stringify(api.shop),rng:rngState()}).toEqual(expected);
  });
  it('preserves purchased shop offers and prevents rerolling on resume',()=>{
    const r=fresh();finish();api.openShop();r.cash=1e8;api.buyOffer(0);api.saveSession();
    const saved=JSON.stringify(api.shop),cash=r.cash;expect(api.resumeRun()).toBe(true);
    expect(api.scene).toBe('shop');expect(JSON.stringify(api.shop)).toBe(saved);expect(api.run.cash).toBe(cash);expect(api.buyOffer(0)).toBe(false);
  });
  it('keeps earned progression once on death and removes the resumable run',()=>{
    const r=fresh();r.cash=0;show('news');finish();const pearls=api.meta.pearls;
    expect(r.dead).toBe(true);expect(pearls).toBeGreaterThan(0);
    expect(JSON.parse(localStorage.getItem(SAVE_KEY)).checkpoint).toBe(null);
    expect(api.resumeRun()).toBe(false);api.render();expect(api.meta.pearls).toBe(pearls);
  });
  it('preserves a checkpoint through a fresh boot and shows Resume',async()=>{
    fresh();api.saveSession();const disk=localStorage.getItem(SAVE_KEY);
    const {boot,api:reloaded}=await import('../src/game.js');api.setHeadless(false);boot();
    expect(document.querySelector('[data-act="resume"]')).not.toBeNull();
    expect(JSON.parse(localStorage.getItem(SAVE_KEY)).checkpoint).toEqual(JSON.parse(disk).checkpoint);
    expect(reloaded.resumeRun()).toBe(true);expect(reloaded.run.day).toBe(1);
  });
  it('rejects incompatible or corrupt checkpoints without losing legacy progression',()=>{
    localStorage.setItem(SAVE_KEY,JSON.stringify({pearls:17,up:{allowance:2},checkpoint:{version:999}}));
    api.resetMeta();expect(api.meta.pearls).toBe(17);expect(api.meta.up.allowance).toBe(2);expect(api.resumeRun()).toBe(false);
    expect(readCheckpoint({version:1,run:{v:10}})).toBeNull();
    localStorage.setItem(SAVE_KEY,'not json');expect(api.resumeRun()).toBe(false);
  });
  it('rejects incomplete current-version snapshots and unsafe return screens',()=>{
    fresh();api.saveSession();const disk=JSON.parse(localStorage.getItem(SAVE_KEY));
    const missing=structuredClone(disk.checkpoint);delete missing.run.town;expect(readCheckpoint(missing)).toBeNull();
    const wrongReturn=structuredClone(disk.checkpoint);wrongReturn.scene='town';wrongReturn.run.back='resolve';
    expect(readCheckpoint(wrongReturn)).toBeNull();
    wrongReturn.run.back='unknown';expect(readCheckpoint(wrongReturn)).toBeNull();
    const completed=structuredClone(disk.checkpoint);completed.scene='resolve';expect(readCheckpoint(completed)).toBeNull();
  });
  it('leaves the previous checkpoint intact if storage is full',()=>{
    fresh();api.saveSession();const disk=localStorage.getItem(SAVE_KEY);
    const spy=vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('quota')});
    expect(api.saveSession()).toBe(false);expect(localStorage.getItem(SAVE_KEY)).toBe(disk);spy.mockRestore();
  });
});

describe('keyboard and untrusted seed text',()=>{
  it('escapes seed markup on the result screen',()=>{
    const r=fresh('<B>TEST</B>');finish();show('over');
    expect(document.getElementById('app').textContent).toContain(r.seed);
    expect(document.querySelector('.d.yel b')).toBeNull();
  });
  it('opens slots with Enter and Space, traps modal focus, and returns focus on Escape',()=>{
    const r=fresh();r.perks=[api.newPerk('gnome')];show('news');
    for(const key of ['Enter',' ']){
      const slot=document.querySelector('[data-act="perk"]');slot.focus();
      slot.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true,cancelable:true}));expect(r.modal?.kind).toBe('perk');
      expect(document.activeElement.closest('[role="dialog"]')).not.toBeNull();
      document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));
      expect(document.activeElement.closest('[role="dialog"]')).not.toBeNull();
      document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
      expect(r.modal).toBeNull();expect(document.activeElement.dataset.act).toBe('perk');
    }
  });
  it('does not trade on a vertical gesture or a cancelled horizontal gesture',()=>{
    vi.useFakeTimers();
    try{
      const r=fresh();show('play');const card=document.querySelector('#deck .card:not(.back)');card.setPointerCapture=()=>{};
      const pointer=(type,x,y)=>card.dispatchEvent(Object.assign(new Event(type,{bubbles:true}),{clientX:x,clientY:y,pointerId:1}));
      pointer('pointerdown',20,20);pointer('pointermove',130,200);pointer('pointerup',130,200);vi.advanceTimersByTime(250);expect(r.idx).toBe(0);
      pointer('pointerdown',20,20);pointer('pointermove',130,20);pointer('pointercancel',130,20);vi.advanceTimersByTime(250);expect(r.idx).toBe(0);
      pointer('pointerdown',20,20);pointer('pointermove',130,20);pointer('pointerup',130,20);vi.advanceTimersByTime(250);expect(r.idx).toBe(1);
    }finally{vi.useRealTimers()}
  });
});

describe('strategic simulation',()=>{
  it('replays the same strategy and seed, including the endless option',()=>{
    for(const endless of [false,true]){
      const opts={smart:true,endless,seed:'SMART-17'};
      const a=playRun(api,opts),b=playRun(api,opts);expect(b).toEqual(a);
      expect(Number.isFinite(a.peak)).toBe(true);expect(a.days).toBeLessThanOrEqual(120);
    }
  });
});
