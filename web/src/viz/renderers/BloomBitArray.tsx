import { Fragment } from 'react';
import type { Role } from '../core/types';
import { Cell } from '../ui/atoms/Cell';
import { CellGap, CellGrid, CellRow } from '../ui/molecules/CellRow';
import { Strips, type StripData } from '../ui/molecules/Strip';
import './BloomBitArray.css';

export interface BitView {
  value: 0 | 1;
  role?: Role;
}

export interface BloomState {
  /** What the picture shows, for screen readers. */
  label: string;
  bits: BitView[];
  strips?: StripData[];
}

const PER_ROW = 8;

/**
 * Organism for a Bloom filter: the bit array in rows of eight, each bit under its own
 * index, so "bit 17" is found at a glance on a phone. The tracer's roles mark the 1 bits
 * and the bits an operation sets or checks.
 */
export function BloomBitArray({ state }: { state: BloomState }) {
  const { label, bits, strips } = state;
  const starts = Array.from({ length: Math.ceil(bits.length / PER_ROW) }, (_, r) => r * PER_ROW);
  return (
    <div className="bloom-bits">
      <CellGrid label={label}>
        {starts.map((start) => {
          const chunk = bits.slice(start, start + PER_ROW);
          return (
            <Fragment key={start}>
              {start > 0 && <CellGap />}
              <CellRow label="">
                {chunk.map((_, j) => (
                  <Cell key={j} variant="index" value={start + j} />
                ))}
              </CellRow>
              <CellRow label={`bits ${start}-${start + chunk.length - 1}`}>
                {chunk.map((b, j) => (
                  <Cell key={j} value={b.value} role={b.role} title={`bit ${start + j} = ${b.value}`} />
                ))}
              </CellRow>
            </Fragment>
          );
        })}
      </CellGrid>
      <Strips strips={strips} />
    </div>
  );
}
