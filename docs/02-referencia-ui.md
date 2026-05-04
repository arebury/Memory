---
title: Referencia de UI · estructura, interacción y tokens
subtitle: Anatomía, reglas de interacción, copy, animaciones, a11y y QA por componente
audience: UI dev, designer y QA
author: Rafael Areses
project: Memory · Smart Contact
updated: 2026-05-04
---

# Referencia de UI · estructura, interacción y tokens

> Cómo se ve, cómo se comporta, qué dice y cómo se verifica cada componente. Audiencia: quien implementa la UI o la valida visualmente. Para inputs/derivación/lógica de negocio, ver `01-logica-de-conteo.md`.

<small>Memory · Smart Contact · Por Rafael Areses</small>

---

## 1. BulkTranscriptionModal

### 1.1 · Anatomía

```
Modal (width 720px, surface bg-sc-surface, radius 8px)
├── Header
│   ├── Icon AlignLeft (text-sc-primary)
│   ├── Title "Transcripciones masivas"
│   ├── Subtitle "{nSelected} conversaciones seleccionadas[, breakdown por canal]"
│   └── Close (×, top-right)
├── Body (2 columnas, divider hairline central)
│   ├── Hero cell (left, 50%)
│   │   ├── Label "TOTAL A PROCESAR" (sc-base, font-semibold, uppercase)
│   │   ├── Number heroCount (112px, leading 112px, text-sc-emphasis, tabular-nums, animate-sc-pulse al cambiar)
│   │   ├── HeroDeltaHint "(de N seleccionadas)" si heroCount !== nSelected
│   │   └── Cost tag "genera coste" | "todo procesado" (text-sc-cost-warn lowercase)
│   └── Decision cell (right, 50%)
│       ├── Label "ANÁLISIS" (sc-base, font-semibold, uppercase)
│       ├── Title "Incluir análisis" (sc-md, semibold, color condicional)
│       ├── Switch checked × disabled (Radix Switch)
│       └── Caption "+{nAnBase} pendientes · genera coste" | "No hay nada que analizar"
└── Footer
    ├── Modal.Cancel "Cerrar" (ghost)
    └── Modal.Action "Procesar" (navy primary, deshabilitado si !canSubmit)
```

### 1.2 · Reglas de interacción

**Switch "Incluir análisis"**

| Condición | Click |
|---|---|
| `disabled === false` | `checked` se invierte. Ghost `+N`/`-N` sube sobre el número. Caption hace `animate-sc-pulse`. |
| `disabled === true` | `animate-sc-shake` 280ms. `checked` no cambia. |

**Botón "Procesar"**

- Click con `canSubmit === true` → dispatch `{ ids, doTranscription, includeAnalysis }` y cierra el modal.
- Click con `canSubmit === false` → ignorado (disabled).
- **No hay confirmación adicional**. El propio modal es la confirmación.

**Cierre**

X, "Cerrar", clic fuera del modal y Escape cierran sin lanzar nada.

**Post-submit**

Fire-and-forget (ver Doc A §1.6). El modal se cierra inmediatamente. Feedback vía `scToast` desde el padre.

**Manejo de errores**

`scToast.error({ title: "No se ha podido completar la acción", message: razón })`. El modal ya está cerrado; no reaparece. Reintento desde la pantalla.

### 1.3 · Copia exhaustiva

| Lugar | Texto | Notas |
|---|---|---|
| Title | `Transcripciones masivas` | Estática. |
| Subtitle | `{nSelected} conversaciones seleccionadas` | Si hay mezcla de canales: `{nSelected} conversaciones seleccionadas · {N} llamadas, {M} chats`. |
| Label izquierda | `TOTAL A PROCESAR` | Uppercase. |
| Hero number | `{heroCount}` | Tabular-nums. |
| HeroDeltaHint | `de {nSelected} seleccionadas` | Solo si `heroCount !== nSelected`. Reservado con `min-h` cuando ausente para evitar layout shift. |
| Cost tag (normal) | `genera coste` | Lowercase. Reservado con `opacity-0` cuando `isAllProcessed` para evitar shift. |
| Cost tag (vacío) | `todo procesado` | Solo cuando `isAllProcessed`. |
| Label derecha | `ANÁLISIS` | Uppercase. |
| Decision title | `Incluir análisis` | Semibold. Color: `text-sc-disabled` si `disabled`, `text-sc-heading` si activo. |
| Caption activa | `+{nAnBase} pendientes · genera coste` | Teal `text-sc-accent-strong`. |
| Caption disabled | `No hay nada que analizar` | Muted. |
| Botón ghost | `Cerrar` | (Era "Cancelar"; cambiado en 15.18 — pre-submit no hay nada que cancelar.) |
| Botón primario | `Procesar` | Navy filled. |

### 1.4 · Animaciones

| Animación | Detalle | Token |
|---|---|---|
| Bump del número al cambiar | `scale(1.03)` · 260ms · `--sc-ease-out` | `animate-sc-bump` |
| Pulse del hero | `scale(1.08)` · 360ms · `--sc-ease-out` | `animate-sc-pulse` |
| Ghost +N / -N | 21px semibold, cyan (positivo) o gris (negativo). 750ms. Sube 34px y fade out. | `animate-sc-delta-fly` |
| Pulse de la caption | `scale(1.08)` · 360ms al cambiar `checked` | `animate-sc-pulse` |
| Shake del switch (disabled) | `translateX` ±4px · 280ms · ease | `animate-sc-shake` |
| Apertura modal | Fade backdrop 200ms + `translateY(8→0)` 280ms | Radix Dialog default |
| Active scale del CTA | `active:scale-[0.98]` · `transition-transform` | — |

**Regla repo-wide** (sec 20.12 del canon): solo `transform` + `opacity`. NUNCA `width`, `height`, `top`, `left`, `padding`, `margin` con transition.

`prefers-reduced-motion`: desactivar ghost y pulse; dejar solo cambios de color y fade breve. (Pendiente como item del roadmap.)

### 1.5 · Tokens usados

| Categoría | Token | Valor |
|---|---|---|
| Surface modal | `--sc-surface` | `#FFFFFF` |
| Primary | `--sc-primary` (navy) | `#1B273D` |
| Hero text | `--sc-text-emphasis` | `#3C434D` |
| Cost warn | `--sc-cost-warn` | `#D97706` |
| Accent strong | `--sc-accent-strong` | `#48B8C9` |
| Border soft | `--sc-border-soft` | hairline divider |
| Hero font-size | `--sc-font-size-display` | `112px` |
| Hero line-height | `--sc-line-height-display` | `112px` (1:1 con el font-size) |
| Cell height | `--sc-bulk-cell-height` | `240px` |
| Cell padding-top | `--sc-bulk-cell-padding-top` | `28px` |
| Cell padding-x | `--sc-bulk-cell-padding-x` | `24px` |

### 1.6 · A11y

- Container: `role="dialog" aria-modal="true" aria-labelledby` apuntando al título.
- Hero number: `aria-live="polite"` para que los lectores anuncien cambios al togglear el switch.
- Switch: `role="switch"`, `aria-checked`, `aria-disabled` cuando aplica.
- Trap de foco dentro del modal mientras esté abierto (Radix gratis).
- Escape cierra (Radix gratis). Si `isLoading`, ESC bloqueado vía `onEscapeKeyDown`.
- Orden de tabulación: × → switch → Cerrar → Procesar.

### 1.7 · QA checklist

Por cada caso C1…C6 (y cada estado del toggle en C4/C6), verificar:

- [ ] El número grande coincide con la tabla de casuísticas (Doc A §1.3).
- [ ] Cost tag lee `genera coste` salvo en C1 (`todo procesado`).
- [ ] Switch interactivo solo en C2/C4/C5/C6. C1/C3 hacen shake al clicarlo.
- [ ] Procesar deshabilitado solo en C1.
- [ ] Subtítulo `{nSelected} conversaciones seleccionadas` correcto. Breakdown por canal cuando hay mezcla.
- [ ] HeroDeltaHint visible cuando `heroCount !== nSelected`.
- [ ] Ghost +N / -N aparece solo al togglear, no al cambiar de escenario.
- [ ] Cost tag no genera layout shift cuando se vacía (espacio reservado).
- [ ] Escape y clic fuera cierran el modal sin lanzar acción.
- [ ] Animaciones desactivadas con `prefers-reduced-motion: reduce`. *(Pendiente en código.)*

---

## 2. ConversationPlayerModal

### 2.1 · Anatomía

```
Modal (width 720px, surface blanca)
├── Header
│   ├── Icon channel-aware: <Phone> (llamada) | <MessageSquare> (chat)
│   ├── Title "{Llamada|Chat} · #{id}"
│   └── Subtitle "{servicio} · {fecha} {hora} · Duración {duración}"
├── Body
│   ├── RecordingTimeline (solo si recordings.length > 1) — ver §3
│   ├── Audio bar (solo llamadas)
│   │   └── back-10 · play · fwd-10 · timestamp · scrub · timestamp
│   ├── Tab row (Transcripción / Análisis + actions: re-transcribir, descargar)
│   └── Tab body (min-h 360px)
│       ├── Tab Transcripción
│       │   ├── Header: "{N} intervenciones" + search input
│       │   ├── Bubbles (chat-style: agente derecha, cliente izquierda)
│       │   └── Empty states: <DecisionState> | <ProcessingState> | <TerminalNote>
│       └── Tab Análisis
│           ├── Section Resumen (icon AlignLeft + aside "Generado por IA")
│           ├── Section Sentimiento (icon TrendingUp + dot color)
│           └── Empty states: <DecisionState> | <ProcessingState>
└── Footer
    └── Modal.Cancel "Cerrar"
```

### 2.2 · Empty states · una columna centrada

Tres componentes hermanos en `ConversationPlayerModal.tsx`. Patrón unificado tras 15.28 (canon sec 20.13):

**`<DecisionState>`** — empty state con acción.

```
Sección flex-col centrada vertical
├── Icon (24px, sc-muted)
├── Title (sc-md font-semibold, sc-heading)
├── Description (sc-sm sc-body, max-w 44ch)
├── CTA primario (navy filled, min-w 200px)
└── Cost cue (sc-xs sc-cost-warn, dot + texto)
```

**`<ProcessingState>`** — estado de procesamiento.

```
Sección flex-col centrada vertical
├── Loader2 24px spinning (text-sc-accent-strong)
├── Title (sc-md font-semibold)
└── Caption (sc-sm sc-body, max-w 44ch)
```

**`<TerminalNote>`** — estado terminal sin acción ("no hay grabación", "transcripción vacía").

```
Sección flex-col centrada vertical
├── Icon (24px, sc-muted)
├── Title (sc-md font-medium)
└── Description (sc-sm sc-body, max-w 42ch)
```

**Decisión validada (sec 20.13)**: NO usar split-layout con preview/skeleton al lado. Si el usuario ya sabe qué tipo de contenido va a aparecer (transcripción, análisis), el preview es ornamento decorativo. Una sola columna centrada lee mejor.

### 2.3 · Audio bar (solo llamadas)

Layout horizontal:

```
[← back 10s] [▶ play] [→ fwd 10s] [00:24] [━━━━━━━━━━━━━━] [01:43]
```

- Botones transport: `size-9` (36×36px), iconos lucide.
- Scrub bar: hit target 20px, `role="slider"` con `aria-valuemin/max/now`. Thumb circular aparece en hover/focus o mientras `isPlaying`.
- Fill animado vía `transform: scaleX()` con `transform-origin: left` (NO `transition-[width]`, evita reflow continuo).
- Thumb usa `left: %` SIN transition (snap instant).
- Botón download fuera del audio bar — vive en la tab row para paridad chat/llamada.

### 2.4 · Tab row · acciones a la derecha

```
[FileText Transcripción] [Sparkles Análisis]                  [↻ Re-transcribir] [↓ Descargar]
```

- Tabs: underline accent al activo (`bg-sc-accent`).
- Re-transcribir (icon `<RotateCcw>`, low-key): aparece solo si `hasTranscription`. Click abre `RetranscriptionConfirmModal` (gate destructivo — sobrescribe transcript + análisis).
- Descargar (icon `<Download>`): paridad chat/llamada. Tooltip: "Descargar audio" (llamada) | "Descargar conversación" (chat).

### 2.5 · Bubbles tipo chat

Layout para AMBOS canales (decisión 15.13 — chats y llamadas se leen igual visualmente):

| Lado | Quién | Background | Esquina asimétrica |
|---|---|---|---|
| Derecha | Agente / Speaker 1 / `conversation.origin` | `bg-sc-accent-soft` | `rounded-br-md` |
| Izquierda | Cliente / Speaker 2 | `bg-sc-border-soft` | `rounded-bl-md` |

Speaker label + timestamp encima del bubble. `max-w-[78%]`. Sin avatares (la disposición ya carga la diarización).

### 2.6 · Sección Análisis

**Resumen**:
- Icon `<AlignLeft>` (líneas de texto = body of text).
- Aside "Generado por IA" con `<Sparkles>` pequeño (sec 20.10: Sparkles SOLO para "AI-generated cue", nunca como icono de sección principal).
- Párrafo de resumen derivado del hash del id (mismo hash que la transcripción → coherencia narrativa garantizada).

**Sentimiento**:
- Icon `<TrendingUp>`.
- Dot color (verde / gris / amarillo) + label + summary.
- Detección de léxico negativo en el texto de la transcripción (no en `aiCategories` — sec 15.14).

### 2.7 · Copia exhaustiva (extracto)

| Lugar | Texto |
|---|---|
| Title llamada | `Llamada · #{id}` |
| Title chat | `Chat · #{id}` |
| Subtitle | `{servicio} · {fecha} {hora} · Duración {duración}` |
| Tab 1 | `Transcripción` |
| Tab 2 | `Análisis` |
| Search placeholder | `Buscar en transcripción` |
| Counter | `{N} intervenciones` |
| Empty no recording | `No hay grabación de esta llamada` / `Sin audio no podemos transcribir. Revisa las reglas de grabación si esperabas que se hubiera guardado.` |
| Empty no transcripción | `Sin transcripción` / `Genera el texto para buscar dentro de la conversación y dejar el análisis disponible.` / CTA `Transcribir` / cost `Genera coste · ~30 s` |
| Empty no análisis (canRequest) | `Lista para analizar` / `Resumen accionable y valoración de sentimiento sobre la transcripción existente.` / CTA `Solicitar análisis` / cost `Genera coste · ~10 s` |
| Empty dead-end | `Pendiente de transcribir y analizar` / `El análisis necesita texto. Lanzamos la transcripción y, en cuanto termine, generamos resumen y sentimiento.` / CTA `Transcribir y analizar` / cost `Genera coste · transcripción + análisis` |
| Procesando transcripción | `Transcribiendo` / `Procesa el audio y separa los hablantes. Tarda unos segundos.` |
| Procesando análisis | `Analizando` / `Genera resumen y sentimiento a partir de la transcripción.` |
| Footer | `Cerrar` |

### 2.8 · A11y

- Container: `role="dialog" aria-modal="true"`.
- Audio scrub: `role="slider"` + `aria-valuemin/max/now`.
- Tabs: foco con anillo `FOCUS_RING`. Subrayado accent al activo no es el único marcador (color heading + weight).
- StatusIcon (en tabla) como `<button>` con `aria-label` específico por estado.
- Botones icon-only del audio bar tienen `aria-label` explícito.

### 2.9 · QA checklist

- [ ] Apertura desde tabla: click en `<StatusIcon>` o en row abre el modal con la conversación correcta.
- [ ] Tab default: Transcripción si hay, Análisis si solo hay análisis.
- [ ] Audio bar oculto para chats. Visible para llamadas (con o sin grabación).
- [ ] Empty states: rendered según state machine (Doc A §2.2 / §2.3).
- [ ] Re-transcribir abre confirm modal con caja roja destructiva.
- [ ] Descargar accesible para chat y llamada (tab row).
- [ ] Bubbles: agente derecha (accent-soft), cliente izquierda (border-soft).
- [ ] Search filtra intervenciones en vivo.
- [ ] RecordingTimeline solo si `recordings.length > 1`.
- [ ] Cierre: ESC, clic fuera, "Cerrar" funcionan.

---

## 3. RecordingTimeline

### 3.1 · Anatomía

```
Section (border-b, bg-sc-surface, padding 24/16)
└── Strip horizontal (h 56px, rounded-md, border)
    ├── Segment 1 (flex-grow: fraction[0], min-w 56px)
    │   ├── Label (truncate, sc-sm font-medium) | Index number (fallback < 12%)
    │   └── Duration (font-mono sc-xs sc-muted)
    ├── Segment 2 (...)
    └── Segment N (...)
```

### 3.2 · Estados visuales

| Estado | Background | Label color | Duration color |
|---|---|---|---|
| Inactive | `bg-sc-surface` | `text-sc-heading` | `text-sc-muted` |
| Hover (inactive) | `bg-sc-surface-muted` | `text-sc-heading` | `text-sc-muted` |
| Active | `bg-sc-info-soft` | `text-sc-info-strong` | `text-sc-info-strong/80` |
| Focus (kbd) | + `FOCUS_RING` | — | — |

Divider entre segmentos: `border-r border-sc-border` 1px en todos menos el último.

### 3.3 · Comportamiento

- **Click** en segmento: dispatch `onSelect(id)` al padre. El padre actualiza `selectedRecordingId` + reset transport del audio bar.
- **Hover** en inactivo: cambia bg a `surface-muted`. Cursor pointer.
- **Keyboard**: ←/→/↑/↓ navegan + seleccionan. `tabIndex={0}` solo en activo.
- **Tooltip** (`title=`): solo en segmentos con label fallback (< 12%) — muestra label completo.

### 3.4 · Copia

Cero copy estático. Todos los textos vienen del modelo (`label`, `duration`, `startTime`).

`aria-label` por segmento: `Tramo {N}: {label}, {duración}, comienza a las {startTime}`.

### 3.5 · A11y

- `role="radiogroup"` en el contenedor con `aria-label="Selecciona un tramo"`.
- `role="radio"` + `aria-checked` en cada segmento.
- `aria-label` completo siempre (incluso cuando el label visible es solo el número).
- `tabIndex={0}` solo en el activo (patrón W3C — el resto es navegable con flechas, no con Tab).

### 3.6 · Tokens usados

| Categoría | Token |
|---|---|
| Active bg | `--sc-info-soft` |
| Active text | `--sc-info-strong` |
| Inactive bg | `--sc-surface` |
| Hover bg | `--sc-surface-muted` |
| Border | `--sc-border` (segmentos), `--sc-border-soft` (sección) |
| Heading | `--sc-text-heading` |
| Muted | `--sc-text-muted` |

### 3.7 · QA checklist

- [ ] Solo se renderiza si `recordings.length > 1`.
- [ ] Segmento activo cambia bg + text color.
- [ ] Anchura de cada segmento es proporcional a su duración real.
- [ ] Segmentos con `fraction < 12%` muestran solo número + tooltip + aria-label completo.
- [ ] Hover en inactivo cambia bg.
- [ ] Click cambia `selectedRecordingId` + reset audio transport.
- [ ] Flechas ←/→/↑/↓ navegan + seleccionan.
- [ ] No wrap-around (primero ← no hace nada; último → no hace nada).

---

## 4. scToast

### 4.1 · Anatomía

**Layout horizontal** (default, 1 acción o 0):

```
[Icon] [Title         ] [Action] [×]
       [Message       ]
```

**Layout vertical** (auto si 2 acciones):

```
[Icon] [Title         ]                [×]
       [Message       ]
              [secondaryAction] [action]
```

### 4.2 · Variantes visuales

5 severities × 2 appearances.

**Light** (default):
- Background: `bg-sc-{severity}-soft` (tinted soft)
- Border: `border-sc-{severity}-{strong|base}`
- Title: `text-sc-heading`
- Message: `text-sc-body`
- Icon wrap: `bg-sc-{severity}-strong/12`
- Icon: `text-sc-{severity}-strong`

**Solid** (filled fuerte):
- Background: `bg-sc-{severity}-strong` + `shadow-sc-md`
- Title/Icon: white
- Message: white/90

| Severity | Color base | Icon |
|---|---|---|
| `success` | green/teal | `<CheckCircle2>` |
| `error` | red | `<XCircle>` |
| `warning` | amber | `<AlertTriangle>` |
| `info` | blue/info | `<Info>` |
| `indigo` | indigo | `<Sparkles>` |

### 4.3 · Dimensiones

```
width: var(--sc-toast-width, 400px);
max-width: 480px;
padding: var(--sc-space-400);   /* 16px */
gap: var(--sc-space-300);        /* 12px entre icon y content */
gap (title/message): var(--sc-space-200);  /* 8px */
border-radius: rounded-sc-xl;
```

Ancho 400/480 introducido en 15.28 — el original (360) hacía wrappear demasiado los mensajes largos de error.

### 4.4 · Comportamiento

- Auto-dismiss después de `duration` ms (default 3000).
- `Infinity` → sticky.
- Botón X de cerrar visible si `dismiss !== false`.
- Acción inline (horizontal): cierra el toast tras invocar el handler.
- Auto-promote a vertical si hay `secondaryAction`.

### 4.5 · Copia

| Lugar | Convención |
|---|---|
| Title | Sentence case. Empieza por verbo o sustantivo concreto. Ejemplo: "Transcripción lista", "No se ha podido completar la acción". |
| Message | Frase completa. Una sola línea idealmente. |
| Action label | Verbo corto. Ejemplo: "Ver fallidas", "Reintentar", "Deshacer". |

### 4.6 · A11y

- Container: `role="status" aria-live="polite"`.
- Botón cerrar: `aria-label="Cerrar"`.
- Auto-dismiss respeta `prefers-reduced-motion` (sonner gratis).

### 4.7 · QA checklist

- [ ] Las 5 severities renderizan con su color correcto en light y solid.
- [ ] `duration: 3000` cierra solo a los 3s.
- [ ] `duration: Infinity` no se cierra solo.
- [ ] Botón X visible y funcional cuando `dismiss === true`.
- [ ] Auto-promote a vertical con dos acciones.
- [ ] Mensaje largo wrappea en 2-3 líneas máximo (no torre vertical).
- [ ] Padding y gaps usan tokens DS (no Tailwind raw `gap-3`).

---

## 5. Tokens compartidos

### 5.1 · Color (subset crítico)

| Token | Valor | Uso |
|---|---|---|
| `--sc-surface` | `#FFFFFF` | Background de modales/cards. |
| `--sc-bg-canvas` | `#F4F6FC` | Background de la app (canvas). |
| `--sc-surface-muted` | tint sobre canvas | Hover sutil, secciones secundarias. |
| `--sc-primary` (navy 600) | `#1B273D` | CTA primario. |
| `--sc-on-primary` | `#FFFFFF` | Texto sobre primary. |
| `--sc-accent` (teal 300) | `#60D3E4` | Acento (subrayado tabs, focus ring). |
| `--sc-accent-strong` (teal 600) | `#48B8C9` | Texto teal de énfasis. |
| `--sc-accent-soft` (teal 50) | `#EEFBFD` | Background acento muy soft. |
| `--sc-text-heading` | `#181D26` | Títulos. |
| `--sc-text-body` | `#5C616B` | Body text. |
| `--sc-text-muted` | `#9499A3` | Secondary text, captions. |
| `--sc-text-emphasis` | `#3C434D` | Hero numbers (display, ablandado del black puro). |
| `--sc-text-disabled` | `#797979` | Disabled controls. |
| `--sc-cost-warn` (warning 600) | `#D97706` | Cue de coste (amber). |
| `--sc-border` (surface 200) | `#D3D5DA` | Borders de containers. |
| `--sc-border-soft` (surface 100) | `#F3F4F6` | Hairlines, dividers. |
| `--sc-info-strong` (info 600) | `#1464FE` | Active del RecordingTimeline; toast info Solid. |
| `--sc-info-soft` (info 50) | `#EEF4FF` | Active bg del RecordingTimeline; toast info Light. |
| `--sc-success-*` | greens | Toast success. |
| `--sc-error-*` | reds | Toast error. |
| `--sc-warning-*` | ambers | Toast warning. |
| `--sc-indigo-*` | indigos | Toast indigo (cue IA). |

**Source of truth**: `src/styles/sc-design-system.css`.

### 5.2 · Spacing scale

| Token | Valor |
|---|---|
| `--sc-space-50` | 2px |
| `--sc-space-100` | 4px |
| `--sc-space-150` | 6px |
| `--sc-space-200` | 8px |
| `--sc-space-250` | 10px |
| `--sc-space-300` | 12px |
| `--sc-space-400` | 16px |
| `--sc-space-500` | 20px |
| `--sc-space-600` | 24px |
| `--sc-space-800` | 32px |

**Regla**: en código nuevo usar SIEMPRE estos tokens (`gap-[var(--sc-space-300)]`), no Tailwind raw (`gap-3`). Aunque coincidan en valor, los tokens permiten cambios globales coordinados.

### 5.3 · Type scale

| Token | Valor | Uso |
|---|---|---|
| `--sc-font-size-xs` | 11px | Captions, eyebrows, badges. |
| `--sc-font-size-sm` | 12px | Body small, labels secundarios. |
| `--sc-font-size-body` (utility `text-sc-base`) | 14px | Body default. |
| `--sc-font-size-md` | 16px | Headings de sección, decision title. |
| `--sc-font-size-lg` | 18px | Modal title (DS h4). |
| `--sc-font-size-xl` | 21px | Lead. |
| `--sc-font-size-display` | 112px | Hero numbers (Bulk modal). |

**Política twMerge** (sec 15.15 + 20.X del canon): cuando combines `text-{size}` + `text-{color}` en `cn()`, mover el font-size a `style={{ fontSize: 'var(--sc-font-size-X)' }}`. `cn()/twMerge` colapsa ambas clases en la misma key y pierde la de tamaño silenciosamente.

### 5.4 · Radii

| Token | Valor | Uso |
|---|---|---|
| `--sc-radius-xs` | 2px | — |
| `--sc-radius-sm` | 4px | Pills pequeños, badges. |
| `--sc-radius-md` | 6px | Botones. |
| `--sc-radius-lg` | 8px | — |
| `--sc-radius-xl` | 12px | Modal (`rounded-sc-xl`). |
| `--sc-radius-full` | 9999px | Avatares, dots, switch knob. |

### 5.5 · Shadows

| Token | Valor |
|---|---|
| `--sc-shadow-sm` | sutil |
| `--sc-shadow-md` | medio (toasts solid) |

Sombras tienen que ser legibles en light bg. NO usar shadow extremos tipo "drop-shadow-2xl" (es AI tell).

---

## 6. Reglas transversales

### 6.1 · Iconografía canónica

Un icono = un significado. Si reaparece una sección equivalente, usar el mismo.

| Icono lucide | Significado | Lugar canónico |
|---|---|---|
| `<Sparkles>` | "Esto es generado por IA" | Pill aside del Resumen. **NUNCA** como icono de sección/tab. |
| `<AlignLeft>` | Body of text | Header del Bulk modal, sección Resumen del análisis. |
| `<FileText>` | Documento de transcripción | Tab Transcripción del player. |
| `<TrendingUp>` | Valoración / métrica | Sección Sentimiento. |
| `<Phone>` / `<MessageSquare>` | Canal de la conversación | Header del player (channel-aware). |
| `<HelpCircle>` | Documentación / ayuda | Toolbar de filtros. |
| `<Mic>` | Grabación (regla) | Hero card de Reglas. |
| `<Database>` / `<Tags>` | Entidades / Categorías | PrimaryCard del Repository. |
| `<Download>` | Descargar contenido visible | Audio bar y tab row del player. |
| `<RotateCcw>` | Re-hacer (re-transcribir) | Tab row del player. |
| `<Loader2>` | Cargando | Botones submit, ProcessingState. |
| `<X>` / `<XCircle>` | Cerrar / error | Modal close, scToast error. |

**Regla absoluta** (sec 20.10): cero emojis en cualquier interface. Si aparece uno en `src/app/components/*.tsx`, es bug. Mapeo emoji → lucide en canon sec 20.10.

### 6.2 · Política de copy

- **Imperativo conversacional para títulos** ("Esta llamada todavía no se ha transcrito"), no estado seco ("Sin transcripción disponible").
- **Gerundio para procesos activos** ("Transcribiendo…", "Analizando…"), no estado pasado ("Transcripción en proceso").
- **Lowercase para cost cues y captions** in-cell ("genera coste", "todo procesado", "admiten análisis"). Uppercase reservado a labels estructurales ("TOTAL A PROCESAR", "ANÁLISIS").
- **Descripción explica el "por qué" antes que el "cómo"**.
- **Highlights como pills triple-eje** (cuando aplican): qué pasa / qué desbloquea / qué cuesta.

### 6.3 · CTA primario único

**Shape canónico** del CTA primario (todo el repo):

```tsx
<button
  className={cn(
    "inline-flex items-center gap-2 rounded-sc-md bg-sc-primary px-4 py-2 shadow-sc-sm",
    "font-medium text-sc-on-primary transition-all",
    "hover:bg-sc-primary-hover",
    "active:scale-[0.98] disabled:active:scale-100",
    "disabled:cursor-not-allowed disabled:opacity-60",
    FOCUS_RING,
  )}
>
  {icon}
  {label}
</button>
```

**Regla**: una sola vez por modal/panel. Es el verbo principal (Procesar, Transcribir, Solicitar análisis, Guardar). NO usar para navegación entre vistas (eso son cards/links) ni para confirmaciones destructivas (esas son `Modal.Cancel` con texto rojo cuando exista).

### 6.4 · Focus ring

**Source of truth**: `src/app/components/ui/focus.ts`.

```ts
export const FOCUS_RING = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sc-accent focus-visible:ring-offset-2 focus-visible:ring-offset-sc-surface"
```

Cualquier elemento interactivo (button, link, role="button" div, role="slider", search input) debe importar `FOCUS_RING` y aplicarlo. NO re-escribir la cadena en sitios nuevos.

### 6.5 · Animaciones · solo `transform` + `opacity`

Regla repo-wide (sec 20.12 del canon).

✅ Permitido: `scale`, `translate`, `rotate`, `opacity`.
❌ Prohibido: `width`, `height`, `top`, `left`, `padding`, `margin` con `transition`.

Si necesitas crecer/encoger un elemento, usa `scaleX/Y` con `transform-origin`. Si necesitas posicionar, `translate`.

### 6.6 · Anti layout-shift

- Contenido que aparece/desaparece mid-interacción → reservar `min-h` + `opacity-0`. NO `cond && (...)`.
- Counters / timestamps / IDs que cambian → `tabular-nums` siempre.
- CTAs con label dinámico → `min-w-[Npx]` con N = ancho del label más largo.
- Si el contenido cambia entre instancias (open/close del modal con datos distintos) → no reservar, cada open es independiente.

### 6.7 · Modal de confirmación: solo destructivo

Decisión 15.28 (sec 20.14):

- **Solo "genera coste"** → dispatch directo desde el CTA. Cost cue inline cubre el rol de advertencia.
- **Sobrescribe / borra / cancela** → modal de confirmación explícito con caja roja.

Anti-patrón: añadir "¿estás seguro?" antes de cualquier acción billable. Es click muerto que el usuario interpreta como fricción. Si el coste real (€) sube significativamente en el futuro, reevaluar caso por caso.
