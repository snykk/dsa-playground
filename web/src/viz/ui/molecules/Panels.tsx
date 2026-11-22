import { useEffect, useRef } from 'react';
import { syncScrollStop } from '../scrollStop';
import { SYM } from '../symbols';
import './Panels.css';

/** Pseudocode with the executing line highlighted. Long lines scroll sideways (on a phone). */
export function PseudocodePanel({ lines, current }: { lines: string[]; current?: number }) {
  const listRef = useRef<HTMLOListElement>(null);

  // While lines are cut off, the list takes a tab stop so a keyboard can scroll it.
  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver !== 'function') return undefined;
    const observer = new ResizeObserver(() => syncScrollStop(list));
    observer.observe(list);
    syncScrollStop(list);
    return () => observer.disconnect();
  }, [lines]);

  return (
    <div className="viz-code">
      <h3>Pseudocode</h3>
      <ol ref={listRef}>
        {lines.map((line, i) => (
          <li key={i} className={current === i ? 'current' : undefined} aria-current={current === i ? 'step' : undefined}>
            <code>{line}</code>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Variables worth watching at the current step, plus the algorithm's complexity. */
export function StatePanel({ vars = [], complexity }: { vars?: Array<[string, string | number]>; complexity: { time: string; space: string } }) {
  return (
    <div className="viz-vars">
      <h3>State</h3>
      <table>
        <tbody>
          {vars.map(([k, v]) => (
            <tr key={k}>
              <th scope="row">{k}</th>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="viz-complexity">
        Time <strong>{complexity.time}</strong> {SYM.middot} Space <strong>{complexity.space}</strong>
      </p>
    </div>
  );
}
