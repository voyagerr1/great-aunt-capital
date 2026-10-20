// Entry point: load styles and start the game.
import './styles.css';
import { boot, api } from './game.js';

boot();
if (import.meta.env.DEV) window.gac = api;   // dev console hook: gac.run, gac.newPerk(...)
