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
export const sfx={
  buy:()=>{blip(659,.1,'sine',.04);blip(988,.16,'sine',.035,.08)},
  pass:()=>blip(196,.08,'triangle',.06),
  step:i=>blip(330*2**(Math.min(i,30)/12),.05),
  mult:i=>blip(523*2**(Math.min(i,24)/12),.08,'triangle',.04),
  x:()=>{blip(523,.14,'sine');blip(659,.14,'sine',.035,.06);blip(784,.18,'sine',.035,.12)},
  loss:()=>blip(220,.12,'triangle',.04),
  bell:()=>{blip(1568,.7,'sine',.07);blip(2093,.55,'sine',.035,.02)},
  boss:()=>{blip(330,.18,'sine',.05);blip(262,.26,'sine',.05,.2)},
  cash:()=>blip(1320,.05,'triangle',.05),
  use:()=>{blip(880,.05,'triangle',.05);blip(1175,.08,'triangle',.05,.05)},
  bad:()=>{blip(392,.18,'sine',.05);blip(294,.32,'sine',.05,.18)},
};
