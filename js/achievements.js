// Insignias secretas persistentes, SOLO locales hasta disponer de backend.
const STORAGE_KEY = 'nsnuc-achievements-v2';
// En este orden se muestran, en dos columnas.
export const ACHIEVEMENTS = {
  twoKisses: { icon: '💋', level: 'FÁCIL', label: 'DOS BESOS', desc: 'Recoge 2 besos en una partida.' },
  outlaw: { icon: '🗡️', level: 'MEDIO', label: 'FORAJIDO', desc: 'Esquiva 10 calabazas sin recibir daño.' },
  combo17: { icon: '🔥', level: 'DIFÍCIL', label: 'SIN PERDER EL RITMO', desc: 'Consigue un combo de 17.' },
  points8000: { icon: '🏆', level: 'MUY DIFÍCIL', label: 'ROMÁNTICO DE LEYENDA', desc: 'Alcanza 8.000 puntos.' },
  colorWings: { icon: '🐦‍⬛', level: 'DIFÍCIL', label: 'ALAS DE COLOR', desc: 'Recoge 25 besos durante una misma noche.' },
  notDead: { icon: '❤️‍🩹', level: 'MUY DIFÍCIL', label: 'NO ESTOY MUERTO', desc: 'Recupérate al límite y atrapa un beso.' },
  madrid24: { icon: '🌙', level: 'EXTREMO', label: 'MADRID NO DUERME', desc: 'Sobrevive desde las 08:00 hasta las 08:00 del día siguiente.' },
  secret17: { icon: '🎽', level: 'SECRETO', label: 'EL DORSAL 17', desc: '17 segundos sin recoger nada.' },
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
