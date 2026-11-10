import type { Role } from '../core/types';
import { Cell } from '../ui/atoms/Cell';
import { Token } from '../ui/atoms/Token';
import { CellGrid, CellRow, IndexRow } from '../ui/molecules/CellRow';
import '../ui/molecules/Strip.css';
import './ByteRows.css';

export interface RsState {
  n: number;
  k: number;
  stage: string;
  sent?: Array<number | null>;
  received?: number[];
  corrected?: number[];
  erased: number[];
  roles: { sent?: Record<number, Role>; received?: Record<number, Role>; corrected?: Record<number, Role> };
  math: Array<{ label: string; value: string }>;
  /** Chien search position being tested. */
  pointer?: number;
  failed?: boolean;
}

function ByteRow({ label, values, roles = {}, state, erased = [], scanned = false }: { label: string; values: Array<number | null>; roles?: Record<number, Role>; state: RsState; erased?: number[]; scanned?: boolean }) {
  const nsym = state.n - state.k;
  return (
    <CellRow label={label} wide>
      {values.map((v, i) => {
        const isErased = erased.includes(i);
        return (
          <Cell
            key={i}
            wide
            value={isErased ? '?' : v}
            role={roles[i]}
            parity={i < nsym}
            erased={isErased}
            pointer={scanned && state.pointer === i}
            title={isErased ? 'erased: value unknown (received as 0)' : undefined}
          />
        );
      })}
    </CellRow>
  );
}

/** Organism for Reed-Solomon: sent / received / corrected codewords plus the decoder's polynomials. */
export function ByteRows({ state }: { state: RsState }) {
  const nsym = state.n - state.k;
  return (
    <div>
      <p className="viz-strip">
        <strong>Stage:</strong>
        <Token text={state.stage} role={state.failed ? 'active' : 'compare'} />
        <span>
          RS({state.n}, {state.k}): {nsym} parity bytes (underlined), message = last {state.k}
        </span>
      </p>
      <CellGrid label={`Reed-Solomon ${state.stage}`}>
        <IndexRow count={state.n} wide label="position" />
        {state.sent && <ByteRow label="sent" values={state.sent} roles={state.roles.sent} state={state} />}
        {state.received && <ByteRow label="received" values={state.received} roles={state.roles.received} state={state} erased={state.erased} scanned />}
        {state.corrected && <ByteRow label="corrected" values={state.corrected} roles={state.roles.corrected} state={state} />}
      </CellGrid>
      {state.math.map((m) => (
        <p key={m.label} className="viz-math">
          <span className="label">{m.label} =</span>
          {m.value}
        </p>
      ))}
    </div>
  );
}
