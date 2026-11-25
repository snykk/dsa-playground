import { useEffect, useRef } from 'react';
import type { FftState } from '../algorithms/fft';
import { syncScrollStop } from '../ui/scrollStop';
import { FftView } from './FftView';
import './NttView.css';

export type { FftState as NttState };

/**
 * The Number Theoretic Transform drawn by FftView, which is left unchanged: the same rows of
 * stages, butterflies and circle of roots. A thin wrapper adds three things for residues modulo
 * 998244353: the cells' numbers are set smaller, so nine digits fit a cell; the circle's
 * "clockwise" title is hidden, since the powers of w modulo p have an order but no direction (the
 * circle's own captions name w and t); and FftView's sideways-scrolling box gets a tab stop while
 * it hides part of the picture, so a keyboard can scroll it (the rule of useScrollStop, applied to
 * the box FftView renders).
 */
export function NttView({ state }: { state: FftState }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = ref.current?.querySelector<HTMLElement>('.fv-scroll');
    if (!box || typeof ResizeObserver !== 'function') return undefined;
    const observer = new ResizeObserver(() => syncScrollStop(box));
    observer.observe(box);
    if (box.firstElementChild) observer.observe(box.firstElementChild);
    syncScrollStop(box);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="ntt-view" ref={ref}>
      <FftView state={state} />
    </div>
  );
}
