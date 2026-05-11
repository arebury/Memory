# COA · Transcripción masiva y unitaria

*Memory · Smart Contact*

---

## Resumen

Memory deja revisar miles de conversaciones (llamadas y chats) y decidir cuáles transcribir y analizar con IA, sin escucharlas todas a mano.

Este documento describe la solución que entra en producción primero (v1): el modal de procesamiento masivo, el reproductor unitario, los filtros relevantes y los estados que el supervisor verá en la tabla. El reproductor unitario v1 parte del reproductor legacy de Smart Contact con ajustes mínimos; el refactor completo (v2) es el prototipo de Memory y entra en una segunda fase si los supervisores piden más.

Cómo leerlo: cada sección abre con una línea de orientación. Las que enumeran variantes usan tablas. Las notas entre `[corchetes]` son contexto para el equipo de Memory y se quitan al copiar a Jira.

---

## Recursos

Tres enlaces que acompañan a este documento. Cada uno cubre una capa distinta de la solución:

- **Lógica de conteo y reglas de negocio** · [https://github.com/arebury/Memory/blob/main/docs/logica-de-conteo.md](https://github.com/arebury/Memory/blob/main/docs/logica-de-conteo.md). Es la referencia técnica de qué datos necesita cada componente, qué deriva y qué reglas aplica antes de lanzar acciones. Léelo cuando aparezca una duda concreta sobre contadores, estados, agregados o filtros.
- **Prototipo · entender el flujo** · [https://memoryplus3.netlify.app/](https://memoryplus3.netlify.app/). Es la versión navegable de Memory para entender cómo se mueven las piezas (selección, modal masivo, procesado, resultado, o click en fila para abrir el reproductor unitario). No es Hi-Fi pixel perfect: sirve para validar el flujo y descubrir los estados.
- **Figma · Hi-Fi de los componentes** · [https://www.figma.com/design/EKXnAv7FND5VO6EcpKq3ZH/Memory--?m=dev](https://www.figma.com/design/EKXnAv7FND5VO6EcpKq3ZH/Memory--?m=dev). El board en Dev Mode con los componentes a 1:1, medidas, tokens y specs listos para implementar. Es la fuente para anchuras, paddings, colores y tipografías exactas.

---

## Consideraciones generales

- **Coste.** Cada transcripción y cada análisis con IA generan coste. El producto **no desglosa euros por operación**. Esa parte vive en la capa de facturación. Sí muestra volumen en el modal masivo y una estimación de tiempo aproximada en las unitarias ("genera coste · ~30 s").
- **Chats.** Son texto por definición; no se "transcriben". Llevan el atributo `transcrito` para que filtros y tabla traten ambos canales con la misma forma.
- **Multi-tramo.** Una llamada con transferencias entre grupos genera varios audios (uno por tramo), pero el listado la muestra como una única fila. A la hora de procesar, lo que se cobra son los audios, no las filas seleccionadas. Si el supervisor selecciona 10 filas y algunas son multi-tramo, el lote real puede ser de 25 transcripciones. El número grande del modal masivo refleja la cuenta real de audios.
- **Retención de contenido.** Algunas conversaciones tienen restricciones legales de retención y dejan de ser recuperables tras un tiempo (por ejemplo, chats con custodia GDPR vencida · la normativa puede establecer límites para otros casos también). Esas conversaciones se filtran del lote sin avisar, no se transcriben aunque estén seleccionadas.
- **Sin cancelación.** Una vez lanzada una operación masiva, no se puede cancelar a mitad. El backend no expone API de cancelación parcial. El producto no promete "Cancelar" en ningún sitio del flujo masivo.
- **Feedback entre sesiones.** Cuando el supervisor cierra la sesión, el feedback transitorio anterior no se conserva: la fila amarilla de "recientemente procesada", el indicador de "transcripción fallida" y el filtro "Solo fallidas" del panel se pierden al volver a entrar. Solo las conversaciones que estén ACTIVAMENTE en curso muestran su indicador, porque se deriva del estado vivo del backend. De momento, esto responde a una limitación técnica que aún no tiene solución disponible.

---

## Solución · Transcripción masiva

### Punto de entrada

- Botón "Procesar" en la cabecera de la tabla, junto a los filtros.
- Aparece solo cuando hay al menos una fila seleccionada.

[imagen: cabecera de la tabla con filas seleccionadas y el botón "Procesar" visible]

### Modal "Procesar conversaciones"

Estructura: cabecera (título + subtítulo) · cuerpo (dos celdas separadas por una línea fina) · footer (Cerrar / Procesar).

**Cabecera**

- Título: "Procesar conversaciones".
- Subtítulo, según la selección:
  - "1 conversación seleccionada"
  - "8 conversaciones seleccionadas"
  - "8 conversaciones seleccionadas · 5 llamadas, 3 chats" (cuando hay mezcla)

**Cuerpo · celda izquierda · transcripciones**

- Número grande de transcripciones a generar.
- Caption: "transcripciones a generar". Si todo lo seleccionado ya está transcrito, pasa a "todo procesado" y el número se atenúa.
- Bajo el número, un hint dinámico (ver "Hint del hero" más abajo).

**Cuerpo · celda derecha · análisis**

- Número grande de análisis a generar.
- Toggle "Incluir análisis" debajo:
  - Activo por defecto si todo lo seleccionado ya está transcrito (el siguiente paso natural es analizar).
  - Inactivo en el resto de casos.
- Cuando el toggle está activo, el número va en el accent del DS. Cuando está inactivo, gris atenuado.
- Caption: "admite análisis" si N=1, "admiten análisis" si N>1.

**Footer**

- Izquierda: "Cerrar". Cierra el modal sin hacer nada.
- Derecha: "Procesar". Lanza la operación.
- Si la validación falla, una banda de error inline aparece bajo el cuerpo. El modal no cambia de tamaño.

**Hint del hero**

Aparece bajo la celda izquierda. Compone hasta dos cláusulas independientes separadas por punto:

- **Incluye …** · resume lo que SÍ entra en el lote. Hasta dos piezas unidas por " · ":
  - Si hay llamadas multi-tramo en la selección y el toggle análisis está apagado: `N llamadas con varios tramos`.
  - Si hay conversaciones con tramos ya transcritos manualmente: `M con tramos ya iniciados` (ver "Multi-tramo parcial" más abajo).
- **Excluye …** · resume lo que se omite silenciosamente del lote. Una pieza:
  - Si hay filas en proceso (transcribiéndose o analizándose) en la selección: `K en proceso`. El bulk las filtra para evitar lanzar la misma operación dos veces sobre la misma fila (= doble coste en producción).

Ejemplos:
- Solo multi-tramo: `Incluye 2 llamadas con varios tramos.`
- Solo en proceso: `Excluye 3 en proceso.`
- Mezcla: `Incluye 2 llamadas con varios tramos · 1 con tramos ya iniciados. Excluye 3 en proceso.`

El espacio del hint mantiene altura aunque esté vacío, para evitar que el modal salte de tamaño cuando aparece o desaparece.

[imagen: modal "Procesar conversaciones" con selección mixta · subtitle "8 conversaciones seleccionadas · 5 llamadas, 3 chats" · número izquierdo "8" con hint compuesto · número derecho "10 admiten análisis" con toggle activo]

### Regla multi-tramo

- El bulk transcribe TODOS los tramos pendientes de cada conversación seleccionada. No elige tramo.
- El número grande del modal cuenta audios, no conversaciones. Para 3 llamadas multi-tramo con 4 + 3 + 2 audios, el número muestra "9".
- Una conversación cuenta como "transcrita" solo si TODOS sus tramos lo están.

### Multi-tramo parcial · caveat conocido

Caso: el supervisor abre una conversación multi-tramo, transcribe un tramo concreto desde el reproductor unitario y deja los otros pendientes a propósito.

- La conversación queda con su agregado `hasTranscription = false` (porque no todos los tramos están transcritos).
- Si después hace select-all en la tabla, esa conversación entra en el lote y el bulk transcribe los tramos restantes.
- Cost-wise no hay doble cobro (los tramos ya transcritos se respetan, idempotente), pero el supervisor procesa cosas que intencionadamente había dejado fuera.

**Dos mitigaciones en el producto:**

- El hint del hero añade `M con tramos ya iniciados` cuando aplica. El supervisor lo ve antes de pulsar Procesar.
- El filtro "Multi-grabación · solo con tramos parcialmente transcritos" del panel de filtros deja encontrarlas proactivamente y deseleccionarlas a mano (ver sección "Filtros relevantes" más abajo).

### Custodia GDPR

- Las conversaciones con custodia GDPR vencida (más en general: retención de contenido vencida) se filtran del lote sin avisar.
- No aparecen en el número grande, ni en el desglose del subtítulo, ni disparan error.
- En la tabla se ven atenuadas (opacidad ~60%); al pasar el cursor aparece un tooltip explicativo del motivo de la restricción.
- Su checkbox está activo y son seleccionables. El supervisor puede abrir el reproductor para revisar lo que SÍ esté disponible y, desde el modal Download del legacy, descargar formato Record/CDR si aplica (el legacy gestiona el caso "no descargable" con su propio aviso). Lo único que NO se permite es procesar transcripción/análisis sobre ellas: el bulk las excluye en silencio.

[imagen: tabla con filas atenuadas por custodia vencida · tooltip visible al hover]

### Mientras se procesa

- Al pulsar "Procesar", el modal se cierra y aparece un toast persistente abajo a la derecha con el texto "Generando transcripción...".
- El toast no se auto-cierra. Tiene una × para descartarlo manualmente.
- Las filas afectadas muestran un spinner en la columna Estado y sus checkboxes pasan a deshabilitados.
- El supervisor puede seguir trabajando con el resto de la tabla y abrir conversaciones que no estén procesándose.
- Si selecciona nuevas filas y pulsa "Procesar" otra vez, el lote actual sigue en curso y se añade el nuevo. Los toasts se solapan en la misma área.
- Si activó "Incluir análisis", al terminar las transcripciones el toast pasa a "Generando análisis..." sin desaparecer en medio.

[imagen: tabla con sticky toast visible · filas con spinner · checkbox deshabilitado en esas filas]

### Cuando termina

- Las filas afectadas se pintan en amarillo suave como "recientemente cambiada".
- Siguen amarillas hasta que el supervisor las inspecciona. Click las reinicia al estilo normal.
- El spinner desaparece; el icono de estado pasa al estado correcto.
- El toast persistente se reemplaza por un toast de éxito breve ("X transcripciones listas" o "X análisis listos"). Auto-cierra a los pocos segundos.

[imagen: tabla tras el batch · filas amarillas · iconos de estado actualizados]

### Cuando algo falla

- El toast persistente se reemplaza por uno de error: "X transcripciones fallaron" + acción "Ver fallidas".
- "Ver fallidas" activa un filtro automático que deja visibles solo las filas que fallaron.
- Mientras ese filtro está activo, aparece un chip rojo en la toolbar con la cuenta y una × para quitarlo.
- El mismo filtro vive en el panel de filtros, sección "Estado", con un toggle "Solo fallidas". Así el supervisor lo puede reactivar más adelante sin esperar otro error.
- Las filas con error muestran un icono específico en rojo. Click abre el reproductor con la pestaña Transcripción en estado terminal + CTA "Reintentar".
- El reintento es la misma operación que un primer intento. Se puede lanzar desde el reproductor o seleccionando la fila y pulsando Procesar.

[imagen: tabla filtrada por "solo fallidas" · chip rojo en la toolbar · filas con icono de error · toast de error con acción "Ver fallidas"]

[NOTA: el backend no notifica errores granulares durante el proceso, solo al inicio y al final del batch. La UI no diseña feedback fino tipo "X de Y completadas con error". El evento de error llega como uno único al terminar.]

---

## Solución · Transcripción unitaria

### Punto de entrada

- Click en el icono de estado de una fila abre el reproductor en un modal.
- También se abre desde el menú contextual de la fila.

### Modal reproductor · v1 (versión que entra en producción)

Parte del reproductor legacy de Smart Contact y le aplica unos ajustes mínimos.

- Cabecera con título + metadatos (canal, fecha, duración, agente).
- Audio bar simple para llamadas (play/pause, scrubber, tiempo). Layout de la maqueta legacy.
- Multi-tramo: gestionado con el patrón actual del legacy (selector aparte). v1 NO trae el reproductor unificado del prototipo.
- Tabs: "Transcripción" y "Análisis" (renombradas respecto al copy del legacy).
- Diarización quitada del producto entero.
- Confirmaciones previas para transcribir/analizar por primera vez quitadas. Cost cue inline en el CTA.

**A la derecha de la fila de tabs, dos iconos de acción:**

| Icono | Cuándo aparece | Click |
|---|---|---|
| **Análisis** (nuevo) | Siempre. Deshabilitado si no hay transcripción o si ya se analizó. | Lanza el análisis directamente, sin modal de confirmación intermedio. |
| **Descargar** | Siempre. | Abre el modal "Download" del legacy con dos checkboxes activos por defecto (**Records** y **Recordings/Chats**) + un aviso "Deleted or empty conversations won't download". Permite combinar formatos antes de descargar. En el flujo masivo, el mismo modal añade un tercer checkbox **CDR**. |

[imagen: reproductor unitario v1 · audio bar simple del legacy · tabs y fila de acciones a la derecha con Análisis (nuevo) y Descargar]

[imagen: modal "Download" en unitario · checkboxes Records y Recordings/Chats marcados por defecto · aviso "Deleted or empty conversations won't download" · botones Cancel/Download]

[imagen: modal "Download" en bulk · tres checkboxes vacíos por defecto (Record, CDR, Recordings/Chats) · botones Cancel/Download (deshabilitado hasta marcar al menos uno)]

[NOTA: el botón "Análisis" en el header es nuevo en v1. Antes había que entrar en la pestaña Análisis para descubrir que se podía generar. Ahora se descubre desde la vista por defecto. Tooltip "Análisis" si habilitado · "Requiere transcripción" o "Análisis ya realizado" si deshabilitado.]

[NOTA: la **re-transcripción** (sobrescribir una transcripción existente) no entra en v1. El supuesto operativo del primer rollout es que el supervisor convive con la primera transcripción aunque tenga ruido, y en casos puntuales solicita reproceso por canales internos. Se aborda en una fase posterior · ver sección "Re-transcripción · post-v1" más abajo.]

### Modal reproductor · v2 (a dónde queremos llegar a medio plazo)

v2 es el reproductor que ya vive en el prototipo de Memory. Target eventual, no parte del rollout inicial. Se ejecuta en una segunda fase si el feedback de los supervisores justifica la inversión.

Lo que v2 trae que v1 no tiene:

- **Sticky head**: audio bar + tabs pinned arriba. Al hacer scroll dentro del cuerpo, el transporte y los tabs siguen visibles.
- **Tab body con altura flexible**: empty states centran sobre el área visible real, no sobre una caja fija que empuja CTAs fuera de pantalla.
- **Reproductor multi-tramo unificado**: un solo componente de tres filas. Transport con tiempo, barra segmentada con anchura proporcional a la duración de cada tramo, etiquetas con flechas para navegar.
- **Per-tramo Check icon**: cada tramo transcrito muestra un check pequeño. Asimetría presente/ausente para los pendientes (no verde/gris).
- **Empty states refinados**: tres variantes consistentes para los estados de Transcripción y Análisis.

[imagen: reproductor unitario v2 · sticky head · multi-tramo unificado · empty states centrados]

[NOTA: v2 NO sustituye a v1 de un día para otro. Si los supervisores nunca piden más, v1 puede vivir indefinidamente. La decisión es consciente.]

### Estados de la pestaña "Transcripción"

Se evalúan en orden; el primer match gana.

| # | Estado | Qué ve el supervisor |
|---|---|---|
| 1 | **Procesando** | Spinner + "Transcribiendo". Sin acción. |
| 2 | **Sin grabación** | Mensaje "No hay grabación de esta llamada". Sin acción. |
| 3 | **Sin transcripción** | Empty state + CTA "Generar transcripción" + aviso de coste inline ("genera coste · ~30 s"). |
| 4 | **Transcripción vacía** | Mensaje neutro. Sin acción. Típico de audios cortos o silencios largos. |
| 5 | **Transcripción fallida** | Mensaje del fallo + CTA "Reintentar". El reintento es la misma operación. |
| 6 | **Activo** | Líneas con timestamp y locutor (1/2). Buscador inline para filtrar. |

### Estados de la pestaña "Análisis"

Se evalúan en orden; el primer match gana.

| # | Estado | Qué ve el supervisor |
|---|---|---|
| 1 | **Procesando** | Spinner + "Analizando". Sin acción. |
| 2 | **Sin transcripción · dead-end resuelto** | Empty state + CTA combinado "Transcribir y analizar". Lanza primero la transcripción y al terminar el análisis con un solo toast sticky que cambia de copy según la fase. |
| 3 | **Lista para analizar** | Empty state + CTA "Solicitar análisis" + aviso de coste ("genera coste · ~10 s"). |
| 4 | **Activo** | Resumen + sentimiento + categorías IA. |

Para chats, el estado "Lista para analizar" se cumple siempre aunque no haya transcripción explícita. El chat es texto y el análisis trabaja sobre él directamente.

[imagen: pestaña "Análisis" en empty state · CTA "Transcribir y analizar"]

### Re-transcripción · post-v1

La re-transcripción (sobrescribir una transcripción existente) **no entra en v1**. En el primer rollout no hay botón Re-transcribir en el reproductor ni modal de confirmación destructivo para ese caso. Si una transcripción tiene calidad pobre, el supervisor convive con ella o solicita reproceso por canales internos.

Cuando se aborde en una fase posterior, la solución de referencia (visible en el prototipo de Memory) es la siguiente:

- Modal de confirmación destructivo dedicado.
- Icono de alerta + caja roja con texto explicativo.
- Input para escribir "CONFIRMAR" en mayúsculas. El botón primario solo se habilita al matchear exacto.
- Footer:
  - Izquierda: **"Cancelar"**. Cierra sin hacer nada.
  - Derecha: "Re-transcribir" en color de error (rojo del DS).
- Al confirmar: reemplaza la transcripción actual y borra el análisis derivado.

[NOTA: el footer del modal de re-transcripción usa "Cancelar" en lugar de "Cerrar". Es una excepción para confirmaciones destructivas, donde "Cancelar" expresa mejor que el supervisor está abortando una acción consciente. La misma regla aplicaría a futuros confirms destructivos del flujo (por ejemplo, borrar una transcripción).]

[imagen: modal "Re-transcribir" · icono de alerta · caja roja · input "CONFIRMAR" · botón primario en rojo · referencia para la fase posterior, no parte de v1]

---

## Estados visuales de una fila en la tabla

Una fila puede estar en uno de varios estados visibles. Combinaciones más comunes:

| Estado | Cómo se ve | Comportamiento |
|---|---|---|
| **Normal** | Todo blanco. | Checkbox seleccionable. Click en icono de estado abre el reproductor. |
| **Recientemente cambiada** | Fondo amarillo suave. | Se reinicia al estilo normal cuando el supervisor abre el reproductor (click). Aparece tras transcribir o analizar, no solo tras transcribir. |
| **Procesándose** | Spinner en columna Estado. Checkbox deshabilitado. | Si el supervisor selecciona otras filas y pulsa Procesar, las que están procesándose no entran en el nuevo lote. |
| **Custodia GDPR vencida** | Fila atenuada (~60%). Tooltip explicativo al hover. | Checkbox seleccionable. Click en el icono de estado abre el reproductor para revisar/descargar lo disponible. En el bulk de transcripción/análisis, cae del lote sin aviso (no procesable). |
| **Transcripción fallida** | Icono de estado en rojo. | Click abre el reproductor con la pestaña Transcripción en estado terminal + CTA "Reintentar". |
| **Multi-tramo parcial** | Sin pista visual en la tabla (estado deducido del modelo). | Se descubre vía el filtro "Solo con tramos parcialmente transcritos" del panel o vía el hint del bulk modal. |

[NOTA: la combinación "amarilla + procesándose" no ocurre. Mientras está en curso es "spinner"; al acabar pasa a "amarilla" hasta que se inspecciona.]

[NOTA sobre iconografía: v1 tira de los iconos heredados del legacy de Smart Contact para comunicar el estado de la fila (con grabación, con transcripción, con clasificación, fallida, etc.). Es aceptable como punto de partida, ya que son los iconos que el supervisor ya conoce de otras partes del producto. Pero idealmente el supervisor no debería tener que aprender iconografía nueva para entender el estado. La solución apropiada vive en v2: convertir la columna "Estado" en varias columnas explícitas, una columna por cada tipo de estado relevante (con grabación · con transcripción · con clasificación · fallida), con un cue visual binario simple (check / vacío) por columna. Eso elimina la carga cognitiva de descifrar el icono pero requiere atacar el refactor de la tabla, fuera del scope del rollout v1.]

---

## Filtros relevantes

El panel de filtros (botón "Filtros" en la toolbar) tiene varias secciones. Las que afectan al flujo de transcripción:

| Sección | Toggle | Para qué sirve |
|---|---|---|
| **Estado** | Solo fallidas | Deja visibles solo las filas con transcripción fallida. Se activa también desde la acción "Ver fallidas" del toast de error. |
| **Multi-grabación** | Solo con varios tramos | Deja visibles solo las llamadas multi-tramo. Útil para revisarlas o para excluirlas del bulk si se quiere algo rápido y ligero. |
| **Multi-grabación** | Solo con tramos parcialmente transcritos | Deja visibles solo las multi-tramo donde algunos tramos están transcritos y otros no. Es la forma proactiva de encontrar conversaciones en estado parcial antes de hacer select-all (ver "Multi-tramo parcial · caveat conocido"). |

Cualquiera de estos filtros activos aparece como chip cerrable en la toolbar, con texto identificativo + acción "Limpiar filtro". El chip de "Solo fallidas" usa color de error (rojo); los chips de multi-grabación usan color neutro porque son filtros informacionales, no alarmas.

[imagen: panel de filtros abierto · sección "Estado" con "Solo fallidas" · sección "Multi-grabación" con dos toggles]

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
| {N} con tramos ya iniciados | {N} avec des segments déjà initiés | {N} with segments already started |
| todo procesado | tout traité | all processed |
| Cerrar | Fermer | Close |
| Cancelar | Annuler | Cancel |
| Custodia GDPR vencida | Conservation RGPD expirée | GDPR custody expired |
| Solo fallidas | Échecs uniquement | Failed only |
| Solo con varios tramos | À plusieurs segments uniquement | Multi-segment only |
| Solo con tramos parcialmente transcritos | Segments partiellement transcrits uniquement | Partially transcribed only |
| Limpiar filtro | Effacer le filtre | Clear filter |
| Estado | État | Status |
| Multi-grabación | Multi-enregistrement | Multi-recording |

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
| Audio en silencio o formato no soportado en algunas conversaciones. | Audio silencieux ou format non pris en charge dans certaines conversations. | Audio silent or unsupported format in some conversations. |
| Ver fallidas | Voir les échecs | View failed |
| Descargando audio | Téléchargement de l'audio | Downloading audio |
| Descargando conversación | Téléchargement de la conversation | Downloading conversation |
| Descargando 1 conversación | Téléchargement de 1 conversation | Downloading 1 conversation |
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
| Solicitar análisis | Demander l'analyse | Request analysis |
| Reintentar | Réessayer | Retry |
| Transcribiendo... | Transcription en cours... | Transcribing... |
| Analizando... | Analyse en cours... | Analyzing... |
| No hay grabación de esta llamada | Pas d'enregistrement pour cet appel | No recording for this call |
| Descargar audio | Télécharger l'audio | Download audio |
| Descargar conversación | Télécharger la conversation | Download conversation |
| Buscar en la transcripción... | Rechercher dans la transcription... | Search transcription... |
| Resumen | Résumé | Summary |
| Sentimiento | Sentiment | Sentiment |
| Categorías IA | Catégories IA | AI categories |
| genera coste · ~30 s | génère un coût · ~30 s | generates cost · ~30 s |
| genera coste · ~10 s | génère un coût · ~10 s | generates cost · ~10 s |
| genera coste · transcripción + análisis | génère un coût · transcription + analyse | generates cost · transcription + analysis |

### Strings del modal Download (legacy heredado en v1)

| ES | FR | EN |
|---|---|---|
| Descargar | Télécharger | Download |
| Cancelar | Annuler | Cancel |
| Grabación | Enregistrement | Record |
| Grabaciones | Enregistrements | Records |
| CDR | CDR | CDR |
| Grabaciones/Chats | Enregistrements/Chats | Recordings/Chats |
| Las conversaciones eliminadas o vacías no se descargarán | Les conversations supprimées ou vides ne seront pas téléchargées | Deleted or empty conversations won't download |

[NOTA: el modal "Download" lo aporta el legacy de Smart Contact · v1 lo hereda tal cual. En unitario muestra dos checkboxes (Grabaciones + Grabaciones/Chats, marcados por defecto) y el aviso de elementos no descargables. En bulk añade un tercer checkbox CDR, todos vacíos por defecto, con el botón Descargar deshabilitado hasta marcar al menos uno. Las strings de aquí son las existentes en producción; no requieren trabajo de traducción adicional · solo aparecen en el COA para que el equipo identifique que el modal sigue siendo el de hoy.]

### Strings del modal de re-transcripción

| ES | FR | EN |
|---|---|---|
| Re-transcribir conversación | Re-transcrire la conversation | Re-transcribe conversation |
| Escribe CONFIRMAR para continuar | Saisissez CONFIRMER pour continuer | Type CONFIRM to continue |
| Esta acción reemplaza la transcripción actual y borra el análisis derivado. | Cette action remplace la transcription actuelle et supprime l'analyse dérivée. | This action replaces the current transcription and deletes the derived analysis. |
| Procesando... | Traitement... | Processing... |

[NOTA: el equivalente francés de "CONFIRMAR" es "CONFIRMER", y el inglés "CONFIRM". El input compara literal en mayúsculas, así que cada locale tiene su palabra clave.]

---

[NOTA FINAL: este documento describe v1, la versión que entra en producción primero. v1 = reproductor legacy de Smart Contact con ajustes mínimos (botón "Análisis" en header, pluralización, quitar modal intermedio de confirmación, quitar diarización, renombrar tabs, sticky toast, filtro multi-grabación, hint de tramos ya iniciados). La re-transcripción (modal destructivo con "Cancelar") queda fuera de v1 y se aborda en una fase posterior. v2 = el reproductor del prototipo de Memory, que es el target a medio plazo y se valida en una segunda fase si los supervisores piden más. v3 aterriza cuando haya backend real para hero count = audios y chain transcribir→analizar event-driven. El prototipo que el usuario tiene a mano para revisar muestra v2; este COA describe lo que se construye AHORA (v1).]
