// Reglas y constantes originales. Ajusta aquí la dificultad y los puntos.
  export const OUTLINE = '#290f1f'; // reborde de 1 píxel de los objetos y del jugador (igual que en el diseño)
  export const COLORS = {
    corazon: ['#ff3d6e', '#e01f55', '#ff9fb8', '#ffffff'],
    beso: ['#d8406c', '#ec6a92', '#8a1f42', '#ffc2d4'],
    vida: ['#fee761', '#feae34', '#f77622', '#ffffff'],
    calabaza: ['#f07a1e', '#d9631a', '#c25510', '#5a9a3a', '#ffb066'],
  };
  export const SKY_TOP = '#5b9bd5'; // color de cielo para el espacio sobrante en pantallas altas
  export const ROAD = '#4e4a56';
  export const MARGIN = '#2a1626';

  export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  export const rand = (min, max) => Math.random() * (max - min) + min;
  export const vibrate = (pattern) => navigator.vibrate && navigator.vibrate(pattern);

  export function rgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  export const ITEM_TYPES = [
    { sprite: 'corazon', points: 10, weight: 5, kind: 'good', colors: COLORS.corazon },
    { sprite: 'beso', points: 20, weight: 3, kind: 'good', colors: COLORS.beso },
    { sprite: 'vida', points: 0, weight: 0.25, kind: 'life', colors: COLORS.vida },
    { sprite: 'calabaza', points: 0, weight: 1.2, kind: 'bomb', colors: COLORS.calabaza },
  ];

  export const START_LIVES = 3;
  export const MAX_LIVES = 3;
  export const BEST_KEY = 'nsnuc-best';
  export const ITEM_R = 8;
  export const LEVEL_TIME = 20; // segundos por nivel (solo se muestra en el HUD)

  // Campo de juego fijo: el tamaño del diseño (195 x 422) para que la fachada encaje píxel a píxel.
  export const FIELD_W = 195;
  export const FIELD_H = 422;
  export const GROUND_Y = 418; // línea donde un objeto se da por perdido (la calzada)
  export const BASKET_Y = 344; // borde superior de la cesta
  export const BASKET_W = 35;
  export const BASKET_CX = 97.5; // centro de la cesta en el diseño
  export const SPAWN_Y = 22; // los objetos aparecen sobre el tejado, bajo el HUD

  // Velocidad exponencial: el tiempo de caída se divide entre 2 cada SPEED_DOUBLING segundos.
  export const BASE_FALL_TIME = 3.4;
  export const BASE_SPAWN_INTERVAL = 1.0;
  export const SPEED_DOUBLING = 45;
  export const MAX_SPEED_FACTOR = 5;

