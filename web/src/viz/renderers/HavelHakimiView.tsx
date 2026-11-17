import type { StripData } from '../ui/molecules/Strip';
import { GraphView, type GraphState } from './GraphView';
import { StableStrips } from './StableStrips';

export interface HavelHakimiState extends GraphState {
  /** The run's longest heap and popped strips (withStripGhosts), so the stage keeps its height. */
  ghosts?: StripData[];
}

/**
 * Organism for construct_graph (Havel-Hakimi): GraphView draws the graph as it grows, and the heap
 * and the popped neighbours sit under it in strips that keep one height for the whole run.
 */
export function HavelHakimiView({ state }: { state: HavelHakimiState }) {
  return (
    <div>
      <GraphView state={{ ...state, strips: undefined }} />
      <StableStrips strips={state.strips} ghosts={state.ghosts} />
    </div>
  );
}
