import type { Role } from '../../core/types';
import '../roles.css';
import { SYM } from '../symbols';
import './NodeGlyph.css';

/** Where a small text goes: x, the baseline y, and the text anchor (middle by default). */
export interface TextSpot {
  x: number;
  y: number;
  anchor?: 'start' | 'middle' | 'end';
}

interface Props {
  x: number;
  y: number;
  r: number;
  label: string | number;
  role: Role;
  badge?: string;
  /** "top": badge centered above (graph distances); "corner": top-right (tree balance factors). */
  badgePlacement?: 'top' | 'corner';
  /** An exact spot for the badge, chosen by the caller (it overrides badgePlacement). */
  badgeAt?: TextSpot;
  /** An exact spot for the check / cross of a status role, instead of the top-left corner. */
  glyphAt?: TextSpot;
  outlined?: boolean;
}

function spotText(spot: TextSpot, text: string) {
  const anchor = spot.anchor ?? 'middle';
  return (
    <text className="node-badge" x={spot.x} y={spot.y} style={anchor === 'middle' ? undefined : { textAnchor: anchor }}>
      {text}
    </text>
  );
}

/** SVG vertex: a filled circle with a label, an optional badge and a check/cross for status roles. */
export function NodeGlyph({ x, y, r, label, role, badge, badgePlacement = 'top', badgeAt, glyphAt, outlined }: Props) {
  const glyph = role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : null;
  return (
    <g className={`node role-${role}${outlined ? ' outlined' : ''}`}>
      <circle cx={x} cy={y} r={r} />
      <text className="node-label" x={x} y={y}>
        {label}
      </text>
      {badge !== undefined &&
        (badgeAt ? (
          spotText(badgeAt, badge)
        ) : badgePlacement === 'top' ? (
          <text className="node-badge" x={x} y={y - r - 8}>
            {badge}
          </text>
        ) : (
          <text className="node-badge" x={x + r + 2} y={y - r + 2} style={{ textAnchor: 'start' }}>
            {badge}
          </text>
        ))}
      {glyph && spotText(glyphAt ?? { x: x - r - 4, y: y - r + 2, anchor: 'end' }, glyph)}
    </g>
  );
}
