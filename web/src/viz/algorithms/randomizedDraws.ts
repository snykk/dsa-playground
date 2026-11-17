/**
 * The random draws of the randomized algorithms (quickselect.ts, reservoir.ts, millerRabin.ts).
 *
 * PyRandom is CPython's random.Random ported bit for bit for the calls those topics make:
 * the Mersenne Twister MT19937 seeded through init_by_array with the absolute value of an int
 * seed (Modules/_randommodule.c), getrandbits(k), and _randbelow_with_getrandbits behind
 * randrange(n), randrange(start, stop) and randint(a, b) (Lib/random.py; unchanged from Python
 * 3.2 to 3.12). For k > 32, getrandbits joins 32-bit outputs, least significant word first, and
 * keeps only the top bits of the last one; the bigint methods (getrandbitsBig, randbelowBig,
 * randrangeBig) draw that way for ranges of any size, as Miller-Rabin's randrange(2, n - 1) does.
 * So "seed 8" in a visualization makes exactly the draws of random.Random(8), and a reader can
 * replay a run in a Python shell. The golden fixtures pin raw draws of many seeds.
 *
 * Draws adds fixed values: a script may fix the first draws ("pivots 1 3", "draws 0 2"); once
 * they run out, the seeded generator takes over. gen_divideAndRandomized_fixtures.py replaces the
 * module's random with the same object.
 */

const N = 624;
const M = 397;

export class PyRandom {
  private mt = new Uint32Array(N);
  private index = N + 1;

  constructor(seed: number) {
    // random_seed(): the key is |seed| as 32-bit words, least significant first ([0] for 0).
    let rest = Math.abs(Math.trunc(seed));
    const key: number[] = [];
    do {
      key.push(rest % 4294967296);
      rest = Math.floor(rest / 4294967296);
    } while (rest > 0);
    this.initByArray(key);
  }

  private initGenrand(s: number) {
    const mt = this.mt;
    mt[0] = s >>> 0;
    for (let i = 1; i < N; i++) {
      const prev = mt[i - 1] ^ (mt[i - 1] >>> 30);
      mt[i] = (Math.imul(1812433253, prev) + i) >>> 0;
    }
    this.index = N;
  }

  private initByArray(key: number[]) {
    const mt = this.mt;
    this.initGenrand(19650218);
    let i = 1;
    let j = 0;
    for (let k = Math.max(N, key.length); k > 0; k--) {
      const prev = mt[i - 1] ^ (mt[i - 1] >>> 30);
      mt[i] = ((mt[i] ^ Math.imul(prev, 1664525)) + key[j] + j) >>> 0;
      i++;
      j++;
      if (i >= N) {
        mt[0] = mt[N - 1];
        i = 1;
      }
      if (j >= key.length) j = 0;
    }
    for (let k = N - 1; k > 0; k--) {
      const prev = mt[i - 1] ^ (mt[i - 1] >>> 30);
      mt[i] = ((mt[i] ^ Math.imul(prev, 1566083941)) - i) >>> 0;
      i++;
      if (i >= N) {
        mt[0] = mt[N - 1];
        i = 1;
      }
    }
    mt[0] = 0x80000000;
  }

  /** genrand_uint32(): the next 32-bit output. */
  uint32(): number {
    const mt = this.mt;
    if (this.index >= N) {
      let kk = 0;
      for (; kk < N - M; kk++) {
        const y = (mt[kk] & 0x80000000) | (mt[kk + 1] & 0x7fffffff);
        mt[kk] = mt[kk + M] ^ (y >>> 1) ^ (y & 1 ? 0x9908b0df : 0);
      }
      for (; kk < N - 1; kk++) {
        const y = (mt[kk] & 0x80000000) | (mt[kk + 1] & 0x7fffffff);
        mt[kk] = mt[kk + (M - N)] ^ (y >>> 1) ^ (y & 1 ? 0x9908b0df : 0);
      }
      const y = (mt[N - 1] & 0x80000000) | (mt[0] & 0x7fffffff);
      mt[N - 1] = mt[M - 1] ^ (y >>> 1) ^ (y & 1 ? 0x9908b0df : 0);
      this.index = 0;
    }
    let y = mt[this.index++];
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;
    return y >>> 0;
  }

  /** getrandbits(k) for 1 <= k <= 32. */
  getrandbits(k: number): number {
    return this.uint32() >>> (32 - k);
  }

  /**
   * _randbelow_with_getrandbits(n) for a safe integer n >= 1: rejection sampling on
   * bit_length(n) bits. From 2^32 on it draws through the bigint path, several words per try.
   */
  randbelow(n: number): number {
    if (n >= 4294967296) return Number(this.randbelowBig(BigInt(n)));
    const k = 32 - Math.clz32(n);
    let r = this.getrandbits(k);
    while (r >= n) r = this.getrandbits(k);
    return r;
  }

  /** randrange(n): uniform in [0, n). randrange(start, stop): start + _randbelow(stop - start). */
  randrange(start: number, stop?: number): number {
    if (stop === undefined) return this.randbelow(start);
    return start + this.randbelow(stop - start);
  }

  /**
   * getrandbits(k) for any k >= 0, as a bigint (Modules/_randommodule.c): 0 for k = 0, one
   * output shifted right for k <= 32, otherwise ceil(k / 32) outputs from the least significant
   * word up, where the last (most significant) word keeps only its top k - 32 * (words - 1) bits.
   */
  getrandbitsBig(k: number): bigint {
    if (k <= 0) return 0n;
    if (k <= 32) return BigInt(this.getrandbits(k));
    let value = 0n;
    let shift = 0n;
    for (let left = k; left > 0; left -= 32) {
      let r = this.uint32();
      if (left < 32) r >>>= 32 - left;
      value |= BigInt(r) << shift;
      shift += 32n;
    }
    return value;
  }

  /** _randbelow_with_getrandbits(n) for a bigint n >= 1: rejection sampling on bit_length(n) bits. */
  randbelowBig(n: bigint): bigint {
    if (n < 1n) throw new RangeError(`randbelow needs n >= 1 (got ${n})`);
    const k = n.toString(2).length;
    let r = this.getrandbitsBig(k);
    while (r >= n) r = this.getrandbitsBig(k);
    return r;
  }

  /** randrange(start, stop) with bigints: start + _randbelow(stop - start); ValueError for an empty range. */
  randrangeBig(start: bigint, stop: bigint): bigint {
    if (stop <= start) throw new RangeError(`empty range in randrange(${start}, ${stop})`);
    return start + this.randbelowBig(stop - start);
  }

  /** randint(a, b): uniform in [a, b], both ends included. */
  randint(a: number, b: number): number {
    return a + this.randbelow(b - a + 1);
  }
}

/** One draw as the caption tells it. */
export interface Draw {
  /** The Python call: "randint(0, 6)" or "randrange(5)". */
  call: string;
  value: number;
  /** 1-based number of the draw in the run. */
  n: number;
  /** True when the script fixed this value instead of the generator drawing it. */
  fixed: boolean;
}

/** The generator a run draws from: fixed values first, then random.Random(seed). */
export class Draws {
  readonly seed: number;
  private rng: PyRandom;
  private fixed: number[];
  readonly log: Draw[] = [];

  constructor(seed: number, fixed: number[] = []) {
    this.seed = seed;
    this.rng = new PyRandom(seed);
    this.fixed = [...fixed];
  }

  /** How many fixed values are still unused. */
  get fixedLeft(): number {
    return this.fixed.length;
  }

  private take(call: string, lo: number, hi: number, draw: () => number): Draw {
    const fixed = this.fixed.length > 0;
    const value = fixed ? this.fixed.shift()! : draw();
    if (value < lo || value > hi) throw new RangeError(`${call} cannot return ${value}`);
    const d = { call, value, n: this.log.length + 1, fixed };
    this.log.push(d);
    return d;
  }

  randint(a: number, b: number): Draw {
    return this.take(`randint(${a}, ${b})`, a, b, () => this.rng.randint(a, b));
  }

  randrange(n: number): Draw {
    return this.take(`randrange(${n})`, 0, n - 1, () => this.rng.randrange(n));
  }

  /** Where a draw came from, for captions. */
  source(d: Draw): string {
    return d.fixed ? `fixed by the script (draw ${d.n})` : `random.Random(${this.seed}), draw ${d.n}`;
  }
}

/** "seed 8", "seed=8": the seed, or undefined when the segment is something else. */
export function parseSeed(segment: string): number | undefined {
  const m = segment.match(/^seed\s*[:=]?\s*(-?\d+)$/i);
  return m ? Math.abs(Number(m[1])) : undefined;
}

/** A Python int seed range the port handles exactly (|seed| below 2^53, words split exactly). */
export const MAX_SEED = 2 ** 32 - 1;
