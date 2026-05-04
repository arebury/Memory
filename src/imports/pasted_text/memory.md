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

7. **Diarización · DEPRECADA en 15.23**. Históricamente era checkbox dentro de `TranscriptionRequestModal` y existía un `DiarizationRequestModal` separado para añadirla a posteriori. **Eliminada del producto entero** — solo existen "Transcripción" y "Análisis" (resumen + sentimiento). `DiarizationRequestModal` borrado en 15.23 (deprecado como concepto), `TranscriptionRequestModal` borrado en 15.28 (modal innecesario, sec 20.14). Cualquier modal/checkbox/copy con "diarización" en el repo hoy es bug. El campo `Conversation.hasDiarization` sigue en el modelo de datos pendiente de schema cleanup (sec 17 P3).

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

### Limitación asumida (consciente, no urgente)

**Pérdida de feedback visual tras logout o inactividad.**
Si el usuario cierra sesión durante un batch, el backend sigue procesando. Al volver:
- Las transcripciones nuevas (post-login) muestran feedback visual (fila amarilla, contador progresivo).
- Las que se procesaron mientras estaba fuera pierden indicador visual — no se pueden identificar.

Razón: el backend puede forzar la barra de progreso en peticiones nuevas, pero no reconstruir feedback histórico (requeriría una DB de actividad por usuario). Aceptado como limitación. Concepto futuro: indicador persistente tipo "marcar como leído" de Gmail/Teams.

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

- Migrar al `<Modal>` shell SC los modales legacy todavía pendientes: `CreateEntityModal`, `DeleteCategoryDialog`. (`TranscriptionRequestModal` y `RetranscriptionConfirmModal` migrados en 15.23. `DiarizationRequestModal`, `PlayerModal` legacy y `RuleSelectionModal` borrados — el primero en 15.23 como concepto deprecado, los otros dos en 15.26 como dead code.) (P1)
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
- Reemplazar `alert()` de `handleDownload` (`ConversationsView.tsx:249-251`) por `scToast.info` o cablear a download real. (P3)
- Wire del link "Cómo funcionan las reglas" en `Repository.tsx:299` — hoy `window.open("#", ...)`. Apuntar a docs reales o reusar la URL de Figma site del help button. (P2)
- Wire o eliminar el botón Search decorativo en `ConversationFilters.tsx:91-95` — los filtros se aplican en `onChange` así que el botón no hace nada. (P3)
- Eliminar `Conversation.hasDiarization` del modelo y de los presets (`mockData.ts`, `mockSamples.ts`) — la diarización es concepto deprecado (15.23) pero el campo persiste. Pasada de schema cleanup. (P3)
- Resolver discusión sobre `<Sparkles>` como icono de tab Análisis en `ConversationPlayerModal.tsx:389`. memory.md sec 15.18 dice "Sparkles reservado exclusivamente a la pill 'Generado por IA'". Estricto vs práctico. (P3)
- Añadir `@media (prefers-reduced-motion: reduce)` para los keyframes `sc-delta-fly`, `sc-bump`, `sc-pulse`, `sc-shake` en `sc-design-system.css`. (P3)
- 8 botones de navegación inertes en `Sidebar.tsx` (Grid/Search/BarChart3/Phone/Users/Wrench/Settings/Clock) — decidir si esconder o promover a roadmap visible (hoy son visualmente decorativos pero introducen 8 tab-stops disabled aun con aria-label "Próximamente: …"). (P3)
- ~22 archivos shadcn primitives en `src/app/components/ui/` están sin importadores hoy (`accordion`, `aspect-ratio`, `carousel`, `chart`, `command`, `context-menu`, `drawer`, `hover-card`, `input-otp`, `menubar`, `navigation-menu`, `pagination`, `resizable`, `skeleton`, `toggle`, `toggle-group`, `breadcrumb`, `form`, `use-mobile`, `alert`, `calendar`, `radio-group`, `slider`). Mantenidos como kit reutilizable; auditar si una pasada de bundle-size lo requiere o si un feature concreto los necesita. (P3)

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
| **Decisión de producto / UX cerrada** (regla del producto, no del código) | Sec 13 del canon, subsección "Decisiones de producto cerradas" | Es load-bearing del producto, no patrón técnico |
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
6. Si hay decisiones de producto nuevas, añadirlas a sec 13 (subsección "Decisiones de producto cerradas").
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

**Implementación canónica**: `RecordingTimeline` en `RecordingPicker.tsx`.

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
