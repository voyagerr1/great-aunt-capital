// Prints the final account report in the desktop suite's style, then shares or downloads it.
export async function shareCertificate(d){
  const W=600,H=400,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
  try{await document.fonts.ready}catch(e){}
  g.fillStyle='#008080';g.fillRect(0,0,W,H);
  g.fillStyle='#c0c0c0';g.fillRect(16,16,W-32,H-32);
  g.strokeStyle='#fff';g.lineWidth=2;g.strokeRect(17,17,W-34,H-34);
  g.fillStyle='#000080';g.fillRect(22,22,W-44,28);
  g.fillStyle='#fff';g.font='bold 14px Tahoma, Arial, sans-serif';g.fillText('Great Aunt Capital — Account report',32,41);
  g.fillStyle='#fff';g.fillRect(30,64,W-60,H-110);
  g.fillStyle='#000080';g.font='bold 32px Georgia, serif';g.fillText(d.title,46,110,W-92);
  g.fillStyle='#505050';g.font='12px Tahoma, Arial, sans-serif';g.fillText('PERSONAL FINANCE SUITE / FINAL STATEMENT',46,135);
  const rows=[['Days lasted',d.days],['Peak net worth',d.peak],['Best hand',d.hand],['Account holder',`${d.aunt} / ${d.mood}`],['Installed perks',d.perks||'None']];
  rows.forEach(([label,value],i)=>{const y=165+i*34;g.fillStyle=i%2?'#f0f0ec':'#fff';g.fillRect(40,y-17,W-80,32);g.fillStyle='#505050';g.font='12px Tahoma, Arial, sans-serif';g.fillText(label,46,y,110);g.fillStyle='#111';g.font='14px Tahoma, Arial, sans-serif';g.fillText(String(value),168,y,W-216)});
  g.fillStyle='#505050';g.font='12px "Courier New", monospace';g.fillText(`Seed: ${d.seed}`,30,H-28,W-60);
  const blob=await new Promise(r=>cv.toBlob(r,'image/png')); if(!blob) return false;
  const file=new File([blob],`great-aunt-${d.seed}.png`,{type:'image/png'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'Great Aunt Capital',text:`I lasted ${d.days} days on seed ${d.seed}.`});return true}catch(e){return false}}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);return true;
}
