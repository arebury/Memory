---
title: Lógica de conteo y reglas de negocio
subtitle: Qué inputs necesita cada componente, qué deriva, qué dispatcha
audience: Backend, data engineer y frontend coordinando contrato
author: Rafael Areses
project: Memory · Smart Contact
updated: 2026-05-04
---

# Lógica de conteo y reglas de negocio

> Qué datos necesita cada componente, cómo los deriva en estado de UI, y qué dispatcha. Audiencia: quien implementa el backend o el contrato de datos del frontend. Para la parte visual y de interacción, ver `02-referencia-ui.md`.

<small>Memory · Smart Contact · Por Rafael Areses</small>

---

## Componentes documentados

| Componente | Archivo en repo | Estado |
|---|---|---|
| `BulkTranscriptionModal` | `src/app/components/BulkTranscriptionModal.tsx` | v26 (cell-height 200, hero 88px) |
| `ConversationPlayerModal` | `src/app/components/ConversationPlayerModal.tsx` | Empty states a una columna (15.28) |
| `RecordingTimeline` | `src/app/components/RecordingPicker.tsx` | Strip único proporcional (15.29) |
| `scToast` | `src/app/components/ui/sc-toast.tsx` | API estable; ancho 400/480 (15.28) |

---

## 1. BulkTranscriptionModal

Modal de confirmación para procesar conversaciones en bloque — transcripción y/o análisis. Se abre cuando el usuario selecciona varias conversaciones desde la tabla y dispara la acción de procesar.

Su trabajo:
1. Confirmar exactamente **cuántas** conversaciones se van a procesar.
2. Permitir decidir si **incluye análisis** (cuando hay decisión real que tomar).
3. Avisar de que la acción **genera coste**.
4. Bloquear el botón primario cuando no hay nada que ejecutar.

**No es** un orquestador — no muestra progreso, no permite editar la selección.

### 1.1 · Contrato de datos

El componente necesita conocer, para la selección actual, cuatro contadores. La API que los produzca es libre; lo importante es que sean MECE.

| Contador | Significado |
|---|---|
| `nSelected` | Total de conversaciones seleccionadas. Incluye todo lo demás. |
| `nTrans` | Conversaciones que aún necesitan transcripción. |
| `nAnBase` | Conversaciones que aún necesitan análisis (tengan o no transcripción). |
| `nAlready` | Conversaciones ya procesadas por completo (transcritas y analizadas). |

**Invariante clave**: una conversación puede contarse en `nTrans` y en `nAnBase` simultáneamente si le faltan ambas cosas. **No son conjuntos disjuntos.** `nSelected = nAlready + (conversaciones a las que les falta algo)`.

El componente solo lee `nTrans`, `nAnBase`, `nAlready` y `nSelected`. No necesita saber qué conversación es cuál.

### 1.2 · Derivación de la UI

Toda la UI se deriva de tres valores calculados a partir de los contadores.

**(a) Estado del switch "Incluir análisis"**

El switch tiene dos dimensiones ortogonales: `checked` (encendido) y `disabled` (interactividad).

```
disabled = (nAnBase === 0)
checked  = disabled ? false : userOn
```

El valor inicial de `userOn` depende del escenario, para ofrecer el default útil:

```
userOn_initial = (nTrans === 0 && nAnBase > 0) ? true : false
```

Es decir, cuando lo único pendiente es análisis (casos C2, C5), el switch abre encendido. El usuario puede apagarlo; si lo hace, `heroCount` cae a 0 y "Procesar" se deshabilita. **No se le obliga a mantenerlo encendido.**

Caption bajo el switch:
- `disabled === true` → "No hay nada que analizar"
- `disabled === false` → `+{nAnBase} pendientes · genera coste`

**(b) `heroCount` — el número grande**

```
heroCount = checked ? nTrans + nAnBase : nTrans
```

Es el número grande de la cell izquierda y representa lo que se va a ejecutar al confirmar.

**(c) `canSubmit` — habilita el botón "Procesar"**

```
canSubmit = heroCount > 0
```

Único caso donde es `false`: C1 (nada pendiente).

### 1.3 · Casuísticas (MECE)

Seis combinaciones de datos. Cada una determina una casuística concreta. Los ejemplos numéricos son los que usa el prototipo:

| Caso | nSelected | nTrans | nAnBase | nAlready | checked (inicial) | disabled | heroCount (inicial) | canSubmit |
|---|---|---|---|---|---|---|---|---|
| **C1** | 24 | 0 | 0 | 24 | false | true | 0 | no |
| **C2** | 17 | 0 | 14 | 3 | true | false | 14 | sí |
| **C3** | 12 | 10 | 0 | 2 | false | true | 10 | sí |
| **C4** | 18 | 8 | 6 | 4 | false | false | 8 (→14 si on) | sí |
| **C5** | 11 | 0 | 9 | 2 | true | false | 9 (→0 si off) | sí |
| **C6** | 19 | 7 | 9 | 3 | false | false | 7 (→16 si on) | sí |

Solo **C4 y C6** tienen `heroCount` que cambia en vivo cuando el usuario toca el interruptor.

**Cómo se lee cada caso**:

- **C1** — Ya estaba todo hecho. Switch deshabilitado. Procesar deshabilitado.
- **C2** — Transcripciones hechas; solo queda analizar 14. Switch abre `on` por default. El usuario puede apagarlo, pero `heroCount` cae a 0 y Procesar se deshabilita.
- **C3** — Transcripciones pendientes, pero de estas conversaciones no se puede analizar (e.g. chat-only u otra regla). Switch deshabilitado; Procesar procesa solo transcripciones.
- **C4** — Ambas cosas pendientes. Switch abre `off`. El usuario decide.
- **C5** — Solo chats, que no se transcriben pero sí se analizan. Mismo patrón que C2.
- **C6** — Mezcla de llamadas y chats, ambas con análisis pendiente. Mismo patrón que C4.

### 1.4 · Variantes Figma → código

Dos propiedades en el component set: `Scenario` × `Analysis`. 8 combinaciones definidas.

|  | Analysis=None | Analysis=Off | Analysis=On |
|---|---|---|---|
| **C1** | ✓ | | |
| **C2** | | | ✓ |
| **C3** | ✓ | | |
| **C4** | | ✓ | ✓ |
| **C5** | | | ✓ |
| **C6** | | ✓ | ✓ |

En código `Analysis` se descompone en dos booleanos:

| Figma `Analysis` | `checked` | `disabled` |
|---|---|---|
| None | false | true |
| Off | false | false |
| On | true | false |

`Analysis=On` se usa igual en C2/C5 (default inicial) que en C4/C6 (clic del usuario). Misma pinta, misma semántica.

### 1.5 · Concurrencia · conversaciones en proceso

Una vez se confirma "Procesar", las conversaciones afectadas entran en estado "en proceso" en el listado. Pueden pasar minutos hasta que terminen. Durante ese tiempo, el usuario puede seguir trabajando y seleccionar nuevas conversaciones para lanzar otra acción en masa.

Para evitar disparar acciones duplicadas sobre items en vuelo:

- **En vista individual** — la conversación en proceso no es seleccionable. La fila se bloquea visualmente (spinner o badge "en proceso") y no responde al clic.
- **En selección masiva** — las conversaciones en proceso se deseleccionan **silenciosamente** antes de abrir el modal. El usuario las ve en la fila con el indicador "en proceso", pero no forman parte de la nueva selección.

**Consecuencia para este modal**: nunca recibe conversaciones en vuelo. El filtrado ocurre upstream (vista de listado + store). Los contadores `nTrans` / `nAnBase` / `nAlready` siguen representando solo estado pendiente o finalizado. **No hay un contador adicional "en proceso"** — eso es responsabilidad del listado, no del modal.

### 1.6 · Dispatch al confirmar

Al hacer clic en "Procesar" con `canSubmit === true`:

```
dispatch({
  ids: <eligibleIds>,
  doTranscription: nTrans > 0,
  includeAnalysis: checked,
})
```

Donde `eligibleIds` se clasifica upstream en `ConversationsView.handleBulkConfirm` en dos buckets:

- `needsTranscription` — IDs sin transcripción. Pasan por el chain (transcribir → analizar si `includeAnalysis`).
- `alreadyTranscribed` — IDs ya transcritos pero sin análisis. Si `includeAnalysis`, se mandan directos a `handleRequestAnalysis`.

**Modelo de error**:
- Si el backend rechaza la acción → `scToast.error({ title: "No se ha podido completar la acción", message: razón })`. El modal ya está cerrado en ese punto; no reaparece.
- El usuario puede reintentar desde la misma pantalla.

**Fire-and-forget**: el modal se cierra inmediatamente al dispatch, sin esperar respuesta del backend. El feedback (éxito o fallo) llega vía toast. No hay barra de progreso en el modal.

---

## 2. ConversationPlayerModal

Modal por conversación. Se abre al clicar el `<StatusIcon>` en la columna Estado de la tabla. Permite reproducir audio (si es llamada), ver transcripción tipo chat, y consultar el panel de análisis (resumen + sentimiento).

### 2.1 · Invariantes globales del modelo

Centralizadas en `normalizeChats(list)` de `src/app/data/mockSamples.ts`:

1. `channel === "chat"` ⇒ `hasTranscription === true` + `transcription[]` poblado.
2. `hasAnalysis === true` ⇒ `hasTranscription === true`. Si no, baja `hasAnalysis: false` y limpia `aiCategories`.

**Cualquier código que mute `Conversation` debe pasar por estas reglas o respetarlas en su propio path.** `handleRequestAnalysis` en `ConversationsView` filtra targets sin transcripción antes de actuar (capa de defensa adicional).

### 2.2 · State machine · tab Transcripción

Orden de evaluación (primer match gana):

| Condición | Estado | Componente render |
|---|---|---|
| `isProcessing === true` | Procesando | `<ProcessingState title="Transcribiendo">` |
| `!hasRecording && channel === "llamada"` | Sin grabación | `<TerminalNote title="No hay grabación de esta llamada">` |
| `!hasTranscription` | Empty actionable | `<DecisionState title="Sin transcripción" cost="Genera coste · ~30 s">` |
| `transcription.length === 0` | Empty terminal | `<TerminalNote title="Transcripción vacía">` |
| else | Activo | Lista de bubbles + search input |

### 2.3 · State machine · tab Análisis

| Condición | Estado | Componente render |
|---|---|---|
| `isAnalyzing && !hasAnalysis` | Procesando | `<ProcessingState title="Analizando">` |
| `!hasAnalysis && !canRequest` (sin transcripción) | Dead-end resuelto | `<DecisionState title="Pendiente de transcribir y analizar" action="Transcribir y analizar" cost="Genera coste · transcripción + análisis">` |
| `!hasAnalysis && canRequest` | Empty actionable | `<DecisionState title="Lista para analizar" action="Solicitar análisis" cost="Genera coste · ~10 s">` |
| else | Activo | Sección Resumen + sección Sentimiento |

Donde `canRequest = hasTranscription || isChat`.

### 2.4 · Chain event-driven · transcribir → analizar

El CTA combinado "Transcribir y analizar" del dead-end de Análisis dispara dos mutaciones que **NO pueden ocurrir en paralelo** (la segunda depende del resultado de la primera).

La implementación canónica usa una queue + effect en el padre (`ConversationsView`):

```
const [chainAnalysisIds, setChainAnalysisIds] = useState<string[]>([]);

const handleRequestTranscriptionAndAnalysis = (ids) => {
  setChainAnalysisIds(prev => [...prev, ...ids]);
  handleRequestTranscription(ids);
};

useEffect(() => {
  if (chainAnalysisIds.length === 0) return;
  const ready = chainAnalysisIds.filter(id =>
    conversations.find(c => c.id === id)?.hasTranscription
  );
  if (ready.length === 0) return;
  setChainAnalysisIds(prev => prev.filter(id => !ready.includes(id)));
  handleRequestAnalysis(ready);
}, [conversations, chainAnalysisIds]);
```

**Propiedades**:
- Robusto a re-renders del padre.
- Robusto a múltiples IDs en flight (cada uno se drena cuando su transcripción individual completa).
- Cuando llegue backend real: sustituir `handleRequestTranscription` (mutación con `setTimeout`) por una promesa real. La queue + effect sigue funcionando igual.

**Anti-patrón evitado**: `setTimeout(onRequestAnalysis, 6500)` dentro del player. Bug en 15.20: capturaba `onRequestAnalysis` con closure stale; el filter de elegibilidad veía estado anterior.

### 2.5 · Modal de confirmación: solo para destructivo

Decisión validada en 15.28 (canon sec 20.14):

- **Operaciones que solo generan coste** (transcribir/analizar por primera vez, exportar): dispatch directo desde el CTA. La advertencia inline (`Genera coste · ~30 s`) cubre el rol de "consent". El toast de éxito al terminar cierra el loop.
- **Operaciones destructivas** (sobrescriben datos): SÍ van con modal de confirmación explícito. Único superviviente en el player: `RetranscriptionConfirmModal` (re-transcribir sobrescribe transcript + análisis derivado).

`TranscriptionRequestModal.tsx` fue borrado en 15.28.

### 2.6 · Multi-recording

Si `conversation.recordings.length > 1`, se renderiza `<RecordingTimeline>` sobre el audio bar. Estado controlado:

- `selectedRecordingId: string | null`. Default: `recordings[0].id`.
- Al seleccionar otro: `setIsPlaying(false) + setCurrentTime(0)` (reset transport).
- `totalDuration` para el audio bar usa la duración del segmento seleccionado, no la total agregada.

Lógica de cálculo proporcional: ver §3 abajo.

---

## 3. RecordingTimeline

Selector de tramo para conversaciones multi-grabación (transferencias entre grupos vía IVR generan N grabaciones por conversación). Renderizado solo cuando `recordings.length > 1`.

### 3.1 · Cálculo de anchuras proporcionales

```
durations[i] = parseDurationSec(recordings[i].duration)
total        = sum(durations)
fraction[i]  = durations[i] / total
```

Cada segmento se renderiza con:

```css
flex-grow: fraction[i];
flex-basis: 0;
min-width: 56px;
```

El `flex-grow` proporcional + `flex-basis: 0` reparte el espacio disponible exactamente en proporción a la duración real. El `min-width: 56px` evita que segmentos muy cortos sean inclickables.

### 3.2 · Threshold de label · 12%

Si `fraction[i] < 0.12`, el segmento no muestra el label de texto — fallback a:
- Número índice (`{i+1}`) en el sitio del label.
- Tooltip nativo (`title={label}`) con el label completo.
- `aria-label` con tramo + label + duración + hora de inicio.

**Why**: por debajo de 12% (~75px en un strip de 600px) el truncate del label produce 3-4 caracteres ("IVR…", "Com…") que no aportan info. El número + tooltip es más honesto.

### 3.3 · Selección y dispatch

Modelo: `role="radiogroup"` + cada segmento `role="radio"`.

- `selectedId` controlado por el padre (`ConversationPlayerModal`).
- `onSelect(id)` notifica el cambio. El padre actualiza `selectedRecordingId` + reset del audio transport.
- `tabIndex={0}` SOLO en el activo (patrón estándar W3C ARIA).

### 3.4 · Navegación por teclado

Dentro del radiogroup:

| Tecla | Acción |
|---|---|
| `→` o `↓` | Mover selección al siguiente |
| `←` o `↑` | Mover selección al anterior |

No hay wrap-around (en el primero, `←` no hace nada; en el último, `→` no hace nada). Patrón coherente con segmentos de duración (no son una rueda).

### 3.5 · Edge cases

- **1 sola grabación** — el componente no se renderiza. Lo gatea el padre.
- **Anchura del strip insuficiente para todos los `min-width: 56px`** — `overflow-hidden` clipa segmentos. Aceptable porque la realidad del producto es 2-5 tramos por conversación; si llega un sample con 12+, considerar `overflow-x-auto modal-scrollbar` o redibujo.
- **Duración total = 0** — `total || 1` evita división por cero.

---

## 4. scToast

Componente de toast propio (Figma DS node `1050:355`) montado sobre `sonner`. API limpia para 5 severities × 2 appearances × 2 layouts.

### 4.1 · API

```ts
scToast.success({ title, message, action, secondaryAction, duration, layout, appearance, dismiss })
scToast.error({ ... })
scToast.warning({ ... })
scToast.info({ ... })
scToast.indigo({ ... })
scToast.dismiss(id?)
```

| Prop | Tipo | Default | Significado |
|---|---|---|---|
| `title` | `string?` | — | Línea principal, semibold. |
| `message` | `string?` | — | Línea de detalle, regular. |
| `action` | `{ label, onClick }?` | — | Botón primario inline. |
| `secondaryAction` | `{ label, onClick }?` | — | Botón secundario. Promueve a layout vertical si está presente con `action`. |
| `duration` | `number \| Infinity` | `3000` | Auto-dismiss en ms. `Infinity` = sticky. |
| `layout` | `'horizontal' \| 'vertical'` | `'horizontal'` | Auto-promote a vertical con dos acciones o sin título. |
| `appearance` | `'light' \| 'solid'` | `'light'` | Soft tint vs filled fuerte. |
| `dismiss` | `boolean` | `true` | Mostrar la X de cerrar. |
| `id` | `string \| number?` | — | Stable id para programmatic update/dismiss. |

### 4.2 · Cuándo usar cada severity

| Severity | Cuándo |
|---|---|
| `success` | Operación que terminó OK y el usuario puede confirmarlo. Ejemplo: "Transcripción lista". |
| `error` | Fallo que requiere atención del usuario. Suele ir con `action` para reintentar o ver fallidas. |
| `warning` | Atención requerida pero no bloqueante. Ejemplo: "10 conversaciones omitidas porque están en proceso". |
| `info` | Info contextual sin acción. Ejemplo: "Filtro aplicado". |
| `indigo` | Cue de feature/IA. Reservado para acciones que requieren highlight (no overuse). |

### 4.3 · Auto-promote a layout vertical

El layout `horizontal` no cabe cómodamente con dos acciones. La promoción a vertical es automática:

```
effectiveLayout = layout === 'vertical' || (action && secondaryAction)
                  ? 'vertical' : 'horizontal'
```

Razón: forzar al consumidor a recordar cuándo usar vertical es ruido. La presencia de `secondaryAction` ya implica que hace falta más espacio.

### 4.4 · Dimensiones y spacing

- Ancho default: `400px` (`--sc-toast-width: 400px`).
- Ancho max: `480px`.
- Padding: `var(--sc-space-400)` (16px) en todos los lados.
- Gap interno (icon → content): `var(--sc-space-300)` (12px).
- Gap title ↔ message: `var(--sc-space-200)` (8px).

Decisión 15.28: el ancho original (360px) hacía que mensajes largos de error wrapearan demasiadas veces y subían la altura del toast. 400/480 da margen sin volverse "larguísimo". El gap title↔message subió de 4px a 8px para que el mensaje se lea como párrafo separado, no como continuación de la línea de título.

### 4.5 · Reglas de ciclo de vida

- Default `duration: 3000` (3 segundos). Suficiente para un cue, no entorpece.
- Toasts con `action` **deben** ser sticky o muy largos (≥ 7000ms): si el usuario no llega a verlos antes del auto-dismiss, la acción se pierde.
- `Infinity` reservado para estados que SÍ requieren acción explícita del usuario (ejemplo: "Procesando N conversaciones" — toast persistente mientras dura el batch).
- Sticky toasts deben tener `dismiss: true` para que el usuario pueda cerrarlos manualmente.

---

## Glosario

- **Transcripción**: conversión speech-to-text de una llamada. Paso base.
- **Análisis**: pase de IA sobre una conversación transcrita (o sobre un chat). Produce resumen + sentimiento.
- **Conversación**: elemento único — una llamada o un hilo de chat. Puede tener N grabaciones (transferencias IVR).
- **Pendiente**: estado de una conversación que aún no ha pasado un paso (transcripción o análisis).
- **MECE**: Mutually Exclusive, Collectively Exhaustive. Aplicado a las 6 casuísticas del Bulk modal.
- **Fire-and-forget**: el componente dispara la acción y cierra; el feedback llega vía toast, no espera respuesta inline.
