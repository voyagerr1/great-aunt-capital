// Closing Bell hooks for perks. Perks without an entry here are passive and checked by id in game.js.
//   card(x, c, p): once per buy that rose, and again on each retrigger (x.retrig is true then).
//   end(x, p):     after every buy has scored, in perk order (left to right).
// x is the scoring context from game.js: x.add(n, who, c) +MULT, x.x(n, who, c) xMULT, x.cash(n, who) $,
// x.run, x.hand (hand id), x.bought (scored cards), x.trends, x.lotsIn(sector). p is the perk slot ({id, ed, st}).
export const PERK_FX={
  memelord:{card:(x,c)=>{if(c.co.sec==='MEME')x.add(3,'Meme Lord',c)}},
  rexfan:{card:(x,c)=>{if(c.rex)x.add(4,"Rex's Biggest Fan",c)}},
  splitter:{card:(x,c)=>{if(c.co.price<10)x.add(1,'Stock Splitter',c)}},
  vertical:{card:(x,c)=>{const n=x.lotsIn(c.co.sec);if(n)x.add(n,'Vertical Integration',c)}},
  hairpiece:{card:(x,c)=>{if(x.run.trends[c.co.sec])x.x(2,"Chip's Hairpiece",c)}},
  scalper:{card:(x,c)=>{if(!x.retrig)x.cash(c.stake*.03,'Order Flow Kickback')}},
  contra:{end:x=>{const n=x.run.hand.filter(c=>!c.bought&&c.r<0).length;if(n)x.add(n,'Contrarian')}},
  larry:{end:x=>x.x(1.5,'Leverage Larry')},
  cat:{end:(x,p)=>{const m=1+.2*(p.st.days||0);if(m>1)x.x(m,'Compound Cat')}},
  pump:{end:x=>{if(x.run.streak)x.add(x.run.streak,'Pump & Dump Club')}},
  ponzi:{end:x=>{if(x.run.sold)x.add(2*x.run.sold,'Ponzi Pete')}},
  mcat:{end:x=>x.x(3,"Mildred's Cat")},
  bag:{end:x=>{if(x.bought.some(c=>c.eff<0))x.add(3,'Bagholder')}},
  clock:{end:x=>{if(x.run.day%2===0)x.x(2,'Broken Clock')}},
  specialist:{end:x=>{if(['sweep','corner','full'].includes(x.hand))x.x(2,'Sector Specialist')}},
  indexer:{end:x=>{if(['index','spread'].includes(x.hand))x.add(4,'Index Hugger')}},
  yolobro:{end:x=>{if(x.bought.length&&x.bought.every(c=>c.co.vol===3))x.x(2,'YOLO Bro')}},
  loyalty:{end:x=>{if((x.run.closes+1)%4===0)x.x(4,'Loyalty Card')}},
  gnome:{end:x=>x.add(1+2*x.run.bossesBeat,'Lawn Gnome')},
  swiper:{end:x=>{if(x.run.bought)x.add(Math.round(x.run.bought*.25*100)/100,'Swipe Right Sally')}},
  mildred:{end:x=>{const m=Math.floor(x.run.day/4);if(m>1)x.x(m,'Mildred Herself')}},
  hedge:{end:x=>{const ls=x.bought.filter(c=>c.loss<0);if(ls.length>=2)x.cash(-ls.reduce((s,c)=>s+c.loss,0)*.3,'Hedge Hog')}},
};
