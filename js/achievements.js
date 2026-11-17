// Insignias secretas persistentes, SOLO locales hasta disponer de backend.
import { achievementIconURLs } from './achievement-icons.js';
const STORAGE_KEY = 'nsnuc-achievements-v2';
// En este orden se muestran, en dos columnas. Los iconos están en achievement-icons.js.
export const ACHIEVEMENTS = {
  twoKisses: { label: 'DOS BESOS', desc: 'Recoge tus primeros 2 besos' },
  outlaw: { label: 'FORAJIDO', desc: 'Esquiva 10 calabazas' },
  combo17: { label: 'SIN PERDER EL RITMO', desc: 'Consigue un combo de 17' },
  points8000: { label: 'ROMÁNTICX', desc: 'Alcanza 8.000 puntos' },
  colorWings: { label: 'EL CUERVO', desc: 'Recoge 25 besos en una noche' },
  notDead: { label: 'NO ESTOY MUERTX', desc: 'Recupérate al límite' },
  madrid24: { label: 'MADRID NO DUERME', desc: 'Sobrevive una noche' },
  secret17: { label: 'EL DORSAL 17', desc: '17 segundos sin recoger nada', hidden: true }, // logro oculto hasta conseguirlo
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
  return { id, ...ACHIEVEMENTS[id], iconURL: achievementIconURLs[id] };
}
export function getAchievements() {
  return Object.entries(ACHIEVEMENTS).map(([id, data]) => ({ id, ...data, iconURL: achievementIconURLs[id], unlocked: unlocked.has(id), isNew: unlockedThisRun.includes(id) }));
}
export function getRunAchievements() { return [...unlockedThisRun]; }
