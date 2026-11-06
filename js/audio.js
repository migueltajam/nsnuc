// Banda sonora arcade ORIGINAL, sintetizada con Web Audio: sin archivos, licencias externas ni descargas.
// El navegador permite activar audio únicamente tras una interacción del usuario.
const MUTE_KEY = 'nsnuc-muted-v2';
const BPM = 136;
const STEP = 60 / BPM / 2;
// Secuencia escrita para este proyecto; las notas MIDI no proceden de ninguna canción existente.
const LEAD = [76, null, 79, 83, 81, null, 79, 76,
              74, null, 76, 79, 76, 74, 72, null,
              76, null, 79, 84, 83, 81, 79, null,
              74, 76, 79, 76, 74, 72, 71, null];
const BASS = [48, 48, 55, 55, 45, 45, 52, 52];
const CHORD = [[60,64,67], [57,60,64], [55,59,62], [53,57,60]];
const midiHz = (n) => 440 * 2 ** ((n - 69) / 12);
let context = null;
let master = null;
let timer = null;
let playing = false;
let stepIndex = 0;
let nextNoteTime = 0;
let muted = false;
try { muted = localStorage.getItem(MUTE_KEY) === 'true'; } catch { /* navegación privada */ }

function synth(note, when, length, type = 'square', volume = 0.04, bend = 0) {
  if (!context || !master) return;
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(midiHz(note), when);
  if (bend) osc.frequency.exponentialRampToValueAtTime(Math.max(40, midiHz(note + bend)), when + length);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(volume, when + 0.013);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(0.035, length));
  osc.connect(gain).connect(master);
  osc.start(when);
  osc.stop(when + length + 0.015);
}

function advanceMusic() {
  if (!playing || !context) return;
  while (nextNoteTime < context.currentTime + 0.15) {
    if (!muted) {
      const n = LEAD[stepIndex % LEAD.length];
      if (n !== null) synth(n, nextNoteTime, STEP * 0.68, 'square', 0.028);
      if (stepIndex % 4 === 0) synth(BASS[Math.floor(stepIndex / 4) % BASS.length], nextNoteTime, STEP * 2.6, 'triangle', 0.09);
      if (stepIndex % 8 === 0) {
        CHORD[Math.floor(stepIndex / 8) % CHORD.length].forEach((c) => synth(c, nextNoteTime, STEP * 3.2, 'sine', 0.011));
      }
    }
    stepIndex += 1;
    nextNoteTime += STEP;
  }
}

export const audio = {
  get muted() { return muted; },
  async unlock() {
    try {
      if (!context) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return false;
        context = new Ctx();
        master = context.createGain();
        master.gain.value = 0.65;
        master.connect(context.destination);
      }
      if (context.state === 'suspended') await context.resume();
      return context.state === 'running';
    } catch { return false; }
  },
  toggle() {
    muted = !muted;
    try { localStorage.setItem(MUTE_KEY, String(muted)); } catch {}
    if (!muted) void this.unlock();
    return !muted;
  },
  startMusic() {
    if (playing) return;
    playing = true;
    stepIndex = 0;
    nextNoteTime = context ? context.currentTime + 0.04 : 0;
    if (timer === null) timer = window.setInterval(advanceMusic, 85);
    advanceMusic();
  },
  stopMusic() {
    playing = false;
    if (timer !== null) { clearInterval(timer); timer = null; }
  },
  sfx(name, combo = 1) {
    if (muted || !context || context.state !== 'running') return;
    const t = context.currentTime + 0.003;
    if (name === 'tick') synth(79, t, 0.09, 'square', 0.055);
    if (name === 'go') [79, 83, 88].forEach((n,i) => synth(n, t + i * 0.085, 0.22, 'square', 0.052));
    if (name === 'kiss') {
      synth(80 + Math.min(7, combo), t, 0.09, 'square', 0.047);
      synth(87 + Math.min(7, combo), t + 0.055, 0.13, 'sine', 0.055);
    }
    if (name === 'heart') synth(76 + Math.min(8, combo), t, 0.19, 'triangle', 0.09);
    if (name === 'bonus') [76, 81, 88].forEach((n,i) => synth(n, t + i * 0.065, 0.18, 'triangle', 0.075));
    if (name === 'damage') { synth(52, t, 0.26, 'sawtooth', 0.11, -14); synth(45, t + 0.085, 0.18, 'triangle', 0.1, -6); }
    if (name === 'combo') [79, 83, 86, 91].forEach((n,i) => synth(n, t + i * 0.055, 0.13, 'square', 0.055));
    if (name === 'secret') [71, 74, 78, 83, 90, 95].forEach((n,i) => synth(n, t + i * 0.14, 0.27, 'triangle', 0.09));
    if (name === 'over') [69, 65, 62, 57].forEach((n,i) => synth(n, t + i * 0.13, 0.29, 'sawtooth', 0.058));
    if (name === 'record') [76, 79, 83, 88, 91].forEach((n,i) => synth(n, t + i * 0.11, 0.34, 'triangle', 0.095));
    if (name === 'achievement') [81, 85, 88].forEach((n,i) => synth(n, t + i * 0.11, 0.2, 'sine', 0.072));
  },
};
