# Memory · Decisiones de diseño

*Memory · Smart Contact · Por Rafael Areses*

---

## Sobre este documento

Memory tiene muchas piezas pequeñas y, detrás de cada una, una decisión. Cada decisión tiene varias iteraciones, y es una suma incontable y constante de factores a tener en cuenta. Este documento recoge **las decisiones de producto y UX que se han cerrado a lo largo del desarrollo, por qué se tomaron, y qué descartamos a propósito**.

No es el manual de usuario ni la referencia técnica. Es el *por qué* del producto, en lenguaje natural. Sirve para que cualquiera que llegue al proyecto entienda no solo qué hace Memory sino también qué decidimos NO hacer, y la razón.

Las decisiones técnicas más finas (estructura del modelo, contratos entre componentes, contadores específicos) viven en *Memory · Lógica de conteo y reglas de negocio*. La anatomía visual y de copy de cada componente vive en *Memory · Referencia de UI*. Este doc se queda con el plano de las decisiones que afectan al producto en su conjunto.

---

## El principio rector · todo gira alrededor del coste

Memory existe porque transcribir y analizar conversaciones con IA cuesta dinero. Mucho dinero si se hace mal, sin control, sin criterio. La pregunta de fondo que el producto responde es: *¿cómo dejamos que un supervisor decida qué procesar sin que se le vaya la mano ni quede ciego ante miles de conversaciones?*

De ahí derivan casi todas las decisiones que siguen. Cuándo confirmar, cuándo no, cuándo enseñar el desglose, qué silenciar — todo se inclina hacia: **avisar de cualquier operación billable y mostrar el volumen real antes de lanzarla, sin añadir fricción innecesaria cuando ya queda claro lo que va a pasar**. El desglose en euros vive fuera del producto, en la capa de facturación; Memory enseña cuántas operaciones se van a ejecutar y, en las acciones unitarias, una estimación de tiempo aproximada. Esa es la información sobre la que el supervisor decide.

---

## Decisiones de modelo

### Los chats no se "transcriben" — ya son texto

Un chat es texto por definición. No tiene audio. Sin embargo, en el flujo del producto, una conversación "está transcrita" o "no está transcrita" como atributo binario.

**Decisión**: para que el modelo sea coherente, los chats se cargan siempre como `hasTranscription = true`. La columna Estado del listado pinta el icono de "transcrito" desde el primer momento. El supervisor no tiene que entender la sutileza de "los chats no necesitan transcripción"; simplemente nunca aparecen como pendientes en esa dimensión.

**Excepción · retención vencida**: hay un caso real donde un chat sí queda "no transcrito": cuando ha perdido su derecho a retener el contenido (por ejemplo, custodia GDPR vencida — el periodo de retención del proveedor ha terminado y el texto ya no es recuperable). La regla aplica a cualquier restricción legal de retención según la normativa que corresponda; GDPR es el caso canónico. En esos casos el chat aparece con un estado especial ("no recuperable") y queda fuera de cualquier operación bulk.

### Una llamada con varias grabaciones está "transcrita" solo si TODAS lo están

Las llamadas que pasan por transferencias entre grupos generan grabaciones separadas (cliente → IVR → comercial → IVR → retención = tres grabaciones, no una). El producto considera esa llamada como una unidad: si una de las tres grabaciones no está transcrita, la llamada entera queda "pendiente".

**Por qué**: si una llamada parcialmente transcrita apareciera como "transcrita" en el listado, el supervisor la abriría esperando el texto completo y vería un agujero. Es mejor que aparezca explícitamente como pendiente y se complete cuando se lance la transcripción.

### No hay análisis sin transcripción

El análisis (resumen + sentimiento) trabaja sobre el texto, no sobre el audio. Si no hay transcripción, no hay nada que analizar. El producto enfuerza esta dependencia en el modelo y en la UI: el botón "Analizar" no aparece hasta que haya transcripción, y los handlers internos rechazan análisis sin transcripción asociada.

### La diarización se eliminó del producto

Versiones tempranas del modelo distinguían entre "transcripción" y "diarización con separación de hablantes". El concepto se eliminó: ahora la transcripción siempre separa hablantes (es la forma única). Se evitó tener dos tipos de transcripción con dos costes y dos toggles para el supervisor. Resultado: menos opciones, menos confusión.

---

## Decisiones de flujo bulk

### Bulk siempre actúa sobre la conversación entera

Cuando una conversación tiene varias grabaciones y entra en una selección masiva, el bulk transcribe TODAS sus grabaciones. No elige una "principal" ni heurísticamente decide cuál parece importante.

**Por qué**:

- Una sola regla es más fácil de explicar al supervisor que una heurística.
- Es transparente sobre el volumen: si se seleccionan 14 conversaciones y 3 son multi-grabación con 4 audios cada una, el contador del modal lo dice ("14 conversaciones · 3 con varios tramos → 26 audios"). El supervisor decide con la cuenta completa delante. No se muestra coste monetario por operación — eso queda fuera del producto.
- Si en algún caso concreto el supervisor solo quiere un tramo específico (por ejemplo, solo el del agente de retención), tiene un camino claro: abre esa conversación individualmente y la transcribe desde el reproductor, donde sí puede elegir tramo.

El bulk es para volumen; el single es para precisión. La separación es deliberada.

### Multi-tramo parcial · cuando el supervisor toca un tramo en unitario y luego el bulk procesa el resto

Imagina este caso: el supervisor abre una llamada con tres tramos, transcribe solo el del agente de retención desde el reproductor unitario y deja los otros dos pendientes a propósito. Más tarde hace "select all" en la tabla. ¿Qué pasa con esa llamada?

La respuesta del producto: entra en el lote y el bulk transcribe los dos tramos restantes. Cost-wise no hay doble cobro (los tramos ya transcritos se respetan), pero el supervisor procesa cosas que conscientemente había dejado fuera.

**Por qué no se cambia el comportamiento**: la regla "una llamada está transcrita solo si TODAS sus grabaciones lo están" es consistente con el resto del modelo (el análisis requiere el texto completo, los filtros tratan parcial como pendiente). Cambiar el agregado o excluir parciales del select-all rompería expectations más amplias del producto.

**Mitigación: avisar al supervisor antes de que confirme**. El modal masivo muestra una línea adicional cuando hay parciales en la selección — "Incluye M con tramos ya iniciados" — junto al hint existente del multi-grabación. El supervisor lo lee antes de pulsar Procesar y decide si sigue o vuelve atrás.

**Y darle una forma proactiva de encontrarlos**: el panel de filtros tiene una sección "Multi-grabación" con un toggle "solo con tramos parcialmente transcritos". Activándolo el supervisor ve exactamente las llamadas en estado parcial — puede revisarlas, deseleccionarlas, o tomar otra decisión antes de operar en bloque.

El compromiso es preservar la coherencia interna del modelo y proteger al supervisor con información, no con bloqueos.

### Confirmación adicional solo para operaciones destructivas

El producto trabaja con muchas acciones billables: transcribir, analizar, re-transcribir, exportar. Si todas requirieran un modal "¿estás seguro?" el supervisor lo cerraría sin leer al tercer click.

**Decisión**: el modal de confirmación se reserva para acciones *destructivas* (sobrescribir datos existentes, borrar). Para acciones que solo "generan coste" basta con la advertencia inline en el CTA ("Genera coste · ~30 s") y el toast de éxito al terminar. El consentimiento se da con el click del botón y la advertencia visible.

Único modal de confirmación que sobrevive en el prototipo: re-transcribir. Re-transcribir sobrescribe la transcripción existente e invalida el análisis derivado; eso sí requiere consentimiento explícito. *En el primer rollout (v1) la re-transcripción no se expone al supervisor — convive con la primera transcripción aunque tenga ruido, y en casos puntuales solicita reproceso por canales internos. El modal destructivo se aborda en una fase posterior.*

### El bulk no decide por el supervisor

Si una conversación está "en proceso" (transcribiéndose o analizándose ahora mismo), no puede entrar en otro bulk hasta que termine. Pero en lugar de mostrar al supervisor un mensaje "X items excluidos porque están en proceso" en el modal, el filtrado ocurre silenciosamente antes:

- En la fila del listado, las conversaciones en proceso no son seleccionables.
- En la selección masiva, las en proceso se deseleccionan silenciosamente al abrir el modal.

**Por qué silenciar**: la fila ya tiene su indicador visual de "en proceso" (spinner, badge). Añadir una línea en el modal lo recuerda dos veces.

Misma lógica con chats que han perdido su derecho a retener el contenido (custodia GDPR vencida es el ejemplo canónico, aplican otras restricciones de retención según normativa): el listado los pinta como "no recuperable", el bulk los excluye. El modal no añade explicación porque la fila ya la dio.

### No hay cancelación de batch a mitad de proceso

Una vez disparada la acción, no se puede cancelar a mitad. El coste se genera completo. La copia del modal lo refleja: no se promete "cancelar" en ningún sitio. Esto es restricción del backend (no del producto): el motor de transcripción procesa por lotes y no expone API de cancelación parcial.

Cuando el supervisor confirma "Procesar", asume el coste completo. El producto evita prometer flexibilidad que el backend no puede entregar.

### Errores se notifican al inicio y al final, no granularmente

Por la misma restricción de backend, no llegan eventos "fallo en la conversación 27 de 50" durante el proceso. El backend notifica solo al inicio del batch (aceptado / rechazado) y al final (cuántas terminaron bien, cuántas fallaron). La UI se diseñó alrededor de esto: el feedback de error llega como un toast único al final del batch ("X transcripciones fallaron · Ver fallidas"), no como progreso granular.

### El feedback transitorio no se conserva entre sesiones

Cuando el supervisor cierra la sesión y vuelve a entrar más tarde, el feedback visual transitorio anterior no se conserva. Aplica a:

- La fila amarilla "recientemente procesada" (marca de transcrita o analizada hace poco · se pierde tras logout, no quedan resaltadas al volver).
- El indicador rojo de "transcripción fallida" en la columna Estado · y por tanto también el filtro "Solo fallidas" del panel deja de mostrar resultados al volver.
- Toasts previos (informativos o de error) que estuvieran abiertos.

Lo único que sí persiste tras volver a entrar son las conversaciones que están **activamente en proceso** — su spinner se deriva del estado vivo del backend, no de un flag de UI. El backend sigue procesando aunque el supervisor cierre el navegador, así que al volver puede ver lo que aún no ha terminado.

**Por qué**: el backend de transcripción y análisis devuelve estado consultable (en curso, terminado bien, fallido) pero no expone una "DB de actividad por usuario" desde la que reconstruir feedback histórico. Para guardar el "amarillo recién procesado" o las marcas de fallida persistentemente haría falta esa pieza, que hoy no existe.

De momento, esto responde a una limitación técnica que aún no tiene solución disponible. El concepto futuro a explorar sería un indicador persistente tipo "marcar como leído" de Gmail/Teams: cada supervisor tiene su propio estado de "qué he visto ya" sobre cada conversación. Cuando aterrice esa capa, el feedback se hace duradero. Hasta entonces, conviene que la documentación lo refleje para no prometer continuidad que el producto aún no puede entregar.

---

## Decisiones de UX cross-cutting

### Empty states centrados, en una columna

Cuando un componente está vacío (sin grabación, sin transcripción, sin análisis), el cuerpo no se divide en dos columnas tipo split. Se queda en una sola columna centrada con el mensaje + CTA + advertencia de coste.

**Por qué**: el split-layout se probó en una iteración y se descartó. Daba sensación de "página marketing" en un panel operativo. La columna centrada es más sobria, más oficinista, y se alinea con el resto del producto.

### La geometría carga la información, no la decoración

Cuando una llamada tiene varios tramos, el strip que los representa reparte el ancho proporcionalmente a la duración real de cada tramo. Si el tramo del comercial dura 3 minutos y el de retención 30 segundos, el del comercial se ve seis veces más ancho.

Este principio se aplica en general: la forma del componente debe cargar el dato, no se le añade ornamento (mini-gráficos dentro de cards, badges decorativos, colores temáticos). Cuando se piensa en añadir un indicador visual, primero se audita si la geometría existente ya lo cuenta. Solo se añade ornamento si la geometría falla.

### Asimetría presente/ausente para estados, no semáforos verde/gris

Cuando un tramo de una llamada ya está transcrito, aparece un pequeño check junto a su duración. Cuando no, no aparece nada. NO se usa verde-vs-gris para distinguir.

**Por qué**: el color ya está dedicado a otra dimensión (tramo activo vs inactivo). Si añadimos verde-vs-gris para transcrito-vs-pendiente, el supervisor lee dos códigos cromáticos simultáneamente y se pierde. La asimetría presente-vs-ausente comunica el mismo dato sin competir por el canal visual del color.

### Los iconos llevan aria-label explícito

Cada icono que comunica estado (transcrito, en proceso, fallido, custodia vencida) lleva su `aria-label`. La información nunca depende solo del color o solo de la forma; un lector de pantalla la recibe siempre.

---

## Decisiones de prototipo vs producción

### El prototipo es para comunicar ideas, no para sustituir al producto

Memory en su versión actual es un prototipo. Existe para que stakeholders puedan recorrer el flujo principal —filtrar conversaciones, lanzar transcripciones masivas, abrir el reproductor, revisar el análisis IA— y entender qué hace el producto sin necesidad de que el backend esté listo.

Esto explica varias renuncias deliberadas:

- **No hay backend real**. Todo es mock + localStorage. Las transcripciones se simulan con un retraso de unos segundos. El supervisor ve la mecánica del flujo, no el contenido real.
- **Algunos filtros del producto real no están en el prototipo**. El manual oficial de Smart Contact lista filtros de Tipificación, Custom Code, Comentarios, Resultado. El prototipo solo incluye los del flujo principal (servicio, fecha, origen, destino, grupo, agente). El resto se omiten a propósito para mantener el foco.
- **Algunos botones no están conectados**. El botón Search en la barra de filtros y los iconos del sidebar (Dashboard, Grupos, Agentes, etc.) son orientativos: emulan el aspecto del producto real para que el stakeholder vea Memory en su contexto.

### Distribución de docs · `.docx` por Claude Desktop, no inline en el prototipo

Hubo una iteración temprana donde los docs se renderizaban dentro del prototipo (un modal con markdown). Se descartó por dos razones:

- Los docs largos (más de 30 KB) se cortaban en el modal o forzaban scroll incómodo.
- Mantener un canal alternativo de distribución dentro del prototipo creaba drift entre la versión renderizada y la oficial.

**Decisión actual**: los docs se distribuyen como `.docx` generados desde los `.md` del repo. La integración inline se eliminó del prototipo y el botón Help abre directamente al GitHub o al Figma site según el caso.

### Estrategia phased v1/v2/v3 para el rollout en producción

Memory en su versión final NO se construye de golpe ni todo según el prototipo. La implementación en producción se hace por fases para optimizar coste/valor en cada momento.

**v1 (primeros sprints)**: el equipo de desarrollo parte del reproductor existente en la plataforma Smart Contact y le aplica ajustes mínimos — quitar la diarización, renombrar las pestañas, sustituir el modal de confirmación por la advertencia de coste inline, añadir el botón de Análisis en el header del reproductor, corregir la pluralización. El resultado captura alrededor del 70% del UX del prototipo a una fracción del coste. Memory entra en producción rápido y los supervisores empiezan a notar las mejoras.

**v2 (sprints posteriores, una vez v1 está validado)**: refactor profundo del reproductor hacia los patrones del prototipo. Empty states con CTAs claros, multi-rec timeline proporcional, sticky audio + flex-1 tab body, per-tramo Check icon. Solo si el feedback real de los supervisores valida que la inversión adicional vale la pena.

**v3 (cuando aterrice el backend real con soporte multi-grabación)**: hero count = audios totales con desglose, per-tramo transcription state visible en todas las superficies, chain transcribir→analizar event-driven sobre eventos del backend.

**Por qué phased y no todo de golpe**: el reproductor del prototipo construido desde cero cuesta del orden de 3-4 semanas de un dev senior frontend (modal compound + audio player custom + tabs con cinco estados + transcript chat-bubbles + multi-rec timeline + chain logic + integración backend). Evolucionar el reproductor legacy con parches cuesta del orden de una semana. La diferencia (~3 semanas extra) sale rentable solo si Memory tiene vida útil de más de tres años con uso intensivo. El cálculo del ROI lo justifica, pero no en el primer sprint — primero hay que validar que el supervisor pide más.

**No es deuda técnica diferida — es decisión consciente**. La diferencia importa: deuda implica "lo hacemos mal ahora y arrastramos el coste"; decisión consciente implica "lo hacemos en el momento óptimo del producto". El roadmap recoge explícitamente la v2 como ejecución pendiente, no como aspiración.

### Sticky toast persistente durante operaciones billables

Las operaciones que tardan (transcribir un batch de 200, analizar varias conversaciones) muestran un toast persistente arriba a la derecha — "Generando transcripción..." o "Generando análisis..." — que se mantiene visible mientras dura el proceso. Cuando termina, ese mismo toast se reemplaza por uno breve de éxito o error.

**Por qué**: el supervisor lanza un batch y cambia a otra pestaña del navegador, o navega a otra vista del producto. Sin el sticky toast, pierde visibilidad del estado en curso — vuelve sin saber si terminó. Con él, el estado siempre está visible.

Este patrón viene heredado del Figma original donde estaba bien resuelto. El prototipo se quedó sin él durante la primera iteración y se identificó como gap en la revisión 15.42 del COA del equipo. Implementado en 15.43 · un único toast con id estable que pasa de "Generando transcripción..." a "Generando análisis..." en el caso encadenado, sin un flash intermedio de éxito.

### Botón "Analizar" en el header del reproductor

El reproductor de conversaciones tiene un botón "Analizar" visible en su header, al lado de Descargar (y de Re-transcribir cuando esa función esté disponible · ver nota más abajo). No hace falta entrar en la pestaña Análisis para descubrir que se puede analizar — el botón está ahí siempre, deshabilitado cuando no procede (sin transcripción aún, o ya analizado) y habilitado cuando hay algo que hacer.

**Por qué**: si la única forma de descubrir que puedes analizar una conversación es cambiar a la pestaña Análisis y ver el CTA dentro, el supervisor que esté leyendo la transcripción tiene que dar un paso extra para enterarse de la siguiente acción. Discoverability en el header significa cero saltos.

Click en el botón → dispatch directo, sin modal de confirmación intermedio (sigue la regla general "confirmación solo para destructivo"). La advertencia de coste vive como tooltip del botón.

[Nota: la **re-transcripción** que aparece dibujada en el prototipo a la izquierda del botón Analizar es la solución de referencia para una fase posterior. En el primer rollout (v1) no se expone — el supervisor convive con la primera transcripción aunque tenga ruido, o solicita reproceso por canales internos. La razón es de scope: priorizar el flujo principal antes que un caso de excepción que requiere modal destructivo dedicado.]

### "Cancelar" como excepción a "Cerrar" en confirms destructivos

La regla general es: el footer-cancel de los modales dice "Cerrar" (porque pre-submit no hay nada que cancelar — el modal solo se cierra). Para confirms **destructivos** específicamente — el de eliminar una categoría hoy, el de re-transcribir una conversación cuando se incorpore en una fase posterior — el copy es "Cancelar".

**Por qué**: en confirms destructivos, el supervisor inició explícitamente una acción (Eliminar, Re-transcribir) y el modal es el gate antes de ejecutarla. "Cancelar" representa cancelar esa acción consciente; "Cerrar" sería menos preciso porque el modal no se está limitando a abrirse y cerrarse, está mediando entre un click consciente y la ejecución real.

La excepción es estrecha: solo confirms destructivos. El resto de modales (procesar, crear, editar, ver) siguen usando "Cerrar".

### Iconografía de la columna "Estado" · heredada en v1, refactorizada en v2

Cada fila de la tabla muestra su estado (con grabación, con transcripción, con clasificación, fallida) mediante un icono en la columna "Estado". Es la forma del legacy de Smart Contact y, en v1, Memory la conserva.

**Por qué se mantiene en v1**: son los iconos que el supervisor ya conoce de otras partes del producto. Reaprovecharlos evita tener que aprender un sistema nuevo cuando aún hay piezas más importantes en las que enfocar el rediseño (sticky toast, botón Análisis, multi-grabación, etc.). Aceptable como punto de partida.

**Por qué no es la solución a la que apuntamos a medio plazo**: descifrar un icono cada vez que se mira una fila tiene una carga cognitiva pequeña pero acumulativa, y depende de memoria. En el v2 idóneo, la columna "Estado" se convierte en varias columnas explícitas — una por cada tipo de estado relevante (con grabación · con transcripción · con clasificación · fallida) — con una pista visual binaria simple por columna (check / vacío). El supervisor escanea sin descifrar.

**Por qué no se aborda ahora**: convertir una columna en varias requiere atacar el refactor general de la tabla (anchuras, prioridades de visibilidad responsiva, qué se oculta primero en pantallas pequeñas). Es trabajo sustancial y queda fuera del scope del rollout v1. Decisión consciente, no diferida.

---

## Lo que NO está cerrado

Estas decisiones siguen abiertas y vendrán con caso de uso o validación real:

- **Toggle de modo oscuro en la UI.** Los tokens están preparados pero no hay caso de uso definido. Se activará cuando el equipo lo pida con un trigger claro.
- **Patrón side-panel vs modal para creación/edición.** Hoy hay panels laterales con anchuras de 40-50% y modales centrales conviviendo. Cuándo usar cada uno no está unificado. Decisión pendiente cuando se haga la siguiente pasada de diseño.
- **Alineación de las bubbles del chat en el reproductor (Agente derecha / Cliente izquierda).** El patrón "right = me" está culturalmente sesgado y el supervisor es observador, no participante. Validar con usuarios antes de cambiar.
- **Sparkles como icono de la pestaña Análisis.** Hay tensión entre la regla "Sparkles reservado a la pill 'Generado por IA'" y la práctica de usarlo como cue de "esta pestaña va de IA". Estricto vs práctico, sin urgencia.

Cuando alguna de estas se cierre, se mueve al apartado anterior con su razonamiento.
