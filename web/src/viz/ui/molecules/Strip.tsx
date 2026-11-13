import type { Role } from '../../core/types';
import { Token } from '../atoms/Token';
import './Strip.css';

export interface StripItem {
  text: string;
  role?: Role;
}

export interface StripData {
  label: string;
  items: StripItem[];
}

/** A labelled list of tokens: a queue, a call stack, a priority queue, the packed items... */
export function Strip({ label, items }: StripData) {
  return (
    <div className="viz-strip">
      <strong>{label}:</strong>
      {items.map((it, i) => (
        <Token key={`${it.text}-${i}`} text={it.text} role={it.role} />
      ))}
    </div>
  );
}

export function Strips({ strips }: { strips?: StripData[] }) {
  if (!strips?.length) return null;
  return (
    <>
      {strips.map((s) => (
        <Strip key={s.label} label={s.label} items={s.items} />
      ))}
    </>
  );
}
