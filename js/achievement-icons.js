// Iconos de los logros dibujados a píxel (16 x 16), con el mismo contorno que los objetos del juego.
const PAL = {
 "Q": "#c8d8ea","O": "#290f1f", "R": "#d8406c", "r": "#8a1f42", "P": "#ec6a92", "p": "#ffc2d4", "S": "#d8dee8", "s": "#8f98a8", "H": "#7a4a30", "h": "#a8683e", "G": "#e2b14a", "g": "#f6dc8a", "d": "#a8782a", "Y": "#fee761", "o": "#feae34", "F": "#f77622", "f": "#c8431a", "K": "#1b1820", "N": "#2c2838", "B": "#56597c", "b": "#383a56", "E": "#e8ecf4", "k": "#4a4652", "L": "#ff3d6e", "l": "#e01f55", "W": "#f4f1ea", "w": "#c8c0b0", "M": "#f2e3a0", "m": "#d9c27a", "T": "#fff6c8", "C": "#4db7ea", "c": "#2f97cf", "V": "#ffffff"};
const ICONS = {
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
  "...OOO....OOO...",
  "..OcCCOWWOCCcO..",
  ".OcCCCCOOCCCCcO.",
  "OcCCCCCCCCCCCCcO",
  "OccCCCCCCCCCCccO",
  ".OOOCCCCCCCCOOO.",
  "...OCVVCVVVCO...",
  "...OCCVCCCVCO...",
  "...OCCVCCVCCO...",
  "...OCCVCCVCCO...",
  "...OCVVVCVCCO...",
  "...OCCCCCCCCO...",
  "...OcCCCCCCcO...",
  "...OOOOOOOOOO...",
  "................"
 ]
};

export const achievementIconURLs = {};
for (const [id, rows] of Object.entries(ICONS)) {
  const c = document.createElement('canvas');
  c.width = 16;
  c.height = 16;
  const g = c.getContext('2d');
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === '.') continue;
      g.fillStyle = PAL[row[x]];
      g.fillRect(x, y, 1, 1);
    }
  });
  achievementIconURLs[id] = c.toDataURL();
}
