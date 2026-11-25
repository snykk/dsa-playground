import type { GaussState } from '../algorithms/gaussianElimination';
import { useScrollStop } from '../ui/hooks/useScrollStop';
import { Strips } from '../ui/molecules/Strip';
import { Grid } from './Grid';
import './GaussView.css';

export type { GaussState };

/**
 * Organism for Gaussian elimination: the augmented matrix [A | b] as a Grid (rows labelled by
 * the equation they started as, so a swap shows), then strips for the pivots, x and the result.
 * Grid itself is unchanged; this wrapper only adds the bar before the b column, fills for the
 * good and bad roles, and a sideways scroll with a tab stop (useScrollStop) for a wide matrix.
 */
export function GaussView({ state }: { state: GaussState }) {
  const scrollRef = useScrollStop<HTMLDivElement>();
  return (
    <div className="gauss-view">
      <div className="gauss-scroll" ref={scrollRef}>
        <Grid state={state.grid} />
      </div>
      <Strips strips={state.strips} />
    </div>
  );
}
