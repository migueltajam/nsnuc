import { MAX_LIVES } from './config.js';
import { HUD_FULL, HUD_EMPTY, spriteURLs } from './sprites.js';
import { audio } from './audio.js';
import { getAchievements } from './achievements.js';

const $ = (id) => document.getElementById(id);
export const ui = {
  hud: $('hud'), score: $('score'), level: $('level'), lives: $('lives'),
  combo: $('combo-hud'), finalScore: $('final-score'),
  bestStart: $('best-start'), bestOver: $('best-over'), newRecord: $('new-record'),
  recordCelebration: $('record-celebration'), btnRestart: $('btn-restart'),
  nickname: $('nickname'), nicknameError: $('nickname-error'),
  leaderboard: $('leaderboard'), egg: $('easter-egg'),
  countdown: $('countdown'), countdownValue: $('countdown-value'),
  achievementToast: $('achievement-toast'), achievementToastName: $('achievement-toast-name'),
  achievements: $('achievements'), achievementsCount: $('achievement-counter'),
  statKisses: $('stat-kisses'), statHearts: $('stat-hearts'),
  statTime: $('stat-time'), statCombo: $('stat-combo'),
  screens: {start: $('screen-start'), pause: $('screen-pause'), over: $('screen-over')},
};

const NICKNAME_KEY = 'nsnuc-nickname';
const SCORES_KEY = 'nsnuc-scores-local-v1';
let eggTimeout = null;
let toastTimeout = null;
let toastQueue = [];

function readLocalScores() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s) => typeof s.nick === 'string' && Number.isFinite(s.score));
  } catch { return []; }
}
export function updateSoundButtons() {
  document.querySelectorAll('.sound-toggle').forEach((el) => {
    const isOff = audio.muted;
    el.setAttribute('aria-label', isOff ? 'Activar música y efectos' : 'Silenciar música y efectos');
    el.setAttribute('aria-pressed', String(isOff));
    el.textContent = el.classList.contains('hud-sound') ? (isOff ? '♪̸' : '♪') : `♪ SONIDO: ${isOff ? 'OFF' : 'ON'}`;
  });
}
export function initUi() {
  document.querySelectorAll('img[data-sprite]').forEach((img) => { img.src = spriteURLs[img.dataset.sprite] || ''; });
  try { ui.nickname.value = localStorage.getItem(NICKNAME_KEY) || ''; } catch {}
  ui.nickname.addEventListener('input', () => ui.nicknameError.classList.add('hidden'));
  document.querySelectorAll('.sound-toggle').forEach((btn) => btn.addEventListener('click', () => {
    audio.toggle(); updateSoundButtons();
  }));
  updateSoundButtons();
  renderLocalLeaderboard();
  renderAchievements();
}
export function ensureNickname() {
  const nick = ui.nickname.value.trim().replace(/\s+/g, ' ');
  if (nick.length < 2 || nick.length > 16) {
    ui.nicknameError.textContent = 'Escribe un apodo de 2 a 16 caracteres.';
    ui.nicknameError.classList.remove('hidden');
    showScreen('start');
    ui.nickname.focus();
    return false;
  }
  try { localStorage.setItem(NICKNAME_KEY, nick); } catch {}
  ui.nickname.value = nick;
  ui.nicknameError.classList.add('hidden');
  return true;
}
export function showScreen(name) {
  for (const [key, el] of Object.entries(ui.screens)) el.classList.toggle('hidden', key !== name);
  ui.hud.classList.toggle('hidden', name !== null && name !== 'pause');
}
export function updateHud(score, level, lives) {
  ui.score.textContent = String(score).padStart(6, '0');
  ui.level.textContent = `NIVEL ${level}`;
  ui.lives.replaceChildren(...Array.from({length: MAX_LIVES}, (_,i) => {
    const img = document.createElement('img');
    img.src = i < lives ? HUD_FULL : HUD_EMPTY;
    img.alt = '';
    return img;
  }));
  ui.lives.setAttribute('aria-label', `${Math.max(0, lives)} vidas de ${MAX_LIVES}`);
}
export function updateCombo(count, multiplier) {
  const visible = count >= 2;
  ui.combo.classList.toggle('hidden', !visible);
  if (visible) ui.combo.textContent = `RACHA ${count} · x${multiplier}`;
  ui.combo.classList.toggle('combo-hot', multiplier >= 3);
}
export function bumpScore() {
  ui.score.classList.remove('bump');
  void ui.score.offsetWidth;
  ui.score.classList.add('bump');
}
export function showCountdown(value) {
  ui.countdown.classList.remove('hidden');
  ui.countdown.classList.toggle('is-go', value === 'GO');
  ui.countdownValue.textContent = value === 'GO' ? '¡ATRAPA!' : String(value);
  ui.countdownValue.classList.remove('pop');
  void ui.countdownValue.offsetWidth;
  ui.countdownValue.classList.add('pop');
}
export function hideCountdown() { ui.countdown.classList.add('hidden'); }

// Clasificación SOLO local de demostración; no equivale a la futura clasificación global.
export function recordLocalScore(points) {
  const entries = readLocalScores();
  entries.push({nick: ui.nickname.value.trim(), score: points, date: new Date().toISOString()});
  try { localStorage.setItem(SCORES_KEY, JSON.stringify(entries.slice(-1000))); } catch {}
  renderLocalLeaderboard();
}
export function renderLocalLeaderboard() {
  if (!ui.leaderboard) return;
  const top = readLocalScores().sort((a,b) => b.score - a.score).slice(0,10);
  ui.leaderboard.replaceChildren();
  if (!top.length) {
    const li = document.createElement('li');
    li.textContent = 'Todavía no hay partidas en este dispositivo.';
    li.className = 'leaderboard-empty';
    ui.leaderboard.appendChild(li);
    return;
  }
  for (const [index, row] of top.entries()) {
    const li = document.createElement('li');
    const pos = document.createElement('span'); pos.textContent = String(index+1).padStart(2,'0');
    const nick = document.createElement('span'); nick.textContent = row.nick; nick.className = 'leaderboard-name';
    const points = document.createElement('strong'); points.textContent = row.score.toLocaleString('es-ES');
    li.append(pos,nick,points);
    ui.leaderboard.appendChild(li);
  }
}
function duration(secs) { return `${Math.floor(secs/60)}:${String(Math.floor(secs%60)).padStart(2,'0')}`; }
export function updateGameOverStats(stats, isRecord) {
  ui.statKisses.textContent = stats.kisses;
  ui.statHearts.textContent = stats.hearts;
  ui.statTime.textContent = duration(stats.duration);
  ui.statCombo.textContent = stats.bestCombo;
  ui.recordCelebration.classList.toggle('hidden', !isRecord);
  renderAchievements();
}
export function renderAchievements() {
  const list = getAchievements();
  ui.achievementsCount.textContent = `${list.filter(x=>x.unlocked).length}/${list.length}`;
  ui.achievements.replaceChildren();
  for (const item of list) {
    const li = document.createElement('li');
    li.className = 'achievement' + (!item.unlocked ? ' locked' : '') + (item.isNew ? ' just-unlocked' : '');
    const icon = document.createElement('span'); icon.className='achievement-icon'; icon.textContent = item.unlocked ? item.icon : '❔';
    const info = document.createElement('div');
    const title = document.createElement('strong'); title.textContent = item.unlocked ? item.label : '???';
    const desc = document.createElement('small'); desc.textContent = item.unlocked ? item.desc : 'Descúbrelo jugando';
    info.append(title,desc); li.append(icon,info); ui.achievements.appendChild(li);
  }
}
export function resetToasts() {
  toastQueue=[];
  clearTimeout(toastTimeout);
  toastTimeout=null;
  ui.achievementToast.classList.add('hidden');
}
function popToast() {
  const item = toastQueue.shift();
  if (!item) { ui.achievementToast.classList.add('hidden'); toastTimeout=null; return; }
  ui.achievementToast.querySelector('.achievement-toast-icon').textContent = item.icon;
  ui.achievementToastName.textContent = item.label;
  ui.achievementToast.classList.remove('hidden');
  toastTimeout=setTimeout(popToast,2600);
}
export function showAchievementToast(item) {
  toastQueue.push(item);
  if (toastTimeout===null) popToast();
}
export function showEasterEgg() {
  ui.egg.classList.remove('hidden');
  ui.egg.classList.remove('egg-appear');

  void ui.egg.offsetWidth;

  ui.egg.classList.add('egg-appear');

  clearTimeout(eggTimeout);

  // Solo aparece durante 1,6 segundos.
  eggTimeout = setTimeout(hideEasterEgg, 1600);
}
export function hideEasterEgg() {
  clearTimeout(eggTimeout);
  ui.egg.classList.add('hidden');
}
