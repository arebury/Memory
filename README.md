# 💬 Memory

> Memory es la parte de Smart Contact que permite revisar miles de conversaciones (llamadas y chats) y decidir cuáles transcribir y analizar con IA, sin que el supervisor tenga que escucharlas todas a mano.

🌐 **Pruébalo en vivo**: [memoryplus3.netlify.app](https://memoryplus3.netlify.app/)

[![live](https://img.shields.io/badge/live-memoryplus3.netlify.app-00C7B7?style=flat-square&logo=netlify&logoColor=white)](https://memoryplus3.netlify.app/)
![status](https://img.shields.io/badge/status-prototipo-F59E0B?style=flat-square)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?style=flat-square&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix_UI-1.x-161618?style=flat-square&logo=radixui&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-10-F69220?style=flat-square&logo=pnpm&logoColor=white)

---

## ¿Qué problema resuelve?

Un supervisor de contact center revisa miles de conversaciones al día. **Memory** decide automáticamente cuáles merecen ser procesadas — y qué profundidad de procesamiento aplicar a cada una — para que su revisión vaya directa a lo que importa.

Tres palancas, en este orden:

1. **Reglas** deciden qué conversaciones se graban, transcriben y analizan.
2. **La IA** etiqueta categorías (motivos de contacto) y extrae entidades (importes, productos, identificadores).
3. **El supervisor revisa** en una tabla densa con filtros, transcripciones tipo chat y un resumen IA por conversación.

## ¿Qué encontrarás dentro?

| Vista | Para qué sirve |
|---|---|
| **Conversaciones** | Tabla principal. Filtra por servicio, fecha, agente, estado de procesamiento. Selección múltiple para transcripción / análisis masivo. |
| **Reproductor** | Modal por conversación. Audio (en llamadas), transcripción diarizada tipo chat y panel de **Resumen + Sentimiento** generados por IA. |
| **Repositorio** | Configuración. Reglas de automatización, categorías IA y entidades a extraer. La estructura del IVR (servicios, grupos, agentes) se sincroniza automáticamente. |
| **Transcripción masiva** | Modal de bulk. Avisa de que la operación genera coste y permite incluir el análisis IA con un toggle. |

## Decisiones de producto que el código refleja

- **Los chats siempre tienen transcripción** — son texto por definición; el sistema los normaliza al cargarlos.
- **No hay análisis sin transcripción** — el resumen y el sentimiento se derivan del texto. Cualquier flag contradictorio se corrige en el loader.
- **Resumen y transcripción cuentan la misma historia** — ambos eligen plantilla por el mismo hash del id, así nunca hay disonancia entre las dos pestañas del reproductor.
- **Una regla sin alcance no hace nada** — todas las reglas exigen al menos un servicio, grupo o agente. La UI no permite guardar una regla vacía.

## 🚀 Cómo correrlo en local

Necesitas **Node 18+**. Si no tienes `pnpm` instalado, los comandos siguientes lo invocan vía `npx`:

```bash
# instalar dependencias (primera vez o tras tocar package.json)
npx -y pnpm@latest install

# servidor de desarrollo con HMR
npx -y pnpm@latest dev
# → http://localhost:5173

# build de producción
npx -y pnpm@latest build
# → produce dist/

# preview del build de producción
npx -y pnpm@latest preview
# → http://localhost:4173
```

> **Sin backend**: toda la data es mock. El estado del usuario (reglas, categorías, entidades) persiste en `localStorage` para simular continuidad entre recargas.

## 🛠️ Stack

- **React** 18.3.1 + **Vite** 6.3.5 + **TypeScript**
- **Tailwind CSS** v4 con `@theme inline` y design tokens propios (`--sc-*`)
- **Radix UI** para primitivas accesibles, **shadcn/ui** como wrapper
- **lucide-react** (iconografía), **motion** (animaciones), **sonner** (toasts)
- **react-hook-form**, **react-dnd**, **recharts**, **react-day-picker**
- Gestor de paquetes: **pnpm** 10.33.2

## 🎯 Naturaleza del proyecto

Este repositorio contiene un **prototipo en React** cuya función es validar diseño y flujos antes de la implementación real. La producción se construye en **Angular + PrimeNG** por el equipo del cliente.

La decisión sobre el destino del prototipo (¿desechable? ¿spec viva en PrimeReact? ¿pivote a Angular?) está documentada y deliberadamente **diferida** hasta que el design system del cliente esté maduro. Detalles en [`memory.md` sección 16](src/imports/pasted_text/memory.md).

> **Antes de tocar código**: lee [`memory.md`](src/imports/pasted_text/memory.md). Es la fuente única de verdad sobre arquitectura, design system, decisiones tomadas y descartadas, y el log de cada sesión de desarrollo. Si en una sesión añades una decisión no obvia, va al log de la sec 15.

## 📁 Estructura

```
src/
├── styles/
│   ├── default_theme.css        # Tokens shadcn (KEEP_IN_SYNC, no editar)
│   ├── sc-design-system.css     # Tokens propios --sc-* en 3 capas
│   ├── globals.css              # Roboto + keyframes globales
│   └── index.css                # Entry point CSS
├── app/
│   ├── App.tsx                  # Root, gestiona vistas con useState
│   ├── data/
│   │   ├── mockData.ts                      # Conversaciones base
│   │   ├── mockSamples.ts                   # Presets + invariantes (chat→transcripción, análisis⇒transcripción)
│   │   └── mockTranscriptionGenerator.ts    # 6 plantillas de diálogo determinísticas
│   ├── components/
│   │   ├── ui/                  # shadcn/ui + ui/modal.tsx (SC shell)
│   │   ├── rules/               # Builders de reglas
│   │   └── *.tsx                # Vistas y componentes de aplicación
│   └── imports/                 # Assets SVG importados de Figma
└── imports/pasted_text/
    └── memory.md                # Documentación arquitectónica completa
```

## 🚢 Deploy

URL pública: **https://memoryplus3.netlify.app/**

Conectado a **Netlify** para despliegue continuo. Cada push a `main` dispara un build (`pnpm build`, ~2 min) y publica `dist/`.

```
local edit → git push origin main → webhook → Netlify rebuild → URL pública actualizada
```

Configuración declarativa en [`netlify.toml`](netlify.toml). Troubleshooting, variables de entorno y rollback en `memory.md` sección 18.

## 📌 Estado actual

Prototipo funcional. Toda la data es mock, el estado del usuario vive en `localStorage`. La lista de items abiertos (con prioridades P0-P3) se mantiene en `memory.md` sección 17.

Lo más reciente — en orden cronológico — está al final de la sección 15 de `memory.md`.

## 👤 Autoría

**Rafael Areses Brackenbury** · [@arebury](https://github.com/arebury)
