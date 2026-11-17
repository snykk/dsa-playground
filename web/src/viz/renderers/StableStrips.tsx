import type { Frame } from '../core/types';
import { Strip, type StripData } from '../ui/molecules/Strip';
import '../ui/molecules/Strip.css';
import './StableStrips.css';

/** Rough rendered length of a strip: its label and every token with its padding. */
const weight = (s: StripData) => s.items.reduce((w, it) => w + it.text.length + 3, s.label.length);

/** For every strip label of a run, the content of the frame where that strip is longest. */
export function longestStrips(runs: Array<StripData[] | undefined>): StripData[] {
  const best = new Map<string, StripData>();
  for (const strips of runs) {
    for (const s of strips ?? []) {
      const b = best.get(s.label);
      if (!b || weight(s) > weight(b)) best.set(s.label, s);
    }
  }
  return [...best.values()];
}

/** Give every frame of a run the run's longest strips, so StableStrips can reserve their height. */
export function withStripGhosts<S extends { strips?: StripData[]; ghosts?: StripData[] }>(frames: Array<Frame<S>>): Array<Frame<S>> {
  const ghosts = longestStrips(frames.map((f) => f.state.strips));
  return frames.map((f) => ({ ...f, state: { ...f.state, ghosts } }));
}

/**
 * Strips that keep one height for a whole run, at any screen width: each strip sits over an
 * invisible copy of its longest content in the run, which wraps onto as many lines as the longest
 * one would, so a call stack that grows and shrinks never makes the stage jump.
 */
export function StableStrips({ strips, ghosts }: { strips?: StripData[]; ghosts?: StripData[] }) {
  if (!strips?.length) return null;
  return (
    <>
      {strips.map((s) => {
        const g = ghosts?.find((x) => x.label === s.label);
        return (
          <div key={s.label} className="stable-strip">
            {g && (
              <div className="stable-strip-ghost" aria-hidden="true">
                <Strip label={g.label} items={g.items} />
              </div>
            )}
            <Strip label={s.label} items={s.items} />
          </div>
        );
      })}
    </>
  );
}
