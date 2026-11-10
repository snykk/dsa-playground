import { useEffect, useId, useState, type KeyboardEvent } from 'react';
import { InputError, type AnyVizSpec, type Frame } from './types';
import './viz.css';

const SPEEDS = [0.5, 1, 2, 4] as const;
const BASE_DELAY_MS = 900;

interface Run {
  frames: Array<Frame<unknown>>;
  error: string | null;
}

function runTrace(spec: AnyVizSpec, text: string): Run {
  try {
    const frames = spec.trace(spec.parse(text)) as Array<Frame<unknown>>;
    if (frames.length === 0) return { frames, error: 'Nothing to show for this input.' };
    return { frames, error: null };
  } catch (e) {
    const message = e instanceof InputError ? e.message : `Unexpected error: ${(e as Error).message}`;
    return { frames: [], error: message };
  }
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  first: 'M6 5h2v14H6zM20 6 10 12l10 6z',
  prev: 'M18 6 8 12l10 6z',
  play: 'M8 5v14l11-7z',
  pause: 'M7 5h4v14H7zM13 5h4v14h-4z',
  next: 'M6 6l10 6-10 6z',
  last: 'M16 5h2v14h-2zM4 6l10 6-10 6z',
};

export function Player({ specs }: { specs: AnyVizSpec[] }) {
  const uid = useId();
  const [active, setActive] = useState(0);
  const spec = specs[active];
  const [text, setText] = useState(() => spec.examples[0]?.value ?? spec.randomInput());
  const [run, setRun] = useState<Run>(() => runTrace(spec, text));
  const [error, setError] = useState<string | null>(run.error);
  // ?step=N (1-based) opens the first run at a given step, so a step can be linked to.
  const [index, setIndex] = useState(() => {
    const requested = Number(new URLSearchParams(window.location.search).get('step'));
    return Number.isInteger(requested) && requested > 0 ? Math.min(requested - 1, Math.max(0, run.frames.length - 1)) : 0;
  });
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);

  const frames = run.frames;
  const last = Math.max(0, frames.length - 1);
  const frame = frames[Math.min(index, last)];

  function execute(target: AnyVizSpec, input: string) {
    const result = runTrace(target, input);
    setError(result.error);
    if (result.error) return;
    setRun(result);
    setIndex(0);
    setPlaying(false);
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
    setIndex(0);
    setPlaying(false);
  }

  useEffect(() => {
    if (!playing) return undefined;
    if (index >= last) {
      setPlaying(false);
      return undefined;
    }
    const id = window.setTimeout(() => setIndex((i) => Math.min(i + 1, last)), BASE_DELAY_MS / speed);
    return () => window.clearTimeout(id);
  }, [playing, index, last, speed]);

  const togglePlay = () => {
    if (!playing && index >= last) setIndex(0);
    setPlaying((p) => !p);
  };
  const step = (delta: number) => {
    setPlaying(false);
    setIndex((i) => Math.min(last, Math.max(0, i + delta)));
  };

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const tag = (e.target as HTMLElement).tagName;
    // Form fields keep their own keys (the range input already steps with arrows).
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    // Buttons activate themselves on Space/Enter.
    if (tag === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')) return;
    if (e.key === ' ') togglePlay();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'Home') step(-Infinity);
    else if (e.key === 'End') step(Infinity);
    else return;
    e.preventDefault();
  }

  const inputId = `${uid}-input`;
  const helpId = `${uid}-help`;

  return (
    <div className="viz" onKeyDown={onKeyDown}>
      {specs.length > 1 && (
        <div className="viz-tabs" role="tablist" aria-label="Algorithm">
          {specs.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={i === active ? 'selected' : undefined}
              onClick={() => switchTo(i)}
              onKeyDown={(e) => {
                const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
                if (!delta) return;
                e.preventDefault();
                e.stopPropagation();
                switchTo((active + delta + specs.length) % specs.length);
              }}
            >
              {s.title}
            </button>
          ))}
        </div>
      )}

      <form
        className="viz-input"
        onSubmit={(e) => {
          e.preventDefault();
          execute(spec, text);
        }}
      >
        <label htmlFor={inputId}>{spec.inputLabel}</label>
        <div className="viz-input-row">
          <input
            id={inputId}
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            aria-describedby={helpId}
            aria-invalid={error ? true : undefined}
          />
          <button type="submit" className="viz-btn primary">
            Run
          </button>
          <button
            type="button"
            className="viz-btn"
            onClick={() => {
              const t = spec.randomInput();
              setText(t);
              execute(spec, t);
            }}
          >
            Random
          </button>
        </div>
        <div className="viz-examples">
          <span>Try:</span>
          {spec.examples.map((ex) => (
            <button
              key={ex.label}
              type="button"
              className="viz-chip"
              onClick={() => {
                setText(ex.value);
                execute(spec, ex.value);
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>
        <p id={helpId} className="viz-help">
          {spec.inputHelp}
        </p>
        {error && (
          <p className="viz-error" role="alert">
            {error}
          </p>
        )}
      </form>

      <div
        className="viz-stage"
        tabIndex={0}
        role="group"
        aria-label={`${spec.title} visualization. Space plays or pauses, arrow keys step.`}
      >
        {frame ? spec.render(frame.state) : null}
      </div>

      <ul className="viz-legend" aria-label="Legend">
        {spec.legend.map((l) => (
          <li key={l.label}>
            <span className={`viz-swatch role-${l.role}`} aria-hidden="true" />
            {l.label}
          </li>
        ))}
      </ul>

      <p className="viz-caption" aria-live="polite">
        {frame?.caption}
      </p>

      <div className="viz-controls">
        <div className="viz-buttons">
          <button type="button" className="viz-icon" onClick={() => step(-Infinity)} aria-label="First step" disabled={index === 0}>
            <Icon d={ICONS.first} />
          </button>
          <button type="button" className="viz-icon" onClick={() => step(-1)} aria-label="Previous step" disabled={index === 0}>
            <Icon d={ICONS.prev} />
          </button>
          <button
            type="button"
            className="viz-icon play"
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Play'}
            disabled={frames.length < 2}
          >
            <Icon d={playing ? ICONS.pause : ICONS.play} />
          </button>
          <button type="button" className="viz-icon" onClick={() => step(1)} aria-label="Next step" disabled={index >= last}>
            <Icon d={ICONS.next} />
          </button>
          <button type="button" className="viz-icon" onClick={() => step(Infinity)} aria-label="Last step" disabled={index >= last}>
            <Icon d={ICONS.last} />
          </button>
        </div>
        <input
          className="viz-scrubber"
          type="range"
          min={0}
          max={last}
          value={Math.min(index, last)}
          onChange={(e) => {
            setPlaying(false);
            setIndex(Number(e.target.value));
          }}
          aria-label="Step"
        />
        <span className="viz-step">
          {frames.length ? `${Math.min(index, last) + 1} / ${frames.length}` : '0 / 0'}
        </span>
        <label className="viz-speed">
          Speed
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
            {SPEEDS.map((s) => (
              <option key={s} value={s}>
                {s}&#xd7;
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="viz-panels">
        <div className="viz-code">
          <h3>Pseudocode</h3>
          <ol>
            {spec.pseudocode.map((line, i) => (
              <li key={i} className={frame?.line === i ? 'current' : undefined} aria-current={frame?.line === i ? 'step' : undefined}>
                <code>{line}</code>
              </li>
            ))}
          </ol>
        </div>
        <div className="viz-vars">
          <h3>State</h3>
          <table>
            <tbody>
              {(frame?.vars ?? []).map(([k, v]) => (
                <tr key={k}>
                  <th scope="row">{k}</th>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="viz-complexity">
            Time <strong>{spec.complexity.time}</strong> &#xb7; Space <strong>{spec.complexity.space}</strong>
          </p>
        </div>
      </div>
      <p className="viz-keys">Keyboard: Space play/pause &#xb7; &#x2190; &#x2192; step &#xb7; Home/End jump</p>
    </div>
  );
}
