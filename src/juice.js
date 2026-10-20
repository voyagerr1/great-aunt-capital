// Cosmetic celebration effects: count-ups, floating numbers, bill bursts and window flashes.
// Uses Math.random on purpose: nothing here may touch the seeded game RNG.
// No matchMedia (tests, old browsers) counts as reduced motion: effects are skipped, final states still apply.
const reduced=()=>typeof matchMedia!=='function'||typeof requestAnimationFrame!=='function'||matchMedia('(prefers-reduced-motion: reduce)').matches;
let timers=[], frames=[];
export const later=(fn,ms)=>{const t=setTimeout(()=>{timers=timers.filter(x=>x!==t);fn()},ms);timers.push(t);return t};
// Called by render(): a rebuilt screen must not be poked by effects scheduled for the old one.
export function cancelJuice(){timers.forEach(clearTimeout);timers=[];frames.forEach(cancelAnimationFrame);frames=[]}
export const motionOK=()=>!reduced();

function layer(){
  let l=document.getElementById('fx-layer');
  if(!l){l=document.createElement('div');l.id='fx-layer';l.setAttribute('aria-hidden','true');document.body.appendChild(l)}
  return l;
}
function centre(el){const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height}}
const spawn=(cls,html,x,y,vars,life)=>{
  const d=document.createElement('div');d.className=cls;d.innerHTML=html;d.style.left=x+'px';d.style.top=y+'px';
  for(const k in vars)d.style.setProperty(k,vars[k]);
  layer().appendChild(d);setTimeout(()=>d.remove(),life);
};

// Count a number from `from` to `to`, writing `format(n)` into el. Ease-out so the last digits land with weight.
export function countUp(el,from,to,ms,format,onTick){
  if(!el)return;
  if(reduced()||ms<=0||from===to){el.textContent=format(to);return}
  const t0=performance.now();let lastTick=0;
  const step=now=>{
    if(!el.isConnected)return;
    const k=Math.min(1,(now-t0)/ms),e=1-Math.pow(1-k,3);
    el.textContent=format(from+(to-from)*e);
    if(onTick&&now-lastTick>55&&k<1){lastTick=now;onTick(k)}
    if(k<1)frames.push(requestAnimationFrame(step));
  };
  frames.push(requestAnimationFrame(step));
}
// A number that floats off an element: gains rise, losses sink.
export function popAt(el,text,kind='gain'){
  if(!el||reduced())return;
  const c=centre(el),dx=(Math.random()-.5)*c.w*.5;
  spawn(`fx-pop fx-${kind}`,text,c.x+dx,c.y-c.h*.2,{},900);
}
// Paper money for wins, red arrows for losses. n scales with how big the moment is.
export function burst(el,n,kind='bills'){
  if(!el||reduced())return;
  const c=centre(el);
  for(let i=0;i<n;i++){
    const a=kind==='bills'?-Math.PI/2+(Math.random()-.5)*2.4:Math.PI/2+(Math.random()-.5)*1.2;
    const v=kind==='bills'?90+Math.random()*170:40+Math.random()*90;
    spawn(`fx-${kind}`,kind==='bills'?'$':'▼',c.x+(Math.random()-.5)*c.w*.6,c.y,
      {'--dx':Math.cos(a)*v+'px','--dy':Math.sin(a)*v+'px','--rot':(Math.random()-.5)*540+'deg','--delay':Math.random()*180+'ms'},1700);
  }
}
// Restart a one-shot CSS animation class on an element.
export function kick(el,cls){if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls)}
// The whole application window reacts: a title-bar flash for wins, "Not Responding" for disasters.
export function windowFx(kind){
  const w=document.querySelector('.application-window'),cap=document.getElementById('window-caption');if(!w)return;
  if(kind==='hung'&&cap&&!cap.textContent.includes('Not Responding')){
    const was=cap.textContent;cap.textContent=was+' (Not Responding)';w.classList.add('is-hung');
    setTimeout(()=>{w.classList.remove('is-hung');if(cap.textContent.endsWith(' (Not Responding)'))cap.textContent=was},1700);
  }
  if(kind==='flash'&&!reduced())kick(w,'is-flashing');
}

/* The Solitaire win, with money. Bills and stock certificates leap off a spot, bounce along the bottom of the
   screen and leave a trail, because the canvas is never cleared. Tap anywhere to put it away. */
let cascadeEnd=null;
function drawBill(g,w,h,kind,label){
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
  if(kind==='cert'){
    x.fillStyle='#fff';x.fillRect(0,0,w,h);x.strokeStyle='#000080';x.lineWidth=2;x.strokeRect(1,1,w-2,h-2);
    x.fillStyle='#000080';x.fillRect(0,0,w,8);x.fillStyle='#c0a040';x.beginPath();x.arc(w-11,h-11,6,0,7);x.fill();
    x.fillStyle='#161616';x.font='bold 11px Tahoma,Arial,sans-serif';x.fillText(label,6,24);
    x.fillStyle='#808080';x.fillRect(6,30,w-26,2);x.fillRect(6,35,w-34,2);
  }else{
    x.fillStyle='#d9ead3';x.fillRect(0,0,w,h);x.strokeStyle='#1d6b37';x.lineWidth=2;x.strokeRect(1,1,w-2,h-2);
    x.strokeRect(4,4,w-8,h-8);x.fillStyle='#9fc59a';x.beginPath();x.ellipse(w/2,h/2,h*.28,h*.32,0,0,7);x.fill();
    x.fillStyle='#0b3d1e';x.font=`bold ${Math.round(h*.42)}px "Courier New",monospace`;x.textAlign='center';x.textBaseline='middle';
    x.fillText('$',w/2,h/2+1);x.font='bold 9px Tahoma,Arial,sans-serif';x.fillText(label,10,10);x.fillText(label,w-10,h-9);
  }
  return c;
}
export function cascade({from=null,count=26,labels=['100'],kinds=['bill','cert']}={}){
  if(reduced()||typeof document==='undefined')return;
  cascadeEnd?.();
  const cv=document.createElement('canvas'),W=innerWidth,Hh=innerHeight,dpr=Math.min(2,devicePixelRatio||1);
  cv.id='fx-cascade';cv.width=W*dpr;cv.height=Hh*dpr;cv.setAttribute('aria-hidden','true');
  const g=cv.getContext('2d');g.scale(dpr,dpr);document.body.appendChild(cv);
  const sprites=kinds.flatMap(k=>labels.map(l=>drawBill(g,k==='cert'?62:66,k==='cert'?44:30,k,l)));
  const origins=from?[...document.querySelectorAll(from)].map(centre):[];
  if(!origins.length)origins.push({x:W*.2,y:Hh*.2},{x:W*.4,y:Hh*.2},{x:W*.6,y:Hh*.2},{x:W*.8,y:Hh*.2});
  let live=[],launched=0,raf=0,stop=false,t=0;
  const launch=()=>{const o=origins[launched%origins.length],s=sprites[Math.floor(Math.random()*sprites.length)],dir=Math.random()<.5?-1:1;
    live.push({s,x:o.x-s.width/2,y:o.y-s.height/2,vx:dir*(1.6+Math.random()*3.4),vy:-(2+Math.random()*5)});launched++};
  const tick=()=>{
    if(stop)return;
    if(t++%9===0&&launched<count)launch();
    for(const b of live){
      b.vy+=.32;b.x+=b.vx;b.y+=b.vy;
      if(b.y+b.s.height>Hh){b.y=Hh-b.s.height;b.vy*=-.78;if(Math.abs(b.vy)<2)b.vy=-(4+Math.random()*3)}
      g.drawImage(b.s,b.x,b.y);
    }
    live=live.filter(b=>b.x>-80&&b.x<W+80);
    if(launched>=count&&!live.length){end();return}
    raf=requestAnimationFrame(tick);
  };
  const end=()=>{if(stop)return;stop=true;cancelAnimationFrame(raf);cascadeEnd=null;cv.classList.add('is-leaving');setTimeout(()=>cv.remove(),400);removeEventListener('keydown',end,true)};
  cascadeEnd=end;
  // The canvas covers the screen, so the dismissing tap never lands on a button underneath.
  cv.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();end()});
  setTimeout(()=>addEventListener('keydown',end,true),250);
  setTimeout(end,9000);
  raf=requestAnimationFrame(tick);
}
