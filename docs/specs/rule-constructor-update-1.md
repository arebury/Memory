# AMPLIACIÓN DEL CONSTRUCTOR DE REGLAS — PRIORIZACIÓN Y DUPLICACIÓN SEGURA

## CONTEXTO

Esta actualización amplía el sistema de reglas de Memory 3.0 con dos mecánicas críticas:

1. Priorización entre reglas activas, para resolver qué regla gana cuando varias aplican a la misma conversación.
2. Bloqueo de activación tras duplicar una regla, forzando al supervisor a editar al menos un campo antes de poner la copia en producción.

Principio rector: claridad absoluta. El supervisor debe entender en todo momento qué regla gana, por qué está bloqueada una regla, y qué cambia si reordena el listado.

Esta actualización NO modifica el constructor de reglas (alcance, grabación, transcripción) ni el modal de acciones masivas. Solo afecta a la vista de listado de reglas y al flujo de duplicación.

## VISTA DE LISTADO DE REGLAS

### Estructura de la tabla

La lista de reglas se presenta como tabla con las siguientes columnas, de izquierda a derecha:

1. Orden (handle drag)
   - Icono handle a la izquierda de cada fila.
   - Solo visible/operable en reglas activas. Las inactivas y borradores no participan en el orden de ejecución.
   - El orden numérico visible a la izquierda del handle, no editable por input.

2. Nombre de la regla
   - Clicable, navega al constructor en modo edición.
   - Si es un borrador sin editar, el nombre aparece con prefijo tipográfico discreto "Copia de" y badge adyacente "Borrador sin editar".

3. Alcance resumido
   - Resumen compacto en texto: "Servicio Ventas, 2 grupos, 12 agentes".
   - Truncado si excede ancho, con tooltip al hover.

4. Acciones configuradas
   - Chips icon-only para cada acción: icono de grabación, icono de transcripción. Tooltip al hover nombra la acción.

5. Estado
   - Etiqueta con texto explícito. No usar solo color. Valores:
     - Activa (verde)
     - Inactiva (gris)
     - Borrador sin editar (ámbar)
     - En conflicto (rojo)

6. Última modificación
   - Fecha relativa: "hace 2 horas", "ayer", "15 Mar".

7. Menú de acciones (kebab)
   - Opciones: Editar, Duplicar, Activar/Desactivar, Eliminar.
   - Eliminar con confirmación de alta fricción (nombre de la regla a escribir, por la decisión previa sobre acciones destructivas).

### Agrupación visual del listado

La tabla se divide en dos secciones verticales, con separador claro:

1. Sección superior: Reglas activas, ordenables por drag-and-drop. Orden visible numéricamente (1, 2, 3...).
2. Sección inferior: Reglas inactivas y borradores. Sin orden numérico. Ordenables solo por columnas estándar (nombre, fecha).

Esta separación es crítica: el orden solo importa para reglas que están en producción. Mezclar activas e inactivas en el mismo listado ordenable confunde el modelo mental.

## MECÁNICA DE PRIORIZACIÓN

### Regla de resolución (cómo se comporta el sistema)

Cuando una conversación cumple los criterios de alcance de múltiples reglas activas:

1. Se ejecutan todas las acciones no contradictorias de todas las reglas que aplican.
2. En caso de contradicción (dos reglas piden cosas opuestas sobre el mismo atributo), gana la regla más alta en el orden visual de la lista.

Arriba = más prioridad. Este es el mental model único, consistente y no negociable.

### Interacción drag-and-drop

- Handle visible a la izquierda de cada fila de regla activa.
- Durante el arrastre:
  - La fila arrastrada se eleva visualmente (sombra sutil, mediante box-shadow y transform, nunca mediante top/left).
  - Las demás filas se desplazan mediante transform: translateY para indicar posición de destino.
  - Microcopy de ayuda aparece sobre la fila arrastrada con texto dinámico: "Esta regla se evaluará antes que [nombre de la regla siguiente]".
- Al soltar:
  - La reordenación se aplica inmediatamente, sin modal de confirmación. Es una acción reversible.
  - Toast confirmatorio discreto: "Orden actualizado".
  - Se actualiza el campo "Última modificación" de las reglas afectadas.

### Detección de conflicto entre reglas

Si dos reglas activas comparten alcance solapado y tienen acciones contradictorias, se marcan ambas con badge "En conflicto" en la columna Estado.

Al hacer clic en el badge "En conflicto" en una fila, se abre un popover que:
- Nombra la/s regla/s con las que conflictúa.
- Explica qué acción está en conflicto.
- Indica qué regla gana según el orden actual.
- Ofrece dos CTA: "Reordenar" (scroll a la regla en conflicto con handle activo) y "Editar alcance" (navega al constructor).

El conflicto no bloquea el guardado ni la activación. El supervisor puede convivir con conflictos si entiende las consecuencias. La UI le da las herramientas para resolverlo cuando decida.

## MECÁNICA DE DUPLICACIÓN

### Flujo al duplicar

Al seleccionar "Duplicar" en el menú kebab de una regla:

1. Se crea inmediatamente una nueva regla en la sección inferior del listado (reglas inactivas/borradores).
2. La copia hereda:
   - Todo el alcance, filtros de grabación y transcripción.
   - Nombre con prefijo "Copia de [nombre original]".
   - Estado: Borrador sin editar.
   - Toggle de activación: deshabilitado.
3. Toast confirmatorio: "Regla duplicada. Edita al menos un campo para poder activarla."
4. El listado hace scroll automático a la nueva fila y la destaca con un highlight temporal (background con opacity animation que se desvanece en ~2s, nunca animando height/width).

### Estado "Borrador sin editar"

La fila de un borrador sin editar presenta estas diferencias visuales:

- Badge persistente "Borrador sin editar" en la columna Estado (fondo ámbar tenue, texto oscuro).
- Toggle de activación en estado deshabilitado, con cursor: not-allowed al hover.
- Tooltip al hover sobre el toggle deshabilitado: "Edita al menos un campo para poder activar esta regla."
- El resto de la fila es operable normalmente (editar, eliminar, duplicar de nuevo).

### Dentro del constructor (regla borrador en edición)

Al abrir un borrador sin editar en el constructor:

- Banner persistente en la cabecera del constructor, anclado a un contenedor reservado (no se inyecta dinámicamente por encima de contenido existente):
  - Fondo ámbar tenue.
  - Icono de advertencia.
  - Texto: "Esta regla es una copia sin modificar. Edita al menos un campo y guarda para poder activarla."
  - Botón secundario: "Descartar copia" (elimina el borrador y vuelve al listado).
- El botón "Activar" del constructor está deshabilitado con el mismo tooltip explicativo.
- El botón "Guardar" está habilitado pero solo tiene efecto si hay cambios reales respecto al original (detección por diff).

### Condición de desbloqueo

Cualquier edición guardada retira el estado "Borrador sin editar":
- Cambio de nombre.
- Cambio de descripción.
- Cambio en alcance (añadir/quitar servicios, grupos, agentes).
- Cambio en filtros de grabación o transcripción.
- Cambio en configuración de análisis.

Al guardar con cambios, el banner desaparece, el badge se retira, y el toggle de activación se habilita. Toast: "Regla lista para activar."

## ESTADOS QUE DEBE CUBRIR EL PROMPT

1. Listado vacío (sin reglas creadas): empty state con CTA principal "Crear primera regla". Sin iconos decorativos sin utilidad.
2. Listado con solo reglas inactivas: sección superior colapsada con mensaje "Ninguna regla activa. Activa una regla para empezar a aplicarla."
3. Listado con reglas activas (una o varias): tabla completa con orden visible.
4. Listado con conflicto detectado: badges "En conflicto" y popover explicativo accesible.
5. Listado con borradores sin editar: badge ámbar, toggle deshabilitado, tooltip explicativo.
6. Durante drag: feedback visual de posición de destino, microcopy dinámico.
7. Skeleton de carga: filas placeholder con min-height reservado mientras carga la lista.

## CRITERIOS DE ACEPTACIÓN

1. El supervisor entiende sin formación previa que "arriba en la lista = más prioridad".
2. El supervisor entiende por qué una regla duplicada no puede activarse, y qué hacer para desbloquearla.
3. Ningún estado es ambiguo: todo borrador, conflicto o estado especial tiene un texto explícito que lo nombra.
4. Las animaciones usan exclusivamente transform y opacity.
5. Los banners, toasts y highlights se insertan en contenedores pre-reservados, nunca desplazando contenido existente.
6. No hay iconos sin label en la columna Estado.
7. La separación entre reglas activas (ordenables) e inactivas/borradores (no ordenables) es visualmente inequívoca.
8. El flujo de duplicación guía al supervisor al siguiente paso sin dejarle pensar "¿y ahora qué?".

## FUERA DEL ALCANCE

- Constructor de reglas (alcance, grabación, transcripción): no modificar.
- Modal de acciones masivas: no tocar, no mencionar.
- Reglas programadas por fecha/hora: fuera de esta iteración.
- Versionado o historial de cambios de reglas: fuera de esta iteración.