/**
 * Shared focus-visible ring utility.
 *
 * Apply this className to every interactive element so keyboard
 * navigation always has a recognizable, design-system-tinted target.
 * Single source of truth: `--sc-accent` ring, 2px width, 2px offset
 * against the surface color.
 *
 * Use:
 *   import { FOCUS_RING } from "./ui/focus";
 *   <button className={cn("...", FOCUS_RING)} />
 *
 * Variants are intentionally not provided. If a specific surface
 * needs a different offset color, override locally — but keep the
 * accent + 2px width invariant so users learn one ring across the app.
 */
export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sc-accent focus-visible:ring-offset-2 focus-visible:ring-offset-sc-surface";
