import { useEffect, useId, useRef, useState } from 'react';
import { InputError, type AnyVizSpec, type Frame } from '../../core/types';
import { usePlayback } from '../hooks/usePlayback';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { AlgorithmTabs } from '../molecules/AlgorithmTabs';
import { InputPanel } from '../molecules/InputPanel';
import { Legend } from '../molecules/Legend';
import { PseudocodePanel, StatePanel } from '../molecules/Panels';
import { ShortcutsDialog } from '../molecules/ShortcutsDialog';
import { TransportControls } from '../molecules/TransportControls';
import '../roles.css';
import { browserClipboard, buildStepLink, copyText, readStepLink } from '../share';
import './Player.css';

interface Run {
  /** The input text this run was traced from. */
  input: string;
  frames: Array<Frame<unknown>>;
  error: string | null;
}

function runTrace(spec: AnyVizSpec, text: string): Run {
  try {
    const frames = spec.trace(spec.parse(text)) as Array<Frame<unknown>>;
    return frames.length ? { input: text, frames, error: null } : { input: text, frames, error: 'Nothing to show for this input.' };
  } catch (e) {
    return { input: text, frames: [], error: e instanceof InputError ? e.message : `Unexpected error: ${(e as Error).message}` };
  }
}

/** The input a visualization opens with: its first example, else a random one. */
function defaultInput(spec: AnyVizSpec): string {
  return spec.examples[0]?.value ?? spec.randomInput();
}

/**
 * The first run. A step link (see ../share: ?viz=ID&step=N&input=...) picks the tab, the input
 * and the step; a link input that no longer parses falls back to the default input.
 */
function firstRun(specs: AnyVizSpec[], fromUrl: boolean) {
  const link = fromUrl && typeof window !== 'undefined' ? readStepLink(window.location.search, specs.map((s) => s.id)) : undefined;
  const tab = link?.tab ?? 0;
  const spec = specs[tab];
  const linked = link?.input !== undefined ? runTrace(spec, link.input) : undefined;
  const run = linked && !linked.error ? linked : runTrace(spec, defaultInput(spec));
  return { tab, run, index: link?.index ?? 0 };
}

const STATUS_MS = 2500;

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
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const linkButtonRef = useRef<HTMLButtonElement>(null);
  const manualLinkRef = useRef<HTMLInputElement>(null);
  // Teasers start from the beginning whatever the URL says.
  const [first] = useState(() => firstRun(specs, !autoplay && !compact));
  const [active, setActive] = useState(first.tab);
  const spec = specs[active];
  const [text, setText] = useState(first.run.input);
  const [run, setRun] = useState<Run>(first.run);
  const [error, setError] = useState<string | null>(first.run.error);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const [status, setStatus] = useState('');
  const [manualLink, setManualLink] = useState<string | null>(null);
  const playback = usePlayback(run.frames.length, first.index, openShortcuts);
  const frame = run.frames[playback.index];
  const tabbed = !compact && specs.length > 1;
  const panelId = `${uid}-panel`;

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
    const input = next.inputKind === spec.inputKind ? text : defaultInput(next);
    setActive(i);
    setText(input);
    const result = runTrace(next, input);
    setRun(result);
    setError(result.error);
    playback.reset(0);
  }

  function openShortcuts() {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setShortcutsOpen(true);
  }

  function closeShortcuts() {
    setShortcutsOpen(false);
    const back = opener.current?.isConnected ? opener.current : stageRef.current;
    back?.focus({ preventScroll: true });
  }

  /** Show a short status; clearing it first makes a repeated message speak again. */
  function announce(message: string) {
    setStatus('');
    window.setTimeout(() => setStatus(message), 60);
  }

  async function copyLink() {
    const link = buildStepLink(window.location.href, {
      index: playback.index,
      viz: specs.length > 1 ? spec.id : undefined,
      input: spec.examples[0] && run.input === spec.examples[0].value ? undefined : run.input,
      anchor: rootRef.current?.closest('[id]')?.id || undefined,
    });
    if (await copyText(link, browserClipboard())) {
      setManualLink(null);
      announce('Link copied');
    } else {
      // No clipboard: hand over the link in a field, selected, for the reader to copy.
      setManualLink(link);
      announce('Copy the link below');
    }
  }

  // A link handed over in a field arrives selected, ready to copy.
  useEffect(() => {
    manualLinkRef.current?.focus({ preventScroll: true });
    manualLinkRef.current?.select();
  }, [manualLink]);

  useEffect(() => {
    if (!status) return undefined;
    const id = window.setTimeout(() => setStatus(''), STATUS_MS);
    return () => window.clearTimeout(id);
  }, [status]);

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

  const body = (
    <>
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

      <div
        ref={stageRef}
        className="viz-stage"
        tabIndex={0}
        role="group"
        aria-label={`${spec.title} visualization. Space plays or pauses, arrow keys step, question mark lists every shortcut.`}
      >
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
        onCopyLink={compact ? undefined : copyLink}
        onShortcuts={compact ? undefined : openShortcuts}
        status={status}
        linkButtonRef={linkButtonRef}
      />

      {manualLink && (
        <div className="viz-manual-link">
          <label htmlFor={`${uid}-link`}>Link to this step</label>
          <div className="viz-input-row">
            <input id={`${uid}-link`} readOnly value={manualLink} ref={manualLinkRef} onFocus={(e) => e.currentTarget.select()} />
            <button
              type="button"
              className="viz-btn"
              onClick={() => {
                setManualLink(null);
                linkButtonRef.current?.focus();
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {!compact && (
        <>
          <div className="viz-panels">
            <PseudocodePanel lines={spec.pseudocode} current={frame?.line} />
            <StatePanel vars={frame?.vars} complexity={spec.complexity} />
          </div>
          <p className="viz-keys">Space plays or pauses and the arrow keys step while the player has focus; press ? for every shortcut.</p>
        </>
      )}
    </>
  );

  return (
    <div ref={rootRef} className={`viz${compact ? ' viz-compact' : ''}`} onKeyDown={shortcutsOpen ? undefined : playback.onKeyDown}>
      {tabbed && <AlgorithmTabs titles={specs.map((s) => s.title)} active={active} onSelect={switchTo} idBase={uid} panelId={panelId} />}
      {tabbed ? (
        <div id={panelId} role="tabpanel" aria-labelledby={`${uid}-tab-${active}`}>
          {body}
        </div>
      ) : (
        body
      )}
      <ShortcutsDialog id={`${uid}-keys`} open={shortcutsOpen} onClose={closeShortcuts} hasTabs={tabbed} hasInput={!compact} />
    </div>
  );
}
