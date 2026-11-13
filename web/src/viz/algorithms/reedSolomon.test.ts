import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import fixtures from './__fixtures__/reed-solomon.json';
import { DecodeError, decode, encode, gf, parseRs, rsTrace } from './reedSolomon';

interface Case {
  n: number;
  k: number;
  fcr: number;
  message: number[];
  codeword: number[];
  received: number[];
  erasures: number[];
  within_budget: boolean;
  decoded: number[] | null;
  error: string | null;
}

const cases = fixtures.cases as Case[];

describe('GF(2^8) under 0x11B', () => {
  it('has 3 as a primitive element and 2 of order 51 (why the repo uses alpha = 3)', () => {
    expect(gf.pow(3, 255)).toBe(1);
    for (let i = 1; i < 255; i++) expect(gf.pow(3, i)).not.toBe(1);
    expect(gf.pow(2, 51)).toBe(1);
  });
  it('inverts multiplication', () => {
    for (let a = 1; a < 256; a++) for (const b of [1, 2, 3, 87, 255]) expect(gf.div(gf.mul(a, b), b)).toBe(a);
  });
});

describe('Reed-Solomon matches the Python reference (golden fixtures)', () => {
  it('has fixtures to check', () => expect(cases.length).toBeGreaterThan(100));

  it('encodes every message to the same codeword', () => {
    for (const c of cases) expect(encode(c.message, c.n, c.fcr)).toEqual(c.codeword);
  });

  it('decodes every within-budget case to the same message', () => {
    for (const c of cases.filter((x) => x.within_budget)) {
      expect(decode(c.received, c.k, c.erasures, c.fcr)).toEqual(c.decoded);
    }
  });

  it('agrees with Python on whether over-budget damage is detected', () => {
    for (const c of cases.filter((x) => !x.within_budget)) {
      let got: number[] | 'error';
      try {
        got = decode(c.received, c.k, c.erasures, c.fcr);
      } catch (e) {
        expect(e).toBeInstanceOf(DecodeError);
        got = 'error';
      }
      expect(got).toEqual(c.error === null ? c.decoded : 'error');
    }
  });

  it('reproduces the README trace bytes', () => {
    expect(encode([2, 3, 5, 7, 11], 7)).toEqual([87, 95, 2, 3, 5, 7, 11]);
  });
});

describe('rsTrace', () => {
  const finalCaption = (text: string) => {
    const frames = rsTrace(parseRs(text));
    return frames[frames.length - 1];
  };

  it('repairs the README example', () => {
    const last = finalCaption('n=7 k=5 msg=2,3,5,7,11 err=5:99');
    expect(last.state.corrected).toEqual([87, 95, 2, 3, 5, 7, 11]);
    expect(last.caption).toContain('identical to what was sent');
  });

  it('shows that erasures double the correction power', () => {
    expect(finalCaption('n=7 k=5 msg=2,3,5,7,11 era=2,5').state.failed).toBeFalsy();
    expect(finalCaption('n=7 k=5 msg=2,3,5,7,11 err=2:0,5:0').state.failed).toBe(true);
  });

  it('parses its input format and rejects bad values', () => {
    expect(parseRs('n=7 k=5 msg=2, 3, 5, 7, 11 err=5:99 era=1')).toMatchObject({ n: 7, k: 5, errors: [{ pos: 5, value: 99 }], erasures: [1] });
    for (const bad of ['k=5 msg=1', 'n=7 k=7 msg=1,2,3,4,5,6,7', 'n=7 k=5 msg=1,2', 'n=30 k=5 msg=1,2,3,4,5', 'n=7 k=5 msg=1,2,3,4,5 err=9:1']) {
      expect(() => parseRs(bad)).toThrow(InputError);
    }
  });
});
