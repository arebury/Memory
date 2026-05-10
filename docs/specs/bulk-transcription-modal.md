# Master prompt — Bulk Transcription Modal v11

Memory 3.0 · Acción masiva de transcripción y análisis IA
Iteración v11 · Taxonomía de destinos mutuamente excluyentes

---

## 0. Alcance de esta iteración

Este prompt describe **una evolución del modal v10**, no un rediseño.

Se mantiene exactamente igual respecto a v10:
- El patrón visual (hero con tres bloques grandes en columna + toggle + warning footer).
- El toggle "Incluir análisis IA" y su comportamiento de bloqueo/shake.
- Los chips de canal (Llamadas / Chat) como meta-información bajo cada bloque.
- El empty state cuando no hay nada que procesar.
- La cabecera "Acción masiva → Transcribir y analizar" + contador de seleccionadas.

El único cambio sustantivo está en **qué representan las tres columnas del hero** y, por tanto, en los cálculos y el microcopy que las acompañan. No toques estilos, tipografías, espaciados, colores ni iconografía.

---

## 1. Problema que esta iteración resuelve

En v10 las tres columnas representan **operaciones** (transcribir, analizar, omitir). Como una misma conversación puede recibir dos operaciones a la vez (transcribir + analizar), la suma de las columnas no coincide con el total de conversaciones seleccionadas. Ejemplo (escenario C4, 18 seleccionadas): `8 transcribir + 14 analizar + 4 omitidas = 26 ≠ 18`. El supervisor pierde confianza en la cifra mostrada.

**v11 reencuadra las columnas como destinos por conversación**. Cada conversación seleccionada cae en exactamente **un** destino, nunca en dos. La suma de las tres columnas siempre iguala el número de conversaciones seleccionadas.

---

## 2. Invariante fundamental (condición de verdad)

> Para cualquier escenario y cualquier estado del toggle:
> **`destino_1 + destino_2 + destino_3 === total_seleccionadas`**

Si al generar cualquier combinación de escenario + toggle esta igualdad no se cumple, la implementación está mal.

---

## 3. Modelo de datos (sin cambios respecto a v10)

Los seis escenarios se mantienen. Cada escenario define el reparto de las conversaciones seleccionadas entre cinco buckets internos:

| Escenario | Descripción | `c.t` | `c.ea` | `c.aa` | `ch.ea` | `ch.aa` | Total |
|---|---|---|---|---|---|---|---|
| C1 | Todo procesado | 0 | 0 | 18 | 0 | 6 | 24 |
| C2 | Transcritas sin análisis | 0 | 14 | 3 | 0 | 0 | 17 |
| C3 | Solo transcribir | 10 | 0 | 2 | 0 | 0 | 12 |
| C4 | Transcribir + analizar | 8 | 6 | 4 | 0 | 0 | 18 |
| C5 | Solo chats | 0 | 0 | 0 | 9 | 2 | 11 |
| C6 | Llamadas + chats | 7 | 4 | 2 | 5 | 1 | 19 |

Significado de los buckets internos (no se muestran al usuario, son el input):

- `c.t` — llamadas seleccionadas **sin transcribir todavía**.
- `c.ea` — llamadas seleccionadas **ya transcritas pero sin analizar** (elegibles para análisis).
- `c.aa` — llamadas seleccionadas **ya transcritas y ya analizadas**.
- `ch.ea` — chats seleccionados **sin analizar** (los chats no necesitan transcripción, entran directos a análisis).
- `ch.aa` — chats seleccionados **ya analizados**.

---

## 4. Taxonomía de destinos (el cambio clave)

Las tres columnas del hero representan ahora los tres destinos posibles de cada conversación seleccionada. Son **mutuamente excluyentes**.

### Columna 1 — Primera acción pendiente (etiqueta dinámica)

La etiqueta depende del toggle:

- **Toggle ON** → etiqueta: `Transcribir + analizar`
- **Toggle OFF** → etiqueta: `Solo transcribir`

Valor: `c.t` (las llamadas sin transcribir — reciben transcripción ahora y, si el toggle está ON, también análisis).

Chip de canal: `Llamadas` (solo cuando el valor > 0).

### Columna 2 — Solo analizar

Etiqueta fija: `Solo analizar`

Valor:

- **Toggle ON** → `c.ea + ch.ea` (llamadas ya transcritas + chats sin analizar, todos reciben análisis).
- **Toggle OFF** → `0` (si el usuario desactiva análisis, nada entra a este destino; estas conversaciones se quedan como están y se reclasifican como omitidas visualmente; ver sección 5).

Chips de canal: `Llamadas` si `c.ea > 0` y el toggle está ON; `Chat` si `ch.ea > 0` y el toggle está ON.

### Columna 3 — Omitidas

Etiqueta fija: `Omitidas`

Valor: base `c.aa + ch.aa` más, si toggle OFF, `c.ea + ch.ea` (las que el usuario decide no analizar pasan a omitidas visualmente, porque no reciben ninguna acción en esta ejecución).

Chips de canal: derivados de qué hay dentro. `Llamadas` si `c.aa > 0` o (toggle OFF y `c.ea > 0`). `Chat` si `ch.aa > 0` o (toggle OFF y `ch.ea > 0`).

La columna sigue visualmente atenuada (igual que v10).

---

## 5. Fórmulas exactas (reemplazan a `useCalc` del v10)

```
// Input
selected = c.t + c.ea + c.aa + ch.ea + ch.aa
analysisOnlyMode = (c.t === 0) && (c.ea + ch.ea > 0)
// Cuando no hay nada que transcribir pero sí que analizar,
// el toggle se bloquea en ON (igual que v10).
toggleLocked = analysisOnlyMode
toggleOn = toggleLocked ? true : userToggleOn

// Destinos
destination1 = c.t
destination2 = toggleOn ? (c.ea + ch.ea) : 0
destination3 = (c.aa + ch.aa) + (toggleOn ? 0 : (c.ea + ch.ea))

// Etiqueta dinámica columna 1
destination1Label = toggleOn ? "Transcribir + analizar" : "Solo transcribir"

// Procesables (para el warning del footer)
toProcess = destination1 + destination2

// Estado del modal
isAllProcessed = (destination1 + destination2) === 0 && destination3 === selected
buttonDisabled = toProcess === 0
```

**Verifica siempre**: `destination1 + destination2 + destination3 === selected`.

---

## 6. Estados por escenario (verificación)

Con esta tabla puedes probar visualmente que las fórmulas son correctas. **Suma esperada siempre igual al total de la columna "Sel".**

### Toggle ON

| Esc | Sel | Dest 1 (etiqueta) | Valor | Dest 2 | Dest 3 | Σ | Botón |
|---|---|---|---|---|---|---|---|
| C1 | 24 | Transcribir + analizar | 0 | 0 | 24 | 24 ✓ | Empty state |
| C2 | 17 | Transcribir + analizar | 0 | 14 | 3 | 17 ✓ | Activo |
| C3 | 12 | Transcribir + analizar | 10 | 0 | 2 | 12 ✓ | Activo |
| C4 | 18 | Transcribir + analizar | 8 | 6 | 4 | 18 ✓ | Activo |
| C5 | 11 | Transcribir + analizar | 0 | 9 | 2 | 11 ✓ | Activo |
| C6 | 19 | Transcribir + analizar | 7 | 9 | 3 | 19 ✓ | Activo |

### Toggle OFF

| Esc | Sel | Dest 1 (etiqueta) | Valor | Dest 2 | Dest 3 | Σ | Botón |
|---|---|---|---|---|---|---|---|
| C1 | 24 | Solo transcribir | 0 | 0 | 24 | 24 ✓ | Empty state |
| C2 | 17 | Solo transcribir | 0 | 0 | 17 | 17 ✓ | Deshabilitado (toggle locked en ON real, este caso no ocurre) |
| C3 | 12 | Solo transcribir | 10 | 0 | 2 | 12 ✓ | Activo |
| C4 | 18 | Solo transcribir | 8 | 0 | 10 | 18 ✓ | Activo |
| C5 | 11 | Solo transcribir | 0 | 0 | 11 | 11 ✓ | Deshabilitado (toggle locked en ON real) |
| C6 | 19 | Solo transcribir | 7 | 0 | 12 | 19 ✓ | Activo |

**Casos con toggle bloqueado en ON** (C2 y C5): cuando `c.t === 0` y hay algo elegible para análisis, el toggle aparece en estado ON bloqueado con candado. El usuario no puede desactivarlo (shake de 320ms al intentarlo, como en v10). La descripción del toggle cambia a microcopy contextual (ver sección 8).

---

## 7. Estructura del modal

De arriba a abajo:

1. **Cabecera**
   - Eyebrow: `ACCIÓN MASIVA`
   - Título: `Transcribir y analizar`
   - Subtítulo: `{total_seleccionadas} conversaciones seleccionadas`
   - Botón cerrar (X) en la esquina superior derecha

2. **Cuerpo**
   - Si `isAllProcessed`: mostrar empty state con icono check + título `Todo al día` + subtítulo `Todas las conversaciones seleccionadas ya están procesadas.`
   - Si no, mostrar los tres bloques del hero en fila (grid 3 columnas, igual que v10):
     - Cada bloque tiene: label con icono pequeño · cifra grande (`Inter 300` o la tipografía que v10 use — no la cambies) · descripción corta · chips de canal en footer.
     - Columna 1: icono de documento con texto. Cifra `destination1` (o `—` si es 0). Descripción corta (ver sección 8).
     - Columna 2: icono de sparkles. Cifra `destination2` (o `—` si es 0). Si toggle OFF y `c.ea + ch.ea > 0`, bloque atenuado con hint inline `Activa análisis ↑`.
     - Columna 3: icono de skip/play-next. Cifra `destination3` (o `—` si es 0). Siempre visualmente atenuado (opacity 0.4, igual que v10).
   - Debajo del grid: toggle "Incluir análisis IA" (idéntico a v10).

3. **Footer**
   - Warning contextual con icono info + texto: `**{toProcess}** conversaciones se procesarán · genera costes`. Oculto cuando el botón está deshabilitado.
   - Botonera alineada a la derecha: `Cancelar` (ghost) + `Procesar` (primario). El botón primario queda deshabilitado si `toProcess === 0`.

---

## 8. Microcopy exacto (todo en español)

### Cabecera
- Eyebrow: `ACCIÓN MASIVA`
- Título: `Transcribir y analizar`
- Subtítulo: `{n} conversaciones seleccionadas`

### Columna 1
- Label toggle ON: `Transcribir + analizar`
- Label toggle OFF: `Solo transcribir`
- Descripción corta si valor > 0: `Llamadas sin transcribir`
- Descripción corta si valor = 0: `Nada que transcribir`

### Columna 2
- Label: `Solo analizar`
- Descripción si valor > 0 y toggle ON: `Resumen + sentimiento`
- Descripción si valor = 0 y (`c.ea + ch.ea`) = 0: `Nada elegible`
- Hint inline cuando toggle OFF pero hay elegibles: `Activa análisis ↑`

### Columna 3
- Label: `Omitidas`
- Descripción si valor solo contiene `c.aa + ch.aa`: `Ya procesadas`
- Descripción si valor incluye `c.ea + ch.ea` (caso toggle OFF): `Ya procesadas · análisis desactivado`
- Descripción si valor = 0: `Ninguna`

### Toggle análisis IA
- Título: `Incluir análisis IA`
- Descripción en estado normal: `Resumen y sentimiento`
- Descripción en estado bloqueado (C2): `Todas las llamadas ya están transcritas`
- Descripción en estado bloqueado (C5 o combinaciones solo-chats): `Los chats entran directos a análisis`

### Warning footer
- Texto: `**{toProcess}** conversaciones se procesarán · genera costes`
- Aparece solo cuando `toProcess > 0`. El número va en negrita con tabular numerals.

### Empty state (C1)
- Icono: check (círculo verde atenuado)
- Título: `Todo al día`
- Subtítulo: `Todas las conversaciones seleccionadas ya están procesadas.`

### Botones
- Cancelar: `Cancelar` (ghost, neutral)
- Procesar: `Procesar` (primario). Deshabilitado si `toProcess === 0`.

---

## 9. Comportamiento del toggle (igual que v10 + matices)

- Toggle normal: ON/OFF libre, controla si la columna 1 incluye análisis y si la columna 2 tiene valor.
- Toggle bloqueado (`analysisOnlyMode`): aparece en ON con icono de candado, no responde al click. Al intentar clickarlo: animación shake de 320ms (idéntica a v10). Cursor `not-allowed`.
- El cambio de toggle reflecta instantáneamente en:
  - Etiqueta columna 1 (cambio de texto).
  - Cifra columna 2 (aparece/desaparece con transición de opacidad).
  - Cifra columna 3 (se recalcula sumando o restando `c.ea + ch.ea`).
  - Cifra del warning footer.
  - Estado del botón Procesar.

**Todas las transiciones de valor usan exclusivamente `opacity` y `transform`. Nunca animar `width`, `height`, `top`, `left` ni propiedades que disparen reflow.**

---

## 10. Qué NO debe cambiar respecto a v10

- Paleta, tipografías, iconos, espaciados, radios, sombras: idénticos.
- El tamaño del modal (max-width 560px) se mantiene.
- La zona de selección y la tabla de fondo (mock list) se mantienen idénticas.
- La lógica de procesamiento (pulse amarillo 2.4s + fila nueva en verde) se mantiene. El `applyProcessed` del v10 sigue funcionando: lo que cambia es cómo se **muestra** el estado, no cómo se ejecuta.
- El escenario-rail flotante y los tweaks se mantienen para debug.
- La cabecera del mock (`Memory 3.0 / Conversaciones / Todas`) se mantiene.

---

## 11. Checklist de verificación antes de entregar

Antes de dar v11 por terminado, prueba manualmente cada combinación de escenario (C1–C6) × toggle (ON/OFF) y verifica:

- [ ] La suma de las tres columnas del hero es **exactamente igual** al número en el subtítulo "{n} conversaciones seleccionadas".
- [ ] En C1 aparece el empty state "Todo al día", no las columnas vacías.
- [ ] En C2 y C5 el toggle aparece bloqueado en ON con candado y shake al click.
- [ ] La etiqueta de la columna 1 cambia entre "Transcribir + analizar" y "Solo transcribir" según el toggle.
- [ ] Al apagar el toggle en C4, la columna 2 cae a 0 y la columna 3 sube de 4 a 10 (6 que estaban en "Solo analizar" se mueven a "Omitidas").
- [ ] El warning del footer siempre muestra `destination1 + destination2` y se oculta si el botón está deshabilitado.
- [ ] El botón `Procesar` queda deshabilitado cuando `destination1 + destination2 === 0`.
- [ ] Los chips de canal debajo de cada columna reflejan correctamente qué tipos de conversación hay dentro de ese destino.
- [ ] Todas las transiciones entre estados del toggle son con `opacity`/`transform`. Ninguna con `width`/`height`.

---

## 12. Una línea que resume el cambio

> En v10 las columnas decían "cuántas operaciones ejecuto". En v11 dicen "qué le pasa a cada conversación". Misma UI, semántica correcta.