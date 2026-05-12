import type { BagId } from './data';

const KEY = 'memory.showcase.assignments.v1';

export type Assignments = Record<string, BagId>;

export function load(defaults: Assignments): Assignments {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Assignments;
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

export function save(state: Assignments) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (private mode, quota); silently ignore.
  }
}

export function reset() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // see above.
  }
}
