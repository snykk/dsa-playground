import type { Role } from '../core/types';
import { Cell } from '../ui/atoms/Cell';
import { CellGrid, CellRow, IndexRow } from '../ui/molecules/CellRow';
import { Strips, type StripData } from '../ui/molecules/Strip';
import './OpenAddressingTable.css';

export interface SlotView {
  /** Key text, '' for an empty slot, 'DEL' for a tombstone. */
  key: string;
  value: string;
  /** A tombstone: drawn hatched. */
  tomb?: boolean;
  role?: Role;
}

export interface ProbeTableState {
  /** What the picture shows, for screen readers. */
  label: string;
  slots: SlotView[];
  /** Slot under the probe marker; undefined hides the marker. */
  probe?: number;
  probeRole?: Role;
  strips?: StripData[];
}

const DOWN = String.fromCodePoint(0x2193);

/**
 * Organism for open addressing: one row of slots (key above, value below), a marker that
 * slides to the slot being probed, and strips for the probe sequence and the operations.
 * Tombstones are hatched; the tracer decides every role.
 */
export function OpenAddressingTable({ state }: { state: ProbeTableState }) {
  const { label, slots, probe, probeRole, strips } = state;
  return (
    <div className="oa-table">
      <CellGrid label={label}>
        <IndexRow count={slots.length} wide label="slot" />
        <CellRow label="probe" wide shift={probe ?? 0}>
          {probe === undefined ? <Cell variant="blank" wide /> : <Cell wide value={DOWN} role={probeRole ?? 'compare'} title={`probing slot ${probe}`} />}
        </CellRow>
        <CellRow label="key" wide>
          {slots.map((s, i) => (
            <Cell key={i} wide value={s.key} role={s.role} erased={s.tomb} title={s.tomb ? 'tombstone: a removed key, walked past by lookups' : undefined} />
          ))}
        </CellRow>
        <CellRow label="value" wide>
          {slots.map((s, i) => (
            <Cell key={i} wide value={s.value} role={s.role} erased={s.tomb} />
          ))}
        </CellRow>
      </CellGrid>
      <Strips strips={strips} />
    </div>
  );
}
