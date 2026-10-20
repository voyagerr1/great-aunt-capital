// Baseline bots stay naive for historical comparisons. Smart mode uses only visible
// hints, portfolio hands and perks, never the hidden up/fraud outcomes.
import { qualifying } from '../src/engine/hands.js';
const ADD=new Set(['contra','pump','ponzi','bag','indexer','gnome','swiper']);
// Items the smart bot will buy: no downside, or a downside it can read.
const GOOD=new Set(['gild','notary','hot','redseal','goldseal','blueseal','clone','pump','swan','ring','shell']);
const MULT=new Set(['larry','cat','mcat','clock','specialist','yolobro','loyalty','mildred']);
function orderPerks(api){
  const rank=p=>p.id==='intern'?3:MULT.has(p.id)||p.ed==='holo'?4:ADD.has(p.id)?0:1;
  const wanted=api.run.perks.slice().sort((a,b)=>rank(a)-rank(b));
  wanted.forEach((p,target)=>{let i=api.run.perks.indexOf(p);while(i>target){api.movePerk(i,-1);i--}});
  api.run.modal=null;
}
function smartBuy(api,c){
  const r=api.run;
  if(c.hint==='bull')return true;
  const buys=r.hand.filter(x=>x.bought),best=cards=>Math.max(1,...qualifying(cards,r.hand).map(api.handMult));
  // A low-risk extra buy may complete a hand for the existing bullish positions.
  return c.co.vol===1&&buys.length>=2&&r.cash>api.rentTonight()*2&&best([...buys,c])>=best(buys)+2;
}
export function playRun(api, { strategy = 'balanced', size = 0.25, shop = true, maxDays = 120, seed, smart=false, endless=false } = {}) {
  api.resetMeta();
  api.newRun({seed});
  let run = api.run;
  run.size = size;
  for (let g = 0; g < maxDays && !run.dead; g++) {
    if(smart){
      api.setScene('play');orderPerks(api);
      while(run.idx<run.hand.length){const c=run.hand[run.idx];if(c)api.choose(smartBuy(api,c))}
      // Gloria's empty first-day market is not used by these baseline runs.
    }else run.hand.forEach(c => api.choose(c.hint === 'bull'));
    if (run.dead) break;
    if (shop) {
      api.openShop();
      const keep = 3 * api.rentFor(run.day + 1);
      api.shop.forEach((o, i) => { if ((o.t === 'perk' || o.k === 'alm'||smart&&GOOD.has(o.id)) && run.cash - o.price > keep) api.buyOffer(i); });
    }
    if (strategy !== 'stocks') {
      const keep = 2 * api.rentFor(run.day + 1);
      for (const l of run.lots) if (!run.props[l.id] && run.cash - api.lotPrice(l) > keep) api.buyLot(l.id);
    }
    if (run.tycoon&&!endless) break;
    if(run.tycoon&&endless&&!run.endless)api.continueTycoon();
    if(g+1<maxDays)api.startDay();
    run = api.run;
  }
  return { days: run.day, peak: run.peak, tycoon: !!run.tycoon, richest: !!run.richest, bestMult: run.best ? run.best.mult : 1, bosses: run.bossesBeat };
}
export const quantile = (arr, q) => [...arr].sort((a, b) => a - b)[Math.floor(q * (arr.length - 1))];
