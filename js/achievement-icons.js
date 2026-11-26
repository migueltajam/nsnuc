// Iconos de los logros dibujados a píxel (16 x 16), con el mismo contorno que los objetos del juego.
const PAL = {
 "Q": "#c8d8ea","O": "#290f1f", "R": "#d8406c", "r": "#8a1f42", "P": "#ec6a92", "p": "#ffc2d4", "S": "#d8dee8", "s": "#8f98a8", "H": "#7a4a30", "h": "#a8683e", "G": "#e2b14a", "g": "#f6dc8a", "d": "#a8782a", "Y": "#fee761", "o": "#feae34", "F": "#f77622", "f": "#c8431a", "K": "#1b1820", "N": "#2c2838", "B": "#56597c", "b": "#383a56", "E": "#e8ecf4", "k": "#4a4652", "L": "#ff3d6e", "l": "#e01f55", "W": "#f4f1ea", "w": "#c8c0b0", "M": "#f2e3a0", "m": "#d9c27a", "T": "#fff6c8", "C": "#4db7ea", "c": "#2f97cf", "V": "#ffffff", "A": "#74c9f1", "Z": "#1f6f9e"};
const ICONS = {
 "lock": ["..OOOO..", ".OssssO.", ".Os..sO.", ".Os..sO.", "OOOOOOOO", "OGggGGdO", "OGgOOGdO", "OGGOOGdO", "OGGGGGdO", "OddddddO", "OOOOOOOO"],
 "hidden": ["................", ".....OOOOOO.....", "....OQQQQQQO....", "...OQQOOOOQQO...", "...OQQO..OQQO...", "...OOO...OQQO...", "........OQQO....", ".......OQQO.....", "......OQQO......", "......OQQO......", "......OOOO......", "......OOOO......", "......OQQO......", "......OQQO......", "......OOOO......", "................"],
 "twoKisses": [
  "................",
  "..OO.OO.........",
  ".ORROPRO........",
  "ORRRRRRRO.......",
  "ORrrrrrRO.......",
  "OPPPPPPPO.......",
  ".OPpPPPO........",
  "..OOOOO.........",
  ".........OO.OO..",
  "........ORROPRO.",
  ".......ORRRRRRRO",
  ".......ORrrrrrRO",
  ".......OPPPPPPPO",
  "........OPpPPPO.",
  ".........OOOOO..",
  "................"
 ],
 "outlaw": [
  ".............OO.",
  "............OSSO",
  "...........OSSsO",
  "..........OSSsO.",
  ".........OSSsO..",
  "........OSSsO...",
  ".......OSSsO....",
  "..OO..OSSsO.....",
  "..OGO.OSsO......",
  "...OGOOsO.......",
  "....OGGO........",
  "...OHOGGO.......",
  "..OHhO.OGO......",
  ".OHhO...OO......",
  ".OOO............",
  "................"
 ],
 "combo17": [
  ".......O........",
  "......OFO.......",
  "......OFFO......",
  ".....OFFFO..O...",
  "....OFFoFFO.OO..",
  "...OFFooFFFOFO..",
  "...OFFooFFFFFO..",
  "..OFFoooFFFFFO..",
  "..OFooYooFFFFO..",
  "..OFoYYYooFFFO..",
  "..OFoYYYYoFFFO..",
  "..OFoYTYYoFFfO..",
  "...OFoYYYoFfO...",
  "....OffooffO....",
  ".....OOOOOO.....",
  "................"
 ],
 "points8000": [
  "................",
  "..OOOOOOOOOOOO..",
  ".OOgGGGGGGGGdOO.",
  "OGOgGGGGGGGGdOGO",
  "OGOgGGGGGGGGdOGO",
  ".OOgGGGGGGGGdOO.",
  "...OgGGGGGGdO...",
  "....OgGGGGdO....",
  ".....OOGGOO.....",
  ".......Od.......",
  "......OGdO......",
  ".....OOGGOO.....",
  "....OgGGGGdO....",
  "....OdddddO.....",
  "....OOOOOOOO....",
  "................"
 ],
 "colorWings": [
  "................",
  "................",
  ".........OOO....",
  "........OKKKO...",
  ".......OKKEKKOOO",
  ".......OKKKKKkkO",
  "......OKKKKKOOO.",
  "....OOKKbBBKO...",
  "..OOKKbBBbBKO...",
  "OOKKKbBBbBKKO...",
  "OKKKKKbbbKKO....",
  ".OOOO.OKKKKO....",
  ".......OkOkO....",
  "......OOOOOOO...",
  "................",
  "................"
 ],
 "notDead": [
  "................",
  "..OOO....OOO....",
  ".OLLLO..OLLLO...",
  "OLVLLLOOLLLLLO..",
  "OLLLLLLLLLLLLO..",
  "OWWWLLLLLLLLLO..",
  "OwWWWWLLLLLLlO..",
  ".OWWWWWWLLLlO...",
  "..OLwWWWWWlO....",
  "...OLLwWWWWO....",
  "....OLLlwWO.....",
  ".....OLllO......",
  "......OlO.......",
  ".......O........",
  "................",
  "................"
 ],
 "madrid24": [
  "................",
  ".....OOOOO......",
  "...OOMMMMMO.....",
  "..OMMMMOOO...T..",
  ".OMMMMO.........",
  ".OMMMO.......T..",
  "OMMMMO..........",
  "OMMMO.....T.....",
  "OMMMO...........",
  "OMMMMO..........",
  ".OMMmO..........",
  ".OMMmmO.........",
  "..OMmmmOOO......",
  "...OOmmmmmO.....",
  ".....OOOOO......",
  "................"
 ],
 "secret17": [
  "................",
  "...OOOO..OOOO...",
  "..OACCOWWOCCcO..",
  ".OACCCCOOCCCCcO.",
  "OACCCCCCCCCCCCcO",
  "OZACCCCCCCCCCcZO",
  "OZZOACCCCCCcOZZO",
  ".OOOAVVCVVVcOOO.",
  "...OACVCCCVcO...",
  "...OACVCCVCcO...",
  "...OACVCCVCcO...",
  "...OAVVVCVCcO...",
  "...OACCCCCCcO...",
  "...OZZZZZZZZO...",
  "...OOOOOOOOOO...",
  "................"
 ]
};

function draw(rows) {
  const c = document.createElement('canvas');
  c.width = rows[0].length;
  c.height = rows.length;
  const g = c.getContext('2d');
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === '.') continue;
      g.fillStyle = PAL[row[x]];
      g.fillRect(x, y, 1, 1);
    }
  });
  return c.toDataURL();
}

export const achievementIconURLs = {};
for (const [id, rows] of Object.entries(ICONS)) achievementIconURLs[id] = draw(rows);

// ---- Animaciones de las alertas de logro (fotogramas a píxel) ----
// Cada fotograma parte del icono original: una lista de píxeles [x, y, color]
// o un objeto {fila: 'nueva fila'} para redibujar filas enteras.
function frame(base, edit) {
  const rows = base.slice();
  if (Array.isArray(edit)) {
    for (const [x, y, ch] of edit) rows[y] = rows[y].slice(0, x) + ch + rows[y].slice(x + 1);
  } else {
    for (const [y, row] of Object.entries(edit)) rows[y] = row;
  }
  return rows;
}
const heart = (x, y) => [[x + 1, y, 'L'], [x + 3, y, 'L'], [x, y + 1, 'L'], [x + 1, y + 1, 'P'], [x + 2, y + 1, 'L'], [x + 3, y + 1, 'L'], [x + 4, y + 1, 'L'], [x + 1, y + 2, 'L'], [x + 2, y + 2, 'L'], [x + 3, y + 2, 'l'], [x + 2, y + 3, 'l']];
const shine = (rows, k) => {
  const out = [];
  rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) if ((x + y === k || x + y === k + 1) && 'Gg'.includes(row[x])) out.push([x, y, 'T']); });
  return out;
};

const ANIMS = {
  // Lanza un beso: un corazoncito sale volando
  twoKisses: { ms: 320, frames: [[], heart(10, 4), heart(11, 2), heart(11, 0), [], []] },
  // Fuego que titila
  combo17: { ms: 280, frames: [
    [],
    [[7, 0, '.'], [6, 1, '.'], [7, 1, 'O'], [8, 1, 'O'], [6, 9, 'Y'], [9, 10, 'Y'], [13, 3, '.'], [12, 4, '.'], [13, 4, 'O']],
    [[5, 8, 'Y'], [7, 12, 'o'], [8, 12, 'o']],
  ] },
  // Brillo que cruza la copa
  points8000: { ms: 170, frames: [[], ...[4, 6, 8, 10, 12, 14, 16].map((k) => shine(ICONS.points8000, k)), [[15, 0, 'T']], [], [], [], []] },
  // El cuervo bate las alas
  colorWings: { ms: 340, frames: [[], {
    3: '...OO...OKKKO...',
    4: '..ObBO.OKKEKKOOO',
    5: '..ObBBOOKKKKKkkO',
    6: '...ObBBKKKKKOOO.',
    7: '....OOKKKKKKO...',
    8: '..OOKKKKKKKKO...',
    9: 'OOKKKKKKKKKKO...',
    10: 'OKKKKKKbbKKO....',
  }] },
  // La luna con las estrellas parpadeando
  madrid24: { ms: 520, frames: [[], [[13, 3, '.'], [12, 9, 'T']], [[10, 7, '.'], [14, 6, 'T'], [13, 5, '.']]] },
};

export const achievementIconFrames = {};
for (const [id, anim] of Object.entries(ANIMS)) {
  achievementIconFrames[id] = { ms: anim.ms, urls: anim.frames.map((f) => draw(frame(ICONS[id], f))) };
}
