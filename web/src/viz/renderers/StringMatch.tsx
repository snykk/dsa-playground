import type { Role } from '../core/types';

export interface StringMatchState {
  phase: 'lps' | 'search';
  text: string[];
  pattern: string[];
  lps: Array<number | null>;
  matches: number[];
  /** Search phase: the pattern is drawn starting under text[shift]. */
  shift: number;
  i?: number;
  j?: number;
  cmpEqual?: boolean;
  matchAt?: number;
  done?: boolean;
  /** LPS phase: comparing pattern[lpsI] with pattern[lpsLen]. */
  lpsI?: number;
  lpsLen?: number;
  lpsEqual?: boolean;
  lpsSet?: number;
}

function Cell({ ch, role, extra }: { ch: string; role?: Role; extra?: string }) {
  return (
    <span className={`cell${role ? ` role-${role}` : ''}${extra ? ` ${extra}` : ''}`}>{ch === ' ' ? '\u2423' : ch}</span>
  );
}

function IndexRow({ count, offset = 0, label = '' }: { count: number; offset?: number; label?: string }) {
  return (
    <div className="cells-row">
      <span className="cells-label">{label}</span>
      {Array.from({ length: offset }, (_, k) => (
        <span key={`o${k}`} className="cell blank" />
      ))}
      {Array.from({ length: count }, (_, k) => (
        <span key={k} className="cell index">
          {k}
        </span>
      ))}
    </div>
  );
}

export function StringMatch({ state }: { state: StringMatchState }) {
  const { text, pattern, lps } = state;
  const lpsRow = (offset: number, highlight?: number) => (
    <div className="cells-row">
      <span className="cells-label">lps</span>
      {Array.from({ length: offset }, (_, k) => (
        <span key={`o${k}`} className="cell blank" />
      ))}
      {lps.map((v, k) => (
        <Cell key={k} ch={v === null ? '' : String(v)} role={k === highlight ? 'done' : undefined} />
      ))}
    </div>
  );

  if (state.phase === 'lps') {
    const i = state.lpsI ?? -1;
    const len = state.lpsLen ?? 0;
    const cmpRole: Role | undefined = state.lpsEqual === undefined ? 'compare' : state.lpsEqual ? 'good' : 'bad';
    const offset = i >= 0 ? i - len : 0;
    return (
      <div className="cells" role="img" aria-label="Building the LPS table">
        <IndexRow count={pattern.length} label="index" />
        <div className="cells-row">
          <span className="cells-label">pattern</span>
          {pattern.map((ch, k) => (
            <Cell key={k} ch={ch} role={k === i ? cmpRole : k >= i - len && k < i ? 'compare' : undefined} extra={k === i ? 'pointer' : undefined} />
          ))}
        </div>
        {i >= 0 && i < pattern.length && (
          <div className="cells-row">
            <span className="cells-label">prefix</span>
            {Array.from({ length: offset }, (_, k) => (
              <span key={`o${k}`} className="cell blank" />
            ))}
            {pattern.slice(0, len + 1).map((ch, k) => (
              <Cell key={k} ch={ch} role={k === len ? cmpRole : 'compare'} />
            ))}
          </div>
        )}
        <div className="cells-gap" />
        {lpsRow(0, state.lpsSet)}
      </div>
    );
  }

  const shift = state.shift;
  const inMatch = (k: number) => state.matches.some((s) => k >= s && k < s + pattern.length);
  const cmpRole: Role | undefined = state.cmpEqual === undefined ? undefined : state.cmpEqual ? 'good' : 'bad';
  return (
    <div className="cells" role="img" aria-label="Scanning the text">
      <IndexRow count={text.length} label="index" />
      <div className="cells-row">
        <span className="cells-label">text</span>
        {text.map((ch, k) => (
          <Cell
            key={k}
            ch={ch}
            role={!state.done && k === state.i && cmpRole ? cmpRole : inMatch(k) ? 'done' : k < (state.i ?? 0) && !state.done ? 'muted' : undefined}
            extra={!state.done && k === state.i ? 'pointer' : undefined}
          />
        ))}
      </div>
      {!state.done && (
        <>
          <div className="cells-row">
            <span className="cells-label">pattern</span>
            {Array.from({ length: shift }, (_, k) => (
              <span key={`o${k}`} className="cell blank" />
            ))}
            {pattern.map((ch, k) => (
              <Cell
                key={k}
                ch={ch}
                role={k === state.j && cmpRole ? cmpRole : k < (state.j ?? 0) ? 'compare' : undefined}
                extra={k === state.j ? 'pointer' : undefined}
              />
            ))}
          </div>
          {lpsRow(shift)}
        </>
      )}
    </div>
  );
}
