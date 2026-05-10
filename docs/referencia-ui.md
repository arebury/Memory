# Memory · Referencia de UI

*Memory · Smart Contact · Por Rafael Areses*

---

## Sobre este documento

Memory es la parte de Smart Contact que permite revisar miles de conversaciones (llamadas y chats) y decidir cuáles transcribir y analizar con IA, sin que el supervisor tenga que escucharlas todas a mano. Esta referencia describe **cómo se ve cada componente clave del producto, cómo se comporta, qué texto emite y cómo se valida visualmente**. La parte de lógica de negocio —qué datos consume, qué deriva, qué dispatcha— vive en el documento hermano *Memory · Lógica de conteo y reglas de negocio*.

Cuatro componentes principales se documentan, en este orden:

| Componente | Para qué sirve |
|---|---|
| `BulkTranscriptionModal` | Modal de confirmación para procesar conversaciones en bloque. |
| `ConversationPlayerModal` | Modal por conversación: audio, transcripción tipo chat, panel de análisis. |
| `RecordingTimeline` | Selector de tramo dentro de una conversación con varias grabaciones. |
| `scToast` | Toasts canónicos del producto (5 severities × 2 estilos × 2 layouts). |

Al final del documento hay dos secciones transversales: los **tokens compartidos del Smart Contact Design System** y las **reglas de UI que aplican a todo el producto** (iconografía, política de copy, anti layout-shift, etc.).

---

## 1. BulkTranscriptionModal

### Anatomía

El modal se monta sobre el shell oficial del Smart Contact Design System (`Modal` con compound API: header, body, footer). Mide 720 píxeles de ancho con un fondo blanco y bordes redondeados de 12 píxeles.

```
Modal (720px de ancho, surface blanca, radius 12px)
├── Header
│   ├── Icon (AlignLeft, navy, 24×24)
│   ├── Title "Transcripciones masivas"
│   ├── Subtitle "{nSelected} conversaciones seleccionadas[ · breakdown opcional]"
│   └── Close (×, top-right)
├── Body — dos columnas con un divider hairline central
│   ├── Hero cell (50% del ancho)
│   │   ├── Label "TOTAL A PROCESAR" (uppercase, semibold)
│   │   ├── Number heroCount (112 píxeles, leading 112, tabular-nums,
│   │   │                     animación de pulse al cambiar)
│   │   ├── HeroDeltaHint "(de {nSelected} seleccionadas)" cuando aplica
│   │   └── Cost tag "genera coste" o "todo procesado" (amber, lowercase)
│   └── Decision cell (50% del ancho)
│       ├── Label "ANÁLISIS" (uppercase, semibold)
│       ├── Title "Incluir análisis" (16px, semibold, color condicional)
│       ├── Switch (con dos dimensiones: checked y disabled)
│       └── Caption "+{nAnBase} pendientes · genera coste" o
│                   "No hay nada que analizar"
└── Footer
    ├── Cancelar/Cerrar (botón ghost)
    └── Procesar (botón primario navy filled, deshabilitado si no hay nada)
```

### Reglas de interacción

**Interruptor "Incluir análisis"**

Solo dos resultados posibles cuando el usuario hace clic:

- Si el switch está activo (`disabled === false`), `checked` se invierte. Aparece un ghost flotante "+N" o "−N" sobre el número grande para señalar el delta, y la caption hace un pulse. Es feedback visual de que la decisión tuvo efecto.
- Si el switch está deshabilitado (`disabled === true`), el knob hace un pequeño shake de 280 ms y `checked` no cambia. El shake comunica "no se puede" sin necesidad de un tooltip explícito.

**Botón "Procesar"**

- Click con `canSubmit === true` → dispatcha la acción al padre y cierra el modal inmediatamente.
- Click con `canSubmit === false` → ignorado (el botón está disabled visualmente).
- No hay un segundo paso de confirmación. El propio modal es la confirmación.

**Cierre del modal**

Cuatro maneras de cerrarlo sin ejecutar nada: el botón ×, el botón "Cerrar" del footer, hacer clic fuera del modal, y la tecla Escape. Las cuatro tienen el mismo efecto.

**Después del submit (fire-and-forget)**

El modal se cierra de inmediato, sin esperar la respuesta del backend. El feedback (éxito o fallo) llega vía `scToast` desde la vista de listado, no desde el modal. El supervisor vuelve al listado y puede seguir trabajando mientras el batch se procesa.

### Copia exhaustiva

Las strings que el componente emite. Solo cuatro son dinámicas; el resto son literales.

| Lugar | Texto | Notas |
|---|---|---|
| Title | `Transcripciones masivas` | Estática. |
| Subtitle | `{nSelected} conversaciones seleccionadas` | Si hay mezcla de canales: `... · {N} llamadas, {M} chats`. Si hay multi-grabación: `... · {Y} con varias grabaciones`. |
| Label izquierda | `TOTAL A PROCESAR` | Uppercase. |
| Hero number | `{heroCount}` | Tabular-nums para que no salte de ancho al cambiar de dígitos. |
| HeroDeltaHint | `de {nSelected} seleccionadas` | Solo cuando `heroCount !== nSelected`. Espacio reservado con `min-h` cuando ausente para evitar layout-shift. |
| Cost tag (normal) | `genera coste` | Lowercase. Espacio reservado con `opacity-0` cuando es C1 (todo procesado), no removido del DOM, también para evitar shift. |
| Cost tag (vacío) | `todo procesado` | Solo en C1. |
| Label derecha | `ANÁLISIS` | Uppercase. |
| Decision title | `Incluir análisis` | Semibold. Color disabled cuando el switch lo está; color heading cuando activo. |
| Caption activa | `+{nAnBase} pendientes · genera coste` | Color teal (`text-sc-accent-strong`). |
| Caption disabled | `No hay nada que analizar` | Color muted. |
| Botón ghost | `Cerrar` | Es "Cerrar", no "Cancelar". Pre-submit no hay nada que cancelar (la acción no ha empezado), así que "Cerrar" es más honesto. |
| Botón primario | `Procesar` | Navy filled. Cuando el supervisor pulsa, muestra spinner + texto "Procesando…" hasta cerrar. |

### Especificación de animaciones

Cinco animaciones en el modal, todas con duraciones y easings consistentes con el resto del producto:

| Animación | Detalle |
|---|---|
| Bump del número grande al cambiar | Escala 1.03 durante 260 ms, easing `ease-out`. |
| Pulse del hero (cambio significativo) | Escala 1.08 durante 360 ms, easing `ease-out`. |
| Ghost +N / −N flotando sobre el hero | 21 píxeles, semibold, cyan (delta positivo) o gris (delta negativo). Sube 34 píxeles y se desvanece en 750 ms. Solo aparece en clic real del switch, no al cambiar de escenario externo. |
| Pulse de la caption del análisis | Escala 1.08 durante 360 ms, sincronizada con el cambio de `checked`. |
| Shake del switch deshabilitado | Translación horizontal ±4 píxeles durante 280 ms. |
| Apertura/cierre del modal | Fade del backdrop en 200 ms + un translateY de 8 a 0 píxeles en 280 ms. |

Las animaciones del producto siempre usan **transform y opacity, nunca propiedades de layout** como width, height, top o padding. Mover el knob del switch es `translateX`, no cambiar `left`. Esto evita reflows y mantiene 60 fps.

Pendiente: añadir un fallback para `prefers-reduced-motion` que desactive el ghost y el pulse, dejando solo el cambio de color y un fade muy breve.

### Tokens usados

| Categoría | Token | Valor |
|---|---|---|
| Surface del modal | `--sc-surface` | `#FFFFFF` |
| Color CTA primario | `--sc-primary` (navy 600) | `#1B273D` |
| Color del hero number | `--sc-text-emphasis` | `#3C434D` (negro ablandado) |
| Cost cue | `--sc-cost-warn` (warning 600) | `#D97706` (amber) |
| Caption activa del análisis | `--sc-accent-strong` (teal 600) | `#48B8C9` |
| Hairline divider central | `--sc-border-soft` (surface 100) | `#F3F4F6` |
| Tamaño de fuente del hero | `--sc-font-size-display` | 112 px |
| Line-height del hero | `--sc-line-height-display` | 112 px (1:1) |
| Altura de cada cell | `--sc-bulk-cell-height` | 240 px |
| Padding-top de cada cell | `--sc-bulk-cell-padding-top` | 28 px |
| Padding-x de cada cell | `--sc-bulk-cell-padding-x` | 24 px |

### Accesibilidad

- El contenedor es un `<div role="dialog" aria-modal="true">` con `aria-labelledby` apuntando al título. Esto lo gestiona Radix Dialog por debajo.
- El número grande tiene `aria-live="polite"` para que los lectores de pantalla anuncien los cambios cuando el supervisor toca el switch.
- El switch tiene `role="switch"`, `aria-checked` reflejando el estado, y `aria-disabled` cuando aplica.
- Mientras el modal está abierto, el foco se atrapa dentro (tab y shift+tab no salen). Lo gestiona Radix.
- Escape cierra el modal. Si en algún flujo futuro hay una operación async, el componente puede bloquear Escape pasando `onEscapeKeyDown={e => isLoading && e.preventDefault()}`.
- Orden de tabulación: × → switch → Cerrar → Procesar.

### Fuera de alcance

Lo que el modal no hace, deliberadamente:

- No muestra progreso del procesado. Para eso está el toast persistente "Procesando N conversaciones" que vive arriba a la derecha mientras dura el batch.
- No permite excluir conversaciones individuales desde dentro. La selección se ajusta en la tabla antes de abrir el modal.
- No gestiona errores post-submit. El modal está cerrado cuando llega la respuesta; el feedback lo asume la pantalla que disparó la acción (típicamente vía toast).
- No muestra coste monetario real (€). Solo cuenta items y advierte de "genera coste". El cálculo de coste real lo hace el backend aparte, fuera del scope del modal.
- No soporta multi-idioma todavía. Las strings están en español hardcoded.

### Checklist de QA

Por cada caso C1-C6, y por cada estado del switch en C4 y C6, verificar:

- [ ] El número grande coincide con el caso esperado (ver el documento *Lógica de conteo*).
- [ ] El cost tag dice `genera coste` salvo en C1, donde dice `todo procesado`.
- [ ] El switch es interactivo solo en C2, C4, C5, C6. En C1 y C3 hace shake al clicarlo.
- [ ] El botón Procesar está deshabilitado solo en C1.
- [ ] El subtítulo lee `{nSelected} conversaciones seleccionadas` correctamente. Cuando hay mezcla de canales, añade el desglose. Cuando hay multi-grabación, también.
- [ ] El HeroDeltaHint aparece solo cuando `heroCount` difiere de `nSelected`.
- [ ] El ghost +N / −N aparece solo al togglear, no al cambiar de escenario externo.
- [ ] El cost tag no genera layout-shift cuando se vacía (espacio reservado).
- [ ] Escape, clic fuera y "Cerrar" cierran el modal sin lanzar acción.
- [ ] Las animaciones se desactivan correctamente con `prefers-reduced-motion: reduce`.

---

## 2. ConversationPlayerModal

### Anatomía

Modal por conversación, también de 720 píxeles de ancho. Su estructura cambia según el canal (llamada o chat) y según el estado de la conversación.

```
Modal (720px, surface blanca)
├── Header
│   ├── Icon channel-aware: Phone (llamada) o MessageSquare (chat)
│   ├── Title "Llamada · #{id}" o "Chat · #{id}"
│   └── Subtitle "{servicio} · {fecha} {hora} · Duración {duración}"
├── Body
│   ├── RecordingTimeline (solo si hay multi-grabación) — ver sección 3
│   ├── Audio bar (solo en llamadas, oculta del todo en chats)
│   │   └── back-10 · play · fwd-10 · timestamp · scrub bar · timestamp
│   ├── Tab row "Transcripción" / "Análisis" + acciones a la derecha
│   │   (re-transcribir si aplica, descargar)
│   └── Tab body (mínimo 360 píxeles de alto para que no se sienta apretado)
│       ├── Tab Transcripción
│       │   ├── Header con "{N} intervenciones" + buscador
│       │   ├── Bubbles de chat (agente derecha, cliente izquierda)
│       │   └── Empty states (ver más abajo)
│       └── Tab Análisis
│           ├── Sección Resumen (con badge "Generado por IA")
│           ├── Sección Sentimiento
│           └── Empty states
└── Footer
    └── Cerrar (botón ghost, sin acción primaria)
```

### Reglas de interacción

**Tabs**

Las dos tabs son siempre visibles. La activa se marca con un underline accent debajo del label y un cambio sutil de peso/color del texto. El supervisor puede saltar entre ellas libremente sin perder el estado del audio.

**Audio bar**

Solo se renderiza para llamadas. Para chats, no existe. Las llamadas sin grabación muestran la barra con todos los controles deshabilitados (no se oculta) — la posición vacía comunica "esto debería ser un audio pero no hay" mejor que esconderlo.

Los controles transport (back-10, play, fwd-10) son botones circulares de 36 píxeles. La barra de scrub tiene una zona clickable de 20 píxeles de alto para que el thumb sea fácil de agarrar, aunque visualmente la barra es de 6 píxeles. El thumb circular aparece en hover, focus o mientras se reproduce; en estado inactivo, la barra se queda como un track simple.

Detalle técnico de la animación del fill: usa `transform: scaleX()` con origen a la izquierda, no `transition: width`. La diferencia importa: animar `width` cada segundo durante toda la reproducción dispara reflow continuo; `scaleX` solo afecta a la composición.

**Tab row · acciones a la derecha**

A la derecha de las dos tabs viven las acciones globales del modal:

- **Re-transcribir** (icono `RotateCcw`, low-key): aparece solo si la conversación ya tiene transcripción. Es destructivo (sobrescribe lo que hay), así que va con un modal de confirmación adicional al pulsarlo.
- **Descargar** (icono `Download`): visible siempre, paridad chat/llamada. El tooltip cambia: "Descargar audio" para llamadas, "Descargar conversación" para chats.

**Empty states de la pestaña Transcripción**

Tres formas posibles cuando no hay transcripción para mostrar:

- **`<DecisionState>` — empty state con acción.** Una columna centrada vertical: icono pequeño, título, descripción, CTA primario y cost cue inline. Aparece cuando se puede pedir la transcripción ("Sin transcripción") o el análisis ("Lista para analizar"), o el caso combinado del dead-end resuelto ("Pendiente de transcribir y analizar").
- **`<ProcessingState>` — estado de procesamiento.** Una columna centrada con un spinner Loader2 girando, título corto en gerundio ("Transcribiendo", "Analizando") y un caption breve.
- **`<TerminalNote>` — estado terminal sin acción.** Para casos donde no hay nada que el supervisor pueda hacer ("No hay grabación de esta llamada", "Transcripción vacía"). Solo icono, título y descripción.

Decisión cerrada del producto: estos tres componentes son **una columna centrada**, no split-layout con preview o skeleton al lado. Si el supervisor ya sabe qué tipo de contenido va a aparecer (una transcripción, un análisis), un preview enmascarado al lado es decoración, no información.

**Bubbles tipo chat (en la pestaña Transcripción activa)**

Tanto chats como llamadas se renderizan con el mismo layout: bubbles alineados a izquierda y derecha, identificando al hablante por la posición.

| Lado | Quién | Background | Esquina asimétrica |
|---|---|---|---|
| Derecha | Agente, Speaker 1, o `conversation.origin` cuando se reconoce | Accent-soft (teal muy tintado) | `rounded-br-md` |
| Izquierda | Cliente o Speaker 2 | Border-soft (gris muy tintado) | `rounded-bl-md` |

El speaker label y el timestamp aparecen pequeños encima del bubble. Los bubbles tienen un máximo de 78% del ancho disponible. No hay avatares: la disposición ya transmite la diarización sin necesidad de añadir un círculo con icono.

**Sección Análisis**

- **Resumen.** Icono `<AlignLeft>` (líneas de texto). A la derecha del header de la sección, una pill discreta "Generado por IA" con un `<Sparkles>` muy pequeño. El resumen se deriva determinísticamente del id de la conversación (mismo hash que la transcripción), así que el resumen y el texto siempre cuentan la misma historia.
- **Sentimiento.** Icono `<TrendingUp>`. Un pequeño dot de color (verde / gris / amarillo) acompañando el label y un summary breve. La detección del sentimiento mira el léxico negativo dentro del propio texto de la transcripción, no las categorías IA.

### Copia exhaustiva (extracto representativo)

| Lugar | Texto |
|---|---|
| Title (llamada) | `Llamada · #{id}` |
| Title (chat) | `Chat · #{id}` |
| Subtitle | `{servicio} · {fecha} {hora} · Duración {duración}` |
| Tab 1 | `Transcripción` |
| Tab 2 | `Análisis` |
| Search placeholder | `Buscar en transcripción` |
| Counter | `{N} intervenciones` |
| Empty sin grabación | Title `No hay grabación de esta llamada` / desc `Sin audio no podemos transcribir. Revisa las reglas de grabación si esperabas que se hubiera guardado.` |
| Empty sin transcripción | Title `Sin transcripción` / desc `Genera el texto para buscar dentro de la conversación y dejar el análisis disponible.` / CTA `Transcribir` / cost `Genera coste · ~30 s` |
| Empty con análisis disponible | Title `Lista para analizar` / desc `Resumen accionable y valoración de sentimiento sobre la transcripción existente.` / CTA `Solicitar análisis` / cost `Genera coste · ~10 s` |
| Empty dead-end resuelto | Title `Pendiente de transcribir y analizar` / desc `El análisis necesita texto. Lanzamos la transcripción y, en cuanto termine, generamos resumen y sentimiento.` / CTA `Transcribir y analizar` / cost `Genera coste · transcripción + análisis` |
| Procesando transcripción | Title `Transcribiendo` / caption `Procesa el audio y separa los hablantes. Tarda unos segundos.` |
| Procesando análisis | Title `Analizando` / caption `Genera resumen y sentimiento a partir de la transcripción.` |
| Footer | `Cerrar` |

### Accesibilidad

- Modal con `role="dialog"`, `aria-modal="true"` y descripciones apropiadas vía Radix.
- La barra de scrub es un `role="slider"` con `aria-valuemin`, `aria-valuemax` y `aria-valuenow` actualizándose con la posición.
- Las tabs reciben el patrón estándar (Radix Tabs) con focus visible y subrayado claro al activo. El subrayado no es el único marcador: el peso y el color del texto también cambian, para no depender de color solo.
- Los botones icon-only del audio bar (back-10, play, fwd-10, download) tienen `aria-label` explícito describiendo su acción.

### Fuera de alcance

- No persiste posición del audio entre sesiones.
- No permite editar la transcripción inline.
- No exporta a otros formatos (solo descarga el audio o el texto crudo).
- No tiene control de volumen ni velocidad de reproducción. Es un reproductor mínimo.

### Checklist de QA

- [ ] El icono del header es `<Phone>` para llamadas y `<MessageSquare>` para chats.
- [ ] Para llamadas con grabación, el audio bar tiene controles activos. Para llamadas sin grabación, controles disabled (visibles).
- [ ] Para chats, el audio bar no se renderiza en absoluto.
- [ ] La tab por defecto es Transcripción si la hay; Análisis si solo hay análisis.
- [ ] Los empty states siguen el state machine descrito (ver el documento *Lógica de conteo*).
- [ ] Re-transcribir abre el modal de confirmación destructivo.
- [ ] Descargar es accesible para chat y llamada (paridad).
- [ ] Bubbles: agente a la derecha (accent-soft), cliente a la izquierda (border-soft).
- [ ] Search filtra intervenciones en vivo.
- [ ] El RecordingTimeline aparece solo si hay más de una grabación.
- [ ] Cierre con ESC, clic fuera y "Cerrar" funcionan.

---

## 3. RecordingTimeline

### Anatomía

Una sola barra horizontal segmentada, montada sobre la barra de audio del reproductor cuando la conversación tiene varias grabaciones.

```
Section (border-bottom hairline, padding 24/16)
└── Strip (56 píxeles de alto, rounded 6px, border 1px)
    ├── Segment 1 (anchura proporcional a su duración, mínimo 56px)
    │   ├── Label completo o número índice (según anchura disponible)
    │   └── Duration en font monoespacio
    ├── Segment 2
    └── Segment N
```

El strip es una sola unidad visual, no una rejilla de cards. Esto es deliberado: una conversación con tres tramos no es "tres cosas separadas" sino "una conversación con tres partes". El strip único transmite esa unidad.

### Estados visuales de cada segmento

Cuatro estados posibles, con colores tomados directamente del DS:

| Estado | Background | Color del label | Color de la duración |
|---|---|---|---|
| Inactivo | Surface blanca | Heading (texto principal) | Muted |
| Hover sobre inactivo | Surface-muted (gris muy sutil) | Heading | Muted |
| Activo | Info-soft (azul tintado) | Info-strong (azul) | Info-strong al 80% |
| Focus por teclado | Cualquiera de las anteriores + ring de focus accent | — | — |

Entre segmentos, un divider de 1 píxel en color border ayuda a separar visualmente cuando dos segmentos consecutivos están inactivos. Cuando uno está activo, el cambio de background ya separa por sí solo, pero el divider se mantiene por consistencia.

### Reglas de interacción

- **Click en un segmento.** Notifica al padre (`onSelect(id)`). El padre cambia el tramo activo y resetea el transporte del audio (`isPlaying: false`, `currentTime: 0`).
- **Hover sobre un segmento inactivo.** Background a surface-muted. Cursor pointer.
- **Navegación por teclado.** Con foco dentro del strip, las flechas izquierda/derecha (y arriba/abajo) cambian la selección al segmento adyacente. No hay wrap-around: en el primer segmento, izquierda no hace nada; en el último, derecha no hace nada. Coherente con que es una secuencia temporal, no una rueda.
- **Tooltip.** Solo aparece en segmentos cuyo label está reemplazado por un número (porque el segmento es muy estrecho). Muestra el label completo. Esto evita el ruido visual de tooltips redundantes en los segmentos donde el label ya se lee.

### Copia

El componente no tiene texto estático propio. Todos los textos vienen del modelo de la conversación: el label de cada grabación (que describe el grupo o paso del IVR — por ejemplo "Comercial", "Retención", "IVR menú principal") y la duración en formato `mm:ss`.

El `aria-label` de cada segmento, sin embargo, sí está construido por el componente y siempre incluye toda la información disponible:

```
Tramo {N}: {label completo}, {duración}, comienza a las {startTime}
```

### Tokens usados

| Categoría | Token |
|---|---|
| Background activo | `--sc-info-soft` (#EEF4FF) |
| Color del label/duración cuando activo | `--sc-info-strong` (#1464FE) |
| Background inactivo | `--sc-surface` (blanco) |
| Background hover | `--sc-surface-muted` |
| Border entre segmentos | `--sc-border` (#D3D5DA) |
| Border de la sección | `--sc-border-soft` (#F3F4F6) |
| Color del label inactivo | `--sc-text-heading` (#181D26) |
| Color de la duración inactiva | `--sc-text-muted` (#9499A3) |

### Accesibilidad

- El contenedor es `<div role="radiogroup" aria-label="Selecciona un tramo">`.
- Cada segmento es un `<button role="radio">` con `aria-checked` reflejando si es el seleccionado.
- El `aria-label` por segmento incluye el label completo siempre, incluso cuando el visible es solo el número índice. Un usuario de lector de pantalla nunca pierde información por la decisión visual.
- El `tabIndex` es 0 solo en el segmento activo; el resto vale -1. Esto sigue el patrón W3C de radiogroup: la navegación por Tab entra al grupo en el activo, y dentro del grupo se usa flechas. Estándar.

### Fuera de alcance

- No agrupa segmentos por color o por tipo de grupo. Todos los segmentos visualmente iguales en estructura.
- No muestra waveform del audio. Es un selector de tramo, no un editor.
- No permite reordenar tramos. El orden es el orden cronológico real de la conversación.

### Checklist de QA

- [ ] El componente solo se renderiza si hay más de una grabación.
- [ ] El segmento activo cambia background y color de texto.
- [ ] La anchura de cada segmento es proporcional a la duración real (un tramo de 3 minutos es claramente más ancho que uno de 30 segundos).
- [ ] Los segmentos con menos del 12% de anchura muestran solo el número índice; el label completo está accesible vía tooltip y `aria-label`.
- [ ] Hover sobre inactivo cambia el background.
- [ ] Click cambia el tramo activo y resetea el transporte del audio.
- [ ] Las flechas izquierda/derecha/arriba/abajo navegan entre segmentos.
- [ ] No hay wrap-around: las flechas en los extremos no hacen nada.

---

## 4. scToast

### Anatomía

Dos layouts según número de acciones.

**Layout horizontal (default — para 0 o 1 acción)**

```
[Icon en wrap circular] [Title         ] [Action label] [×]
                        [Message       ]
```

**Layout vertical (auto cuando hay dos acciones)**

```
[Icon] [Title              ]                              [×]
       [Message            ]
                              [secondaryAction]  [action]
```

El componente decide automáticamente qué layout usar — el consumidor no tiene que pensarlo.

### Variantes visuales

Cinco severidades por dos apariencias = diez variantes posibles. Todas usan el mismo patrón: fondo tintado (light) o sólido (solid), icono dentro de un wrap circular pequeño, contenido a la derecha, acciones inline o debajo según layout.

| Severity | Color base | Icono usado |
|---|---|---|
| `success` | Verde / teal | `<CheckCircle2>` |
| `error` | Rojo | `<XCircle>` |
| `warning` | Amber | `<AlertTriangle>` |
| `info` | Azul | `<Info>` |
| `indigo` | Indigo | `<Sparkles>` |

En **light**, el background es una versión muy tintada de la severity (por ejemplo, `--sc-error-soft` es un rojo muy claro, casi rosa) y el icono va en su color fuerte. En **solid**, el background es el color fuerte saturado y todos los textos van en blanco. Light se usa por defecto; solid se reserva para toasts que merecen llamar más la atención (típicamente errores críticos o estados sticky).

### Dimensiones y spacing

- Ancho default: **400 píxeles** (variable CSS `--sc-toast-width`).
- Ancho máximo: **480 píxeles**.
- Padding en todos los lados: 16 píxeles.
- Gap entre el icono y el contenido: 12 píxeles.
- Gap entre title y message: 8 píxeles.
- Border radius: 12 píxeles.

El ancho actual se eligió tras un ajuste: el ancho inicial (360) hacía que mensajes de error largos (típicamente "No se ha podido completar la acción: razón muy larga…") wrappeasen demasiadas veces y subían visualmente la altura del toast más de lo deseable. 400 con techo de 480 da margen sin convertir el toast en un cartel.

### Comportamiento

- **Auto-dismiss.** Por defecto a los 3000 ms. Pasar `Infinity` lo hace sticky.
- **Botón X.** Visible si `dismiss !== false`. Cierra el toast inmediatamente.
- **Acción inline.** Cierra el toast tras invocar el handler. El supervisor pulsa "Ver fallidas", el toast desaparece y la tabla se filtra.
- **Auto-promote a vertical.** Si hay `secondaryAction`, el layout pasa a vertical sin que el consumidor tenga que pedirlo.

### Copia

El componente no tiene strings propias — todo viene del consumidor. Sí define convenciones para los strings que recibe:

| Lugar | Convención |
|---|---|
| Title | Sentence case. Empieza por verbo o sustantivo concreto. Ejemplos: "Transcripción lista", "No se ha podido completar la acción". |
| Message | Frase completa, idealmente una sola línea. Si la línea es larga, debe wrappear con buen ritmo. |
| Action label | Verbo corto. Ejemplos: "Ver fallidas", "Reintentar", "Deshacer". |

### Accesibilidad

- El toast es un `<div role="status" aria-live="polite">`. Polite (no assertive) porque la mayoría de los toasts son confirmaciones, no alertas críticas que interrumpen.
- El botón de cerrar tiene `aria-label="Cerrar"`.
- El motor (sonner) respeta `prefers-reduced-motion` automáticamente para la entrada/salida del toast.

### Fuera de alcance

- No hay queue management visible para el usuario. Si llegan tres toasts a la vez, sonner los apila — el componente no los agrupa en un solo "tienes 3 notificaciones".
- No persiste entre recargas. Si el supervisor recarga la página, los toasts pendientes se pierden.

### Checklist de QA

- [ ] Las cinco severities renderizan con su color correcto en light y en solid.
- [ ] Con `duration: 3000`, el toast se cierra solo a los 3 segundos.
- [ ] Con `duration: Infinity`, el toast no se cierra solo y la X funciona.
- [ ] El botón X es visible y funcional cuando `dismiss === true`.
- [ ] Con dos acciones, el layout cambia automáticamente a vertical.
- [ ] Un mensaje largo wrappea en 2 o 3 líneas como mucho, no en 5.
- [ ] El padding y los gaps usan los tokens del DS, no valores hardcoded.

---

## Tokens compartidos del Smart Contact Design System

Los tokens viven en `src/styles/sc-design-system.css` y se exponen a Tailwind v4 como utilities (`bg-sc-primary`, `text-sc-heading`, `rounded-sc-md`, etc.).

### Color · subset crítico

Los colores que aparecen con más frecuencia en los componentes documentados:

| Token | Valor | Uso típico |
|---|---|---|
| `--sc-surface` | `#FFFFFF` | Fondo de modales, cards, surface principal. |
| `--sc-bg-canvas` | `#F4F6FC` | Fondo de la app (canvas detrás de los cards). |
| `--sc-surface-muted` | tinte ligero sobre canvas | Hover sutil, secciones secundarias. |
| `--sc-primary` (navy 600) | `#1B273D` | CTA primario, iconos clave, headers de marca. |
| `--sc-on-primary` | `#FFFFFF` | Texto que va sobre el primary. |
| `--sc-accent` (teal 300) | `#60D3E4` | Acento principal: subrayado de tabs, focus ring. |
| `--sc-accent-strong` (teal 600) | `#48B8C9` | Texto teal de énfasis (caption ON del bulk modal). |
| `--sc-accent-soft` (teal 50) | `#EEFBFD` | Background del bubble del agente en el chat de transcripción. |
| `--sc-text-heading` | `#181D26` | Títulos. |
| `--sc-text-body` | `#5C616B` | Texto de cuerpo. |
| `--sc-text-muted` | `#9499A3` | Captions, texto secundario. |
| `--sc-text-emphasis` | `#3C434D` | Hero numbers (negro ablandado, no puro). |
| `--sc-text-disabled` | `#797979` | Controles deshabilitados. |
| `--sc-cost-warn` (warning 600) | `#D97706` | Cue de coste (amber). |
| `--sc-border` | `#D3D5DA` | Bordes de containers. |
| `--sc-border-soft` | `#F3F4F6` | Hairlines, dividers. |
| `--sc-info-strong` | `#1464FE` | Active del RecordingTimeline; toast info solid. |
| `--sc-info-soft` | `#EEF4FF` | Background activo del RecordingTimeline; toast info light. |

Las severities del toast (`--sc-success-*`, `--sc-error-*`, `--sc-warning-*`, `--sc-indigo-*`) siguen el mismo patrón: cada una tiene una variante fuerte y una soft.

### Spacing · escala única para todo el producto

Una sola escala con prefijo `--sc-space-*`. Los tokens están en píxeles para que sean predecibles:

| Token | Valor |
|---|---|
| `--sc-space-50` | 2 px |
| `--sc-space-100` | 4 px |
| `--sc-space-150` | 6 px |
| `--sc-space-200` | 8 px |
| `--sc-space-250` | 10 px |
| `--sc-space-300` | 12 px |
| `--sc-space-400` | 16 px |
| `--sc-space-500` | 20 px |
| `--sc-space-600` | 24 px |
| `--sc-space-800` | 32 px |

Regla: en código nuevo, usar siempre estos tokens (`gap-[var(--sc-space-300)]`), no las clases raw de Tailwind (`gap-3`). Aunque coincidan en valor, los tokens permiten cambios globales coordinados si en el futuro se ajusta la escala.

### Tipografía

| Token | Valor | Uso |
|---|---|---|
| `--sc-font-size-xs` | 11 px | Captions, eyebrows, badges pequeños. |
| `--sc-font-size-sm` | 12 px | Body small, labels secundarios. |
| `--sc-font-size-body` (utility `text-sc-base`) | 14 px | Body default. |
| `--sc-font-size-md` | 16 px | Headings de sección, decision title del bulk. |
| `--sc-font-size-lg` | 18 px | Modal title. |
| `--sc-font-size-xl` | 21 px | Lead. |
| `--sc-font-size-display` | 112 px | Hero numbers (solo el bulk modal hoy). |

Familia tipográfica: Roboto (importada de Google Fonts). El cliente lo definió, no se debe sustituir sin discusión explícita.

Hay una particularidad técnica importante a tener presente cuando se combina `text-{size}` y `text-{color}` en una misma `cn()`: la utilidad `tailwind-merge` agrupa ambas bajo el mismo bucket `text-*` y mantiene solo la última, perdiendo silenciosamente la otra. La solución canónica es mover el `font-size` a un `style` inline (`style={{ fontSize: 'var(--sc-font-size-X)' }}`) y dejar el color en `cn()`. La regla aplica solo a clases que pasan por `cn()` — las className planas no tienen el problema.

### Radii

| Token | Valor | Uso |
|---|---|---|
| `--sc-radius-xs` | 2 px | — |
| `--sc-radius-sm` | 4 px | Pills pequeños, badges. |
| `--sc-radius-md` | 6 px | Botones. |
| `--sc-radius-lg` | 8 px | — |
| `--sc-radius-xl` | 12 px | Modales. |
| `--sc-radius-full` | 9999 px | Avatares, dots, switch knob. |

### Shadows

Dos tokens principales:

- `--sc-shadow-sm`: sombra sutil para cards y botones primarios. Da elevación sin gritar.
- `--sc-shadow-md`: sombra media para toasts solid. Mayor presencia.

Las sombras del producto son siempre legibles sobre canvas claro y nunca extremas. Las sombras tipo `drop-shadow-2xl` (muy difusas, muy oscuras) son la huella del *AI slop* que conviene evitar.

---

## Reglas transversales del DS

### Iconografía canónica

El producto usa iconos de la librería `lucide-react`, con estricta correspondencia uno-a-uno entre icono y significado. Si una sección equivalente reaparece en otro sitio del producto, debe usar el mismo icono.

| Icono lucide | Significado | Lugar canónico de uso |
|---|---|---|
| `<Sparkles>` | "Esto es generado por IA" | Pill discreta en el aside del Resumen del análisis. **Nunca como icono de sección o tab principal.** |
| `<AlignLeft>` | Body of text | Header del Bulk modal, sección Resumen del análisis. |
| `<FileText>` | Documento de transcripción | Tab Transcripción del player. |
| `<TrendingUp>` | Valoración / métrica | Sección Sentimiento del análisis. |
| `<Phone>` / `<MessageSquare>` | Canal de la conversación (channel-aware) | Header del player. |
| `<HelpCircle>` | Documentación / ayuda | Toolbar de filtros. |
| `<Mic>` | Grabación (regla) | Hero card del Repository. |
| `<Database>` / `<Tags>` | Entidades / Categorías | PrimaryCard del Repository. |
| `<Download>` | Descargar contenido visible | Tab row del player. |
| `<RotateCcw>` | Re-hacer (re-transcribir) | Tab row del player. |
| `<Loader2>` | Cargando (girando) | Botones submit, ProcessingState. |
| `<X>` / `<XCircle>` | Cerrar / error | Modal close, scToast error. |

Regla absoluta del producto: **cero emojis en cualquier interfaz**. El README y los documentos internos de markdown son la única excepción (no son interface). Si aparece un emoji dentro de un componente `.tsx`, es un bug y debe sustituirse por su equivalente lucide.

### Política de copy

Pequeñas reglas que mantienen consistente la voz del producto:

- **Imperativo conversacional para títulos**, no estado seco. Decir "Esta llamada todavía no se ha transcrito" en vez de "Sin transcripción disponible".
- **Gerundio para procesos activos**: "Transcribiendo…", "Analizando…". No "Transcripción en proceso".
- **Lowercase para cost cues y captions** in-cell ("genera coste", "todo procesado", "admiten análisis"). El uppercase queda reservado para labels estructurales ("TOTAL A PROCESAR", "ANÁLISIS").
- **La descripción explica el "por qué" antes que el "cómo"**. Antes de "Puedes solicitarla individualmente", se dice "Solicita la transcripción para activar la búsqueda dentro del audio".
- **Highlights como pills triple-eje** cuando aplican: qué pasa / qué desbloquea / qué cuesta.

### CTA primario unificado

En todo el producto hay un único patrón visual para el CTA primario, copiable directamente:

```
inline-flex items-center gap-2
bg-sc-primary text-sc-on-primary
px-4 py-2 rounded-sc-md shadow-sc-sm
hover:bg-sc-primary-hover
active:scale-[0.98] disabled:active:scale-100
disabled:cursor-not-allowed disabled:opacity-60
+ FOCUS_RING
```

Regla: **una sola vez por modal o panel**. Es el verbo principal: Procesar, Transcribir, Solicitar análisis, Guardar. No usar este patrón para navegación entre vistas (eso son cards o links) ni para confirmaciones destructivas (esas tienen su propio shape, con caja roja).

### Focus ring

La cadena exacta vive en una constante exportada (`FOCUS_RING` en `src/app/components/ui/focus.ts`):

```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sc-accent
focus-visible:ring-offset-2 focus-visible:ring-offset-sc-surface
```

Cualquier elemento interactivo (button, link, role="button", role="slider", search input) debe importar `FOCUS_RING` y aplicarlo. No reescribir la cadena en sitios nuevos.

Una excepción justificada: los inputs nativos `<input>` de búsqueda pueden usar `focus:ring-2 focus:ring-sc-accent/20` (sin `-visible`), porque al hacer clic en un input el focus es deliberado y un ring suave (20% alpha) lee mejor que el ring fuerte de navegación por teclado.

### Animaciones · solo `transform` y `opacity`

Regla repo-wide. Las propiedades que se pueden animar con `transition` son:

✅ Permitidas: `transform` (translate, scale, rotate) y `opacity`.
❌ Prohibidas con transition: `width`, `height`, `top`, `left`, `padding`, `margin`.

Razón: las propiedades de layout disparan reflow continuo en cada frame, lo que mata el rendimiento. `transform` y `opacity` solo afectan a la composición y son baratísimas en GPU.

Si un elemento necesita crecer o encoger, hay que escalar con `scaleX`/`scaleY` y compensar el contenido con `transform-origin`. Si necesita posicionarse, `translate`. Nunca cambiar `width` con `transition: width`.

### Anti layout-shift

Cuatro reglas para evitar que la UI baile cuando el estado cambia:

1. **Si un contenido aparece o desaparece a media interacción, reservar el espacio.** Usar `min-h` + `opacity-0` (no `display: none`, no `cond && (...)`). El cost tag del bulk modal es un ejemplo: cuando es C1, sigue ocupando el espacio pero invisible.
2. **`tabular-nums` por defecto** en cualquier counter, timestamp o ID que cambie de valor durante el uso. Sin esto, los dígitos respiran y los números al lado se mueven.
3. **CTAs con label dinámico necesitan `min-w` con el ancho del label más largo.** Por ejemplo, un botón que alterna entre "Transcribir" y "Procesando…" debe tener `min-w-[200px]`. Sin esto, el botón cambia de ancho cuando cambia el label y los elementos al lado bailan.
4. **Si el contenido cambia entre instancias** (por ejemplo, abrir el modal con una conversación diferente), no hace falta reservar — cada instancia es independiente.

### Modal de confirmación: solo para destructivo

Como se detalló en el `ConversationPlayerModal`, esta es una decisión cerrada del producto que afecta a todo el repo:

- Las operaciones que solo generan coste (transcribir/analizar por primera vez, exportar) se dispatchan directo desde el CTA, con la advertencia de coste inline.
- Las operaciones destructivas (sobrescribir, borrar, cancelar algo en curso) sí van con un modal de confirmación explícito.

El anti-patrón a evitar es "¿estás seguro?" antes de cada acción billable. Es click muerto que el supervisor interpreta como fricción y termina ignorando. Si el coste real (€) sube significativamente en algún flujo del futuro, el caso se reevalúa, pero la regla por defecto es la descrita.

---

*Si encuentras una discrepancia entre lo que dice este documento y lo que hace el código, prevalece el código y este documento es el que está obsoleto. Los ejemplos numéricos, las firmas y los hex deben verificarse en el repo cuando se actualice esta referencia.*
