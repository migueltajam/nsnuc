import { initUi } from './ui.js';
import { initRanking } from './ranking-ui.js';
import { initGame, startGame, pause, resume, toMenu, isRunning } from './game.js';

const byId = (id) => document.getElementById(id);

initUi();
initRanking();
byId('btn-start').addEventListener('click', startGame);
byId('btn-restart').addEventListener('click', startGame);
byId('btn-pause').addEventListener('click', pause);
byId('btn-resume').addEventListener('click', resume);
byId('btn-quit').addEventListener('click', toMenu);
byId('btn-menu').addEventListener('click', toMenu);
initGame();

// Móviles: solo en vertical. Si se gira a horizontal se pausa la partida y se pide girar.
// (Las tablets son bastante altas en horizontal y ahí sí se puede jugar.)
const phoneLandscape = window.matchMedia('(orientation: landscape) and (max-height: 500px) and (pointer: coarse)');
const onOrientation = () => { if (phoneLandscape.matches && isRunning()) pause(); };
phoneLandscape.addEventListener('change', onOrientation);
onOrientation();
// Donde el navegador lo permite (Android en pantalla completa o instalado), se fija en vertical.
const isPhone = Math.min(screen.width, screen.height) < 500 && window.matchMedia('(pointer: coarse)').matches;
if (isPhone && screen.orientation?.lock) screen.orientation.lock('portrait').catch(() => {});
