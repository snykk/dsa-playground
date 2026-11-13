import { IconButton } from '../atoms/IconButton';
import { SYM } from '../symbols';
import './TransportControls.css';

export const SPEEDS = [0.5, 1, 2, 4] as const;

interface Props {
  index: number;
  count: number;
  playing: boolean;
  speed: number;
  onStep: (delta: number) => void;
  onTogglePlay: () => void;
  onSeek: (index: number) => void;
  onSpeed: (speed: number) => void;
}

/** First / previous / play-pause / next / last, a step scrubber, the step counter and speed. */
export function TransportControls({ index, count, playing, speed, onStep, onTogglePlay, onSeek, onSpeed }: Props) {
  const last = Math.max(0, count - 1);
  return (
    <div className="viz-controls">
      <div className="viz-buttons">
        <IconButton icon="first" label="First step" onClick={() => onStep(-Infinity)} disabled={index === 0} />
        <IconButton icon="prev" label="Previous step" onClick={() => onStep(-1)} disabled={index === 0} />
        <IconButton icon={playing ? 'pause' : 'play'} label={playing ? 'Pause' : 'Play'} onClick={onTogglePlay} disabled={count < 2} primary />
        <IconButton icon="next" label="Next step" onClick={() => onStep(1)} disabled={index >= last} />
        <IconButton icon="last" label="Last step" onClick={() => onStep(Infinity)} disabled={index >= last} />
      </div>
      <input
        className="viz-scrubber"
        type="range"
        min={0}
        max={last}
        value={index}
        onChange={(e) => onSeek(Number(e.target.value))}
        aria-label="Step"
      />
      <span className="viz-step">{count ? `${index + 1} / ${count}` : '0 / 0'}</span>
      <label className="viz-speed">
        Speed
        <select value={speed} onChange={(e) => onSpeed(Number(e.target.value))}>
          {SPEEDS.map((s) => (
            <option key={s} value={s}>
              {s}
              {SYM.times}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
