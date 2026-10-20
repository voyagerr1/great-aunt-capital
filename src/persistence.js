// One atomic localStorage entry holds progression and the last playable checkpoint.
// JSON duplicates company objects; reconnect hand certificates to their deck owners on load.
export const SAVE_KEY='greataunt.meta.v1';
export const RUN_VERSION=12;
const SCENES=new Set(['news','play','resolve','shop','town','tycoon','richest','ascend']);
const ORIGINS=new Set(['news','play','resolve','shop']);
export function checkpoint(run,scene,shop,rng){
  if(!run||run.dead||!SCENES.has(scene))return null;
  return {version:1,run,scene,shop,rng};
}
export function readCheckpoint(saved){
  try{
    const c=structuredClone(saved),r=c?.run;
    const origin=c?.scene==='town'?r?.back:c?.scene==='tycoon'?r?.tycoonBack:c?.scene;
    if(c?.version!==1||r?.v!==RUN_VERSION||r.dead||!SCENES.has(c.scene)||
      !Number.isInteger(c.rng)||c.rng<0||c.rng>0xffffffff||
      !Number.isInteger(r.day)||r.day<1||!Number.isFinite(r.cash)||
      typeof r.seed!=='string'||typeof r.aunt!=='string'||!Number.isInteger(r.mood)||r.mood<0||r.mood>4||
      !Array.isArray(r.deck)||!Array.isArray(r.hand)||!Array.isArray(r.perks)||
      !Array.isArray(r.cons)||!Array.isArray(r.lots)||r.lots.length!==16||!Array.isArray(r.town)||r.town.length!==4||
      !Array.isArray(r.news)||!Array.isArray(r.rex)||!Array.isArray(r.sectors)||
      !r.hands||!r.props||!r.soldLots||!r.trends||!r.fx||typeof r.event?.txt!=='string'||typeof r.boss?.name!=='string'||
      !Number.isInteger(r.idx)||r.idx<0||r.idx>r.hand.length||
      !Number.isInteger(r.resolvedDay)||r.resolvedDay<0||r.resolvedDay>r.day||
      (c.scene==='play'&&r.idx>=r.hand.length)||
      (['resolve','shop','richest','ascend'].includes(origin)&&(!r.result||r.resolvedDay!==r.day))||
      (c.scene==='town'&&!ORIGINS.has(r.back))||
      (c.scene==='tycoon'&&(!r.tycoon||!ORIGINS.has(r.tycoonBack)))||
      (origin==='shop'&&!Array.isArray(c.shop)))return null;
    const validCompany=co=>co&&Number.isInteger(co.id)&&typeof co.tick==='string'&&
      typeof co.name==='string'&&r.sectors.includes(co.sec)&&[1,2,3].includes(co.vol)&&
      Number.isFinite(co.price)&&co.price>0&&Array.isArray(co.hist)&&co.hist.length>0&&co.hist.every(Number.isFinite);
    if(!r.deck.every(validCompany)||!r.hand.every(card=>validCompany(card.co))||
      r.perks.some(p=>typeof p?.id!=='string'||!p.st)||
      r.result&&(!Array.isArray(r.result.steps)||!Array.isArray(r.result.notes)||!Array.isArray(r.result.fire)))return null;
    const companies=new Map(r.deck.map(co=>[co.id,co]));
    for(const card of r.hand){if(!card.co||!Number.isInteger(card.co.id))return null;card.co=companies.get(card.co.id)||card.co}
    r.modal=null;
    return c;
  }catch{return null}
}
