(() => {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  // Toda la escena se dibuja en este buffer de baja resolución y luego se escala sin suavizado.
  const buffer = document.createElement('canvas');
  const g = buffer.getContext('2d');
  const $ = (id) => document.getElementById(id);

  const ui = {
    hud: $('hud'),
    score: $('score'),
    lives: $('lives'),
    finalScore: $('final-score'),
    bestStart: $('best-start'),
    bestOver: $('best-over'),
    newRecord: $('new-record'),
    btnRestart: $('btn-restart'),
    screens: {
      start: $('screen-start'),
      pause: $('screen-pause'),
      over: $('screen-over'),
    },
  };

  // ---------- Paleta ----------

  const OUTLINE = '#181425';
  const HIGHLIGHT = '#fdf6e3';
  const RAMPS = {
    red: ['#5a1a2a', '#a22633', '#e43b44', '#ff7a6b'],
    yellow: ['#b86f50', '#f77622', '#feae34', '#fee761'],
    gold: ['#f77622', '#feae34', '#fee761', '#fff6c2'],
    purple: ['#2a1845', '#5a3c8a', '#8b5cc8', '#c39bea'],
    green: ['#193c3e', '#265c42', '#3e8948', '#63c74d'],
    brown: ['#3e2731', '#733e39', '#b86f50'],
    pink: ['#68386c', '#b55088', '#f6757a', '#ffb3c1'],
    steel: ['#1f1d33', '#2b2f4a', '#3a4466', '#5a6988'],
    grey: ['#3a4466', '#5a6988', '#8b9bb4', '#c0cbdc'],
    moon: ['#8b9bb4', '#c0cbdc', '#e8e8f0', '#ffffff'],
  };
  const SKY = ['#0e0b26', '#1d1645', '#33205e', '#5a2a77', '#8a3b7f', '#c4577a', '#f08a6b'];
  const PADDLE_BODY = ['#fee761', '#feae34', '#f77622', '#b86f50'];
  const PADDLE_CAP = ['#c0cbdc', '#8b9bb4', '#5a6988', '#3a4466'];
  const EXPLOSION = ['#fee761', '#feae34', '#f77622', '#e43b44', '#5a6988'];

  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16);
  const bayer = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const rand = (min, max) => Math.random() * (max - min) + min;
  const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);
  const hash = (x, y) => {
    const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return s - Math.floor(s);
  };
  const vibrate = (pattern) => navigator.vibrate && navigator.vibrate(pattern);

  const rgbCache = new Map();
  function rgb(hex) {
    let c = rgbCache.get(hex);
    if (!c) {
      const n = parseInt(hex.slice(1), 16);
      c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
      rgbCache.set(hex, c);
    }
    return c;
  }

  // Sombreado esférico con luz arriba-izquierda y tramado ordenado entre tonos.
  function shade(ramp, x, y, cx, cy, r, specular = true) {
    const lx = cx - r * 0.38;
    const ly = cy - r * 0.42;
    const d = dist(x, y, lx, ly);
    if (specular && d < r * 0.22) return HIGHLIGHT;
    const s = 1 - Math.min(1, d / (r * 1.75));
    const i = Math.floor(s * ramp.length + bayer(x | 0, y | 0) - 0.5);
    return ramp[clamp(i, 0, ramp.length - 1)];
  }

  // ---------- Sprites procedurales ----------

  const SPRITE_SIZE = 16;
  const SPRITE_PX = SPRITE_SIZE + 2;

  const GRAPES = [[4.4, 6], [8, 6], [11.6, 6], [6.2, 9.2], [9.8, 9.2], [8, 12.4]];
  const STAR = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? 3.2 : 7.8;
    return [8 + Math.cos(a) * r, 8.8 + Math.sin(a) * r];
  });

  function inPolygon(x, y, pts) {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i];
      const [xj, yj] = pts[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }

  function inEllipse(x, y, cx, cy, rx, ry) {
    const dx = (x - cx) / rx;
    const dy = (y - cy) / ry;
    return dx * dx + dy * dy <= 1;
  }

  const SPRITE_DEFS = {
    apple(x, y) {
      if (x >= 7.5 && x < 9 && y >= 1.5 && y < 5.5) return shade(RAMPS.brown, x, y, 8, 3, 2, false);
      if (inEllipse(x, y, 10.8, 3, 2.6, 1.3)) return shade(RAMPS.green, x, y, 10.8, 3, 2.6, false);
      if (dist(x, y, 5.8, 9.6) <= 5.2 || dist(x, y, 10.2, 9.6) <= 5.2) {
        return shade(RAMPS.red, x, y, 8, 9.6, 6.2);
      }
      return null;
    },
    banana(x, y) {
      if (dist(x, y, 8, 7.5) > 7 || dist(x, y, 6, 5) <= 6.3) return null;
      if (dist(x, y, 11, 1.2) < 2 || dist(x, y, 1.2, 9.1) < 2) return shade(RAMPS.brown, x, y, 6, 6, 4, false);
      return shade(RAMPS.yellow, x, y, 7, 7.5, 7, false);
    },
    grapes(x, y) {
      if (x >= 7.5 && x < 8.8 && y >= 1 && y < 4.5) return shade(RAMPS.brown, x, y, 8, 2.5, 2, false);
      if (inEllipse(x, y, 10.6, 2.6, 2.4, 1.2)) return shade(RAMPS.green, x, y, 10.6, 2.6, 2.4, false);
      for (const [gx, gy] of GRAPES) {
        if (dist(x, y, gx, gy) <= 2.05) return shade(RAMPS.purple, x, y, gx, gy, 2.05);
      }
      return null;
    },
    star(x, y) {
      return inPolygon(x, y, STAR) ? shade(RAMPS.gold, x, y, 8, 8.8, 7) : null;
    },
    heart(x, y) {
      const X = (x - 8) / 5.8;
      const Y = -(y - 8) / 5.8;
      const a = X * X + Y * Y - 1;
      return a * a * a - X * X * Y * Y * Y <= 0 ? shade(RAMPS.pink, x, y, 8, 7.5, 6.5) : null;
    },
    bomb(x, y) {
      if (x >= 12.5 && x < 14 && y >= 2 && y < 4.5) return shade(RAMPS.brown, x, y, 13, 3, 2, false);
      if (x >= 9.5 && x < 12.5 && y >= 3.5 && y < 6.5) return shade(RAMPS.grey, x, y, 10, 4, 3, false);
      if (dist(x, y, 7.5, 9.8) <= 5.6) return shade(RAMPS.steel, x, y, 7.5, 9.8, 5.6);
      return null;
    },
  };

  function makeSprite(w, h, sample, outline = OUTLINE) {
    const W2 = w + 2;
    const H2 = h + 2;
    const c = document.createElement('canvas');
    c.width = W2;
    c.height = H2;
    const cg = c.getContext('2d');
    const img = cg.createImageData(W2, H2);
    const cells = new Array(W2 * H2);
    for (let y = 0; y < H2; y++) {
      for (let x = 0; x < W2; x++) cells[y * W2 + x] = sample(x - 0.5, y - 0.5);
    }
    const at = (x, y) => (x < 0 || y < 0 || x >= W2 || y >= H2 ? null : cells[y * W2 + x]);
    for (let y = 0; y < H2; y++) {
      for (let x = 0; x < W2; x++) {
        let col = at(x, y);
        if (!col && outline && (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1))) col = outline;
        if (!col) continue;
        const [r, gg, b] = rgb(col);
        const i = (y * W2 + x) * 4;
        img.data[i] = r;
        img.data[i + 1] = gg;
        img.data[i + 2] = b;
        img.data[i + 3] = 255;
      }
    }
    cg.putImageData(img, 0, 0);
    return c;
  }

  const sprites = {};
  for (const [name, fn] of Object.entries(SPRITE_DEFS)) {
    sprites[name] = makeSprite(SPRITE_SIZE, SPRITE_SIZE, fn);
  }

  function makeCloud(w, h, blobs) {
    return makeSprite(w, h, (x, y) => {
      if (y > h - 1.5) return null;
      for (const [cx, cy, r] of blobs) {
        if (dist(x, y, cx, cy) <= r) {
          const t = (y - (cy - r)) / (r * 2);
          return t + bayer(x | 0, y | 0) * 0.35 < 0.45 ? '#f6757a' : '#b55088';
        }
      }
      return null;
    }, null);
  }

  const CLOUD_SPRITES = [
    makeCloud(28, 10, [[6, 7, 3.5], [12, 5, 4.5], [19, 6, 4], [24, 7.5, 2.8]]),
    makeCloud(20, 8, [[5, 5.5, 3], [10, 4, 3.8], [15, 5.5, 3]]),
  ];

  const spriteURLs = {};
  for (const [name, c] of Object.entries(sprites)) spriteURLs[name] = c.toDataURL();
  document.querySelectorAll('img[data-sprite]').forEach((img) => {
    img.src = spriteURLs[img.dataset.sprite];
  });

  // ---------- Fuente bitmap 3x5 para textos flotantes ----------

  const FONT = {
    0: ['111', '101', '101', '101', '111'],
    1: ['010', '110', '010', '010', '111'],
    2: ['111', '001', '111', '100', '111'],
    3: ['111', '001', '111', '001', '111'],
    4: ['101', '101', '111', '001', '001'],
    5: ['111', '100', '111', '001', '111'],
    6: ['111', '100', '111', '101', '111'],
    7: ['111', '001', '010', '010', '010'],
    8: ['111', '101', '111', '101', '111'],
    9: ['111', '101', '111', '001', '111'],
    '+': ['000', '010', '111', '010', '000'],
    '-': ['000', '000', '111', '000', '000'],
  };

  function drawText(str, cx, cy, color, size = 2) {
    const w = (str.length * 4 - 1) * size;
    const x0 = Math.round(cx - w / 2);
    const y0 = Math.round(cy - (5 * size) / 2);
    const pixels = [];
    [...str].forEach((ch, n) => {
      const glyph = FONT[ch];
      if (!glyph) return;
      glyph.forEach((row, ry) => {
        for (let rx = 0; rx < 3; rx++) {
          if (row[rx] === '1') pixels.push([x0 + (n * 4 + rx) * size, y0 + ry * size]);
        }
      });
    });
    g.fillStyle = OUTLINE;
    for (const [px, py] of pixels) g.fillRect(px - 1, py - 1, size + 2, size + 2);
    g.fillStyle = color;
    for (const [px, py] of pixels) g.fillRect(px, py, size, size);
  }

  // ---------- Configuración del juego ----------

  const ITEM_TYPES = [
    { sprite: 'apple', points: 10, weight: 5, kind: 'good', colors: RAMPS.red },
    { sprite: 'banana', points: 10, weight: 4, kind: 'good', colors: RAMPS.yellow },
    { sprite: 'grapes', points: 20, weight: 2, kind: 'good', colors: RAMPS.purple },
    { sprite: 'star', points: 50, weight: 0.8, kind: 'good', colors: RAMPS.gold, speedMul: 1.35 },
    { sprite: 'heart', points: 0, weight: 0.25, kind: 'life', colors: RAMPS.pink },
    { sprite: 'bomb', points: 0, weight: 1.2, kind: 'bomb', colors: EXPLOSION },
  ];

  const START_LIVES = 3;
  const MAX_LIVES = 3;
  const BEST_KEY = 'atrapa-best';
  const ITEM_R = 8;

  // Campo de juego fijo (9:16) para que la dificultad sea igual en cualquier pantalla.
  const FIELD_W = 180;
  const FIELD_H = 320;
  const FIELD_GROUND = 20;
  const PADDLE_W = 44;

  // Velocidad exponencial: el tiempo de caída se divide entre 2 cada SPEED_DOUBLING segundos.
  const BASE_FALL_TIME = 3.4;
  const BASE_SPAWN_INTERVAL = 1.0;
  const SPEED_DOUBLING = 45;
  const MAX_SPEED_FACTOR = 5;

  let LW = 0;
  let LH = 0;
  let scale = 1;
  let fieldX = 0;
  let groundY = 0;
  let background = null;
  let stars = [];
  let clouds = [];

  const paddle = { x: 0, y: 0, w: 0, h: 6, targetX: 0, squash: 0 };
  let items = [];
  let particles = [];
  let texts = [];

  let state = 'menu'; // menu | playing | paused | over
  let score = 0;
  let lives = START_LIVES;
  let elapsed = 0;
  let clock = 0;
  let spawnTimer = 0;
  let lastTime = 0;
  let shake = 0;
  let flash = 0;
  let best = loadBest();

  const keys = { left: false, right: false };

  function loadBest() {
    try {
      return Number(localStorage.getItem(BEST_KEY)) || 0;
    } catch {
      return 0;
    }
  }

  function saveBest() {
    try {
      localStorage.setItem(BEST_KEY, String(best));
    } catch {}
  }

  // ---------- Tamaño y escena ----------

  function resize() {
    const relX = LW ? (paddle.x - fieldX) / FIELD_W : 0.5;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    // Escala entera más grande que permite que el campo completo quepa en pantalla.
    scale = Math.max(1, Math.floor(Math.min(canvas.width / FIELD_W, canvas.height / FIELD_H)));
    LW = Math.ceil(canvas.width / scale);
    LH = Math.ceil(canvas.height / scale);
    buffer.width = LW;
    buffer.height = LH;
    ctx.imageSmoothingEnabled = false;
    g.imageSmoothingEnabled = false;

    // El espacio sobrante va sobre todo arriba (zona del HUD); abajo solo lo justo
    // para no chocar con la barra de gestos del móvil.
    const cssToLogical = dpr / scale;
    const extraH = LH - FIELD_H;
    const bottomPad = Math.min(extraH, Math.round(40 * cssToLogical));
    const fieldY = LH - FIELD_H - bottomPad;
    fieldX = Math.floor((LW - FIELD_W) / 2);
    groundY = fieldY + FIELD_H - FIELD_GROUND;

    paddle.w = PADDLE_W;
    paddle.y = groundY - 14;
    paddle.x = fieldX + clamp(relX * FIELD_W, paddle.w / 2, FIELD_W - paddle.w / 2);
    paddle.targetX = paddle.x;

    buildBackground();
    initScenery();
  }

  function buildBackground() {
    background = document.createElement('canvas');
    background.width = LW;
    background.height = LH;
    const bg = background.getContext('2d');
    const img = bg.createImageData(LW, LH);

    const moonX = Math.round(LW * 0.76);
    const moonY = Math.round(LH * 0.13);
    const moonR = 9;
    const farBase = LH * 0.2;
    const nearBase = LH * 0.09;

    for (let y = 0; y < LH; y++) {
      for (let x = 0; x < LW; x++) {
        let col;
        const far = groundY - (farBase + Math.sin(x * 0.05) * 8 + Math.sin(x * 0.13 + 1) * 4 + Math.sin(x * 0.31) * 1.5);
        const near = groundY - (nearBase + Math.sin(x * 0.07 + 2) * 6 + Math.sin(x * 0.19) * 3);
        const gy = y - groundY;

        if (gy >= 0) {
          if (gy === 0) col = '#63c74d';
          else if (gy === 1) col = bayer(x, y) < 0.5 ? '#63c74d' : '#3e8948';
          else if (gy === 2) col = '#3e8948';
          else if (gy === 3) col = bayer(x, y) < 0.5 ? '#265c42' : '#733e39';
          else {
            const h = hash(x >> 1, y >> 1);
            col = h > 0.93 ? '#b86f50' : bayer(x, y) < 0.25 + gy * 0.01 ? '#3e2731' : '#733e39';
          }
        } else if (y >= near) {
          col = y < near + 1 ? '#3a2466' : '#211640';
        } else if (y >= far) {
          col = y < far + 1 ? '#6a3f8f' : bayer(x, y) < 0.2 ? '#33205e' : '#43286f';
        } else if (dist(x + 0.5, y + 0.5, moonX, moonY) <= moonR) {
          const crater =
            dist(x, y, moonX + 2, moonY - 3) < 2 ||
            dist(x, y, moonX - 3, moonY + 2) < 1.6 ||
            dist(x, y, moonX + 3, moonY + 4) < 1.2;
          col = shade(RAMPS.moon, x + 0.5, y + 0.5, moonX, moonY, moonR, false);
          if (crater) col = '#8b9bb4';
        } else {
          const t = (y / groundY) * (SKY.length - 1);
          col = SKY[clamp(Math.floor(t + bayer(x, y)), 0, SKY.length - 1)];
          if (y < groundY * 0.6 && hash(x, y) > 0.994) col = hash(y, x) > 0.5 ? '#c0cbdc' : '#5a6988';
        }

        const [r, gg, b] = rgb(col);
        const i = (y * LW + x) * 4;
        img.data[i] = r;
        img.data[i + 1] = gg;
        img.data[i + 2] = b;
        img.data[i + 3] = 255;
      }
    }
    bg.putImageData(img, 0, 0);
  }

  function initScenery() {
    stars = Array.from({ length: 14 }, () => ({
      x: Math.floor(rand(0, LW)),
      y: Math.floor(rand(0, groundY * 0.5)),
      phase: rand(0, Math.PI * 2),
      speed: rand(1.5, 4),
    }));
    clouds = Array.from({ length: 4 }, () => ({
      sprite: CLOUD_SPRITES[Math.floor(rand(0, CLOUD_SPRITES.length))],
      x: rand(-30, LW),
      y: rand(LH * 0.12, LH * 0.45),
      speed: rand(2, 6),
    }));
  }

  // ---------- Entrada ----------

  const toLogicalX = (clientX) => (clientX * canvas.width) / canvas.clientWidth / scale;

  canvas.addEventListener('pointerdown', (e) => {
    if (state !== 'playing') return;
    if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
    paddle.targetX = toLogicalX(e.clientX);
  });

  canvas.addEventListener('pointermove', (e) => {
    if (state !== 'playing') return;
    paddle.targetX = toLogicalX(e.clientX);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
    if (e.key === 'Escape' || e.key === 'p') {
      if (state === 'playing') pause();
      else if (state === 'paused') resume();
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
  });

  // Evita el zoom por gesto en iOS Safari.
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('dblclick', (e) => e.preventDefault());

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state === 'playing') pause();
  });

  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 200));

  $('btn-start').addEventListener('click', startGame);
  $('btn-restart').addEventListener('click', startGame);
  $('btn-pause').addEventListener('click', pause);
  $('btn-resume').addEventListener('click', resume);
  $('btn-quit').addEventListener('click', toMenu);
  $('btn-menu').addEventListener('click', toMenu);

  // ---------- Estados ----------

  function showScreen(name) {
    for (const [key, el] of Object.entries(ui.screens)) {
      el.classList.toggle('hidden', key !== name);
    }
    ui.hud.classList.toggle('hidden', name !== null && name !== 'pause');
  }

  function startGame() {
    score = 0;
    lives = START_LIVES;
    elapsed = 0;
    spawnTimer = 0.6;
    items = [];
    particles = [];
    texts = [];
    shake = 0;
    flash = 0;
    paddle.x = paddle.targetX = fieldX + FIELD_W / 2;
    updateHud();
    state = 'playing';
    lastTime = performance.now();
    showScreen(null);
  }

  function pause() {
    if (state !== 'playing') return;
    state = 'paused';
    keys.left = keys.right = false;
    showScreen('pause');
  }

  function resume() {
    if (state !== 'paused') return;
    state = 'playing';
    lastTime = performance.now();
    showScreen(null);
  }

  function toMenu() {
    state = 'menu';
    items = [];
    particles = [];
    texts = [];
    ui.bestStart.textContent = best;
    showScreen('start');
  }

  function gameOver() {
    state = 'over';
    const isRecord = score > best;
    if (isRecord) {
      best = score;
      saveBest();
    }
    ui.finalScore.textContent = score;
    ui.bestOver.textContent = best;
    ui.newRecord.classList.toggle('hidden', !isRecord);
    vibrate([80, 60, 160]);
    showScreen('over');

    // Evita reiniciar sin querer con un toque que venía de la partida.
    ui.btnRestart.disabled = true;
    setTimeout(() => (ui.btnRestart.disabled = false), 700);
  }

  function updateHud() {
    ui.score.textContent = score;
    ui.lives.replaceChildren(
      ...Array.from({ length: Math.max(0, lives) }, () => {
        const img = document.createElement('img');
        img.src = spriteURLs.heart;
        img.alt = '';
        return img;
      })
    );
  }

  function bumpScore() {
    ui.score.classList.remove('bump');
    void ui.score.offsetWidth;
    ui.score.classList.add('bump');
  }

  // ---------- Lógica de juego ----------

  function speedFactor() {
    return Math.min(MAX_SPEED_FACTOR, Math.pow(2, elapsed / SPEED_DOUBLING));
  }

  function spawnInterval() {
    return Math.max(0.25, BASE_SPAWN_INTERVAL / Math.pow(speedFactor(), 0.7));
  }

  // La velocidad se calcula para que el tiempo hasta la barra sea el mismo en cualquier pantalla,
  // aunque en móviles alargados los objetos aparezcan más arriba del campo.
  function fallSpeed(spawnY) {
    return ((paddle.y - spawnY) / BASE_FALL_TIME) * speedFactor();
  }

  function pickType() {
    const bombBoost = Math.min(elapsed / 90, 1);
    const weights = ITEM_TYPES.map((t) => {
      if (t.kind === 'bomb') return t.weight * (1 + bombBoost * 1.5);
      if (t.kind === 'life' && lives >= MAX_LIVES) return 0;
      return t.weight;
    });
    let roll = Math.random() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < ITEM_TYPES.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return ITEM_TYPES[i];
    }
    return ITEM_TYPES[0];
  }

  function spawn() {
    const type = pickType();
    const y = -ITEM_R - 2;
    items.push({
      type,
      x: fieldX + rand(ITEM_R + 2, FIELD_W - ITEM_R - 2),
      y,
      vy: fallSpeed(y) * (type.speedMul || 1) * rand(0.85, 1.15),
    });
  }

  function burst(x, y, colors, count, speed, size = 1) {
    for (let i = 0; i < count; i++) {
      const a = rand(Math.PI, Math.PI * 2);
      const v = rand(speed * 0.4, speed);
      particles.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life: rand(0.35, 0.7),
        color: colors[Math.floor(rand(0, colors.length))],
        size,
      });
    }
  }

  function addText(x, y, text, color) {
    texts.push({ x, y, text, color, life: 0.8 });
  }

  function loseLife() {
    lives--;
    updateHud();
    if (lives <= 0) gameOver();
  }

  function onCatch(it) {
    paddle.squash = 1;
    const x = it.x;
    const y = paddle.y - 2;
    switch (it.type.kind) {
      case 'good':
        score += it.type.points;
        updateHud();
        bumpScore();
        burst(x, y, it.type.colors, 10, 70);
        addText(x, y - 8, `+${it.type.points}`, '#fee761');
        vibrate(15);
        break;
      case 'life':
        lives = Math.min(MAX_LIVES, lives + 1);
        updateHud();
        burst(x, y, it.type.colors, 12, 70);
        addText(x, y - 8, '+1', '#ffb3c1');
        vibrate(25);
        break;
      case 'bomb':
        burst(x, y, EXPLOSION, 28, 120, 2);
        addText(x, y - 8, '-1', '#e43b44');
        shake = 0.35;
        flash = 0.3;
        vibrate([60, 40, 60]);
        loseLife();
        break;
    }
  }

  function onMiss(it) {
    if (it.type.kind !== 'good') return;
    burst(it.x, groundY, it.type.colors, 8, 50);
    addText(it.x, groundY - 12, '-1', '#e43b44');
    flash = 0.2;
    vibrate(40);
    loseLife();
  }

  function update(dt) {
    elapsed += dt;

    const keySpeed = FIELD_W * 1.2;
    if (keys.left) paddle.targetX -= keySpeed * dt;
    if (keys.right) paddle.targetX += keySpeed * dt;
    paddle.targetX = clamp(paddle.targetX, fieldX + paddle.w / 2, fieldX + FIELD_W - paddle.w / 2);
    paddle.x += (paddle.targetX - paddle.x) * Math.min(1, dt * 25);

    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawn();
      spawnTimer = spawnInterval();
    }

    const left = paddle.x - paddle.w / 2;
    const right = paddle.x + paddle.w / 2;
    const top = paddle.y;
    const bottom = paddle.y + paddle.h;

    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      const prevBottom = it.y + ITEM_R * 0.75;
      it.y += it.vy * dt;
      const curBottom = it.y + ITEM_R * 0.75;

      const crossesPaddle = prevBottom <= bottom && curBottom >= top;
      const withinX = it.x >= left - ITEM_R * 0.5 && it.x <= right + ITEM_R * 0.5;

      if (crossesPaddle && withinX) {
        items.splice(i, 1);
        onCatch(it);
        if (state !== 'playing') return;
        continue;
      }

      if (curBottom >= groundY) {
        items.splice(i, 1);
        onMiss(it);
        if (state !== 'playing') return;
      }
    }
  }

  function updateEffects(dt) {
    clock += dt;
    paddle.squash = Math.max(0, paddle.squash - dt * 6);
    shake = Math.max(0, shake - dt);
    flash = Math.max(0, flash - dt);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      p.vy += 220 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0 || p.y > groundY) particles.splice(i, 1);
    }

    for (let i = texts.length - 1; i >= 0; i--) {
      const t = texts[i];
      t.life -= dt;
      t.y -= 20 * dt;
      if (t.life <= 0) texts.splice(i, 1);
    }

    for (const c of clouds) {
      c.x += c.speed * dt;
      if (c.x > LW + 4) {
        c.x = -c.sprite.width - rand(0, 40);
        c.y = rand(LH * 0.12, LH * 0.45);
      }
    }
  }

  // ---------- Dibujo ----------

  function drawScenery() {
    g.drawImage(background, 0, 0);

    for (const s of stars) {
      const v = Math.sin(clock * s.speed + s.phase);
      if (v < 0.2) continue;
      g.fillStyle = v > 0.85 ? '#ffffff' : '#c0cbdc';
      g.fillRect(s.x, s.y, 1, 1);
      if (v > 0.92) {
        g.fillStyle = '#8b9bb4';
        g.fillRect(s.x - 1, s.y, 1, 1);
        g.fillRect(s.x + 1, s.y, 1, 1);
        g.fillRect(s.x, s.y - 1, 1, 1);
        g.fillRect(s.x, s.y + 1, 1, 1);
      }
    }

    for (const c of clouds) g.drawImage(c.sprite, Math.round(c.x), Math.round(c.y));

    drawFieldBounds();
  }

  function drawFieldBounds() {
    if (fieldX <= 1) return;
    const right = fieldX + FIELD_W;
    g.fillStyle = 'rgba(14, 11, 38, 0.5)';
    g.fillRect(0, 0, fieldX, LH);
    g.fillRect(right, 0, LW - right, LH);
    g.fillStyle = OUTLINE;
    g.fillRect(fieldX - 1, 0, 1, LH);
    g.fillRect(right, 0, 1, LH);
    g.fillStyle = '#5a6988';
    g.fillRect(fieldX - 2, 0, 1, LH);
    g.fillRect(right + 1, 0, 1, LH);
  }

  function drawPaddle() {
    const sq = paddle.squash > 0.5 ? 1 : 0;
    const w = paddle.w;
    const h = paddle.h - sq;
    const x = Math.round(paddle.x - w / 2);
    const y = Math.round(paddle.y) + sq;
    const capW = 4;

    g.fillStyle = 'rgba(24, 20, 37, 0.5)';
    g.fillRect(x + 2, groundY + 1, w - 4, 2);

    g.fillStyle = OUTLINE;
    g.fillRect(x, y - 1, w, h + 2);
    g.fillRect(x - 1, y, w + 2, h);

    for (let i = 0; i < h; i++) {
      const inset = i === 0 || i === h - 1 ? 1 : 0;
      const t = i / (h - 1);
      g.fillStyle = PADDLE_BODY[Math.round(t * (PADDLE_BODY.length - 1))];
      g.fillRect(x + capW, y + i, w - capW * 2, 1);
      g.fillStyle = PADDLE_CAP[Math.round(t * (PADDLE_CAP.length - 1))];
      g.fillRect(x + inset, y + i, capW - inset, 1);
      g.fillRect(x + w - capW, y + i, capW - inset, 1);
    }

    g.fillStyle = OUTLINE;
    g.fillRect(x + capW, y, 1, h);
    g.fillRect(x + w - capW - 1, y, 1, h);

    g.fillStyle = HIGHLIGHT;
    g.fillRect(x + capW + 2, y + 1, Math.max(2, Math.floor(w * 0.25)), 1);
    g.fillRect(x + 1, y + 1, 1, 1);
    g.fillRect(x + w - capW + 1, y + 1, 1, 1);
  }

  function drawItems() {
    const half = SPRITE_PX / 2;
    for (const it of items) {
      const sx = Math.round(it.x - half);
      const sy = Math.round(it.y - half);
      g.drawImage(sprites[it.type.sprite], sx, sy);

      if (it.type.kind === 'bomb') {
        const flick = Math.floor(clock * 16) % 2;
        g.fillStyle = flick ? '#fee761' : '#f77622';
        g.fillRect(sx + 14, sy + 1 + flick, 1, 1);
        g.fillStyle = '#e43b44';
        g.fillRect(sx + 15 - flick, sy + flick, 1, 1);
      }
    }
  }

  function drawEffects() {
    for (const p of particles) {
      g.fillStyle = p.color;
      g.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    for (const t of texts) {
      if (t.life < 0.25 && Math.floor(clock * 20) % 2) continue;
      drawText(t.text, t.x, t.y, t.color);
    }
  }

  function render() {
    drawScenery();
    drawItems();
    drawPaddle();
    drawEffects();

    if (flash > 0) {
      g.fillStyle = `rgba(228, 59, 68, ${Math.min(0.5, flash * 1.5)})`;
      g.fillRect(0, 0, LW, LH);
    }

    let ox = 0;
    let oy = 0;
    if (shake > 0) {
      ox = Math.round(rand(-2, 2)) * scale;
      oy = Math.round(rand(-2, 2)) * scale;
    }
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(buffer, ox, oy, LW * scale, LH * scale);
  }

  // ---------- Bucle principal ----------

  function loop(t) {
    const dt = Math.min((t - lastTime) / 1000 || 0, 0.05);
    lastTime = t;

    if (state === 'playing') update(dt);
    if (state !== 'paused') updateEffects(dt);
    render();

    requestAnimationFrame(loop);
  }

  resize();
  ui.bestStart.textContent = best;
  updateHud();
  showScreen('start');
  requestAnimationFrame((t) => {
    lastTime = t;
    loop(t);
  });
})();
