// Small shared helpers: randomness, clamping, money formatting, game constants.
export const R=Math.random;
export const pick=a=>a[Math.floor(R()*a.length)];
export const rr=(a,b)=>a+R()*(b-a);
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
export const fmt=n=>(n<0?'-':'')+'$'+Math.abs(Math.round(n)).toLocaleString();
export const fmtK=n=>{const a=Math.abs(n),sg=n<0?'-':'';return a>=1e6?sg+'$'+(a/1e6).toFixed(a>=1e7?1:2)+'M':a>=1e3?sg+'$'+Math.round(a/1e3)+'K':sg+'$'+Math.round(a)};
export const QUARTER=4;            // days per quarter (startup reports + broker visit)
export const SIZES=[.1,.25,.5,1];   // position sizes as a share of morning cash (1 = max)
export const ROUNDS=['Seed','Series A','Series B','Series C','Series D'];
export const pct=r=>(r>=0?'+':'')+Math.round(r*100)+'%';
