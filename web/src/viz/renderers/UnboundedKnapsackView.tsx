import type { PatternLanesState } from './PatternLanes';
import { PatternLanes } from './PatternLanes';
import { useScrollStop } from '../ui/hooks/useScrollStop';
import './UnboundedKnapsackView.css';

/**
 * Organism for the Unbounded Knapsack: the dp row (and the choice row) drawn by PatternLanes,
 * unchanged, inside a frame of its own that scrolls sideways when the row is wider than the
 * screen. While it hides part of the row, the frame takes a tab stop (useScrollStop), so the
 * keyboard can scroll it too.
 */
export function UnboundedKnapsackView({ state }: { state: PatternLanesState }) {
  const scrollRef = useScrollStop<HTMLDivElement>();
  return (
    <div className="ukn-scroll" ref={scrollRef}>
      <PatternLanes state={state} />
    </div>
  );
}
