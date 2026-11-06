// Insignias secretas persistentes, SOLO locales hasta disponer de backend.
const STORAGE_KEY = 'nsnuc-achievements-v2';
export const ACHIEVEMENTS = {
  firstKiss: { icon: '💋', label: 'PRIMER BESO', desc: 'Recoge tu primer beso' },
  combo5: { icon: '⚡', label: 'EN RACHA', desc: 'Consigue un combo de 5' },
  combo10: { icon: '🔥', label: 'IMPARABLE', desc: 'Consigue un combo de 10' },
  secret17: { icon: '🎽', label: 'EL DORSAL 17', desc: '17 segundos sin recoger nada' },
  points1000: { icon: '🏆', label: 'MIL RAZONES', desc: 'Llega a 1.000 puntos' },
  survivor: { icon: '🌙', label: 'MADRID NO DUERME', desc: 'Sobrevive 90 segundos' },
};
function read() {
  try {
    const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return new Set(Array.isArray(arr) ? arr.filter(x => Object.hasOwn(ACHIEVEMENTS, x)) : []);
  } catch { return new Set(); }
}
let unlocked = read();
let unlockedThisRun = [];
export function newRun() { unlockedThisRun = []; }
export function unlockAchievement(id) {
  if (!Object.hasOwn(ACHIEVEMENTS, id) || unlocked.has(id)) return null;
  unlocked.add(id);
  unlockedThisRun.push(id);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked])); } catch {}
  return ACHIEVEMENTS[id];
}
export function getAchievements() {
  return Object.entries(ACHIEVEMENTS).map(([id, data]) => ({ id, ...data, unlocked: unlocked.has(id), isNew: unlockedThisRun.includes(id) }));
}
export function getRunAchievements() { return [...unlockedThisRun]; }
