import type { Role } from '../core/types';
import { Cell } from '../ui/atoms/Cell';
import { CellGap, CellGrid, CellRow, IndexRow } from '../ui/molecules/CellRow';
import { SYM } from '../ui/symbols';

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

const show = (ch: string) => (ch === ' ' ? SYM.openBox : ch);

/** Organism for KMP: builds the LPS table, then slides the pattern along the text. */
export function StringMatch({ state }: { state: StringMatchState }) {
  const { text, pattern, lps } = state;
  const lpsRow = (offset: number, highlight?: number) => (
    <CellRow label="lps" shift={offset}>
      {lps.map((v, k) => (
        <Cell key={k} value={v === null ? '' : v} role={k === highlight ? 'done' : undefined} />
      ))}
    </CellRow>
  );

  if (state.phase === 'lps') {
    const i = state.lpsI ?? -1;
    const len = state.lpsLen ?? 0;
    const cmpRole: Role = state.lpsEqual === undefined ? 'compare' : state.lpsEqual ? 'good' : 'bad';
    return (
      <CellGrid label="Building the LPS table">
        <IndexRow count={pattern.length} />
        <CellRow label="pattern">
          {pattern.map((ch, k) => (
            <Cell key={k} value={show(ch)} role={k === i ? cmpRole : k >= i - len && k < i ? 'compare' : undefined} pointer={k === i} />
          ))}
        </CellRow>
        {i >= 0 && i < pattern.length && (
          <CellRow label="prefix" shift={i - len}>
            {pattern.slice(0, len + 1).map((ch, k) => (
              <Cell key={k} value={show(ch)} role={k === len ? cmpRole : 'compare'} />
            ))}
          </CellRow>
        )}
        <CellGap />
        {lpsRow(0, state.lpsSet)}
      </CellGrid>
    );
  }

  const inMatch = (k: number) => state.matches.some((s) => k >= s && k < s + pattern.length);
  const cmpRole: Role | undefined = state.cmpEqual === undefined ? undefined : state.cmpEqual ? 'good' : 'bad';
  const textRole = (k: number): Role | undefined => {
    if (!state.done && k === state.i && cmpRole) return cmpRole;
    if (inMatch(k)) return 'done';
    if (!state.done && k < (state.i ?? 0)) return 'muted';
    return undefined;
  };
  return (
    <CellGrid label="Scanning the text">
      <IndexRow count={text.length} />
      <CellRow label="text">
        {text.map((ch, k) => (
          <Cell key={k} value={show(ch)} role={textRole(k)} pointer={!state.done && k === state.i} />
        ))}
      </CellRow>
      {!state.done && (
        <>
          <CellRow label="pattern" shift={state.shift}>
            {pattern.map((ch, k) => (
              <Cell key={k} value={show(ch)} role={k === state.j && cmpRole ? cmpRole : k < (state.j ?? 0) ? 'compare' : undefined} pointer={k === state.j} />
            ))}
          </CellRow>
          {lpsRow(state.shift)}
        </>
      )}
    </CellGrid>
  );
}
