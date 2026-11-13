import type { Role } from '../core/types';
import { Cell } from '../ui/atoms/Cell';
import { ArrayScene, type ArraySceneState } from './ArrayScene';
import '../ui/roles.css';
import './BucketScene.css';

export interface BinCell {
  value: string | number | null;
  role?: Role;
  pointer?: boolean;
}

export interface Bin {
  /** Short label above the bin: a digit, a bucket number... */
  label: string;
  /** Optional cell between the label and the contents, e.g. the bin's counter. */
  head?: BinCell;
  /** Contents from top to bottom; a null value is an empty slot. */
  items: BinCell[];
  /** Outline the whole bin (e.g. the bucket being sorted). */
  role?: Role;
  /** Tooltip with the bin's full meaning, e.g. its value range. */
  title?: string;
}

export interface BinsData {
  /** Row captions on the left: for the labels, the head cells and the contents. */
  label: string;
  headLabel?: string;
  itemsLabel?: string;
  bins: Bin[];
  /** Wider cells for values such as 0.78. */
  wide?: boolean;
}

export interface BucketSceneState extends ArraySceneState {
  bins?: BinsData;
}

function describe(data: BinsData): string {
  const parts = data.bins.map((b) => {
    const items = b.items.map((c) => c.value ?? '_').join(' ');
    return `${b.label}${b.head ? ` (${b.head.value ?? ''})` : ''}: ${items || 'empty'}`;
  });
  return `${data.label} ${parts.join('; ')}`;
}

/** A row of bins (buckets) side by side; each bin stacks its contents top to bottom. */
function Bins({ data }: { data: BinsData }) {
  const { bins, wide } = data;
  return (
    <div className={`bins${wide ? ' wide' : ''}`} role="img" aria-label={describe(data)}>
      <div className="bins-axis" aria-hidden="true">
        <span className="bins-axis-label">{data.label}</span>
        {data.headLabel && <span className="bins-axis-label bins-axis-head">{data.headLabel}</span>}
        {data.itemsLabel && <span className="bins-axis-label bins-axis-items">{data.itemsLabel}</span>}
      </div>
      {bins.map((b, k) => (
        <div key={k} className={`bin${b.role ? ` role-${b.role}` : ''}`} title={b.title}>
          <Cell variant="index" value={b.label} wide={wide} />
          {b.head && <Cell value={b.head.value} role={b.head.role} pointer={b.head.pointer} wide={wide} />}
          <div className="bin-items">
            {b.items.map((c, i) => (
              <Cell key={i} value={c.value} role={c.role} pointer={c.pointer} wide={wide} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Organism for distribution sorts: everything ArrayScene draws (bars, cell
 * rows, strips) plus a row of bins that fill up and empty again, such as the
 * ten digit buckets of radix sort or the n range buckets of bucket sort.
 */
export function BucketScene({ state }: { state: BucketSceneState }) {
  const { bins, ...scene } = state;
  return (
    <div>
      <ArrayScene state={scene} />
      {bins && <Bins data={bins} />}
    </div>
  );
}
