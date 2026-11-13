import { useEffect, useId, useState } from 'react';
import { InputError, type AnyVizSpec, type Frame } from '../../core/types';
import { usePlayback } from '../hooks/usePlayback';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { AlgorithmTabs } from '../molecules/AlgorithmTabs';
import { InputPanel } from '../molecules/InputPanel';
import { Legend } from '../molecules/Legend';
import { PseudocodePanel, StatePanel } from '../molecules/Panels';
import { TransportControls } from '../molecules/TransportControls';
import '../roles.css';
import { SYM } from '../symbols';
import './Player.css';

interface Run {
  frames: Array<Frame<unknown>>;
  error: string | null;
}

function runTrace(spec: AnyVizSpec, text: string): Run {
  try {
    const frames = spec.trace(spec.parse(text)) as Array<Frame<unknown>>;
    return frames.length ? { frames, error: null } : { frames, error: 'Nothing to show for this input.' };
  } catch (e) {
    return { frames: [], error: e instanceof InputError ? e.message : `Unexpected error: ${(e as Error).message}` };
  }
}

/** ?step=N (1-based) opens the first run at a given step, so a moment can be linked to. */
function stepFromUrl(): number {
  const n = Number(new URLSearchParams(window.location.search).get('step'));
  return Number.isInteger(n) && n > 0 ? n - 1 : 0;
}

export interface PlayerProps {
  specs: AnyVizSpec[];
  /** Start playing as soon as a run is loaded (skipped under reduced motion). */
  autoplay?: boolean;
  /** After the last step, wait a moment and replay on a fresh random input. */
  loop?: boolean;
  /** Stage, caption and controls only: for teasers such as the home page. */
  compact?: boolean;
}

/**
 * Organism that drives one or more visualization specs: input, stage, legend,
 * caption, transport controls, pseudocode and state. Renderers draw the stage.
 */
export function Player({ specs, autoplay = false, loop = false, compact = false }: PlayerProps) {
  const uid = useId();
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const spec = specs[active];
  const [text, setText] = useState(() => spec.examples[0]?.value ?? spec.randomInput());
  const [run, setRun] = useState<Run>(() => runTrace(spec, text));
  const [error, setError] = useState<string | null>(run.error);
  const playback = usePlayback(run.frames.length, autoplay ? 0 : stepFromUrl());
  const frame = run.frames[playback.index];

  /** Trace `input` with `target`; on bad input keep the previous run and show the error. */
  function load(target: AnyVizSpec, input: string) {
    const result = runTrace(target, input);
    setError(result.error);
    if (result.error) return;
    setRun(result);
    playback.reset(0);
  }

  function switchTo(i: number) {
    if (i === active) return;
    const next = specs[i];
    const input = next.inputKind === spec.inputKind ? text : (next.examples[0]?.value ?? next.randomInput());
    setActive(i);
    setText(input);
    const result = runTrace(next, input);
    setRun(result);
    setError(result.error);
    playback.reset(0);
  }

  useEffect(() => {
    if (autoplay && !reducedMotion && run.frames.length > 1) playback.play();
    // Start each new run; playback itself is stable state, not a trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, autoplay, reducedMotion]);

  useEffect(() => {
    if (!loop || reducedMotion || playback.playing || run.frames.length < 2 || playback.index < playback.last) return undefined;
    const id = window.setTimeout(() => {
      const input = spec.randomInput();
      setText(input);
      load(spec, input);
    }, 2200);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loop, reducedMotion, playback.playing, playback.index, playback.last, run]);

  return (
    <div className={`viz${compact ? ' viz-compact' : ''}`} onKeyDown={playback.onKeyDown}>
      {!compact && specs.length > 1 && <AlgorithmTabs titles={specs.map((s) => s.title)} active={active} onSelect={switchTo} />}

      {!compact && (
        <InputPanel
          id={`${uid}-input`}
          label={spec.inputLabel}
          help={spec.inputHelp}
          value={text}
          error={error}
          examples={spec.examples}
          onChange={setText}
          onRun={(value) => load(spec, value)}
          onRandom={() => {
            const input = spec.randomInput();
            setText(input);
            load(spec, input);
          }}
        />
      )}

      <div className="viz-stage" tabIndex={0} role="group" aria-label={`${spec.title} visualization. Space plays or pauses, arrow keys step.`}>
        {frame ? spec.render(frame.state) : null}
      </div>

      <Legend entries={spec.legend} />

      <p className="viz-caption" aria-live={autoplay ? 'off' : 'polite'}>
        {frame?.caption}
      </p>

      <TransportControls
        index={playback.index}
        count={run.frames.length}
        playing={playback.playing}
        speed={playback.speed}
        onStep={playback.step}
        onTogglePlay={playback.togglePlay}
        onSeek={playback.seek}
        onSpeed={playback.setSpeed}
      />

      {!compact && (
        <>
          <div className="viz-panels">
            <PseudocodePanel lines={spec.pseudocode} current={frame?.line} />
            <StatePanel vars={frame?.vars} complexity={spec.complexity} />
          </div>
          <p className="viz-keys">
            Keyboard: Space play/pause {SYM.middot} {SYM.leftArrow} {SYM.rightArrow} step {SYM.middot} Home/End jump
          </p>
        </>
      )}
    </div>
  );
}
