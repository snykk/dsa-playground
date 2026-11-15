import type { Frame, Role } from '../core/types';
import { Cell } from '../ui/atoms/Cell';
import { CellRow, IndexRow } from '../ui/molecules/CellRow';
import { Strips, type StripData } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import '../ui/roles.css';
import './SuffixArrayView.css';

export interface SaCell {
  ch: string;
  role?: Role;
}

/** A named pointer next to a row: left, mid, right, first, last. */
export interface SaTag {
  text: string;
  role?: Role;
}

/** One suffix: its characters, drawn in the row `slot` (0 at the top). */
export interface SaRowView {
  /** Stable identity, the suffix's start index: when its slot changes the row glides there. */
  id: number;
  slot: number;
  /** First column: the rank k (or the list position before the sort). */
  rank: string;
  /** Second column: the start index, SA[k]. */
  start: string;
  cells: SaCell[];
  role?: Role;
  /** Pointers drawn left of the row (left, mid, right). */
  tags?: SaTag[];
  /** Marks drawn after the suffix (first, last). */
  marks?: SaTag[];
}

/** Space a run keeps for its whole length, so the picture does not resize between steps. */
export interface SaExtent {
  slots: number;
  pattern: boolean;
}

export interface SaState {
  /** What the picture shows, for screen readers. */
  label: string;
  text: SaCell[];
  /** The pattern being searched, drawn under the text (reserved space when absent). */
  pattern?: SaCell[];
  /** Column titles: before the sort "pos" and "i", after it "k" and "SA[k]". */
  header: { rank: string; start: string };
  rows: SaRowView[];
  /** Rows reserved for the suffixes (n). */
  slots: number;
  strips?: StripData[];
  /** Set by stabilizeSuffixArray; never needed by a tracer. */
  extent?: SaExtent;
}

/** Row pitch in px; must match .sa-row height + gap in the stylesheet. */
const ROW = 27;

const show = (ch: string) => (ch === ' ' ? SYM.openBox : ch);

/** Give every frame the extent of the whole run, so the picture keeps its size. Call it from trace(). */
export function stabilizeSuffixArray<S extends SaState>(frames: Array<Frame<S>>): Array<Frame<S>> {
  const extent: SaExtent = { slots: 0, pattern: false };
  for (const f of frames) {
    extent.slots = Math.max(extent.slots, f.state.slots);
    extent.pattern ||= f.state.pattern !== undefined;
  }
  return frames.map((f) => ({ ...f, state: { ...f.state, extent } }));
}

/**
 * Organism: a suffix array as a list of suffixes, one row each, with its rank and start index.
 * Rows are keyed by the suffix's start index and glide to a new slot, so sorting is a visible
 * reorder. Named pointers (left, mid, right) sit left of the rows and marks (first, last) after them; the text and an
 * optional pattern are drawn above with the Cell atom.
 */
export function SuffixArrayView({ state }: { state: SaState }) {
  const slots = Math.max(state.slots, state.extent?.slots ?? 0, 1);
  const reservePattern = state.pattern !== undefined || state.extent?.pattern === true;
  return (
    <div className="sa-view" role="img" aria-label={state.label}>
      <div className="sa-top">
        <IndexRow count={state.text.length} />
        <CellRow label="text">
          {state.text.length ? state.text.map((c, k) => <Cell key={k} value={show(c.ch)} role={c.role} />) : <span className="sa-empty">(empty)</span>}
        </CellRow>
        {reservePattern && (
          <CellRow label="pattern">
            {state.pattern ? (
              state.pattern.length ? (
                state.pattern.map((c, k) => <Cell key={k} value={show(c.ch)} role={c.role} />)
              ) : (
                <span className="sa-empty">'' (empty)</span>
              )
            ) : (
              <Cell variant="blank" />
            )}
          </CellRow>
        )}
      </div>
      <div className="sa-table">
        <div className="sa-head">
          <span className="sa-tags" />
          <span className="sa-body">
            <span className="sa-rank">{state.header.rank}</span>
            <span className="sa-start">{state.header.start}</span>
            <span>suffix</span>
          </span>
        </div>
        <div className="sa-rows" style={{ height: slots * ROW }}>
          {state.rows.map((r) => (
            <div key={r.id} className={`sa-row role-${r.role ?? 'idle'}`} style={{ transform: `translateY(${r.slot * ROW}px)` }}>
              <span className="sa-tags">
                {(r.tags ?? []).map((t) => (
                  <span key={t.text} className={`sa-tag role-${t.role ?? 'idle'}`}>
                    {t.text}
                  </span>
                ))}
              </span>
              <span className="sa-body">
                <span className="sa-rank">{r.rank}</span>
                <span className="sa-start">{r.start}</span>
                <span className="sa-cells">
                  {r.cells.map((c, k) => (
                    <Cell key={k} value={show(c.ch)} role={c.role} />
                  ))}
                </span>
                {(r.marks ?? []).map((t) => (
                  <span key={t.text} className={`sa-tag role-${t.role ?? 'idle'}`}>
                    {t.text}
                  </span>
                ))}
              </span>
            </div>
          ))}
          {state.rows.length === 0 && <p className="sa-none">no suffixes</p>}
        </div>
      </div>
      <Strips strips={state.strips} />
    </div>
  );
}
