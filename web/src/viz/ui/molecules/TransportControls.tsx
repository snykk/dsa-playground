import type { Ref } from 'react';
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
  /** Copy a link to this step; the button shows when given. */
  onCopyLink?: () => void;
  /** Open the keyboard shortcut list; the button shows when given. */
  onShortcuts?: () => void;
  /** A short message about the last action ("Link copied"), announced to screen readers. */
  status?: string;
  linkButtonRef?: Ref<HTMLButtonElement>;
}

/**
 * First / previous / play-pause / next / last, a step scrubber, the step counter and speed;
 * optionally a "copy a link to this step" button, a shortcut-list button and a status line.
 */
export function TransportControls({
  index,
  count,
  playing,
  speed,
  onStep,
  onTogglePlay,
  onSeek,
  onSpeed,
  onCopyLink,
  onShortcuts,
  status = '',
  linkButtonRef,
}: Props) {
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
      {(onCopyLink || onShortcuts) && (
        <div className="viz-extras">
          {onCopyLink && (
            <IconButton icon="link" label="Copy a link to this step" onClick={onCopyLink} disabled={count === 0} buttonRef={linkButtonRef} />
          )}
          {onShortcuts && <IconButton icon="keyboard" label="Keyboard shortcuts" onClick={onShortcuts} hasPopup="dialog" />}
          {/* Always in the page, so a screen reader hears each new message. */}
          <span className="viz-status" role="status">
            {status}
          </span>
        </div>
      )}
    </div>
  );
}
