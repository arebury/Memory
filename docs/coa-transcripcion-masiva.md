# COA · Transcripción masiva y unitaria

*Memory · Smart Contact*

---

## Consideraciones generales

- Cada transcripción y cada análisis con IA generan coste. El producto no desglosa euros por operación — esa parte queda fuera del scope, vive en la capa de facturación. Lo que sí hace es avisar antes de lanzar cualquier operación que genere coste: en el modal masivo se muestra el volumen (cuántas transcripciones, cuántos análisis se van a ejecutar) como números grandes, y en las acciones unitarias se añade una estimación de tiempo aproximada bajo el CTA ("genera coste · ~30 s"). El supervisor decide con esa información, sin un cálculo monetario exacto.
- Un chat es texto por definición. No se "transcribe" como una llamada. A efectos del producto, sí tiene un atributo `transcrito` binario para que los filtros y la tabla traten ambos canales con la misma forma.
- Las llamadas pueden tener una o varias grabaciones (multi-tramo). Cuando hay varios tramos, el coste real lo carga el número de audios, no el número de conversaciones. El producto tiene que reflejar eso o engaña al supervisor.
- Las conversaciones con custodia GDPR vencida no se transcriben aunque estén seleccionadas. El filtro defensivo es silencioso (sin línea adicional en el modal) para no añadir ruido visual.
- "Cancelar" se reserva para confirmaciones destructivas. El resto de modales usan "Cerrar" porque pre-submit no hay nada que cancelar.
- No se introducen modales de confirmación intermedios para acciones que solo generan coste (transcribir, analizar). El cost cue va inline en el modal masivo, y la unitaria dispatcha directo. Modal de confirmación SOLO si la operación es destructiva.

[NOTA: la regla "modal de confirmación solo para destructivo" se canonizó tras retirar el modal intermedio que aparecía antes de transcribir/analizar por primera vez. El supervisor ya ve el volumen en el hero del modal masivo y la etiqueta "genera coste" en el CTA unitario; repetir un "¿seguro?" lo trataba como tonto.]

---

## Solución · Transcripción masiva

### Punto de entrada

- En la cabecera de la tabla, junto a los filtros, se muestra el botón "Procesar" cuando hay al menos una fila seleccionada.
- Si no hay selección, el botón no aparece (no hay acción que ofrecer).

[imagen: cabecera de la tabla con varias filas seleccionadas y el botón "Procesar" visible junto a los filtros]

### Modal "Procesar conversaciones"

- Título del modal: "Procesar conversaciones".
- Subtítulo: cuenta lo que está realmente seleccionado, desglosado.
  - Una sola: "1 conversación seleccionada"
  - Varias del mismo canal: "8 conversaciones seleccionadas"
  - Mezcla: "8 conversaciones seleccionadas · 5 llamadas, 3 chats"
- Cuerpo del modal: dos celdas iguales separadas por una línea hairline.
  - Celda izquierda · hero number de transcripciones a generar, sobre fondo neutro. Caption: "transcripciones a generar" o "todo procesado" si todo lo seleccionado ya estaba.
  - Celda derecha · hero number de análisis a generar, sobre fondo accent (amarillo del DS) cuando el toggle "Incluir análisis" está activo, sobre fondo neutro y atenuado cuando está desactivado. Caption: "admite análisis" si N=1, "admiten análisis" si N>1.
- Bajo el hero izquierdo, hint dinámico cuando aporta info nueva:
  - "Incluye 3 llamadas con varios tramos" — solo aparece cuando hay multi-tramo en la selección y el supervisor necesita entender por qué el número de audios > número de conversaciones.
  - El slot del hint mantiene su altura mínima aunque esté vacío, para evitar que el modal salte de tamaño cuando aparece/desaparece.

[imagen: modal "Procesar conversaciones" con selección mixta · subtitle "8 conversaciones seleccionadas · 5 llamadas, 3 chats" · hero izquierdo "8 transcripciones a generar" + hint "Incluye 2 llamadas con varios tramos" · hero derecho "10 admiten análisis" con toggle activo]

- Toggle "Incluir análisis" debajo del hero derecho. Por defecto activo si todo lo seleccionado ya está transcrito (el siguiente paso natural es analizar). Por defecto inactivo en el resto de casos.
- Footer:
  - Izquierda: "Cerrar" (cancela y cierra el modal sin hacer nada).
  - Derecha: "Procesar" (botón primario · dispara la operación).
  - Si la operación falla por validación, aparece una banda de error inline bajo el cuerpo, sin reflow del modal.

[NOTA: el "Cerrar" del footer es intencional, no "Cancelar". Pre-submit no hay nada que cancelar. "Cancelar" se reserva para confirmaciones destructivas.]

### Regla multi-tramo

- Cuando el supervisor selecciona una conversación de varios tramos, el procesado masivo transcribe TODOS los tramos de esa conversación, no solo uno.
- El hero number cuenta audios, no conversaciones. Para 3 llamadas multi-tramo con 4 + 3 + 2 audios, el hero muestra "9" y el hint explica "Incluye 3 llamadas con varios tramos".
- A nivel de modelo, una conversación se considera "transcrita" solo si TODOS sus tramos lo están. Mientras quede uno sin transcribir, el atributo `transcrita` es falso.

[NOTA: esta regla cierra una decisión que estaba abierta · el modelo separa "transcripción atómica por tramo" para la vista analítica de SmartContact, pero Memory vive en el eje operativo y trata la conversación como unidad atómica.]

### Custodia GDPR

- Las conversaciones con custodia GDPR vencida se filtran silenciosamente del lote a procesar.
- No aparecen en el contador del hero, no aparecen en el desglose, no disparan error.
- En la tabla, su fila se muestra con opacidad reducida y un tooltip al hover explica "Custodia GDPR vencida".

[imagen: tabla con dos filas atenuadas (opacity ~60%) por custodia vencida · tooltip visible al hover sobre una de ellas]

### Sticky toast "Generando..."

- Al pulsar "Procesar" en el modal, este se cierra y aparece un toast persistente abajo a la derecha con el copy "Generando transcripción...".
- El toast no auto-cierra. Tiene una × para descartarlo si el supervisor quiere quitarlo de la vista.
- Mientras la operación está activa, las filas afectadas muestran un spinner en su columna de estado, así que el supervisor tiene dos puntos de feedback: el persistente (toast) y el puntual (fila).
- Si el supervisor activó "Incluir análisis", el toast pasa de "Generando transcripción..." a "Generando análisis..." sin desaparecer, manteniendo continuidad visual.
- Al terminar, el toast persistente se reemplaza por un toast de éxito con el resultado: "X transcripciones listas" / "X análisis listos". Este sí auto-cierra a los 3 segundos.

[imagen: vista de la tabla con sticky toast visible abajo a la derecha · copy "Generando transcripción..." · varias filas con spinner en columna de estado]

[NOTA: el sticky toast es nuevo respecto al estado actual del Figma legacy. Es la pieza más importante de la sesión 15.43 — sin él, si el supervisor cambia de vista durante el batch, pierde visibilidad del estado en curso.]

### Estado de la tabla durante la operación

- Las filas a procesar quedan con su checkbox deshabilitado y un spinner en la columna de estado.
- El supervisor puede seguir interactuando con el resto de la tabla (otros filtros, otras selecciones, clic en una fila no procesada para abrir el reproductor).
- Si intenta cambiar de vista (Repository, Sidebar), el sticky toast queda visible y le recuerda que hay trabajo en curso.

### Estado de la tabla al terminar

- Las filas afectadas se pintan en amarillo suave como "recientemente cambiada" hasta que el supervisor las inspecciona (clic).
- El spinner desaparece y el icono de estado pasa al estado correcto: "transcrita", "transcrita + analizada", o "transcripción fallida" si algo se rompió.
- Si hay fallos parciales, el toast final usa la severidad de error y ofrece una acción "Ver fallidas" que aplica un filtro automático en la tabla.

[imagen: tabla tras el batch · 7 filas en amarillo suave · 1 fila en estado de error con icono distinto · toast de error visible con acción "Ver fallidas"]

---

## Solución · Transcripción unitaria

### Punto de entrada

- Clic en el icono de estado de una fila abre el reproductor de esa conversación en un modal.
- También se puede abrir el reproductor desde el menú contextual de la fila.

### Modal reproductor · v1 (versión que entra en producción)

El reproductor unitario que se construye ahora parte del **reproductor legacy de Smart Contact** y le aplica unos cuantos parches baratos. La estructura visual es la del Figma v1 que conoce el equipo:

- Cabecera del modal: título de la conversación + metadatos (canal, fecha, duración, agente).
- Debajo de la cabecera, barra de audio simple para llamadas (play/pause, scrubber, tiempo). El layout sigue la maqueta legacy.
- Multi-tramo: si la llamada tiene varias grabaciones, se gestiona con el patrón actual del legacy (selector aparte para elegir tramo). v1 NO trae el reproductor unificado del prototipo.
- Tabs: "Transcripción" y "Análisis" (renombradas respecto al copy del legacy original).
- A la derecha de la fila de tabs, fila de acciones con tres iconos:
  - "Re-transcribir" — solo aparece si ya hay transcripción. Abre un modal de confirmación con caja roja y obliga a escribir "CONFIRMAR" para proceder. Operación destructiva: reemplaza la transcripción y borra el análisis derivado.
  - "Análisis" — **botón nuevo añadido en v1 para discoverability**. Visible siempre, deshabilitado si no hay transcripción o si ya se analizó. Clic genera el análisis directamente, sin modal de confirmación intermedio.
  - "Descargar" — descarga audio + transcripción si hay, solo texto si es chat.
- Diarización quitada del producto entero (ya no aparece como concepto en pestañas, copy ni componentes).
- Confirmaciones para transcribir/analizar por primera vez quitadas. Cost cue inline en el CTA, igual que el modal masivo.

[imagen: reproductor unitario v1 · audio bar simple del legacy · tabs "Transcripción" y "Análisis" · fila de acciones a la derecha con Re-transcribir, Análisis (nuevo) y Descargar]

[NOTA: el botón "Análisis" en la fila de acciones del header es nuevo en v1. Antes, para descubrir que se podía generar análisis había que entrar en la pestaña "Análisis" y leer su empty state. Ahora se descubre desde la vista por defecto. Tooltip "Análisis" si está habilitado · "Requiere transcripción" o "Análisis ya realizado" si está deshabilitado.]

### Modal reproductor · v2 (a dónde queremos llegar a medio plazo)

v2 es el reproductor que ya vive en el prototipo de Memory. Es el target eventual, no parte del rollout inicial. Se valida y se ejecuta en una segunda fase si el feedback real de los supervisores justifica la inversión.

Lo que v2 trae que v1 no tiene:

- **Sticky head**: la barra de audio y la fila de tabs quedan pinned arriba del cuerpo del modal. Al hacer scroll dentro de la transcripción, el transporte y los tabs siguen visibles.
- **Tab body con altura flexible**: el cuerpo de la pestaña ocupa el espacio que queda; los empty states centran sobre el área visible real, no sobre una caja de altura fija que empuja CTAs fuera de pantalla.
- **Reproductor multi-tramo unificado**: para conversaciones con varias grabaciones, un solo componente de tres filas — transport + tiempo, barra segmentada con anchura proporcional a la duración real de cada tramo, etiquetas alineadas con flechas para moverse entre tramos. Sustituye al selector aparte del legacy.
- **Per-tramo Check icon**: cada tramo transcrito muestra un check pequeño junto a la duración. Asimetría presente vs ausente para los pendientes (no verde/gris).
- **Empty states refinados**: tres variantes consistentes para los cinco estados de Transcripción y los cuatro de Análisis — con CTA, procesando con spinner, terminal sin acción. Columna única centrada.

[imagen: reproductor unitario v2 (estado del prototipo de Memory) · sticky head · multi-tramo unificado con barra segmentada · empty states centrados]

[NOTA: v2 NO sustituye a v1 de un día para otro. Es un upgrade que aterriza cuando el equipo decide que el feedback real lo justifica. Si los supervisores nunca piden más, v1 puede vivir indefinidamente — la decisión es consciente.]

### Tabs

- "Transcripción":
  - Si la conversación tiene transcripción, muestra las líneas con timestamp y locutor (1/2). Buscador inline para filtrar.
  - Si no la tiene, muestra empty state centrado en una columna con CTA "Generar transcripción". Tras pulsarlo, sticky toast "Generando transcripción..." y al terminar la línea reaparece con la transcripción cargada.
- "Análisis":
  - Si la conversación tiene análisis, muestra resumen, sentimiento, categorías IA, otros derivados.
  - Si no la tiene pero sí está transcrita, empty state con CTA "Generar análisis".
  - Si no está ni transcrita ni analizada, empty state con CTA "Transcribir y analizar" (chain · primero transcribe, luego analiza · un solo toast sticky secuencial que cambia de copy).

[imagen: tab "Análisis" en empty state · una sola columna centrada · CTA "Transcribir y analizar"]

### Re-transcripción

- Modal de confirmación destructivo dedicado.
- Icono de alerta + caja roja con texto explicativo.
- Input field para escribir "CONFIRMAR" en mayúsculas — el botón primario "Re-transcribir" solo se habilita al matchear exacto.
- Footer:
  - Izquierda: "Cancelar" — cierra el modal sin hacer nada.
  - Derecha: "Re-transcribir" en color de error (rojo del DS).

[NOTA: aquí el footer SÍ usa "Cancelar" en lugar de "Cerrar". Es una excepción para confirmaciones destructivas, donde "Cancelar" expresa con más fuerza que el supervisor está abortando una acción que ya estaba en marcha mentalmente.]

[imagen: modal "Re-transcribir" abierto · icono de alerta · caja roja con texto explicativo · input "CONFIRMAR" · botón primario en rojo]

---

## Traducciones

### Strings de la transcripción masiva

| ES | FR | EN |
|---|---|---|
| Procesar | Traiter | Process |
| Procesar conversaciones | Traiter les conversations | Process conversations |
| 1 conversación seleccionada | 1 conversation sélectionnée | 1 conversation selected |
| {N} conversaciones seleccionadas | {N} conversations sélectionnées | {N} conversations selected |
| {N} llamadas | {N} appels | {N} calls |
| {N} chats | {N} chats | {N} chats |
| transcripciones a generar | transcriptions à générer | transcriptions to generate |
| admite análisis | admet une analyse | eligible for analysis |
| admiten análisis | admettent une analyse | eligible for analysis |
| Incluir análisis | Inclure l'analyse | Include analysis |
| Incluye {N} llamada con varios tramos | Inclut {N} appel à plusieurs segments | Includes {N} call with multiple segments |
| Incluye {N} llamadas con varios tramos | Inclut {N} appels à plusieurs segments | Includes {N} calls with multiple segments |
| todo procesado | tout traité | all processed |
| Cerrar | Fermer | Close |
| Cancelar | Annuler | Cancel |
| Custodia GDPR vencida | Conservation RGPD expirée | GDPR custody expired |

### Strings del sticky toast

| ES | FR | EN |
|---|---|---|
| Generando transcripción... | Génération de la transcription... | Generating transcription... |
| Generando análisis... | Génération de l'analyse... | Generating analysis... |
| Transcripción lista | Transcription prête | Transcription ready |
| {N} transcripciones listas | {N} transcriptions prêtes | {N} transcriptions ready |
| Análisis listo | Analyse prête | Analysis ready |
| {N} análisis listos | {N} analyses prêtes | {N} analyses ready |
| Ya puedes consultarla en el reproductor. | Vous pouvez la consulter dans le lecteur. | You can review it in the player. |
| Ya están disponibles en la tabla. | Elles sont disponibles dans le tableau. | They are available in the table. |
| Resumen y sentimiento ya disponibles. | Résumé et sentiment disponibles. | Summary and sentiment available. |
| Incluye {N} audios en total (algunas llamadas tienen varios tramos). | Inclut {N} audios au total (certains appels ont plusieurs segments). | Includes {N} audios in total (some calls have multiple segments). |
| {N} transcripciones fallaron | {N} transcriptions ont échoué | {N} transcriptions failed |
| Ver fallidas | Voir les échecs | View failed |
| Descargando audio | Téléchargement de l'audio | Downloading audio |
| Descargando conversación | Téléchargement de la conversation | Downloading conversation |
| Descargando {N} conversaciones | Téléchargement de {N} conversations | Downloading {N} conversations |

### Strings de la transcripción unitaria

| ES | FR | EN |
|---|---|---|
| Transcripción | Transcription | Transcription |
| Análisis | Analyse | Analysis |
| Re-transcribir | Re-transcrire | Re-transcribe |
| Análisis (tooltip botón) | Analyse | Analysis |
| Requiere transcripción | Transcription requise | Requires transcription |
| Análisis ya realizado | Analyse déjà effectuée | Analysis already done |
| Generar análisis | Générer l'analyse | Generate analysis |
| Generar transcripción | Générer la transcription | Generate transcription |
| Transcribir y analizar | Transcrire et analyser | Transcribe and analyze |
| Descargar audio | Télécharger l'audio | Download audio |
| Descargar conversación | Télécharger la conversation | Download conversation |
| Buscar en la transcripción... | Rechercher dans la transcription... | Search transcription... |
| Resumen | Résumé | Summary |
| Sentimiento | Sentiment | Sentiment |
| Categorías IA | Catégories IA | AI categories |

### Strings del modal de re-transcripción

| ES | FR | EN |
|---|---|---|
| Re-transcribir conversación | Re-transcrire la conversation | Re-transcribe conversation |
| Escribe CONFIRMAR para continuar | Saisissez CONFIRMER pour continuer | Type CONFIRM to continue |
| Esta acción reemplaza la transcripción actual y borra el análisis derivado. | Cette action remplace la transcription actuelle et supprime l'analyse dérivée. | This action replaces the current transcription and deletes the derived analysis. |
| Procesando... | Traitement... | Processing... |

[NOTA: para el equivalente francés de "CONFIRMAR" usar "CONFIRMER", y para el inglés "CONFIRM". El input compara literal en mayúsculas, así que cada locale tiene su palabra clave.]

---

[NOTA FINAL: este documento describe v1 — la versión que entra en producción primero. v1 = reproductor legacy de Smart Contact con parches baratos (botón Análisis en header, pluralización, "Cancelar" en destructive, quitar modal intermedio de confirmación, quitar diarización, renombrar tabs, sticky toast). v2 = el reproductor del prototipo de Memory, que es el target a medio plazo y se valida en una segunda fase si los supervisores piden más. v3 aterriza cuando haya backend real para hero count = audios y chain transcribir→analizar event-driven sobre eventos del backend en lugar de timers simulados. El prototipo que el usuario tiene a mano para revisar muestra v2; este COA describe lo que se construye AHORA (v1).]
