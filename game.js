(() => {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  // Los objetos y el jugador se dibujan en este buffer de baja resolución y luego se escalan sin suavizado.
  // La fachada se pinta aparte, a resolución de pantalla, para que el lettering del letrero se vea nítido.
  const buffer = document.createElement('canvas');
  const g = buffer.getContext('2d');
  const $ = (id) => document.getElementById(id);

  const ui = {
    hud: $('hud'),
    score: $('score'),
    level: $('level'),
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

  const OUTLINE = '#290f1f'; // reborde de 1 píxel de los objetos y del jugador (igual que en el diseño)
  const COLORS = {
    corazon: ['#ff3d6e', '#e01f55', '#ff9fb8', '#ffffff'],
    beso: ['#d8406c', '#ec6a92', '#8a1f42', '#ffc2d4'],
    vida: ['#fee761', '#feae34', '#f77622', '#ffffff'],
    calabaza: ['#f07a1e', '#d9631a', '#c25510', '#5a9a3a', '#ffb066'],
  };
  const SKY_TOP = '#5b9bd5'; // color de cielo para el espacio sobrante en pantallas altas
  const ROAD = '#4e4a56';
  const MARGIN = '#2a1626';

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const rand = (min, max) => Math.random() * (max - min) + min;
  const vibrate = (pattern) => navigator.vibrate && navigator.vibrate(pattern);

  function rgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  // ---------- Datos de píxeles exportados del diseño ----------
  // Cada rectángulo: [x, y, ancho, alto, color, opacidad], en las coordenadas del diseño (195 x 422).

  const ART = {"sprites":{"corazon":[[1.0,0.0,2.0,1.0,"#ff3d6e",1.0],[4.0,0.0,2.0,1.0,"#ff3d6e",1.0],[0.0,1.0,7.0,2.0,"#ff3d6e",1.0],[1.0,3.0,5.0,1.0,"#ff3d6e",1.0],[2.0,4.0,3.0,1.0,"#e01f55",1.0],[3.0,5.0,1.0,1.0,"#e01f55",1.0],[5.0,2.0,1.0,2.0,"#e01f55",1.0],[1.0,1.0,1.0,1.0,"#ffffff",1.0],[2.0,1.0,1.0,1.0,"#ff9fb8",1.0]],"beso":[[2.0,0.0,2.0,1.0,"#d8406c",1.0],[5.0,0.0,2.0,1.0,"#d8406c",1.0],[1.0,1.0,7.0,1.0,"#d8406c",1.0],[0.0,2.0,9.0,1.0,"#d8406c",1.0],[2.0,2.0,5.0,1.0,"#8a1f42",1.0],[1.0,3.0,7.0,1.0,"#ec6a92",1.0],[2.0,4.0,5.0,1.0,"#d24f7a",1.0],[3.0,3.0,1.0,1.0,"#ffc2d4",1.0],[2.0,1.0,1.0,1.0,"#f28aaa",1.0]],"calabaza":[[5.0,0.0,2.0,3.0,"#7a5a32",1.0],[5.0,0.0,1.0,1.0,"#a07a48",1.0],[8.0,0.0,2.0,1.0,"#7fae4a",1.0],[7.0,1.0,3.0,1.0,"#5a9a3a",1.0],[3.0,0.0,1.0,1.0,"#5a9a3a",1.0],[3.0,1.0,2.0,1.0,"#5a9a3a",1.0],[2.0,2.0,7.0,1.0,"#f07a1e",1.0],[0.0,3.0,11.0,4.0,"#f07a1e",1.0],[1.0,7.0,9.0,1.0,"#d9631a",1.0],[3.0,8.0,5.0,1.0,"#c25510",1.0],[4.0,2.0,3.0,5.0,"#f58f34",1.0],[3.0,3.0,1.0,5.0,"#c25510",1.0],[7.0,3.0,1.0,5.0,"#c25510",1.0],[2.0,3.0,1.0,4.0,"#d9631a",1.0],[8.0,3.0,1.0,4.0,"#d9631a",1.0],[10.0,4.0,1.0,3.0,"#d9631a",1.0],[1.0,3.0,1.0,2.0,"#ffb066",1.0],[5.0,3.0,1.0,2.0,"#ffc98a",1.0]]},"player":{"items":[["p","brazo",[[90.0,384.0],[82.0,371.0],[84.0,355.0]]],["p","brazo",[[105.0,384.0],[113.0,371.0],[111.0,355.0]]],["p","brazo-s",[[91.0,381.0],[85.0,371.0],[86.0,357.0]]],["p","brazo-s",[[104.0,381.0],[110.0,371.0],[109.0,357.0]]],["r",81.0,353.0,5.0,2.0,"#e4eefa",1.0],["r",109.0,353.0,5.0,2.0,"#e4eefa",1.0],["r",109.0,355.0,5.0,1.0,"#2a2224",1.0],["r",80.0,344.0,35.0,3.0,"#8a5a2b",1.0],["r",82.0,347.0,31.0,7.0,"#c08848",1.0],["r",82.0,349.0,31.0,1.0,"#9a6a34",1.0],["r",82.0,352.0,31.0,1.0,"#9a6a34",1.0],["r",88.0,347.0,1.0,7.0,"#9a6a34",1.0],["r",95.0,347.0,1.0,7.0,"#9a6a34",1.0],["r",102.0,347.0,1.0,7.0,"#9a6a34",1.0],["r",109.0,347.0,1.0,7.0,"#9a6a34",1.0],["r",83.0,347.0,2.0,2.0,"#d8a060",1.0],["r",81.0,344.0,8.0,1.0,"#a87440",1.0],["r",81.0,348.0,5.0,5.0,"#f2c9a8",1.0],["r",109.0,348.0,5.0,5.0,"#f2c9a8",1.0],["r",81.0,352.0,5.0,1.0,"#e0aa88",1.0],["r",109.0,352.0,5.0,1.0,"#e0aa88",1.0],["r",88.0,381.0,19.0,20.0,"url(#rayas)",1.0],["r",105.0,381.0,2.0,20.0,"#000000",0.08],["r",94.0,376.0,7.0,5.0,"#e6b494",1.0],["r",92.0,379.0,4.0,3.0,"#e4eefa",1.0],["r",99.0,379.0,4.0,3.0,"#e4eefa",1.0],["r",93.0,382.0,2.0,1.0,"#e4eefa",1.0],["r",100.0,382.0,2.0,1.0,"#e4eefa",1.0],["r",94.0,383.0,1.0,18.0,"#f4f1ea",1.0],["r",100.0,383.0,1.0,18.0,"#f4f1ea",1.0],["r",94.0,385.0,1.0,1.0,"#c8d8ea",1.0],["r",100.0,388.0,1.0,1.0,"#c8d8ea",1.0],["r",94.0,392.0,1.0,1.0,"#c8d8ea",1.0],["r",100.0,395.0,1.0,1.0,"#c8d8ea",1.0],["r",96.0,380.0,3.0,3.0,"#d68a9a",1.0],["r",95.0,383.0,5.0,17.0,"#cf7d90",1.0],["r",95.0,400.0,1.0,2.0,"#f4f1ea",1.0],["r",99.0,400.0,1.0,2.0,"#f4f1ea",1.0],["r",96.0,400.0,3.0,2.0,"#cf7d90",1.0],["r",97.0,402.0,1.0,1.0,"#cf7d90",1.0],["r",97.0,385.0,1.0,3.0,"#ffffff",1.0],["r",96.0,386.0,3.0,1.0,"#ffffff",1.0],["r",96.0,389.0,1.0,1.0,"#d0d4dc",1.0],["r",97.0,390.0,1.0,1.0,"#d0d4dc",1.0],["r",98.0,389.0,1.0,1.0,"#d0d4dc",1.0],["r",97.0,392.0,1.0,3.0,"#ffffff",1.0],["r",96.0,393.0,3.0,1.0,"#ffffff",1.0],["r",96.0,396.0,1.0,1.0,"#d0d4dc",1.0],["r",97.0,397.0,1.0,1.0,"#d0d4dc",1.0],["r",98.0,396.0,1.0,1.0,"#d0d4dc",1.0],["r",96.0,398.0,1.0,1.0,"#a8c6ea",1.0],["r",98.0,398.0,1.0,1.0,"#a8c6ea",1.0],["r",96.0,399.0,3.0,1.0,"#a8c6ea",1.0],["r",97.0,400.0,1.0,1.0,"#a8c6ea",1.0],["r",88.0,401.0,19.0,13.0,"#4f74a8",1.0],["r",88.0,401.0,19.0,1.0,"#3a5686",1.0],["r",97.0,405.0,1.0,9.0,"#3a5686",1.0],["r",89.0,402.0,2.0,11.0,"#6a8ec0",1.0],["r",104.0,402.0,2.0,12.0,"#3f5f92",1.0],["r",87.0,410.0,10.0,4.0,"#4f74a8",1.0],["r",98.0,410.0,10.0,4.0,"#4f74a8",1.0],["r",87.0,413.0,10.0,1.0,"#3a5686",1.0],["r",98.0,413.0,10.0,1.0,"#3a5686",1.0],["r",86.0,414.0,10.0,5.0,"#1f1b1e",1.0],["r",99.0,414.0,10.0,5.0,"#1f1b1e",1.0],["r",85.0,419.0,11.0,1.0,"#0c0a0c",1.0],["r",99.0,419.0,11.0,1.0,"#0c0a0c",1.0],["r",90.0,414.0,2.0,1.0,"#8a5a3a",1.0],["r",103.0,414.0,2.0,1.0,"#8a5a3a",1.0],["r",87.0,416.0,2.0,1.0,"#4a4448",1.0],["r",100.0,416.0,2.0,1.0,"#4a4448",1.0],["r",91.0,364.0,13.0,10.0,"#f2c9a8",1.0],["r",92.0,374.0,11.0,2.0,"#f2c9a8",1.0],["r",93.0,376.0,9.0,1.0,"#f2c9a8",1.0],["r",91.0,367.0,1.0,7.0,"#e4b292",1.0],["r",103.0,367.0,1.0,7.0,"#e4b292",1.0],["r",90.0,369.0,1.0,3.0,"#ecbc9c",1.0],["r",104.0,369.0,1.0,3.0,"#ecbc9c",1.0],["r",104.0,372.0,1.0,1.0,"#e6e8ee",1.0],["r",105.0,371.0,1.0,1.0,"#c8ccd4",1.0],["r",94.0,368.0,2.0,1.0,"#6b4a30",1.0],["r",99.0,368.0,2.0,1.0,"#6b4a30",1.0],["r",95.0,370.0,1.0,1.0,"#4a3020",1.0],["r",99.0,370.0,1.0,1.0,"#4a3020",1.0],["r",95.0,373.0,5.0,1.0,"#a07a5a",1.0],["r",93.0,376.0,9.0,1.0,"#d4aa8a",1.0],["r",90.0,361.0,15.0,4.0,"#6b4a30",1.0],["r",92.0,360.0,11.0,1.0,"#6b4a30",1.0],["r",90.0,361.0,2.0,8.0,"#7a5a40",1.0],["r",103.0,361.0,2.0,8.0,"#7a5a40",1.0],["r",92.0,364.0,1.0,3.0,"#8a6a50",1.0],["r",102.0,364.0,1.0,3.0,"#8a6a50",1.0],["r",92.0,365.0,10.0,1.0,"#6b4a30",1.0],["r",95.0,366.0,2.0,1.0,"#8a6442",1.0],["r",90.0,359.0,15.0,1.0,"#f2c9a8",0.0],["r",93.0,360.0,3.0,1.0,"#6b4a30",1.0],["r",97.0,359.0,4.0,1.0,"#6b4a30",1.0],["r",91.0,362.0,3.0,2.0,"#8a6442",1.0],["r",98.0,362.0,4.0,2.0,"#8a6442",1.0],["r",94.0,360.0,1.0,1.0,"#d8b47e",1.0],["r",98.0,359.0,2.0,1.0,"#d8b47e",1.0],["r",95.0,361.0,2.0,1.0,"#d8b47e",1.0],["r",100.0,361.0,2.0,1.0,"#d8b47e",1.0],["r",96.0,363.0,1.0,1.0,"#c8a26c",1.0]],"shadows":[[68.0,419.0,18.0,2.0,"#1e1420",0.18],[83.0,419.0,30.0,2.0,"#1e1420",0.32]]}};

  const HUD_HEART = [[1, 0, 2, 1], [4, 0, 2, 1], [0, 1, 7, 2], [1, 3, 5, 1], [2, 4, 3, 1], [3, 5, 1, 1]];

  // ---------- Construcción de sprites ----------

  function bbox(rects) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y, w, h] of rects) {
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x + w);
      y1 = Math.max(y1, y + h);
    }
    return { x0, y0, x1, y1 };
  }

  // Añade un borde de 1 píxel alrededor de todo lo opaco (vecinos en 8 direcciones, como el filtro del diseño).
  function addOutline(c, color = OUTLINE) {
    const cg = c.getContext('2d');
    const { width: W, height: H } = c;
    const img = cg.getImageData(0, 0, W, H);
    const d = img.data;
    const solid = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) solid[i] = d[i * 4 + 3] > 0 ? 1 : 0;
    const [r, gg, b] = rgb(color);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (solid[y * W + x]) continue;
        let near = false;
        for (let dy = -1; dy <= 1 && !near; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < W && ny < H && solid[ny * W + nx]) { near = true; break; }
          }
        }
        if (!near) continue;
        const i = (y * W + x) * 4;
        d[i] = r; d[i + 1] = gg; d[i + 2] = b; d[i + 3] = 255;
      }
    }
    cg.putImageData(img, 0, 0);
    return c;
  }

  // Sprite de objeto: cada píxel del diseño se dibuja a 2x (como en el diseño) y se le pone reborde.
  function makeItemSprite(rects, recolor = null, mult = 2) {
    const b = bbox(rects);
    const c = document.createElement('canvas');
    c.width = (b.x1 - b.x0) * mult + 2;
    c.height = (b.y1 - b.y0) * mult + 2;
    const cg = c.getContext('2d');
    for (const [x, y, w, h, fill, op] of rects) {
      cg.globalAlpha = op;
      cg.fillStyle = recolor && recolor[fill] ? recolor[fill] : fill;
      cg.fillRect(1 + (x - b.x0) * mult, 1 + (y - b.y0) * mult, w * mult, h * mult);
    }
    cg.globalAlpha = 1;
    return addOutline(c);
  }

  // Camisa de rayas verticales: columna par clara, impar oscura (patrón "rayas" del diseño).
  const stripe = (designX) => (Math.round(designX) % 2 === 0 ? '#b8d4f0' : '#9fc0e6');

  // El jugador se monta en el mismo orden que en el diseño: brazos (líneas), cesta, cuerpo, cabeza y pelo.
  function makePlayer() {
    const pts = [];
    for (const it of ART.player.items) {
      if (it[0] === 'r') pts.push([it[1], it[2], it[3], it[4]]);
      else for (const [px, py] of it[2]) pts.push([px - 3, py - 3, 6, 6]);
    }
    const b = bbox(pts);
    const ox = Math.floor(b.x0) - 1;
    const oy = Math.floor(b.y0) - 1;
    const c = document.createElement('canvas');
    c.width = Math.ceil(b.x1) - ox + 1;
    c.height = Math.ceil(b.y1) - oy + 1;
    const cg = c.getContext('2d');

    const mask = document.createElement('canvas');
    mask.width = c.width;
    mask.height = c.height;
    const mg = mask.getContext('2d');

    for (const it of ART.player.items) {
      if (it[0] === 'r') {
        const [, x, y, w, h, fill, op] = it;
        cg.globalAlpha = op;
        if (fill === 'url(#rayas)') {
          for (let col = 0; col < w; col++) {
            cg.fillStyle = stripe(x + col);
            cg.fillRect(x + col - ox, y - oy, 1, h);
          }
        } else {
          cg.fillStyle = fill;
          cg.fillRect(x - ox, y - oy, w, h);
        }
        cg.globalAlpha = 1;
        continue;
      }
      // Polilínea: se rasteriza a una máscara y se pasa a píxeles duros.
      const [, cls, line] = it;
      const thick = cls === 'brazo';
      mg.clearRect(0, 0, mask.width, mask.height);
      mg.lineWidth = thick ? 5 : 1;
      mg.lineJoin = 'round';
      mg.lineCap = 'round';
      mg.strokeStyle = '#000';
      mg.beginPath();
      line.forEach(([px, py], i) => (i ? mg.lineTo(px - ox, py - oy) : mg.moveTo(px - ox, py - oy)));
      mg.stroke();
      const md = mg.getImageData(0, 0, mask.width, mask.height).data;
      for (let y = 0; y < mask.height; y++) {
        for (let x = 0; x < mask.width; x++) {
          if (md[(y * mask.width + x) * 4 + 3] < (thick ? 128 : 100)) continue;
          cg.fillStyle = thick ? stripe(x + ox) : '#8fb0d8';
          cg.fillRect(x, y, 1, 1);
        }
      }
    }
    return { canvas: addOutline(c), ox, oy };
  }

  function makeHudHeart(color, highlight) {
    const c = document.createElement('canvas');
    c.width = 7;
    c.height = 6;
    const cg = c.getContext('2d');
    cg.fillStyle = color;
    for (const [x, y, w, h] of HUD_HEART) cg.fillRect(x, y, w, h);
    if (highlight) {
      cg.fillStyle = '#ffffff';
      cg.fillRect(1, 1, 1, 1);
    }
    return c.toDataURL();
  }

  // El corazón dorado (vida extra) es el corazón del juego con la paleta cambiada.
  const GOLD = { '#ff3d6e': '#feae34', '#e01f55': '#f77622', '#ff9fb8': '#fee761' };

  const sprites = {
    corazon: makeItemSprite(ART.sprites.corazon),
    beso: makeItemSprite(ART.sprites.beso),
    vida: makeItemSprite(ART.sprites.corazon, GOLD),
    calabaza: makeItemSprite(ART.sprites.calabaza),
  };
  const player = makePlayer();
  const HUD_FULL = makeHudHeart('#ff3d6e', true);
  const HUD_EMPTY = makeHudHeart('#5a4258', false);

  const spriteURLs = {};
  for (const [name, c] of Object.entries(sprites)) spriteURLs[name] = c.toDataURL();
  document.querySelectorAll('img[data-sprite]').forEach((img) => {
    img.src = spriteURLs[img.dataset.sprite];
  });

  // ---------- Fachada (fondo exportado del diseño) ----------

  const facade = new Image();
  let facadeReady = false;
  facade.onload = () => {
    facadeReady = true;
    buildBackground();
  };
  facade.src = 'fachada.svg';

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
    { sprite: 'corazon', points: 10, weight: 5, kind: 'good', colors: COLORS.corazon },
    { sprite: 'beso', points: 20, weight: 3, kind: 'good', colors: COLORS.beso },
    { sprite: 'vida', points: 0, weight: 0.25, kind: 'life', colors: COLORS.vida },
    { sprite: 'calabaza', points: 0, weight: 1.2, kind: 'bomb', colors: COLORS.calabaza },
  ];

  const START_LIVES = 3;
  const MAX_LIVES = 3;
  const BEST_KEY = 'nsnuc-best';
  const ITEM_R = 8;
  const LEVEL_TIME = 20; // segundos por nivel (solo se muestra en el HUD)

  // Campo de juego fijo: el tamaño del diseño (195 x 422) para que la fachada encaje píxel a píxel.
  const FIELD_W = 195;
  const FIELD_H = 422;
  const GROUND_Y = 418; // línea donde un objeto se da por perdido (la calzada)
  const BASKET_Y = 344; // borde superior de la cesta
  const BASKET_W = 35;
  const BASKET_CX = 97.5; // centro de la cesta en el diseño
  const SPAWN_Y = 22; // los objetos aparecen sobre el tejado, bajo el HUD

  // Velocidad exponencial: el tiempo de caída se divide entre 2 cada SPEED_DOUBLING segundos.
  const BASE_FALL_TIME = 3.4;
  const BASE_SPAWN_INTERVAL = 1.0;
  const SPEED_DOUBLING = 45;
  const MAX_SPEED_FACTOR = 5;

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

  let state = 'menu'; // menu | playing | paused | over
  let score = 0;
  let lives = START_LIVES;
  let level = 1;
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

    // El espacio sobrante va sobre todo arriba (cielo bajo el HUD); abajo solo lo justo
    // para no chocar con la barra de gestos del móvil.
    const cssToLogical = dpr / scale;
    const extraH = LH - FIELD_H;
    const bottomPad = Math.max(0, Math.min(extraH, Math.round(24 * cssToLogical)));
    fieldY = LH - FIELD_H - bottomPad;
    fieldX = Math.floor((LW - FIELD_W) / 2);
    groundY = fieldY + GROUND_Y;

    paddle.y = fieldY + BASKET_Y;
    paddle.x = fieldX + clamp(relX * FIELD_W, minX(), maxX());
    paddle.targetX = paddle.x;

    buildBackground();
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

    // Filo oscuro a los lados cuando la pantalla es más ancha que el campo.
    if (fx > 0) {
      bg.fillStyle = OUTLINE;
      bg.fillRect(fx - scale, 0, scale, background.height);
      bg.fillRect(fx + fw, 0, scale, background.height);
    }
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
    level = 1;
    elapsed = 0;
    spawnTimer = 0.6;
    items = [];
    particles = [];
    texts = [];
    shake = 0;
    flash = 0;
    paddle.x = paddle.targetX = fieldX + BASKET_CX;
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
    ui.score.textContent = String(score).padStart(6, '0');
    ui.level.textContent = `NIVEL ${level}`;
    ui.lives.replaceChildren(
      ...Array.from({ length: MAX_LIVES }, (_, i) => {
        const img = document.createElement('img');
        img.src = i < lives ? HUD_FULL : HUD_EMPTY;
        img.alt = '';
        return img;
      })
    );
    ui.lives.setAttribute('aria-label', `${Math.max(0, lives)} vidas de ${MAX_LIVES}`);
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
    const y = fieldY + SPAWN_Y;
    const half = sprites[type.sprite].width / 2;
    items.push({
      type,
      x: fieldX + rand(half + 2, FIELD_W - half - 2),
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
        addText(x, y - 8, `+${it.type.points}`, '#ffd2dc');
        vibrate(15);
        break;
      case 'life':
        lives = Math.min(MAX_LIVES, lives + 1);
        updateHud();
        burst(x, y, it.type.colors, 12, 70);
        addText(x, y - 8, '+1', '#fee761');
        vibrate(25);
        break;
      case 'bomb':
        burst(x, y, it.type.colors, 28, 120, 2);
        addText(x, y - 8, '-1', '#ff3d6e');
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
    addText(it.x, groundY - 12, '-1', '#ff3d6e');
    flash = 0.2;
    vibrate(40);
    loseLife();
  }

  function update(dt) {
    elapsed += dt;
    const newLevel = 1 + Math.floor(elapsed / LEVEL_TIME);
    if (newLevel !== level) {
      level = newLevel;
      updateHud();
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
      drawText(t.text, t.x, t.y, t.color);
    }
  }

  function render() {
    g.clearRect(0, 0, LW, LH);
    drawPlayer();
    drawItems();
    drawEffects();

    if (flash > 0) {
      g.fillStyle = `rgba(255, 61, 110, ${Math.min(0.45, flash * 1.5)})`;
      g.fillRect(0, 0, LW, LH);
    }

    let ox = 0;
    let oy = 0;
    if (shake > 0) {
      ox = Math.round(rand(-2, 2)) * scale;
      oy = Math.round(rand(-2, 2)) * scale;
    }
    ctx.fillStyle = MARGIN;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (background) ctx.drawImage(background, ox, oy);
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
