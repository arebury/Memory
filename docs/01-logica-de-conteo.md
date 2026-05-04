# Memory · Lógica de conteo y reglas de negocio

*Memory · Smart Contact · Por Rafael Areses*

---

## Sobre este documento

Memory es un dashboard para supervisores de contact center. Permite revisar miles de conversaciones (llamadas y chats) y decidir cuáles transcribir y analizar con IA, sin que el supervisor tenga que escucharlas todas a mano.

Este documento explica **qué datos necesita cada componente clave del producto, qué deriva a partir de esos datos, y qué reglas de negocio aplica antes de dispatchar acciones**. La parte visual y de interacción —cómo se ve, cómo se comporta, qué dice— vive en el documento hermano *Memory · Referencia de UI*.

Cuatro componentes se documentan aquí, en este orden:

| Componente | Para qué sirve |
|---|---|
| `BulkTranscriptionModal` | Confirmar y lanzar transcripción/análisis en bloque sobre N conversaciones seleccionadas. |
| `ConversationPlayerModal` | Ver una conversación: audio (si es llamada), transcripción tipo chat, panel de análisis IA. |
| `RecordingTimeline` | Cuando una conversación tiene varias grabaciones, elegir cuál se está oyendo. |
| `scToast` | Notificaciones (éxito, error, en proceso) emitidas desde cualquier flujo. |

---

## 1. BulkTranscriptionModal

### ¿Qué es este componente?

Un modal que aparece cuando el usuario selecciona varias conversaciones y dispara la acción "Procesar". Su trabajo es:

1. **Confirmar** exactamente cuántas conversaciones se van a procesar.
2. Dejar que el usuario decida si **incluye análisis**, cuando hay decisión real que tomar.
3. **Avisar** de que la operación genera coste.
4. **Bloquear** el botón primario cuando no hay nada que ejecutar.

No es un orquestador. No muestra progreso, no permite editar la selección desde dentro, no calcula coste monetario real. Es un punto de confirmación, nada más.

### Contrato de datos

El componente necesita conocer cuatro contadores sobre la selección actual. La API que los produzca es libre, pero los cuatro son MECE (mutuamente excluyentes y colectivamente exhaustivos respecto al total seleccionado):

| Contador | Significado |
|---|---|
| `nSelected` | Total de conversaciones seleccionadas. Es la suma de todo lo demás. |
| `nTrans` | Conversaciones que aún necesitan transcripción. |
| `nAnBase` | Conversaciones que aún necesitan análisis (tengan o no transcripción). |
| `nAlready` | Conversaciones ya procesadas por completo (transcritas y analizadas). |

Una nota importante sobre la relación entre `nTrans` y `nAnBase`: **una misma conversación puede estar en ambos a la vez** si le faltan las dos cosas. No son conjuntos disjuntos. Lo único que es disjunto es `nAlready` con el resto: si una conversación está en `nAlready`, no puede estar en `nTrans` ni en `nAnBase`.

El componente solo lee estos cuatro números. No necesita saber qué conversación concreta es cuál ni acceder a ningún payload mayor.

### Cómo se calcula lo que hay que procesar

Tres valores derivados gobiernan toda la UI del modal.

**Estado del switch "Incluir análisis"**

El switch tiene dos dimensiones independientes: si está encendido (`checked`) y si se puede tocar (`disabled`).

```
disabled = (nAnBase === 0)
checked  = disabled ? false : userOn
```

El valor inicial de `userOn` depende del escenario, para ofrecer el default útil:

```
userOn_initial = (nTrans === 0 && nAnBase > 0) ? true : false
```

Es decir, cuando lo único pendiente es análisis, el switch abre encendido. El usuario puede apagarlo, pero entonces no quedará nada que procesar y "Procesar" se deshabilita. No se le fuerza a mantenerlo encendido — la deshabilitación del botón ya transmite el mensaje sin necesidad de bloquear el switch.

La caption bajo el switch refleja el estado:

- Si está deshabilitado: "No hay nada que analizar".
- Si está activo: "+{nAnBase} pendientes · genera coste".

**`heroCount` — el número grande**

```
heroCount = checked ? nTrans + nAnBase : nTrans
```

Es lo que aparece como número grande en la cell izquierda. Representa el total de operaciones que se ejecutarán al confirmar.

**`canSubmit` — habilita "Procesar"**

```
canSubmit = heroCount > 0
```

El único caso donde es falso es cuando todo está ya procesado.

### Regla cerrada · conversaciones con varias grabaciones

Una conversación puede tener N grabaciones (transferencias entre grupos vía IVR generan tramos separados). Esto introduce una pregunta: si una conversación con tres grabaciones entra en una selección bulk, ¿qué tramo se transcribe?

**La regla del producto es: el bulk transcribe TODAS las grabaciones de cada conversación seleccionada.** No elige tramo. La elección de tramo concreto solo existe en el modo individual, dentro del reproductor (`RecordingTimeline`). El bulk es para volumen; el single es para precisión.

Razones detrás de esta decisión:

- **Una sola regla, sencilla**. El supervisor no tiene que entender heurísticas ("¿el sistema escogió por mí cuál es la importante?").
- **Transparente sobre el coste**. El modal muestra el desglose explícito antes de confirmar (ver más abajo).
- **Consistente con el principio del bulk**. El bulk ejecuta sobre lo seleccionado, sin lógica oculta. Si el supervisor sabe que en la conversación X solo le interesa el tramo de retención, abre esa conversación, la transcribe individualmente, y luego puede usar el bulk sobre el resto.

**Comunicación al usuario antes de confirmar**: cuando hay multi-grabación en la selección, el subtítulo del modal o una caption junto al número grande lo dice explícitamente. Por ejemplo: *"14 conversaciones · 3 con varias grabaciones · 22 transcripciones totales"*. El usuario ve el coste real (en número de operaciones) antes de pulsar Procesar. Si le sorprende, puede deseleccionar las multi-grabación manualmente y tratarlas aparte.

**Implicación para el contador `nTrans`**: cuando hay multi-grabación en la selección, `nTrans` cuenta tramos pendientes, no conversaciones pendientes. Una conversación con 3 grabaciones sin transcribir suma 3 a `nTrans`, no 1.

**Invariante asociada del modelo**: para una conversación con N grabaciones, `Conversation.hasTranscription === true` solo si las N están transcritas. Si M < N están transcritas, la conversación sigue siendo "pendiente" en la columna Estado y en `nTrans`. Esto mantiene coherencia con el resto del producto: una conversación parcialmente transcrita es funcionalmente "todavía pendiente", igual que el análisis sigue requiriendo el texto completo.

### Las seis casuísticas

Seis combinaciones de los cuatro contadores cubren todos los escenarios posibles en los que se puede abrir el modal. La tabla usa los ejemplos numéricos del prototipo; los valores reales dependerán siempre de la selección del usuario.

| Caso | nSelected | nTrans | nAnBase | nAlready | checked inicial | disabled | heroCount inicial | ¿se puede procesar? |
|---|---|---|---|---|---|---|---|---|
| **C1** | 24 | 0 | 0 | 24 | false | sí | 0 | no |
| **C2** | 17 | 0 | 14 | 3 | true | no | 14 | sí |
| **C3** | 12 | 10 | 0 | 2 | false | sí | 10 | sí |
| **C4** | 18 | 8 | 6 | 4 | false | no | 8 (→14 si on) | sí |
| **C5** | 11 | 0 | 9 | 2 | true | no | 9 (→0 si off) | sí |
| **C6** | 19 | 7 | 9 | 3 | false | no | 7 (→16 si on) | sí |

Solo C4 y C6 tienen un `heroCount` que cambia en vivo cuando el usuario toca el switch.

**Lectura de cada caso**:

- **C1 — Todo procesado.** No hay nada pendiente. El modal sirve solo como confirmación de que el supervisor ya no tiene trabajo por delante en esta selección. Switch deshabilitado, Procesar deshabilitado.

- **C2 — Solo análisis pendiente.** Las transcripciones ya están; quedan 14 análisis. El switch abre encendido por default. El usuario puede apagarlo, pero entonces `heroCount` cae a 0 y Procesar se deshabilita. Apagarlo es legítimo: el supervisor decide no analizar ahora.

- **C3 — Transcripciones pendientes pero no se puede analizar.** Por ejemplo, una selección de chats donde las reglas de producto excluyen análisis para ese tipo, o conversaciones que no admiten análisis por otra razón. Switch deshabilitado. Procesar procesa solo las transcripciones.

- **C4 — Ambas cosas pendientes, mezcla.** El supervisor decide. El switch abre apagado por default (lo más conservador en coste); si lo enciende, `heroCount` salta de 8 a 14 (8 transcripciones + 6 análisis adicionales).

- **C5 — Solo chats con análisis pendiente.** Los chats no se transcriben (son texto por definición), pero sí se analizan. Mismo comportamiento que C2.

- **C6 — Mezcla con análisis pendiente.** Mezcla de llamadas y chats, todos con análisis pendiente. Mismo patrón que C4.

### Concurrencia · qué pasa con los items "en proceso"

Una vez se confirma "Procesar", las conversaciones afectadas pasan a estado "en proceso" en el listado. La transcripción y el análisis tardan minutos. Durante ese tiempo, el supervisor puede seguir trabajando y seleccionar nuevas conversaciones para lanzar otra acción en bulk.

Para evitar disparar acciones duplicadas sobre items que ya están en vuelo:

- En la **vista individual de una fila**, las conversaciones en proceso no se pueden seleccionar. La fila se bloquea visualmente (spinner o badge de estado) y el clic en su checkbox no responde.
- En la **selección masiva**, las conversaciones en proceso se deseleccionan **silenciosamente** antes de abrir el modal. El supervisor las ve en la fila con su indicador de "en proceso", pero no forman parte de la nueva selección. Esta deselección no se anuncia con un toast — sería ruido, el indicador en la fila ya cuenta la historia.

Consecuencia para este modal: nunca recibe conversaciones en vuelo. El filtrado ocurre antes, en la vista de listado y en el store. Los contadores `nTrans` / `nAnBase` / `nAlready` representan solo estado pendiente o finalizado. **No hay un contador adicional "en proceso" en el modal** — eso es responsabilidad del listado.

### Qué dispatcha al confirmar

Al hacer clic en "Procesar" con `canSubmit === true`, el modal invoca `onConfirm` del padre con dos argumentos:

```
onConfirm({ includeAnalysis: checked }, eligibleIds)
```

Donde `eligibleIds` es la lista de IDs que el modal calcula según el toggle:

- Si `checked === false`: solo los IDs de las conversaciones que necesitan transcripción.
- Si `checked === true`: la unión de `readyToTranscribe` + las que están transcritas pero sin análisis.

El padre (`ConversationsView.handleBulkConfirm`) reclasifica esos IDs en dos cubos antes de dispatchar las mutaciones reales:

- `needsTranscription` — IDs sin transcripción. Pasan por el chain (transcribir y, si `includeAnalysis`, analizar después).
- `alreadyTranscribed` — IDs ya transcritos pero sin análisis. Si `includeAnalysis`, se mandan directos al handler de análisis.

Cuando hay multi-grabación en juego, los IDs que viajan por estos cubos son **IDs de tramo**, no de conversación, por la regla descrita arriba.

### Manejo de errores

Comportamiento *fire-and-forget*: el modal se cierra inmediatamente al confirmar, sin esperar respuesta del backend. El control vuelve al listado.

Si el backend rechaza la acción, la respuesta llega vía toast desde la vista de listado:

```
scToast.error({
  title: "No se ha podido completar la acción",
  message: <razón concreta>
})
```

El modal ya está cerrado en ese punto y no reaparece. El usuario puede reintentar desde la misma pantalla.

Hay una limitación técnica importante a tener presente: **el backend no notifica errores granulares durante el proceso** (no llega un evento "fallo en la conversación 27 de 50"). Solo notifica al inicio y al final del batch. Por eso el modal no diseña feedback fino tipo "X de Y completadas con error". El feedback de error llega como un evento único al terminar el batch entero.

---

## 2. ConversationPlayerModal

### ¿Qué es este componente?

Un modal por conversación. Se abre al hacer clic en el icono de estado de una fila de la tabla. Permite:

- Reproducir el audio (solo si es llamada con grabación).
- Leer la transcripción en formato chat (bubbles izquierda/derecha por hablante).
- Consultar el panel de análisis IA: resumen + sentimiento.
- Lanzar la transcripción si la conversación todavía no la tiene.
- Lanzar el análisis si la transcripción está pero el análisis no.

### Invariantes globales del modelo

Hay dos reglas duras sobre el estado de una `Conversation` que el reproductor (y todo el resto del producto) asume siempre:

**Invariante 1 — Los chats siempre están transcritos.**
Un chat es texto por definición; la transcripción no requiere procesamiento. Cuando se carga cualquier conversación con `channel === "chat"`, el sistema fuerza `hasTranscription === true` y rellena `transcription[]` si estaba vacío.

**Invariante 2 — No hay análisis sin transcripción.**
El análisis (resumen + sentimiento) se deriva del texto. Una conversación no puede tener `hasAnalysis === true` si no tiene `hasTranscription === true`. Si por alguna razón el dato llega contradictorio (`hasAnalysis: true, hasTranscription: false`), el sistema baja `hasAnalysis` a `false` y limpia las categorías IA asociadas.

**Invariante 3 — Para multi-grabación, `hasTranscription` agregado solo es TRUE si todas las grabaciones lo están.**
Como se detalla en la regla de bulk multi-rec (sección 1), una conversación con N grabaciones se considera transcrita solo si las N están transcritas. Esta agregación se computa en el loader; el campo `Conversation.hasTranscription` no se establece manualmente.

Estas tres reglas viven centralizadas en `normalizeChats(list)` dentro de `mockSamples.ts`. Cualquier código que mute una `Conversation` debe pasar por esas reglas o respetarlas en su propio camino. El handler `handleRequestAnalysis` en la vista de conversaciones añade además un filtro defensivo: ignora targets sin transcripción antes de actuar.

### Estado de la pestaña Transcripción

El cuerpo de la pestaña Transcripción puede mostrarse en cinco estados distintos. Se evalúan en orden y el primer match gana:

1. **Procesando.** Si la transcripción está en marcha, se muestra una vista de "Transcribiendo" con un spinner y un mensaje conversacional.
2. **Sin grabación (terminal).** Si la conversación es una llamada y no tiene grabación, se muestra un mensaje de "No hay grabación de esta llamada", sin acción posible. Sin grabación no se puede transcribir.
3. **Sin transcripción (accionable).** Si la conversación tiene grabación pero no transcripción, se muestra un empty state con CTA "Transcribir" y la advertencia de coste inline ("Genera coste · ~30 s").
4. **Transcripción vacía (terminal).** Si la transcripción se ejecutó pero terminó sin extraer líneas (típico de audios muy cortos o con silencios largos), se muestra un mensaje neutro sin acción.
5. **Activo.** Si hay transcripción válida, se renderiza la lista de intervenciones en formato chat más un buscador en la cabecera de la pestaña.

### Estado de la pestaña Análisis

Cuatro estados, mismo patrón de evaluación en orden:

1. **Procesando.** Si el análisis está en marcha y todavía no se ha completado, se muestra "Analizando".
2. **Pendiente de transcribir y analizar (dead-end resuelto).** Si no hay análisis y tampoco se puede pedir directamente (porque no hay transcripción y la conversación no es chat), el CTA combina los dos pasos: "Transcribir y analizar". Esto evita que el supervisor tenga que rebotar a la otra pestaña, transcribir, esperar y volver. La advertencia de coste lo refleja: "Genera coste · transcripción + análisis".
3. **Lista para analizar (accionable).** Si hay transcripción pero no análisis, el CTA es "Solicitar análisis". Coste: "Genera coste · ~10 s".
4. **Activo.** Resumen + sentimiento renderizados. El resumen se deriva determinísticamente del id (mismo hash que elige la plantilla de transcripción, así nunca hay disonancia entre las dos pestañas).

Para chats, la condición "se puede pedir análisis" siempre se cumple aunque no haya transcripción explícita, porque el chat es texto por definición y el análisis trabaja sobre él directamente.

### Cadena transcribir → analizar

Cuando el usuario pulsa "Transcribir y analizar" en el dead-end resuelto, el componente dispara dos mutaciones encadenadas: primero la transcripción y, cuando termina, el análisis. La segunda no puede correr en paralelo a la primera porque depende de su resultado.

La implementación canónica vive en el padre (`ConversationsView`) y usa una cola más un effect que la drena cuando el estado lo permite:

```
const [chainAnalysisIds, setChainAnalysisIds] = useState([]);

const handleRequestTranscriptionAndAnalysis = (ids) => {
  setChainAnalysisIds(prev => [...prev, ...ids]);
  handleRequestTranscription(ids);
};

useEffect(() => {
  const ready = chainAnalysisIds.filter(id =>
    conversations.find(c => c.id === id)?.hasTranscription
  );
  if (ready.length === 0) return;
  setChainAnalysisIds(prev => prev.filter(id => !ready.includes(id)));
  handleRequestAnalysis(ready);
}, [conversations, chainAnalysisIds]);
```

Lo importante de este patrón:

- **Robusto a cambios futuros.** Cuando aterrice backend real, basta sustituir `handleRequestTranscription` (que hoy hace `setTimeout` para simular) por una promesa real. La cola y el effect siguen funcionando igual.
- **Robusto a múltiples IDs en vuelo.** Cada conversación se drena de la cola cuando su transcripción individual completa. No hay timer compartido que se pueda desincronizar.
- **Sustituyó a un patrón con `setTimeout(6500)` que tenía un bug de closure.** El `setTimeout` capturaba referencias viejas a las conversaciones y filtraba elegibilidad sobre estado obsoleto. La cola se evalúa cada vez que el estado cambia, así que siempre lee la versión actual.

### Cuándo aparece un modal de confirmación

Decisión cerrada del producto: **el modal de confirmación adicional se reserva para operaciones destructivas, no para "esto genera coste"**.

- **Operaciones que solo generan coste** (transcribir por primera vez, analizar por primera vez, exportar): se dispatchan directamente desde el CTA. La advertencia de coste vive inline ("Genera coste · ~30 s") justo debajo del botón. Es consentimiento suficiente; el toast de éxito al terminar cierra el loop.
- **Operaciones destructivas** (sobrescribir datos existentes, borrar, cancelar algo en curso): sí van con un modal de confirmación explícito y, cuando aplica, una caja roja avisando del impacto.

Único modal de confirmación que sobrevive en el reproductor: `RetranscriptionConfirmModal`. Re-transcribir sobrescribe la transcripción existente y, en consecuencia, invalida el análisis derivado. El usuario tiene que confirmarlo conscientemente.

Esta regla evita el patrón "¿estás seguro?" antes de cada acción billable, que el supervisor interpreta como fricción muerta y termina ignorando.

### Multi-grabación

Si la conversación tiene más de una grabación (es decir, `recordings.length > 1`), aparece un componente adicional sobre la barra de audio: el `RecordingTimeline`. Permite al supervisor elegir qué tramo está oyendo. Su lógica se documenta en la sección siguiente.

---

## 3. RecordingTimeline

### ¿Qué es este componente?

Un selector de tramo para conversaciones que tienen varias grabaciones. Se renderiza solo cuando `recordings.length > 1`; con una sola grabación, no aparece (sería un selector de un único elemento, sin sentido).

Las conversaciones multi-grabación nacen típicamente de transferencias entre grupos vía IVR: el cliente entra al menú principal, lo transfieren al equipo comercial, lo transfieren a retención. Cada tramo se graba por separado.

### Cómo calcula la anchura de cada tramo

El componente parte de las duraciones de cada grabación, las suma para obtener el total, y reparte la anchura disponible proporcionalmente:

```
durations[i]  = parseDurationSec(recordings[i].duration)
total         = sum(durations)
fraction[i]   = durations[i] / total
```

Cada segmento se renderiza con `flex-grow: fraction[i]`, `flex-basis: 0` y un `min-width` de 56 píxeles. El `flex-grow` proporcional reparte el espacio exactamente según la duración real de cada tramo; el `min-width` evita que un tramo muy corto se vuelva inclickable.

El supervisor ve de un vistazo qué tramo domina la conversación. Si la llamada son 5 segundos en IVR, 3 minutos hablando con un comercial y 30 segundos en retención, el segmento del comercial se ve claramente como el más ancho.

### Cuándo un tramo muestra solo número en vez de label

Cuando `fraction[i]` es menor que 0.12 (12% del total), el segmento es demasiado estrecho para que el label se lea bien. En vez de truncarlo a tres caracteres y dejarlo feo, el componente cae a un fallback:

- En el sitio donde iría el label, muestra el número de tramo (`1`, `2`, `3`...).
- El label completo se sigue ofreciendo via tooltip nativo (`title=`).
- La etiqueta `aria-label` siempre incluye el label completo, así que el lector de pantalla nunca pierde la información.

El umbral del 12% no es mágico: por debajo de eso, en un strip estándar de unos 600 píxeles, el segmento queda en menos de 75 píxeles y el label se trunca a apenas tres o cuatro caracteres. El número índice + tooltip es más honesto.

### Selección y dispatch

El componente expone un patrón estándar de radiogroup ARIA:

- El contenedor del strip tiene `role="radiogroup"` con `aria-label="Selecciona un tramo"`.
- Cada segmento tiene `role="radio"` y `aria-checked` reflejando si es el seleccionado.
- El `tabIndex` de los segmentos es 0 solo en el activo; el resto vale -1. Esto sigue el patrón W3C: la navegación por Tab entra al grupo en el activo, y dentro del grupo la navegación es por flechas.

El estado `selectedRecordingId` lo controla el padre (`ConversationPlayerModal`). El componente no decide qué tramo está seleccionado; solo notifica al padre cuando el usuario quiere cambiar via `onSelect(id)`.

Al cambiar de tramo, el padre hace dos cosas: actualizar `selectedRecordingId` y resetear el transporte del audio (`isPlaying: false`, `currentTime: 0`). La barra de audio toma su duración del tramo seleccionado, no de la duración agregada de la conversación.

### Edge cases

- **Una sola grabación.** El componente no se renderiza. Lo gatea el padre con `recordings.length > 1`.
- **Anchura del strip insuficiente para todos los `min-width: 56px`.** El contenedor tiene `overflow-hidden`, así que segmentos que pasen del ancho disponible se clipan. Aceptable porque la realidad del producto son 2 a 5 tramos por conversación; si llega un sample con 12 o más, conviene revisar (probablemente migrar a `overflow-x-auto` con scroll horizontal).
- **Duración total cero.** El cálculo usa `total || 1` para evitar división por cero. Si todas las grabaciones tienen duración cero, el reparto es uniforme, lo cual es razonable como fallback.

---

## 4. scToast

### ¿Qué es y por qué hay un wrapper

`scToast` es la API canónica de notificaciones del producto. Por debajo usa `sonner` (la librería que viene con el stack de prototipos) como motor de cola, posicionamiento y accesibilidad, pero la presentación visual está envuelta para que los toasts sigan exactamente las convenciones del Smart Contact Design System: tipografía, colores por severidad, layout horizontal o vertical, dismiss, acciones.

El wrapper existe para que ningún sitio del código haga `import { toast } from "sonner"` directamente con su look-and-feel default. Cualquier toast nuevo que aparezca en el producto debe usar `scToast`.

### Cómo elegir la severity

Cinco severities. La elección comunica el tipo de evento, no su gravedad:

| Severity | Cuándo usarla |
|---|---|
| `success` | Operación que terminó OK y el supervisor quiere confirmarlo. Ejemplo: "Transcripción lista". |
| `error` | Fallo que requiere atención. Suele ir con `action` para reintentar o navegar a las fallidas. |
| `warning` | Atención requerida pero no bloqueante. Ejemplo: "10 conversaciones omitidas porque están en proceso". |
| `info` | Información contextual, sin acción. Ejemplo: "Filtro aplicado". |
| `indigo` | Cue específico de feature o IA. Reservado para acciones que merecen highlight. No abusar. |

Como regla general: si el evento no necesita mover al usuario a una decisión, suele ser `info`. Si la requiere o si quieres que la note, sube a `success` (positivo), `warning` (atención) o `error` (acción).

### API

```
scToast.success({
  title:           "Transcripción lista",
  message:         "Ya puedes consultarla en el reproductor.",
  action:          { label: "Abrir", onClick: () => openPlayer(id) },
  secondaryAction: { label: "Más tarde", onClick: () => {} },
  duration:        3000,
  layout:          "horizontal",
  appearance:      "light",
  dismiss:         true,
  id:              "transcription-ready",
})
```

Casi todos los campos son opcionales. Lo único realmente común es `title` y, según el caso, `message` o `action`.

| Prop | Tipo | Default | Significado |
|---|---|---|---|
| `title` | string | — | Línea principal, semibold. |
| `message` | string | — | Línea de detalle, regular. |
| `action` | `{ label, onClick }` | — | Botón inline primario. Cierra el toast tras invocarlo. |
| `secondaryAction` | `{ label, onClick }` | — | Botón secundario. Si está presente con `action`, el layout pasa automáticamente a vertical. |
| `duration` | number | 3000 (ms) | Auto-dismiss. Pasar `Infinity` lo hace sticky. |
| `layout` | "horizontal" \| "vertical" | "horizontal" | Auto-promote a vertical con dos acciones o sin título. |
| `appearance` | "light" \| "solid" | "light" | Tinte suave vs fondo saturado. |
| `dismiss` | boolean | true | Mostrar la X de cerrar. |
| `id` | string \| number | — | Identificador estable para actualizar o cerrar programáticamente. |

### Reglas de ciclo de vida

Tres pautas para que los toasts se sientan consistentes:

1. **El default de 3000 ms basta para confirmaciones simples.** Si solo quieres acusar recibo de un evento ("Filtro aplicado", "Conversación marcada"), el default funciona.

2. **Si el toast lleva una acción, debe ser sticky o muy largo.** Un toast con botón "Ver fallidas" que desaparece en 3 segundos es una afordance perdida — el supervisor no llega a verla. Para acciones, usa `Infinity` (el supervisor cierra cuando quiera) o como mínimo 7000 ms.

3. **`Infinity` se reserva para estados que requieren acción explícita del usuario.** El caso típico es "Procesando N conversaciones": un toast persistente arriba a la derecha mientras dura el batch. Cuando el batch termina, ese toast se reemplaza por uno breve de éxito o error. No abuses de `Infinity` para cosas que no son procesos largos.

Cuando un toast es sticky, ten siempre `dismiss: true` (default) para que el usuario pueda cerrarlo manualmente. Un sticky sin dismiss es una jaula visual.

---

## Glosario

- **Conversación**: la unidad de contenido del producto. Puede ser una llamada o un hilo de chat. Una conversación puede tener una o varias grabaciones (las llamadas con transferencias IVR).
- **Tramo o grabación**: cada uno de los segmentos de audio que componen una conversación multi-grabación. Para una conversación de 1 grabación, "tramo" y "conversación" son sinónimos.
- **Transcripción**: el proceso (y el resultado) de convertir audio en texto, con separación de hablantes. Es el paso base. Sin transcripción no hay nada más.
- **Análisis**: pase de IA sobre una conversación transcrita (o sobre un chat). Produce dos cosas: un resumen breve y una valoración de sentimiento. Es opcional.
- **Pendiente**: estado de una conversación que aún no ha pasado un paso (transcripción o análisis). En multi-grabación, una conversación está pendiente si **alguno** de sus tramos lo está.
- **MECE**: mutually exclusive, collectively exhaustive. Aplicado a los cuatro contadores del bulk modal: `nSelected = nTrans` (algunos) `+ nAnBase` (algunos, posiblemente solapados con nTrans) `+ nAlready`. La parte solapada está controlada explícitamente.
- **Fire-and-forget**: el componente dispatcha la acción y se cierra sin esperar respuesta. El feedback (éxito o fallo) llega vía toast desde la vista que lo invocó.
- **Empty state**: el cuerpo de un componente cuando no hay datos para mostrar. Tres variantes en el reproductor: con acción (`DecisionState`), procesando (`ProcessingState`), y terminal sin acción (`TerminalNote`).

---

## Decisiones de producto cerradas

- **El bulk transcribe TODAS las grabaciones de cada conversación seleccionada.** No elige tramo. La elección de tramo concreto vive solo en el modo individual. El modal muestra el desglose explícito antes de confirmar.
- **`Conversation.hasTranscription` para multi-grabación es TRUE solo si todas las grabaciones lo están.** Una conversación parcialmente transcrita es funcionalmente "pendiente".
- **El modal de confirmación adicional se reserva para operaciones destructivas.** Las operaciones que solo generan coste se dispatchan directo, con la advertencia inline en el CTA. Único superviviente: `RetranscriptionConfirmModal`.
- **El bulk no decide por el usuario.** Los items en proceso se filtran antes de llegar al modal (selección masiva los deselecciona silenciosamente; en vista individual no son seleccionables). El modal nunca recibe items en vuelo.
- **No hay cancelación de batch a mitad de proceso.** Una vez disparada la acción, el coste se genera completo. La copia del modal lo refleja: no se promete "cancelar" en ningún sitio.
- **Errores se notifican solo al inicio y al final del batch.** El backend no notifica errores granulares durante el proceso. La UI no diseña feedback fino tipo "fallo en la 27 de 50".

## Pendiente de decidir

- **Contrato de backend para los contadores `nTrans`, `nAnBase`, `nAlready`.** Endpoint concreto, payload esperado, paginación si la selección es muy grande.
- **Eventos de telemetría.** Qué eventos disparar al abrir el modal, al togglear el switch, al confirmar; con qué atributos. Útil para medir adopción del switch de análisis.
- **Límite máximo de selección para el bulk.** ¿Hay un tope duro? ¿Aviso si se excede? ¿Paginación de la acción?
- **Implementación del estado por grabación y agregación en `hasTranscription`.** La regla está cerrada en producto, pero el modelo y los handlers todavía cuentan a nivel de conversación. Pasada de implementación pendiente.
