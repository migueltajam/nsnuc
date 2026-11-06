
# 💋 NO SOY NI UN CASI — ¡ATRAPA!

### 🎮 Un minijuego arcade musical ambientado en Madrid

Un videojuego web de estética **pixel art retro**, desarrollado con HTML5 Canvas, CSS3 y JavaScript, donde el jugador deberá recoger corazones y besos, esquivar calabazas y conseguir la mayor puntuación posible.

El juego forma parte de una iniciativa de promoción musical para el lanzamiento de **«No soy ni un casi»**, combinando música, entretenimiento, secretos y competición.

> 🌆 Una fachada madrileña que cobra vida, un atardecer que se convierte en noche y un montón de besos por atrapar.

---

## 📋 INFORMACIÓN DEL PROYECTO

| Característica | Descripción |
|---|---|
| 🎮 Nombre | No soy ni un casi — ¡Atrapa! |
| 🎵 Tipo | Minijuego promocional musical |
| 🕹️ Género | Arcade / Catch Game |
| 🎨 Estética | Pixel art retro moderno |
| 🌆 Ambientación | Madrid, ciclo día/noche |
| 📱 Plataforma principal | Navegadores móviles |
| 💻 Compatibilidad | Móvil y escritorio |
| 🛠️ Tecnologías | HTML5, CSS3, JavaScript |
| 🎼 Audio | Web Audio API |
| 💾 Datos actuales | localStorage |
| ☁️ Hosting previsto | Netlify |
| 🗄️ Base de datos prevista | Supabase PostgreSQL |
| 🚧 Estado | En desarrollo — V2.x |

**Inicio del desarrollo:** noviembre de 2026.

**Objetivo inmediato:** disponer de una versión funcional, estable y preparada para su publicación.

---

# ✨ 1. CONCEPTO DEL JUEGO

El protagonista debe moverse horizontalmente por la parte inferior de la pantalla y recoger los objetos que caen desde el cielo.

Cada objeto tiene un efecto diferente.

| Objeto | Efecto |
|---|---|
| ❤️ Corazón | +10 puntos base |
| 💋 Beso | +20 puntos base |
| 💛 Vida extra | Recupera una vida, hasta un máximo de 3 |
| 🎃 Calabaza | Pierdes una vida |

Los puntos pueden multiplicarse mediante el sistema de combos.

### ❤️ Sistema de vidas

- Cada partida comienza con 3 vidas.
- Recoger una calabaza resta una vida.
- Los objetos positivos que caen al suelo no restan vidas.
- Perder un objeto positivo puede romper el combo.
- Cuando el jugador pierde sus tres vidas, termina la partida.

### ⚡ Dificultad progresiva

El juego aumenta progresivamente su dificultad:

- Los objetos caen cada vez más rápido.
- La frecuencia de aparición aumenta.
- Aparecen situaciones que requieren mayor precisión.
- Se recompensa la habilidad para encadenar capturas.

El objetivo es conseguir partidas rápidas, entretenidas y con suficiente dificultad para incentivar que los jugadores vuelvan a intentarlo.

---

# 🎮 2. CONTROLES

El juego está diseñado siguiendo el principio **Mobile First**.

### 📱 Dispositivos móviles

- Deslizar el dedo horizontalmente para mover al personaje.
- Movimiento directo, sin botones virtuales.
- Interfaz adaptada a pantallas táctiles.
- Botones accesibles para pausa y sonido.

### 💻 Ordenador

- Flecha izquierda: mover a la izquierda.
- Flecha derecha: mover a la derecha.
- A / D: movimiento alternativo.
- Ratón: movimiento horizontal.
- P / Escape: pausa.

### ⏸️ Pausa

El juego permite:

- Pausar manualmente.
- Continuar la partida.
- Abandonar y regresar al menú.
- Pausar automáticamente al cambiar de pestaña.

Durante la pausa se detiene el tiempo de partida.

---

# 🏆 3. SISTEMA DE PUNTUACIÓN

El sistema de puntuación combina capturas individuales y multiplicadores.

### Puntuaciones base

| Acción | Puntos |
|---|---:|
| Recoger corazón | +10 |
| Recoger beso | +20 |
| Recoger vida | Recuperación de salud |
| Recoger calabaza | -1 vida |

### 🔥 Sistema de combos

Las capturas consecutivas permiten aumentar los puntos obtenidos.

| Capturas consecutivas | Multiplicador |
|---|---|
| 0–4 | x1 |
| 5–9 | x2 |
| 10–19 | x3 |
| 20 o más | x4 |

**Ejemplo:**

Un beso recogido con multiplicador x3 concede 60 puntos.

El combo se reinicia si:

- El jugador recoge una calabaza.
- Deja escapar un objeto positivo.
- Transcurren más de 6 segundos sin recoger un objeto positivo.

Los multiplicadores se reflejan visualmente en la interfaz.

---

# 🕹️ 4. EXPERIENCIA ARCADE

## 4.1. Pantalla de inicio

La pantalla inicial incluye:

- Lettering de la canción.
- Título del minijuego.
- Explicación de controles.
- Leyenda de objetos y puntuaciones.
- Introducción del nickname.
- Botón para comenzar.
- Récord personal.
- Acceso al ranking local.
- Control de sonido.

## 4.2. Cuenta atrás

Antes de cada partida aparece:

**3... 2... 1... ¡ATRAPA!**

Cada número tiene su animación y efecto sonoro.

Durante la cuenta atrás:

- No caen objetos.
- No se contabilizan puntos.
- No avanza el tiempo de partida.
- El reloj ficticio permanece detenido.

## 4.3. HUD durante la partida

La interfaz superior muestra:

- Puntuación actual.
- Nivel de dificultad.
- Reloj del escenario.
- Vidas disponibles.
- Multiplicador de combo.
- Control de sonido.
- Botón de pausa.

El diseño mantiene una estética arcade con colores rosas, granates y violetas.

## 4.4. Game Over

Al finalizar la partida aparece una pantalla con:

- Puntuación final.
- Récord personal.
- Besos recogidos.
- Corazones recogidos.
- Duración de la partida.
- Combo máximo alcanzado.
- Logros desbloqueados.
- Ranking de puntuaciones.
- Opción de volver a jugar.
- Opción de regresar al menú.

Cuando el jugador supera su récord personal, se muestra una celebración especial.

---

# 🌇 5. ESCENARIO DINÁMICO — MADRID

Uno de los elementos principales del proyecto es su fachada pixel art ambientada en el centro de Madrid.

La ilustración original se mantiene como base del escenario, mientras distintas capas Canvas incorporan iluminación, movimiento y detalles ambientales.

## 5.1. Ciclo día/noche

El videojuego incorpora un reloj ficticio independiente de la hora real.

**Configuración actual:**

- Hora inicial: 17:00.
- Duración prevista de un día completo: 180 segundos de juego activo.
- El reloj se detiene en pausa.
- El reloj comienza después de la cuenta atrás.
- Cada nueva partida comienza nuevamente al atardecer.

El escenario evoluciona por distintas fases:

| Horario aproximado | Ambiente |
|---|---|
| 06:00–08:00 | Amanecer |
| 08:00–17:00 | Día |
| 17:00–20:00 | Atardecer |
| 20:00–23:00 | Noche |
| 23:00–06:00 | Madrugada |

Las transiciones son progresivas.

## 5.2. Cielo dinámico

El cielo incorpora:

- Movimiento del sol.
- Movimiento de la luna.
- Cambios de colores según la hora.
- Estrellas nocturnas.
- Nubes desplazándose.
- Pájaros ocasionales.
- Transición entre amanecer, día, atardecer y noche.

La intención es que el escenario parezca vivo sin distraer al jugador.

## 5.3. Iluminación nocturna

Se está refinando un sistema de iluminación compuesto por:

**Iluminación ambiental**
- Tonos azulados y violetas durante la noche.
- Oscurecimiento progresivo de la fachada.
- Colores cálidos durante el atardecer.
- Recuperación gradual de luz al amanecer.

**Iluminación interior**
- Ventanas que se encienden según horarios diferentes.
- Apagado de algunas viviendas durante la madrugada.
- Luces cálidas de tonos crema y ámbar.
- Halos suaves alrededor de las ventanas.
- Conservación de persianas, cristales y cortinas originales.

**Iluminación urbana**
- Resplandor sutil en la parte inferior del edificio.
- Contraste entre interiores cálidos y exteriores fríos.
- Iluminación ambiental que cambia con el ciclo horario.

## 5.4. Decoración de balcones

La fachada incorpora detalles decorativos como:

- Jardineras.
- Flores de distintos colores.
- Macetas colgantes.
- Vegetación trepadora.
- Plantas que caen por las barandillas.
- Toldos y persianas.
- Cortinas.
- Una cuerda con ropa tendida.
- Siluetas ocasionales detrás de ventanas.

Los elementos están pensados para proporcionar personalidad a cada balcón.

### Estado de pulido visual

El sistema de ambientación se ha ampliado progresivamente, pero todavía estamos revisando:

- Posicionamiento de macetas y barandillas.
- Integración de la iluminación en los huecos reales.
- Equilibrio de luz durante la noche.
- Transiciones visuales entre distintas horas.
- Adaptación del fondo a diferentes resoluciones.

Estas mejoras deben validarse visualmente antes de considerarlas definitivas.

---

# 🎵 6. MÚSICA Y EFECTOS DE SONIDO

El videojuego utiliza la **Web Audio API** para generar sonidos directamente desde el navegador.

No necesita cargar archivos musicales externos para su banda sonora arcade actual.

## Música

- Melodía arcade original.
- Base musical sintetizada.
- Reproducción durante la partida.
- Control para activar o silenciar el audio.
- Preferencia guardada en el navegador.

## Efectos

| Evento | Efecto |
|---|---|
| Cuenta atrás | Sonidos de inicio |
| Recoger corazón | Captura arcade |
| Recoger beso | Captura especial |
| Recuperar vida | Sonido positivo |
| Recibir daño | Impacto |
| Activar combo | Efecto ascendente |
| Nuevo récord | Celebración |
| Desbloquear logro | Sonido de logro |
| Easter egg | Efecto secreto |
| Game Over | Sonido de finalización |

El audio se activa después de una interacción del usuario para respetar las restricciones de los navegadores móviles.

---

# 🎽 7. EASTER EGG — HAMŠÍK 17

El juego incluye una referencia especial al dorsal 17 de Marek Hamšík.

### Cómo se activa

El jugador debe permanecer **17 segundos sin recoger ningún objeto**.

Cuando se cumple esta condición:

- Se activa un evento secreto.
- Aparece la referencia a HAMŠÍK 17.
- Se reproducen efectos visuales y sonoros.
- Se desbloquea un logro especial.
- La partida continúa normalmente.

### Ajustes de jugabilidad

Se ha trabajado para que la animación:

- Sea semitransparente.
- Aparezca en una zona menos intrusiva.
- Dure aproximadamente 1,6 segundos.
- No bloquee los controles.
- No muestre notificaciones duplicadas.
- No impida ver los objetos que caen.

El easter egg no debe perjudicar la puntuación del jugador.

---

# 🏅 8. SISTEMA DE LOGROS

Actualmente se incluyen seis logros desbloqueables.

| Logro | Condición |
|---|---|
| 💋 Primer beso | Recoger el primer beso |
| ⚡ En racha | Alcanzar 5 capturas consecutivas |
| 🔥 Imparable | Alcanzar 10 capturas consecutivas |
| 🎽 Dorsal 17 | Descubrir el easter egg |
| 🏆 Mil razones | Conseguir 1.000 puntos |
| 🌙 Madrid no duerme | Sobrevivir durante 90 segundos |

Los logros:

- Se desbloquean durante las partidas.
- Se conservan mediante localStorage.
- Muestran una notificación al conseguirlos.
- Aparecen ocultos hasta ser descubiertos.
- Pueden consultarse desde la interfaz.

**Mejora futura:** asociar los logros a un jugador persistente cuando se implemente el backend.

---

# 👤 9. JUGADORES Y RANKING

## Sistema actual: local

El jugador puede introducir un nickname antes de comenzar.

Actualmente se utiliza `localStorage` para almacenar:

- Nickname.
- Récord personal.
- Resultados locales.
- Logros desbloqueados.
- Preferencias de audio.

### TOP 10 local

La clasificación muestra las diez mejores puntuaciones registradas en el navegador.

Características:

- Un jugador puede aparecer varias veces.
- Se conservan diferentes partidas del mismo nickname.
- Los resultados se ordenan por puntuación.
- Se pueden realizar partidas ilimitadas.
- Los resultados siguen disponibles al recargar la página, salvo que se eliminen los datos locales.

**IMPORTANTE:** este ranking todavía no es global.

Los resultados de distintos dispositivos no están sincronizados.

## Sistema futuro: ranking online

Está previsto implementar una clasificación compartida entre todos los jugadores.

### Requisitos

- Base de datos PostgreSQL.
- Identificación persistente del jugador.
- Registro individual de cada partida.
- TOP 10 global.
- Múltiples puntuaciones por jugador.
- Recuperación de clasificaciones.
- Validación de resultados desde el backend.
- Protección básica contra puntuaciones manipuladas.
- Limitación de peticiones y controles antispam.

### Base de datos prevista

**Supabase PostgreSQL**

Posibles tablas:

- `players`
- `games`
- `game_sessions`
- `scores`
- `presave_verifications`

### Backend previsto

**Netlify Functions**

Endpoints previstos:

- Crear o recuperar jugador.
- Iniciar partida.
- Finalizar partida.
- Registrar puntuación validada.
- Consultar clasificación.
- Consultar estado de participación.

El cliente no debe tener permisos para escribir puntuaciones arbitrarias directamente en la base de datos.

---

# 🎧 10. INTEGRACIÓN MUSICAL Y PRE-SAVE

El juego tendrá una función promocional relacionada con el lanzamiento de la canción.

### Objetivo

Permitir jugar libremente, pero reservar la participación en el ranking oficial a usuarios que hayan completado el proceso promocional autorizado.

### Pendiente de definir

- Proveedor de pre-save.
- Enlace oficial de la canción.
- Posibilidad real de verificar la acción.
- Método de asociación entre usuario y participación.
- Comportamiento después del lanzamiento.

La redirección a una página de pre-save no constituye por sí sola una confirmación de que el usuario haya completado la acción.

Por ello, **no se considerará implementada la verificación hasta disponer de un mecanismo autorizado y comprobable**.

Cuando la canción esté publicada, se podrá reemplazar el enlace de pre-save por uno para escucharla, conservando el juego y sus puntuaciones.

---

# 🏗️ 11. ARQUITECTURA DEL PROYECTO

La aplicación está construida con JavaScript modular y Canvas 2D.

No utiliza React, Phaser ni otro framework de videojuegos.

Esta decisión permite:

- Reducir dependencias.
- Mantener tiempos de carga bajos.
- Facilitar el despliegue estático.
- Conservar el motor desarrollado originalmente.
- Trabajar directamente sobre las mecánicas existentes.

## Estructura de carpetas

```text
caida-de-besos/
│
├── assets/
│   ├── images/
│   │   ├── fachada.png
│   │   └── lettering.png
│   └── audio/
│
├── css/
│   └── style.css
│
├── js/
│   ├── config.js
│   ├── sprites.js
│   ├── environment.js
│   ├── audio.js
│   ├── achievements.js
│   ├── ui.js
│   ├── game.js
│   └── main.js
│
├── index.html
├── netlify.toml
├── QA_CHECKLIST.md
├── README.md
└── .gitignore
```

## Responsabilidades

### `config.js`
Configuración general, colores, dimensiones, reglas y valores ajustables.

### `sprites.js`
Sprites del personaje y los objetos, junto con sus funciones de dibujo.

### `environment.js`
Ciclo día/noche, reloj ambiental, iluminación, cielo y detalles decorativos.

### `audio.js`
Música arcade sintetizada y efectos de sonido.

### `achievements.js`
Definición, desbloqueo y almacenamiento de logros.

### `ui.js`
Pantallas, HUD, nickname, clasificación y notificaciones.

### `game.js`
Motor principal, física, colisiones, puntuación, movimiento y renderizado.

### `main.js`
Inicialización de la aplicación y conexión de eventos.

### `style.css`
Diseño visual, interfaz responsive y animaciones CSS.

---

# 🚀 12. INSTALACIÓN Y EJECUCIÓN

## Requisitos

- Navegador moderno.
- Editor de código (recomendado: VS Code).
- Servidor HTTP local.

No es necesario instalar paquetes npm para la versión actual.

## Opción A — Live Server

1. Abrir el proyecto en Visual Studio Code.
2. Instalar la extensión Live Server.
3. Abrir `index.html`.
4. Seleccionar **Open with Live Server**.
5. Probar el juego en el navegador.

## Opción B — Python

Desde la raíz del proyecto:

```bash
python -m http.server 5500
```

Abrir:

http://localhost:5500

> No abrir directamente `index.html` mediante `file://`, porque el proyecto utiliza módulos ES de JavaScript.

---

# ☁️ 13. DESPLIEGUE

## Plataforma elegida: Netlify

El proyecto está preparado para desplegarse como aplicación web estática.

### Configuración inicial

- Conectar un repositorio de GitHub.
- Seleccionar la rama principal.
- No utilizar comando de compilación.
- Configurar como directorio de publicación la raíz del proyecto.
- Activar HTTPS.
- Configurar posteriormente el dominio definitivo.

El archivo `netlify.toml` permite mantener la configuración de despliegue.

### Infraestructura futura

```text
        JUGADOR
           |
           v
    NAVEGADOR WEB
           |
           v
    FRONTEND NETLIFY
           |
           v
   NETLIFY FUNCTIONS
           |
           v
  SUPABASE POSTGRESQL
```

Cuando se incorpore la base de datos, las credenciales privadas se mantendrán únicamente en el entorno del servidor.

---

# 📱 14. OPTIMIZACIÓN Y RESPONSIVE

El juego está diseñado principalmente para dispositivos móviles.

### Mejoras incorporadas

- Controles táctiles.
- Interfaz vertical.
- Escalado adaptable.
- Respeto de áreas seguras.
- Gestión de pixel ratio.
- Pausa al perder el foco.
- Limitaciones de memoria gráfica.
- Compatibilidad con teclado y ratón.
- Consideración de preferencias de movimiento reducido.

### Mejoras en revisión

Se está trabajando en la continuidad visual del escenario para pantallas con diferentes proporciones.

Problemas identificados:

- Franjas de color fijo sobre el cielo.
- Espacio adicional debajo de la calle.
- Diferencias visuales en dispositivos especialmente altos.
- Ajustes de escala y márgenes.

Solución planteada:

- Extender el cielo dinámico por encima de la fachada.
- Prolongar la textura del pavimento.
- Mantener las proporciones del pixel art.
- No alterar el área jugable ni las colisiones.

La solución requiere pruebas en varias resoluciones antes de considerarla cerrada.

---

# 🗺️ 15. ROADMAP DE DESARROLLO

## ✅ Fase 1 — Prototipo inicial

- [x] Estructura HTML/CSS/JS.
- [x] Canvas 2D.
- [x] Fachada pixel art.
- [x] Personaje principal.
- [x] Objetos que caen.
- [x] Movimiento táctil.
- [x] Movimiento mediante teclado.
- [x] Colisiones.
- [x] Puntuación.
- [x] Vidas.
- [x] Game Over.
- [x] Pausa.

## ✅ Fase 2 — Refactorización

- [x] Organización de carpetas.
- [x] Modularización JavaScript.
- [x] Separación de configuración.
- [x] Separación de sprites.
- [x] Separación de interfaz.
- [x] Conservación del motor original.
- [x] Nickname.
- [x] Ranking local.
- [x] Easter egg inicial.

## ✅ Fase 3 — Arcade V2

- [x] Cuenta atrás animada.
- [x] Música arcade original.
- [x] Efectos de sonido.
- [x] Combos.
- [x] Multiplicadores.
- [x] Game Over con estadísticas.
- [x] Récord personal.
- [x] Seis logros.
- [x] Notificaciones de logros.
- [x] Mejoras de controles.
- [x] Pausa automática.
- [x] Mejoras de rendimiento móvil.

## 🚧 Fase 4 — Ambientación V2.x

- [x] Primera versión de cielo dinámico.
- [x] Ciclo horario simulado.
- [x] Movimiento de sol y luna.
- [x] Estrellas.
- [x] Nubes.
- [x] Pájaros.
- [x] Primera versión de ventanas iluminadas.
- [x] Primera versión de flores y jardineras.
- [x] Toldos y ropa tendida.
- [x] Primeros efectos de iluminación nocturna.
- [x] Ajustes iniciales del easter egg HAMŠÍK.
- [ ] Terminar de ajustar la iluminación real de las ventanas.
- [ ] Corregir definitivamente la posición de las macetas.
- [ ] Validar que las barandillas queden delante de los maceteros.
- [ ] Afinar la iluminación de madrugada.
- [ ] Mejorar la integración de las plantas.
- [ ] Corregir las franjas en móviles altos.
- [ ] Revisar las transiciones del cielo.
- [ ] Verificar que no haya detalles visuales que dificulten jugar.

## ⏳ Fase 5 — Backend y ranking global

- [ ] Crear proyecto Supabase.
- [ ] Diseñar tablas.
- [ ] Crear migraciones SQL.
- [ ] Configurar permisos y políticas de acceso.
- [ ] Crear Netlify Functions.
- [ ] Implementar sesiones de jugador.
- [ ] Guardar partidas online.
- [ ] Crear TOP 10 global.
- [ ] Permitir múltiples récords por jugador.
- [ ] Validar puntuaciones en servidor.
- [ ] Implementar controles antitrampas.
- [ ] Probar concurrencia de usuarios.
- [ ] Incorporar tratamiento de errores de red.

## ⏳ Fase 6 — Promoción musical

- [ ] Confirmar enlace oficial de pre-save.
- [ ] Seleccionar proveedor.
- [ ] Revisar requisitos y permisos.
- [ ] Determinar si es posible verificar individualmente el pre-save.
- [ ] Integrar participación autorizada en ranking.
- [ ] Preparar enlaces de escucha posteriores al lanzamiento.

## ⏳ Fase 7 — QA y publicación

- [ ] Probar Android físicamente.
- [ ] Probar iPhone físicamente.
- [ ] Probar Safari móvil.
- [ ] Probar Chrome móvil.
- [ ] Probar navegadores integrados de Instagram y TikTok.
- [ ] Revisar audio en dispositivos reales.
- [ ] Revisar rendimiento.
- [ ] Revisar tamaños extremos.
- [ ] Comprobar persistencia de datos.
- [ ] Comprobar accesibilidad básica.
- [ ] Probar el sistema de puntuación online.
- [ ] Configurar dominio.
- [ ] Desplegar en Netlify.
- [ ] Verificar funcionamiento en producción.

---

# 🧪 16. PRUEBAS Y CALIDAD

La versión V2 base fue sometida a pruebas automatizadas de las principales interacciones y a comprobaciones de sintaxis JavaScript.

Resoluciones utilizadas durante las pruebas iniciales:

- 390 × 844.
- 320 × 568.
- 1280 × 800.
- 844 × 390.

### Comprobaciones realizadas sobre la V2 base

- Inicio de partida.
- Validación de nickname.
- Cuenta atrás.
- Sistema de combos.
- Easter egg.
- Pausa.
- Game Over.
- Persistencia local simulada.
- Errores JavaScript.

Las modificaciones posteriores de iluminación, vegetación y extensión del escenario se han trabajado de manera incremental y todavía necesitan una regresión visual completa.

**Las pruebas automatizadas no sustituyen las pruebas reales en dispositivos móviles.**

Consulta también `QA_CHECKLIST.md`.

---

# 🔐 17. SEGURIDAD Y PRIVACIDAD

Actualmente los datos de juego se almacenan localmente en el navegador.

Antes de incorporar la clasificación online será necesario:

- Definir un identificador persistente de jugador.
- Validar los resultados desde el backend.
- Proteger los endpoints públicos.
- Limitar las peticiones.
- Evitar escrituras arbitrarias.
- Restringir el acceso a datos privados.
- Definir una política de conservación de datos.
- Informar al usuario sobre el tratamiento de información.
- Revisar los requisitos legales aplicables antes del lanzamiento público.

No deben guardarse claves privadas ni credenciales administrativas en JavaScript accesible desde el navegador.

---

# 🎯 18. PRÓXIMOS OBJETIVOS

## Prioridad inmediata

**Terminar el pulido visual y funcional del juego.**

1. Corregir completamente la iluminación de las ventanas.
2. Integrar las macetas detrás de las barandillas.
3. Mejorar la noche y la iluminación urbana.
4. Corregir franjas superiores e inferiores en ciertos móviles.
5. Revisar la fluidez del juego y su dificultad.
6. Probar el resultado en dispositivos reales.

## Segunda prioridad

**Convertir el ranking local en uno global.**

- Supabase.
- Netlify Functions.
- Jugadores persistentes.
- Sesiones.
- Registro de puntuaciones.
- TOP 10 compartido.
- Validaciones de seguridad.

## Tercera prioridad

**Preparar el lanzamiento musical.**

- Pre-save.
- Enlaces promocionales.
- Participación verificada cuando sea posible.
- Dominio público.
- Pruebas finales.
- Publicación.

---

# 🌟 19. VISIÓN DE FUTURO

Aunque actualmente se está desarrollando una única página para **«No soy ni un casi»**, el proyecto podría servir como base para futuras experiencias musicales.

La idea a largo plazo es que cada canción tenga:

- Su propio minijuego.
- Una identidad visual diferente.
- Mecánicas particulares.
- Su propio ranking.
- Sus propios secretos.
- Una experiencia promocional independiente.

La arquitectura modular permitirá reutilizar partes del código sin reconstruir cada proyecto desde cero.

**Actualmente no se está desarrollando una web principal del artista.**

El alcance está centrado exclusivamente en el minijuego de esta canción.

---

# 💜 20. CRÉDITOS Y RECURSOS

Proyecto desarrollado como experiencia interactiva para la promoción musical de «No soy ni un casi».

### Desarrollo

- Equipo de desarrollo del minijuego.
- Colaboración en diseño, programación y evolución del proyecto.

### Recursos

- Fachada pixel art del proyecto.
- Lettering de la canción.
- Sprites del personaje y los objetos.
- Música arcade sintetizada.
- Efectos visuales y sonoros propios.

Los créditos nominales y los derechos de los recursos gráficos y musicales deberán confirmarse con sus respectivos autores antes de la publicación definitiva.

---

## 💋 ¿CUÁNTOS BESOS ERES CAPAZ DE ATRAPAR?

**Recoge. Esquiva. Encadena. Supera tu récord.**

Un atardecer en Madrid. Tres vidas. Una canción. Y todos los besos que puedas atrapar.

---

**Estado del documento:** 6 de noviembre de 2026  
**Versión del proyecto:** V2.x — Desarrollo activo  
**Tecnologías:** HTML5 · CSS3 · JavaScript · Canvas 2D · Web Audio API

*Hecho con código, píxeles y mucho cariño. 💜*
