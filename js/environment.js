import { FIELD_W, FIELD_H, MAX_SIDE_UNITS, SIDE_TOLERANCE, clamp } from './config.js';

const DAY_SECONDS = 180;
const START_HOUR = 8; // la partida empieza a las 8:00 de la mañana
const SKY_HEIGHT = 56;

const skyMask = document.createElement('canvas');
skyMask.width = FIELD_W;
skyMask.height = SKY_HEIGHT;

const skyLayer = document.createElement('canvas');
skyLayer.width = FIELD_W;
skyLayer.height = SKY_HEIGHT;

const sky = skyLayer.getContext('2d');
sky.imageSmoothingEnabled = false;

let maskReady = false;

let windowLightLayers = [];
let railingForeground = null;

const RAILINGS = [
  { x: 17, y: 115, w: 53, h: 20 },
  { x: 125, y: 115, w: 51, h: 20 },
  { x: 126, y: 193, w: 49, h: 19 },
  { x: 17, y: 270, w: 53, h: 19 },
  { x: 124, y: 270, w: 53, h: 19 }
];

function prepareFacadeDetails(facade) {
  const source = document.createElement('canvas');
  source.width = FIELD_W;
  source.height = FIELD_H;

  const sc = source.getContext('2d', {
    willReadFrequently: true
  });

  sc.drawImage(facade, 0, 0, FIELD_W, FIELD_H);

  // ----------------------------------------
  // VERSIONES ILUMINADAS DE LAS VENTANAS
  // ----------------------------------------

  windowLightLayers = WINDOWS.map((w) => {
    const layer = document.createElement('canvas');
    layer.width = w.w;
    layer.height = w.h;

    const lc = layer.getContext('2d');
    const image = sc.getImageData(
      w.x, w.y, w.w, w.h
    );

    const data = image.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const luminance =
        r * 0.2126 +
        g * 0.7152 +
        b * 0.0722;

      // Respetamos las zonas más oscuras:
      // marcos, divisiones y sombras.
      if (luminance < 82) {
        continue;
      }

      // Tonos cálidos calculados a partir
      // de la iluminación original.
      const warmR = Math.min(
        255, 160 + luminance * 0.48
      );

      const warmG = Math.min(
        255, 108 + luminance * 0.51
      );

      const warmB = Math.min(
        255, 48 + luminance * 0.50
      );

      data[i] = Math.round(warmR);
      data[i + 1] = Math.round(warmG);
      data[i + 2] = Math.round(warmB);
    }

    lc.putImageData(image, 0, 0);
    return layer;
  });

  // ----------------------------------------
  // BARANDILLAS ORIGINALES EN PRIMER PLANO
  // ----------------------------------------

  const railCanvas = document.createElement('canvas');
  railCanvas.width = FIELD_W;
  railCanvas.height = FIELD_H;

  const rc = railCanvas.getContext('2d');
  const original = sc.getImageData(
    0, 0, FIELD_W, FIELD_H
  );

  const output = rc.createImageData(
    FIELD_W, FIELD_H
  );

  for (const rail of RAILINGS) {
    for (let y = rail.y; y < rail.y + rail.h; y++) {
      for (let x = rail.x; x < rail.x + rail.w; x++) {
        const i = (y * FIELD_W + x) * 4;

        const r = original.data[i];
        const g = original.data[i + 1];
        const b = original.data[i + 2];

        // Seleccionamos los tonos oscuros
        // de la estructura metálica.
        const dark =
          r < 150 &&
          g < 145 &&
          b < 160;

        // Excluimos buena parte del follaje.
        const green =
          g > r * 1.25 &&
          g > b * 0.90;

        if (dark && !green) {
          output.data[i] = r;
          output.data[i + 1] = g;
          output.data[i + 2] = b;
          output.data[i + 3] = 255;
        }
      }
    }
  }

  rc.putImageData(output, 0, 0);
  railingForeground = railCanvas;
}

/* =========================
   DECORACIÓN RETRO CUIDADA
   ========================= */

// Jardineras largas / pequeñas

const WINDOWS = [
  // Planta superior
  {
    x: 24, y: 80, w: 29, h: 37,
    on: 18.8, off: 0.7
  },
  {
    x: 134, y: 80, w: 37, h: 36,
    on: 18.4, off: 23.1
  },

  // Planta central
  {
    x: 24, y: 155, w: 30, h: 38,
    on: 19.3, off: 2.2
  },
  {
    x: 135, y: 164, w: 32, h: 29,
    on: 19.6, off: 1.2
  },

  // Planta inferior
  {
    x: 24, y: 239, w: 32, h: 32,
    on: 18.9, off: 22.8
  },
  {
    x: 134, y: 239, w: 33, h: 32,
    on: 20.7, off: 5.1
  }
];

const PLANTERS = [
  {
    x: 25, y: 118, w: 23,
    blooms: ['#ff8bb6', '#ffe18a']
  },
  {
    x: 144, y: 118, w: 22,
    blooms: ['#ff8cb4', '#f8bc9e']
  },
  // SOLO ELLA queda libre
  {
    x: 144, y: 194, w: 22,
    blooms: ['#ffab88', '#ffe18d']
  },
  {
    x: 28, y: 271, w: 22,
    blooms: ['#ffe18a']
  },
  {
    x: 143, y: 271, w: 25,
    blooms: ['#ff8cb4', '#ffe18a']
  }
];

// Macetas colgantes
const HANGING_POTS = [
  { x: 46,  y: 118, length: 7, bloom: '#ff89b3' },
  { x: 154, y: 117, length: 8, bloom: '#ffd878' }
];

// Plantas trepadoras / colgantes
const IVY_PATCHES = [
  { x: 16,  y: 122, h: 18, side: 'left'  },
  { x: 167, y: 192, h: 16, side: 'right' },
  { x: 168, y: 268, h: 17, side: 'right' }
];

// Un toldito/persiana sutil
const AWNINGS = [
  { x: 136, y: 157, w: 30, h: 8, colorA: '#6d8590', colorB: '#ddd5c5' }
];

// Sin cuerdas de ropa entre balcones (se confundían con un objeto del juego).
const LAUNDRY_LINES = [];

// Silueta detrás de una sola ventana puntual
const SHADOW_PEOPLE = [
  { windowIndex: 1, start: 21.0, end: 22.2 },
  { windowIndex: 4, start: 20.4, end: 21.0 }
];

// Estrellas
const STARS = Array.from({ length: 36 }, (_, i) => ({
  x: (i * 31 + 11) % FIELD_W,
  y: 3 + (i * 9) % 34,
  offset: i * 1.19
}));

// Paleta horaria
const SKY_COLORS = [
  [0.0,  '#07101f'],
  [4.8,  '#11192e'],
  [6.0,  '#5c4867'],
  [7.0,  '#d58890'],
  [8.2,  '#9dc7e8'],
  [12.0, '#67a8d9'],
  [16.0, '#7dbde3'],
  [18.1, '#f1ad7e'],
  [19.4, '#936078'],
  [21.0, '#1f284f'],
  [24.0, '#07101f']
];

/* =========================
   HELPERS
   ========================= */

function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a, b, t) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}

function smooth(a, b, x) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

function cssRGB(c) {
  return `rgb(${c.join(',')})`;
}

function colorForHour(hour) {
  for (let i = 1; i < SKY_COLORS.length; i++) {
    const [end, rightHex] = SKY_COLORS[i];
    if (hour <= end) {
      const [start, leftHex] = SKY_COLORS[i - 1];
      return mix(
        rgb(leftHex),
        rgb(rightHex),
        (hour - start) / (end - start)
      );
    }
  }
  return rgb('#07101f');
}

export function getWorldHour(seconds) {
  return ((START_HOUR + seconds * 24 / DAY_SECONDS) % 24 + 24) % 24;
}

export function getWorldTimeLabel(seconds) {
  const hour = getWorldHour(seconds);
  const h = Math.floor(hour);
  const m = Math.floor((hour - h) * 60);
  const icon = hour >= 7 && hour < 19 ? '☀' : '☾';
  return `${icon} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function nightAmount(hour) {
  const nightIn = smooth(18.4, 21.3, hour);
  const nightOut = 1 - smooth(5.4, 7.4, hour);
  return clamp(Math.max(nightIn, nightOut), 0, 1);
}

function duskAmount(hour) {
  const sunset = smooth(17.2, 19.7, hour) * (1 - smooth(20.4, 21.5, hour));
  const sunrise = smooth(5.4, 6.8, hour) * (1 - smooth(7.5, 8.8, hour));
  return clamp(Math.max(sunset, sunrise), 0, 1);
}

function dayAmount(hour) {
  return 1 - nightAmount(hour);
}

function windowBrightness(hour, start, end) {
  const length = (end - start + 24) % 24;
  const passed = (hour - start + 24) % 24;

  if (passed >= length) return 0;

  const on = smooth(0, 0.30, passed);
  const off = 1 - smooth(length - 0.35, length, passed);

  return on * off;
}

function windowIsActive(hour, start, end) {
  return windowBrightness(hour, start, end) > 0.04;
}

/* =========================
   MÁSCARA DE CIELO
   ========================= */

export function prepareEnvironment(facade) {
  const source = document.createElement('canvas');
  source.width = FIELD_W;
  source.height = SKY_HEIGHT;

  const sx = source.getContext('2d', { willReadFrequently: true });
  sx.drawImage(facade, 0, 0, FIELD_W, FIELD_H);

  const original = sx.getImageData(0, 0, FIELD_W, SKY_HEIGHT);
  const maskCtx = skyMask.getContext('2d');
  const image = maskCtx.createImageData(FIELD_W, SKY_HEIGHT);

  for (let y = 0; y < SKY_HEIGHT; y++) {
    for (let x = 0; x < FIELD_W; x++) {
      const i = (y * FIELD_W + x) * 4;
      const r = original.data[i];
      const g = original.data[i + 1];
      const b = original.data[i + 2];

      const isSky = b > 155 && b >= g - 8 && b - r > 6;
      const isCloud = y < 42 && r > 220 && g > 225 && b > 230;

      if (isSky || isCloud) {
        image.data[i] = 255;
        image.data[i + 1] = 255;
        image.data[i + 2] = 255;
        image.data[i + 3] = 255;
      }
    }
  }

  maskCtx.putImageData(image, 0, 0);
  maskReady = true;
  prepareFacadeDetails(facade);
}

/* =========================
   DIBUJO DEL CIELO
   ========================= */

function drawCloud(x, y, size, alpha) {
  const w = Math.round(15 * size);

  sky.fillStyle = `rgba(250,235,236,${alpha})`;
  sky.fillRect(Math.round(x), Math.round(y), w, 3);
  sky.fillRect(Math.round(x + 4 * size), Math.round(y - 3 * size), Math.round(w * 0.65), 3);
  sky.fillRect(Math.round(x + 2 * size), Math.round(y + 2), Math.round(w * 0.8), 2);
}

function drawSky(seconds, hour, night) {
  sky.clearRect(0, 0, FIELD_W, SKY_HEIGHT);

  const dusk = duskAmount(hour);
  const day = dayAmount(hour);

  const base = colorForHour(hour);
  const horizon = mix(
    base,
    dusk > 0.15 ? rgb('#f2b178') : rgb('#d9b7d8'),
    0.18 + dusk * 0.16
  );

  const gradient = sky.createLinearGradient(0, 0, 0, SKY_HEIGHT);
  gradient.addColorStop(0, cssRGB(base));
  gradient.addColorStop(1, cssRGB(horizon));

  sky.fillStyle = gradient;
  sky.fillRect(0, 0, FIELD_W, SKY_HEIGHT);

  const daytime = hour >= 6 && hour < 18;
  const progress = daytime
    ? (hour - 6) / 12
    : ((hour - 18 + 24) % 24) / 12;

  const x = 8 + progress * (FIELD_W - 16);
  const y = 40 - Math.sin(progress * Math.PI) * 31;

  // halo
  sky.fillStyle = daytime
    ? `rgba(255,214,125,${0.12 + dusk * 0.18 + day * 0.08})`
    : `rgba(210,224,255,${0.10 + night * 0.14})`;

  sky.beginPath();
  sky.arc(x, y, daytime ? 12 : 10, 0, Math.PI * 2);
  sky.fill();

  // sol / luna
  sky.fillStyle = daytime ? '#ffe28c' : '#e8ecff';
  sky.beginPath();
  sky.arc(Math.round(x), Math.round(y), daytime ? 4 : 3.5, 0, Math.PI * 2);
  sky.fill();

  // media luna
  if (!daytime) {
    sky.fillStyle = cssRGB(base);
    sky.beginPath();
    sky.arc(Math.round(x + 1.5), Math.round(y - 1.2), 3.1, 0, Math.PI * 2);
    sky.fill();
  }

  // estrellas
  for (const star of STARS) {
    const strength = night * (0.35 + 0.6 * (1 + Math.sin(seconds * 1.2 + star.offset)) / 2);
    sky.fillStyle = `rgba(255,245,210,${strength.toFixed(3)})`;
    sky.fillRect(star.x, star.y, 1, 1);
  }

  // franja superior más profunda
  if (night > 0.15) {
    sky.fillStyle = `rgba(7, 10, 24, ${0.08 + night * 0.24})`;
    sky.fillRect(0, 0, FIELD_W, SKY_HEIGHT * 0.58);
  }

  // nubes
  const travel = FIELD_W + 42;

  drawCloud(((seconds * 2.3 + 14) % travel) - 28, 18, 1.0, 0.22 + day * 0.12);
  drawCloud(((seconds * 1.0 + 108) % travel) - 28, 10, 0.75, 0.14 + day * 0.08);
  drawCloud(((seconds * 1.45 + 180) % travel) - 28, 27, 0.6, 0.18 + day * 0.05);

  // pájaros solo con luz / atardecer
  if ((seconds % 28) < 13 && night < 0.82) {
    const bx = ((seconds % 28) / 13) * (FIELD_W + 24) - 12;

    for (let i = 0; i < 2; i++) {
      const px = Math.round(bx - i * 9);
      const py = 11 + i * 6;
      const flap = Math.sin(seconds * 13 + i) > 0 ? -2 : 1;

      sky.fillStyle = dusk > 0.2 ? '#544252' : '#33405b';
      sky.fillRect(px, py, 2, 1);
      sky.fillRect(px - 2, py + flap, 2, 1);
      sky.fillRect(px + 2, py + flap, 2, 1);
    }
  }

  if (maskReady) {
    sky.globalCompositeOperation = 'destination-in';
    sky.drawImage(skyMask, 0, 0);
    sky.globalCompositeOperation = 'source-over';
  }
}

/* =========================
   DETALLES DE FACHADA
   ========================= */

function drawWindow(g, w, brightness, seconds, index) {
  if (brightness <= 0.01) return;

  const layer = windowLightLayers[index];
  if (!layer) return;

  const flicker =
    0.97 +
    Math.sin(seconds * 0.7 + index * 2.3) * 0.03;

  const intensity = Math.min(
    1,
    brightness * flicker
  );

  g.save();

  // ---------------------------------
  // RESPLANDOR EXTERIOR MUY SUAVE
  // ---------------------------------

  const cx = w.x + w.w / 2;
  const cy = w.y + w.h / 2;

  const radius = Math.max(w.w, w.h) * 0.85;

  const glow = g.createRadialGradient(
    cx, cy, 1,
    cx, cy, radius
  );

  glow.addColorStop(
    0,
    `rgba(255,196,103,${intensity * 0.20})`
  );

  glow.addColorStop(
    0.5,
    `rgba(255,180,83,${intensity * 0.09})`
  );

  glow.addColorStop(
    1,
    'rgba(255,180,83,0)'
  );

  g.fillStyle = glow;

  g.fillRect(
    cx - radius,
    cy - radius,
    radius * 2,
    radius * 2
  );

  // ---------------------------------
  // ILUMINACIÓN DEL HUECO COMPLETO
  // ---------------------------------

  g.globalAlpha = intensity * 0.96;

  g.drawImage(
    layer,
    w.x,
    w.y
  );

  g.restore();
}

function drawShadowPerson(g, w, seconds) {
  const sway = Math.sin(seconds * 1.7) > 0 ? 0 : 1;

  g.save();
  g.globalAlpha = 0.18;
  g.fillStyle = '#5a4350';

  // cabeza
  g.fillRect(w.x + Math.floor(w.w / 2) - 1, w.y + 6, 3, 3);

  // cuerpo
  g.fillRect(w.x + Math.floor(w.w / 2) - 2 + sway, w.y + 9, 5, 8);

  // hombros
  g.fillRect(w.x + Math.floor(w.w / 2) - 3 + sway, w.y + 10, 7, 2);

  g.restore();
}


function drawPlanter(g, planter, seconds, night) {
  const { x, y, w, blooms } = planter;

  g.save();
  g.imageSmoothingEnabled = false;

  // Follaje de base detrás de la barandilla.
  g.fillStyle = night > 0.65
    ? '#41694c'
    : '#53865a';

  g.fillRect(x + 1, y - 2, w - 2, 4);

  // Caja de madera, parcialmente tapada
  // posteriormente por la barandilla.
  g.fillStyle = '#855548';
  g.fillRect(x, y + 2, w, 5);

  g.fillStyle = '#b87a58';
  g.fillRect(x, y + 2, w, 1);

  g.fillStyle = '#613e42';
  g.fillRect(x + 1, y + 6, w - 2, 1);

  const step = w / (blooms.length + 1);

  blooms.forEach((color, i) => {
    const px = Math.round(x + step * (i + 1));

    const sway = Math.round(
      Math.sin(seconds * 1.1 + px) * 0.6
    );

    // Tallo y hojas.
    g.fillStyle = '#4c8759';
    g.fillRect(px + sway, y - 6, 1, 6);
    g.fillRect(px - 2 + sway, y - 3, 2, 1);
    g.fillRect(px + 1 + sway, y - 4, 2, 1);

    // Flor.
    g.fillStyle = color;
    g.fillRect(px - 1 + sway, y - 9, 3, 3);

    // Centro.
    g.fillStyle = '#ffe7a5';
    g.fillRect(px + sway, y - 8, 1, 1);
  });

  g.restore();
}

function drawHangingPot(g, pot, seconds, night) {
  const sway = Math.sin(seconds * 1.1 + pot.x * 0.1) * 0.8;

  g.save();
  g.globalAlpha = 1 - night * 0.18;

  // cuerda
  g.fillStyle = '#6f5853';
  g.fillRect(pot.x, pot.y - pot.length, 1, pot.length);

  // cuerdas laterales
  g.fillRect(pot.x - 2, pot.y - pot.length + 2, 1, pot.length - 1);
  g.fillRect(pot.x + 2, pot.y - pot.length + 2, 1, pot.length - 1);

  // maceta
  g.fillStyle = '#8e5e55';
  g.fillRect(pot.x - 3 + sway, pot.y, 7, 4);
  g.fillStyle = '#6e4647';
  g.fillRect(pot.x - 2 + sway, pot.y + 4, 5, 1);

  // hojas
  g.fillStyle = '#558e63';
  g.fillRect(pot.x - 1 + sway, pot.y - 3, 1, 3);
  g.fillRect(pot.x - 3 + sway, pot.y - 2, 2, 2);
  g.fillRect(pot.x + 1 + sway, pot.y - 2, 2, 2);

  // flor
  g.fillStyle = pot.bloom;
  g.fillRect(pot.x + sway, pot.y - 4, 2, 2);

  g.restore();
}

function drawIvy(g, ivy, seconds, night) {
  const segments = Math.floor(ivy.h / 4);

  g.save();
  g.globalAlpha = 0.92 - night * 0.12;
  g.fillStyle = '#4f8557';

  for (let i = 0; i < segments; i++) {
    const dx = ivy.side === 'left'
      ? -((i % 2 === 0) ? 1 : 0)
      : ((i % 2 === 0) ? 1 : 0);

    const y = ivy.y + i * 4;
    const x = ivy.x + dx;

    g.fillRect(x, y, 1, 4);
    g.fillRect(x - 1, y + 1, 2, 1);
    g.fillRect(x + 1, y + 2, 2, 1);
  }

  g.restore();
}

function drawAwning(g, awning, night) {
  g.save();
  g.globalAlpha = 1 - night * 0.10;

  for (let i = 0; i < awning.w; i += 3) {
    g.fillStyle = ((i / 3) % 2 === 0) ? awning.colorA : awning.colorB;
    g.fillRect(awning.x + i, awning.y, 3, awning.h - 2);
  }

  g.fillStyle = '#5b444a';
  g.fillRect(awning.x, awning.y + awning.h - 2, awning.w, 2);

  g.restore();
}

function drawLaundryLine(g, line, night) {
  g.save();
  g.globalAlpha = 0.55 - night * 0.10;

  // cuerda
  g.strokeStyle = '#6b5c62';
  g.beginPath();
  g.moveTo(line.x1, line.y1);
  g.lineTo(line.x2, line.y2);
  g.stroke();

  // prendas
  for (const item of line.items) {
    const baseY = line.y1 + ((item.x - line.x1) / (line.x2 - line.x1)) * (line.y2 - line.y1);

    g.fillStyle = item.color;
    g.fillRect(item.x, Math.round(baseY), item.w, item.h);

    g.fillStyle = '#8b7d86';
    g.fillRect(item.x + 1, Math.round(baseY) - 1, Math.max(1, item.w - 2), 1);
  }

  g.restore();
}

function drawStreetGlow(g, night) {
  if (night <= 0.2) return;

  const streetGlow = g.createLinearGradient(0, FIELD_H - 72, 0, FIELD_H);
  streetGlow.addColorStop(0, 'rgba(255,210,145,0)');
  streetGlow.addColorStop(1, `rgba(255,205,135,${(night * 0.12).toFixed(3)})`);

  g.fillStyle = streetGlow;
  g.fillRect(0, FIELD_H - 72, FIELD_W, 72);
}

/* =========================
   RENDER PRINCIPAL
   ========================= */


// ---------------- Cuervo animado sobre la veleta ----------------
// El poste está en fachada.png; el cuervo se dibuja aquí para poder moverlo: parpadea,
// mira hacia atrás, se rasca bajo el ala y aletea sin moverse de la percha.
// Fotogramas de 20 x 12 px: la columna 0 cae en x = 117 y la fila 0 en y = 21 (percha en y = 33).
const CROW_PAL = {"K": "#1b1820", "N": "#27232f", "S": "#383a56", "H": "#56597c", "B": "#2c2932", "b": "#615e6a", "E": "#e8ecf4", "L": "#3b3740"};
const CROW_FRAMES = {
 "idle": [
  "....................",
  "....................",
  "............KKK.....",
  "...........KKKKK....",
  "...........KKKEKBBb.",
  "..........KKKKKKBB..",
  ".......KKNNNKK......",
  ".....KKNSSHSNKKK....",
  "...KKKNSSHHSNNKK....",
  "KKKKKKKNSSSNNNKK....",
  ".KKK....NNNNNNK.....",
  ".........L..L......."
 ],
 "blink": [
  "....................",
  "....................",
  "............KKK.....",
  "...........KKKKK....",
  "...........KKKKKBBb.",
  "..........KKKKKKBB..",
  ".......KKNNNKK......",
  ".....KKNSSHSNKKK....",
  "...KKKNSSHHSNNKK....",
  "KKKKKKKNSSSNNNKK....",
  ".KKK....NNNNNNK.....",
  ".........L..L......."
 ],
 "back": [
  "....................",
  "....................",
  "...........KKK......",
  "..........KKKKK.....",
  ".......bBBKEKKK.....",
  "........BBKKKKKK....",
  ".......KKNNNKK......",
  ".....KKNSSHSNKKK....",
  "...KKKNSSHHSNNKK....",
  "KKKKKKKNSSSNNNKK....",
  ".KKK....NNNNNNK.....",
  ".........L..L......."
 ],
 "preen1": [
  "....................",
  "....................",
  "....................",
  "....................",
  "....................",
  ".....KKK..KKKK......",
  "....KSHHKKKEKKK.....",
  ".....KKbBKKKKKKK....",
  "...KKKNSSHHSNNKK....",
  "KKKKKKKNSSSNNNKK....",
  ".KKK....NNNNNNK.....",
  ".........L..L......."
 ],
 "preen2": [
  "....................",
  "....................",
  "....................",
  "....................",
  "....................",
  "..........KKKK......",
  ".......KKKKEKKK.....",
  ".....KKbBKKKKKKK....",
  "...KKKNSSHHSNNKK....",
  "KKKKKKKNSSSNNNKK....",
  ".KKK....NNNNNNK.....",
  ".........L..L......."
 ],
 "flap1": [
  "....................",
  "....................",
  "............KKK.....",
  "...........KKKKK....",
  "...KK......KKKEKBBb.",
  "..KSSKK...KKKKKKBB..",
  "...KSHSSKKNNKK......",
  "....KKSSHSKNNKKK....",
  "...KKKNNNNNNNNKK....",
  "KKKKKKKNNNNNNNKK....",
  ".KKK....NNNNNNK.....",
  ".........L..L......."
 ],
 "flap2": [
  "......K.K...........",
  ".....KSKSK..........",
  ".....KSSHK..KKK.....",
  "......KSSHKKKKKK....",
  "......KSSSKKKKEKBBb.",
  ".......KSHKKKKKKBB..",
  ".......KKSKKKK......",
  ".....KKNKKSKNKKK....",
  "...KKKNNNNNNNNKK....",
  "KKKKKKKNNNNNNNKK....",
  ".KKK....NNNNNNK.....",
  ".........L..L......."
 ]
};
const CROW_X = 117;
const CROW_Y = 21;
const CROW_NIGHT = [10, 14, 35];
// Acciones: lista de [fotograma, duración en segundos]
const CROW_ACTIONS = {
  look: [['back', 1.4]],
  preen: [['preen1', 0.22], ['preen2', 0.22], ['preen1', 0.22], ['preen2', 0.22], ['preen1', 0.22], ['preen2', 0.3]],
  flap: [['flap1', 0.09], ['flap2', 0.11], ['flap1', 0.09], ['flap2', 0.11], ['flap1', 0.09], ['flap2', 0.11], ['flap1', 0.1]],
  blink: [['blink', 0.14]],
};
const crow = { action: null, step: 0, stepEnd: 0, next: 3, lastSeconds: 0 };

function crowFrameAt(seconds) {
  // Si el reloj vuelve atrás (partida nueva), se reinicia
  if (seconds < crow.lastSeconds) Object.assign(crow, { action: null, next: seconds + 3 });
  crow.lastSeconds = seconds;
  if (crow.action) {
    if (seconds >= crow.stepEnd) {
      crow.step += 1;
      const seq = CROW_ACTIONS[crow.action];
      if (crow.step >= seq.length) {
        crow.action = null;
        crow.next = seconds + 2.5 + Math.random() * 5;
      } else {
        crow.stepEnd = seconds + seq[crow.step][1];
      }
    }
  } else if (seconds >= crow.next) {
    const r = Math.random();
    crow.action = r < 0.35 ? 'blink' : r < 0.6 ? 'look' : r < 0.82 ? 'preen' : 'flap';
    crow.step = 0;
    crow.stepEnd = seconds + CROW_ACTIONS[crow.action][0][1];
  }
  return crow.action ? CROW_ACTIONS[crow.action][crow.step][0] : 'idle';
}

function drawCrow(ctx, seconds, darkness) {
  const rows = CROW_FRAMES[crowFrameAt(seconds)];
  const tint = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v, i) => Math.round(v * (1 - darkness) + CROW_NIGHT[i] * darkness));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  };
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === '.') continue;
      let run = 1;
      while (row[c + run] === ch) run++;
      ctx.fillStyle = tint(CROW_PAL[ch]);
      ctx.fillRect(CROW_X + c, CROW_Y + r, run, 1);
      c += run - 1;
    }
  }
}

export function renderEnvironment(
  ctx,
  fieldX,
  fieldY,
  scale,
  seconds,
  shakeX = 0,
  shakeY = 0
) {
  const hour = getWorldHour(seconds);
  const night = nightAmount(hour);
  const dusk = duskAmount(hour);

  ctx.save();
  ctx.translate(shakeX, shakeY);
  ctx.scale(scale, scale);
  ctx.translate(fieldX, fieldY);

  ctx.beginPath();
  ctx.rect(0, 0, FIELD_W, FIELD_H);
  ctx.clip();

  // 1. Oscurecer la fachada original.
  ctx.fillStyle =
    `rgba(10,14,35,${(night * 0.56 + dusk * 0.07).toFixed(3)})`;

  ctx.fillRect(0, 0, FIELD_W, FIELD_H);

  // 2. Cielo por encima del tinte nocturno.
  // Se evita oscurecerlo dos veces.
  drawSky(seconds, hour, night);
  ctx.drawImage(skyLayer, 0, 0);

  // 2b. El cuervo de la veleta, con el mismo oscurecimiento que la fachada
  drawCrow(ctx, seconds, night * 0.56 + dusk * 0.07);

  // 3. Tinte azulado ambiental.
  if (night > 0.08) {
    ctx.fillStyle =
      `rgba(59,80,139,${(night * 0.07).toFixed(3)})`;

    ctx.fillRect(0, 65, FIELD_W, FIELD_H - 65);
  }

  // 4. Ventanas iluminadas conservando textura.
  WINDOWS.forEach((w, i) => {
    const brightness = windowBrightness(
      hour,
      w.on,
      w.off
    );

    drawWindow(
      ctx,
      w,
      brightness,
      seconds,
      i
    );
  });

  // 5. Siluetas interiores ocasionales.
  SHADOW_PEOPLE.forEach((shadow) => {
    const win = WINDOWS[shadow.windowIndex];
    if (!win) return;

    const activeTime = windowIsActive(
      hour,
      shadow.start,
      shadow.end
    );

    const lightOn = windowIsActive(
      hour,
      win.on,
      win.off
    );

    if (activeTime && lightOn && night > 0.4) {
      drawShadowPerson(ctx, win, seconds);
    }
  });

  // 6. Toldos.
  AWNINGS.forEach((awning) => {
    drawAwning(ctx, awning, night);
  });

  // 7. Jardineras y flores.
  PLANTERS.forEach((planter) => {
    drawPlanter(ctx, planter, seconds, night);
  });

  // 8. Macetas y vegetación colgante.
  HANGING_POTS.forEach((pot) => {
    drawHangingPot(ctx, pot, seconds, night);
  });

  IVY_PATCHES.forEach((ivy) => {
    drawIvy(ctx, ivy, seconds, night);
  });

  // 9. Restaurar los barrotes originales.
  // De esta forma quedan delante de las macetas.
  if (railingForeground) {
    ctx.drawImage(railingForeground, 0, 0);
  }

  // 10. Ropa tendida.
  LAUNDRY_LINES.forEach((line) => {
    drawLaundryLine(ctx, line, night);
  });

  // 11. Resplandor de la calle.
  drawStreetGlow(ctx, night);

  ctx.restore();
}

/* ==========================================
   EXTENSIÓN RESPONSIVE DEL ESCENARIO
   Cielo superior y pavimento inferior
   ========================================== */

let pavementTile = null;

// Construye una continuación de la calle
// utilizando los píxeles originales de fachada.png.
function getPavementTile(facade) {
  if (pavementTile) return pavementTile;

  if (!facade?.complete || !facade.naturalWidth) {
    return null;
  }

  const tile = document.createElement('canvas');
  tile.width = FIELD_W;
  tile.height = 24;

  const g = tile.getContext('2d');
  g.imageSmoothingEnabled = false;

  // Reflejamos las últimas 12 filas de la imagen.
  // Así no aparece un corte brusco en el suelo.
  for (let y = 0; y < 12; y++) {
    g.drawImage(
      facade,
      0, FIELD_H - 1 - y, FIELD_W, 1,
      0, y, FIELD_W, 1
    );

    g.drawImage(
      facade,
      0, FIELD_H - 12 + y, FIELD_W, 1,
      0, 12 + y, FIELD_W, 1
    );
  }

  pavementTile = tile;
  return pavementTile;
}

export function renderSceneExtensions(
  ctx,
  facade,
  fieldX,
  fieldY,
  scale,
  seconds,
  canvasHeight,
  shakeX = 0,
  shakeY = 0
) {
  const hour = getWorldHour(seconds);
  const night = nightAmount(hour);
  const dusk = duskAmount(hour);

  // Calculamos el espacio sobrante en unidades
  // lógicas de nuestro juego, no en píxeles CSS.
  const logicalHeight = canvasHeight / scale;

  const topSpace = Math.max(0, Math.ceil(fieldY) + 3);

  const bottomSpace = Math.max(
    0,
    Math.ceil(logicalHeight - fieldY - FIELD_H) + 3
  );

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  // Misma transformación utilizada para
  // dibujar la fachada y los objetos.
  ctx.translate(shakeX, shakeY);
  ctx.scale(scale, scale);
  ctx.translate(fieldX, fieldY);

  // ----------------------------------------
  // EXTENSIÓN SUPERIOR: CIELO DINÁMICO
  // ----------------------------------------

  if (topSpace > 0) {
    // Utilizamos exactamente la paleta del cielo
    // de environment.js para evitar la franja
    // azul estática en la noche.
    const skyColor = cssRGB(colorForHour(hour));

    ctx.fillStyle = skyColor;
    ctx.fillRect(
      0,
      -topSpace,
      FIELD_W,
      topSpace
    );

    // Estrellas adicionales en el espacio
    // superior cuando se hace de noche.
    if (night > 0.15) {
      for (let i = 0; i < 18; i++) {
        const x = (i * 37 + 11) % FIELD_W;
        const y = -1 - (
          (i * 13 + 4) % Math.max(1, topSpace)
        );

        const twinkle =
          0.4 + 0.3 * Math.sin(seconds * 1.4 + i);

        ctx.globalAlpha = night * twinkle;
        ctx.fillStyle = '#fff3d7';
        ctx.fillRect(x, y, 1, 1);
      }

      ctx.globalAlpha = 1;
    }
  }

  // ----------------------------------------
  // EXTENSIÓN INFERIOR: CALLE CONTINUA
  // ----------------------------------------

  if (bottomSpace > 0) {
    const texture = getPavementTile(facade);

    ctx.save();
    ctx.translate(0, FIELD_H);

    if (texture) {
      const pattern = ctx.createPattern(
        texture,
        'repeat'
      );

      ctx.fillStyle = pattern;
    } else {
      ctx.fillStyle = '#72686d';
    }

    ctx.fillRect(
      0, 0,
      FIELD_W,
      bottomSpace
    );

    // Aplicamos la misma oscuridad nocturna
    // que al edificio.
    const darkness = Math.min(
      0.9,
      night * 0.56 + dusk * 0.07
    );

    ctx.fillStyle =
      `rgba(10,14,35,${darkness.toFixed(3)})`;

    ctx.fillRect(
      0, 0,
      FIELD_W,
      bottomSpace
    );

    // Ligero tinte azul nocturno.
    if (night > 0.08) {
      ctx.fillStyle =
        `rgba(59,80,139,${(night * 0.07).toFixed(3)})`;

      ctx.fillRect(
        0, 0,
        FIELD_W,
        bottomSpace
      );
    }

    // Continuación del resplandor
    // cálido de la calle.
    if (night > 0.2) {
      ctx.fillStyle =
        `rgba(255,205,135,${(night * 0.12).toFixed(3)})`;

      ctx.fillRect(
        0, 0,
        FIELD_W,
        bottomSpace
      );
    }

    ctx.restore();
  }

  ctx.restore();
}

/* ==========================================
   EDIFICIOS VECINOS A LOS LADOS
   Cuando la pantalla es algo más ancha que la escena, la calle continúa:
   a la izquierda sigue el mismo edificio amarillo (con su persiana de
   grafitis), a la derecha el edificio rosa de contraventanas oscuras,
   como en la calle real del rodaje.
   ========================================== */

// Piezas del diseño original: [x, y, ancho, alto, color] relativas al hueco.
const VANO = [
  [-4, -5, 46, 59, '#ece6da'], [-4, -5, 46, 2, '#f6f2ea'], [-1, -1, 40, 1, '#bdb3a2'],
  [0, 0, 38, 54, '#4a3e3a'], [1, 1, 36, 53, '#6e4c3a'], [18, 1, 2, 53, '#5a3e30'],
  [3, 3, 13, 22, '#786e86'], [3, 28, 13, 24, '#786e86'], [22, 3, 13, 22, '#786e86'],
  [22, 28, 13, 24, '#786e86'], [4, 4, 2, 10, '#e9c79a'], [7, 4, 1, 6, '#d9b48c'],
  [23, 29, 2, 9, '#e9c79a'], [26, 29, 1, 5, '#d9b48c']
];
const VANO_GLASS = [[3, 3, 13, 22], [3, 28, 13, 24], [22, 3, 13, 22], [22, 28, 13, 24]];

function rects(g, list, ox, oy) {
  for (const [x, y, w, h, c] of list) {
    g.fillStyle = c;
    g.fillRect(ox + x, oy + y, w, h);
  }
}

function fillRect(g, color, x, y, w, h) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

// Balcón de forja como los del edificio: barrotes, celosía abajo y repisa.
function drawBalcony(g, x, y, w, ironColor, ledge, ledgeShadow) {
  fillRect(g, ironColor, x, y, w, 2);
  for (let bx = x + 1; bx < x + w - 1; bx += 4) fillRect(g, ironColor, bx, y + 2, 1, 10);
  fillRect(g, ironColor, x, y + 11, w, 1);
  for (let bx = x + 1; bx < x + w - 2; bx += 4) {
    fillRect(g, ironColor, bx + 1, y + 12, 1, 1);
    fillRect(g, ironColor, bx, y + 13, 1, 1);
    fillRect(g, ironColor, bx + 2, y + 13, 1, 1);
    fillRect(g, ironColor, bx + 1, y + 14, 1, 1);
  }
  fillRect(g, ironColor, x, y + 17, w, 1);
  fillRect(g, ironColor, x, y, 1, 18);
  fillRect(g, ironColor, x + w - 1, y, 1, 18);
  fillRect(g, ledge, x - 1, y + 18, w + 2, 3);
  fillRect(g, ledgeShadow, x + 1, y + 21, w - 2, 2);
}

// Sombrilla rosa en un balcón (como en la calle real).
function drawParasol(g, cx, cy) {
  const rows = [[-1, 2], [-3, 6], [-5, 10], [-6, 12], [-7, 14]];
  rows.forEach(([dx, w], i) => fillRect(g, i % 2 ? '#f28aaa' : '#ff9fbe', cx + dx, cy + i, w, 1));
  fillRect(g, '#d8577f', cx - 7, cy + 4, 14, 1);
  for (const dx of [-5, -2, 1, 4]) fillRect(g, '#d8577f', cx + dx, cy + 1, 1, 3);
  fillRect(g, '#ffd2dc', cx - 2, cy + 1, 2, 1);
  fillRect(g, '#6b4a3a', cx, cy + 5, 1, 12);
}

function drawPlants(g, x, y, w, night) {
  const leaf = night > 0.5 ? '#4f6a46' : '#6f8f5c';
  const leaf2 = night > 0.5 ? '#5d7a52' : '#7f9a64';
  for (let px = x; px < x + w; px += 9) {
    fillRect(g, '#b5684a', px, y + 6, 7, 5);
    fillRect(g, leaf, px - 1, y, 9, 6);
    fillRect(g, leaf2, px + 1, y - 2, 5, 3);
    fillRect(g, px % 2 ? '#e0708e' : '#e8c95a', px + 2, y - 3, 2, 2);
  }
}

let wallTile = null;
function getWallTile(facade) {
  if (wallTile) return wallTile;
  if (!facade?.complete || !facade.naturalWidth) return null;
  // Columna limpia de la fachada (x 90–108): tejado, cornisa, sillería e impostas.
  // Termina en la fila 308: a partir de la 309 empieza el letrero.
  const c = document.createElement('canvas');
  c.width = 18;
  c.height = 309 - 46;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.drawImage(facade, 90, 46, 18, c.height, 0, 0, 18, c.height);
  wallTile = c;
  return c;
}

let zocaloSlice = null;
function getZocaloSlice(facade) {
  if (zocaloSlice) return zocaloSlice;
  if (!facade?.complete || !facade.naturalWidth) return null;
  // Zócalo de granito del edificio (x 176–190: dos repeticiones del dibujo).
  const c = document.createElement('canvas');
  // Solo filas 352–377 (cinco repeticiones): debajo asoma el caballete de la acera.
  c.width = 14;
  c.height = 25;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.drawImage(facade, 176, 352, 14, 25, 0, 0, 14, 25);
  zocaloSlice = c;
  return c;
}

// Zócalo continuo, con el mismo dibujo que el del edificio (periodo de 7).
function drawZocalo(g, facade, a, b) {
  const slice = getZocaloSlice(facade);
  if (!slice) {
    fillRect(g, '#a4a09a', a, 352, b - a, 30);
    return;
  }
  g.save();
  g.beginPath();
  g.rect(a, 352, b - a, 30);
  g.clip();
  for (let x = Math.floor((a - 1) / 14) * 14 + 1; x < b; x += 14) {
    g.drawImage(slice, x, 352);
    g.drawImage(slice, x, 377);
  }
  g.restore();
}

let sidewalkSlice = null;
function getSidewalkSlice(facade) {
  if (sidewalkSlice) return sidewalkSlice;
  if (!facade?.complete || !facade.naturalWidth) return null;
  // Tramo de acera, bordillo y calzada sin bolardos ni bici (x 24–52 de la fachada).
  const c = document.createElement('canvas');
  c.width = 28;
  c.height = FIELD_H - 382;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.drawImage(facade, 24, 382, 28, c.height, 0, 0, 28, c.height);
  sidewalkSlice = c;
  return c;
}

// Columnas de ventanas de los laterales. Se repiten hacia fuera todo lo que haga
// falta, así la calle llena también tablets y pantallas anchas.
// Como en el edificio central: dos columnas de balcones por tramo de fachada
// y un hueco grande en medio. El amarillo repite tramos de 195 hacia la izquierda
// (columnas en +24 y +133); el crema, tramos de 112 hacia la derecha (+16 y +80).
const LEFT_FLOORS = [80, 158, 236];
const leftColumnX = (k) => -FIELD_W * (Math.floor(k / 2) + 1) + (k % 2 === 0 ? 133 : 24);
const LEFT_X = leftColumnX(0);  // primera columna, junto al edificio central

const RIGHT_MODULE = 112;
const RIGHT_FLOORS = [86, 164, 242];
const rightColumnX = (c) => FIELD_W + RIGHT_MODULE * Math.floor(c / 2) + (c % 2 === 0 ? 16 : 80);

// Ventanas que se encienden de noche (solo los cristales altos: los bajos quedan tras el balcón).
function leftLit(x0) {
  const out = [];
  for (let k = 0; leftColumnX(k) - 8 >= x0; k++) {
    LEFT_FLOORS.forEach((y, i) => {
      if ((k * 3 + i + 1) % 4 === 0 || (k === 0 && i === 1)) return;
      for (const [gx, gy, gw, gh] of VANO_GLASS.filter(([, gy]) => gy < 10)) out.push([leftColumnX(k) + gx, y + gy, gw, gh]);
    });
  }
  return out;
}
function rightLit(x1) {
  const out = [];
  for (let c = 0; rightColumnX(c) + 21 <= x1; c++) {
    RIGHT_FLOORS.forEach((y, f) => {
      if ((f * 5 + c * 3 + 1) % 4 === 0) out.push([rightColumnX(c), y + 2, 16, 22]);
    });
  }
  return out;
}

// Guirnalda de bombillas del balcón de abajo de la primera columna amarilla.
const STRING_LIGHTS = [];
for (let i = 0; i < 12; i++) {
  const x = LEFT_X - 4 + i * 4;
  // Cuelgan de la barandilla (arriba en 272) formando dos guirnaldas
  STRING_LIGHTS.push([x, 236 + 36 + Math.round(Math.abs(Math.sin((i / 11) * Math.PI * 2)) * 4)]);
}

const DIGITS = {
  1: ['010', '110', '010', '010', '111'],
  7: ['111', '001', '010', '010', '010']
};

// Portal típico de Madrid: puerta de hierro y cristal con el número 17.
function drawPortal(g, x, night) {
  // Marco de hierro directamente sobre el muro del edificio
  fillRect(g, '#25242a', x + 4, 317, 32, 65);
  // Montante de cristal con la placa del número
  fillRect(g, '#7e8494', x + 6, 319, 28, 10);
  fillRect(g, '#9aa1b2', x + 7, 320, 6, 1);
  fillRect(g, '#25242a', x + 6, 329, 28, 2);
  fillRect(g, '#1d1b20', x + 13, 320, 14, 8);
  fillRect(g, '#1d1b20', x + 12, 321, 16, 6);
  const gold = '#d9a648';
  [['1', x + 15], ['7', x + 21]].forEach(([d, dx]) => {
    DIGITS[d].forEach((row, ry) => {
      for (let rx = 0; rx < 3; rx++) if (row[rx] === '1') fillRect(g, gold, dx + rx, 321 + ry, 1, 1);
    });
  });
  // Hoja de cristal con barrotes y remates dorados
  fillRect(g, night > 0.5 ? '#c99a5c' : '#5f6576', x + 6, 332, 28, 48);
  fillRect(g, night > 0.5 ? '#e0b46e' : '#8a91a5', x + 8, 334, 3, 18);
  fillRect(g, night > 0.5 ? '#e0b46e' : '#8a91a5', x + 11, 337, 2, 9);
  for (let bx = x + 7; bx < x + 34; bx += 3) fillRect(g, '#1d1c21', bx, 332, 1, 48);
  fillRect(g, '#25242a', x + 19, 332, 2, 48);
  for (let bx = x + 7; bx < x + 34; bx += 6) {
    fillRect(g, gold, bx, 344, 1, 1);
    fillRect(g, gold, bx + 3, 364, 1, 1);
  }
  fillRect(g, gold, x + 22, 356, 1, 2);
  // Escalón
  fillRect(g, '#cfc6bb', x + 2, 380, 36, 2);
}

function drawInteriorShutters(g, x, y, ajarPane) {
  for (const [gx, gy, gw, gh] of VANO_GLASS) {
    const ajar = ajarPane && gx > 10 && gy > 10;
    fillRect(g, '#9a7656', x + gx, y + gy, ajar ? 7 : gw, gh);
    for (let sy = 2; sy < gh; sy += 3) fillRect(g, '#7f5f44', x + gx, y + gy + sy, ajar ? 7 : gw, 1);
    if (ajar) fillRect(g, '#3a302c', x + gx + 7, y + gy, gw - 7, gh);
  }
}

function drawTableAndChair(g, x, y, top = '#9a6a3e', leg = '#7a5230', hi = '#b48450') {
  fillRect(g, top, x + 20, y + 41, 13, 2);
  fillRect(g, leg, x + 21, y + 43, 1, 10);
  fillRect(g, leg, x + 31, y + 43, 1, 10);
  fillRect(g, '#b5684a', x + 25, y + 37, 4, 4);
  fillRect(g, '#7f9a64', x + 24, y + 34, 6, 3);
  fillRect(g, top, x + 9, y + 38, 2, 15);
  fillRect(g, top, x + 9, y + 46, 8, 2);
  fillRect(g, leg, x + 16, y + 48, 1, 5);
  fillRect(g, hi, x + 9, y + 40, 2, 1);
}

function drawBlanket(g, x, y, color, fold, edge) {
  fillRect(g, color, x - 3, y + 36, 22, 13);
  fillRect(g, fold, x + 2, y + 37, 2, 12);
  fillRect(g, fold, x + 10, y + 37, 2, 11);
  fillRect(g, edge, x - 3, y + 36, 22, 1);
  fillRect(g, '#e9e1d2', x - 1, y + 46, 18, 1);
}

function drawGeraniums(g, x, y, hang = false) {
  if (hang) {
    // Jardinera colgada por fuera del pasamanos (que está en y + 36)
    fillRect(g, '#2a2628', x + 1, y + 35, 1, 3);
    fillRect(g, '#2a2628', x + 14, y + 35, 1, 3);
    y += 6;
  }
  fillRect(g, '#b5684a', x, y + 31, 16, 5);
  fillRect(g, '#6f8f5c', x - 1, y + 27, 18, 4);
  fillRect(g, '#7f9a64', x + 3, y + 26, 9, 1);
  const seed = Math.abs(x * 7 + y * 3);
  for (const [k, fx] of [0, 4, 8, 11, 14].entries()) {
    fillRect(g, BLOOMS[Math.floor(hash01(seed + k) * BLOOMS.length)], x + fx, y + 25 + (k % 2), 2, 2);
  }
}

// ---------- Plantas variadas para los balcones de los lados ----------
function hash01(n) {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const BLOOMS = ['#e0708e', '#d84a5a', '#f2d16b', '#f4efe6', '#b98ab0', '#ef9a6a', '#ffb3c6', '#c77dd8', '#ff8a5c'];
const LEAVES = ['#6f8f5c', '#7f9a64', '#5f8a4e', '#86a86a'];
const POTS = ['#b5684a', '#c9785a', '#a35a42', '#e9e4da', '#c9504a'];

// Ramas que cuelgan por fuera de la barandilla, como las del edificio central.
function drawVines(g, x, y, w, seed, maxLen = 14) {
  for (let i = 0, vx = x; vx < x + w; i++, vx += 3 + Math.floor(hash01(seed * 7 + i) * 4)) {
    const len = 4 + Math.floor(hash01(seed * 13 + i) * (maxLen - 4));
    for (let k = 0; k < len; k++) {
      const dx = (k >> 2) % 2;
      fillRect(g, k % 3 ? '#4f8557' : '#6f9a5c', vx + dx, y + k, 1, 1);
      if (k % 4 === 2) fillRect(g, '#6f9a5c', vx + dx + (i % 2 ? 1 : -1), y + k, 1, 1);
    }
    if (hash01(seed * 3 + i) > 0.6) fillRect(g, BLOOMS[Math.floor(hash01(seed + i * 5) * BLOOMS.length)], vx, y + len, 1, 1);
  }
}

// Fila de macetas centrada en cx, con plantas altas, bajas y flores de colores al azar.
// base = altura donde apoyan (la barandilla).
// hang: la maceta cuelga por fuera del pasamanos de la barandilla (base = pasamanos),
// con sus ganchos, como las jardineras del edificio central.
function drawPotRow(g, cx, base, n, seed, pw = 6, { first = 0, hang = false } = {}) {
  const gap = 2;
  const total = n * pw + (n - 1) * gap;
  let px = Math.round(cx - total / 2);
  const rail = base;
  if (hang) base += 6;
  for (let j = 0; j < n; j++, px += pw + gap) {
    const i = j + first;
    if (hang) {
      fillRect(g, '#2a2628', px, rail - 1, 1, 3);
      fillRect(g, '#2a2628', px + pw - 1, rail - 1, 1, 3);
    }
    const r = hash01(seed * 17 + i);
    fillRect(g, POTS[Math.floor(hash01(seed * 5 + i) * POTS.length)], px, base - 5, pw, 5);
    fillRect(g, 'rgba(42,22,38,0.25)', px, base - 1, pw, 1);
    const leaf = LEAVES[Math.floor(hash01(seed * 11 + i) * LEAVES.length)];
    if (r < 0.35) {
      // Planta alta: tallos con hojas a los lados y flores arriba
      const h = 9 + Math.floor(hash01(seed * 23 + i) * 6);
      fillRect(g, leaf, px + 2, base - 5 - h, 2, h);
      for (let k = 2; k < h; k += 2) fillRect(g, k % 4 ? '#7fa65f' : leaf, px + (k % 4 ? 0 : 4), base - 5 - k, 2, 1);
      const c1 = BLOOMS[Math.floor(hash01(seed * 29 + i) * BLOOMS.length)];
      const c2 = BLOOMS[Math.floor(hash01(seed * 43 + i) * BLOOMS.length)];
      fillRect(g, c1, px + 1, base - 6 - h, 3, 2);
      fillRect(g, c2, px + (hash01(seed + i) > 0.5 ? 4 : -1), base - 1 - h, 2, 2);
    } else if (r < 0.7) {
      // Mata baja con muchas flores
      fillRect(g, leaf, px - 1, base - 9, pw + 2, 4);
      fillRect(g, leaf, px, base - 10, pw, 1);
      for (let k = 0; k < 4; k++) {
        const c = BLOOMS[Math.floor(hash01(seed * 31 + i * 4 + k) * BLOOMS.length)];
        fillRect(g, c, px - 1 + ((k * 3 + Math.floor(hash01(seed * 37 + i) * 3)) % (pw + 1)), base - 11 + (k % 2) * 2, 2, 2);
      }
    } else {
      // Planta colgante: poca altura y ramas que caen por delante
      fillRect(g, leaf, px - 1, base - 7, pw + 2, 2);
      fillRect(g, leaf, px + 1, base - 8, pw - 2, 1);
      drawVines(g, px, base - 5, pw, seed * 41 + i, 10);
    }
  }
}

// Planta grande en el suelo del balcón, detrás de la barandilla (ficus o palmera pequeña).
function drawTallPlant(g, cx, floor, seed, pot = null) {
  fillRect(g, pot || POTS[Math.floor(hash01(seed) * POTS.length)], cx - 4, floor - 7, 9, 7);
  if (pot) fillRect(g, 'rgba(42,22,38,0.12)', cx + 2, floor - 7, 3, 7);
  const h = 18 + Math.floor(hash01(seed * 3) * 8);
  const palm = hash01(seed * 7) > 0.5;
  fillRect(g, '#6b5440', cx, floor - 7 - h + 4, 1, h - 4);
  if (palm) {
    for (const [dx, dy, len] of [[-1, 0, 7], [1, 0, 7], [-1, 4, 5], [1, 4, 5], [0, -2, 4]]) {
      for (let k = 0; k < len; k++) fillRect(g, k % 2 ? '#5f8a4e' : '#7fa65f', cx + dx * k, floor - 7 - h + dy + Math.floor(k / 2) - (dx === 0 ? k : 0), 1, 1);
    }
  } else {
    for (let k = 0; k < 6; k++) {
      const lx = cx - 5 + Math.floor(hash01(seed * 13 + k) * 9);
      const ly = floor - 7 - h + Math.floor(hash01(seed * 17 + k) * (h - 6));
      fillRect(g, LEAVES[k % 4], lx, ly, 4, 3);
    }
  }
}

function drawGreenAwning(g, x, y, len) {
  fillRect(g, '#7c9a74', x - 2, y, 20, len);
  fillRect(g, '#6a8763', x - 2, y + len - 1, 20, 1);
  for (let sx = x; sx < x + 18; sx += 4) fillRect(g, '#8eaa86', sx, y, 1, len - 1);
  // Festón
  for (let sx = x - 2; sx < x + 18; sx += 4) fillRect(g, '#6a8763', sx + 1, y + len, 2, 1);
}

function drawLaundry(g, x, y, color, second) {
  fillRect(g, color, x - 2, y + 27, 9, 12);
  fillRect(g, 'rgba(42,22,38,0.15)', x + 2, y + 27, 1, 12);
  fillRect(g, second, x + 9, y + 27, 7, 8);
}

// Decoración de cada ventana del edificio crema: [columna][planta]
// Ventanas numeradas de izquierda a derecha y de arriba abajo (1–4, 5–8, 9–12).
const RIGHT_DECOR = [
  [
    { awning: 11, pots: [2, 1], first: 1 },                // 1
    { tall: 5, tallDx: 15 },                                 // 5
    { pots: [2, 2], vines: 16 }                              // 9
  ],
  [
    { vines: 8 },                                            // 2
    { pots: [3, 3] },                                        // 6
    { pots: [3, 4], vines: 10 }                              // 10
  ],
  [
    { pots: [3, 7], vines: 12 },                             // 3
    { tall: 8, tallDx: 4, tallPot: '#e6dcc6' },              // 7
    { awning: 14, pots: [2, 9], vines: 16 }                  // 11
  ],
  [
    { awning: 9, tall: 10 },                                 // 4
    { pots: [3, 11], vines: 12 },                            // 8
    { floorPot: [1, 12] }                                    // 12
  ],
  // Columna extra de las pantallas anchas: como la primera pero sin toldo
  [
    { pots: [2, 21], first: 1 },
    { tall: 25, tallDx: 15 },
    { pots: [2, 22], vines: 16 }
  ]
];

// Bicicleta guardada en el balcón (como en la calle real).
function drawBalconyBike(g, x, y) {
  const c = '#2a2628';
  for (const wx of [x, x + 12]) {
    fillRect(g, c, wx + 1, y, 3, 1);
    fillRect(g, c, wx + 1, y + 4, 3, 1);
    fillRect(g, c, wx, y + 1, 1, 3);
    fillRect(g, c, wx + 4, y + 1, 1, 3);
  }
  fillRect(g, '#5b7bb5', x + 3, y - 1, 10, 1);
  fillRect(g, '#5b7bb5', x + 7, y - 4, 1, 4);
  fillRect(g, '#5b7bb5', x + 12, y - 4, 1, 4);
  fillRect(g, c, x + 5, y - 5, 3, 1);
  fillRect(g, c, x + 11, y - 5, 3, 1);
}

// Floristería junto al portal 17, inspirada en una floristería de barrio de Madrid:
// toldo granate con festón crema, estanterías llenas de macetas y cubos de flores en la acera.
const FLORIST_W = 102;
// Centrada con el balcón de encima (columna -171, centro -152).
const FLORIST_X = -152 - FLORIST_W / 2;
const FLOWER_COLORS = ['#e0708e', '#d84a5a', '#f2d16b', '#f4efe6', '#b98ab0', '#ef9a6a', '#ffb3c6'];
const POT_COLORS = ['#b5684a', '#e9e4da', '#c9504a', '#d9a648', '#9a9ca0'];

function drawFlorist(g, x, night) {
  const w = FLORIST_W;
  // Hueco de la tienda y fondo del interior
  fillRect(g, '#2a2826', x, 314, w, 68);
  fillRect(g, night > 0.5 ? '#4a3a2a' : '#26332b', x + 3, 328, w - 6, 44);
  // Estanterías con macetas de tamaños distintos y alguna planta que cuelga
  for (const [i, sy] of [336, 347, 358].entries()) {
    fillRect(g, '#6b5440', x + 3, sy, w - 6, 1);
    fillRect(g, '#4a3a2c', x + 3, sy + 1, w - 6, 1);
    let px = x + 5 + (i % 2) * 2;
    for (let n = i * 7; px < x + w - 8; n++) {
      const big = (n * 5 + i) % 4 === 0;
      const pw = big ? 5 : 3;
      const ph = big ? 4 : 3;
      if ((n * 7 + i * 3) % 9 !== 0) {
        fillRect(g, POT_COLORS[(n * 3 + i) % POT_COLORS.length], px, sy - ph, pw, ph);
        fillRect(g, (n + i) % 3 ? '#5f8a4e' : '#7fa65f', px - (big ? 1 : 0), sy - ph - 3, pw + (big ? 2 : 0), 3);
        fillRect(g, FLOWER_COLORS[(n * 3 + i) % FLOWER_COLORS.length], px + (n % 2), sy - ph - 4, 2, 2);
        if (big) fillRect(g, FLOWER_COLORS[(n * 5 + 2) % FLOWER_COLORS.length], px + 3, sy - ph - 5, 2, 2);
        if (i === 0 && n % 5 === 2) fillRect(g, '#6f9a5c', px + 1, sy + 2, 1, 6);
      }
      px += pw + 1 + ((n * 3) % 3 === 0 ? 1 : 0);
    }
  }
  // Macetas colgantes bajo el toldo
  for (const hx of [x + 16, x + 44, x + 70]) {
    fillRect(g, '#4a3a2c', hx + 2, 328, 1, 3);
    fillRect(g, '#c9a070', hx, 331, 5, 3);
    fillRect(g, '#5f8a4e', hx - 1, 329, 7, 2);
    fillRect(g, '#6f9a5c', hx, 334, 1, 4);
    fillRect(g, '#6f9a5c', hx + 4, 334, 1, 3);
  }
  // Plantas grandes a los lados, ya en la acera
  fillRect(g, '#a8775f', x - 6, 372, 7, 10);
  fillRect(g, '#5f8a4e', x - 8, 362, 11, 10);
  fillRect(g, '#7fa65f', x - 6, 359, 6, 4);
  fillRect(g, '#e0708e', x - 5, 360, 2, 2);
  fillRect(g, '#a8775f', x + w - 1, 374, 6, 8);
  fillRect(g, '#7fa65f', x + w - 3, 365, 10, 9);
  fillRect(g, '#f2d16b', x + w + 1, 366, 2, 2);
  // Grada en la acera con cubos de flores
  fillRect(g, '#5a4636', x + 2, 366, w - 4, 3);
  fillRect(g, '#4a3a2c', x + 2, 374, w - 4, 2);
  for (let bx = x + 4, n = 0; bx < x + w - 6; bx += 7, n++) {
    const by = n % 2 ? 368 : 375;
    fillRect(g, '#8f949a', bx, by, 5, 7);
    fillRect(g, '#a9aeb4', bx, by, 5, 1);
    fillRect(g, '#5f8a4e', bx, by - 3, 5, 3);
    fillRect(g, FLOWER_COLORS[n % FLOWER_COLORS.length], bx, by - 5, 2, 2);
    fillRect(g, FLOWER_COLORS[(n + 2) % FLOWER_COLORS.length], bx + 3, by - 4, 2, 2);
    fillRect(g, FLOWER_COLORS[(n + 4) % FLOWER_COLORS.length], bx + 1, by - 6, 2, 1);
  }
  // Postes: contorno de 1 px como el de la librería central y madera oscura
  fillRect(g, '#3e3432', x, 314, 1, 68);
  fillRect(g, '#4a3a2c', x + 1, 314, 2, 68);
  fillRect(g, '#3e3432', x + w - 1, 314, 1, 68);
  fillRect(g, '#4a3a2c', x + w - 3, 314, 2, 68);
  // Toldo granate con festón crema, con el mismo contorno de 1 px
  fillRect(g, '#3e3432', x - 3, 311, w + 6, 16);
  fillRect(g, '#5e1e28', x - 2, 312, w + 4, 3);
  fillRect(g, '#7a2833', x - 2, 315, w + 4, 10);
  fillRect(g, '#8c3440', x - 2, 315, w + 4, 1);
  for (let sx = x - 2; sx < x + w + 2; sx += 6) {
    fillRect(g, '#7a2833', sx, 325, 6, 2);
    fillRect(g, '#7a2833', sx + 1, 327, 4, 1);
    fillRect(g, '#e8d9c0', sx, 325, 1, 2);
  }
  fillRect(g, '#e8d9c0', x - 2, 324, w + 4, 1);
  // Emblema: una rosa dentro de un círculo, sin nombre
  const lx = x + 8;
  fillRect(g, '#e8d9c0', lx + 1, 316, 5, 1);
  fillRect(g, '#e8d9c0', lx + 1, 322, 5, 1);
  fillRect(g, '#e8d9c0', lx, 317, 1, 5);
  fillRect(g, '#e8d9c0', lx + 6, 317, 1, 5);
  fillRect(g, '#ffb3c6', lx + 2, 317, 3, 2);
  fillRect(g, '#e0708e', lx + 3, 318, 1, 1);
  fillRect(g, '#9ec48a', lx + 3, 319, 1, 2);
  fillRect(g, '#9ec48a', lx + 2, 320, 1, 1);
  // Filete crema decorativo a lo largo del toldo
  fillRect(g, '#c98a8f', lx + 10, 319, w - 22, 1);
  // Ramito colgante en el poste
  fillRect(g, '#c9a070', x + w - 9, 330, 6, 3);
  fillRect(g, '#5f8a4e', x + w - 9, 327, 6, 3);
  fillRect(g, '#e0708e', x + w - 8, 326, 2, 2);
  fillRect(g, '#f2d16b', x + w - 5, 327, 2, 2);
  fillRect(g, '#4a3a2c', x + w - 7, 323, 1, 4);
}

function drawLeftBuilding(g, facade, x0, night) {
  const tile = getWallTile(facade);
  // Muro, cornisa y tejado: la misma sillería ocre del edificio
  if (tile) {
    for (let x = -18; x >= x0 - 18; x -= 18) g.drawImage(tile, x, 46);
  } else {
    fillRect(g, '#d3bd8c', x0, 46, -x0, 265);
  }

  // Solo columnas que caben enteras: nada de balcones cortados por el borde
  for (let k = 0; leftColumnX(k) - 8 >= x0; k++) {
    const lx = leftColumnX(k);
    const set = k === 0 ? 0 : 1 + ((k - 1) % 3);
    LEFT_FLOORS.forEach((y, i) => {
      rects(g, VANO, lx, y);
      // Lo que va detrás de la barandilla
      if (set === 0 && i === 0) { drawInteriorShutters(g, lx, y, false); drawTableAndChair(g, lx, y, '#f4efe4', '#c9c1b2', '#ffffff'); }
      if (set === 1 && i === 1) drawInteriorShutters(g, lx, y, false);
      if (set === 1 && i === 2) drawTallPlant(g, lx + 30, y + 53, 21 + k);
      if (set === 2 && i === 1) { fillRect(g, '#3a302c', lx + 20, y + 1, 17, 53); drawGeraniums(g, lx + 22, y, true); }
      if (set === 3 && i === 0) drawTableAndChair(g, lx, y);
      if (set === 3 && i === 2) drawInteriorShutters(g, lx, y, true);
      drawBalcony(g, lx - 6, y + 36, 50, '#3e3a42', '#e2d8c4', '#a39582');
      // Lo que cuelga de la barandilla o va en la repisa
      if (set === 0 && i === 1) { drawBlanket(g, lx, y, '#5b7bb5', '#46629a', '#8aa6d6'); drawGeraniums(g, lx + 24, y, true); }
      if (set === 0 && i === 2) {
        // Cactus en maceta colgada del pasamanos
        fillRect(g, '#2a2628', lx + 30, y + 35, 1, 3);
        fillRect(g, '#2a2628', lx + 35, y + 35, 1, 3);
        fillRect(g, '#a8775f', lx + 30, y + 37, 6, 6);
        fillRect(g, 'rgba(42,22,38,0.25)', lx + 30, y + 42, 6, 1);
        fillRect(g, '#6f8f5c', lx + 32, y + 28, 2, 9);
        fillRect(g, '#6f8f5c', lx + 30, y + 31, 2, 3);
        fillRect(g, '#6f8f5c', lx + 34, y + 30, 2, 3);
        fillRect(g, '#ff9fbe', lx + 32, y + 27, 2, 1);
        for (let n = 0; n < STRING_LIGHTS.length - 1; n++) fillRect(g, '#4a4450', STRING_LIGHTS[n][0], STRING_LIGHTS[n][1], 4, 1);
        for (const [sx, sy] of STRING_LIGHTS) fillRect(g, '#f4e6c0', sx + 1, sy + 1, 1, 2);
      }
      if (set === 1 && i === 0) {
        drawPotRow(g, lx + 19, y + 36, 5, 50 + k, 6, { hang: true });
        drawVines(g, lx - 4, y + 54, 46, 60 + k, 12);
      }
      if (set === 2 && i === 0) { drawGeraniums(g, lx, y, true); drawVines(g, lx - 4, y + 54, 22, 70 + k, 14); }
      if (set === 2 && i === 2) drawBlanket(g, lx + 18, y, '#d98aa6', '#c2708e', '#efb3c8');
      if (set === 1 && i === 2) { drawPotRow(g, lx + 8, y + 36, 2, 40 + k, 6, { hang: true }); drawVines(g, lx + 20, y + 54, 20, 45 + k, 16); }
      if (set === 3 && i === 1) { drawPotRow(g, lx + 19, y + 36, 3, 80 + k, 6, { hang: true }); drawVines(g, lx + 8, y + 54, 24, 90 + k, 10); }
    });
  }

  // Planta baja: la misma sillería baja hasta el zócalo de granito
  // (filas 261–303 de la columna limpia: mismo dibujo que las 309–351)
  if (tile) {
    for (let x = -18; x >= x0 - 18; x -= 18) g.drawImage(tile, 0, 261 - 46, 18, 43, x, 309, 18, 43);
  } else {
    fillRect(g, '#d3bd8c', x0, 309, -x0, 43);
  }
  drawZocalo(g, facade, x0, 0);
  drawPortal(g, LEFT_X - 2, night);
  if (x0 < FLORIST_X + FLORIST_W) drawFlorist(g, FLORIST_X, night);
}

// Bar de barrio en la planta baja del edificio crema, inspirado en un bar rojo de Malasaña:
// rótulo rojo con un emblema dorado (sin nombre) y cristalera con marcos rojos.
const BAR_W = 92;
// Centrado en la esquina de sillares que separa los dos tramos del edificio crema.
const BAR_X = FIELD_W + RIGHT_MODULE - BAR_W / 2;
// Verde botella apagado y dorado viejo, a juego con las persianas verdes del edificio
const BAR_RED = '#4f6a5c';
const BAR_RED_DARK = '#34483f';
const BAR_RED_LIGHT = '#6a8676';
const BAR_GOLD = '#cfae72';
// Huecos de cristal: [x relativo, ancho]
const BAR_PANES = [[4, 29], [39, 14], [59, 29]];

function drawBar(g, x, night) {
  const w = BAR_W;
  // Marco rojo de la cristalera
  fillRect(g, BAR_RED_DARK, x, 324, w, 58);
  fillRect(g, BAR_RED, x + 1, 325, w - 2, 56);
  // Interior visto a través del cristal
  const back = night > 0.5 ? '#7a4a30' : '#5e3e30';
  for (const [px, pw] of BAR_PANES) {
    const gx = x + px;
    const door = pw < 20;
    const bottom = door ? 380 : 370;
    fillRect(g, back, gx, 328, pw, bottom - 328);
    if (!door) {
      // Estante con botellas y barra
      // Estante algo más bajo para que las botellas no toquen la lámpara; botellas al azar
      fillRect(g, '#3e2a22', gx, 344, pw, 1);
      for (let bx = gx + 1, n = 0, ci = px % 5; bx < gx + pw - 1; bx += 3, n++) {
        const seed = px * 31 + n * 7;
        ci = (ci + 1 + Math.floor(hash01(seed) * 4)) % 5; // nunca dos seguidas del mismo color
        const c = ['#3f6a4a', '#9a5a2a', '#d8c08a', '#6a2a3a', '#2f4a6a'][ci];
        const bh = 3 + Math.floor(hash01(seed + 11) * 3);
        fillRect(g, c, bx, 344 - bh, 2, bh);
        fillRect(g, c, bx + (hash01(seed + 5) > 0.5 ? 1 : 0), 344 - bh - 1, 1, 1);
      }
      fillRect(g, '#2e1c18', gx, 358, pw, 12);
      fillRect(g, '#8a5a3a', gx, 357, pw, 2);
      if (px < 30) {
        // Una caña en la barra del escaparate izquierdo
        fillRect(g, '#f2c24a', gx + pw - 9, 353, 2, 4);
        fillRect(g, '#fff6d8', gx + pw - 9, 353, 2, 1);
      }
      // Taburetes
      for (let tx = gx + 4; tx < gx + pw - 3; tx += 9) {
        fillRect(g, BAR_RED_DARK, tx, 362, 4, 2);
        fillRect(g, '#2a1a16', tx + 1, 364, 2, 6);
      }
      // Lámpara colgante
      const lx = gx + Math.floor(pw / 2) - 2;
      fillRect(g, '#2a1a16', lx + 2, 328, 1, 4);
      fillRect(g, BAR_GOLD, lx, 332, 5, 2);
      fillRect(g, '#fff0c0', lx + 1, 334, 3, 1);
    } else {
      // Puerta abierta de cristal: suelo rojo y un poco de luz
      fillRect(g, '#7a3a2e', gx, 372, pw, 8);
      fillRect(g, BAR_GOLD, gx + pw - 3, 350, 1, 6);
    }
    // Reflejo del cristal
    g.fillStyle = 'rgba(200,225,240,0.16)';
    g.fillRect(gx, 328, pw, bottom - 328);
    g.fillStyle = 'rgba(255,255,255,0.22)';
    for (let i = 0; i < 10; i++) g.fillRect(gx + 2 + i, 346 - i, 1, 1);
    for (let i = 0; i < 6; i++) g.fillRect(gx + 6 + i, 346 - i, 1, 1);
  }
  // Zócalo rojo bajo los escaparates y umbral
  for (const [px, pw] of [BAR_PANES[0], BAR_PANES[2]]) {
    fillRect(g, BAR_RED_DARK, x + px, 370, pw, 1);
    fillRect(g, '#45604f', x + px, 371, pw, 9);
  }
  fillRect(g, '#9a9488', x + 37, 380, 18, 2);
  // Postes: contorno de 1 px como el de la librería central y el color oscuro del bar
  fillRect(g, '#3e3432', x, 324, 1, 58);
  fillRect(g, BAR_RED_DARK, x + 1, 324, 2, 58);
  fillRect(g, '#3e3432', x + w - 1, 324, 1, 58);
  fillRect(g, BAR_RED_DARK, x + w - 3, 324, 2, 58);
  // Rótulo corrido con el mismo contorno de 1 px y banda oscura arriba, como el toldo de la floristería
  fillRect(g, '#3e3432', x - 4, 306, w + 8, 20);
  fillRect(g, BAR_RED_DARK, x - 3, 307, w + 6, 18);
  fillRect(g, BAR_RED, x - 3, 311, w + 6, 12);
  fillRect(g, BAR_RED_LIGHT, x - 3, 311, w + 6, 1);
  fillRect(g, BAR_GOLD, x + 2, 316, 34, 1);
  fillRect(g, BAR_GOLD, x + w - 36, 316, 34, 1);
  // Emblema: copa dentro de un círculo dorado, sin nombre
  const ex = x + w / 2 - 4;
  fillRect(g, BAR_GOLD, ex + 2, 312, 5, 1);
  fillRect(g, BAR_GOLD, ex + 2, 322, 5, 1);
  fillRect(g, BAR_GOLD, ex + 1, 313, 1, 1);
  fillRect(g, BAR_GOLD, ex + 7, 313, 1, 1);
  fillRect(g, BAR_GOLD, ex + 1, 321, 1, 1);
  fillRect(g, BAR_GOLD, ex + 7, 321, 1, 1);
  fillRect(g, BAR_GOLD, ex, 314, 1, 7);
  fillRect(g, BAR_GOLD, ex + 8, 314, 1, 7);
  // Copa centrada en el círculo: el interior va de la fila 313 a la 321 (centro 317);
  // la copa ocupa 315–319, con el mismo hueco arriba y abajo
  fillRect(g, '#f4efe6', ex + 2, 315, 5, 1);
  fillRect(g, '#f4efe6', ex + 3, 316, 3, 1);
  fillRect(g, '#f4efe6', ex + 4, 317, 1, 2);
  fillRect(g, '#f4efe6', ex + 3, 319, 3, 1);
}

function drawRightBuilding(g, facade, x1, night) {
  const x0 = FIELD_W;
  const w = x1 - x0;
  const wall = '#e8dcc0';
  const trim = '#f5efe2';
  const trimShade = '#c9bc9f';
  // Tejado y cornisa continuos: los mismos del edificio central (filas 46–69),
  // con su moldura crema, la fila de dentículos y la línea de sombra.
  const tile = getWallTile(facade);
  if (tile) {
    for (let x = x0; x < x1; x += 18) g.drawImage(tile, 0, 0, 18, 24, x, 46, 18, 24);
  } else {
    fillRect(g, '#8a8296', x0, 46, w, 16);
    fillRect(g, '#e2d8c4', x0, 62, w, 6);
    fillRect(g, '#8f7f6c', x0, 68, w, 2);
  }
  fillRect(g, wall, x0, 70, w, 282);
  // Sillares almohadillados en la esquina de cada tramo
  for (let qx = x0; qx < x1; qx += RIGHT_MODULE) {
    for (let y = 70, k = 0; y < 352; y += 9, k++) {
      const qw = k % 2 ? 7 : 10;
      fillRect(g, '#d9c69a', qx, y, qw, 8);
      fillRect(g, '#c8b385', qx, y + 8, qw, 1);
      for (let d = 0; d < 6; d++) fillRect(g, '#c4ae80', qx + 1 + (d * 3 + k) % (qw - 1), y + 1 + (d * 5 + k) % 6, 1, 1);
    }
  }
  // Impostas blancas
  for (const y of [146, 224, 302]) {
    fillRect(g, trim, x0 + 10, y, w - 10, 4);
    fillRect(g, trimShade, x0 + 10, y + 4, w - 10, 1);
  }
  for (let c = 0; rightColumnX(c) + 21 <= x1; c++) {
    const x = rightColumnX(c);
    RIGHT_FLOORS.forEach((y, f) => {
      // Recercado blanco y ventana
      fillRect(g, trim, x - 4, y - 5, 24, 50);
      fillRect(g, trimShade, x - 4, y + 45, 24, 1);
      fillRect(g, '#6b4e3c', x - 1, y - 1, 18, 46);
      fillRect(g, '#59607a', x, y, 16, 44);
      fillRect(g, '#7a82a0', x + 2, y + 2, 2, 10);
      fillRect(g, '#6b4e3c', x + 7, y, 2, 44);
      const d = RIGHT_DECOR[Math.min(c, RIGHT_DECOR.length - 1)][f];
      const seed = 100 + c * 10 + f;
      if (d.awning) drawGreenAwning(g, x, y, d.awning);
      if (d.tall) drawTallPlant(g, x + (d.tallDx ?? 8), y + 43, d.tall, d.tallPot);
      if (d.floorPot) drawPotRow(g, x + 15, y + 43, d.floorPot[0], seed + d.floorPot[1]);
      drawBalcony(g, x - 4, y + 26, 24, '#3a363e', trim, trimShade);
      if (d.laundry) drawLaundry(g, x, y, d.laundry[0], d.laundry[1]);
      if (d.vines) drawVines(g, x - 3, y + 44, 22, seed, d.vines);
      if (d.pots) drawPotRow(g, x + 8, y + 26, d.pots[0], seed + d.pots[1], 6, { first: d.first || 0, hang: true });
    });
  }
  // Planta baja: solo pared, con el zócalo de granito
  drawZocalo(g, facade, x0, x1);
  if (BAR_X + BAR_W + 4 <= x1) drawBar(g, BAR_X, night);
}

// Bolardo antiaparcamiento como los de la acera del edificio central.
function drawBollard(g, x) {
  fillRect(g, 'rgba(42,22,38,0.22)', x - 9, 399, 10, 2);
  fillRect(g, '#2f2c30', x, 386, 4, 15);
  fillRect(g, '#4a464c', x - 1, 385, 6, 2);
  fillRect(g, '#6a666c', x + 3, 387, 1, 13);
}

const DIGIT_FONT = {
  1: ['010', '110', '010', '010', '111'],
  7: ['111', '001', '010', '010', '010']
};

// Señal de calle con guiño a la canción: zona residencial con una pareja y un corazón,
// y debajo un «ceda el paso» con un corazón dentro.
function drawSongSign(g, x) {
  // Poste
  fillRect(g, 'rgba(42,22,38,0.22)', x - 10, 399, 11, 2);
  fillRect(g, '#8f949a', x, 330, 2, 71);
  fillRect(g, '#b4b9bf', x, 330, 1, 71);
  // Señal azul rectangular
  const sx = x - 11, sy = 312;
  fillRect(g, '#f2f2ee', sx, sy, 24, 18);
  fillRect(g, '#2f5fa8', sx + 1, sy + 1, 22, 16);
  // Pareja de la mano y corazón
  const w = '#f2f2ee';
  fillRect(g, w, sx + 7, sy + 7, 2, 2);
  fillRect(g, w, sx + 7, sy + 9, 2, 4);
  fillRect(g, w, sx + 6, sy + 13, 1, 3);
  fillRect(g, w, sx + 9, sy + 13, 1, 3);
  fillRect(g, w, sx + 14, sy + 8, 2, 2);
  fillRect(g, w, sx + 14, sy + 10, 2, 3);
  fillRect(g, w, sx + 13, sy + 13, 1, 3);
  fillRect(g, w, sx + 16, sy + 13, 1, 3);
  fillRect(g, w, sx + 9, sy + 10, 5, 1);
  fillRect(g, '#ff6f94', sx + 10, sy + 3, 2, 1);
  fillRect(g, '#ff6f94', sx + 13, sy + 3, 2, 1);
  fillRect(g, '#ff6f94', sx + 10, sy + 4, 5, 1);
  fillRect(g, '#ff6f94', sx + 11, sy + 5, 3, 1);
  fillRect(g, '#ff6f94', sx + 12, sy + 6, 1, 1);
  // Debajo, un «ceda el paso» con un corazón: cede el paso al amor
  const cx = x + 1, ty = 333;
  for (let i = 0; i < 12; i++) {
    const half = Math.round((11 - i) * 0.62);
    fillRect(g, '#d43a3a', cx - half - 1, ty + i, half * 2 + 2, 1);
    if (i >= 2 && i <= 8) {
      const ih = Math.max(0, half - 2);
      fillRect(g, '#f6f4ee', cx - ih, ty + i, ih * 2, 1);
    }
  }
  fillRect(g, '#ff3d6e', cx - 3, ty + 3, 2, 1);
  fillRect(g, '#ff3d6e', cx + 1, ty + 3, 2, 1);
  fillRect(g, '#ff3d6e', cx - 3, ty + 4, 6, 1);
  fillRect(g, '#ff3d6e', cx - 2, ty + 5, 4, 1);
  fillRect(g, '#ff3d6e', cx - 1, ty + 6, 2, 1);
}

// Pizarra de caballete frente a la floristería, con un cardo seco dibujado
// como las flores de la portada.
function drawFlowerChalkboard(g, x) {
  fillRect(g, 'rgba(42,22,38,0.22)', x - 9, 399, 26, 2);
  // Caballete de madera
  fillRect(g, '#7a5a3e', x, 380, 2, 21);
  fillRect(g, '#7a5a3e', x + 19, 380, 2, 21);
  fillRect(g, '#8a6a48', x, 378, 21, 2);
  fillRect(g, '#8a6a48', x, 396, 21, 2);
  fillRect(g, '#2f3a34', x + 2, 380, 17, 16);
  // Cardo seco en tiza: tallo con hojas y cabeza malva con pinchos
  fillRect(g, '#9fbf8a', x + 10, 387, 1, 8);
  fillRect(g, '#9fbf8a', x + 7, 391, 3, 1);
  fillRect(g, '#9fbf8a', x + 6, 390, 1, 1);
  fillRect(g, '#9fbf8a', x + 11, 389, 3, 1);
  fillRect(g, '#9fbf8a', x + 14, 388, 1, 1);
  fillRect(g, '#e8e2c8', x + 8, 385, 5, 2);
  fillRect(g, '#d98ab4', x + 7, 383, 7, 2);
  fillRect(g, '#d98ab4', x + 8, 382, 5, 1);
  fillRect(g, '#b56a9a', x + 6, 382, 1, 1);
  fillRect(g, '#b56a9a', x + 14, 382, 1, 1);
  fillRect(g, '#b56a9a', x + 8, 381, 1, 1);
  fillRect(g, '#b56a9a', x + 12, 381, 1, 1);
  fillRect(g, '#b56a9a', x + 10, 381, 1, 1);
  // Rayitas de tiza
  fillRect(g, '#cfd6d0', x + 4, 393, 4, 1);
  fillRect(g, '#cfd6d0', x + 13, 393, 4, 1);
}

// Árbol joven de calle madrileña, con su alcorque y copa ligera de hojas claras.
const TREE_X = BAR_X + BAR_W + 36;
const TREE_LEAVES = ['#6f9a52', '#86b062', '#9ec47a', '#5c8446', '#7fa65f'];
function drawStreetTree(g, x) {
  // Alcorque
  fillRect(g, '#5a5048', x - 7, 389, 16, 5);
  fillRect(g, '#3e3530', x - 6, 390, 14, 3);
  fillRect(g, 'rgba(42,22,38,0.22)', x - 12, 399, 14, 2);
  // Tronco fino y ramas
  const top = 314; // altura de la copa: algo más bajo que las ventanas del primer piso
  fillRect(g, '#5e4a3c', x, top, 2, 392 - top);
  fillRect(g, '#7a6250', x, top, 1, 392 - top);
  const branches = [[-1, 316, -9, 12], [2, 310, 10, 13], [-1, 300, -6, 12], [2, 298, 6, 12], [0, 290, 1, 14]];
  for (const [bx, by, dx, len] of branches) {
    for (let i = 0; i < len; i++) fillRect(g, '#5e4a3c', x + bx + Math.round(dx * i / len), by + top - 296 - i, 1, 1);
  }
  // Copa: racimos de hojas claras, algo sueltos para que se vean las ramas
  const clusters = [[-17, 296, 12, 12], [7, 290, 13, 13], [-10, 280, 13, 11], [-1, 268, 12, 11],
    [-20, 308, 10, 8], [10, 302, 11, 9], [-5, 290, 10, 9], [6, 276, 10, 10], [-14, 286, 8, 8]];
  clusters.forEach(([cx, cy, cw, ch], k) => {
    for (let yy = 0; yy < ch; yy++) {
      for (let xx = 0; xx < cw; xx++) {
        const dx = (xx - (cw - 1) / 2) / (cw / 2), dy = (yy - (ch - 1) / 2) / (ch / 2);
        const r = dx * dx + dy * dy;
        if (r > 1) continue;
        const h = (xx * 7 + yy * 13 + k * 5) % 11;
        if (h < (r > 0.55 ? 5 : 9)) fillRect(g, TREE_LEAVES[(xx * 2 + yy * 3 + k) % 5], x + cx + xx, cy + top - 296 + yy, 1, 1);
      }
    }
  });
}

function drawStreetProps(g, x0, x1) {
  // Izquierda: bolardos a los lados del portal y de la floristería, sin tapar puertas
  for (const bx of [-74, FLORIST_X - 10, -268]) if (bx - 9 >= x0) drawBollard(g, bx);
  // Pizarra a un lado de la floristería, dentro de su ancho
  if (FLORIST_X + FLORIST_W - 30 >= x0) drawFlowerChalkboard(g, FLORIST_X + FLORIST_W - 30);
  // Derecha: la señal de la canción y un par de bolardos
  if (FIELD_W + 46 <= x1) drawSongSign(g, FIELD_W + 34);
  for (const bx of [FIELD_W + 70, FIELD_W + 122, FIELD_W + 176, FIELD_W + 250]) if (bx + 4 <= x1) drawBollard(g, bx);
  if (TREE_X + 16 <= x1) drawStreetTree(g, TREE_X);
}

// ---------------- Tejados variados de los edificios de los lados ----------------
// Solo la parte alta: buhardillas como las del edificio central, chimeneas, una antena
// y, en el edificio crema, un ático retranqueado con terraza.
let roofExtras = []; // zonas por encima del tejado que también se oscurecen de noche
let roofLit = []; // ventanas del tejado que se encienden de noche

function drawDormer(g, x, wide = false) {
  // Buhardilla copiada del edificio central: tejadillo de pizarra escalonado y ventanita
  const w = wide ? 24 : 16;
  fillRect(g, '#6f6880', x + 4, 36, w - 8, 2);
  fillRect(g, '#6f6880', x + 2, 38, w - 4, 2);
  fillRect(g, '#6f6880', x, 40, w, 2);
  fillRect(g, '#6f6880', x - 2, 42, w + 4, 2);
  fillRect(g, '#d6bb87', x, 44, w, 18);
  const panes = wide ? [x + 4, x + 13] : [x + 4];
  for (const px of panes) {
    fillRect(g, '#837383', px, 47, 8, 12);
    fillRect(g, '#75614f', px + 3, 47, 1, 12);
    fillRect(g, '#ebc494', px + 1, 48, 1, 5);
    roofLit.push([px, 47, 8, 12]);
  }
  roofExtras.push([x - 2, 36, w + 4, 8]);
}

function drawBrickChimney(g, x, h = 14) {
  // Chimenea de ladrillo como la del edificio central
  const y = 46 - h;
  fillRect(g, '#7f5246', x, y, 13, 3);
  fillRect(g, '#a36a5a', x + 2, y + 3, 8, h - 3);
  fillRect(g, '#c98a72', x + 10, y + 3, 1, h - 3);
  for (let yy = y + 7; yy < 46; yy += 4) fillRect(g, '#7f5246', x + 2, yy, 8, 1);
  roofExtras.push([x, y, 13, h]);
}

function drawWhiteChimney(g, x) {
  // Remate encalado de chimenea, como los de los tejados de Madrid
  fillRect(g, '#4a4450', x - 1, 33, 14, 2);
  fillRect(g, '#efe6d4', x, 35, 12, 11);
  fillRect(g, '#d3c6ac', x + 9, 35, 3, 11);
  fillRect(g, '#4a4450', x + 3, 38, 6, 3);
  roofExtras.push([x - 1, 33, 14, 13]);
}

function drawAntenna(g, x) {
  fillRect(g, '#4a4450', x, 22, 1, 24);
  fillRect(g, '#4a4450', x - 5, 25, 11, 1);
  fillRect(g, '#4a4450', x - 3, 29, 7, 1);
  fillRect(g, '#4a4450', x - 4, 33, 9, 1);
  roofExtras.push([x - 5, 22, 11, 24]);
}

function drawAttic(g, x, w, night) {
  // Ático retranqueado sobre el tejado con terraza delante
  const wall = '#e8dcc0', trim = '#f5efe2', shade = '#c9bc9f';
  fillRect(g, '#7f717e', x - 2, 24, w + 4, 2);
  fillRect(g, trim, x - 2, 26, w + 4, 3);
  fillRect(g, shade, x, 29, w, 1);
  fillRect(g, wall, x, 30, w, 32);
  // Puertas de terraza con persiana verde, alternando subidas y a medias
  for (let i = 0, px = x + 9; px + 12 <= x + w - 6; i++, px += 30) {
    fillRect(g, trim, px - 2, 34, 16, 24);
    fillRect(g, '#6b4e3c', px, 36, 12, 22);
    fillRect(g, '#59607a', px + 1, 37, 10, 21);
    fillRect(g, '#6b4e3c', px + 6, 37, 1, 21);
    fillRect(g, '#7a82a0', px + 2, 38, 1, 6);
    roofLit.push([px + 1, 37, 10, 21]);
    if (i % 2 === 0) {
      fillRect(g, '#7c9a74', px, 36, 12, 9);
      for (let sx = px + 1; sx < px + 12; sx += 3) fillRect(g, '#8eaa86', sx, 36, 1, 9);
      fillRect(g, '#6a8763', px, 44, 12, 1);
    }
  }
  // Suelo de la terraza y barandilla de hierro sobre la cornisa
  fillRect(g, '#b8a888', x - 6, 61, w + 12, 1);
  // Macetas y una mesita
  const pots = [[x - 3, '#b5684a'], [x + w - 14, '#c9504a'], [x + w + 1, '#b5684a']];
  for (const [px, c] of pots) {
    fillRect(g, c, px, 56, 5, 5);
    fillRect(g, '#5f8a4e', px - 1, 51, 7, 5);
    fillRect(g, '#7fa65f', px, 50, 4, 2);
  }
  fillRect(g, '#f2d16b', x + w + 2, 50, 2, 1);
  fillRect(g, '#e0708e', x - 2, 50, 2, 1);
  fillRect(g, '#3a363e', x - 6, 52, w + 12, 1);
  for (let bx = x - 6; bx <= x + w + 6; bx += 3) fillRect(g, '#3a363e', bx, 52, 1, 10);
  roofExtras.push([x - 2, 24, w + 4, 22]);
}

function drawRoofs(g, x0, x1, night) {
  roofExtras = [];
  roofLit = [];
  // Edificio amarillo (continuación del central): buhardillas sobre cada columna,
  // chimenea de ladrillo y una antena
  for (let k = 0; leftColumnX(k) - 8 >= x0; k++) {
    const lx = leftColumnX(k);
    drawDormer(g, lx + (k % 2 ? 6 : 10), k % 2 === 1);
  }
  if (-116 >= x0) drawBrickChimney(g, -116, 12);
  if (-28 >= x0) drawAntenna(g, -16);
  if (-218 >= x0) drawBrickChimney(g, -218, 16);
  // Edificio crema: primer tramo con ático y terraza (fuera del marcador),
  // segundo tramo con buhardillas y remates encalados
  const ax = FIELD_W + 14;
  const aw = RIGHT_MODULE - 26;
  if (ax + aw + 8 <= x1) drawAttic(g, ax, aw, night);
  const m = FIELD_W + RIGHT_MODULE;
  if (rightColumnX(2) + 16 <= x1) drawDormer(g, rightColumnX(2));
  if (m + 62 <= x1) { drawWhiteChimney(g, m + 34); drawWhiteChimney(g, m + 49); }
  if (rightColumnX(3) + 16 <= x1) drawDormer(g, rightColumnX(3));
  // Tercer tramo (pantallas de ordenador): buhardilla y chimenea de ladrillo
  if (rightColumnX(4) + 16 <= x1) drawDormer(g, rightColumnX(4));
  if (FIELD_W + 2 * RIGHT_MODULE + 46 <= x1) drawBrickChimney(g, FIELD_W + 2 * RIGHT_MODULE + 34, 13);
}

// Los edificios de los lados se pintan a 1 píxel por unidad en un lienzo aparte y se
// escalan de una vez: así no aparecen líneas entre las piezas de muro en ninguna tarjeta gráfica.
let sideCanvas = null;
export function renderSideBuildings(
  out,
  facade,
  fieldX,
  fieldY,
  scale,
  seconds,
  canvasWidth,
  canvasHeight,
  shakeX = 0,
  shakeY = 0
) {
  const hour = getWorldHour(seconds);
  const night = nightAmount(hour);
  const dusk = duskAmount(hour);

  // Si a la pantalla le sobra muy poco más allá de la calle, se rellena hasta el borde
  // (sin una franja de margen de un par de píxeles).
  const capSide = (side) => (side > MAX_SIDE_UNITS + SIDE_TOLERANCE ? MAX_SIDE_UNITS : side);
  const left = capSide(Math.ceil(fieldX) + 2);
  const right = capSide(Math.ceil(canvasWidth / scale - fieldX - FIELD_W) + 2);
  if (left <= 2 && right <= 2) return;
  const top = -Math.max(0, Math.ceil(fieldY) + 3);
  const bottom = Math.ceil(canvasHeight / scale - fieldY) + 3;
  // La calle se dibuja siempre entera (como en la tablet en horizontal) y la pantalla
  // la recorta: así en vertical también se ven las ventanas del portal y los detalles.
  const x0 = -Math.max(left, MAX_SIDE_UNITS);
  const x1 = FIELD_W + Math.max(right, MAX_SIDE_UNITS);

  sideCanvas ||= document.createElement('canvas');
  const sw = x1 - x0;
  const sh = bottom - top;
  if (sideCanvas.width !== sw || sideCanvas.height !== sh) {
    sideCanvas.width = sw;
    sideCanvas.height = sh;
  }
  const ctx = sideCanvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, sw, sh);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(-x0, -top);

  // Cielo con el mismo degradado que el del juego
  const base = colorForHour(hour);
  const horizon = mix(base, dusk > 0.15 ? rgb('#f2b178') : rgb('#d9b7d8'), 0.18 + dusk * 0.16);
  const gradient = ctx.createLinearGradient(0, 0, 0, SKY_HEIGHT);
  gradient.addColorStop(0, cssRGB(base));
  gradient.addColorStop(1, cssRGB(horizon));
  for (const [a, b, roof] of [[x0, 0, 46], [FIELD_W, x1, 46]]) {
    if (b - a <= 0) continue;
    ctx.fillStyle = cssRGB(base);
    ctx.fillRect(a, top, b - a, -top);
    ctx.fillStyle = gradient;
    ctx.fillRect(a, 0, b - a, roof);
    if (night > 0.15) {
      ctx.fillStyle = `rgba(7, 10, 24, ${0.08 + night * 0.24})`;
      ctx.fillRect(a, top, b - a, SKY_HEIGHT * 0.58 - top);
    }
  }

  // Franja crema sobre el tejado (filas 43–45 de la fachada), continua a ambos lados
  if (facade?.complete && facade.naturalWidth) {
    for (const [a, b] of [[x0, 0], [FIELD_W, x1]]) {
      for (let x = a; x < b; x += 18) ctx.drawImage(facade, 0, 43, 18, 3, x, 43, Math.min(18, b - x), 3);
    }
  }

  if (left > 2) drawLeftBuilding(ctx, facade, x0, night);
  if (right > 2) drawRightBuilding(ctx, facade, x1, night);
  drawRoofs(ctx, x0, x1, night);

  // Acera, bordillo y calzada continuos
  const slice = getSidewalkSlice(facade);
  const pavement = getPavementTile(facade);
  for (const [a, b] of [[x0, 0], [FIELD_W, x1]]) {
    if (b - a <= 0) continue;
    if (slice) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(a, 382, b - a, FIELD_H - 382);
      ctx.clip();
      for (let x = Math.floor(a / 28) * 28; x < b; x += 28) ctx.drawImage(slice, x, 382);
      ctx.restore();
    } else {
      fillRect(ctx, '#72686d', a, 382, b - a, FIELD_H - 382);
    }
    if (bottom > FIELD_H) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(a, FIELD_H, b - a, bottom - FIELD_H);
      ctx.clip();
      ctx.translate(0, FIELD_H);
      ctx.fillStyle = pavement ? ctx.createPattern(pavement, 'repeat') : '#72686d';
      ctx.fillRect(a, 0, b - a, bottom - FIELD_H);
      ctx.restore();
    }
  }

  drawStreetProps(ctx, x0, x1);

  // Misma luz que la escena: noche, tinte azul, resplandor de la calle y ventanas encendidas
  const darkness = Math.min(0.9, night * 0.56 + dusk * 0.07);
  for (const [a, b, roof, lit] of [[x0, 0, 43, leftLit(x0)], [FIELD_W, x1, 43, rightLit(x1)]]) {
    if (b - a <= 0) continue;
    const h = bottom - roof;
    ctx.fillStyle = `rgba(10,14,35,${darkness.toFixed(3)})`;
    ctx.fillRect(a, roof, b - a, h);
    if (night > 0.08) {
      ctx.fillStyle = `rgba(59,80,139,${(night * 0.07).toFixed(3)})`;
      ctx.fillRect(a, roof, b - a, h);
    }
    if (night > 0.2) {
      ctx.fillStyle = `rgba(255,205,135,${(night * 0.12).toFixed(3)})`;
      ctx.fillRect(a, FIELD_H - 72, b - a, bottom - FIELD_H + 72);
    }
    if (night > 0.35) {
      ctx.fillStyle = `rgba(255,196,110,${(night * 0.75).toFixed(3)})`;
      for (const [wx, wy, ww, wh] of lit) {
        if (wx + ww < a || wx > b) continue;
        ctx.fillRect(wx, wy, ww, wh);
      }
    }
  }
  if (night > 0.35 && x0 < FLORIST_X + FLORIST_W) {
    ctx.fillStyle = `rgba(255,200,120,${(night * 0.3).toFixed(3)})`;
    ctx.fillRect(FLORIST_X + 3, 328, FLORIST_W - 6, 44);
  }
  if (roofExtras.length) {
    ctx.fillStyle = `rgba(10,14,35,${darkness.toFixed(3)})`;
    for (const [rx, ry, rw, rh] of roofExtras) ctx.fillRect(rx, ry, rw, Math.min(ry + rh, 43) - ry);
    if (night > 0.08) {
      ctx.fillStyle = `rgba(59,80,139,${(night * 0.07).toFixed(3)})`;
      for (const [rx, ry, rw, rh] of roofExtras) ctx.fillRect(rx, ry, rw, Math.min(ry + rh, 43) - ry);
    }
  }
  if (night > 0.35) {
    ctx.fillStyle = `rgba(255,196,110,${(night * 0.6).toFixed(3)})`;
    roofLit.forEach(([rx, ry, rw, rh], i) => { if (i % 3 !== 1) ctx.fillRect(rx, ry, rw, rh); });
  }
  if (night > 0.35 && BAR_X + BAR_W + 4 <= x1) {
    ctx.fillStyle = `rgba(255,190,110,${(night * 0.35).toFixed(3)})`;
    for (const [px, pw] of BAR_PANES) ctx.fillRect(BAR_X + px, 328, pw, pw < 20 ? 52 : 42);
  }
  if (night > 0.3 && LEFT_X - 8 >= x0) {
    for (const [lx, ly] of STRING_LIGHTS) {
      ctx.fillStyle = `rgba(255,214,120,${(0.25 * night).toFixed(3)})`;
      ctx.fillRect(lx, ly, 3, 4);
      ctx.fillStyle = '#ffd98a';
      ctx.fillRect(lx + 1, ly + 1, 1, 2);
    }
  }

  ctx.restore();

  // Lo pintado se lleva a la pantalla de una sola vez, recortado donde termina la calle
  out.save();
  out.imageSmoothingEnabled = false;
  out.translate(shakeX, shakeY);
  out.scale(scale, scale);
  out.translate(fieldX, fieldY);
  out.beginPath();
  out.rect(-left, top, FIELD_W + left + right, bottom - top);
  out.clip();
  out.drawImage(sideCanvas, x0, top);
  out.restore();
}
