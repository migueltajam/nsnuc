import { MAX_LIVES } from './config.js';
import { HUD_FULL, HUD_EMPTY, spriteURLs } from './sprites.js';
import { audio } from './audio.js';
import { getAchievements } from './achievements.js';
import { achievementIconURLs, achievementIconFrames } from './achievement-icons.js';
import { normalizeHandle, isValidHandle } from './ranking.js';
import { saveHandle } from './ranking-ui.js';

const $ = (id) => document.getElementById(id);
export const ui = {
  hud: $('hud'), score: $('score'), level: $('level'), lives: $('lives'),
  combo: $('combo-hud'), finalScore: $('final-score'),
  bestStart: $('best-start'), bestOver: $('best-over'), newRecord: $('new-record'),
  recordCelebration: $('record-celebration'), btnRestart: $('btn-restart'),
  nickname: $('nickname'), nicknameError: $('nickname-error'),
  egg: $('easter-egg'),
  countdown: $('countdown'), countdownValue: $('countdown-value'),
  achievementToast: $('achievement-toast'), achievementToastName: $('achievement-toast-name'),
  achievements: $('achievements'), achievementsCount: $('achievement-counter'),
  statKisses: $('stat-kisses'), statHearts: $('stat-hearts'),
  statTime: $('stat-time'), statCombo: $('stat-combo'),
  screens: {start: $('screen-start'), pause: $('screen-pause'), over: $('screen-over')},
};

let eggTimeout = null;
let toastTimeout = null;
let toastQueue = [];

export function updateSoundButtons() {
  document.querySelectorAll('.sound-toggle').forEach((el) => {
    const isOff = audio.muted;
    el.setAttribute('aria-label', isOff ? 'Activar música y efectos' : 'Silenciar música y efectos');
    el.setAttribute('aria-pressed', String(isOff));
    el.textContent = el.classList.contains('hud-sound') ? (isOff ? '♪̸' : '♪') : `♪ SONIDO: ${isOff ? 'OFF' : 'ON'}`;
  });
}
export function initUi() {
  const eggIcon = document.querySelector('.egg-icon');
  if (eggIcon) eggIcon.src = achievementIconURLs.secret17;
  document.querySelectorAll('img[data-sprite]').forEach((img) => { img.src = spriteURLs[img.dataset.sprite] || ''; });
  ui.nickname.addEventListener('input', () => ui.nicknameError.classList.add('hidden'));
  document.querySelectorAll('.sound-toggle').forEach((btn) => btn.addEventListener('click', () => {
    audio.toggle(); updateSoundButtons();
  }));
  updateSoundButtons();
  renderAchievements();
}
export function ensureNickname() {
  const handle = normalizeHandle(ui.nickname.value);
  if (!isValidHandle(handle)) {
    ui.nicknameError.textContent = handle
      ? 'Solo letras, números, puntos y guiones bajos, como en Instagram.'
      : 'Escribe tu @ de Instagram para jugar.';
    ui.nicknameError.classList.remove('hidden');
    showScreen('start');
    ui.nickname.focus();
    return false;
  }
  saveHandle(handle);
  ui.nickname.value = handle;
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
    const icon = document.createElement('img'); icon.className = 'achievement-icon'; const secret = item.hidden && !item.unlocked; // logro oculto: no se enseña hasta conseguirlo
    icon.src = secret ? achievementIconURLs.hidden : item.iconURL; icon.alt = '';
    const info = document.createElement('div');
    const title = document.createElement('strong'); title.textContent = secret ? '???' : item.label;
    const desc = document.createElement('small'); desc.textContent = secret ? 'Descúbrelo jugando' : item.desc;
    info.append(title,desc); li.append(icon,info);
    if (secret) li.classList.add('hidden-achievement');
    if (!item.unlocked && !secret) { const lock = document.createElement('img'); lock.className = 'achievement-lock'; lock.src = achievementIconURLs.lock; lock.alt = 'Bloqueado'; li.append(lock); }
    ui.achievements.appendChild(li);
  }
}
export function resetToasts() {
  toastQueue=[];
  clearTimeout(toastTimeout);
  toastTimeout=null;
  ui.achievementToast.classList.add('hidden');
  stopIconAnim();
}
// Cada icono se mueve a su manera mientras está la alerta.
let iconAnim = null;
function stopIconAnim() { if (iconAnim) { clearInterval(iconAnim); iconAnim = null; } }
function animateToastIcon(img, id) {
  stopIconAnim();
  img.className = `toast-icon-${id}`;
  const anim = achievementIconFrames[id];
  if (!anim) return;
  let i = 0;
  iconAnim = setInterval(() => { i = (i + 1) % anim.urls.length; img.src = anim.urls[i]; }, anim.ms);
}
function popToast() {
  const item = toastQueue.shift();
  if (!item) { ui.achievementToast.classList.add('hidden'); toastTimeout=null; stopIconAnim(); return; }
  const toastIcon = ui.achievementToast.querySelector('.achievement-toast-icon');
  toastIcon.textContent = '';
  const img = document.createElement('img'); img.src = item.iconURL; img.alt = ''; toastIcon.append(img);
  animateToastIcon(img, item.id);
  ui.achievementToastName.textContent = item.label;
  document.getElementById('achievement-toast-desc').textContent = item.desc || '';
  ui.achievementToast.classList.remove('hidden');
  toastTimeout=setTimeout(popToast,4000); // 4 s en pantalla
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
  eggTimeout = setTimeout(hideEasterEgg, 5500); // 5,5 s en pantalla
}
export function hideEasterEgg() {
  clearTimeout(eggTimeout);
  ui.egg.classList.add('hidden');
}
