// Draws a run's final stock certificate to a canvas and shares it (or downloads it as a PNG).
export async function shareCertificate(d){
  const W=600,H=400,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
  try{await document.fonts.ready}catch(e){}
  const ink='#0e1838';
  g.fillStyle='#f4efe1';g.fillRect(0,0,W,H);
  g.strokeStyle=ink;g.lineWidth=8;g.strokeRect(8,8,W-16,H-16);g.lineWidth=2;g.strokeRect(22,22,W-44,H-44);g.strokeRect(28,28,W-56,H-56);
  g.fillStyle=ink;g.textAlign='center';
  g.font='bold 14px Silkscreen, monospace';g.fillText('GREAT AUNT CAPITAL · CERTIFICATE OF RUIN',W/2,60);
  g.font='bold 40px Silkscreen, monospace';g.fillText(d.title,W/2,112);
  g.font='28px VT323, monospace';
  g.fillText(`Lasted ${d.days} days · Peak net worth ${d.peak}`,W/2,160);
  g.fillText(`Best hand: ${d.hand}`,W/2,196);
  g.fillText(`${d.aunt} · Mood: ${d.mood}`,W/2,232);
  if(d.perks) g.fillText(`Perks: ${d.perks}`,W/2,268);
  g.font='bold 16px Silkscreen, monospace';g.fillText(`SEED ${d.seed}`,W/2,318);
  g.beginPath();g.arc(W-90,H-86,40,0,Math.PI*2);g.fillStyle='#e8433a';g.fill();
  g.fillStyle='#f4efe1';g.font='bold 12px Silkscreen, monospace';g.fillText('GAC-TV',W-90,H-82);
  const blob=await new Promise(r=>cv.toBlob(r,'image/png')); if(!blob) return false;
  const file=new File([blob],`great-aunt-${d.seed}.png`,{type:'image/png'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'Great Aunt Capital',text:`I lasted ${d.days} days on seed ${d.seed}.`});return true}catch(e){return false}}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);return true;
}
