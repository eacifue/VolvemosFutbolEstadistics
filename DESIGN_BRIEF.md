# Brief de rediseño — "Volvemos al Fútbol · Blanco y Negro"

> Documento para Claude Design. Describe qué es la app, qué existe hoy (pantallas, datos, reglas), qué problemas tiene el diseño actual, hacia dónde queremos llevarla y qué features nuevas proponemos. Todo el copy de la app es en **español (Colombia, `es-CO`)**.

---

## 1. Qué es la app (el core)

**Volvemos al Fútbol** es la app de estadísticas de un **grupo fijo de amigos que juega fútbol amateur** (≈24 jugadores registrados). No es una liga con muchos clubes: **siempre juegan dos equipos, Blanco vs Negro**, y en cada partido los jugadores se reparten entre ambos lados. Un jugador puede jugar con Blanco un día y con Negro el siguiente.

Lo que la app hace hoy:
- Guarda **partidos** (fecha, Blanco vs Negro) y quién jugó en cada lado.
- Registra **eventos** por jugador: **gol, asistencia, autogol**.
- Calcula **marcadores, rankings y rivalidad histórica** Blanco vs Negro.
- Un **admin** (organizador del grupo) carga todo; el resto **solo consulta**.

**La esencia emocional:** la rivalidad eterna Blanco vs Negro, el "pique" entre amigos (quién es el goleador, quién pierde más, quién mete autogoles) y el ritual semanal de revisar cómo quedó el partido. La app debe sentirse como **el FotMob/Sofascore del grupo de amigos**: datos serios, tono de barrio.

### Usuarios
| Persona | Qué hace | Contexto |
|---|---|---|
| **Jugador / hincha del grupo** (mayoría) | Mira el resultado, su posición en los tops, su racha, la cancha del partido | Celular, en el chat del grupo, después del partido o durante la semana |
| **Admin / organizador** (1–2 personas) | Crea el partido, arma los equipos, registra goles/asistencias/autogoles | Celular, **en la cancha o justo al terminar**, con prisa, a veces con una mano |

---

## 2. Estado actual

### 2.1 Stack (restricciones para el diseño)
- **Web:** React 19 + TypeScript + Vite, CSS plano (sin Tailwind ni librería de componentes), íconos **Phosphor** (regular + fill). Layout **mobile-first**, contenedor de máx. 560 px, navegación inferior por pestañas.
- **Mobile:** Flutter (Material, Provider) — hoy con paleta verde/dorado distinta a la web. El rediseño debe servir para ambos clientes.
- **Backend:** ASP.NET Core + MySQL, JWT con un único rol `Admin`.

### 2.2 Pantallas existentes (web, `frontend/vite-temp`)
Shell: header con logo + "Volvemos al Fútbol / **Blanco y Negro**" + marcador global de victorias (Blanco N · Negro N). Bottom nav con 4 tabs:

1. **Tops** (pestaña por defecto)
   - "Últimos 3 partidos": fecha, marcador, "Ganó Blanco / Ganó Negro / Empate", hasta 4 eventos (tag de equipo + jugador + tipo).
   - 5 leaderboards de igual peso visual: **Top 5 Goleadores, Asistencias, Más Ganados, Más Perdidos, Autogoles**.
   - **Cara a cara**: victorias Blanco / empates / victorias Negro + goles a favor de cada uno.
2. **Partidos**
   - Lista: fecha + "Blanco vs Negro" + marcador.
   - Detalle: marcador grande, y **una cancha por equipo** con camisetas posicionadas por línea (Portero / Defensa / Mediocampista / Delantero), nombre del jugador y badges de ⚽ goles, 🎯 asistencias, ⚠ autogoles. Las camisetas se pueden **arrastrar** para reubicarlas (se guarda solo en el navegador local).
3. **Jugadores**
   - Buscador por nombre (sin acentos) + grilla de tarjetas: avatar con iniciales coloreado según el equipo con el que más juega, tag Blanco/Negro, y mini-stats: goles, asistencias, goles por partido, ganados (G), perdidos (P).
4. **Admin** (login usuario/contraseña)
   - Segmento **Jugador | Partido**.
   - *Jugador:* CRUD (nombre, apellido, posición), confirmación de borrado.
   - *Partido:* lista de partidos, crear/editar/borrar partido (fecha, equipos), asignar jugadores a Blanco/Negro (buscador), registrar eventos con formulario de 3 selects (Equipo → Jugador → Tipo) + "Guardar Evento", lista de eventos con borrar, toasts.

### 2.3 Modelo de datos (lo que hay para diseñar)
| Entidad | Campos relevantes |
|---|---|
| **Player** | nombre, apellido, posición (Portero/Defensa/Mediocampista/Delantero). Derivados: goles, asistencias, partidos, autogoles, goles/partido, victorias, derrotas, empates, **racha goleadora**, **racha sin gol** |
| **Team** | solo 2 fijos: *Equipo Blanco* (id 1), *Equipo Negro* (id 2). PJ, G, E, P, GF, GC, puntos |
| **Match** | fecha/hora, local/visitante (Blanco/Negro). *No tiene estado, cancha, minuto, ni duración* |
| **MatchPlayer** | jugador + equipo en ese partido |
| **MatchEvent** | jugador, equipo, tipo (1 Gol, 2 Asistencia, 3 Autogol; el backend ya contempla 4 Amarilla, 5 Roja pero no se usan), fecha de registro. **No tiene minuto** |
| **Dashboard** | total partidos, victorias por equipo, empates, GF por equipo, diferencia de gol, últimos 3 partidos, tops (goles, asistencias, autogoles, ganados, perdidos), comparativa de equipos |

Reglas de negocio: el marcador se **calcula** desde los eventos (gol suma al equipo del jugador; autogol suma al rival). Sin fotos de jugadores (solo iniciales). Lectura pública, escritura solo admin.

### 2.4 Lenguaje visual actual
- Tema **"Nocturne"**: fondo azul-noche `#161826`, superficies `#232532`, acento **lavanda/violeta** `#9184d9`, tipografía **Inter**, botones outline, radios 6/10/16 px.
- La app Flutter usa otra paleta (verde oscuro `#0B3D2E` + dorado `#D4AF37`) → **las dos plataformas no se parecen**.

### 2.5 Problemas detectados (auditoría de diseño previa + revisión de código)
1. **La identidad no es futbolera ni "Blanco y Negro"**: el violeta no tiene relación con el producto; los dos equipos se distinguen con lavanda vs gris, cuando su identidad natural es **blanco vs negro**.
2. **Inter** es genérica, sin carácter; los números (el protagonista de la app) no tienen tipografía propia.
3. **Tops sin jerarquía**: 5 leaderboards + recientes + cara a cara con el mismo peso. Nada destaca (ni el último resultado, ni el líder goleador). "Top Autogoles" pesa lo mismo que "Top Goleadores".
4. **Carga de eventos lenta**: 3 selects por cada gol; no hay "otro gol del mismo jugador", ni asociar asistencia al gol, ni deshacer.
5. **Sin minuto en los eventos** → no hay línea de tiempo del partido.
6. **No hay perfil de jugador**: la tarjeta es el único lugar donde se ven sus números; no hay historial, rachas visibles, ni comparación.
7. Validaciones débiles (se puede crear Blanco vs Blanco), errores técnicos crudos, modales sin `role="dialog"`/focus trap, botones sin estado "enviando".
8. Mensajes de error/crash en inglés en un producto 100 % en español.
9. Posiciones de la cancha arrastradas solo se guardan en el navegador de quien las mueve.

---

## 3. Dirección de diseño propuesta

### 3.1 Concepto: **"Clásico de barrio"** — editorial, monocromo, con cal de cancha
El producto *ya tiene* su paleta: **blanco y negro**. Proponemos construir todo sobre esa dualidad y usar **un solo acento** que remita al fútbol:

- **Base monocroma de alto contraste.** Dark mode por defecto (negro carbón, no azul), con light mode completo. Blanco y Negro son *los colores de los equipos*, no solo del fondo: cada vez que aparece un equipo, su representación es un **chip / camiseta / barra blanca o negra con borde**, inconfundible.
- **Acento único "cal de cancha"**: un verde césped vivo o un amarillo fluorescente de peto/balón (proponer y elegir uno) para estados activos, líderes, CTAs y "en vivo". Rojo solo para autogoles/errores, nunca decorativo.
- **Tipografía con carácter:** una **condensada deportiva** para números y titulares (ej. *Barlow Condensed*, *Saira Condensed*, *Big Shoulders Display* o *Oswald*) con **cifras tabulares**, y una sans legible para texto (ej. *Geist*, *Manrope* o *IBM Plex Sans*). Los marcadores deben sentirse como un **marcador de estadio**.
- **Texturas del deporte, con mesura:** líneas de cal de la cancha, numeración de dorsal, patrón de rayas de camiseta (para Negro/Blanco), sello/escudo del grupo. Nada de degradados genéricos ni bordes de color a la izquierda en tarjetas.
- **Tono:** serio en los datos, pícaro en el copy ("El Pichichi", "Mano de piedra" para autogoles, "Racha de fuego", "Sequía"). El pique entre amigos es una feature.

> Si Design ve otra dirección más fuerte, bienvenida — pero la regla es: **la dualidad Blanco/Negro debe ser el eje visual**, y la app debe reconocerse en un screenshot en el chat del grupo.

### 3.2 Principios
1. **Lo primero que se ve es el último resultado.** Abrir → ver marcador → ver quién la rompió → salir (filosofía Apple Sports).
2. **Glanceable y compartible.** Cada pantalla clave debe poder convertirse en una imagen para WhatsApp/Instagram Stories.
3. **El admin carga un gol en ≤ 2 toques.**
4. **Una sola fuente de diseño** para web y Flutter (tokens compartidos).
5. Mobile-first (360–430 px), pero con layout de escritorio decente para el admin (2 columnas).
6. Accesible: contraste AA mínimo, objetivos táctiles ≥ 44 px, no depender solo del color para distinguir equipos (usar también etiqueta/patrón), `prefers-reduced-motion`.

### 3.3 Design tokens a entregar
Color (dark + light), tipografía (escala, pesos, cifras tabulares), espaciado (base 4/8), radios, sombras/elevación, motion (duraciones y curvas), y tokens semánticos de dominio: `team-white-*`, `team-black-*`, `event-goal`, `event-assist`, `event-own-goal`, `event-yellow`, `event-red`, `state-live`, `leader`.

---

## 4. Arquitectura de información propuesta

Bottom nav (4–5 ítems):

| Tab | Contenido |
|---|---|
| **Inicio** | Hero del último partido, próximo partido, líderes, rivalidad, highlights |
| **Partidos** | Lista/calendario, detalle con línea de tiempo, cancha, stats, votación |
| **Ranking** | Tabla completa de jugadores con orden por cualquier métrica + leaderboards |
| **Jugadores** | Directorio → **Perfil del jugador** |
| **Admin** (solo si logueado; si no, ícono discreto en el header) | Modo "en cancha" + gestión |

---

## 5. Pantallas — especificación

### 5.1 Inicio (reemplaza "Tops")
1. **Hero "Último partido"** — marcador grande estilo estadio (Blanco 4 – 2 Negro), fecha relativa ("hace 3 días"), resultado en palabras ("Ganó Negro"), goleadores debajo de cada lado, **MVP del partido** (si hay votación) y botón **Compartir**.
2. **Próximo partido** (feature nueva) — fecha/hora, cancha, confirmados X/14, botón "Voy / No voy", equipos si ya están armados.
3. **La rivalidad** — barra dividida Blanco/Negro con victorias–empates–victorias, GF, y **forma reciente** (últimos 5: chips G/E/P por equipo).
4. **Líderes** — 3 tarjetas destacadas: Pichichi (goles), Asistidor, Ganador (% victorias). Cada una con avatar, número grande y "ver ranking".
5. **Rachas y curiosidades** — "Racha de fuego: X lleva 4 partidos marcando", "Sequía: Y lleva 6 sin gol", "Dupla letal: X → Y, 5 asistencias".
6. Autogoles fuera del hero; quedan en Ranking o como "Muro de la vergüenza" opcional, con tono humorístico.

### 5.2 Partidos
- **Lista**: agrupada por mes, cada ítem = mini-marcador con camisetas Blanco/Negro, resultado coloreado, goleadores abreviados, badge "HOY"/"PRÓXIMO". Filtros: todos / ganó Blanco / ganó Negro / empates / donde jugué yo.
- **Detalle de partido** (pestañas internas):
  - **Resumen**: marcador estadio, goleadores por lado (con asistencia: "Gol de X (asist. Y)"), MVP.
  - **Línea de tiempo** (requiere campo minuto): eje vertical tipo FotMob, eventos a izquierda (Blanco) / derecha (Negro), marcador parcial acumulado. Si no hay minuto, mostrar orden de registro sin minutos (no "Min --").
  - **Alineaciones**: la cancha actual mejorada — **una sola cancha con ambos equipos enfrentados** (Blanco arriba, Negro abajo), camisetas con dorsal/iniciales, badges de eventos. Vista de lista alternativa accesible. El arrastre queda solo para el admin y se guarda en el servidor.
  - **Stats del partido**: barras comparativas (goles, asistencias, jugadores por lado, autogoles) + "jugador del partido".
  - **Votación MVP** (feature nueva).
- Estados: vacío, cargando (skeleton con forma real), error amable con reintento.

### 5.3 Ranking
- **Tabla completa ordenable** (sticky header): #, jugador, PJ, G, A, G+A, G/PJ, V, E, P, % victorias, autogoles, rating. Toggle **temporada / histórico** y **mínimo de partidos**.
- Leaderboards visuales arriba (podio 1-2-3 para la métrica elegida).
- Chips para cambiar métrica rápida.

### 5.4 Perfil de jugador (nuevo)
- Cabecera tipo **carta de jugador** (estilo FUT/Sofascore): iniciales/foto, posición, equipo más frecuente (con % Blanco vs Negro), **rating** grande.
- Números clave: PJ, goles, asistencias, G/PJ, % victorias, racha actual.
- **Forma**: últimos 10 partidos como chips (V/E/P + goles en ese partido) y mini-gráfico de goles acumulados.
- **Splits**: rendimiento con Blanco vs con Negro.
- **Socios**: con quién gana más, a quién más asiste / quién más le asiste.
- **Logros/insignias** desbloqueadas.
- **Comparar** con otro jugador (radar o barras enfrentadas).
- Botón **Compartir carta**.

### 5.5 Admin
- **Modo "En cancha" (live)** — pantalla de alto contraste, botones enormes:
  - Dos columnas Blanco | Negro con los jugadores del partido como **botones-avatar**.
  - Tocar jugador → hoja rápida: **⚽ Gol · 🎯 Asistencia · 🥅 Autogol · 🟨 · 🟥**. Al registrar un gol, sugerir inmediatamente "¿Quién asistió?" con los compañeros del mismo equipo (un toque o "sin asistencia").
  - Cronómetro opcional que asigna el **minuto** automáticamente.
  - Marcador en vivo arriba, **Deshacer** (snackbar 5 s), estado "guardando/guardado/sin conexión".
- **Armar partido**: fecha/hora, cancha, y asignación de jugadores **arrastrando a Blanco/Negro** o con toggle; botón **"Equilibrar equipos"** (feature nueva). Imposible elegir Blanco vs Blanco (los equipos son fijos; solo se asigna gente).
- **Gestión de jugadores**: lista + formulario (nombre, apellido, posición, apodo, dorsal, foto opcional), feedback de éxito/error siempre visible.
- Escritorio: 2 columnas (lista de partidos | editor).

### 5.6 Estados y sistema transversal
Para cada pantalla: cargando (skeleton), vacío (ilustración + CTA), error (copy amable en español + reintentar), sin conexión. Diálogos accesibles (focus trap, Esc, `aria-modal`). Toasts consistentes. ErrorBoundary en español.

---

## 6. Features nuevas propuestas (investigación del sector)

Referentes revisados: **FotMob, Sofascore, Apple Sports** (apps de fans pro) y apps de **fútbol amateur entre amigos**: **Capo, AMVP, MVP – Most Voted Player, TeamsUp, Five, Foot8, 5Aside, SquadBalance, TeamChooser, Spond/SportEasy**. Patrones que hoy son estándar en el segmento amateur: votación de MVP post-partido, equipos balanceados automáticamente, confirmación de asistencia con lista de espera, logros, perfiles con rating y reportes del partido generados por IA.

Prioridad: **P1** = alto impacto y poco cambio de datos · **P2** = gran valor, requiere modelo nuevo · **P3** = ambicioso/futuro.

| # | Feature | Qué es | Por qué encaja | Datos nuevos | Prioridad |
|---|---|---|---|---|---|
| 1 | **Perfil de jugador** | Pantalla 5.4 | Hoy no existe; es lo que cada jugador quiere ver | Ninguno (derivable) | P1 |
| 2 | **Modo "En cancha"** | Carga de eventos en ≤2 toques + deshacer | Dolor principal del admin | Ninguno | P1 |
| 3 | **Asistencia ligada al gol** | Al cargar gol, elegir asistidor | Permite "dupla letal" y timeline real | `assistOfEventId` o `relatedPlayerId` | P1 |
| 4 | **Minuto del evento + timeline** | Cronómetro y línea de tiempo | La UI ya lo intentaba mostrar | `minute` en MatchEvent | P1 |
| 5 | **Tarjetas compartibles** | Imagen 9:16 / 1:1 del resultado, carta de jugador, ranking semanal | El grupo vive en WhatsApp; la app crece por ahí | Ninguno | P1 |
| 6 | **Votación MVP (y "Tronco del partido")** | Ventana de 24 h post-partido, 1 voto por jugador (o 3-2-1 puntos) | Feature estrella en Capo, AMVP, MVP App; engancha a todos, no solo a goleadores | `MatchVote`, login ligero de jugador | P2 |
| 7 | **Rating del jugador** | Nota 1–10 por partido (fórmula: goles, asistencias, victoria, MVP, autogoles) + rating global/Elo | Da algo para valorar a defensas y porteros que no marcan | Cálculo; opcional `PlayerMatchRating` | P2 |
| 8 | **Equilibrar equipos** | Algoritmo que reparte a los confirmados en Blanco/Negro minimizando la diferencia de rating y respetando posiciones (1 portero por lado) | Estándar del segmento (SquadBalance, Capo); evita partidos 8–1 | Usa rating (#7) | P2 |
| 9 | **Próximo partido + confirmación** | "Voy / No voy / Tal vez", cupo y lista de espera, recordatorio | Sustituye la lista del chat | `Match.status` (programado/en juego/finalizado), `Attendance` | P2 |
| 10 | **Logros / insignias** | Hat-trick, primer gol, 10/25/50 goles, racha de 3, invicto 5 partidos, "Mano de piedra" (autogol), MVP x3, asistencia perfecta | Gamificación: Capo tiene 200+ | Derivable; tabla `Achievement` opcional | P2 |
| 11 | **Temporadas** | Cortes por semestre/año con campeón de temporada, Pichichi, MVP | Da narrativa y "reset" a los rankings | `Season` | P2 |
| 12 | **Rivalidad avanzada** | Forma reciente, mayor goleada, racha de victorias de cada equipo, gráfico histórico de victorias acumuladas | Es el core Blanco vs Negro | Ninguno | P1 |
| 13 | **Crónica del partido con IA** | Texto corto y gracioso generado a partir de los eventos ("Negro remontó con doblete de Piña…") | Capo lo ofrece; encaja con el tono del grupo | Ninguno (generado) | P3 |
| 14 | **Tarjetas amarillas/rojas** | Ya existen en el enum del backend | Completa el registro | Insertar tipos 4 y 5 | P3 |
| 15 | **Fotos y apodos** | Avatar real, apodo, dorsal | Personalidad en tarjetas/cancha | `photoUrl`, `nickname`, `number` | P2 |
| 16 | **Cuentas de jugador** | Login con enlace mágico/teléfono para votar, confirmar y seguir su perfil | Necesario para #6 y #9 | Rol `Player` | P2 |
| 17 | **Pagos/cuotas de cancha** | Quién pagó la cancha de la semana | Común en apps de 5-a-side | `Payment` | P3 |
| 18 | **PWA + notificaciones** | Instalar en pantalla de inicio, push de "resultado publicado", "vota al MVP", "partido mañana" | Uso semanal recurrente | Suscripciones push | P3 |
| 19 | **Momentum/flujo del partido** | Gráfico simple de quién iba ganando minuto a minuto (inspirado en el Attack Momentum de Sofascore, simplificado con goles) | Visual muy reconocible | Requiere #4 | P3 |

**Pedido a Design:** diseñar pantallas P1 completas, P2 al menos con flujos principales, y P3 como conceptos.

---

## 7. Componentes a diseñar (librería)
- Marcador (grande/hero, mediano/lista, mini/chip) con variante "en vivo".
- Chip/camiseta de equipo Blanco / Negro (con patrón, no solo color).
- Avatar de jugador (iniciales, foto, con borde de equipo, con badge de MVP/logro).
- Fila de leaderboard y podio 1-2-3.
- Tarjeta de jugador (compacta / carta completa).
- Badge de evento (gol, asistencia, autogol, amarilla, roja) con conteo.
- Ítem de línea de tiempo.
- Cancha (vertical, ambos equipos, modo edición admin).
- Barra comparativa Blanco vs Negro.
- Chips de forma (V/E/P).
- Botonera de evento rápido (modo En cancha) + snackbar con Deshacer.
- Tabla ordenable con header sticky.
- Hoja inferior (bottom sheet), diálogo de confirmación, toast, estados vacío/error/skeleton.
- Plantillas de imagen compartible (resultado, carta de jugador, ranking).
- Insignias de logros.

## 8. Entregables esperados
1. Concepto visual (moodboard + 1–2 direcciones, con recomendación).
2. Design tokens (dark + light) listos para CSS variables y para `ThemeData` de Flutter.
3. Librería de componentes de la sección 7.
4. Pantallas mobile (390 px) de: Inicio, Lista de partidos, Detalle de partido (resumen, timeline, alineaciones, stats, votación), Ranking, Perfil de jugador, Comparar jugadores, Admin modo En cancha, Armar partido / Equilibrar equipos, Gestión de jugadores, Login.
5. Versión escritorio de Admin y de Ranking.
6. Estados (vacío, cargando, error, sin conexión) de las pantallas principales.
7. Plantillas compartibles 9:16 y 1:1.

## 9. Datos de ejemplo realistas (para los mockups)
- Jugadores: Germán Piña (Delantero), Eric Cifuentes (Mediocampista), Hernán Foronda (Mediocampista), Julio Atencio (Delantero), Juan David Rincón (Portero), Santiago Arango (Defensa), Enoc Marchán (Delantero), Juan Diego Piña, Juan Fajardo, Esteban Delgado, Camilo Dimate, Julián Mejía, Luis Castro…
- Partidos de ~7 vs 7 a 9 vs 9, marcadores típicos entre 2–2 y 8–5, uno por semana, de noche (20:00).
- Histórico de ejemplo: Blanco 12 victorias · 4 empates · Negro 10 victorias.

## 10. Lo que NO queremos
- Violeta/lavanda u otro color sin relación con los equipos.
- Inter / tipografías genéricas; números sin cifras tabulares.
- Degradados decorativos, glassmorphism por defecto, bordes de color a la izquierda en tarjetas.
- Pantallas con 8 módulos del mismo peso.
- Copy en inglés o mensajes técnicos ("Network Error").
- Distinguir Blanco y Negro **solo** por color.

---

### Fuentes de la investigación
- [AMVP – Football (App Store)](https://apps.apple.com/us/app/amvp-football/id6756834859)
- [MVP – Most Voted Player (App Store)](https://apps.apple.com/us/app/mvp-most-voted-player/id6752958961)
- [TeamsUp](https://teamsup.app/)
- [Best 5-a-side football apps in 2026 — compared](https://www.footypro.online/en/best-5-a-side-football-apps)
- [Capo (Product Hunt)](https://www.producthunt.com/p/capo-3)
- [5Aside (App Store)](https://apps.apple.com/do/app/5aside/id6717572115)
- [Five — Foot 5 vs 5](https://mwm.ai/apps/five-foot-5-vs-5/6761376812)
- [Foot8](https://mwm.ai/apps/foot8/6769198382)
- [SquadBalance — Team Balancer](https://chromewebstore.google.com/detail/eockgmkajgdklfpbjbinnbjlkhcbonne)
- [TeamChooser (App Store)](https://apps.apple.com/ee/app/teamchooser/id369608062)
- [Competitive Balance in Team Sports Games (arXiv)](https://ar5iv.labs.arxiv.org/html/2006.13763)
- [Best Football Stats Apps 2026: xG, Heatmaps & Ratings Compared](https://www.tikitaka.gg/best-football-stats-apps)
- [How Sofascore's Attack Momentum Changed Sport Analysis](https://www.sofascore.com/news/how-sofascores-attack-momentum-changed-sport-analysis)
- [Apple Sports 2026](https://applemagazine.com/apple-sports-2026/)
- [Apple Sports y el diseño de datos (Creative Boom)](https://www.creativeboom.com/inspiration/this-new-app-from-apple-has-something-important-to-teach-us-about-designing-data/)
