"""Generate golden fixtures for the advanced math and problem type visualizations.

The web visualizer re-implements six topics in TypeScript. These fixtures pin each port to the
repository's Python code, which this script imports by path and runs on fixed inputs:

- matrixPower (web/src/viz/algorithms/matrixPower.ts), from
  Algorithms/Mathematical_Algorithms/Advanced_Math/Matrix_Exponentiation/Python: every
  matrix_multiply call (both factors and the product), every matrix_power call and return, and
  the result of matrix_power_iterative, matrix_power and fibonacci_matrix. Python integers are
  unbounded, so every entry is written as a string.
- fft and fftMultiply (fft.ts), from .../Fast_Fourier_Transform/Python: the input and output of
  every _fft_recursive call, every twiddle factor cmath.exp returns, every fft call, and the
  result of fft / ifft and multiply_polynomials. cos and sin come from the platform's libm, which
  may differ from JavaScript's in the last bit, so complex values are pinned rounded to 9
  significant digits (at most 9 decimals, half up on the exact binary value: the same rule as
  Number.prototype.toFixed); the integer coefficients of a product are pinned exactly.
- ntt and nttMultiply (ntt.ts), from .../Number_Theoretic_Transform/Python: every _butterfly call
  (the two positions, the twiddle, the values read and written), every root_of_unity call, every
  bit_reverse_permute call (the list before and after), every ntt_in_place call (input, output and
  the butterfly count it returns), and the result of ntt / intt and multiply_polynomials. All are
  integers modulo 998244353, pinned exactly. The two sections draw their inputs from their own
  random generator, so adding them changed no other section.

- permutation, havelHakimi and northwestCorner (constructive.ts), from
  Utilities/Problem_Types/Constructive_Algorithms/Python: the result of construct_permutation for
  every n up to 12 and k around 1..n-1, of construct_matrix, and of construct_graph with every
  heapq pop and push in order (the module's heapq is replaced by a recording namespace).

- nim, spragueGrundy and gameGraph (gameTheory.ts), from Utilities/Problem_Types/Game_Theory/Python:
  nim_winner and nim_winning_move; every subtraction_grundy table with the reachable set passed to
  each mex call (mex is wrapped) and combined_grundy; game_graph_outcomes with the order in which
  its queue settled the nodes (read from the function's own local `queue` by sys.settrace when it
  returns).

- judge (interactive.ts), from Utilities/Problem_Types/Interactive_Problems/Python: guess_number,
  find_maximum, tournament and binary_subset_search played against a scripted judge, which is put
  in the module's namespace as print and input (so the code's own print(..., flush=True) and
  input() calls reach it). The judge answers within the query limit, replies -1 and closes the
  stream past it, and raises EOFError on a read after that. Every line of every transcript, the
  return value and the error are pinned.

The functions are observed, never edited: matrix_multiply, matrix_power, _fft_recursive and fft
are replaced in their module's namespace by wrappers that record each call and then run the
original, so the code's own recursion goes through them, and the FFT module's cmath is replaced by
a namespace whose exp records each root and returns cmath.exp's own value.

Run from anywhere:

    python3 web/scripts/gen_mathAndProblemTypes_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/mathAndProblemTypes.json. CI regenerates the file
and fails if it changed, which means the two implementations drifted.
"""

import cmath
import importlib.util
import json
import random
import sys
import types
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "mathAndProblemTypes.json"
RNG = random.Random(20261116)


def load(rel, name):
    """Import a repository file by path under its own module name."""
    spec = importlib.util.spec_from_file_location(name, ROOT / rel)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


MP = load("Algorithms/Mathematical_Algorithms/Advanced_Math/Matrix_Exponentiation/Python/matrix_exponentiation.py", "matrix_exponentiation")
FT = load("Algorithms/Mathematical_Algorithms/Advanced_Math/Fast_Fourier_Transform/Python/fast_fourier_transform.py", "fast_fourier_transform")
NT = load("Algorithms/Mathematical_Algorithms/Advanced_Math/Number_Theoretic_Transform/Python/number_theoretic_transform.py", "number_theoretic_transform")
CA = load("Utilities/Problem_Types/Constructive_Algorithms/Python/constructive.py", "constructive")
GT = load("Utilities/Problem_Types/Game_Theory/Python/game_theory.py", "game_theory")
IP = load("Utilities/Problem_Types/Interactive_Problems/Python/interactive.py", "interactive")


# ---------- matrix exponentiation ----------


def mat(M):
    return [[str(v) for v in row] for row in M]


def run_matrix(call):
    """Run call() with matrix_multiply and matrix_power recorded; returns the log."""
    log = {"mults": [], "calls": [], "returns": []}
    orig_mul, orig_pow = MP.matrix_multiply, MP.matrix_power

    def mul(A, B, mod=None):
        R = orig_mul(A, B, mod)
        log["mults"].append([mat(A), mat(B), mat(R)])
        return R

    def power(A, k, mod=None):
        log["calls"].append(str(k))
        R = orig_pow(A, k, mod)
        log["returns"].append([str(k), mat(R)])
        return R

    MP.matrix_multiply, MP.matrix_power = mul, power
    try:
        result = call()
        log["error"] = None
    except ValueError as e:
        result = None
        log["error"] = "ValueError: " + str(e)
    finally:
        MP.matrix_multiply, MP.matrix_power = orig_mul, orig_pow
    if isinstance(result, list):
        log["result"] = mat(result)
    else:
        log["result"] = None if result is None else str(result)
    return log


def power_case(A, k, mod):
    iterative = run_matrix(lambda: MP.matrix_power_iterative(A, k, mod))
    del iterative["calls"], iterative["returns"]
    recursive = run_matrix(lambda: MP.matrix_power(A, k, mod))
    return {"A": mat(A), "k": str(k), "mod": None if mod is None else str(mod), "iterative": iterative, "recursive": recursive}


def fib_case(n, mod):
    return {"fib": True, "A": [], "k": str(n), "mod": None if mod is None else str(mod), "recursive": run_matrix(lambda: MP.fibonacci_matrix(n, mod))}


FIB = [[1, 1], [1, 0]]
TRIANGLE = [[0, 1, 1], [1, 0, 1], [1, 1, 0]]


def matrix_cases(count):
    cases = [
        power_case(FIB, 11, None),
        power_case(FIB, 13, 1000),
        power_case(FIB, 10 ** 18, 10 ** 9 + 7),
        power_case(TRIANGLE, 3, None),
        power_case([[-1]], 3, 5),
        power_case(FIB, -1, None),
        power_case(FIB, 0, 1),
        power_case(FIB, 0, None),
        power_case(FIB, 1, None),
        power_case(FIB, 5, 0),
        power_case(FIB, 5, -7),
        power_case([[4000000000, 1], [1, 0]], 2, 5000000011),
        power_case([[1, 2], [3, 4]], 64, 10 ** 18),
        power_case([[2, -1, 0, 1], [0, 1, 3, -2], [1, 0, -1, 0], [5, 2, 0, 1]], 9, 997),
        fib_case(10, None),
        fib_case(90, None),
        fib_case(100, 1000),
        fib_case(0, None),
        fib_case(1, None),
        fib_case(1, 1),
        fib_case(2, None),
        fib_case(-1, None),
        fib_case(93, 10 ** 9 + 7),
    ]
    while len(cases) < count:
        if RNG.random() < 0.2:
            cases.append(fib_case(RNG.randint(0, 120), RNG.choice([None, 0, 1, 10, 1000, 10 ** 9 + 7])))
            continue
        n = RNG.randint(1, 4)
        A = [[RNG.randint(-5, 9) for _ in range(n)] for _ in range(n)]
        mod = RNG.choice([None, 0, -3, 1, 2, 7, 97, 1000, 10 ** 9 + 7])
        if mod is None or mod <= 0:
            k = RNG.randint(-2, 40 if n <= 2 else 12)
        elif n > 2:
            k = RNG.randint(0, 40)
        else:
            k = RNG.choice([RNG.randint(0, 64), RNG.randint(10 ** 3, 10 ** 6)])
        cases.append(power_case(A, k, mod))
    return cases


# ---------- fast Fourier transform ----------


def q9(x):
    """9 significant digits, at most 9 decimals, half up on the exact value; no negative zero."""
    ax = abs(x)
    digits = len(str(int(ax))) if ax >= 1 else 0
    v = float(Decimal(x).quantize(Decimal(1).scaleb(-max(0, 9 - digits)), rounding=ROUND_HALF_UP))
    return 0.0 if v == 0 else v


def cx(z):
    z = complex(z)
    return [q9(z.real), q9(z.imag)]


def run_fft(call):
    """Run call() with _fft_recursive, fft and cmath.exp recorded; returns the log."""
    log = {"calls": [], "roots": [], "ffts": []}
    orig_rec, orig_fft, orig_cmath = FT._fft_recursive, FT.fft, FT.cmath

    def rec(a, inverse=False):
        entry = {"input": [cx(v) for v in a]}
        log["calls"].append(entry)
        out = orig_rec(a, inverse)
        entry["output"] = [cx(v) for v in out]
        return out

    def fft(a, inverse=False):
        out = orig_fft(a, inverse)
        log["ffts"].append({"input": [cx(v) for v in a], "inverse": inverse, "output": [cx(v) for v in out]})
        return out

    def exp(z):
        w = orig_cmath.exp(z)
        log["roots"].append(cx(w))
        return w

    FT._fft_recursive, FT.fft = rec, fft
    FT.cmath = types.SimpleNamespace(exp=exp, pi=orig_cmath.pi)
    try:
        result = call()
        log["error"] = None
    except ValueError as e:
        result = None
        log["error"] = "ValueError: " + str(e)
    finally:
        FT._fft_recursive, FT.fft, FT.cmath = orig_rec, orig_fft, orig_cmath
    log["result"] = result
    return log


def signal_case(values, inverse):
    a = [complex(v) for v in values]
    log = run_fft(lambda: FT.fft(a, inverse))
    log["result"] = None if log["result"] is None else [cx(v) for v in log["result"]]
    return dict({"a": [[z.real, z.imag] for z in a], "inverse": inverse}, **log)


def multiply_case(p, q):
    log = run_fft(lambda: FT.multiply_polynomials(p, q))
    return dict({"p": p, "q": q}, **log)


def fft_cases(count):
    cases = [
        signal_case([1, 2, 3, 4], False),
        signal_case([1, 1, 1, 1, 0, 0, 0, 0], False),
        signal_case([1, 2, 3], False),
        signal_case([10, -2 + 2j, -2, -2 - 2j], True),
        signal_case([1, 2, 3], True),
        signal_case([], False),
        signal_case([], True),
        signal_case([5], False),
        signal_case([5 - 1j], True),
        signal_case([1 + 2j, -0.5j, 3, 2.25], False),
        signal_case([0.1, 0.2], False),
        signal_case([1, 0, 0, 0], False),
        signal_case([1, 2, 3, 4, 5, 6, 7, 8], False),
        signal_case([36, -4 + 9.66j, -4 + 4j, -4 + 1.66j, -4, -4 - 1.66j, -4 - 4j, -4 - 9.66j], True),
        signal_case([999, -999, 999.99, -0.01, 0, 1j, -1j, 500.5], False),
    ]
    while len(cases) < count:
        n = RNG.choice([1, 2, 3, 4, 5, 6, 7, 8, 8])
        inverse = RNG.random() < 0.3 and n in (1, 2, 4, 8)
        values = []
        for _ in range(n):
            re = RNG.randint(-999, 999) / RNG.choice([1, 1, 10, 100])
            im = RNG.randint(-99, 99) / RNG.choice([1, 10, 100]) if RNG.random() < 0.4 else 0
            values.append(complex(re, im))
        cases.append(signal_case(values, inverse))
    return cases


def multiply_cases(count):
    cases = [
        multiply_case([1, 2, 3], [4, 5]),
        multiply_case([1, 1], [1, 1]),
        multiply_case([1, 2], [3, 4]),
        multiply_case([3, -1, 4, 1], [5, 9, -2, 6]),
        multiply_case([99, 99, 99], [99, -99, 99, -99, 99]),
        multiply_case([7], [3]),
        multiply_case([0], [5, 5]),
        multiply_case([-99, 0, 0, 0, 0, 0, 0, 99], [1]),
    ]
    while len(cases) < count:
        lp = RNG.randint(1, 5)
        lq = RNG.randint(1, 9 - lp)
        cases.append(multiply_case([RNG.randint(-99, 99) for _ in range(lp)], [RNG.randint(-99, 99) for _ in range(lq)]))
    return cases


# ---------- number theoretic transform ----------

NTT_RNG = random.Random(998244353)


def run_ntt(call):
    """Run call() with _butterfly, root_of_unity, bit_reverse_permute and ntt_in_place recorded."""
    log = {"butterflies": [], "roots": [], "permutations": [], "transforms": []}
    names = ("_butterfly", "root_of_unity", "bit_reverse_permute", "ntt_in_place")
    real = {name: getattr(NT, name) for name in names}

    def butterfly(a, i, j, w):
        u, v = a[i], a[j]
        real["_butterfly"](a, i, j, w)
        log["butterflies"].append([i, j, w, u, v, a[i], a[j]])

    def root_of_unity(n, inverse=False):
        w = real["root_of_unity"](n, inverse)
        log["roots"].append([n, inverse, w])
        return w

    def bit_reverse_permute(a):
        before = list(a)
        real["bit_reverse_permute"](a)
        log["permutations"].append([before, list(a)])

    def ntt_in_place(a, inverse=False):
        before = list(a)
        count = real["ntt_in_place"](a, inverse)
        log["transforms"].append({"input": before, "inverse": inverse, "output": list(a), "count": count})
        return count

    for name, wrapper in zip(names, (butterfly, root_of_unity, bit_reverse_permute, ntt_in_place)):
        setattr(NT, name, wrapper)
    try:
        log["result"] = call()
        log["error"] = None
    except ValueError as e:
        log["result"] = None
        log["error"] = "ValueError: " + str(e)
    finally:
        for name in names:
            setattr(NT, name, real[name])
    return log


def ntt_value():
    """A value the visualization accepts (-99999999 to 999999999), often small, sometimes a large residue."""
    r = NTT_RNG.random()
    if r < 0.6:
        return NTT_RNG.randint(-9, 20)
    if r < 0.8:
        return NTT_RNG.choice([NT.MOD - 1, NT.MOD - 2, NT.MOD, -1, -2])
    return NTT_RNG.randint(-99999999, 999999999)


def ntt_case(values, inverse):
    return dict({"a": values, "inverse": inverse}, **run_ntt(lambda: NT.ntt(values, inverse)))


def ntt_multiply_case(p, q):
    return dict({"p": p, "q": q}, **run_ntt(lambda: NT.multiply_polynomials(p, q)))


def ntt_cases(count):
    m = NT.MOD
    cases = [
        ntt_case([1, 2, 3, 4], False),
        ntt_case([1, 1, 1, 1, 0, 0, 0, 0], False),
        ntt_case([10, 173167434, 998244351, 825076915], True),
        ntt_case([1, 2, 3], False),
        ntt_case([-1, -2, 3, m - 1], False),
        ntt_case([1, 2, 3], True),
        ntt_case([], False),
        ntt_case([], True),
        ntt_case([5], False),
        ntt_case([-5], True),
        ntt_case([m], False),
        ntt_case([0] * 8, False),
        ntt_case([3, 1, 4, 1, 5, 9, 2, 6], True),
        ntt_case([999999999, -99999999], False),
        ntt_case([1, 2, 3, 4, 5, 6, 7], False),
    ]
    while len(cases) < count:
        n = NTT_RNG.choice([1, 2, 3, 4, 5, 6, 7, 8, 8])
        inverse = NTT_RNG.random() < 0.3 and n in (1, 2, 4, 8)
        cases.append(ntt_case([ntt_value() for _ in range(n)], inverse))
    return cases


def ntt_multiply_cases(count):
    m = NT.MOD
    cases = [
        ntt_multiply_case([1, 2, 3], [4, 5]),
        ntt_multiply_case([1, -1], [1, 1]),
        ntt_multiply_case([3, 1, 4, 1], [5, 9, 2, 6]),
        ntt_multiply_case([m - 2], [m - 2]),
        ntt_multiply_case([7], [3]),
        ntt_multiply_case([0], [5, 5]),
        ntt_multiply_case([m - 1] * 3, [m - 1] * 3),
        ntt_multiply_case([100000000, 1], [100000000, -1]),
    ]
    while len(cases) < count:
        lp = NTT_RNG.randint(1, 5)
        lq = NTT_RNG.randint(1, 9 - lp)
        cases.append(ntt_multiply_case([ntt_value() for _ in range(lp)], [ntt_value() for _ in range(lq)]))
    return cases


# ---------- constructive algorithms ----------


def permutation_cases():
    return [{"n": n, "k": k, "result": CA.construct_permutation(n, k)} for n in range(-1, 13) for k in range(-1, max(n, 0) + 2)]


def graph_case(degrees):
    log = []
    real = CA.heapq

    def heappop(h):
        item = real.heappop(h)
        log.append(["pop", -item[0], item[1]])
        return item

    def heappush(h, item):
        log.append(["push", -item[0], item[1]])
        real.heappush(h, item)

    CA.heapq = types.SimpleNamespace(heapify=real.heapify, heappop=heappop, heappush=heappush)
    try:
        edges = CA.construct_graph(list(degrees))
    finally:
        CA.heapq = real
    return {"degrees": degrees, "result": None if edges is None else [list(e) for e in edges], "ops": log}


def graph_cases(count):
    fixed = [[3, 3, 2, 2, 2], [2, 2, 2], [3, 1, 1], [2, 2, 1], [1, 1, 1], [0, 2, 0, 1, 1, 4, 2, 0], [3] * 10, [0], [0, 0, 0], [1, 1], [9] * 10, [4, 4, 4, 4, 4]]
    cases = [graph_case(d) for d in fixed]
    while len(cases) < count:
        n = RNG.randint(1, 10)
        if RNG.random() < 0.6:
            deg = [0] * n
            for u in range(n):
                for v in range(u + 1, n):
                    if RNG.random() < 0.4:
                        deg[u] += 1
                        deg[v] += 1
        else:
            deg = [RNG.randint(0, min(9, n)) for _ in range(n)]
        cases.append(graph_case(deg))
    return cases


def matrix_sum_cases(count):
    fixed = [([3, 2], [1, 4]), ([7, 5, 8], [4, 6, 3, 7]), ([4, 2], [1, 4]), ([0, 5, 0], [2, 0, 3]), ([6], [1, 2, 3]), ([1], [2]), ([0], [0]), ([99, 99], [50, 50, 98])]
    cases = [{"rows": r, "cols": c, "result": CA.construct_matrix(r, c)} for r, c in fixed]
    while len(cases) < count:
        n, m = RNG.randint(1, 6), RNG.randint(1, 6)
        cells = [[RNG.choice([0, RNG.randint(1, 9)]) for _ in range(m)] for _ in range(n)]
        rows = [sum(r) for r in cells]
        cols = [sum(r[j] for r in cells) for j in range(m)]
        if RNG.random() < 0.2:
            rows[RNG.randrange(n)] += RNG.randint(1, 3)
        cases.append({"rows": rows, "cols": cols, "result": CA.construct_matrix(rows, cols)})
    return cases


# ---------- game theory ----------


def nim_cases(count):
    fixed = [[3, 4, 5], [1, 2, 3], [1, 2, 4, 8, 16], [0, 0, 0], [29, 17, 11, 24], [0], [7], [1, 1], [31, 31, 1]]
    cases = [{"piles": p, "winner": GT.nim_winner(p), "move": list(GT.nim_winning_move(p))} for p in fixed]
    while len(cases) < count:
        p = [RNG.randint(0, 31) for _ in range(RNG.randint(1, 8))]
        cases.append({"piles": p, "winner": GT.nim_winner(p), "move": list(GT.nim_winning_move(p))})
    return cases


def grundy_case(n, moves, piles):
    seen = []
    orig = GT.mex

    def mex(s):
        seen.append(sorted(s))
        return orig(s)

    GT.mex = mex
    try:
        table = GT.subtraction_grundy(n, moves)
    finally:
        GT.mex = orig
    combined = GT.combined_grundy(piles, [table] * len(piles)) if piles else None
    return {"n": n, "moves": moves, "piles": piles, "table": table, "reachable": seen, "combined": combined}


def grundy_cases(count):
    fixed = [(12, [1, 3, 4], [5, 6]), (12, [1, 2, 3], []), (16, [2, 5], [7, 9, 11]), (8, [1], [3, 5]), (10, [1, 3, 4], [2, 7]), (0, [1], []), (5, [7], [5]), (24, [1, 1, 2], [24])]
    cases = [grundy_case(*c) for c in fixed]
    while len(cases) < count:
        n = RNG.randint(0, 24)
        moves = [RNG.randint(1, 8) for _ in range(RNG.randint(1, 6))]
        piles = [RNG.randint(0, n) for _ in range(RNG.randint(0, 4))]
        cases.append(grundy_case(n, moves, piles))
    return cases


def outcomes_case(n, edges):
    captured = {}
    code = GT.game_graph_outcomes.__code__

    def local(frame, event, arg):
        if event == "return":
            captured["queue"] = list(frame.f_locals["queue"])
        return local

    def tracer(frame, event, arg):
        return local if frame.f_code is code else None

    sys.settrace(tracer)
    try:
        result = GT.game_graph_outcomes(n, [tuple(e) for e in edges])
    finally:
        sys.settrace(None)
    return {"n": n, "edges": edges, "outcomes": result, "queue": captured["queue"]}


def graph_game_cases(count):
    fixed = [
        (3, [[0, 1], [1, 0], [1, 2]]),
        (2, [[0, 1], [1, 0]]),
        (4, [[0, 1], [1, 2], [0, 2], [3, 2]]),
        (5, [[0, 0], [0, 1], [1, 2], [2, 3], [4, 3], [4, 4]]),
        (8, [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [4, 5], [5, 3], [2, 6], [6, 7]]),
        (1, [[0, 0]]),
        (1, []),
        (3, [[0, 1], [0, 1], [1, 2]]),
    ]
    cases = [outcomes_case(n, e) for n, e in fixed]
    while len(cases) < count:
        n = RNG.randint(1, 10)
        edges = [[RNG.randrange(n), RNG.randrange(n)] for _ in range(RNG.randint(0, min(24, 3 * n)))]
        cases.append(outcomes_case(n, edges))
    return cases


# ---------- interactive problems ----------


class ScriptedJudge:
    """Stands in for print and input in the interactive module; records both sides."""

    def __init__(self, mode, secret, values, limit):
        self.mode, self.secret, self.values, self.limit = mode, secret, values, limit
        self.transcript = []
        self.pending = None
        self.closed = False
        self.used = 0

    def print(self, *args, sep=" ", end="\n", flush=False):
        line = sep.join(str(a) for a in args)
        self.transcript.append(["solver", line])
        if self.closed or not line.startswith("?"):
            return
        self.used += 1
        if self.used > self.limit:
            reply = "-1"
            self.closed = True
        elif self.mode == "guess":
            mid = int(line.split()[1])
            reply = "correct" if mid == self.secret else "higher" if self.secret > mid else "lower"
        elif self.mode == "bits":
            reply = "1" if self.secret & int(line.split()[1]) else "0"
        else:
            i, j = (int(x) for x in line.split()[1:])
            a, b = self.values[i - 1], self.values[j - 1]
            reply = str((a > b) - (a < b))
        self.pending = reply

    def input(self, prompt=""):
        if self.pending is None:
            raise EOFError("the judge closed the stream")
        reply, self.pending = self.pending, None
        self.transcript.append(["judge", reply])
        return reply


def default_limit(mode, n):
    if mode == "guess":
        return max(0, n.bit_length() - 1)
    if mode == "bits":
        return n.bit_length()
    return max(0, n - 1)


FUNCS = {"guess": "guess_number", "maximum": "find_maximum", "tournament": "tournament", "bits": "binary_subset_search"}


def judge_case(mode, n, secret=0, values=(), limit=None):
    values = list(values)
    if mode in ("maximum", "tournament"):
        n = len(values)
    if limit is None:
        limit = default_limit(mode, n)
    judge = ScriptedJudge(mode, secret, values, limit)
    IP.print, IP.input = judge.print, judge.input
    try:
        result = getattr(IP, FUNCS[mode])(n)
        error = None
    except EOFError:
        result, error = None, "EOFError"
    finally:
        del IP.print, IP.input
    return {"mode": mode, "n": n, "secret": secret, "values": values, "limit": limit, "transcript": judge.transcript, "result": result, "error": error}


def judge_cases():
    cases = []
    for n in range(1, 17):
        for secret in range(1, n + 1):
            cases.append(judge_case("guess", n, secret))
    cases += [judge_case("guess", 10 ** 9, 123456789), judge_case("guess", 100, 1, limit=4), judge_case("guess", 100, 50), judge_case("guess", 7, 7, limit=1), judge_case("guess", 2, 2, limit=0)]
    for _ in range(20):
        n = RNG.randint(2, 10 ** 9)
        limit = None if RNG.random() < 0.7 else RNG.randint(0, max(0, n.bit_length() - 2))
        cases.append(judge_case("guess", n, RNG.randint(1, n), limit=limit))
    arrays = [[3, 9, 2, 9, 5], [1, 2, 3, 4, 5, 6, 7, 8], [8, 7, 6, 5, 4, 3, 2, 1], [42], [5, 1, 8, 3, 9, 2, 7], [4, 4, 4, 4]]
    for mode in ("maximum", "tournament"):
        for a in arrays:
            cases.append(judge_case(mode, 0, values=a))
        cases.append(judge_case(mode, 0, values=[4, 1, 7, 3], limit=2))
        for _ in range(25):
            a = [RNG.randint(-9, 20) for _ in range(RNG.randint(1, 16))]
            limit = None if RNG.random() < 0.75 else RNG.randint(0, max(0, len(a) - 2))
            cases.append(judge_case(mode, 0, values=a, limit=limit))
    for n in range(0, 13):
        for secret in range(0, n + 1):
            cases.append(judge_case("bits", n, secret))
    cases += [judge_case("bits", 10 ** 9, 987654321), judge_case("bits", 20, 4, limit=2), judge_case("bits", 31, 31, limit=4)]
    for _ in range(10):
        n = RNG.randint(1, 10 ** 9)
        cases.append(judge_case("bits", n, RNG.randint(0, n), limit=None if RNG.random() < 0.6 else RNG.randint(0, n.bit_length())))
    return cases


def main():
    sections = {
        "matrixPower": matrix_cases(60),
        "fft": fft_cases(40),
        "fftMultiply": multiply_cases(30),
        "ntt": ntt_cases(30),
        "nttMultiply": ntt_multiply_cases(30),
        "permutation": permutation_cases(),
        "havelHakimi": graph_cases(60),
        "northwestCorner": matrix_sum_cases(40),
        "nim": nim_cases(60),
        "spragueGrundy": grundy_cases(40),
        "gameGraph": graph_game_cases(60),
        "judge": judge_cases(),
    }
    header = {
        "generator": "web/scripts/gen_mathAndProblemTypes_fixtures.py",
        "reference": "Algorithms/Mathematical_Algorithms/Advanced_Math (matrix_exponentiation.py, fast_fourier_transform.py, number_theoretic_transform.py); Utilities/Problem_Types (constructive.py, game_theory.py, interactive.py)",
    }
    parts = []
    for key, cases in sections.items():
        lines = [json.dumps(c, separators=(",", ":")) for c in cases]
        parts.append(json.dumps(key) + ": [\n" + ",\n".join(lines) + "\n]")
    body = json.dumps(header)[:-1] + ",\n" + ",\n".join(parts) + "\n}\n"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(body, encoding="ascii")
    counts = ", ".join(f"{len(c)} {k}" for k, c in sections.items())
    print(f"wrote {counts} cases to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
