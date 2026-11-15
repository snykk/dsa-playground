"""Generate golden fixtures for Strassen, Randomized Quickselect and Reservoir Sampling.

The web visualizer re-implements these topics in TypeScript (web/src/viz/algorithms/strassen.ts,
quickselect.ts, reservoir.ts and randomizedDraws.ts). These fixtures pin each port to the
repository's Python code in Algorithms/Divide_and_Conquer and Algorithms/Randomized_Algorithms:

- draws: raw outputs of random.Random(seed) (getrandbits(32), randrange, randint), which
  randomizedDraws.ts ports bit for bit, so "seed 8" on the site is random.Random(8) here;
- strassen: every call the code makes, in order, logged by wrapping strassen_multiply,
  matrix_multiply_naive, pad_matrix, split_matrix, combine_matrices and
  strassen_multiply_general: the size of each call, each pad, split and combine, and every
  returned matrix (a digest for big ones). The visualization lets the reader lower the code's
  cutoff (a parameter of strassen_multiply and strassen_multiply_general, default 64) so that the
  seven-product recursion shows on a small matrix; those cases pass that cutoff to the code. The
  cutoff-64 cases leave it at its default, on 65 x 65, 128 x 128 and 130 x 130 inputs too;
- quickselect: the module's random is replaced by Draws (fixed values first, then
  random.Random(seed)); every draw, every _partition3 (lt, gt and the list after it), every
  result or exception and the list after each call;
- reservoir: the module's random is replaced the same way; every draw, the reservoir after
  every item (reservoir_sample on each prefix of the stream with the same draws, checked
  against ReservoirSampler), the result, and how often each item is kept over many runs on
  one random.Random(seed).

Run from anywhere:

    python3 web/scripts/gen_divideAndRandomized_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/divideAndRandomized.json. CI regenerates the
file and fails if it changed, which means the two implementations drifted.
"""

import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ALG = ROOT / "Algorithms"
for folder in (
    "Divide_and_Conquer/Strassens_Matrix_Multiplication/Python",
    "Randomized_Algorithms/Randomized_Quickselect/Python",
    "Randomized_Algorithms/Reservoir_Sampling/Python",
):
    sys.path.insert(0, str(ALG / folder))

import quickselect as qs_module  # noqa: E402
import reservoir_sampling as rs_module  # noqa: E402
import strassen_matrix  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "divideAndRandomized.json"
RNG = random.Random(20261115)
PYTHON_CUTOFF = 64


# ---------- draws ----------


class Draws:
    """Stands in for the random module: fixed values first, then random.Random(seed); logs every call."""

    def __init__(self, seed, fixed=()):
        self.rng = random.Random(seed)
        self.fixed = list(fixed)
        self.log = []

    def _take(self, lo, hi, draw):
        value = self.fixed.pop(0) if self.fixed else draw()
        assert lo <= value <= hi, (lo, hi, value)
        return value

    def randint(self, a, b):
        value = self._take(a, b, lambda: self.rng.randint(a, b))
        self.log.append([a, b, value])
        return value

    def randrange(self, n):
        value = self._take(0, n - 1, lambda: self.rng.randrange(n))
        self.log.append([n, value])
        return value


def draws_cases():
    cases = []
    for seed in [0, 1, 2, 7, 8, 42, 123456789, 4294967295] + [RNG.randint(0, 2**32 - 1) for _ in range(6)]:
        r = random.Random(seed)
        bits = [r.getrandbits(32) for _ in range(5)]
        ranges = []
        for _ in range(40):
            n = RNG.choice([1, 2, 3, 5, 7, 8, 13, 16, 100, 1000, 65536, 1000003])
            ranges.append([n, r.randrange(n)])
        ints = []
        for _ in range(20):
            a = RNG.randint(-5, 10)
            b = a + RNG.randint(0, 15)
            ints.append([a, b, r.randint(a, b)])
        cases.append({"seed": seed, "bits": bits, "randrange": ranges, "randint": ints})
    # Past the first 624 outputs the generator regenerates its state: pin a draw from there.
    r = random.Random(5)
    for _ in range(1500):
        r.getrandbits(32)
    cases.append({"seed": 5, "skip": 1500, "bits": [r.getrandbits(32) for _ in range(3)], "randrange": [], "randint": []})
    return cases


# ---------- Strassen ----------


def digest(m):
    total = 0
    weighted = 0
    for i, row in enumerate(m):
        for j, v in enumerate(row):
            total += v
            weighted += ((i * 31 + j * 17) % 1000 + 1) * v
    return [len(m), len(m[0]) if m else 0, total, weighted]


def logged(m):
    return [list(r) for r in m] if len(m) * (len(m[0]) if m else 0) <= 64 else digest(m)


STRASSEN_HELPERS = ("strassen_multiply", "matrix_multiply_naive", "pad_matrix", "split_matrix", "combine_matrices", "strassen_multiply_general")


def strassen_case(A, B, cutoff, general):
    """Run the module with every helper wrapped so each call is logged; the recursion goes through the wrappers."""
    events = []
    raw = {name: getattr(strassen_matrix, name) for name in STRASSEN_HELPERS}

    def strassen_multiply(A, B, cutoff=PYTHON_CUTOFF):
        events.append(["call", len(A)])
        try:
            result = raw["strassen_multiply"](A, B, cutoff)
        except ValueError as e:
            events.append(["error", "ValueError: %s" % e])
            raise
        events.append(["ret", len(A), logged(result)])
        return result

    def matrix_multiply_naive(A, B):
        events.append(["naive", len(A)])
        return raw["matrix_multiply_naive"](A, B)

    def pad_matrix(matrix, target_size):
        rows = len(matrix)
        events.append(["pad", rows, len(matrix[0]) if rows > 0 else 0, target_size])
        return raw["pad_matrix"](matrix, target_size)

    def split_matrix(matrix):
        events.append(["split", len(matrix)])
        return raw["split_matrix"](matrix)

    def combine_matrices(C11, C12, C21, C22):
        events.append(["combine", len(C11)])
        return raw["combine_matrices"](C11, C12, C21, C22)

    def strassen_multiply_general(A, B, cutoff=PYTHON_CUTOFF):
        events.append(["general", len(A), len(A[0]), len(B), len(B[0])])
        try:
            result = raw["strassen_multiply_general"](A, B, cutoff)
        except ValueError as e:
            events.append(["error", "ValueError: %s" % e])
            raise
        events.append(["ret_general", logged(result)])
        return result

    wrappers = dict(
        strassen_multiply=strassen_multiply,
        matrix_multiply_naive=matrix_multiply_naive,
        pad_matrix=pad_matrix,
        split_matrix=split_matrix,
        combine_matrices=combine_matrices,
        strassen_multiply_general=strassen_multiply_general,
    )
    square = len(A) == len(A[0]) and len(B) == len(B[0]) and len(A) == len(B)
    result, error = None, None
    for name, fn in wrappers.items():
        setattr(strassen_matrix, name, fn)
    try:
        # The code's default is left implicit, so the cutoff-64 cases also pin the default value.
        kwargs = {} if cutoff == PYTHON_CUTOFF else {"cutoff": cutoff}
        if general or not square:
            result = strassen_matrix.strassen_multiply_general(A, B, **kwargs)
        else:
            result = strassen_matrix.strassen_multiply(A, B, **kwargs)
    except ValueError as e:
        error = "ValueError: %s" % e
    finally:
        for name, fn in raw.items():
            setattr(strassen_matrix, name, fn)
    if result is not None and square:
        assert result == strassen_matrix.matrix_multiply_naive(A, B)
    return {"A": A, "B": B, "cutoff": cutoff, "general": general, "events": events, "result": result, "error": error}


def formula_matrix(n, seed):
    """A big deterministic matrix the TypeScript test rebuilds: entries -9..9."""
    return [[(i * 7 + j * 13 + seed) % 19 - 9 for j in range(n)] for i in range(n)]


def strassen_cases():
    cases = []
    rand_mat = lambda r, c: [[RNG.randint(-9, 9) for _ in range(c)] for _ in range(r)]
    fixed = [
        ([[1, 2], [3, 4]], [[5, 6], [7, 8]], 1, False),
        ([[1, 2], [3, 4]], [[5, 6], [7, 8]], PYTHON_CUTOFF, False),
        ([[2]], [[3]], 1, False),
        ([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], 1, False),
        ([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], 1, True),
        ([[1, 2, 3], [4, 5, 6]], [[1, 2], [3, 4], [5, 6]], 1, False),
        ([[1, 2, 3], [4, 5, 6]], [[1, 2], [3, 4]], 1, False),
        ([[1] * 5 for _ in range(5)], [[1] * 5 for _ in range(5)], 2, False),
        ([[1] * 5 for _ in range(5)], [[1] * 5 for _ in range(5)], 2, True),
        # A cutoff below 1 raises ValueError in both functions; one above every size is the naive loop.
        ([[1, 2], [3, 4]], [[5, 6], [7, 8]], 0, False),
        ([[1, 2, 3]], [[1], [2], [3]], -1, False),
        ([[1, 2], [3, 4]], [[5, 6], [7, 8]], 500, False),
    ]
    for A, B, cutoff, general in fixed:
        cases.append(strassen_case(A, B, cutoff, general))
    for _ in range(40):
        n = RNG.randint(1, 8)
        cutoff = RNG.choice([1, 1, 2, 2, 3, 4, PYTHON_CUTOFF])
        if n >= 5 and cutoff == 1:
            cutoff = 2
        cases.append(strassen_case(rand_mat(n, n), rand_mat(n, n), cutoff, RNG.random() < 0.25))
    for _ in range(20):
        m, inner, p = RNG.randint(1, 6), RNG.randint(1, 6), RNG.randint(1, 6)
        inner_b = inner if RNG.random() < 0.85 else RNG.randint(1, 6)
        cases.append(strassen_case(rand_mat(m, inner), rand_mat(inner_b, p), RNG.choice([1, 2, 4, PYTHON_CUTOFF]), False))
    big = []
    # The code's own cutoff: 128 splits once into naive 64 x 64 products; 65 pads to 66 and
    # splits into naive 33 x 33 products; 130 splits into 65 x 65 calls that pad again.
    for n, sa, sb in [(65, 3, 4), (128, 1, 2), (130, 5, 6)]:
        case = strassen_case(formula_matrix(n, sa), formula_matrix(n, sb), PYTHON_CUTOFF, False)
        big.append({"n": n, "seedA": sa, "seedB": sb, "events": case["events"]})
    return cases, big


# ---------- quickselect ----------


def quickselect_case(values, ops, seed, pivots):
    draws = Draws(seed, pivots)
    partitions = []
    original_partition3 = qs_module._partition3

    def partition3(arr, lo, hi, pivot_idx):
        lt, gt = original_partition3(arr, lo, hi, pivot_idx)
        partitions.append([lo, hi, pivot_idx, lt, gt, list(arr)])
        return lt, gt

    qs_module.random = draws
    qs_module._partition3 = partition3
    arr = list(values)
    steps = []
    try:
        for kind, k in ops:
            before_draws, before_parts = len(draws.log), len(partitions)
            result, error = None, None
            try:
                result = qs_module.quickselect(arr, k) if kind == "select" else qs_module.top_k_smallest(arr, k)
            except (ValueError, IndexError) as e:
                error = "%s: %s" % (type(e).__name__, e)
            steps.append({
                "result": result,
                "error": error,
                "draws": draws.log[before_draws:],
                "partitions": partitions[before_parts:],
                "arr": list(arr),
            })
    finally:
        qs_module.random = random
        qs_module._partition3 = original_partition3
    return {"values": values, "ops": ops, "seed": seed, "pivots": pivots, "steps": steps}


def quickselect_cases():
    cases = [
        quickselect_case([7, 2, 9, 2, 5, 2, 8], [["select", 3]], 1, []),
        quickselect_case([7, 2, 9, 2, 5, 2, 8], [["select", 3]], 7, [1, 3]),
        quickselect_case([7, 2, 1, 8, 6, 3, 5, 4], [["select", 2], ["top", 3]], 42, []),
        quickselect_case([5] * 12, [["select", 6], ["select", 0], ["select", 11]], 3, []),
        quickselect_case([], [["select", 0], ["top", 1], ["top", 0]], 1, []),
        quickselect_case([3, 1, 2], [["select", 3], ["select", -1], ["top", 5], ["top", -2], ["select", 1]], 2, []),
        quickselect_case([42], [["select", 0], ["top", 1]], 9, []),
        quickselect_case(list(range(16, 0, -1)), [["select", 0], ["select", 15]], 11, [0, 1, 2, 3]),
    ]
    for _ in range(80):
        n = RNG.randint(0, 16)
        pool = RNG.choice([[RNG.randint(-99, 99) for _ in range(4)], list(range(-9, 10)), [0, 1], [7]])
        values = [RNG.choice(pool) for _ in range(n)]
        ops = []
        for _ in range(RNG.randint(1, 4)):
            kind = "select" if RNG.random() < 0.75 else "top"
            k = RNG.randint(-1, n) if RNG.random() < 0.15 else RNG.randint(0, max(0, n - 1))
            ops.append([kind, k])
        cases.append(quickselect_case(values, ops, RNG.randint(0, 2**32 - 1), []))
    return cases


# ---------- reservoir sampling ----------


def reservoir_case(stream, k, seed, fixed, runs):
    def run(prefix):
        draws = Draws(seed, fixed)
        rs_module.random = draws
        try:
            return rs_module.reservoir_sample(iter(prefix), k), draws.log
        finally:
            rs_module.random = random

    try:
        result, log = run(stream)
    except ValueError as e:
        return {"stream": stream, "k": k, "seed": seed, "draws": fixed, "error": "ValueError: %s" % e, "result": None, "after": [], "log": [], "tally": None}
    after = []
    if k > 0:
        for i in range(1, len(stream) + 1):
            sample, _ = run(stream[:i])
            # ReservoirSampler.offer makes the same step per item (for k > 0).
            draws = Draws(seed, fixed)
            sampler = rs_module.ReservoirSampler(k, rng=draws)
            for item in stream[:i]:
                sampler.offer(item)
            assert sampler.sample() == sample, (stream, k, i)
            after.append(sample)
    tally = None
    if runs and stream and k > 0:
        rng = random.Random(seed)
        counts = [0] * len(stream)
        for _ in range(runs):
            positions = rs_module.reservoir_sample(range(len(stream)), k, rng)
            for p in positions:
                counts[p] += 1
        tally = {"runs": runs, "counts": counts}
    return {"stream": stream, "k": k, "seed": seed, "draws": fixed, "error": None, "result": result, "after": after, "log": log, "tally": tally}


def reservoir_cases():
    letters = list("abcdefghijklmnop")
    cases = [
        reservoir_case(list("abcdef"), 2, 8, [], 1000),
        reservoir_case(list("abcdef"), 2, 1, [], 6000),
        reservoir_case(list("abcdef"), 2, 3, [0, 2, 3, 1], 0),
        reservoir_case(list(range(10)), 3, 42, [], 2000),
        reservoir_case(list("abc"), 5, 4, [], 100),
        reservoir_case(list("abc"), 0, 4, [], 100),
        reservoir_case(list("abc"), -1, 4, [], 100),
        reservoir_case([], 2, 4, [], 100),
        reservoir_case(list("abcdefghijklmnop"), 1, 7, [], 500),
    ]
    for _ in range(60):
        n = RNG.randint(0, 16)
        stream = RNG.choice([letters[:n], list(range(n)), [RNG.randint(-99, 999) for _ in range(n)]])
        k = RNG.randint(1, 8) if RNG.random() < 0.9 else RNG.choice([0, -1])
        needed = max(0, n - k) if k > 0 else 0
        fixed = []
        if needed and RNG.random() < 0.3:
            fixed = [RNG.randrange(k + 1 + t) for t in range(RNG.randint(1, needed))]
        cases.append(reservoir_case(stream, k, RNG.randint(0, 2**32 - 1), fixed, RNG.choice([0, 50, 300])))
    return cases


def main():
    strassen, strassen_big = strassen_cases()
    sections = {
        "draws": draws_cases(),
        "strassen": strassen,
        "strassenBig": strassen_big,
        "quickselect": quickselect_cases(),
        "reservoir": reservoir_cases(),
    }
    lines = ["{"]
    names = list(sections)
    for s, name in enumerate(names):
        lines.append('  "%s": [' % name)
        cases = sections[name]
        for c, case in enumerate(cases):
            lines.append("    " + json.dumps(case, separators=(",", ":"), ensure_ascii=True) + ("," if c < len(cases) - 1 else ""))
        lines.append("  ]" + ("," if s < len(names) - 1 else ""))
    lines.append("}")
    OUT.write_text("\n".join(lines) + "\n", encoding="ascii")
    print("wrote %s (%s)" % (OUT.relative_to(ROOT), ", ".join("%d %s" % (len(sections[n]), n) for n in names)))


if __name__ == "__main__":
    main()
