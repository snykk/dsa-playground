import { useScrollStop } from '../ui/hooks/useScrollStop';
import { StringScan, type StringScanState } from './StringScan';
import './StringHashingView.css';

/**
 * Organism for string hashing: StringScan (the string, its codes, the prefix hashes and the
 * powers in aligned columns, the two substrings of a query and the binary search on the length)
 * in a box of its own that scrolls sideways. Twelve characters make thirteen columns, wider than
 * a phone; while the box hides content it takes a tab stop, so the arrow keys scroll it instead
 * of stepping the player (see useScrollStop).
 */
export function StringHashingView({ state }: { state: StringScanState }) {
  const scrollRef = useScrollStop<HTMLDivElement>();
  return (
    <div className="hash-scroll" ref={scrollRef}>
      <StringScan state={state} />
    </div>
  );
}
