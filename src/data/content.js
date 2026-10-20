// All game content and tuning tables: sectors, names, news, perks, hands, consumables, bosses, arcs, districts, events, aunts and upgrades.
// Pure data. Balance changes usually start here; run `npm run sim` after editing.
/* ===== Content ===== */
export const VOL={1:.08,2:.17,3:.34};
// hidden sectors only join the market through a story arc (see ARCS)
export const SECTORS=[{id:'TECH',c:'#7fb8ff'},{id:'MEME',c:'#ff8fc7'},{id:'FOOD',c:'#ffd23f'},{id:'OIL',c:'#c9a27a'},{id:'CRYPTO',c:'#c79bff'},{id:'PETS',c:'#6fdc9c'},{id:'SPACE',c:'#5fe0e8'},
  {id:'ALIEN',c:'#9dff6b',hidden:true},{id:'BEES',c:'#ffb000',hidden:true}];
export const S=id=>SECTORS.find(s=>s.id===id);
export const N1=['Moon','Crab','Turbo','Velvet','Quantum','Soggy','Laser','Granny','Rocket','Pickle','Hyper','Cosmic','Offshore','Mega','Feral','Synergy','Gravy','Disco','Atomic','Bailout','Royal','Neon','Shady','Golden'];
export const N2=['Llama','Noodle','Dynamics','Biscuit','Holdings','Goat','Pixel','Spoon','Mining','Waffle','Labs','Ferret','Burrito','Robotics','Hamster','Yacht','Socks','Toaster','Cactus','Vending','Lobster','Ventures','Mattress'];
export const N3=['Inc.','Corp.','Co.','Group','& Sons','Ltd.','(Cayman)'];
export const BULL=['CEO bought a second yacht to store the first yacht.','Leaked memo just says "big if true."','Announced 4,000 layoffs. Stock up. Champagne in the boardroom.','A guy at the gym says it is going to the moon.','Board approved a $9B buyback instead of fixing the roof.','Signed a deal with a medium-sized dictatorship.','Analysts said "synergy" three times in one sentence.','The intern found the missing money. Intern is now CFO.','A senator\'s spouse bought calls yesterday. Totally unrelated.','New product: the old product, but a subscription.','Added "AI" to the company name. Nothing else changed.','Fined $40M for fraud. Made $900M doing it.','The regulator\'s golf buddy says "looks fine to me."','A famous rapper wore their hat backwards.','Competitor accidentally set itself on fire.','Pension funds are "very interested," say pension funds.','Got a bailout for being too big to be this bad.','Renamed the sweatshop a "growth campus."'];
export const BEAR=['CFO now answers every email in haiku.','The factory is "temporarily" a trampoline park.','Product recall: the product.','Founder moved to a country with no extradition treaty.','Lawsuit filed by one very angry goose.','Earnings call was 40 minutes of hold music.','Auditors arrived. Shredders heard from the parking lot.','Short sellers are throwing a party with a DJ.','Office plants have been repossessed.','Board meeting held in a Chuck E. Cheese.','Annual report is just a drawing of a sad face.','Their warehouse is mostly raccoons now.','CEO replaced by his own cardboard cutout. Nobody noticed.','"Revenue" was the CEO paying himself in gift cards.','Accountant last seen running into the woods with two duffel bags.','Main product now legally classified as a hazard.','Whistleblower "relocated to a nice farm upstate."','ESG report printed on a burning rainforest.'];
export const NEWS={
  TECH:{up:['Startup with zero revenue now worth $40 billion','App adds an AI button that does nothing. Users love it','Tech CEO tells Congress "I don\'t recall" 212 times','Every fridge now sells your data, for some reason','Company "pivots to AI," fires 9,000 humans, soars'],down:['Cloud outage blamed on an actual cloud','Robots unionize, demand weekends','Data breach leaks 900M passwords, all "password1"','Major app update moves every button','Smart toaster botnet holds bread hostage']},
  MEME:{up:['Teens with laser-eye avatars "like the stock"','Forum apes squeeze a hedge fund into a fine paste','Man who lost his house on options says "this time for real"','Stock picked by a goldfish beats every fund manager','Influencer names baby after a ticker symbol'],down:['Broker turns off the buy button "for your safety"','Top influencer sold at the top, posts crying apology','Forum moderator finally goes outside','Teens move on to collecting rocks','Hedge funds short 140% of the float, "no big deal"']},
  FOOD:{up:['Avocado toast declared a health food again','Chip bags shrink, prices don\'t, record margins','Lobbyist-written bill rules pizza a vegetable','Grocers blame "inflation," post best year ever','Chefs declare butter a lifestyle'],down:['Fourth lettuce recall this month','Cows on strike over barn playlist','"Natural flavor" revealed to be mostly lawsuit','Pickle shortage blamed on pickle hoarders','Restaurant critic eats nothing all month']},
  OIL:{up:['Oil giant posts record profit, asks for subsidy','Pipeline finished, nobody knows where it goes','Big Oil ad shows a deer hugging a barrel','Nation rediscovers the joy of leaf blowers','Lobbyists successfully ban the bicycle'],down:['Electric scooters now outnumber people','Huge spill reported, on a very expensive carpet','Oil CEO says "climate" without air quotes','Cars now run on good intentions','Oil tanker parked in the wrong ocean']},
  CRYPTO:{up:['Senator accidentally buys a coin, says "neat"','New coin pegged to vibes is soaring','Billionaire posts one rocket emoji, $4B appears','Coffee shop accepts coins, sells one coffee','Cartoon monkey picture sells for a yacht'],down:['Exchange founder flees in hot-air balloon with your deposits','Man forgets password worth $2 billion','Coin rug-pulled by an actual rug company','"Proof of reserves" was a JPEG of money','Exchange risk department was the CEO\'s roommate']},
  PETS:{up:['Cats ranked number one coworker in poll','Dog wins local election, promises fewer baths','Hamster influencer signs shoe deal','Dog spa chain opens on every corner','Cat cafe IPO oversubscribed by cats'],down:['Hamster wheel recall sparks panic','Survey: goldfish "kind of overrated"','Parrot testifies against CEO, repeats everything','Kibble prices soar, dogs furious','Pet psychic charged with insider trading']},
  SPACE:{up:['Rocket lands upright, everyone claps','Moon real estate opens for preorders','Billionaire\'s rocket briefly as high as his ego','Man in a cape wins $8B government contract','Space hotel books first guest, a dog'],down:['Satellite hits a slightly smaller satellite','Astronaut admits space is "mostly empty"','Launch delayed, rocket "not feeling it"','Mars rover found parked in Nevada','Rocket fuel accidentally drunk by intern']},
  ALIEN:{up:['Aliens declare Earth "a fun little place"','Flying saucer spotted buying lottery tickets','Alien ambassador loves our soup, wants more','Probe returns, gives five stars','Martian influencer joins every app'],down:['Aliens say Earth is "a bit much"','Mothership double-parked, gets a ticket','Aliens read our tax code, leave immediately','Abduction refunds pile up','Spaceship recalled over a squeaky door']},
  BEES:{up:['Bees vote to work weekends','Honey declared legal tender in two towns','Queen bee signs record deal','Bee union wins dental plan, morale soars','Flowers report a great year'],down:['Bees on strike, demand bigger flowers','Honey shortage blamed on a bear','Hive caught cooking the books','Wasps launch hostile takeover','Bee CEO stung by scandal']},
};
export const FLUFF=['Local man finds $5 in old coat. IRS already knew.','Weather: cloudy with a chance of quarterly reports.','Bingo hall holds a moment of silence for your great aunt. She counted cards.','Anchor Chip Bullock reveals his hair is a registered subsidiary.','Study finds 9 out of 10 dentists own boats.','Traffic report: one goose, very confident, on Route 9.','Congress passes bill banning insider trading. For you.','Rex Shouter fined for shouting in a library.','Billionaire tax rate now lower than the paperboy\'s.','Town council renames Tuesday after a sponsor.','SEC enforcement team still on lunch break from 2008.','Central bank says "transitory" again. Nation blinks.','CEO pay hits 4,000x the janitor. Janitor offered a pizza party.','Local bank renamed "Too Big To Fail & Sons."','Lobbyist wins Citizen of the Year. Bought the trophy.'];
export const REX_BUY=['BUY BUY BUY {T}!','{T} TO THE MOON!','MORTGAGE THE CAT. BUY {T}!','{T} IS A ROCKET SHIP!','BACK UP THE TRUCK FOR {T}!','MY BROTHER-IN-LAW WORKS AT {T}! BUY!','I OWN {T}! NOW YOU BUY {T}! THEN I SELL!'];
export const REX_SELL=['{T}? DUMP IT!','{T} IS A DUMPSTER FIRE!','SELL {T} YESTERDAY!','RUN FROM {T}! RUN!','{T}? NOT WITH YOUR MONEY!','I AM SHORTING {T} ON LIVE TV! LEGALLY!','{T} IS A SCAM AND I WOULD KNOW!'];

export const REX_REACT={
  great:['UNBELIEVABLE! I TAUGHT YOU THAT!','THE MONEY PRINTER GOES BRRR!','SOMEBODY CALL MY MOTHER!','THAT IS A ROCKET SHIP, BABY!','WHO TIPPED YOU OFF? DON\'T TELL ME! WINK!'],
  good:['NOT BAD! NOT REX, BUT NOT BAD!','SOLID! SOLID LIKE A ROCK!','I CALLED IT! I THINK!','STEADY GAINS! LIKE A CONGRESSMAN!'],
  bad:['MY GRANDMA TRADES BETTER!','WHO TAUGHT YOU TO TRADE? NOT ME!','YIKES. BIG YIKES.','YOU ARE THE EXIT LIQUIDITY!'],
  awful:['THAT IS A DUMPSTER FIRE!','YOUR AUNT IS SPINNING IN HER GRAVE!','I HAVE TO LIE DOWN.','YOU GOT RUG-PULLED BY A RUG!'],
};

/* ===== Perks =====
   r = rarity: c common, u uncommon, r rare, l legendary (only from Brown Envelopes).
   Perks with scoring hooks live in src/engine/perks.js; the rest are checked by id where they apply.
   Order matters at the Closing Bell: perks trigger left to right. */
export const PERKS=[
 {id:'pigeon',code:'PG',r:'c',name:'Insider Pigeon',desc:'Lives on the boardroom window ledge. The first stock each day comes with a verified rumor.',cost:10,c:'#7fb8ff'},
 {id:'diamond',code:'DH',r:'c',name:'Diamond Hands',desc:'Losses on your buys are capped at -50%.',cost:10,c:'#5fe0e8'},
 {id:'memelord',code:'ML',r:'u',name:'Meme Lord',desc:'+3 MULT for each MEME stock you buy.',cost:11,c:'#ff8fc7'},
 {id:'haven',code:'TH',r:'u',name:'Tax Haven',desc:'Your mailbox is a palm tree in the Caymans. Rent costs 40% less.',cost:14,c:'#6fdc9c'},
 {id:'cat',code:'CC',r:'r',name:'Compound Cat',desc:'x0.2 more MULT every day you own it. Selling a property resets it.',cost:15,c:'#ffd23f'},
 {id:'contra',code:'CN',r:'c',name:'Contrarian',desc:'+1 MULT for each stock you passed that fell.',cost:9,c:'#e8433a'},
 {id:'penny',code:'LP',r:'c',name:'Lucky Penny',desc:'Your first loss each day breaks even instead.',cost:10,c:'#d9a066'},
 {id:'larry',code:'LL',r:'u',name:'Leverage Larry',desc:'x1.5 MULT. Losses on your buys are 1.5x bigger too.',cost:12,c:'#c79bff'},
 {id:'doom',code:'DS',r:'c',name:'Doomscroller',desc:'Certificate rumors are 15% more accurate.',cost:10,c:'#9fb4c7'},
 {id:'pump',code:'PC',r:'u',name:'Pump & Dump Club',desc:'+1 MULT for each winning day in a row. Bag left for the next guy.',cost:12,c:'#ffb3a1'},
 {id:'pearls',code:'AP',r:'c',name:"Aunt's Pearls",desc:'If you go broke, pawn these for 3 nights of rent and keep playing. Breaks after use.',cost:9,c:'#f4efe1'},
 {id:'fortune',code:'FC',r:'u',name:'Fortune Cookie',desc:'Each stock you buy has a 1-in-4 chance to turn Gold Leaf for good.',cost:11,c:'#ffe08a'},
 {id:'nephew',code:'AN',r:'u',name:"Senator's Spouse",desc:'The news and Rex Shouter are both far more accurate. She just has a feeling.',cost:13,c:'#a3c4ff'},
 {id:'landlord',code:'SS',r:'u',name:'Slumlord Sal',desc:'Property income +40%.',cost:14,c:'#9be08a'},
 {id:'flipper',code:'HF',r:'c',name:'House Flipper',desc:'Sell property for 120% of its value instead of 95%.',cost:9,c:'#ffc46b'},
 {id:'daytrader',code:'DT',r:'u',name:'Day Trader',desc:'+1 stock certificate every day.',cost:12,c:'#ffd9a8'},
 {id:'hedge',code:'HG',r:'c',name:'Hedge Hog',desc:'Lose on 2 or more buys in a day: get 30% of those losses back.',cost:9,c:'#b8e0d2'},
 {id:'zoning',code:'ZB',r:'u',name:'Bribed Zoning Board',desc:'Owning a whole district pays 2x instead of 1.5x. Fruit basket included.',cost:12,c:'#8fd6a8'},
 {id:'scalper',code:'SC',r:'c',name:'Order Flow Kickback',desc:'Your "free" broker sells your orders and slips you 3% of every buy.',cost:8,c:'#e0b3ff'},
 {id:'rexfan',code:'RF',r:'c',name:"Rex's Biggest Fan",desc:"Buy Rex Shouter's hot pick: +4 MULT.",cost:8,c:'#ff9b8f'},
 {id:'umbrella',code:'UP',r:'u',name:'Golden Parachute',desc:'No rent on Boss Landlord days. Fail upward in style.',cost:13,c:'#a8c8ff'},
 {id:'intern',code:'IN',r:'r',name:'The Intern',desc:'Unpaid. Copies the perk to its right.',cost:16,c:'#d0d0d0'},
 {id:'ponzi',code:'PP',r:'u',name:'Ponzi Pete',desc:'+2 MULT for each perk you have sold this run. Each night, lose 1% of cash per perk sold.',cost:11,c:'#ff7a59'},
 {id:'echo',code:'EC',r:'r',name:'Echo Chamber',desc:'Retrigger your first stock once for each MEME stock you bought.',cost:16,c:'#f58cff'},
 {id:'mcat',code:'MC',r:'r',name:"Great Aunt's Cat",desc:'x3 MULT. Eats one of your consumables every morning.',cost:17,c:'#ffcf6e'},
 {id:'vertical',code:'VI',r:'u',name:'Vertical Integration',desc:"+1 MULT per lot you own in the district tied to each stock's sector.",cost:12,c:'#7fd1b9'},
 {id:'splitter',code:'ST',r:'c',name:'Stock Splitter',desc:'+1 MULT for each stock you buy under $10 a share.',cost:8,c:'#b4f0a0'},
 {id:'bag',code:'BH',r:'c',name:'Bagholder',desc:'+3 MULT if one of your buys fell.',cost:8,c:'#c2a383'},
 {id:'clock',code:'BC',r:'c',name:'Broken Clock',desc:'x2 MULT on even-numbered days.',cost:10,c:'#e6e6e6'},
 {id:'specialist',code:'SP',r:'u',name:'Sector Specialist',desc:'x2 MULT when your hand is Sector Sweep, Cornered Market or Full Portfolio.',cost:13,c:'#8fb3ff'},
 {id:'indexer',code:'IH',r:'c',name:'Index Hugger',desc:'+4 MULT when your hand is Index Fund or Spread Bet.',cost:9,c:'#a0d8ef'},
 {id:'yolobro',code:'YB',r:'u',name:'YOLO Bro',desc:'x2 MULT when every buy was risk 3.',cost:12,c:'#ff5f9e'},
 {id:'savings',code:'SA',r:'u',name:'Savings Account',desc:"Each night, earn 5% of your cash, up to tonight's rent. The bank keeps the other 20%.",cost:12,c:'#9ee6c0'},
 {id:'loyalty',code:'LC',r:'c',name:'Loyalty Card',desc:'Every 4th Closing Bell: x4 MULT.',cost:10,c:'#ffa94d'},
 {id:'gnome',code:'LG',r:'c',name:'Lawn Gnome',desc:"+1 MULT, plus +2 for every Boss Landlord you've survived.",cost:9,c:'#e05050'},
 {id:'swiper',code:'SW',r:'u',name:'Swipe Right Sally',desc:"+0.25 MULT for every stock you've bought this run.",cost:13,c:'#ff8fb0'},
 {id:'divking',code:'DK',r:'c',name:'Dividend King',desc:'Dividend stocks pay 3x.',cost:8,c:'#6fdc9c'},
 {id:'rexghost',code:'RG',r:'l',name:"Rex's Ghost",desc:'Rex is never wrong, and he shouts about two stocks a day. Death cured his conflicts of interest.',cost:25,c:'#b0f0ff'},
 {id:'mildred',code:'MH',r:'l',name:"Great Aunt's Ghost",desc:"x1 MULT for every 4 days you've survived.",cost:25,c:'#e7d6f2'},
 {id:'whale',code:'WH',r:'l',name:'The Whale',desc:'Big orders never cut your gains. You are the market now.',cost:25,c:'#4fa3ff'},
 {id:'hairpiece',code:'CB',r:'l',name:"Chip's Hairpiece",desc:'Morning headlines are always right. x2 MULT for each stock you buy in a headline sector.',cost:25,c:'#8a5a32'},
 {id:'gooselord',code:'GL',r:'l',name:'Goose Lord',desc:'Retrigger every stock you buy.',cost:25,c:'#fffbe6'},
];
export const P=id=>PERKS.find(p=>p.id===id);
export const RARITY={c:{name:'Common',w:70,c:'#8fa0c8'},u:{name:'Uncommon',w:25,c:'#3fbf7f'},r:{name:'Rare',w:5,c:'#e8433a'},l:{name:'Legendary',w:0,c:'#c79bff'}};
/* Perk editions roll in the broker. add = +MULT, x = xMULT (both trigger at the perk's slot), free = takes no slot. */
export const PERK_EDS={
 emb:{name:'Embossed',w:.1,add:3,txt:'+3 MULT'},
 holo:{name:'Holographic',w:.05,x:1.5,txt:'x1.5 MULT'},
 fake:{name:'Counterfeit',w:.02,free:1,txt:'Takes no slot'},
};

/* ===== Portfolio hands =====
   What you buy in a day is your hand. The best one you qualify for sets the starting MULT.
   MULT = base + per x (level - 1). Almanacs level a hand up. */
export const HANDS=[
 {id:'single',name:'Single Bet',base:1,per:1,alm:'Pocket Almanac',txt:'Buy exactly one stock.'},
 {id:'spread',name:'Spread Bet',base:1,per:1,alm:'Weather Almanac',txt:'Buy 2 or more stocks with nothing in common.'},
 {id:'pair',name:'Pair Trade',base:2,per:1,alm:"Farmer's Almanac",txt:'2 buys in the same sector.'},
 {id:'twopair',name:'Two Pair Trade',base:3,per:1,alm:'Tide Almanac',txt:'2 buys in one sector and 2 in another.'},
 {id:'safe',name:'Safe Haven',base:3,per:1,alm:'Old Almanac',txt:'3 or more buys, all risk 1.'},
 {id:'index',name:'Index Fund',base:3,per:1,alm:'Census Almanac',txt:'4 or more buys, all in different sectors.'},
 {id:'sweep',name:'Sector Sweep',base:4,per:2,alm:'Harvest Almanac',txt:'3 or more buys in one sector.'},
 {id:'yolo',name:'YOLO',base:4,per:2,alm:'Storm Almanac',txt:'3 or more buys, all risk 3.'},
 {id:'whole',name:'The Whole Market',base:5,per:2,alm:'Complete Almanac',txt:'Buy every certificate (at least 4).'},
 {id:'full',name:'Full Portfolio',base:6,per:2,alm:'Grand Almanac',txt:'3 buys in one sector and 2 in another.'},
 {id:'parade',name:'Penny Parade',base:6,per:3,alm:'Penny Almanac',txt:'3 or more Penny Stocks.'},
 {id:'corner',name:'Cornered Market',base:7,per:3,alm:'Monopoly Almanac',txt:'4 or more buys in one sector.'},
];
export const H=id=>HANDS.find(h=>h.id===id);

/* ===== Consumables =====
   Memos (t:'card' needs a certificate in front of you), Almanacs (one per hand) and Brown Envelopes (strong, with a cost). */
export const MEMOS=[
 {id:'tip',name:'Insider Tip',t:'card',txt:'A guy who knows a guy. Reveal whether this stock rises today.'},
 {id:'short',name:'Short Sell',t:'card',txt:'Bet against this stock: you profit if it falls.'},
 {id:'split',name:'Stock Split',t:'card',txt:'Your buy of this stock counts double, both ways.'},
 {id:'gild',name:'Gold Leaf',t:'card',txt:'This company turns Gold Leaf for good (+50% gains).'},
 {id:'notary',name:'Notary Stamp',t:'card',txt:'This company is Notarized: it never loses more than 10% in a day.'},
 {id:'glass',name:'Glass Job',t:'card',txt:'This company turns to Glass: moves 3x, but may shatter out of the market when bought.'},
 {id:'haunt',name:'Seance',t:'card',txt:'This company is Haunted: it copies the move of the stock dealt before it.'},
 {id:'hot',name:'Hot Tip',t:'card',txt:'This company gives +4 MULT whenever you buy it and it rises.'},
 {id:'redseal',name:'Red Seal',t:'card',txt:'Stamp a Red Seal: this company retriggers at the Closing Bell.'},
 {id:'goldseal',name:'Gold Seal',t:'card',txt:"Stamp a Gold Seal: buying this company pays half of tonight's rent."},
 {id:'blueseal',name:'Blue Seal',t:'card',txt:"Stamp a Blue Seal: buying it hands you the Almanac for that day's hand."},
 {id:'shred',name:'Shredder',t:'card',txt:'Remove this company from the market for good. Passes it today. Nobody saw anything.'},
 {id:'clone',name:'Photocopier',t:'card',txt:'Add a copy of this company to the market.'},
 {id:'merge',name:'Merger',t:'card',txt:"Merge this company into the next certificate: it takes this one's edition, stamp and seal. This one leaves the market."},
 {id:'pump',name:'Paid Influencer',t:'card',txt:"Not financial advice. This stock's sector trends up tomorrow, reported truthfully."},
];
export const ENVELOPES=[
 {id:'legend',name:'Legendary Tip',txt:'From a man in a parking garage. Gain a Legendary perk. Lose half your cash.'},
 {id:'takeover',name:'Hostile Takeover',txt:'Destroy a random perk. Another random perk turns Holographic.'},
 {id:'swan',name:'Black Swan',txt:'Every portfolio hand goes up one level.'},
 {id:'shell',name:'Shell Company',txt:'Same address, same dentist office. Add 3 Glass companies to the market.'},
 {id:'counterfeit',name:'Counterfeit',txt:'A random perk turns Counterfeit (takes no slot). Lose 25% of your cash.'},
 {id:'ring',name:'Insider Ring',txt:'Your golf foursome includes three CEOs. Every rumor is true for the next 3 days.'},
 {id:'crypt',name:'Offshore Will',txt:'Copy a random perk. Destroy all the others.'},
 {id:'offshore',name:'Offshore Account',txt:"Gain 3 nights of rent now. Rent is 1.5x until the quarter ends."},
];

/* ===== Market deck: company stamps (enhancements) and seals ===== */
export const ENH={
 notary:{name:'NOTARIZED',txt:'Never loses more than 10% in a day.'},
 haunted:{name:'HAUNTED',txt:'Copies the move of the stock dealt before it.'},
 glass:{name:'GLASS',txt:'Moves 3x. 1 in 4 chance to shatter when bought.'},
 hot:{name:'HOT TIP',txt:'+4 MULT when bought and it rises.'},
};
export const SEALS={
 red:{name:'RED SEAL',c:'#e8433a',txt:'Retriggers at the Closing Bell.'},
 gold:{name:'GOLD SEAL',c:'#ffd23f',txt:"Buying it pays half of tonight's rent."},
 blue:{name:'BLUE SEAL',c:'#5b8cff',txt:"Buying it gives the Almanac for today's hand."},
};

/* ===== Real estate =====
   Each run draws 4 districts from the pool. District slot 1-4 sets the price tier; lots inside rise in price.
   sec ties the district to a stock sector (Vertical Integration). gim = gimmick, read in propInc():
   casino (pays 0-3x), mono (monopoly x), noSell, inc (x), boss (x on boss days). */
export const DISTRICT_POOL=[
 {id:'old',name:'Old Town',c:'#c9a27a',sec:'FOOD',lots:['Lemonade Stand','Corner Bodega','Laundromat','24-Hour Diner'],txt:'Plain and reliable.'},
 {id:'sub',name:'Suburbs',c:'#6fdc9c',sec:'PETS',lots:['Duplex','Cul-de-sac','Strip Mall','Waterpark'],txt:'Plain and reliable.'},
 {id:'harbor',name:'Harbor',c:'#5fe0e8',sec:'OIL',lots:['Bait & Tackle','Fish Market','Marina','Lighthouse Hotel'],txt:'Plain and reliable.'},
 {id:'sky',name:'Skyline',c:'#c79bff',sec:'TECH',lots:['Office Tower','Casino','Stadium','Inheritance Tower'],txt:'Plain and reliable.'},
 {id:'strip',name:'Casino Strip',c:'#ff6b6b',sec:'MEME',gim:{casino:1},lots:['Slot Shack','Bingo Hall','Poker Palace','The Golden Goose'],txt:'Pays 0x to 3x each night. Who knows.'},
 {id:'moon',name:'Moon Base',c:'#a8f0ff',sec:'SPACE',gim:{mono:2.5},lots:['Crater Hut','Dome Home','Cheese Mine','Lunar Spa'],txt:'A monopoly here pays 2.5x.'},
 {id:'goose',name:'Goose Sanctuary',c:'#e8e2c8',sec:'PETS',gim:{noSell:1,inc:1.5},lots:['The Pond','Bread Stand','Goose Court','Goose Palace'],txt:'Pays 1.5x, but the geese will never let you sell.'},
 {id:'mall',name:'Mega Mall',c:'#ffd9a8',sec:'FOOD',gim:{boss:2.5},lots:['Food Court','Shoe Store','Arcade','Department Store'],txt:'Pays 2.5x on Boss Landlord days.'},
];
// price and nightly yield by position in town (district slot x 4 + lot)
export const LOT_TIERS=[[15e3,.08],[40e3,.078],[90e3,.076],[160e3,.074],[250e3,.072],[400e3,.07],[650e3,.068],[1e6,.066],
  [1.5e6,.064],[2.2e6,.063],[3.2e6,.062],[4.5e6,.061],[6.5e6,.06],[9e6,.06],[13e6,.06],[20e6,.06]];
export const buildLots=dists=>LOT_TIERS.map(([price,yld],i)=>{const d=dists[Math.floor(i/4)];
  return {id:d.id+(i%4),name:d.lots[i%4],dist:d.id,price,yld:yld*2,tier:i%4,di:Math.floor(i/4),c:d.c}});
export const DISTRICTS=DISTRICT_POOL.slice(0,4);   // the classic town
export const LOTS=buildLots(DISTRICTS);

/* Daily events. Effects live in fx so a new event needs no new logic:
   gain (x MULT), pUp (rise chance +/-), gift ($), flare (hints are coin flips), sec ({SECTOR: move x}),
   trend ({SECTOR: 1|-1}, forced and reported truthfully), move (all moves x), fraud (fake stocks),
   rent (rent x), distRand (a random district's income x, named as {D}),
   cap (max buy as share of morning cash), tax (share of cash lost).
   Boss Landlords and story arcs use the same fx keys plus the ones listed above BOSSES and ARCS. */
export const EVENTS=[
 {id:'quiet',w:5,name:'Quiet Day',txt:'Nothing unusual on the Street.'},
 {id:'bull',w:1.5,name:'Money Printer Go Brrr',txt:'The central bank found the print button again. x1.5 MULT at the Closing Bell.',fx:{gain:1.5}},
 {id:'bear',w:1.5,name:'Bear Hug',txt:'Stocks are more likely to fall today.',fx:{pUp:-.17}},
 {id:'aunt',w:1,name:'Found in the Attic',txt:'A coffee can in your great aunt\'s attic holds $25,000. Do not tell the IRS.',fx:{gift:25000}},
 {id:'flare',w:1,name:'Solar Flare',txt:'Signal scrambled. Every rumor and headline is a coin flip.',fx:{flare:true}},
 {id:'meme',w:1,name:'Meme Season',txt:'Forum apes vs. hedge funds. MEME stocks move three times harder.',fx:{sec:{MEME:3}}},
 {id:'raid',w:1,name:'SEC Raid',txt:'For once, someone is checking. One stock today is a total fraud.',fx:{fraud:1}},
 {id:'free',w:.8,name:'Landlord Vacation',txt:'No rent today.',fx:{rent:0}},
 {id:'heat',w:.7,name:'Heat Wave',txt:'Everyone wants ice cream. FOOD stocks are running hot.',fx:{trend:{FOOD:1}}},
 {id:'winter',w:.7,name:'Crypto Winter',txt:'Coins are freezing over. CRYPTO is sliding.',fx:{trend:{CRYPTO:-1}}},
 {id:'launch',w:.7,name:'Launch Day',txt:'Big rocket on the pad. SPACE is climbing.',fx:{trend:{SPACE:1}}},
 {id:'recall',w:.6,name:'Kibble Recall',txt:'Bad batch of dog food. PETS are falling.',fx:{trend:{PETS:-1}}},
 {id:'crash',w:.7,name:'Flash Crash',txt:'A trading algorithm read a sarcastic post. Every stock moves twice as hard.',fx:{move:2}},
 {id:'tourist',w:.7,name:'Tourist Season',txt:'Tourists flood {D}. Its lots pay double tonight.',fx:{distRand:2}},
 {id:'party',w:.7,name:'Block Party',txt:'Bouncy castles all over {D}. It pays double tonight.',fx:{distRand:2}},
 {id:'blackout',w:.5,name:'Blackout',txt:'{D} lost power. Its lots pay nothing tonight.',fx:{distRand:0}},
 {id:'margin',w:.8,name:'Margin Call',txt:'Your broker is nervous. No single buy can use more than 25% of morning cash.',fx:{cap:.25}},
 {id:'reunion',w:.6,name:'Family Reunion',txt:'The cousins need a loan. They borrow 5% of your cash, forever.',fx:{tax:.05}},
 {id:'bailout',w:.4,name:'Bailout Day',txt:'The government is handing money to anyone who failed hard enough. You qualify: $25,000.',fx:{gift:25000}},
 {id:'war',w:.4,name:'Convenient Conflict',txt:'Oil executives are "deeply saddened" all the way to the bank. OIL is climbing.',fx:{trend:{OIL:1}}},
 {id:'books',w:.4,name:'Second Set of Books',txt:'An intern opened the wrong filing cabinet. One stock today is a total fraud.',fx:{fraud:1}},
 {id:'rentup',w:.6,name:'Rent Hike',txt:'Your landlord joined a rent-pricing app with every other landlord. Rent is 50% higher tonight.',fx:{rent:1.5}},
];

/* ===== Boss Landlords =====
   The last day of every quarter. Rent is 1.5x (BOSS_RENT) on top of the boss's own fx.
   Extra fx keys: disableRight, disableRandom (perk off today), oneEach (one buy per sector), lie (rumors flipped),
   propOff (no property income), forceRex / forceAll (can't pass), taxGains (share of gains above 2x rent),
   noHand (hand MULT is 1), handSize (certificates today), noRumor, repo (sell cheapest lot at 70%), shufflePerks. */
export const BOSS_RENT=1.5;
export const BOSSES=[
 {id:'goose',name:'The Goose',txt:'Honks at your rightmost perk until it quits. Disabled today.',fx:{disableRight:1}},
 {id:'auditor',name:'The Auditor',txt:'Has a clipboard and no sense of humor. You can only buy one stock per sector today.',fx:{oneEach:1}},
 {id:'birthday',name:'The Funeral Home',txt:'Sends the bill for the gold-plated casket. She insisted. 10% of your cash is gone.',fx:{tax:.1}},
 {id:'shorter',name:'The Shortseller',txt:'Published a 90-page report that says "FRAUD" on every page. Every rumor today is a lie.',fx:{lie:1}},
 {id:'barry',name:'Blackout Barry',txt:'Your property pays nothing tonight. Rent is halved.',fx:{propOff:1,rent:.5}},
 {id:'rex',name:'Rex Shouter Himself',txt:"He needs exit liquidity. You must buy Rex's hot pick.",fx:{forceRex:1}},
 {id:'taxman',name:'The Tax Man',txt:"Billionaires pay 3%. You are not a billionaire. Gains above twice tonight's rent are taxed 50%.",fx:{taxGains:.5}},
 {id:'bro',name:'The Hedge Fund Bro',txt:'Says "bro" as punctuation. Portfolio hands are only worth 1 MULT today.',fx:{noHand:1}},
 {id:'clerk',name:'The Margin Clerk',txt:'Only 2 certificates today.',fx:{handSize:2}},
 {id:'wall',name:'Wall Street',txt:'Wants its cut, plus a little extra for the vibes. Rent is doubled tonight.',fx:{rent:2}},
 {id:'teller',name:'The SEC Investigator',txt:'Everyone lawyered up. No rumors on any certificate.',fx:{noRumor:1}},
 {id:'repo',name:'The Repo Man',txt:'Repossesses your cheapest property tonight. You get 70%. He gets a bonus.',fx:{repo:1}},
];
export const FINALS=[
 {id:'accountant',name:'The Estate Accountant',txt:'Bills $900 an hour to read the will. Rent is tripled tonight.',fx:{rent:3}},
 {id:'lawyer',name:'The Family Lawyer',txt:'Shuffles your perks into a random order, for good. Rent 1.5x.',fx:{shufflePerks:1,rent:1.5}},
 {id:'cousin',name:'The Estranged Cousin',txt:'A random perk is disabled and you must buy every stock.',fx:{disableRandom:1,forceAll:1}},
 {id:'executor',name:'The Executor',txt:'No property income tonight, and rent is doubled.',fx:{propOff:1,rent:2}},
];

/* ===== Story arcs =====
   Multi-day chains told through the morning news. Each step may carry fx; a step with pick chooses one ending.
   Extra fx keys: noRex (Rex is off the air), rexAcc (Rex accuracy), addSector (hidden sector joins the market). */
export const ARCS=[
 {id:'goose',name:'The Goose Lawsuit',steps:[
   {txt:'A goose is suing the Mayor over a bread dispute.'},
   {txt:'Goose lawyer arrives in court wearing a tiny tie. PETS stocks are jumpy.',fx:{sec:{PETS:2}}},
   {pick:[{txt:'VERDICT: The goose wins! PETS soar.',fx:{trend:{PETS:1}}},{txt:'VERDICT: Goose loses. Bread prices crash.',fx:{trend:{FOOD:-1}}}]}]},
 {id:'rex',name:"Rex's Comeback Tour",steps:[
   {txt:'Rex Shouter fired from GAC-TV for shouting at a weather map.',fx:{noRex:1}},
   {txt:'Rex starts a podcast from his car. Nobody listens.',fx:{noRex:1}},
   {txt:'REX IS BACK! He has never been more confident. Or right.',fx:{rexAcc:.9}}]},
 {id:'aliens',name:'First Contact',steps:[
   {txt:'Strange lights spotted over town. Probably a blimp.'},
   {txt:'They landed. They want to invest. ALIEN stocks join the market.',fx:{addSector:'ALIEN'}},
   {txt:'ALIEN stocks are the hottest thing on Earth.',fx:{trend:{ALIEN:1}}}]},
 {id:'bees',name:'The Bee Situation',steps:[
   {txt:"Bees spotted in the town's tallest building."},
   {txt:'The bees have unionized. BEES stocks join the market.',fx:{addSector:'BEES'}},
   {txt:'Honey futures explode. BEES are buzzing.',fx:{trend:{BEES:1}}}]},
 {id:'cruise',name:'The Safe Deposit Box',steps:[
   {txt:"A mystery key turns up in your great aunt's dentures."},
   {txt:'It opens a safe deposit box: $50,000 and a note that says "Don\'t tell the cousins."',fx:{gift:50000}},
   {txt:'The box also held deeds to three oil wells. OIL is booming.',fx:{trend:{OIL:1}}}]},
 {id:'pickle',name:'The Great Pickle Heist',steps:[
   {txt:'Every pickle in town has gone missing.'},
   {txt:'Detectives baffled. FOOD stocks swing wildly.',fx:{sec:{FOOD:2}}},
   {txt:"Pickles found in the Mayor's pool. FOOD stocks rally in relief.",fx:{trend:{FOOD:1}}}]},
 {id:'toaster',name:'The Toaster Uprising',steps:[
   {txt:'Smart toasters across town refuse to toast.'},
   {txt:'Toasters demand voting rights. TECH is sliding.',fx:{trend:{TECH:-1}}},
   {txt:'Deal reached: toasters get Sundays off. TECH rebounds hard.',fx:{trend:{TECH:1},sec:{TECH:1.5}}}]},
 {id:'senator',name:"The Senator's Portfolio",steps:[
   {txt:'Senator Buck Porkwell schedules a "routine" hearing on space funding.'},
   {txt:"The Senator's spouse buys $2M of SPACE calls. A total coincidence. SPACE is jumpy.",fx:{sec:{SPACE:2}}},
   {txt:'Hearing ends with a $40B rocket contract. Spouse "just had a feeling." SPACE soars.',fx:{trend:{SPACE:1}}}]},
 {id:'pumpdump',name:'The Pump and Dump',steps:[
   {txt:'A forum account named NotTheCEO_Real starts hyping MEME stocks.'},
   {txt:'Celebrities who cannot spell "stock" start shilling. MEME is mooning.',fx:{trend:{MEME:1}}},
   {txt:'The founders cashed out at the top. NotTheCEO_Real deleted. MEME collapses.',fx:{trend:{MEME:-1},sec:{MEME:1.5}}}]},
 {id:'exchange',name:'The Exchange Collapse',steps:[
   {txt:'Crypto exchange founder wears cargo shorts to a world economic summit. Visionary.'},
   {txt:'Exchange pauses withdrawals "for routine maintenance." CRYPTO is sliding.',fx:{trend:{CRYPTO:-1}}},
   {pick:[{txt:'VERDICT: Founder says he "messed up," gets 25 years. CRYPTO keeps crashing.',fx:{trend:{CRYPTO:-1}}},{txt:'VERDICT: Nobody goes to jail. CRYPTO rallies on pure vibes.',fx:{trend:{CRYPTO:1}}}]}]},
];

/* Certificate editions. w = chance per new company; move/gain multiply the day's move; pUp nudges the rise chance;
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

/* ===== Run setup: aunts (starting decks) and her mood (difficulty) ===== */
export const AUNTS=[
 {id:'mildred',name:'Your Great Aunt',txt:'The classic. $100,000 and zero questions about where it came from.'},
 {id:'bernice',name:'The Crypto Aunt',txt:'Met a "crypto visionary" on a cruise. A market of mostly CRYPTO and MEME. Every stock moves 1.5x.',unlock:{runs:3},hint:'Play 3 runs.'},
 {id:'gloria',name:'The Frugal Aunt',txt:'$25,000 and the cheapest lot in the second district. No market on day 1.',unlock:{days:10},hint:'Last 10 days in one run.'},
 {id:'twins',name:'The Twin Aunts',txt:'Two extra broker offers and a third consumable slot. Rent +20%.',unlock:{mono:1},hint:'Own a whole district.'},
 {id:'ruth',name:'The Haunted Aunt',txt:'$10,000 plus 10% of your best peak (up to $1M). Four Haunted companies in the market.',unlock:{peak:5e6},hint:'Reach $5M net worth.'},
];
export const MOODS=[
 {name:'Pleased',txt:'Standard rules.'},
 {name:'Concerned',txt:'Rent +25%.'},
 {name:'Disappointed',txt:'Rent +25%. Rumors are 10% less accurate.'},
 {name:'Furious',txt:'All of the above. Perks cost 50% more and the broker shows one fewer.'},
 {name:'Haunting You',txt:'All of the above. Start with $50,000 less, and a Final Boss every other quarter.'},
];

/* The goal: net worth that passes the richest person in the world. Reaching it pays RICHEST_PEARLS once per run. */
export const RICHEST=5e11, RICHEST_PEARLS=50;

export const UPGRADES=[
 {id:'allowance',name:'Bigger Inheritance',desc:'Start each run with +$25,000.',max:5,cost:l=>3*(l+1)},
 {id:'hand',name:'Longer Ticker Tape',desc:'+1 stock to choose from every day.',max:2,cost:l=>8*(l+1)},
 {id:'cable',name:'Premium Cable',desc:'Morning news headlines are 5% more accurate.',max:3,cost:l=>5*(l+1)},
 {id:'accuracy',name:'Guy at the Country Club',desc:'Certificate rumors are 5% more accurate. Totally legal. Probably.',max:3,cost:l=>5*(l+1)},
 {id:'discount',name:'Broker Kickback',desc:'Perks cost 10% less in the shop.',max:3,cost:l=>4*(l+1)},
 {id:'deed',name:'Old Family Deed',desc:'Start each run owning the cheapest lot in town.',max:1,cost:()=>8},
 {id:'starter',name:'Family Heirloom',desc:'Start each run with a random common perk.',max:1,cost:()=>6},
 {id:'rentctl',name:'Rent Control',desc:'Rent is 5% lower. Landlords call it communism.',max:3,cost:l=>6*(l+1)},
 {id:'pocket',name:'Bigger Pockets',desc:'Start each run with a random Almanac.',max:1,cost:()=>5},
];
