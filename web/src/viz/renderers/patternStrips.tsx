import { Strips, type StripData } from '../ui/molecules/Strip';
import './patternStrips.css';

const textSize = (s: StripData) => s.label.length + s.items.reduce((n, it) => n + it.text.length + 2, 0);

/**
 * For each strip position, the largest version any frame of the run shows. Drawn invisibly under
 * the live strips, it keeps the picture one height while a strip grows and wraps on a phone.
 */
export function stripsSizer(all: Array<StripData[] | undefined>): StripData[] {
  const out: StripData[] = [];
  for (const strips of all) {
    (strips ?? []).forEach((s, i) => {
      if (!out[i] || textSize(s) > textSize(out[i])) out[i] = s;
    });
  }
  return out;
}

/** The strips of a frame on top of an invisible copy of the largest ones (see stripsSizer). */
export function StableStrips({ strips, sizer }: { strips?: StripData[]; sizer?: StripData[] }) {
  if (!sizer?.length) return <Strips strips={strips} />;
  return (
    <div className="pattern-strips">
      <div className="pattern-strips-sizer" aria-hidden="true">
        <Strips strips={sizer} />
      </div>
      <div className="pattern-strips-live">
        <Strips strips={strips} />
      </div>
    </div>
  );
}
