import { parseRs, rsTrace, type RsInput } from '../algorithms/reedSolomon';
import type { VizSpec } from '../core/types';
import { ByteRows, type RsState } from '../renderers/ByteRows';

function randomRs(): string {
  const n = 12;
  const k = 6;
  const msg = Array.from({ length: k }, () => Math.floor(Math.random() * 256));
  const positions = [...Array(n).keys()].sort(() => Math.random() - 0.5);
  const erasures = positions.slice(0, 2);
  const errors = positions.slice(2, 4).map((p) => `${p}:${Math.floor(Math.random() * 256)}`);
  return `n=${n} k=${k} msg=${msg.join(',')} err=${errors.join(',')} era=${erasures.join(',')}`;
}

export const reedSolomon: VizSpec<RsInput, RsState> = {
  id: 'reed-solomon',
  title: 'Reed-Solomon Decoding',
  inputKind: 'reed-solomon',
  inputLabel: 'Code, message and damage',
  inputHelp:
    'n=codeword length (<= 24), k=message bytes, msg=k bytes 0..255, err=position:newValue list (unknown errors), era=position list (known erasures), optional fcr=first consecutive root.',
  examples: [
    { label: 'README trace', value: 'n=7 k=5 msg=2,3,5,7,11 err=5:99' },
    { label: 'Erasures double the power', value: 'n=7 k=5 msg=2,3,5,7,11 era=2,5' },
    { label: 'Same damage, no positions', value: 'n=7 k=5 msg=2,3,5,7,11 err=2:0,5:0' },
    { label: 'Mixed', value: 'n=15 k=7 msg=65,66,67,68,69,70,71 err=7:1,11:2 era=0,1,2,3' },
    { label: 'Over budget', value: 'n=15 k=11 msg=72,101,108,108,111,32,68,83,65,33,33 err=1:0,5:0,10:0' },
  ],
  randomInput: randomRs,
  parse: (text) => parseRs(text),
  trace: rsTrace,
  render: (state) => <ByteRows state={state} />,
  pseudocode: [
    'g(x) = (x + alpha^fcr)(x + alpha^(fcr+1))...(x + alpha^(fcr+n-k-1))',
    'parity = (msg(x) * x^(n-k)) mod g(x); codeword = [parity | msg]',
    's_i = r(alpha^(fcr+i)) for i = 0..n-k-1      // all zero: done',
    'Gamma(x) = prod over erasures p of (1 + alpha^p x)',
    'Lambda(x) = Berlekamp-Massey(s), seeded with Gamma, from s_e on',
    'bad positions = { p : Lambda(alpha^-p) == 0 }   // Chien search',
    'e_p = X^(1-fcr) * Omega(X^-1) / Lambda\'(X^-1), X = alpha^p   // Forney',
    'r[p] ^= e_p; verify all syndromes are zero',
  ],
  legend: [
    { role: 'done', label: 'message bytes / recovered' },
    { role: 'compare', label: 'parity just computed / position tested' },
    { role: 'active', label: 'bad position located' },
    { role: 'bad', label: 'corrupted in transit (\u2715)' },
    { role: 'good', label: 'corrected (\u2713)' },
  ],
  complexity: { time: 'O(n \u00b7 (n - k)) per block', space: 'O(n)' },
};
