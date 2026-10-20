// Original desktop notification tones. Nothing plays until a user tap unlocks audio.
let ctx=null, muted=false;
export const setMuted=m=>{muted=!!m};
export function unlock(){
  if(typeof window==='undefined') return;
  if(!ctx){const A=window.AudioContext||window.webkitAudioContext;if(A)ctx=new A()}
  if(ctx&&ctx.state==='suspended') ctx.resume();
}
function blip(f,d=.06,type='triangle',vol=.04,when=0){
  if(muted||!ctx) return;
  const t=ctx.currentTime+when, o=ctx.createOscillator(), g=ctx.createGain();
  o.type=type; o.frequency.setValueAtTime(f,t);
  g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t+d+.02);
}
// A pitch slide, for the sad trombone and the account-closed groan.
function slide(f0,f1,d=.4,type='sawtooth',vol=.03,when=0){
  if(muted||!ctx) return;
  const t=ctx.currentTime+when, o=ctx.createOscillator(), g=ctx.createGain();
  o.type=type; o.frequency.setValueAtTime(f0,t); o.frequency.exponentialRampToValueAtTime(f1,t+d);
  g.gain.setValueAtTime(vol,t); g.gain.setValueAtTime(vol,t+d*.7); g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t+d+.02);
}
const arp=(notes,gap=.08,d=.16,type='sine',vol=.035,when=0)=>notes.forEach((f,i)=>blip(f,d,type,vol,when+i*gap));
// Short phone buzzes for the big moments. Silent when muted or unsupported.
export function buzz(pattern){if(muted||typeof navigator==='undefined'||!navigator.vibrate||navigator.userActivation?.hasBeenActive===false)return;try{navigator.vibrate(pattern)}catch{}}
export const sfx={
  // Verdict stings: wins climb, losses fall. Bigger tiers get longer phrases.
  verdict:tier=>({
    record:()=>{arp([523,659,784,1047,1319,1568],.07,.2,'square',.025);blip(2093,.6,'sine',.04,.45)},
    boss:()=>{arp([392,523,659,784],.1,.22,'square',.03);arp([784,1047],.12,.5,'sine',.04,.42)},
    great:()=>arp([523,659,784,1047,1319],.07,.2,'sine',.04),
    good:()=>arp([659,784,1047],.08,.2,'sine',.035),
    flat:()=>arp([523,659],.1,.16,'triangle',.03),
    red:()=>{blip(392,.2,'triangle',.04);blip(330,.32,'triangle',.04,.16)},
    bloodbath:()=>{arp([392,370,349],.24,.24,'sawtooth',.025);slide(330,165,.7,'sawtooth',.028,.72)},
    broke:()=>{arp([311,294,277],.28,.28,'sawtooth',.03);slide(262,82,1.1,'sawtooth',.035,.84)},
  }[tier]||(()=>{}))(),
  coins:n=>{for(let i=0;i<Math.min(n,14);i++)blip(1568+((i*7)%5)*180,.05,'triangle',.025,i*.045)},
  rung:()=>{arp([523,659,784,1047],.09,.18,'square',.025);arp([784,988,1175,1568],.09,.22,'sine',.035,.4)},
  heat:lvl=>arp([659,880,1175,1568].slice(0,lvl+1),.05,.12,'square',.022),
  handUp:()=>arp([784,988,1319],.05,.12,'triangle',.04),
  newPerk:()=>arp([523,784,1047,1568],.06,.16,'sine',.035),
  levelUp:()=>arp([440,554,659,880],.06,.16,'triangle',.04),
  record:()=>arp([1047,1319,1568,2093],.06,.12,'square',.022),
  tick:i=>blip(880+i*40,.03,'square',.015),
  buy:()=>{blip(659,.1,'sine',.04);blip(988,.16,'sine',.035,.08)},
  pass:()=>blip(196,.08,'triangle',.06),
  step:i=>blip(330*2**(Math.min(i,30)/12),.05),
  mult:i=>blip(523*2**(Math.min(i,24)/12),.08,'triangle',.04),
  x:()=>{blip(523,.14,'sine');blip(659,.14,'sine',.035,.06);blip(784,.18,'sine',.035,.12)},
  loss:()=>blip(220,.12,'triangle',.04),
  bell:()=>{blip(1568,.7,'sine',.07);blip(2093,.55,'sine',.035,.02)},
  settle:tier=>{if(tier==='win'){blip(523,.18,'sine',.04);blip(659,.2,'sine',.035,.1);blip(1047,.3,'sine',.035,.2)}else if(tier==='loss'){blip(392,.2,'sine',.04);blip(262,.3,'sine',.04,.18)}else{blip(659,.16,'sine',.035);blip(784,.22,'sine',.03,.12)}},
  boss:()=>{blip(330,.18,'sine',.05);blip(262,.26,'sine',.05,.2)},
  cash:()=>blip(1320,.05,'triangle',.05),
  use:()=>{blip(880,.05,'triangle',.05);blip(1175,.08,'triangle',.05,.05)},
  bad:()=>{blip(392,.18,'sine',.05);blip(294,.32,'sine',.05,.18)},
};
