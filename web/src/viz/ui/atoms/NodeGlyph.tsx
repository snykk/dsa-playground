import type { Role } from '../../core/types';
import '../roles.css';
import { SYM } from '../symbols';
import './NodeGlyph.css';

interface Props {
  x: number;
  y: number;
  r: number;
  label: string | number;
  role: Role;
  badge?: string;
  /** "top": badge centered above (graph distances); "corner": top-right (tree balance factors). */
  badgePlacement?: 'top' | 'corner';
  outlined?: boolean;
}

/** SVG vertex: a filled circle with a label, an optional badge and a check/cross for status roles. */
export function NodeGlyph({ x, y, r, label, role, badge, badgePlacement = 'top', outlined }: Props) {
  const glyph = role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : null;
  return (
    <g className={`node role-${role}${outlined ? ' outlined' : ''}`}>
      <circle cx={x} cy={y} r={r} />
      <text className="node-label" x={x} y={y}>
        {label}
      </text>
      {badge !== undefined &&
        (badgePlacement === 'top' ? (
          <text className="node-badge" x={x} y={y - r - 8}>
            {badge}
          </text>
        ) : (
          <text className="node-badge" x={x + r + 2} y={y - r + 2} style={{ textAnchor: 'start' }}>
            {badge}
          </text>
        ))}
      {glyph && (
        <text className="node-badge" x={x - r - 4} y={y - r + 2} style={{ textAnchor: 'end' }}>
          {glyph}
        </text>
      )}
    </g>
  );
}
