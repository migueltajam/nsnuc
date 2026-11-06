import { initUi } from './ui.js';
import { initGame, startGame, pause, resume, toMenu } from './game.js';

const byId = (id) => document.getElementById(id);

initUi();
byId('btn-start').addEventListener('click', startGame);
byId('btn-restart').addEventListener('click', startGame);
byId('btn-pause').addEventListener('click', pause);
byId('btn-resume').addEventListener('click', resume);
byId('btn-quit').addEventListener('click', toMenu);
byId('btn-menu').addEventListener('click', toMenu);
initGame();
