# Memory · Sistema de diseño

*Memory · Smart Contact · Por Rafael Areses*

---

## Sobre este documento

El Smart Contact Design System (SC DS) es el conjunto de reglas visuales y de interacción que rigen Memory y, por extensión, el resto del producto Smart Contact donde se aplica. No es un catálogo de componentes: es un sistema de **decisiones tomadas de antemano** para que cada nueva pantalla no tenga que reinventarlas.

Este documento explica el sistema en lenguaje natural: qué decisiones están tomadas sobre tipografía, color, espacio, movimiento y componentes; por qué; y qué patrones quedaron explícitamente fuera. La fuente técnica de verdad (los tokens, las variables CSS, la implementación) vive en `src/styles/sc-design-system.css`. Aquí cuento el *por qué* y el *cómo se siente*.

Está pensado para que un diseñador, un PM o un developer que llegue al proyecto entienda el lenguaje visual sin tener que abrir Figma ni leer mil líneas de CSS.

---

## La filosofía · densidad antes que decoración

Memory es un dashboard que el supervisor mira ocho horas al día. Cada decisión del SC DS se inclina hacia un mismo norte: **información por píxel, no chrome por chrome**. Si una idea visual no aporta dato o jerarquía, sobra.

De ahí derivan tres principios:

- **Tokens, no magic numbers.** Cada color, cada espacio, cada animación tiene un nombre (`--sc-accent`, `--sc-space-300`, `--sc-duration-base`). Hard-codear `#60D3E4` en un componente es deuda; abrir un token en el sistema es la forma de añadir variedad sin fragmentar la coherencia.
- **Una sola señal por estado.** Cuando una fila puede estar "transcrita", "en proceso", "fallida" o "recientemente cambiada", el sistema elige una sola pictograma o un solo color que carga el dato — no tres badges apilados ni mezcla de bordes y bg.
- **El acento se reserva.** El teal (`--sc-accent`) es el color que comunica "esto fue procesado" o "esto es la acción primaria". Aparece poco a propósito: si está en todas partes, deja de significar.

---

## Tipografía

**Roboto** (Google Fonts) en pesos 300, 400, 500 y 700. La familia es decisión del cliente y se mantiene mientras el DS oficial de Smart Contact no migre a otra cosa. No se mezcla con una segunda familia para titulares ni para mono.

La escala es **modular y fija** (no fluid), pensada para UI de producto, no para landing:

| Token | Tamaño | Uso |
|---|---|---|
| `--sc-font-size-xs` | 11 px | Captions, badges pequeños, hints muted |
| `--sc-font-size-sm` | 12 px | Body secundario, labels de columna |
| `--sc-font-size-body` | 14 px | Body principal del producto |
| `--sc-font-size-md` | 16 px | Subtítulos, títulos de decisión |
| `--sc-font-size-lg` | 18 px | Títulos de modal |
| `--sc-font-size-xl` | 21 px | Lead occasional |
| `--sc-font-size-display` | 112 px | Número hero del bulk modal |

El salto entre tamaños es contrastivo: las jerarquías se leen sin esfuerzo porque hay diferencia clara, no porque uno sea 15 px y el otro 16. Los UPPERCASE se reservan para etiquetas estructurales cortas (`TOTAL A PROCESAR`, `ANÁLISIS`); el resto del producto es lowercase y minúscula natural.

**Por qué Roboto pese a estar en la lista de "fuentes reflejo" de los generadores de UI**: es la fuente del cliente, ya implantada en otros productos de Smart Contact. Cambiarla aquí crearía drift entre productos sin valor real. Cuando el cliente decida migrar, migraremos.

---

## Color

### Estructura · tres capas

El sistema tiene tres capas de color, en orden de abstracción:

1. **L1 primitives**: los hex literales (`#60D3E4`, `#1B273D`...). Viven en `--sc-accent-300`, `--sc-navy-600`, etc. Son los "ingredientes". No se referencian directamente desde componentes.
2. **L2 semantic**: tokens con significado (`--sc-bg-primary`, `--sc-text-heading`, `--sc-accent-strong`). Apuntan a un primitive y se renombran si el primitive cambia. Aquí es donde se referencia desde componentes.
3. **L3 component-specific**: tokens muy locales a un único componente (`--sc-bulk-divider-color`, `--sc-modal-min-height`). Solo cuando el valor es genuinamente específico de ese componente y no reutilizable.

### Paleta

- **Neutrales cálidos**: `#FFFFFF`, `#F9FAFB`, `#F3F4F6`, `#D3D5DA`, `#9499A3`, `#5C616B`, `#181D26`. Todos tintados levemente hacia el navy del brand, así los grises no se sienten "fríos de Material".
- **Navy del brand**: `--sc-navy-600` (`#1B273D`). El primario. Aparece en el sidebar, en CTAs filled, en bordes de énfasis.
- **Acento teal**: `--sc-accent` (`#60D3E4`) para estado "procesado" y `--sc-accent-strong` (`#48B8C9`) para captions ON-state. Es el 10% del 60-30-10: el dato que dice "esto ya está hecho".
- **Coste / advertencia amber**: `--sc-cost-warn` (`#D97706`). Reservado a "genera coste" y similares. NO se usa decorativamente.
- **Error rojo**: `--sc-error-strong` (`#DC2626`). Solo para fallos de transcripción y CTAs destructivos.
- **Info azul** y **success verde**: existen como L1 primitives para toasts (`scToast.info`, `scToast.success`) pero NO se usan como acento decorativo en componentes.

### Reglas de uso

- **Texto sobre fondos coloreados**: nunca gris. Si el fondo es `--sc-accent-soft`, el texto va en `--sc-accent-strong` (mismo hue, no neutro). El gris sobre tinte se ve "washed-out".
- **Negro nunca puro**. El "negro" de la app es `#181D26` (`--sc-surface-900`). Pure `#000000` no aparece en ningún sitio.
- **El warm bg de la app** (`#F4F6FC`, `--sc-bg-canvas`) es el "fondo descansado" donde viven las cards. Las cards son blancas (`--sc-surface-0`); los hovers dropean un tono.

---

## Espacio y ritmo

Escala base de 4pt, con tokens semánticos (no pixel-named):

```
--sc-space-100 =  4px
--sc-space-150 =  6px
--sc-space-200 =  8px
--sc-space-250 = 10px
--sc-space-300 = 12px
--sc-space-400 = 16px
--sc-space-500 = 20px
--sc-space-600 = 24px
--sc-space-700 = 28px
```

El paso por 8pt es demasiado coarse para UI densa; los 4pt permiten ajustes finos (un padding de 10 que rompería con 8/16 funciona limpio con `--sc-space-250`).

**Regla del ritmo**: no aplicar el mismo padding en todos lados. Las cards principales tienen `--sc-space-600` (24); las cards anidadas, `--sc-space-400` (16); los chips dentro de cards, `--sc-space-200` (8). Esa variación de ritmo es la que da sensación de jerarquía sin necesidad de bordes ni shadows.

**Gaps en sibling**: siempre `gap` en flex/grid, nunca margin. Evita el margin collapse y las soluciones-parche.

---

## Iconografía

- **`lucide-react`** para iconos de producto. Tamaño coherente (12, 14, 15, 16 o 18 px según contexto). `strokeWidth` por defecto `1.75`.
- **SVGs propios** (`StatusIcons.tsx`) para las pictogramas de estado que mezclan canal (llamada/chat) + processing-state. Estos no están en lucide; los entregó diseño y se mantienen como assets.
- **Cero emojis** en UI. Regla absoluta. Los emojis tienen render variable por plataforma (negros en macOS, color en Windows), no se versionan, y trasmiten un registro casual que choca con la voz del producto.
- **El icono de "AI"** (`Sparkles`) está reservado a la pill "Generado por IA" en el aside del resumen. Se intentó usar en otras pestañas como cue visual de "este contenido es IA" — discusión abierta sin cerrar.

---

## Movimiento

Cuatro animaciones SC-prefixed, todas afirmativas (no críticas para el flujo):

| Token | Duración | Cuándo |
|---|---|---|
| `animate-sc-bump` | 260 ms | Hero number cuando cambia de valor |
| `animate-sc-pulse` | 360 ms | Toggle, cuando activa una decisión |
| `animate-sc-shake` | 280 ms | Botón disabled si el usuario insiste |
| `animate-sc-delta-fly` | 750 ms | "+N" flotante junto al hero |

Ease-out `cubic-bezier(0.22, 1, 0.36, 1)`. Cero bounce, cero elastic — sienten datados y juguete.

**`prefers-reduced-motion`** silencia las cuatro. Las animaciones son afirmativas, su ausencia no rompe ningún caso de uso.

**Solo `transform` y `opacity`**. Animar `width`, `height`, `padding` rompe la performance al forzar relayout — no se hace en el sistema.

---

## Patrones de componente

### Modal compound `<Modal>`

Shell oficial para cualquier diálogo. API:

```tsx
<Modal open={...} onOpenChange={...}>
  <Modal.Content width={520}>
    <Modal.Header icon={...} title="..." subtitle="..." />
    <Modal.Body>...</Modal.Body>
    <Modal.Footer>
      <Modal.Cancel>Cerrar</Modal.Cancel>
      <Modal.Action onClick={...}>Procesar</Modal.Action>
    </Modal.Footer>
  </Modal.Content>
</Modal>
```

Construido sobre Radix Dialog (focus trap, scroll lock, ESC, portal, stacking). Roboto, `--sc-navy-600` para el CTA, hover hacia `--sc-navy-700`. Padding y radios consistentes via tokens.

Toda la app pasó a este shell. Los `Dialog` y `AlertDialog` de shadcn-vanilla NO se usan ya en nuevos modales (siguen disponibles para components shadcn que aún los necesitan internamente).

### Toast `scToast`

Wrapper sobre `sonner` que aplica el look-and-feel del DS. API:

```tsx
scToast.success({ title, message, action, duration, layout, appearance });
scToast.error({ title, message, action });
scToast.warning({ title, message });
scToast.info({ title });
scToast.indigo({ title, message });   // cue específico de IA
```

Cinco severities, cinco hues consistentes. **Nada en el código importa `toast` de `sonner` directamente** — todo pasa por `scToast` para que el look no se cuele.

### Empty states

Tres variantes:

- `DecisionState`: empty state con CTA accionable. Mensaje + descripción + botón + cost cue inline.
- `ProcessingState`: empty state mientras una operación corre. Spinner + mensaje + cost reminder.
- `TerminalNote`: estado final sin acción (sin grabación, transcripción vacía, GDPR vencida). Solo mensaje muted.

Los tres viven en **una columna centrada**, no en split-layout. Probamos split en una iteración y se descartó: en un panel operativo daba sensación de página marketing.

### Buttons

Tres jerarquías:

- **Primary filled** (`bg-sc-primary`, `text-white`): una sola por contexto. La acción principal.
- **Secondary outlined** (`border-sc-border`, `text-sc-primary`): acciones secundarias del mismo nivel.
- **Ghost** (`text-sc-muted hover:bg-sc-canvas`): destructive o terciario, integrado en cabeceras y toolbars.

Cero gradients en buttons. Cero bordes left/right de 3px coloreados como "stripe accent" — patrón AI prohibido.

### Toggle de análisis

Patrón único en `BulkTranscriptionModal`. Switch + caption descriptiva debajo. Disabled cuando no hay nada que analizar; el botón principal del modal se deshabilita al apagarlo si era la única razón para procesar.

---

## Lo que NO está en el sistema

Anti-patrones explícitos a evitar:

- **Gradient text**: NUNCA. `background-clip: text` con gradiente es el "AI tell" número uno. Si quieres énfasis, usa peso (`font-weight`) o tamaño.
- **Border-left coloreado de 3-4px**: NUNCA en cards, list items, callouts ni alerts. Es el patrón más sobreutilizado en admin UI. Si quieres distinción, usa un background tint o un icono leading.
- **Glassmorphism**: prohibido. Capa de blur sobre un fondo sólido no aporta nada en una UI operativa.
- **Cards de KPI con número grande + gradiente accent**: patrón "AI dashboard generic". No.
- **Card-grid de cards-idénticas con icon + heading + text repetido**: lo mismo. Variedad por jerarquía, no por repetición.
- **Sparklines decorativas**: gráficos pequeños que no comunican nada concreto. No.
- **Sombras drop "rounded rectangle con shadow"**: el sistema usa `--sc-shadow-sm`, `--sc-shadow-popover`, `--sc-shadow-modal` con valores específicos por contexto. NO el `shadow-xl` genérico de Tailwind.

Si un componente nuevo siente la tentación de cualquiera de estas, hay un mejor camino dentro del sistema.

---

## Lo que NO está cerrado todavía

- **Modo oscuro**: los tokens están definidos en `default_theme.css` con la clase `.dark` (shadcn standard), pero no hay toggle de UI ni variantes dark de los `--sc-*`. Vendrá con caso de uso definido.
- **Sparkles como icono multi-uso**: ya mencionado. Si se decide que Sparkles puede etiquetar contenido IA (no solo la pill), se documenta aquí.
- **Side-panel vs modal cross-cutting**: hay `Sheet` lateral conviviendo con `Modal` central. Decisión sistémica de cuándo cada uno está pendiente.

Cuando alguna se cierre, se mueve al cuerpo del sistema con su razonamiento.
