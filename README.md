# Memory

Dashboard de monitorización de conversaciones para contact centers. Permite a supervisores y administradores revisar conversaciones (llamadas y chats), lanzar transcripciones y análisis IA, y gestionar reglas automáticas de grabación, transcripción y clasificación.

## Naturaleza del proyecto

Este repositorio contiene un **prototipo en React** cuya función es validar diseño y flujos antes de la implementación real. La producción se construye en **Angular + PrimeNG** por el equipo del cliente. Los detalles arquitectónicos, el sistema de tokens y la decisión pendiente sobre el destino del prototipo están documentados en [`src/imports/pasted_text/memory.md`](src/imports/pasted_text/memory.md) (sección 16).

## Stack

- **React** 18.3.1
- **Vite** 6.3.5
- **TypeScript**
- **Tailwind CSS** v4 (con `@theme inline` y design tokens propios)
- **Radix UI** (primitivas accesibles)
- **shadcn/ui** (componentes wrapper sobre Radix)
- **lucide-react** (iconografía)
- **motion** (animaciones)
- **react-hook-form**, **react-dnd**, **recharts**, **react-day-picker**, **sonner**
- Gestor de paquetes: **pnpm** 10.33.2

## Cómo correrlo en local

Requisitos: Node 18+ y `pnpm` (o usar `npx -y pnpm@latest` sin instalación global).

```bash
# instalar dependencias
npx -y pnpm@latest install

# servidor de desarrollo (HMR)
npx -y pnpm@latest dev
# → http://localhost:5173

# build de producción
npx -y pnpm@latest build
# → produce dist/

# preview del build de producción
npx -y pnpm@latest preview
# → http://localhost:4173
```

## Estructura

```
src/
├── styles/
│   ├── default_theme.css        # Tokens shadcn (KEEP_IN_SYNC, no editar)
│   ├── sc-design-system.css     # Tokens propios (--sc-*) en 3 capas
│   ├── globals.css              # Roboto + keyframes globales
│   └── index.css                # Entry point CSS
├── app/
│   ├── App.tsx                  # Root, gestiona vistas con useState
│   ├── data/mockData.ts         # Datos mock + localStorage
│   ├── components/
│   │   ├── ui/                  # shadcn/ui + ui/modal.tsx (SC shell)
│   │   ├── rules/               # Builders de reglas
│   │   └── *.tsx                # Vistas y componentes de aplicación
│   └── imports/                 # Assets SVG importados de Figma
└── imports/pasted_text/
    └── memory.md                # Documentación arquitectónica completa
```

La fuente única de verdad sobre arquitectura, design system, lógica de negocio y decisiones está en [`memory.md`](src/imports/pasted_text/memory.md). Cualquier sesión de desarrollo (humana o asistida) debe leerla antes de tocar código.

## Deploy

El repositorio está conectado a Netlify para despliegue continuo. Cada push a `main` dispara un build (`pnpm build`) y publica `dist/` en la URL pública. Configuración declarativa en [`netlify.toml`](netlify.toml).

## Estado actual

Prototipo funcional. Toda la data es mock; el estado persiste en `localStorage` para simular continuidad entre recargas. La lista de items abiertos vive en `memory.md` sección 17.

## Autoría

Rafael Areses Bury · [@arebury](https://github.com/arebury)
