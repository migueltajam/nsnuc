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
  export const MARGIN = '#1a2440'; // azul marino del menú

  export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  export const rand = (min, max) => Math.random() * (max - min) + min;
  export const vibrate = (pattern) => navigator.vibrate && navigator.vibrate(pattern);

  export function rgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

export const ITEM_TYPES = [
  {
    sprite: 'corazon',
    points: 10,
    weight: 4.8,
    kind: 'good',
    colors: COLORS.corazon
  },
  {
    sprite: 'beso',
    points: 20,
    weight: 3.2,
    kind: 'good',
    colors: COLORS.beso
  },
  {
    sprite: 'vida',
    points: 0,
    weight: 0.16,
    kind: 'life',
    colors: COLORS.vida
  },
  {
    sprite: 'calabaza',
    points: 0,
    weight: 2.0,
    kind: 'bomb',
    colors: COLORS.calabaza
  }
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
  // En móviles más bajos que el diseño se puede recortar como mucho esta franja
  // de la parte alta del cielo (casi todo el cielo se conserva, visible tras el HUD).
  export const MAX_TOP_CROP = 8;
  // Si sobra ancho, la calle continúa a los lados (edificio amarillo a la izquierda,
  // crema a la derecha) hasta esta fracción del ancho por cada lado. Con 0.5 la calle
  // llena siempre la pantalla: móviles, tablets y escritorio.
  export const MAX_SIDE_EXTEND = 0.5;
  // Como mucho se ve esta anchura de calle a cada lado (lo que cabe en una tablet en
  // horizontal). En pantallas más anchas, lo que sobra queda como margen.
  export const MAX_SIDE_UNITS = 290; // llena del todo una pantalla 16:9 de ordenador
  // Si sobran menos unidades que esto, la calle llega al borde en vez de dejar margen.
  export const SIDE_TOLERANCE = 8;

  // Velocidad exponencial: el tiempo de caída se divide entre 2 cada SPEED_DOUBLING segundos.
  export const BASE_FALL_TIME = 3.0;
  export const BASE_SPAWN_INTERVAL = 0.85;
  export const SPEED_DOUBLING = 60;
  export const MAX_SPEED_FACTOR = 4.5;

  export const DIFFICULTY_PHASES = [
    {
      from: 0,
      fallTime: 2.8,
      spawnGap: 0.95,
      bombWeight: 1.3,
      bombSpeed: 1.0,
      lifeWeight: 0.20
    },
    {
      from: 30,
      fallTime: 2.15,
      spawnGap: 0.78,
      bombWeight: 1.7,
      bombSpeed: 1.05,
      lifeWeight: 0.17
    },
    {
      from: 60,
      fallTime: 1.60,
      spawnGap: 0.62,
      bombWeight: 2.4,
      bombSpeed: 1.10,
      lifeWeight: 0.14
    },
    {
      from: 120,
      fallTime: 1.10,
      spawnGap: 0.50,
      bombWeight: 3.4,
      bombSpeed: 1.15,
      lifeWeight: 0.10
    },
    {
      from: 180,
      fallTime: 0.83,
      spawnGap: 0.42,
      bombWeight: 4.4,
      bombSpeed: 1.20,
      lifeWeight: 0.07
    }
  ];
