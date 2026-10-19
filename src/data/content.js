// All game content and tuning tables: sectors, names, rumors, news, perks, events, upgrades, startups and real estate lots.
// Pure data. Balance changes usually start here; run `npm run sim` after editing.
/* ===== Content ===== */
export const VOL={1:.2,2:.45,3:.9};
export const SECTORS=[{id:'TECH',c:'#7fb8ff'},{id:'MEME',c:'#ff8fc7'},{id:'FOOD',c:'#ffd23f'},{id:'OIL',c:'#c9a27a'},{id:'CRYPTO',c:'#c79bff'},{id:'PETS',c:'#6fdc9c'},{id:'SPACE',c:'#5fe0e8'}];
export const S=id=>SECTORS.find(s=>s.id===id);
export const N1=['Moon','Crab','Turbo','Velvet','Quantum','Soggy','Laser','Granny','Rocket','Pickle','Hyper','Cosmic','Lazy','Mega','Feral','Tofu','Gravy','Disco'];
export const N2=['Llama','Noodle','Dynamics','Biscuit','Holdings','Goat','Pixel','Spoon','Mining','Waffle','Labs','Ferret','Burrito','Robotics','Hamster','Yacht','Socks'];
export const N3=['Inc.','Corp.','Co.','Group','& Sons','Ltd.','Intl.'];
export const BULL=['CEO seen buying a second yacht. For the first yacht.','Leaked memo just says "big if true."','Their mascot went viral for falling down stairs.','A guy at the gym says it is going to the moon.','Quarterly report printed in gold ink.','Signed a deal with a medium-sized country.','Analysts said "synergy" three times in one sentence.','The intern found the missing money.','Grandma bought a share. Grandma is never wrong.','New product: the old product, but louder.'];
export const BEAR=['CFO now answers every email in haiku.','The factory is "temporarily" a trampoline park.','Product recall: the product.','Founder moved onto a boat with no Wi-Fi.','Lawsuit filed by one very angry goose.','Earnings call was 40 minutes of hold music.','The logo was redesigned. Again. Badly.','Short sellers are throwing a party with a DJ.','Office plants have been repossessed.','Board meeting held in a Chuck E. Cheese.'];
export const NEWS={
  TECH:{up:['Chip shortage officially over, says chip','New phone has a fourth camera, for your feelings','Robots now fold laundry, nation weeps with joy'],down:['Cloud outage blamed on an actual cloud','Robots unionize, demand weekends','Nobody can remember any of their passwords']},
  MEME:{up:['Teens with laser-eye avatars "like the stock"','Forum users rename themselves apes again','Dancing frog video hits one billion views'],down:['Experts declare memes "cringe" now','Top influencer deletes account to find himself','Forum moderator finally goes outside']},
  FOOD:{up:['Avocado toast declared a health food again','Nation suddenly discovers soup','Pizza now counts as a vegetable, rules court'],down:['Fourth lettuce recall this month','Cows on strike over barn playlist','Survey says nobody is hungry anymore']},
  OIL:{up:['Everyone suddenly wants to drive somewhere','Pipeline finished, nobody knows where it goes','Road trips back in style, says dad'],down:['Electric scooters now outnumber people','Huge spill reported, on a very expensive carpet','Town replaces cars with a giant slide']},
  CRYPTO:{up:['Senator accidentally buys a coin, says "neat"','New coin pegged to vibes is soaring','Billionaire tweets a single rocket'],down:['Exchange founder last seen in a hot-air balloon','Man forgets password worth $2 billion','Coin rug-pulled by an actual rug company']},
  PETS:{up:['Cats ranked number one coworker in poll','Dog wins local election in a landslide','Hamster influencer signs shoe deal'],down:['Hamster wheel recall sparks panic','Survey: goldfish "kind of overrated"','Parrot leaks company secrets on live TV']},
  SPACE:{up:['Rocket lands upright, everyone claps','Moon real estate opens for preorders','Astronaut finds a quarter on Mars'],down:['Satellite hits a slightly smaller satellite','Astronaut admits space is "mostly empty"','Launch delayed, rocket "not feeling it"']},
};
export const FLUFF=['Local man finds $5 in old coat. Markets unmoved.','Weather: cloudy with a chance of quarterly reports.','Great Aunt Mildred spotted at bingo. Sources say she won.','Anchor Chip Bullock reveals his hair is his own.','Study finds 9 out of 10 dentists own boats.'];
export const IDEA_X=['Uber','Tinder','Netflix','Airbnb','Spotify','LinkedIn','Peloton','DoorDash'];
export const IDEA_Y=['dogs','ghosts','grandmas','left socks','pigeons','lawn gnomes','bad haircuts','soup','haunted houses','your ex'];
export const SU_A=['Snugl','Gnom','Soup','Ghost','Paws','Sock','Vib','Snack','Hoot','Blip','Gobl','Wigl'];
export const SU_B=['ly','ify','r','hub','.io','AI','zy','o'];
export const FOUNDERS=['Brayden','Skylar','Chad','Priya','Dev','Juniper','Tad','Moxie','Lars','Bex','Ozzie','Wren'];
export const PITCH_LINES=['We are basically printing money. Literally, we bought a printer.','This is a billion-dollar idea. I have checked twice.','My mom says this is the best idea she has ever heard.','We have zero competitors because nobody else thought of it.','I quit my job for this. Well, I was fired, but same energy.'];
/* Traits nudge the four visible stats. team/product/market drive survival, hype drives IPO pop. */
export const TRAITS=[
  {t:'Has a working demo',fx:{product:2}},{t:'Already profitable',fx:{market:1},profit:true},{t:'Ex-astronaut',fx:{team:1,hype:1}},{t:'Grandma approved',fx:{hype:1}},
  {t:'Pitch deck is one slide',fx:{product:-2}},{t:'Says "disrupt" every sentence',fx:{hype:2,team:-1}},{t:'Is "between visions"',fx:{team:-2}},{t:'Arrived on a Segway',fx:{hype:1,market:-1}},
  {t:'Founder is a very good dog',fx:'wild'},{t:'Brought snacks',fx:{team:1}},{t:'Has 2 million followers',fx:{hype:2}},{t:'Patent pending (on a spoon)',fx:{product:1,market:-1}}];
export const STATS=['team','product','market','hype'];
export const ACQUIRERS=['a soup conglomerate','a confused billionaire','a much bigger app','a mattress company','a mysterious Swiss firm'];
export const BUSTS=['spent it all on beanbags','pivoted to selling pivots','founder found himself in Bali','got sued by a dog','ran out of runway and snacks'];
export const HOLD_UP=['{N} rumored acquisition target','{N} signs deal with a theme park','Celebrity spotted using {N}','{N} beats earnings, throws pizza party'];
export const HOLD_DOWN=['{N} CEO subpoenaed over "the incident"','{N} app deleted by millions','{N} co-founders feuding on social media','{N} servers powered by one hamster, report says'];
export const HAIRS=['#2b1d12','#d9a441','#a8432f','#1a1a1a','#7a5bd6','#3fbf7f'];
export const HOODIES=['#3a3a3a','#e8433a','#2b6cb0','#6b8e23','#c76fa8'];

export const PERKS=[
 {id:'pigeon',code:'PG',name:'Insider Pigeon',desc:'The first stock each day comes with a verified rumor.',cost:12,c:'#7fb8ff'},
 {id:'diamond',code:'DH',name:'Diamond Hands',desc:'Losses on your buys are capped at -50%.',cost:10,c:'#5fe0e8'},
 {id:'memelord',code:'ML',name:'Meme Lord',desc:'MEME stocks gain double.',cost:8,c:'#ff8fc7'},
 {id:'haven',code:'TH',name:'Tax Haven',desc:'Rent costs 40% less.',cost:14,c:'#6fdc9c'},
 {id:'cat',code:'CC',name:'Compound Cat',desc:'Buy 3 or more stocks in a day: +6% cash at close.',cost:12,c:'#ffd23f'},
 {id:'contra',code:'CN',name:'Contrarian',desc:'Earn $4,000 for every stock you passed that fell.',cost:9,c:'#e8433a'},
 {id:'penny',code:'LP',name:'Lucky Penny',desc:'Your first loss each day breaks even instead.',cost:11,c:'#d9a066'},
 {id:'larry',code:'LL',name:'Leverage Larry',desc:'Buys on margin: your stocks move 1.3x harder, both ways.',cost:10,c:'#c79bff'},
 {id:'doom',code:'DS',name:'Doomscroller',desc:'Certificate rumors are 15% more accurate.',cost:13,c:'#9fb4c7'},
 {id:'pump',code:'PC',name:'Pump Club',desc:'Each winning day in a row adds +15% to all gains.',cost:12,c:'#ffb3a1'},
 {id:'pearls',code:'AP',name:"Aunt's Pearls",desc:'If you go broke, pawn these for $60,000 and keep playing. Breaks after use.',cost:9,c:'#f4efe1'},
 {id:'fortune',code:'FC',name:'Fortune Cookie',desc:'Every certificate has a 1-in-4 chance to be Gold Leaf (+50% gains).',cost:8,c:'#ffe08a'},
 {id:'nephew',code:'AN',name:"Anchor's Nephew",desc:'The news and Rex Shouter are both far more accurate.',cost:14,c:'#a3c4ff'},
 {id:'landlord',code:'SS',name:'Slumlord Sal',desc:'Property income +40%.',cost:15,c:'#9be08a'},
 {id:'flipper',code:'HF',name:'House Flipper',desc:'Sell property for 120% of its value instead of 95%.',cost:10,c:'#ffc46b'},
 {id:'angel',code:'AW',name:'Angel Wings',desc:'Startups you back are much less likely to go bust.',cost:10,c:'#fff0a8'},
];
export const P=id=>PERKS.find(p=>p.id===id);
/* Real estate: 16 lots in 4 districts. Income every night; whole district = monopoly bonus; all 16 = Tycoon. */
export const DISTRICTS=[{id:'old',name:'Old Town',c:'#c9a27a'},{id:'sub',name:'Suburbs',c:'#6fdc9c'},{id:'harbor',name:'Harbor',c:'#5fe0e8'},{id:'sky',name:'Skyline',c:'#c79bff'}];
export const LOTS=[
 ['stand','Lemonade Stand','old',15e3,.08],['bodega','Corner Bodega','old',40e3,.078],['laundro','Laundromat','old',90e3,.076],['diner','24-Hour Diner','old',160e3,.074],
 ['duplex','Duplex','sub',250e3,.072],['culdesac','Cul-de-sac','sub',400e3,.07],['strip','Strip Mall','sub',650e3,.068],['water','Waterpark','sub',1e6,.066],
 ['bait','Bait & Tackle','harbor',1.5e6,.064],['fish','Fish Market','harbor',2.2e6,.063],['marina','Marina','harbor',3.2e6,.062],['light','Lighthouse Hotel','harbor',4.5e6,.061],
 ['office','Office Tower','sky',6.5e6,.06],['casino','Casino','sky',9e6,.06],['stadium','Stadium','sky',13e6,.06],['tower','Mildred Tower','sky',20e6,.06],
].map(([id,name,dist,price,yld],i)=>({id,name,dist,price,yld:yld*2,tier:i%4,di:Math.floor(i/4)}));
export const L=id=>LOTS.find(l=>l.id===id);
export const LVL_VAL=[1,1.35,1.75];  // property value by renovation level
export const LVL_INC=[1,1.5,2.2];   // property income by renovation level
export const EVENTS=[
 {id:'quiet',w:5,name:'Quiet Day',txt:'Nothing unusual on the Street.'},
 {id:'bull',w:1.5,name:'Bull Run',txt:'Every gain today is 1.5x.'},
 {id:'bear',w:1.5,name:'Bear Hug',txt:'Stocks are more likely to fall today.'},
 {id:'aunt',w:1,name:'Aunt Calls',txt:'Great Aunt Mildred mailed you $25,000 "for snacks."'},
 {id:'flare',w:1,name:'Solar Flare',txt:'Signal scrambled. Every rumor and headline is a coin flip.'},
 {id:'meme',w:1,name:'Meme Season',txt:'MEME stocks move three times harder.'},
 {id:'raid',w:1,name:'SEC Raid',txt:'One stock today is a total fraud.'},
 {id:'free',w:.8,name:'Landlord Vacation',txt:'No rent today.'},
 {id:'boom',w:1,name:'Housing Boom',txt:'Property values jump 12% at close.'},
 {id:'termites',w:.8,name:'Termites',txt:'Bugs are chewing on one of your buildings tonight.'},
];
export const UPGRADES=[
 {id:'allowance',name:'Bigger Allowance',desc:'Aunt Mildred gives +$25,000 at the start of each run.',max:5,cost:l=>3*(l+1)},
 {id:'hand',name:'Longer Ticker Tape',desc:'+1 stock to choose from every day.',max:2,cost:l=>8*(l+1)},
 {id:'cable',name:'Premium Cable',desc:'Morning news headlines are 5% more accurate.',max:3,cost:l=>5*(l+1)},
 {id:'accuracy',name:'Better Gossip',desc:'Certificate rumors are 5% more accurate.',max:3,cost:l=>5*(l+1)},
 {id:'discount',name:'Broker Friend',desc:'Perks cost 10% less in the shop.',max:3,cost:l=>4*(l+1)},
 {id:'deed',name:'Old Family Deed',desc:'Start each run owning the Lemonade Stand.',max:1,cost:()=>8},
 {id:'starter',name:'Family Heirloom',desc:'Start each run with a random perk.',max:1,cost:()=>6},
];
