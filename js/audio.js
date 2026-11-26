// Música: la instrumental de «No soy ni un casi» en bucle (reintro + verso + estribillo, 117 BPM).
// El archivo lleva 1 s de música antes y después del bucle para que el salto no se note en ningún navegador.
// Los efectos siguen sintetizados con Web Audio. El audio solo arranca tras una interacción del usuario.
const MUSIC_URL = './assets/audio/musica.mp3';
const LOOP_START = 1.0;                 // segundos dentro del archivo
const LOOP_END = 1.0 + 3347069 / 44100; // 37 compases exactos
const MUSIC_VOLUME = 0.14; // de fondo: los efectos mandan
const MUTE_KEY = 'nsnuc-muted-v2';
const midiHz = (n) => 440 * 2 ** ((n - 69) / 12);
let context = null;
let master = null;
let playing = false;
let muted = false;
let musicGain = null;
let musicBuffer = null;
let musicSource = null;
let musicStartedAt = 0;   // context.currentTime en que «sonaría» LOOP_START
let musicOffset = 0;      // segundos dentro del bucle al pausar
let musicLoading = null;
const musicBytes = fetch(MUSIC_URL).then((r) => (r.ok ? r.arrayBuffer() : null)).catch(() => null);
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

function loadMusic() {
  if (musicBuffer || !context) return Promise.resolve(musicBuffer);
  if (!musicLoading) {
    musicLoading = musicBytes.then((bytes) => {
      if (!bytes) return null;
      return new Promise((resolve) => context.decodeAudioData(bytes.slice(0), resolve, () => resolve(null)));
    }).then((buf) => { musicBuffer = buf; return buf; });
  }
  return musicLoading;
}

function playMusicFrom(offset) {
  if (!musicBuffer || !context || !playing) return;
  stopSource();
  const src = context.createBufferSource();
  src.buffer = musicBuffer;
  src.loop = true;
  src.loopStart = LOOP_START;
  src.loopEnd = Math.min(LOOP_END, musicBuffer.duration);
  src.connect(musicGain);
  const now = context.currentTime + 0.03;
  musicGain.gain.cancelScheduledValues(now);
  musicGain.gain.setValueAtTime(0.0001, now);
  musicGain.gain.exponentialRampToValueAtTime(muted ? 0.0001 : MUSIC_VOLUME, now + 0.4);
  src.start(now, LOOP_START + offset);
  musicSource = src;
  musicStartedAt = now - offset;
}

function stopSource(fade = 0) {
  if (!musicSource) return;
  const src = musicSource;
  musicSource = null;
  if (fade && context) {
    const now = context.currentTime;
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.setValueAtTime(musicGain.gain.value, now);
    musicGain.gain.linearRampToValueAtTime(0.0001, now + fade);
    try { src.stop(now + fade + 0.02); } catch {}
  } else {
    try { src.stop(); } catch {}
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
        musicGain = context.createGain();
        musicGain.gain.value = 0.0001;
        musicGain.connect(master);
        void loadMusic();
      }
      if (context.state === 'suspended') await context.resume();
      return context.state === 'running';
    } catch { return false; }
  },
  toggle() {
    muted = !muted;
    try { localStorage.setItem(MUTE_KEY, String(muted)); } catch {}
    if (!muted) void this.unlock();
    if (musicGain && context) {
      const now = context.currentTime;
      musicGain.gain.cancelScheduledValues(now);
      musicGain.gain.setValueAtTime(Math.max(0.0001, musicGain.gain.value), now);
      musicGain.gain.exponentialRampToValueAtTime(muted || !musicSource ? 0.0001 : MUSIC_VOLUME, now + 0.15);
    }
    return !muted;
  },
  // Empieza la música; con resume=true sigue donde se pausó.
  startMusic(resume = false) {
    if (playing) return;
    playing = true;
    const offset = resume ? musicOffset : 0;
    if (musicBuffer) playMusicFrom(offset);
    else loadMusic().then(() => playMusicFrom(offset));
  },
  pauseMusic() {
    if (!playing) return;
    if (context && musicSource) {
      const len = LOOP_END - LOOP_START;
      musicOffset = ((context.currentTime - musicStartedAt) % len + len) % len;
    }
    playing = false;
    stopSource(0.15);
  },
  stopMusic() {
    playing = false;
    musicOffset = 0;
    stopSource(0.3);
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
