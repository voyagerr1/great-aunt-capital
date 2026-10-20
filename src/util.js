// Small shared helpers: seeded randomness, clamping, money formatting, game constants.
/* ===== Seeded RNG ===== */
// Runs are seeded (mulberry32) so a seed replays the same market. Unseeded falls back to Math.random.
let rs=null;
export function seedRng(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}rs=h>>>0}
export function unseed(){rs=null}
function mulberry(){rs=(rs+0x6D2B79F5)>>>0;let t=rs;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}
export const R=()=>rs===null?Math.random():mulberry();
const SEED_WORDS=['GOOSE','PICKLE','LLAMA','GRAVY','SOUP','BINGO','YACHT','WAFFLE','TOAST','NOODLE','GNOME','BISCUIT','HAMSTER','BLIMP'];
export const makeSeed=()=>SEED_WORDS[Math.floor(Math.random()*SEED_WORDS.length)]+'-'+String(Math.floor(Math.random()*1e4)).padStart(4,'0');
export const pick=a=>a[Math.floor(R()*a.length)];
export const rr=(a,b)=>a+R()*(b-a);
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};

/* ===== Numbers ===== */
// Money gets big in endless runs: K, M, B ... Dc, then e-notation, then a joke.
const SUF=['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc'];
export function big(a){
  if(!isFinite(a)) return 'naneinf';
  if(a>=1e100) return 'MORE MONEY THAN MONEY';
  const e=Math.floor(Math.log10(a)/3);
  if(e<SUF.length){const v=a/10**(3*e);return v.toFixed(v<10?2:v<100?1:0)+SUF[e]}
  const p=Math.floor(Math.log10(a));return (a/10**p).toFixed(2)+'e'+p;
}
export const fmt=n=>{const a=Math.abs(n),sg=n<0?'-':'';if(!isFinite(a))return 'naneinf';return a<1e12?sg+'$'+Math.round(a).toLocaleString('en-US'):sg+'$'+big(a)};
export const fmtK=n=>{const a=Math.abs(n),sg=n<0?'-':'';if(!isFinite(a))return 'naneinf';return a<1e3?sg+'$'+Math.round(a):a<1e6?sg+'$'+Math.round(a/1e3)+'K':sg+'$'+big(a)};
export const fmtM=m=>!isFinite(m)?'naneinf':m<100?String(Math.round(m*10)/10):m<1e4?String(Math.round(m)):big(m);   // MULT display
export const QUARTER=4;            // days per quarter; the last day is a Boss Landlord, then the Broker
export const SIZES=[.1,.25,.5,1];   // position sizes as a share of morning cash (1 = max)
export const pct=r=>(r>=0?'+':'')+Math.round(r*100)+'%';
