"use client";

/**
 * SCToast · Smart Contact toast component
 *
 * Visual reference: Figma DS · node 1050:355
 * Behavior reference: PrimeNG Toast (severity, life, sticky, closable, action).
 *
 * Powered by `sonner` (already mounted via <Toaster />). Each helper renders
 * the SC visual via `sonnerToast.custom()` so we keep sonner's queue,
 * positioning, life timing, swipe-to-dismiss and a11y for free.
 *
 * API:
 *
 *   scToast.success({ title, message })
 *   scToast.error({ title, action: { label, onClick } })
 *   scToast.warning({ message, duration: Infinity })   // sticky
 *   scToast.dismiss(id)                                 // programmatic close
 *
 * Variants honour the Figma matrix: severity × appearance × layout.
 */

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { toast as sonnerToast } from "sonner@2.0.3";

import { cn } from "./utils";

type Severity = "success" | "error" | "warning" | "info" | "indigo";
type Appearance = "light" | "solid";
type Layout = "horizontal" | "vertical";

interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface SCToastOptions {
  title?: string;
  message?: string;
  action?: ToastAction;
  secondaryAction?: ToastAction;
  /** Show the close (×) button. Default true. */
  dismiss?: boolean;
  /** Visual variant. Default "light". */
  appearance?: Appearance;
  /** Default "horizontal" — switches to "vertical" if you pass two actions or no title. */
  layout?: Layout;
  /** Auto-dismiss in ms. `Infinity` to make it sticky. Default 3000. */
  duration?: number;
  /** Stable id for update/dismiss. */
  id?: string | number;
}

/* ── Severity → icon ──────────────────────────────────────────────── */

const ICONS: Record<Severity, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  indigo: Sparkles,
};

/* ── Severity × appearance → tailwind utility classes ─────────────── */

type ToneClasses = {
  container: string;
  iconWrap: string;
  icon: string;
  title: string;
  message: string;
  actionPrimary: string;
  actionSecondary: string;
  dismiss: string;
};

const TONES: Record<Severity, Record<Appearance, ToneClasses>> = {
  success: {
    light: {
      container: "bg-sc-success-soft border-sc-success-strong",
      iconWrap: "bg-sc-success-strong/12 text-sc-success-strong",
      icon: "text-sc-success-strong",
      title: "text-sc-heading",
      message: "text-sc-body",
      actionPrimary: "text-sc-success-strong hover:bg-sc-success-strong/10",
      actionSecondary: "text-sc-body hover:bg-black/5",
      dismiss: "text-sc-muted hover:text-sc-heading hover:bg-black/5",
    },
    solid: {
      container: "bg-sc-success-strong border-sc-success-strong shadow-sc-md",
      iconWrap: "bg-black/25 text-white",
      icon: "text-white",
      title: "text-white",
      message: "text-white/90",
      actionPrimary: "text-white hover:bg-white/15",
      actionSecondary: "text-white/85 hover:bg-white/10",
      dismiss: "text-white/80 hover:text-white hover:bg-white/15",
    },
  },
  error: {
    light: {
      container: "bg-sc-error-soft border-sc-error-base",
      iconWrap: "bg-sc-error-strong/12 text-sc-error-strong",
      icon: "text-sc-error-strong",
      title: "text-sc-heading",
      message: "text-sc-body",
      actionPrimary: "text-sc-error-strong hover:bg-sc-error-strong/10",
      actionSecondary: "text-sc-body hover:bg-black/5",
      dismiss: "text-sc-muted hover:text-sc-heading hover:bg-black/5",
    },
    solid: {
      container: "bg-sc-error-strong border-sc-error-strong shadow-sc-md",
      iconWrap: "bg-black/25 text-white",
      icon: "text-white",
      title: "text-white",
      message: "text-white/90",
      actionPrimary: "text-white hover:bg-white/15",
      actionSecondary: "text-white/85 hover:bg-white/10",
      dismiss: "text-white/80 hover:text-white hover:bg-white/15",
    },
  },
  warning: {
    light: {
      container: "bg-sc-warning-soft border-sc-warning-strong",
      iconWrap: "bg-sc-warning-strong/12 text-sc-warning-strong",
      icon: "text-sc-warning-strong",
      title: "text-sc-heading",
      message: "text-sc-body",
      actionPrimary: "text-sc-warning-strong hover:bg-sc-warning-strong/10",
      actionSecondary: "text-sc-body hover:bg-black/5",
      dismiss: "text-sc-muted hover:text-sc-heading hover:bg-black/5",
    },
    solid: {
      container: "bg-sc-warning-strong border-sc-warning-strong shadow-sc-md",
      iconWrap: "bg-black/25 text-white",
      icon: "text-white",
      title: "text-white",
      message: "text-white/90",
      actionPrimary: "text-white hover:bg-white/15",
      actionSecondary: "text-white/85 hover:bg-white/10",
      dismiss: "text-white/80 hover:text-white hover:bg-white/15",
    },
  },
  info: {
    light: {
      container: "bg-sc-info-soft border-sc-info-strong",
      iconWrap: "bg-sc-info-strong/12 text-sc-info-strong",
      icon: "text-sc-info-strong",
      title: "text-sc-heading",
      message: "text-sc-body",
      actionPrimary: "text-sc-info-strong hover:bg-sc-info-strong/10",
      actionSecondary: "text-sc-body hover:bg-black/5",
      dismiss: "text-sc-muted hover:text-sc-heading hover:bg-black/5",
    },
    solid: {
      container: "bg-sc-info-strong border-sc-info-strong shadow-sc-md",
      iconWrap: "bg-black/25 text-white",
      icon: "text-white",
      title: "text-white",
      message: "text-white/90",
      actionPrimary: "text-white hover:bg-white/15",
      actionSecondary: "text-white/85 hover:bg-white/10",
      dismiss: "text-white/80 hover:text-white hover:bg-white/15",
    },
  },
  indigo: {
    light: {
      container: "bg-sc-indigo-soft border-sc-indigo-strong",
      iconWrap: "bg-sc-indigo-strong/12 text-sc-indigo-strong",
      icon: "text-sc-indigo-strong",
      title: "text-sc-heading",
      message: "text-sc-body",
      actionPrimary: "text-sc-indigo-strong hover:bg-sc-indigo-strong/10",
      actionSecondary: "text-sc-body hover:bg-black/5",
      dismiss: "text-sc-muted hover:text-sc-heading hover:bg-black/5",
    },
    solid: {
      container: "bg-sc-indigo-strong border-sc-indigo-strong shadow-sc-md",
      iconWrap: "bg-black/25 text-white",
      icon: "text-white",
      title: "text-white",
      message: "text-white/90",
      actionPrimary: "text-white hover:bg-white/15",
      actionSecondary: "text-white/85 hover:bg-white/10",
      dismiss: "text-white/80 hover:text-white hover:bg-white/15",
    },
  },
};

/* ── Presentational component ─────────────────────────────────────── */

interface SCToastViewProps extends SCToastOptions {
  id: string | number;
  severity: Severity;
}

function SCToastView({
  id,
  severity,
  appearance = "light",
  layout = "horizontal",
  title,
  message,
  action,
  secondaryAction,
  dismiss = true,
}: SCToastViewProps) {
  const tone = TONES[severity][appearance];
  const Icon = ICONS[severity];

  // Auto-promote to vertical when there are two actions — horizontal can't fit them comfortably.
  const effectiveLayout: Layout =
    layout === "vertical" || (action && secondaryAction) ? "vertical" : "horizontal";

  const close = () => sonnerToast.dismiss(id);

  const handleAction = (onClick: () => void) => () => {
    onClick();
    close();
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        /* Width bumped from 360→400 with a slightly higher cap so long
           messages (typical for error toasts) wrap fewer times before
           the dismiss × — a tall toast was reading as a column of text
           rather than a status. Padding and gaps use DS spacing tokens
           so the toast stays visually consistent with Modal/empty states. */
        "flex w-[var(--sc-toast-width,400px)] max-w-[480px] overflow-hidden rounded-sc-xl border",
        "gap-[var(--sc-space-300)] px-[var(--sc-space-400)] py-[var(--sc-space-400)]",
        "border-solid",
        tone.container,
        effectiveLayout === "horizontal" ? "items-center" : "flex-col",
      )}
      style={{ "--sc-toast-width": "400px" } as React.CSSProperties}
    >
      {/* Top row: icon + content + (dismiss when vertical) */}
      <div
        className={cn(
          "flex min-w-0 items-start gap-[var(--sc-space-300)]",
          effectiveLayout === "horizontal" ? "flex-1" : "w-full",
        )}
      >
        <div
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-sc-md",
            tone.iconWrap,
          )}
          aria-hidden
        >
          <Icon size={14} strokeWidth={2} className={tone.icon} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-[var(--sc-space-200)]">
          {title && (
            <p
              className={cn(
                "text-sc-base font-semibold leading-[var(--sc-line-height-body2)]",
                tone.title,
              )}
            >
              {title}
            </p>
          )}
          {message && (
            <p
              className={cn(
                "text-sc-sm font-normal leading-[18px]",
                tone.message,
              )}
            >
              {message}
            </p>
          )}
        </div>

        {/* Inline action (horizontal only) */}
        {effectiveLayout === "horizontal" && action && (
          <button
            type="button"
            onClick={handleAction(action.onClick)}
            className={cn(
              "shrink-0 cursor-pointer rounded-sc-md px-2.5 py-1 text-sc-sm font-medium leading-[var(--sc-line-height-button)] transition-colors",
              tone.actionPrimary,
            )}
          >
            {action.label}
          </button>
        )}

        {dismiss && (
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar"
            className={cn(
              "shrink-0 cursor-pointer rounded-sc-sm p-0.5 transition-colors",
              tone.dismiss,
            )}
          >
            <X size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Bottom row: actions (vertical only) */}
      {effectiveLayout === "vertical" && (action || secondaryAction) && (
        <div className="flex w-full items-center justify-end gap-[var(--sc-space-200)]">
          {secondaryAction && (
            <button
              type="button"
              onClick={handleAction(secondaryAction.onClick)}
              className={cn(
                "cursor-pointer rounded-sc-md px-3 py-1.5 text-sc-sm font-medium leading-[var(--sc-line-height-button)] transition-colors",
                tone.actionSecondary,
              )}
            >
              {secondaryAction.label}
            </button>
          )}
          {action && (
            <button
              type="button"
              onClick={handleAction(action.onClick)}
              className={cn(
                "cursor-pointer rounded-sc-md px-3 py-1.5 text-sc-sm font-medium leading-[var(--sc-line-height-button)] transition-colors",
                tone.actionPrimary,
              )}
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Public API ────────────────────────────────────────────────────── */

function show(severity: Severity, options: SCToastOptions = {}) {
  const { duration = 3000, id, ...rest } = options;
  return sonnerToast.custom(
    (toastId) => (
      <SCToastView id={toastId} severity={severity} {...rest} />
    ),
    {
      duration: duration === Infinity ? Number.MAX_SAFE_INTEGER : duration,
      id,
    },
  );
}

export const scToast = {
  success: (options: SCToastOptions = {}) => show("success", options),
  error: (options: SCToastOptions = {}) => show("error", options),
  warning: (options: SCToastOptions = {}) => show("warning", options),
  info: (options: SCToastOptions = {}) => show("info", options),
  indigo: (options: SCToastOptions = {}) => show("indigo", options),
  show,
  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
};

export type { Severity, Appearance, Layout, ToastAction };
