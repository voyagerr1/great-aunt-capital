// All game content and tuning tables: sectors, names, rumors, news, perks, events, upgrades, startups and real estate lots.
// Pure data. Balance changes usually start here; run `npm run sim` after editing.
/* ===== Content ===== */
export const VOL={1:.2,2:.45,3:.9};
export const SECTORS=[{id:'TECH',c:'#7fb8ff'},{id:'MEME',c:'#ff8fc7'},{id:'FOOD',c:'#ffd23f'},{id:'OIL',c:'#c9a27a'},{id:'CRYPTO',c:'#c79bff'},{id:'PETS',c:'#6fdc9c'},{id:'SPACE',c:'#5fe0e8'}];
export const S=id=>SECTORS.find(s=>s.id===id);
export const N1=['Moon','Crab','Turbo','Velvet','Quantum','Soggy','Laser','Granny','Rocket','Pickle','Hyper','Cosmic','Lazy','Mega','Feral','Tofu','Gravy','Disco','Atomic','Sleepy','Royal','Neon','Spicy','Golden'];
export const N2=['Llama','Noodle','Dynamics','Biscuit','Holdings','Goat','Pixel','Spoon','Mining','Waffle','Labs','Ferret','Burrito','Robotics','Hamster','Yacht','Socks','Toaster','Cactus','Vending','Lobster','Blimp','Mattress'];
export const N3=['Inc.','Corp.','Co.','Group','& Sons','Ltd.','Intl.'];
export const BULL=['CEO seen buying a second yacht. For the first yacht.','Leaked memo just says "big if true."','Their mascot went viral for falling down stairs.','A guy at the gym says it is going to the moon.','Quarterly report printed in gold ink.','Signed a deal with a medium-sized country.','Analysts said "synergy" three times in one sentence.','The intern found the missing money.','Grandma bought a share. Grandma is never wrong.','New product: the old product, but louder.','The CEO finally learned to use spreadsheets.','Factory cat promoted to Head of Morale.','Their app has a dark mode now.','A famous rapper wore their hat backwards.','Competitor accidentally set itself on fire.','Pension funds are "very interested," say pension funds.'];
export const BEAR=['CFO now answers every email in haiku.','The factory is "temporarily" a trampoline park.','Product recall: the product.','Founder moved onto a boat with no Wi-Fi.','Lawsuit filed by one very angry goose.','Earnings call was 40 minutes of hold music.','The logo was redesigned. Again. Badly.','Short sellers are throwing a party with a DJ.','Office plants have been repossessed.','Board meeting held in a Chuck E. Cheese.','Annual report is just a drawing of a sad face.','Their warehouse is mostly raccoons now.','CEO replaced by his own cardboard cutout.','The website has said "under construction" since 2009.','Accountant last seen running into the woods.','Main product now legally classified as a hazard.'];
export const NEWS={
  TECH:{up:['Chip shortage officially over, says chip','New phone has a fourth camera, for your feelings','Robots now fold laundry, nation weeps with joy','Startup invents a mouse that clicks itself','Every fridge now has Wi-Fi, for some reason'],down:['Cloud outage blamed on an actual cloud','Robots unionize, demand weekends','Nobody can remember any of their passwords','Major app update moves every button','Smart toaster botnet holds bread hostage']},
  MEME:{up:['Teens with laser-eye avatars "like the stock"','Forum users rename themselves apes again','Dancing frog video hits one billion views','Stock picked by a goldfish beats the market','Influencer names baby after a ticker symbol'],down:['Experts declare memes "cringe" now','Top influencer deletes account to find himself','Forum moderator finally goes outside','Teens move on to collecting rocks','Laser-eye filter declared out of fashion']},
  FOOD:{up:['Avocado toast declared a health food again','Nation suddenly discovers soup','Pizza now counts as a vegetable, rules court','Grocery chain reports record snack sales','Chefs declare butter a lifestyle'],down:['Fourth lettuce recall this month','Cows on strike over barn playlist','Survey says nobody is hungry anymore','Pickle shortage blamed on pickle hoarders','Restaurant critic eats nothing all month']},
  OIL:{up:['Everyone suddenly wants to drive somewhere','Pipeline finished, nobody knows where it goes','Road trips back in style, says dad','Nation rediscovers the joy of leaf blowers','Drivers refuse to carpool, cite vibes'],down:['Electric scooters now outnumber people','Huge spill reported, on a very expensive carpet','Town replaces cars with a giant slide','Cars now run on good intentions','Oil tanker parked in the wrong ocean']},
  CRYPTO:{up:['Senator accidentally buys a coin, says "neat"','New coin pegged to vibes is soaring','Billionaire tweets a single rocket','Coffee shop accepts coins, sells one coffee','Cartoon monkey picture sells for a yacht'],down:['Exchange founder last seen in a hot-air balloon','Man forgets password worth $2 billion','Coin rug-pulled by an actual rug company','Coin code was copied from a cookbook','Wallet app logs everyone out forever']},
  PETS:{up:['Cats ranked number one coworker in poll','Dog wins local election in a landslide','Hamster influencer signs shoe deal','Dog spa chain opens on every corner','Cat cafe IPO oversubscribed by cats'],down:['Hamster wheel recall sparks panic','Survey: goldfish "kind of overrated"','Parrot leaks company secrets on live TV','Kibble prices soar, dogs furious','Pet psychic exposed as regular psychic']},
  SPACE:{up:['Rocket lands upright, everyone claps','Moon real estate opens for preorders','Astronaut finds a quarter on Mars','Billionaire\'s rocket briefly reaches the sky','Space hotel books first guest, a dog'],down:['Satellite hits a slightly smaller satellite','Astronaut admits space is "mostly empty"','Launch delayed, rocket "not feeling it"','Mars rover found parked in Nevada','Rocket fuel accidentally drunk by intern']},
};
export const FLUFF=['Local man finds $5 in old coat. Markets unmoved.','Weather: cloudy with a chance of quarterly reports.','Great Aunt Mildred spotted at bingo. Sources say she won.','Anchor Chip Bullock reveals his hair is his own.','Study finds 9 out of 10 dentists own boats.','Traffic report: one goose, very confident, on Route 9.','Mildred asks viewers to stop calling about her casserole.','Rex Shouter fined for shouting in a library.','Weatherman predicts weather. More at eleven.','Town council votes to rename Tuesday.'];
export const IDEA_X=['Uber','Tinder','Netflix','Airbnb','Spotify','LinkedIn','Peloton','DoorDash','Zillow','Duolingo','Fitbit','Yelp'];
export const IDEA_Y=['dogs','ghosts','grandmas','left socks','pigeons','lawn gnomes','bad haircuts','soup','haunted houses','your ex','raccoons','retired wizards','sourdough starters','toddlers','lost keys','garden snails'];
export const SU_A=['Snugl','Gnom','Soup','Ghost','Paws','Sock','Vib','Snack','Hoot','Blip','Gobl','Wigl','Crumb','Zoop','Flump','Nugg'];
export const SU_B=['ly','ify','r','hub','.io','AI','zy','o'];
export const FOUNDERS=['Brayden','Skylar','Chad','Priya','Dev','Juniper','Tad','Moxie','Lars','Bex','Ozzie','Wren','Gunnar','Tamsin','Rocco','Fern','Dmitri','Kiki'];
export const PITCH_LINES=['We are basically printing money. Literally, we bought a printer.','This is a billion-dollar idea. I have checked twice.','My mom says this is the best idea she has ever heard.','We have zero competitors because nobody else thought of it.','I quit my job for this. Well, I was fired, but same energy.','We grew 400% last month. From one user to five.','Investors are lining up. That line is my family.','I can\'t tell you how it works. That is how good it is.','Think of it as a rocket ship. A small one. On a budget.'];
/* Traits nudge the four visible stats. team/product/market drive survival, hype drives IPO pop. */
export const TRAITS=[
  {t:'Has a working demo',fx:{product:2}},{t:'Already profitable',fx:{market:1},profit:true},{t:'Ex-astronaut',fx:{team:1,hype:1}},{t:'Grandma approved',fx:{hype:1}},
  {t:'Pitch deck is one slide',fx:{product:-2}},{t:'Says "disrupt" every sentence',fx:{hype:2,team:-1}},{t:'Is "between visions"',fx:{team:-2}},{t:'Arrived on a Segway',fx:{hype:1,market:-1}},
  {t:'Founder is a very good dog',fx:'wild'},{t:'Brought snacks',fx:{team:1}},{t:'Has 2 million followers',fx:{hype:2}},{t:'Patent pending (on a spoon)',fx:{product:1,market:-1}},
  {t:'Two Nobel winners on staff',fx:{team:2,hype:-1}},{t:'Huge waitlist',fx:{market:2}},{t:'Office is a van',fx:{team:-1,hype:1}},{t:'Ex-Big Tech VP',fx:{team:1,product:1}},
  {t:'Burned through 3 CFOs',fx:{team:-2,hype:1}},{t:'Viral video',fx:{hype:2,product:-1}},{t:'Government contract',fx:{market:2,hype:-1}},{t:'Ships every Friday',fx:{product:1}}];
export const STATS=['team','product','market','hype'];
export const ACQUIRERS=['a soup conglomerate','a confused billionaire','a much bigger app','a mattress company','a mysterious Swiss firm','a bank that used to be a gym','its biggest competitor','a minor royal family','a cereal mascot'];
export const BUSTS=['spent it all on beanbags','pivoted to selling pivots','founder found himself in Bali','got sued by a dog','ran out of runway and snacks','spent it all on a Super Bowl ad','lost the servers in a divorce','was a pyramid scheme, technically a triangle','forgot to charge customers'];
export const HOLD_UP=['{N} rumored acquisition target','{N} signs deal with a theme park','Celebrity spotted using {N}','{N} beats earnings, throws pizza party','{N} added to a famous index','{N} CEO named Person of the Week'];
export const HOLD_DOWN=['{N} CEO subpoenaed over "the incident"','{N} app deleted by millions','{N} co-founders feuding on social media','{N} servers powered by one hamster, report says','{N} misses earnings by a lot','{N} customers asking for refunds, loudly'];
export const HAIRS=['#2b1d12','#d9a441','#a8432f','#1a1a1a','#7a5bd6','#3fbf7f'];
export const REX_BUY=['BUY BUY BUY {T}!','{T} TO THE MOON!','MORTGAGE THE CAT. BUY {T}!','{T} IS A ROCKET SHIP!','BACK UP THE TRUCK FOR {T}!'];
export const REX_SELL=['{T}? DUMP IT!','{T} IS A DUMPSTER FIRE!','SELL {T} YESTERDAY!','RUN FROM {T}! RUN!','{T}? NOT WITH YOUR MONEY!'];
export const PIVOT_TO=['crypto','AI','a podcast','frozen yogurt','a zoo','pet insurance','a dating app for chefs','luxury socks'];
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
 {id:'daytrader',code:'DT',name:'Day Trader',desc:'+1 stock certificate every day.',cost:11,c:'#ffd9a8'},
 {id:'hedge',code:'HG',name:'Hedge Hog',desc:'Lose on 2 or more buys in a day: get 30% of those losses back.',cost:10,c:'#b8e0d2'},
 {id:'manager',code:'PM',name:'Property Manager',desc:'Renovations cost 30% less. Termites stay away.',cost:9,c:'#c9a27a'},
 {id:'seed',code:'SF',name:'Seed Fund',desc:'Founders pitch far more often, and ask for 20% less.',cost:9,c:'#ffef9e'},
 {id:'zoning',code:'ZB',name:'Zoning Board',desc:'Owning a whole district pays 2x instead of 1.5x.',cost:12,c:'#8fd6a8'},
 {id:'whisper',code:'TW',name:'Ticker Whisperer',desc:'Headlines about your listed shares are always true, and they rise more often.',cost:11,c:'#ffe066'},
 {id:'scalper',code:'SC',name:'Scalper',desc:'Get 3% of every buy back as a broker rebate.',cost:9,c:'#e0b3ff'},
 {id:'rexfan',code:'RF',name:"Rex's Biggest Fan",desc:"Rex Shouter's hot pick moves twice as hard.",cost:8,c:'#ff9b8f'},
 {id:'umbrella',code:'UP',name:'Umbrella Policy',desc:'No rent on quarter-end days.',cost:12,c:'#a8c8ff'},
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
/* Daily events. Effects live in fx so a new event needs no new logic:
   gain (gains x), pUp (rise chance +/-), gift ($), flare (hints are coin flips), sec ({SECTOR: move x}),
   trend ({SECTOR: 1|-1}, forced and reported truthfully), move (all moves x), fraud (fake stocks),
   rent (rent x), house (housing index +/-), termites (damage x), dist ({district: income x}),
   dividend (listed shares pay this share of value), cap (max buy as share of morning cash), tax (share of cash lost). */
export const EVENTS=[
 {id:'quiet',w:5,name:'Quiet Day',txt:'Nothing unusual on the Street.'},
 {id:'bull',w:1.5,name:'Bull Run',txt:'Every gain today is 1.5x.',fx:{gain:1.5}},
 {id:'bear',w:1.5,name:'Bear Hug',txt:'Stocks are more likely to fall today.',fx:{pUp:-.17}},
 {id:'aunt',w:1,name:'Aunt Calls',txt:'Great Aunt Mildred mailed you $25,000 "for snacks."',fx:{gift:25000}},
 {id:'flare',w:1,name:'Solar Flare',txt:'Signal scrambled. Every rumor and headline is a coin flip.',fx:{flare:true}},
 {id:'meme',w:1,name:'Meme Season',txt:'MEME stocks move three times harder.',fx:{sec:{MEME:3}}},
 {id:'raid',w:1,name:'SEC Raid',txt:'One stock today is a total fraud.',fx:{fraud:1}},
 {id:'free',w:.8,name:'Landlord Vacation',txt:'No rent today.',fx:{rent:0}},
 {id:'boom',w:1,name:'Housing Boom',txt:'Property values jump 12% at close.',fx:{house:.12}},
 {id:'termites',w:.8,name:'Termites',txt:'Bugs are chewing on one of your buildings tonight.',fx:{termites:.8}},
 {id:'heat',w:.7,name:'Heat Wave',txt:'Everyone wants ice cream. FOOD stocks are running hot.',fx:{trend:{FOOD:1}}},
 {id:'winter',w:.7,name:'Crypto Winter',txt:'Coins are freezing over. CRYPTO is sliding.',fx:{trend:{CRYPTO:-1}}},
 {id:'launch',w:.7,name:'Launch Day',txt:'Big rocket on the pad. SPACE is climbing.',fx:{trend:{SPACE:1}}},
 {id:'recall',w:.6,name:'Kibble Recall',txt:'Bad batch of dog food. PETS are falling.',fx:{trend:{PETS:-1}}},
 {id:'crash',w:.7,name:'Flash Crash',txt:'The trading computers panicked. Every stock moves twice as hard.',fx:{move:2}},
 {id:'hike',w:.7,name:'Rate Hike',txt:'Mortgages got pricey. Property values drop 8% at close.',fx:{house:-.08}},
 {id:'tourist',w:.7,name:'Tourist Season',txt:'Boats everywhere. Harbor lots pay double tonight.',fx:{dist:{harbor:2}}},
 {id:'party',w:.7,name:'Block Party',txt:'Bouncy castles on every lawn. Suburbs lots pay double tonight.',fx:{dist:{sub:2}}},
 {id:'blackout',w:.5,name:'Blackout',txt:'Skyline lost power. Its lots pay nothing tonight.',fx:{dist:{sky:0}}},
 {id:'dividend',w:.7,name:'Dividend Day',txt:'Your listed shares pay 8% of their value in cash.',fx:{dividend:.08}},
 {id:'margin',w:.8,name:'Margin Call',txt:'Your broker is nervous. No single buy can use more than 25% of morning cash.',fx:{cap:.25}},
 {id:'reunion',w:.6,name:'Family Reunion',txt:'The cousins need a loan. They borrow 5% of your cash, forever.',fx:{tax:.05}},
 {id:'rentup',w:.6,name:'Rent Hike',txt:'Your landlord bought a boat. Rent is 50% higher tonight.',fx:{rent:1.5}},
];
/* Certificate editions. w = chance per card; move/gain multiply the day's move; pUp nudges the rise chance;
   depth scales how big an order the stock absorbs; div pays a share of the stake at close no matter what. */
export const EDITIONS={
 gold:{name:'GOLD LEAF',w:.07,gain:1.5,txt:'+50% gains.'},
 volatile:{name:'VOLATILE',w:.05,move:2,txt:'Moves twice as hard either way.'},
 unlisted:{name:'UNLISTED',w:.05,move:2,noRumor:true,depth:.5,txt:'Nobody knows anything. Moves twice as hard either way.'},
 blue:{name:'BLUE CHIP',w:.06,move:.5,pUp:.1,depth:3,txt:'Half the moves, rises more often.'},
 penny:{name:'PENNY STOCK',w:.05,move:1.6,price:[.2,3],depth:.4,txt:'Cheap, wild and thin.'},
 dividend:{name:'DIVIDEND',w:.05,div:.04,txt:'Pays 4% of your stake at close, up or down.'},
};
/* Market depth by risk. A buy's gains are cut by depth/(depth+stake): big orders move the price against you. */
export const DEPTH={1:2e6,2:9e5,3:4e5};
export const UPGRADES=[
 {id:'allowance',name:'Bigger Allowance',desc:'Aunt Mildred gives +$25,000 at the start of each run.',max:5,cost:l=>3*(l+1)},
 {id:'hand',name:'Longer Ticker Tape',desc:'+1 stock to choose from every day.',max:2,cost:l=>8*(l+1)},
 {id:'cable',name:'Premium Cable',desc:'Morning news headlines are 5% more accurate.',max:3,cost:l=>5*(l+1)},
 {id:'accuracy',name:'Better Gossip',desc:'Certificate rumors are 5% more accurate.',max:3,cost:l=>5*(l+1)},
 {id:'discount',name:'Broker Friend',desc:'Perks cost 10% less in the shop.',max:3,cost:l=>4*(l+1)},
 {id:'deed',name:'Old Family Deed',desc:'Start each run owning the Lemonade Stand.',max:1,cost:()=>8},
 {id:'starter',name:'Family Heirloom',desc:'Start each run with a random perk.',max:1,cost:()=>6},
 {id:'rentctl',name:'Rent Control',desc:'Rent is 5% lower.',max:3,cost:l=>6*(l+1)},
 {id:'rolodex',name:'Rolodex',desc:'Founders pitch 15% more often.',max:2,cost:l=>4*(l+1)},
];
