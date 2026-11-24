import { useScrollStop } from '../ui/hooks/useScrollStop';
import { RootedTreeView, type RootedTreeState } from './RootedTreeView';
import { SparseTableView, type SparseTableState } from './SparseTableView';
import './EulerTourView.css';

/** The tree being walked and the tour with its sparse table, drawn one above the other. */
export interface EulerTourState {
  tree: RootedTreeState;
  table: SparseTableState;
}

/**
 * Organism for the Euler tour method of the lowest common ancestor: RootedTreeView above
 * SparseTableView, both at full size in one box. A tour has 2n - 1 entries, so from about ten
 * nodes it is wider than an article column; the box then scrolls sideways (the tree stays in
 * view while the tour moves under it), and while it hides content it takes a tab stop so the
 * arrow keys scroll it (see useScrollStop).
 */
export function EulerTourView({ state }: { state: EulerTourState }) {
  const scrollRef = useScrollStop<HTMLDivElement>();
  return (
    <div className="euler-scroll" ref={scrollRef}>
      <div className="euler-stack">
        <RootedTreeView state={state.tree} />
        <SparseTableView state={state.table} />
      </div>
    </div>
  );
}
