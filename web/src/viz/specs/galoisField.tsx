import { FIELD_CODE, fieldTrace, hex, parseField, type FieldInput } from '../algorithms/galoisField';
import type { VizSpec } from '../core/types';
import { FieldBits, type FieldState } from '../renderers/FieldBits';

const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

function randomField(): string {
  const byte = () => hex(rint(1, 255));
  const ops = [`mul ${byte()} ${byte()}`, `add ${byte()} ${byte()}`];
  const extra = [() => `inv ${byte()}`, () => `div ${byte()} ${byte()}`, () => `pow ${byte()} ${rint(-5, 300)}`, () => `mul ${byte()} ${byte()}`];
  for (let i = 0; i < rint(1, 3); i++) ops.push(extra[rint(0, extra.length - 1)]());
  return ops.join(', ');
}

export const galoisField: VizSpec<FieldInput, FieldState> = {
  id: 'galois-field',
  title: 'Galois Field GF(2^8)',
  inputKind: 'gf256',
  inputLabel: 'Field operations',
  inputHelp:
    'Operations separated by commas: "add 0x53 0xCA", "sub 5 3", "mul 0x53 0xCA", "div 1 0x53", "inv 0x53", "pow 3 8" (also "mul(83, 202)" or "0x53 * 0xCA"). ' +
    'Values are bytes 0 to 255, in decimal or hex; pow takes an exponent from -999 to 999. Up to 12 operations. Every mul is followed by the shift-and-add loop that built the tables.',
  examples: [
    { label: 'AES vector 0x53 x 0xCA', value: 'mul 0x53 0xCA, add 0x53 0xCA, inv 0x53' },
    { label: 'Overflow and reduction', value: 'mul 0x80 2, mul 0xFF 0xFF' },
    { label: 'Exponents wrap at 255', value: 'div 1 0x53, pow 3 255, pow 3 -1, pow 2 51' },
    { label: 'Zero: errors and shortcuts', value: 'mul 0 7, div 1 0, inv 0, pow 0 0, pow 0 -3' },
    { label: 'XOR is not +', value: 'add 5 3, sub 5 3, add 0xFF 0xFF' },
  ],
  randomInput: randomField,
  parse: parseField,
  trace: (input) => fieldTrace(input).frames,
  render: (state) => <FieldBits state={state} />,
  pseudocode: FIELD_CODE,
  legend: [
    { role: 'compare', label: 'operands; the first walk on the ring' },
    { role: 'active', label: 'bits that change (XOR, shift, reduction); the second walk' },
    { role: 'good', label: 'the result' },
    { role: 'bad', label: 'zero where it is not allowed: the call raises' },
    { role: 'idle', label: 'a bit: shaded 1, faint 0' },
  ],
  complexity: { time: 'O(1) per operation with the tables; _slow_multiply O(8)', space: 'O(1): 512 + 256 table entries, built once' },
};
