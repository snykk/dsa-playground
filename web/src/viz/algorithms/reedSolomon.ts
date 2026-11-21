/**
 * GF(2^8) + Reed-Solomon, ported from Algorithms/Coding_Theory (same field polynomial
 * 0x11B, alpha = 3, low-degree-first polynomials, codeword = [parity | message]).
 * Golden fixtures generated from the Python implementation keep the two in sync.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { RsState } from '../renderers/ByteRows';

const PRIMITIVE_POLY = 0x11b;
const ORDER = 255;
export const ALPHA = 3;

const EXP = new Uint8Array(2 * ORDER);
const LOG = new Uint8Array(256);
{
  const slowMul = (a: number, b: number) => {
    let r = 0;
    while (a && b) {
      if (b & 1) r ^= a;
      b >>= 1;
      a <<= 1;
      if (a & 0x100) a ^= PRIMITIVE_POLY;
    }
    return r;
  };
  let x = 1;
  for (let i = 0; i < ORDER; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x = slowMul(x, ALPHA);
  }
  for (let i = ORDER; i < 2 * ORDER; i++) EXP[i] = EXP[i - ORDER];
}

export const gf = {
  mul: (a: number, b: number) => (a && b ? EXP[LOG[a] + LOG[b]] : 0),
  div(a: number, b: number) {
    if (b === 0) throw new Error('GF division by zero');
    return a ? EXP[(LOG[a] - LOG[b] + ORDER) % ORDER] : 0;
  },
  pow(a: number, n: number) {
    if (a === 0) return n === 0 ? 1 : 0;
    return EXP[(((LOG[a] * n) % ORDER) + ORDER) % ORDER];
  },
};

const expMod = (x: number) => ((x % ORDER) + ORDER) % ORDER;

export function polyMul(p: number[], q: number[]): number[] {
  const r = new Array<number>(p.length + q.length - 1).fill(0);
  p.forEach((a, i) => {
    if (a) q.forEach((b, j) => (r[i + j] ^= gf.mul(a, b)));
  });
  return r;
}

export function polyEval(p: number[], x: number): number {
  let y = 0;
  for (let i = p.length - 1; i >= 0; i--) y = gf.mul(y, x) ^ p[i];
  return y;
}

export function generator(nsym: number, fcr = 0): number[] {
  let g = [1];
  for (let i = 0; i < nsym; i++) g = polyMul(g, [gf.pow(ALPHA, expMod(fcr + i)), 1]);
  return g;
}

/** Systematic encode: remainder of (message * x^(n-k)) / g(x) becomes the parity prefix. */
export function encode(message: number[], n: number, fcr = 0): number[] {
  const nsym = n - message.length;
  const g = generator(nsym, fcr);
  const out = [...new Array<number>(nsym).fill(0), ...message];
  for (let i = out.length - 1; i >= nsym; i--) {
    const coef = out[i];
    if (!coef) continue;
    for (let j = 0; j < g.length; j++) out[i - nsym + j] ^= gf.mul(g[j], coef);
  }
  return [...out.slice(0, nsym), ...message];
}

export function syndromes(received: number[], nsym: number, fcr = 0): number[] {
  return Array.from({ length: nsym }, (_, i) => polyEval(received, gf.pow(ALPHA, expMod(fcr + i))));
}

export class DecodeError extends Error {}

const fmtPoly = (p: number[]) => {
  const terms = p
    .map((c, i) => (c === 0 ? '' : i === 0 ? String(c) : `${c === 1 ? '' : c}x${i > 1 ? `^${i}` : ''}`))
    .filter(Boolean);
  return terms.length ? terms.join(' + ') : '0';
};

export interface RsInput {
  n: number;
  k: number;
  fcr: number;
  message: number[];
  errors: Array<{ pos: number; value: number }>;
  erasures: number[];
}

const parseList = (raw: string) => raw.split(',').map((s) => s.trim()).filter(Boolean);

export function parseRs(text: string, { maxN = 24 } = {}): RsInput {
  const fields = new Map<string, string>();
  for (const part of text.split(/[;\s]+(?=[a-z]+=)/i)) {
    const m = part.trim().match(/^([a-z]+)\s*=\s*(.*)$/i);
    if (!m) {
      if (part.trim()) throw new InputError(`Cannot read "${part.trim()}". Use key=value pairs like n=7 k=5 msg=2,3,5,7,11 err=5:99 era=2.`);
      continue;
    }
    fields.set(m[1].toLowerCase(), m[2].trim().replace(/[;\s]+$/, ''));
  }
  const int = (key: string, fallback?: number) => {
    const v = fields.get(key);
    if (v === undefined || v === '') {
      if (fallback === undefined) throw new InputError(`Missing ${key}=...`);
      return fallback;
    }
    if (!/^\d+$/.test(v)) throw new InputError(`${key} must be a whole number (got "${v}").`);
    return Number(v);
  };
  const n = int('n');
  const k = int('k');
  const fcr = int('fcr', 0);
  // fcr only matters modulo 255 (the order of alpha); a bound keeps fcr + i an exact integer.
  if (fcr > 1_000_000_000) throw new InputError('Keep fcr <= 1000000000: only fcr mod 255 matters.');
  if (n > maxN) throw new InputError(`Keep n <= ${maxN} so every step fits on screen.`);
  if (!(k >= 1 && k < n)) throw new InputError('Need 1 <= k < n.');
  const message = parseList(fields.get('msg') ?? '').map((s) => {
    if (!/^\d+$/.test(s) || Number(s) > 255) throw new InputError(`Message byte "${s}" must be 0..255.`);
    return Number(s);
  });
  if (message.length !== k) throw new InputError(`msg needs exactly k = ${k} bytes (got ${message.length}).`);
  const errors = parseList(fields.get('err') ?? '').map((s) => {
    const m = s.match(/^(\d+):(\d+)$/);
    if (!m) throw new InputError(`Error "${s}" should be position:newValue, e.g. 5:99.`);
    const pos = Number(m[1]);
    const value = Number(m[2]);
    if (pos >= n || value > 255) throw new InputError(`Error "${s}": position must be < n and the value 0..255.`);
    return { pos, value };
  });
  const erasures = [...new Set(parseList(fields.get('era') ?? '').map((s) => {
    if (!/^\d+$/.test(s) || Number(s) >= n) throw new InputError(`Erasure "${s}" must be a position below n = ${n}.`);
    return Number(s);
  }))].sort((a, b) => a - b);
  return { n, k, fcr, message, errors, erasures };
}

/** Plain decode (no frames), mirroring the repository implementations. Used by tests. */
export function decode(received: number[], k: number, erasures: number[] = [], fcr = 0): number[] {
  const frames = rsDecodeFrames(received, k, [...new Set(erasures)].sort((a, b) => a - b), fcr);
  const last = frames[frames.length - 1];
  if (last.state.failed) throw new DecodeError(last.caption);
  return last.state.corrected!.slice(received.length - k) as number[];
}

interface Ctx {
  n: number;
  k: number;
  frames: Array<Frame<RsState>>;
  base: Omit<RsState, 'stage' | 'math' | 'roles'>;
  math: RsState['math'];
}

function snap(ctx: Ctx, stage: string, line: number | undefined, caption: string, roles: RsState['roles'] = {}, extra: Partial<RsState> = {}, vars: Array<[string, string | number]> = []) {
  ctx.frames.push({
    line,
    caption,
    vars,
    state: { ...ctx.base, stage, math: ctx.math.map((m) => ({ ...m })), roles, ...extra },
  });
}

/** Decode with frames; on failure the last frame has state.failed = true. */
function rsDecodeFrames(received: number[], k: number, erasures: number[], fcr: number, ctxIn?: Ctx): Array<Frame<RsState>> {
  const n = received.length;
  const nsym = n - k;
  const ctx: Ctx = ctxIn ?? { n, k, frames: [], base: { n, k, received: [...received], erased: erasures }, math: [] };
  ctx.base.received = [...received];
  const e = erasures.length;
  const fail = (line: number, caption: string, roles: RsState['roles'] = {}) => snap(ctx, 'Decode failed', line, caption, roles, { failed: true });

  if (e > nsym) {
    fail(2, `Too many erasures: ${e} > n - k = ${nsym}. Each erasure needs one parity byte.`);
    return ctx.frames;
  }

  // Step 1: syndromes.
  const s: number[] = [];
  for (let i = 0; i < nsym; i++) {
    s.push(polyEval(received, gf.pow(ALPHA, expMod(fcr + i))));
    ctx.math = [...ctx.math.filter((m) => m.label !== 'syndromes'), { label: 'syndromes', value: `[${s.join(', ')}]` }];
    snap(ctx, 'Syndromes', 2, `s${i} = r(alpha^${fcr + i}) = ${s[i]}${s[i] ? ' (nonzero: something is wrong)' : ''}. Syndromes only depend on the errors, never on the message.`, {}, {}, [['i', i], [`s${i}`, s[i]]]);
  }
  if (s.every((x) => x === 0) && e === 0) {
    snap(ctx, 'Done', undefined, 'All syndromes are zero and nothing was declared erased: the codeword is intact.', {}, { corrected: [...received] });
    return ctx.frames;
  }

  // Step 2: erasure locator.
  let gamma = [1];
  for (const p of erasures) gamma = polyMul(gamma, [1, gf.pow(ALPHA, p)]);
  if (e > 0) {
    ctx.math.push({ label: 'Gamma(x)', value: fmtPoly(gamma) });
    snap(ctx, 'Erasure locator', 3, `Known-bad positions ${erasures.join(', ')} give the erasure locator Gamma(x) = ${fmtPoly(gamma)}; its roots are alpha^-p for each erased p.`, {
      received: Object.fromEntries(erasures.map((p) => [p, 'active' as Role])),
    });
  }

  // Step 3: Berlekamp-Massey seeded with Gamma (classical L-tracking form, as in C++/Go).
  let lam = [...gamma];
  let prev = [...gamma];
  let L = e;
  let m = 1;
  let b = 1;
  for (let r = e; r < nsym; r++) {
    let delta = s[r];
    for (let i = 1; i <= L; i++) if (i < lam.length && lam[i]) delta ^= gf.mul(lam[i], s[r - i]);
    if (delta === 0) {
      m++;
      ctx.math = [...ctx.math.filter((x) => x.label !== 'Lambda(x)'), { label: 'Lambda(x)', value: fmtPoly(lam) }];
      snap(ctx, 'Berlekamp-Massey', 4, `Iteration r = ${r}: discrepancy 0, the current locator already explains s${r}.`, {}, {}, [['r', r], ['delta', 0], ['L', L]]);
      continue;
    }
    const scale = gf.div(delta, b);
    const shift = [...new Array<number>(m).fill(0), ...prev.map((c) => gf.mul(c, scale))];
    const next = [...lam, ...new Array<number>(Math.max(0, shift.length - lam.length)).fill(0)];
    shift.forEach((c, i) => (next[i] ^= c));
    let grew = false;
    if (2 * L <= r + e) {
      prev = lam;
      L = r + 1 + e - L;
      b = delta;
      m = 1;
      grew = true;
    } else {
      m++;
    }
    lam = next;
    while (lam.length > 1 && lam[lam.length - 1] === 0) lam.pop();
    ctx.math = [...ctx.math.filter((x) => x.label !== 'Lambda(x)'), { label: 'Lambda(x)', value: fmtPoly(lam) }];
    snap(ctx, 'Berlekamp-Massey', 4, `Iteration r = ${r}: discrepancy ${delta} != 0, so correct the locator${grew ? ` and grow its length to L = ${L}` : ''}.`, {}, {}, [['r', r], ['delta', delta], ['L', L]]);
  }
  const degree = lam.length - 1;
  snap(ctx, 'Berlekamp-Massey', 4, `Locator found: Lambda(x) = ${fmtPoly(lam)} of degree ${degree}, i.e. ${degree} bad position${degree === 1 ? '' : 's'} (${e} known, ${degree - e} newly located).`);

  // Step 4: Chien search.
  const roots: number[] = [];
  for (let p = 0; p < n; p++) {
    const v = polyEval(lam, gf.pow(ALPHA, ORDER - p));
    if (v === 0) roots.push(p);
    snap(ctx, 'Chien search', 5, `Lambda(alpha^-${p}) = ${v}${v === 0 ? `: a root, so byte ${p} is bad.` : '.'}`, {
      received: Object.fromEntries([...roots.map((q) => [q, 'active' as Role]), [p, (v === 0 ? 'active' : 'compare') as Role]]),
    }, { pointer: p }, [['p', p], ['roots', roots.join(', ') || '-']]);
  }
  if (roots.length !== degree) {
    fail(5, `Chien search found ${roots.length} root${roots.length === 1 ? '' : 's'} but Lambda has degree ${degree}: the damage exceeds the budget e + 2v <= ${nsym}. Decode fails instead of guessing.`);
    return ctx.frames;
  }

  // Step 5: Forney.
  const omega = polyMul(s, lam).slice(0, nsym);
  const lamPrime = lam.slice(1).map((c, i) => (i % 2 === 0 ? c : 0)); // odd-degree terms survive
  ctx.math.push({ label: 'Omega(x)', value: fmtPoly(omega) });
  const corrected = [...received];
  const mags: number[] = [];
  const fcrTerm = expMod(1 - fcr);
  for (const p of roots) {
    const xInv = gf.pow(ALPHA, ORDER - p);
    const den = polyEval(lamPrime, xInv);
    if (den === 0) {
      fail(6, 'Forney denominator is zero: decode fails.');
      return ctx.frames;
    }
    const mag = gf.mul(gf.pow(ALPHA, expMod(p * fcrTerm)), gf.div(polyEval(omega, xInv), den));
    mags.push(mag);
    corrected[p] ^= mag;
    ctx.math = [...ctx.math.filter((x) => x.label !== 'magnitudes'), { label: 'magnitudes', value: roots.slice(0, mags.length).map((q, i) => `${q}:${mags[i]}`).join(', ') }];
    snap(ctx, 'Forney', 6, `Byte ${p}: magnitude ${mag}, so ${received[p]} XOR ${mag} = ${corrected[p]}.`, {
      received: { [p]: 'active' },
      corrected: Object.fromEntries(roots.slice(0, mags.length).map((q) => [q, 'good' as Role])),
    }, { corrected: [...corrected] }, [['position', p], ['magnitude', mag]]);
  }

  // Step 6: verify.
  const check = syndromes(corrected, nsym, fcr);
  if (check.some((x) => x !== 0)) {
    fail(7, `After correction the syndromes are [${check.join(', ')}], not all zero: decode fails.`, { corrected: Object.fromEntries(roots.map((q) => [q, 'bad' as Role])) });
    return ctx.frames;
  }
  snap(ctx, 'Verified', 7, `Recomputed syndromes are all zero: the corrected word is a valid codeword. The message is its last ${k} bytes.`, {
    corrected: Object.fromEntries([...roots.map((q) => [q, 'good' as Role]), ...Array.from({ length: k }, (_, i) => [n - k + i, 'done' as Role]).filter(([q]) => !roots.includes(q as number))]),
  }, { corrected });
  return ctx.frames;
}

export function rsTrace(input: RsInput): Array<Frame<RsState>> {
  const { n, k, fcr, message, errors, erasures } = input;
  const nsym = n - k;
  const ctx: Ctx = { n, k, frames: [], base: { n, k, erased: [] }, math: [] };
  const msgRoles = Object.fromEntries(Array.from({ length: k }, (_, i) => [nsym + i, 'done' as Role]));

  ctx.base.sent = [...new Array<number | null>(nsym).fill(null), ...message];
  snap(ctx, 'Encode', 0, `Systematic layout: the ${k} message bytes go to the high-degree end; ${nsym} parity bytes will fill positions 0..${nsym - 1}. RS(${n}, ${k}) fixes ${Math.floor(nsym / 2)} unknown errors or ${nsym} erasures.`, { sent: msgRoles });
  const g = generator(nsym, fcr);
  ctx.math.push({ label: 'g(x)', value: fmtPoly(g) });
  snap(ctx, 'Encode', 0, `Generator g(x) = (x + alpha^${fcr})...(x + alpha^${fcr + nsym - 1}) = ${fmtPoly(g)} (in GF(2^8), minus is XOR).`, { sent: msgRoles });
  const codeword = encode(message, n, fcr);
  ctx.base.sent = codeword;
  snap(ctx, 'Encode', 1, `Parity = remainder of message(x) * x^${nsym} divided by g(x). The codeword is now a multiple of g(x): it vanishes at every root of g.`, {
    sent: { ...Object.fromEntries(Array.from({ length: nsym }, (_, i) => [i, 'compare' as Role])), ...msgRoles },
  });

  const received = [...codeword];
  for (const { pos, value } of errors) received[pos] = value;
  for (const p of erasures) received[p] = 0;
  ctx.base.received = received;
  ctx.base.erased = erasures;
  const changed = errors.filter(({ pos }) => codeword[pos] !== received[pos] && !erasures.includes(pos)).map(({ pos }) => pos);
  const v = changed.length;
  const budget = erasures.length + 2 * v;
  snap(ctx, 'Channel', undefined, `The channel corrupts ${v} byte${v === 1 ? '' : 's'} at unknown positions${erasures.length ? ` and erases ${erasures.length} known position${erasures.length === 1 ? '' : 's'} (hatched, received as 0)` : ''}. Budget used: e + 2v = ${budget} of ${nsym}${budget > nsym ? ' (over budget!)' : ''}.`, {
    received: Object.fromEntries(changed.map((p) => [p, 'bad' as Role])),
  });

  rsDecodeFrames(received, k, erasures, fcr, ctx);
  const last = ctx.frames[ctx.frames.length - 1];
  if (!last.state.failed && last.state.corrected) {
    const ok = last.state.corrected.slice(nsym).every((b, i) => b === message[i]);
    snap(ctx, 'Done', undefined, ok ? `Recovered message: [${last.state.corrected.slice(nsym).join(', ')}], identical to what was sent.` : 'Decoded to a different valid codeword: the damage was beyond the budget and happened to look like a smaller error.', last.state.roles, { corrected: last.state.corrected });
  }
  return ctx.frames;
}
