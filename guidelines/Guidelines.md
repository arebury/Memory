# Guidelines · Memory 3.0

> Reglas operativas para desarrollar este prototipo. La fuente única de verdad arquitectónica vive en [`src/imports/pasted_text/memory.md`](../src/imports/pasted_text/memory.md). Este archivo destila lo que **necesitas leer antes de tocar código** — el resto está en `memory.md` por si lo necesitas.

## 1. Antes de empezar una sesión

1. Lee la última entrada de `memory.md` sec 15 (session log). Te dice qué se hizo en la sesión anterior y qué dejó pendiente.
2. Si vas a tocar diseño visual, lee `memory.md` sec 4 (design system) y sec 20 (canon). Si tu cambio rompe un canon, abre debate explícito en el log de sesión, no improvises.
3. Si vas a instalar una dependencia, lee `memory.md` sec 16 (estrategia stack). Algunas dependencias están bloqueadas (no `primereact`, no `@phosphor-icons/react`, no `Geist`/`Outfit`/`Cabinet Grotesk`/`Satoshi` como font).

## 2. Código

### Stack y convenciones que NO se discuten

- React 18.3 + Vite 6.3 + TypeScript + Tailwind v4. No introducir `next/*`, no proponer migrar a Vue/Svelte.
- Tokens `--sc-*` en `src/styles/sc-design-system.css`. Si necesitas un valor nuevo (color, espaciado, radio, sombra), abre un token en la capa apropiada (L1 primitive, L2 semantic, L3 component) — no hardcodees hex en un `.tsx`.
- Iconos: `lucide-react` exclusivamente. No `@phosphor-icons/react`, no `@radix-ui/react-icons`, no SVG inline excepto para los pictogramas oficiales del DS (`StatusIcons.tsx`).
- Fuente: Roboto, locked por el cliente. No proponer Geist/Outfit/Cabinet Grotesk/Satoshi como reemplazo.
- Sin emojis en código, markup o copy. Reemplazar por iconos lucide.

### Tailwind + tailwind-merge

- `cn()` de `ui/utils.ts` usa `tailwind-merge`. **Si combinas `text-sc-{size}` + `text-sc-{color}` en un mismo `cn()`, twMerge borra el font-size silenciosamente**. Workaround: aplica `font-size` vía `style={{ fontSize: 'var(--sc-font-size-X)' }}` y deja solo el color en className. Documentado en `memory.md` sec 15.15.
- Para fuera de `cn()` (className plano sin condicionales) NO hay colisión — los dos classes coexisten.

### Focus rings

- Importa `FOCUS_RING` de `src/app/components/ui/focus.ts` para cualquier elemento interactivo. No re-escribir la cadena `focus-visible:…` en sitios nuevos.

### Comments

- Sigue lo que dice CLAUDE.md / system prompt: **no comentes lo obvio**. Comentas solo cuando el WHY es no-obvio, hay un workaround a un bug, o un constraint oculto.

## 3. Diseño visual

### CTA primario

Una sola forma. Documentada en `memory.md` sec 20.1. Si tu CTA no encaja en ese shape, probablemente no es un CTA primario.

### Iconografía canónica

`memory.md` sec 20.3. Tabla de "icono → significado". Antes de usar un icono lucide nuevo, comprueba si el significado ya tiene un icono asignado — un significado, un icono.

### Empty states

Usa el `EmptyState` del player (`ConversationPlayerModal.tsx`) como referencia. Props canónicas: `icon`, `title`, `description`, `highlights`, `meta`, `action`, `secondaryHint`. Documentadas en `memory.md` sec 20.4.

### Copy

- Imperativo conversacional para títulos. Gerundio para procesos activos. Lowercase para cost cues / captions. `memory.md` sec 20.9.
- Si tu CTA dispara coste, añade el cue ("genera coste" o `meta: { intent: 'cost' }`). Sec 20.6.

### Anti-patterns prohibidos

- `border-left: 3px+ solid color` como accent stripe en cards/items. Banned por taste-skill + impeccable.
- Gradient text (`background-clip: text`). Banned.
- Pure `#000000` o `#FFFFFF` en text/bg. Usa los tokens `--sc-surface-*` y `--sc-text-*`.
- Cluster de iconos coloreados apilados (rojo+azul+púrpura). El Repository tenía esto antes; reemplazado por chips inline. No volver.
- Glassmorphism + glow. Innecesario en un dashboard interno.
- 3-cards horizontales idénticas. Si tienes 3 elementos equivalentes, usa lista o flex con jerarquía, no grid de cards.

## 4. Datos mock e invariantes

- **Chats siempre tienen transcripción**. **No hay análisis sin transcripción**. Centralizadas en `normalizeChats(list)` de `mockSamples.ts`. Sec 20.8.
- Si añades una conversación nueva al mock-data, no necesitas marcar `hasTranscription: true` manualmente para chats — el normalizador lo hace.

### Chains de mutaciones async (transcribe → analyze, etc.)

Patrón canónico (sec 15.20 introdujo este, sec 20 lo formaliza):

1. Una **queue** de ids en estado del padre (`chainXIds: string[]`).
2. Un **`useEffect([conversations, chainXIds])`** que detecta cuando un id en la queue cumple el invariant (ej. `hasTranscription === true`) y dispara el siguiente paso, sacándolo de la queue.
3. El handler "combinado" solo mete ids en la queue + dispara el primer paso. NO usa setTimeout para el segundo paso.

**No hacer**:
- `setTimeout(() => onNextStep(id), TIMER_DEL_PASO_ANTERIOR + buffer)` — captura `onNextStep` con su closure stale; falla en silencio cuando `conversations` ha mutado entre click y firing.
- Filtrar elegibilidad por `closure.find(c => c.id === id)?.hasX` fuera del setState callback. Usa `setConversations(prev => ...)` y mira `prev` adentro.

**Implementación canónica**: `handleRequestTranscriptionAndAnalysis` + `chainAnalysisIds` + useEffect en `ConversationsView.tsx`.

## 5. Skills disponibles para esta sesión

Si tienes acceso a Claude Code skills, estas están instaladas y son útiles para Memory:

- `impeccable` — apliable para revisar empty states y CTAs.
- `ui-ux-pro-max` — checklist de accesibilidad y patterns. Usa overrides 4/4/4 (no los defaults 8/6/4 de marketing).
- `taste-skill` — bias correction. Sus defaults son para SaaS landing, NO para dashboard. Override DENSITY a 4, MOTION a 4-6, VARIANCE a 3-4.

`memory.md` sec 15.16 documenta qué reglas de cada skill aplican y cuáles entran en conflicto con el DS.

## 6. Deploy

- Push a `main` dispara Netlify auto-build (~2 min). NO pushear commit-a-commit; agrupa cambios al final de sesión.
- Para validar antes de pushear: `npx -y pnpm@latest build` (~2s). Si pasa local, pasa en Netlify.
- Identidad git locked como `arebury <arebury@users.noreply.github.com>`. Sin `Co-Authored-By: Claude`.

## 7. Cuando no estés seguro

Pregunta antes de:

- Instalar una dependencia nueva.
- Renombrar un token `--sc-*`.
- Cambiar un patrón canónico de sec 20 sin debatirlo.
- Borrar `MockSampleSwitcher` o cualquier código marked como prototype-only.
- Tocar `src/styles/default_theme.css` (es shadcn/ui sync, no editar).

Para todo lo demás, adelante. El log de sesión sec 15 captura qué hiciste y por qué; si la siguiente sesión necesita context, lo encuentra ahí.
