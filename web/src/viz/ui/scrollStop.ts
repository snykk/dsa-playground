/** Keyboard access to boxes that scroll sideways (wide tables, diagrams, pseudocode). */

/** The part of an element syncScrollStop reads and writes (an HTMLElement in the browser). */
export interface ScrollBoxLike {
  scrollWidth: number;
  clientWidth: number;
  querySelector(selector: string): unknown;
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
}

/** Elements the keyboard reaches by itself; a box holding one scrolls as focus moves. */
const TABBABLE = 'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';

/**
 * Gives a sideways-scrolling box (a wide table or diagram) a tab stop while it hides content
 * and holds nothing focusable, so a keyboard can scroll it, and takes the stop away once all of
 * it fits. Only a stop added here is removed (it is marked data-scroll-stop); a box with a
 * tabindex of its own is left alone.
 */
export function syncScrollStop(box: ScrollBoxLike): void {
  const added = box.getAttribute('data-scroll-stop') !== null;
  if (!added && box.getAttribute('tabindex') !== null) return;
  const needed = box.scrollWidth - box.clientWidth > 1 && !box.querySelector(TABBABLE);
  if (needed && !added) {
    box.setAttribute('tabindex', '0');
    box.setAttribute('data-scroll-stop', '');
  } else if (!needed && added) {
    box.removeAttribute('tabindex');
    box.removeAttribute('data-scroll-stop');
  }
}
