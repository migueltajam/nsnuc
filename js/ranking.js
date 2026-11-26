const params = new URLSearchParams(location.search);
function params_get(k) { return params.get(k); }

// Ranking global con pre-save.
// Al pulsar el pre-save empieza una espera de 45 s (una sola vez por móvil);
// después, cada partida se puede subir al ranking compartido (Google Sheets).

// Dirección de la aplicación web de Apps Script. Vacía = modo demo (solo este dispositivo).
export const RANKING_URL = 'https://script.google.com/macros/s/AKfycbzJ2ZUV0QmNe31aUPtPUs2BWlZe7uPlEHs8v2NUc_4Z4FxJZ1hD2ho7uWt9d0bxyii0hA/exec';
export const PRESAVE_URL = 'https://migueltajam.lnk.to/Nosoyniuncasi';
export const PRESAVE_WAIT = 45; // segundos
// Cierre del concurso: sale la canción y ya no hay pre-save (hora de Madrid).
export const CONTEST_END = new Date(params_get('cierre') || '2027-01-21T23:59:59+01:00');
export const contestClosed = () => Date.now() > CONTEST_END.getTime();

const PRESAVE_KEY = 'nsnuc-presave-at';
const DEVICE_KEY = 'nsnuc-device';
const DEMO_KEY = 'nsnuc-ranking-demo';

const url = params.get('ranking') || RANKING_URL;
export const isDemo = !url;

function read(key) { try { return localStorage.getItem(key); } catch { return null; } }
function write(key, value) { try { localStorage.setItem(key, value); } catch {} }

export function normalizeHandle(text) {
  return String(text || '').trim().replace(/^@+/, '').toLowerCase();
}
export function isValidHandle(handle) { return /^[a-z0-9._]{1,30}$/.test(handle); }

export function deviceId() {
  let id = read(DEVICE_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    write(DEVICE_KEY, id);
  }
  return id;
}

// ---- Pre-save y espera ----
export function markPresave() {
  if (!read(PRESAVE_KEY)) write(PRESAVE_KEY, String(Date.now()));
}
// Segundos que faltan: null = aún no ha pulsado el pre-save; 0 = desbloqueado.
export function presaveRemaining() {
  const at = Number(read(PRESAVE_KEY));
  if (!at) return null;
  return Math.max(0, Math.ceil(PRESAVE_WAIT - (Date.now() - at) / 1000));
}

// ---- Servidor ----
async function getJSON(target) {
  const res = await fetch(target, {cache: 'no-store'});
  if (!res.ok) throw new Error('red');
  return res.json();
}

export async function fetchRanking(handle) {
  if (isDemo) return demoRanking(handle);
  const target = `${url}?yo=${encodeURIComponent(handle || '')}`;
  return getJSON(target);
}

export async function submitScore(handle, stats, score) {
  const body = {
    instagram: handle, score, duration: Math.floor(stats.duration),
    kisses: stats.kisses, hearts: stats.hearts, bestCombo: stats.bestCombo, device: deviceId(),
  };
  if (isDemo) return demoSubmit(body);
  // text/plain evita la comprobación previa de CORS que Apps Script no admite.
  const res = await fetch(url, {method: 'POST', headers: {'Content-Type': 'text/plain;charset=utf-8'}, body: JSON.stringify(body)});
  if (!res.ok) throw new Error('red');
  return res.json();
}

// ---- Modo demo (mismo formato que el servidor, guardado en este dispositivo) ----
function demoRows() {
  try { return JSON.parse(read(DEMO_KEY) || '[]'); } catch { return []; }
}
function demoRanking(yo) {
  const best = {};
  for (const r of demoRows()) if (!best[r.instagram] || r.score > best[r.instagram].score) best[r.instagram] = r;
  const list = Object.values(best).sort((a, b) => b.score - a.score);
  const out = {ok: true, top: list.slice(0, 10).map(({instagram, score}) => ({instagram, score})), total: list.length, cerrado: false};
  const i = list.findIndex((r) => r.instagram === yo);
  if (i >= 0) out.yo = {pos: i + 1, score: list[i].score};
  return out;
}
function demoSubmit(body) {
  const rows = demoRows();
  rows.push({instagram: body.instagram, score: body.score});
  write(DEMO_KEY, JSON.stringify(rows.slice(-500)));
  return demoRanking(body.instagram);
}
