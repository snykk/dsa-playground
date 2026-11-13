import type { Example } from '../../core/types';
import './InputPanel.css';

interface Props {
  id: string;
  label: string;
  help: string;
  value: string;
  error: string | null;
  examples: Example[];
  onChange: (value: string) => void;
  /** Apply the given text (examples and Random pass their own text). */
  onRun: (value: string) => void;
  onRandom: () => void;
}

/** Text input with Apply / Random buttons, example chips, help text and a friendly error. */
export function InputPanel({ id, label, help, value, error, examples, onChange, onRun, onRandom }: Props) {
  const helpId = `${id}-help`;
  return (
    <form
      className="viz-input"
      onSubmit={(e) => {
        e.preventDefault();
        onRun(value);
      }}
    >
      <label htmlFor={id}>{label}</label>
      <div className="viz-input-row">
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          aria-describedby={helpId}
          aria-invalid={error ? true : undefined}
        />
        <button type="submit" className="viz-btn primary" title="Visualize this input from the first step (Enter)">
          Apply
        </button>
        <button type="button" className="viz-btn" onClick={onRandom}>
          Random
        </button>
      </div>
      <div className="viz-examples">
        <span>Try:</span>
        {examples.map((ex) => (
          <button
            key={ex.label}
            type="button"
            className="viz-chip"
            onClick={() => {
              onChange(ex.value);
              onRun(ex.value);
            }}
          >
            {ex.label}
          </button>
        ))}
      </div>
      <p id={helpId} className="viz-help">
        {help}
      </p>
      {error && (
        <p className="viz-error" role="alert">
          <span className="viz-error-icon" aria-hidden="true">
            !
          </span>
          {error}
        </p>
      )}
    </form>
  );
}
