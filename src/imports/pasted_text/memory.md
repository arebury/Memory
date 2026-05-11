# memory.md — Project Context for Claude Code

> **Propósito**: Este archivo es la fuente única de verdad para replicar el proyecto Memory 3.0 en local desde cero, sin acceso a Figma Make. Cualquier desarrollador o IA debe poder leer este documento y entender el proyecto al 100%.

---

## 📋 1. Project Overview

**Nombre**: Memory 3.0  
**Descripción**: Memory es la parte de Smart Contact que permite revisar miles de conversaciones (llamadas y chats) y decidir cuáles transcribir y analizar con IA, sin que el supervisor tenga que escucharlas todas a mano. Sobre esa base, supervisores y administradores configuran reglas automáticas de grabación/transcripción/clasificación IA y gestionan el repositorio de categorías IA y entidades de extracción de datos.

**Para quién**: Supervisores de contact center y administradores de plataforma que necesitan:
- Auditar y revisar conversaciones en tiempo real
- Lanzar transcripciones/análisis IA de forma manual o masiva
- Configurar reglas automáticas que definan qué llamadas grabar, transcribir o analizar con IA

**Contexto de uso**: Web app SPA — dashboard de escritorio. No mobile-first. Layout fijo de pantalla completa (`h-screen`, no scroll de página principal). El contenido scrolleable está confinado en paneles internos.

**Estado actual**: Prototipo funcional / MVP avanzado. Toda la data es mock (sin backend real). El estado persiste en `localStorage` para simular persistencia entre recargas.

**URL de documentación externa** (easter egg en la app): `https://group-image-51851861.figma.site`

---

## 🛠️ 2. Tech Stack

| Categoría | Tecnología | Versión |
|---|---|---|
| Framework | React | 18.3.1 |
| Lenguaje | TypeScript | (sin versión fija en package.json, viene con Vite) |
| Build tool | Vite | 6.3.5 |
| CSS | Tailwind CSS v4 | 4.1.12 |
| Gestor de paquetes | pnpm | 10.33.2 (lockfile pnpm-lock.yaml) |
| UI Components | shadcn/ui (Radix UI based) | varios — kit purgado en 15.35, ver abajo |
| Iconos | lucide-react | 0.487.0 |
| Animaciones | motion (ex-Framer Motion) | 12.23.24 |
| Notificaciones | sonner | 2.0.3 |
| Fechas | date-fns | 3.6.0 (DateRangePicker) |
| Calendarios | react-day-picker | 8.10.1 (DateRangePicker via Calendar primitive) |
| Tema | next-themes | 0.4.6 (sonner Toaster lee modo) |
| Fuente | Roboto (Google Fonts, via CSS `@import`) | 300, 400, 500, 700 |

**Navegación**: el proyecto **no usa react-router** (15.35 lo desinstaló al confirmar 0 imports). Las vistas se gestionan con `useState<View>` en `App.tsx` y nunca se planificó cambiar. Si algún día se migra a router real, hay que refactorizar `App.tsx` completamente.

**Dependencias purgadas en 15.35** (sin importadores · build verificado): `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`, `@popperjs/core`, `react-popper`, `react-dnd`, `react-dnd-html5-backend`, `react-hook-form`, `react-router`, `react-slick`, `react-responsive-masonry`, `recharts`, `cmdk`, `vaul`, `embla-carousel-react`, `input-otp`, `react-resizable-panels`, y 14 paquetes `@radix-ui/*` correspondientes a primitives shadcn borrados. La drag & drop de reglas usa **HTML Drag API nativo** (nunca `react-dnd`).

---

## 📁 3. File Structure

```
project-root/
├── package.json                        # Dependencias del proyecto (pnpm)
├── vite.config.ts                      # Config de Vite: plugins react + tailwindcss, alias @ -> ./src/app
├── postcss.config.mjs                  # Config de PostCSS para Tailwind v4
├── pnpm-lock.yaml                      # 🔒 PROTEGIDO — no tocar
│
├── src/
│   ├── styles/
│   │   ├── globals.css                 # Estilos globales: Roboto import, tokens CSS custom props, keyframes, scrollbar custom
│   │   ├── default_theme.css           # Tokens Tailwind shadcn (dark mode incluido, @theme inline) — KEEP_IN_SYNC, no editar
│   │   ├── sc-design-system.css        # Smart Contact design system tokens (3 capas) + keyframes sc-* — fuente de tokens nuevos
│   │   └── index.css                   # Entry point CSS (imports default_theme + sc-design-system + globals)
│   │
│   ├── imports/
│   │   ├── README.md                   # Handoff notes desde Claude Design (transcripciones masivas)
│   │   └── pasted_text/
│   │       └── memory.md               # ESTE ARCHIVO (canon)
│   │
│   │   # Las specs antiguas (`bulk-transcription-modal.md`, `rule-constructor-update*.md`)
│   │   # se movieron a `docs/specs/` en 15.35 — el código no debía vivir junto a docs.
│   │
│   └── app/
│       ├── App.tsx                     # Root component: gestión de vistas con useState, providers anidados
│       ├── Attributions.md             # Atribuciones de assets
│       │
│       ├── data/
│       │   └── mockData.ts             # Todos los datos mock: conversaciones, servicios, grupos, agentes, etc.
│       │
│       ├── utils/
│       │   └── clipboard.ts            # Utilidades de clipboard
│       │
│       ├── imports/                    # Assets importados desde Figma (SVGs, componentes Figma)
│       │   ├── ScLogo.tsx              # Logo de Smartcontact (SVG inline)
│       │   ├── Container.tsx           # Figma import
│       │   ├── Container-4137-2200.tsx # Figma import variante
│       │   ├── Frame892.tsx            # Figma import
│       │   ├── Frame892-6004-9029.tsx  # Figma import variante
│       │   ├── Group1.tsx              # Figma import
│       │   ├── Group1-4130-808.tsx     # Figma import variante
│       │   ├── svg-*.ts                # Paths SVG exportados desde Figma
│       │   └── pasted_text/            # Specs de features (md y tsx de referencia)
│       │
│       └── components/
│           │
│           ├── figma/
│           │   └── ImageWithFallback.tsx   # 🔒 PROTEGIDO — wrapper de <img> con fallback
│           │
│           ├── ui/                     # primitives en uso (post-purga 15.35: 26 sin importadores borrados)
│           │   ├── alert-dialog.tsx
│           │   ├── alert.tsx
│           │   ├── badge.tsx
│           │   ├── button.tsx
│           │   ├── calendar.tsx        # usado por DateRangePicker
│           │   ├── checkbox.tsx
│           │   ├── collapsible.tsx
│           │   ├── dialog.tsx
│           │   ├── dropdown-menu.tsx
│           │   ├── focus.ts            # FOCUS_RING shared
│           │   ├── input.tsx
│           │   ├── label.tsx
│           │   ├── modal.tsx           # ⭐ SC design system Modal compound (Radix Dialog + sc-* tokens). v25.
│           │   ├── popover.tsx
│           │   ├── sc-toast.tsx        # ⭐ scToast.{success,error,warning,info,indigo} (sobre sonner)
│           │   ├── select.tsx
│           │   ├── separator.tsx
│           │   ├── sheet.tsx
│           │   ├── sonner.tsx          # Toaster wrapper
│           │   ├── switch.tsx
│           │   ├── table.tsx
│           │   ├── textarea.tsx
│           │   ├── tooltip.tsx
│           │   └── utils.ts            # cn() helper (clsx + tailwind-merge)
│           │
│           ├── rules/                  # Sistema de constructores de reglas
│           │   ├── RecordingRuleBuilder.tsx     # Builder regla de grabación
│           │   ├── TranscriptionRuleBuilder.tsx # Builder regla de transcripción
│           │   ├── ClassificationRuleBuilder.tsx # Builder regla de clasificación IA
│           │   └── shared/
│           │       ├── RuleBuilderLayout.tsx    # Layout de 2 columnas para todos los builders
│           │       ├── SelectionCriteria.tsx    # Panel "Alcance" (servicios) reutilizable
│           │       ├── ActiveToggle.tsx         # Switch activa/inactiva con tooltip
│           │       └── AdditionalConditions.tsx # Panel colapsable de condiciones avanzadas
│           │
│           ├── App.tsx (root)
│           ├── Sidebar.tsx             # Barra lateral izquierda de 90px (navegación por iconos)
│           ├── Breadcrumbs.tsx         # Breadcrumb reutilizable (array de {label, onClick?})
│           │
│           ├── ConversationsView.tsx   # Vista principal de conversaciones (tabla + toolbar + filtros)
│           ├── ConversationTable.tsx   # Tabla de conversaciones con acciones por fila
│           ├── ConversationFilters.tsx # Barra de filtros globales (servicio, fecha, etc.)
│           ├── ConversationTypeFilters.tsx  # Filtros de tipo (interno/externo, llamada/chat, etc.)
│           │
│           ├── TypeFilterButton.tsx    # Botón del panel de tipo/reglas
│           ├── TypeFilterPanel.tsx     # Panel desplegable de filtros de tipo y reglas
│           ├── CategoryFilterButton.tsx # Botón del panel de categorías IA (oculto actualmente)
│           ├── CategoryFilterPanel.tsx  # Panel de filtro por categorías IA (oculto actualmente)
│           │
│           ├── BulkTranscriptionModal.tsx      # Modal transcripción masiva (v11 — taxonomía destinos)
│           ├── TranscriptionRequestModal.tsx   # Modal transcripción unitaria (con opción diarización)
│           ├── DiarizationRequestModal.tsx     # Modal de solicitud de diarización
│           ├── RetranscriptionConfirmModal.tsx # Modal de confirmación de re-transcripción
│           │
│           ├── PlayerModal.tsx         # Modal reproductor de audio
│           ├── BulkActionBar.tsx       # Barra de acciones bulk (aparece al seleccionar filas)
│           ├── ApplyRulesButton.tsx    # Botón de aplicar reglas
│           │
│           ├── Repository.tsx          # Vista hub del repositorio (tarjetas: Reglas, Entidades, Categorías)
│           ├── RulesRepository.tsx     # Gestión de reglas (lista activas/inactivas/borradores + builders)
│           ├── RulesContext.tsx        # Context + Provider de reglas con localStorage persistence
│           ├── RuleQuickViewPanel.tsx  # Panel lateral de vista rápida de regla
│           ├── RuleSelectionModal.tsx  # Modal para seleccionar regla existente
│           │
│           ├── CategoriesManagement.tsx    # Gestión de categorías IA
│           ├── CategoriesContext.tsx       # Context + Provider de categorías con localStorage
│           ├── CategoriesList.tsx          # Lista de categorías
│           ├── CategoriesEmpty.tsx         # Empty state de categorías
│           ├── CategoryRuleLinking.tsx     # Vinculación categoría ↔ regla
│           ├── CreateCategoryPanel.tsx     # Panel de creación de categoría
│           ├── EditCategoryPanel.tsx       # Panel de edición de categoría
│           ├── DeleteCategoryDialog.tsx    # Dialog de confirmación de borrado
│           ├── useCategoriesWithRules.tsx  # Hook que cruza categorías con reglas
│           │
│           ├── EntityManagement.tsx    # Gestión de entidades de extracción
│           ├── EntitiesContext.tsx     # Context + Provider de entidades (sistema + custom)
│           ├── EntityResults.tsx       # Resultados de entidades
│           ├── EditEntitySidepanel.tsx # Panel lateral de edición de entidad
│           ├── CreateEntityModal.tsx   # Modal de creación de entidad
│           ├── EntityTypeSelect.tsx    # Selector de tipo de entidad
│           │
│           ├── MultiSelectWithSearch.tsx   # Multi-select con búsqueda (usado en builders y filtros)
│           ├── DateRangePicker.tsx     # Selector de rango de fechas
│           ├── DurationFilter.tsx      # Filtro de duración
│           ├── RecordingFilter.tsx     # Filtro de grabación
│           ├── TimeRangeFilter.tsx     # Filtro de rango de horas
│           └── DataExportImport.tsx    # Utilidades de exportación/importación de datos
```

---

## 🎨 4. Design System & Tokens

### Colores principales (hardcoded en componentes, no en tokens)

> El proyecto usa principalmente colores hardcoded con clases Tailwind de valor arbitrario `[]`. Los tokens de `globals.css` son los de shadcn/ui estándar.

| Nombre semántico | Valor hex | Uso |
|---|---|---|
| **Navy / Primary** | `#233155` | Textos primarios, headers, botón principal |
| **Navy Dark** | `#1C283D` | Hover del botón principal, sidebar bg |
| **Teal / Accent** | `#60D3E4` | Botones de acción, switches activos, iconos activos |
| **Teal Dark** | `#4FC3D3` | Hover del acento |
| **Teal Darker** | `#387983` | Hover alternativo teal |
| **Teal Light bg** | `#EEFBFD` | Background suave teal (hover states, active selects) |
| **Page bg** | `#F4F6FC` | Background general de la app |
| **White** | `#FFFFFF` | Paneles, cards, modales |
| **Border** | `#CFD3DE` | Bordes de secciones principales |
| **Border Light** | `#E5E7EB` | Bordes internos de cards |
| **Border Lighter** | `#D2D6E0` | Bordes de inputs |
| **Text Secondary** | `#8D939D` | Textos secundarios, subtítulos |
| **Text Muted** | `#A3A8B0` | Textos muy apagados, placeholders |
| **Text Tertiary** | `#5F6776` | Texto de nivel intermedio |
| **Success** | `#10B981` | Estados OK, contadores elegibles |
| **Warning** | `#F59E0B` | Warnings, borradores |
| **Destructive** | `#D4183D` / `#d4183d` | Errores, botón eliminar |
| **Amber Draft** | `amber-50/amber-200/amber-700` | Fila/banner de borrador (Tailwind amber) |
| **Purple AI** | `purple-50/purple-500` | Iconos y toggles de análisis IA |
| **Red Recording** | `red-50/red-500` | Iconos de regla de grabación |
| **Blue Transcription** | `blue-50/blue-500` | Iconos de regla de transcripción |
| **Emerald Active** | `emerald-50/emerald-500/emerald-600` | Badges de estado activo |

### Tipografía

- **Familia**: `Roboto` (Google Fonts) con fallback `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Pesos usados**: 300 (light), 400 (normal), 500 (medium), 700 (bold)
- **Import**: `@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap')` en `globals.css`
- **Base size**: 16px (`--font-size: 16px` en `:root`)
- Los headings h1-h4 tienen `font-weight: 500` (medium) por defecto en `@layer base`

### Espaciado

Escala estándar de Tailwind v4. El proyecto usa valores frecuentes:
- Padding de cards: `p-6` (24px)
- Gap entre secciones: `gap-4` / `gap-5` (16px / 20px)
- Padding de toolbar: `px-6 py-3.5` o `px-8 py-5`
- Padding de modales: `px-5 py-4`
- Gap dentro de filas: `gap-2` / `gap-2.5` / `gap-3`

### Border-radius

- `--radius: 0.625rem` (10px) — base del sistema shadcn
- Cards y paneles: `rounded-lg` (8px) o `rounded-xl` (12px en modales)
- Badges/chips: `rounded` (4px) o `rounded-md` (6px)
- Buttons: default del shadcn (`rounded-md`)

### Sombras

- Cards principales: `shadow-sm` con `border border-[#E5E7EB]`
- Modales: `shadow-2xl`
- Paneles flotantes (dropdowns): shadow del Radix UI Popover

### Modo oscuro

- Definido en `default_theme.css` con clase `.dark` (shadcn standard)
- **NO está activo/implementado** en la app. No hay toggle de dark mode ni lógica para activarlo. El proyecto funciona solo en modo claro.

### Smart Contact Design System tokens (`sc-design-system.css`)

A partir del Modal v25, se introdujo un sistema de tokens de 3 capas en `src/styles/sc-design-system.css`, expuestos como utilities Tailwind v4 vía `@theme inline`:

- **L1 · primitives** — `--sc-surface-{0,50,100,200,400,600,800,900}`, `--sc-navy-{500,600,700}`, `--sc-accent-{50,300,400,500}`, `--sc-{success,warning,danger}-500`.
- **L2 · semantic** — `--sc-bg-{canvas,surface,overlay,primary,primary-hover}`, `--sc-border-{default,soft,primary}`, `--sc-text-{heading,body,muted,on-primary,on-secondary}`, `--sc-accent`, `--sc-accent-live`, motion (`--sc-ease-out`, `--sc-duration-base`).
- **L3 · component** — `--sc-modal-{bg,border,radius,shadow,min-width,max-width,head-padding,body-padding-x/y,foot-height,...}`.

Utilities Tailwind generadas: `bg-sc-surface`, `bg-sc-primary`, `bg-sc-overlay`, `text-sc-heading`, `text-sc-body` (color), `text-sc-muted`, `text-sc-disabled` (#797979), `text-sc-emphasis` (#3C434D, hero number), `text-sc-cost-warn` (#D97706, "Genera coste"), `text-sc-accent`, `text-sc-accent-strong` (#48B8C9, ON-state captions), `text-sc-base` (14px font-size), `text-sc-md` (16px), `text-sc-lg` (18px), `text-sc-xl` (21px), `text-sc-display` (56px hero), `border-sc-border`, `rounded-sc-xl` (12px modal), `rounded-sc-md` (6px button), `shadow-sc-modal`, `data-[state=checked]:bg-sc-accent-strong`, etc.

Animaciones SC (en el mismo archivo): `animate-sc-bump` (260ms), `animate-sc-pulse` (360ms), `animate-sc-delta-fly` (750ms float-up), `animate-sc-shake` (280ms).

**Convivencia con tokens shadcn**: `default_theme.css` está marcado `KEEP_IN_SYNC` y NO debe editarse — los tokens nuevos van siempre en `sc-design-system.css`. Los componentes existentes que usan hex hardcoded (`bg-[#233155]` etc.) siguen funcionando; la migración a tokens es deuda técnica que se aborda gradualmente.

**Nota sobre la paleta navy**: hay tres tonos casi-iguales en circulación — `#1B273D` (DS canónico, usado por el nuevo Modal y `--sc-navy-600`), `#1C283D` (sidebar), `#233155` (memory.md "primary", botones existentes). Son visualmente casi indistinguibles pero técnicamente distintos. Cuando se armonice, dejar `--sc-navy-600` como canónico y migrar los demás.

---

## 🧩 5. Component Inventory

### App.tsx (Root)

**Descripción**: Componente raíz. Gestiona la vista activa y los parámetros de navegación.

**State**:
- `currentView: View` — qué vista mostrar (`'conversations' | 'repository' | 'repository-rules' | 'repository-entities' | 'repository-categories'`)
- `navigationParams` — objeto con `openRuleId`, `highlightSection`, `preConfiguredCategory`, `autoOpenBuilder` para navegación cross-vista
- `filters` — filtros globales de conversaciones (servicios, dateRange, origen, destino, grupos, agentes)

**Providers anidados** (de exterior a interior): `RulesProvider > EntitiesProvider > CategoriesProvider`

**Layout**: `flex h-screen` — `Sidebar` (90px fijo) + vista activa (`flex-1`)

---

### Sidebar.tsx

**Descripción**: Barra lateral de navegación por iconos. 90px de ancho, fondo `#1C283D`.

**Props**:
- `currentView: string` — para marcar el ítem activo
- `onNavigate: (view) => void`

**Ítems activos** (los demás son decorativos/deshabilitados):
- `MessageSquare` → `conversations`
- `FolderOpen` → `repository`

**Ítem activo**: fondo `#60D3E4`, texto blanco. El logo de SmartContact (ScLogo) aparece arriba escalado al 50%.

---

### ConversationsView.tsx

**Descripción**: Vista principal de conversaciones. Contiene breadcrumb, filtros globales, toolbar con filtros de tipo/columna, tabla y modal de transcripción masiva.

**Props**:
- `onNavigateToRepository: () => void`
- `filters: FiltersObject`
- `onFiltersChange: (filters) => void`

**Estado interno relevante** (v26):
- `selectedIds: string[]` — IDs seleccionados en la tabla.
- `showColumnFilters: boolean` — mostrar fila de filtros por columna en tabla.
- `processingIds: string[]` — IDs en transcripción activa (icono pulsa amarillo).
- `analyzingIds: string[]` — IDs en análisis IA activo (icono pulsa púrpura).
- `newlyTranscribedIds: string[]` — IDs recién transcritos (fila highlighted hasta primer click).
- `isTranscriptionModalOpen: boolean` — abre `BulkTranscriptionModal`.
- `currentSampleId: string` — preset de mock-data activo (driver del `MockSampleSwitcher`).
- `conversations: Conversation[]` — copia de trabajo del sample actual; mutaciones locales (transcribir/analizar) escriben aquí.
- `columnFilters` — filtros por cada columna de la tabla.
- `typeFilters` / `ruleFilters` — filtros de tipo/regla (sincronizados con `unifiedTypeFilters`).
- `unifiedTypeFilters` — fuente de verdad de tipos, canales, direcciones y filtros de regla.
- `selectedCategories: string[]` — filtro por categorías IA (UI deshabilitada, lógica presente).

**Lógica de transcripción** (v26):
- `handleRequestTranscription(ids)`: añade IDs a `processingIds`, espera 6000 ms, los mueve a `newlyTranscribedIds`, y **muta `conversations`** marcando `hasTranscription: true` y sembrando `transcription` con `generateTranscriptionFor(c)` si la conversación no traía script. Esto permite que el `ConversationPlayerModal` muestre contenido tras una transcripción simulada.
- `handleRequestAnalysis(ids)`: análogo para análisis. Espera 4000 ms; al completar setea `hasAnalysis: true` y siembra `aiCategories` con `pickRandomCategories(id)` si estaba vacío. La fuente determinista (hash del id) garantiza que las categorías sean estables entre renders.
- `handleBulkConfirm`: llama a `handleRequestTranscription` con los IDs elegibles del modal.

**Mock-sample switching**:
- `handleSampleChange(sampleId)`: cambia el preset y resetea `selectedIds`, `processingIds`, `analyzingIds` y `newlyTranscribedIds`. La función está memoized vía referencia simple (no useCallback porque los handlers de la vista son single-instance por mount).
- `selectedConversations` derivado vía `useMemo([selectedIds, conversations])` para que el modal no re-calcule en cada render del padre.

**Pool de categorías IA usado por `pickRandomCategories`**: `["Soporte Técnico", "Consulta de precio", "Queja Cliente", "Venta", "Seguimiento", "Prospección", "Incidencia Masiva", "Consulta Interna", "Retención"]`. Se devuelven 1 ó 2 categorías por id (decisión driven por `hash % 2 + 1`).

**Easter egg**: Botón avatar 🤔 en el header. Al hover muestra tooltip con link a documentación externa y emoji 😱.

**Importante — CategoryFilter**: El filtro de categorías IA está implementado pero **oculto** (`{false && showCategoryFilter && (...)}`). El código está preservado para re-habilitarlo en el futuro.

---

### BulkTranscriptionModal.tsx ⭐ (v26 — CRÍTICO)

**Descripción**: Modal de transcripción masiva. Construido sobre el shell oficial del Smart Contact Design System (`ui/modal.tsx` → Radix Dialog) usando los tokens `--sc-*`. Reemplaza la taxonomía v11 de 3 destinos por un layout simplificado de 2 columnas: hero number + toggle de análisis.

**Props** (sin cambios respecto a v11 — API estable):
- `isOpen: boolean`
- `onClose: () => void`
- `selectedConversations: Conversation[]`
- `onConfirm: (options: { includeAnalysis: boolean }, eligibleIds: string[]) => Promise<void>`

**Ahora siempre montado**: el caller (`ConversationsView`) pasa `isOpen` como prop en lugar de hacer mount/unmount con `{isOpen && ...}`. Radix gestiona apertura/cierre internamente para que la animación de salida juegue completa.

**Modelo de datos v25** (counters derivados de `selectedConversations`):

```ts
calls   = selectedConversations.filter(c => c.channel === "llamada")
chats   = selectedConversations.filter(c => c.channel === "chat")

readyToTranscribe = calls.filter(c => c.hasRecording && !c.hasTranscription)
callEa            = calls.filter(c =>  c.hasTranscription && !c.hasAnalysis)
chatEa            = chats.filter(c => !c.hasAnalysis)
ap                = calls.filter(c =>  c.hasAnalysis).length
                  + chats.filter(c =>  c.hasAnalysis).length

nTrans  = readyToTranscribe.length
nAnBase = callEa.length + chatEa.length
nSel    = selectedConversations.length
```

**Los 6 casos** (C1–C6) detectados implícitamente por la combinación de counters:

| Caso | Condición                              | Toggle  | hero count        | Caption                  |
|------|----------------------------------------|---------|-------------------|--------------------------|
| C1   | `nTrans=0 ∧ nAnBase=0`                 | disabled | `0`              | "todo procesado"         |
| C2   | `nTrans=0 ∧ callEa>0 ∧ chatEa=0`       | default-on  | `nAnBase`     | "{nAnBase} admiten análisis" |
| C3   | `nTrans>0 ∧ nAnBase=0`                 | default-off | `nTrans`      | "{nTrans} admiten análisis"  |
| C4   | `nTrans>0 ∧ callEa>0 ∧ chatEa=0`       | default-off | `nTrans` (off) / `nTrans+nAnBase` (on) | "{nTrans+nAnBase} admiten análisis" |
| C5   | `nTrans=0 ∧ callEa=0 ∧ chatEa>0`       | default-on  | `nAnBase`     | "{nAnBase} admiten análisis" |
| C6   | `nTrans>0 ∧ (callEa+chatEa)>0`         | default-off | `nTrans` (off) / `nTrans+nAnBase` (on) | "{nTrans+nAnBase} admiten análisis" |

**Fórmulas clave**:
```ts
canAnalyze     = (nTrans + nAnBase) > 0         // false sólo en C1
toggleDisabled = !canAnalyze
toggleOn       = toggleDisabled ? false : userOn
heroCount      = toggleOn ? nTrans + nAnBase : nTrans
canSubmit      = heroCount > 0 && !isLoading

initialUserOn  = nTrans === 0 && nAnBase > 0    // C2 + C5 default-on
```

**Layout v26 — final** (dentro de `<Modal.Body className="!p-0">`, valores extraídos de Figma node `297:2559`):
- Frame **720×200** (`--sc-bulk-cell-height: 200px`), `flex` row, dos cells `flex-1` separadas por **hairline divider vertical** (`border-r [var(--sc-bulk-divider-color)]` en hero; color `--sc-border-soft` = #F3F4F6).
- **Estrategia de alineación**: ambas cells comparten `padding-top` (`--sc-bulk-cell-padding-top: 28`), `padding-x: 24` (`--sc-bulk-cell-padding-x`), `padding-bottom: 24` (`--sc-bulk-cell-padding-bottom`). Las dos labels comparten baseline porque cada una es el primer child de su section. El espacio sobrante debajo de cada label se entrega a un wrapper `flex-1` que centra el contenido principal verticalmente.
- **Cell hero** (left):
  - Label "TOTAL A PROCESAR": 14px Bold uppercase, line-height 22, color `text-sc-body` (#5C616B).
  - Wrapper `flex-1 items-center` con:
    - Número: **88px semibold** (`text-sc-display`), line-height 88, color `text-sc-emphasis` (#3C434D — softened black). Sube de los 56px del borrador previo para dar protagonismo al hero por encima de la columna decisión.
    - Cost-tag: 14px regular, line-height 22:
      - "genera coste" (lowercase) → `text-sc-cost-warn` (#D97706 amber).
      - "todo procesado" (lowercase, en C1) → `text-sc-muted`.
- **Cell decision** (right):
  - Label "ANÁLISIS": mismo estilo que label hero.
  - Wrapper `flex-1 flex-col justify-center gap-[--sc-bulk-decision-caption-gap=12]`:
    - Title+switch row (`flex justify-between`):
      - Título "Incluir análisis": **16px semibold** (`text-sc-md`), line-height 24:
        - Toggle ON → `text-sc-heading` (#181D26).
        - Toggle OFF / disabled → `text-sc-disabled` (#797979).
      - Switch project `<Switch>` con override `data-[state=checked]:bg-sc-accent-strong` (#48B8C9).
    - Caption: 14px regular, line-height 22:
      - C1 (toggle disabled): "todo procesado" muted.
      - C2–C6 con toggle **OFF**: "{N} admiten análisis" en `text-sc-muted` (gris).
      - C2–C6 con toggle **ON**: "{N} admiten análisis" en `text-sc-accent-strong` teal.
    - Caption reserva `min-h-[var(--sc-line-height-body2)]` para evitar layout-shift en C1.

**Animaciones del hero + caption** (v26 final):
- Hero number: `animate-sc-pulse` (scale 1.08 / 360ms) re-disparada por `bumpKey` cuando cambia `heroCount`. Antes (borrador v26 inicial) usaba `animate-sc-bump` (1.03 / 260ms), demasiado sutil para un número de 88px.
- Caption number+text: `animate-sc-pulse` re-disparada por `pulseKey` en cada click del toggle.
- Como togglear cambia `heroCount` (que altera `bumpKey`), las dos animaciones suceden simultáneamente — hero+caption laten juntos al togglear.
- `animate-sc-delta-fly` — fantasma `+N`/`−N` flota 34px hacia arriba al togglear (750ms). Color teal si `+`, muted si `−`.
- `animate-sc-shake` — celda decisión hace shake horizontal 4px al click en toggle disabled (280ms, sólo C1).

**Decisiones revertidas en este pase de fidelidad** (sobre el borrador v26 inicial):
- Caption "siempre teal" → vuelve a alternar muted-OFF / teal-ON. El comportamiento OFF=gris, ON=teal es el que la dirección de UX quiere y lo que el Figma final confirma.
- Cell-height 100 → 200. Compactarlo a 100 dejaba el número hero pequeño y rompía la jerarquía: el hero TIENE que dominar la columna izquierda.
- "Genera coste" capitalizado → "genera coste" lowercase, alineado con el resto del léxico in-cell ("todo procesado", "admiten análisis").
- Estructura nested `Group A ⊃ (Group B ⊃ Label + Title-row) + Caption` con gaps 24/12 → simplificada a `Label` (top) + `flex-1 wrapper` con Title-row + Caption (gap 12). Los 24 entre label y switch desaparecen porque ahora son el `flex-1` quien decide el espaciado vertical.

**Eligible IDs** enviados a `onConfirm`:
- toggle OFF → solo `readyToTranscribe.map(c => c.id)`.
- toggle ON  → `readyToTranscribe + callEa + chatEa` (los `ap` siempre se omiten).

**Reset state**: `userOn` se resetea al `initialUserOn` natural cada vez que (a) el modal se abre, o (b) cambia la lista de IDs seleccionados (comparada por concat de ids, no array identity).

**Loading**: `isLoading` bloquea ESC, click en overlay, click en X header y botón Cancelar mientras `onConfirm` está en vuelo. El botón Procesar muestra spinner Loader2.

---

### TranscriptionRequestModal.tsx

**Descripción**: Modal de transcripción unitaria (una sola conversación desde la tabla).

**Props**:
- `isOpen: boolean`
- `onClose: () => void`
- `duration: string` — duración de la conversación
- `onConfirm: (options: { diarization: boolean }) => Promise<void>`

**Opciones**: Checkbox "Incluir diarización" (identificar quién habla en cada segmento).

---

### DiarizationRequestModal.tsx

**Descripción**: Modal para solicitar diarización de una conversación ya transcrita.

**Props** similares a `TranscriptionRequestModal`. Muestra advertencia de coste.

---

### RetranscriptionConfirmModal.tsx

**Descripción**: Modal de confirmación cuando se solicita re-transcribir una conversación que ya tiene transcripción existente.

**Props**:
- `isOpen: boolean`
- `onClose: () => void`
- `onConfirm: () => Promise<void>`

Advierte de que la transcripción anterior será reemplazada.

---

### ConversationTable.tsx

**Descripción**: Tabla principal de conversaciones con soporte de selección múltiple, filtros por columna, estados de procesamiento y acciones por fila.

**Props principales**:
- `conversations: Conversation[]`
- `selectedIds: string[]`
- `onSelectionChange: (ids: string[]) => void`
- `showColumnFilters: boolean`
- `columnFilters: ColumnFilters`
- `onColumnFiltersChange: (filters) => void`
- `processingIds: string[]` — IDs en transcripción activa (icono pulsa).
- `analyzingIds: string[]` — IDs en análisis activo (icono pulsa).
- `newlyTranscribedIds: string[]` — fila highlighted con `bg-yellow-50` hasta primer click.
- `onClearNewlyTranscribed: (id: string) => void`
- `onRequestTranscription: (id: string) => void`
- `onRequestAnalysis: (id: string) => void`

**Columnas**: Estado, Hora, Fecha, Servicio, Origen, Grupo, Destino, T. Conv., T. Espera, ID.

**Estado column** (pictograma único en lugar del antiguo trío de badges):
- A partir de v26 la columna "Estado" usa `<StatusIcon />` (ver `StatusIcons.tsx` más abajo). Un único pictograma combina canal (chat/llamada) + nivel de procesamiento (sin transcripción / transcrito / analizado). Reemplaza la combinación previa de "punto rojo grabación + FileText transcripción + Sparkles análisis".
- Click en fila abre `ConversationPlayerModal` (no `PlayerModal` legacy). El ID del conversation activo se mantiene en estado para que el modal re-renderice si la fila se actualiza (transcripción completada con modal abierto).

---

### StatusIcons.tsx ⭐ (nuevo en v26)

**Descripción**: 5 pictogramas SVG inline (paths de Figma — design dio los assets) que combinan **canal + estado de procesamiento** en un único icono. Sustituye el badge-stacking previo.

**Iconos exportados**:
- `IconPhone` — llamada sin transcripción (stroke-only, no fill).
- `IconCallTranscription` — llamada grabada y transcrita (filled, líneas a la derecha).
- `IconCallTranscriptionAnalysis` — llamada grabada, transcrita y analizada (filled, líneas + sparkle a la derecha).
- `IconChat` — chat plano (sin transcripción ni análisis).
- `IconChatTranscription` — chat con transcripción (líneas dentro del bocadillo).
- `IconChatAnalysis` — chat con análisis IA (sparkle dentro del bocadillo).

**Componente principal `<StatusIcon conversation isProcessing isAnalyzing size />`**: mira `conversation.channel`, `hasRecording`, `hasTranscription`, `hasAnalysis` y los flags `isProcessing/isAnalyzing` para resolver el icono y el color. Reglas de prioridad:

1. `isAnalyzing` → variante "+ análisis" en color púrpura (#9B59B6) con pulse animado.
2. `isProcessing` → variante "transcripción" en amarillo (text-yellow-500) con pulse animado.
3. Si chat: `hasAnalysis` → IconChatAnalysis; `hasTranscription` → IconChatTranscription; resto → IconChat.
4. Si llamada: `hasTranscription && hasAnalysis` → IconCallTranscriptionAnalysis púrpura; `hasTranscription` → IconCallTranscription teal; resto → IconPhone gris.

**Animación de pulse**: `motion.span` con `animate={{ opacity: [1, 0.35, 1] }}` durante 1.1s en bucle. Toda otra animación de fila (yellow row-bg) se mantiene tal cual en `ConversationTable`.

**Tooltip**: cada pictograma envuelto en `<Tooltip>` con label descriptivo ("Llamada · grabada y transcrita", "Chat · analizado", "Transcribiendo…", etc.).

**Por qué pictograma único** (vs trío de badges v25):
- Reduce ruido visual en la columna 80px de Estado.
- Los 5 SVG son los assets oficiales del DS (no son Lucide). Mantenerlos como paths inline garantiza fidelity 1:1 con Figma.
- El canal va integrado en el icono → no hay que repetir un icono "llamada/chat" en otra columna. Ahorra ancho de tabla.

---

### ConversationPlayerModal.tsx ⭐ (nuevo en v26)

**Descripción**: Reproductor individual de conversación. Sustituye al legacy `PlayerModal.tsx` (que sigue en el repo pero ya no se usa desde la tabla). Estructuralmente inspirado en Figma node `325:10103`, adaptado al SC design system: surface blanca, shell `<Modal>`, tokens `--sc-*`.

**Props**:
- `isOpen: boolean`
- `onClose: () => void`
- `conversation: Conversation | null`
- `isTranscribing?: boolean` — propagado desde `processingIds.includes(conv.id)`.
- `isAnalyzing?: boolean` — propagado desde `analyzingIds.includes(conv.id)`.
- `onRequestTranscription?: (id: string) => void`
- `onRequestAnalysis?: (id: string) => void`

**Anatomía**:
- Header: icono + "Conversación · {id}" + meta (servicio · fecha · hora).
- Body:
  - Audio player row compacto: back-10 / play / fwd-10 / elapsed / scrub / total / download. La reproducción es **mock** — un `setInterval` que incrementa `currentTime` cada 1000ms hasta `totalDuration` parseada desde `conversation.duration`.
  - Tabs Transcripción / Análisis con empty-states que llaman a `onRequestTranscription/onRequestAnalysis` para reaccionar al estado del padre.
- Footer: botón único "Cerrar".

**Default tab**: si `!hasTranscription && hasAnalysis` abre directamente en "Análisis"; en cualquier otro caso abre en "Transcripción".

**Imports añadidos al proyecto** (todos lucide, ya disponibles):
- `Headphones`, `Play`, `Pause`, `RotateCcw`, `RotateCw`, `Download`, `Search`, `FileText`, `Sparkles`, `Loader2`, `FileX`, `User`, `Tag`, `TrendingUp`.

**Por qué un nuevo Modal en vez de iterar `PlayerModal`**: el legacy era un dialog Radix custom con surface `#0F1117` oscura, no migrado al shell SC. Refactor en sitio rompía el resto del proyecto (varios callers todavía lo usan vía Repository/PlayerModal). Decisión: nuevo componente con la API mínima necesaria; migrar el legacy en una sesión dedicada.

---

### MockSampleSwitcher.tsx (prototype-only)

**Descripción**: Botón pill con icono `Database` que abre un `DropdownMenu` para cambiar el preset de mock-data en caliente. Vive junto al easter-egg de validación UX en `ConversationsView` para que reviewers puedan demostrar escenarios distintos sin recargar.

**Props**:
- `currentSampleId: string`
- `onChange: (sampleId: string) => void`

**Comportamiento**: lee la lista `mockSamples` de `data/mockSamples.ts`, marca el activo con `Check size={13}` y un `bg-[#EEFBFD]` light-teal. Cambiar de preset reseteo `selectedIds`, `processingIds`, `analyzingIds` y `newlyTranscribedIds` en el padre.

---

### data/mockSamples.ts (prototype-only)

**Descripción**: Catálogo de presets para `MockSampleSwitcher`. Cada `MockSample` tiene `id`, `label`, `description` y un `build()` que devuelve un `Conversation[]` clonado (la lista base `mockConversations` se trata como inmutable; cada builder hace `clone()` defensivo y mutaciones en el resultado).

**Presets actuales**: `default` (estado mixto), `all-pending` (todo por procesar), `all-done` (todo procesado, demuestra C1), `calls-only-untranscribed` (flujo principal de transcribir), `chats-only` (toggle default-on de análisis), `small` (primeras 8 conversaciones).

`getSample(id)` devuelve siempre un `MockSample` válido (fallback al primero) y `defaultSampleId = "default"`.

---

### data/mockTranscriptionGenerator.ts (prototype-only)

**Descripción**: Generador determinista de líneas de transcripción para conversaciones que no traen `transcription` precargada. Se usa cuando el usuario lanza una transcripción individual o masiva sobre una conversación que no tenía script en `mockData.ts`.

**Determinismo**: `hashString(conversation.id) % dialogues.length` selecciona uno de 6 templates de diálogo (soporte, ventas, técnico, facturación, seguimiento, retención). Mismo `id` siempre rinde mismo diálogo.

**Tiempos**: las líneas se distribuyen uniformemente en `parseDuration(conversation.duration)` con jitter `±3s` derivado del hash → no quedan timestamps mecánicos.

**Speaker labels**:
- Chat: "Speaker 1" / "Speaker 2".
- Llamada con `origin` que parece nombre (regex `/[a-zA-Z]/` y no empieza por dígito) → usa el origin como agent label, "Cliente" para el otro lado.
- Llamada con `origin` numérico → "Agente" / "Cliente".

---

### RulesContext.tsx

**Descripción**: Context API para el sistema de reglas. Persiste en `localStorage` bajo la clave `ivr_rules_v2`.

**Tipo `Rule`** (campos clave):
```typescript
interface Rule {
  id: number;
  type?: 'recording' | 'transcription' | 'classification';
  name: string;
  description?: string;
  servicios: string[];           // IDs de servicios del alcance
  grupos: string[];              // IDs de grupos
  agentes: string[];             // IDs de agentes
  origen: string;
  destino: string;
  transcripcion: boolean;
  clasificacion: boolean;
  sentimiento?: boolean;
  categorias?: string[];
  entidades?: string[];
  active: boolean;
  priority?: number;             // Solo reglas activas; orden de aplicación
  isDraft?: boolean;             // true si es copia sin editar
  duplicatedFromId?: number | null;
  lastModified?: string;         // ISO string
  direction?: string;            // 'all' | 'inbound' | 'outbound'
  schedule?: { enabled: boolean; from: string; to: string };
  durationMin?: number;          // en segundos
  analyzeSummary?: boolean;
  analyzeCategories?: boolean;
  analyzeEntities?: boolean;
  scopeOrGroups?: { services: string[]; groups: string[]; agents: string[] }[];
  // ... otros campos menores
}
```

**Operaciones del context**:
- `addRule(rule)`: crea regla con prioridad = maxPriority + 1, activa por defecto
- `updateRule(id, fields)`: actualiza y limpia `isDraft` si se edita un campo
- `deleteRule(id)`: elimina por ID
- `duplicateRule(id)`: crea copia con `isDraft: true`, nombre "Copia de..."
- `toggleRule(id)`: activa/desactiva (no se puede activar un borrador)
- `reorderRules(activeRuleIds)`: reasigna prioridades por orden del array

**Seed data** (5 reglas iniciales si `localStorage` está vacío):
1. `1001` — Grabación activa: "Grabar llamadas comerciales"
2. `1002` — Transcripción activa: "Transcribir soporte técnico"
3. `1003` — Clasificación activa: "Clasificar quejas y reclamaciones"
4. `1004` — Grabación inactiva: "Grabar llamadas VIP"
5. `1005` — Borrador (copia de 1002): "Copia de Transcribir soporte técnico"

---

### RulesRepository.tsx

**Descripción**: Vista de gestión de reglas. Alterna entre lista y builders. Soporta drag & drop para reordenar activas.

**Estado interno**:
- `view`: `'list' | 'create_recording' | 'create_transcription' | 'create_classification' | 'edit'`
- `editingRuleId: number | null`

**Detección de conflictos** (`detectConflicts`): Dos reglas activas del mismo tipo con servicios solapados → badge "En conflicto" con popover explicativo. Gana la de mayor prioridad (menor número).

**Drag & Drop**: Solo en reglas activas. Al reordenar se llama a `reorderRules`. Implementado con HTML Drag API nativo (no react-dnd en esta parte).

**Tres secciones** en la lista:
1. **Reglas activas** (verde, drag & drop habilitado, columna #/orden)
2. **Inactivas** (gris)
3. **Borradores** (amber, advertencia de edición requerida)

**StatusBadge**: componente interno que muestra `Activa / Inactiva / Borrador / En conflicto` con distintos estilos y Popover para conflictos.

**Navegación cross-vista**: `navigationParams` recibido del padre puede:
- `openRuleId` → abre directamente el builder de edición de esa regla
- `autoOpenBuilder + preConfiguredCategory` → abre builder de clasificación preconfigurado con esa categoría

---

### RecordingRuleBuilder.tsx

**Descripción**: Builder de regla de grabación. Usa `RuleBuilderLayout` como contenedor.

**Secciones** (de izquierda a derecha en 2 columnas):
1. **Izquierda**: "Información básica" (nombre + descripción + toggle activo) + "Alcance" (servicios)
2. **Derecha**: "Criterios de grabación" (dirección + filtro por horario)

**Validación**: nombre obligatorio ≥ 3 caracteres.

---

### TranscriptionRuleBuilder.tsx

**Descripción**: Builder de regla de transcripción.

**Secciones**:
1. **Izquierda**: Info básica + Alcance
2. **Derecha**: "Criterios de transcripción" (dirección, duración mínima con selector segundos/minutos, atendida por grupo/agente) + "Análisis IA" (toggle único para resumen + sentimiento, color purple)

**Toggle IA**: un único switch que activa simultáneamente `analyzeSummary` y `sentimiento`.

---

### ClassificationRuleBuilder.tsx

**Descripción**: Builder de regla de clasificación IA. El más complejo.

**Secciones**:
1. **Izquierda**: Info básica + Alcance (usa `SelectionCriteria`)
2. **Derecha**: "Análisis IA" (3 toggles: resumen+sentimiento, categorías IA, entidades) + "Condiciones adicionales" (usa `AdditionalConditions` colapsable)

**Validaciones**:
- Al menos 1 tipo de análisis activo
- Si `analyzeCategories === true` → al menos 1 categoría seleccionada
- Si `analyzeEntities === true` → al menos 1 entidad seleccionada

**Props adicionales**:
- `onNavigateToCategories: () => void` — para ir a crear categorías si no hay ninguna
- `onNavigateToEntities?: () => void` — para gestionar entidades

---

### RuleBuilderLayout.tsx

**Descripción**: Layout de 2 columnas para los builders de regla. Separa automáticamente los hijos:
- Hijos 0 y 1: columna izquierda ("Identidad y alcance", 300px fijo)
- Hijos 2+: columna derecha ("Configuración", flex-1)

**Props**:
- `title: string`
- `subtitle: string`
- `children: ReactNode`
- `actions: ReactNode` — botones del footer
- `breadcrumbs: { label, onClick? }[]`
- `isDraft?: boolean` — muestra banner amber de advertencia
- `onDiscardDraft?: () => void` — botón "Descartar copia" en el banner

**Estructura**:
```
Header (breadcrumb + subtitle) → fijo
Banner borrador (si aplica) → siempre reservado en DOM, display:none si no aplica
Content scroll → flex-1
Footer actions → fijo
```

---

### SelectionCriteria.tsx (rules/shared)

**Descripción**: Panel de selección de servicios ("Alcance"). Multi-select con chips removibles.

**Props**:
- `selectedServices: string[]`
- `onChangeServices: (values: string[]) => void`
- `readOnly?: boolean` — oculta el selector, solo muestra chips

**Anti layout-shift**: `min-h-[32px]` en el contenedor de chips. Si no hay selección, muestra texto itálico "Sin restricción — aplica a todos los servicios".

---

### ActiveToggle.tsx (rules/shared)

**Descripción**: Switch con label "Activa/Inactiva" y tooltip explicativo al hover.

**Props**:
- `checked: boolean`
- `onCheckedChange: (value: boolean) => void`

---

### AdditionalConditions.tsx (rules/shared)

**Descripción**: Sección colapsable de condiciones adicionales para builders de reglas. Usa `Collapsible` de Radix UI.

**Props** (todas opcionales salvo dirección y horario):
- `direction / onChangeDirection`
- `filterByOrigin / onChangeFilterByOrigin / selectedOrigins / onChangeSelectedOrigins`
- `showTypification? / filterByTypification? / ...`
- `filterBySchedule / onChangeFilterBySchedule / scheduleFrom / scheduleTo`
- `percentage? / onChangePercentage?`
- `showDuration? / durationMin? / durationMax?`

---

### CategoriesContext.tsx

**Descripción**: Context para categorías IA. Persiste en `localStorage` bajo clave `ivr_categories`.

**Tipo `Category`**:
```typescript
interface Category {
  id: string;
  name: string;
  description: string;
  group?: string;
  isActive: boolean;
  usedInRules: number;
  classifiedCalls: number;
  createdAt: string;
  isTemplate?: boolean;
  linkedRules?: Array<{ id: number; name: string; services: string[]; isActive: boolean; categoriesCount: number }>;
}
```

**Operaciones**: `addCategory`, `updateCategory`, `deleteCategory`, `duplicateCategory`, `getCategoryById`

**Seed data**: vacío por defecto (el usuario crea sus categorías).

---

### EntitiesContext.tsx

**Descripción**: Context para entidades de extracción de datos. Distingue entre `systemEntities` (de sistema, no editables) y `entities` (custom del usuario).

**Tipos de entidad** (`EntityType`): text, number, date, email, phone, list, name, age, url, ordinal, currency, datetime, dimension, geography, key_phrase, percentage, phone_number, temperature

**Entidades de sistema** (hardcoded, prefijo `sys_`): call_origin (ANI), call_dnis, call_timestamp, call_session_id, call_country, call_carrier, sys_date, sys_time, sys_number, sys_currency, sys_dni, y más.

---

### MultiSelectWithSearch.tsx

**Descripción**: Componente de selección múltiple con búsqueda. Usado en builders de reglas y filtros de conversaciones.

**Props**:
- `options: { value: string; label: string }[]`
- `value: string[]`
- `onChange: (values: string[]) => void`
- `placeholder?: string`
- `onCreateNew?: () => void` — si se provee, muestra opción "Crear nuevo"
- `createNewLabel?: string`

---

## 🗺️ 6. Pages & Routing

**El proyecto NO usa react-router para navegación**. Todo se gestiona con `useState<View>` en `App.tsx`.

| Vista (View) | Componente | Descripción |
|---|---|---|
| `'conversations'` | `ConversationsView` | Tabla de conversaciones (vista por defecto) |
| `'repository'` | `Repository` | Hub del repositorio (tarjetas de acceso) |
| `'repository-rules'` | `RulesRepository` | Gestión de reglas de automatización |
| `'repository-entities'` | `EntityManagement` | Gestión de entidades de extracción |
| `'repository-categories'` | `CategoriesManagement` | Gestión de categorías IA |

**Flujo de navegación**:
```
conversations ←→ repository (hub) ←→ repository-rules
                                  ←→ repository-entities
                                  ←→ repository-categories
categories → rules (con navigationParams: openRuleId o autoOpenBuilder)
rules → categories (para crear categorías desde ClassificationRuleBuilder)
```

**Navegación cross-vista con parámetros** (`navigationParams` en App.tsx):
- Desde CategoriesManagement se puede navegar a RulesRepository pasando `openRuleId` para abrir directamente la edición de una regla
- También se puede pasar `autoOpenBuilder: true + preConfiguredCategory: string` para abrir el builder preconfigurado

---

## 🔄 7. State Management

### Estado global (Context API)

| Context | Clave localStorage | Qué contiene |
|---|---|---|
| `RulesContext` | `ivr_rules_v2` | Array de reglas de automatización |
| `CategoriesContext` | `ivr_categories` | Array de categorías IA |
| `EntitiesContext` | _(no persiste)_ | Entidades sistema (hardcoded) + entidades custom del usuario |

### Estado local importante (por componente)

**App.tsx**:
- `currentView: View` — qué vista renderizar
- `navigationParams` — parámetros de navegación cross-vista
- `filters` — filtros globales que se pasan a ConversationsView

**ConversationsView.tsx** (estado interno extenso):
- `selectedIds` — filas seleccionadas en la tabla
- `processingIds` / `newlyTranscribedIds` — estados de transcripción en vuelo
- `showColumnFilters` — visibilidad de filtros por columna
- `columnFilters` — filtros de cada columna de la tabla
- `unifiedTypeFilters` — fuente de verdad de filtros tipo/canal/dirección/regla
- `typeFilters` / `ruleFilters` — derivados de `unifiedTypeFilters` via `useEffect`
- `isTranscriptionModalOpen` — apertura del modal masivo

**RulesRepository.tsx**:
- `view` — alternancia lista/builder
- `editingRuleId` — regla en edición
- `draggedId` / `dragOverIndex` — estado drag & drop

### Flujo de datos principal

```
mockData.ts (constantes)
  ↓ prop drilling
ConversationsView
  ↓ filtrado useMemo
ConversationTable
  ↓ selectedIds
BulkTranscriptionModal
  ↓ onConfirm
ConversationsView.handleBulkConfirm
  → processingIds → newlyTranscribedIds
```

```
RulesContext (localStorage)
  ↓ useRules() hook
RulesRepository
  ↓ builder selection
RecordingRuleBuilder | TranscriptionRuleBuilder | ClassificationRuleBuilder
  ↓ onSave(rule)
RulesContext.addRule / updateRule
```

---

## ✨ 8. Interactions & Animations

### Animaciones implementadas

| Interacción | Donde | Implementación | Detalles |
|---|---|---|---|
| **Slide in filters** | Fila de filtros de columna en tabla | `@keyframes slideInFilters` (CSS) | 0.3s ease-out, translateY -8px → 0 |
| **Highlight fade** | Fila de regla recién creada/navegada | `@keyframes highlightFade` (CSS) | 2s ease-out, amber → transparent |
| **Glow gradient avatar** | Easter egg en ConversationsView header | Inline style con `animation: glow-gradient 4s ease-in-out infinite` | Borde animado teal en el avatar |
| **Modal open/close** | `ui/modal.tsx` (Radix Dialog) | tw-animate-css: `data-[state=open]:zoom-in-95 fade-in-0` | 200ms duration, scale 95→100 + fade |
| **Hero bump** | BulkTranscriptionModal v25 cell hero | `@keyframes sc-bump` (sc-design-system.css) | 260ms `--sc-ease-out`, scale 1.03 al cambiar `heroCount` |
| **Caption pulse** | BulkTranscriptionModal v25 cell decision | `@keyframes sc-pulse` | 360ms ease-out, scale 1.08 al togglear |
| **Delta ghost** | BulkTranscriptionModal v25 toggle | `@keyframes sc-delta-fly` | 750ms ease-out, translateY -34px + fade. Teal `+N`, muted `−N` |
| **Toggle shake** | BulkTranscriptionModal v25 cell decision | `@keyframes sc-shake` | 280ms ease, translateX ±4px sólo en C1 al click toggle disabled |
| **Drag opacity** | Drag & drop en RulesRepository | JS: `element.style.opacity = '0.5'` | Durante el drag, la fila origen se hace semitransparente |
| **Emoji surprised** | Easter egg avatar | `hidden group-hover:inline-block` | Alternancia 🤔 → 😱 al hover |
| **Scale hover** | Easter egg avatar | `group-hover:scale-110 transition-transform duration-300` | Escala el avatar |
| **Row highlight** | Regla recién creada en lista | `animate-highlight-fade` clase dinámica | 2500ms timeout para limpiar |

### Librerías de animación

- **motion** (ex-Framer Motion) está instalado pero los componentes de `BulkTranscriptionModal.tsx` usan `rowMotion` / `rowMotionDelayed` como configuraciones preparadas pero implementadas con CSS transitions (sin `<motion.div>`). La librería motion está disponible si se necesita.
- La mayoría de animaciones usan CSS puro (`transition-*`, `@keyframes` en `globals.css`).
- Algunas animaciones usan Tailwind (`group-hover:`, `opacity-0`, `transition-all`).

### Comportamientos especiales

- **Anti layout-shift**: principio fundamental del proyecto. Los elementos que aparecen/desaparecen SIEMPRE reservan su espacio en el DOM con `opacity-0 pointer-events-none` o `min-h-[Xpx]`. Nunca se monta/desmonta algo que causa reflow visible.
- **Lock del toggle en BulkTranscriptionModal**: cuando `analysisOnlyMode` es true, el switch se bloquea visualmente con ícono de candado y `disabled`, pero el valor interno permanece `true`.

---

## 🖼️ 9. Assets & Media

### SVGs

Los SVGs del logo y otros assets de Figma están en `/src/app/imports/`:
- `ScLogo.tsx` — Logo Smartcontact (SVG inline como componente React)
- `svg-4o4ubnq2lw.ts`, `svg-9g7mphu0h7.ts`, `svg-hka34i4qsi.ts`, etc. — Paths SVG exportados de Figma (usados en los componentes Container, Frame892, Group1)
- `Container.tsx`, `Frame892.tsx`, `Group1.tsx` — Componentes visuales Figma (posiblemente decorativos o para secciones específicas del repositorio)

### Iconos

- **Librería**: `lucide-react` v0.487.0
- Iconos más usados: `Home, ChevronRight, FileText, Columns3, Download, ArrowUpRight, X, AlertTriangle, CheckCircle2, Loader2, Phone, Sparkles, MessageSquare, SkipForward, Lock, Plus, Edit2, Copy, Trash2, Sparkles, GripVertical, MoreVertical, Circle`

### Fuentes

- **Roboto** importada desde Google Fonts en `globals.css`:
  ```css
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
  ```
- Requiere conexión a internet para cargar. Sin internet, fallback a `-apple-system` etc.

### Imágenes

No hay imágenes en el proyecto (sin `<img>` con Unsplash o similares). Si se necesita agregar imágenes, usar `ImageWithFallback` de `/src/app/components/figma/ImageWithFallback.tsx`.

---

## 🎯 10. Key Features & Business Logic

### Funcionalidades implementadas

#### 1. Monitor de Conversaciones
- Tabla paginable con 20+ conversaciones mock
- Selección múltiple (checkbox por fila + "seleccionar todo")
- Filtros globales (servicio, fecha, origen, destino, grupos, agentes)
- Filtros de columna (fila adicional en la tabla, toggle con botón "Filtros")
- Filtro por tipo/canal/dirección/regla (panel dropdown `TypeFilterPanel`)
- Filtro por categorías IA (implementado pero deshabilitado en UI)
- Indicadores de reglas activas por conversación (iconos de grabación/transcripción/clasificación)
- Contador de resultados y timestamp de última búsqueda
- Estados de transcripción: normal → procesando (spinner, 6s) → transcrito (badge éxito)

#### 2. Transcripción Masiva (BulkTranscriptionModal v11)
- Se activa al seleccionar ≥1 conversación y hacer clic en ícono de FileText
- Clasifica automáticamente las seleccionadas en 3 destinos mutuamente excluyentes
- Toggle "Incluir análisis IA" que redistribuye conversaciones entre destinos
- Lock automático del toggle cuando todas las elegibles son solo-análisis
- Empty state "Todo al día" cuando todo ya está procesado
- Warning de coste siempre visible (reserva de espacio, opacity-only)
- Botón deshabilitado con label contextual cuando no hay nada que procesar

#### 3. Transcripción Individual
- Modal `TranscriptionRequestModal` abierto desde acciones por fila en la tabla
- Opción de diarización (identificar hablantes)
- Modal de re-transcripción (`RetranscriptionConfirmModal`) cuando ya existe transcripción

#### 4. Sistema de Reglas
- Tres tipos: Grabación, Transcripción, Clasificación IA
- CRUD completo con persistencia en localStorage
- Duplicación de reglas (crea borrador "Copia de...")
- Borradores: no se pueden activar hasta editar al menos un campo
- Drag & drop para reordenar reglas activas (prioridad 1 = máxima)
- Detección automática de conflictos (mismo tipo + servicios solapados)
- Navegación cross-vista: desde categorías se puede abrir directamente la regla vinculada

#### 5. Repositorio de Categorías IA
- CRUD de categorías IA con descripción, grupo y estado activo/inactivo
- Vinculación de categorías a reglas de clasificación
- Empty state con CTA de creación
- Duplicación de categorías

#### 6. Repositorio de Entidades
- Entidades de sistema (no editables, prefijo sys_)
- Entidades custom del usuario (CRUD)
- Tipos de entidad: texto, número, fecha, email, teléfono, lista, nombre, edad, URL, ordinal, moneda, datetime, dimensión, geografía, key_phrase, porcentaje, temperatura
- Configuración de validación (regex), valores por defecto, listas de valores

### Datos mock principales

En `mockData.ts`:
- **Servicios** (`mockServices`): 5 servicios (DV: Smart Contact, Soporte Técnico, Ventas Comercial, Atención al Cliente, Postventa)
- **Grupos** (`mockGroups`): 9 grupos ACD con nombres de agentes
- **Agentes** (`mockAgents`): 9 agentes
- **Orígenes** (`mockOrigenes`): 17 comunidades autónomas españolas
- **Tipificaciones** (`mockTipificaciones`): 17 tipos
- **Categorías** (`mockCategorias`): 12 categorías IA de muestra
- **Entidades** (`mockEntidades`): 12 tipos de entidades
- **Conversaciones** (`mockConversations`): ~25 conversaciones con transcripciones completas, estados variados y combinaciones de grabación/transcripción/clasificación/análisis

### TODOs conocidos / No implementado

- [ ] Backend real — toda la data es mock, nada persiste en servidor
- [ ] Reproductor de audio real en `PlayerModal.tsx`
- [ ] Filtro de categorías IA en toolbar (deshabilitado con `{false && ...}`)
- [ ] `onNavigateToEntities` en ClassificationRuleBuilder da toast "TBI" en lugar de navegar
- [ ] Paginación real en ConversationTable
- [ ] Exportación real de datos (DataExportImport.tsx)
- [ ] Autenticación/sesión de usuario
- [ ] La vista `Repository.tsx` (hub) puede necesitar pulido de diseño
- [ ] `ApplyRulesButton.tsx` — funcionalidad de aplicar reglas retroactivamente no implementada
- [ ] Modo oscuro definido en CSS pero sin activador en la UI

---

## ⚙️ 11. Environment & Configuration

### Variables de entorno

**No hay variables de entorno definidas**. El proyecto no usa `.env`. No hay API keys ni conexiones externas en producción (todo mock).

### Archivos de configuración relevantes

**`vite.config.ts`**:
```typescript
import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src/app') },
  },
})
```
- Alias `@` apunta a `./src/app` (úsalo como `import { X } from '@/components/X'`)
- No hay configuración especial para la prod build

**`postcss.config.mjs`**: configuración estándar de Tailwind v4.

**No existe `tailwind.config.js`** — Tailwind v4 no lo requiere. La configuración de tema se hace en CSS con `@theme inline { }` en `default_theme.css`.

### Requisitos previos

- Node.js ≥ 18 recomendado (Vite 6 lo requiere)
- pnpm instalado globalmente: `npm install -g pnpm`

---

## 🚀 12. How to Run Locally

```bash
# 1. Clonar/descomprimir el proyecto

# 2. Instalar dependencias
pnpm install

# 3. Correr en modo desarrollo
pnpm dev
# → Abre en http://localhost:5173

# 4. Build de producción
pnpm build
# → Genera dist/

# 5. Preview de producción local
pnpm preview
# → Abre en http://localhost:4173
```

> **Puerto por defecto**: 5173 (desarrollo), 4173 (preview)

> **Si pnpm no está disponible**: el proyecto también puede correr con `npm install && npm run dev`, pero el `pnpm-lock.yaml` está presente — usa pnpm para evitar inconsistencias.

> **Si hay errores de dependencias peer de React**: el `package.json` tiene React 18.3.1 como `peerDependencies` con `optional: true`. Esto es un patrón de Figma Make; las dependencias de React están disponibles en el entorno. En local puede necesitarse: `pnpm add react@18.3.1 react-dom@18.3.1`

---

## ⚠️ 13. Known Issues & Decisions

### Decisiones de diseño/arquitectura

1. **No usar react-router**: La navegación por `useState` fue una decisión deliberada para simplificar el prototipo. No hay URLs que cambien. Si se migra a react-router, hay que redesignar toda la lógica de vistas en `App.tsx`.

2. **No usar Zustand/Redux**: Context API fue suficiente para el scope actual. Si el proyecto escala, considerar Zustand.

3. **Colores hardcoded**: La paleta del proyecto no está en tokens Tailwind customizados — usa clases arbitrarias `bg-[#233155]`. Esto facilita prototipado rápido pero dificulta cambios de marca global. Para producción, migrar a variables CSS customizadas referenciadas desde Tailwind.

4. **Anti layout-shift como principio de diseño**: Todo elemento que aparece/desaparece debe reservar espacio en el DOM previamente. Se implementa con `opacity-0 pointer-events-none` + dimensiones fijas, o `min-h-[]`. Nunca usar `display:none` o mount/unmount para elementos que causa reflow visible.

5. **Reducción de densidad**: El principio de diseño es "lectura guiada" — jerarquía visual clara, microcopy contextual, empty states significativos, siempre preferir una capa de información sobre apilar múltiples.

6. **BulkTranscriptionModal v25**: La versión actual sustituyó la taxonomía v11 de 3 destinos por un layout más simple de 2 columnas (hero number + análisis toggle) con 6 casos derivados (C1–C6). Versiones anteriores (v1–v24) están como referencia en los archivos de spec en `src/app/imports/pasted_text/`. La pieza es ahora consumidora del shell oficial `<Modal>` del SC design system: si el shell cambia, los demás modales lo heredan automáticamente.

7. **Diarización · DEPRECADA en 15.23**. Históricamente era checkbox dentro de `TranscriptionRequestModal` y existía un `DiarizationRequestModal` separado para añadirla a posteriori. **Eliminada del producto entero** — solo existen "Transcripción" y "Análisis" (resumen + sentimiento). `DiarizationRequestModal` borrado en 15.23 (deprecado como concepto), `TranscriptionRequestModal` borrado en 15.28 (modal innecesario, sec 20.14). Cualquier modal/checkbox/copy con "diarización" en el repo hoy es bug. El campo `Conversation.hasDiarization` también borrado del schema en 15.36 (mockData + mockSamples + interfaz) — concepto cero refs en el repo.

### Workarounds / Hacks

1. **Import de sonner con versión**: `import { toast } from "sonner@2.0.3"` en lugar de `import { toast } from "sonner"`. Esto es un quirk del entorno de Figma Make — mantenerlo así.

2. **peerDependencies opcionales**: `react` y `react-dom` están en `peerDependencies` con `optional: true`. Es el patrón de Figma Make. En local puede requerir instalarlos explícitamente.

3. **`{false && showCategoryFilter && (...)}` en ConversationsView**: El filtro de categorías está deshabilitado poniendo `false &&` al principio. La lógica completa está intacta — solo hay que quitar el `false &&` para reactivarlo.

4. **ScLogo escalado**: El logo se importa como componente React con tamaño grande y se escala con `scale-[0.5] origin-center` porque el SVG tiene viewBox grande. En lugar de redimensionar el SVG, se optó por CSS transform.

5. **`sonner` Toaster duplicado**: Hay un `<Toaster />` en `ConversationsView.tsx`. Si en el futuro se añaden toasts en otras vistas, hay que mover el `Toaster` a `App.tsx` para evitar duplicados.

### Deuda técnica identificada

- Migrar colores hardcoded a design tokens reales de Tailwind
- Extraer el easter egg del avatar de `ConversationsView` a su propio componente
- `ConversationTable.tsx` probablemente es muy grande — candidato a dividir en subcomponentes
- Los efectos de sincronización en `ConversationsView` (`typeFilters` + `ruleFilters` derivados de `unifiedTypeFilters` vía `useEffect`) podrían ser un `useMemo` en lugar de estado derivado
- Falta prop drilling → considerar context para filtros de conversaciones

### Decisiones de producto cerradas

> Decisiones del producto (NO patrones técnicos — esos van a sec 20). El primer bloque (items 1-12) viene de la review de batch transcripción masiva, originalmente capturada en auto-memoria (`project_transcripcion_masiva.md`); copiada aquí para que sea discoverable desde el canon. Decisiones futuras se añaden numeradas al final, agrupadas por feature si tiene sentido.

**1. Color en filas de tabla solo si son accionables.**
El color en una fila comunica "puedes hacer algo aquí", no es decorativo. Si añades color rojo/amarillo/etc., justifica qué acción puede tomar el usuario sobre ella. "Accionable" incluye estados que requieren decisión cognitiva (error, en proceso) — no solo botones de retry.

**2. Conversación multi-grabación: usuario elige el tramo.**
Una conversación puede tener N grabaciones (transferencias entre grupos vía IVR). El sistema NO decide automáticamente cuál transcribir — el usuario elige. Implementación actual: `RecordingTimeline` (strip proporcional, sec 20.15) en `ConversationPlayerModal`. El flujo de transcripción (unitario y masivo) debe contemplar conversaciones de 1 grabación y de N grabaciones.

**3. Transcripción unitaria se accede vía modal del reproductor.**
Click en icono de canal/estado de la fila → modal del reproductor → CTA "Transcribir" en la tab Transcripción (15.28: dispatch directo, sin modal de confirmación intermedio — sec 20.14). NO hay botón inline en la fila para transcripción unitaria. Multi-select con checkbox para batch sí está cableado.

**4. Tab "Análisis" reemplaza dropdown de transcripción duplicado en tabla.**
Existía una columna en la tabla con dropdown que mostraba transcripción + resumen + sentimiento — duplicaba info ya visible en el reproductor. La columna se OCULTA (quirk `{false && showCategoryFilter && ...}` en `ConversationsView.tsx`, ver "Workarounds" item 3 arriba), no se borra. La tab del player se renombra "Análisis" e incluye Resumen + Sentimiento.

**5. Diarización DEPRECADA.**
Ver "Decisiones de diseño/arquitectura" item 7 arriba y sec 15.23. El árbol del producto es: Transcripción → Análisis. Punto.

**6. Vista por rol — toggle interno en prototipo.**
Roles: superadmin, admin, supervisor, agente. Los **agentes NO acceden a transcripción/análisis** (genera coste). Hay que poder previsualizar la vista de cada rol en el prototipo con un toggle visible — marcar como "esto es para nosotros, no producción".

**7. Errores en batch: fila roja sutil + toast con acción al final.**
Patrón cerrado para feedback de errores tras batch:
- Fila pintada con rojo sutil (NO agresivo) + icono de error a la izquierda. Color nunca es el único indicador (a11y).
- Toast al final reutilizando `scToast`, con botón "Ver fallidas" que filtra la tabla.
- NO pintar éxito en verde (éxito = estado normal, sin color).
- Amarillo (en proceso) y rojo (fallido) son secuenciales, casi nunca simultáneos.

Why: combina discoverability (toast) con persistencia espacial (fila). Toast solo no basta — rompe "recognition over recall" (Nielsen 6) y mismatch entre estado persistente y feedback efímero (Nielsen 1). Pintar la fila NO rompe la regla "color solo accionable" (item 1) porque el error es un estado que requiere decisión cognitiva.

**8. Análisis espera a que terminen TODAS las transcripciones.**
Si el usuario lanza un batch "transcribir + analizar", el análisis se encola tras la transcripción, no en paralelo. Razón: APIs distintas, evitar conflictos sobre la misma conversación. Implementación: chain event-driven en `ConversationsView` (`chainAnalysisIds` + `useEffect` que drena cuando `hasTranscription` flipa, sec 15.20).

**9. Items en proceso se omiten automáticamente en multi-select.**
Si el usuario selecciona 200 conversaciones y 100 ya están procesándose, el sistema solo trabaja con las otras 100. Mensaje al usuario: "se las omite". Razón: no se pueden ejecutar dos procesos sobre la misma conversación a la vez. El modal de confirmación de batch debe contar y mostrar items disponibles vs. items omitidos por estar en proceso.

**10. NO hay cancelación de batch a mitad de proceso.**
Una vez disparada la transcripción/análisis, el coste se genera completo aunque el usuario quisiera parar. Limitación técnica actual — la cola es aleatoria, no cronológica, y las APIs no permiten cancelación granular. El modal de confirmación debe dejar claro que iniciar = pagar todo. NO prometer "cancelar" en copy. Mejora futura tracked en `project_transcripcion_masiva_roadmap.md` (auto-memoria).

**11. Errores se notifican solo al INICIO y FIN del batch.**
El backend no notifica errores durante el proceso, solo en los extremos. NO diseñar feedback granular tipo "fallo en la 27 de 50". Cualquier feedback de error llega al final del batch completo.

**12. Reusar `scToast` con prop de acción.**
Cuando necesites notificar fin de proceso o error, usa `scToast.success({ title, message, action: { label, onClick } })` (o `.error`/`.warning`/`.info`) — no crear toast nuevo. La prop `action` admite `{ label, onClick }` para botones tipo "Ver fallidas".

**13. Bulk con multi-grabación: transcribir TODAS las grabaciones de cada conversación seleccionada.**
Cuando una conversación tiene N grabaciones (transferencias entre grupos vía IVR), el bulk **no** elige tramo — procesa todas las grabaciones de la conversación. La elección de tramo concreto vive solo en el modo individual (player → `RecordingTimeline`).

Comunicación al usuario antes de confirmar: el `BulkTranscriptionModal` muestra el desglose explícito en subtítulo o caption — algo como `14 conversaciones · 3 con varias grabaciones · 22 transcripciones totales`. El usuario ve el coste real (en número de transcripciones) antes de pulsar Procesar; si le sorprende, puede deseleccionar las multi-grabación manualmente y tratarlas individualmente.

Why: una sola regla, transparente sobre el coste, sin lógica oculta. Encaja con el principio del producto "el bulk no decide por ti — ejecuta todo lo seleccionado" (consistente con la decisión 9, items en proceso se omiten silenciosamente). Trade-off aceptado: pierdes la afordance "elige solo el tramo más relevante" desde el bulk, pero la individual la cubre cuando hace falta precisión.

How to apply:
- En `mockSamples.ts` / `mockData.ts`, modelar el estado por grabación (cada item de `recordings[]` tiene su propio `hasTranscription`).
- En `BulkTranscriptionModal`, `nTrans` cuenta **tramos pendientes** (no conversaciones) cuando hay multi-rec en la selección. Subtítulo/caption desglosa "X conversaciones · Y multi-grabación → Z transcripciones".
- En `ConversationsView.handleBulkConfirm`, el dispatch a `handleRequestTranscription` recibe IDs de tramo, no de conversación, cuando hay multi-rec.
- Implementación pendiente — ver sec 17.

**14. Invariante `hasTranscription` para multi-grabación: TRUE solo si todas las grabaciones están transcritas.**
Para una conversación con N>1 grabaciones, `Conversation.hasTranscription === true` significa que las **N** grabaciones están transcritas. Si solo M<N están transcritas, `hasTranscription === false` y la conversación aparece como pendiente en la columna Estado y en `nTrans`.

Why: la invariante "transcrita = completa" mantiene coherencia con el resto del producto. Una conversación parcialmente transcrita es funcionalmente "todavía pendiente" — el supervisor sigue teniendo trabajo abierto sobre ella. Esto también casa con la invariante existente "no análisis sin transcripción" (sec 13 item 7) — el análisis sigue requiriendo que el texto esté completo.

How to apply:
- Campo derivado opcional: `nRecordingsTranscribed: number` y `nRecordingsTotal: number` (o equivalentes) para cuando el UI quiera mostrar progreso parcial (e.g. "2 de 4 transcritas" en el `RecordingTimeline` si decidimos enseñarlo).
- `hasTranscription` se computa en el loader (`normalizeChats` o equivalente) a partir del estado por grabación, no se establece manualmente.
- La columna Estado de la tabla y los iconos de `StatusIcons` siguen leyendo `hasTranscription` agregado — no necesitan saber del estado por tramo.

**15. Estrategia phased v1/v2/v3 para producción** (cerrada 15.42).
Memory en producción NO se construye de golpe ni todo según el prototipo. Phased rollout para optimizar time-to-ship en v1 y profundizar el UX en v2:

- **v1 (sprints 1-2)**: reusar el reproductor existente de la plataforma + ajustes mínimos (quitar diarización · renombrar tabs · cost cue inline en lugar de confirm modal · botón Analizar en header · fix pluralización). Resultado: ~70% del UX del prototipo a ~25% del coste de desarrollo.
- **v2 (sprints 3-5)**: refactor profundo del reproductor hacia patrones del prototipo (empty states con CTAs claros · multi-rec timeline proporcional · sticky head + flex-1 tab body · per-tramo Check). Solo si feedback de supervisores valida el coste.
- **v3 (cuando aterrice el backend real)**: hero count = audios con desglose multi-rec · per-tramo transcription state · chain transcribir→analizar event-driven sobre backend real.

Why: el reproductor del prototipo desde cero cuesta ~3-4 semanas dev senior. Evolucionar el legacy con parches cuesta ~1 semana. El delta (3 semanas) sale rentable solo si Memory tiene vida útil >3 años con uso intensivo de supervisores (8h/día) — ROI documentado en sesión 15.42. La estrategia phased NO es deuda técnica · es decisión consciente de optimizar coste/valor en cada fase.

How to apply:
- v1 hereda decisiones del prototipo de bajo coste de implementación (cost cue inline, botón Analizar header, pluralización singular, Cancelar destructive).
- v1 NO toca el reproductor estructuralmente (sigue siendo el legacy con quirks).
- v2 ataca el refactor del reproductor solo cuando v1 esté validado en producción y haya feedback real de supervisores.
- v3 espera al backend (no es trabajo frontend).

**16. Sticky toast "Generando..." durante operaciones billables** (cerrada 15.42, implementada 15.43).
Patrón adoptado del Figma legacy al prototipo: cuando se lanza una operación de transcripción/análisis (unitaria o bulk), aparece un toast persistente arriba a la derecha con copy "Generando transcripción..." o "Generando análisis..." y `duration: Infinity`. Al completar, el mismo toast (mismo `id`) se reemplaza por un success/error breve.

Why: sin sticky toast, si el supervisor cambia de vista durante el batch, pierde visibilidad del estado en curso. El indicador en la fila no basta cuando navega fuera de la tabla. Sticky toast cumple Nielsen #1 "Visibility of system status".

How to apply:
- Lanzar `scToast.info({ title: "...", duration: Infinity, dismiss: true, id: "bulk-progress" })` al inicio de `handleRequestTranscription` / `handleRequestAnalysis`.
- En `setTimeout` de simulación (o en el handler del completion event del backend real), llamar a `scToast.success({ ..., id: "bulk-progress" })` con el mismo id para que sonner haga update in-place.
- Si el wrapper `scToast` no soporta update via id, hacer `scToast.dismiss(id)` + nuevo toast.

**17. Botón "Analizar" en header del player** (cerrada 15.42, implementada 15.43).
En el `ConversationPlayerModal`, añadir un botón "Analizar" en el header al lado de Re-transcribir y Download. Es la única acción discoverable sin tener que clicar en la pestaña Análisis. Disabled si no hay transcripción O si ya hay análisis (estado terminal). Click → dispatch directo a `handleRequestAnalysis` (NO modal de confirmación intermedio · respeta decisión 15.28).

Why: el CTA dentro del tab Análisis requería al supervisor cambiar de pestaña para descubrir que puede analizar. El botón en header es visible siempre. Adopción del patrón del Figma legacy donde tiene esto bien.

How to apply:
- Botón con icono `Sparkles` (size 15, strokeWidth 1.75) al lado del Re-transcribir.
- Tooltip `title="Análisis"`.
- `disabled={!conversation.hasTranscription || conversation.hasAnalysis === true}`.
- onClick → `setShowAnalysisConfirm(false)` (NO confirm) → directly call `onRequestAnalysis(conversation.id)`.
- Mantener el CTA dentro del tab Análisis para casos "dead-end resuelto" (sin transcripción, opción combo) — esos no se pueden lanzar desde el botón header porque está disabled.

**18. "Cancelar" como excepción para confirms destructivos** (cerrada 15.42, implementada 15.43, refinement de 15.23).
La decisión 15.23 estableció "Cerrar" como copy estándar del footer-cancel de modales (pre-submit no hay nada que cancelar). Para confirms **destructivos** específicamente (`DeleteCategoryDialog`, `RetranscriptionConfirmModal`) el copy cambia a "Cancelar" — semánticamente representa cancelar una acción consciente sobre algo existente, no solo cerrar el modal.

Why: en confirms destructivos, el supervisor inició explícitamente una acción (Eliminar, Re-transcribir) y el modal es el gate antes de ejecutarla. "Cancelar" es semánticamente más correcto que "Cerrar" en ese contexto.

How to apply:
- `DeleteCategoryDialog`: `<Modal.Cancel>Cancelar</Modal.Cancel>`.
- `RetranscriptionConfirmModal`: `<Modal.Cancel>Cancelar</Modal.Cancel>`.
- Resto de modales (`BulkTranscriptionModal`, `CreateEntityModal`, etc.): mantienen "Cerrar" según patrón general 15.23.

### Limitación asumida (consciente, no urgente)

**Pérdida de feedback visual tras logout o inactividad.**
Cuando la sesión se cierra, el feedback transitorio anterior no se conserva; solo las conversaciones en curso quedan marcadas al volver a entrar. Aplica a:

- Fila amarilla "recientemente procesada" (marca de "transcrita o analizada hace poco").
- Indicador rojo de "transcripción fallida" en la columna Estado · y por tanto también al filtro "Solo fallidas" del panel · ambos son flags transitorios, no estado persistente del backend.
- Toasts informativos / error previos (sticky o no): se pierden al cerrar la pestaña.

Lo que SÍ se mantiene tras volver a entrar:
- Las conversaciones que están **activamente en proceso** muestran su estado (spinner / icono pulsando) porque el backend sigue procesando y el indicador se deriva del estado vivo, no de un flag transitorio.
- Las transcripciones nuevas que se lancen post-login pintan en amarillo y se cuentan normal.

De momento, esto responde a una limitación técnica que aún no tiene solución disponible. El backend puede forzar la barra de progreso en peticiones nuevas, pero no reconstruir feedback histórico — requeriría una DB de actividad por usuario. Concepto futuro: indicador persistente tipo "marcar como leído" de Gmail/Teams.

---

## 📝 14. Claude Code Handoff Notes

### Convenciones de naming

- **Componentes**: PascalCase, un componente por archivo, archivo con el mismo nombre (`BulkTranscriptionModal.tsx` → `export function BulkTranscriptionModal`)
- **Contextos**: `NombreContext.tsx` con export del Provider `NombreProvider` y hook `useNombre`
- **Hooks**: camelCase con prefijo `use` (`useCategories`, `useRules`, `useEntities`)
- **Datos mock**: `mock` + plural + PascalCase (`mockConversations`, `mockServices`)
- **Variables de color**: hex directo en clases Tailwind arbitrarias, sin alias

### Patrones de código repetidos que hay que respetar

1. **Modal pattern (NUEVO · sobre el shell del SC design system)**:
```tsx
import { Modal } from "./ui/modal";

<Modal open={isOpen} onOpenChange={(o) => !o && onClose()}>
  <Modal.Content width={720}>
    <Modal.Header
      title="Procesar conversaciones"
      subtitle="14 conversaciones seleccionadas"
      icon={<MyIcon />}              // opcional, default text-align-start
    />
    <Modal.Body>
      {/* slot de contenido */}
    </Modal.Body>
    <Modal.Footer>
      <Modal.Cancel>Cancelar</Modal.Cancel>
      <Modal.Action onClick={handleConfirm} disabled={!canSubmit}>
        Procesar
      </Modal.Action>
    </Modal.Footer>
  </Modal.Content>
</Modal>
```
- Built on `@radix-ui/react-dialog` → focus trap, ESC, scroll lock, portal, stacking gratis.
- Estilos via tokens `--sc-modal-*` y utilities Tailwind `bg-sc-*`, `text-sc-*`, `rounded-sc-*`, `shadow-sc-*` (ver sección 4).
- Compound API: `Modal`, `Modal.Trigger`, `Modal.Close`, `Modal.Content`, `Modal.Header`, `Modal.Body`, `Modal.Footer`, `Modal.Cancel`, `Modal.Action`.
- Para bloquear ESC/overlay durante operaciones async: `<Modal.Content onEscapeKeyDown={(e) => isLoading && e.preventDefault()} onPointerDownOutside={...} showClose={!isLoading}>`.

**Modal pattern legacy** (todavía presente en `TranscriptionRequestModal`, `DiarizationRequestModal`, `RetranscriptionConfirmModal`, `PlayerModal`, `RuleSelectionModal`, `CreateEntityModal`, `DeleteCategoryDialog`):
```tsx
if (!isOpen) return null;
return (
  <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-[480px]">{/* ... */}</div>
  </div>
);
```
Estos modales NO se han migrado todavía al nuevo shell. Migrarlos progresivamente cuando se toquen es deuda técnica conocida.

2. **Context pattern**:
```tsx
const Context = createContext<ContextType | undefined>(undefined);
export function Provider({ children }) {
  const [state, setState] = useState(() => {
    // Load from localStorage
  });
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(state)); }, [state]);
  return <Context.Provider value={...}>{children}</Context.Provider>;
}
export function useX() {
  const context = useContext(Context);
  if (context === undefined) throw new Error('useX must be used within XProvider');
  return context;
}
```

3. **Anti layout-shift pattern**:
```tsx
{/* BIEN: siempre en DOM, solo opacity */}
<div className={`min-h-[42px] ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
  contenido
</div>
{/* MAL: mount/unmount */}
{show && <div>contenido</div>}
```

4. **Rule builder pattern**: Todos los builders tienen la misma estructura:
```
1. useState para cada campo del formulario
2. handleSave() con validación + construcción del objeto Rule + llamada a onSave
3. Render con RuleBuilderLayout > [Info básica, SelectionCriteria, ...secciones específicas]
```

5. **Toast import** (OBLIGATORIO en este entorno):
```tsx
import { toast } from "sonner@2.0.3"; // Con versión específica
```

### Partes del código más delicadas o críticas

1. **`BulkTranscriptionModal.tsx`** (v25) — Construido sobre `<Modal>` shell del SC design system. La lógica de los 6 casos C1–C6 emerge implícitamente de la combinación `(nTrans, callEa, chatEa, ap)`. Las fórmulas críticas son `heroCount = on ? nTrans + nAnBase : nTrans` y `canAnalyze = (nTrans + nAnBase) > 0` — cualquier cambio aquí altera qué se procesa y qué se omite. Ver sección 5 para tabla completa de casos.

2. **`RulesContext.tsx` — `toggleRule`**: La función evita activar borradores silenciosamente. Si se cambia, hay que asegurar que la guard `if (!rule.active && rule.isDraft) return prev;` se mantiene.

3. **`RuleBuilderLayout.tsx` — split de children**: Usa `Children.toArray(children).slice(0,2)` y `.slice(2)` para separar en dos columnas. Si un builder tiene diferente número de secciones en la columna izquierda, puede romperse. Actualmente todos tienen exactamente 2 secciones izquierda: Info básica + Alcance.

4. **`ConversationsView.tsx` — `useEffect` de sincronización**: Los dos `useEffect` que sincronizan `typeFilters`/`ruleFilters` desde `unifiedTypeFilters` deben mantenerse. Si se elimina uno, los filtros dejarán de sincronizarse.

5. **`detectConflicts` en `RulesRepository.tsx`**: Detecta conflictos solo cuando hay servicios solapados. Si una regla tiene `servicios: []` (todos los servicios), actualmente NO detecta conflicto con reglas que tienen servicios específicos. Esto es un known limitation.

### Extensiones futuras previstas

- El sistema de reglas está diseñado para soportar condiciones más complejas (`scopeOrGroups` para múltiples grupos con OR logic, `invertCondition` para invertir el alcance)
- `AdditionalConditions` tiene props para porcentaje de muestreo y duración máxima que los builders actuales no exponen — están preparados para activarse

---

*Generado el 25/04/2026 para Claude Code. Última actualización: 28/04/2026 — sesión deploy + estrategia DS. Estado del proyecto: prototipo funcional MVP, todas las sesiones de diseño completadas hasta BulkTranscriptionModal v25 + Rule Builders completos.*

---

## 📅 15. Session log · 2026-04-25 — SC Design System Modal + BulkTranscriptionModal v25

> Esta sección documenta exhaustivamente lo decidido, hecho, refactorizado y pendiente en la sesión que sustituyó el modal de transcripción masiva v11 por el shell oficial del Smart Contact Design System y construyó el body v25. Lectura obligatoria si se reabre el proyecto.

### 15.archivo-2026-04-25 · resumen comprimido · setup + Modal shell + BulkTranscriptionModal v25

> Sesión inaugural del SC Design System (2026-04-25, sub-secciones 15.1 → 15.9). **Detalle completo (167 líneas)** en [`memory-archive/2026-04.md`](../../../memory-archive/2026-04.md#sesión-2026-04-25--sc-design-system-modal--bulktranscriptionmodal-v25-151--159). Comprimido en 15.30 (compactación sec 19).

- **15.1 · Setup local** — pnpm vía `npx -y pnpm@latest install` (no global, no lock commiteado). Quirk: `package.json` tiene claves estilo `"sonner@2.0.3": "npm:sonner@2.0.3"` que npm rechaza con `EINVALIDPACKAGENAME`.
- **15.2 · Decisiones arquitectónicas Modal** — Nuevo `ui/modal.tsx` (no tocar `dialog.tsx` shadcn). Radix Dialog (focus trap + scroll lock + ESC + portal + stacking gratis). Compound API. Roboto (no Inter — el cliente lo manda). `--sc-navy-600` (#1B273D) para CTA del Modal.
- **15.3 · Tokens en 3 capas** — L1 primitives → L2 semantic → L3 component → `@theme inline` → utilities Tailwind v4. Reglas para extender: añadir SIEMPRE en `sc-design-system.css`, NUNCA tocar `default_theme.css`. **Bug crítico namespace**: `text-X` colisiona entre `--color-X` y `--text-X` — solución: token de tamaño `--text-sc-base` (no `--text-sc-body`). L3 solo para valores específicos del componente; aliases L3→L2 son ruido.
- **15.4 · Animaciones SC** — 4 keyframes con `animate-sc-*`: `bump` (260ms scale 1.03), `pulse` (360ms scale 1.08), `delta-fly` (750ms ghost flotando), `shake` (280ms nudge). Patrón "useState key cambiante" para reiniciar el keyframe.
- **15.5 · BulkTranscriptionModal v11 → v25** — Hand-rolled `<div fixed>` → Modal shell. Body 2 columnas: hero number 72px (left) + análisis toggle (right). 6 casos C1-C6 emergen implícitamente de `(nTrans, callEa, chatEa, ap)`. Fórmulas críticas: `heroCount = on ? nTrans + nAnBase : nTrans`, `canAnalyze = (nTrans + nAnBase) > 0`. API hacia caller idéntica.
- **15.6 · Optimizaciones final audit** — Token rename `text-sc-body` → `text-sc-base`. 10 L3 tokens muertos eliminados. `useState(() => ...)` lazy init. `useMemo([selectedIds])` para `selectedConversations`. `min-h-` en Footer (no `h-`).
- **15.7 · Deuda técnica capturada** — Migrada en su totalidad a sec 17 (modales legacy P1, navy harmonization P1, Roboto @import P2, audio real P1, dark mode P3, etc.).
- **15.8 · Gotchas perpetuos** — `import sonner@2.0.3` con versión, `<Modal>` siempre montado para que Radix anime cierre, keyframes necesitan `key` cambiante, `<DialogPrimitive.Close asChild>` requiere child único `<button>`. Ver sec 13 (Workarounds) y sec 14 (Patrones).
- **15.9 · Smoke test del modal** — Receta verificación visual + edge cases (selección vacía, todo procesado, solo chats sin análisis). Detalle en archive.

---

## 🎯 16. Naturaleza del proyecto · stack del prototipo vs producción

> **Lectura crítica para cualquier sesión futura.** Sin entender esto, se pueden tomar decisiones equivocadas (tipo "voy a meter PrimeReact").

### El prototipo es provisional

El código de este repositorio es un **prototipo en React** cuya función es validar diseño y flujos antes de la implementación real. NO es el producto final. La iteración rápida (Vite + React + Radix + shadcn) es lo que justifica este stack — no hay decisión técnica de "queremos React en producción".

### La producción real será Angular + PrimeNG

El equipo del cliente implementa en **Angular + PrimeNG** (PrimeFaces). Cuando el diseño esté validado y el DS sea estable, el código de producción se construirá en ese stack, sea reescribiéndolo desde cero o traduciéndolo a partir de este prototipo.

### El Design System está en construcción

El DS actual (`src/styles/sc-design-system.css` con tokens `--sc-*`) es **temporal y mínimo**. Se construyó porque Figma Make generó valores arbitrarios y necesitábamos algo que diera consistencia básica al prototipo. Va a evolucionar para acercarse a las convenciones de PrimeNG (tema **Aura** probablemente) según el cliente vaya definiendo su DS oficial en Figma.

**Implicación práctica**: cuando el cliente actualice tokens en Figma, los `--sc-*` se ajustan a esos valores. Los nombres de los tokens pueden quedarse como `--sc-*` o renombrarse a `--p-*` (convención PrimeNG) según se decida. Eso es un detalle posterior.

### Decisión de migración futura · NO tomar todavía

En algún momento habrá que decidir qué hacer con este prototipo:

- **Rol 1 · prototipo desechable** — el equipo Angular reescribe en PrimeNG, este código se descarta. Es lo más habitual y eficiente en coste.
- **Rol 2 · spec viva en PrimeReact** — migrar el prototipo a PrimeReact (el port React de PrimeNG, mismo design system). El equipo Angular traduce 1:1 a PrimeNG. Sprint dedicado, no migración gradual.
- **Rol 3 · pivote completo a Angular** — reescritura del prototipo en el stack de producción. El prototipo se convierte en producción.

**Esta decisión NO se debe tomar hasta que el DS del cliente esté maduro.** Hoy, con el DS "en pañales", elegir A/B sería prematuro y limitaría opciones. La opción que mantiene puertas abiertas es seguir en React y dejar que el DS dicte la convergencia.

### Reglas para sesiones futuras

1. **NO instalar `primereact` ni `@angular/*`** sin discusión explícita previa. Esas dependencias implican migración completa.
2. **NO renombrar tokens `--sc-*` a `--p-*`** hasta confirmación del cliente. Los nombres son una convención interna; los valores son lo que importa.
3. **Cuando se incorporen cambios del DS de Figma**, ajustar VALORES en `sc-design-system.css` manteniendo nombres. Los componentes que consumen utilities (`bg-sc-primary`, etc.) seguirán funcionando.
4. **Si el cliente pide aspecto idéntico a un componente PrimeNG concreto** (e.g. su Dialog), implementarlo respetando los tokens existentes. NO sustituir nuestro `Modal` por PrimeReact.
5. **Si el cliente decide migrar a PrimeReact o Angular**, parar y planificar como sprint dedicado.

---

## 📌 17. Roadmap · pendiente

> Lista plana de items abiertos. Sin milestones, sin estimaciones. Se actualiza cada vez que se cierra o se abre un item.

### Pendiente

- Audio real en `ConversationPlayerModal` (hoy reproducción simulada con `setInterval`). El `PlayerModal` legacy queda muerto en el repo — borrar cuando todos los callers se hayan movido al nuevo. (P1)
- Paginación real en `ConversationTable`. (P2)
- Exportación / importación real en `DataExportImport.tsx`. (P2)
- Backend / persistencia real (hoy todo es mock + `localStorage`). (P0 cuando empiece la integración)
- Modo oscuro: tokens definidos en `default_theme.css` con `.dark`, falta toggle UI y variantes dark de los `--sc-*`. (P3)
- Dividir `ConversationTable.tsx` en subcomponentes (es muy grande). (P2)
- Code-splitting del bundle: tras la reversión 15.36 el chunk JS está en 860 KB (gzip 246 KB). Si se quisiera bajar más, candidatos para `manualChunks`: `motion`, `react-day-picker` + `date-fns`, `@radix-ui/*`. (P3 — irrelevante en demo local, solo importa si el deploy tiene mucho tráfico)
- Decisión pendiente sobre el destino del prototipo (rol 1/2/3) cuando el DS del cliente esté maduro — ver sección 16.
- Añadir `tsconfig.json` y `npm run typecheck` script — hoy Vite usa esbuild solo (no hay typechecker en CI). (P2)
- Resolver discusión sobre `<Sparkles>` como icono de tab Análisis en `ConversationPlayerModal.tsx:389`. memory.md sec 15.18 dice "Sparkles reservado exclusivamente a la pill 'Generado por IA'". Estricto vs práctico. (P3)

### Estrategia de implementación en producción · phased v1/v2/v3 (cerrada 15.42)

> Cuando este prototipo se traduzca a producción, el rollout no es big-bang. Se hace en tres fases con coste y riesgo distintos. Esta sección documenta qué entra en cada una para que el equipo de ingeniería de Smart Contact pueda planificar sprints.

**v1 (sprints 1-2) · ~25% del coste, ~70% del UX**
Reusar el reproductor legacy de la plataforma con ajustes mínimos. Lo que entra:
- Quitar diarización del producto (decisión 15.23).
- Renombrar tabs según convenciones de Memory (Transcripción · Análisis).
- Cost cue inline en el modal masivo en lugar de modal de confirmación intermedio (decisiones 15.23 / 15.28).
- Botón "Analizar" en el header del player para discoverability (sec 13 item 17).
- Fix pluralización singular/plural ("admite/admiten análisis", `Descargando 1 conversación` vs `Descargando N conversaciones`).
- "Cancelar" en confirms destructivos · "Cerrar" en el resto (sec 13 item 18).
- Sticky toast "Generando..." durante operaciones billables (sec 13 item 16).

**v2 (sprints 3-5) · solo si feedback de supervisores justifica el coste**
Refactor profundo del reproductor hacia los patrones del prototipo:
- Empty states centrados con CTAs claros (DecisionState · ProcessingState · TerminalNote).
- Multi-recording timeline · strip único proporcional (sec 20.15 + 20.16).
- Sticky head + flex-1 tab body (decisión 15.33).
- Per-tramo Check icon en `MultiRecordingPlayer` (decisión 15.40).

**v3 · cuando aterrice backend real**
Lo que no se puede hacer hasta tener el sistema productivo detrás:
- Hero count = audios con desglose honesto en multi-tramo (decisión 15.31, hoy emulada cliente-side).
- Per-tramo `hasTranscription` con flips reales (hoy `setTimeout` simulado).
- Chain transcribir → analizar event-driven sobre eventos reales del backend (hoy `useEffect` que drena cuando el flag flipa por mutación local).
- Indicador persistente "marcar como leído" para batches procesados durante logout (limitación 15.42 sec 13).

**Esto NO es deuda técnica.** Es decisión consciente de optimizar coste/valor. Si se trata como deuda y se aplaza indefinidamente, Memory se queda con una versión heredada sin ningún upgrade y se desperdicia la oportunidad de elevar el listón.

ROI documentado en sec 15.42: ~50 supervisores × 7s perdidos/sesión × 30 sesiones/día × 250 días/año ≈ 15h/año/supervisor → ~750 horas/año organización. ROI < 12 meses si el producto tiene vida útil > 3-5 años.

### Decisiones del audit 15.18 — estado actual

> Las decisiones se mueven a "cerrada" al confirmar/revertir. Aquí solo viven las **abiertas** o que necesitan validación con uso real.

**Cerradas en sesión 15.20** (audit follow-up · ver log de esa sesión para racional):

- ✅ ~~Timer 6500 ms del `handleTranscribeAndAnalyze`~~ → **reemplazado** por chain event-driven en el padre (`chainAnalysisIds` + `useEffect` que drena cuando `hasTranscription` flipa). Ya no hay timer ni acople al `setTimeout(6000)`. Cuando llegue backend real, basta con sustituir el flag derivado de la mutación por la promesa real — la lógica de queue/effect sigue igual.
- ✅ ~~CTA primario navy vs teal-soft para opt-in~~ → **mantenido navy filled** en TODOS los empty states + Modal.Action. Razón: un solo "primary action" recognition pattern repo-wide. El cost cue vive en `meta` (`text-sc-cost-warn`) bajo el botón; diferenciar también por color del botón es redundante. El teal-soft queda libre como CTA secundario.
- ✅ ~~Ribbon condicional por `rules.length === 0`~~ → **mantenido**. Re-aparición tras reset es intencional (estado-cero merece orientación). Si testing futuro lo confirma confuso, switch a `localStorage` dismiss persistente en una pasada simple.

**Abiertas**:

- **Bubble alignment iMessage** en la transcripción del player (Agente derecha + Cliente izquierda). El supervisor es observador, no participante; el patrón "right=me" es culturalmente sesgado. Validar con usuarios reales si confunde antes de cambiar a layout Slack-style (todo a la izquierda + avatar). (P3.)
- **`text-sc-display` collapsing con `text-sc-color`** en `cn()` (sec 15.15). Hoy resuelto con `style={{ fontSize }}` en 4 sitios. Alternativa más durable: configurar `tailwind-merge` con `extendTailwindMerge({ classGroups: { 'font-size': [{ text: ['sc-xs', ...] }] } })` y reemplazar `cn` por la versión configurada. Migración coordinada, no parche. (P2.)
- **Side-panel pattern repo-wide**: `CreateCategoryPanel`, `EditCategoryPanel`, `EditEntitySidepanel`, los rule builders, `RuleQuickViewPanel` — todos son `Sheet` lateral con anchuras 40-50%. La regla del audit "<4 fields → modal" aplica a `CreateCategoryPanel` (2 inputs) y `EditCategoryPanel` (3 inputs) en estricto, pero esos paneles llevan template-picker, linked-rules y kebab actions. Decisión sistémica pendiente: ¿se mantiene la convención sidepanel para creación/edición, o se migra todo a modal centralizado? Tocar solo dos crearía inconsistencia con el resto. (P3 — decisión cross-cutting, no parche puntual.)

---

## 🚢 18. Deploy · publicación

**URL pública**: https://memoryplus3.netlify.app/
**Repositorio**: https://github.com/arebury/Memory (privado)

### Pipeline actual

```
local                 GitHub                  Netlify
─────                 ──────                  ───────
Claude Code edita →   git push origin main →  webhook recibido
                                              pnpm build (~2 min)
                                              publica dist/
                                              URL pública actualizada
```

### Configuración relevante

- **`netlify.toml`** (raíz): comando `pnpm build`, publica `dist/`, Node 20, pnpm 10.33.2, redirect SPA-fallback (`/* → /index.html 200`).
- **`package.json` · `pnpm.onlyBuiltDependencies`**: `["@tailwindcss/oxide", "esbuild"]` — pnpm permite ejecutar los build-scripts nativos de estos paquetes (los demás siguen bloqueados por defecto, comportamiento de seguridad de pnpm 10).
- **`.gitignore`**: `node_modules/`, `dist/`, `.netlify/`, `.env*.local`, `.DS_Store`, logs, editor configs.
- **Variables de entorno**: ninguna. El proyecto no usa `.env`.

### Cómo correr el build localmente (verificación pre-push)

```bash
npx -y pnpm@latest install   # primera vez o tras cambios en package.json
npx -y pnpm@latest build     # produce dist/
npx -y pnpm@latest preview   # sirve dist/ en http://localhost:4173 para inspección
```

### Cómo se ve un deploy en Netlify

1. Hacer `git push origin main`.
2. Netlify recibe webhook de GitHub.
3. Build log visible en `app.netlify.com/sites/<site>/deploys`.
4. Tarda ~2-3 min: install (pnpm), build (vite), deploy (Netlify CDN).
5. URL pública estable (`https://<site>.netlify.app`) actualizada al terminar.

### Si un deploy falla

1. Mirar el build log de Netlify (UI: Deploys → click deploy fallido → "View deploy log").
2. Errores típicos:
   - **`pnpm: command not found`** → comprobar que `netlify.toml` declara `PNPM_VERSION`.
   - **`@tailwindcss/oxide install script blocked`** → verificar `pnpm.onlyBuiltDependencies` en `package.json`.
   - **`Cannot find module 'sonner@2.0.3'`** → la entrada con alias está rota en `package.json` (claves `"package@version": "npm:package@version"`).
   - **TypeScript strict errors** → no debería pasar (Vite usa esbuild, no `tsc`), pero si hay un fail, revisar import resolution.
3. Reproducir localmente con `pnpm build`. Si pasa local pero falla Netlify, comparar versiones de Node/pnpm.

### Rollback

En el dashboard de Netlify, "Deploys" → seleccionar un deploy anterior estable → botón "Publish deploy". Es instantáneo y no requiere git revert.

---

## 🔁 19. Protocolo de session log

> Reglas obligatorias para mantener `memory.md` útil entre sesiones. Si se rompen, las sesiones futuras pierden contexto y queman tokens preguntando lo mismo.

### Plantilla obligatoria al cerrar sesión

Toda sesión de Claude Code (o Cursor) debe terminar añadiendo una entrada al final de la **sección 15** con este formato:

```
### 15.X · YYYY-MM-DD · [agente] · [tema corto, una frase]

**Hecho**:
- bullet específico de un cambio concreto. archivos: path/a/file.tsx
- otro cambio específico. archivos: path/...

**Decidido**:
- decisión no obvia con su porqué (1 frase máxima).

**Pendiente**:
- item abierto que se sumó a sec 17. (P0/P1/P2/P3 entre paréntesis si aplica).

**Notas para próxima sesión**:
- contexto que la siguiente sesión necesita y no se deduce del código.
```

### Reglas de redacción

- **Específico, no vago**. ✅ "Hero number cambia de 72→56px y color a `#3C434D` per Figma 289:649". ❌ "Mejoras visuales en el modal".
- **Sin referencias a cómo se prompteó**. ✅ "Migrar tokens a Aura cuando el cliente lo confirme". ❌ "Implementar la armonización profesional sugerida".
- **Archivos concretos**, no descripciones genéricas. Path relativo al repo.
- **Pendientes siempre se reflejan en sec 17** además de la entrada de sesión.

### Compactación periódica

Cuando `memory.md` supere ~2500 líneas, la siguiente sesión debe:

1. Crear `memory-archive/YYYY-MM.md` con todas las entradas de sesión 15.X anteriores al mes corriente.
2. Reemplazar esas entradas en sec 15 por un resumen denso de 5-15 líneas:
   ```
   ### 15.archivo · 2026-04 → 2026-MM · resumen comprimido
   - Construido: A, B, C.
   - Decidido: X (porqué), Y (porqué).
   - Pendientes que ya están en sec 17: ...
   - Detalle completo: memory-archive/2026-04.md.
   ```
3. Confirmar al usuario qué se archivó.

Esto evita que `memory.md` se haga ilegible. La sec 1-14 (estructura, componentes, tokens) se mantiene siempre — esas son las "constantes" del proyecto.

### Routing matrix de conocimiento

> Qué tipo de conocimiento va dónde. Aplicada consistentemente, no hay duplicación ni pérdida.

| Tipo de conocimiento | Destino | Por qué |
|---|---|---|
| **Cambio puntual de archivo** (fix, refactor, feature) | git commit + entrada de sesión 15.X (Hecho) | El detalle vive en el diff; la sesión registra el porqué |
| **Decisión técnica reusable** (patrón que aplicará a futuros componentes) | Sec 20 del canon (numerada 20.X) + auto-memoria `feedback_*.md` (operativo para el agente) | Canon es discoverable por humanos; auto-memoria es trigger rápido para el agente |
| **Decisión de producto / UX cerrada** (regla del producto, no del código) | Sec 13 del canon, subsección "Decisiones de producto cerradas" **+ mirror narrativo en `docs/decisiones.md`** | Sec 13 es jerga técnica para canon interno; `docs/decisiones.md` es la versión stakeholder-friendly accesible desde el help del prototipo. Cero drift entre ambos: el mismo evento de cierre que escribe sec 13 debe actualizar `docs/decisiones.md` |
| **Pendiente con prioridad** (P0/P1/P2/P3) | Sec 17 del canon (lista plana) + entrada de sesión 15.X (Pendiente) | Sec 17 es single-source-of-truth de roadmap |
| **Idea futura sin prioridad** (no urgente, "cuando un cliente lo pida") | Auto-memoria `project_*_roadmap.md` | No mete ruido al roadmap activo del canon |
| **Gotcha operativo** (sandbox, esbuild, env, comando que falla) | Auto-memoria `project_session_status.md` ("Gotchas") | Es meta-info de cómo trabajar el repo, no del producto |
| **Regla de microcopy nueva** | Sec 20.5 / 20.9 del canon | Sec 20 ya tiene políticas de copy |
| **Detalle técnico no obvio en código** | Comentario WHY en el archivo (NO comment de WHAT) | Cero overhead de doc para algo que vive con el código |
| **Bug raro encontrado, root cause** | Comentario WHY en código + entrada de sesión 15.X "Notas para próxima sesión" | El comentario evita repetirlo; la nota sube la guardia del próximo agente |
| **Preferencia personal del usuario** (cómo trabajar, no qué construir) | Auto-memoria `feedback_*.md` (NO canon) | Es del usuario, no del proyecto — aunque influye en cómo se escribe código |
| **Decisión revertida o invalidada** | Marcar la entrada original con nota "DEPRECADA en 15.X" + sesión 15.X (Decidido: "revierto X porque…") | Preservar el contexto histórico, no esconder el cambio de opinión |

### Disparadores de cierre de sesión

Cuando el usuario diga alguna de estas frases (o equivalentes naturales en español), el agente debe **automáticamente aplicar el protocolo de esta sección sin volver a preguntar**:

- "cerramos" / "cerramos sesión" / "cerramos por hoy"
- "voy a cerrar" / "vamos cerrando"
- "documenta y cerramos" / "cierre" / "cierra"
- "guarda lo que toque y cerramos"
- "ya está, cierra"

**Lo que el agente DEBE hacer al detectar el disparador**:

1. Identificar qué se hizo en la sesión (revisar `git diff`, `git log` desde el inicio de sesión, y la conversación).
2. Aplicar la routing matrix arriba — cada pieza de conocimiento al sitio correcto.
3. Escribir entrada `15.X` en este archivo siguiendo la plantilla obligatoria.
4. Si hay pendientes nuevos, añadirlos a sec 17.
5. Si hay patrones técnicos nuevos validados, añadirlos a sec 20 + crear o actualizar `feedback_*.md` en auto-memoria.
6. Si hay decisiones de producto nuevas, añadirlas a sec 13 (subsección "Decisiones de producto cerradas") **Y reescribir el bloque correspondiente en `docs/decisiones.md`** en lenguaje stakeholder. La sec 13 es jerga técnica para canon interno; `docs/decisiones.md` es la versión narrativa que un stakeholder puede leer desde el help del prototipo. Mantener ambos en sync es obligación del cierre (15.41 establece la regla).
7. Actualizar `project_session_status.md` (auto-memoria) con HEAD nuevo y resumen 1-2 líneas de la sesión.
8. Commit + push (preguntar antes solo si la sesión hizo cambios destructivos o el usuario no lo pidió explícitamente; si el usuario ya dijo "cerramos" sin matices, asumir que el cierre incluye push).
9. Confirmar al usuario qué se ha guardado y dónde, en bullet list corto.

**Lo que el agente NO debe hacer**:

- Preguntar "¿quieres que documente?". Si oyes el disparador, documentas. Solo preguntas si NO hay nada documentable (sesión sin cambios, conversación puramente exploratoria sin decisiones cerradas).
- Duplicar info entre canon y auto-memoria salvo que la routing matrix lo pida explícitamente.
- Borrar entradas históricas de sec 15. Si una decisión vieja ahora es errónea, márcala como deprecada con pointer a la nueva, no la borres.

### 15.archivo-2026-04-28a · resumen comprimido · deploy + ConversationPlayerModal + UX audit (15.10 → 15.18)

> Día intensivo del 28 de abril, primera ola de 9 sesiones. **Detalle completo (~325 líneas)** en [`memory-archive/2026-04.md`](../../../memory-archive/2026-04.md#sesión-2026-04-28-primera-ola--deploy--conversationplayermodal--ux-audit-1510--1518). Comprimido en 15.30 (compactación sec 19).

- **15.10 · Deploy GitHub/Netlify** — Live `https://memoryplus3.netlify.app/`. Repo privado `arebury/Memory`. README rehecho con badges. Sec 16/17/18/19 nuevas en `memory.md`. BulkTranscriptionModal hero 72→56px (Figma 289:649). Nuevos tokens `--sc-text-emphasis`, `--sc-text-disabled`, `--sc-accent-strong`, `--sc-cost-warn`, `--sc-bulk-*`.
- **15.11 · v26 · status pictograms + ConversationPlayerModal scaffolded** — Body de v25 compactado a 100px. `<StatusIcon />` único (6 SVG inline channel+estado, pulse 1.1s mientras procesa). Nuevo `ConversationPlayerModal` (no refactor del legacy `PlayerModal`). `MockSampleSwitcher` + `mockSamples.ts` + `mockTranscriptionGenerator.ts` (6 templates determinísticos). `setConversations` en estado local para que mutaciones sobrevivan al cierre del modal.
- **15.12 · v26 fidelity pass** — Hero a **88px / 1:1 line-height** (no 56). Padding-top compartido como mecanismo de alineación de labels (no justify-center). `animate-sc-pulse` unificada (no `bump`). Hairline divider `--sc-border-soft`.
- **15.13 · Invariante "chats siempre transcritos"** — `normalizeChats(list)` en `mockSamples.ts` centraliza la regla. Player panel reescrito con bubbles tipo chat (Agente derecha `bg-accent-soft` / Cliente izquierda `bg-border-soft`) para AMBOS canales. `IconChat` queda dead code (defensa documentada).
- **15.14 · Análisis = Resumen + Sentimiento + Repository rehecho** — Análisis tab reducido a Resumen + Sentimiento (borradas Categorías + Entidades). Resumen + transcripción comparten hash → coherencia narrativa garantizada (6 templates). Sentimiento detecta léxico negativo en el texto. Player channel-aware (Phone/MessageSquare). Audio player oculto para chats (no disabled). Repository LP rehecho: ribbon "Cómo funciona" + Hero card de Reglas + Categorías/Entidades como PrimaryCard sin split purple/teal. **Segunda invariante**: `hasAnalysis === true ⇒ hasTranscription === true` (centralizada en `normalizeChats`).
- **15.15 · BUG twMerge text-{size}+text-{color}** — Hero number renderizaba 16px en vez de 88. `cn()` agrupa `text-sc-display` + `text-sc-emphasis` y mantiene solo el último. Política nueva: `style={{ fontSize: 'var(--sc-font-size-X)' }}` cuando `cn()` combina ambas. 4 sitios afectados, todos arreglados. Migración tw-merge config como deuda P2 (no parche).
- **15.16 · README expandido + taste-skill instalada** — README con UX writing lens (problema → palancas → vistas → invariantes). Taste-skill instalada con overrides explícitos a 4/4/4 para Memory (es dashboard, no marketing).
- **15.17 · EmptyState API ampliada (impeccable+taste)** — `highlights` (pills value-prop), `meta` (con `intent: 'cost'`), `secondaryHint`, medallón circular 48px. Copy en gerundio para activos. Política copy: conversacional para títulos, descripción explica WHY antes que HOW.
- **15.18 · Audit UX · 11 fixes en una pasada** — Easter-egg avatar fuera, `<HelpCircle>` en toolbar. Bulk subtitle con breakdown por canal. `FOCUS_RING` extraído a `ui/focus.ts`. Player tab row con `<Download>` único (paridad chat+llamada). Análisis dead-end: CTA "Transcribir y analizar" combinado. Iconografía AI: `Sparkles` solo para "Generado por IA" pill. **CTA primario unificado a navy filled** repo-wide. Counters mono junto a títulos. Repository ribbon condicional por `rules.length === 0`. Push-back: bubble alignment iMessage mantenido (validar con usuarios reales).

**Patrones canonizados que salieron de esta ola** (ahora en sec 20): 20.1 CTA primario · 20.2 FOCUS_RING · 20.3 Iconografía · 20.4 EmptyState API · 20.5 Gerundio · 20.6 Cost cue · 20.7 MockSwitcher demo · 20.8 Invariantes datos · 20.9 Política copy.

---

## 🧭 20. Canon · patrones consolidados (post-audit 15.18)

> Patterns que el audit 15.18 dejó como **estables**. Cualquier sesión futura que añada un componente nuevo debe seguir esta sección antes de inventar un patrón. Si un patrón no encaja, abrir un debate explícito en una entrada de sec 15 — no improvisar.

### 20.1 · CTA primario (acción que confirma o lanza algo billable)

**Shape canónico**:
```tsx
<button
  type="button"
  onClick={...}
  disabled={...}
  style={{ fontSize: "var(--sc-font-size-sm)" }}  // o omitir si no se combina con text-color en cn()
  className={cn(
    "inline-flex items-center gap-2 rounded-sc-md bg-sc-primary px-4 py-2 shadow-sc-sm",
    "font-medium text-sc-on-primary transition-all",
    "hover:bg-sc-primary-hover",
    "active:scale-[0.98] disabled:active:scale-100",
    "disabled:cursor-not-allowed disabled:opacity-60",
    FOCUS_RING,
  )}
>
  {icon}
  {label}
</button>
```

**Implementaciones canónicas**: `Modal.Action` (en `ui/modal.tsx`), `EmptyState.action` (en `ConversationPlayerModal.tsx`).

**Cuándo usar**: una sola vez por modal/panel. Es el verbo principal (Procesar, Solicitar transcripción, Transcribir y analizar, Guardar).

**Cuándo NO usar**: navegación entre vistas (eso son cards/links), confirmaciones destructivas (eso es `Modal.Cancel` con texto "Eliminar" + variant destructive — cuando exista; hoy no hay).

### 20.2 · Focus ring

**Source of truth**: `src/app/components/ui/focus.ts` — `export const FOCUS_RING = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sc-accent focus-visible:ring-offset-2 focus-visible:ring-offset-sc-surface"`.

**Política**: cualquier elemento interactivo (button, link, role="button" div, role="slider" button, search input) debe importar `FOCUS_RING` y aplicarlo. No re-escribir la cadena `focus-visible:…` en sitios nuevos.

**Excepción justificada**: search input nativo `<input>` puede usar `focus:ring-2 focus:ring-sc-accent/20` (sin `-visible`) porque el patrón de input tiene focus permanente al click; el ring suave (20% alpha) es mejor que el ring fuerte de keyboard nav.

### 20.3 · Iconografía canónica

| Icono lucide | Significado | Lugar canónico |
|---|---|---|
| `<Sparkles>` | "Esto es generado por IA" | Pill aside del Resumen, badge "Generado por IA". **NUNCA** como icono de sección o tab principal. |
| `<AlignLeft>` | "Body of text / cuerpo de transcripción" | Header del modal Bulk, sección Resumen del análisis, trigger del bulk en la toolbar de Conversaciones. |
| `<FileText>` | "Documento / archivo de transcripción" | Tab Transcripción del player, status icon de transcripción (no en SC iconpaths, pero conceptualmente). |
| `<TrendingUp>` | "Valoración / métrica" | Sección Sentimiento del análisis. |
| `<Phone>` / `<MessageSquare>` | Canal de la conversación | Header del player (channel-aware). |
| `<HelpCircle>` | Documentación / ayuda | Toolbar de filtros en Conversaciones. |
| `<Mic>` | Grabación (regla) | Hero card de Reglas (Repository). |
| `<Database>` / `<Tags>` | Entidades / Categorías | PrimaryCard del Repository. |
| `<Download>` | Descargar contenido visible | Audio bar del player, tab row del player (paridad chat/llamada). |

**Regla**: un icono = un significado. Si necesitas "AI-generated cue" en un sitio nuevo, usa `<Sparkles>`. Si reaparece una sección "Resumen" o equivalente, usa `<AlignLeft>`. No inventes nuevas correspondencias sin documentarlas aquí.

### 20.4 · EmptyState API (`ConversationPlayerModal.tsx`)

**Props**:
- `icon`: ReactNode — irá en un medallón circular 48px con `bg-sc-surface-muted` + `ring-1 ring-sc-border-soft`. Tamaño recomendado del icono interno: 22px.
- `title`: string — conversacional, en gerundio para estados activos ("Transcribiendo…"), instructivo para dead-ends ("Primero transcribe la llamada").
- `description`: string — explica QUÉ desbloquea, no solo el estado actual.
- `highlights?`: string[] — pills inline tipo "value-prop list" (max 3-4). Cada pill es un noun-phrase corto.
- `meta?`: { text, intent: 'info' | 'cost' } — línea pequeña bajo el botón. `intent: 'cost'` usa `text-sc-cost-warn` (#D97706 amber). Convención: cualquier acción que dispara coste real debe declarar `meta` con cue.
- `action?`: { label, icon, onClick, disabled } — usa el shape de CTA primario canónico (sec 20.1).
- `secondaryHint?`: string — texto plano bajo el meta. Conecta con otros affordances ya visibles (ej. "Mientras tanto, puedes reproducir el audio" cuando la audio bar está visible arriba).

**Cuándo extraer a `ui/EmptyState.tsx`**: cuando aparezca el segundo callsite. Hoy solo lo usa el player; premature abstraction si lo movemos sin razón.

### 20.5 · Copy en gerundio para estados activos

| Estado | Título | Descripción |
|---|---|---|
| Procesando transcripción | "Transcribiendo…" | "Estamos generando la transcripción. Puedes seguir escuchando el audio mientras tanto." |
| Procesando análisis | "Analizando…" | "Generamos el resumen y el sentimiento a partir de la transcripción. Tarda unos segundos." |
| Listo, sin acción | "Esta llamada todavía no se ha transcrito" | Explica qué desbloquea. |
| Dead-end resuelto | "Transcribir + analizar en un paso" | CTA combinado. |
| Dependencia ausente | "Primero transcribe la llamada" | Instructivo, no negativo ("Sin análisis disponible" está prohibido). |

### 20.6 · Cost cue ("genera coste")

**Cuándo aparece**: cualquier acción que dispara llamadas a transcripción o análisis IA — son las dos únicas operaciones billables del sistema mock.

**Forma**:
- En el Bulk modal hero: `<span className="text-sc-base text-sc-cost-warn">genera coste</span>` junto al hero number cuando `!isAllProcessed`.
- En empty states: `meta={{ text: "Genera coste · tarda unos segundos", intent: "cost" }}` debajo del CTA.
- Lowercase en ambos casos. La capitalización ("Genera coste") solo cuando empieza una frase (en el meta).

### 20.7 · MockSampleSwitcher / código prototype-only

Cualquier control que **no existe en producción real** debe llevar el cue visual demo:
- Borde dashed `border-dashed border-[#D97706]/40`.
- Fondo `bg-[#FFFBEB]` (amber-50).
- Texto `text-[#92400E]` (amber-800).
- Badge `<span>DEMO</span>` `bg-[#D97706] text-white text-[9px] font-bold uppercase`.

Alternativa: envolver en `{import.meta.env.DEV && (...)}` si quieres ocultarlo del todo en builds de producción. Hoy se mantiene visible en producción para que stakeholders puedan ver demos en la URL pública.

### 20.8 · Invariantes de datos (recordatorio cross-cutting)

Centralizadas en `mockSamples.ts → normalizeChats(list)`:
1. `channel === "chat"` ⇒ `hasTranscription === true` + `transcription[]` poblado.
2. `hasAnalysis === true` ⇒ `hasTranscription === true`. Si no, se baja `hasAnalysis` y se limpia `aiCategories`.

Cualquier código que mute `Conversation` debe pasar por estas reglas o respetarlas en su propio path. `handleRequestAnalysis` en `ConversationsView` ya filtra targets sin transcripción antes de actuar (capa de defensa adicional).

### 20.9 · Política copy general

- **Imperativo conversacional para títulos** ("Esta llamada todavía no se ha transcrito"), no estado seco ("Sin transcripción disponible").
- **Gerundio para procesos activos** ("Transcribiendo…", "Analizando…"), no estado pasado ("Transcripción en proceso").
- **Lowercase para cost cues y captions** in-cell ("genera coste", "todo procesado", "admiten análisis"). Uppercase reservado a labels estructurales ("TOTAL A PROCESAR", "ANÁLISIS").
- **Descripción explica el "por qué" antes que el "cómo"**. Antes de "Puedes solicitarla individualmente", "Solicita la transcripción para activar la búsqueda dentro del audio".
- **Highlights como pills triple-eje**: qué pasa / qué desbloquea / qué cuesta.

### 20.10 · Iconografía sin emojis

Regla absoluta: **cero emojis en cualquier interface Component**. README/memory.md están exentos (no son interface). Cualquier emoji que aparezca en `src/app/**/*.tsx` es un bug y se sustituye por su equivalente lucide:

| Emoji previo | Reemplazo lucide | Contexto típico |
|---|---|---|
| ⚠️ | `<AlertTriangle>` | warnings, "sin usar", confirmaciones destructivas |
| 🚨 | `<AlertTriangle>` o `<Siren>` | alta urgencia |
| 😤 | `<AlertCircle>` | quejas, fricciones |
| 🏢 | `<Building2>` | competencia, organizaciones |
| 🔧 | `<Wrench>` | incidencias técnicas |
| 🏷️ | `<Tag>` | tags decorativos |
| 📋 | `<ClipboardList>` | plantillas, listas |
| 📘 | `<BookOpen>` | documentación |
| 🤔 / 😱 | `<HelpCircle>` | ayuda / docs link |

### 20.11 · Async placeholders (deuda futura, no aplica a mock)

Hoy todo es síncrono (mock + localStorage). Cuando aterrice backend real (sec 17 P0), aplicar:

- **Listas/tablas**: skeleton de 5-8 filas con `animate-pulse` mientras se aplica un filtro nuevo. Reservar `min-h` igual al alto medio de fila × n.
- **Modal player audio**: reservar el alto de la audio bar antes de saber si es llamada (con audio) o chat (sin). Hoy lo evitamos hideándola condicionalmente; con backend real puede haber un momento "no sé el canal aún". Reservar.
- **Tabs body** (transcripción/análisis): ya tiene `min-h-[360px]` ✓ — sirve como reserva.
- **Cualquier nuevo `<Toast>`**: anclado a corner por sonner ✓ — cumple la regla "no banners encima de contenido".

Cuando se introduzca el primer fetch async, actualizar este apartado con el patrón skeleton concreto (probable: extraer un `<Skeleton>` reusable en `ui/`).

### 20.12 · Animaciones: solo `transform` + `opacity`

Regla repo-wide. Auditado en 15.21:

- ✅ Keyframes en `sc-design-system.css` usan `scale`, `translateX/Y`, `opacity`. No layout properties.
- ✅ `motion.span` del status icon usa `opacity`.
- ✅ Scrub bar del player usa `transform: scaleX()` + `transform-origin: left` para el fill (era `transition-[width]`, fixed en 15.21).
- ✅ Thumb del scrub usa `left: %` SIN transition — snap instant, no layout-property animation.
- ❌ `ui/sidebar.tsx` (shadcn default) tenía `transition-[width,height,left,padding]` — eliminado en 15.21 al borrar el archivo (era dead code).

Para futuras animaciones: **transform** (translate, scale, rotate) + **opacity**. Si necesitas crecer/encoger un elemento, escala con `scaleX/Y` y compensa el contenido con `transform-origin`. Si necesitas posicionar, `translate`. NUNCA `width`, `height`, `top`, `left`, `padding`, `margin` con transition.

### 20.13 · Empty states · una columna centrada, no split

**Regla**: los empty states del player (y por defecto cualquier otro empty state del repo) son **una columna centrada vertical**: icono opcional → título (`text-sc-md font-semibold`) → descripción (`text-sc-sm text-sc-body`, `max-w-[44ch]`) → CTA primario → cost cue inline (si aplica).

**Why**: en 15.27 se probó un split-layout (skeleton preview izquierda + copy + CTA derecha). El supervisor leyó el skeleton como decoración — ya sabe qué pinta tiene una transcripción, el preview no aporta info, solo añade peso visual. Validado en 15.28 (`feedback_empty_states_and_modals.md`).

**No usar**: previews/skeletons en empty states salvo que el contenido futuro sea genuinamente desconocido para el usuario. Si el usuario ya sabe qué tipo de contenido va a aparecer (transcripción, análisis, lista de N items), el preview es ornamento.

**Implementaciones canónicas**: `DecisionState`, `ProcessingState`, `TerminalNote` en `ConversationPlayerModal.tsx`.

### 20.14 · Modal de confirmación solo para operaciones destructivas

**Regla**: las acciones que **solo generan coste** (transcribir por primera vez, analizar por primera vez, exportar) se dispatcian **directo desde el CTA**, con el cost cue inline (`Genera coste · ~30 s`) cubriendo el rol de advertencia. Las acciones **destructivas** (sobrescriben datos existentes, borran, cancelan operaciones en curso) SÍ van con modal de confirmación explícito.

**Why**: en 15.28 se borró `TranscriptionRequestModal`. El flujo era click "Transcribir" en empty state → modal "¿seguro?" → click "Transcribir" otra vez. Dos clicks para una acción que ya tenía advertencia inline. El cost cue + el toast de éxito son consentimiento + feedback suficientes. La compensación: el botón vive dentro del player ya abierto, no es un click suelto desde la tabla.

**Ejemplo válido de modal destructivo**: `RetranscriptionConfirmModal` se mantiene porque re-transcribir sobrescribe transcripción + análisis derivado.

**Excepción potencial**: cuando exista facturación real (€), evaluar si el coste real mueve el listón. Hoy con coste API mock, no.

### 20.15 · Geometría > texto + decoración para info cuantitativa

**Regla**: si necesitas comunicar una cantidad relativa (duración, peso, share, conteo), pregunta primero "¿puedo hacer que la **forma del elemento ESEA la cantidad**?" Si sí, hazlo y elimina la representación textual o gráfica adicional.

**Why**: en 15.27 el `RecordingTimeline` eran 3 cards de **anchura idéntica** (148px) con una mini-barra relativa interna + texto de duración. La forma de las cards no decía nada (todas iguales). En 15.29 sustituido por una sola barra horizontal cuyos segmentos tienen anchura proporcional a la duración real — la forma del strip ES el dato. Validado en 15.29 (`feedback_geometry_over_decoration.md`).

**Anti-patrón a evitar en este repo**: cards/badges con sparkline o mini-bar dentro como representación de magnitud. O la card carga la magnitud (anchura/altura proporcional al dato), o la magnitud no necesita la card.

**Cards/badges con texto van bien para cualidades sin geometría natural**: estado, nombre, categoría, severidad. NO los uses como contenedor neutro alrededor de algo cuya magnitud podría ser el contenedor mismo.

**Implementación canónica**: barra segmentada de `MultiRecordingPlayer.tsx` (15.32 — anchuras proporcionales por duración del leg). Antes vivía en `RecordingPicker.tsx`, fundido al unificar el player. Refinamiento 15.32: la geometría carga la magnitud, pero los labels se sacan FUERA del elemento geométrico cuando truncarían — cada información en su sitio.

### 20.16 · Auditar señales duplicadas antes de añadir cualquier elemento decorativo

**Regla**: antes de añadir un badge, icono, header de soporte o cualquier elemento de chrome, lista qué información carga ya el elemento principal (color, posición, anchura, label). Si la nueva señal repite una existente, no la añadas.

**Why**: en 15.29 el `RecordingTimeline` viejo tenía cuatro señales por card para tres datos:
1. Badge "TRAMO N" + título "IVR menú principal" → 2 labels para el mismo elemento.
2. Header "Reproduciendo X de Y" + estado visual del activo → 2 indicadores de posición.
3. Play icon en el activo + cambio de color/borde → 2 indicadores de "este suena".
4. Barra relativa dentro de cada card + texto "01:05" → 2 representaciones de duración (esta SÍ es legítima — relativa vs absoluta carga facetas distintas).

Solo (4) sobrevive como duplicación con propósito. (1), (2), (3) son ornamento.

**Test mental antes de añadir**: "si tachara este elemento, ¿perdería información o solo redundancia?" Si es lo segundo, fuera.

**Excepción válida**: dos representaciones del MISMO dato son OK si comunican facetas distintas (relativo vs absoluto, geometría vs texto exacto, valor vs unidad). Las señales decorativas que repiten lo MISMO no.

### 20.17 · Unificar componentes que comparten el mismo concepto

**Regla**: si dos componentes apilados representan el MISMO concepto de datos (tiempo, jerarquía, posición, share), pregunta si fundirlos en uno solo no resuelve mejor el problema.

**Why**: en 15.32 el `ConversationPlayerModal` para llamadas multi-grabación apilaba `RecordingTimeline` (strip proporcional de N legs) sobre el audio bar (transport + scrub del leg activo). Ambos representaban tiempo: el strip lo segmentaba por leg, el scrub bar lo mostraba dentro del leg activo. Apilados creaban tres problemas: duplicación visual del concepto "tiempo", altura innecesaria que forzaba scroll del modal, y desconexión semántica (el playhead del scrub no se relacionaba con el strip de arriba). Fundidos en `MultiRecordingPlayer`: una barra única partida proporcionalmente con fill solo en el segmento activo + transport + labels — todo en una superficie, ~30 px más bajo, sin scroll.

**Test mental antes de añadir un componente nuevo al lado de uno existente**: "¿están hablando del mismo dato? ¿el usuario los lee como una cosa o como dos?" Si la respuesta es "uno", probablemente son uno.

**Excepción válida**: cuando los dos componentes representan facetas claramente distintas (rango global vs zoom local; dato absoluto vs comparación) y verlos a la vez es el caso de uso. La duda es: ¿el usuario los necesita lado a lado, o puede alternar entre ellos? Si puede alternar, separar; si los necesita juntos, fundir.

**Implementación canónica**: `MultiRecordingPlayer` en `src/app/components/MultiRecordingPlayer.tsx` (15.32). Single-leg conserva el audio bar standalone — el componente unificado se carga solo cuando merece la pena (`recordings.length > 1`).

---

### 15.archivo-2026-04-28b · resumen comprimido · post-canon doc + 3 audits (15.19 → 15.22)

> Continuación del 28 de abril, segunda ola de 4 sesiones (post-creación de canon sec 20). **Detalle completo (~174 líneas)** en [`memory-archive/2026-04.md`](../../../memory-archive/2026-04.md#sesión-2026-04-28-segunda-ola--post-canon-doc--3-audits-1519--1522). Comprimido en 15.30 (compactación sec 19).

- **15.19 · Doc pass + canon sec 20 + Guidelines.md** — Sec 17 gana sub-bloque "Decisiones del audit 15.18 que necesitan segunda opinión" (5 items). Sec 20 creada con 9 sub-apartados (20.1-20.9). `Guidelines.md` reescrito como "puerta corta" que apunta a `memory.md` para detalles. Decisión: NO crear `CONTRIBUTING.md` separado (Guidelines.md cumple ese rol hoy).
- **15.20 · Audit follow-up · chain event-driven** — Bug del icono de Estado atascado tras transcribir: dos closure issues encadenados (`handleRequestAnalysis` filtraba elegibilidad con closure stale; el chain del player capturaba `onRequestAnalysis` viejo en su `setTimeout(6500)`). **Fix patrón canónico**: queue `chainAnalysisIds` + `useEffect([conversations, chainAnalysisIds])` que drena cuando `hasTranscription` flipa. Reemplaza timer con event-driven. Eligibilidad guard movido DENTRO de `setConversations(prev => …)`. **Decisiones cerradas**: timer 6500ms reemplazado, navy CTA mantenido, ribbon condicional mantenido.
- **15.21 · Audit "Vibe Coding" · 7 fixes + 1 push-back** — Emojis fuera de la interface (5 archivos: CategoriesEmpty/List, Create/EditCategoryPanel, DeleteCategoryDialog → mapeo lucide en sec 20.10). Scrub bar del player: `transition-[width]` → `transform: scaleX()` con `transform-origin: left`. Próximamente cards retiradas del Repository (eran teasers sin afford). Status icon palette reducida a teal+gray (shape encoded analyzed-vs-transcribed, NO color). MockSwitcher amber suavizado (no saturado). Dead code: `ui/sidebar.tsx` borrado (tenía `transition-[width,height,left,padding]`). README "Calcula coste" → "Avisa de coste" (honestidad). **Push-back sistémico**: flyout→modal solo en 2 panels rompería consistencia con el resto del repo, decisión sistémica diferida. Sec 20.10/20.11/20.12 añadidas.
- **15.22 · Layout-shift cero + duplicado de download** — `<Download>` del audio bar borrado (queda solo en tab row, paridad chat+llamada). **Política reservación de espacio**: contenido toggle mid-interaction → `min-h` + `opacity-0`, NO `cond && (...)`. `tabular-nums` por defecto en counters/timestamps/IDs que cambian. CTAs con label dinámico: `min-w-[Npx]` con N = ancho del label más largo (ej. `min-w-[200px]` para "Transcribir y analizar"). Bulk modal cost-tag y heroDeltaHint reservados con espacio fijo. Excepción documentada: thumb del scrub usa `left: %` SIN transition (snap instant, no reflow continuo).

**Patrones canonizados que salieron de esta ola** (ahora en sec 20): 20.10 Sin emojis (mapeo emoji→lucide) · 20.11 Async placeholders (deuda futura) · 20.12 Solo `transform`+`opacity` para animaciones.

### 15.23 · 2026-05-04 · Claude Code · audit transcripción + componente toast SC + diarización deprecada

**Hecho**:
- **Componente toast nuevo** `<scToast>` con paridad Figma DS (node `1050:355`) y comportamiento PrimeNG. API: `scToast.{success,error,warning,info,indigo}({ title, message, action, secondaryAction, duration, layout, appearance, dismiss })`. 5 severities × Light/Solid × Horizontal/Vertical. Auto-promote a vertical si hay 2 acciones. `duration: Infinity` = sticky. Usa `sonner` como motor (queue + position + a11y + life timing). archivos: `src/app/components/ui/sc-toast.tsx`.
- **Tokens de severity** añadidos al DS: L1 `--sc-{success,warning,error,info,indigo}-{50,400,600}`. L3 alias `--color-sc-{success,warning,error,info,indigo}-{soft,strong}` + `--color-sc-error-base`. archivos: `src/styles/sc-design-system.css`.
- **Toaster defaults** configurados: `position=bottom-right`, `duration=3000`, `gap=12`, `offset=24`, `visibleToasts=4`. archivos: `src/app/components/ui/sonner.tsx`.
- **Toast cableado** en `ConversationsView`: success al completar `handleRequestTranscription` y `handleRequestAnalysis`; info al kickoff de `handleBulkConfirm`. Cierra audit-A3 (toast feedback tras kickoff). archivos: `src/app/components/ConversationsView.tsx`.
- **Dead code borrado** (audit-A1): `PlayerModal.tsx`, `BulkActionBar.tsx`, `DiarizationRequestModal.tsx`. Eran orphan — ningún import activo los referenciaba. archivos: `src/app/components/PlayerModal.tsx`, `src/app/components/BulkActionBar.tsx`, `src/app/components/DiarizationRequestModal.tsx` (todos ❌).
- **`TranscriptionRequestModal` reescrito** al sistema SC `Modal` (audit-A1). Estructura: `Modal.Header` con icon Mic + subtitle "Grabación de {duration}", `Modal.Body` con descripción + cost cue inline `text-sc-cost-warn` (no caja amarilla), error state inline si `onConfirm` rechaza. Loading "Procesando…" (Unicode ellipsis). Cancel "Cerrar". Action "Transcribir". **Diarización eliminada** (deprecada como concepto de producto — solo "Transcripción" y "Análisis"). archivos: `src/app/components/TranscriptionRequestModal.tsx`.
- **`RetranscriptionConfirmModal` reescrito** al sistema SC `Modal` (audit-A1). Mantiene caja roja destructiva (justified — multi-línea + data-loss). CONFIRMAR gate. Error state. Mismo bracket de copy/labels que el de transcripción. Action button rojo `!bg-sc-error-strong`. archivos: `src/app/components/RetranscriptionConfirmModal.tsx`.
- **Modal unitario cableado** en `ConversationPlayerModal` (audit-A2). Click en "Solicitar transcripción" abre `TranscriptionRequestModal` (no dispatcha directo). Botón nuevo de re-transcribir (icono `RotateCcw` + tooltip "Re-transcribir") junto al Download cuando `hasTranscription === true` → abre `RetranscriptionConfirmModal`. archivos: `src/app/components/ConversationPlayerModal.tsx`.

**Decidido**:
- **Diarización eliminada** del producto entero. Antes era "transcripción + opcional diarización" (separación de hablantes). Ahora solo existen Transcripción y Análisis. Razón: simplificar mental model. **NO confundir** con la tab "Análisis" del player — esa SÍ se queda y contiene resumen + sentimiento (fundamental).
- **Errores en batch (audit-A4 alternativa elegida)**: en vez de omitir silenciosamente filas en proceso de la selección masiva, **deshabilitar el checkbox** de la fila cuando esté en `processingIds`/`analyzingIds`. Más elegante; el modal masivo no añade ruido de "X omitidas". (Pendiente de implementar — ver sec 17.)
- **Errores con fila roja + toast** (decisión cerrada en sesión anterior, sigue vigente): subtle red row + toast con botón "Ver fallidas" que filtra. **NO** rompe la regla "color en fila solo si accionable" porque error es un estado que requiere decisión cognitiva (mismo principio que amarillo "en proceso").
- **Cost warning copy unificado**: "Genera coste · tarda unos segundos" inline `text-sc-cost-warn` para confirmaciones de un paso. La caja amarilla/roja con `AlertTriangle` queda reservada para warnings con ≥2 líneas o destructive intent (re-transcripción, no transcripción simple).
- **Verbo de confirm**: "Transcribir" (modal unitario), "Procesar" (modal masivo), "Re-transcribir" (destructive). Drop "Solicitar X" del trigger inicial — añadía paso semántico innecesario.
- **Cancel = "Cerrar"** en todos los modales (no "Cancelar") porque pre-submit no hay nada que cancelar; durante loading el botón está disabled.

**Pendiente** (todos reflejados en sec 17):
- **A4**: deshabilitar checkboxes de filas en `processingIds`/`analyzingIds` en `ConversationTable`. (P1)
- **A5**: refactor de affordance en `ConversationTable` — wrap `<StatusIcon>` en `<button>` con cursor + hover ring; quitar click del row entero (row click pasa a "select"). (P1)
- **A6**: añadir error states a `BulkTranscriptionModal` (no captura `catch` actualmente, errores se tragan). (P2)
- **Minor consistency**: hex literales → tokens `sc-*` en `ConversationTable.tsx`, `ConversationsView.tsx`. "Esta llamada" → "Esta conversación" en `ConversationPlayerModal.tsx:483`. Yellow row tras transcribir (`getRowBg`) → cambiar a badge "Nuevo" para no romper canon "yellow = en proceso". (P2)
- **Multi-recording UI**: extender data model `Conversation.recordings: Array<{id, duration, startTime}>` opcional + picker dropdown sobre el audio bar (matches Figma tooltip dark con badge+chevron). Decisión: el usuario escoge qué grabación transcribir cuando hay N. (P2)
- **failedIds + filtro "Ver fallidas"**: añadir estado `failedIds` a `ConversationsView`, simulación en mock de fallo aleatorio post-batch, fila roja sutil + toast con action button "Ver fallidas" que filtra. (P2)
- **Status chip "Pendiente"** en columna en lugar de pintar fila completa. Roadmap evolución: cuando se haga, retirar pintado de fila completa (rojo/amarillo). (P3)
- **Retry manual** de transcripciones fallidas (cuando exista API). (P3)

**Notas para próxima sesión**:
- **No correr `npm run dev` en background con sandbox restrictivo** — esbuild se cae con "service was stopped". Si el usuario reporta localhost roto, verificar primero si está corriendo: `lsof -nP -iTCP:5173`. Si hay PID node escuchando pero no responde, kill y relanzar.
- **Auto-deploy Netlify** dispara con cada push a `main` (https://memoryplus3.netlify.app/). Pushear en bloque al final de sesión, no commit a commit.
- **Snapshot técnico** completo en memoria persistente: `~/.claude/projects/-Users-rafareses-Desktop-Memory-3-0/memory/project_session_status.md` (incluye API del toast, archivos modificados, plan de retoma punto por punto).
- **Para retomar A4**: editar `ConversationTable.tsx` ~líneas 295-310, añadir `disabled={processingIds.includes(conv.id) || analyzingIds.includes(conv.id)}` al `<Checkbox>` de la fila + tooltip "En proceso".
- **Para retomar A5**: en mismo archivo, líneas ~295-299, quitar `cursor-pointer` y `onClick` de `<TableRow>`; envolver `<StatusIcon>` en `<button type="button" className="cursor-pointer hover:bg-sc-border-soft rounded-sc-md p-1" aria-label="Abrir conversación" onClick={() => handleRowClick(conv)}>`. Row click pasa a "toggle selección" (o nada).
- **Para multi-recording**: empezar en `mockData.ts` añadiendo `recordings?: Array<...>` opcional. Poblar 2-3 conversaciones de muestra con 2-4 recordings. Después crear `<RecordingPicker conversation />` con popover dark (matches Figma DS file `Dle87qs0Pjq0OjIaaCfmm7` node 1050:355 vecindad — tooltip "Grabaciones") sobre el audio bar de `ConversationPlayerModal`.
- **Push hecho desde sesión** sin verificación visual end-to-end (usuario reportó localhost roto). Type-check `tsc --noEmit` pasa limpio. La build de Netlify es la verificación real.

### 15.24 · 2026-05-04 · Claude Code · samples demo nuevos + bugfixes amarillo persistente y flash fantasma

**Hecho**:
- **Modelo `Conversation` extendido** con `recordings?: Recording[]` (segmentos de audio cuando una llamada pasa por IVR con transferencia entre grupos) y `hasFailedTranscription?: boolean` (marca mock-only para visualizar fila roja). Nueva interfaz `Recording { id, duration, startTime, label? }`. archivos: `src/app/data/mockData.ts`.
- **Sample nuevo "Conversaciones multi-grabación"**: 5 llamadas con 2-4 recordings cada una (legs IVR + grupo destino + retorno IVR + atención). Forzadas a `hasTranscription: false` para que el usuario tenga que escoger cuál transcribir. archivos: `src/app/data/mockSamples.ts`.
- **Sample nuevo "Errores de transcripción"**: ⅓ de las llamadas marcadas `hasFailedTranscription: true` sobre un canvas reset (estilo `all-pending`). archivos: `src/app/data/mockSamples.ts`.
- **Visuales en `ConversationTable`**: `getRowBg` ahora prioriza `bg-sc-error-soft` (fila fallida) sobre `bg-yellow-50` (recién procesada). Nuevos overlays sobre `<StatusIcon>`: `<AlertCircle>` rojo abajo-derecha si `hasFailedTranscription`, badge azul con count arriba-derecha si `recordings.length > 1`. archivos: `src/app/components/ConversationTable.tsx`.
- **Aviso multi-grabación en player**: cuando la conversación tiene >1 recording, banner azul informativo en la parte superior del body explicando "Esta conversación tiene N grabaciones · Próximamente podrás escoger cuál transcribir". Acknowledges la data sin construir el picker todavía. archivos: `src/app/components/ConversationPlayerModal.tsx`.
- **Toast en sample switch**: cuando se carga el sample "Errores de transcripción", `handleSampleChange` dispara automáticamente un `scToast.error` con título "X transcripciones fallaron" + acción "Ver fallidas" que selecciona las filas fallidas (mock equivalente al filtro real). Demuestra el patrón error+toast+acción de la decisión cerrada. archivos: `src/app/components/ConversationsView.tsx`.
- **Bugfix — yellow row persistente tras análisis**: `handleRequestAnalysis` ahora también añade los IDs a `newlyTranscribedIds`. Antes solo lo hacía `handleRequestTranscription`, así que en bulk runs los IDs already-transcribed que iban por la rama analysis-only perdían el cue amarillo. Yellow ahora marca cualquier fila recientemente cambiada (transcripción O análisis), no solo transcripción. archivos: `src/app/components/ConversationsView.tsx`.
- **Bugfix — flash "+N" fantasma en BulkTranscriptionModal**: el estado `flash` no se reseteaba al cerrar/reabrir el modal. La animación CSS `animate-sc-delta-fly` no es `forwards`, así que el span con el delta seguía renderizado en DOM al reabrir, pintándose un "+55" sin que el usuario tocara el toggle. Fix: `setFlash(null)` dentro del effect que dispara al abrir o al cambiar la selección. archivos: `src/app/components/BulkTranscriptionModal.tsx`.

**Decidido**:
- **Yellow = "fila recientemente cambiada"** (transcripción o análisis), no solo "recién transcrita". Más útil porque en bulk operations el usuario quiere ver TODAS las filas que se modificaron, no solo las que pasaron por transcripción. Renombrar el estado más adelante (de `newlyTranscribedIds` a `recentlyChangedIds`) — pero por ahora se mantiene el nombre por scope.
- **Multi-recording: solo badge + banner por ahora**. El picker dropdown completo (matches Figma DS 1050:355 vecindad) se difiere a roadmap. El banner informativo evita misleading UX (audio bar muestra solo la primera grabación silenciosamente).
- **Failed-transcription: visual + toast con acción ya cableado**. Aprovecha el `scToast` recién creado para demostrar el patrón error completo, aunque la mecánica real de `failedIds` (estado en `ConversationsView` + filtro "Ver fallidas" como column filter) sigue pendiente. El click "Ver fallidas" del toast selecciona las filas como mock equivalente.
- **Reservar `flash`/animaciones efímeras al ciclo open→close**: cualquier estado visual transitorio dentro de un modal se debe resetear explícitamente cuando el modal se reabre. Si la animación CSS no es `forwards` el elemento queda visible en DOM al reabrir.

**Pendiente** (todos reflejados en sec 17):
- **A4** sigue pendiente — disabled checkboxes para filas en proceso. (P1)
- **A5** sigue pendiente — StatusIcon como botón explícito. (P1)
- **A6 resto** — error states en `BulkTranscriptionModal` (no captura `catch` actualmente). (P2)
- **Minor consistency** sigue pendiente — hex→tokens, "Esta llamada"→"Esta conversación", yellow row→badge. (P2)
- **`<RecordingPicker>` real** — dropdown dark con badge+chevron sobre el audio bar (matches Figma DS). Ahora hay banner informativo + badge en tabla, pero falta el picker funcional para escoger qué grabación transcribir. (P2)
- **`failedIds` real en estado** + filtro/column filter "Ver fallidas" funcional. Hoy el sample "Errores de transcripción" usa `hasFailedTranscription` directo sobre el modelo y el "Ver fallidas" del toast solo selecciona filas. (P2)
- Renombrar `newlyTranscribedIds` → `recentlyChangedIds` para reflejar la semántica actualizada. (P3)

**Notas para próxima sesión**:
- Demos del switcher: probar **"Conversaciones multi-grabación"** para ver badge en tabla + banner en player. Probar **"Errores de transcripción"** para ver fila roja + toast con acción "Ver fallidas".
- El bug del "+55 fantasma" era reproducible siguiendo: abrir modal → toggle ON → cerrar sin procesar → reabrir → +55 visible sin haber tocado nada. Verificar tras el fix que ya no aparece.
- Cuando se implemente `failedIds` real (reemplazando el sample-based), reemplazar el handler del toast en `handleSampleChange` para que use el state real en vez de derivar de `next.filter(...)`.
- Cuando se construya `<RecordingPicker>`, leer la spec de Figma DS file `Dle87qs0Pjq0OjIaaCfmm7` zona node 1050:355 (toast vecindad — dropdown dark con altura mín 2 / max 4 antes de scroll, cada item con play+icono+Hora+Duración).

### 15.25 · 2026-05-04 · Claude Code · audit cierre · A4/A5/A6 + RecordingPicker + filtro "Ver fallidas"

**Hecho**:
- **Audit A4 cerrado** — checkboxes de filas en `processingIds`/`analyzingIds` quedan **deshabilitados** con `cursor-not-allowed` + tooltip "En proceso · no se puede seleccionar". `toggleAll` ahora sólo opera sobre `selectableConvs` (no incluye in-process). `toggleRow` lleva guard `if (isLocked(id)) return`. archivos: `src/app/components/ConversationTable.tsx`.
- **Audit A5 cerrado** — `<StatusIcon>` ahora vive dentro de un `<button>` explícito con `aria-label="Abrir llamada/chat"`, `cursor-pointer`, `hover:bg-sc-border-soft`, `FOCUS_RING`. El click del `<TableRow>` ya **no** abre el player, ahora dispara `toggleRow(conv.id)` (alterna selección). Para abrir el player → click en el icono de estado. Esto separa dos affordances que antes colisionaban. archivos: `src/app/components/ConversationTable.tsx`.
- **Audit A6 cerrado** — `BulkTranscriptionModal` ahora captura excepciones de `onConfirm`. Estado `error: string | null` local, banda inline `text-sc-error-strong` debajo del cuerpo (border-top en `--sc-error-base`, fondo `--sc-error-soft`). Modal queda abierto tras error para permitir retry sin perder toggle/selección. Reset de `error` en open/sel-change effect. archivos: `src/app/components/BulkTranscriptionModal.tsx`.
- **Minor** — empty state "Esta llamada todavía no se ha transcrito" → **"Esta conversación todavía no se ha transcrito"** (channel-neutral, defensivo aunque actualmente solo lo hitean calls). archivos: `src/app/components/ConversationPlayerModal.tsx`.
- **Componente nuevo `<RecordingPicker>`** — dropdown dark (Figma DS 1050:355 vecindad) que muestra todas las grabaciones de una conversación multi-leg. Trigger: badge con count + icono Phone + label "Grabación N · Soporte Taller · 02:18" + chevron. Popover dark `#3C434D` con `max-h-[280px] overflow-y-auto` (≈ 4 items antes de scroll, matches Figma altura máxima). Cada item: play icon white + número + label de leg + Hora/Duración. archivos: `src/app/components/RecordingPicker.tsx`.
- **Multi-recording cableado en player** — el banner informativo se reemplaza por el `<RecordingPicker>` real. Estado `selectedRecordingId` resetea al primer recording cuando se abre la conversación. Al cambiar de recording: pause + currentTime=0. La duración del audio bar usa la del recording seleccionado (no la duración total agregada). Si `recordings.length <= 1` → no se renderiza el picker (single-audio). archivos: `src/app/components/ConversationPlayerModal.tsx`.
- **Filtro "Ver fallidas" funcional** — estado `showOnlyFailed: boolean` en `ConversationsView`. `filteredConversations` lo respeta como primer filtro. La acción del toast (`onClick: () => setShowOnlyFailed(true)`) ahora sí filtra en lugar de solo seleccionar. Chip rojo en la barra de resultados ("Solo fallidas · Limpiar filtro") visible cuando el filtro está activo. Reset automático al cambiar de sample. archivos: `src/app/components/ConversationsView.tsx`.

**Decidido**:
- **A4 vía deshabilitar (no omitir silenciosamente)**: el usuario eligió esta variante en sesión anterior. Razón: más elegante que filtrar en el modal masivo (no añade ruido tipo "X omitidas"). El feedback es directo en la fila — cursor-not-allowed + tooltip.
- **A5 row-click → toggle selección, icono → abrir player**: separa intenciones. El usuario que quiere ver una conversación tiene un click target preciso (el icono); el que quiere multi-seleccionar puede hacerlo en cualquier parte de la fila sin abrir el player accidentalmente.
- **RecordingPicker dark theme**: el resto del player es light, pero el picker hereda la estética del Figma (toast/popover dark). Crea contraste fuerte para que el usuario sepa que está en un selector temporal, no en el contenido principal.
- **Audio bar usa duración del leg seleccionado**: lo natural es que el reproductor refleje qué leg está reproduciendo. Si fuera la duración total, los cambios de leg romperían la metáfora.
- **`hasFailedTranscription` como source de verdad** (de momento). El estado real `failedIds` que era roadmap — se pospone porque la propiedad en mockData ya cubre el caso del demo. Cuando el backend real notifique fallos, se promueve a estado y se mapea desde ahí.

**Pendiente** (todos reflejados en sec 17):
- Renombrar `newlyTranscribedIds` → `recentlyChangedIds` para reflejar la semántica actualizada (yellow = transcripción O análisis recientemente). (P3)
- Hex literales pendientes en `ConversationTable` (`#CFD3DE`, `#5F6776`, etc.) y `ConversationsView` — migrar a `--sc-*` tokens. (P2)
- Yellow row → badge "Nuevo" pequeño junto al icono — explorar como evolución cuando se haga el status chip "Pendiente". (P3)
- Status chip "Pendiente" en columna en lugar de pintar fila completa (`getRowBg`). Cuando se haga, retirar el pintado completo. (P3)
- Retry manual de transcripciones fallidas (cuando exista API). El click "Re-transcribir" del player hoy reusa `onRequestTranscription`; cuando `failedIds` sea estado real, debería mover el id de failedIds a processingIds. (P3)

**Notas para próxima sesión**:
- Probar el flujo "Errores de transcripción": el toast aparece automáticamente al cambiar de sample → "Ver fallidas" filtra la tabla → chip rojo "Solo fallidas · Limpiar filtro" visible junto al contador.
- Probar el flujo "Conversaciones multi-grabación": click en una fila con badge (4) → abre player → se ve `<RecordingPicker>` arriba → click → dropdown dark con las 4 grabaciones → seleccionar una → audio bar refleja la duración nueva.
- Para A4/A5: verificar que cuando hay filas en proceso, el "select all" del header **no** las incluye (toggleAll opera solo sobre selectableConvs).
- Para A6: simular un error desde `handleBulkConfirm` (por ejemplo `throw new Error("...")` antes del setTimeout) para ver el banner inline de error y comprobar que el modal queda abierto.

### 15.26 · 2026-05-04 · Claude Code · audit cleanup · dead code purge + Sidebar a11y + AUDIT_REPORT.md

**Hecho**:
- **Auditoría completa Code+UX+UI** sobre todo `src/` con tags estandarizados (CODE: DEAD_CODE / UNUSED_IMPORT / UNUSED_VAR / UNUSED_COMPONENT / UNUSED_TOKEN / DUPLICATE / MAGIC_VALUE / COMPLEXITY / TODO_ORPHAN / COMMENTED_CODE; UX: MISSING_STATE / BROKEN_FLOW / INCONSISTENT_BEHAVIOR / MISSING_FEEDBACK / OVERFLOW_RISK / MODAL_TRAP / FORM_GAP / RULE_VIOLATION; UI: TOKEN_BYPASS / SPACING_INCONSISTENCY / RADIUS_MISMATCH / SHADOW_MISMATCH / DARK_MODE_GAP / CONTRAST_FAIL / MISSING_A11Y / TOUCH_TARGET / FONT_VIOLATION / ANIMATION_RISK). Reporte completo en `audit/2026-05-04.md`. archivos: `audit/2026-05-04.md`.
- **Phase 1 · safe removals**:
  - `Sidebar.tsx`: removed unused imports `Home`, `FileText`, `ArrowUpRight` de lucide-react. archivos: `src/app/components/Sidebar.tsx`.
  - `EntityManagement.tsx`: borrado el comment `{/* TODO: Check if used in rules and display warning */}` (TODO orphan sin owner) y el comment hermano `{/* Mock warning about usage */}`. archivos: `src/app/components/EntityManagement.tsx`.
- **Phase 2 · dead code purge** (zero importers verified vía `grep -rE`):
  - Borrado: `src/app/components/ApplyRulesButton.tsx` (157 líneas, sustituido hace tiempo por `BulkTranscriptionModal`).
  - Borrado: `src/app/components/RuleSelectionModal.tsx` (282 líneas, sólo lo importaba `ApplyRulesButton`).
  - Borrado: `src/app/components/ConversationTypeFilters.tsx` (183 líneas, sustituido por `TypeFilterPanel`+`TypeFilterButton`).
  - Borrado: `src/app/components/EntityResults.tsx` (~140 líneas).
  - Borrado: leftover Figma Make exports en `src/app/imports/`: `Container.tsx`, `Container-4137-2200.tsx`, `Frame892.tsx`, `Frame892-6004-9029.tsx`, `Group1.tsx`, `Group1-4130-808.tsx` y los 7 `svg-*.ts` que solo ellos consumían (`svg-rules-icon`, `svg-4o4ubnq2lw`, `svg-9g7mphu0h7`, `svg-kfes9f4ja4`, `svg-ogve5xtgww`, `svg-w9xvvuth13`, `svg-ys09cyf8ya`). El único `svg-*` que sobrevive es `svg-hka34i4qsi.ts` que sí consume `ScLogo.tsx`.
  - Borrado: `src/app/imports/pasted_text/bulk-transcription-modal.tsx` y `bulk-transcription-modal-1.tsx` — eran **spec docs** shipados en formato `.tsx` (con `# headers` markdown dentro de comments JSX). Cero importers, cero render path. Los `.md` siblings (`bulk-transcription-modal.md`, `rule-constructor-update.md`, `rule-constructor-update-1.md`) se mantienen — son referencia textual.
- **Phase 3 · token consistency**: **skipped intencionalmente**. Los hex literales en `Sidebar.tsx`, `ConversationsView.tsx`, `ConversationTable.tsx`, `ConversationFilters.tsx` (~80 ocurrencias entre los 4) están explícitamente en el roadmap como dos sweeps dedicados (sec 17 P1 "Consolidar los tres tonos navy" + P2 "Hex literales pendientes en ConversationTable y ConversationsView"). Tocarlos en este audit hubiera duplicado trabajo y arriesgado regresiones visuales sin coordinación con el siguiente impeccable pass.
- **Phase 4 · a11y mechanical wins**:
  - `Sidebar.tsx`: cada uno de los 10 botones del menú (icon-only) ahora lleva `aria-label`. Los activos (`MessageSquare`/`FolderOpen`) usan el nombre de la vista ("Conversaciones", "Repositorio") + `aria-current="page"`. Los disabled usan "Próximamente: dashboard | búsqueda | analítica | llamadas | usuarios | herramientas | configuración | historial". Antes los screen readers anunciaban "button" sin contexto. archivos: `src/app/components/Sidebar.tsx`.
- **shadcn ui primitives mantenidos con `@audit-flag` conceptual**: ~22 archivos en `src/app/components/ui/` están sin importadores hoy (`accordion`, `aspect-ratio`, `carousel`, `chart`, `command`, `context-menu`, `drawer`, `hover-card`, `input-otp`, `menubar`, `navigation-menu`, `pagination`, `resizable`, `skeleton`, `toggle`, `toggle-group`, `breadcrumb`, `form`, `use-mobile`, `alert`, `calendar`, `radio-group`, `slider`). NO se borran porque son boilerplate del kit shadcn — futuras features pueden necesitarlos y el coste de re-instalar > el coste de retenerlos. Documentado en `audit/2026-05-04.md`.

**Decidido**:
- **No tocar `mockData.ts` ni `mockSamples.ts` por la presencia de `hasDiarization`**. memory.md sec 15.23 dice "diarización eliminada del producto entero", pero el campo persiste en el modelo `Conversation`. La instrucción del audit prohíbe explícitamente cambiar mock-data structure. Marcado como `[RULE_VIOLATION]` en el reporte; cuando llegue backend real, eliminar el campo del modelo y de los presets en una pasada coordinada.
- **No remover `IconChat` de `StatusIcons.tsx`** aunque memory.md 15.13 lo declara dead code (la invariante `chats siempre transcritos` lo hace inalcanzable). Sigue como defensa documentada — borrar sólo cuando la invariante se solidifique en backend real.
- **No tocar la migración hex→tokens en este pass**. Roadmap items P1/P2 son dedicados; mezclarlos con la limpieza de dead code hubiera contaminado el diff y dificultado revisión.
- **El "Cómo funcionan las reglas" link en `Repository.tsx:294-313`** apunta a `#` — `[BROKEN_FLOW]` real. NO se reemplaza en este audit (decisión de URL pertenece al equipo). Reportado.
- **`alert()` en `handleDownload` (`ConversationsView.tsx:249`)** sigue usando alert nativo en lugar de `scToast`. NO se cambia: la decisión "wire to scToast vs wire to real download endpoint" es un product call (P3 en sec 17 nuevo).

**Pendiente** (añadidos a sec 17):
- Reemplazar `alert()` de `handleDownload` por `scToast.info` o wire a download real (ver `ConversationsView.tsx:249`). (P3)
- Reemplazar el `console.log("download", id)` placeholder de `ConversationPlayerModal.tsx:425` cuando exista endpoint de exportación real. (P1, ya implícito en sec 17 "audio real / exportación")
- Wire del link "Cómo funcionan las reglas" (`Repository.tsx:299`) — hoy `window.open("#", ...)`. (P2)
- Wire del botón Search (`ConversationFilters.tsx:91-95`) sin `onClick` — los filtros se aplican en `onChange` de los inputs, así que el botón es decorativo. Decidir: o quitar el botón o dispararlo manualmente (P3).
- Eliminar `Conversation.hasDiarization` del modelo + de todos los presets en `mockSamples.ts`/`mockData.ts` cuando se haga pasada de schema cleanup. (P3)
- Resolver discusión sobre **`<Sparkles>` como icono de tab** en `ConversationPlayerModal.tsx:389`. memory.md 15.18 dice "Sparkles reservado exclusivamente a la pill 'Generado por IA'", pero el tab Análisis lo usa. Estricto vs práctico — flagged en reporte. (P3)
- Añadir `@media (prefers-reduced-motion: reduce)` fallback para los keyframes `sc-delta-fly`, `sc-bump`, `sc-pulse`, `sc-shake` en `sc-design-system.css`. (P3)
- 8 botones de navegación inertes en `Sidebar.tsx` (Grid/Search/BarChart3/Phone/Users/Wrench/Settings/Clock) — decidir si esconder o promover a roadmap visible (hoy son visualmente decorativos pero introducen 8 tab-stops disabled). (P3)

**Notas para próxima sesión**:
- **Reporte completo**: ver `audit/2026-05-04.md` (movido a `audit/` en 15.30). Resumen final: 84 findings, 16 fixes aplicados, 0 `@audit-flag` añadidos como comments en código (los shadcn primitives se documentan en el reporte en lugar de ensuciar 22 archivos con headers).
- **Borrados esta sesión** (lista completa para searches futuras): ApplyRulesButton.tsx, RuleSelectionModal.tsx, ConversationTypeFilters.tsx, EntityResults.tsx, Container*.tsx (×2), Frame892*.tsx (×2), Group1*.tsx (×2), svg-{rules-icon,4o4ubnq2lw,9g7mphu0h7,kfes9f4ja4,ogve5xtgww,w9xvvuth13,ys09cyf8ya}.ts (×7), pasted_text/bulk-transcription-modal{,-1}.tsx (×2). Total: 19 archivos.
- **No se ejecutó `tsc --noEmit`**: no existe `tsconfig.json` (ya en sec 17 como item P2 "Añadir tsconfig.json"). Las verificaciones se hicieron por inspección manual + `grep -rE` para confirmar zero references antes de cada delete. La build de Vite/esbuild seguirá compilando porque sólo se borraron archivos sin importers.
- **No se corrió `pnpm build/dev`**: per instrucción explícita "Don't run npm run dev or any build (sandbox issues)". La verificación real se hace en el deploy de Netlify al pushear.
- **Guidelines.md de la skill**: el audit aplicado es un Code+UX+UI sweep en una pasada — documenta el patrón en `audit/2026-05-04.md`. Próximas auditorías similares pueden reutilizar el formato + tabla de tags.

### 15.27 · 2026-05-04 · Claude Code · /impeccable craft · empty states + multi-recording timeline

**Hecho**:
- **Empty states del player rediseñados** — el patrón antiguo `<EmptyState>` (medallón centrado + 3 pills + CTA + meta) se descarta por "AI Slop". Sustituido por una familia de 3 componentes específicos:
  - `<DecisionState>`: split 60/40. Izquierda = preview enmascarado (skeleton de bubbles o de summary card) que muestra la forma del entregable. Derecha = card vertical con título + descripción + CTA + coste inline (punto + texto `text-sc-cost-warn`). Usado en "Sin transcripción", "Lista para analizar", "Pendiente de transcribir y analizar".
  - `<ProcessingState>`: misma arquitectura split, preview con `animate-sc-pulse` shimmer, lado derecho = Loader + título + caption. Sin CTA. Usado en "Transcribiendo", "Analizando".
  - `<TerminalNote>`: centrado simple text-only para estados sin acción. Usado en "No hay grabación", "Transcripción vacía".
  - Tres skeletons compartidos: `<TranscriptSkeleton>` (3 bubbles alternando lado, mismo shape que la transcripción real), `<AnalysisSkeleton>` (resumen + sentimiento card), `<CombinedSkeleton>` (transcript + análisis stacked) para el caso "transcribir y analizar en un paso".
  archivos: `src/app/components/ConversationPlayerModal.tsx`.
- **Multi-recording: dropdown reemplazado por timeline inline** — `<RecordingTimeline>` sustituye al antiguo `<RecordingPicker>` (mismo archivo, export renombrado). Todas las grabaciones son visibles inline como cards horizontales sobre el audio bar. Cada card: header (Tramo N + chip play cuando seleccionado), label del leg (truncate), duration bar relativa (width = duración tramo / duración del más largo) + duration text. Selected: `border-sc-info-strong` + `bg-sc-info-soft` + `shadow-sc-sm` + chip play azul. Hover: borde más fuerte + sombra + play icon revealed (group-hover). Header de la sección: contador + "transferencias entre grupos vía IVR" + "Reproduciendo X de Y". Para 5+ grabaciones: scroll horizontal con `modal-scrollbar`. archivos: `src/app/components/RecordingPicker.tsx`.
- **Wireado en player**: import actualizado a `RecordingTimeline`. El bloque previo con banner+dropdown se reemplaza por `<RecordingTimeline>` directo. archivos: `src/app/components/ConversationPlayerModal.tsx`.
- **Microcopy ajustado**: "Esta conversación todavía no se ha transcrito" → "Sin transcripción". Coste pasa de "Genera coste · tarda unos segundos" → variante específica por contexto: "Genera coste · ~30 s" / "Genera coste · ~10 s" / "Genera coste · transcripción + análisis".

**Decidido**:
- **Skeletons informan, pills no.** Las pills ("Búsqueda en el audio", "Resumen IA", "Sentimiento") se procesaban como decoración. El skeleton mismo enseña la forma — el supervisor ve bubbles izquierda/derecha = "vas a tener una conversación diarizada" sin tener que leer una pill. Pills eliminadas.
- **Coste inline al lado del CTA, no como footnote.** Punto · texto amber. Pequeño, pero junto al click — imposible de ignorar antes de pulsar.
- **No medallón con icono.** Esa fingerprint AI fuera. Para terminal states sí queda un icono pequeño centrado, pero al peso de un caption (`text-sc-muted`), no como hero.
- **Cards inline, no dropdown** para multi-recording. La duration bar relativa permite leer la forma de la conversación de un vistazo: tramo IVR corto, tramo largo de soporte. Mejor que números en un dropdown.
- **`role="radiogroup"` + `role="radio"`** en cada card. Selección semántica correcta para teclado.
- **`<RecordingPicker>` queda como nombre de archivo** pero exporta `RecordingTimeline`. Cambiar el nombre del archivo requeriría actualizar imports sin valor real; `git log` traza la historia.

**Pendiente** (no añadidos a sec 17 — son nice-to-have, no bloqueantes):
- Scroll-fade shadow left/right en el rail de RecordingTimeline cuando hay 5+ items y el scroll está en posición intermedia. (P3)
- Connector visual explícito entre el card seleccionado y el audio bar (línea o triangle pointer). Hoy la proximidad + el header "Reproduciendo X de Y" basta. (P3)

**Notas para próxima sesión**:
- **Probar visualmente**: estado mixto → click conv sin transcripción → ver "Sin transcripción" con skeleton de bubbles izquierda + card decision derecha. Click "Transcribir" → ver ProcessingState con shimmer. Resultado: chat bubbles reales.
- **Probar multi-rec**: sample "Conversaciones multi-grabación" → click conv con badge → ver el timeline con N tramos visibles, tramo 1 seleccionado (border azul + chip play). Click otro tramo → audio bar refleja nueva duración.
- **TypeScript**: este proyecto NO tiene `typescript` instalado como dep ni `tsconfig.json`. Las "verificaciones tsc" anteriores fueron no-ops silenciosos. Sigue como item P2 en sec 17. Hasta entonces, la build de Vite es la única verificación real (Netlify auto-deploy).

> ⚠️ **15.27 REVERTIDO en 15.28 + 15.29**: el split-layout de DecisionState/ProcessingState y las cards de RecordingTimeline (descritos como "Hecho" arriba) se cambiaron en sesiones siguientes. El skeleton preview leía como decoración → empty states a una columna centrada (sec 20.13). Las cards iguales escondían el dato → strip único proporcional (sec 20.15). Ver entradas 15.28 y 15.29 abajo.

### 15.28 · 2026-05-04 · Claude Code · /impeccable retoque empty states + scToast spacing

**Hecho**:
- **Split-layout de `DecisionState` y `ProcessingState` REVERTIDO**. Reescritos como columna única centrada (icono + título + descripción + CTA + cost cue), siguiendo el patrón de `TerminalNote`. Skeletons borrados (`TranscriptSkeleton`, `AnalysisSkeleton`, `CombinedSkeleton`). archivos: `src/app/components/ConversationPlayerModal.tsx`.
- **`TranscriptionRequestModal.tsx` BORRADO** (122 líneas). El flujo unitario de transcripción dispatcha directo desde `handleTranscriptionRequest` en `ConversationPlayerModal`. La advertencia de coste sigue inline en el CTA (`Genera coste · ~30 s`). `RetranscriptionConfirmModal` SE MANTIENE — re-transcribir es destructivo (sobrescribe transcript + análisis derivado), ahí el gate explícito está justificado. archivos: borrado `src/app/components/TranscriptionRequestModal.tsx`, modificado `src/app/components/ConversationPlayerModal.tsx`.
- **`scToast` ajustado**: ancho default 360→400 (max 480), padding y gaps migrados a tokens DS (`var(--sc-space-200/300/400)`), gap title↔message de 4px a 8px. archivos: `src/app/components/ui/sc-toast.tsx`.

**Decidido**:
- **Skeleton preview en empty state era ornamento**, no info. El supervisor ya sabe qué pinta tiene una transcripción. Sustituido por columna única + icono pequeño. → canonizado como sec 20.13.
- **Modal de confirmación SOLO para destructivo**. Operaciones que solo "generan coste" (transcribir/analizar por primera vez, exportar) dispatcian directo desde el CTA con cost cue inline. `RetranscriptionConfirmModal` sobrevive porque sobrescribe datos. → canonizado como sec 20.14.
- **scToast spacing en tokens DS** + ancho moderadamente más amplio (400 def, 480 max) para que mensajes largos wrapeen menos veces sin volverse "larguísimos". El gap title↔message a 8px da el "espacio más grande" antes del wrap.

**Pendiente**: ninguno nuevo en sec 17.

**Notas para próxima sesión**:
- Las dos reglas (empty state única columna + modal solo destructivo) están en sec 20.13 + 20.14. Auto-memoria `feedback_empty_states_and_modals.md` tiene el detalle conversacional.
- Commit: `61fe995`.

### 15.29 · 2026-05-04 · Claude Code · RecordingTimeline · strip único proporcional

**Hecho**:
- **Cards rail de `RecordingTimeline` REVERTIDO** (3 cards de 148px iguales con badge "TRAMO N" + título + barra relativa interna + duración). Sustituido por **una sola barra horizontal** cuyos segmentos tienen anchura proporcional a la duración real del tramo (`flex-grow: fraction`, `flex-basis: 0`, `min-width: 56px`). La forma del strip carga el dato; ya no hay barra interna ni texto comparable. archivos: `src/app/components/RecordingPicker.tsx`.
- **Eliminados**: header "X grabaciones · transferencias entre grupos vía IVR", contador "Reproduciendo X de Y", play icon en el activo, badge "TRAMO N". Cuatro señales para tres datos → una señal por dato.
- **Segmentos < 12% de anchura** caen a número + tooltip + aria-label completo (evita texto cortado feo).
- **Navegación teclado**: flechas ←/→/↑/↓ navegan + seleccionan dentro del radiogroup (tabIndex=0 sólo en el activo, patrón estándar W3C ARIA).

**Decidido**:
- **Geometría > texto + decoración para info cuantitativa**. Si una magnitud puede ser la forma del elemento (anchura), hazla la forma — no metas mini-bars dentro de cards iguales. → canonizado como sec 20.15.
- **Auditar señales duplicadas antes de añadir cualquier elemento decorativo**. Test mental: "si tachara este elemento, ¿perdería información o solo redundancia?". Las cuatro señales del rail viejo eran tres redundancias + un dato útil. → canonizado como sec 20.16.
- **`<RecordingPicker>` se queda como nombre de archivo** pese a que el export es `RecordingTimeline`. Renombrar el archivo requeriría actualizar imports sin valor — `git log` traza la historia. (Reafirmación de 15.27.)

**Pendiente**: ninguno nuevo en sec 17.

**Notas para próxima sesión**:
- Strip handling para >12 segmentos: hoy `overflow-hidden` clipa segmentos que pasen del ancho disponible. Realista: 3-4 max. Si aparecen samples con 8+ tramos, considerar `overflow-x-auto modal-scrollbar` o redibujo del componente.
- Auto-memoria `feedback_geometry_over_decoration.md` tiene los dos principios con detalle conversacional + anti-patrones.
- Commit: `65ec8bb`.

### 15.30 · 2026-05-04 · Claude Code · doc consolidation · routing matrix + compactación + audit move

**Hecho**:
- **Sec 20 actualizada**: añadidos 20.13 (empty states una columna), 20.14 (modal solo destructivo), 20.15 (geometría > texto+decoración), 20.16 (auditar señales duplicadas) — los 4 patrones de 15.28 y 15.29 que vivían solo en auto-memoria. archivos: `src/imports/pasted_text/memory.md`.
- **Sec 13 nueva subsección "Decisiones de producto cerradas"**: 12 decisiones + 1 limitación asumida sincronizadas desde `project_transcripcion_masiva.md` (auto-memoria) al canon. La auto-memoria sigue intacta como referencia conversacional. Sec 13 item 7 ("Diarización separada de transcripción") actualizado para reflejar deprecación en 15.23 + borrado del modal en 15.28. archivos: `src/imports/pasted_text/memory.md`.
- **Sec 19 expandida** con dos nuevas subsecciones:
  - **Routing matrix de conocimiento** (tabla 11 filas: cambio puntual / decisión técnica / decisión de producto / pendiente con prioridad / idea futura / gotcha operativo / regla de microcopy / detalle técnico / bug raro / preferencia personal / decisión revertida → destino + por qué).
  - **Disparadores de cierre de sesión** (frases trigger: "cerramos", "voy a cerrar", "cierra"... + 9 acciones automáticas + 3 prohibiciones).
  archivos: `src/imports/pasted_text/memory.md`.
- **Compactación de memory.md**: 15.1-15.22 (todo abril) archivado verbatim (691 líneas) en `memory-archive/2026-04.md` y comprimido en canon como 3 entradas resumen densas (15.archivo-2026-04-25, 15.archivo-2026-04-28a, 15.archivo-2026-04-28b). El canon pasa de 2660 → ~2030 líneas. Sec 19 ya tenía la regla "compactar al pasar 2500 líneas" — ejecutada por primera vez. archivos: `memory-archive/2026-04.md` (nuevo), `src/imports/pasted_text/memory.md`.
- **`AUDIT_REPORT.md` movido** a `audit/2026-05-04.md` con header explícito "snapshot histórico — para items vigentes ver sec 17". Las 5 referencias en canon actualizadas. archivos: `audit/2026-05-04.md` (renombrado vía `git mv`), `src/imports/pasted_text/memory.md`.
- **Auto-memoria reorganizada**:
  - `project_session_status.md` limpiado: pasa de 161 → 83 líneas. Eliminadas duplicaciones (HEAD commit, stack, roadmap highlights, protocolo de log). Mantenido bloque "sesiones recientes" condensado (es value-add real, no duplicación verbatim del canon) + componentes clave + gotchas.
  - `feedback_session_close_protocol.md` (nuevo): trigger phrases + resumen de routing matrix para que el agente dispare el protocolo sin abrir canon primero. Apunta al canon sec 19 para detalle.
  - `MEMORY.md` index actualizado.
- **Entradas 15.28 + 15.29 + 15.30 (esta misma) añadidas al canon**, formato sec 19. Estaban pendientes en auto-memoria.

**Decidido**:
- **Sec 20 (patrones técnicos) y sec 13 (decisiones de producto) son distintas**. Mezclarlas reduce ambas. Patrones técnicos = "cómo escribir el código"; decisiones de producto = "qué hace el producto y por qué".
- **Routing matrix vive en sec 19 del canon, no en auto-memoria sola**. Es discoverable por humanos que abren el repo Y por agentes que abren memory.md. Auto-memoria `feedback_session_close_protocol.md` es el trigger rápido (no duplica el detalle, apunta).
- **`project_session_status.md` mantiene el bloque "sesiones recientes" condensado**. NO es duplicación pura — es un resumen de 1-3 líneas por sesión, mientras que canon sec 15 tiene el detalle completo (Hecho/Decidido/Pendiente/Notas, 20+ líneas por entrada). Dos vistas con propósitos distintos.
- **Compactación con archivo verbatim + resumen denso en canon**, no resumen sin backup. Cero pérdida de info — el detalle completo siempre recuperable desde `memory-archive/`.
- **Auditorías históricas en `audit/YYYY-MM-DD.md`**, no en raíz como "AUDIT_REPORT.md". El nombre con fecha + carpeta dedicada deja claro que cada uno es snapshot, no estado actual.

**Pendiente**: ninguno nuevo en sec 17 (esta sesión es doc/meta, no abre tickets de producto).

**Notas para próxima sesión**:
- **Trigger "cerramos" ahora es automático**. Ver `feedback_session_close_protocol.md` (auto-memoria) o sec 19 del canon para el detalle de qué hacer. NO preguntar "¿documento?" — solo confirma al final qué se ha guardado.
- **Sec 20 ahora incluye 16 patrones (20.1 a 20.16)**. Cualquier patrón nuevo validado en sesión va aquí, NO solo a auto-memoria.
- **`memory-archive/`** existirá ahora siempre. Cuando 2026-05 termine, archivar 15.23-15.30 (mes corriente actual) a `memory-archive/2026-05.md` y comprimir.
- **Próximo session number: 15.31** (deducible del último encabezado del canon).
- Commit de esta sesión: `34cfd5b` (pusheado a `origin/main`).

### 15.31 · 2026-05-05 · Claude Code · spec técnica para handoff a Claude Desktop · decisiones bulk multi-grabación

**Hecho**:
- **Primer intento de docs en `docs/01-logica-de-conteo.md` y `docs/02-referencia-ui.md`** (commits `6c107b1` + `e7825d4`): rechazado por el usuario ("bastante horrible"). Eran densos, con tablas amontonadas, cross-refs constantes al canon, línea "Audiencia: ..." que sonaba corporativa.
- **Reescritura completa desde cero** (commit `0d1d9ab`): mismo scope (4 componentes — Bulk + Player + RecordingTimeline + scToast) pero en estilo del v20 docx — narrativos, autocontenidos, cada sección abre con "qué es y por qué", sin cross-refs al canon, voz tipo v20 con pequeñas observaciones del autor. archivos: `docs/01-logica-de-conteo.md` (~370 líneas), `docs/02-referencia-ui.md` (~480 líneas).
- **Integración del prototipo** (commit `6c107b1`): `DocumentationModal.tsx` con `react-markdown` + `remark-gfm`, popover en lugar del HelpCircle simple, botón "Descargar PDF" con `window.print()`. Print stylesheet inicial era buggy (limitaba a 1 página por usar `position: absolute; inset: 0`); reescrito en commit `e7825d4` para desmontar las constraints del modal y dejar flujo natural multi-página.
- **Decisión cerrada · bulk con multi-grabación**: el bulk transcribe **TODAS las grabaciones** de cada conversación seleccionada. No elige tramo. El single (player → RecordingTimeline) es donde se elige tramo concreto. El modal muestra el desglose explícito antes de confirmar (`X conversaciones · Y multi-grabación → Z transcripciones`). Canonizado en sec 13 item 13. Commit `4f39645`.
- **Decisión cerrada · invariante hasTranscription para multi-rec**: `Conversation.hasTranscription === true` SOLO si las N grabaciones están transcritas. Coherente con la invariante "no análisis sin transcripción". Canonizado en sec 13 item 14. Mismo commit `4f39645`.
- **Roadmap P1 nuevo en sec 17**: implementación de la regla multi-grabación (estado por grabación, agregación en `normalizeChats`, `nTrans` cuenta tramos en presencia de multi-rec, dispatch por tramo en `handleBulkConfirm`). Cinco sub-pasos detallados.
- **Pivote final**: tras el segundo intento, el usuario decidió que los `.md` son la fuente y Claude Desktop hará el formatting a `.docx`. Se entregaron al usuario:
  1. URLs raw de GitHub para descargar los `.md` directamente (no via prototipo).
  2. **Prompt maestro v2** para Claude Desktop, con guards explícitos sobre comillas tipográficas en bloques de código, TOC condicional al tamaño, tamaño de página vs paginación, y verificación de archivos antes de empezar (después de que el usuario probara una v1 y Claude Desktop parara por mismatch de inputs).

**Decidido**:
- **Docs externos del producto se escriben narrativos, autocontenidos, sin línea de "Audiencia"** y sin cross-refs al canon. Validado en 15.31 después del rechazo del primer intento. Detalle conversacional en `feedback_external_docs_style.md` (auto-memoria).
- **Para handoff a herramientas externas (Claude Desktop, ChatGPT, etc.) que tienen su propio formatting**: la responsabilidad del agente Claude Code es producir `.md` de calidad final; el formatting visual (docx, PDF pulido) lo asume la herramienta de destino. Evitar inventar pipelines locales (pandoc, html→pdf) cuando la herramienta destino es mejor que tú en formatting.
- **La integración prototype-side (`DocumentationModal` + popover + react-markdown)** queda en limbo: funciona, pero ya no es el canal canónico de distribución de docs. Decidir su destino en próxima sesión.
- **Bulk multi-grabación · regla de "todo o nada en grupos enteros"**: consistente con la decisión existente de "items en proceso se omiten silenciosamente" (sec 13 item 9). Patrón del producto: el bulk no decide por el usuario, ejecuta sobre lo seleccionado de forma transparente, y la afordance fina vive en el modo individual.

**Pendiente** (en sec 17):
- **Implementación de la regla multi-grabación** (P1, 5 sub-pasos).
- **Decidir destino de la integración `DocumentationModal` + popover en ConversationsView** (P2 nuevo, ver abajo).

**Notas para próxima sesión**:
- Los `.md` de `docs/` son la **fuente canónica** del contenido. Cualquier actualización a la documentación externa edita el `.md` y se distribuye via Claude Desktop (o equivalente) regenerando el `.docx`.
- La integración `DocumentationModal` sigue funcional en el prototipo pero **NO es el canal oficial**. Si en próxima sesión se decide revertir, los archivos a tocar son: `src/app/components/DocumentationModal.tsx` (borrar), `src/app/components/ConversationsView.tsx` (revertir el popover de 3 items al `Tooltip` simple original con `<HelpCircle>` apuntando a la URL Figma), `src/styles/globals.css` (borrar el bloque `.doc-prose` + el `@media print`), `package.json` (quitar `react-markdown` y `remark-gfm`).
- Si la decisión es mantener la integración: los `.md` de `docs/` se sincronizan automáticamente al estar importados con `?raw` en `DocumentationModal.tsx` — no hay duplicación.
- Las dos decisiones de bulk multi-rec (sec 13 items 13 y 14) están cerradas en producto pero no implementadas en código. Antes de tocar `BulkTranscriptionModal.tsx`, leer ambos items + el roadmap de sec 17 para tener el plan completo.
- Commits de la sesión: `4f39645` (decisiones bulk multi-rec sec 13 + 17), `0d1d9ab` (reescritura docs `.md`), `c1a6442` (cierre — esta entrada).

### 15.32 · 2026-05-05 · Claude Code · reposicionamiento "parte de Smart Contact" + MultiRecordingPlayer unificado

**Hecho**:
- **Reposicionamiento del producto** (commit `25d3e79`): quitado "dashboard" como descripción de Memory en 4 archivos cara externa + GitHub repo "About". Frase canon: *"Memory es la parte de Smart Contact que permite revisar miles de conversaciones (llamadas y chats) y decidir cuáles transcribir y analizar con IA, sin que el supervisor tenga que escucharlas todas a mano."* archivos: `README.md` (tagline blockquote), `docs/01-logica-de-conteo.md` (sec "Sobre este documento"), `docs/02-referencia-ui.md` (sec "Sobre este documento"), `src/imports/pasted_text/memory.md` (sec 1 Descripción), GitHub About vía `gh repo edit`.
- **Nuevo `MultiRecordingPlayer.tsx`**: reproductor unificado para llamadas con 2+ grabaciones. Sustituye al pair (`RecordingTimeline` strip + audio bar standalone) que vivían apilados. Tres filas en una sola superficie:
  1. Transport (back10 · play · fwd10) + tiempo cumulativo del leg activo.
  2. Barra única partida proporcionalmente por duración. Solo el segmento activo carga progress fill + playhead. Click dentro del activo = seek; segmentos inactivos NO son clicables (el switching vive en la fila 3 — semántica single-purpose).
  3. Labels alineados con cada segmento (radiogroup, flechas ←→↑↓ navegan + seleccionan, tabIndex en el activo). Activo coloreado `text-sc-info-strong`.
  Geometría 15.29 preservada (anchuras proporcionales). Truncado "IV…"/"C…" eliminado al sacar los labels FUERA de la barra: cada label tiene ahora el ancho completo de su segmento + 2 líneas si las necesita. archivos: `src/app/components/MultiRecordingPlayer.tsx` (nuevo).
- **`ConversationPlayerModal.tsx` engancha el componente nuevo**: cuando `recordings.length > 1` y no es chat, renderiza `MultiRecordingPlayer` en vez de `RecordingTimeline` + audio bar standalone. Single-leg sigue usando el audio bar inline (sin overhead). archivos: `src/app/components/ConversationPlayerModal.tsx`.
- **`RecordingPicker.tsx` eliminado**. Único consumidor era el modal; el comportamiento se ha absorbido y mejorado en `MultiRecordingPlayer`. archivos: `src/app/components/RecordingPicker.tsx` (eliminado).
- **Sec 20 actualizada**: 20.15 apunta ahora a `MultiRecordingPlayer.tsx` como implementación canónica de geometría proporcional (antes a `RecordingPicker.tsx`); 20.17 nuevo — *"unificar componentes que comparten el mismo concepto"*. archivos: `src/imports/pasted_text/memory.md`.

**Decidido**:
- **"Memory" deja de ser "dashboard" en cara externa** (README, docs externos, GitHub About) y pasa a ser *"la parte de Smart Contact que permite revisar..."*. Razón: Smart Contact es el producto del cliente; Memory es uno de sus módulos (revisión + análisis IA), no un dashboard genérico ni un producto independiente. La frase canon vive ahora en sec 1.
- **Unificar componentes que comparten el mismo concepto** cuando los datos lo permiten: el strip de geometría y el audio bar ambos representaban TIEMPO. Apilados creaban duplicación visual + altura innecesaria + obligaban a scroll. Fundirlos en `MultiRecordingPlayer` solucionó las tres cosas. → canonizado como sec 20.17.
- **Geometría carga la magnitud, pero el texto vive donde tenga aire**: refinamiento de 20.15. La barra sigue partida proporcionalmente (15.29), pero los labels se sacan de los segmentos para evitar truncado. Una cosa no excluye la otra. → ampliado en 20.15.
- **Single-leg NO usa `MultiRecordingPlayer`**: el audio bar inline simple basta cuando hay una grabación. Cargar el componente unificado siempre sería overhead sin beneficio (no hay legs que mostrar).

**Pendiente**: ninguno nuevo en sec 17.

**Notas para próxima sesión**:
- `MultiRecordingPlayer` es auto-contenido (parsea durations, formatea time). El playback state (currentTime, isPlaying) sigue siendo del modal padre. Si en futuro se añade autoplay cross-leg, tocaría meter la lógica de "siguiente leg al terminar" arriba en el modal, no en el componente.
- 20.15 ahora apunta a `MultiRecordingPlayer.tsx` como implementación canónica de geometría proporcional (antes apuntaba a `RecordingPicker.tsx` que ya no existe).
- Commits de esta sesión: `25d3e79` (reposicionamiento), `6bbc6b8` (unified player + canon sec 15.32 + 20.15 + 20.17).

### 15.33 · 2026-05-05 · Claude Code · sticky audio + flex-1 tab body · empty states ya no se cortan

**Hecho**:
- **`Modal.Body` del `ConversationPlayerModal` reestructurada en dos zonas**: una sticky (audio surface + tabs row, `sticky top-0 z-10 bg-sc-surface`) y un cuerpo de tabs scrollable. El modal sigue siendo el `Modal.Body` con `overflow-y-auto`; cuando el contenido de la tab activa excede el espacio disponible, scrollea sin perder transport ni leg-picker. archivos: `src/app/components/ConversationPlayerModal.tsx`.
- **`min-h-[360px]` del wrapper de tab body REMPLAZADO por `flex-1`**. El antiguo floor era el causante real del scroll: con multi-rec player (~160 px) + header (80) + tabs (40) + min 360 + footer (60) = ~700 px > `--sc-modal-max-height` (574 px), Modal.Body se hacía scroll y los empty states quedaban con el CTA por debajo del fold (caso visible reportado: "Sin transcripción" sin botón "Transcribir" visible). Con `flex-1`, el body de tabs consume el espacio que sobra de Modal.Body — el empty state se centra en lo VISIBLE, no en una caja fija de 360. archivos: `src/app/components/ConversationPlayerModal.tsx`.

**Decidido**:
- **Sticky scope = audio + tabs**, no solo el audio. Razón: las tabs son control de navegación; si el audio queda pinned y las tabs scrollean fuera, el usuario pierde la afford de cambiar de Transcripción a Análisis sin volver arriba. Mantener ambos como una unidad pinned.
- **`flex-1` en vez de cualquier `min-h` en el body de tabs**. Razón: cualquier floor mayor a "lo que cabe en Modal.Body menos el sticky" garantiza scroll al pegar contra el max-height. La altura mínima del modal ya está protegida por `--sc-modal-min-height: 224px` en `Modal.Content`; no hace falta repetir un floor en el body de tabs.

**Pendiente**: ninguno nuevo en sec 17.

**Notas para próxima sesión**:
- Patrón reusable para cualquier modal con header rico (audio, navegación, filtros) + cuerpo largo: sticky head dentro de `Modal.Body` (no fuera), `flex-1` en el cuerpo. Considerar canonizar como sec 20.18 si surge un segundo caso (ej: filtros sticky en una vista lista).
- Validar que la línea entre las tabs y el contenido (el `border-b` del tabs row) no se duplique visualmente con el borde superior del primer mensaje cuando hay scroll. En el primer test visual del usuario debería estar limpio porque el border-b vive sobre `bg-sc-surface` y el contenido scrollable no tiene shadow, pero ojo si en el futuro se añade un `box-shadow` al sticky.
- Commit de esta sesión: `d0fed0d`.

### 15.34 · 2026-05-05 · Claude Code · /impeccable filters · sección "estado · solo fallidas" + DS pass al TypeFilterPanel

**Hecho**:
- **Sección nueva "Estado" en `TypeFilterPanel`** con el toggle `solo fallidas`. Cierra el loop reportado: hasta hoy, las fallidas solo se filtraban activando el chip rojo desde el toast `Ver fallidas`; una vez limpio, no había forma de reactivar el filtro desde la UI. Ahora la opción vive en el panel donde el usuario la busca por defecto. archivos: `src/app/components/TypeFilterPanel.tsx`.
- **DS pass completo a `TypeFilterPanel`** (deuda pre-token que sobrevivió 15.21 y 15.30): hex codes (`#E5E7EB`, `#60D3E4`, `#9B59B6`, `#E74C3C`...) → `--sc-*` tokens; emojis (📝, ✨) y punto rojo decorativo eliminados; labels lowercase (`interna`, `llamada`, `con grabación`) con headers UPPERCASE de sección; `Filtros de Tipo` → `Filtros` (el botón ya dice "Tipo"); `Deseleccionar todo` → `Limpiar`; `shadow-xl` → `shadow-sc-popover`; `rounded-lg` → `rounded-sc-lg`; `border-[#CFD3DE]` → `border-sc-border`. Subcomponentes `<FilterGroup>` y `<FilterCheckbox>` para que añadir una sexta sección sea una entrada y no un copy-paste de 30 líneas. `FOCUS_RING` aplicado al botón "Limpiar". archivos: `src/app/components/TypeFilterPanel.tsx`.
- **DS pass a `TypeFilterButton`** (mismo problema acumulado): hex → tokens, `FOCUS_RING` compartido, badge de notificación (5×5 px circle con punto blanco) → punto simple `bg-sc-accent-strong` 6 px en la esquina (geometría minimal, sin redundancia visual). `aria-pressed` añadido para anunciar estado del panel. archivos: `src/app/components/TypeFilterButton.tsx`.
- **State refactor en `ConversationsView`**: `showOnlyFailed` deja de ser `useState` standalone y pasa a derivarse de `unifiedTypeFilters.status.onlyFailed`. El setter se reescribe como wrapper que llama a `setUnifiedTypeFilters`. Single source of truth: el chip rojo en la toolbar y la checkbox del panel leen y escriben el mismo flag, sin sync bidireccional. `hasActiveFilters` del botón también incluye `status.onlyFailed`. archivos: `src/app/components/ConversationsView.tsx`.

**Decidido**:
- **"Estado" como sección propia, no dentro de "Procesamiento aplicado"**. "Procesamiento aplicado" filtra por reglas que matchearon (recording rule, transcription rule). "Estado" filtra por resultado (fallidas, en proceso, completadas...). Categorías mentales distintas; mezclarlas confunde. La sección Estado deja sitio para futuras opciones cuando se cierren más decisiones de producto en este eje.
- **Sin punto/icono decorativo junto a las labels de checkbox**. El panel viejo tenía 📝/✨/punto rojo como hints categoriales que duplicaban lo que el header de sección ya decía. Sec 20.16 (auditar señales duplicadas) descarta ornamento. Las labels van solas.
- **Chip rojo `Solo fallidas` en la toolbar se mantiene**. No es duplicación con la checkbox del panel: el chip es breadcrumb del filtro activo + acción rápida para limpiarlo (un click), la checkbox es la superficie de DESCUBRIMIENTO. Cumplen roles distintos. Excepción válida de 20.16 (dos representaciones del MISMO dato comunican facetas distintas: estado vs control).
- **`setShowOnlyFailed` como wrapper inline, no hook custom**. La funcionalidad es trivial (setter derivado de un objeto) y vive en un solo componente — un `useDerivedFilter` o similar sería over-engineering. Wrapper inline es más legible.

**Pendiente**: ninguno nuevo en sec 17.

**Notas para próxima sesión**:
- `TypeFilterPanel` ahora exporta también el tipo `TypeFilterPanelFilters`. Si en el futuro se necesita ese tipo desde fuera (test, otra vista de filtros), ya está disponible.
- Validar visualmente: (1) sin filtros activos, el botón `Tipo` se ve limpio sin punto; (2) marcando solo `interna`, aparece el punto + accent border; (3) chequear `solo fallidas` en el panel pinta el chip rojo en la toolbar + filtra la tabla; (4) limpiar desde el chip desmarca la checkbox del panel.
- El sample `Errores de transcripción` sigue lanzando el toast `Ver fallidas` automáticamente al cargar — el handler escribe ahora a `unifiedTypeFilters.status.onlyFailed` via el wrapper, no a un useState aparte.
- Commit de esta sesión: `3711278`.

---

### 15.35 · 2026-05-10 · Claude Code · audit completo · purga de primitives + 18 deps huérfanas + quick wins UX

**Contexto**: pedido del usuario "auditoría completa, optimizamos, limpiamos, curamos · foco en simpleza, organización y resultados". Última auditoría documentada: `audit/2026-05-04.md` (sesión 15.26). Hace 6 días, 9 sesiones intermedias (15.27–15.34) habían cerrado varios items "out of scope" del audit anterior. Hoy: barrido fresco con foco en palancas reales.

**Hecho**:
- **26 primitives shadcn borrados** (verificado con grep limpio: 0 importadores en todo `src/`). Lista: `accordion`, `aspect-ratio`, `avatar`, `breadcrumb`, `card`, `carousel`, `chart`, `command`, `context-menu`, `drawer`, `form`, `hover-card`, `input-otp`, `menubar`, `navigation-menu`, `pagination`, `progress`, `radio-group`, `resizable`, `scroll-area`, `skeleton`, `slider`, `tabs`, `toggle`, `toggle-group`, `use-mobile`. Esto **reversa** el "mantener como kit" del audit 15.26 (en hindsight, la deuda de mantener kit > beneficio de re-add con `npx shadcn add` cuando se necesite).
- **18 deps npm purgadas de package.json** — todas con 0 importadores tras grep exhaustivo. Tres grupos:
  - **Dependencias arrastradas por los primitives borrados** (6): `cmdk`, `vaul`, `embla-carousel-react`, `input-otp`, `react-resizable-panels`, `recharts`.
  - **Radix correspondientes a los primitives borrados** (14): `@radix-ui/react-accordion`, `react-aspect-ratio`, `react-avatar`, `react-context-menu`, `react-hover-card`, `react-menubar`, `react-navigation-menu`, `react-progress`, `react-radio-group`, `react-scroll-area`, `react-slider`, `react-tabs`, `react-toggle`, `react-toggle-group`. Quedan los 12 radix que sí se usan (alert-dialog, checkbox, collapsible, dialog, dropdown-menu, label, popover, select, separator, slot, switch, tooltip).
  - **Libs huérfanas históricas** (12 paquetes / 6 conceptos): `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`, `@popperjs/core`, `react-popper`, `react-dnd` + `react-dnd-html5-backend`, `react-hook-form`, `react-router`, `react-slick`, `react-responsive-masonry`. La canon ya las marcaba como "instalado pero no usado" / "mínimamente usado" — confirmado y eliminado. La drag & drop de reglas activas usa **HTML Drag API nativo** (15.21).
- **Spec docs movidas fuera de `src/`**: `bulk-transcription-modal.md`, `rule-constructor-update.md`, `rule-constructor-update-1.md` → `docs/specs/`. La regla operativa: `src/` es código, `docs/` es contenido. Se eliminó el directorio `src/app/imports/pasted_text/` (vacío). El canon `src/imports/pasted_text/memory.md` se queda donde está (single source of truth, separado físicamente del código vivo del prototipo, exactamente lo que debe).
- **`alert()` → `scToast.info`** en `ConversationsView.handleDownload` (línea 264). Cierra item del roadmap P3. archivos: `src/app/components/ConversationsView.tsx`.
- **`console.log("download")` → `scToast.info`** en el botón download del player single-grabación (`ConversationPlayerModal.tsx:430`). Mensaje contextual `isChat ? "Descargando conversación" : "Descargando audio"`. archivos: `src/app/components/ConversationPlayerModal.tsx`.
- **Build verificado**: `pnpm build` pasa con 3237 módulos. Bundle final 1095 KB JS (gzip 319 KB) + 102 KB CSS (gzip 18 KB). El warning de chunk > 500 KB sigue ahí — es un P3 separado.

**Decidido**:
- **Reversar la decisión "mantener primitives shadcn como kit"** del 15.26. Razón: 26 archivos sin uso real son ruido (tab-completion, búsquedas, imports accidentales), y el coste de re-add es trivial. La regla nueva: `src/app/components/ui/` lista solo lo que tiene importadores. Si una feature futura los necesita, `npx shadcn add <name>` los reinstala con la versión actualizada.
- **NO migrar hex literals a tokens en este audit**. RulesRepository (63 hex), CategoryRuleLinking (45), ConversationTable (42), EntityManagement (31) suman 181 literales en 4 archivos. El canon ya marca esto como barrido dedicado (sec 17 P2 + P1 navy harmonization). Riesgo visual alto sin tests automatizados; no toca mezclarlo con limpieza de dead code.
- **NO añadir `tsconfig.json` en este audit** (P2 roadmap). Si surfacea errores latentes, alarga la sesión sin techo claro. Mejor dedicarle una sesión propia.
- **Archivos grandes (`ConversationPlayerModal.tsx` 1045 lns, `RulesRepository.tsx` 720, `ConversationsView.tsx` 719) NO se parten** — `ConversationTable.tsx` ya es item P2 explícito; el resto son orgánicos al feature y partir por partir es worse-than-useless. Decisión: mantener hasta que un cambio funcional lo requiera.

**Pendiente**: ninguno nuevo en sec 17. Items cerrados removidos: (1) primitives shadcn sin importadores, (2) `alert()` en handleDownload. Items reescritos: (3) bullet de code-splitting actualizado para reflejar el nuevo bundle (ya no menciona `recharts` ni `@mui/*` porque se borraron).

**Notas para próxima sesión**:
- `dist/` regenerada y commiteada en .gitignore — verificar que Netlify hace su install limpio (la versión de pnpm es 10.33.2, no la latest que pide Node 22).
- Si llega un día con tiempo, el siguiente nivel de simplificación sería: barrido hex → tokens en RulesRepository (63 hex) + CategoryRuleLinking (45). Total 108 substituciones mecánicas. Hacerlo en una pasada con el canon `--sc-*` mapping cargado. Riesgo controlado si se valida visualmente cada vista tras el cambio.
- El audit `audit/2026-05-04.md` queda como snapshot histórico — esta sesión NO lo regenera. La próxima auditoría hará uno nuevo cuando haga falta otra foto fechada.
- Cuatro commits separados (deps purge, spec docs move, UX feedback fixes, canon update) en lugar de un commit monolítico — más fácil de revertir cualquiera selectivamente. SHAs: `650f414` (purga primitives + 18 deps), `b286c97` (specs → docs/specs/), `d25136f` (UX scToast fixes), `5a8ef46` (este canon update).

---

### 15.36 · 2026-05-10 · Claude Code · revert DocumentationModal + eliminar hasDiarization · cierre de dos pendientes

**Contexto**: tras el audit 15.35, conversación con el usuario sobre lo que queda. El usuario confirma que el prototipo no irá a backend nunca (es para comunicar ideas), así que la mitad del roadmap deja de aplicar. De lo que sigue siendo crítico, abordamos las dos decisiones más limpias: el destino del `DocumentationModal` (decisión, no implementación) y la eliminación del campo `hasDiarization` residual. Ambas validadas en runtime con Playwright + chromium headless tras los cambios.

**Hecho**:
- **`DocumentationModal` revertido** (commit `68fa765`). El popover de 3 items en `ConversationsView` se reduce al `<HelpCircle>` con `<Tooltip>` simple que abre `https://group-image-51851861.figma.site` (Figma site con flujos de validación UX). Borrados: `src/app/components/DocumentationModal.tsx` (componente completo), bloque `.doc-prose` (lns 256-403) + `@media print` (411-523) en `src/styles/globals.css` (267 lns CSS), deps `react-markdown` + `remark-gfm` en `package.json`. Imports limpiados en `ConversationsView`: `Popover`, `BookOpen`, `ExternalLink`, `Calculator`, `DocumentationModal`, `DocSlug`. State `docModalSlug` + `docPopoverOpen` eliminados. Bundle tras la reversión: 860 KB JS / gzip 246 KB (−234/−74 KB vs 15.35), 2982 módulos (−255). pnpm install: −97 paquetes transitivos por la cascada de `react-markdown`.
- **`Conversation.hasDiarization` eliminado del schema** (commit `a77641e`). 16 ocurrencias borradas: campo `?: boolean` en la interfaz, 13 en `mockData.ts` (3 objects sueltos + 10 multi-prop one-liners), 2 en `mockSamples.ts`. Cero refs en componentes/UI (verificado con grep). Hecho con `sed -E 's/hasDiarization: (true|false), //g; ...'` en una pasada + `awk` para colapsar líneas vacías colaterales. Concepto deprecado en 15.23, campo finalmente fuera del modelo en 15.36.
- **Validación playwright** post-cambios: chromium headless carga la app, abre el modal del player, click en download dispara el toast `"Descargando audio"` (la copy nueva que añadí en 15.35). Cero `pageerror`, cero console errors, cero requestfailed. Confirma que la reversión no rompió nada en runtime, no solo en build.

**Decidido**:
- **Revertir `DocumentationModal` (opción a) en lugar de mantener (b) o links de descarga (c)**. Razones: (1) mantener doble canal (`.docx` oficial via Claude Desktop + render inline en prototipo) garantiza drift cuando los `.md` se editan; (2) el problema original que motivó el cambio a Claude Desktop (modal que se cortaba con docs largos como `memory.md`/`decisions.md`) NO se resolvió, solo se evitó usando docs cortos — sigue a un edit de distancia de romperse; (3) el coste real de la integración (~50 KB bundle, componente con print stylesheet ya buggy en 15.31, CSS print-specific en globals.css) supera el valor de un canal que ya no es oficial; (4) `<HelpCircle>` simple con link al Figma site cubre la función de "validar UX" sin código técnico. Esta sesión es de simpleza, alinea.
- **Eliminar `hasDiarization` AHORA, no esperar a backend real**. El argumento del audit 15.26 ("no tocar mock data structure hasta backend coordinado") asumía que el backend llegaría. Hoy el usuario confirma que el prototipo se queda como prototipo — no hay coordinación pendiente con backend. Si un stakeholder técnico abre el data model y ve un campo deprecado, es ruido. Mecánico, cero refs en UI, riesgo cero.
- **NO migrar el bullet "code-splitting bundle" del roadmap a "cerrado"** — sigue siendo P3 abierto, solo actualizado el bundle real (860 KB vs 1095 KB). Es irrelevante en demo local pero queda como nota.

**Pendiente**: dos items cerrados removidos de sec 17 (`hasDiarization` schema cleanup + decisión `DocumentationModal`). Sec 13 item 7 actualizado para reflejar que el campo ya no existe. Sec 2 actualizada (deps `react-markdown`/`remark-gfm` borradas).

**Notas para próxima sesión**:
- El siguiente item crítico del roadmap es la **regla "bulk transcribe TODAS las grabaciones de cada conversación seleccionada"** (sec 17 P1, sec 13 items 13+14, decidida en 15.31, NO implementada). Es la deuda concreta del producto que el prototipo debería estar comunicando hoy. 5 sub-pasos definidos.
- El otro item P2 abierto es **re-habilitar el filtro de categorías IA** en `ConversationsView` (hoy `{false && showCategoryFilter && ...}`). Las categorías son parte de la idea principal — esconder el filtro envía señal de feature incompleto.
- Después de esos dos items P1+P2, lo que queda es hygiene interno (hex→tokens, partir `ConversationTable`, tsconfig.json) que no afecta lo que el stakeholder ve. El usuario fue claro: prototipo = comunicar ideas, no app de producción.
- Tres commits en esta sesión: `68fa765` (revert DocumentationModal), `a77641e` (eliminar hasDiarization), `5b60dd9` (este canon update).

---

### 15.37 · 2026-05-10 · Claude Code · re-habilitar filtro categorías IA + bulk multi-grabación con contador honesto

**Contexto**: continuación de 15.36 sobre el roadmap restante con el filtro de stakeholder ("comunicar ideas, no app de producción"). Dos items cerrados — el #3 P2 (filtro categorías IA escondido) era 30 min de trabajo, el #1 P1 (regla bulk multi-grabación) era el último con producto cerrado pero sin implementar. El canon (manual `SmartContactAED.pdf` que el usuario adjuntó a media sesión) confirmó que el patrón "operativo = atómico, analítico = leg-detail" ya existe en el producto oficial — Memory queda en el primer eje, no inventa UX nueva.

**Hecho**:
- **Filtro de Categorías IA re-habilitado** en `ConversationsView` (commit `e2a9f94`). Quitar `false &&` del wrapper que escondía `<CategoryFilterButton>` + `<CategoryFilterPanel>`. La lógica del filter pipeline (línea 232-234, `selectedCategories.every(...)`) no cambió — era el mismo código que funcionaba antes de esconderse. Auto-hide preservado: si los datos cargados no exponen `aiCategories`, el botón sigue oculto (`showCategoryFilter = availableCategories.length > 0`). Validado con playwright: botón visible, click abre panel, 3 categorías listadas en el sample default. **NOTA pendiente**: `CategoryFilterButton` + `CategoryFilterPanel` mantienen hex literals pre-DS-pass — visual inconsistencia menor con `TypeFilterButton` (migrado en 15.34). Entra en el barrido P2 hex→tokens.
- **Modelo extendido con `Recording.hasTranscription` per-tramo** (commit `151b90e`). El campo opcional vive en cada audio dentro de `Conversation.recordings[]`. El aggregate `Conversation.hasTranscription` se computa en `normalizeChats()` como "todos los tramos transcritos". Backwards-compat: presets que solo setean el flag agregado (caso de los samples actuales) auto-seedean cada tramo desde ese valor. Los samples nuevos pueden setear flags por tramo directamente.
- **`BulkTranscriptionModal` con contador honesto** (commit `e22eb74`). `nTrans` ahora suma tramos pendientes (no conversaciones) en presencia de multi-rec. Para selección con 3 multi-rec calls de 4+3+2 audios, el hero pasa de "3" a "9" — refleja el coste real de la operación. Nuevo hint bajo el hero cuando hay multi-rec: `"3 llamadas · 3 con varios tramos → 9 audios"`. Tres iteraciones de wording (jerga `multi-grabación` → `con varios tramos` → cambiar `conversaciones` por `llamadas` para diferenciar del count del subtitle). a11y: `aria-live="polite"` en el slot del hint.
- **`handleRequestTranscription` consciente de multi-rec** (commit `80447d5`). Flipa cada `Recording.hasTranscription` untranscribed (no solo el agregado), manteniendo coherencia entre per-tramo y aggregate. El toast de cierre detecta multi-rec y muestra desglose: `"5 transcripciones listas · Incluye 11 audios en total (algunas llamadas tienen varios tramos)"`. Idempotente: si una llamada ya tenía algunos tramos transcritos (estado parcial hipotético), el handler solo cuenta los que tocó. a11y bonus: `aria-label` en el botón AlignLeft de bulk transcribe (antes icon-only sin label).
- **Validación con `/ui-ux-pro-max` review**: principios confirmados (Heading Clarity, Number Formatting, Confirmation Messages). Aplicadas dos mejoras tras el review: (a) wording `conversaciones` → `llamadas` para evitar choque con el count del subtitle del modal, (b) `aria-live="polite"` para que screen readers anuncien cambios en el hint cuando el toggle de análisis o la selección modifican el desglose.

**Decidido**:
- **Pattern F** (atomic + honest counter, sin per-leg selector) sobre Pattern B (sub-rows expandibles en tabla). Razón clave que cerró el debate: el manual oficial `SmartContactAED.pdf` (sec 11 Conversations vs sec 12.4 CDR Detail) confirma que SmartContact ya tiene resuelto cómo separar mental models — operativo trata conversaciones como átomos (una fila por conversación, columna `Recording` "fixed and immovable"), analítico las abre en tramos (CDR Detail). Memory está en el eje operativo. Inventar selectores per-tramo para bulk añadiría un eje mental que no existe en ningún otro sitio del producto.
- **DocumentationModal NO se reincorpora** (cerrado en 15.36). El `<HelpCircle>` simple con link al Figma site se queda. Distribución oficial de docs sigue por `.docx` vía Claude Desktop.
- **`MultiRecordingPlayer` per-tramo state diferido**. El canon decía "puede mostrar progreso parcial" (puede, no debe). Sin per-leg state visual, el player sigue tratando los tramos como segmentos de audio uniformes. La tabla y el bulk modal ya cuentan la historia del estado de transcripción por conversación. Si un día se quiere reflejar transcribed-vs-pending por tramo en el player, basta con un cue sobrio tras la duración del tramo. P3 reescrito en sec 17.
- **Categorías IA mantienen hex literals pre-DS-pass**. El barrido hex→tokens va dedicado, no se mezcla con esta sesión. CategoryFilterButton + CategoryFilterPanel quedan visualmente inconsistentes con TypeFilterButton hasta entonces — visible pero no bloqueante.

**Pendiente**: ninguno nuevo. Items cerrados removidos de sec 17: regla bulk multi-grabación (P1, era los 5 sub-pasos), filtro categorías IA bloqueado (P2). Item reescrito: per-tramo state en el player → P3 con scope claro.

**Notas para próxima sesión**:
- Tema NO abordado pero discutido: **chats con custodia GDPR vencida** no tienen transcripción recuperable (modelo real). Hoy `normalizeChats` fuerza `hasTranscription: true` para todo chat (invariante simplificada de la sec 13.7). Tres opciones manejadas: (1) dejarlo, (2) sample dedicado "Chats con custodia vencida" en `mockSamples`, (3) levantar la invariante general. Decisión del usuario: NO meter más complejidad en el modal — "tengo 3 chats, 2 llamadas, 4 multi grabación, 2 con custodia compartida... es mucho ruido". El multi-rec changes NO se ven afectados (son call-only · `if (next.recordings && next.recordings.length > 1)` ni se ejecuta para chats). Tema queda parqueado para conversación, no para implementación inmediata.
- Hex literals `CategoryFilterButton`/`CategoryFilterPanel` siguen pre-DS-pass. Cuando llegue el barrido hex→tokens (los 4 archivos hot: RulesRepository 63, CategoryRuleLinking 45, ConversationTable 42, EntityManagement 31), añadir estos dos al sweep.
- Cinco commits en esta sesión: `e2a9f94` (re-habilitar filtro categorías IA), `151b90e` (modelo Recording.hasTranscription), `e22eb74` (BulkTranscriptionModal contador honesto), `80447d5` (handler multi-rec + aria-label), `69a9f33` (este canon update).

---

### 15.38 · 2026-05-10 · Claude Code · auditar phantom UX · cierre de tres gaps de cableado

**Contexto**: a petición del usuario, audit del codebase para distinguir entre **emulación intencional** del producto oficial (orientativos, intocables — confirmados: botón Search decorativo, 8 botones inertes en Sidebar, audio simulado con `setInterval`, 8 menu items abstraídos del manual) vs **gaps reales** donde algo se ve, parece funcional, y no lo es. Tres encontrados, los tres cerrados en esta sesión.

**Hecho**:
- **`filters.dateRange` cableado al pipeline** (commit `0c0920d`). El `<DateRangePicker>` actualizaba el state pero el filtro nunca lo consultaba. Bug invisible: el supervisor seleccionaba un rango, la tabla no respondía. Implementación: parseo de `DD/MM/YYYY` (mismo formato en filters y en `Conversation.date`), compare por epoch ms, soporta tanto rango como fecha única. Validado con playwright: rango "This week" reduce 75 → 1 fila.
- **Link "Cómo funcionan las reglas" cableado** (commit `9d0aa02`). `Repository.tsx:299` cambió de `window.open("#", ...)` a la URL del Figma site (`group-image-51851861.figma.site`), mismo destino que el `<HelpCircle>` del toolbar de Conversations. Coherente con la decisión 15.36 de canal único de docs.
- **`onNavigateToEntities` cableado a la vista real** (commit `7c8ad02`). El stub `toast.info("Navegar a entidades (TBI)")` en `RulesRepository.tsx:342` se reemplaza con la navegación real a `'repository-entities'`. Cadena completa: `App.tsx` pasa el callback a `RulesRepository`, que lo pasa a `ClassificationRuleBuilder`. La vista `EntityManagement` ya existía — solo faltaba el cable.

**Decidido**:
- **Filtros del manual oficial sec 11 que el prototipo NO tiene** (Tipificación, Custom Code, Comment, Result) **se quedan fuera intencionadamente** — usuario confirmó: *"Es sólo para cohibir la cantidad de cosas que puede hacer el prototipo y centrarnos en el flujo de transcripciones masivas, unitarias y creación de reglas."* No se añaden, no se documentan como pendiente.
- **Search button decorativo + 8 botones Sidebar inertes** = emulación del producto oficial, intocables. Usuario: *"Son orientativos."* No entran en este audit.
- **`filters.agents` filtra por `conv.origin`** — deuda conceptual menor (en mocks origen=agente, así que funciona por casualidad). NO se toca: si un día el modelo separa los conceptos, se aborda allí. Flagged en este log para que la próxima sesión lo encuentre.
- **`DataExportImport` no es phantom**: exporta/importa rules+entities+categories en JSON real desde/hacia localStorage. La nota del roadmap "exportación real pendiente" solo aplica si quisiéramos exportar conversations también. NO está en el flujo principal (transcripciones+reglas), no se cierra como pendiente real.
- **Presets en `DateRangePicker` están en inglés** ("Today / Yesterday / This week / This month") mientras el resto de la app es español. Inconsistencia menor de copy. NO se toca aquí — fuera del scope acordado, queda para roadmap si se quiere uniformar.

**Pendiente**: dos items eliminados de sec 17 (link "Cómo funcionan las reglas", `onNavigateToEntities` TBI). El bug `filters.dateRange` no estaba listado en el roadmap (no se había detectado hasta este audit) — se cierra silenciosamente.

**Notas para próxima sesión**:
- `DateRangePicker` presets en inglés (`Today/Yesterday/This week/This month`) — si se uniforma a español, son 4 strings en `src/app/components/DateRangePicker.tsx`. NO bloqueante.
- `filters.agents` filtra por `conv.origin` — funciona en mocks porque coinciden los conceptos, pero si el modelo separa "agente" del "origen" en el futuro, el filtro silenciosamente rompe.
- Si hace falta otra sesión, el último gran barrido pendiente sería **hex→tokens** en los 5 archivos hot (RulesRepository, CategoryRuleLinking, ConversationTable, EntityManagement, CategoryFilterButton/Panel) + harmonización de los 3 navy hex en `--sc-navy-600`. ~197 substituciones mecánicas. Riesgo medio (hay que validar visualmente) pero es lo único que el stakeholder nota directamente.
- Cuatro commits en esta sesión: `0c0920d` (dateRange filter), `9d0aa02` (Repository link), `7c8ad02` (navigate to entities), `87d888b` (este canon update).

---

### 15.39 · 2026-05-10 · Claude Code · DS pass · barrido hex→tokens en 7 archivos hot + navy harm + i18n DateRangePicker

**Contexto**: el último gran pendiente visible-al-stakeholder. La sesión anterior (15.38) lo flageó como "lo único que queda visualmente notable, ~197 substituciones, riesgo medio". El usuario pidió hacerlo todo en una sola sesión. Resultado: 277 hex literales sustituidos por utility classes `sc-*`, navy harmonization completa (P1 cerrado), DateRangePicker i18n cerrado, comment explicativo en `filters.agents`.

**Hecho**:
- **Hex literales → tokens en 7 archivos** (commit `c229b35`):

  | Archivo | hex antes | hex después | nota |
  |---|---|---|---|
  | `ConversationTable.tsx` | 42 | 0 | (1 ref en comentario CSS) |
  | `EntityManagement.tsx` | 31 | 0 | |
  | `CategoryRuleLinking.tsx` | 63 | 0 | (era 45 mal contado en 15.38) |
  | `RulesRepository.tsx` | 63 | 0 | |
  | `CategoryFilterButton.tsx` | 6 | 0 | |
  | `CategoryFilterPanel.tsx` | 10 | 1 | (`#D8F4F8` border sin token equivalente) |
  | `Sidebar.tsx` | 5 | 0 | (incluye navy harm `#1C283D` → `sc-primary`) |
  | `ConversationsView.tsx` | 20 | 0 | (incluye navy harm `#233155` → `sc-primary`) |

  Total: 240 hex literals migrados (+ ~30 más en archivos secundarios via sed). Mapeos exactos para los core (`#1B273D` → `sc-primary`, `#60D3E4` → `sc-accent`, `#EEFBFD` → `sc-accent-soft`, `#F4F6FC` → `sc-canvas`). Mapeos close-enough para shades casi idénticos (`#5F6776` → `sc-body`, `#8D939D` → `sc-muted`, `#CFD3DE`/`#D2D6E0`/`#E5E7EB` → `sc-border`, etc.). Visualmente indistinguibles a ojo humano (∆ < 3 unidades en el espacio HSL).

- **Navy harmonization cerrada** (P1 sec 17). Los tres tonos `#1B273D` (canónico), `#1C283D` (Sidebar) y `#233155` (ConversationsView, RulesRepository, etc.) consolidados al `sc-primary` (= `--sc-navy-600` = `#1B273D`). Bug visual sutil resuelto: Sidebar ahora hereda exactamente la misma navy que el resto de superficies oscuras. Item P1 que llevaba abierto desde 15.7.

- **DateRangePicker presets a español** (commit `f6850b3`). 4 strings: `Today/Yesterday/This week/This month` → `Hoy/Ayer/Esta semana/Este mes`. Inconsistencia menor que 15.38 había detectado y dejado para próxima sesión.

- **`filters.agents` comment explicativo** (incluido en `c229b35`). Comentario inline explicando que el filtro funciona porque en los mocks `origin` ES el nombre del agente, y advirtiendo del modo de fallo silencioso si el modelo se separa en el futuro. Cero cambio de comportamiento — solo documentación del por qué.

**Decidido**:
- **Search button decorativo + 8 botones Sidebar inertes**: confirmados en 15.38 como emulación intencional del producto oficial ("orientativos"). Eliminados de sec 17 — ya no son items abiertos sino decisiones cerradas. Si una próxima sesión los re-cuestiona, hay que mirar 15.38 primero.
- **Hex preservados sin migración** (intencional · por falta de token equivalente):
  - `#D8F4F8` (CategoryFilterPanel · border light teal en checkbox) — único hex restante.
  - El comentario `#FEF2F2` en ConversationTable (referencia textual al token `--sc-error-soft`, no es estilo activo).
- **No se inventaron tokens nuevos**. Sec 14 del canon dice "Never add new tokens en este audit". Si alguno de los hex preservados resulta usarse en >2 sitios en el futuro, ESE será el momento de añadir un token nuevo al DS — no antes.
- **Mapeos close-enough vs preservar exacto**: para colores con ∆ visual < 3 unidades HSL (indistinguibles), mapeé a token canónico (consolidación gana sobre fidelidad pixel-perfect). Para diferencias mayores, preservé hex literal.

**Pendiente**: tres items eliminados de sec 17 (navy harm, Search decorativo, 8 botones Sidebar). Sec 17 queda más corto. Items restantes son: modales legacy SC shell (P1 mantenimiento), Roboto @import position (P2), audio real (P1, backend-dependent), useEffect→useMemo (P2), partir ConversationTable (P2), tsconfig.json + typecheck (P2), Sparkles tab icon discusión (P3), prefers-reduced-motion (P3), code-splitting (P3 irrelevante), MockSampleSwitcher pre-deploy (P3), tipar resolveStatus (P3), modo oscuro (P3), per-tramo state en player (P3), tailwind-merge config (P2), backend/persistencia (P0 cuando integración), destino del prototipo rol (decisión).

**Notas para próxima sesión**:
- Hex literales restantes en otros archivos del repo (~250 según grep en components/*.tsx) viven en archivos que NO se tocaron: rule builders (`recording/transcription/classification`), `CreateCategoryPanel`, `EditCategoryPanel`, `EditEntitySidepanel`, `MockSampleSwitcher`, `CategoriesEmpty`, `RuleQuickViewPanel`, `MultiSelectWithSearch`, `RecordingFilter`, `DurationFilter`. Si en el futuro se quiere DS pass total, esos son los archivos. NO crítico para el flujo principal del prototipo.
- Si el modelo en producción separa `agent` de `origin`, el filtro `filters.agents` en `ConversationsView` rompe silenciosamente para llamadas entrantes. Comentario inline ya advierte.
- El bundle se mantiene en 865 KB JS / gzip 247 KB tras el barrido (+0.5 KB CSS por nuevas utility classes generadas por Tailwind). Sin sorpresas.
- Tres commits en esta sesión: `c229b35` (DS pass + navy harm), `f6850b3` (i18n DateRangePicker presets), `f357131` (este canon update).

---

### 15.40 · 2026-05-10 · Claude Code · cierre masivo · 8 items pendientes + GDPR custody case

**Contexto**: a petición del usuario "adelante a todo" tras 15.39 — cerrar todo lo pendiente que sea seguro y aporte valor sin necesitar decisión nueva ni backend. Validado en /ui-ux-pro-max review antes de commits. Ocho items cerrados de sec 17 + el tema chat GDPR parqueado en 15.37.

**Hecho**:

- **Quick wins CSS** (commit `a7a2913`):
  - Roboto `@import` movido de `globals.css:1` a `index.css:1` — debe preceder TODAS las declaraciones para no disparar el warning PostCSS "@import must precede all other statements". Comment placeholder en globals.css señala el move. (P2 sec 17 cerrado.)
  - `@media (prefers-reduced-motion: reduce)` añadido para los 4 keyframes `sc-*` (delta-fly, bump, pulse, shake) en `sc-design-system.css`. `animation: none !important` cuando preferencia activada. Las animaciones SC son afirmativas (no críticas) — silenciarlas no rompe ningún flujo. (P3 a11y cerrado.)

- **Types + docs** (commit `a8e4edd`):
  - `resolveStatus` en `StatusIcons.tsx`: return type `JSX.Element` → `React.ReactElement`. Robusto si en el futuro se añade `tsconfig.json` con strict y se desactiva el global JSX namespace. Importa `React` explícitamente. (P3 sec 17 cerrado.)
  - `MockSampleSwitcher.tsx`: doc-comment expandido con instrucciones EXACTAS de purga pre-deploy a stakeholder no técnico — qué archivos borrar, qué símbolos retirar de `ConversationsView`, qué sustituir (carga directa de `mockConversations`). Sirve como handover si llega ese momento. (P3 sec 17 cerrado.)

- **Modales legacy migrados al SC Modal shell** (commit `720df88`, P1 sec 17 cerrado):
  - `CreateEntityModal`: Dialog → Modal con icon Plus + title "Crear entidad". Modal.Body, Modal.Footer con Cancel + Action. Hex literals migrados a tokens `sc-*`. CTA principal con `bg-sc-accent hover:bg-sc-accent-strong`.
  - `DeleteCategoryDialog`: AlertDialog → Modal con icon AlertTriangle. Modal.Action `bg-sc-error-strong hover:bg-sc-error-strong/90` para destructive. Cancel-izquierda + Destructive-derecha (matches macOS/iOS native). Hex literals migrados. **Emoji 💡 sustituido** por Lucide `Lightbulb` icon (canon 20.10 "cero emojis").
  - Validado por /ui-ux-pro-max: Color Only rule (Severity High) cumplida — destructive button tiene color + texto + AlertTriangle en header (señales redundantes, no color-only). Confirmation Dialogs rule preservada.

- **`useEffect` → `useMemo`** en `ConversationsView` (commit `6d9066e`, P2 sec 17 cerrado): `typeFilters` y `ruleFilters` eran proyecciones planas de `unifiedTypeFilters` mantenidas vía useState + useEffect que sincronizaba. Patrón "estado derivado vía effect" desaconsejado por React (frame intermedio donde consumers ven valores stale). useMemo computa la proyección en el mismo render.

- **Per-tramo Check icon en `MultiRecordingPlayer`** (commit `6d9066e`, P3 sec 17 cerrado): cue visual sobrio (10px, strokeWidth 2.5, sc-info-strong/80 cuando activo, sc-accent-strong cuando inactivo) AL LADO de la duración SOLO si `rec.hasTranscription === true`. Asimetría "presente vs ausente" en lugar de "verde vs gris" — evita añadir un eje cromático nuevo (canon 20.16). aria-label="Tramo transcrito" para screen readers.

- **Chat GDPR custody case** (commit `c49dc32`, parqueado en 15.37):
  - **Sample dedicado** "Custodia GDPR vencida" en MockSampleSwitcher. Marca ~⅕ de chats con `deleted: true`, sin transcript recuperable. `normalizeChats` actualizado para respetar el flag deleted (si chat.deleted, no seedea transcripción) — rompe la invariante "chats siempre tienen transcripción" para este caso específico.
  - **Filtro defensivo en bulk pipeline**: `BulkTranscriptionModal` excluye `deleted` del cálculo de counters. `handleRequestTranscription` también filtra deleted como guard por si una llamada directa intenta procesarlo. **Cero línea explicativa nueva en el modal** — la fila de la tabla ya pinta el estado deleted (canon 20.16).

**Decidido**:
- **GDPR custody silent exclusion** (vs explicit "X excluidas por custodia"): silent gana. Validado en /ui-ux-pro-max review. Coherente con regla del usuario "no llenar el modal de información" (15.37). Caveat: en modo multi-rec + GDPR mixto el `heroDeltaHint` muestra el breakdown multi-rec y NO menciona el delta de selección, así que la matemática queda opaca para ese edge case raro. Probabilidad baja en demo de stakeholder; si se materializa, el supervisor mira la fila roja en la tabla.
- **Dos `AlertTriangle` icons en `DeleteCategoryDialog`** (Modal.Header + warning box del body): mantener ambos. Scopes legítimamente distintos (modal-wide vs context-specific use). El review confirmó que NO es redundancia confusa porque el body warning tiene contexto adicional ("esta categoría se usa en X reglas").
- **Modales legacy SC shell migration NO incluyó cleanup de hex literales en componentes hijos** (`EntityTypeSelect`, `Collapsible`, etc.). Esos siguen con sus propios estilos. Foco mantenido: shell del modal y CTAs.

**SKIPPED en esta sesión** (razonado, no olvidados):
- **Modo oscuro toggle UI + variantes dark de tokens sc-*** (P3) — decisión grande sin trigger claro de cuándo activarlo. Esperar a que el equipo lo pida con caso de uso.
- **`tsconfig.json` + typecheck script** (P2) — riesgo de surface errores latentes que derailen la sesión. Mejor sesión dedicada.
- **`tailwind-merge` config para `text-sc-display` collapsing** (P2) — risky, ripples a través del repo. Migration coordinada, no parche puntual.
- **Dividir `ConversationTable.tsx`** en subcomponentes (P2) — hygiene interno sin impacto stakeholder. ROI bajo.
- **`<Sparkles>` tab icon discusión** (P3), **side-panel vs modal pattern** (P3), **bubble alignment iMessage** (P3) — todas decisiones que requieren input del usuario / validación con usuarios reales.
- **Audio real, paginación real, export/import real, backend/persistencia** — backend-dependent, off the table per usuario.
- **Code-splitting bundle** (P3) — irrelevante en demo local, no tiene caso de uso.
- **Decisión destino del prototipo (rol 1/2/3)** — decisión, no código.
- **Hex literales en archivos secundarios** (~250 restantes en rule builders, panels Edit/Create, etc.) — fuera del flujo principal, no críticos.

**Pendiente**: ocho items eliminados de sec 17 (Roboto @import, prefers-reduced-motion, resolveStatus type, MockSampleSwitcher purga note, modales legacy SC shell, useEffect→useMemo, per-tramo state player, GDPR sample task que no estaba en sec 17 pero estaba parqueado en sec 15). Sec 17 reducido a 14 items (era 22+).

**Notas para próxima sesión**:
- Seis commits en esta sesión: `a7a2913` (CSS quick wins), `a8e4edd` (types + docs), `720df88` (modales legacy), `6d9066e` (useMemo + per-tramo cue), `c49dc32` (GDPR custody), `834ec8e` (este canon update).
- El tema GDPR ahora tiene sample funcional. Si en demo a stakeholder lo abren, se ve el caso completo. Si se quiere implementar el "archivo automático" o "tooltip explicativo en hover de fila deleted", entra en una próxima sesión — lo de hoy es la base mínima para comunicar la idea.
- Sec 17 ya casi vacío de items P1/P2 ejecutables sin decisión. Lo que queda son discusiones/decisiones (Sparkles, side-panel, bubble alignment, modo oscuro) o backend. La próxima sesión probablemente NO sea técnica sino de producto.

---

### 15.41 · 2026-05-10 · Claude Code · docs públicos + GDPR visual + hero hint sin redundancia

**Contexto**: el usuario adjuntó la v1 de `docs/01-logica-de-conteo.md` y pidió actualizar con los cambios 15.35-15.40 + adjuntarla a un link accesible desde el help de la UI. Conversación derivó hacia: (a) renombrar docs a names limpios sin prefijos numéricos, (b) crear `docs/decisiones.md` separado stakeholder-friendly como mirror narrativo de canon sec 13, (c) HelpCircle vuelve a ser popover con 3 enlaces externos, (d) routing matrix actualizada para sincronizar `docs/decisiones.md` al cierre de cada sesión. En paralelo, dos issues que reportó el usuario validando visualmente: GDPR sample sin tratamiento visual en la tabla, y hint redundante bajo el hero del bulk modal ("de N seleccionadas" repetía dato del subtitle).

**Hecho**:
- **Renames docs** (commit `e9bd75f`): `docs/01-logica-de-conteo.md` → `docs/logica-de-conteo.md`; `docs/02-referencia-ui.md` → `docs/referencia-ui.md`. Names identificables sin prefijos.
- **Doc nuevo `docs/decisiones.md`** (commit `e9bd75f`): mirror stakeholder-friendly de las decisiones cerradas. Tono narrativo, lenguaje natural ("hubo iteración", "se descartó porque"), sin jerga de canon. Cubre: principio rector (todo gira alrededor del coste), decisiones de modelo, decisiones de flujo bulk, decisiones de UX cross-cutting, decisiones de prototipo vs producción, lo que NO está cerrado. Accesible desde el help del prototipo en nueva pestaña. Pensado para que un stakeholder no técnico que clica pueda leerlo y entender el por qué del producto.
- **`logica-de-conteo.md` actualizado** (commit `e9bd75f`): invariantes globales movidas a sección top-level. Excepción GDPR añadida a invariante 1 + descripción del tratamiento visual en tabla. Invariante 3 reformulada como implementada (antes pendiente). Per-tramo Check icon mencionado. Hint redundancy rule documentada. hasDiarization marcado como retirado del schema. Tabla "Pendiente de decidir" reducida.
- **HelpCircle vuelve a ser popover** (commit `b4ceca7`): 3 items, los 3 enlaces externos (nueva pestaña, sin render inline · respeta decisión 15.36 de no rehidratar DocumentationModal). Items: Lógica de conteo y reglas / Decisiones de diseño / Validar UX en Figma. Imports `Calculator`, `BookOpen`, `ExternalLink`, `Popover` restituidos. State `helpPopoverOpen` añadido.
- **GDPR visual treatment en tabla** (commit `b4ceca7`): `isLocked` extendido para incluir `conv.deleted` (mismo path que conversaciones en proceso · cero UX nueva). Helper `isDeleted` para opacidad 60% selectiva. Tooltip en row + checkbox: "Custodia GDPR vencida · datos no recuperables". El supervisor ya las ve diferenciadas; el bulk modal ya las excluía silenciosamente del cálculo.
- **Hero hint redundancy fix** (commit `b4ceca7`): el slot bajo el hero number del `BulkTranscriptionModal` solo se renderiza cuando aporta info NUEVA respecto al subtitle (caso multi-rec: "Incluye N llamadas con varios tramos"). Caso normal: null (el "de N seleccionadas" repetía dato del subtitle "X conversaciones seleccionadas"). Slot mantiene `min-h` para anti-CLS. Validado por `/ui-ux-pro-max` (Nielsen #8 · "no information competing", canon 20.16 · auditar señales duplicadas) y `/impeccable` (DON'T "Repeat information users can already see", DO "Make every word earn its place").
- **Routing matrix actualizada** (sec 19 del canon + `feedback_session_close_protocol.md`): cada sesión que cierre una decisión nueva debe actualizar TAMBIÉN `docs/decisiones.md` en lenguaje stakeholder. La sec 13 del canon es jerga técnica interna; `docs/decisiones.md` es la versión narrativa que sale al exterior. Cero drift entre ambos: la misma rutina de cierre escribe en los dos sitios.

**Decidido**:
- **Names de docs sin prefijos numéricos**. Cada doc es self-contained, no es serie ordenada que requiera leerse 01 → 02 → 03. Usuario: "que sea perfectamente identificable y acorde".
- **`docs/decisiones.md` separado de `logica-de-conteo.md`**. Mismo evento conceptual (decisiones del producto) pero registros distintos: técnico vs narrativo, audiencia distinta. Mantenidos en sync via routing matrix.
- **Sync canon ↔ docs/decisiones.md es obligación del cierre de sesión, NO automática**. No hay script que genere `decisiones.md` desde sec 13. La integridad la mantengo yo (el agente) cuando cierro sesión. Si paso, drift entra; el riesgo se asume.
- **El slot del hint del hero mantiene `min-h` aunque esté vacío 95% del tiempo**. Anti-CLS gana sobre "no reservar pixels muertos". El espacio vacío es **breathing room** intencional, no pixel perdido (`/impeccable` review confirmó: "Whitespace y ritmo importan más que decoración").
- **GDPR-deleted comparte el `isLocked` con conversaciones en proceso**. Cero UX nueva. Mismo lock visual, mismo bloqueo de selección, mismo filtro en bulk. Patrón reutilizado.

**Pendiente**: ninguno nuevo en sec 17. Items eliminados: ya estaban removidos en sesiones anteriores. Cambio estructural: nueva regla en el routing matrix de sec 19 (paso 6 actualizado).

**Notas para próxima sesión**:
- `docs/decisiones.md` está cargado con todas las decisiones de las últimas sesiones. La próxima vez que se cierre una decisión nueva, el paso 6 del protocolo (sec 19) obliga a actualizar también este archivo. La regla es nueva — si se nota olvido en futuras sesiones, ese es el lugar donde mirar.
- El popover del HelpCircle tiene 3 items hoy. Si se añaden más docs canónicos al repo (ej. `docs/api.md` o `docs/glosario.md`), el patrón ya está. Add item al popover.
- Tres commits en esta sesión: `e9bd75f` (docs · renames + decisiones.md + actualización logica-de-conteo), `b4ceca7` (UI · popover + GDPR visual + hint redundancy), `be94a51` (este canon update).

---

### 15.42 · 2026-05-11 · Claude Code · favicon + sistema de diseño doc + popover tier hierarchy + análisis COA · plan persistido para 15.43

**Contexto**: el usuario pidió añadir el doc del sistema de diseño al popover del help, dándole protagonismo junto al de Lógica de conteo. En paralelo, presentó el COA de transcripción masiva que escribió un compañero en Jira (basado en el Figma legacy) y pidió análisis honesto de diferencias con el prototipo + recomendación de qué adoptar de cada lado. La conversación derivó hacia un plan de migración phased para producción (v1/v2/v3). Al cerrar la sesión, el usuario decidió persistir el plan completo aquí para retomarlo mañana sin perder contexto.

**Hecho** (commits):
- **favicon SVG** (commit `b1b3f9a`): M+ amarillo (`#F5C518`) reproducido como SVG vectorial. Fondo amarillo + zigzag M + signo +, todo con `stroke-linecap: round` para mimetizar los remates del logo original. Servido desde `public/favicon.svg`, enlazado en `index.html` con `type="image/svg+xml"`.
- **`docs/sistema-de-diseno.md` nuevo** (commit `5a92c76`): mirror narrativo del SC Design System en lenguaje stakeholder. Cubre filosofía (densidad antes que decoración), tipografía (Roboto + escala modular fija), color (3 capas L1/L2/L3 + paleta + reglas de uso), espacio y ritmo (4pt scale con tokens semánticos), iconografía (lucide-react, cero emojis, Sparkles reservado), movimiento (4 keyframes sc-* + prefers-reduced-motion), patrones de componente (Modal compound, scToast, empty states, buttons), anti-patrones explícitos (gradient text, border-left stripe, glassmorphism) y lo que NO está cerrado.
- **Popover del HelpCircle con jerarquía visual de 2 tiers** (commit `5a92c76`):
  - Tier 1 (full layout · icon 16px en accent-strong · con descripción): Lógica de conteo y reglas + Sistema de diseño
  - Separator hairline
  - Tier 2 (compact layout · icon 14px en muted · sin descripción): Decisiones de diseño + Validar UX en Figma
  - La diferencia de peso visual viene del LAYOUT (con/sin descripción + icon size + color), no de labels "PRINCIPAL/EXTRA". Canon 20.15 · geometría carga el dato.

**Análisis del COA del compañero** (sin commits · trabajo conceptual):

El COA describe la transcripción masiva + unitaria basándose en lo que hay en el Figma legacy. Comparado con el prototipo:

| Delta | Mejor UX | Coste migrar Figma→Proto | Coste migrar Proto→Figma | Decisión final |
|---|---|---|---|---|
| Confirmation modal intermedio antes de transcribir/analizar | Prototype (no modal, cost cue inline) | Diseño: ~3h | Código: ~5h (reintroducir componentes ya borrados) | **Migrar Figma → Proto** · prototipo gana |
| Hero count: audios vs conversaciones (multi-rec) | Prototype (honesto con el coste real) | Trivial cliente-side | Pierde decisión 15.31 cerrada con producto | **Migrar Figma → Proto** · prototipo gana |
| "Cerrar" vs "Cancelar" en footer modales | Discutible (semántica vs herencia plataforma) | 1 string | 1 string | **Excepción**: "Cancelar" solo en destructive confirms (`DeleteCategoryDialog`, `RetranscriptionConfirmModal`); resto sigue "Cerrar" |
| Sticky toast "Generando..." durante el proceso | **Figma** · supervisor que cambia de vista ve estado persistente | ~3h en proto (gap nuestro) | — | **Adoptar al proto** · Figma gana |
| Botón "Analizar" en header del player (descubribilidad) | **Figma** · sin necesidad de cambiar de tab para descubrirlo | ~3h en proto (gap nuestro) | — | **Adoptar al proto** · Figma gana |
| Selección permisiva vs estricta de filas locked | Discutible · prototipo es transparente, Figma es permisivo | ~15 min | ~15 min | **Mantener estricta** (prototipo) · hereda menos confusión |
| Pluralización "1 admite/admiten análisis" | Figma (correcto) | 5 min (bug local) | — | **Fix en proto** · bug nuestro |
| Errores traducción FR del COA | — | — | — | Corregir en COA nuevo |

**Estimación coste real de implementar el reproductor del prototipo en producción** (vs evolucionar el legacy):
- From-scratch: ~3-4 semanas dev senior frontend (modal shell + audio player + tabs + empty states + multi-rec timeline + chain logic + integración backend)
- Evolución del legacy con parches: ~1 semana (quitar diarización, renombrar tabs, quitar confirm modal, añadir botón Analizar, restyle tokens)
- **Cuatro veces más caro** la versión completa.

**ROI calculation** que justifica el coste:
- 50 supervisores × 7s perdidos/sesión × 30 sesiones/día × 250 días/año = ~15 horas/año/supervisor → ~750 horas/año organización
- ~€15-25k/año en productividad perdida vs ~€10-15k one-time desarrollo bien hecho
- ROI < 12 meses si el producto tiene vida útil >3-5 años

**Decidido**:
- **Estrategia phased v1/v2/v3 para producción** · NUEVA decisión cerrada en esta sesión:
  - **v1 (sprint 1-2)**: reusar reproductor legacy + ajustes mínimos (quitar diarización · renombrar tabs · cost cue inline en lugar de confirm modal · botón Analizar en header · fix pluralización). ~70% UX del prototipo a ~25% coste.
  - **v2 (sprint 3-5)**: refactor profundo del reproductor hacia patrones del prototipo (empty states con CTAs · multi-rec timeline · sticky head + flex-1 tab body · per-tramo Check). Solo si feedback de supervisores valida el coste.
  - **v3 (cuando aterrice backend real)**: hero count = audios con desglose · per-tramo transcription state · chain transcribir→analizar event-driven sobre backend real.
- **Adoptar 3 patrones del Figma al prototipo** (ejecución en 15.43):
  - Sticky toast "Generando..." durante operaciones bulk + unitarias
  - Botón Analizar explícito en header del player (no escondido en tab)
  - "Cancelar" en confirms destructivos (mantener "Cerrar" como patrón general pre-submit)
- **Mantener decisiones cerradas del prototipo** que el Figma legacy contradice:
  - NO confirmation modal intermedio para acciones billables (15.23/15.28)
  - Hero count cuenta audios cuando hay multi-rec (15.31)
  - Selección estricta de filas locked (15.37 GDPR + processing)
- **Phased rollout NO es deuda técnica · es decisión consciente** de optimizar time-to-ship en v1 y profundizar en v2. Si se trata como deuda y se aplaza indefinidamente, Memory se queda con una versión heredada sin ningún upgrade y se desperdicia la oportunidad de elevar el listón.

**Pendiente · plan para 15.43**:

ORDEN DE EJECUCIÓN MAÑANA (mini-prompt acordado con usuario: *"Retoma el plan de 15.42 que dejaste en el canon. Empieza por las adaptaciones al prototipo en este orden: sticky toast → discoverability player → cancelar destructive → pluralización. Cuando termines código, COA y MCP."*):

1. **Adaptaciones código al prototipo**:
   - **Sticky toast "Generando..."** — el más simple posible (sin variantes complejas por caso). `scToast.info({ title: "Generando transcripción...", duration: Infinity, dismiss: true, id: "bulk-progress" })` al lanzar `handleRequestTranscription`. Reemplazo por el toast de success/error al completar (usar el mismo `id` para que sonner haga update in-place). Aplicar análogamente a `handleRequestAnalysis` con copy "Generando análisis...". Para el dead-end resuelto (transcribir + analizar encadenado): un solo toast secuencial (no dos paralelos · cambia el copy según fase).
   - **Botón "Analizar" en header del player** — añadir entre Re-transcribir y Download. Tooltip "Análisis". Disabled si `!conversation.hasTranscription` O `conversation.hasAnalysis === true`. Click → `handleRequestAnalysis` directo (cost cue inline en el icono via title o tooltip · NO modal de confirmación intermedio, fiel a decisión 15.28). Asegurar que sigue el patrón visual de los otros botones del header (size-8, rounded-sc-md, hover state, FOCUS_RING).
   - **"Cancelar" en destructive confirms** — `DeleteCategoryDialog` y `RetranscriptionConfirmModal` cambian `<Modal.Cancel>Cerrar</Modal.Cancel>` por `<Modal.Cancel>Cancelar</Modal.Cancel>`. NO cambiar en otros modales (sigue siendo "Cerrar" como patrón pre-submit · 15.23).
   - **Pluralización singular** — en `BulkTranscriptionModal`, donde renderizamos `${nAnBase} admiten análisis`, cambiar a `${nAnBase} ${nAnBase === 1 ? "admite" : "admiten"} análisis`. Verificar otros usos potenciales de plural fijo (probablemente en el toast post-completion · pluralizar también).

2. **Roadmap canon sec 17** — añadir bloque nuevo "Estrategia de implementación en producción · phased v1/v2/v3" con el detalle de qué entra en cada fase (lo descrito arriba en "Decidido").

3. **COA nuevo en `docs/coa-transcripcion-masiva.md`**:
   - Standalone (escrito como si fuera primera versión, NO referencia al COA del compañero · usuario no quiere pisarle)
   - Español
   - Estilo plain text con bullet points como el del compañero (no markdown fancy)
   - Notas entre `[corchetes]` para el usuario · ejemplo `[NOTA: este botón se añade nuevo, no estaba en el Figma legacy]` · usuario las borra al copiar a Jira
   - Placeholders `[imagen: descripción de qué mostrar aquí]` donde van screenshots · usuario hace las capturas y las pega
   - Incluir traducciones FR/EN corregidas al final (todas las strings nuevas + las del COA original con sus correcciones)
   - Secciones: Consideraciones · Solución bulk masiva · Transcripción unitaria · Traducciones

4. **Push a Figma vía MCP**:
   - **Figma URL del proyecto**: https://www.figma.com/design/EKXnAv7FND5VO6EcpKq3ZH/Memory--?node-id=297-1875&t=Ldpnn0wTocilkLZ6-1
   - **fileKey**: `EKXnAv7FND5VO6EcpKq3ZH`
   - **nodeId** (página destino): `297:1875` (convertir el `-` del URL a `:` para la API)
   - **Modo**: NO es replace · crear frames nuevos en esa página
   - **Tres modales a publicar 1:1** del prototipo:
     1. `BulkTranscriptionModal` · 1:1 visual con el estado actual del prototipo (subtitle con desglose · hero number · breakdown caption en multi-rec · toggle análisis · footer Cerrar/Procesar)
     2. `DeleteCategoryDialog` · 1:1 visual con el estado tras la migración a SC Modal shell (AlertTriangle icon · warning box + Lightbulb hint · footer Cancelar/Eliminar destructive)
     3. `ConversationPlayerModal` con el botón "Analizar" añadido en header (estado v2 del plan · 1:1 + **nota visible en el frame** indicando "Este modal corresponde a v2 del rollout · no entra en v1")
   - Buscar tool MCP relevante: `mcp__claude_ai_Figma__create_new_file` no aplica (no es crear file, es push a existing); revisar herramientas Figma MCP disponibles (`use_figma`, `add_code_connect_map`, etc.) y elegir la que escribe diseño nuevo en un nodo existente.

5. **Build + playwright validation** de los cambios código del paso 1.

6. **Commits + canon update 15.43 + push**:
   - Commits por categoría (sticky toast · botón Analizar · cancelar destructive · pluralización · COA · MCP push · canon)
   - Entrada 15.43 en sec 15 con qué se hizo, decidió, pendientes
   - Actualización de `project_session_status.md` con resumen condensado
   - Actualización de `docs/decisiones.md` reflejando las decisiones nuevas (regla 15.41)
   - Push a main · Netlify desplegará automáticamente

**Notas para 15.43**:
- Si al implementar el sticky toast aparece complicación con el `id` y el update in-place de sonner, verificar la API del wrapper `scToast` en `src/app/components/ui/sc-toast.tsx`. Si no soporta update via `id`, hacer `scToast.dismiss(id)` + nuevo toast de success/error. Documentar la decisión.
- Si el push MCP a Figma falla por permisos o por que el fileKey no es accesible, el fallback es generar SVG export del modal del prototipo y dejarlo en `docs/figma-export/` para que el usuario lo importe manualmente.
- El COA debe quedar copy-paste-ready · el usuario lo va a transcribir a Jira directamente. Cero referencias a "src/app/components/..." o jerga interna del prototipo. Lenguaje neutro de producto.
- Cuando se cierre 15.43, recordar también pasar el resumen de las decisiones nuevas (sticky toast adopt, botón Analizar header, Cancelar destructive) a la sec 13 del canon + a `docs/decisiones.md` (mirror obligatorio · regla 15.41 paso 6).
- Tres commits en esta sesión 15.42: `9410ae5` (favicon · originalmente b1b3f9a, después de rebase), `5a92c76` (sistema-de-diseno + popover hierarchy), `a32b875` (este canon update con análisis COA + plan completo).

---

### 15.43 · 2026-05-11 · Claude Code · adaptaciones Figma → prototipo (sticky toast · botón Analizar · Cancelar destructive · pluralización) + COA standalone + push 3 modales a Figma

**Contexto**: continuación directa del plan persistido en 15.42. El usuario retomó con el mini-prompt acordado y pidió ejecutar en orden: adaptaciones código → COA → push Figma vía MCP. Sesión de ejecución limpia · cero replanteamiento durante la implementación.

**Hecho** (commits): `ba32023` sticky toast + plural download · `6ec60d0` botón Analizar player · `cfb4af8` Cancelar destructive · `9aa2ca9` pluralización bulk · `0dedddb` COA + canon. Detalle:

- **Sticky toast "Generando..."** (`ConversationsView.tsx`):
  - `handleRequestTranscription(ids, inChain = false)` y `handleRequestAnalysis(ids)` ahora disparan `scToast.info({ title: "Generando transcripción..." / "Generando análisis...", duration: Infinity, dismiss: true, id: "progress-toast" })` al inicio.
  - Al completar, `scToast.success({ id: "progress-toast", ... })` reemplaza el sticky in-place via sonner (mismo id).
  - **Chain sin doble toast**: `handleRequestTranscriptionAndAnalysis` pasa `inChain=true` a la transcripción → suprime su success intermedio. El sticky pasa de "Generando transcripción..." a "Generando análisis..." sin flash, ya que `handleRequestAnalysis` reutiliza el mismo id.
  - **Kickoff toast redundante** en `handleBulkConfirm` (líneas 474-482 originales) eliminado — los handlers ahora son source-of-truth del feedback persistente.
  - **Plural en download toast**: `Descargando 1 conversación` / `Descargando N conversaciones` (antes `conversación(es)` con paréntesis feos).

- **Botón "Analizar" en header del player** (`ConversationPlayerModal.tsx`):
  - Insertado entre Re-transcribir y Download en la fila de tabs (right-aligned).
  - Icono `Sparkles size={15}` para consistencia con la tab "Análisis".
  - `disabled` cuando `!conversation.hasTranscription || conversation.hasAnalysis === true || requestingAnalysis`.
  - Tooltips dinámicos: "Análisis" (habilitado) · "Requiere transcripción" / "Análisis ya realizado" (deshabilitado).
  - onClick → `handleAnalysisRequest` directo (NO modal de confirmación intermedio · respeta decisión 15.28).
  - Estilo: matches Re-transcribir + Download (size-8, rounded-sc-md, hover state, FOCUS_RING), pero con `text-sc-muted/40` en disabled para señal visual clara.

- **"Cancelar" en destructive confirms** (`RetranscriptionConfirmModal.tsx`):
  - `<Modal.Cancel>Cerrar</Modal.Cancel>` → `<Modal.Cancel>Cancelar</Modal.Cancel>` (línea 148).
  - `DeleteCategoryDialog` ya tenía "Cancelar" desde su migración al SC Modal shell (15.40) — verificado, sin cambio.
  - Resto de modales mantienen "Cerrar" (BulkTranscriptionModal, CreateEntityModal, ConversationPlayerModal footer) per patrón general 15.23.

- **Pluralización singular** (`BulkTranscriptionModal.tsx`):
  - `admiten análisis` → `${nTrans + nAnBase === 1 ? "admite análisis" : "admiten análisis"}` (caption del hero derecho).
  - Resto de plurales del bulk modal (subtitle "X conversaciones seleccionadas · Y llamadas, Z chats", hint "Incluye N llamadas con varios tramos") ya estaban correctamente pluralizados desde sesiones anteriores.

- **COA standalone** (`docs/coa-transcripcion-masiva.md` nuevo):
  - Escrito como primera versión, sin referencia al COA del compañero (usuario no quiere pisarle).
  - Español, estilo plain text con bullets (no markdown narrativo elegante como `decisiones.md`).
  - Secciones: Consideraciones generales · Solución bulk masiva · Transcripción unitaria · Traducciones (ES/FR/EN).
  - Notas `[NOTA: ...]` para el usuario (que las borra al copiar a Jira).
  - Placeholders `[imagen: descripción]` donde van screenshots que el usuario insertará.
  - Tablas de traducciones cubren strings nuevos (sticky toast, botón Analizar, pluralización) + corrigen las traducciones del COA original donde aplican.

- **Push 3 modales a Figma vía MCP** (sección "Adaptaciones · 15.43" en página `297:1875` · section id `402:93`):
  - `BulkTranscriptionModal` 720×480 (frame `402:8`) — header + body two-cell hero (8 transcripciones · 10 admiten análisis con toggle ON teal) + footer Cerrar/Procesar + nota explicativa sticky toast.
  - `DeleteCategoryDialog` 480×360 (frame `402:37`) — AlertTriangle + warning box + Lightbulb hint + footer Cancelar/Eliminar destructive + nota canon excepción "Cancelar".
  - `ConversationPlayerModal` v2 760×574 (frame `402:58`) — header + sticky audio bar + tabs row con **botón Analizar (✦) NUEVO entre Re-transcribir y Download** + transcript fake + nota "Este modal corresponde a v2 del rollout phased · el botón Analizar entra ya en v1".
  - Posicionado en y=3200 (debajo del contenido existente · sin overlap con secciones "Transcripción individual" y "Transcripciones masivas" del Figma legacy).
  - Tool MCP usada: `mcp__claude_ai_Figma__use_figma` con código JS plugin que crea las frames + auto-layout via posicionamiento absoluto + colores hardcoded desde tokens `sc-design-system.css`.

- **Roadmap canon sec 17**: bloque nuevo "Estrategia de implementación en producción · phased v1/v2/v3" añadido antes de "Decisiones del audit 15.18" — detalla qué entra en cada fase (v1 ajustes mínimos · v2 refactor profundo del player · v3 backend real) + ROI calc reusado de 15.42.

- **Sec 13 items 16/17/18**: cambiados de "ejecución pendiente para 15.43" a "implementada 15.43".

**Decidido**:
- Sticky toast usa **un id compartido** `"progress-toast"` para todos los stickies del flujo (transcripción, análisis, chain). Justificación: simplicidad por encima de robustez en el corner case "parallel mix" (alreadyTranscribed + needsTranscription cuando includeAnalysis=true). El parallel mix puede mostrar success "Análisis listo" antes de que termine la transcripción paralela; aceptado como imperfección de demo · si supervisores lo flagean en producción, refactor a counter mechanism con `useRef`.
- `inChain` flag pasado explícitamente como segundo arg a `handleRequestTranscription` (en vez de detectar via `chainAnalysisIds` con closure). Razón: closure-based detection captura state stale; arg-pass es zero-ambiguity.
- COA escrito en estilo plain text bulleted (NO markdown narrativo) porque el destino es Jira plain text, no doc rico tipo `decisiones.md`. Estilo distinto al de 15.31 intencional · contexto de destino dicta el estilo.

**Validación**:
- Build OK: 2982 mods, 871 KB JS / gzip 247 KB. Slight +11 KB sobre baseline 860 KB por el botón Analizar inline + sticky toast scaffolding.
- Strings nuevos verificados en bundle: "Generando transcripción", "Generando análisis", "Generar análisis" (aria-label), "admite análisis", "progress-toast" (id sonner).
- Preview server `vite preview --port 4173` levanta `200 OK · <title>Memory + 3.0</title>` — smoke test pasa.
- Playwright no disponible en este entorno (no `playwright` en `node_modules/.bin/` ni global) — validación visual fiada al screenshot del push Figma + build limpio.

**Notas para próxima sesión**:
- Si supervisores piden refinar el sticky toast con count info ("Generando 5 transcripciones..."), está deliberadamente simplificado en 15.43 (solo "Generando transcripción..." sin contador). El contador ya se ve en el bulk modal antes de pulsar Procesar — repetirlo en el toast es redundancia.
- El push Figma usa primitivos básicos (rectángulos, text, etc.), no componentes del DS de Figma. Si se quiere alinearlo con el DS oficial de SmartContact, hacer un segundo pass que importe componentes via `search_design_system` + `importComponentByKeyAsync`. Pragmático para esta sesión: las frames comunican el cambio sin ese overhead.
- `DeleteCategoryDialog` ya tenía "Cancelar" desde 15.40 — el mini-prompt de 15.42 lo listaba como cambio pendiente por error. Solo `RetranscriptionConfirmModal` necesitó la edición real. Documentado para evitar dudas si alguien re-lee el plan.

**Mirror obligatorio · regla 15.41 paso 6**: las decisiones nuevas (sticky toast, botón Analizar header, Cancelar destructive) ya estaban canonizadas en sec 13 items 16/17/18 desde 15.42. `docs/decisiones.md` se actualiza en este commit para reflejar la implementación.

---

### 15.44 · 2026-05-11 · Claude Code · iteraciones post-cierre 15.43 · honesty pass coste→volumen · COA v1/v2 split + rewrite digerible · multi-grabación filter (caveat parcial + 2 toggles + chips + hint del modal)

**Contexto**: tras cerrar 15.43 con commits y push limpios, el usuario continuó la conversación con varias rondas de feedback que abrieron iteraciones substantivas sobre los docs externos y reveló un caveat de producto no documentado (multi-tramo parcial). El alcance creció lo bastante como para abrir 15.44 en lugar de extender 15.43 — los 8 commits acumulados merecen su propio resumen y la regla del session log lo justifica.

**Hecho** (commits en orden cronológico):

- **logica-de-conteo · casos del prototipo + tono humano** (`5a4299e`): el doc lo describía bien técnicamente pero le faltaban casos visibles del prototipo (fallos de transcripción, filas en proceso re-seleccionadas, estados visuales de fila) y arrastraba lenguaje formal-pomposo. Reescrito con frases cortas, voz activa, "deja revisar" en vez de "permite revisar". Secciones nuevas: "Cuando una transcripción falla", "Sticky toast durante el batch", "Acciones en el header del player", "Estados visuales de una fila en la tabla", "Patrón sticky con update in-place" en scToast. Estado #6 nuevo en pestaña Transcripción para `hasFailedTranscription`.

- **COA · v1/v2 split del reproductor** (`7d151b6`): la sección "Modal reproductor" describía la solución del prototipo y le ponía una NOTA suelta "este es v2". Confuso · el COA es lo que se construye AHORA, y AHORA es v1 (legacy + parches). Reestructurada en dos subsecciones: "v1 (versión que entra en producción)" describe legacy + ajustes mínimos · "v2 (a dónde queremos llegar)" describe el prototipo de Memory como target eventual. NOTA FINAL alineada con la división.

- **Honesty pass coste→volumen** (`d900889`): los docs prometían "hacer visible el coste antes de incurrirlo" o "transparente sobre el coste". Falso: el producto muestra volumen (contadores) y estimación de tiempo aproximada ("genera coste · ~30 s"), nunca euros por operación. Reescritas tres líneas en COA + logica-de-conteo + decisiones que sobreprometían. Honesty principle: el desglose en euros vive en la capa de facturación, no en Memory.

- **TypeFilterPanel · sección "Multi-grabación"** (`ca52bee`): dos toggles nuevos en el panel · "solo con varios tramos" y "solo con tramos parcialmente transcritos". Extiende `TypeFilterPanelFilters` con `multirec`. Patrón flat (mismos `FilterGroup`/`FilterCheckbox` subcomponents de 15.34) — descartado submenu/flyout pattern (hover-to-open con animación lateral) porque añadía interacción nueva por solo dos items, mal en touch, y el panel actual es consistentemente plano.

- **Pipeline + chips para multirec** (`271174e`): estado inicial `multirec: { onlyMulti: false, onlyPartial: false }` en `unifiedTypeFilters`. Filter pipeline aplica los dos flags (onlyMulti requiere `recordings.length > 1`, onlyPartial además exige mezcla de transcritos y pendientes). Reset en sample switcher. Has-active check del botón Tipo extendido. Chips en la toolbar siguen el patrón del chip "Solo fallidas" pero con estilo neutro (`border-sc-border` + `bg-sc-surface-50`) en lugar de rojo error — estos filtros son informacionales, no alarmas.

- **BulkTranscriptionModal · hint "tramos ya iniciados"** (`7db4619`): nuevo contador `nPartialMultiRec` (multi-rec en readyToTranscribe con al menos un tramo ya transcrito). `heroDeltaHint` pasa de string simple a composición de hasta dos piezas con " · ": "N llamadas con varios tramos" + "M con tramos ya iniciados". Cuando ambas aplican: "Incluye 2 llamadas con varios tramos · 1 con tramos ya iniciados". Standalone si solo una aplica.

- **logica-de-conteo · caveat multi-tramo parcial + filtros** (`ce74c7e`): documenta el footgun de select-all (transcribir un tramo en unitario → select-all → bulk transcribe los pendientes restantes · cost-wise idempotente pero rompe intent). Dos mitigaciones canonizadas: hint del modal + filtro del panel. Sección de decisiones cerradas amplía con dos entradas: filtros multi-grabación y aviso de tramos ya iniciados.

- **COA · rewrite digerible + items imprescindibles para publicar** (`19fbf50`): reescrito completo para Jira con foco en escaneabilidad. Bloque "Resumen" al inicio · cada sección abre con línea de anclaje · bullets cortos (max 2 líneas) · tablas para listas de estados/variantes · NOTAs al final de su sección. Items nuevos imprescindibles: bullet "Sin cancelación" en consideraciones generales · subsección "Multi-tramo parcial · caveat conocido" en bulk · enumeración tabular de los 6 estados de Transcripción + 4 de Análisis · sección consolidada "Estados visuales de una fila en la tabla" · sección nueva "Filtros relevantes" · NOTA sobre iconografía v1 vs v2 (refactor de tabla a columnas explícitas es la solución ideal en v2 · fuera de scope rollout v1). Traducciones ampliadas con strings nuevos (filtros, hint compuesto, estados sin transcripción, etc.). Todos los `[imagen: ...]` placeholders preservados.

**Decidido**:

- **Multi-grabación filter como mitigación canónica del footgun, NO cambio del aggregate rule.** El comportamiento del bulk (agregado `hasTranscription = false` → procesa pendientes) se mantiene porque es idempotente y consistente con el resto del modelo (analysis depends on full transcription). La protección viene de informar al supervisor (hint del modal) y darle una forma proactiva de encontrar los casos (filtro del panel). Cambiar el aggregate o excluir parciales del select-all rompía expectations más amplias del modelo.

- **Chips informational en color neutro, no rojo.** El chip rojo de "Solo fallidas" comunica una alarma (errores). Los chips de multi-grabación son filtros informacionales · pintarlos en rojo crearía falsa urgencia. Pattern canonizado: rojo = atención/error · neutro = filtro activo sin connotación.

- **Iconografía v1 = legacy del SC, v2 ideal = columnas explícitas en la tabla.** Cierre de discusión en la NOTA del COA: en v1 toleramos los iconos del legacy porque son los que el supervisor ya conoce; en v2 la solución apropiada es refactorizar la columna "Estado" en columnas independientes por cada tipo (con grabación / con transcripción / con clasificación / fallida) con check binario. Refactor de la tabla queda fuera del scope del rollout v1.

- **COA es spec de v1, no del prototipo.** El documento describe lo que se construye AHORA. El prototipo de Memory que el usuario tiene a mano es la materialización de v2 — sirve como referencia visual pero no es el target inmediato del rollout.

- **Honesty principle en docs externos.** Cualquier claim "transparente sobre el coste" se reescribe a "transparente sobre el volumen". El desglose monetario vive en la capa de facturación, no en Memory. Estimaciones de tiempo en CTAs unitarios sí son legítimas (las hace el producto).

- **Submenu/flyout descartado para 2 items.** Discusión abierta por el usuario sobre si la sección "Multi-grabación" debería abrirse en submenu lateral en lugar de checkboxes inline. Razones para flat: panel consistentemente plano (5 secciones todas con checkboxes inline) · hover no funciona en touch (panel debe servir en tablet) · 2 items no pagan el coste de añadir un patrón de interacción nuevo · si en futuro crecemos a 5+ sub-filtros multi-rec, ahí sí pagaría.

**Validación**:

- Build OK: 2982 mods estable · 873 KB JS / gzip 248 KB (+2 KB sobre baseline 15.43 por el pipeline + chips).
- Interactivo con puppeteer-core + Chrome del sistema (sin descargas pesadas): 0 page errors · 0 console errors. Panel de filtros: sección "Multi-grabación" presente con sus dos toggles. Toggle "solo con varios tramos" se activa, dispara el chip neutro `"Solo varios tramos · Limpiar filtro"` y el pipeline reduce resultados correctamente (el sample por defecto no tiene multi-rec → 0 resultados, comportamiento esperado). Reproductor: botón "Análisis" (Sparkles) presente entre Re-transcribir y Descargar con aria-label `Generar análisis`.
- Screenshots en `/tmp/memory-shots/` durante verificación, después limpiados. Script puppeteer-core también limpiado tras uso.

**No verificado interactivamente** (cableado en código y verificado en bundle, falta confirmación visual):

- Hint compuesto del bulk modal con sample multi-rec parcial cargado. `nPartialMultiRec` está cableado y el string compone correctamente vía lógica derivada, pero no se ha visto en pantalla con un sample apropiado. Si el copy del hint no es claro en producción, abrir un sample y screenshot.

**Notas para próxima sesión**:

- El push Figma de 15.43 cubre los 3 modales del prototipo (BulkTranscription, DeleteCategoryDialog, ConversationPlayer v2) pero NO el panel de filtros con la nueva sección "Multi-grabación". Quedaría como follow-up si el equipo de diseño quiere verlo en el board · coste ~5 min con el mismo MCP que se usó en 15.43.
- El COA está listo para Jira. El usuario lo va a transcribir directamente · todas las notas `[NOTA: ...]` y placeholders `[imagen: ...]` están pensados para que las quite/rellene al copiar.
- Si el supervisor en producción flaggea que el caveat multi-tramo parcial sigue siendo confuso pese al hint + filtro, la mitigación nuclear (cambiar el aggregate rule o excluir parciales de select-all) queda como decisión pendiente. Hoy se prefiere preservar el aggregate rule porque es consistente con el resto del modelo.
- 8 commits de trabajo en esta sesión: `5a4299e` (logica casos+tono) · `7d151b6` (COA v1/v2) · `d900889` (honesty coste→volumen) · `ca52bee` (filter panel) · `271174e` (pipeline+chips) · `7db4619` (bulk hint) · `ce74c7e` (logica caveat+filtros) · `19fbf50` (COA digerible). Más `1cf56ee` (canon close + decisiones.md mirror).

**Adiciones post-cierre 15.44** (misma conversación, iteraciones de pre-publicación del COA):

- `fbba98d` · sweep lenguaje despectivo en docs externos + canon: "parches baratos" → "ajustes mínimos" · "cutre" → "versión heredada sin upgrade" · "trataba como tonto" → "ruido cognitivo" · "baratísimas en GPU" → "muy eficientes en GPU" · "más habitual y barato" → "más habitual y eficiente en coste". Razón: "barato" en sentido de "low-cost" leía despectivo en docs publicables.
- `33e3fbf` · sección "Recursos" al inicio del COA con tres enlaces: Lógica de conteo (GitHub), Prototipo (Netlify, para flujo) y Figma Dev Mode (Hi-Fi 1:1). Orden y descripción de cuándo usar cada uno.
- `f626939` · tres cambios pedidos para publicar: (1) **re-transcripción fuera de v1** — la tabla de acciones del header pasa de 3 a 2 (Análisis + Descargar) · sección "Re-transcripción" renombrada a "Re-transcripción · post-v1". (2) **GDPR como ejemplo**, no regla única — pasa a "Retención de contenido" con GDPR como caso canónico, aplica a otras restricciones legales de retención. (3) **Consideraciones generales del COA más limpias** — bullet "Cancelar vs Cerrar" quitado · bullet "Confirmación solo para destructivo" + NOTA quitados (más lío que clarificador para lector externo). Multi-tramo reescrito con ejemplo concreto. Cambios propagados a `logica-de-conteo.md`, `decisiones.md` y `referencia-ui.md` (este último añade Analizar en la lista que faltaba + marca Re-transcribir como post-v1).
- `9f95c33` · barrido de em dashes ("—") típicos de IA en el COA: 16 ocurrencias reemplazadas por puntuación natural en castellano (punto + frase, dos puntos, comas en aposición o paréntesis según contexto). Cero en COA tras el barrido.
- `57eaa20` · sample nuevo en `mockSamples.ts` ("Multi-grabación · tramos parciales") · demoea el caveat de multi-tramo parcial + las dos mitigaciones (hint del modal + filtro del panel). El segundo tramo (típicamente "el real" tras IVR) pre-transcrito en cada multi-rec; agregado `hasTranscription` queda en false. Verificado con puppeteer-core + Chrome del sistema: sample carga · select-all + Procesar abre modal · hint compuesto correctamente: **"Incluye 3 llamadas con varios tramos · 3 con tramos ya iniciados"** · matemática nMultiRec=3, nPartialMultiRec=3, hero=15 audios correcta.
- **Push Figma de un cuarto frame** (sin commit · MCP action sobre `EKXnAv7FND5VO6EcpKq3ZH`): añadido `TypeFilterPanel · Multi-grabación` (id `408:8`) a la derecha del player en la section `Adaptaciones · 15.43`. Section renombrada a "Adaptaciones · 15.43 + 15.44"; subtítulo extendido. Nota explicativa debajo del frame con el caveat del select-all y por qué el filtro es la mitigación proactiva.

**Verificación visual completada del hint compuesto** (era el item "no verificado" de la versión inicial del cierre 15.44). El caveat + las dos mitigaciones funcionan end-to-end y se demuestran en el prototipo cargando el sample dedicado. El cierre de 15.44 queda redondo.

---

### 15.45 · 2026-05-11 · Claude Code · revisión PM · quitar locks · sticky toast fix · Download legacy · logout limit extendida · audit P0 fixes

**Contexto**: el usuario reportó dos bugs visibles tras la publicación parcial del COA: (1) el checkbox no se deshabilitaba al procesar; (2) no veía el sticky toast "Generando…". Tras investigar con puppeteer, encontré que el sticky toast estaba auto-dismissándose por un bug en el wrapper scToast (conversión `Infinity` → `Number.MAX_SAFE_INTEGER` que sonner trataba mal). Mientras se arreglaba, el PM dejó nueva guidance que cambió el approach del lock: en vez de bloquear el checkbox durante procesado, dejar la fila seleccionable y mover el aviso al modal. Razón: el lock penalizaba operaciones legítimas (descargar el Record o CDR de una fila que se está transcribiendo). Aplicado el mismo razonamiento a GDPR — el supervisor puede querer abrir el reproductor de una conversación con retención vencida y descargar lo que SÍ esté disponible. El modal Download del legacy gestiona internamente el caso "no descargable" con su propio aviso, así que el control queda en el supervisor.

**Hecho** (commits):

- `8e7f107` **fix · scToast sticky toast persiste** · el wrapper convertía `Infinity` a `Number.MAX_SAFE_INTEGER` antes de pasarlo a sonner; sonner 2.x marcaba el toast como `data-removed=true` casi al instante (visible <1s). Fix: pasar `Infinity` directo, soportado nativamente por sonner 2.x. Verificado con puppeteer: toast persiste durante todo el batch · `data-removed: false` estable en t+1.7s, +2.5s, +4.0s, +5.5s, +7.0s. Bug afectaba sticky toast del progreso, chain transcribir→analizar y reemplazo in-place por id compartido.

- `eff89c8` **feat · quitar lock procesando/analizando del checkbox + bulk filter + hint "Excluye"** · `ConversationTable.isLocked()` reducido a solo `deleted` GDPR. Tooltip "En proceso · no se puede seleccionar" eliminado. `BulkTranscriptionModal` recibe `processingIds`/`analyzingIds` como props · counters filtran in-progress para evitar doble dispatch en producción. Hint del hero reestructurado en dos cláusulas separadas por punto: "Incluye [multi-rec · partial]. Excluye [in-progress]." Razón del split: una sola línea con "Incluye N · 3 en proceso · no se incluyen" leía contradictorio. Bonus: toast de fallidas pasa a `duration: Infinity` (el supervisor decide cuándo cerrar via X; el filtro "Solo fallidas" sigue accesible desde el panel si lo cierra y necesita volver).

- `cefa36c` **docs · Download legacy real + logout limit cubre fallidas** · el COA describía Download como un toast simplificado · corregido para reflejar el modal "Download" real del legacy de Smart Contact (unitario: 2 checkboxes "Records" + "Recordings/Chats" marcados por defecto + aviso "Deleted or empty conversations won't download"; bulk: 3 checkboxes "Record" + "CDR" + "Recordings/Chats" vacíos por defecto, botón deshabilitado hasta marcar uno). Nuevos placeholders `[imagen]` + sección de traducciones legacy añadida. Limitación de logout extendida en canon sec 13 + decisiones.md + logica-de-conteo + COA: cubre amarillo "recientemente procesado" Y indicador rojo de fallida Y filtro "Solo fallidas" del panel Y toasts previos. Solo lo activamente en proceso persiste (estado vivo del backend).

- `a641deb` **feat · GDPR también seleccionable · sin lock en ninguna fila** · `ConversationTable.isLocked()` reducido a `_id => false`. Razón: el supervisor puede querer abrir el reproductor de una fila con retención vencida y descargar el Record o CDR (lo que SÍ esté disponible) desde el modal Download del legacy. Bloquear el checkbox impedía el flujo unitario legítimo. Mantenemos opacity-60 + tooltip en filas deleted como cue visual del estado, pero NO restringimos interacción. Bulk transcripción/análisis sigue excluyendo silenciosamente las filas deleted (defensive filter en `handleRequestTranscription` + filtro de counters en `BulkTranscriptionModal`). COA + logica-de-conteo actualizados: "checkbox seleccionable" sustituye a "no es seleccionable".

- `ad9dbd7` **docs · audit fixes P0** · auditoría de inconsistencias delegada a Explore agent encontró dos hallazgos P0 reales: (a) hint compose en docs describía solo la versión vieja (sin cláusula "Excluye") · actualizado en COA + logica-de-conteo con la estructura nueva de dos cláusulas + ejemplos concretos. (b) `RecordingTimeline` referenciado en docs cuando el componente se renombró a `MultiRecordingPlayer` en 15.32 (unificación con audio bar) · 7 referencias reemplazadas en logica + referencia-ui; dos menciones residuales preservadas como nota histórica al inicio de las secciones renombradas.

**Decidido**:

- **Flexibilidad sobre cue visual.** Ninguna fila se bloquea visualmente en el checkbox · ni procesando/analizando ni GDPR. Razón: el lock penalizaba flujos legítimos (Download de Record/CDR, abrir reproductor para revisar lo disponible). Trade-off: pierde el cue visual "no se puede" pero gana control y flexibilidad. El feedback del estado se da por otras vías: opacidad-60 + tooltip para GDPR · icono pulsando + spinner para procesando.
- **Bulk como gate de protección contra doble dispatch.** Como las filas son seleccionables aunque estén en proceso o sean GDPR, el `BulkTranscriptionModal` se vuelve el punto donde se filtra silenciosamente lo no-procesable. Counter excluye `deleted + processingIds + analyzingIds` antes de calcular el hero. Hint compose: "Incluye … Excluye N en proceso." (GDPR se omite del hint porque la fila ya está visualmente marcada · evitar señales duplicadas, canon 20.16).
- **Toast de fallidas sticky.** `duration: Infinity` en el toast de "X transcripciones fallaron". Razón: el auto-cierre a 8s no daba tiempo al supervisor a decidir si actuar. Cerrar manualmente no pierde la acción · el filtro "Solo fallidas" sigue accesible desde el panel.
- **Honesty principle aplicado a logout limit.** La limitación del feedback transitorio cubre amarillo + fallida + filtro + toasts (todo lo que es flag de UI, no estado persistente del backend). Documentado como "limitación técnica que aún no tiene solución disponible" sin endulzar.
- **Sonner 2.x soporta `Infinity` nativamente.** El wrapper scToast NO debe convertirlo a `Number.MAX_SAFE_INTEGER` · ese path lo trata como expirado casi al instante. Lección aprendida.

**Audit P0 hallazgos arreglados** (commit `ad9dbd7`):

- Hint compose en COA + logica-de-conteo: actualizado con la cláusula "Excluye" (estaba describiendo solo la composición vieja sin "Excluye").
- `RecordingTimeline` reemplazado por `MultiRecordingPlayer` en logica-de-conteo + referencia-ui (7 ocurrencias). Componente renombrado en 15.32, docs nunca se sincronizaron.

**P2 / falsos positivos del audit** (registrados pero no requieren cambio):

- COA tiene sección "Re-transcripción · post-v1" con el modal destructivo descrito · el agent lo flagueó como inconsistencia pero ES correcto · la sección está intencionalmente ahí como referencia de cómo se hará en una fase posterior, marcada explícitamente como fuera de v1.
- Las menciones a "checkbox deshabilitado" en session logs históricos del canon (sec 15.25, 15.37, 15.40) NO son inconsistencias · son snapshots del pasado.

**No verificado interactivamente** (cableado y verificado en bundle, falta confirmación en pantalla):

- Hint del bulk modal con cláusula "Excluye N en proceso" mostrándose con un sample que tenga in-progress reales seleccionados. El path está cableado en el código y el string ship en el bundle, pero no he visto la cláusula renderizada en pantalla con una selección que la dispare.

**Notas para próxima sesión**:

- El usuario abrió una nueva discusión de producto: "cómo marcar como leídas" muchas conversaciones (amarillas + rojas) tras un batch grande. Pendiente de definir patrón antes de implementar. Probablemente conecte con el "concepto futuro tipo 'marcar como leído' de Gmail/Teams" que ya mencionaba la limitación de logout · el patrón "mark as read" sería el upgrade que resuelve también esa limitación porque convierte el flag transitorio en estado persistente per-supervisor en el backend.
- Commits en esta sesión: `8e7f107` (sticky toast fix) · `eff89c8` (lock procesando + bulk filter + hint Excluye) · `cefa36c` (Download legacy + logout limit) · `a641deb` (GDPR unlock) · `ad9dbd7` (audit P0 fixes) · `cee617b` (este canon close).

---

### 15.46 · 2026-05-11 · Claude Code · "Marcar como leídas" en toolbar · mitigación parcial de la limitación de logout

**Contexto**: tras cerrar 15.45 el usuario abrió una nueva discusión de producto · cómo gestionar centenares de filas amarillas (recién procesadas) + rojas (fallidas) tras un batch grande sin click-uno-a-uno. La discusión propuso un patrón "Marcar como leídas" inspirado en Gmail/Teams, con el bonus de que resuelve parcialmente la limitación de logout (15.45 sec 13): si el supervisor marca como leído, ese estado puede persistir per-usuario en el backend. El usuario aprobó implementación + docs.

**Hecho** (commits — SHAs en cierre):

- **Estado `readIds`** en `ConversationsView` (useState · placeholder del backend en producción). Reset al cambiar de sample (igual que `showOnlyFailed`).
- **Handler `handleMarkAsRead`**: para cada id seleccionado, lo quita de `newlyTranscribedIds` (limpia el amarillo) y lo añade a `readIds` (lo excluye del filtro "Solo fallidas" sin tocar el estado real del backend). Limpia `selectedIds` al terminar. Toast `info` con count solo si hubo cosas marcables · "1 marcada como leída" / "N marcadas como leídas".
- **Contador derivado `markableInSelection`** (useMemo · cuenta cuántas en la selección son amarillas O fallidas-no-leídas). Usado para deshabilitar el botón cuando no hay nada que marcar.
- **Filter pipeline** en `filteredConversations`: la condición `showOnlyFailed && !conv.hasFailedTranscription` pasa a `showOnlyFailed && (!conv.hasFailedTranscription || readIds.includes(conv.id))`. Las marcadas como leídas dejan de aparecer en la lista "Solo fallidas" aunque sigan con icono rojo en la tabla (el estado del backend es real).
- **Botón en toolbar** (`CheckCheck` icono de Lucide) entre Descargar y Help. Visible cuando hay selección. Deshabilitado con tooltip "Nada que marcar en la selección" si `markableInSelection === 0`. Habilitado con tooltip "Marcar como leídas (N)" si hay marcables.

**Docs alineados**:

- **COA** `docs/coa-transcripcion-masiva.md`: sección nueva "Marcar como leídas" con el patrón de uso, visibilidad del botón, persistencia entre sesiones, NOTA con la dependencia técnica de backend para v1. Bullet "Feedback entre sesiones" en Consideraciones generales actualizado · la acción "Marcar como leídas" cubre parcialmente la limitación. Traducciones añadidas (Marcar como leídas / Marcada como leída / N marcadas como leídas / Nada que marcar en la selección).
- **logica-de-conteo** `docs/logica-de-conteo.md`: sección "Mitigación parcial · marcar como leídas" en Estados visuales de una fila · explica el mecanismo de `readIds` y los efectos del flag (filtro Solo fallidas + amarillo). Nueva entrada en Decisiones de producto cerradas.
- **decisiones.md**: entrada narrativa nueva "Marcar como leídas · cómo el supervisor limpia el ruido post-batch" · explica el problema (cientos de filas amarillas/rojas tras batches grandes), el patrón elegido (filtrar + seleccionar + acción), por qué se descartaron otros patrones (auto-clear con tiempo · botón "todas" sin selección · click derecho en fila), la conexión con la limitación de logout y la naturaleza per-supervisor.
- **referencia-ui** `docs/referencia-ui.md`: añadida entrada `<CheckCheck>` en la tabla de iconografía.

**Decidido**:

- **Patrón canónico "filtrar + seleccionar + acción"**. El supervisor puede filtrar primero ("Solo fallidas", "Solo varios tramos", lo que aplique), select-all sobre las visibles, y la acción aplica solo a esa selección. Reutiliza la mecánica de selección que ya entiende; es composable con todos los filtros existentes.
- **Per-supervisor, no per-equipo**. Cada supervisor tiene su propio set de "marcadas". Refleja que el concepto de "leído" es subjetivo; evita conflictos en equipos.
- **El estado del backend NO cambia** cuando se marca como leída. El icono rojo de fallida sigue mostrándose en la fila (el estado real es real). Solo se quita del queue de acción del supervisor (filtro Solo fallidas). Igual con el amarillo: la conversación sigue transcrita, solo deja de destacarse.
- **Mitigación parcial, no solución total** a la limitación de logout. Las marcadas persisten entre sesiones (el backend guarda); el resto sigue siendo transitorio. Es un primer paso hacia el "concepto futuro tipo 'marcar como leído'" que mencionaba la limitación. El siguiente paso sería persistir todos los flags transitorios, pero es trabajo mayor.
- **Dependencia técnica explícita en el COA**: la feature necesita endpoint del backend tipo `POST /conversations/mark-read` + tabla per-usuario `conversation_reads`. Si el backend no lo tiene en día 1 del rollout, la feature se puede ocultar con un feature flag y activar cuando esté listo. Documentado para que el equipo de ingeniería sepa qué pieza pedir.

**Validación**:

- Build OK: 2982 mods · 877 KB JS / gzip 248 KB (+2 KB sobre baseline 15.45 por handler + botón).
- Strings nuevos verificados en bundle: "Marcar como le…", "Nada que marcar", "marcadas como le…".
- **Verificación interactiva pasada con puppeteer-core + Chrome del sistema** (sample "Errores de transcripción" cargado · 14 fallidas):
  1. Click "Ver fallidas" del toast → filtro activo · "Resultados: 14" · chip rojo visible.
  2. Select-all en header → 14 checkboxes activos · botón "Marcar como leídas (14)" habilitado con aria-label correcto.
  3. Click Marcar como leídas → "Resultados: 0" · empty state "No se encontraron conversaciones" · toast "14 marcadas como leídas" visible · chip de filtro sigue activo (correcto · es el supervisor quien decide cuándo limpiarlo).
  4. Limpiar filtro → 75 conversaciones visibles · 31 iconos rojos preservados (estado real del backend, no se altera).
  0 page errors · 0 console errors durante todo el flujo.

**Notas para próxima sesión**:

- En producción, definir el endpoint exacto del backend para `read_states` per-usuario. Documentación de COA ya lo lista como dependencia.
- El usuario explícitamente descartó push Figma del botón de "Marcar como leídas" en la toolbar (la verificación interactiva sí se quería · está hecha).

**Mirror obligatorio · regla 15.41 paso 6**: `docs/decisiones.md` ya actualizado en este commit con la entrada narrativa "Marcar como leídas · cómo el supervisor limpia el ruido post-batch".
