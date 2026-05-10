# ACTUALIZACIÓN DEL CONSTRUCTOR DE REGLAS — MEMORY 3.0

## CONTEXTO

Memory 3.0 es una plataforma de analítica para call centers hispanohablantes. Tiene dos sistemas independientes que NO deben mezclarse en la UI ni en el modelo mental del usuario:

1. REGLAS (este constructor) — automatización programada a futuro. Define qué pasa con las conversaciones que entren al sistema a partir de ahora, según criterios configurables.
2. ACCIONES MASIVAS (fuera del alcance de este prompt) — operaciones manuales aquí y ahora sobre conversaciones que ya existen. Viven en la bandeja de conversaciones, con su propio modal.

Esta actualización aplica exclusivamente al constructor de reglas. No modifiques nada del flujo de acciones masivas. No uses vocabulario de acciones dentro del constructor de reglas ni viceversa.

## OBJETIVO DE LA ACTUALIZACIÓN

Cinco cambios estructurales en el constructor de reglas:

1. Evidenciar que los selectores consumen repositorios centrales (Servicios, Grupos, Agentes, Categorías).
2. Hacer visible la lógica booleana entre dimensiones del alcance (OR dentro de cada dimensión, AND entre dimensiones).
3. Eliminar los filtros "Origen" y "% de llamadas a grabar" del bloque Grabación.
4. Dejar el bloque Transcripción con tres filtros: Dirección, Duración y Atendida por.
5. Reordenar la arquitectura del constructor en dos bloques explícitos: Grabación y Transcripción.

## ARQUITECTURA DEL CONSTRUCTOR

El constructor se organiza en secciones verticales apiladas, en este orden:

1. Metadatos de la regla
   - Nombre de la regla (input)
   - Descripción (textarea, opcional) — aquí el supervisor puede documentar el propósito. No hace falta un panel resumen adicional.
   - Estado: activa / inactiva (toggle)

2. Alcance (a quién aplica la regla)
   - Bloque con tres dimensiones: Servicios, Grupos, Agentes.
   - Cada dimensión consume su repositorio correspondiente.
   - Lógica booleana: OR dentro de cada dimensión, AND entre dimensiones (ver sección dedicada más abajo).

3. Grabación
   - Criterios para decidir qué se graba de las conversaciones capturadas por el alcance.
   - NO incluye filtros "Origen" ni "% de llamadas a grabar" (eliminados).
   - Mantén los filtros restantes que ya existan en esta sección.

4. Transcripción
   - Criterios para decidir qué se transcribe de lo grabado.
   - Incluye exactamente tres filtros: Dirección (entrante/saliente), Duración (mínima), Atendida por (agente o grupo específico).
   - Importante: el análisis IA (resumen, sentimiento, categorización) vive dentro de este bloque, NO como bloque separado. Trátalo como subsección dentro de Transcripción si aplica, pero el label del bloque es solo "Transcripción".

## EVIDENCIAR EL ORIGEN DESDE REPOSITORIOS

Cada selector de cada dimensión (Servicios, Grupos, Agentes, Categorías) debe comunicar tres cosas al supervisor:

1. Que proviene de un repositorio central (no es una lista que vive dentro de la regla).
2. Cuántos elementos contiene lo seleccionado.
3. Qué elementos concretos contiene, bajo demanda.

### Patrón visual por cada bloque del alcance

Header del bloque:
- Título de la dimensión (ej: "Servicios")
- Subtítulo o microcopy en gris tenue: "Desde repositorio de Servicios"
- Enlace secundario discreto a la derecha: "Ver repositorio" (abre el repositorio correspondiente en nueva pestaña o panel lateral, sin destruir el contexto del constructor).

Selector:
- Input con multi-select que permite añadir elementos del repositorio.
- Cada elemento seleccionado se representa como chip con contador inline cuando aplique:
  - "Servicio Atención al Cliente" (dimensiones atómicas sin subelementos)
  - "Grupo Madrid · 12 agentes" (dimensiones que agregan otros elementos)
  - "Supervisores Turno Mañana · 4 agentes"
- Al hacer clic en un chip con contador, se abre un popover que lista los elementos incluidos (ej: los 12 agentes del Grupo Madrid). El popover es read-only; para editar la composición hay que ir al repositorio.
- El chip tiene una X para eliminarlo de la regla.

### Por qué esto importa

El supervisor tiene que entender que la regla es un puntero vivo al repositorio, no un snapshot. Si mañana se añade un agente al Grupo Madrid desde el repositorio, la regla lo incluye automáticamente. El contador inline + popover materializa esta idea sin fricción adicional.

## LÓGICA BOOLEANA DEL ALCANCE

El alcance combina tres dimensiones (Servicios, Grupos, Agentes) con esta lógica:

- Dentro de cada dimensión: OR. Seleccionar "Servicio A" y "Servicio B" significa "conversaciones de A o de B".
- Entre dimensiones: AND. Seleccionar "Servicio A" + "Grupo Madrid" significa "conversaciones del Servicio A Y ADEMÁS del Grupo Madrid".

### Materialización en UI

Las tres dimensiones se presentan como bloques verticales apilados, NO como tabs (los tabs esconderían las dimensiones que no están en foco y romperían la visibilidad del AND).

Separadores:
- Dentro de una dimensión, los chips se separan visualmente con un divisor sutil "O" (ya implementado en la iteración anterior — mantener).
- Entre dimensiones, un conector visual "Y" claramente diferenciado del "O". Propuesta: un divisor horizontal con la etiqueta "Y" centrada, con tratamiento visual distinto al "O" (por ejemplo, más peso tipográfico o un tratamiento que sugiera jerarquía superior).

Estado vacío por dimensión:
- Si una dimensión no tiene nada seleccionado, se interpreta como "cualquiera" dentro de esa dimensión. El bloque sigue visible con placeholder: "Cualquier servicio" / "Cualquier grupo" / "Cualquier agente".
- Importante: una dimensión vacía NO rompe el AND. Simplemente deja de restringir por esa dimensión.

Resumen de alcance al final del bloque:
- Una línea en prosa que traduzca la configuración a lenguaje natural. Ejemplo:
  "Esta regla aplica a conversaciones del Servicio Atención al Cliente O del Servicio Ventas, Y del Grupo Madrid, Y de cualquier agente."
- Se recalcula en tiempo real según la configuración.
- Este resumen resuelve ambigüedades de interpretación para supervisores no técnicos.

## CAMBIOS EN EL BLOQUE GRABACIÓN

Eliminar por completo:
- Filtro "Origen" (con sus opciones asociadas).
- Filtro "% de llamadas a grabar" (con su slider o input).

No dejes placeholders, tooltips, ni referencias residuales a estos filtros. Deben desaparecer limpiamente del bloque y del flujo.

Mantener los filtros restantes de grabación existentes (no introducir nuevos).

## CAMBIOS EN EL BLOQUE TRANSCRIPCIÓN

El bloque Transcripción contiene exactamente tres filtros de primer nivel, todos visibles (ninguno colapsado por defecto):

1. Dirección
   - Selector con opciones: Entrante / Saliente / Ambas.
   - Valor por defecto: Ambas.

2. Duración mínima
   - Input numérico con unidad (segundos o minutos).
   - Microcopy de apoyo: "Solo se transcribirán conversaciones que superen esta duración. La transcripción genera costes, este filtro ayuda a descartar conversaciones irrelevantes."
   - Valor por defecto: un valor conservador (sugerencia: 30 segundos), editable.

3. Atendida por
   - Multi-select con agentes o grupos del repositorio.
   - Label completo: "Atendida por"
   - Microcopy inmediatamente debajo del label, en gris tenue: "De entre las conversaciones capturadas por el alcance, transcribir solo las atendidas por..."
   - Placeholder cuando está vacío: "Cualquier agente" (significa: no filtra, transcribe todas las del alcance).
   - Este filtro es visible de primer nivel, no colapsado. Razón: es ortogonal al alcance general, no redundante. El alcance define qué conversaciones entran en la regla; "Atendida por" refina qué subset se transcribe. Esconderlo como avanzado amputa capacidad legítima.

### Análisis IA dentro de Transcripción

Si el constructor ya tenía configuración de análisis (resumen, sentimiento, categorías), mantenla dentro del bloque Transcripción como subsección interna. No renombres el bloque. No lo extraigas a un bloque independiente.

## ESTADOS A CUBRIR

El prompt debe generar los siguientes estados del constructor:

1. Estado inicial (regla nueva, nada configurado): todos los bloques visibles, placeholders activos, resumen en prosa vacío o con texto explicativo.
2. Estado con alcance parcial (solo una dimensión): resumen en prosa traduce correctamente, "Cualquier X" en dimensiones vacías.
3. Estado completo (todas las dimensiones con selecciones): resumen en prosa completo, chips con contadores inline.
4. Estado con conflicto: si la regla entra en conflicto con otra (ej: mismo alcance, acciones contradictorias), warning inline no bloqueante al guardar, nombrando la regla conflictiva (decisión previa — mantener).
5. Estado de validación: errores inline en el campo específico, nunca solo toast.
6. Estado read-only: cuando la regla se visualiza sin editar, los selectores son chips informativos y los enlaces "Ver repositorio" siguen activos.

## FUERA DEL ALCANCE DE ESTE PROMPT

No modifiques, no menciones, no integres:
- El modal de acciones masivas (transcripción/análisis manual sobre conversaciones existentes).
- La bandeja de conversaciones.
- La re-transcripción individual vía kebab menu.
- Flujos de "aplicar reglas" sobre conversaciones ya grabadas.

Estos sistemas son independientes del constructor de reglas. Mezclarlos rompe el modelo mental del supervisor.

## CRITERIOS DE ACEPTACIÓN

El output debe cumplir:

1. Un supervisor no técnico lee el constructor y entiende, sin formación previa:
   - Que la regla aplica al futuro.
   - De qué conversaciones habla (gracias al resumen en prosa).
   - Qué repositorios alimentan los selectores.
   - Cuántos elementos hay detrás de cada chip.

2. La lógica AND entre dimensiones es visible sin necesidad de documentación.

3. El bloque Grabación no contiene rastro de "Origen" ni de "% a grabar".

4. El bloque Transcripción tiene exactamente tres filtros de primer nivel, todos visibles.

5. Ningún elemento del constructor menciona ni se parece al flujo de acciones masivas.

6. El vocabulario es consistente: "regla", "alcance", "grabación", "transcripción". No aparece "acción", "ejecutar ahora", "procesar" en el sentido manual.