import { OUTLINE, rgb } from './config.js';

// Datos vectoriales rasterizados a Canvas; NO son lógica de juego.
  export const ART = {"sprites":{"corazon":[[1.0,0.0,2.0,1.0,"#ff3d6e",1.0],[4.0,0.0,2.0,1.0,"#ff3d6e",1.0],[0.0,1.0,7.0,2.0,"#ff3d6e",1.0],[1.0,3.0,5.0,1.0,"#ff3d6e",1.0],[2.0,4.0,3.0,1.0,"#e01f55",1.0],[3.0,5.0,1.0,1.0,"#e01f55",1.0],[5.0,2.0,1.0,2.0,"#e01f55",1.0],[1.0,1.0,1.0,1.0,"#ffffff",1.0],[2.0,1.0,1.0,1.0,"#ff9fb8",1.0]],"beso":[[2.0,0.0,2.0,1.0,"#d8406c",1.0],[5.0,0.0,2.0,1.0,"#d8406c",1.0],[1.0,1.0,7.0,1.0,"#d8406c",1.0],[0.0,2.0,9.0,1.0,"#d8406c",1.0],[2.0,2.0,5.0,1.0,"#8a1f42",1.0],[1.0,3.0,7.0,1.0,"#ec6a92",1.0],[2.0,4.0,5.0,1.0,"#d24f7a",1.0],[3.0,3.0,1.0,1.0,"#ffc2d4",1.0],[2.0,1.0,1.0,1.0,"#f28aaa",1.0]],"calabaza":[[5.0,0.0,2.0,3.0,"#7a5a32",1.0],[5.0,0.0,1.0,1.0,"#a07a48",1.0],[8.0,0.0,2.0,1.0,"#7fae4a",1.0],[7.0,1.0,3.0,1.0,"#5a9a3a",1.0],[3.0,0.0,1.0,1.0,"#5a9a3a",1.0],[3.0,1.0,2.0,1.0,"#5a9a3a",1.0],[2.0,2.0,7.0,1.0,"#f07a1e",1.0],[0.0,3.0,11.0,4.0,"#f07a1e",1.0],[1.0,7.0,9.0,1.0,"#d9631a",1.0],[3.0,8.0,5.0,1.0,"#c25510",1.0],[4.0,2.0,3.0,5.0,"#f58f34",1.0],[3.0,3.0,1.0,5.0,"#c25510",1.0],[7.0,3.0,1.0,5.0,"#c25510",1.0],[2.0,3.0,1.0,4.0,"#d9631a",1.0],[8.0,3.0,1.0,4.0,"#d9631a",1.0],[10.0,4.0,1.0,3.0,"#d9631a",1.0],[1.0,3.0,1.0,2.0,"#ffb066",1.0],[5.0,3.0,1.0,2.0,"#ffc98a",1.0]]},"player":{"items":[["p","brazo",[[90.0,384.0],[82.0,371.0],[84.0,355.0]]],["p","brazo",[[105.0,384.0],[113.0,371.0],[111.0,355.0]]],["p","brazo-s",[[91.0,381.0],[85.0,371.0],[86.0,357.0]]],["p","brazo-s",[[104.0,381.0],[110.0,371.0],[109.0,357.0]]],["r",81.0,353.0,5.0,2.0,"#e4eefa",1.0],["r",109.0,353.0,5.0,2.0,"#e4eefa",1.0],["r",109.0,355.0,5.0,1.0,"#2a2224",1.0],["r",80.0,344.0,35.0,3.0,"#8a5a2b",1.0],["r",82.0,347.0,31.0,7.0,"#c08848",1.0],["r",82.0,349.0,31.0,1.0,"#9a6a34",1.0],["r",82.0,352.0,31.0,1.0,"#9a6a34",1.0],["r",88.0,347.0,1.0,7.0,"#9a6a34",1.0],["r",95.0,347.0,1.0,7.0,"#9a6a34",1.0],["r",102.0,347.0,1.0,7.0,"#9a6a34",1.0],["r",109.0,347.0,1.0,7.0,"#9a6a34",1.0],["r",83.0,347.0,2.0,2.0,"#d8a060",1.0],["r",81.0,344.0,8.0,1.0,"#a87440",1.0],["r",81.0,348.0,5.0,5.0,"#f2c9a8",1.0],["r",109.0,348.0,5.0,5.0,"#f2c9a8",1.0],["r",81.0,352.0,5.0,1.0,"#e0aa88",1.0],["r",109.0,352.0,5.0,1.0,"#e0aa88",1.0],["r",88.0,381.0,19.0,20.0,"url(#rayas)",1.0],["r",105.0,381.0,2.0,20.0,"#000000",0.08],["r",94.0,376.0,7.0,5.0,"#e6b494",1.0],["r",92.0,379.0,4.0,3.0,"#e4eefa",1.0],["r",99.0,379.0,4.0,3.0,"#e4eefa",1.0],["r",93.0,382.0,2.0,1.0,"#e4eefa",1.0],["r",100.0,382.0,2.0,1.0,"#e4eefa",1.0],["r",94.0,383.0,1.0,18.0,"#f4f1ea",1.0],["r",100.0,383.0,1.0,18.0,"#f4f1ea",1.0],["r",94.0,385.0,1.0,1.0,"#c8d8ea",1.0],["r",100.0,388.0,1.0,1.0,"#c8d8ea",1.0],["r",94.0,392.0,1.0,1.0,"#c8d8ea",1.0],["r",100.0,395.0,1.0,1.0,"#c8d8ea",1.0],["r",96.0,380.0,3.0,3.0,"#d68a9a",1.0],["r",95.0,383.0,5.0,17.0,"#cf7d90",1.0],["r",95.0,400.0,1.0,2.0,"#f4f1ea",1.0],["r",99.0,400.0,1.0,2.0,"#f4f1ea",1.0],["r",96.0,400.0,3.0,2.0,"#cf7d90",1.0],["r",97.0,402.0,1.0,1.0,"#cf7d90",1.0],["r",97.0,385.0,1.0,3.0,"#ffffff",1.0],["r",96.0,386.0,3.0,1.0,"#ffffff",1.0],["r",96.0,389.0,1.0,1.0,"#d0d4dc",1.0],["r",97.0,390.0,1.0,1.0,"#d0d4dc",1.0],["r",98.0,389.0,1.0,1.0,"#d0d4dc",1.0],["r",97.0,392.0,1.0,3.0,"#ffffff",1.0],["r",96.0,393.0,3.0,1.0,"#ffffff",1.0],["r",96.0,396.0,1.0,1.0,"#d0d4dc",1.0],["r",97.0,397.0,1.0,1.0,"#d0d4dc",1.0],["r",98.0,396.0,1.0,1.0,"#d0d4dc",1.0],["r",96.0,398.0,1.0,1.0,"#a8c6ea",1.0],["r",98.0,398.0,1.0,1.0,"#a8c6ea",1.0],["r",96.0,399.0,3.0,1.0,"#a8c6ea",1.0],["r",97.0,400.0,1.0,1.0,"#a8c6ea",1.0],["r",88.0,401.0,19.0,13.0,"#4f74a8",1.0],["r",88.0,401.0,19.0,1.0,"#3a5686",1.0],["r",97.0,405.0,1.0,9.0,"#3a5686",1.0],["r",89.0,402.0,2.0,11.0,"#6a8ec0",1.0],["r",104.0,402.0,2.0,12.0,"#3f5f92",1.0],["r",87.0,410.0,10.0,4.0,"#4f74a8",1.0],["r",98.0,410.0,10.0,4.0,"#4f74a8",1.0],["r",87.0,413.0,10.0,1.0,"#3a5686",1.0],["r",98.0,413.0,10.0,1.0,"#3a5686",1.0],["r",86.0,414.0,10.0,5.0,"#1f1b1e",1.0],["r",99.0,414.0,10.0,5.0,"#1f1b1e",1.0],["r",85.0,419.0,11.0,1.0,"#0c0a0c",1.0],["r",99.0,419.0,11.0,1.0,"#0c0a0c",1.0],["r",90.0,414.0,2.0,1.0,"#8a5a3a",1.0],["r",103.0,414.0,2.0,1.0,"#8a5a3a",1.0],["r",87.0,416.0,2.0,1.0,"#4a4448",1.0],["r",100.0,416.0,2.0,1.0,"#4a4448",1.0],["r",91.0,364.0,13.0,10.0,"#f2c9a8",1.0],["r",92.0,374.0,11.0,2.0,"#f2c9a8",1.0],["r",93.0,376.0,9.0,1.0,"#f2c9a8",1.0],["r",91.0,367.0,1.0,7.0,"#e4b292",1.0],["r",103.0,367.0,1.0,7.0,"#e4b292",1.0],["r",90.0,369.0,1.0,3.0,"#ecbc9c",1.0],["r",104.0,369.0,1.0,3.0,"#ecbc9c",1.0],["r",104.0,372.0,1.0,1.0,"#e6e8ee",1.0],["r",105.0,371.0,1.0,1.0,"#c8ccd4",1.0],["r",94.0,368.0,2.0,1.0,"#6b4a30",1.0],["r",99.0,368.0,2.0,1.0,"#6b4a30",1.0],["r",95.0,370.0,1.0,1.0,"#4a3020",1.0],["r",99.0,370.0,1.0,1.0,"#4a3020",1.0],["r",95.0,373.0,5.0,1.0,"#a07a5a",1.0],["r",93.0,376.0,9.0,1.0,"#d4aa8a",1.0],["r",90.0,361.0,15.0,4.0,"#6b4a30",1.0],["r",92.0,360.0,11.0,1.0,"#6b4a30",1.0],["r",90.0,361.0,2.0,8.0,"#7a5a40",1.0],["r",103.0,361.0,2.0,8.0,"#7a5a40",1.0],["r",92.0,364.0,1.0,3.0,"#8a6a50",1.0],["r",102.0,364.0,1.0,3.0,"#8a6a50",1.0],["r",92.0,365.0,10.0,1.0,"#6b4a30",1.0],["r",95.0,366.0,2.0,1.0,"#8a6442",1.0],["r",90.0,359.0,15.0,1.0,"#f2c9a8",0.0],["r",93.0,360.0,3.0,1.0,"#6b4a30",1.0],["r",97.0,359.0,4.0,1.0,"#6b4a30",1.0],["r",91.0,362.0,3.0,2.0,"#8a6442",1.0],["r",98.0,362.0,4.0,2.0,"#8a6442",1.0],["r",94.0,360.0,1.0,1.0,"#d8b47e",1.0],["r",98.0,359.0,2.0,1.0,"#d8b47e",1.0],["r",95.0,361.0,2.0,1.0,"#d8b47e",1.0],["r",100.0,361.0,2.0,1.0,"#d8b47e",1.0],["r",96.0,363.0,1.0,1.0,"#c8a26c",1.0]],"shadows":[[68.0,419.0,18.0,2.0,"#1e1420",0.18],[83.0,419.0,30.0,2.0,"#1e1420",0.32]]}};

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

  export const sprites = {
    corazon: makeItemSprite(ART.sprites.corazon),
    beso: makeItemSprite(ART.sprites.beso),
    vida: makeItemSprite(ART.sprites.corazon, GOLD),
    calabaza: makeItemSprite(ART.sprites.calabaza),
  };
  export const player = makePlayer();
  export const HUD_FULL = makeHudHeart('#ff3d6e', true);
  export const HUD_EMPTY = makeHudHeart('#5a4258', false);

  export const spriteURLs = {};
  for (const [name, c] of Object.entries(sprites)) spriteURLs[name] = c.toDataURL();

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

  export function drawText(g, str, cx, cy, color, size = 2) {
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

