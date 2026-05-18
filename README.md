# 💬 Memory — repo legacy

> Este repositorio contiene el **prototipo en React** original del módulo Memory de Smart Contact. El código activo se ha migrado al monorepo Angular del cliente.

![status](https://img.shields.io/badge/status-archivado-94A3B8?style=flat-square)
![legacy](https://img.shields.io/badge/legacy-React_18.3_%2B_Vite-61DAFB?style=flat-square&logo=react&logoColor=white)
![archive tag](https://img.shields.io/badge/tag-v0--prototype--react--pre--scds-8B5CF6?style=flat-square&logo=git&logoColor=white)
![archive branch](https://img.shields.io/badge/branch-prototype--react--archive-8B5CF6?style=flat-square&logo=github&logoColor=white)

---

## ¿Dónde está el código activo?

El módulo Memory se está reimplementando en **Angular 21 + PrimeNG + Smart Contact Design System (SCDS)** dentro del monorepo principal:

- **Repo activo**: [`arebury/smart-contact-platform`](https://github.com/arebury/smart-contact-platform)
- **Ruta exacta**: pendiente de decidir (feature module dentro del shell Supervisor o app independiente — ver `docs/NEXT-SESSION-PLAN.md` del monorepo, Eje 3).

Este repositorio (`arebury/Memory`) **queda como archivo histórico**. Cualquier desarrollo nuevo va al monorepo.

## ¿Cómo recuperar el prototipo React?

El prototipo React vive en este repo de tres maneras complementarias:

| Mecanismo | Para qué sirve |
|---|---|
| 📁 [`legacy-react/`](./legacy-react/) | Carpeta navegable con el código fuente, accesible desde `main`. Útil para leer código sin checkout. |
| 🏷️ Tag `v0-prototype-react-pre-scds` | Snapshot inmutable del prototipo **antes** de la reorganización. `git checkout v0-prototype-react-pre-scds` para volver al estado exacto del día del corte. |
| 🌿 Branch `prototype-react-archive` | Espejo del tag como branch (para crear hotfixes históricos si hicieran falta sin contaminar `main`). |

### Correr el prototipo en local

```bash
cd legacy-react/
npx -y pnpm@latest install
npx -y pnpm@latest dev
# → http://localhost:5173
```

> Toda la data es mock. El estado del usuario persiste en `localStorage` para simular continuidad entre recargas.

## ¿Qué era Memory?

Memory es la parte de Smart Contact que permite revisar miles de conversaciones (llamadas y chats) y decidir cuáles transcribir y analizar con IA, sin que el supervisor tenga que escucharlas todas a mano.

Un supervisor de contact center revisa miles de conversaciones al día. Memory decide automáticamente cuáles merecen ser procesadas — y qué profundidad de procesamiento aplicar a cada una — para que su revisión vaya directa a lo que importa.

Tres palancas, en este orden:

1. **Reglas** deciden qué conversaciones se graban, transcriben y analizan.
2. **La IA** etiqueta categorías (motivos de contacto) y extrae entidades (importes, productos, identificadores).
3. **El supervisor revisa** en una tabla densa con filtros, transcripciones tipo chat y un resumen IA por conversación.

### Decisiones de producto que el prototipo refleja

- **Los chats siempre tienen transcripción** — son texto por definición; el sistema los normaliza al cargarlos.
- **No hay análisis sin transcripción** — el resumen y el sentimiento se derivan del texto. Cualquier flag contradictorio se corrige en el loader.
- **Resumen y transcripción cuentan la misma historia** — ambos eligen plantilla por el mismo hash del id, así nunca hay disonancia entre las dos pestañas del reproductor.
- **Una regla sin alcance no hace nada** — todas las reglas exigen al menos un servicio, grupo o agente. La UI no permite guardar una regla vacía.

## Documentación conceptual que sigue siendo útil

Estos directorios contienen documentación del producto Memory **independiente del stack**. Sirven de referencia conceptual para la reimplementación Angular:

| Directorio | Contenido |
|---|---|
| [`docs/`](./docs/) | Decisiones, lógica de conteo, referencia de UI, sistema de diseño y specs funcionales. |
| [`audit/`](./audit/) | Auditorías UX/UI con findings concretos. |
| [`guidelines/`](./guidelines/) | Guidelines de diseño y producto. |
| [`memory-archive/`](./memory-archive/) | Diario/log mensual del desarrollo del prototipo. |

## Estado de la URL pública

`memoryplus3.netlify.app` se reservará para la versión Angular nueva cuando esté lista. Durante la transición:

- El prototipo React original sigue **buildable** desde `legacy-react/`. Si alguien necesita demostrar la versión React, puede arrancar local o redeployear `prototype-react-archive` a una URL temporal.
- Una vez la versión Angular esté en aire, `memoryplus3.netlify.app` apuntará a ella.

## 👤 Autoría

**Rafael Areses Brackenbury** · [@arebury](https://github.com/arebury)

---

> **Historial de la migración**: cierre Session 34 (2026-05-18) en el monorepo. Ver `docs/SESSION-LOG.md` y `docs/case-study-notes.md` en [`arebury/smart-contact-platform`](https://github.com/arebury/smart-contact-platform).
