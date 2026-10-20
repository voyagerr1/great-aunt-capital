// Chiptune blips with WebAudio. Nothing plays until unlock() runs from a user tap.
let ctx=null, muted=false;
export const setMuted=m=>{muted=!!m};
export function unlock(){
  if(typeof window==='undefined') return;
  if(!ctx){const A=window.AudioContext||window.webkitAudioContext;if(A)ctx=new A()}
  if(ctx&&ctx.state==='suspended') ctx.resume();
}
function blip(f,d=.06,type='square',vol=.04,when=0){
  if(muted||!ctx) return;
  const t=ctx.currentTime+when, o=ctx.createOscillator(), g=ctx.createGain();
  o.type=type; o.frequency.setValueAtTime(f,t);
  g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t+d+.02);
}
export const sfx={
  buy:()=>{blip(660,.05);blip(990,.07,'square',.04,.05)},
  pass:()=>blip(196,.08,'triangle',.06),
  step:i=>blip(330*2**(Math.min(i,30)/12),.05),
  mult:i=>blip(523*2**(Math.min(i,24)/12),.08,'square',.05),
  x:()=>{blip(523,.14);blip(659,.14,'square',.035,.03);blip(784,.18,'square',.035,.06)},
  loss:()=>blip(147,.09,'sawtooth',.04),
  bell:()=>{blip(1568,.7,'sine',.07);blip(2093,.55,'sine',.035,.02)},
  boss:()=>{blip(98,.35,'sawtooth',.05);blip(92,.45,'sawtooth',.05,.3)},
  cash:()=>blip(1320,.05,'triangle',.05),
  use:()=>{blip(880,.05,'triangle',.05);blip(1175,.08,'triangle',.05,.05)},
  bad:()=>{blip(196,.2,'sawtooth',.05);blip(147,.32,'sawtooth',.05,.18)},
};
