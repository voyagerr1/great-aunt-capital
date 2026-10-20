import {beforeAll,beforeEach,describe,it,expect,vi} from 'vitest';
import {fmtK,rngState} from '../src/util.js';
import {SAVE_KEY} from '../src/persistence.js';
let api,boot;
beforeAll(async()=>{
  document.body.innerHTML='<div id="app"></div><div id="toast" hidden></div>';
  ({api,boot}=await import('../src/game.js'));
});
beforeEach(()=>{localStorage.clear();api.setHeadless(true);api.resetMeta();api.newRun({seed:'PLAYER-UX'})});
const show=scene=>{api.setHeadless(false);api.setScene(scene);api.render()};
const el=act=>document.querySelector(`[data-act="${act}"]`);
const finish=()=>{while(api.run.idx<api.run.hand.length)api.choose(false)};

describe('player decision clarity',()=>{
  it('previews the actual investment and keeps keyboard focus on the selected size',()=>{
    show('play');const button=document.querySelector('[data-act="size"][data-z="0.5"]');button.focus();button.click();
    expect(document.activeElement.dataset.z).toBe('0.5');
    expect(document.activeElement.getAttribute('aria-pressed')).toBe('true');
    const before=api.run.cash,quote=document.querySelector('.order-quote').textContent;
    api.choose(true);
    const cost=api.run.hand[0].stake;
    expect(quote).toContain(fmtK(cost));expect(quote).toContain(fmtK(before-cost));
    expect(document.querySelector('.trade-receipt').textContent).toContain('Bought');
  });
  it('warns about uninvested cash without pretending the stock principal is a loss',()=>{
    api.run.size=1;show('play');
    expect(document.querySelector('.decision-note.caution').textContent).toContain('Stocks settle before rent');
    expect(document.querySelector('.order-quote').textContent).toContain('Cash left uninvested');
  });
  it('shows forced buys and blocked sectors consistently with the trading rules',()=>{
    api.setEvent({id:'forced',name:'Forced',txt:'Test rule',fx:{forceAll:true}});show('play');
    expect(el('pass').disabled).toBe(true);expect(el('buy').textContent).toContain('Required buy');
    api.choose(false);expect(api.run.hand[0].bought).toBe(true);
    api.setEvent({id:'audit',name:'Auditor',txt:'Test rule',fx:{oneEach:true}});
    api.run.hand[1].co.sec=api.run.hand[0].co.sec;show('play');
    expect(el('buy').disabled).toBe(true);expect(el('pass').disabled).toBe(false);
    expect(document.querySelector('.decision-note').textContent).toContain('one per sector');
  });
  it('does not advertise an improved starting multiplier when a boss fixes it at one',()=>{
    api.run.hand[1].co.sec=api.run.hand[0].co.sec;api.choose(true);
    api.setEvent({id:'hedge',name:'Hedge Fund Bro',txt:'Test rule',fx:{noHand:true}});show('play');
    expect(document.querySelector('.hand-boost')).toBeNull();
    expect(document.querySelector('.handline').textContent).not.toContain('×2');
    expect(document.querySelector('.decision-note').textContent).toContain('fixes starting MULT at ×1');
  });
  it('keeps focus inside inventory details and restores the inventory opener on close',()=>{
    api.run.perks=[api.newPerk('gnome')];show('news');el('inventory').focus();el('inventory').click();
    document.querySelector('.sheet [data-act="perk"]').click();
    expect(document.activeElement.closest('[role="dialog"]')).not.toBeNull();
    expect(document.querySelector('.account-window').inert).toBe(true);
    el('closemodal').click();expect(document.activeElement.dataset.act).toBe('inventory');
  });
  it('explains why an item that cannot take effect is disabled',()=>{
    api.run.cash=1e6;api.run.perks=[];api.openShop();api.shop.length=0;api.shop.push({t:'cons',k:'env',id:'takeover',price:1000});show('shop');
    expect(el('buyoffer').disabled).toBe(true);
    expect(document.getElementById('offerReason-0').textContent).toContain('Needs 2 perks');
  });
});

describe('safe result and restart controls',()=>{
  it('opens complete stock modifiers without submitting a drag trade',()=>{
    vi.useFakeTimers();
    try{
      const r=api.run,c=r.hand[0];Object.assign(c.co,{ed:'gold',enh:'glass',seal:'red'});c.co.split=true;show('play');
      const card=document.querySelector('.card'),capture=vi.fn();card.setPointerCapture=capture;
      const button=el('stock');
      button.dispatchEvent(Object.assign(new Event('pointerdown',{bubbles:true}),{clientX:10,clientY:10,pointerId:1}));
      card.dispatchEvent(Object.assign(new Event('pointermove',{bubbles:true}),{clientX:160,clientY:10,pointerId:1}));
      card.dispatchEvent(new Event('pointerup',{bubbles:true}));
      vi.advanceTimersByTime(250);expect(capture).not.toHaveBeenCalled();expect(r.idx).toBe(0);
      const cash=r.cash,state=rngState();button.click();
      const details=document.querySelector('.sheet').textContent;
      for(const label of ['GOLD LEAF','GLASS','RED SEAL','Split ×2'])expect(details).toContain(label);
      expect(details).toContain('Moves 3x');expect(r.idx).toBe(0);expect(r.cash).toBe(cash);expect(rngState()).toBe(state);
    }finally{vi.useRealTimers()}
  });
  it('keeps full market news in a dialog and returns to the current stock',()=>{
    const r=api.run;r.news.push({arc:'Test story',txt:'A full story message for the news reader.'});show('play');
    el('marketnews').focus();el('marketnews').click();
    expect(document.querySelector('.sheet').textContent).toContain('A full story message for the news reader.');
    expect(document.querySelector('.sheet').textContent).toContain(r.event.name);
    el('closemodal').click();expect(document.activeElement.dataset.act).toBe('marketnews');expect(r.idx).toBe(0);
  });
  it('labels settled rent using the amount actually charged',()=>{
    api.setHeadless(true);finish();const paid=api.run.result.rent;
    api.setEvent({id:'changed',name:'Changed',txt:'Test rule',fx:{rent:5}});show('resolve');
    expect(document.querySelector('.rent .lbl').textContent).toBe('Rent paid');
    expect(document.querySelector('.rent .val').textContent).toBe(fmtK(paid));
  });
  it('skips only the tally presentation and never repeats its rewards or consumes RNG',()=>{
    vi.useFakeTimers();
    try{
      show('play');api.choose(true);finish();
      const cash=api.run.cash,state=rngState(),closes=api.run.closes;
      expect(el('finishtally').hidden).toBe(false);el('finishtally').click();
      expect(document.getElementById('settlementSummary').hidden).toBe(false);
      expect(document.getElementById('calculationProgress').value).toBe(1);
      expect(el('finishtally').hidden).toBe(true);
      vi.runAllTimers();api.render();
      expect(api.run.cash).toBe(cash);expect(api.run.closes).toBe(closes);expect(rngState()).toBe(state);
    }finally{vi.useRealTimers()}
  });
  it('keeps the full Closing Bell statement in a dialog',()=>{
    vi.useFakeTimers();
    try{
      show('play');api.choose(true);finish();
      expect(el('statement').hidden).toBe(true);el('finishtally').click();
      expect(el('statement').hidden).toBe(false);el('statement').click();
      expect(document.querySelector('.sheet').textContent).toContain('Net trading');
      expect(document.querySelector('.sheet').textContent).toContain(api.run.result.reaction);
      el('closemodal').click();expect(document.querySelector('.modal')).toBeNull();
    }finally{vi.useRealTimers()}
  });
  it('requires a choice before a Daily Market can replace the saved run',()=>{
    show('play');const seed=api.run.seed;boot();
    const saved=JSON.parse(localStorage.getItem(SAVE_KEY)).checkpoint;
    el('daily').click();expect(api.run).toBeNull();
    expect(document.activeElement.textContent).toBe('Keep saved run');
    el('closemodal').click();expect(JSON.parse(localStorage.getItem(SAVE_KEY)).checkpoint).toEqual(saved);
    el('daily').click();el('replacestart').click();
    expect(api.run.seed).not.toBe(seed);expect(api.run.daily).toBeTruthy();
  });
});
