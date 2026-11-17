import { useId } from 'react';
import type { Role } from '../core/types';
import { ArrowDefs, markerUrl, monoW, SvgBox, SvgFrame, TextLines, type OkText } from './OptimizationKit';
import './SubsetLattice.css';

export interface LatticeNodeView {
  mask: number;
  /** The mask in binary. */
  text: string;
  /** dp[mask], or null for a mask at or past len(a) (absent). */
  value: string | null;
  role?: Role;
}

/** A pair of masks that differ in one bit: from (without the bit) to (with it). */
export interface LatticeEdgeView {
  from: number;
  to: number;
  bit: number;
  role?: Role;
}

export interface SubsetLatticeState {
  /** What the picture shows, for screen readers. */
  label: string;
  bits: number;
  nodes: LatticeNodeView[];
  edges: LatticeEdgeView[];
  /** The bit of the current pass, if any. */
  layer: number | null;
  work: OkText[];
}

const PAD = 12;
const NW = 52;
const NH = 26;
const HGAP = 16;
const LEVEL = 74;
const TOP = 62;
/** The longest worked line ("for mask with bit 3: dp[mask] += dp[mask ^ 8]"), so the picture keeps one width. */
const WORK_CHARS = 46;

const popcount = (x: number) => {
  let c = 0;
  for (let v = x; v > 0; v >>= 1) c += v & 1;
  return c;
};

/**
 * Organism for SOS DP: the masks as a lattice, one level per number of set bits (the empty mask
 * at the bottom, the full mask on top), each box holding dp[mask]. Lines join masks that differ in
 * one bit; the pass for bit i lights the lines of that bit, and each addition is an arrow from
 * the mask without the bit to the mask with it.
 */
export function SubsetLattice({ state }: { state: SubsetLatticeState }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const { bits } = state;
  const levels: number[][] = Array.from({ length: bits + 1 }, () => []);
  for (const n of state.nodes) levels[popcount(n.mask)].push(n.mask);
  for (const l of levels) l.sort((a, b) => a - b);
  const widest = Math.max(1, ...levels.map((l) => l.length));
  const innerW = widest * (NW + HGAP) - HGAP;
  const width = Math.max(innerW + 2 * PAD, monoW('x'.repeat(WORK_CHARS)) + 2 * PAD, 300);
  const height = TOP + bits * LEVEL + NH + PAD + 6;
  const pos = new Map<number, { x: number; y: number }>();
  levels.forEach((l, level) => {
    const rowW = l.length * (NW + HGAP) - HGAP;
    const left = (width - rowW) / 2;
    l.forEach((mask, k) => pos.set(mask, { x: left + k * (NW + HGAP), y: TOP + (bits - level) * LEVEL }));
  });

  return (
    <SvgFrame width={width} height={height} label={state.label} minWidth={380}>
      <ArrowDefs uid={uid} />
      <TextLines x={PAD} y={12} lines={state.work} />
      {state.layer !== null && (
        <text className="sl-layer" x={PAD} y={30}>
          {`pass for bit ${state.layer}`}
        </text>
      )}
      {state.edges.map((e) => {
        const a = pos.get(e.from);
        const b = pos.get(e.to);
        if (!a || !b) return null;
        const role = e.role ?? 'idle';
        return (
          <line
            key={`e${e.from}-${e.to}`}
            className={`sl-edge role-${role}`}
            x1={a.x + NW / 2}
            y1={a.y - 17}
            x2={b.x + NW / 2}
            y2={b.y + NH + 3}
            markerEnd={role === 'active' ? markerUrl(uid, 'active') : undefined}
          />
        );
      })}
      {state.nodes.map((n) => {
        const p = pos.get(n.mask)!;
        return (
          <g key={`n${n.mask}`}>
            <text className="sl-mask" x={p.x + NW / 2} y={p.y - 8}>
              {n.text}
            </text>
            <SvgBox x={p.x} y={p.y} w={NW} h={NH} text={n.value ?? 'absent'} role={n.value === null ? 'muted' : n.role} ghost={n.value === null} size={n.value === null ? 10 : 13} />
          </g>
        );
      })}
    </SvgFrame>
  );
}
