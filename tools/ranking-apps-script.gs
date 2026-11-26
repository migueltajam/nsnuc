/**
 * Ranking global de «¡Llueven besos!» (No soy ni un casi).
 *
 * Se pega en Extensiones → Apps Script de una hoja de Google y se
 * implementa como «Aplicación web» (Ejecutar como: yo · Acceso: cualquier usuario).
 *
 * Hoja «Puntuaciones»: una fila por partida subida.
 *   - Para expulsar a alguien del ranking, escribe cualquier cosa en la
 *     columna «Oculta» de sus filas.
 *   - El ranking muestra la MEJOR puntuación de cada @ de Instagram.
 */

// Fecha y hora de cierre del concurso (hora de Madrid). Vacío = sin cierre.
// Ejemplo: '2026-12-19T23:59:59+01:00'
const CIERRE = '';

const HOJA = 'Puntuaciones';
const CABECERA = ['Fecha', 'Instagram', 'Puntos', 'Segundos', 'Besos', 'Corazones', 'Mejor racha', 'Dispositivo', 'Oculta'];
const TOP = 10;
const ESPERA_ENTRE_SUBIDAS = 20; // segundos entre dos subidas del mismo móvil

function doGet(e) {
  const handle = normaliza_((e && e.parameter && e.parameter.yo) || '');
  return json_(Object.assign({ ok: true }, ranking_(handle)));
}

function doPost(e) {
  let datos;
  try { datos = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'formato' }); }

  if (CIERRE && new Date() > new Date(CIERRE)) return json_({ ok: false, error: 'cerrado' });

  const instagram = normaliza_(datos.instagram);
  const puntos = Math.floor(Number(datos.score));
  const segundos = Math.floor(Number(datos.duration));
  const besos = Math.floor(Number(datos.kisses));
  const corazones = Math.floor(Number(datos.hearts));
  const racha = Math.floor(Number(datos.bestCombo));
  const dispositivo = String(datos.device || '').slice(0, 40);

  if (!/^[a-z0-9._]{1,30}$/.test(instagram)) return json_({ ok: false, error: 'instagram' });
  if (!esCreible_(puntos, segundos, besos, corazones, racha)) return json_({ ok: false, error: 'puntos' });

  // Freno: el mismo móvil no puede subir dos veces seguidas en pocos segundos.
  const cache = CacheService.getScriptCache();
  const clave = 'd_' + (dispositivo || instagram);
  if (cache.get(clave)) return json_({ ok: false, error: 'espera' });
  cache.put(clave, '1', ESPERA_ENTRE_SUBIDAS);

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    hoja_().appendRow([new Date(), instagram, puntos, segundos, besos, corazones, racha, dispositivo, '']);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
  cache.remove('ranking');
  return json_(Object.assign({ ok: true }, ranking_(instagram)));
}

// Comprueba que la puntuación cuadra con lo que se ha recogido en la partida.
function esCreible_(puntos, segundos, besos, corazones, racha) {
  const valores = [puntos, segundos, besos, corazones, racha];
  if (valores.some(function (v) { return !isFinite(v) || v < 0; })) return false;
  if (puntos <= 0 || puntos % 10 !== 0) return false;
  const base = besos * 20 + corazones * 10;          // puntos sin multiplicador
  if (puntos < base || puntos > base * 4) return false; // la racha multiplica como mucho x4
  if (besos + corazones > segundos * 4 + 10) return false; // no caen tantos objetos tan rápido
  if (racha > besos + corazones) return false;
  if (segundos > 6 * 60 * 60) return false;
  return true;
}

function ranking_(yo) {
  const cache = CacheService.getScriptCache();
  let mejores;
  const guardado = cache.get('ranking');
  if (guardado) {
    mejores = JSON.parse(guardado);
  } else {
    const filas = hoja_().getDataRange().getValues().slice(1);
    const porUsuario = {};
    filas.forEach(function (f) {
      const ig = String(f[1] || ''), pts = Number(f[2]) || 0;
      if (!ig || String(f[8] || '').trim()) return; // columna «Oculta»
      const antes = porUsuario[ig];
      const fecha = f[0] instanceof Date ? f[0].getTime() : 0;
      if (!antes || pts > antes.score || (pts === antes.score && fecha < antes.t)) {
        porUsuario[ig] = { instagram: ig, score: pts, t: fecha };
      }
    });
    mejores = Object.keys(porUsuario).map(function (k) { return porUsuario[k]; })
      .sort(function (a, b) { return b.score - a.score || a.t - b.t; });
    cache.put('ranking', JSON.stringify(mejores).slice(0, 95000), 30);
  }
  const salida = {
    top: mejores.slice(0, TOP).map(function (r) { return { instagram: r.instagram, score: r.score }; }),
    total: mejores.length,
    cerrado: Boolean(CIERRE && new Date() > new Date(CIERRE)),
  };
  if (yo) {
    const i = mejores.findIndex(function (r) { return r.instagram === yo; });
    if (i >= 0) salida.yo = { pos: i + 1, score: mejores[i].score };
  }
  return salida;
}

function hoja_() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let h = libro.getSheetByName(HOJA);
  if (!h) {
    h = libro.insertSheet(HOJA);
    h.appendRow(CABECERA);
    h.setFrozenRows(1);
    h.getRange(1, 1, 1, CABECERA.length).setFontWeight('bold');
  }
  return h;
}

function normaliza_(texto) {
  return String(texto || '').trim().replace(/^@+/, '').toLowerCase();
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Ejecuta esta función una vez desde el editor para crear la hoja y dar permisos.
function preparar() {
  hoja_();
}
