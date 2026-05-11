# Memory · Lógica de conteo y reglas de negocio

*Memory · Smart Contact · Por Rafael Areses*

---

## Sobre este documento

Memory es la parte de Smart Contact que deja revisar miles de conversaciones (llamadas y chats) y decidir cuáles transcribir y analizar con IA, sin tener que escucharlas todas a mano.

Este doc cuenta **qué datos necesita cada componente clave, qué deriva a partir de esos datos y qué reglas aplica antes de lanzar una acción**. La parte visual y de copy vive en *Memory · Referencia de UI*. Las decisiones de producto cross-cutting (qué se confirma, qué se silencia) viven en *Memory · Decisiones de diseño*.

Se documentan cuatro componentes:

| Componente | Para qué sirve |
|---|---|
| `BulkTranscriptionModal` | Confirmar y lanzar transcripción/análisis en bloque sobre N conversaciones seleccionadas. |
| `ConversationPlayerModal` | Ver una conversación: audio (si es llamada), transcripción tipo chat, panel de análisis IA. |
| `RecordingTimeline` | Cuando una conversación tiene varias grabaciones, elegir cuál se está oyendo. |
| `scToast` | Notificaciones (éxito, error, en proceso) emitidas desde cualquier flujo. |

Antes de entrar en componentes, hay un puñado de reglas que aplican a todo el modelo. Conviene leerlas primero porque las secciones siguientes las dan por supuestas.

---

## Invariantes globales del modelo

Aplican a todo. Viven centralizadas en `normalizeChats(list)` dentro de `mockSamples.ts`.

**Invariante 1 — Los chats siempre están transcritos, salvo cuando han perdido su derecho a retener el contenido.**
Un chat es texto; no requiere procesamiento. Cuando se carga una conversación con `channel === "chat"`, el sistema fuerza `hasTranscription === true` y rellena `transcription[]` si estaba vacío.

Excepción · retención vencida: algunas conversaciones tienen restricciones legales de retención y dejan de ser recuperables tras un tiempo. El ejemplo canónico es la custodia GDPR (vencida = el proveedor ya no tiene obligación de retener el texto), pero pueden existir otros casos según normativa aplicable. En esos casos el chat lleva `deleted: true`, el sistema respeta ese estado y no seedea transcripción. La conversación se ve en el listado en estado "no recuperable" pero se queda fuera del bulk silenciosamente — el filtrado lo aplica `BulkTranscriptionModal` antes de calcular contadores.

En la tabla, las filas `deleted` se renderizan con opacidad reducida (~60%), checkbox deshabilitado y tooltip explicativo del motivo (por defecto *"Custodia GDPR vencida · datos no recuperables"* — el copy puede variar según el motivo concreto de la restricción). El supervisor las ve pero no puede operar sobre ellas: el icono de estado no abre el reproductor, la fila no es seleccionable, el bulk modal las excluye del cálculo. Comparten el mismo `isLocked` que las conversaciones "en proceso" — no hay UX nueva para este caso, se reutiliza el patrón existente.

**Invariante 2 — No hay análisis sin transcripción.**
El análisis (resumen + sentimiento) se deriva del texto. Una conversación no puede tener `hasAnalysis === true` sin `hasTranscription === true`. Si llega un dato contradictorio, el sistema baja `hasAnalysis` a `false` y limpia las categorías IA asociadas.

**Invariante 3 — Para multi-grabación, `hasTranscription` agregado solo es TRUE si todas las grabaciones lo están.**
Las llamadas con transferencias IVR generan N grabaciones, cada una con su propio `hasTranscription` por tramo. La conversación se considera transcrita solo si las N están transcritas. La agregación se computa en `normalizeChats` a partir de `recordings[i].hasTranscription`; el campo `Conversation.hasTranscription` no se establece manualmente para multi-rec.

Una llamada con tres grabaciones, dos transcritas y una pendiente, sigue siendo "pendiente" en la columna Estado y en el contador `nTrans`. Una conversación parcialmente transcrita es funcionalmente pendiente, igual que el análisis sigue requiriendo el texto completo.

**Fire-and-forget en operaciones billables.** Las operaciones que generan coste (transcribir, analizar, exportar) se dispatchan y el componente se cierra al momento, sin esperar respuesta del backend. El feedback (éxito o fallo) llega vía `scToast` desde la vista que originó la acción.

**Sobre la diarización (concepto retirado).** Versiones anteriores del modelo tenían un campo `Conversation.hasDiarization`. El concepto se eliminó del producto entero y el campo se borró del schema. Cualquier referencia a "diarización" en código o copy hoy es un bug residual.

---

## 1. BulkTranscriptionModal

### ¿Qué hace este componente?

Un modal que aparece cuando el supervisor selecciona varias conversaciones y dispara la acción "Procesar". Hace cuatro cosas:

1. Confirma cuántas conversaciones se van a procesar.
2. Deja decidir si **incluye análisis**, cuando hay decisión real que tomar.
3. Avisa de que la operación genera coste.
4. Bloquea el botón primario cuando no hay nada que ejecutar.

No es un orquestador. No muestra progreso, no permite editar la selección desde dentro, no calcula coste monetario real. Es un punto de confirmación, nada más.

### Contrato de datos

Necesita cuatro contadores sobre la selección actual. La API que los produzca es libre, pero los cuatro son MECE (mutuamente excluyentes y colectivamente exhaustivos respecto al total seleccionado):

| Contador | Significado |
|---|---|
| `nSelected` | Total de conversaciones seleccionadas. Es la suma de todo lo demás. |
| `nTrans` | Conversaciones que aún necesitan transcripción. |
| `nAnBase` | Conversaciones que aún necesitan análisis (tengan o no transcripción). |
| `nAlready` | Conversaciones ya procesadas por completo (transcritas y analizadas). |

Una nota importante sobre la relación entre `nTrans` y `nAnBase`: **una misma conversación puede estar en ambos a la vez** si le faltan las dos cosas. No son conjuntos disjuntos. Lo único disjunto es `nAlready` con el resto: si una conversación está en `nAlready`, no puede estar en `nTrans` ni en `nAnBase`.

El componente solo lee estos cuatro números. No necesita saber qué conversación concreta es cuál.

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

Cuando lo único pendiente es análisis, el switch abre encendido. El supervisor puede apagarlo, pero entonces no queda nada que procesar y "Procesar" se deshabilita. No se le fuerza a mantenerlo encendido — la deshabilitación del botón ya transmite el mensaje.

La caption bajo el switch refleja el estado:

- Si está deshabilitado: "No hay nada que analizar".
- Si está activo: "+{nAnBase} pendientes · genera coste".

**`heroCount` — el número grande**

```
heroCount = checked ? nTrans + nAnBase : nTrans
```

Aparece como número grande en la celda izquierda. Es el total de operaciones que se ejecutarán al confirmar.

**`canSubmit` — habilita "Procesar"**

```
canSubmit = heroCount > 0
```

El único caso donde es falso es cuando todo está ya procesado.

### Regla cerrada · conversaciones con varias grabaciones

Una conversación puede tener N grabaciones (transferencias entre grupos vía IVR generan tramos separados). Esto deja una pregunta abierta: si una conversación con tres grabaciones entra en una selección bulk, ¿qué tramo se transcribe?

**La regla del producto es: el bulk transcribe TODAS las grabaciones de cada conversación seleccionada.** No elige tramo. La elección de tramo solo existe en el modo individual, dentro del reproductor (`RecordingTimeline`). El bulk es para volumen; el single es para precisión.

**Implementación**: el modelo `Recording` lleva un campo `hasTranscription: boolean` por tramo. El handler `handleRequestTranscription` flipa cada tramo pendiente y deja los ya transcritos intactos (idempotente). El agregado `Conversation.hasTranscription` se computa en `normalizeChats` como "todos los tramos transcritos".

Razones detrás de esta decisión:

- **Una sola regla, sencilla**. El supervisor no tiene que entender heurísticas ("¿el sistema escogió por mí cuál es la importante?").
- **Transparente sobre el volumen**. El modal muestra el desglose explícito antes de confirmar — número de audios, no de conversaciones, para que el supervisor sepa cuántas operaciones se ejecutan. El producto no calcula coste monetario; el desglose por volumen es lo que sustituye a un cálculo en euros.
- **Consistente con el principio del bulk**. El bulk ejecuta sobre lo seleccionado, sin lógica oculta. Si el supervisor solo le interesa el tramo de retención de una conversación concreta, la abre, la transcribe individualmente y usa el bulk para el resto.

**Caveat conocido · multi-tramo parcial y select-all.** El agregado `Conversation.hasTranscription` sigue siendo `false` mientras quede algún tramo pendiente, así que una conversación con 1 de 3 tramos transcritos cuenta como "pendiente" en `nTrans` igual que una totalmente pendiente. Si el supervisor abre una conversación, transcribe un tramo concreto desde el reproductor y después hace select-all en la tabla, esa conversación entra en el lote y `handleRequestTranscription` flipa los dos tramos restantes. Cost-wise no hay doble cobro (el tramo ya transcrito se respeta · idempotente), pero el supervisor procesa cosas que intencionadamente había dejado fuera. Dos mitigaciones del producto:

- En el `BulkTranscriptionModal`, cuando la selección incluye llamadas con tramos ya iniciados manualmente, el hint del hero añade "Incluye N con tramos ya iniciados" — el supervisor lo ve antes de pulsar Procesar.
- En `TypeFilterPanel`, sección "Multi-grabación", el toggle "solo con tramos parcialmente transcritos" deja encontrar esas conversaciones proactivamente. Una vez identificadas, el supervisor puede deseleccionarlas a mano antes de lanzar el bulk.

**Comunicación al supervisor antes de confirmar**: cuando hay multi-grabación en la selección, aparece una caption bajo el número grande con la única info que el subtitle no tiene. La caption compone hasta dos piezas independientes, unidas con " · ":

- Si la selección incluye llamadas multi-rec y el toggle análisis está apagado: `"N llamadas con varios tramos"` (explica por qué el número grande puede superar al número de conversaciones).
- Si la selección incluye llamadas con tramos ya transcritos manualmente: `"M con tramos ya iniciados"` (el aviso del caveat parcial descrito arriba).

Resultado: "Incluye 2 llamadas con varios tramos · 1 con tramos ya iniciados" cuando ambas piezas aplican. El subtitle ya cuenta cuántas conversaciones se seleccionaron y el desglose llamadas/chats; el número grande ya muestra el total de audios. La caption solo aparece cuando aporta información nueva — repetir "de N seleccionadas" cuando el subtitle ya lo dice se descartó como ruido. El espacio del hint mantiene altura aunque esté vacío, para evitar que el modal salte de tamaño al aparecer o desaparecer.

**Implicación para `nTrans`**: cuando hay multi-grabación en la selección, `nTrans` cuenta tramos pendientes, no conversaciones pendientes. Una conversación con 3 grabaciones sin transcribir suma 3 a `nTrans`, no 1.

### Las seis casuísticas

Seis combinaciones de los cuatro contadores cubren todos los escenarios en los que se puede abrir el modal. La tabla usa los ejemplos numéricos del prototipo:

| Caso | nSelected | nTrans | nAnBase | nAlready | checked inicial | disabled | heroCount inicial | ¿se puede procesar? |
|---|---|---|---|---|---|---|---|---|
| **C1** | 24 | 0 | 0 | 24 | false | sí | 0 | no |
| **C2** | 17 | 0 | 14 | 3 | true | no | 14 | sí |
| **C3** | 12 | 10 | 0 | 2 | false | sí | 10 | sí |
| **C4** | 18 | 8 | 6 | 4 | false | no | 8 (→14 si on) | sí |
| **C5** | 11 | 0 | 9 | 2 | true | no | 9 (→0 si off) | sí |
| **C6** | 19 | 7 | 9 | 3 | false | no | 7 (→16 si on) | sí |

Solo C4 y C6 tienen un `heroCount` que cambia en vivo cuando el supervisor toca el switch.

- **C1 — Todo procesado.** No hay nada pendiente. El modal sirve solo de confirmación de que no queda trabajo en esa selección. Switch deshabilitado, Procesar deshabilitado.
- **C2 — Solo análisis pendiente.** Las transcripciones ya están; quedan 14 análisis. Switch encendido por defecto. Si el supervisor lo apaga, `heroCount` cae a 0 y Procesar se deshabilita. Apagarlo es legítimo: el supervisor decide no analizar ahora.
- **C3 — Transcripciones pendientes sin opción de análisis.** Por ejemplo, una selección de chats donde las reglas excluyen análisis para ese tipo. Switch deshabilitado. Procesar procesa solo las transcripciones.
- **C4 — Las dos cosas pendientes, mezcla.** El supervisor decide. El switch abre apagado (lo más conservador en coste); si lo enciende, `heroCount` salta de 8 a 14 (8 transcripciones + 6 análisis adicionales).
- **C5 — Solo chats con análisis pendiente.** Los chats no se transcriben (son texto), pero sí se analizan. Mismo comportamiento que C2.
- **C6 — Mezcla con análisis pendiente.** Mezcla de llamadas y chats, todos con análisis pendiente. Mismo patrón que C4.

### Concurrencia · qué pasa con los items "en proceso"

Una vez se confirma "Procesar", las conversaciones afectadas pasan a estado "en proceso" en el listado. La transcripción y el análisis tardan minutos. Durante ese tiempo, el supervisor puede seguir trabajando y seleccionar nuevas conversaciones para lanzar otra acción.

Para evitar disparar acciones duplicadas sobre items que ya están en vuelo:

- **En la fila individual**, las conversaciones en proceso no se pueden seleccionar. La fila se bloquea visualmente (spinner o badge de estado) y el clic en su checkbox no responde.
- **En la selección masiva**, las conversaciones en proceso se deseleccionan **silenciosamente** antes de abrir el modal. El supervisor las ve en la fila con su indicador "en proceso", pero no forman parte de la nueva selección. La deselección no se anuncia con un toast — sería ruido; el indicador en la fila ya cuenta la historia.

Consecuencia para este modal: nunca recibe conversaciones en vuelo. El filtrado ocurre antes, en la vista de listado y en el store. Los contadores `nTrans` / `nAnBase` / `nAlready` representan solo estado pendiente o finalizado. **No hay un contador adicional "en proceso" en el modal** — eso es responsabilidad del listado.

### Sticky toast durante el batch

Al confirmar "Procesar", el modal se cierra y aparece un toast persistente abajo a la derecha con el texto "Generando transcripción..." (`duration: Infinity`, `id: "progress-toast"`, `dismiss: true`).

- El toast no se auto-cierra. Tiene una × para descartarlo manualmente.
- Si el supervisor activó "Incluir análisis", al terminar las transcripciones el mismo toast pasa a "Generando análisis..." sin desaparecer. Sonner hace update in-place porque comparten id.
- Cuando todo termina, el sticky se reemplaza por un toast breve de éxito ("X transcripciones listas" o "X análisis listos") con el mismo id. Este sí auto-cierra a los pocos segundos.

El propósito del sticky es cubrir el caso "supervisor cambia de vista durante el batch" — el indicador en la fila no basta si navega fuera de la tabla. El sticky le da el estado a la vista actual sea cual sea.

Para acciones unitarias (transcribir o analizar desde el reproductor), el mismo patrón aplica: sticky info al lanzar, success/error al terminar, mismo id.

### Cuando una transcripción falla

No todas las transcripciones terminan bien. Si una conversación tiene audio en silencio, formato no soportado o el backend tropieza, el campo `hasFailedTranscription: true` queda marcado en esa conversación.

Lo que ocurre en la UI cuando hay fallos:

- **Toast de error con acción.** El toast persistente "Generando..." se reemplaza por uno de error con `severity: "error"`, título tipo "3 transcripciones fallaron", mensaje "Audio en silencio o formato no soportado en algunas conversaciones", y una acción **"Ver fallidas"** que activa un filtro en la tabla para mostrar solo esas filas.
- **Chip rojo en la toolbar.** Mientras el filtro "solo fallidas" está activo, aparece un chip rojo con la cuenta ("3 fallidas") y una × para quitarlo.
- **Filtro manual permanente.** El mismo filtro está disponible en el panel de filtros, sección "Estado", con un toggle "Solo fallidas". Single source of truth: el chip de la toolbar y el toggle del panel reflejan el mismo flag `showOnlyFailed`. Así el supervisor puede reactivar el filtro más adelante sin esperar otro error.
- **Icono de estado distinto.** Las filas con `hasFailedTranscription === true` muestran un icono específico (rojo) en la columna Estado. Click abre el reproductor; la pestaña Transcripción muestra una vista terminal explicando el fallo y un CTA "Reintentar".
- **Reintento.** El reintento es la misma operación de transcribir, sin distinción especial. Se puede lanzar desde el reproductor (CTA "Reintentar") o seleccionando la fila y pulsando Procesar. Si vuelve a fallar, el flujo se repite.

Limitación a tener presente: **el backend no notifica errores granulares durante el proceso** (no llega un evento "fallo en la conversación 27 de 50"). Solo notifica al inicio y al final del batch. Por eso el modal y el toast no diseñan feedback fino tipo "X de Y completadas con error". El feedback de error llega como un evento único al terminar.

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

Fire-and-forget: el modal se cierra al confirmar, sin esperar respuesta del backend. El control vuelve al listado.

Si el backend rechaza la acción antes de empezar (validación), la respuesta llega vía toast desde la vista de listado:

```
scToast.error({
  title: "No se ha podido completar la acción",
  message: <razón concreta>
})
```

El modal ya está cerrado en ese punto y no reaparece. El supervisor reintenta desde la misma pantalla.

Los fallos durante el proceso (transcripciones que se rompen al ejecutarse) se cubren en la sección "Cuando una transcripción falla" arriba.

---

## 2. ConversationPlayerModal

### ¿Qué hace este componente?

Un modal por conversación. Se abre al hacer clic en el icono de estado de una fila de la tabla. Permite:

- Reproducir el audio (solo si es llamada con grabación).
- Leer la transcripción en formato chat (bubbles izquierda/derecha por hablante).
- Consultar el panel de análisis IA: resumen + sentimiento.
- Lanzar la transcripción si la conversación todavía no la tiene.
- Lanzar el análisis si la transcripción está pero el análisis no.

Las invariantes globales del modelo (chats siempre transcritos salvo retención vencida, no análisis sin transcripción, agregación multi-rec) viven al inicio de este documento. El reproductor las asume siempre; el handler `handleRequestAnalysis` añade un filtro defensivo: ignora targets sin transcripción antes de actuar.

### Acciones en el header del player

A la derecha de la fila de tabs hay iconos de acción:

- **Analizar** — visible siempre. Deshabilitado si no hay transcripción (`!hasTranscription`) o si ya se analizó (`hasAnalysis === true`). Click dispatcha `handleAnalysisRequest` directo, sin modal intermedio. El sticky toast "Generando análisis..." cubre el feedback.
- **Descargar** — descarga audio + transcripción si los hay; solo texto si es chat.
- **Re-transcribir** — *post-v1, no entra en el primer rollout.* En el prototipo aparece a la izquierda de Analizar cuando ya hay transcripción, y abre `RetranscriptionConfirmModal` (caja roja + input "CONFIRMAR"). Es destructivo: reemplaza la transcripción y borra el análisis derivado. En v1 no se expone — el supervisor convive con la primera transcripción o solicita reproceso por canales internos.

El botón Analizar en el header existe para discoverability. Antes, la única forma de descubrir que se podía generar análisis era cambiar a la pestaña Análisis y ver el CTA dentro. Ahora se descubre desde la vista por defecto. El tooltip explica el estado: "Análisis" si está habilitado, "Requiere transcripción" o "Análisis ya realizado" si está deshabilitado.

### Estado de la pestaña Transcripción

El cuerpo de la pestaña Transcripción puede mostrarse en cinco estados. Se evalúan en orden y el primer match gana:

1. **Procesando.** Si la transcripción está en marcha (`processingIds` incluye la conversación), se muestra una vista "Transcribiendo" con spinner y mensaje conversacional.
2. **Sin grabación (terminal).** Si la conversación es una llamada y no tiene grabación, mensaje "No hay grabación de esta llamada", sin acción posible. Sin grabación no se puede transcribir.
3. **Sin transcripción (accionable).** Si la conversación tiene grabación pero no transcripción, empty state con CTA "Transcribir" y la advertencia de coste inline ("Genera coste · ~30 s").
4. **Transcripción vacía (terminal).** Si la transcripción se ejecutó pero terminó sin extraer líneas (típico de audios muy cortos o con silencios largos), mensaje neutro sin acción.
5. **Activo.** Si hay transcripción válida, se renderiza la lista de intervenciones en formato chat más un buscador en la cabecera de la pestaña.

Para conversaciones con `hasFailedTranscription === true`, la pestaña entra en un sexto estado: vista terminal con mensaje "La transcripción falló" + CTA "Reintentar". El reintento es la misma operación que un primer intento.

### Estado de la pestaña Análisis

Cuatro estados, mismo patrón de evaluación en orden:

1. **Procesando.** Si el análisis está en marcha (`analyzingIds` incluye la conversación), se muestra "Analizando".
2. **Pendiente de transcribir y analizar (dead-end resuelto).** Si no hay análisis y tampoco se puede pedir directamente (porque no hay transcripción y la conversación no es chat), el CTA combina los dos pasos: "Transcribir y analizar". Esto evita que el supervisor tenga que rebotar a la otra pestaña, transcribir, esperar y volver. La advertencia de coste lo refleja: "Genera coste · transcripción + análisis".
3. **Lista para analizar (accionable).** Si hay transcripción pero no análisis, el CTA es "Solicitar análisis". Coste: "Genera coste · ~10 s".
4. **Activo.** Resumen + sentimiento renderizados. El resumen se deriva determinísticamente del id (mismo hash que elige la plantilla de transcripción, así nunca hay disonancia entre las dos pestañas).

Para chats, la condición "se puede pedir análisis" siempre se cumple aunque no haya transcripción explícita, porque el chat es texto y el análisis trabaja sobre él directamente.

### Cadena transcribir → analizar

Cuando el supervisor pulsa "Transcribir y analizar" en el dead-end resuelto, el componente lanza dos mutaciones encadenadas: primero la transcripción y, cuando termina, el análisis. La segunda no puede correr en paralelo a la primera porque depende de su resultado.

La implementación canónica vive en el padre (`ConversationsView`) y usa una cola más un effect que la drena cuando el estado lo permite:

```
const [chainAnalysisIds, setChainAnalysisIds] = useState([]);

const handleRequestTranscriptionAndAnalysis = (ids) => {
  setChainAnalysisIds(prev => [...prev, ...ids]);
  handleRequestTranscription(ids, /* inChain */ true);
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

- **Un solo toast secuencial.** `handleRequestTranscription` recibe el flag `inChain` y suprime su success toast cuando es parte de un chain. El sticky "Generando transcripción..." pasa a "Generando análisis..." (mismo id) sin un flash intermedio de "Transcripción lista".
- **Robusto a cambios futuros.** Cuando aterrice backend real, basta sustituir el `setTimeout` que simula la latencia por una promesa real. La cola y el effect siguen funcionando igual.
- **Robusto a múltiples IDs en vuelo.** Cada conversación se drena de la cola cuando su transcripción individual completa. No hay timer compartido que se pueda desincronizar.
- **Sustituyó a un patrón con `setTimeout(6500)` que tenía un bug de closure.** El `setTimeout` capturaba referencias viejas a las conversaciones y filtraba elegibilidad sobre estado obsoleto. La cola se evalúa cada vez que el estado cambia, así que siempre lee la versión actual.

### Cuándo aparece un modal de confirmación

Decisión cerrada del producto: **el modal de confirmación adicional se reserva para operaciones destructivas, no para "esto genera coste"**.

- **Operaciones que solo generan coste** (transcribir por primera vez, analizar por primera vez, exportar): se dispatchan directamente desde el CTA. La advertencia de coste vive inline ("Genera coste · ~30 s") justo debajo del botón. Es consentimiento suficiente; el toast de éxito al terminar cierra el loop.
- **Operaciones destructivas** (sobrescribir datos existentes, borrar): sí van con un modal de confirmación explícito y, cuando aplica, una caja roja avisando del impacto.

Único modal de confirmación que sobrevive en el reproductor (en el prototipo): `RetranscriptionConfirmModal`. Re-transcribir sobrescribe la transcripción existente y, en consecuencia, invalida el análisis derivado. El supervisor lo confirma escribiendo "CONFIRMAR" en mayúsculas. *En v1 esta acción no está expuesta — se aborda en una fase posterior; ver "Acciones en el header del player" más arriba.*

Esta regla evita el patrón "¿estás seguro?" antes de cada acción billable, que el supervisor interpreta como fricción muerta y termina ignorando.

El footer de los confirms destructivos usa "Cancelar" en lugar de "Cerrar" — excepción a la regla general (15.23 / 15.42). En confirms destructivos el supervisor inició explícitamente una acción y el modal es el gate antes de ejecutarla; "Cancelar" expresa mejor que está abortando esa acción consciente.

### Multi-grabación

Si la conversación tiene más de una grabación (`recordings.length > 1`), aparece un componente adicional sobre la barra de audio: el `RecordingTimeline`. Permite al supervisor elegir qué tramo está oyendo. Su lógica se documenta en la sección siguiente.

Cada tramo lleva su propio estado de transcripción (`Recording.hasTranscription`). En el strip de tramos del player, los que ya están transcritos llevan un check pequeño junto a la duración; los pendientes no muestran nada (asimetría presente vs ausente, en lugar de verde vs gris — evita añadir un eje cromático nuevo). El supervisor lee el progreso del lote sin tener que abrir cada tramo.

---

## 3. RecordingTimeline

### ¿Qué hace este componente?

Un selector de tramo para conversaciones con varias grabaciones. Se renderiza solo cuando `recordings.length > 1`; con una sola grabación, no aparece (sería un selector de un único elemento, sin sentido).

Las conversaciones multi-grabación nacen de transferencias entre grupos vía IVR: el cliente entra al menú principal, lo transfieren al equipo comercial, lo transfieren a retención. Cada tramo se graba por separado.

### Cómo calcula la anchura de cada tramo

El componente parte de las duraciones de cada grabación, las suma para obtener el total, y reparte la anchura disponible proporcionalmente:

```
durations[i]  = parseDurationSec(recordings[i].duration)
total         = sum(durations)
fraction[i]   = durations[i] / total
```

Cada segmento se renderiza con `flex-grow: fraction[i]`, `flex-basis: 0` y un `min-width` de 56 píxeles. El `flex-grow` proporcional reparte el espacio según la duración real; el `min-width` evita que un tramo muy corto se vuelva inclickable.

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

El estado `selectedRecordingId` lo controla el padre (`ConversationPlayerModal`). El componente no decide qué tramo está seleccionado; solo notifica al padre cuando el supervisor quiere cambiar via `onSelect(id)`.

Al cambiar de tramo, el padre hace dos cosas: actualizar `selectedRecordingId` y resetear el transporte del audio (`isPlaying: false`, `currentTime: 0`). La barra de audio toma su duración del tramo seleccionado, no de la duración agregada de la conversación.

### Estado de transcripción por tramo

Cada tramo lleva `Recording.hasTranscription` independiente. En la fila de labels del strip, los tramos transcritos muestran un check pequeño junto a la duración; los pendientes no muestran nada. La elección "presente vs ausente" en lugar de "verde vs gris" evita añadir un eje cromático nuevo. El color sigue dedicado a "tramo activo" vs "tramo inactivo", no a estado de transcripción.

El `aria-label` del icono explicita "Tramo transcrito" para lectores de pantalla. Para tramos pendientes no se añade nada (la ausencia del icono ya es la información).

### Edge cases

- **Una sola grabación.** El componente no se renderiza. Lo gatea el padre con `recordings.length > 1`.
- **Anchura del strip insuficiente para todos los `min-width: 56px`.** El contenedor tiene `overflow-hidden`, así que segmentos que pasen del ancho disponible se clipan. Aceptable porque la realidad del producto son 2 a 5 tramos por conversación; si llega un sample con 12 o más, conviene revisar (probablemente migrar a `overflow-x-auto` con scroll horizontal).
- **Duración total cero.** El cálculo usa `total || 1` para evitar división por cero. Si todas las grabaciones tienen duración cero, el reparto es uniforme, lo cual es razonable como fallback.

---

## 4. scToast

### ¿Qué es y por qué hay un wrapper

`scToast` es la API canónica de notificaciones del producto. Por debajo usa `sonner` (la librería que viene con el stack de prototipos) como motor de cola, posicionamiento y accesibilidad, pero la presentación visual está envuelta para que los toasts sigan las convenciones del Smart Contact Design System: tipografía, colores por severidad, layout horizontal o vertical, dismiss, acciones.

El wrapper existe para que ningún sitio del código haga `import { toast } from "sonner"` directamente con su look-and-feel default. Cualquier toast nuevo del producto debe usar `scToast`.

### Cómo elegir la severity

Cinco severities. La elección comunica el tipo de evento, no su gravedad:

| Severity | Cuándo usarla |
|---|---|
| `success` | Operación que terminó OK y el supervisor quiere confirmarlo. Ejemplo: "Transcripción lista". |
| `error` | Fallo que requiere atención. Suele ir con `action` para reintentar o navegar a las fallidas. |
| `warning` | Atención pero no bloqueante. Ejemplo: "10 conversaciones omitidas porque están en proceso". |
| `info` | Información contextual. Ejemplo: "Filtro aplicado". También se usa para sticky toasts de proceso ("Generando..."). |
| `indigo` | Cue específico de IA. Reservado para acciones que merecen highlight. No abusar. |

Como regla general: si el evento no necesita mover al supervisor a una decisión, suele ser `info`. Si la requiere o si quieres que la note, sube a `success` (positivo), `warning` (atención) o `error` (acción).

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

3. **`Infinity` se reserva para estados que requieren acción explícita o procesos largos.** El caso típico es "Generando transcripción..." durante el batch: un toast persistente abajo a la derecha mientras dura el proceso. Cuando el batch termina, ese toast se reemplaza por uno breve de éxito o error.

Cuando un toast es sticky, ten siempre `dismiss: true` (default) para que el supervisor pueda cerrarlo manualmente. Un sticky sin dismiss es una jaula visual.

### Patrón sticky con update in-place

Para los toasts de proceso, el `id` es la pieza clave. Si dos llamadas a `scToast` comparten el mismo `id`, sonner reutiliza el mismo slot visual y actualiza el contenido en sitio en lugar de apilar un toast nuevo.

Patrón canónico (vive en `ConversationsView`):

```
// Al lanzar la operación:
scToast.info({
  title: "Generando transcripción...",
  duration: Infinity,
  dismiss: true,
  id: "progress-toast",
});

// Al completar (mismo id → reemplaza in-place):
scToast.success({
  id: "progress-toast",
  title: `${n} transcripciones listas`,
  message: "Ya están disponibles en la tabla.",
});
```

En el chain transcribir → analizar, la transcripción se llama con `inChain=true` para que suprima su success intermedio. El effect del padre detecta que la transcripción terminó, lanza el análisis, y este sobrescribe el sticky con "Generando análisis..." (mismo id) sin un flash de "Transcripción lista".

---

## Estados visuales de una fila en la tabla

Una fila puede estar en uno de varios estados visibles. Las combinaciones más comunes:

- **Normal.** Todo en blanco. Checkbox seleccionable. Click en el icono de estado abre el reproductor.
- **Recientemente cambiada (amarilla).** Transcrita o analizada hace poco. Se reinicia al estilo normal cuando el supervisor abre su reproductor (click). El amarillo no significa "recién transcrita" estrictamente — también aparece cuando se acaba de generar análisis sobre una conversación ya transcrita.
- **Procesándose (spinner).** Transcripción o análisis en curso. Checkbox deshabilitado. Si el supervisor selecciona otras filas y pulsa Procesar, las que están procesándose simplemente no entran en el lote nuevo.
- **Retención vencida** (ejemplo canónico: custodia GDPR). Fila atenuada (opacidad ~60%), tooltip explicando el motivo de la restricción al hover. Checkbox activo y seleccionable, pero al procesar cae del lote sin aviso. Comparte `isLocked` con las filas en proceso. El ejemplo de la columna es GDPR, pero la regla se aplica a cualquier restricción legal de retención que afecte al chat.
- **Transcripción fallida.** Icono de estado en rojo. Click abre el reproductor con la pestaña Transcripción en estado terminal + CTA "Reintentar". El supervisor puede llegar a estas filas vía el filtro "Solo fallidas" del panel o vía la acción "Ver fallidas" del toast de error.

La combinación que más confunde es "amarilla + procesándose". No ocurre — el amarillo aparece después de que la operación termina, no durante. Mientras está en curso es "spinner", y al acabar pasa a "amarilla" hasta que el supervisor la inspecciona.

---

## Glosario

- **Conversación**: la unidad de contenido del producto. Puede ser una llamada o un hilo de chat. Una conversación puede tener una o varias grabaciones (las llamadas con transferencias IVR).
- **Tramo o grabación**: cada uno de los segmentos de audio que componen una conversación multi-grabación. Para una conversación de 1 grabación, "tramo" y "conversación" son sinónimos.
- **Transcripción**: el proceso (y el resultado) de convertir audio en texto, con separación de hablantes. Es el paso base. Sin transcripción no hay nada más.
- **Análisis**: pase de IA sobre una conversación transcrita (o sobre un chat). Produce dos cosas: un resumen breve y una valoración de sentimiento. Es opcional.
- **Pendiente**: estado de una conversación que aún no ha pasado un paso (transcripción o análisis). En multi-grabación, una conversación está pendiente si **alguno** de sus tramos lo está.
- **MECE**: mutually exclusive, collectively exhaustive. Aplicado a los cuatro contadores del bulk modal: `nSelected = nTrans` (algunos) `+ nAnBase` (algunos, posiblemente solapados con nTrans) `+ nAlready`. La parte solapada está controlada explícitamente.
- **Fire-and-forget**: el componente dispatcha la acción y se cierra sin esperar respuesta. El feedback (éxito o fallo) llega vía toast desde la vista que lo invocó.
- **Empty state**: el cuerpo de un componente cuando no hay datos para mostrar. Tres variantes en el reproductor: con acción (`DecisionState`), procesando (`ProcessingState`) y terminal sin acción (`TerminalNote`).
- **Sticky toast**: toast persistente (`duration: Infinity`) que se mantiene en pantalla hasta que se reemplaza por otro con el mismo `id` o el supervisor lo descarta manualmente. Se usa para procesos largos como "Generando transcripción...".

---

## Decisiones de producto cerradas

> Para el listado completo en lenguaje narrativo (qué se decidió, por qué, cuándo), ver el documento hermano *Memory · Decisiones de diseño*. Lo que sigue es el resumen rápido en jerga técnica.

- **El bulk transcribe TODAS las grabaciones de cada conversación seleccionada.** No elige tramo. La elección de tramo concreto vive solo en el modo individual. El modal muestra el desglose explícito antes de confirmar.
- **`Conversation.hasTranscription` para multi-grabación es TRUE solo si todas las grabaciones lo están.** Una conversación parcialmente transcrita es funcionalmente "pendiente". Implementado: `Recording.hasTranscription` por tramo + agregado computado en `normalizeChats`.
- **El modal de confirmación adicional se reserva para operaciones destructivas.** Las operaciones que solo generan coste se dispatchan directo, con la advertencia inline en el CTA. Único superviviente en el prototipo: `RetranscriptionConfirmModal` (post-v1 · la re-transcripción no entra en el primer rollout).
- **El bulk no decide por el supervisor.** Los items en proceso se filtran antes de llegar al modal (selección masiva los deselecciona silenciosamente; en vista individual no son seleccionables). El modal nunca recibe items en vuelo.
- **Chats con retención vencida se excluyen silenciosamente.** Los chats con `deleted: true` (custodia GDPR vencida es el ejemplo canónico; aplican otros casos según normativa) quedan fuera del bulk · no se cuentan en `nTrans` / `nAnBase`, pero siguen visibles en el listado en estado "no recuperable". La fila lo comunica visualmente; el modal no añade líneas explicativas.
- **No hay cancelación de batch a mitad de proceso.** Una vez disparada la acción, el coste se genera completo. La copia del modal lo refleja: no se promete "cancelar" en ningún sitio.
- **Errores se notifican solo al inicio y al final del batch.** El backend no notifica errores granulares durante el proceso. La UI no diseña feedback fino tipo "fallo en la 27 de 50".
- **Sticky toast con id estable durante operaciones billables.** Un único toast persistente (`id: "progress-toast"`) cubre todo el ciclo: kickoff con `info` + `duration: Infinity`, reemplazo in-place al terminar con `success` o `error` con el mismo id. En el chain transcribir → analizar, la fase 1 suprime su success para que el toast pase de "Generando transcripción..." a "Generando análisis..." sin flash intermedio.
- **Botón "Analizar" en el header del reproductor.** Visible siempre, disabled si no procede. Tooltips dinámicos explican el motivo del estado. Click → dispatch directo, sin modal de confirmación intermedio.
- **"Cancelar" en confirmaciones destructivas.** Excepción a la regla general "Cerrar". Aplica a `DeleteCategoryDialog` y a `RetranscriptionConfirmModal` (este último post-v1). El resto de modales sigue usando "Cerrar".
- **Filtros multi-grabación en `TypeFilterPanel`.** Sección "Multi-grabación" con dos toggles: "solo con varios tramos" (recordings.length > 1) y "solo con tramos parcialmente transcritos" (mezcla de transcritos y pendientes en una misma conversación). El segundo es la protección directa contra el footgun de select-all reprocesando tramos pendientes de conversaciones que el supervisor tocó en unitario. Single source of truth en `unifiedTypeFilters.multirec`; chips neutros en la toolbar siguen el patrón del chip rojo de "solo fallidas".
- **Aviso de tramos ya iniciados en el bulk modal.** Cuando la selección incluye llamadas multi-rec con al menos un tramo ya transcrito manualmente, el hint del hero compone la pieza "M con tramos ya iniciados" junto a la pieza existente "N llamadas con varios tramos". El supervisor lo ve antes de pulsar Procesar.
- **Diarización retirada del producto entero.** El campo `Conversation.hasDiarization` se borró del schema. Cualquier referencia residual en código o copy es un bug.

## Pendiente de decidir

- **Contrato de backend para los contadores `nTrans`, `nAnBase`, `nAlready`.** Endpoint concreto, payload esperado, paginación si la selección es muy grande.
- **Eventos de telemetría.** Qué eventos disparar al abrir el modal, al togglear el switch, al confirmar; con qué atributos. Útil para medir adopción del switch de análisis.
- **Límite máximo de selección para el bulk.** ¿Hay un tope duro? ¿Aviso si se excede? ¿Paginación de la acción?
