# memory.md — Project Context for Claude Code

> **Propósito**: Este archivo es la fuente única de verdad para replicar el proyecto Memory 3.0 en local desde cero, sin acceso a Figma Make. Cualquier desarrollador o IA debe poder leer este documento y entender el proyecto al 100%.

---

## 📋 1. Project Overview

**Nombre**: Memory 3.0  
**Descripción**: Dashboard de monitorización de conversaciones para contact centers. Permite a supervisores y administradores ver, filtrar y gestionar conversaciones (llamadas y chats), configurar reglas automáticas de grabación/transcripción/clasificación IA, y gestionar el repositorio de categorías IA y entidades de extracción de datos.

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
| Gestor de paquetes | pnpm | (lockfile pnpm-lock.yaml) |
| UI Components | shadcn/ui (Radix UI based) | varios |
| Iconos | lucide-react | 0.487.0 |
| Animaciones | motion (ex-Framer Motion) | 12.23.24 |
| Routing | react-router | 7.13.0 (instalado pero NO usado — navegación via useState) |
| Notificaciones | sonner | 2.0.3 |
| Drag & Drop | react-dnd + react-dnd-html5-backend | 16.0.1 |
| Formularios | react-hook-form | 7.55.0 |
| Fechas | date-fns | 3.6.0 |
| Calendarios | react-day-picker | 8.10.1 |
| Gráficos | recharts | 2.15.2 |
| MUI (instalado, mínimamente usado) | @mui/material + @emotion/react + @emotion/styled | 7.3.5 / 11.x |
| Fuente | Roboto (Google Fonts, via CSS `@import`) | 300, 400, 500, 700 |

**IMPORTANTE**: `react-router` está instalado pero **no se usa para la navegación**. Toda la navegación entre vistas se gestiona con `useState<View>` en `App.tsx`. No hay `RouterProvider`, no hay rutas declaradas. Si algún día se migra a react-router, hay que refactorizar `App.tsx` completamente.

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
│   │       ├── memory.md               # ESTE ARCHIVO
│   │       ├── bulk-transcription-modal.md      # Spec de diseño del modal masivo
│   │       ├── bulk-transcription-modal.tsx     # Referencia/spec del modal v11
│   │       ├── bulk-transcription-modal-1.tsx   # Versión anterior de referencia
│   │       ├── rule-constructor-update.md       # Primera spec de rule builders
│   │       └── rule-constructor-update-1.md     # Spec actualizada de rule builders
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
│           ├── ui/                     # shadcn/ui components (Radix UI wrappers)
│           │   ├── accordion.tsx
│           │   ├── alert-dialog.tsx
│           │   ├── alert.tsx
│           │   ├── aspect-ratio.tsx
│           │   ├── avatar.tsx
│           │   ├── badge.tsx
│           │   ├── breadcrumb.tsx
│           │   ├── button.tsx
│           │   ├── calendar.tsx
│           │   ├── card.tsx
│           │   ├── carousel.tsx
│           │   ├── chart.tsx
│           │   ├── checkbox.tsx
│           │   ├── collapsible.tsx
│           │   ├── command.tsx
│           │   ├── context-menu.tsx
│           │   ├── dialog.tsx
│           │   ├── drawer.tsx
│           │   ├── dropdown-menu.tsx
│           │   ├── form.tsx
│           │   ├── hover-card.tsx
│           │   ├── input-otp.tsx
│           │   ├── input.tsx
│           │   ├── label.tsx
│           │   ├── menubar.tsx
│           │   ├── navigation-menu.tsx
│           │   ├── pagination.tsx
│           │   ├── popover.tsx
│           │   ├── progress.tsx
│           │   ├── radio-group.tsx
│           │   ├── resizable.tsx
│           │   ├── scroll-area.tsx
│           │   ├── select.tsx
│           │   ├── separator.tsx
│           │   ├── sheet.tsx
│           │   ├── sidebar.tsx
│           │   ├── skeleton.tsx
│           │   ├── slider.tsx
│           │   ├── sonner.tsx          # Toast notifications (Toaster wrapper)
│           │   ├── switch.tsx
│           │   ├── table.tsx
│           │   ├── tabs.tsx
│           │   ├── textarea.tsx
│           │   ├── toggle-group.tsx
│           │   ├── toggle.tsx
│           │   ├── tooltip.tsx
│           │   ├── modal.tsx           # ⭐ SC design system Modal compound (Radix Dialog + sc-* tokens). Header / Body / Footer slots, Cancel + Action footer buttons. NEW v25.
│           │   ├── use-mobile.ts       # Hook isMobile
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

7. **Diarización separada de transcripción**: En `TranscriptionRequestModal`, la diarización es una opción checkbox (no un modal separado). `DiarizationRequestModal` existe para conversaciones YA transcritas que quieren añadir diarización a posteriori.

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

### 15.1 · Setup local · gestor de paquetes

**Decisión**: el proyecto declara `pnpm` como gestor preferido en memory.md, pero NO existe `pnpm-lock.yaml` en el árbol y la máquina del usuario NO tiene `pnpm` ni `corepack` instalados. `npm install` falla porque el `package.json` contiene claves estilo `"sonner@2.0.3": "npm:sonner@2.0.3"` (quirk de Figma Make) que npm rechaza con `EINVALIDPACKAGENAME`.

**Solución aplicada**: usar `npx -y pnpm@latest install` y `npx -y pnpm@latest dev`. Esto ejecuta pnpm vía npx sin instalación global y resuelve correctamente las claves versioned. Funcionó: pnpm 10.33.2, install en ~13s, dev server en 1.3s.

**Comando recomendado en sesiones futuras**:
```bash
npx -y pnpm@latest install
npx -y pnpm@latest dev    # http://localhost:5173
```

Si el usuario instala pnpm globalmente (`npm install -g pnpm`), pasar a `pnpm install / pnpm dev` directamente.

### 15.2 · Decisiones arquitectónicas del Modal shell

| Pregunta | Respuesta | Razón |
|---|---|---|
| ¿Reemplazar `dialog.tsx` o crear nuevo? | Nuevo `ui/modal.tsx`, dejar `dialog.tsx` intacto | `dialog.tsx` lo importan internamente sheet/drawer/alert-dialog. Tocarlo abre frente. El nuevo Modal es la pieza canónica del SC DS; convive con el shadcn Dialog para casos en que se necesite (alerts, drawers internos). |
| ¿Radix Dialog o hand-rolled `<div fixed>`? | **Radix Dialog** | Focus trap, scroll lock, ESC, portal y stacking gratis. Hand-rolled requeriría reimplementar todo. Para "stacking de varias instancias sin problema" Radix es la única opción seria. |
| ¿API compound, props, o children libres? | **Compound** (`Modal.Header`, `Modal.Body`, etc.) | Slots tipados, constraints visuales por sección, idiom shadcn. Permite que el body cambie sin tocar el shell. |
| ¿Tokens nuevos o hex hardcoded? | **Tokens** (3 capas, prefijo `--sc-*`) en `sc-design-system.css` | Usuario pidió "como Design System Architect, registra variables si no están". Hex hardcoded sigue OK para componentes existentes — la migración es gradual. |
| ¿Usar Inter (DS Figma) o Roboto (proyecto)? | **Roboto** | El usuario dijo "adapta a lo que tenemos". Inter introduciría una segunda font-family. La diferencia visual es mínima en este punto. |
| ¿Usar `#1B273D` (DS) o `#233155` (proyecto) para CTA? | **`#1B273D`** (`--sc-navy-600`) en el nuevo Modal. Existentes intactos | El DS oficial es la fuente de verdad para nuevos componentes. Existentes (sidebar `#1C283D`, botones `#233155`) se armonizan en una migración separada. |

### 15.3 · Sistema de tokens en 3 capas

Patrón estándar de design systems (Material, Carbon, Polaris):

```
L1 primitives    →    L2 semantic    →    L3 component
--sc-surface-0   →    --sc-bg-surface →    (modal usa bg-sc-surface vía utility)
--sc-navy-600    →    --sc-bg-primary →    (CTA usa bg-sc-primary)
--sc-surface-900 →    --sc-text-heading →  (title usa text-sc-heading)
                      ↓
                 @theme inline → utilities Tailwind v4
                 (bg-sc-surface, text-sc-heading, etc.)
```

**Reglas para extender tokens en sesiones futuras**:
1. Añadir SIEMPRE en `sc-design-system.css`. NUNCA tocar `default_theme.css` (KEEP_IN_SYNC con shadcn).
2. Añadir el primitivo en L1 primero. Después semantic en L2 referenciando L1. Si el componente lo necesita aislar, declarar L3 que referencie L2.
3. Exponer al `@theme inline` con prefijo coherente: `--color-sc-*` para colores, `--text-sc-*` para sizes, `--radius-sc-*` para radii, `--shadow-sc-*` para sombras.
4. **EVITAR colisiones de namespace**: Tailwind v4 mapea `--color-X` y `--text-X` a la MISMA clase `text-X`. Si declaras ambas, una se pierde silenciosamente. Hubo este bug en la sesión: `--color-sc-body` (color) y `--text-sc-body` (font-size) → Tailwind escogió color y dejó font-size sin clase. Solución: el font-size 14px se llama ahora `--text-sc-base` (utility `text-sc-base`).
5. Tokens L3 que sean meros aliases de L2 (e.g., `--sc-modal-bg = var(--sc-bg-surface)`) son ruido — referenciar el L2 directamente desde el componente. L3 solo para valores específicos del componente (paddings, dimensiones, line-heights particulares).

**Tokens L3 vivos**:
- `--sc-modal-*` (consumed by `ui/modal.tsx`):
  - Container: `min-width`, `max-width`, `min-height`, `max-height`, `default-width`
  - Header: `padding`, `icon-size`, `icon-gap`, `title-gap`, `title-lh`, `subtitle-lh`, `close-size`, `close-icon`
  - Body: `body-padding-x`, `body-padding-y`
  - Footer: `foot-height`, `foot-padding`, `foot-gap`
  - Botones: `button-height`, `button-padding-x`, `button-padding-y`, `button-radius`, `button-line-height`
- `--sc-bulk-*` (consumed by `BulkTranscriptionModal.tsx` v25 body):
  - `cell-height` (200), `cell-gap` (12)
  - `hero-padding-x` (32), `hero-padding-y` (28)
  - `decision-padding-x` (24), `decision-padding-y` (28)

### 15.4 · Animaciones del SC system

Cuatro keyframes registrados en `sc-design-system.css` con utilities `animate-sc-*`. Patrón canónico para usarlas en React: incrementar un `useState` "key" y aplicarlo como `key` prop al elemento + clase condicional. Esto remonta el nodo y reinicia el keyframe limpiamente.

```tsx
const [bumpKey, setBumpKey] = useState(0);
// trigger:
setBumpKey(k => k + 1);

<span key={bumpKey} className={cn("...", bumpKey > 0 && "animate-sc-bump")}>
  {value}
</span>
```

| Animación | Duración | Easing | Uso típico |
|---|---|---|---|
| `animate-sc-bump`      | 260ms | `--sc-ease-out` | Número/valor que ha cambiado (scale 1.03) |
| `animate-sc-pulse`     | 360ms | `--sc-ease-out` | Acento al cambio de estado (scale 1.08) |
| `animate-sc-delta-fly` | 750ms | `--sc-ease-out` | Fantasma `+N`/`−N` flotando 34px |
| `animate-sc-shake`     | 280ms | ease            | Nudge horizontal en interacción inválida |

### 15.5 · BulkTranscriptionModal v11 → v25 · qué cambió

**Antes (v11)**: hand-rolled `<div fixed inset-0>` con header inline, switch propio, breakdown de 3 destinos (`destination1`, `destination2`, `destination3`) en filas con anti-layout-shift, warning ámbar siempre presente.

**Después (v25)**:
- Construido sobre `<Modal>` shell del SC DS (Radix Dialog).
- Body 2 columnas: hero number 72px (left) + análisis toggle (right).
- 6 casos C1–C6 que emergen de combinaciones de `(nTrans, callEa, chatEa, ap)` — sin labels explícitas en código, sólo comportamientos.
- Animaciones de feedback: bump al cambio del hero, delta-ghost al togglear, pulse del caption, shake en click de toggle disabled.
- API hacia el caller idéntica (`isOpen`, `onClose`, `selectedConversations`, `onConfirm`).
- `ConversationsView` ahora monta el modal SIEMPRE (no `{isOpen && ...}`) para que Radix anime el cierre.

**Mapeo de contadores** (v11 → v25):

| v11           | v25            | Significado                                |
|---------------|----------------|---------------------------------------------|
| `ct`          | `nTrans`       | calls listas para transcribir                |
| `cea`         | `callEa.length`| calls transcritas, sin análisis             |
| `chea`        | `chatEa.length`| chats sin análisis                           |
| `caa + chaa`  | `ap` (no exportado, sólo informativo) | calls+chats ya analizados (ignorados) |

**`eligibleIds` enviados a `onConfirm`** (idéntico a v11):
- toggle OFF → `readyToTranscribe.map(c => c.id)`
- toggle ON  → `[...readyToTranscribe, ...callEa, ...chatEa].map(c => c.id)`

### 15.6 · Optimizaciones aplicadas en la auditoría final

1. **Token rename `--text-sc-body` → `--text-sc-base`**: arregla colisión silenciosa con `--color-sc-body`. Todos los consumidores actualizados.
2. **L3 tokens muertos eliminados** de `sc-design-system.css`: 10 aliases redundantes de L2 (`--sc-modal-bg`, `--sc-modal-radius`, `--sc-modal-shadow`, `--sc-modal-head-divider`, `--sc-modal-head-title-size`, `--sc-modal-head-subtitle-size`, `--sc-modal-foot-divider`, `--sc-modal-button-font-size`, `--sc-modal-button-font-weight`, `--sc-modal-border`).
3. **Magic numbers extraídos**: `text-[21px]` → `text-sc-xl`. `min-h-[21px]` → `min-h-[var(--sc-line-height-body2)]` con `leading-` matching.
4. **`<Loader2 size={14} />` con prop**: alineado con la convención del resto del proyecto (`TranscriptionRequestModal`, `DiarizationRequestModal`).
5. **`useState(() => ...)` lazy initializer** en `BulkTranscriptionModal` para evitar recomputar el predicado de default en cada render.
6. **`isAllProcessed` simplificado**: `!canAnalyze && nTrans === 0` → `!canAnalyze` (la segunda condición está implícita).
7. **`Modal.Footer` con `min-h-` (no `h-`)**: footer no clipa cuando el contenido tiene varias líneas / botones múltiples.
8. **`selectedConversations` memoizado en `ConversationsView`** vía `useMemo([selectedIds])` — antes se recreaba el array filtrado en cada render del padre, invalidando el `useMemo` interno del modal sin necesidad.
9. **Comentarios sectorizados** en ambos archivos `.tsx` con separadores `/* ── ── */` para que el código lea como una espiral: counters → toggle state → derived → animations → confirm → render.

### 15.7 · Deuda técnica conocida (priorizada)

**🔴 P0 — bloqueantes**: ninguna.

**🟠 P1 — visibles en producción / DX**:
1. **Migrar modales legacy al nuevo shell**: `TranscriptionRequestModal`, `DiarizationRequestModal`, `RetranscriptionConfirmModal`, `PlayerModal`, `RuleSelectionModal`, `CreateEntityModal`, `DeleteCategoryDialog` siguen con el patrón hand-rolled `<div fixed>`. Patrón nuevo en sec 14. Migrar uno a uno cuando se toquen.
2. **Armonizar paleta navy**: tres tonos casi-iguales (`#1B273D` DS / `#1C283D` sidebar / `#233155` legacy) — consolidar en `--sc-navy-600` y migrar `Sidebar.tsx` + componentes que usan los otros dos hex. Cambio puramente visual; ninguna lógica afectada.
3. **Warning CSS persistente**: `[vite:css][postcss] @import must precede all other statements` por el `@import` de Roboto en `globals.css`. No bloqueante (Roboto carga). Para eliminarlo limpiamente, mover el `@import` al inicio de `index.css`.

**🟡 P2 — calidad / consistencia**:
4. **Reproductor de audio real** en `PlayerModal.tsx` (todavía mock).
5. **Filtro de categorías IA** en toolbar (deshabilitado con `{false && ...}` en `ConversationsView`).
6. **`onNavigateToEntities`** en `ClassificationRuleBuilder` da toast "TBI" en lugar de navegar.
7. **Paginación real** en `ConversationTable`.
8. **Exportación real** en `DataExportImport.tsx`.
9. **Modo oscuro**: tokens definidos en `default_theme.css` con `.dark`; sin toggle ni lógica activa. Si se activa, los tokens `--sc-*` también necesitan variantes dark (no existen).

**🟢 P3 — mejoras opcionales**:
10. **Refactorizar `BulkTranscriptionModal` v11 → componentes pequeños**: `<HeroCell />`, `<DecisionCell />`. La versión v25 cabe en un solo archivo (~280 líneas) — extraer sólo si los cells se reutilizan.
11. **Pre-`approve-builds` de pnpm**: scripts de `@tailwindcss/oxide` y `esbuild` ignorados. No molesta en dev/build local; revisar si CI/build de prod se queja.
12. **Migrar el resto del proyecto a tokens `--sc-*`**: hex hardcoded (`bg-[#233155]`, `text-[#5F6776]`, etc.) en componentes existentes.

### 15.8 · Gotchas para sesiones futuras

1. **El dev server pnpm puede quedarse colgado en background**: si abres una nueva sesión y no ves el log, lanzar `npx -y pnpm@latest dev` de nuevo (en la nueva sesión). Vite recupera el estado del FS.
2. **Importes versionados** (`from "sonner@2.0.3"`): obligatorio mantenerlos en componentes existentes. Si Tailwind v4 falla resolviendo, verificar que `package.json` tiene la entrada `"sonner@2.0.3": "npm:sonner@2.0.3"`.
3. **Tailwind v4 `@theme inline` lee CSS vars**: las clases generadas dependen del namespace. `--color-X` → `bg-X / text-X / border-X`. `--text-X` → `text-X` (font-size). `--radius-X` → `rounded-X`. `--shadow-X` → `shadow-X`. Cuidado con colisiones (ver 15.3 punto 4).
4. **Radix Dialog re-render en mount**: si pones `<Modal>` dentro de un componente que se desmonta cuando `isOpen=false`, pierdes la animación de cierre. Patrón correcto: el `<Modal>` siempre montado, `open={isOpen}` controla la visibilidad.
5. **`<DialogPrimitive.Close asChild>`**: el child debe ser un único elemento `<button>`. Si pasas Fragment o múltiples children, Radix tira un warning. Por eso `Modal.Cancel` envuelve un único `<button>`.
6. **Los keyframes `sc-*` necesitan que el elemento tenga `key` cambiante para reiniciar**: si sólo cambias la clase `animate-sc-bump` sin cambiar key, el navegador no re-ejecuta la animación. Patrón en sec 15.4.

### 15.9 · Cómo verificar que el modal funciona

1. `npx -y pnpm@latest dev` → http://localhost:5173
2. En la tabla, seleccionar una o varias conversaciones (checkboxes).
3. Click en el icono de transcripción (FileText) del bulk action bar.
4. Comprobar visualmente:
   - Header: icono align-left + "Procesar conversaciones" + "N conversaciones seleccionadas" + X cierre.
   - Body 2 columnas con hairline en medio.
   - Hero (left): label "TOTAL A PROCESAR" + número 72px + caption ("genera coste" o "todo procesado").
   - Decisión (right): label "ANÁLISIS" + "Incluir análisis" + Switch + caption "{N} admiten análisis".
   - Footer: "Cancelar" (transparente) + "Procesar" (navy).
5. Animaciones a verificar:
   - Click en toggle: bump del hero, delta-ghost flotando, pulse del caption.
   - Click en toggle disabled (caso C1, todo procesado): shake horizontal.
   - Cerrar con ESC: animación de salida (zoom-out + fade).
6. Edge cases:
   - Selección vacía: el botón del bulk action bar no aparece, así que el modal no se abre.
   - Selección con todo ya procesado: hero `0`, "todo procesado", botón Procesar disabled.
   - Selección con sólo chats sin análisis: toggle default-on, hero = N chats.

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

- **Rol 1 · prototipo desechable** — el equipo Angular reescribe en PrimeNG, este código se descarta. Es lo más habitual y barato.
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

- Migrar al `<Modal>` shell SC los modales legacy: `TranscriptionRequestModal`, `DiarizationRequestModal`, `RetranscriptionConfirmModal`, `PlayerModal` (legacy oscuro), `RuleSelectionModal`, `CreateEntityModal`, `DeleteCategoryDialog`. (P1)
- Consolidar los tres tonos de navy en circulación (`#1B273D` / `#1C283D` / `#233155`) en el token canónico `--sc-navy-600`. (P1)
- Mover el `@import` de Roboto al inicio de `src/styles/index.css` para silenciar el warning `@import must precede all other statements` de PostCSS. (P2)
- Audio real en `ConversationPlayerModal` (hoy reproducción simulada con `setInterval`). El `PlayerModal` legacy queda muerto en el repo — borrar cuando todos los callers se hayan movido al nuevo. (P1)
- Re-habilitar el filtro de categorías IA en `ConversationsView` (actualmente bloqueado con `{false && showCategoryFilter && (...)}`). (P2)
- Implementar `onNavigateToEntities` en `ClassificationRuleBuilder` (actualmente lanza un toast "TBI"). (P2)
- Paginación real en `ConversationTable`. (P2)
- Exportación / importación real en `DataExportImport.tsx`. (P2)
- Backend / persistencia real (hoy todo es mock + `localStorage`). (P0 cuando empiece la integración)
- Modo oscuro: tokens definidos en `default_theme.css` con `.dark`, falta toggle UI y variantes dark de los `--sc-*`. (P3)
- Dividir `ConversationTable.tsx` en subcomponentes (es muy grande). (P2)
- Migrar `useEffect` de sincronización `typeFilters`/`ruleFilters` en `ConversationsView` a `useMemo` (actualmente estado derivado vía effect). (P2)
- Code-splitting del bundle: el chunk JS pasa de 500kB. Considerar `manualChunks` en `vite.config.ts` (separar `recharts`, `motion`, `@mui/*`, `react-day-picker`). (P3)
- Decisión pendiente sobre el destino del prototipo (rol 1/2/3) cuando el DS del cliente esté maduro — ver sección 16.
- `MockSampleSwitcher` y `mockSamples.ts` son código exclusivo de prototipo. Marcarlos para purga antes de cualquier deploy a stakeholders externos no técnicos. (P3)
- Tipar el retorno de `resolveStatus` en `StatusIcons.tsx` con `React.ReactElement` en vez de `JSX.Element` por si se desactiva el global JSX namespace al añadir `tsconfig.json`. (P3)
- Añadir `tsconfig.json` y `npm run typecheck` script — hoy Vite usa esbuild solo (no hay typechecker en CI). (P2)

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

### 15.10 · 2026-04-28 · Claude Code · auditoría visual final + deploy GitHub/Netlify

**Hecho**:
- `BulkTranscriptionModal` v25 body re-alineado a Figma `289:649`: hero number 56px (era 72), color `text-sc-emphasis` `#3C434D` (era heading), line-height 48px. Labels "TOTAL A PROCESAR" / "ANÁLISIS" pasan a 14px Bold (eran 11px medium tracking). "Genera coste" en `text-sc-cost-warn` `#D97706` capitalizado (era on-secondary minúscula). Título "Incluir análisis" 16px semibold (era 21px medium); color `text-sc-disabled` `#797979` cuando OFF, `text-sc-heading` cuando ON. Caption ON usa `text-sc-accent-strong` `#48B8C9` (era accent-300). Eliminado divider central (Figma: "sin dividers internos"). Cell heights fijos a 200px, paddings 28v/32h hero y 28v/24h decision. archivos: `src/app/components/BulkTranscriptionModal.tsx`, `src/styles/sc-design-system.css`.
- Nuevos tokens en `sc-design-system.css`: L1 primitives `--sc-surface-500/700`, `--sc-warning-600`, `--sc-accent-600`. L2 semantic `--sc-text-emphasis`, `--sc-text-disabled`, `--sc-accent-strong`, `--sc-cost-warn`. L3 component `--sc-bulk-cell-{height,gap}`, `--sc-bulk-{hero,decision}-padding-{x,y}`. `--sc-font-size-display` cambió 72→56px. Añadido `--sc-line-height-display` 48px y `--sc-line-height-md` 24px.
- Bug crítico arreglado: colisión de namespace `text-sc-body` (Tailwind v4 mapeaba `--color-sc-body` y `--text-sc-body` a la misma clase, ganaba color, font-size se perdía silenciosamente). Renombrado el token de tamaño a `--text-sc-base`. Todos los consumidores actualizados. archivos: `src/styles/sc-design-system.css`, `src/app/components/ui/modal.tsx`, `src/app/components/BulkTranscriptionModal.tsx`.
- Eliminados 10 tokens L3 muertos (aliases redundantes de L2): `--sc-modal-{bg,border,radius,shadow,head-divider,head-title-size,head-subtitle-size,foot-divider,button-font-size,button-font-weight}`. archivos: `src/styles/sc-design-system.css`.
- Optimizaciones de código: lazy `useState` initializer, `isAllProcessed` simplificado (`!canAnalyze` solo), `selectedConversations` memoizado en `ConversationsView` con `useMemo([selectedIds])`, magic number `text-[21px]` → `text-sc-xl`, `min-h-[21px]` → `min-h-[var(--sc-line-height-body2)]`, `<Loader2 size={14} />` matching project convention. archivos: `src/app/components/BulkTranscriptionModal.tsx`, `src/app/components/ConversationsView.tsx`.
- Footer del Modal con `min-h-` en lugar de `h-` para resilencia con contenido multilínea. archivos: `src/app/components/ui/modal.tsx`.
- Deploy completo activado: repo privado `arebury/Memory` creado vía `gh` CLI, 9 topics, descripción específica. `netlify.toml` declarativo (Node 20, pnpm 10.33.2, `pnpm build`, redirect SPA). `.gitignore` standard. `package.json`: nombre `memory`, scripts `dev/build/preview`, `pnpm.onlyBuiltDependencies` con `@tailwindcss/oxide` y `esbuild`. Identidad git `arebury <arebury@users.noreply.github.com>` sin `Co-Authored-By` de Claude. archivos: `.gitignore`, `netlify.toml`, `package.json`, `README.md`.
- Live URL: https://memoryplus3.netlify.app/ — añadida al `README.md` con badge dedicado, a la sidebar de GitHub vía `gh repo edit --homepage`, y a `memory.md` sec 18.
- README rehecho con 7 badges shields.io (status + 6 stack), emoji por sección (🎯🛠️🚀📁🚢📌👤), título `💬 Memory`, sin lenguaje vago. archivos: `README.md`.
- `memory.md` con emoji en las 19 secciones top-level para escaneo rápido.
- Añadidas secciones nuevas a `memory.md`: sec 16 (estrategia prototipo vs producción Angular+PrimeNG), sec 17 (Pendiente, lista plana sin milestones), sec 18 (deploy / pipeline / troubleshooting / rollback), sec 19 (protocolo de session log con plantilla obligatoria + política de compactación a partir de 2500 líneas).

**Decidido**:
- Mantener stack React (Opción C): el DS evoluciona hacia tokens estilo PrimeNG/Aura sólo cambiando VALORES en `sc-design-system.css`; los nombres `--sc-*` se quedan. La decisión "qué hacer con el prototipo" (rol 1 desechable / rol 2 PrimeReact / rol 3 pivote Angular) se difiere hasta que el DS del cliente esté maduro. Razón: instalar `primereact` o pivotar a Angular hoy con DS "en pañales" cierra puertas innecesariamente.
- Body de v25 sigue Figma `289:649` como fuente de verdad, no `bulky.html` (era exploración previa con valores diferentes — 72px hero, accent-300, etc.).
- Auto-deploy Netlify dispara en cada `git push origin main`. Pushear en bloque al final de cada sesión, no commit a commit, para no consumir la cuota de 300 min/mes en builds innecesarios.
- Topics del repo NO incluyen `primeng` ni `angular` aunque sean el target de producción — describen lo que hay EN el código (React/Vite/etc.), el contexto del target va en descripción y README.

**Pendiente** (todos reflejados en sec 17):
- Migrar modales legacy al `<Modal>` shell SC. (P1)
- Consolidar los tres tonos navy en `--sc-navy-600`. (P1)
- Mover `@import` de Roboto al inicio de `src/styles/index.css` para silenciar warning PostCSS. (P2)
- Decisión sobre rol del prototipo cuando DS cliente esté maduro. (sin prioridad — reactivo al cliente)

**Notas para próxima sesión**:
- Repo: https://github.com/arebury/Memory · Live: https://memoryplus3.netlify.app/
- Vite dev server quedó corriendo en background al puerto 5173 (pid del proceso de la sesión anterior). Si no responde tras reabrir Claude Code, lanzarlo con `npx -y pnpm@latest dev`.
- ANTES de instalar nada o cambiar stack: leer sec 16. NO añadir `primereact`, `@angular/*` ni renombrar tokens `--sc-*` a `--p-*` sin discusión explícita.
- Para verificar que un cambio compila antes de pushear: `npx -y pnpm@latest build` (~2s, produce `dist/`). Si falla local, falla en Netlify.
- `gh auth status` confirma autenticación como `arebury`. No hace falta re-loguear en sesiones futuras.

### 15.11 · 2026-04-28 · Claude Code · v26 · status pictograms + ConversationPlayerModal + mock-sample switcher + body compacto

**Hecho**:
- `BulkTranscriptionModal` v25 → **v26**: body compactado de 720×200 a 720×100. Tokens en `sc-design-system.css`: `--sc-bulk-cell-height` 200→100, `--sc-bulk-hero-padding-x` 32→24, `--sc-bulk-hero-padding-y` 28→12, `--sc-bulk-decision-padding-y` 28→0. Nuevos tokens `--sc-bulk-decision-gap-inner` (24, label↔switch) y `--sc-bulk-decision-gap-outer` (12, switch↔caption). Cell decision reorganizado en grupos anidados (Group A flex-col gap 12 ⊃ Group B flex-col gap 24 + Caption). Caption del análisis ahora **siempre** teal `text-sc-accent-strong` cuando hay candidatos (antes alternaba muted/teal según toggle). archivos: `src/styles/sc-design-system.css`, `src/app/components/BulkTranscriptionModal.tsx`.
- Nuevo componente `StatusIcons.tsx` con 6 pictogramas SVG inline (paths de Figma, no Lucide): `IconPhone`, `IconCallTranscription`, `IconCallTranscriptionAnalysis`, `IconChat`, `IconChatTranscription`, `IconChatAnalysis`. Componente principal `<StatusIcon conversation isProcessing isAnalyzing size />` resuelve canal+estado en un único pictograma. Pulso `motion.span opacity 1→0.35→1` durante 1.1s mientras procesa o analiza. Tooltip con label específico por estado. archivos: `src/app/components/StatusIcons.tsx`.
- Columna "Estado" de `ConversationTable.tsx` reescrita: el trío histórico (punto rojo grabación + FileText transcripción + Sparkles análisis con stack de tooltips por badge) sustituido por un único `<StatusIcon />`. Imports limpiados: removidos `Phone`, `Trash2`, `FileText`, `Sparkles`, `motion` que ya no se usaban. archivos: `src/app/components/ConversationTable.tsx`.
- Nuevo `ConversationPlayerModal.tsx` (720 líneas) inspirado en Figma node `325:10103` pero adaptado al SC design system (surface blanca, shell `<Modal>`, tokens `--sc-*`). Reemplaza al click de fila el legacy `PlayerModal.tsx` (que sigue en repo, listed en sec 17 como pending de migración). Anatomía: header `Conversación · {id}` + meta, body con audio player row (back-10/play/fwd-10/scrub/download — reproducción mock con setInterval) + tabs Transcripción/Análisis con empty-states que llaman a `onRequestTranscription/onRequestAnalysis`. Default tab = Análisis si `!hasTranscription && hasAnalysis`. archivos: `src/app/components/ConversationPlayerModal.tsx`.
- Nuevo `MockSampleSwitcher.tsx` + `data/mockSamples.ts` (presets `default`/`all-pending`/`all-done`/`calls-only-untranscribed`/`chats-only`/`small`) y `data/mockTranscriptionGenerator.ts` (6 templates de diálogo con hash determinista por id, jitter ±3s en timestamps). El switcher vive junto al easter-egg de validación UX en `ConversationsView`. archivos: `src/app/components/MockSampleSwitcher.tsx`, `src/app/data/mockSamples.ts`, `src/app/data/mockTranscriptionGenerator.ts`.
- `ConversationsView.tsx` reescrito para soportar el nuevo flujo: mock-data ahora vive en estado local (`conversations`, copia de trabajo del sample) en lugar de leer `mockConversations` directamente; `analyzingIds` añadido al state (paralelo a `processingIds`); `handleRequestTranscription` ahora muta la conversación al completar (siembra `transcription` con `generateTranscriptionFor` si no había script); nuevo `handleRequestAnalysis` (4000 ms, marca `hasAnalysis: true` y siembra `aiCategories` con `pickRandomCategories(id)` deterministic); pool de categorías IA documentado inline. `selectedConversations` memoized con dep `[selectedIds, conversations]`. archivos: `src/app/components/ConversationsView.tsx`.
- `index.html` title fijado a `Memory + 3.0` (era `Memory 3.0 + Transcripción masiva (Copy)` heredado de Figma Make).
- JSDoc de `BulkTranscriptionModal` actualizada de `v25` a `v26 (Figma 297:2559 compact body)` con descripción del layout anidado.
- Roadmap (`memory.md` sec 17) repasado: ítems heredados con prioridades P0–P3 explícitas; añadidos items nuevos (purgar `MockSampleSwitcher` antes de demos a stakeholders externos, tipar `resolveStatus` con `React.ReactElement` cuando se introduzca tsconfig, añadir tsconfig+typecheck script).

**Decidido**:
- Pictograma único en columna Estado (vs trío de badges v25). Razón: la columna mide 80px y tres badges + tres tooltips se sentían ruidosos; los SVG oficiales del DS ya combinan canal+estado en un solo símbolo, mantenerlos como paths inline garantiza fidelity 1:1 con Figma sin pasar por un asset pipeline.
- Caption del análisis **siempre** teal cuando hay candidatos. Antes alternaba muted/teal según toggle, lo cual implicaba que C2/C5 (default-on) y C3 (default-off) se veían distintos para el mismo dato subyacente. Figma 297:2559 spec C3 confirma teal constante.
- Body compactado a 100px en lugar de 200px. Razón: el padding-y de 28px sumaba aire vertical innecesario tras quitar el divider central. Decision cell ahora usa `padding-y 0` y deja que los gaps anidados (12+24) hagan el espaciado.
- `ConversationPlayerModal` como **componente nuevo** en vez de refactor del legacy `PlayerModal`. Razón: el legacy es un Radix Dialog con surface oscura `#0F1117` que aún tiene callers vivos en `Repository`/`PlayerModal`; refactor en sitio rompía esos otros flujos. Trade-off aceptado: dos modales coexisten temporalmente; tarea de migración añadida a sec 17.
- Mock-data ahora muta vía `setConversations` en `ConversationsView`. Razón: el flujo "transcribe individual → abro modal y veo transcripción" requiere que el cambio sobreviva al cierre/reapertura del modal. Mantener `mockConversations` inmutable como base + clones por sample preserva la posibilidad de resetear.
- Generador determinista de transcripciones (hash del id, no random). Razón: si la transcripción cambiara entre renders el modal mostraría líneas distintas tras un re-render del padre. Determinismo evita esa rareza en demos.

**Descartado** (decisiones de diseño no tomadas):
- Mostrar un icono "fallback" (`-`) cuando un chat está sin procesar. Sustituido por `IconChat` (bocadillo plano) — el canal siempre se ve, aunque no haya progreso.
- Renombrar `PlayerModal.tsx` legacy a `PlayerModalLegacy.tsx`. Decidido NO: se borra cuando se migran sus callers; renombrarlo crearía un diff sin valor.
- Añadir `react-router` para que el player sea una ruta en lugar de un modal. Sigue siendo modal — la navegación de la app no usa router (sec 2).
- Bajar el JS chunk con manualChunks ahora. Sigue siendo P3; el build pasa con warning >500 kB pero no bloquea.

**Pendiente** (todos reflejados en sec 17):
- Migrar `PlayerModal` legacy + el resto de modales antiguos al shell SC. (P1)
- Audio real en `ConversationPlayerModal` (hoy mock con `setInterval`). (P1)
- Backend real cuando empiece la integración. (P0 al empezar)
- `MockSampleSwitcher` debe purgarse antes de demos externas no técnicas. (P3)
- Tipar `resolveStatus` con `React.ReactElement` cuando se añada tsconfig.json. (P3)
- Añadir `tsconfig.json` + script `npm run typecheck` — hoy esbuild no typechecka en CI. (P2)

**Notas para próxima sesión**:
- Repo: https://github.com/arebury/Memory · Live: https://memoryplus3.netlify.app/
- v26 es la versión activa del modal. Cualquier ajuste de body height/padding va por los tokens `--sc-bulk-*` en `sc-design-system.css`, no hardcoded en el componente.
- Los 5 SVG de status están inline en `StatusIcons.tsx` con `fill="currentColor"` (excepto `IconPhone` que usa `stroke="currentColor"` porque Figma lo entregó como outline). Si design entrega más variantes (e.g. "chat con análisis + transcripción simultáneo"), añadir un nuevo `Icon*` y extender la matriz en `resolveStatus`.
- `mockTranscriptionGenerator.ts` cubre 6 dominios. Si las demos repiten el mismo diálogo, ampliar `dialogues[]`.
- Para verificar build: `npx -y pnpm@latest build` (~1m45s aquí; varía). Output esperado: `dist/index-*.css` ~137 kB y `dist/index-*.js` ~836 kB. Warning de chunk >500 kB es esperado (sec 17).
- El modal legacy `PlayerModal.tsx` sigue importado desde `Repository.tsx` y otros — NO borrar todavía. Dependency check: `grep -rn "from .*PlayerModal" src` antes de eliminar.

### 15.12 · 2026-04-28 · Claude Code · v26 · pase de fidelidad sobre el body (alineación + hero 88 + caption muted-OFF)

**Hecho**:
- `--sc-font-size-display` 56→**88px**, `--sc-line-height-display` 48→**88px**. archivos: `src/styles/sc-design-system.css`.
- Tokens del bulk body refactorizados: borrados `--sc-bulk-{hero,decision}-padding-{x,y}`, `--sc-bulk-cell-gap`, `--sc-bulk-decision-gap-{inner,outer}`. Nuevos tokens compartidos por ambas cells: `--sc-bulk-cell-height: 200px`, `--sc-bulk-cell-padding-x: 24`, `--sc-bulk-cell-padding-top: 28`, `--sc-bulk-cell-padding-bottom: 24`, `--sc-bulk-decision-caption-gap: 12` (gap title↔caption), `--sc-bulk-divider-color: var(--sc-border-soft)`. archivos: `src/styles/sc-design-system.css`.
- `BulkTranscriptionModal` body reescrito: ambas cells con mismo padding-top → labels comparten baseline; debajo de cada label un wrapper `flex-1` centra el contenido. Hairline divider vertical entre cells (`border-r`). Hero ahora 88px. Caption alterna muted-OFF / teal-ON (revertida la regla "siempre teal" del borrador v26). "Genera coste" → "genera coste" lowercase. Hero usa `animate-sc-pulse` en lugar de `animate-sc-bump` para que su latido sea visible al tamaño 88px y se sincronice con el de la caption. archivos: `src/app/components/BulkTranscriptionModal.tsx`.
- JSDoc del componente y sec 5 de `memory.md` reescritas para reflejar el layout final (200px height, divider, padding-top compartido, animación unificada).

**Decidido**:
- Hero 88px / 1:1 line-height en lugar de 56px / 48. La columna izquierda DEBE dominar visualmente; con 56px la mirada caía primero al texto "Incluir análisis" 16semibold de la columna derecha y se rompía la jerarquía.
- Padding-top compartido como **mecanismo de alineación de labels**, en lugar de justify-center con gaps anidados que empataran alturas. El padding-top es 1 línea de defensa; cualquier tipografía que cambie de tamaño no rompe la baseline.
- Hero usa `animate-sc-pulse` (mismo de caption). El usuario pidió "misma animación" — unificar las dos animaciones evita inconsistencia perceptual y no añade complejidad (ambas keys ya existen en el componente).
- Hairline divider `--sc-border-soft` (#F3F4F6, casi imperceptible) en lugar de `--sc-border-default` (#D3D5DA) para que separe sin gritar. El v25 era "sin divider"; el v26 final lo añade pero muy sutil.

**Descartado**:
- Mantener `cell-height: 100px` con número 88px. El 88px no respira con 100px de altura — quedaba comprimido contra label.
- Usar CSS Grid para forzar dos columnas con header row + content row. El `flex` con shared padding-top resuelve el mismo problema sin añadir un primitive nuevo.
- Animar el hero con `animate-sc-bump` reescalado a 1.08. Cambiar el valor del bump rompería sus otros usos en el sistema; la pulse ya es 1.08 y tiene la misma curva.

**Pendiente**: ninguno nuevo. Sec 17 sin cambios.

**Notas para próxima sesión**:
- Si el cliente pide subir más el hero (96 / 100 / 112), tocar SOLO `--sc-font-size-display` y `--sc-line-height-display` (mantener 1:1). Si supera 112, subir `--sc-bulk-cell-height` también para que respire.
- El hairline divider va en el lado derecho del hero (`border-r`). Si en el futuro hay que invertir el orden de las cells, mover el `border-r` → `border-l` al elemento que toque.
- La regla "padding-top compartido = labels alineadas" depende de que ambas labels sean directamente el primer child de cada `<section>`. Si alguna sesión añade un wrapper antes de la label, romperá la alineación.

### 15.13 · 2026-04-28 · Claude Code · invariante "chats siempre transcritos" + transcripción tipo chat

**Hecho**:
- Nuevo `normalizeChats(list)` en `src/app/data/mockSamples.ts`: para cada conversación con `channel === "chat"`, fuerza `hasTranscription: true` y siembra `transcription[]` (con `generateTranscriptionFor` si no había script). Aplicado en TODOS los presets — `default`, `all-pending`, `all-done`, `chats-only`, `small`. El preset `calls-only-untranscribed` no necesita normalizar (filtra fuera los chats).
- `all-pending` reescrito: solo resetea llamadas a `hasTranscription: false`. Chats mantienen transcripción (es su estado natural por definición). Antes el preset borraba transcripciones de chats incluido.
- `all-done`: ya forzaba `hasTranscription: true`; ahora pasa también por `normalizeChats` para garantizar `transcription[]` no vacío.
- `ConversationPlayerModal` panel de transcripción reescrito con **layout tipo chat** para AMBOS canales: bubbles alineados a la derecha (agent / Speaker 1, color `bg-sc-accent-soft`) y a la izquierda (cliente / Speaker 2, color `bg-sc-border-soft`). Speaker label + timestamp encima del bubble. Esquinas asimétricas (`rounded-br-md` / `rounded-bl-md`) para look conversacional. Avatares retirados — la disposición en sí ya transmite la diarización.
- Nueva helper `isAgentSpeaker(speaker, conversation)` que reemplaza el if heurístico anterior basado en substrings. Reglas: "Agente"/"Speaker 1" → derecha; "Cliente"/"Speaker 2" → izquierda; en llamadas, `speaker === conversation.origin` también va a la derecha.
- Import de `User` retirado de `lucide-react` en `ConversationPlayerModal` — ya no se renderiza avatar.

**Decidido**:
- Invariante **"chats siempre tienen transcripción"** centralizada en el loader (normalizeChats) en lugar de tocar las 30+ entradas de `mockData.ts`. Razón: si en el futuro se añaden chats sin transcription al mock-data, la normalización los corrige automáticamente. Mantiene `mockData.ts` como fuente de "datos crudos" sin reglas.
- Mismo layout de bubbles para llamadas y chats. La diarización (quién dijo qué, cuándo) se ve mejor en chat-style; replicarla en llamadas unifica la lectura para el supervisor sin perder información (timestamps siguen ahí).
- Sin avatares en bubbles. La separación left/right ya identifica al hablante; añadir un círculo con icono de Headphones / User era ruido.

**Descartado**:
- Editar uno-a-uno cada chat de `mockData.ts` para meterles `hasTranscription: true`. Lento, frágil, no defiende contra futuras adiciones.
- Mantener el render flat (avatar + texto en línea) y solo cambiar los flags. El usuario pidió explícitamente "diarizado como si fuera una conversación de chat, visualmente" — el layout flat no transmite eso.
- Usar burbujas distintas para llamada vs chat. Mismo layout = misma lectura.

**Pendiente**: ninguno nuevo.

**Notas para próxima sesión**:
- Cualquier nuevo chat añadido a `mockData.ts` o a un preset custom queda automáticamente normalizado al pasar por `mockSamples.build()`. Si se introduce una ruta de carga que NO pase por `mockSamples` (por ejemplo, llamando `mockConversations` directamente en otra vista), aplicar `normalizeChats` ahí también.
- En `BulkTranscriptionModal`, `nTrans = calls.filter(c => c.hasRecording && !c.hasTranscription).length` — los chats están naturalmente fuera de la cuenta de "ready to transcribe". Si se cambiara la fórmula para incluir chats, romper la invariante.
- El chat icon `IconChat` (bocadillo plano sin transcripción) en `StatusIcons.tsx` ahora es **dead code** porque ningún chat puede llegar a ese estado. Dejar el componente por defensa pero marcar para borrar si la invariante se solidifica en producción.

### 15.14 · 2026-04-28 · Claude Code · análisis = resumen+sentimiento, invariantes globales, player polish, Repositorio rehecho

**Hecho**:
- Análisis tab del `ConversationPlayerModal` reducido a **Resumen + Sentimiento**: borradas las secciones "Categorías detectadas" y "Entidades clave". Resumen ahora deriva de la transcripción usando `summarizeTranscript(conversation)` que indexa por `hashString(c.id) % 6` — el mismo hash que usa `mockTranscriptionGenerator` para escoger plantilla de diálogo, así resumen y transcripción siempre cuentan la misma historia. Sentimiento ahora detecta léxico negativo en el propio texto de la transcripción (`/molest|frustr|inadmis|reclam|queja|incidenc|problem|injust|enfad|inacept/i`) en lugar de mirar `aiCategories`. archivos: `src/app/components/ConversationPlayerModal.tsx`.
- `Section` del player extendido con prop opcional `aside` para una etiqueta "Generado por IA" junto al título de Resumen (Sparkles + caption muted). Sección Sentimiento usa `items-baseline` para alinear el dot con el texto.
- **Invariante "no análisis sin transcripción"** centralizada en `normalizeChats(list)` de `mockSamples.ts`: si una row tiene `hasAnalysis: true` pero `hasTranscription: false`, baja `hasAnalysis: false` y limpia `aiCategories`. Se aplica antes de devolver cualquier sample. Refleja la realidad del producto — el análisis se deriva del texto. archivos: `src/app/data/mockSamples.ts`.
- `handleRequestAnalysis` en `ConversationsView` ahora filtra targets sin transcripción antes de meterlos en `analyzingIds`. Si todos los targets eran inválidos, no se dispara el setTimeout. Defensa frente a UIs futuras que llamen al handler con IDs no elegibles. archivos: `src/app/components/ConversationsView.tsx`.
- `ConversationPlayerModal` reformado con impeccable + ui-ux-pro-max:
  - Header icon **channel-aware**: `<Phone>` para llamadas, `<MessageSquare>` para chats. Antes era siempre `<Headphones>` aunque la fila fuera un chat sin audio.
  - Título contextual: "Llamada · #ID" o "Chat · #ID" en lugar del genérico "Conversación · #ID".
  - **Audio player oculto para chats** (no hay audio que reproducir). Antes el player se renderizaba con todos los botones disabled.
  - Constante `FOCUS_RING` aplicada a TODOS los botones del player (back-10, play, fwd-10, scrub, download), tabs y al Section header — anillo `ring-2 ring-sc-accent ring-offset-2 ring-offset-sc-surface` solo en `:focus-visible`.
  - `cursor-pointer` explícito en cada botón habilitado; `disabled:cursor-not-allowed` se mantiene.
  - Scrub bar mejorado: hit-target de 20px (antes 8px), `role="slider"` con `aria-valuemin/max/now`, **thumb circular** que aparece en hover/focus o mientras `isPlaying`. Transición de 150ms en el progreso. Easing por defecto.
  - Botón play tiene `active:scale-[0.97]` para feedback táctil de press.
  - Search input de la transcripción: `type="search"`, `aria-label`, transición de border-color en hover, ring suave (20% alpha) en focus, `placeholder:text-sc-muted`.
  - "líneas" → "intervenciones" en el contador encima de la transcripción.
- **Repositorio LP rehecho** desde cero. Antes era un `Repository.tsx` de 245 líneas con hexes hardcodeados (`#F4F6FC`, `#1C283D`, etc.), 3 iconos coloreados apilados en la card de reglas (rojo+azul+púrpura), grids idénticos repetidos y "estructura del contact center" disfrazada de CTA con `cursor-default`. Ahora:
  - Tokens `--sc-*` en todos lados, ningún hex literal.
  - **"Cómo funciona" ribbon** al inicio: 3 pasos numerados (`01 Configuras reglas` / `02 La IA hace el trabajo` / `03 Tú revisas`) con flechas conectoras solo en sm+. Orienta a un supervisor nuevo sin fricción.
  - **Hero card de Reglas** (no más cluster de 3 iconos): título grande, body ampliado, chips inline `Grabación / Transcripción / Clasificación IA` (texto neutral, icono teal-strong), CTA "Cómo funcionan las reglas" en la esquina derecha del bloque de chips.
  - **Categorías y Entidades** como dos PrimaryCard en grid 2-col idéntico — un solo color de acento (teal), no purple/teal split.
  - **Estructura sincronizada** demoted a una **fila inline de pills** (Servicios · Grupos · Agentes) con caption explicando que se gestiona desde el IVR. No mimetiza CTA.
  - **Próximamente** demoted a `<ul>` con divider hairlines, no card grid.
  - UX writing expandido: descripciones concretas con ejemplos (`"queja de facturación"`, `"importes, productos, identificadores"`); cada Group tiene un eyebrow + descripción que explica POR QUÉ existe la sección, no solo qué contiene.
  - `focus-visible` rings consistentes con el player.
  - `aria-label` en hero card; `role="button"` con `tabIndex={0}` y handler de teclado para Enter/Space. archivos: `src/app/components/Repository.tsx`.
- `.impeccable.md` creado en raíz del repo con la Design Context completa (Users, Brand Personality, Aesthetic Direction, 5 principios y anti-references). Sintetiza lo que ya estaba disperso en `memory.md` sec 1, 4, 5 y 16 para que `/impeccable craft|extract` futuros no necesiten teach. archivos: `.impeccable.md`.

**Decidido**:
- **Resumen y transcripción comparten hash**. Mismo `hashString(c.id) % 6` selecciona plantilla de diálogo y plantilla de resumen. Garantiza coherencia narrativa (no puede haber un resumen sobre facturación si la transcripción es de soporte técnico). Trade-off: solo hay 6 historias distintas en la app, pero a cambio nunca hay disonancia entre las dos pestañas.
- **Sentimiento detecta léxico en el texto** en vez de mirar `aiCategories`. Razón: el sentimiento es independiente de las categorías — una llamada de "Soporte Técnico" puede ser positiva o negativa. Detectarlo en el texto es más fiel y sobrevive si en el futuro `aiCategories` cambia de forma.
- **Análisis estricto a Resumen + Sentimiento**, sin Categorías ni Entidades. Los entities en el panel daban la falsa impresión de que la IA extraía valores estructurados de cada conversación; en producción real eso requiere configuración explícita (Entidades del repositorio) y no siempre devuelve algo. Mejor no enseñarlo cuando es mock.
- **Channel-aware header del player**. Mostrar un icono de auriculares en un chat es contradictorio. Phone para llamada, MessageSquare para chat — el icono refuerza el contexto, no lo confunde.
- **Audio player oculto para chats**, no disabled. Renderizarlo en gris ofrecía algo no funcional con apariencia de funcional. Esconderlo es más honesto.
- **Repositorio sin cluster de 3 iconos coloreados**. El cluster (rojo grabación / azul transcripción / púrpura IA) era el patrón AI-slop "rainbow KPI tile" que la skill `impeccable` señala. Sustituido por chips inline con el mismo contenido pero peso visual neutral.
- **"Cómo funciona" ribbon en lugar de muchos textos explicativos por sección**. Tres pasos numerados son más rápidos de leer que 4 párrafos repartidos. Al supervisor le sirve para orientarse 1 vez; luego el ribbon se ignora.
- **Estructura sincronizada como pill row**, no card grid. Los datos del IVR no son CTAs — convertirlos en cards con border + hover engaña al usuario. Pill row deja claro que son lectura.

**Descartado**:
- Mostrar contadores reales ("12 reglas activas", "8 categorías") en las cards. Acoplaba Repository al RulesContext / CategoriesContext y rompía si se reseteaba el localStorage. Texto descriptivo es suficiente.
- Mantener el split purple/teal (Categorías púrpura, Entidades teal). Coherente con la columna Estado de la tabla, sí — pero en el repositorio no hay analogía visual: ambos son configuración, no estado de procesamiento. Un solo acento.
- Borrar el SUMMARY_TEMPLATES e intentar generar un resumen palabra a palabra del transcript. Demasiado mock para el coste; los 6 templates son más fiables y mantienen el determinismo.
- Reescribir `mockData.ts` para forzar `hasTranscription: true` en cada chat. Más frágil que normalizar en el loader (`mockSamples.ts`). El loader es el único punto de carga, así la invariante se cumple sin tocar 30+ entradas.

**Pendiente**: ninguno nuevo. Sec 17 sin cambios.

**Notas para próxima sesión**:
- Las invariantes ahora son **dos**, ambas centralizadas en `normalizeChats` de `mockSamples.ts`:
  1. Chat → `hasTranscription: true` + `transcription[]` poblado.
  2. `hasAnalysis: true` ⇒ `hasTranscription: true` (en otro caso se baja `hasAnalysis`).
  Cualquier código nuevo que mute `Conversation` debe pasar por estas reglas o introducirlas en su propio path.
- El resumen del Análisis está en un array `SUMMARY_TEMPLATES` dentro de `ConversationPlayerModal.tsx`. Si se añaden plantillas nuevas a `mockTranscriptionGenerator.ts`, añadir el resumen correspondiente en el mismo orden — el match es por índice de hash.
- `.impeccable.md` y `memory.md` divergirán con el tiempo si no se sincronizan. Política: cualquier cambio en sec 4 (Design System) o sec 16 (estrategia) de `memory.md` debe copiarse al `.impeccable.md` si afecta a Aesthetic Direction o Design Principles.
- El nuevo Repository LP usa `bg-sc-canvas` (no `bg-[#F4F6FC]`). Si en el futuro se ajusta el canvas en sec 4 del memory.md, todos los hijos del repo se reajustan automáticamente — ya no hay magic numbers que cazar uno a uno.
