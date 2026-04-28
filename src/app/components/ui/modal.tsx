"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog@1.1.6";
import { XIcon, AlignLeftIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

/**
 * Modal — Smart Contact design system shell.
 *
 * Anatomy (header / body / footer) maps 1:1 to the official symbol in
 * Figma (file Dle87qs0…, node 906:2763). All visual tokens live in
 * `src/styles/sc-design-system.css` under `--sc-modal-*` and are exposed
 * to Tailwind v4 via `@theme inline`.
 *
 * Built on `@radix-ui/react-dialog` so we get focus trap, scroll lock,
 * portal, ESC-to-close and clean stacking of multiple instances out of
 * the box. Each `<Modal>` mounts its own portal — stacked modals layer
 * by DOM order, no manual z-index needed.
 *
 * Compound API:
 *
 *   <Modal open={open} onOpenChange={setOpen}>
 *     <Modal.Content>
 *       <Modal.Header
 *         title="Procesar conversaciones"
 *         subtitle="14 conversaciones seleccionadas"
 *         icon={<MyIcon />}        // optional, defaults to text-align-start
 *       />
 *       <Modal.Body>
 *         { ...slot... }
 *       </Modal.Body>
 *       <Modal.Footer>
 *         <Modal.Cancel>Cancelar</Modal.Cancel>
 *         <Modal.Action onClick={onSubmit}>Procesar</Modal.Action>
 *       </Modal.Footer>
 *     </Modal.Content>
 *   </Modal>
 *
 * `Modal.Trigger`, `Modal.Close` and uncontrolled `open` are also
 * supported — the root forwards every Radix Dialog prop.
 *
 * To block close while an async operation is in flight, set
 * `showClose={false}` on `Modal.Content` and intercept ESC / overlay:
 *   onEscapeKeyDown={(e) => isLoading && e.preventDefault()}
 *   onPointerDownOutside={(e) => isLoading && e.preventDefault()}
 */

/* ─────────────────────────────────────────────────────────────────
   Root primitives — pass through Radix Dialog with `data-slot` hooks
   ───────────────────────────────────────────────────────────────── */

function ModalRoot(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="modal" {...props} />;
}

function ModalTrigger(
  props: React.ComponentProps<typeof DialogPrimitive.Trigger>,
) {
  return <DialogPrimitive.Trigger data-slot="modal-trigger" {...props} />;
}

function ModalClose(
  props: React.ComponentProps<typeof DialogPrimitive.Close>,
) {
  return <DialogPrimitive.Close data-slot="modal-close" {...props} />;
}

/* ─────────────────────────────────────────────────────────────────
   Overlay & Content
   ───────────────────────────────────────────────────────────────── */

const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentProps<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    data-slot="modal-overlay"
    className={cn(
      "fixed inset-0 z-50 bg-sc-overlay",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
      className,
    )}
    {...props}
  />
));
ModalOverlay.displayName = "ModalOverlay";

interface ModalContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content> {
  /** Width override. Default 680px (DS canonical). Accepts any CSS length. */
  width?: number | string;
  /** Render the close (X) button inside the header. Default true. */
  showClose?: boolean;
}

const ModalContext = React.createContext<{ showClose: boolean }>({
  showClose: true,
});

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(({ className, children, width, style, showClose = true, ...props }, ref) => {
  const widthStyle =
    width !== undefined
      ? { width: typeof width === "number" ? `${width}px` : width }
      : undefined;

  return (
    <ModalContext.Provider value={{ showClose }}>
      <DialogPrimitive.Portal>
        <ModalOverlay />
        <DialogPrimitive.Content
          ref={ref}
          data-slot="modal-content"
          style={{ ...widthStyle, ...style }}
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "flex flex-col overflow-hidden",
            "bg-sc-surface text-sc-body",
            "border border-sc-border rounded-sc-xl shadow-sc-modal",
            // Width: clamp DS-canonical bounds against viewport so the
            // modal never bleeds past the screen on narrow displays.
            "w-[min(var(--sc-modal-default-width),calc(100vw-2rem))]",
            "min-w-[min(var(--sc-modal-min-width),calc(100vw-2rem))]",
            "max-w-[min(var(--sc-modal-max-width),calc(100vw-2rem))]",
            "min-h-[var(--sc-modal-min-height)]",
            "max-h-[min(var(--sc-modal-max-height),calc(100vh-2rem))]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
            "duration-200",
            className,
          )}
          {...props}
        >
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </ModalContext.Provider>
  );
});
ModalContent.displayName = "ModalContent";

/* ─────────────────────────────────────────────────────────────────
   Header
   ───────────────────────────────────────────────────────────────── */

interface ModalHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Optional left-side icon. Defaults to a text-align-start glyph. */
  icon?: React.ReactNode;
  /** Hide the icon entirely. */
  showIcon?: boolean;
  className?: string;
}

function ModalHeader({
  title,
  subtitle,
  icon,
  showIcon = true,
  className,
}: ModalHeaderProps) {
  const { showClose } = React.useContext(ModalContext);

  return (
    <div
      data-slot="modal-header"
      className={cn(
        "flex shrink-0 items-center justify-between gap-[var(--sc-space-300)]",
        "p-[var(--sc-modal-head-padding)]",
        "border-b border-sc-border-soft",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-[var(--sc-modal-head-icon-gap)]">
        {showIcon && (
          <span
            aria-hidden
            data-slot="modal-icon"
            className="flex size-[var(--sc-modal-head-icon-size)] shrink-0 items-center justify-center text-sc-heading"
          >
            {icon ?? <AlignLeftIcon className="size-full" strokeWidth={1.75} />}
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-[var(--sc-modal-head-title-gap)]">
          <DialogPrimitive.Title
            data-slot="modal-title"
            className="truncate text-sc-lg font-semibold leading-[var(--sc-modal-head-title-lh)] text-sc-heading"
          >
            {title}
          </DialogPrimitive.Title>
          {subtitle ? (
            <DialogPrimitive.Description
              data-slot="modal-subtitle"
              className="truncate text-sc-base font-normal leading-[var(--sc-modal-head-subtitle-lh)] text-sc-muted"
            >
              {subtitle}
            </DialogPrimitive.Description>
          ) : (
            // Radix Dialog warns when there's no Description. Fall back to
            // an SR-only one mirroring the title so axe stays quiet.
            <DialogPrimitive.Description className="sr-only">
              {typeof title === "string" ? title : "Modal"}
            </DialogPrimitive.Description>
          )}
        </div>
      </div>
      {showClose && (
        <DialogPrimitive.Close
          data-slot="modal-head-close"
          aria-label="Cerrar"
          className={cn(
            "flex shrink-0 items-center justify-center",
            "size-[var(--sc-modal-head-close-size)] rounded-sc-md",
            "text-sc-muted transition-colors duration-150",
            "hover:bg-sc-border-soft hover:text-sc-heading",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sc-primary focus-visible:ring-offset-1",
          )}
        >
          <XIcon
            className="size-[var(--sc-modal-head-close-icon)]"
            strokeWidth={1.6}
          />
        </DialogPrimitive.Close>
      )}
    </div>
  );
}
ModalHeader.displayName = "ModalHeader";

/* ─────────────────────────────────────────────────────────────────
   Body & Footer
   ───────────────────────────────────────────────────────────────── */

const ModalBody = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="modal-body"
      className={cn(
        "flex min-h-0 flex-1 flex-col items-stretch overflow-y-auto",
        "px-[var(--sc-modal-body-padding-x)] py-[var(--sc-modal-body-padding-y)]",
        className,
      )}
      {...props}
    />
  ),
);
ModalBody.displayName = "ModalBody";

const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="modal-footer"
    className={cn(
      // `min-h-` (not `h-`) so multi-line / wrapping content never clips.
      "flex shrink-0 items-center justify-end",
      "min-h-[var(--sc-modal-foot-height)]",
      "p-[var(--sc-modal-foot-padding)] gap-[var(--sc-modal-foot-gap)]",
      "border-t border-sc-border-soft bg-sc-surface",
      className,
    )}
    {...props}
  />
));
ModalFooter.displayName = "ModalFooter";

/* ─────────────────────────────────────────────────────────────────
   Footer buttons
   ───────────────────────────────────────────────────────────────── */

const footerButtonBase = cn(
  "inline-flex items-center justify-center whitespace-nowrap",
  "h-[var(--sc-modal-button-height)]",
  "px-[var(--sc-modal-button-padding-x)] py-[var(--sc-modal-button-padding-y)]",
  "rounded-[var(--sc-modal-button-radius)]",
  "text-sc-base font-medium leading-[var(--sc-modal-button-line-height)]",
  "transition-colors duration-150",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
  "disabled:cursor-not-allowed disabled:opacity-60",
);

const ModalCancel = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, type = "button", ...props }, ref) => (
  <DialogPrimitive.Close asChild>
    <button
      ref={ref}
      type={type}
      data-slot="modal-cancel"
      className={cn(
        footerButtonBase,
        "border border-transparent bg-transparent text-sc-on-secondary",
        "hover:bg-sc-border-soft",
        "focus-visible:ring-sc-primary",
        className,
      )}
      {...props}
    />
  </DialogPrimitive.Close>
));
ModalCancel.displayName = "ModalCancel";

const ModalAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, type = "button", ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    data-slot="modal-action"
    className={cn(
      footerButtonBase,
      "border border-sc-border-primary bg-sc-primary text-sc-on-primary",
      "hover:bg-sc-primary-hover hover:border-sc-primary-hover",
      "focus-visible:ring-sc-primary",
      className,
    )}
    {...props}
  />
));
ModalAction.displayName = "ModalAction";

/* ─────────────────────────────────────────────────────────────────
   Compound export
   ───────────────────────────────────────────────────────────────── */

const Modal = Object.assign(ModalRoot, {
  Trigger: ModalTrigger,
  Close: ModalClose,
  Content: ModalContent,
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
  Cancel: ModalCancel,
  Action: ModalAction,
});

export { Modal };
export type { ModalContentProps, ModalHeaderProps };
