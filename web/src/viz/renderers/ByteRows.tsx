import type { Role } from '../core/types';

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

function Row({
  label,
  values,
  roles = {},
  state,
  erased = [],
}: {
  label: string;
  values: Array<number | null>;
  roles?: Record<number, Role>;
  state: RsState;
  erased?: number[];
}) {
  const nsym = state.n - state.k;
  return (
    <div className="cells-row">
      <span className="cells-label">{label}</span>
      {values.map((v, i) => {
        const role = roles[i];
        const isErased = erased.includes(i);
        const classes = ['cell', 'wide', role ? `role-${role}` : '', i < nsym ? 'region-parity' : '', isErased ? 'erased' : '', state.pointer === i ? 'pointer' : '']
          .filter(Boolean)
          .join(' ');
        return (
          <span key={i} className={classes} title={isErased ? 'erased: value unknown (received as 0)' : undefined}>
            {isErased ? '?' : (v ?? '')}
          </span>
        );
      })}
    </div>
  );
}

export function ByteRows({ state }: { state: RsState }) {
  const nsym = state.n - state.k;
  return (
    <div>
      <p className="viz-strip">
        <strong>Stage:</strong>
        <span className={`viz-token ${state.failed ? 'role-active' : 'role-compare'}`}>{state.stage}</span>
        <span>
          RS({state.n}, {state.k}): {nsym} parity bytes (underlined), message = last {state.k}
        </span>
      </p>
      <div className="cells" role="img" aria-label={`Reed-Solomon ${state.stage}`}>
        <div className="cells-row">
          <span className="cells-label">position</span>
          {Array.from({ length: state.n }, (_, i) => (
            <span key={i} className="cell wide index">
              {i}
            </span>
          ))}
        </div>
        {state.sent && <Row label="sent" values={state.sent} roles={state.roles.sent} state={state} />}
        {state.received && <Row label="received" values={state.received} roles={state.roles.received} state={state} erased={state.erased} />}
        {state.corrected && <Row label="corrected" values={state.corrected} roles={state.roles.corrected} state={state} />}
      </div>
      {state.math.map((m) => (
        <p key={m.label} className="viz-math">
          <span className="label">{m.label} =</span>
          {m.value}
        </p>
      ))}
    </div>
  );
}
