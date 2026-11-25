import { Strips, type StripData } from '../ui/molecules/Strip';
import { IntervalDpView, type IntervalDpState } from './IntervalDpView';

export interface KnuthState extends IntervalDpState {
  /** The window of the cell being filled, and the splits tried so far against every split. */
  strips: StripData[];
}

/**
 * Organism for Knuth's optimization: Interval DP's picture, an unchanged IntervalDpView (the dp
 * and split tables, then the merge tree), with two strips under it: the k of the window of the
 * cell being filled, and the number of splits tried so far next to the number the plain interval
 * DP tries for the same cells. The strips wrap on a narrow screen, so they never scroll.
 */
export function KnuthOptimizationView({ state }: { state: KnuthState }) {
  return (
    <div className="knuth-view">
      <IntervalDpView state={state} />
      <Strips strips={state.strips} />
    </div>
  );
}
