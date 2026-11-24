import { useEffect, useRef, type RefObject } from 'react';
import { syncScrollStop } from '../scrollStop';

/**
 * For a box inside a renderer that scrolls sideways on its own (a wide picture on a phone): while
 * it hides content, it takes a tab stop so a keyboard can scroll it (see syncScrollStop). Pass
 * the returned ref to the box.
 */
export function useScrollStop<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T>(null);
  useEffect(() => {
    const box = ref.current;
    if (!box || typeof ResizeObserver !== 'function') return undefined;
    const observer = new ResizeObserver(() => syncScrollStop(box));
    observer.observe(box);
    if (box.firstElementChild) observer.observe(box.firstElementChild);
    syncScrollStop(box);
    return () => observer.disconnect();
  }, []);
  return ref;
}
