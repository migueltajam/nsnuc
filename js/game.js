import {
  OUTLINE, SKY_TOP, ROAD, MARGIN, clamp, rand, vibrate,
  ITEM_TYPES, START_LIVES, MAX_LIVES, BEST_KEY, ITEM_R, LEVEL_TIME,
  FIELD_W, FIELD_H, GROUND_Y, BASKET_Y, BASKET_W, BASKET_CX, SPAWN_Y, MAX_TOP_CROP, MAX_SIDE_EXTEND, MAX_SIDE_UNITS, SIDE_TOLERANCE,
  BASE_FALL_TIME, BASE_SPAWN_INTERVAL, SPEED_DOUBLING, MAX_SPEED_FACTOR, DIFFICULTY_PHASES
} from './config.js';
import { ART, sprites, player, drawText } from './sprites.js';
import { ui, showScreen, updateHud, updateCombo, bumpScore, ensureNickname,
  showEasterEgg, hideEasterEgg, showCountdown, hideCountdown,
  updateGameOverStats, showAchievementToast, resetToasts } from './ui.js';
import { audio } from './audio.js';
import { rankingGameOver, refreshRanking } from './ranking-ui.js';
import { unlockAchievement, newRun } from './achievements.js';
import {
  prepareEnvironment,
  renderEnvironment,
  renderSceneExtensions,
  renderSideBuildings,
  getWorldTimeLabel,
  getWorldHour,
  DAY_SECONDS,
} from './environment.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
// Buffer de baja resolución para sprites; fachada por separado a resolución nativa.
const buffer = document.createElement('canvas');
const g = buffer.getContext('2d');

  const facade = new Image();
  let facadeReady = false;
facade.onload = () => {
  facadeReady = true;
  prepareEnvironment(facade);
  buildBackground();
};
  // Usamos el PNG aportado: al recibir fachada.svg original, se puede sustituir aquí.
  facade.src = './assets/images/fachada.png';

  // El lettering del letrero se pinta aparte con su resolución original (el doble que
  // la fachada): en el PNG está reducido y algunas letras salen mordidas.
  const lettering = new Image();
  let letteringReady = false;
  lettering.onload = () => {
    letteringReady = true;
    buildBackground();
  };
  lettering.src = './assets/images/lettering.png';

  let LW = 0;
  let LH = 0;
  let scale = 1;
  let fieldX = 0;
  let fieldY = 0;
  let groundY = 0;
  let background = null;

  const paddle = { x: 0, y: 0, w: BASKET_W, h: 4, targetX: 0, squash: 0, moving: 0 };
  let items = [];
  let particles = [];
  let texts = [];

  let state = 'menu'; // menu | countdown | playing | paused | over
  let pausedFrom = 'playing';
  let countdownRemaining = 0;
  let lastCountdownValue = 3;
  let goTimer = 0;
  let resumeMusic = false; // tras una pausa, la música sigue donde estaba
  let combo = 0;
  let bestCombo = 0;
  let timeSinceGood = 0;
  let stats = { kisses: 0, hearts: 0, pumpkins: 0, duration: 0, bestCombo: 0 };
  let score = 0;
  let lives = START_LIVES;
  let level = 1;
  let elapsed = 0;
  let clock = 0;
  const worldClock = document.getElementById('world-clock');
  let lastWorldLabel = '';
  let spawnTimer = 0;
  let lastTime = 0;
  let shake = 0;
  let flash = 0;
  let best = loadBest();
  let timeWithoutCatching = 0;
  let easterEggShown = false;
  // Contadores de los logros
  let pumpkinsDodged = 0; // calabazas esquivadas seguidas sin recibir daño
  let nightKisses = 0; // besos recogidos en la noche actual
  const isNight = () => { const h = getWorldHour(clock); return h >= 19 || h < 7; };

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

  // Altura de la zona segura inferior (barra de gestos del iPhone en modo app), en px CSS.
  const safeBottomProbe = document.createElement('div');
  safeBottomProbe.style.cssText =
    'position:fixed;left:0;bottom:0;width:1px;height:env(safe-area-inset-bottom);visibility:hidden;pointer-events:none';
  document.body.appendChild(safeBottomProbe);

  // true: la pantalla es un poco más ancha que la escena y se prolonga la fachada a los lados.
  let extendSides = false;

  function resize() {
    const relX = LW ? (paddle.x - fieldX) / FIELD_W : 0.5;
    // Resolución real del móvil (hasta 3x): con escala fraccional los píxeles quedan uniformes.
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const bounds = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(bounds.width * dpr));
    canvas.height = Math.max(1, Math.round(bounds.height * dpr));

    const W = canvas.width;
    const H = canvas.height;
    const bottomPadPx = (safeBottomProbe.offsetHeight + 4) * dpr;
    const usableH = Math.max(1, H - bottomPadPx);

    // 1. Ocupar todo el ancho si cabe la escena recortando como mucho MAX_TOP_CROP de cielo.
    // 2. Si no, encajar esa altura y continuar la calle con edificios vecinos a los lados.
    // 3. En pantallas anchas (escritorio, horizontal) se muestra la escena entera con márgenes.
    const fillWidth = W / FIELD_W;
    const fitCropped = usableH / (FIELD_H - MAX_TOP_CROP);
    if (fillWidth <= fitCropped) {
      scale = fillWidth;
      extendSides = false;
    } else if ((W - fitCropped * FIELD_W) / 2 <= W * MAX_SIDE_EXTEND) {
      scale = fitCropped;
      extendSides = true;
    } else {
      const contain = Math.min(fillWidth, usableH / FIELD_H);
      scale = contain < 2 ? contain : Math.floor(contain);
      extendSides = false;
    }

    LW = Math.ceil(W / scale);
    LH = Math.ceil(H / scale);
    buffer.width = LW;
    buffer.height = LH;
    ctx.imageSmoothingEnabled = false;
    g.imageSmoothingEnabled = false;

    // La calle queda pegada abajo; lo que sobre (móviles altos) va al cielo, bajo el HUD,
    // y lo que falte (móviles bajos) se recorta del cielo.
    fieldY = Math.floor(LH - FIELD_H - bottomPadPx / scale);
    fieldX = Math.floor((LW - FIELD_W) / 2);
    groundY = fieldY + GROUND_Y;

    paddle.y = fieldY + BASKET_Y;
    paddle.x = fieldX + clamp(relX * FIELD_W, minX(), maxX());
    paddle.targetX = paddle.x;

    placeHud(W, dpr);
    buildBackground();
  }

  // El marcador va siempre encima de la calle, nunca sobre los márgenes oscuros.
  // En ordenador se agranda un poco el marcador y los menús para pantallas grandes.
  function placeHud(W, dpr) {
    let leftUnits = 0;
    let rightUnits = 0;
    if (extendSides) {
      const side = (u) => (u > MAX_SIDE_UNITS + SIDE_TOLERANCE ? MAX_SIDE_UNITS : u);
      leftUnits = side(fieldX + 2);
      rightUnits = side(W / scale - fieldX - FIELD_W + 2);
    }
    const leftPx = Math.max(0, (fieldX - leftUnits) * scale / dpr);
    const rightPx = Math.max(0, (W / scale - fieldX - FIELD_W - rightUnits) * scale / dpr);
    const root = document.documentElement.style;
    root.setProperty('--street-left', `${Math.floor(leftPx)}px`);
    root.setProperty('--street-right', `${Math.floor(rightPx)}px`);
    const desktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const zoom = desktop ? clamp(window.innerHeight / 820, 1, 1.5) : 1;
    root.setProperty('--ui-zoom', zoom.toFixed(3));
  }

  // El jugador no puede salirse del campo: los codos sobresalen de la cesta.
  const minX = () => BASKET_CX - player.ox;
  const maxX = () => FIELD_W - (player.ox + player.canvas.width - BASKET_CX);

  function buildBackground() {
    background = document.createElement('canvas');
    background.width = canvas.width;
    background.height = canvas.height;
    const bg = background.getContext('2d');
    bg.imageSmoothingEnabled = false;

    const fx = fieldX * scale;
    const fy = fieldY * scale;
    const fw = FIELD_W * scale;
    const fh = FIELD_H * scale;

    bg.fillStyle = MARGIN;
    bg.fillRect(0, 0, background.width, background.height);
    // El cielo sigue hacia arriba y la calzada hacia abajo, solo dentro del ancho del campo.
    bg.fillStyle = SKY_TOP;
    bg.fillRect(fx, 0, fw, Math.max(0, fy) + scale);
    bg.fillStyle = ROAD;
    bg.fillRect(fx, fy + fh - scale, fw, background.height - fy - fh + scale);
    if (facadeReady) bg.drawImage(facade, fx, fy, fw, fh);
    if (facadeReady && letteringReady) {
      // Papel limpio del letrero (x 32–147, y 310–324) y el lettering encima.
      bg.fillStyle = 'rgb(245,235,222)';
      bg.fillRect(Math.round(fx + 32 * scale), Math.round(fy + 310 * scale),
        Math.round(116 * scale), Math.round(15 * scale));
      bg.drawImage(lettering, fx + 36 * scale, fy + 311.5 * scale, 108 * scale, 12.5 * scale);
    }

    // Con la calle extendida, el borde de la fachada se prolonga un poco bajo los
    // edificios laterales: así no asoma una línea del fondo en la unión.
    const cap = MAX_SIDE_UNITS * scale;
    if (extendSides && facadeReady && fx > 0) {
      // Solo un par de unidades: lo justo para tapar la unión, sin asomar por los bordes
      const l = Math.max(0, Math.floor(fx - 2 * scale));
      bg.drawImage(facade, 0, 0, 1, FIELD_H, l, fy, Math.ceil(fx) + 1 - l, fh);
      const r0 = Math.floor(fx + fw) - 1;
      const r1 = Math.min(background.width, Math.ceil(fx + fw + 2 * scale));
      bg.drawImage(facade, FIELD_W - 1, 0, 1, FIELD_H, r0, fy, r1 - r0, fh);
    }
    // Si la pantalla es más ancha que la calle, filo oscuro donde termina
    if (extendSides && fx > cap + SIDE_TOLERANCE * scale) {
      bg.fillStyle = "#0f1628";
      bg.fillRect(Math.floor(fx - cap) - scale, 0, scale, background.height);
      bg.fillRect(Math.ceil(fx + fw + cap), 0, scale, background.height);
    }

    // Filo oscuro a los lados cuando la pantalla es más ancha que el campo.
    if (fx > 0 && !extendSides) {
      bg.fillStyle = "#0f1628";
      bg.fillRect(fx - scale, 0, scale, background.height);
      bg.fillRect(fx + fw, 0, scale, background.height);
    }
  }

  // ---------- Entrada ----------

  const toLogicalX = (clientX) => {
    const rect = canvas.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width * canvas.width) / scale;
  };

  let touchPointer = null;
  canvas.addEventListener('pointerdown', (e) => {
    if (state !== 'playing') return;
    if (e.pointerType === 'touch') touchPointer = e.pointerId;
    if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
    paddle.targetX = toLogicalX(e.clientX);
    if (e.cancelable) e.preventDefault();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (state !== 'playing') return;
    if (e.pointerType === 'touch' && touchPointer !== e.pointerId) return;
    paddle.targetX = toLogicalX(e.clientX);
    if (e.pointerType === 'touch' && e.cancelable) e.preventDefault();
  });
  for (const eventName of ['pointerup','pointercancel']) {
    canvas.addEventListener(eventName, (e) => {if (e.pointerId === touchPointer) touchPointer = null;});
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
    if (['ArrowLeft','ArrowRight',' '].includes(e.key) && ['playing','countdown'].includes(state)) e.preventDefault();
    if (e.key === 'Escape' || e.key === 'p') {
      if (state === 'playing' || state === 'countdown') pause();
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
    if (document.hidden && (state === 'playing' || state === 'countdown')) pause();
  });

  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 200));

  export function startGame() {
    if (!ensureNickname()) return;
    // El desbloqueo de audio se lanza en el propio click (gesto de usuario).
    void audio.unlock();
    // La música no se corta entre partidas: sigue sonando desde el menú o el fin de partida.
    newRun();
    resetToasts();
    score = 0;
    lives = START_LIVES;
    level = 1;
    elapsed = 0;
    clock = 0;
    combo = 0;
    bestCombo = 0;
    timeSinceGood = 0;
    stats = { kisses: 0, hearts: 0, pumpkins: 0, duration: 0, bestCombo: 0 };
    updateCombo(0, 1);
    timeWithoutCatching = 0;
    easterEggShown = false;
    pumpkinsDodged = 0;
    nightKisses = 0;
    hideEasterEgg();
    spawnTimer = 0.6;
    items = [];
    particles = [];
    texts = [];
    shake = 0;
    flash = 0;
    paddle.x = paddle.targetX = fieldX + BASKET_CX;
    updateHud(score, level, lives);
    state = 'countdown';
    resumeMusic = false;
    countdownRemaining = 3;
    lastCountdownValue = 3;
    goTimer = 0;
    lastTime = performance.now();
    showScreen(null);
    showCountdown(3);
    audio.sfx('tick');
  }

  export function isRunning() {
    return state === 'playing' || state === 'countdown';
  }

  export function pause() {
    if (state !== 'playing' && state !== 'countdown') return;
    pausedFrom = state;
    state = 'paused';
    audio.pauseMusic();
    hideCountdown();
    keys.left = keys.right = false;
    showScreen('pause');
  }

  export function resume() {
    if (state !== 'paused') return;
    // Al volver de la pausa, cuenta atrás de 3 s con el juego quieto, como al empezar.
    if (pausedFrom === 'playing') resumeMusic = true;
    state = 'countdown';
    countdownRemaining = 3;
    lastCountdownValue = 3;
    goTimer = 0;
    lastTime = performance.now();
    showScreen(null);
    showCountdown(3);
    audio.sfx('tick');
  }

  export function toMenu() {
    state = 'menu';
    audio.startMusic(true); // en el menú sigue sonando (también al salir desde la pausa)
    hideCountdown();
    hideEasterEgg();
    resetToasts();
    elapsed = 0;
    items = [];
    particles = [];
    texts = [];
    ui.bestStart.textContent = best;
    refreshRanking();
    showScreen('start');
  }

  function gameOver() {
    state = 'over';
    // La canción sigue de fondo mientras miras los puntos.
    hideCountdown();
    hideEasterEgg();
    stats.duration = elapsed;
    stats.bestCombo = bestCombo;
    const isRecord = score > best;
    if (isRecord) {
      best = score;
      saveBest();
    }
    ui.finalScore.textContent = score.toLocaleString('es-ES');
    ui.bestOver.textContent = best.toLocaleString('es-ES');
    ui.newRecord.classList.toggle('hidden', !isRecord);
    updateGameOverStats(stats, isRecord);
    audio.sfx(isRecord ? 'record' : 'over');
    vibrate([80, 60, 160]);
    showScreen('over');
    rankingGameOver(score, stats);

    // Evita reiniciar sin querer con un toque que venía de la partida.
    ui.btnRestart.disabled = true;
    setTimeout(() => (ui.btnRestart.disabled = false), 700);
  }

  function award(id) {
    const achievement = unlockAchievement(id);
    if (!achievement) return;

    // El secreto 17 ya tiene su animación propia.
    // No mostramos también la notificación grande.
    if (id !== 'secret17') {
      showAchievementToast(achievement);
    }

    audio.sfx('achievement');
  }

  const comboMultiplier = () => combo >= 20 ? 4 : combo >= 10 ? 3 : combo >= 5 ? 2 : 1;
  function clearCombo() {
    combo = 0;
    timeSinceGood = 0;
    updateCombo(0, 1);
  }

  function stepCountdown(dt) {
    countdownRemaining -= dt;
    const n = Math.max(0, Math.ceil(countdownRemaining));
    if (n > 0 && n !== lastCountdownValue) {
      lastCountdownValue = n;
      showCountdown(n);
      audio.sfx('tick');
    }
    if (countdownRemaining <= 0) {
      state = 'playing';
      lastCountdownValue = 0;
      showCountdown('GO');
      goTimer = .7;
      audio.sfx('go');
      audio.startMusic(resumeMusic);
      resumeMusic = false;
    }
  }

  // ---------- Lógica de juego ----------  
  function difficultyIndex() {
    for (let i = DIFFICULTY_PHASES.length - 1; i >= 0; i--) {
      if (elapsed >= DIFFICULTY_PHASES[i].from) {
        return i;
      }
    }
    return 0;
  }

  function currentDifficulty() {
    return DIFFICULTY_PHASES[difficultyIndex()];
  }

  function spawnInterval() {
    return currentDifficulty().spawnGap;
  }

  function fallSpeed(spawnY, type) {
    const phase = currentDifficulty();

    const speed = (paddle.y - spawnY) / phase.fallTime;

    return speed * (
      type.kind === 'bomb' ? phase.bombSpeed : 1
    );
  }

  
  function pickType() {
    const phase = currentDifficulty();

    const weights = ITEM_TYPES.map((type) => {
      if (type.kind === 'bomb') {
        return phase.bombWeight;
      }

      if (type.kind === 'life') {
        return lives < MAX_LIVES ? phase.lifeWeight : 0;
      }

      return type.weight;
    });

    let roll = Math.random() *
      weights.reduce((total, weight) => total + weight, 0);

    for (let i = 0; i < ITEM_TYPES.length; i++) {
      roll -= weights[i];

      if (roll <= 0) {
        return ITEM_TYPES[i];
      }
    }

    return ITEM_TYPES[0];
  }

  // Borde inferior del HUD en unidades del juego: si el cielo está recortado,
  // los objetos aparecen justo debajo del marcador y no escondidos tras él.
  function hudBottom() {
    const hud = ui.hud.getBoundingClientRect();
    if (!hud.height) return 0;
    const rect = canvas.getBoundingClientRect();
    return ((hud.bottom - rect.top) / rect.height) * canvas.height / scale;
  }

  
  function spawn() {
    const type = pickType();

    // Conservamos la referencia original para no alterar
    // la velocidad de caída ni la dificultad configurada.
    const speedReferenceY = Math.max(
      fieldY + SPAWN_Y,
      hudBottom() + 2
    );

    // Los objetos aparecen completamente fuera
    // del borde superior de la pantalla.
    const y = -sprites[type.sprite].height / 2 - 2;

    const half = sprites[type.sprite].width / 2;

    items.push({
      type,
      x: fieldX + rand(half + 2, FIELD_W - half - 2),
      y,
      vy: fallSpeed(speedReferenceY, type) * rand(0.90, 1.10),
    });
  }

  function burst(x, y, colors, count, speed, size = 1) {
    for (let i = 0; i < count && particles.length < 220; i++) {
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
    updateHud(score, level, lives);
    if (lives <= 0) gameOver();
  }

  function onCatch(it) {
    timeWithoutCatching = 0;
    paddle.squash = 1;
    const x = it.x;
    const y = paddle.y - 2;
    switch (it.type.kind) {
      case 'good': {
        const oldMultiplier = comboMultiplier();
        combo += 1;
        bestCombo = Math.max(bestCombo, combo);
        timeSinceGood = 0;
        const multiplier = comboMultiplier();
        const points = it.type.points * multiplier;
        score += points;
        if (it.type.sprite === 'beso') {
          stats.kisses++;
          audio.sfx('kiss', multiplier);
          if (stats.kisses >= 2) award('twoKisses');
          if (isNight()) {
            nightKisses++;
            if (nightKisses >= 25) award('colorWings');
          }
        } else {
          stats.hearts++;
          audio.sfx('heart', multiplier);
        }
        if (combo >= 17) award('combo17');
        if (score >= 8000) award('points8000');
        if (multiplier > oldMultiplier) {
          audio.sfx('combo');
          addText(x, y - 18, `x${multiplier}`, '#f2c58a');
          burst(x, y, ['#fee761','#ffd2dc','#ffffff'], 18, 95);
        }
        updateHud(score, level, lives);
        updateCombo(combo, multiplier);
        bumpScore();
        burst(x, y, it.type.colors, 10, 70);
        addText(x, y - 8, `+${points}`, '#f4f1ea');
        vibrate(multiplier > 1 ? 25 : 12);
        break;
      }
      case 'life':
        if (lives === 1) award('notDead'); // al límite: recupera una vida cuando solo queda una
        audio.sfx('bonus');
        lives = Math.min(MAX_LIVES, lives + 1);
        updateHud(score, level, lives);
        burst(x, y, it.type.colors, 12, 70);
        addText(x, y - 8, '+1', '#f2c58a');
        vibrate(25);
        break;
      case 'bomb':
        pumpkinsDodged = 0;
        clearCombo();
        stats.pumpkins++;
        audio.sfx('damage');
        burst(x, y, it.type.colors, 28, 120, 2);
        addText(x, y - 8, '-1', '#cf7d90');
        shake = 0.35;
        flash = 0.3;
        vibrate([60, 40, 60]);
        loseLife();
        break;
    }
  }

  // Solo las calabazas atrapadas restan vidas. Dejar pasar otros objetos no penaliza.
  function onMiss(it) {
    if (it.type.kind === 'bomb') {
      pumpkinsDodged++;
      if (pumpkinsDodged >= 10) award('outlaw');
    }
    if (it.type.kind === 'good') {
      clearCombo(); // no quita vidas: solo rompe la racha.
      burst(it.x, groundY, it.type.colors, 3, 25);
    }
  }

  function update(dt) {
    elapsed += dt;

    // El reloj del mundo avanza solamente durante una partida activa.
    clock += dt;

    timeSinceGood += dt;
    if (combo > 0 && timeSinceGood > 6) clearCombo();
    if (elapsed >= DAY_SECONDS * 23 / 24) award('madrid24'); // llega a las 07:00: ha pasado la noche entera
    if (!isNight()) nightKisses = 0; // cada noche empieza la cuenta
    timeWithoutCatching += dt;
    if (goTimer > 0) {
      goTimer -= dt;
      if (goTimer <= 0) hideCountdown();
    }
    if (!easterEggShown && timeWithoutCatching >= 17) {
      easterEggShown = true;
      showEasterEgg();
      audio.sfx('secret');
      burst(paddle.x, paddle.y - 18, ['#fee761','#ffd2dc','#ffffff'], 45, 110);
      award('secret17');
    }
    const newLevel = difficultyIndex() + 1;
    if (newLevel !== level) {
      level = newLevel;
      updateHud(score, level, lives);
    }

    const keySpeed = FIELD_W * 1.2;
    if (keys.left) paddle.targetX -= keySpeed * dt;
    if (keys.right) paddle.targetX += keySpeed * dt;
    paddle.targetX = clamp(paddle.targetX, fieldX + minX(), fieldX + maxX());
    const step = (paddle.targetX - paddle.x) * Math.min(1, dt * 25);
    paddle.x += step;
    paddle.moving = Math.abs(step) > 0.15 ? 0.12 : Math.max(0, paddle.moving - dt);

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
  }

  // ---------- Dibujo ----------

  function drawPlayer() {
    const dx = Math.round(paddle.x - fieldX - BASKET_CX);
    // Sombras en el suelo (no se mueven con el rebote).
    for (const [x, y, w, h, fill, op] of ART.player.shadows) {
      g.globalAlpha = op;
      g.fillStyle = fill;
      g.fillRect(fieldX + x + dx, fieldY + y, w, h);
    }
    g.globalAlpha = 1;
    // Rebote de 1 píxel al atrapar algo y pasitos al moverse.
    const bob = paddle.squash > 0.5 ? 1 : paddle.moving > 0 && Math.floor(clock * 12) % 2 ? -1 : 0;
    g.drawImage(player.canvas, fieldX + player.ox + dx, fieldY + player.oy + bob);
  }

  function drawItems() {
    for (const it of items) {
      const s = sprites[it.type.sprite];
      g.drawImage(s, Math.round(it.x - s.width / 2), Math.round(it.y - s.height / 2));
    }
  }

  function drawEffects() {
    for (const p of particles) {
      g.fillStyle = p.color;
      g.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    for (const t of texts) {
      if (t.life < 0.25 && Math.floor(clock * 20) % 2) continue;
      drawText(g, t.text, t.x, t.y, t.color);
    }
  }

  // Golpe de calabaza: los bordes de la pantalla se oscurecen en el azul marino del menú
  // (el centro queda limpio para seguir jugando).
  function drawHitVignette(alpha) {
    const ink = (a) => `rgba(26, 36, 64, ${a})`;
    const ex = LW * 0.24;
    const ey = LH * 0.2;
    const edge = (x0, y0, x1, y1, rx, ry, rw, rh) => {
      const grad = g.createLinearGradient(x0, y0, x1, y1);
      grad.addColorStop(0, ink(alpha));
      grad.addColorStop(1, ink(0));
      g.fillStyle = grad;
      g.fillRect(rx, ry, rw, rh);
    };
    edge(0, 0, ex, 0, 0, 0, ex, LH);
    edge(LW, 0, LW - ex, 0, LW - ex, 0, ex, LH);
    edge(0, 0, 0, ey, 0, 0, LW, ey);
    edge(0, LH, 0, LH - ey, 0, LH - ey, LW, ey);
  }

  function render() {
    g.clearRect(0, 0, LW, LH);
    drawPlayer();
    drawItems();
    drawEffects();

    if (flash > 0) drawHitVignette(Math.min(0.8, flash * 2.7));

    let ox = 0;
    let oy = 0;
    if (shake > 0) {
      ox = Math.round(rand(-2, 2)) * scale;
      oy = Math.round(rand(-2, 2)) * scale;
    }
  
    ctx.fillStyle = MARGIN;

    ctx.fillRect(
      0, 0,
      canvas.width,
      canvas.height
    );

    // 1. Fondo original del escenario.
    if (background) {
      ctx.drawImage(background, ox, oy);
    }

    // 2. Si sobra un poco de ancho, la calle continúa con dos edificios vecinos.
    if (extendSides) {
      renderSideBuildings(
        ctx,
        facadeReady ? facade : null,
        fieldX,
        fieldY,
        scale,
        clock,
        canvas.width,
        canvas.height,
        ox,
        oy
      );
    }

    // 2b. Continuamos el cielo y la calle
    // en los dispositivos con espacio sobrante.
    renderSceneExtensions(
      ctx,
      facadeReady ? facade : null,
      fieldX,
      fieldY,
      scale,
      clock,
      canvas.height,
      ox,
      oy
    );

    // 3. Ciclo día/noche, ventanas, plantas,
    // iluminación y demás efectos.
    renderEnvironment(
      ctx,
      fieldX,
      fieldY,
      scale,
      clock,
      ox,
      oy
    );

    // 4. Personaje, objetos y efectos del juego.
    // Siempre quedan por delante del escenario.
    ctx.drawImage(
      buffer,
      ox,
      oy,
      LW * scale,
      LH * scale
    );

    // 4. Reloj ficticio del videojuego.
    const label = getWorldTimeLabel(clock);

    if (worldClock && label !== lastWorldLabel) {
      worldClock.textContent = label;
      lastWorldLabel = label;
    }
  }

  // ---------- Bucle principal ----------

  function loop(t) {
    const dt = Math.min((t - lastTime) / 1000 || 0, 0.05);
    lastTime = t;

    if (state === 'countdown') stepCountdown(dt);
    else if (state === 'playing') update(dt);
    if (state !== 'paused') updateEffects(dt);
    render();

    requestAnimationFrame(loop);
  }


export function initGame() {
  resize();
  ui.bestStart.textContent = best;
  updateHud(score, level, lives);
  showScreen('start');
  requestAnimationFrame((t) => {
    lastTime = t;
    loop(t);
  });
}
