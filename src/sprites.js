// Pixel-art sprites drawn to 16x16 canvases and cached as data URLs.
/* ===== Pixel sprites ===== */
export const BODY=["....cwwttwwc....","...ccwwttwwcc...","..cccwwttwwccc..","..ccccwttwcccc..","..ccccctttcccc..","..cccccttccccc..","..cccccccccccc.."];
export const FACE=["....ssssssss....","....seessees....","....ssssssss....",".....smmmms.....","......ssss......"];
export const MAPS={
  anchor:["................",".....hhhhhh.....","....hhhhhhhh....","...hhssssssh....",...FACE,...BODY],
  pundit:["..h..h.hh.h..h..","...hhhhhhhhhh...","..hhhhhhhhhhhh..","..hhssssssssh...","....ssssssss....","....seessees....","....ssmmmmss....",".....smmmms.....","......ssss......",...BODY],
  aunt:["......hhhh......",".....hhhhhh.....","....hhhhhhhh....","...hhssssssh....","....ssssssss....","....gegsgegs....","....ssssssss....",".....smmmms.....","......ssss......","....cppppppc....",...BODY.slice(1)],
};
export const PAL={
  anchor:{h:'#5a3a22',s:'#f0c49a',e:'#1a1a1a',m:'#b0413e',w:'#f4efe1',t:'#e8433a',c:'#2e3d6b'},
  pundit:{h:'#d9d9d9',s:'#f2b48a',e:'#1a1a1a',m:'#5a0f0f',w:'#f4efe1',t:'#ffd23f',c:'#5b4a2e'},
  aunt:{h:'#cfcfd6',s:'#f2c9a8',e:'#1a1a1a',g:'#3a3a3a',m:'#c45a7a',w:'#e7d6f2',t:'#e7d6f2',c:'#7b4fa0',p:'#ffffff'},
};
export const spriteCache={};
export function sprite(kind,over){
  const key=kind+JSON.stringify(over||{}); if(spriteCache[key]) return spriteCache[key];
  const pal=Object.assign({},PAL[kind],over||{}), map=MAPS[kind];
  const cv=document.createElement('canvas');cv.width=16;cv.height=16;const g=cv.getContext('2d');
  map.forEach((row,y)=>[...row].forEach((ch,x)=>{if(pal[ch]){g.fillStyle=pal[ch];g.fillRect(x,y,1,1)}}));
  return spriteCache[key]=cv.toDataURL();
}

export const bldgCache={};
export function bldg(l){
  if(bldgCache[l.id]) return bldgCache[l.id];
  const cv=document.createElement('canvas');cv.width=16;cv.height=16;const g=cv.getContext('2d'),c=l.c;
  const H=[[5,7,8,9],[6,7,9,10],[6,8,10,12],[10,12,13,15]][l.di][l.tier], W=[8,10,12,13][l.tier], x0=Math.floor((16-W)/2), y0=15-H;
  g.fillStyle='#0e1838';g.fillRect(0,15,16,1);g.fillRect(x0-1,y0-1,W+2,H+1);
  g.fillStyle=c;g.fillRect(x0,y0,W,H);
  g.fillStyle='#0e1838';g.fillRect(x0,y0,W,1);
  g.fillStyle='#ffd23f';for(let y=y0+2;y<14;y+=2)for(let x=x0+1;x<x0+W-1;x+=2)if((x*7+y*3+l.tier)%5)g.fillRect(x,y,1,1);
  g.fillStyle='#0e1838';g.fillRect(x0+Math.floor(W/2)-1,13,2,2);
  if(l.di===3){g.fillRect(x0+Math.floor(W/2),y0-3,1,3)}
  if(l.name==='Lemonade Stand'){g.fillStyle='#e8433a';for(let x=x0;x<x0+W;x+=2)g.fillRect(x,y0-1,1,1)}
  return bldgCache[l.id]=cv.toDataURL();
}
