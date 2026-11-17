/**
 * Shared SVG pieces for the optimization-technique renderers (FactorialTables, LucasDigits,
 * SpfGrid, PrefixGrid2D, MaskRows, SubsetLattice, IoStream): a box with a value, an optional
 * caption under it and a status glyph; arrow markers per role; a curved arrow between two points.
 * Boxes are positioned with a CSS transform, so a box that keeps its key glides to a new place.
 */
import type { ReactNode } from 'react';
import type { Role } from '../core/types';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import './OptimizationKit.css';

export interface OkText {
  text: string;
  role?: Role;
}

export const glyphOf = (role: Role | undefined): string | null => (role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : null);

interface BoxProps {
  x: number;
  y: number;
  w: number;
  h: number;
  text: string | number;
  role?: Role;
  /** Small text inside the box, under the value (an index, a factor). */
  sub?: string;
  /** A placeholder: dashed outline, faint text (a value not computed yet, an absent entry). */
  ghost?: boolean;
  /** Extra class names for the group. */
  className?: string;
  /** Font size of the value. */
  size?: number;
  title?: string;
}

/** One cell: a rounded rectangle with its value, an optional sub-caption and a check / cross for status roles. */
export function SvgBox({ x, y, w, h, text, role = 'idle', sub, ghost, className, size, title }: BoxProps) {
  const glyph = glyphOf(role);
  const textY = sub !== undefined ? h / 2 - 4 : h / 2;
  return (
    <g className={`ok-box role-${role}${ghost ? ' ghost' : ''}${className ? ` ${className}` : ''}`} style={{ transform: `translate(${x}px, ${y}px)` }}>
      {title && <title>{title}</title>}
      <rect width={w} height={h} rx={5} />
      <text className="ok-val" x={w / 2} y={textY} style={size ? { fontSize: size } : undefined}>
        {text}
      </text>
      {sub !== undefined && (
        <text className="ok-sub" x={w / 2} y={h - 7}>
          {sub}
        </text>
      )}
      {glyph && (
        <text className="ok-glyph" x={w - 1} y={2}>
          {glyph}
        </text>
      )}
    </g>
  );
}

export const MARKER_ROLES: Role[] = ['idle', 'compare', 'active', 'done', 'good', 'bad', 'muted'];

/** Arrowheads, one per role, so a head takes its line's colour. */
export function ArrowDefs({ uid }: { uid: string }) {
  return (
    <defs>
      {MARKER_ROLES.map((role) => (
        <marker
          key={role}
          id={`${uid}-ok-${role}`}
          className={`ok-marker role-${role}`}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerUnits="userSpaceOnUse"
          markerWidth="9"
          markerHeight="9"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" />
        </marker>
      ))}
    </defs>
  );
}

export const markerUrl = (uid: string, role: Role | undefined) => `url(#${uid}-ok-${role ?? 'idle'})`;

/** A quadratic curve from a to b that bows `bend` px to the left of the direction of travel. */
export function curvePath(ax: number, ay: number, bx: number, by: number, bend: number): string {
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / len) * bend;
  const cy = my + (dx / len) * bend;
  return `M${ax.toFixed(1)},${ay.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)}`;
}

interface ArrowProps {
  uid: string;
  d: string;
  role?: Role;
  label?: string;
  lx?: number;
  ly?: number;
  /** Anchor of the label text. */
  anchor?: 'start' | 'middle' | 'end';
}

/** A drawn arrow (path with a role-coloured head) and an optional label. */
export function SvgArrow({ uid, d, role = 'active', label, lx, ly, anchor = 'middle' }: ArrowProps) {
  return (
    <g className={`ok-arrow role-${role}`}>
      <path d={d} markerEnd={markerUrl(uid, role)} />
      {label && lx !== undefined && ly !== undefined && (
        <text className="ok-arrow-label" x={lx} y={ly} style={{ textAnchor: anchor }}>
          {label}
        </text>
      )}
    </g>
  );
}

/** Lines of mono text with roles (a worked formula, a list of answers). */
export function TextLines({ x, y, lines, lineH = 18, className }: { x: number; y: number; lines: OkText[]; lineH?: number; className?: string }) {
  return (
    <g className={`ok-lines${className ? ` ${className}` : ''}`}>
      {lines.map((l, k) => {
        const glyph = glyphOf(l.role);
        return (
          <text key={k} className={`ok-line role-${l.role ?? 'idle'}`} x={x} y={y + k * lineH}>
            {l.text}
            {glyph && <tspan className="ok-line-glyph">{` ${glyph}`}</tspan>}
          </text>
        );
      })}
    </g>
  );
}

/** The scrollable frame every optimization renderer draws its SVG in. */
export function SvgFrame({ width, height, label, minWidth, children }: { width: number; height: number; label: string; minWidth?: number; children: ReactNode }) {
  return (
    <div className="ok-scroll">
      <svg className="ok-svg" viewBox={`0 0 ${width} ${height}`} style={{ width, maxWidth: '100%', minWidth: Math.min(width, minWidth ?? 360) }} role="img" aria-label={label}>
        {children}
      </svg>
    </div>
  );
}

/** Approximate width in px of a mono string at the given font size. */
export const monoW = (s: string, size = 12) => s.length * size * 0.61;
