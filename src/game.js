// Game state, day flow, Closing Bell scoring, rendering and input. Imported by main.js.
import { R, pick, rr, clamp, shuffle, fmt, fmtK, fmtM, QUARTER, SIZES, seedRng, makeSeed } from './util.js';
import { VOL, SECTORS, S, N1, N2, N3, BULL, BEAR, NEWS, FLUFF, REX_BUY, REX_SELL, REX_REACT, PERKS, P, RARITY, PERK_EDS, HANDS, H, MEMOS, ENVELOPES, ENH, SEALS,
  DISTRICT_POOL, buildLots, EVENTS, BOSS_RENT, BOSSES, FINALS, ARCS, EDITIONS, DEPTH, AUNTS, MOODS, UPGRADES } from './data/content.js';
import { qualifying } from './engine/hands.js';
import { PERK_FX } from './engine/perks.js';
import { sprite, bldg } from './sprites.js';
import { sfx, unlock, setMuted } from './audio.js';
import { shareCertificate } from './share.js';

/* ===== State ===== */
const KEY='greataunt.meta.v1';
function loadMeta(){let m=null;try{m=JSON.parse(localStorage.getItem(KEY))}catch(e){}
  const base={pearls:0,up:{allowance:0,hand:0,accuracy:0,discount:0,starter:0,cable:0,deed:0,rentctl:0,pocket:0},best:0,bestCash:0,runs:0,
    mood:0,mono:0,tycoons:0,mute:0,daily:null,bestDay:null};
  if(m){base.up=Object.assign(base.up,m.up||{});delete m.up;Object.assign(base,m)} return base;}
function saveMeta(){try{localStorage.setItem(KEY,JSON.stringify(meta))}catch(e){}}
let meta=loadMeta(), run=null, scene='title', shop=null;
const setup={aunt:0,mood:0};
setMuted(meta.mute);

/* ===== Perks ===== */
const newPerk=(id,ed=null)=>({id,ed,st:{}});
// Active perk slots, left to right. The Intern copies its right neighbour; bosses can switch slots off for the day.
function activePerks(){
  if(!run) return [];
  const off=i=>run.off&&run.off.includes(i), out=[];
  run.perks.forEach((p,i)=>{
    if(off(i)) return;
    const nb=run.perks[i+1];
    if(p.id==='intern'&&nb&&nb.id!=='intern'&&!off(i+1)) out.push({id:nb.id,p:nb,ed:p.ed,slot:i,via:'The Intern'});
    else out.push({id:p.id,p,ed:p.ed,slot:i});
  });
  return out;
}
const has=id=>activePerks().some(a=>a.id===id);
const countPerk=id=>activePerks().filter(a=>a.id===id).length;
const perkSlots=()=>run.perks.filter(p=>p.ed!=='fake').length;
const slotFree=()=>perkSlots()<5;
const resetCat=()=>run.perks.forEach(p=>{if(p.id==='cat')p.st.days=0});

/* ===== Rules helpers ===== */
const fx=k=>run&&run.fx?run.fx[k]:undefined;   // today's effects: event + story arc + boss, see EVENTS
const ED=co=>EDITIONS[co.ed]||{};
const isBoss=d=>d%QUARTER===0;
const isFinal=d=>isBoss(d)&&(d/QUARTER)%(run&&run.mood>=4?2:4)===0;
const nextBossDay=d=>Math.ceil(d/QUARTER)*QUARTER;
// Rent: polynomial early, compounding after day 12 so MULT engines have something to chase. Endless mode compounds harder.
const RENT_GROW=1.12;
const baseRent=d=>(3+Math.pow(d,1.5)*1.2)*1000*Math.pow(RENT_GROW,Math.max(0,d-12));
function rentFor(d){
  let r=baseRent(d)*(has('haven')?.6:1)*(1-.05*meta.up.rentctl)*(run&&run.mood>=1?1.25:1)*(run&&run.aunt==='twins'?1.2:1);
  if(run&&run.endless) r*=Math.pow(1.35,Math.max(0,d-run.tyDay));
  return Math.round(r);
}
function rentTonight(){
  const d=run.day; if(isBoss(d)&&has('umbrella')) return 0;
  const f=fx('rent');
  return Math.round(rentFor(d)*(isBoss(d)?BOSS_RENT:1)*(f===undefined?1:f)*(run.rentX&&d<=run.rentXUntil?run.rentX:1));
}
const infl=()=>Math.max(1,baseRent(run.day)/12000);   // shop prices track rent so they stay meaningful
function lot(c){let budget=run.size>=1?run.cash:Math.min(run.cash,run.dayStart*run.size);if(fx('cap'))budget=Math.min(budget,run.dayStart*fx('cap'));
  const sh=Math.max(0,Math.floor(budget/c.co.price));return {sh,cost:sh*c.co.price}}
// Big orders move the price against you: gains are cut by depth/(depth+stake).
const impact=(c,stake)=>{const d=DEPTH[c.co.vol]*(ED(c.co).depth||1);return d/(d+stake)};
const fmtP=n=>n<10?'$'+n.toFixed(2):fmt(n);
const flare=()=>!!fx('flare');
const rumorAcc=()=>flare()?.5:Math.min(.95,.65+.05*meta.up.accuracy+(has('doom')?.15:0)-(run.mood>=2?.1:0));
const newsAcc=()=>has('hairpiece')?1:flare()?.5:Math.min(.97,.8+.05*meta.up.cable+(has('nephew')?.15:0));
const rexAcc=()=>has('rexghost')?1:fx('rexAcc')||(flare()?.5:has('nephew')?.78:.55);
const handMult=id=>{const h=H(id);return h.base+h.per*(run.hands[id].lvl-1)};
const bestHand=bought=>{let b=null;qualifying(bought,run.hand).forEach(id=>{if(!b||handMult(id)>=handMult(b))b=id});return b};

/* ===== Town ===== */
const L=id=>run.lots.find(l=>l.id===id);
const D=id=>run.town.find(d=>d.id===id);
const gim=l=>D(l.dist).gim||{};
const lotPrice=l=>l.price;
const propVal=id=>lotPrice(L(id));
function monopoly(d){return run.lots.filter(l=>l.dist===d).every(l=>run.props[l.id])}
const monoMult=d=>Math.max((D(d).gim||{}).mono||0,has('zoning')?2:1.5);
// tonight=true rolls the casino and applies boss-day and district events
function propInc(id,tonight){
  const l=L(id),g=gim(l);
  let inc=lotPrice(l)*l.yld*(monopoly(l.dist)?monoMult(l.dist):1)*(has('landlord')?1.4:1)*(g.inc||1);
  if(tonight){
    if(g.casino) inc*=rr(0,3);
    if(g.boss&&isBoss(run.day)) inc*=g.boss;
    const m=fx('dist')&&fx('dist')[l.dist]; if(m!==undefined) inc*=m;
    if(fx('propOff')) inc=0;
  }
  return inc;
}
const totalInc=tonight=>Object.keys(run.props).reduce((s,id)=>s+propInc(id,tonight),0);
const propTotal=()=>Object.keys(run.props).reduce((s,id)=>s+propVal(id),0);
const sellPrice=id=>propVal(id)*(has('flipper')?1.2:.95);
const lotsIn=sec=>Object.keys(run.props).filter(id=>D(L(id).dist).sec===sec).length;
const netWorth=()=>run.cash+propTotal();
function snapshot(){return {nw:netWorth(),cash:run.cash,prop:propTotal()}}
function buyLot(id){
  const l=L(id),pr=lotPrice(l); if(run.props[id]||run.cash<=pr) return;
  run.cash-=pr; run.props[id]={day:run.day};
  if(monopoly(l.dist)&&!meta.mono){meta.mono=1;saveMeta()}
  if(!run.tycoon&&run.lots.every(x=>run.props[x.id])){run.tycoon=true;meta.pearls+=25;meta.tycoons=(meta.tycoons||0)+1;saveMeta();scene='tycoon'}
  render();
}
function weighted(list){let t=list.reduce((s,e)=>s+e.w,0),x=R()*t;for(const e of list){x-=e.w;if(x<=0)return e}return list[0]}

/* ===== Market deck =====
   Each run has ~20 persistent companies. Every morning a handful are dealt as certificates.
   Prices carry over, editions/stamps/seals stick, and companies can be shredded, cloned, merged or delisted. */
function rollEdition(){let x=R();for(const [id,e] of Object.entries(EDITIONS)){if(x<e.w)return id;x-=e.w}return null}
function newCompany(sec,o={}){
  let a,b,tick;
  for(let k=0;k<10;k++){a=pick(N1);b=pick(N2);tick=(a.slice(0,2)+b.slice(0,2)).toUpperCase();if(!run.deck.some(c=>c.tick===tick))break}
  const ed='ed' in o?o.ed:rollEdition(), E=EDITIONS[ed]||{}, price=E.price?rr(...E.price):rr(3,400);
  const co={id:++run.coId,tick,name:`${a} ${b} ${pick(N3)}`,sec,vol:ed==='penny'?3:1+Math.floor(R()*3),price,list:price,ed,enh:o.enh||null,seal:null,seen:0,last:null,lastDay:0,serial:Math.floor(rr(1000,99999))};
  co.hist=preHistory(co); return co;
}
/* Price history: each company keeps its last HIST closes for the charts. Only dealt companies trade, so a newcomer
   arrives with a few closes from before it joined your market. Those are hashed from its serial, not drawn from R(),
   so charts never change what a seed deals. */
const HIST=12;
function preHistory(co){
  let h=(co.serial*2654435761^co.id*40503)>>>0||1;
  const rnd=()=>{h^=h<<13;h>>>=0;h^=h>>>17;h^=h<<5;h>>>=0;return h/4294967296};
  let p=co.price; const out=[p];
  for(let i=0;i<5;i++){p=Math.max(.01,p/(1+(rnd()*2-1)*VOL[co.vol]*.7));out.unshift(p)}
  return out;
}
function buildDeck(){
  const bern=['CRYPTO','CRYPTO','CRYPTO','MEME','MEME'];
  for(let i=0;i<20;i++) run.deck.push(newCompany(run.aunt==='bernice'?pick(bern):run.sectors[i%run.sectors.length]));
  if(run.aunt==='ruth') shuffle(run.deck.slice()).slice(0,4).forEach(co=>co.enh='haunted');
}
function addSector(sec){
  if(run.sectors.includes(sec)) return;
  run.sectors.push(sec); for(let i=0;i<3;i++) run.deck.push(newCompany(sec));
}

/* ===== Run flow ===== */
function newRun(o={}){
  const aunt=o.aunt||'mildred', mood=o.mood||0, seed=String(o.seed||makeSeed()).toUpperCase().slice(0,24);
  seedRng(seed);
  const town=shuffle(DISTRICT_POOL.slice()).slice(0,4);
  run={v:10,seed,daily:o.daily||null,aunt,mood,day:0,cash:100000+25000*meta.up.allowance-(mood>=4?50000:0),peak:0,perks:[],cons:[],consMax:aunt==='twins'?3:2,
    streak:0,reroll:5000,size:.25,props:{},town,lots:buildLots(town),deck:[],coId:0,
    hands:Object.fromEntries(HANDS.map(h=>[h.id,{lvl:1,played:0}])),sold:0,bought:0,bossesBeat:0,closes:0,arc:null,arcsDone:[],ring:0,pumped:null,
    sectors:SECTORS.filter(s=>!s.hidden).map(s=>s.id),heat:0,best:null,modal:null,log:[]};
  if(aunt==='gloria'){run.cash=25000;run.props[run.lots[4].id]={day:0}}
  if(aunt==='ruth') run.cash=10000+Math.round(Math.min(1e6,meta.bestCash*.1));
  if(meta.up.deed) run.props[run.lots[0].id]={day:0};
  if(meta.up.starter) run.perks.push(newPerk(pick(PERKS.filter(p=>p.r==='c')).id));
  if(meta.up.pocket) run.cons.push({k:'alm',id:pick(HANDS).id});
  buildDeck();
  run.start=run.cash; run.peak=run.cash; meta.runs++; saveMeta(); startDay();
}
function startDay(){
  run.day++; const d=run.day;
  if((d-1)%QUARTER===0) run.boss=isFinal(nextBossDay(d))?pick(FINALS):pick(BOSSES);
  advanceArc();
  run.event=isBoss(d)?{...run.boss,isBoss:true,final:isFinal(d)}:d===1?EVENTS[0]:weighted(EVENTS);
  buildFx();
  if(fx('addSector')) addSector(fx('addSector'));
  if(fx('gift')) run.cash+=fx('gift');
  if(fx('tax')) run.cash-=Math.round(run.cash*fx('tax'));
  run.ate=null; if(has('mcat')&&run.cons.length){const i=Math.floor(R()*run.cons.length);run.ate=consName(run.cons[i]);run.cons.splice(i,1)}
  if(fx('shufflePerks')) shuffle(run.perks);
  run.off=[];
  if(fx('disableRight')&&run.perks.length) run.off.push(run.perks.length-1);
  if(fx('disableRandom')&&run.perks.length) run.off.push(Math.floor(R()*run.perks.length));
  run.dayStart=run.cash;
  run.prevSnap=run.snap||null; run.snap=snapshot();
  const present=shuffle([...new Set(run.deck.map(c=>c.sec))]);
  run.trends={}; present.slice(0,2).forEach(s=>run.trends[s]=R()<.5?1:-1);
  const forced=Object.assign({},fx('trend')||{}); if(run.pumped){forced[run.pumped]=1;run.pumped=null}
  run.forced=Object.keys(forced); Object.assign(run.trends,forced);
  run.hand=(run.aunt==='gloria'&&d===1)?[]:deal(); run.idx=0;
  makeNews();
  run.modal=null; scene='news';
  if(isBoss(d)&&!headless) sfx.boss();
  render();
}
// Merge the day's event, story-arc step and boss effects into run.fx.
function buildFx(){
  const f={};
  const merge=o=>{if(!o)return;for(const k in o){
    if(o[k]&&typeof o[k]==='object') f[k]=Object.assign({},f[k],o[k]);
    else if(k==='rent'&&f.rent!==undefined) f.rent*=o[k];
    else f[k]=o[k];}};
  merge(run.event.fx); merge(run.arcStep&&run.arcStep.fx);
  run.distName=null;
  if(f.distRand!==undefined){const dd=pick(run.town);f.dist={[dd.id]:f.distRand};run.distName=dd.name}
  run.fx=f;
}
const evTxt=()=>run.event.txt.replace('{D}',run.distName||'town');
function advanceArc(){
  run.arcStep=null;
  if(run.arc){run.arc.step++;if(run.arc.step>=ARCS.find(a=>a.id===run.arc.id).steps.length)run.arc=null}
  else if(run.day>=3&&R()<.14){const pool=ARCS.filter(a=>!run.arcsDone.includes(a.id));if(pool.length){const A=pick(pool);run.arc={id:A.id,step:0};run.arcsDone.push(A.id)}}
  if(run.arc){const A=ARCS.find(a=>a.id===run.arc.id);let s=A.steps[run.arc.step];if(s.pick)s=pick(s.pick);run.arcStep={...s,name:A.name,n:run.arc.step+1,of:A.steps.length}}
}
function deal(){
  const n=fx('handSize')||4+meta.up.hand+(has('daytrader')?1:0);
  const out=shuffle(run.deck.slice()).slice(0,n).map(co=>{
    const E=ED(co); let pUp=.52; const t=run.trends[co.sec]; if(t===1)pUp=.78; if(t===-1)pUp=.26; pUp+=(fx('pUp')||0)+(E.pUp||0);
    co.seen++; return {co,up:R()<clamp(pUp,.08,.92)};
  });
  out.forEach((c,i)=>{
    if(c.co.enh==='haunted'&&i>0) c.up=out[i-1].up;   // a Haunted company follows the stock before it
    c.verified=(i===0&&has('pigeon'))||run.ring>0;
    hintFor(c);
  });
  for(let k=0;k<(fx('fraud')||0);k++) if(out.length) pick(out).fraud=true;
  return out;
}
function hintFor(c){
  const truth=c.verified||R()<rumorAcc();
  c.hint=truth?(c.up?'bull':'bear'):(c.up?'bear':'bull');
  if(fx('lie')&&!c.verified) c.hint=c.hint==='bull'?'bear':'bull';
  c.rumor=pick(c.hint==='bull'?BULL:BEAR);
}
function makeNews(){
  const items=Object.entries(run.trends).map(([sec,dir])=>{const shown=(run.forced.includes(sec)||R()<newsAcc())?dir:-dir;return {sec,dir:shown,txt:pick(NEWS[sec][shown>0?'up':'down'])}});
  run.news=shuffle(items); run.fluff=pick(FLUFF);
  if(run.arcStep) run.news.unshift({arc:run.arcStep.name,txt:run.arcStep.txt});
  run.rex=[]; if(!run.hand.length||fx('noRex')) return;
  const acc=rexAcc();
  run.rex=shuffle(run.hand.slice()).slice(0,has('rexghost')?2:1).map(t=>{
    const right=R()<acc; t.rex=right?(t.up?'BUY':'SELL'):(t.up?'SELL':'BUY');
    return {tick:t.co.tick,call:t.rex,line:pick(t.rex==='BUY'?REX_BUY:REX_SELL).replace('{T}',t.co.tick)};
  });
}
function choose(buy){
  const c=run.hand[run.idx]; if(!c) return;
  if(c.shredded) buy=false;
  else if(!buy&&(fx('forceAll')||(fx('forceRex')&&c.rex))){toast(fx('forceAll')?'The Cousin insists. You buy it.':'Rex insists. You buy it.');buy=true}
  if(buy&&fx('oneEach')&&run.hand.some(x=>x.bought&&x.co.sec===c.co.sec)){toast('The Auditor allows one per sector. Passing.');buy=false}
  if(buy){const o=lot(c); if(o.sh<1){toast("You can't afford a single share. Passing.");buy=false} else {run.cash-=o.cost;c.stake=o.cost;c.shares=o.sh}}
  c.bought=buy; if(buy) run.bought++; run.idx++;
  if(!headless) (buy?sfx.buy:sfx.pass)();
  if(run.idx>=run.hand.length) resolveDay(); else render();
}

/* ===== The Closing Bell =====
   Every buy that rose adds its gain to GAINS. The portfolio hand sets the starting MULT, then buys score left to right
   (perks with card hooks fire on each), then perks fire left to right. Profit = GAINS x MULT, minus losses (never multiplied). */
function moveFor(c,prev){
  const co=c.co,E=ED(co);
  if(co.enh==='haunted'&&prev!==null) return prev;
  const vol=VOL[co.vol]*((fx('sec')||{})[co.sec]||1)*(fx('move')||1)*(E.move||1)*(run.aunt==='bernice'?1.5:1)*(co.enh==='glass'?3:1);
  const m=rr(.25,1)*vol; let r=c.up?m*1.3:-m;
  if(E.gain&&r>0) r*=E.gain;
  return r;
}
function scoreMoves(){
  let prev=null, pennyUsed=false;
  for(const c of run.hand){
    c.raw=moveFor(c,prev); prev=c.raw;
    let r=c.fraud?-1:c.raw; if(c.co.enh==='notary') r=Math.max(r,-.1);
    c.r=Math.max(r,-1);
    if(!c.bought) continue;
    let e=c.short?-c.r:c.r;
    if(e>0&&!has('whale')){const k=impact(c,c.stake);if(k<.95)c.slip=1-k;e*=k}
    if(e<0&&has('larry')) e*=1.5;
    if(e<0&&has('diamond')) e=Math.max(e,-.5);
    if(e<0&&has('penny')&&!pennyUsed){e=0;pennyUsed=true;c.penny=true}
    c.eff=Math.max(e,-1);
  }
}
function closingBell(){
  const steps=[], bought=run.hand.filter(c=>c.bought), AP=activePerks(), hand=bestHand(bought);
  let mult=1, gains=0, losses=0, bonus=0;
  const x={run,hand,bought,retrig:false,trends:run.trends,lotsIn,
    add(n,who,c){mult+=n;steps.push({k:'add',who:x.via?`${x.via} (${who})`:who,v:n,tick:c&&c.co.tick,m:mult,g:gains})},
    x(n,who,c){mult*=n;steps.push({k:'x',who:x.via?`${x.via} (${who})`:who,v:n,tick:c&&c.co.tick,m:mult,g:gains})},
    cash(n,who){n=Math.round(n);if(!n)return;bonus+=n;steps.push({k:'cash',who,v:n,m:mult,g:gains})},
    note(txt){steps.push({k:'note',who:txt,m:mult,g:gains})}};
  if(hand){run.hands[hand].played++;mult=fx('noHand')?1:handMult(hand);steps.push({k:'hand',who:H(hand).name,lvl:run.hands[hand].lvl,v:mult,m:mult,g:0,boss:!!fx('noHand')})}
  const memes=bought.filter(c=>c.co.sec==='MEME').length, echo=countPerk('echo')*memes, geese=countPerk('gooselord');
  bought.forEach((c,bi)=>{
    const st=c.stake*(c.split?2:1);
    if(c.eff>0){
      const times=1+(c.co.seal==='red'?1:0)+geese+(bi===0?echo:0);
      for(let t=0;t<times;t++){
        x.retrig=t>0; const g=st*c.eff; gains+=g;
        steps.push({k:'card',who:c.co.tick,v:g,r:c.eff,again:t>0,m:mult,g:gains});
        if(c.co.enh==='hot') x.add(4,'Hot Tip',c);
        AP.forEach(a=>{const h=PERK_FX[a.id];x.via=a.via;if(h&&h.card)h.card(x,c,a.p);x.via=null});
      }
      x.retrig=false; c.gain=st*c.eff;
    } else {c.loss=st*c.eff;losses+=c.loss;steps.push({k:'loss',who:c.co.tick,v:c.loss,r:c.eff,m:mult,g:gains})}
    if(ED(c.co).div) x.cash(c.stake*ED(c.co).div*(has('divking')?3:1),`${c.co.tick} dividend`);
    if(c.co.seal==='gold') x.cash(rentTonight()*.5,`${c.co.tick} Gold Seal`);
    if(c.co.seal==='blue'&&hand&&run.cons.length<run.consMax){run.cons.push({k:'alm',id:hand});x.note(`${c.co.tick} Blue Seal: ${H(hand).alm}`)}
    if(has('fortune')&&!c.co.ed&&R()<.25){c.co.ed='gold';x.note(`Fortune Cookie: ${c.co.tick} is Gold Leaf now`)}
    if(c.co.enh==='glass'&&R()<.25){c.shatter=true;x.note(`${c.co.tick} shattered!`)}
  });
  AP.forEach(a=>{const h=PERK_FX[a.id];x.via=a.via;if(h&&h.end)h.end(x,a.p);x.via=null;const e=PERK_EDS[a.ed];
    if(e&&e.add)x.add(e.add,`${e.name} ${P(a.id).name}`);if(e&&e.x)x.x(e.x,`${e.name} ${P(a.id).name}`)});
  if(fx('gain')) x.x(fx('gain'),run.event.name);
  let total=gains*mult, tax=0;
  if(fx('taxGains')){const thr=2*rentTonight();if(total>thr){tax=(total-thr)*fx('taxGains');total-=tax}}
  return {steps,hand,mult,gains,losses,bonus,total,tax};
}
function resolveDay(){
  scoreMoves();
  const cb=closingBell(), bought=run.hand.filter(c=>c.bought);
  run.closes++;
  const net=cb.total+cb.losses+cb.bonus;
  run.cash+=bought.reduce((s,c)=>s+c.stake,0)+net;
  const notes=[];
  // Companies remember their moves. Shattered Glass and collapsed companies leave the market.
  run.hand.forEach(c=>{const co=c.co;co.price=Math.max(.01,co.price*(1+c.r));co.last=c.r;co.lastDay=run.day;co.hist=[...co.hist,co.price].slice(-HIST)});
  run.delisted=[];
  run.deck=run.deck.filter(co=>{
    const card=run.hand.find(c=>c.co===co);
    if(card&&card.shatter){run.delisted.push(`${co.tick} shattered.`);return false}
    if(co.price<co.list*.15||(card&&card.fraud)){run.delisted.push(`${co.tick} was delisted.`);return false}
    return true;
  });
  while(run.deck.length<12) run.deck.push(newCompany(pick(run.sectors)));
  const inc=Math.round(totalInc(true)); run.cash+=inc;
  if(fx('repo')){const ids=Object.keys(run.props).sort((a,b)=>propVal(a)-propVal(b));if(ids.length){const v=Math.round(propVal(ids[0])*.7);run.cash+=v;notes.push([`Repo Man took ${L(ids[0]).name}`,v]);delete run.props[ids[0]]}}
  const rent=rentTonight();
  if(has('savings')){const b=Math.round(Math.min(Math.max(0,run.cash)*.05,rent));if(b>0){run.cash+=b;notes.push(['Savings interest',b])}}
  if(has('ponzi')&&run.sold){const b=Math.round(Math.max(0,run.cash)*.01*run.sold);run.cash-=b;notes.push(['Ponzi Pete skims',-b])}
  run.cash=Math.round(run.cash-rent);
  // Broke? The bank fire-sells your cheapest lots first.
  const fire=[];
  if(run.cash<=0){for(const id of Object.keys(run.props).sort((a,b)=>propVal(a)-propVal(b))){if(run.cash>0)break;const v=Math.round(propVal(id)*.7);run.cash+=v;delete run.props[id];fire.push([L(id).name,v])}}
  run.streak=net>0?run.streak+1:0;
  run.perks.forEach(p=>{if(p.id==='cat')p.st.days=(p.st.days||0)+1});
  if(run.ring>0) run.ring--;
  run.result={net,rent,notes,saved:false,inc,fire,...cb,shown:headless};
  if(run.cash<=0&&run.perks.some(p=>p.id==='pearls')){run.perks.splice(run.perks.findIndex(p=>p.id==='pearls'),1);run.cash=3*rentFor(run.day);run.result.saved=run.cash}
  // Survive a Boss Landlord: bounty, a free memo, and (on a Final Boss) the next Mood unlocks.
  if(isBoss(run.day)&&run.cash>0){
    run.bossesBeat++; const bounty=rentFor(run.day); run.cash+=bounty; run.result.bounty=bounty;
    if(run.cons.length<run.consMax){const m=pick(MEMOS);run.cons.push({k:'memo',id:m.id});run.result.prize=m.name}
    if(isFinal(run.day)&&meta.mood<4&&run.mood>=meta.mood){meta.mood=run.mood+1;run.result.moodUp=MOODS[meta.mood].name;saveMeta()}
  }
  run.heat=cb.mult>=1000?3:cb.mult>=100?2:cb.mult>=10?1:0;
  if(!run.best||cb.total>run.best.total) run.best={total:cb.total,mult:cb.mult,hand:cb.hand?H(cb.hand).name:'No hand',day:run.day};
  if(!meta.bestDay||cb.total>meta.bestDay.total){meta.bestDay={total:cb.total,mult:cb.mult,hand:run.best.hand};saveMeta()}
  run.peak=Math.max(run.peak,netWorth());
  run.dead=run.cash<=0;
  if(run.dead) endRun();
  run.modal=null; scene='resolve';
  if(!run.dead&&!run.ascended&&netWorth()>=1e100){run.ascended=true;scene='ascend'}
  render();
}
function endRun(){
  run.earned=Math.max(1,Math.round(((run.day-1)+Math.max(0,Math.floor(3*Math.log2(run.peak/100000)))+run.bossesBeat+(run.tycoon?10:0))*(1+.25*run.mood)));
  meta.pearls+=run.earned; meta.best=Math.max(meta.best,run.day); meta.bestCash=Math.max(meta.bestCash,run.peak);
  if(run.daily){if(!meta.daily||meta.daily.date!==run.daily)meta.daily={date:run.daily,best:0};meta.daily.best=Math.max(meta.daily.best,run.day)}
  saveMeta();
}

/* ===== Shop: the Newsstand every day, the Broker (perks) at quarter end ===== */
const priceOf=p=>Math.round(p.cost*1000*infl()*(1-.1*meta.up.discount)*(run.mood>=3?1.5:1)/500)*500;
const consPrice=k=>Math.round(({alm:4,memo:5,env:10})[k]*1000*infl()/500)*500;
const sellVal=p=>Math.round(priceOf(P(p.id))/2/500)*500;
function rollPerk(){
  const owned=id=>run.perks.some(q=>q.id===id)||shop.some(o=>o.id===id);
  const pool=PERKS.filter(p=>p.r!=='l'&&!owned(p.id)); if(!pool.length) return null;
  const r=weighted(['c','u','r'].map(k=>({k,w:RARITY[k].w}))).k, sub=pool.filter(p=>p.r===r), p=pick(sub.length?sub:pool);
  let ed=null,x=R(); for(const [k,e] of Object.entries(PERK_EDS)){if(x<e.w){ed=k;break}x-=e.w}
  return {t:'perk',id:p.id,ed,price:Math.round(priceOf(p)*(ed?1.5:1)/500)*500};
}
function rollCons(){
  const fav=Object.entries(run.hands).sort((a,b)=>b[1].played-a[1].played)[0];
  let k,id;
  for(let t=0;t<6;t++){   // no duplicate offers on one shelf
    const x=R(); k=x<.5?'alm':x<.9?'memo':'env';
    id=k==='alm'?(R()<.5&&fav[1].played?fav[0]:pick(HANDS).id):k==='memo'?pick(MEMOS).id:pick(ENVELOPES).id;
    if(!shop.some(o=>o.k===k&&o.id===id)) break;
  }
  return {t:'cons',k,id,price:consPrice(k)};
}
function openShop(reroll){
  if(!reroll) run.reroll=5000;
  const broker=isBoss(run.day); shop=[];
  if(broker){const n=3+(run.aunt==='twins'?2:0)-(run.mood>=3?1:0);for(let i=0;i<n;i++){const p=rollPerk();if(p)shop.push(p)}}
  for(let i=0;i<(broker?2:3);i++) shop.push(rollCons());
  run.modal=null; scene='shop'; render();
}
const rerollCost=()=>Math.round(run.reroll*infl()/500)*500;
function buyOffer(i){
  const o=shop[i]; if(!o||o.sold||run.cash<=o.price) return false;
  if(o.t==='perk'&&!slotFree()&&o.ed!=='fake'){toast('No free perk slot. Sell one first.');return false}
  if(o.t==='cons'&&run.cons.length>=run.consMax){toast('Your pockets are full.');return false}
  run.cash-=o.price; o.sold=true;
  if(o.t==='perk') run.perks.push(newPerk(o.id,o.ed)); else run.cons.push({k:o.k,id:o.id});
  if(!headless) sfx.cash(); render(); return true;
}
function sellPerk(i){const p=run.perks[i];if(!p)return;const v=sellVal(p);run.cash+=v;run.perks.splice(i,1);run.sold++;run.off=[];run.modal=null;toast(`Sold ${P(p.id).name} for ${fmt(v)}.`);render()}
function movePerk(i,d){const j=i+d;if(j<0||j>=run.perks.length)return;[run.perks[i],run.perks[j]]=[run.perks[j],run.perks[i]];run.off=[];run.modal={kind:'perk',i:j};render()}

/* ===== Consumables ===== */
const MEMO=id=>MEMOS.find(m=>m.id===id), ENV=id=>ENVELOPES.find(e=>e.id===id);
const consName=k=>k.k==='alm'?H(k.id).alm:k.k==='memo'?MEMO(k.id).name:ENV(k.id).name;
const consDesc=k=>k.k==='alm'?`${H(k.id).name} goes up a level (+${H(k.id).per} MULT). ${H(k.id).txt}`:k.k==='memo'?MEMO(k.id).txt:ENV(k.id).txt;
const consCode=k=>k.k==='alm'?'AL':consName(k).replace(/[^A-Za-z ]/g,'').split(' ').map(w=>w[0]).join('').slice(0,2).padEnd(2,consName(k)[1]).toUpperCase();
const KIND={alm:'Almanac',memo:'Memo',env:'Brown Envelope'};
function useCons(i){
  const k=run.cons[i]; if(!k) return false;
  const ok=k.k==='alm'?useAlm(k.id):k.k==='memo'?useMemo(k.id):useEnv(k.id);
  if(!ok) return false;
  run.cons.splice(i,1); run.modal=null; if(!headless) sfx.use();
  if(ok==='pass') choose(false); else render();
  return true;
}
function useAlm(id){run.hands[id].lvl++;toast(`${H(id).name} is now level ${run.hands[id].lvl}: ${handMult(id)} MULT.`);return true}
function useMemo(id){
  const M=MEMO(id), c=scene==='play'?run.hand[run.idx]:null;
  if(M.t==='card'&&!c){toast('Use this on a certificate while you trade.');return false}
  const co=c.co;
  if(id==='tip'){c.verified=true;hintFor(c)}
  else if(id==='short') c.short=true;
  else if(id==='split') c.split=true;
  else if(id==='gild') co.ed='gold';
  else if(['notary','glass','hot'].includes(id)) co.enh=id;
  else if(id==='haunt'){co.enh='haunted';if(run.idx>0){c.up=run.hand[run.idx-1].up;hintFor(c)}}
  else if(id.endsWith('seal')) co.seal=id.replace('seal','');
  else if(id==='shred'){if(run.deck.length<=8){toast('The market needs at least 8 companies.');return false}run.deck=run.deck.filter(x=>x!==co);c.shredded=true;toast(`${co.tick} shredded. Gone for good.`);return 'pass'}
  else if(id==='clone'){run.deck.push({...co,hist:[...co.hist],id:++run.coId,seen:0,name:co.name.endsWith(' II')?co.name:co.name+' II',serial:Math.floor(rr(1000,99999))});toast(`${co.tick} copied into the market.`)}
  else if(id==='merge'){const nx=run.hand[run.idx+1];if(!nx){toast('A Merger needs another certificate after this one.');return false}
    if(co.ed)nx.co.ed=co.ed;if(co.enh)nx.co.enh=co.enh;if(co.seal)nx.co.seal=co.seal;run.deck=run.deck.filter(x=>x!==co);c.shredded=true;toast(`${co.tick} merged into ${nx.co.tick}.`);return 'pass'}
  else if(id==='pump'){run.pumped=co.sec;toast(`${co.sec} will trend up tomorrow.`)}
  return true;
}
function useEnv(id){
  if(id==='legend'){if(!slotFree()){toast('No free perk slot.');return false}const pool=PERKS.filter(p=>p.r==='l'&&!run.perks.some(q=>q.id===p.id));if(!pool.length)return false;
    const p=pick(pool);run.perks.push(newPerk(p.id));run.cash=Math.round(run.cash/2);toast(`${p.name} joins you. Half your cash is gone.`)}
  else if(id==='takeover'){if(run.perks.length<2){toast('You need at least 2 perks.');return false}const gone=run.perks.splice(Math.floor(R()*run.perks.length),1)[0];const h=pick(run.perks);h.ed='holo';toast(`${P(gone.id).name} destroyed. ${P(h.id).name} is Holographic.`)}
  else if(id==='swan'){HANDS.forEach(h=>run.hands[h.id].lvl++);toast('Every hand went up a level.')}
  else if(id==='shell'){for(let i=0;i<3;i++)run.deck.push(newCompany(pick(run.sectors),{enh:'glass'}));toast('3 Glass companies joined the market.')}
  else if(id==='counterfeit'){const c=run.perks.filter(p=>p.ed!=='fake');if(!c.length){toast('You need a perk.');return false}const p=pick(c);p.ed='fake';run.cash=Math.round(run.cash*.75);toast(`${P(p.id).name} is Counterfeit now. It takes no slot.`)}
  else if(id==='ring'){run.ring=3;if(scene==='play')run.hand.slice(run.idx).forEach(c=>{c.verified=true;hintFor(c)});toast('Every rumor is true for 3 days.')}
  else if(id==='crypt'){if(!run.perks.length){toast('You need a perk.');return false}const p=pick(run.perks);run.perks=[p,newPerk(p.id)];run.off=[];toast(`Two copies of ${P(p.id).name}. Everything else is gone.`)}
  else if(id==='offshore'){run.cash+=3*rentFor(run.day);run.rentX=1.5;run.rentXUntil=nextBossDay(run.day);toast('Cash wired in. Rent is 1.5x until the quarter ends.')}
  return true;
}

/* ===== Render ===== */
const app=typeof document!=='undefined'?document.getElementById('app'):null;
let headless=!app;   // sims turn rendering off for speed
const secChip=id=>`<span class="sec" style="background:${S(id).c}">${id}</span>`;
// Stock-app bits: a move like "▲ 4.2%" and a sparkline of closes, with a dotted line at the first close.
const chg=r=>`<span class="${r>=0?'up':'down'}">${r>=0?'▲':'▼'} ${Math.abs(r*100).toFixed(1)}%</span>`;
function sparkSVG(hist,cls='spark'){
  const n=hist.length, lo=Math.min(...hist), hi=Math.max(...hist);
  const y=v=>(hi>lo?88-(v-lo)/(hi-lo)*76:50).toFixed(1), x=i=>(n<2?200:i/(n-1)*200).toFixed(1);
  return `<svg class="${cls}" viewBox="0 0 200 100" preserveAspectRatio="none"><line class="base" x1="0" x2="200" y1="${y(hist[0])}" y2="${y(hist[0])}"/><polyline class="ln ${hist[n-1]>=hist[0]?'up':'dn'}" points="${hist.map((v,i)=>`${x(i)},${y(v)}`).join(' ')}"/></svg>`;
}
const lastClose=()=>Math.max(0,...run.deck.map(c=>c.lastDay||0));
const lotCount=()=>Object.keys(run.props).length;
// One-line coaching for a player's first run.
const tip=txt=>meta.runs<=1&&run.day<=1?`<div class="tip">${txt}</div>`:'';
// Top of every in-run screen: money, perk and item slots, this quarter's boss and the Hands list.
function hud(){
  const rent=rentTonight(), boss=isBoss(run.day), fake=run.perks.filter(p=>p.ed==='fake').length, np=5+fake;
  const cells=run.perks.map((p,i)=>{const d=P(p.id);
    return `<div class="slot on ${p.ed?'ped-'+p.ed:''} ${run.off&&run.off.includes(i)?'off':''}" style="background:${d.c}" data-act="perk" data-i="${i}" role="button" tabindex="0" aria-label="${d.name}">${d.code}</div>`});
  for(let i=perkSlots();i<5;i++) cells.push('<div class="slot"></div>');
  const cons=[];for(let i=0;i<run.consMax;i++){const k=run.cons[i];
    cons.push(k?`<div class="slot cons k-${k.k}" data-act="cons" data-i="${i}" role="button" tabindex="0" aria-label="${consName(k)}">${consCode(k)}</div>`:'<div class="slot cons"></div>')}
  const B=run.boss, bd=nextBossDay(run.day), cols=`grid-template-columns:repeat(${np},1fr) 2px repeat(${run.consMax},1fr)`;
  return `<div class="hud">
    <div class="cash"><div class="lbl">Cash</div><div class="val tab">${fmt(run.cash)}</div></div>
    <div class="day"><div class="lbl">Day · Q${Math.ceil(run.day/QUARTER)}</div><div class="val tab">${run.day}</div></div>
    <div class="rent ${boss?'boss':''}"><div class="lbl">${boss?'Boss rent':'Rent tonight'}</div><div class="val tab">${fmtK(rent)}</div></div>
  </div>
  <div class="slotlbl" style="${cols}"><span style="grid-column:1/span ${np}">Perks ${perkSlots()}/5</span><span style="grid-column:${np+2}/-1">Items</span></div>
  <div class="perks" style="${cols}">${cells.join('')}<span class="div"></span>${cons.join('')}</div>
  <div class="hudrow"><button class="bossbar ${boss?'now':''} ${isFinal(bd)?'final':''}" data-act="boss"><span>${boss?'BOSS TODAY':`BOSS · DAY ${bd}`}</span><b>${B.name}</b><i>${B.txt}</i></button><button class="sm ghost" data-act="hands">Hands</button></div>`;
}
function perkState(p){
  if(p.id==='cat') return `Now x${fmtM(1+.2*(p.st.days||0))} MULT.`;
  if(p.id==='gnome') return `Now +${1+2*run.bossesBeat} MULT.`;
  if(p.id==='swiper') return `Now +${fmtM(run.bought*.25)} MULT.`;
  if(p.id==='ponzi') return `Now +${2*run.sold} MULT.`;
  if(p.id==='loyalty') return `${4-run.closes%4} Closing Bells to go.`;
  if(p.id==='mildred') return `Now x${Math.max(1,Math.floor(run.day/4))} MULT.`;
  if(p.id==='intern'){const i=run.perks.indexOf(p),nb=run.perks[i+1];return nb&&nb.id!=='intern'?`Copying ${P(nb.id).name}.`:'Nothing to copy. Put a perk to its right.'}
  return '';
}
const sheet=(inner,close=true)=>`<div class="modal" data-act="closemodal"><div class="sheet box col pop">${inner}${close?'<button data-act="closemodal">Close</button>':''}</div></div>`;
function modalHTML(){
  const m=run&&run.modal; if(!m) return '';
  if(m.kind==='hands'){
    const cur=scene==='play'?bestHand(run.hand.filter(x=>x.bought)):null;
    return sheet(`<div class="n d">Portfolio hands</div>
      <div style="font-size:19px">What you buy in one day is your hand. Your best hand sets the starting MULT at the Closing Bell. Almanacs level a hand up.</div>
      <div class="hlist">${HANDS.map(h=>{const s=run.hands[h.id];return `<div class="hrow ${h.id===cur?'cur':''}"><div><div class="n">${h.name}${s.lvl>1?` <span class="muted">lvl ${s.lvl}</span>`:''}${h.id===cur?' <span class="yel">· today</span>':''}</div><div class="ds">${h.txt}</div></div><div class="mlt big">${fmtM(handMult(h.id))}</div></div>`}).join('')}</div>`);
  }
  if(m.kind==='boss'){
    const B=run.boss, bd=nextBossDay(run.day), left=bd-run.day;
    return sheet(`<div class="lbl">${isFinal(bd)?'Final Boss':'Boss Landlord'} · ${left?`day ${bd}, in ${left} day${left>1?'s':''}`:'today'}</div>
      <div class="n d">${B.name}</div><div>${B.txt}</div>
      <div class="muted" style="font-size:19px">The last day of every quarter is a boss day, and rent is ${BOSS_RENT}x. Survive it for a bounty and a free Memo, then visit the Broker to buy perks. Every 4th quarter is a Final Boss.</div>`);
  }
  if(m.kind==='perk'){const p=run.perks[m.i]; if(!p) return ''; const d=P(p.id),e=PERK_EDS[p.ed],st=perkState(p);
    return sheet(`<div class="row"><div class="ico" style="background:${d.c}">${d.code}</div><div><div class="n d">${d.name}</div><div class="lbl" style="color:${RARITY[d.r].c}">${RARITY[d.r].name}${e?` · ${e.name}: ${e.txt}`:''}</div></div></div>
      <div>${d.desc}</div>${st?`<div class="yel">${st}</div>`:''}${run.off&&run.off.includes(m.i)?'<div class="down">Disabled by the Boss Landlord today.</div>':''}
      <div class="muted" style="font-size:18px">Perks trigger left to right at the Closing Bell. Put +MULT perks before xMULT perks.</div>
      <div class="actions three"><button class="ghost" data-act="pleft" ${m.i===0?'disabled':''}>◀ Move</button><button class="ghost" data-act="pright" ${m.i>=run.perks.length-1?'disabled':''}>Move ▶</button><button class="red" data-act="psell">Sell ${fmtK(sellVal(p))}</button></div>`)}
  const k=run.cons[m.i]; if(!k) return '';
  const needCard=k.k==='memo'&&MEMO(k.id).t==='card', canUse=!needCard||scene==='play';
  return sheet(`<div class="row"><div class="ico k-${k.k}">${consCode(k)}</div><div><div class="n d">${consName(k)}</div><div class="lbl">${KIND[k.k]}</div></div></div>
    <div>${consDesc(k)}</div>${needCard&&scene==='play'?`<div class="yel">Applies to ${run.hand[run.idx].co.tick}, the certificate in front of you.</div>`:''}${needCard&&!canUse?'<div class="muted">Use it on a certificate while you trade.</div>':''}
    <div class="actions"><button class="red" data-act="csell">Sell ${fmtK(consPrice(k.k)/2)}</button><button class="green" data-act="cuse" ${canUse?'':'disabled'}>Use</button></div>`);
}
function tv(host,chyronTag,chyronTxt,crawl,net,heat=0){
  return `<div class="tv heat${heat}"><div class="screen">
    <svg class="chart" viewBox="0 0 200 100" preserveAspectRatio="none"><polyline fill="none" stroke="#9fc0ff" stroke-width="3" points="0,70 20,62 35,68 55,40 70,48 90,30 110,44 130,22 150,34 170,14 200,20"/></svg>
    <div class="bug">LIVE</div><div class="net">${net}</div>
    <img class="host px8" src="${host}" alt="">
    <div class="desk">GAC-TV</div>
    <div class="chyron"><b>${chyronTag}</b><span>${chyronTxt}</span></div>
    <div class="crawl"><span>${crawl}</span></div>
  </div><div class="knobs"><span>GAC-TV CH 4</span><span><i></i><i></i></span></div></div>`;
}
function cardHTML(c,back){
  const co=c.co, E=ED(co), risk='▮'.repeat(co.vol)+'▯'.repeat(3-co.vol);
  const chip=(txt,bg,fg='var(--ink)')=>`<span class="chip" style="background:${bg};color:${fg}">${txt}</span>`;
  const chips=[chip(co.sec,S(co.sec).c),chip('RISK '+risk,'transparent'),co.ed?chip(E.name,'var(--ink)','var(--yellow)'):'',co.enh?chip(ENH[co.enh].name,'#5b3c88','var(--cream)'):'',
    co.seal?chip(SEALS[co.seal].name,SEALS[co.seal].c,co.seal==='gold'?'var(--ink)':'var(--cream)'):'',c.rex?chip('REX: '+c.rex,'var(--red)','var(--cream)'):'',
    c.short?chip('SHORT','var(--ink)','var(--red)'):'',c.split?chip('SPLIT x2','var(--ink)','var(--green)'):''].join('');
  const noRum=E.noRumor||fx('noRumor');
  const rum=noRum
    ?`<span class="tag" style="background:var(--ink)">NO FILINGS</span><br>${E.noRumor?E.txt:'The Fortune Teller took every filing.'}`
    :`<span class="tag" style="background:${c.hint==='bull'?'#1d8a52':'#c23a36'}">${c.verified?'VERIFIED ':''}RUMOR · ${c.hint==='bull'?'BULLISH':'BEARISH'}</span><br>${c.rumor}${co.ed?` <span class="edtxt">${E.txt}</span>`:''}${co.enh?` <span class="edtxt">${ENH[co.enh].txt}</span>`:''}`;
  return `<div class="card ${co.ed?'ed-'+co.ed:''} ${co.enh?'enh-'+co.enh:''} ${back?'back':''}"><div class="frame">
      <div class="certhead"><span>CERTIFICATE OF SHARES</span><span>No. ${String(co.serial).padStart(5,'0')}</span></div>
      <div class="seal" style="background:${S(co.sec).c}">${co.sec.slice(0,4)}</div>
      ${co.seal?`<div class="wax" style="background:${SEALS[co.seal].c}"></div>`:''}
      <div><div class="tick">${co.tick}</div><div class="cname">${co.name}</div></div>
      <div class="chips">${chips}</div>
      ${sparkSVG(co.hist)}
      <div class="rumor">${rum}</div>
      <div class="cfoot tab"><span>${fmtP(co.price)}/sh</span><span>${co.lastDay?`${chg(co.last)} · seen ${co.seen}x`:'first look'}</span><span>${run.hand.length-run.idx} left</span></div>
      ${back?'':'<div class="stamp buy">BOUGHT</div><div class="stamp pass">PASSED</div>'}
  </div></div>`;
}
// Net worth on the morning news. Skipped on day 1 when there is nothing to report.
function portfolioBox(){
  const S0=run.snap, P0=run.prevSnap, n=lotCount(); if(!P0&&!n) return '';
  const dv=P0?S0.nw-P0.nw:0;
  return `<div class="box panel col pf" style="gap:4px">
    <div class="row between"><span class="lbl">Net worth</span>${P0?`<span class="tab ${dv>=0?'up':'down'}">${dv>=0?'▲ +':'▼ -'}${fmtK(Math.abs(dv))} since yesterday</span>`:''}</div>
    <div class="nw tab">${fmt(S0.nw)}</div>
    <div class="muted" style="font-size:19px">Cash ${fmtK(S0.cash)}${n?` · ${n} lot${n>1?'s':''} worth ${fmtK(S0.prop)}, paying +${fmtK(totalInc())} a night`:''}</div>
  </div>`;
}
function propPanel(id){
  const l=L(id),o=run.props[id],dd=D(l.dist);
  if(o){const noSell=(dd.gim||{}).noSell;
    return `<div class="box prop pop"><div class="row between"><span class="d" style="font-weight:700">${l.name}</span><span class="lbl" style="color:${dd.c}">${dd.name}</span></div>
    <div class="kv tab"><span class="muted">Value</span><span>${fmt(propVal(id))}</span><span class="muted">Income</span><span class="up">+${fmt(propInc(id))} / night</span></div>
    <button class="red" data-act="sellprop" ${noSell?'disabled':''}>${noSell?'The geese say no':`Sell for ${fmtK(sellPrice(id))}`}</button></div>`;}
  const pr=lotPrice(l), est=pr*l.yld*(has('landlord')?1.4:1)*((dd.gim||{}).inc||1);
  return `<div class="box prop pop"><div class="row between"><span class="d" style="font-weight:700">${l.name}</span><span class="lbl" style="color:${dd.c}">${dd.name}</span></div>
  <div class="kv tab"><span class="muted">Price</span><span>${fmt(pr)}</span><span class="muted">Income</span><span class="up">+${fmt(est)} / night</span><span class="muted">Pays for itself in</span><span>${Math.ceil(pr/est)} days</span></div>
  <button data-act="buyprop" ${run.cash<=pr?'disabled':''}>${run.cash<=pr?`Need ${fmtK(pr-run.cash)} more`:`Buy for ${fmtK(pr)}`}</button></div>`;
}
function notesStrip(){
  return `<div class="box notes">${run.news.filter(n=>n.sec).map(n=>`${secChip(n.sec)}<span class="${n.dir>0?'up':'down'}">${n.dir>0?'▲':'▼'}</span>`).join(' ')}
    ${run.rex.map(x=>`<span class="muted">·</span><span class="sec" style="background:var(--red);color:var(--cream)">REX</span><span>${x.call} ${x.tick}</span>`).join('')}
    ${run.event.id!=='quiet'?`<span class="muted">·</span><span class="yel">${run.event.name}</span>`:''}</div>`;
}
const handLabel=id=>id?`${H(id).name} <span class="mlt">${fmtM(handMult(id))}</span>`:'<span class="muted">none yet</span>';
function stepHTML(s){
  const v=s.k==='card'?`${chg(s.r)}<span class="up">+${fmtK(s.v)}</span>`
    :s.k==='loss'?`${chg(s.r)}<span class="down">${fmtK(s.v)}</span>`
    :s.k==='add'?`<span></span><span class="mlt">+${fmtM(s.v)} MULT</span>`
    :s.k==='x'?`<span></span><span class="xm">x${fmtM(s.v)} MULT</span>`
    :s.k==='cash'?`<span></span><span class="up">+${fmtK(s.v)}</span>`
    :s.k==='hand'?`<span class="muted">lvl ${s.lvl}</span><span class="mlt">${fmtM(s.v)} MULT</span>`:'<span></span><span></span>';
  const who=s.k==='hand'?`<b>${s.who}</b>${s.boss?' <span class="down">(Hedge Fund Bro)</span>':''}`:s.k==='card'||s.k==='loss'?`<span class="t">${s.who}</span>${s.again?' <span class="yel">AGAIN</span>':''}`:`${s.tick?`<span class="t">${s.tick}</span> `:''}${s.who}`;
  return `<div class="st show k-${s.k}" data-k="${s.k}" data-g="${s.g}" data-m="${s.m}"><span class="w">${who}</span>${v}</div>`;
}
function rexReaction(r){const k=r.net>3*r.rent?'great':r.net>0?'good':r.net>-r.rent?'bad':'awful';return pick(REX_REACT[k])}
let tallyT=null;
function shake(){if(!app)return;app.classList.remove('shake');void app.offsetWidth;app.classList.add('shake')}
function animateTally(){
  const box=document.getElementById('tally'); if(!box) return;
  const rows=[...box.querySelectorAll('.st')], after=document.getElementById('after'), tG=document.getElementById('tG'), tM=document.getElementById('tM'), r=run.result;
  const reduce=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i=0;
  const finish=()=>{clearTimeout(tallyT);tallyT=null;rows.forEach(x=>x.classList.add('show'));if(after)after.hidden=false;
    tG.textContent=fmtK(r.gains);tM.textContent=fmtM(r.mult);r.shown=true;box.onclick=null;
    const board=document.getElementById('board');if(board)board.className=`board box heat${run.heat}`;
    sfx.bell();if(run.heat>=2)shake()};
  if(reduce||!rows.length){finish();return}
  rows.forEach(x=>x.classList.remove('show')); if(after) after.hidden=true;
  box.onclick=finish;
  const step=()=>{
    if(i>=rows.length){finish();return}
    const row=rows[i]; row.classList.add('show'); if(row.scrollIntoView) row.scrollIntoView({block:'nearest'});
    tG.textContent=fmtK(+row.dataset.g); tM.textContent=fmtM(+row.dataset.m);
    const k=row.dataset.k;
    if(k==='x'){sfx.x();shake();tM.classList.remove('pulse');void tM.offsetWidth;tM.classList.add('pulse')}
    else if(k==='add'||k==='hand') sfx.mult(i); else if(k==='loss') sfx.loss(); else if(k==='cash') sfx.cash(); else sfx.step(i);
    i++; tallyT=setTimeout(step,Math.max(70,340-i*16));
  };
  tallyT=setTimeout(step,250);
}
function render(){
  if(headless) return;
  if(tallyT){clearTimeout(tallyT);tallyT=null;if(run&&run.result)run.result.shown=true}
  renderScene();
  if(run&&run.modal&&['news','play','resolve','shop','town'].includes(scene)) app.insertAdjacentHTML('beforeend',modalHTML());
  if(scene==='resolve'&&!run.result.shown) animateTally();
}
const pctOf=a=>Math.round(a*100)+'%';
function renderScene(){
  if(scene==='title'){
    const today=dailyId();
    app.innerHTML=`<div class="grow"></div>
    ${tv(sprite('aunt'),'SPECIAL REPORT','Local great-aunt hands out money, family nervous','DOW ▲ 12 · SOUP ▲ 3 · SOCKS ▼ 8 · GOAT ▲ 40 · GRAVY ▲ 1 · LLAMA ▼ 2','INHERITANCE HOUR')}
    <div class="col pop"><div class="logo">GREAT AUNT CAPITAL</div>
      <div style="font-size:22px">Mildred gave you $100,000. Swipe on stocks, stack MULT at the Closing Bell and keep up with the rent. Don't go broke.</div></div>
    ${meta.runs?`<div class="box panel col" style="gap:4px">
      <div class="row between"><span class="muted">Pearls</span><span class="yel tab">${meta.pearls}</span></div>
      <div class="row between"><span class="muted">Longest run</span><span class="tab">${meta.best?meta.best+' days':'none yet'}</span></div>
      <div class="row between"><span class="muted">Peak net worth</span><span class="tab">${meta.bestCash?fmt(meta.bestCash):'none yet'}</span></div>
      ${meta.bestDay?`<div class="row between"><span class="muted">Best Closing Bell</span><span class="tab">${fmtK(meta.bestDay.total)} · ${meta.bestDay.hand}</span></div>`:''}
      ${meta.daily&&meta.daily.date===today?`<div class="row between"><span class="muted">Today's Daily Market</span><span class="tab">${meta.daily.best} days</span></div>`:''}
    </div>`:''}
    <div class="col"><button data-act="setup">Take the money</button>
      <div class="actions"><button class="ghost" data-act="help">How to play</button><button class="ghost" data-act="daily">Daily market</button></div>
      <div class="actions"><button class="ghost" data-act="will">The will</button><button class="ghost" data-act="mute">Sound ${meta.mute?'off':'on'}</button></div></div>
    <div class="grow"></div>`; return;
  }
  if(scene==='setup'){
    const A=AUNTS[setup.aunt], ok=auntOpen(A), M=MOODS[setup.mood];
    app.innerHTML=`<div class="h2" style="padding-top:8px">NEW RUN</div>
    <div class="col scroll grow">
      <div class="box panel col pick"><div class="lbl">Who's paying</div>
        <div class="row between"><button class="ghost sm" data-act="aunt" data-d="-1">◀</button><div class="d pickname">${A.name}</div><button class="ghost sm" data-act="aunt" data-d="1">▶</button></div>
        <div>${ok?A.txt:`<span class="muted">Locked. ${A.hint}</span>`}</div></div>
      <div class="box panel col pick"><div class="lbl">Mildred's mood</div>
        <div class="row between"><button class="ghost sm" data-act="mood" data-d="-1">◀</button><div class="d pickname">${M.name}</div><button class="ghost sm" data-act="mood" data-d="1">▶</button></div>
        <div>${M.txt}${setup.mood?` <span class="yel">Pearls +${setup.mood*25}%.</span>`:''}</div>
        <div class="muted" style="font-size:18px">${meta.mood<4?`Beat a Final Boss (day ${QUARTER*4}) on ${MOODS[meta.mood].name} to unlock ${MOODS[meta.mood+1].name}.`:'Every mood unlocked.'}</div></div>
      <div class="box panel col"><div class="lbl">Seed (optional)</div><input id="seedIn" class="seedin" maxlength="24" placeholder="random" autocomplete="off" spellcheck="false">
        <div class="muted" style="font-size:18px">Same seed, same town, same market. Share one with a friend.</div></div>
    </div>
    <div class="actions"><button class="ghost" data-act="title">Back</button><button data-act="start" ${ok?'':'disabled'}>Take the money</button></div>`; return;
  }
  if(scene==='help'){
    const H2=(t,b)=>`<div><b class="yel">${t}.</b> ${b}</div>`;
    app.innerHTML=`<div class="h2" style="padding-top:8px">HOW TO PLAY</div>
    <div class="box panel col scroll grow" style="font-size:21px">
      ${H2('The goal','Mildred gave you $100,000. Rent is due every night and it keeps going up. Run out of cash and the run is over.')}
      ${H2('Morning news','The anchor says which sectors should rise ▲ or fall ▼ today. He is usually right. Rex Shouter yells a hot pick. Rex is right about half the time.')}
      ${H2('Swipe','Each certificate is a stock with a sector, a risk level and a rumor. Pick a position size. Swipe right to buy, left to pass.')}
      ${H2('Hands','Everything you buy in a day is your hand. Two in one sector is a Pair Trade, three is a Sector Sweep, four in different sectors is an Index Fund. Better hands start with more MULT. Tap Hands at the top to see them all.')}
      ${H2('The Closing Bell','Stocks that rose add to GAINS. Your profit is GAINS x MULT. Losses are never multiplied. Perks add (+) or multiply (x) MULT, left to right, so put + perks before x perks.')}
      ${H2('Items','The Newsstand sells items after every day. Memos change the certificate in front of you, Almanacs level up a hand, Brown Envelopes are strong but cost you something. Tap an item in the top bar to use it.')}
      ${H2('Boss Landlords','The last day of each quarter (every 4th day) a Boss Landlord changes the rules and rent is 1.5x. Tap the boss bar to see who is coming. Survive for a bounty, then the Broker sells perks. You can hold 5.')}
      ${H2('Town','Spare cash? Buy lots that pay rent to you every night. Own a whole district for a bonus. Own all 16 to become a Tycoon.')}
      ${H2('The will','Going broke earns Pearls. Spend them on permanent upgrades. New aunts and harder moods unlock as you play.')}
    </div>
    <button data-act="title">Back</button>`; return;
  }
  if(scene==='will'){
    app.innerHTML=`<div class="row between" style="padding-top:8px"><div class="h2">THE WILL</div><div class="yel tab" style="font-size:30px">${meta.pearls} pearls</div></div>
    <div class="muted" style="font-size:19px">Pearls come from going broke. Upgrades last forever.</div>
    <div class="col scroll grow">${UPGRADES.map(u=>{const l=meta.up[u.id],max=l>=u.max,cost=u.cost(l);
      return `<div class="box item" style="grid-template-columns:1fr auto">
        <div><div class="n">${u.name}</div><div class="ds">${u.desc}</div><div class="pips">${'■'.repeat(l)}${'□'.repeat(u.max-l)}</div></div>
        <button data-act="upg" data-id="${u.id}" ${max||meta.pearls<cost?'disabled':''}>${max?'Max':cost+' pearls'}</button></div>`}).join('')}</div>
    <button data-act="title">Back</button>`; return;
  }
  if(scene==='news'){
    const lc=lastClose(), movers=run.deck.filter(co=>lc&&co.lastDay===lc).sort((a,b)=>Math.abs(b.last)-Math.abs(a.last));
    const crawl=(movers.length?'LAST CLOSE · '+movers.map(co=>`${co.tick} ${fmtP(co.price)} ${co.last>=0?'▲':'▼'} ${Math.abs(co.last*100).toFixed(1)}%`).join(' · ')
      :run.hand.length?'OPENING BELL · '+run.hand.map(c=>`${c.co.tick} ${fmtP(c.co.price)} NEW`).join(' · '):'MARKET CLOSED')+' · '+run.fluff.toUpperCase();
    const ev=run.event, tag=ev.isBoss?(ev.final?'FINAL BOSS':'BOSS LANDLORD'):ev.id==='quiet'?'MARKET MORNING':'BREAKING';
    const extra=[run.ate?`Mildred's Cat ate your ${run.ate}.`:'',...(run.delisted||[])].filter(Boolean);
    app.innerHTML=hud()+`<div class="col scroll grow">
      ${tv(sprite(ev.isBoss?'aunt':'anchor'),tag,ev.id==='quiet'?`Day ${run.day}. Here's what's moving.`:`${ev.name}: ${evTxt()}`,crawl,ev.isBoss?'RENT IS DUE':'MARKET MORNING',run.heat)}
      ${tip('Sectors marked ▲ should rise today. Buy their stocks. Avoid ▼.')}
      <div class="col" style="gap:6px"><div class="lbl">Today's tips · headlines right about ${pctOf(newsAcc())} of the time</div>
      ${run.news.map(n=>`<div class="box hl">${n.arc?`<span class="sec" style="background:var(--cream)">STORY</span>`:`<span>${secChip(n.sec)} <span class="${n.dir>0?'up':'down'}">${n.dir>0?'▲':'▼'}</span></span>`}<span>${n.arc?`<b class="yel">${n.arc}.</b> `:''}${n.txt}</span></div>`).join('')}
      ${extra.map(t=>`<div class="box hl"><span class="sec" style="background:var(--red);color:var(--cream)">NOTE</span><span>${t}</span></div>`).join('')}</div>
      ${run.rex.length?`<div class="pundit"><img class="px8" src="${sprite('pundit')}" width="56" height="56" alt="">
        <div><div class="lbl" style="color:var(--cream)">Rex's hot pick${run.rex.length>1?'s':''} · right ${pctOf(rexAcc())}</div>${run.rex.map(x=>`<div class="shout">${x.line}</div>`).join('')}</div></div>`
        :`<div class="box hl"><span class="sec" style="background:var(--red);color:var(--cream)">REX</span><span>${run.hand.length?'Rex Shouter is off the air today.':'No market today.'}</span></div>`}
      ${portfolioBox()}
    </div>
    <div class="actions"><button class="ghost" data-act="town">Town${lotCount()?` · ${lotCount()}`:''}</button>${!run.hand.length?'<button data-act="skipday">Close the day</button>':'<button data-act="play">Open market</button>'}</div>`; return;
  }
  if(scene==='play'){
    const rest=run.hand.slice(run.idx,run.idx+3), c=run.hand[run.idx], so=run.hand.filter(x=>x.bought);
    const now=bestHand(so), ifBuy=bestHand([...so,c]), o=lot(c), k=o.sh?impact(c,o.cost):1;
    app.innerHTML=hud()+notesStrip()+`
    <div class="deck" id="deck">${rest.map((c,i)=>({c,i})).reverse().map(({c,i})=>i===0?cardHTML(c,false):`<div style="position:absolute;inset:0;transform:translateY(${i*8}px) scale(${1-i*.04});opacity:${1-i*.25}">${cardHTML(c,true)}</div>`).join('')}</div>
    ${tip('Swipe right to buy, left to pass. Two buys in the same sector make a Pair Trade.')}
    <button class="handline" data-act="hands"><span class="lbl">Hand</span> ${handLabel(now)} <span class="muted">· buy this →</span> ${ifBuy===now?'<span class="muted">no change</span>':handLabel(ifBuy)}</button>
    <div class="sizes">${SIZES.map(z=>`<button class="${run.size===z?'':'ghost'}" data-act="size" data-z="${z}">${z>=1?'Max':Math.round(z*100)+'%'}</button>`).join('')}</div>
    <div class="hintline muted tab">${o.sh?`Buy ${o.sh.toLocaleString('en-US')} shares for ${fmtK(o.cost)}${k<.95&&!has('whale')?` · <span class="down">big order, gains -${Math.round((1-k)*100)}%</span>`:''}`:"Can't afford a share"}</div>
    <div class="actions"><button class="red" data-act="pass">← Pass</button><button class="green" data-act="buy">Buy →</button></div>`;
    bindSwipe(); return;
  }
  if(scene==='resolve'){
    const r=run.result, passed=run.hand.filter(c=>!c.bought);
    app.innerHTML=hud()+`<div class="row between"><div class="h2">CLOSING BELL · DAY ${run.day}</div>${isBoss(run.day)?`<span class="pill down">${run.event.name.toUpperCase()}</span>`:''}</div>
    <div id="board" class="board box heat${r.shown?run.heat:0}"><div class="bl"><span class="lbl">Gains</span><span id="tG" class="tab">${fmtK(r.shown?r.gains:0)}</span></div><span class="xx">x</span><div class="bl"><span class="lbl">MULT</span><span id="tM" class="tab mlt">${fmtM(r.shown?r.mult:1)}</span></div></div>
    <div class="box panel col scroll grow pop" id="tally">
      <div class="steps">${r.steps.length?r.steps.map(stepHTML).join(''):'<div class="muted">You sat this one out.</div>'}</div>
      <div id="after" class="col" style="gap:8px">
        <div class="total tab">${fmtK(r.gains)} x ${fmtM(r.mult)} = <b class="${r.total>0?'up':''}">${fmt(r.total)}</b></div>
        ${tip('Profit is GAINS x MULT. Better hands and perks raise MULT. Losses are never multiplied.')}
        ${r.tax?`<div class="down">The Tax Man took ${fmt(r.tax)}.</div>`:''}
        ${passed.length?`<div class="passed muted">Passed: ${passed.map(c=>`${c.co.tick} ${chg(c.r)}${c.fraud?' (fraud)':''}`).join(' · ')}</div>`:''}
        <div class="sum tab">
          <span>Trading</span><span class="${r.net>=0?'up':'down'}">${r.net>=0?'+':''}${fmt(r.net)}</span>
          ${r.notes.map(n=>`<span>${n[0]}</span><span class="${n[1]>=0?'up':'down'}">${n[1]>=0?'+':''}${fmt(n[1])}</span>`).join('')}
          ${r.inc?`<span>Property income</span><span class="up">+${fmt(r.inc)}</span>`:''}
          <span>${isBoss(run.day)?'Boss rent':'Rent'}</span><span class="down">-${fmt(r.rent)}</span>
          ${r.fire.map(f=>`<span>Fire sale: ${f[0]}</span><span class="up">+${fmt(f[1])}</span>`).join('')}
          ${r.bounty?`<span class="yel">Boss bounty</span><span class="up">+${fmt(r.bounty)}</span>`:''}
          <span class="yel">Cash now</span><span class="yel">${fmt(Math.max(0,run.cash))}</span>
        </div>
        ${r.prize?`<div class="yel">You beat ${run.event.name}. Prize: a ${r.prize} memo.</div>`:''}
        ${r.moodUp?`<div class="yel">New mood unlocked: ${r.moodUp}.</div>`:''}
        ${r.saved?`<div class="yel">You pawned Aunt's Pearls for ${fmt(r.saved)}. She will never know.</div>`:''}
        <div class="pundit mini"><img class="px8" src="${sprite('pundit')}" width="40" height="40" alt=""><div class="shout">${rexReaction(r)}</div></div>
      </div>
    </div>
    ${run.dead?`<button class="red" data-act="over">You're broke</button>`:`<div class="actions"><button class="ghost" data-act="town">Town${lotCount()?` · ${lotCount()}`:''}</button><button data-act="shop">${isBoss(run.day)?'Visit the Broker':'Newsstand'}</button></div>`}`; return;
  }
  if(scene==='shop'){
    const broker=isBoss(run.day);
    app.innerHTML=hud()+`<div class="row between"><div class="h2">${broker?'THE BROKER':'NEWSSTAND'}</div><span class="muted">Perks ${perkSlots()}/5 · Items ${run.cons.length}/${run.consMax}</span></div>
    <div class="col scroll grow">${tip('Items are one-shot boosts. Buy one, then tap it in the top bar to use it.')}${shop.length?shop.map((o,i)=>{
      if(o.t==='perk'){const p=P(o.id),e=PERK_EDS[o.ed];
        return `<div class="box item ${o.sold?'sold':''} ${o.ed?'ped-'+o.ed:''}"><div class="ico" style="background:${p.c}">${p.code}</div>
        <div style="min-width:0"><div class="n">${p.name} <span class="rar" style="color:${RARITY[p.r].c}">${RARITY[p.r].name}</span>${e?` <span class="rar yel">${e.name}</span>`:''}</div><div class="ds">${p.desc}${e?` <span class="yel">${e.txt}.</span>`:''}</div></div>
        <button data-act="buyoffer" data-i="${i}" ${o.sold||run.cash<=o.price||(!slotFree()&&o.ed!=='fake')?'disabled':''}>${o.sold?'Sold':fmtK(o.price)}</button></div>`}
      const k={k:o.k,id:o.id};
      return `<div class="box item ${o.sold?'sold':''}"><div class="ico k-${o.k}">${consCode(k)}</div>
        <div style="min-width:0"><div class="n">${consName(k)} <span class="rar muted">${KIND[o.k]}</span></div><div class="ds">${consDesc(k)}</div></div>
        <button data-act="buyoffer" data-i="${i}" ${o.sold||run.cash<=o.price||run.cons.length>=run.consMax?'disabled':''}>${o.sold?'Sold':fmtK(o.price)}</button></div>`}).join(''):'<div class="box panel muted">Sold out.</div>'}
      ${broker?'':`<div class="muted" style="font-size:18px">Perks are sold by the Broker, after the Boss Landlord on day ${nextBossDay(run.day)}.</div>`}</div>
    <div class="actions" style="grid-template-columns:1fr 1fr 1.2fr"><button class="ghost" data-act="reroll" ${run.cash<=rerollCost()?'disabled':''}>Reroll ${fmtK(rerollCost())}</button><button class="ghost" data-act="town">Town</button><button data-act="next">Next day</button></div>`; return;
  }
  if(scene==='town'){
    const n=lotCount();
    app.innerHTML=hud()+`<div class="row between"><div class="h2">MILDRED'S TOWN</div><span class="muted tab">${n}/16 lots</span></div>
    <div class="col scroll grow">
      ${run.town.map(d=>`<div class="col" style="gap:6px"><div class="row between"><span class="lbl" style="color:${d.c}">${d.name} · ${d.sec}</span>${monopoly(d.id)?`<span class="pill yel">MONOPOLY ×${monoMult(d.id)}</span>`:''}</div>
        ${d.gim?`<div class="muted" style="font-size:17px;margin-top:-4px">${d.txt}</div>`:''}
        <div class="lots">${run.lots.filter(l=>l.dist===d.id).map(l=>{const o=run.props[l.id];
          return `<button class="lot ${o?'own':''} ${run.sel===l.id?'sel':''}" data-act="lot" data-id="${l.id}"><img class="px8" src="${bldg(l)}" alt="" width="40" height="40"><span class="ln">${l.name}</span><span class="lp tab">${o?'+'+fmtK(propInc(l.id))+'/d':fmtK(lotPrice(l))}</span></button>`}).join('')}</div></div>`).join('')}
      ${n?`<div class="muted" style="font-size:19px">Property worth ${fmt(propTotal())}, paying +${fmt(totalInc())} a night.</div>`:''}
    </div>
    ${run.sel?propPanel(run.sel):'<div class="box panel muted" style="font-size:19px">Lots pay you every night. Own a whole district for a monopoly bonus. Own all 16 to become a Tycoon. Tap a lot.</div>'}
    <button data-act="back">Back</button>`; return;
  }
  if(scene==='tycoon'){
    app.innerHTML=`<div class="grow"></div>
    ${tv(sprite('aunt'),'BREAKING','Great-nephew now owns the entire town','EVERY LOT ▲ · MILDRED ▲ ▲ ▲ · RENT: WHO CARES · TOWN RENAMED','INHERITANCE HOUR',2)}
    <div class="logo">TYCOON</div>
    <div style="font-size:22px">You own all 16 lots and earn ${fmt(totalInc())} every night. Mildred framed your photo. +25 pearls, and +10 more when this run ends.</div>
    <div style="font-size:20px" class="yel">Keep playing for endless mode: rent compounds every day. How big can the number get?</div>
    <button data-act="town2">Keep playing</button><div class="grow"></div>`; return;
  }
  if(scene==='ascend'){
    app.innerHTML=`<div class="grow"></div>
    ${tv(sprite('aunt'),'SIGNAL LOST','MORE MONEY THAN MONEY','▓▒░ ▓▒░ ▓▒░ ▓▒░ ▓▒░','???',3)}
    <div class="logo">${fmt(netWorth())}</div>
    <div style="font-size:24px">The static clears. Mildred is on every channel at once. "I knew you could do it, dear."</div>
    <button data-act="next">Keep going anyway</button><div class="grow"></div>`; return;
  }
  if(scene==='over'){
    app.innerHTML=`<div class="grow"></div>
    ${tv(sprite('aunt'),'BREAKING','Great-nephew goes broke. Aunt "not angry, just disappointed."','PEARLS ▲ · DIGNITY ▼ · RENT ▲ ▲ ▲','INHERITANCE HOUR')}
    <div class="logo" style="color:var(--red)">BROKE</div>
    <div class="box panel col" style="gap:4px">
      <div class="row between"><span class="muted">Days lasted</span><span class="tab">${run.day}</span></div>
      <div class="row between"><span class="muted">Peak net worth</span><span class="tab">${fmt(run.peak)}</span></div>
      <div class="row between"><span class="muted">Best Closing Bell</span><span class="tab">${run.best?`${fmtK(run.best.total)} · ${run.best.hand}`:'none'}</span></div>
      <div class="row between"><span class="muted">Bosses beaten</span><span class="tab">${run.bossesBeat}</span></div>
      <div class="row between"><span class="muted">Seed</span><span class="d yel">${run.seed}</span></div>
      <div class="row between"><span class="muted">Pearls earned</span><span class="yel tab">+${run.earned}</span></div>
    </div>
    <div class="col"><button data-act="setup">Ask for more money</button>
      <div class="actions"><button class="ghost" data-act="replay">Same seed</button><button class="ghost" data-act="share">Share certificate</button></div>
      <div class="actions"><button class="ghost" data-act="will">The will</button><button class="ghost" data-act="title">Title</button></div></div>
    <div class="grow"></div>`;
  }
}
const dailyId=()=>{const d=new Date();return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`};
function auntOpen(a){const u=a.unlock;if(!u)return true;
  return (u.runs&&meta.runs>=u.runs)||(u.days&&meta.best>=u.days)||(u.mono&&meta.mono)||(u.peak&&meta.bestCash>=u.peak)||false}

/* ===== Input ===== */
if(app) app.addEventListener('click',e=>{
  unlock();
  const el=e.target.closest('[data-act]'); if(!el) return;
  const a=el.dataset.act, id=el.dataset.id, i=+el.dataset.i;
  if(a==='closemodal'&&el.classList.contains('modal')&&e.target.closest('.sheet')) return;   // taps inside the sheet don't close it
  if(a==='setup'){scene='setup';setup.mood=Math.min(setup.mood,meta.mood);render()}
  else if(a==='aunt'){setup.aunt=(setup.aunt+(+el.dataset.d)+AUNTS.length)%AUNTS.length;render()}
  else if(a==='mood'){setup.mood=clamp(setup.mood+(+el.dataset.d),0,meta.mood);render()}
  else if(a==='start'){const s=document.getElementById('seedIn');newRun({aunt:AUNTS[setup.aunt].id,mood:setup.mood,seed:s&&s.value.trim()||null})}
  else if(a==='daily'){const d=dailyId();newRun({seed:'DAILY-'+d,daily:d})}
  else if(a==='replay'){newRun({aunt:run.aunt,mood:run.mood,seed:run.seed})}
  else if(a==='share'){const b=run.best;shareCertificate({title:run.tycoon?'TYCOON':'BROKE',days:run.day,peak:fmtK(run.peak),hand:b?`${b.hand} for ${fmtK(b.total)}`:'none',
    aunt:AUNTS.find(x=>x.id===run.aunt).name,mood:MOODS[run.mood].name,perks:run.perks.map(p=>P(p.id).name).join(', '),seed:run.seed})}
  else if(a==='mute'){meta.mute=meta.mute?0:1;setMuted(meta.mute);saveMeta();render()}
  else if(a==='title'){scene='title';render()}
  else if(a==='will'){scene='will';render()}
  else if(a==='help'){scene='help';render()}
  else if(a==='upg'){const u=UPGRADES.find(x=>x.id===id),c=u.cost(meta.up[id]);if(meta.pearls>=c&&meta.up[id]<u.max){meta.pearls-=c;meta.up[id]++;saveMeta();render()}}
  else if(a==='play'){scene='play';render()}
  else if(a==='skipday') resolveDay();
  else if(a==='buy') flyOut(1);
  else if(a==='pass') flyOut(-1);
  else if(a==='perk'){run.modal={kind:'perk',i};render()}
  else if(a==='cons'){run.modal={kind:'cons',i};render()}
  else if(a==='closemodal'){run.modal=null;render()}
  else if(a==='pleft') movePerk(run.modal.i,-1);
  else if(a==='pright') movePerk(run.modal.i,1);
  else if(a==='psell') sellPerk(run.modal.i);
  else if(a==='cuse') useCons(run.modal.i);
  else if(a==='csell'){const k=run.cons[run.modal.i];if(k){run.cash+=Math.round(consPrice(k.k)/2);run.cons.splice(run.modal.i,1);run.modal=null;render()}}
  else if(a==='hands'){run.modal={kind:'hands'};render()}
  else if(a==='boss'){run.modal={kind:'boss'};render()}
  else if(a==='next') startDay();
  else if(a==='shop') openShop();
  else if(a==='over'){scene='over';render()}
  else if(a==='buyoffer') buyOffer(i);
  else if(a==='reroll'){const c=rerollCost();if(run.cash>c){run.cash-=c;run.reroll+=3000;openShop(true)}}
  else if(a==='town'){run.back=scene;scene='town';render()}
  else if(a==='town2'){run.endless=true;run.tyDay=run.day;run.back=run.dead?'over':'resolve';scene='town';render()}
  else if(a==='back'){scene=run.back||'news';render()}
  else if(a==='lot'){run.sel=run.sel===id?null:id;render()}
  else if(a==='buyprop') buyLot(run.sel);
  else if(a==='sellprop'){const id2=run.sel;if(run.props[id2]&&!(gim(L(id2)).noSell)){const v=sellPrice(id2);run.cash+=v;delete run.props[id2];resetCat();toast(`Sold ${L(id2).name} for ${fmt(v)}.`);render()}}
  else if(a==='size'){run.size=+el.dataset.z;render()}
});
if(app) document.addEventListener('keydown',e=>{
  if(e.target&&e.target.tagName==='INPUT') return;
  if(run&&run.modal){if(e.key==='Escape'){run.modal=null;render()}return}
  if(scene==='play'){if(e.key==='ArrowRight')flyOut(1);if(e.key==='ArrowLeft')flyOut(-1)}
});
let busy=false;
function flyOut(dir){
  if(busy) return; const card=document.querySelector('#deck .card:not(.back)'); if(!card){choose(dir>0);return}
  busy=true; card.style.transition='transform .22s steps(6)';
  card.style.transform=`translateX(${dir*520}px) rotate(${dir*28}deg)`;
  card.querySelector(dir>0?'.buy':'.pass').style.opacity=1;
  setTimeout(()=>{busy=false;choose(dir>0)},220);
}
function bindSwipe(){
  const card=document.querySelector('#deck .card:not(.back)'); if(!card) return;
  const sb=card.querySelector('.buy'), sp=card.querySelector('.pass');
  let x0=null,dx=0;
  card.addEventListener('pointerdown',e=>{unlock();x0=e.clientX;dx=0;card.setPointerCapture(e.pointerId);card.style.transition='none'});
  card.addEventListener('pointermove',e=>{if(x0===null)return;dx=e.clientX-x0;
    card.style.transform=`translateX(${dx}px) rotate(${dx/18}deg)`;
    sb.style.opacity=clamp(dx/90,0,1); sp.style.opacity=clamp(-dx/90,0,1);});
  const end=()=>{if(x0===null)return;x0=null;
    if(Math.abs(dx)>90) flyOut(dx>0?1:-1);
    else {card.style.transition='transform .15s';card.style.transform='';sb.style.opacity=0;sp.style.opacity=0}};
  card.addEventListener('pointerup',end); card.addEventListener('pointercancel',end);
}
let tt;
function toast(msg){if(headless)return;const t=document.getElementById('toast');t.textContent=msg;t.hidden=false;clearTimeout(tt);tt=setTimeout(()=>t.hidden=true,2800)}

/* ===== Boot ===== */
export function boot(){ render(); }

/* ===== Test and simulation hooks ===== */
// Lets tests and scripts/sim.mjs drive the game without a browser.
export const api={
  get run(){return run}, get meta(){return meta}, get scene(){return scene}, get shop(){return shop},
  resetMeta(){meta=loadMeta()},
  setScene(s){scene=s},
  setHeadless(v){headless=v||!app},
  setEvent(ev){run.event=ev;buildFx()},
  newRun, startDay, choose, buyLot, openShop, buyOffer, useCons, sellPerk, movePerk, lotPrice, rentFor, rentTonight,
  render, activePerks, handMult, netWorth, newPerk, isBoss,
};
