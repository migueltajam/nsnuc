import { FIELD_W, FIELD_H, clamp } from './config.js';

const DAY_SECONDS = 180;
const START_HOUR = 17;
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

// Una sola cuerda de ropa, discreta
const LAUNDRY_LINES = [
  {
    x1: 76, y1: 150,
    x2: 124, y2: 145,
    items: [
      { x: 89,  w: 5, h: 5, color: '#f0e6d8' },
      { x: 98,  w: 4, h: 6, color: '#e2a3a0' },
      { x: 109, w: 5, h: 7, color: '#94aecb' }
    ]
  }
];

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
   Cuando la pantalla es algo más ancha que la escena,
   la calle continúa con dos fachadas vecinas.
   ========================================== */

// Ventanas de los vecinos: [x, y, ancho, alto] en unidades del juego.
const NEIGHBOR_LEFT = {
  wall: '#c9a091', wallDark: '#b48a7d', trim: '#e6d6c6', trimShadow: '#9c7d70',
  top: 30,
  windows: [
    [-41, 86, 17, 40], [-41, 164, 17, 40], [-41, 242, 17, 40],
    [-74, 86, 17, 40], [-74, 164, 17, 40], [-74, 242, 17, 40]
  ]
};
const NEIGHBOR_RIGHT = {
  wall: '#aab0b9', wallDark: '#959ba5', trim: '#e2e0da', trimShadow: '#80868f',
  top: 50,
  windows: [
    [FIELD_W + 19, 92, 16, 36], [FIELD_W + 19, 170, 16, 36], [FIELD_W + 19, 248, 16, 36],
    [FIELD_W + 52, 92, 16, 36], [FIELD_W + 52, 170, 16, 36], [FIELD_W + 52, 248, 16, 36]
  ]
};

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

function fillRect(g, color, x, y, w, h) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

function drawNeighbor(g, n, x0, x1, top, side, hour, night) {
  const w = x1 - x0;
  // Muro
  fillRect(g, n.wall, x0, n.top, w, 382 - n.top);
  // Sombra contra nuestro edificio y pilastra
  const edge = side === 'left' ? x1 - 3 : x0;
  fillRect(g, n.wallDark, edge, n.top, 3, 382 - n.top);
  fillRect(g, 'rgba(0,0,0,0.14)', side === 'left' ? x1 - 1 : x0, n.top, 1, 382 - n.top);
  // Remate superior
  fillRect(g, n.trim, x0, n.top - 3, w, 3);
  fillRect(g, n.trimShadow, x0, n.top, w, 1);
  // Impostas a la altura de las nuestras
  for (const y of [148, 226, 304]) {
    fillRect(g, n.trim, x0, y, w, 3);
    fillRect(g, n.trimShadow, x0, y + 3, w, 1);
  }
  // Ventanas con balconcillo
  n.windows.forEach(([wx, wy, ww, wh], i) => {
    if (wx + ww < x0 || wx > x1) return;
    fillRect(g, n.trim, wx - 2, wy - 2, ww + 4, wh + 4);
    const lit = night > 0.35 && (i * 7 + 3) % 5 < 3;
    fillRect(g, lit ? '#e9b56c' : '#6d677c', wx, wy, ww, wh);
    if (!lit) fillRect(g, '#8a84a0', wx + 1, wy + 1, 2, 9);
    fillRect(g, '#5d4a3e', wx + Math.floor(ww / 2), wy, 1, wh);
    if (side === 'right') {
      // Contraventanas verdes
      fillRect(g, '#6d8a72', wx - 6, wy, 4, wh);
      fillRect(g, '#6d8a72', wx + ww + 2, wy, 4, wh);
    }
    // Barandilla
    fillRect(g, '#45404b', wx - 4, wy + wh - 11, ww + 8, 1);
    for (let bx = wx - 4; bx < wx + ww + 4; bx += 3) fillRect(g, '#45404b', bx, wy + wh - 10, 1, 9);
    fillRect(g, n.trim, wx - 5, wy + wh - 1, ww + 10, 2);
    // Alguna maceta
    if (i % 2 === 0) {
      fillRect(g, '#7f9a64', wx - 2, wy + wh - 15, 6, 4);
      fillRect(g, i % 4 === 0 ? '#e0708e' : '#e8c95a', wx - 1, wy + wh - 16, 2, 2);
    }
  });
  // Planta baja
  fillRect(g, '#a4a09a', x0, 352, w, 30);
  fillRect(g, '#8d8983', x0, 352, w, 1);
  if (side === 'left') {
    // Tienda con persiana metálica y algún grafiti
    fillRect(g, '#3e3a42', x0, 314, w - 6, 7);
    fillRect(g, '#e6d6c6', x0 + 3, 316, Math.max(0, w - 12), 3);
    fillRect(g, '#8e9098', x0, 322, w - 8, 60);
    for (let y = 323; y < 382; y += 2) fillRect(g, '#7b7d85', x0, y, w - 8, 1);
    fillRect(g, 'rgba(224,85,138,0.55)', x1 - 26, 350, 9, 2);
    fillRect(g, 'rgba(224,85,138,0.55)', x1 - 22, 346, 2, 9);
    fillRect(g, 'rgba(90,150,160,0.55)', x1 - 16, 360, 6, 2);
  } else {
    // Portal de madera y una maceta en la puerta
    fillRect(g, n.trim, x0 + 8, 318, 26, 64);
    fillRect(g, '#7a5e4c', x0 + 11, 324, 20, 58);
    fillRect(g, '#5e4738', x0 + 20, 324, 2, 58);
    fillRect(g, '#c9b37e', x0 + 18, 352, 1, 2);
    fillRect(g, '#c9b37e', x0 + 23, 352, 1, 2);
    fillRect(g, '#a8775f', x0 + 38, 374, 7, 8);
    fillRect(g, '#7f9a64', x0 + 37, 366, 9, 8);
  }
}

export function renderSideBuildings(
  ctx,
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

  const left = Math.ceil(fieldX) + 2;
  const right = Math.ceil(canvasWidth / scale - fieldX - FIELD_W) + 2;
  if (left <= 2 && right <= 2) return;
  const top = -Math.max(0, Math.ceil(fieldY) + 3);
  const bottom = Math.ceil(canvasHeight / scale - fieldY) + 3;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(shakeX, shakeY);
  ctx.scale(scale, scale);
  ctx.translate(fieldX, fieldY);

  const regions = [
    ['left', -left, 0, NEIGHBOR_LEFT],
    ['right', FIELD_W, FIELD_W + right, NEIGHBOR_RIGHT]
  ];

  // Cielo con el mismo degradado que el del juego
  const base = colorForHour(hour);
  const horizon = mix(base, dusk > 0.15 ? rgb('#f2b178') : rgb('#d9b7d8'), 0.18 + dusk * 0.16);
  const gradient = ctx.createLinearGradient(0, 0, 0, SKY_HEIGHT);
  gradient.addColorStop(0, cssRGB(base));
  gradient.addColorStop(1, cssRGB(horizon));

  for (const [side, x0, x1, n] of regions) {
    if (x1 - x0 <= 0) continue;
    ctx.fillStyle = cssRGB(base);
    ctx.fillRect(x0, top, x1 - x0, -top);
    ctx.fillStyle = gradient;
    ctx.fillRect(x0, 0, x1 - x0, n.top);
    if (night > 0.15) {
      ctx.fillStyle = `rgba(7, 10, 24, ${0.08 + night * 0.24})`;
      ctx.fillRect(x0, top, x1 - x0, SKY_HEIGHT * 0.58 - top);
    }
    drawNeighbor(ctx, n, x0, x1, top, side, hour, night);
  }

  // Acera, bordillo y calzada continuos
  const slice = getSidewalkSlice(facade);
  const pavement = getPavementTile(facade);
  for (const [, x0, x1] of regions) {
    if (x1 - x0 <= 0) continue;
    if (slice) {
      const start = Math.floor(x0 / 28) * 28;
      for (let x = start; x < x1; x += 28) ctx.drawImage(slice, x, 382);
    } else {
      fillRect(ctx, '#72686d', x0, 382, x1 - x0, FIELD_H - 382);
    }
    if (bottom > FIELD_H) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x0, FIELD_H, x1 - x0, bottom - FIELD_H);
      ctx.clip();
      ctx.translate(0, FIELD_H);
      ctx.fillStyle = pavement ? ctx.createPattern(pavement, 'repeat') : '#72686d';
      ctx.fillRect(x0, 0, x1 - x0, bottom - FIELD_H);
      ctx.restore();
    }
  }

  // Misma luz que la escena: noche, tinte azul y resplandor de la calle
  const darkness = Math.min(0.9, night * 0.56 + dusk * 0.07);
  for (const [, x0, x1, n] of regions) {
    if (x1 - x0 <= 0) continue;
    const h = bottom - n.top + 3;
    ctx.fillStyle = `rgba(10,14,35,${darkness.toFixed(3)})`;
    ctx.fillRect(x0, n.top - 3, x1 - x0, h);
    if (night > 0.08) {
      ctx.fillStyle = `rgba(59,80,139,${(night * 0.07).toFixed(3)})`;
      ctx.fillRect(x0, n.top - 3, x1 - x0, h);
    }
    if (night > 0.2) {
      ctx.fillStyle = `rgba(255,205,135,${(night * 0.12).toFixed(3)})`;
      ctx.fillRect(x0, FIELD_H - 72, x1 - x0, bottom - FIELD_H + 72);
    }
    // Las ventanas encendidas brillan por encima de la oscuridad
    if (night > 0.35) {
      n.windows.forEach(([wx, wy, ww, wh], i) => {
        if ((i * 7 + 3) % 5 >= 3 || wx + ww < x0 || wx > x1) return;
        ctx.fillStyle = `rgba(255,200,120,${(night * 0.55).toFixed(3)})`;
        ctx.fillRect(wx, wy, ww, wh - 11);
      });
    }
  }

  ctx.restore();
}
