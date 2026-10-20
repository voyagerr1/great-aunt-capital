// Game state, day flow, rendering and input. Imported by main.js.
import { R, pick, rr, clamp, shuffle, fmt, fmtK, QUARTER, SIZES, ROUNDS, pct } from './util.js';
import { VOL, SECTORS, S, N1, N2, N3, BULL, BEAR, NEWS, FLUFF, IDEA_X, IDEA_Y, SU_A, SU_B, FOUNDERS, PITCH_LINES, TRAITS, STATS, ACQUIRERS, BUSTS, HOLD_UP, HOLD_DOWN, HAIRS, HOODIES, REX_BUY, REX_SELL, PIVOT_TO, PERKS, P, DISTRICTS, LOTS, L, LVL_VAL, LVL_INC, EVENTS, EDITIONS, DEPTH, UPGRADES } from './data/content.js';
import { sprite, bldg } from './sprites.js';

/* ===== State ===== */
const KEY='greataunt.meta.v1';
function loadMeta(){let m=null;try{m=JSON.parse(localStorage.getItem(KEY))}catch(e){}
  const base={pearls:0,up:{allowance:0,hand:0,accuracy:0,discount:0,starter:0,cable:0,deed:0,rentctl:0,rolodex:0},best:0,bestCash:0,runs:0};
  if(m){base.up=Object.assign(base.up,m.up||{});delete m.up;Object.assign(base,m)} return base;}
function saveMeta(){try{localStorage.setItem(KEY,JSON.stringify(meta))}catch(e){}}
let meta=loadMeta(), run=null, scene='title', shop=null;
const has=id=>run&&run.perks.includes(id);
const fx=k=>run&&run.event&&run.event.fx?run.event.fx[k]:undefined;   // today's event effect, see EVENTS
const ED=c=>EDITIONS[c.ed]||{};
const rentFor=d=>Math.round((3+Math.pow(d,1.5)*1.2)*1000*(has('haven')?.6:1)*(1-.05*meta.up.rentctl));
function rentTonight(){if(has('umbrella')&&run.day%QUARTER===0)return 0;const f=fx('rent');return Math.round(rentFor(run.day)*(f===undefined?1:f))}
function lot(c){let budget=run.size>=1?run.cash:Math.min(run.cash,run.dayStart*run.size);if(fx('cap'))budget=Math.min(budget,run.dayStart*fx('cap'));
  const sh=Math.max(0,Math.floor(budget/c.price));return {sh,cost:sh*c.price}}
// Big orders move the price against you: gains are cut by depth/(depth+stake).
const impact=(c,stake)=>{const d=DEPTH[c.vol]*(ED(c).depth||1);return d/(d+stake)};
const fmtP=n=>n<10?'$'+n.toFixed(2):fmt(n);
const flare=()=>!!fx('flare');
const rumorAcc=()=>flare()?.5:Math.min(.95,.65+.05*meta.up.accuracy+(has('doom')?.15:0));
const newsAcc=()=>flare()?.5:Math.min(.97,.8+.05*meta.up.cable+(has('nephew')?.15:0));
const rexAcc=()=>flare()?.5:(has('nephew')?.78:.55);
function lotPrice(l){return l.price*run.hidx}
function propVal(id){const p=run.props[id];return lotPrice(L(id))*LVL_VAL[p.lvl-1]*p.dmg}
function monopoly(d){return LOTS.filter(l=>l.dist===d).every(l=>run.props[l.id])}
const monoMult=()=>has('zoning')?2:1.5;
function propInc(id){const p=run.props[id],l=L(id);return lotPrice(l)*l.yld*LVL_INC[p.lvl-1]*p.dmg*(monopoly(l.dist)?monoMult():1)*(has('landlord')?1.4:1)}
// tonight=true applies district events (Tourist Season, Blackout...)
const totalInc=tonight=>Object.keys(run.props).reduce((s,id)=>{const m=tonight&&fx('dist')?fx('dist')[L(id).dist]:undefined;return s+propInc(id)*(m===undefined?1:m)},0);
const propTotal=()=>Object.keys(run.props).reduce((s,id)=>s+propVal(id),0);
const sellPrice=id=>propVal(id)*(has('flipper')?1.2:.95);
const renoCost=id=>(run.props[id].lvl>=3?lotPrice(L(id))*.2:lotPrice(L(id))*.4*run.props[id].lvl)*(has('manager')?.7:1);
const netWorth=()=>run.cash+propTotal()+run.holdings.reduce((s,h)=>s+h.value,0)+run.ventures.reduce((s,v)=>s+v.ask*v.m,0);
function snapshot(){return {nw:netWorth(),cash:run.cash,prop:propTotal(),vent:run.ventures.reduce((s,v)=>s+v.ask*v.m,0),hold:run.holdings.reduce((s,h)=>s+h.value,0)}}
function buyLot(id){
  const pr=lotPrice(L(id)); if(run.props[id]||run.cash<=pr) return;
  run.cash-=pr; run.props[id]={lvl:1,dmg:1};
  if(!run.tycoon&&LOTS.every(l=>run.props[l.id])){run.tycoon=true;meta.pearls+=25;meta.tycoons=(meta.tycoons||0)+1;saveMeta();scene='tycoon'}
  render();
}
function weighted(list){let t=list.reduce((s,e)=>s+e.w,0),x=R()*t;for(const e of list){x-=e.w;if(x<=0)return e}return list[0]}

/* ===== Run flow ===== */
function newRun(){
  run={v:7,day:0,cash:100000+25000*meta.up.allowance,peak:0,perks:[],streak:0,reroll:5000,ventures:[],holdings:[],size:.25,props:{},hidx:1,hlast:0};
  if(meta.up.deed) run.props.stand={lvl:1,dmg:1};
  if(meta.up.starter) run.perks.push(pick(PERKS).id);
  run.start=run.cash; run.peak=run.cash; meta.runs++; saveMeta(); startDay();
}
function startDay(){
  settleFollowOns();
  run.day++;
  run.event=run.day===1?EVENTS[0]:weighted(EVENTS);
  if(fx('gift')) run.cash+=fx('gift');
  if(fx('tax')) run.cash-=Math.round(run.cash*fx('tax'));
  run.dayStart=run.cash;
  run.prevSnap=run.snap||null; run.snap=snapshot();
  const secs=shuffle(SECTORS.map(s=>s.id));
  run.trends={[secs[0]]:R()<.5?1:-1,[secs[1]]:R()<.5?1:-1};
  run.forced=Object.keys(fx('trend')||{}); Object.assign(run.trends,fx('trend')||{});
  run.hand=deal(); run.idx=0;
  run.holdings.forEach(h=>{h.nextUp=R()<clamp(.5+h.drift*4+(has('whisper')?.12:0),.15,.9)});
  makeNews();
  const pc=Math.min(.95,(has('seed')?.8:.45)+.15*meta.up.rolodex);
  run.pitch=(run.day>=2&&run.ventures.length<3&&R()<pc)?makePitch():null;
  scene='news'; render();
}
function deal(){
  const n=4+meta.up.hand+(has('daytrader')?1:0), out=[], tsecs=Object.keys(run.trends);
  for(let i=0;i<n;i++){
    const a=pick(N1),b=pick(N2), sec=S(R()<.5?pick(tsecs):pick(SECTORS).id), ed=rollEdition(), E=EDITIONS[ed]||{};
    let pUp=.52; if(run.trends[sec.id]===1)pUp=.78; if(run.trends[sec.id]===-1)pUp=.26; pUp+=(fx('pUp')||0)+(E.pUp||0);
    const c={tick:(a.slice(0,2)+b.slice(0,2)).toUpperCase(),name:`${a} ${b} ${pick(N3)}`,sec,vol:ed==='penny'?3:1+Math.floor(R()*3),price:E.price?rr(...E.price):rr(3,400),up:R()<clamp(pUp,.08,.92),serial:Math.floor(rr(1000,99999)),ed};
    c.verified=i===0&&has('pigeon');
    const truth=c.verified||R()<rumorAcc();
    c.hint=truth?(c.up?'bull':'bear'):(c.up?'bear':'bull');
    c.rumor=pick(c.hint==='bull'?BULL:BEAR);
    c.spark=spark(c.hint);
    out.push(c);
  }
  for(let k=0;k<(fx('fraud')||0);k++) pick(out).fraud=true;
  return out;
}
function rollEdition(){let x=R();for(const [id,e] of Object.entries(EDITIONS)){const w=id==='gold'&&has('fortune')?.25:e.w;if(x<w)return id;x-=w}return null}
function makeNews(){
  const items=Object.entries(run.trends).map(([sec,dir])=>{const shown=(run.forced.includes(sec)||R()<newsAcc())?dir:-dir;return {sec,dir:shown,txt:pick(NEWS[sec][shown>0?'up':'down'])}});
  items.push(holdingNews()||{sec:null,txt:pick(FLUFF)});
  run.news=shuffle(items);
  const target=pick(run.hand), right=R()<rexAcc();
  target.rex=right?(target.up?'BUY':'SELL'):(target.up?'SELL':'BUY');
  run.rex={tick:target.tick,call:target.rex,line:pick(target.rex==='BUY'?REX_BUY:REX_SELL).replace('{T}',target.tick)};
}
function makePitch(){
  const traits=shuffle(TRAITS.slice()).slice(0,2);
  const st={team:1+Math.floor(R()*4),product:1+Math.floor(R()*4),market:1+Math.floor(R()*4),hype:1+Math.floor(R()*4)};
  let profit=false;
  traits.forEach(t=>{ if(t.profit) profit=true;
    if(t.fx==='wild') STATS.forEach(k=>st[k]+=R()<.5?2:-2); else for(const k in t.fx) st[k]+=t.fx[k]; });
  STATS.forEach(k=>st[k]=clamp(st[k],1,5));
  const name=pick(SU_A)+pick(SU_B);
  return {name,idea:`${pick(IDEA_X)} for ${pick(IDEA_Y)}`,founder:pick(FOUNDERS),line:pick(PITCH_LINES),traits:traits.map(t=>t.t),st,profit,
    ask:Math.max(5000,Math.round(run.cash*rr(.12,.25)*(has('seed')?.8:1)/500)*500),equity:Math.floor(rr(5,25)),wait:2+Math.floor(R()*3),
    hair:pick(HAIRS),hood:pick(HOODIES)};
}
/* Every quarter each startup reports: bust, bought out (cash), IPO (shares you hold), or a new funding round that re-prices your stake. */
function quarterly(v){
  const q=(v.st.team+v.st.product+v.st.market)/15;
  let bust=.38-q*.32-(has('angel')?.1:0); if(v.profit) bust*=.4;
  if(R()<clamp(bust,.04,.6)) return {kind:'bust'};
  if(R()<clamp(.1+.18*v.round+(v.profit?.15:0),0,.85)){
    const ipo=R()<(v.profit?.25:clamp(.3+v.st.hype*.1,0,.85));
    return ipo?{kind:'ipo',mult:v.m*(rr(1.3,2)+v.st.hype*rr(.15,.4))}:{kind:'acq',mult:v.m*(v.profit?rr(1.3,2.2):rr(1.4,2.8))};
  }
  if(R()<.12) return {kind:'pivot',g:rr(.5,1.3)};
  return {kind:'round',g:clamp(1+(q-.45)*rr(.5,1.6)+rr(-.3,.5),.4,3)};
}
/* Follow-on round: after an up round a startup may ask for more. Pay to keep your stake, pass to be diluted 25%. */
const DILUTE=.75;
function followOn(name,yes){
  const v=run.ventures.find(x=>x.name===name); if(!v||!v.follow) return false;
  if(yes){ if(run.cash<=v.follow){toast("You can't cover that.");return false} run.cash-=v.follow; v.paid+=v.follow; v.ask+=v.follow/v.m; }
  else { v.m*=DILUTE; v.eq=Math.max(1,Math.round(v.eq*DILUTE)); }
  const q=run.qres&&run.qres.find(x=>x.name===name&&x.follow); if(q){q.fdone=yes?'in':'out';q.amt=v.ask*v.m;q.mult=v.m;q.eq=v.eq}
  v.follow=null; return true;
}
function settleFollowOns(){run.ventures.forEach(v=>{if(v.follow)followOn(v.name,false)})}
function holdingNews(){
  if(!run.holdings.length) return null;
  const h=pick(run.holdings), shownUp=(has('whisper')||R()<newsAcc())?h.nextUp:!h.nextUp;
  return {hold:h.name,dir:shownUp?1:-1,txt:pick(shownUp?HOLD_UP:HOLD_DOWN).replace('{N}',h.name)};
}
function spark(h){let v=50,pts=[];for(let i=0;i<14;i++){v+=rr(-9,9)+(h==='bull'?1.2:-1.2);v=clamp(v,8,92);pts.push(v)}return pts}

function decidePitch(invest){
  const p=run.pitch;
  if(invest){ if(run.cash<=p.ask){toast("You can't cover that ask.");return} run.cash-=p.ask; run.dayStart=run.cash;
    run.ventures.push({name:p.name,idea:p.idea,ask:p.ask,paid:p.ask,eq:p.equity,st:p.st,profit:p.profit,m:1,round:0,since:run.day,follow:null}); toast(`You own ${p.equity}% of ${p.name}. First report at the end of Q${Math.ceil((run.day+1)/QUARTER)}.`); }
  run.pitch=null; scene='play'; render();
}
function choose(buy){
  const c=run.hand[run.idx]; if(!c) return;
  if(buy){const L=lot(c); if(L.sh<1){toast("You can't afford a single share. Passing.");buy=false} else {run.cash-=L.cost;c.stake=L.cost;c.shares=L.sh}}
  c.bought=buy; run.idx++;
  if(run.idx>=run.hand.length) resolveDay(); else render();
}
function resolveDay(){
  const gainMult=(fx('gain')||1)*(has('pump')?1+.15*run.streak:1), secM=fx('sec')||{};
  let penny=false, net=0, contra=0, buys=0, lost=0, losers=0, rebate=0; const notes=[];
  for(const c of run.hand){
    const E=ED(c);
    const vol=VOL[c.vol]*(secM[c.sec.id]||1)*(fx('move')||1)*(E.move||1)*(c.rex&&has('rexfan')?2:1);
    const m=rr(.25,1)*vol; let r=c.up?m*1.5:-m;
    if(E.gain&&r>0) r*=E.gain;
    if(c.fraud) r=-1;
    if(r>0){ r*=gainMult; if(has('memelord')&&c.sec.id==='MEME') r*=2; }
    if(c.bought&&r>0){ const k=impact(c,c.stake); if(k<.95) c.slip=1-k; r*=k; }
    if(c.bought&&has('larry')) r*=1.3;
    if(c.bought&&r<0){ if(has('diamond')) r=Math.max(r,-.5); if(has('penny')&&!penny){r=0;penny=true;c.penny=true} }
    c.r=Math.max(r,-1);
    if(c.bought){ buys++; c.delta=c.stake*c.r+(E.div?c.stake*E.div:0); run.cash+=c.stake+c.delta; net+=c.delta;
      if(c.delta<0){lost-=c.delta;losers++} if(has('scalper')) rebate+=c.stake*.03; }
    else if(has('contra')&&c.r<0) contra+=4000;
  }
  if(contra){run.cash+=contra;notes.push(['Contrarian',contra])}
  if(rebate){rebate=Math.round(rebate);run.cash+=rebate;notes.push(['Scalper rebate',rebate])}
  if(has('hedge')&&losers>=2){const b=Math.round(lost*.3);run.cash+=b;notes.push(['Hedge Hog',b])}
  if(has('cat')&&buys>=3){const b=Math.round(run.cash*.06);run.cash+=b;notes.push(['Compound Cat',b])}
  if(fx('dividend')&&run.holdings.length){const b=Math.round(run.holdings.reduce((s,h)=>s+h.value,0)*fx('dividend'));run.cash+=b;notes.push(['Dividends',b])}
  // Listed shares move (bigger swings in the first days after the IPO)
  run.holdings.forEach(h=>{
    const amp=h.age<2?1.7:1, move=(h.nextUp?rr(.05,.32):-rr(.05,.28))*amp;
    h.last=move; h.value=Math.max(1,h.value*(1+move)); h.age++;
  });
  const qres=[];
  if(run.day%QUARTER===0) run.ventures=run.ventures.filter(v=>{
    if(v.since>=run.day){qres.push({kind:'wait',name:v.name});return true}
    const o=quarterly(v);
    if(o.kind==='bust'){qres.push({kind:'bust',name:v.name,txt:pick(BUSTS),amt:v.paid});return false}
    if(o.kind==='acq'){const pay=Math.round(v.ask*o.mult);run.cash+=pay;qres.push({kind:'acq',name:v.name,txt:`Bought by ${pick(ACQUIRERS)}.`,amt:pay,mult:o.mult});return false}
    if(o.kind==='ipo'){const val=Math.round(v.ask*o.mult),q=(v.st.team+v.st.product+v.st.market)/15;
      run.holdings.push({name:v.name,basis:v.ask,value:val,age:0,last:0,drift:(q-.55)*.12-v.st.hype*.006});
      qres.push({kind:'ipo',name:v.name,txt:'Rang the opening bell. Your shares now trade daily.',amt:val,mult:o.mult});return false}
    if(o.kind==='pivot'){const to=pick(PIVOT_TO); v.idea=`${pick(IDEA_X)} for ${to}`; v.m*=o.g;
      STATS.forEach(k=>v.st[k]=clamp(v.st[k]+Math.floor(rr(-2,3)),1,5));
      qres.push({kind:'pivot',name:v.name,txt:`Pivoted. It's now ${v.idea}. Every stat got reshuffled.`,amt:v.ask*v.m,mult:v.m});return true}
    v.m*=o.g; v.round++; const k=pick(STATS), d=o.g>=1?1:-1; v.st[k]=clamp(v.st[k]+d,1,5);
    if(o.g>=1&&R()<.5) v.follow=Math.max(5000,Math.round(v.ask*v.m*rr(.25,.5)/500)*500);
    qres.push({kind:'round',name:v.name,g:o.g,round:ROUNDS[Math.min(v.round,4)],k,d,amt:v.ask*v.m,mult:v.m,follow:v.follow,eq:v.eq});return true;
  });
  run.qres=qres.length?qres:null;
  const inc=Math.round(totalInc(true)); run.cash+=inc;
  const hm=rr(-.025,.035)+(fx('house')||0); run.hidx*=1+hm; run.hlast=hm;
  let termite=null; if(fx('termites')&&!has('manager')){const ids=Object.keys(run.props); if(ids.length){const id=pick(ids);run.props[id].dmg*=fx('termites');termite=L(id).name}}
  const rent=rentTonight();
  run.cash=Math.round(run.cash-rent);
  // Broke but holding shares? The broker sells them for you.
  let liquidated=0;
  if(run.cash<=0&&run.holdings.length){liquidated=run.holdings.reduce((s,h)=>s+Math.round(h.value),0);run.cash+=liquidated;run.holdings=[]}
  const fire=[];
  if(run.cash<=0){for(const id of Object.keys(run.props).sort((a,b)=>propVal(a)-propVal(b))){if(run.cash>0)break;const v=Math.round(propVal(id)*.7);run.cash+=v;delete run.props[id];fire.push([L(id).name,v])}}
  run.streak=net>0?run.streak+1:0;
  run.peak=Math.max(run.peak,netWorth());
  run.result={net,rent,notes,vres:qres,saved:false,liquidated,inc,termite,fire};
  if(run.cash<=0&&has('pearls')){run.perks=run.perks.filter(p=>p!=='pearls');run.cash=60000;run.result.saved=true}
  run.dead=run.cash<=0;
  if(run.dead){ run.earned=Math.max(1,(run.day-1)+Math.max(0,Math.floor(3*Math.log2(run.peak/100000)))+(run.tycoon?10:0)); meta.pearls+=run.earned;
    meta.best=Math.max(meta.best,run.day); meta.bestCash=Math.max(meta.bestCash,run.peak); saveMeta(); }
  scene='resolve'; render();
}
function openShop(){
  settleFollowOns();
  const pool=PERKS.filter(p=>!run.perks.includes(p.id));
  shop=[];while(shop.length<3&&pool.length){shop.push(pool.splice(Math.floor(R()*pool.length),1)[0].id)}
  scene='shop'; render();
}
const priceOf=p=>Math.round(p.cost*1000*(1-.1*meta.up.discount)/500)*500;

/* ===== Render ===== */
const app=typeof document!=='undefined'?document.getElementById('app'):null;
let headless=!app;   // sims turn rendering off for speed
const secChip=id=>`<span class="sec" style="background:${S(id).c}">${id}</span>`;
function hud(){
  const rent=rentTonight();
  return `<div class="hud">
    <div class="cash"><div class="lbl">Cash</div><div class="val tab">${fmt(run.cash)}</div></div>
    <div class="day"><div class="lbl">Day · Q${Math.ceil(run.day/QUARTER)}</div><div class="val tab">${run.day}</div></div>
    <div class="rent"><div class="lbl">Rent</div><div class="val tab">${fmt(rent)}</div></div>
  </div>
  <div class="perks">${[0,1,2,3,4].map(i=>{const id=run.perks[i];if(!id)return `<div class="slot"></div>`;const p=P(id);
    return `<div class="slot on" style="background:${p.c}" data-act="perk" data-id="${id}" role="button" tabindex="0" aria-label="${p.name}">${p.code}</div>`}).join('')}</div>
  ${run.ventures.length||run.holdings.length||Object.keys(run.props).length?`<div class="ventures"><span class="lbl">Portfolio</span>${Object.keys(run.props).length?`<span class="vchip" style="border-color:var(--green);color:var(--green)">${Object.keys(run.props).length} lots +${fmtK(totalInc())}/day</span>`:''}${run.ventures.map(v=>`<span class="vchip">${v.name} ${fmtK(v.ask*v.m)}</span>`).join('')}${run.holdings.map(h=>`<span class="vchip" style="background:var(--yellow);color:var(--ink)">${h.name} ${fmtK(h.value)}</span>`).join('')}</div>`:''}`;
}
function tv(host,chyronTag,chyronTxt,crawl,net){
  return `<div class="tv"><div class="screen">
    <svg class="chart" viewBox="0 0 200 100" preserveAspectRatio="none"><polyline fill="none" stroke="#9fc0ff" stroke-width="3" points="0,70 20,62 35,68 55,40 70,48 90,30 110,44 130,22 150,34 170,14 200,20"/></svg>
    <div class="bug">LIVE</div><div class="net">${net}</div>
    <img class="host px8" src="${host}" alt="">
    <div class="desk">GAC-TV</div>
    <div class="chyron"><b>${chyronTag}</b><span>${chyronTxt}</span></div>
    <div class="crawl"><span>${crawl}</span></div>
  </div><div class="knobs"><span>GAC-TV CH 4</span><span><i></i><i></i></span></div></div>`;
}
function cardHTML(c,back){
  const risk='▮'.repeat(c.vol)+'▯'.repeat(3-c.vol);
  const pts=c.spark.map((v,i)=>`${(i/13*200).toFixed(1)},${(100-v).toFixed(1)}`).join(' ');
  const lineCol=c.spark[13]>=c.spark[0]?'#1d8a52':'#c23a36';
  const edName=ED(c).name;
  const ed=c.ed?`<span class="chip" style="background:var(--ink);color:var(--yellow)">${edName}</span>`:'';
  const rex=c.rex?`<span class="chip" style="background:var(--red);color:var(--cream)">REX: ${c.rex}</span>`:'';
  const rum=ED(c).noRumor
    ?`<span class="tag" style="background:var(--ink)">NO FILINGS</span><br>${ED(c).txt}`
    :`<span class="tag" style="background:${c.hint==='bull'?'#1d8a52':'#c23a36'}">${c.verified?'VERIFIED ':''}RUMOR · ${c.hint==='bull'?'BULLISH':'BEARISH'}</span><br>${c.rumor}${c.ed?` <span class="edtxt">${ED(c).txt}</span>`:''}`;
  return `<div class="card ${c.ed?'ed-'+c.ed:''} ${back?'back':''}"><div class="frame">
      <div class="certhead"><span>CERTIFICATE OF SHARES</span><span>No. ${String(c.serial).padStart(5,'0')}</span></div>
      <div class="seal" style="background:${c.sec.c}">${c.sec.id.slice(0,4)}</div>
      <div><div class="tick">${c.tick}</div><div class="cname">${c.name}</div></div>
      <div class="chips"><span class="chip" style="background:${c.sec.c}">${c.sec.id}</span><span class="chip">RISK ${risk}</span>${ed}${rex}</div>
      <svg class="spark" viewBox="0 0 200 100" preserveAspectRatio="none"><polyline fill="none" stroke="${lineCol}" stroke-width="4" points="${pts}"/></svg>
      <div class="rumor">${rum}</div>
      <div class="cfoot tab"><span>${fmtP(c.price)} per share</span><span>${run.hand.length-run.idx} left</span></div>
      ${back?'':'<div class="stamp buy">BOUGHT</div><div class="stamp pass">PASSED</div>'}
  </div></div>`;
}
function holdingsBox(){
  if(!run.holdings.length) return '';
  return `<div class="box panel col" style="gap:6px"><div class="lbl">Your listed shares</div>
    ${run.holdings.map((h,i)=>`<div class="hold"><span class="d" style="font-weight:700;font-size:12px">${h.name}</span>
      <span class="tab ${h.value>=h.basis?'up':'down'}">${fmt(h.value)} <span class="muted">(${(h.value/h.basis).toFixed(1)}x)</span>${h.age?` <span class="${h.last>=0?'up':'down'}">${pct(h.last)}</span>`:''}</span>
      <button class="green" data-act="sell" data-i="${i}">Sell</button></div>`).join('')}</div>`;
}
function portfolioBox(){
  const S0=run.snap, P0=run.prevSnap, d=k=>P0?S0[k]-P0[k]:0;
  const delta=(v,cls=true)=>!P0?'':`<span class="${v>=0?'up':'down'}">${v>=0?'▲ +':'▼ -'}${fmtK(Math.abs(v))}</span>`;
  const allTime=(S0.nw-run.start)/run.start, n=Object.keys(run.props).length;
  const row=(name,val,dl,extra='')=>`<span>${name}</span><span class="tab">${fmtK(val)}</span><span class="tab">${dl}</span>${extra?`<span class="sub">${extra}</span>`:''}`;
  return `<div class="box panel col pf" style="gap:6px">
    <div class="row between"><span class="lbl">Your portfolio · this morning</span><span class="lbl">vs yesterday</span></div>
    <div class="row between"><span class="nw tab">${fmt(S0.nw)}</span>${P0?`<span class="tab ${d('nw')>=0?'up':'down'}" style="font-size:22px">${d('nw')>=0?'+':'-'}${fmtK(Math.abs(d('nw')))} (${pct(d('nw')/Math.max(1,P0.nw))})</span>`:'<span class="muted">Day 1</span>'}</div>
    <div class="muted" style="font-size:19px">Net worth. ${allTime>=0?'Up':'Down'} ${Math.abs(Math.round(allTime*100))}% from Mildred's ${fmtK(run.start)}.${run.result&&P0?` Yesterday's trading: <span class="${run.result.net>=0?'up':'down'}">${run.result.net>=0?'+':'-'}${fmtK(Math.abs(run.result.net))}</span>.`:''}</div>
    <div class="pfgrid">
      ${row('Cash',S0.cash,delta(d('cash')))}
      ${n?row(`Property · ${n} lot${n>1?'s':''}`,S0.prop,delta(d('prop')),`+${fmtK(totalInc())} every night`):''}
      ${run.ventures.length?row(`Startups · ${run.ventures.length}`,S0.vent,delta(d('vent')),run.ventures.map(v=>`${v.name} ${v.m.toFixed(2)}x · ${v.eq}%`).join(' · ')):''}
      ${run.holdings.length?row(`Listed shares · ${run.holdings.length}`,S0.hold,delta(d('hold'))):''}
    </div>
    ${run.holdings.map((h,i)=>`<div class="hold"><span class="d" style="font-weight:700;font-size:12px">${h.name}</span>
      <span class="tab ${h.value>=h.basis?'up':'down'}">${fmtK(h.value)} <span class="muted">(${(h.value/h.basis).toFixed(1)}x)</span>${h.age?` <span class="${h.last>=0?'up':'down'}">${pct(h.last)}</span>`:''}</span>
      <button class="green" data-act="sell" data-i="${i}">Sell</button></div>`).join('')}
  </div>`;
}
function propPanel(id){
  const l=L(id),o=run.props[id];
  if(o){const rc=renoCost(id),maxed=o.lvl>=3&&o.dmg>=1;
    return `<div class="box prop pop"><div class="row between"><span class="d" style="font-weight:700">${l.name}</span><span class="pips">${'■'.repeat(o.lvl)}${'□'.repeat(3-o.lvl)}</span></div>
    <div class="kv tab"><span class="muted">Value</span><span>${fmt(propVal(id))}</span><span class="muted">Income</span><span class="up">+${fmt(propInc(id))} / night</span>${o.dmg<1?`<span class="muted">Termite damage</span><span class="down">-${Math.round((1-o.dmg)*100)}%</span>`:''}</div>
    <div class="actions"><button class="ghost" data-act="reno" ${maxed||run.cash<=rc?'disabled':''}>${maxed?'Fully renovated':o.lvl>=3?`Repair ${fmtK(rc)}`:`Renovate ${fmtK(rc)}`}</button><button class="red" data-act="sellprop">Sell ${fmtK(sellPrice(id))}</button></div></div>`;}
  const pr=lotPrice(l), est=pr*l.yld*(has('landlord')?1.4:1);
  return `<div class="box prop pop"><div class="row between"><span class="d" style="font-weight:700">${l.name}</span><span class="lbl" style="color:${DISTRICTS[l.di].c}">${DISTRICTS[l.di].name}</span></div>
  <div class="kv tab"><span class="muted">Price</span><span>${fmt(pr)}</span><span class="muted">Income</span><span class="up">+${fmt(est)} / night</span><span class="muted">Pays for itself in</span><span>${Math.ceil(pr/est)} days</span></div>
  <button data-act="buyprop" ${run.cash<=pr?'disabled':''}>${run.cash<=pr?`Need ${fmtK(pr-run.cash)} more`:`Buy for ${fmtK(pr)}`}</button></div>`;
}
function followHTML(q){
  if(q.fdone==='in') return `<div class="up">You chipped in. Still own ${q.eq}%.</div>`;
  if(q.fdone==='out') return `<div class="down">You passed. Diluted to ${q.eq}%.</div>`;
  return `<div class="yel">They want ${fmt(q.follow)} more to keep your ${q.eq}%. Pass and your stake shrinks 25%.</div>
    <div class="actions"><button class="red" data-act="nofollow" data-id="${q.name}">Pass</button><button class="green" data-act="follow" data-id="${q.name}" ${run.cash<=q.follow?'disabled':''}>Pay ${fmtK(q.follow)}</button></div>`;
}
function notesStrip(){
  return `<div class="box notes">${run.news.filter(n=>n.sec).map(n=>`${secChip(n.sec)}<span class="${n.dir>0?'up':'down'}">${n.dir>0?'▲':'▼'}</span>`).join(' ')}
    <span class="muted">·</span><span class="sec" style="background:var(--red);color:var(--cream)">REX</span><span>${run.rex.call} ${run.rex.tick}</span>
    ${run.event.id!=='quiet'?`<span class="muted">·</span><span class="yel">${run.event.name}</span>`:''}</div>`;
}
function render(){
  if(headless) return;
  if(scene==='title'){
    app.innerHTML=`<div class="grow"></div>
    ${tv(sprite('aunt'),'SPECIAL REPORT','Local great-aunt hands out money, family nervous','DOW ▲ 12 · SOUP ▲ 3 · SOCKS ▼ 8 · GOAT ▲ 40 · GRAVY ▲ 1 · LLAMA ▼ 2','INHERITANCE HOUR')}
    <div class="col pop"><div class="logo">GREAT AUNT CAPITAL</div>
      <div style="font-size:22px">Mildred gave you $100,000. Watch the morning news, swipe on stocks, back weird startups, buy the town, pay rent. Don't go broke.</div></div>
    <div class="box panel col" style="gap:4px">
      <div class="row between"><span class="muted">Pearls</span><span class="yel tab">${meta.pearls}</span></div>
      <div class="row between"><span class="muted">Longest run</span><span class="tab">${meta.best?meta.best+' days':'none yet'}</span></div>
      <div class="row between"><span class="muted">Peak net worth</span><span class="tab">${meta.bestCash?fmt(meta.bestCash):'none yet'}</span></div>
    </div>
    <div class="col"><button data-act="start">Take the money</button>
      <div class="actions"><button class="ghost" data-act="will">The will</button><button class="ghost" data-act="help">How to play</button></div></div>
    <div class="grow"></div>`; return;
  }
  if(scene==='help'){
    app.innerHTML=`<div class="h2" style="padding-top:8px">HOW TO PLAY</div>
    <div class="box panel col scroll grow" style="font-size:21px">
      <div><b class="yel">Morning news.</b> Chip Bullock reports which sectors are up ▲ or down ▼ today. He's right about 80% of the time. Rex Shouter yells one hot pick. Rex is right about half the time.</div>
      <div><b class="yel">Swipe.</b> Each stock certificate shows its sector, risk and a rumor. Pick a position size (10%, 25%, 50% of your morning cash, or Max), then swipe right to buy that many shares. Swipe left to pass. Stocks in a sector the news liked tend to rise.</div>
      <div><b class="yel">Close.</b> You see how every stock did, even the ones you passed. Then rent is due. Rent grows every day.</div>
      <div><b class="yel">Pitches.</b> Some mornings a founder pitches a startup with Team, Product, Market and Hype scores. Every quarter (4 days) it files a report: a new funding round that re-prices your stake, a buyout for cash, an IPO, a pivot, or bust. After a good round they may ask for more money: pay to keep your share, or pass and get diluted. Public shares move every day. The news hints which way, and you choose when to sell.</div>
      <div><b class="yel">Real estate.</b> Tap Town between trading days to buy property. Every lot pays you each night, renovations raise income, and owning a whole district gives a 1.5x monopoly bonus. If you run out of cash, your shares and then your cheapest properties are sold for you. Own all 16 lots to become a Tycoon.</div>
      <div><b class="yel">Broker.</b> At the end of every quarter you can buy perks. You hold up to 5. Tap a perk to read it.</div>
      <div><b class="yel">Special certificates.</b> Gold Leaf: +50% gains. Volatile: double moves. Unlisted: no rumor, double moves. Blue Chip: half the moves, rises more often. Penny Stock: cheap and wild. Dividend: pays 4% of your stake either way.</div>
      <div><b class="yel">Big orders.</b> Pour a lot of money into one stock and you move its price against yourself. The buy line warns you how much of the gain you lose. Calm, low-risk stocks absorb big orders best.</div>
      <div><b class="yel">Events.</b> Every morning brings one: heat waves, rate hikes, tourist season, margin calls, flash crashes and more. Read the chyron.</div>
      <div><b class="yel">The will.</b> Going broke earns Pearls for permanent upgrades.</div>
    </div>
    <button data-act="title">Back</button>`; return;
  }
  if(scene==='will'){
    app.innerHTML=`<div class="row between" style="padding-top:8px"><div class="h2">THE WILL</div><div class="yel tab" style="font-size:30px">${meta.pearls} pearls</div></div>
    <div class="col scroll grow">${UPGRADES.map(u=>{const l=meta.up[u.id],max=l>=u.max,cost=u.cost(l);
      return `<div class="box item" style="grid-template-columns:1fr auto">
        <div><div class="n">${u.name}</div><div class="ds">${u.desc}</div><div class="pips">${'■'.repeat(l)}${'□'.repeat(u.max-l)}</div></div>
        <button data-act="upg" data-id="${u.id}" ${max||meta.pearls<cost?'disabled':''}>${max?'Max':cost+' pearls'}</button></div>`}).join('')}</div>
    <button data-act="title">Back</button>`; return;
  }
  if(scene==='news'){
    const crawl=run.hand.map(c=>`${c.tick} ${c.spark[13]>=c.spark[0]?'▲':'▼'} ${(Math.abs(c.spark[13]-c.spark[0])/10).toFixed(2)}`).join(' · ');
    app.innerHTML=hud()+`<div class="col scroll grow">
      ${tv(sprite('anchor'),run.event.id==='quiet'?'MARKET MORNING':'BREAKING',run.event.id==='quiet'?`Day ${run.day}. Here's what's moving.`:`${run.event.name}: ${run.event.txt}`,crawl,'MARKET MORNING')}
      ${portfolioBox()}
      <div class="col" style="gap:6px">${run.news.map(n=>`<div class="box hl">${n.sec?`<span>${secChip(n.sec)} <span class="${n.dir>0?'up':'down'}">${n.dir>0?'▲':'▼'}</span></span>`:n.hold?`<span><span class="sec" style="background:var(--yellow)">YOURS</span> <span class="${n.dir>0?'up':'down'}">${n.dir>0?'▲':'▼'}</span></span>`:'<span class="sec" style="background:var(--steel)">ALSO</span>'}<span>${n.txt}</span></div>`).join('')}</div>
      <div class="pundit"><img class="px8" src="${sprite('pundit')}" width="56" height="56" alt="">
        <div><div class="lbl" style="color:var(--cream)">Rex Shouter's hot pick</div><div class="shout">${run.rex.line}</div></div></div>
    </div>
    <div class="actions"><button class="ghost" data-act="town">Town</button><button data-act="${run.pitch?'pitch':'play'}">${run.pitch?'A founder pitches':'Open market'}</button></div>`; return;
  }
  if(scene==='pitch'){
    const p=run.pitch;
    app.innerHTML=hud()+`<div class="col scroll grow">
      ${tv(sprite('founder',{h:p.hair,c:p.hood,w:p.hood,t:'#f4efe1'}),'THE PITCH',`${p.founder} from ${p.name} has 30 seconds`,`${p.name.toUpperCase()} · ${p.idea.toUpperCase()} · SEEKING ${fmt(p.ask)}`,'SHARK HOUR')}
      <div class="box pitch pop">
        <div class="name">${p.name}</div>
        <div class="line">It's ${p.idea}.</div>
        <div class="quote">"${p.line}" <span class="muted">— ${p.founder}</span></div>
        <div class="row" style="flex-wrap:wrap;gap:6px">${p.traits.map(t=>`<span class="trait">${t}</span>`).join('')}</div>
        <div class="stats">${STATS.map(k=>`<span class="lbl">${k}</span><span class="bar">${[1,2,3,4,5].map(i=>`<i class="${i<=p.st[k]?'on':''}"></i>`).join('')}</span>`).join('')}</div>
        <div class="deal tab">
          <div><div class="lbl">Ask</div><div class="val">${fmt(p.ask)}</div></div>
          <div><div class="lbl">For</div><div class="val">${p.equity}%</div></div>
          <div style="grid-column:1/-1;font-size:19px">Reports every quarter (4 days), first at the end of Q${Math.ceil((run.day+1)/QUARTER)}. Each report: a new funding round, a buyout, an IPO, or bust. Team, product and market keep it alive. Hype makes IPOs pop.</div>
        </div>
      </div>
    </div>
    <div class="actions"><button class="red" data-act="nopitch">← Pass</button><button class="green" data-act="yespitch" ${run.cash<=p.ask?'disabled':''}>Invest →</button></div>`; return;
  }
  if(scene==='play'){
    const rest=run.hand.slice(run.idx,run.idx+3);
    app.innerHTML=hud()+notesStrip()+`
    <div class="deck" id="deck">${rest.map((c,i)=>({c,i})).reverse().map(({c,i})=>i===0?cardHTML(c,false):`<div style="position:absolute;inset:0;transform:translateY(${i*8}px) scale(${1-i*.04});opacity:${1-i*.25}">${cardHTML(c,true)}</div>`).join('')}</div>
    <div class="sizes">${SIZES.map(z=>`<button class="${run.size===z?'':'ghost'}" data-act="size" data-z="${z}">${z>=1?'Max':Math.round(z*100)+'%'}</button>`).join('')}</div>
    <div class="hintline muted tab">${(()=>{const c=run.hand[run.idx],L=lot(c),k=L.sh?impact(c,L.cost):1;return L.sh?`Buy ${L.sh.toLocaleString()} shares · ${fmt(L.cost)}${k<.95?` · <span class="down">big order, gains -${Math.round((1-k)*100)}%</span>`:''}`:"Can't afford a share"})()}</div>
    <div class="actions"><button class="red" data-act="pass">← Pass</button><button class="green" data-act="buy">Buy →</button></div>`;
    bindSwipe(); return;
  }
  if(scene==='resolve'){
    const r=run.result;
    app.innerHTML=hud()+`<div class="h2">CLOSING BELL · DAY ${run.day}</div>
    <div class="box panel col scroll grow pop">
      <div class="res">${run.hand.map(c=>`<span class="t">${c.tick}</span>
        <span>${c.bought?'<span class="pill yel">BOUGHT</span>':'<span class="pill muted">PASSED</span>'}${c.fraud?' <span class="pill down">FRAUD</span>':''}${c.penny?' <span class="pill yel">PENNY</span>':''}${c.bought&&ED(c).div?' <span class="pill up">DIV</span>':''}${c.slip?' <span class="pill down">BIG ORDER</span>':''}</span>
        <span class="tab ${c.r>=0?'up':'down'}">${pct(c.r)}</span>
        <span class="tab ${c.bought?(c.delta>=0?'up':'down'):'muted'}">${c.bought?(c.delta>=0?'+':'')+fmt(c.delta):'·'}</span>`).join('')}</div>
      ${run.qres?`<div class="vres yel">★ End of Q${run.day/QUARTER}. Your startups have filed their quarterly reports.</div>`:''}
      ${holdingsBox()}
      <div class="sum tab">
        <span>Trading</span><span class="${r.net>=0?'up':'down'}">${r.net>=0?'+':''}${fmt(r.net)}</span>
        ${r.notes.map(n=>`<span>${n[0]}</span><span class="up">+${fmt(n[1])}</span>`).join('')}
        ${r.vres.filter(v=>v.kind==='acq').map(v=>`<span>Buyout</span><span class="up">+${fmt(v.amt)}</span>`).join('')}
        ${r.inc?`<span>Property income</span><span class="up">+${fmt(r.inc)}</span>`:''}
        <span>Rent</span><span class="down">-${fmt(r.rent)}</span>
        ${r.fire.map(f=>`<span>Fire sale: ${f[0]}</span><span class="up">+${fmt(f[1])}</span>`).join('')}
        ${r.liquidated?`<span>Shares sold to cover rent</span><span class="up">+${fmt(r.liquidated)}</span>`:''}
        <span class="yel">Cash now</span><span class="yel">${fmt(Math.max(0,run.cash))}</span>
      </div>
      ${r.termite?`<div class="down">Termites chewed through ${r.termite}. Value and income down 20% until you repair it.</div>`:''}
      ${r.saved?`<div class="yel">You pawned Aunt's Pearls for $60. She will never know.</div>`:''}
    </div>
    ${run.qres?`<button data-act="quarter">Read quarterly reports</button>`:run.dead?`<button class="red" data-act="over">You're broke</button>`:`<div class="actions"><button class="ghost" data-act="town">Town</button>${run.day%QUARTER===0?`<button data-act="shop">Visit broker</button>`:`<button data-act="next">Next morning</button>`}</div>`}`; return;
  }
  if(scene==='quarter'){
    const stat=k=>({team:'Team',product:'Product',market:'Market',hype:'Hype'})[k];
    app.innerHTML=hud()+`<div class="h2">QUARTERLY REPORTS · Q${run.day/QUARTER}</div>
    <div class="col scroll grow">${run.qres.map(q=>`<div class="box qr pop">
      <div class="row between"><span class="d" style="font-weight:700">${q.name}</span>${q.kind==='wait'?'<span class="pill muted">TOO NEW</span>':q.kind==='bust'?'<span class="pill down">BUST</span>':q.kind==='acq'?'<span class="pill up">BOUGHT OUT</span>':q.kind==='ipo'?'<span class="pill yel">IPO</span>':q.kind==='pivot'?'<span class="pill yel">PIVOT</span>':`<span class="pill ${q.g>=1?'up':'down'}">${q.g>=1?q.round.toUpperCase():'DOWN ROUND'}</span>`}</div>
      <div>${q.kind==='wait'?'Funded today. First real report next quarter.':q.kind==='bust'?`Company ${q.txt}. Your ${fmt(q.amt)} is gone.`:q.kind==='round'?`${q.g>=1?`Raised a ${q.round} at a higher valuation.`:'Raised money at a lower valuation.'} ${stat(q.k)} ${q.d>0?'▲':'▼'}`:q.txt}</div>
      ${q.kind!=='wait'&&q.kind!=='bust'?`<div class="tab ${q.mult>=1?'up':'down'}">Your stake: ${fmt(q.amt)} (${q.mult.toFixed(2)}x)${q.kind==='acq'?' paid in cash':''}${q.eq?` · you own ${q.eq}%`:''}</div>`:''}
      ${q.follow?followHTML(q):''}
    </div>`).join('')}
    ${holdingsBox()}</div>
    ${run.dead?`<button class="red" data-act="over">You're broke</button>`:`<div class="actions"><button class="ghost" data-act="town">Town</button><button data-act="shop">Visit broker</button></div>`}`; return;
  }
  if(scene==='shop'){
    app.innerHTML=hud()+`<div class="row between"><div class="h2">THE BROKER</div><span class="muted">${run.perks.length}/5 perks</span></div>
    <div class="col scroll grow">${shop.length?shop.map(id=>{const p=P(id),pr=priceOf(p);
      return `<div class="box item"><div class="ico" style="background:${p.c}">${p.code}</div>
      <div style="min-width:0"><div class="n">${p.name}</div><div class="ds">${p.desc}</div></div>
      <button data-act="buyperk" data-id="${id}" ${run.cash<=pr||run.perks.length>=5?'disabled':''}>${fmt(pr)}</button></div>`}).join(''):'<div class="box panel muted">Sold out.</div>'}</div>
    <div class="actions" style="grid-template-columns:1fr 1fr 1.2fr"><button class="ghost" data-act="reroll" ${run.cash<=run.reroll?'disabled':''}>Reroll ${fmtK(run.reroll)}</button><button class="ghost" data-act="town">Town</button><button data-act="next">Next day</button></div>`; return;
  }
  if(scene==='town'){
    app.innerHTML=hud()+`<div class="row between"><div class="h2">MILDRED'S TOWN</div><span class="tab ${run.hlast>=0?'up':'down'}">Housing ${pct(run.hlast)}</span></div>
    <div class="col scroll grow">
      ${DISTRICTS.map(d=>`<div class="col" style="gap:6px"><div class="row between"><span class="lbl" style="color:${d.c}">${d.name}</span>${monopoly(d.id)?`<span class="pill yel">MONOPOLY ×${monoMult()}</span>`:''}</div>
        <div class="lots">${LOTS.filter(l=>l.dist===d.id).map(l=>{const o=run.props[l.id];
          return `<button class="lot ${o?'own':''} ${run.sel===l.id?'sel':''}" data-act="lot" data-id="${l.id}"><img class="px8" src="${bldg(l)}" alt="" width="40" height="40"><span class="ln">${l.name}</span><span class="lp tab">${o?'+'+fmtK(propInc(l.id))+'/d':fmtK(lotPrice(l))}</span></button>`}).join('')}</div></div>`).join('')}
      <div class="muted" style="font-size:19px">Owned: ${Object.keys(run.props).length}/16 · Property worth ${fmt(propTotal())} · Net worth ${fmt(netWorth())}</div>
    </div>
    ${run.sel?propPanel(run.sel):'<div class="box panel muted" style="font-size:19px">Tap a lot to see it. Own every lot in a district for a 1.5x monopoly. Own all 16 to become a Tycoon.</div>'}
    <button data-act="back">Back</button>`; return;
  }
  if(scene==='tycoon'){
    app.innerHTML=`<div class="grow"></div>
    ${tv(sprite('aunt'),'BREAKING','Great-nephew now owns the entire town','EVERY LOT ▲ · MILDRED ▲ ▲ ▲ · RENT: WHO CARES · TOWN RENAMED','INHERITANCE HOUR')}
    <div class="logo">TYCOON</div>
    <div style="font-size:22px">You own all 16 lots and earn ${fmt(totalInc())} every night. Mildred framed your photo. +25 pearls, and +10 more when this run ends.</div>
    <button data-act="town2">Keep playing</button><div class="grow"></div>`; return;
  }
  if(scene==='over'){
    app.innerHTML=`<div class="grow"></div>
    ${tv(sprite('aunt'),'BREAKING','Great-nephew goes broke. Aunt "not angry, just disappointed."','PEARLS ▲ · DIGNITY ▼ · RENT ▲ ▲ ▲','INHERITANCE HOUR')}
    <div class="logo" style="color:var(--red)">BROKE</div>
    <div class="box panel col" style="gap:4px">
      <div class="row between"><span class="muted">Days lasted</span><span class="tab">${run.day}</span></div>
      <div class="row between"><span class="muted">Peak net worth</span><span class="tab">${fmt(run.peak)}</span></div>
      <div class="row between"><span class="muted">Pearls earned</span><span class="yel tab">+${run.earned}</span></div>
    </div>
    <div class="col"><button data-act="start">Ask for more money</button>
      <div class="actions"><button class="ghost" data-act="will">The will</button><button class="ghost" data-act="title">Title</button></div></div>
    <div class="grow"></div>`;
  }
}

/* ===== Input ===== */
if(app) app.addEventListener('click',e=>{
  const el=e.target.closest('[data-act]'); if(!el) return;
  const a=el.dataset.act, id=el.dataset.id;
  if(a==='start') newRun();
  else if(a==='title'){scene='title';render()}
  else if(a==='will'){scene='will';render()}
  else if(a==='help'){scene='help';render()}
  else if(a==='upg'){const u=UPGRADES.find(x=>x.id===id),c=u.cost(meta.up[id]);if(meta.pearls>=c&&meta.up[id]<u.max){meta.pearls-=c;meta.up[id]++;saveMeta();render()}}
  else if(a==='pitch'){scene='pitch';render()}
  else if(a==='yespitch') decidePitch(true);
  else if(a==='nopitch') decidePitch(false);
  else if(a==='play'){scene='play';render()}
  else if(a==='buy') flyOut(1);
  else if(a==='pass') flyOut(-1);
  else if(a==='perk'){const p=P(id);toast(`${p.name}: ${p.desc}`)}
  else if(a==='next') startDay();
  else if(a==='shop') openShop();
  else if(a==='over'){scene='over';render()}
  else if(a==='buyperk'){const p=P(id),pr=priceOf(p);if(run.cash>pr&&run.perks.length<5){run.cash-=pr;run.perks.push(id);shop=shop.filter(x=>x!==id);render()}}
  else if(a==='sell'){const h=run.holdings[+el.dataset.i];if(h){run.cash+=Math.round(h.value);run.peak=Math.max(run.peak,run.cash);run.holdings.splice(+el.dataset.i,1);if(run.snap){run.snap.cash=run.cash;run.snap.hold=run.holdings.reduce((s,h)=>s+h.value,0)}toast(`Sold ${h.name} for ${fmt(h.value)} (${(h.value/h.basis).toFixed(1)}x).`);render()}}
  else if(a==='reroll'){if(run.cash>run.reroll){run.cash-=run.reroll;run.reroll+=3000;openShop()}}
  else if(a==='town'){run.back=scene;scene='town';render()}
  else if(a==='town2'){scene='town';render()}
  else if(a==='back'){scene=run.back||'news';render()}
  else if(a==='lot'){run.sel=run.sel===id?null:id;render()}
  else if(a==='buyprop') buyLot(run.sel);
  else if(a==='reno'){const id2=run.sel,o=run.props[id2],c=renoCost(id2);if(o&&run.cash>c&&!(o.lvl>=3&&o.dmg>=1)){run.cash-=c;if(o.lvl<3)o.lvl++;o.dmg=1;render()}}
  else if(a==='sellprop'){const id2=run.sel;if(run.props[id2]){const v=sellPrice(id2);run.cash+=v;delete run.props[id2];toast(`Sold ${L(id2).name} for ${fmt(v)}.`);render()}}
  else if(a==='size'){run.size=+el.dataset.z;render()}
  else if(a==='quarter'){scene='quarter';render()}
  else if(a==='follow'||a==='nofollow'){if(followOn(id,a==='follow'))render()}
});
if(app) document.addEventListener('keydown',e=>{
  if(scene==='play'){if(e.key==='ArrowRight')flyOut(1);if(e.key==='ArrowLeft')flyOut(-1)}
  else if(scene==='pitch'){if(e.key==='ArrowRight')decidePitch(true);if(e.key==='ArrowLeft')decidePitch(false)}
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
  card.addEventListener('pointerdown',e=>{x0=e.clientX;dx=0;card.setPointerCapture(e.pointerId);card.style.transition='none'});
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

/* ===== Boot (keeps a run alive across live updates) ===== */
export function boot(){ render(); }

/* ===== Test and simulation hooks ===== */
// Lets tests and scripts/sim.mjs drive the game without a browser.
export const api={
  get run(){return run}, get meta(){return meta}, get scene(){return scene},
  resetMeta(){meta=loadMeta()},
  setScene(s){scene=s},
  setHeadless(v){headless=v||!app},
  newRun, startDay, choose, decidePitch, followOn, buyLot, openShop, makePitch, lotPrice, rentFor, render,
};
