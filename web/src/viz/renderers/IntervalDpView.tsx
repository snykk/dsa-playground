import { DpTableView, type DpTableState } from './DpTableView';
import { TreeDpView, type TreeDpState } from './TreeDpView';
import { useScrollStop } from '../ui/hooks/useScrollStop';
import './IntervalDpView.css';

export interface IntervalDpState {
  /** What the whole picture shows, for screen readers. */
  label: string;
  /** The piles as chips and the dp table. */
  dp: DpTableState;
  /** The split table: the k of the last merge kept for each range. */
  split: DpTableState;
  /** The merge tree, once it is being read back from split. */
  tree?: TreeDpState;
}

/**
 * Organism for Interval DP: the dp and split tables, each an unchanged DpTableView, side by side
 * when they fit and one above the other on a narrow screen, and under them the merge tree, an
 * unchanged TreeDpView, while it is read back. The frame scrolls sideways if anything is still
 * wider than the screen and then takes a tab stop (useScrollStop), so the keyboard can scroll it.
 */
export function IntervalDpView({ state }: { state: IntervalDpState }) {
  const scrollRef = useScrollStop<HTMLDivElement>();
  return (
    <div className="idp-view" ref={scrollRef} role="group" aria-label={state.label}>
      <div className="idp-tables">
        <DpTableView state={state.dp} />
        <DpTableView state={state.split} />
      </div>
      {state.tree && <TreeDpView state={state.tree} />}
    </div>
  );
}
