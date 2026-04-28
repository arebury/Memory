import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Database,
  MessageSquareText,
  Phone,
  Sparkles,
  Tags,
  User,
  Users,
  Workflow,
  Mic,
  FileText,
} from "lucide-react";
import { DataExportImport } from "./DataExportImport";
import { useRules } from "./RulesContext";
import { useCategories } from "./CategoriesContext";
import { useEntities } from "./EntitiesContext";
import { cn } from "./ui/utils";
import { FOCUS_RING } from "./ui/focus";

interface RepositoryProps {
  onNavigateToRules: () => void;
  onNavigateToEntities: () => void;
  onNavigateToCategories: () => void;
}

/**
 * Repository · landing page for everything configurable in the
 * platform. v26 redesign:
 *
 *  - SC tokens only (no Figma-Make hex soup).
 *  - "Cómo funciona" ribbon orients new supervisors in three steps.
 *  - Hero card for Reglas (the central abstraction supervisors edit).
 *  - Two equal cards for the AI primitives (Categorías + Entidades).
 *  - Synced structure (Servicios / Grupos / Agentes) as an inline
 *    pill row — read-only, no CTA mimicry.
 *  - "Próximamente" demoted to a slim list.
 *
 *  UX-writing principles applied:
 *   · Frame from the supervisor's perspective ("decides", "revisas").
 *   · Use concrete examples in descriptions ("queja de facturación",
 *     "importes, productos, fechas").
 *   · Lead each group with a sentence that explains WHY, not just WHAT.
 *   · Avoid gradient text, accent stripes, identical card grids.
 */

export function Repository({
  onNavigateToRules,
  onNavigateToEntities,
  onNavigateToCategories,
}: RepositoryProps) {
  const { rules } = useRules();
  const { categories } = useCategories();
  const { entities } = useEntities();
  // Only show the orientation ribbon to first-time supervisors. Once a
  // single rule exists, we assume the user has been onboarded and the
  // ribbon would be redundant noise on every visit.
  const showHowItWorks = rules.length === 0;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-sc-canvas">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-sc-border bg-sc-surface px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-sc-lg font-medium leading-[var(--sc-line-height-h4)] text-sc-heading">
              Repositorio
            </h1>
            <p className="mt-1 text-sc-base leading-[var(--sc-line-height-body2)] text-sc-body">
              Configura cómo se procesan tus conversaciones — lo que se graba, lo que la IA detecta y lo que termina en tu revisión.
            </p>
          </div>
          <DataExportImport />
        </div>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-10">
          {/* ─── Cómo funciona · orientation ribbon · first-run only ─── */}
          {showHowItWorks && <HowItWorks />}

          {/* ─── Automatización ─── */}
          <Group
            eyebrow="Automatización"
            description="Las reglas son el motor. Sin una regla activa, ninguna conversación se procesa."
          >
            <RulesHeroCard onClick={onNavigateToRules} count={rules.length} />
          </Group>

          {/* ─── Inteligencia artificial ─── */}
          <Group
            eyebrow="Inteligencia artificial"
            description="Lo que la IA debe aprender a detectar y a extraer. Sin estas piezas, el análisis devuelve poco accionable."
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PrimaryCard
                title="Categorías"
                description="Los temas y motivos de contacto que la IA etiqueta — por ejemplo, “queja de facturación” o “consulta técnica”."
                icon={<Tags size={18} strokeWidth={1.6} />}
                count={categories.length}
                onClick={onNavigateToCategories}
              />
              <PrimaryCard
                title="Entidades"
                description="Datos concretos a extraer del texto: importes, productos, identificadores de cliente, fechas."
                icon={<Database size={18} strokeWidth={1.6} />}
                count={entities.length}
                onClick={onNavigateToEntities}
              />
            </div>
          </Group>

          {/* ─── Estructura sincronizada ─── */}
          <Group
            eyebrow="Estructura sincronizada"
            description="Lo que ya vive en tu IVR. Lo usarás como alcance al construir reglas, pero no se gestiona desde aquí."
          >
            <div className="flex flex-col gap-3 rounded-sc-lg border border-sc-border-soft bg-sc-surface px-5 py-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <SyncedItem icon={<Phone size={14} strokeWidth={1.6} />} label="Servicios" hint="Líneas de atención y colas de entrada" />
                <SyncedItem icon={<Users size={14} strokeWidth={1.6} />} label="Grupos" hint="Equipos por función" />
                <SyncedItem icon={<User size={14} strokeWidth={1.6} />} label="Agentes" hint="Operadores individuales" />
              </div>
              <p className="text-sc-xs text-sc-muted">
                Sincronizado automáticamente. Si falta algo aquí, créalo en tu sistema IVR — aparecerá en la próxima sincronización.
              </p>
            </div>
          </Group>

          {/* ─── Próximamente ─── */}
          <Group
            eyebrow="Próximamente"
            description="En desarrollo. Te avisaremos cuando estén disponibles."
          >
            <ul className="divide-y divide-sc-border-soft overflow-hidden rounded-sc-lg border border-sc-border-soft bg-sc-surface">
              <ComingSoonItem
                icon={<Workflow size={15} strokeWidth={1.6} />}
                title="Scripts de IVR"
                description="Flujos de conversación y árboles de decisión configurables sin tocar el IVR."
              />
              <ComingSoonItem
                icon={<MessageSquareText size={15} strokeWidth={1.6} />}
                title="Plantillas de respuesta"
                description="Respuestas predefinidas que tus agentes podrán reutilizar en chat."
              />
            </ul>
          </Group>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   How it works — three-step orientation ribbon. Sits right after
   the header so a supervisor opening the Repositorio for the first
   time sees the full lifecycle on a single line, then the rest of
   the page is the menu of things they can configure.
   ──────────────────────────────────────────────────────────────── */
function HowItWorks() {
  const steps: { num: string; title: string; body: string }[] = [
    {
      num: "01",
      title: "Configuras reglas",
      body: "Defines qué llamadas y chats se graban, transcriben y analizan, y bajo qué alcance.",
    },
    {
      num: "02",
      title: "La IA hace el trabajo",
      body: "Etiqueta cada conversación con tus categorías y extrae las entidades que has definido.",
    },
    {
      num: "03",
      title: "Tú revisas",
      body: "En Conversaciones aparece todo ya procesado, listo para auditar o filtrar.",
    },
  ];

  return (
    <section className="rounded-sc-lg border border-sc-border-soft bg-sc-surface px-6 py-5">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sc-xs font-bold uppercase tracking-wide text-sc-body">
          Cómo funciona
        </h2>
        <span className="text-sc-xs text-sc-muted">3 pasos</span>
      </header>
      <ol className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {steps.map((s, i) => (
          <li
            key={s.num}
            className="relative flex flex-col gap-1.5 sm:pr-4"
          >
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-sc-xs tabular-nums text-sc-accent-strong">
                {s.num}
              </span>
              <span className="text-sc-md font-semibold leading-[var(--sc-line-height-md)] text-sc-heading">
                {s.title}
              </span>
            </div>
            <p className="text-sc-sm leading-[var(--sc-line-height-body2)] text-sc-body">
              {s.body}
            </p>
            {/* Step connector — only between steps, only on wide layouts */}
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className="pointer-events-none absolute right-0 top-2 hidden sm:block"
              >
                <ArrowRight
                  size={14}
                  strokeWidth={1.5}
                  className="text-sc-border"
                />
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   Group — eyebrow + description + content. Shared rhythm: 4 between
   eyebrow and caption, then content stack starts.
   ──────────────────────────────────────────────────────────────── */
function Group({
  eyebrow,
  description,
  children,
}: {
  eyebrow: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-[var(--sc-space-400)]">
      <header className="flex flex-col gap-[var(--sc-space-100)]">
        <h2 className="text-sc-xs font-bold uppercase tracking-wide text-sc-body">
          {eyebrow}
        </h2>
        <p className="max-w-prose text-sc-sm leading-[var(--sc-line-height-body2)] text-sc-muted">
          {description}
        </p>
      </header>
      {children}
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   Hero card — Reglas. Central abstraction; gets the most surface.
   The three rule kinds are surfaced as labelled chips so the scope
   reads at a glance without a coloured icon stack.
   ──────────────────────────────────────────────────────────────── */
function RulesHeroCard({ onClick, count }: { onClick: () => void; count: number }) {
  return (
    <div
      className={cn(
        "group relative flex cursor-pointer flex-col gap-[var(--sc-space-400)] overflow-hidden rounded-sc-lg",
        "border border-sc-border bg-sc-surface px-7 py-6 shadow-sc-sm",
        "transition-all hover:border-sc-accent hover:shadow-sc-md",
        "focus-within:ring-2 focus-within:ring-sc-accent focus-within:ring-offset-2 focus-within:ring-offset-sc-canvas",
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label="Configurar reglas de automatización"
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-[var(--sc-space-300)]">
          <div className="flex items-baseline gap-3">
            <h3 className="text-sc-lg font-semibold leading-[var(--sc-line-height-h4)] text-sc-heading">
              Reglas de automatización
            </h3>
            <span className="font-mono text-sc-xs tabular-nums text-sc-muted">
              {count} {count === 1 ? "configurada" : "configuradas"}
            </span>
          </div>
          <p className="max-w-prose text-sc-base leading-[var(--sc-line-height-body2)] text-sc-body">
            Decide qué conversaciones se graban, se transcriben y se analizan con IA. Las reglas se evalúan por orden de prioridad y aplican el alcance que tú elijas — por servicio, grupo, agente o cualquier combinación.
          </p>
        </div>
        <ArrowRight
          size={20}
          strokeWidth={1.5}
          className="mt-1 shrink-0 text-sc-accent transition-transform group-hover:translate-x-1"
          aria-hidden
        />
      </div>

      {/* Rule kinds — inline chips, no rounded coloured tiles. */}
      <div className="flex flex-wrap items-center gap-2">
        <RuleChip icon={<Mic size={12} strokeWidth={1.8} />} label="Grabación" />
        <RuleChip icon={<FileText size={12} strokeWidth={1.8} />} label="Transcripción" />
        <RuleChip icon={<Sparkles size={12} strokeWidth={1.8} />} label="Clasificación IA" />

        <span className="ml-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              window.open("#", "_blank", "noopener,noreferrer");
            }}
            /* font-size via style — twMerge collapses `text-sc-xs` and
               `text-sc-muted` into a single text-* bucket. */
            style={{ fontSize: "var(--sc-font-size-xs)" }}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-sc-sm px-2 py-1",
              "text-sc-muted transition-colors hover:text-sc-accent-strong",
              FOCUS_RING,
            )}
          >
            <BookOpen size={12} strokeWidth={1.6} />
            Cómo funcionan las reglas
            <ArrowUpRight size={11} strokeWidth={1.8} />
          </button>
        </span>
      </div>
    </div>
  );
}

function RuleChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-sc-border-soft bg-sc-surface-muted px-2.5 py-1 text-sc-xs font-medium text-sc-body">
      <span className="text-sc-accent-strong">{icon}</span>
      {label}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────
   Primary card — used for the AI primitives. Two equal cards in a
   2-col grid. Restrained: icon (no coloured tile), title, one-line
   description, arrow. The card itself is a button so keyboard users
   land directly on it.
   ──────────────────────────────────────────────────────────────── */
function PrimaryCard({
  title,
  description,
  icon,
  count,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  /** Optional count rendered as a small mono pill next to the title.
   *  Skipped when undefined (e.g. for primitives without a list). */
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex cursor-pointer flex-col gap-[var(--sc-space-300)] rounded-sc-md",
        "border border-sc-border bg-sc-surface p-5 text-left",
        "transition-all hover:border-sc-accent hover:shadow-sc-sm",
        FOCUS_RING,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-9 items-center justify-center rounded-sc-sm bg-sc-accent-soft text-sc-accent-strong">
          {icon}
        </span>
        <ArrowRight
          size={16}
          strokeWidth={1.5}
          aria-hidden
          className="mt-1 shrink-0 text-sc-muted transition-all group-hover:translate-x-0.5 group-hover:text-sc-accent-strong"
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <h3 className="text-sc-md font-semibold leading-[var(--sc-line-height-md)] text-sc-heading">
            {title}
          </h3>
          {count !== undefined && (
            <span className="font-mono text-sc-xs tabular-nums text-sc-muted">
              {count} {count === 1 ? "definida" : "definidas"}
            </span>
          )}
        </div>
        <p className="text-sc-sm leading-[var(--sc-line-height-body2)] text-sc-body">
          {description}
        </p>
      </div>
    </button>
  );
}

/* ────────────────────────────────────────────────────────────────
   Synced item — flat row in the structure section. Not interactive,
   so styled differently from the AI cards (no border, no arrow).
   ──────────────────────────────────────────────────────────────── */
function SyncedItem({
  icon,
  label,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <span className="flex items-center gap-2 text-sc-sm text-sc-body">
      <span className="text-sc-muted">{icon}</span>
      <span className="font-medium text-sc-heading">{label}</span>
      <span className="text-sc-muted">— {hint}</span>
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────
   Coming-soon item — slim list row with a "próximamente" pill.
   ──────────────────────────────────────────────────────────────── */
function ComingSoonItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <li className="flex items-start gap-3 px-5 py-4">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-sc-sm bg-sc-surface-muted text-sc-muted">
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sc-sm font-medium text-sc-body">{title}</span>
          <span className="rounded-full border border-sc-border-soft bg-sc-surface-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-sc-muted">
            Próximamente
          </span>
        </div>
        <p className="text-sc-xs text-sc-muted">{description}</p>
      </div>
    </li>
  );
}
