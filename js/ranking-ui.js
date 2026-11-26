import {
  PRESAVE_WAIT, markPresave, presaveRemaining, fetchRanking, submitScore,
  normalizeHandle, isValidHandle,
} from './ranking.js';

const $ = (id) => document.getElementById(id);
const el = {
  text: $('gate-text'), presave: $('btn-presave'), wait: $('gate-wait'), bar: $('gate-bar'),
  submit: $('btn-submit'), submitSmall: $('submit-small'), submitLabel: $('submit-label'),
  input: $('nickname'),
};
const HANDLE_KEY = 'nsnuc-instagram';

let current = null;   // {score, stats} de la última partida
let status = 'idle';  // idle | sending | sent | error
let result = null;
let errorText = '';
let timer = null;
let lastRanking = null;

export function currentHandle() { return normalizeHandle(el.input.value); }

export function loadHandle() {
  let saved = '';
  try { saved = localStorage.getItem(HANDLE_KEY) || ''; } catch {}
  if (isValidHandle(saved)) el.input.value = saved;
}
export function saveHandle(handle) {
  try { localStorage.setItem(HANDLE_KEY, handle); } catch {}
}

const fmt = (n) => n.toLocaleString('es-ES');
const clock = (s) => `0:${String(s).padStart(2, '0')}`;

function setGate() {
  const remaining = presaveRemaining();
  const handle = currentHandle();
  el.presave.classList.toggle('hidden', remaining !== null);
  el.wait.classList.toggle('hidden', !(remaining > 0));
  el.submit.classList.toggle('hidden', remaining === null);
  el.submitSmall.textContent = `COMO @${handle.toUpperCase()}`;

  if (remaining === null) {
    el.text.textContent = 'Haz el pre-save y sube tu puntuación al ranking global.';
    return;
  }
  if (remaining > 0) {
    el.bar.style.width = `${(1 - remaining / PRESAVE_WAIT) * 100}%`;
    el.text.textContent = 'Termina el pre-save en la otra pestaña y vuelve aquí.';
    el.submit.disabled = true;
    el.submitLabel.textContent = `ESPERA ${clock(remaining)}`;
    return;
  }
  stopTimer();
  if (lastRanking?.cerrado) {
    el.text.textContent = 'El concurso ya ha terminado. ¡Gracias por jugar!';
    el.submit.classList.add('hidden');
    return;
  }
  if (!current || current.score <= 0) {
    el.text.textContent = 'Haz algún punto para poder subir la partida.';
    el.submit.disabled = true;
    el.submitLabel.textContent = 'SUBIR AL RANKING';
    return;
  }
  if (status === 'sending') {
    el.text.textContent = 'Subiendo tu puntuación…';
    el.submit.disabled = true;
    el.submitLabel.textContent = 'SUBIENDO...';
  } else if (status === 'sent') {
    el.submit.disabled = true;
    el.submitLabel.textContent = '✓ SUBIDA';
    const yo = result?.yo;
    if (!yo) el.text.textContent = '¡Partida subida!';
    else if (yo.score > current.score) el.text.textContent = `Tu mejor marca (${fmt(yo.score)}) te deja en el puesto #${yo.pos}.`;
    else el.text.textContent = `¡Estás en el puesto #${yo.pos} del ranking!`;
  } else if (status === 'error') {
    el.text.textContent = errorText;
    el.submit.disabled = false;
    el.submitLabel.textContent = 'REINTENTAR';
  } else {
    el.text.textContent = '¡Ranking desbloqueado! Sube tu partida.';
    el.submit.disabled = false;
    el.submitLabel.textContent = 'SUBIR AL RANKING';
  }
}

function startTimer() {
  stopTimer();
  if (presaveRemaining() > 0) timer = setInterval(setGate, 250);
}
function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

const ERRORS = {
  instagram: 'Ese @ de Instagram no es válido. Cámbialo en el menú.',
  puntos: 'Esta puntuación no se ha podido validar.',
  espera: 'Espera unos segundos y vuelve a intentarlo.',
  cerrado: 'El concurso ya ha terminado. ¡Gracias por jugar!',
};

async function submit() {
  if (!current || status === 'sending' || status === 'sent' || presaveRemaining() !== 0) return;
  status = 'sending';
  setGate();
  try {
    const res = await submitScore(currentHandle(), current.stats, current.score);
    if (!res.ok) throw Object.assign(new Error(res.error), {code: res.error});
    status = 'sent';
    result = res;
    renderRanking(res);
  } catch (err) {
    status = 'error';
    errorText = ERRORS[err.code] || 'No hay conexión. Inténtalo otra vez.';
    if (err.code === 'puntos' || err.code === 'cerrado') status = 'sent-failed';
  }
  if (status === 'sent-failed') {
    el.text.textContent = errorText;
    el.submit.disabled = true;
    el.submitLabel.textContent = 'SUBIR AL RANKING';
    return;
  }
  setGate();
}

export function initRanking() {
  loadHandle();
  el.presave.addEventListener('click', () => {
    markPresave();
    setGate();
    startTimer();
  });
  el.submit.addEventListener('click', submit);
  // Al volver de la pestaña del pre-save el contador se pone al día al momento.
  document.addEventListener('visibilitychange', () => { if (!document.hidden && current) setGate(); });
  refreshRanking();
}

export function rankingGameOver(score, stats) {
  current = {score, stats: {...stats}};
  status = 'idle';
  result = null;
  setGate();
  startTimer();
  refreshRanking();
}

export async function refreshRanking() {
  try {
    const data = await fetchRanking(currentHandle());
    if (data?.ok) renderRanking(data);
  } catch {
    if (!lastRanking) renderRanking(null);
  }
}

function renderRanking(data) {
  if (data) lastRanking = data;
  const me = currentHandle();
  document.querySelectorAll('.ranking-list').forEach((list) => {
    list.replaceChildren();
    const rows = data?.top || [];
    if (!rows.length) {
      const li = document.createElement('li');
      li.className = 'leaderboard-empty';
      li.textContent = data ? '¡Nadie todavía! El primer puesto te espera.' : 'No se ha podido cargar el ranking.';
      list.appendChild(li);
      return;
    }
    rows.forEach((row, i) => {
      const li = document.createElement('li');
      if (i < 3) li.classList.add('is-podium');
      if (row.instagram === me) li.classList.add('is-me');
      const pos = document.createElement('span'); pos.className = 'leaderboard-pos'; pos.textContent = String(i + 1).padStart(2, '0');
      const name = document.createElement('span'); name.className = 'leaderboard-name'; name.textContent = `@${row.instagram}`;
      const pts = document.createElement('strong'); pts.textContent = fmt(row.score);
      li.append(pos, name, pts);
      list.appendChild(li);
    });
    if (data?.yo && data.yo.pos > rows.length) {
      const li = document.createElement('li');
      li.className = 'is-me is-outside';
      const pos = document.createElement('span'); pos.className = 'leaderboard-pos'; pos.textContent = String(data.yo.pos);
      const name = document.createElement('span'); name.className = 'leaderboard-name'; name.textContent = `@${me}`;
      const pts = document.createElement('strong'); pts.textContent = fmt(data.yo.score);
      li.append(pos, name, pts);
      list.appendChild(li);
    }
  });
}
