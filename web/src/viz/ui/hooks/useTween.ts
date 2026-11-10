import { useEffect, useRef, useState } from 'react';

export interface Pt {
  x: number;
  y: number;
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

/**
 * Interpolate keyed positions between renders so moving nodes glide (e.g. a tree
 * rotation) instead of jumping. New keys appear in place; reduced motion skips it.
 */
export function useTween<K>(target: Map<K, Pt>, duration = 380): Map<K, Pt> {
  const [current, setCurrent] = useState(target);
  const currentRef = useRef(target);
  const signature = [...target].map(([k, p]) => `${String(k)}:${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('|');

  useEffect(() => {
    const from = currentRef.current;
    if (prefersReducedMotion()) {
      currentRef.current = target;
      setCurrent(target);
      return undefined;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const e = 1 - (1 - t) ** 3;
      const next = new Map<K, Pt>();
      for (const [k, b] of target) {
        const a = from.get(k) ?? b;
        next.set(k, { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e });
      }
      currentRef.current = next;
      setCurrent(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // The signature captures every position change; `target` itself is rebuilt each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, duration]);

  return current;
}
