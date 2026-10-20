// Portfolio hands: which hands a day's buys qualify for. Pure; the best one is picked in game.js by current MULT.
// Cards are the day's certificates ({co:{sec,vol,ed}, bought}); `all` is every certificate dealt today.
export function qualifying(bought,all){
  const n=bought.length; if(!n) return [];
  const cnt={}; bought.forEach(c=>cnt[c.co.sec]=(cnt[c.co.sec]||0)+1);
  const v=Object.values(cnt).sort((a,b)=>b-a), ok=[n===1?'single':'spread'];
  if(v[0]>=2) ok.push('pair');
  if(v[0]>=2&&v[1]>=2) ok.push('twopair');
  if(v[0]>=3) ok.push('sweep');
  if(v[0]>=4) ok.push('corner');
  if(v[0]>=3&&v[1]>=2) ok.push('full');
  if(n>=4&&v.length===n) ok.push('index');
  if(n>=3&&bought.every(c=>c.co.vol===3)) ok.push('yolo');
  if(n>=3&&bought.every(c=>c.co.vol===1)) ok.push('safe');
  if(bought.filter(c=>c.co.ed==='penny').length>=3) ok.push('parade');
  if(n>=4&&n===all.length) ok.push('whole');
  return ok;
}
