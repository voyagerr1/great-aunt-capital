// Balance simulator. Plays hundreds of runs with bot strategies and prints how long they last.
// Usage: npm run sim            (or: node scripts/sim.mjs 1000)
import { api } from '../src/game.js';
import { playRun, quantile } from './strategies.js';

const N = Number(process.argv[2] || 400);
const fmt = n => n >= 1e9 ? '$' + (n / 1e9).toFixed(1) + 'B' : n >= 1e6 ? '$' + (n / 1e6).toFixed(1) + 'M' : '$' + Math.round(n / 1e3) + 'K';
console.log(`Simulating ${N} runs per strategy...\n`);
for (const [label, opts] of [
  ['stocks only, 25%', { strategy: 'stocks', size: 0.25 }],
  ['balanced, 25%', { strategy: 'balanced', size: 0.25 }],
  ['balanced, 50%', { strategy: 'balanced', size: 0.5 }],
  ['balanced, max', { strategy: 'balanced', size: 1 }],
  ['no shop, 25%', { strategy: 'balanced', size: 0.25, shop: false }],
  ['smart, 25%', { strategy: 'balanced', size: 0.25, smart:true }],
  ['smart endless, 25%', { strategy: 'balanced', size: 0.25, smart:true, endless:true }],
]) {
  const res = Array.from({ length: N }, (_,i) => playRun(api, {...opts,seed:'SIM-'+i}));
  const days = res.map(r => r.days), peaks = res.map(r => r.peak), mults = res.map(r => r.bestMult), bosses = res.map(r => r.bosses);
  const ty = res.filter(r => r.tycoon).length;
  console.log(`${label.padEnd(18)} days p10/med/p90 ${quantile(days, .1)}/${quantile(days, .5)}/${quantile(days, .9)}  ` +
    `peak NW med ${fmt(quantile(peaks, .5))} p90 ${fmt(quantile(peaks, .9))}  best MULT med ${quantile(mults, .5).toFixed(1)} p90 ${quantile(mults, .9).toFixed(1)}  ` +
    `bosses med ${quantile(bosses, .5)}  tycoon ${(100 * ty / N).toFixed(1)}%`);
}
