"""Generate golden number theory fixtures from the repository's Python implementations.

The web visualizer re-implements the number theory topics in TypeScript
(web/src/viz/algorithms/euclideanAlgorithm.ts, modularArithmetic.ts, modularExponentiation.ts,
millerRabin.ts with randomizedDraws.ts, chineseRemainder.ts, sieveOfEratosthenes.ts and
eulersTotient.ts). These fixtures pin each port to its reference in
Algorithms/Mathematical_Algorithms/Number_Theory:

- euclid: every call of the recursive gcd, every iteration of gcd_iterative, lcm, and every
  call of _extended_gcd_nonneg with the (g, x, y) it returned, then extended_gcd's answer;
- modArith: the result of every mod_add / mod_subtract / mod_multiply / mod_divide /
  mod_inverse / mod_power call, every _extended_gcd_nonneg call behind an inverse, and the
  (result, base, exponent) at the top of each iteration of mod_power's loop;
- modExp: the same loop state for mod_pow, every call of mod_pow_recursive with its return
  value, and the inverse behind a negative exponent;
- draws: random.Random(seed).getrandbits(k) for k above 32 (several 32-bit words joined) and
  randrange(start, stop) over ranges up to 10^24, which randomizedDraws.ts ports bit for bit;
- millerRabin: for miller_rabin (the module's random replaced by random.Random(seed), as if
  random.seed(seed) had run) every witness drawn and every pow(...) call with its value, and
  for miller_rabin_deterministic every pow(...) call; then the verdicts;
- crt: every _merge and extended_gcd call with its result, and the answer;
- sieve: each outer index with its flag, every write is_prime[j] = False as (i, j), the
  primes, the flags and the answers of is_prime_sieve for queries inside and outside the list;
- totientSieve: every crossing of linear_sieve as (i, p, phi[i * p]), in order (its _cross_out
  replaced by a recording wrapper), and the phi, spf and primes tables with the crossings count;
- totientFactor: every candidate prime_factors tries, as (p, times it divided) (its _divide_out
  wrapped the same way), the factors, phi(n), and mod_inverse_euler(a, n) for a few a, or
  "ValueError". The two totient sections draw their inputs from their own random generator,
  so the other sections stay as they were.

The loop states come from sys.settrace (a line of the function, recorded each time it runs),
the calls from wrappers installed as module globals; the topic code itself is not edited.
Integers of 2^53 and above are written as strings, so JavaScript reads them exactly.

Run from anywhere:

    python3 web/scripts/gen_numberTheory_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/numberTheory.json. CI regenerates the file and
fails if it changed, which means the two implementations drifted.
"""

import inspect
import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
NT = ROOT / "Algorithms" / "Mathematical_Algorithms" / "Number_Theory"
for folder in (
    "Euclidean_Algorithm/Python",
    "Modular_Arithmetic/Python",
    "Modular_Exponentiation/Python",
    "Miller_Rabin_Primality_Test/Python",
    "Chinese_Remainder_Theorem/Python",
    "Sieve_of_Eratosthenes/Python",
    "Eulers_Totient/Python",
):
    sys.path.insert(0, str(NT / folder))

import chinese_remainder_theorem as crt_module  # noqa: E402
import euclidean_algorithm as euclid_module  # noqa: E402
import eulers_totient as totient_module  # noqa: E402
import miller_rabin as mr_module  # noqa: E402
import modular_arithmetic as ma_module  # noqa: E402
import modular_exponentiation as me_module  # noqa: E402
import sieve_of_eratosthenes as sieve_module  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "numberTheory.json"
RNG = random.Random(20261116)
SAFE = 2**53


def enc(value):
    """Integers of 2^53 and above become strings (JSON numbers would lose digits in JavaScript)."""
    if isinstance(value, bool) or value is None:
        return value
    if isinstance(value, int):
        return str(value) if abs(value) >= SAFE else value
    if isinstance(value, (list, tuple)):
        return [enc(v) for v in value]
    if isinstance(value, dict):
        return {k: enc(v) for k, v in value.items()}
    return value


# ---------- recording helpers ----------


def line_recorder(func, marker, extract):
    """Call wrapper: records extract(locals) each time the line of `func` containing `marker` is about to run."""
    lines, start = inspect.getsourcelines(func)
    targets = [start + i for i, text in enumerate(lines) if marker in text]
    assert len(targets) == 1, (func.__name__, marker, targets)
    target = targets[0]
    code = func.__code__

    def run(*args):
        records = []

        def local(frame, event, arg):
            if event == "line" and frame.f_lineno == target:
                records.append(extract(frame.f_locals))
            return local

        def tracer(frame, event, arg):
            return local if frame.f_code is code else None

        sys.settrace(tracer)
        try:
            result = func(*args)
        finally:
            sys.settrace(None)
        return result, records

    return run


class CallLog:
    """Replaces a module global with a wrapper that logs every call (recursive calls included)."""

    def __init__(self, module, name, shape):
        self.module = module
        self.name = name
        self.original = getattr(module, name)
        self.shape = shape
        self.log = []

    def __enter__(self):
        original = self.original
        log = self.log
        shape = self.shape

        def wrapper(*args):
            slot = len(log)
            log.append(None)
            result = original(*args)
            log[slot] = shape(args, result)
            return result

        setattr(self.module, self.name, wrapper)
        return self

    def __exit__(self, *exc):
        setattr(self.module, self.name, self.original)
        return False


def egcd_shape(args, result):
    return [args[0], args[1], result[0], result[1], result[2]]


# ---------- Euclidean algorithm ----------

gcd_iterative_loop = line_recorder(euclid_module.gcd_iterative, "a, b = b, a % b", lambda v: [v["a"], v["b"]])


def euclid_case(a, b):
    with CallLog(euclid_module, "gcd", lambda args, r: [args[0], args[1], r]) as calls:
        g = euclid_module.gcd(a, b)
    it, loop = gcd_iterative_loop(a, b)
    with CallLog(euclid_module, "gcd", lambda args, r: [args[0], args[1], r]) as lcm_calls:
        lc = euclid_module.lcm(a, b)
    with CallLog(euclid_module, "_extended_gcd_nonneg", egcd_shape) as levels:
        ext = euclid_module.extended_gcd(a, b)
    return {
        "a": a,
        "b": b,
        "gcd": {"calls": calls.log, "result": g},
        "iter": {"loop": loop, "result": it},
        "lcm": {"calls": lcm_calls.log, "result": lc},
        "ext": {"levels": levels.log, "result": list(ext)},
    }


def euclid_cases(count):
    fixed = [
        (48, 18), (240, 46), (-240, 46), (240, -46), (-48, -18), (18, 48), (0, 5), (5, 0), (0, 0),
        (17, 13), (89, 55), (100, 25), (6765, 4181), (9999, 1), (1, 9999), (-7, 0), (0, -7),
        (9999, 9998), (-9999, -9999), (4, 6), (-4, 6), (1, 1),
    ]
    cases = [euclid_case(a, b) for a, b in fixed]
    while len(cases) < count:
        size = RNG.choice([20, 200, 9999])
        a = RNG.randint(-size, size) * RNG.choice([1, 1, RNG.randint(1, 9)])
        b = RNG.randint(-size, size) * RNG.choice([1, 1, RNG.randint(1, 9)])
        if abs(a) <= 9999 and abs(b) <= 9999:
            cases.append(euclid_case(a, b))
    return cases


# ---------- modular arithmetic ----------

mod_power_loop = line_recorder(ma_module.mod_power, "if exponent % 2 == 1:", lambda v: [v["result"], v["base"], v["exponent"]])


def mod_arith_step(op, m):
    kind = op[0]
    egcd = []
    loop = []
    with CallLog(ma_module, "_extended_gcd_nonneg", egcd_shape) as levels:
        if kind == "add":
            result = ma_module.mod_add(op[1], op[2], m)
        elif kind == "sub":
            result = ma_module.mod_subtract(op[1], op[2], m)
        elif kind == "mul":
            result = ma_module.mod_multiply(op[1], op[2], m)
        elif kind == "div":
            result = ma_module.mod_divide(op[1], op[2], m)
        elif kind == "inv":
            result = ma_module.mod_inverse(op[1], m)
        else:
            result, loop = mod_power_loop(op[1], op[2], m)
        egcd = levels.log
    return {"result": result, "egcd": egcd, "loop": loop}


def mod_arith_case(m, ops):
    return {"m": m, "ops": ops, "steps": [mod_arith_step(op, m) for op in ops]}


def mod_arith_cases(count):
    fixed = [
        (11, [["add", 7, 5], ["sub", 3, 5], ["mul", 7, 5], ["inv", 3], ["div", 7, 5], ["pow", 2, 5]]),
        (12, [["inv", 4], ["div", 4, 8], ["inv", 5], ["pow", 2, -1], ["pow", 5, -1], ["mul", 4, 3]]),
        (11, [["add", -3, 1], ["mul", -3, 4], ["pow", -2, 3], ["sub", -3, -5], ["inv", -3], ["div", 1, -3]]),
        (1, [["add", 5, 7], ["inv", 3], ["pow", 2, 10], ["div", 4, 2], ["pow", 0, -1]]),
        (7, [["pow", 3, 6], ["pow", 2, -3], ["inv", 0], ["div", 3, 0], ["pow", 0, 0], ["mul", 9999, -9999]]),
        (60, [["mul", 59, 59], ["inv", 7], ["inv", 6], ["pow", 59, 9999], ["pow", 7, -9999]]),
    ]
    cases = [mod_arith_case(m, ops) for m, ops in fixed]
    kinds = ["add", "sub", "mul", "div", "inv", "pow"]
    while len(cases) < count:
        m = RNG.choice([1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17, 24, 30, 37, 60])
        ops = []
        for _ in range(RNG.randint(1, 8)):
            kind = RNG.choice(kinds)
            v = lambda: RNG.choice([RNG.randint(-30, 30), RNG.randint(-9999, 9999), RNG.randint(0, m)])
            if kind == "inv":
                ops.append([kind, v()])
            elif kind == "pow":
                ops.append([kind, v(), RNG.choice([RNG.randint(-20, 40), RNG.randint(-9999, 9999)])])
            else:
                ops.append([kind, v(), v()])
        cases.append(mod_arith_case(m, ops))
    return cases


# ---------- modular exponentiation ----------

mod_pow_loop = line_recorder(me_module.mod_pow, "if exponent % 2 == 1:", lambda v: [v["result"], v["base"], v["exponent"]])


def mod_exp_case(base, exponent, modulus):
    with CallLog(me_module, "_extended_gcd_nonneg", egcd_shape) as levels:
        result, loop = mod_pow_loop(base, exponent, modulus)
    with CallLog(me_module, "mod_pow_recursive", lambda args, r: [args[0], args[1], args[2], r]) as calls:
        rec = me_module.mod_pow_recursive(base, exponent, modulus)
    return {"base": base, "exponent": exponent, "modulus": modulus, "result": result, "loop": loop, "egcd": levels.log, "recursive": {"calls": calls.log, "result": rec}}


def mod_exp_cases(count):
    fixed = [
        (5, 13, 11), (2, 10, 1000), (3, 5, 7), (2, 100, 1000), (0, 0, 7), (0, 5, 7), (5, 10, 1),
        (-2, 3, 5), (2, -1, 11), (2, -3, 11), (2, -1, 12), (3, 1000000, 10**18 + 3), (7, 0, 1),
        (10**18, 10**9, 10**18 - 1), (-(10**18), 999999999, 998244353), (2, 2**30 - 1, 1000000007),
        (6, 1, 9), (4, -2, 8), (1, -5, 1), (12345, 678, 1),
    ]
    cases = [mod_exp_case(*c) for c in fixed]
    while len(cases) < count:
        modulus = RNG.choice([RNG.randint(1, 20), RNG.randint(1, 10**9), RNG.randint(1, 10**18)])
        base = RNG.choice([RNG.randint(-50, 50), RNG.randint(-(10**18), 10**18)])
        exponent = RNG.choice([RNG.randint(-20, 64), RNG.randint(-(10**9), 10**9)])
        cases.append(mod_exp_case(base, exponent, modulus))
    return cases


# ---------- random draws above 32 bits ----------


def draws_cases():
    cases = []
    for seed in [0, 1, 7, 42, 2026, 4294967295]:
        r = random.Random(seed)
        bits = []
        for k in [33, 40, 48, 63, 64, 65, 80, 96, 1, 32]:
            bits.append([k, r.getrandbits(k)])
        ranges = []
        for stop in [5, 561, 2**32 + 1, 2**32 + 15, 3825123056546413051, 2**64 - 59, 10**24, 318665857834031151167461]:
            ranges.append([2, stop, r.randrange(2, stop)])
        cases.append({"seed": seed, "bits": bits, "ranges": ranges})
    return cases


# ---------- Miller-Rabin ----------


class LoggedRandom:
    """Stands in for the random module inside miller_rabin: random.Random(seed), every draw logged."""

    def __init__(self, seed, log):
        self.rng = random.Random(seed)
        self.log = log

    def randrange(self, start, stop):
        value = self.rng.randrange(start, stop)
        self.log.append(["draw", start, stop, value])
        return value


def logged_pow(log):
    def pow_(base, exponent, modulus):
        value = pow(base, exponent, modulus)
        log.append(["pow", base, exponent, modulus, value])
        return value

    return pow_


def mr_random_case(numbers, k, seed):
    log = []
    saved = mr_module.random
    mr_module.random = LoggedRandom(seed, log)
    mr_module.pow = logged_pow(log)
    try:
        steps = []
        for n in numbers:
            start = len(log)
            result = mr_module.miller_rabin(n, k)
            steps.append({"n": n, "result": result, "events": log[start:]})
    finally:
        mr_module.random = saved
        del mr_module.pow
    return {"numbers": numbers, "k": k, "seed": seed, "steps": steps}


def mr_deterministic_case(numbers):
    log = []
    mr_module.pow = logged_pow(log)
    try:
        steps = []
        for n in numbers:
            start = len(log)
            result = mr_module.miller_rabin_deterministic(n)
            steps.append({"n": n, "result": result, "events": log[start:]})
    finally:
        del mr_module.pow
    return {"numbers": numbers, "steps": steps}


MR_FIXED = [
    [561, 97, 2047],
    [0, 1, 2, 3, 4, 5],
    [1105, 1729, 2465, 2821, 6601],
    [3215031751, 4294967291, 4294967297],
    [3825123056546413051, 2**61 - 1, 2**64 - 59],
    [318665857834031151167461, 318665857834031151167463],
    [-7, 9, 25, 49, 65537],
    [7, 11, 13, 37, 41],
]


def mr_cases(count):
    random_cases = [mr_random_case(nums, k, seed) for nums, (k, seed) in zip(MR_FIXED, [(5, 1), (5, 2), (10, 3), (5, 4), (3, 5), (2, 6), (5, 7), (4, 8)])]
    det_cases = [mr_deterministic_case(nums) for nums in MR_FIXED]
    while len(random_cases) < count:
        numbers = [RNG.choice([RNG.randint(-5, 100), RNG.randint(100, 10**6) | 1, RNG.randint(10**9, 10**12) | 1, RNG.randint(10**18, 10**24) | 1]) for _ in range(RNG.randint(1, 4))]
        random_cases.append(mr_random_case(numbers, RNG.randint(1, 8), RNG.randint(0, 10**6)))
        det_cases.append(mr_deterministic_case(numbers))
    return random_cases, det_cases


# ---------- Chinese remainder theorem ----------


def crt_case(remainders, moduli):
    with CallLog(crt_module, "_merge", lambda args, r: list(args) + [list(r) if r else None]) as merges:
        with CallLog(crt_module, "extended_gcd", lambda args, r: [args[0], args[1], r[0], r[1], r[2]]) as egcds:
            result = crt_module.chinese_remainder_theorem(remainders, moduli)
    return {"remainders": remainders, "moduli": moduli, "result": result, "merges": merges.log, "egcd": egcds.log}


def crt_cases(count):
    fixed = [
        ([2, 3, 2], [3, 5, 7]),
        ([1, 2], [3, 5]),
        ([1, 3], [4, 6]),
        ([1, 2], [4, 6]),
        ([5, 3, 8], [6, 10, 15]),
        ([-1, 2], [3, 5]),
        ([8], [3]),
        ([], []),
        ([1, 2], [3]),
        ([1, 2], [3, 0]),
        ([1, 2], [-3, 5]),
        ([10**9 + 6, 998244352], [10**9 + 7, 998244353]),
        ([0, 0, 0], [1, 1, 1]),
        ([3, 4, 5, 6], [5, 7, 11, 13]),
        ([2, 2, 2, 2, 2, 2], [3, 4, 5, 6, 7, 8]),
        ([7, 7], [12, 18]),
        ([7, 8], [12, 18]),
    ]
    cases = [crt_case(r, m) for r, m in fixed]
    while len(cases) < count:
        size = RNG.choice([12, 30, 10**9])
        moduli = [RNG.randint(1, size) for _ in range(RNG.randint(1, 5))]
        if RNG.random() < 0.08:
            moduli[RNG.randrange(len(moduli))] = RNG.randint(-3, 0)
        remainders = [RNG.randint(-size, size) for _ in moduli]
        if RNG.random() < 0.05:
            remainders.append(RNG.randint(0, 9))
        cases.append(crt_case(remainders, moduli))
    return cases


# ---------- sieve ----------

sieve_outer = line_recorder(sieve_module.sieve_boolean, "if is_prime[i]:", lambda v: [v["i"], v["is_prime"][v["i"]]])
sieve_writes = line_recorder(sieve_module.sieve_boolean, "is_prime[j] = False", lambda v: [v["i"], v["j"]])


def sieve_case(n, queries):
    flags, outer = sieve_outer(n)
    _, writes = sieve_writes(n)
    primes = sieve_module.sieve_of_eratosthenes(n)
    answers = [[q, sieve_module.is_prime_sieve(q, flags)] for q in queries]
    return {"n": n, "outer": outer, "writes": writes, "primes": primes, "flags": "".join("1" if f else "0" for f in flags), "queries": answers}


def sieve_cases(count):
    fixed = [(50, [17, 49, -1, 51]), (30, [29, 0, 1]), (100, [97, 91, 100, 101, -101]), (2, [2, 3]), (1, [1, 0, -1]), (0, [0]), (-5, [0, -1, 5]), (300, [293, 289, 299, 300]), (4, [4, 3]), (3, [3])]
    cases = [sieve_case(n, q) for n, q in fixed]
    while len(cases) < count:
        n = RNG.choice([RNG.randint(-3, 20), RNG.randint(20, 300)])
        queries = [RNG.randint(-n - 2 if n > 0 else -5, max(n, 0) + 3) for _ in range(RNG.randint(0, 4))]
        cases.append(sieve_case(n, queries))
    return cases


# ---------- Euler's totient ----------

TOTIENT_RNG = random.Random(20261124)


def totient_sieve_case(n):
    log = []
    real = totient_module._cross_out

    def recorded(phi_table, spf, i, p):
        real(phi_table, spf, i, p)
        log.append([i, p, phi_table[i * p]])

    totient_module._cross_out = recorded
    try:
        t = totient_module.linear_sieve(n)
    finally:
        totient_module._cross_out = real
    return {"n": n, "crossings": log, "phi": t.phi, "spf": t.spf, "primes": t.primes, "count": t.crossings}


def totient_sieve_cases(count):
    fixed = [0, 1, 2, 3, 4, 5, 10, 20, 30, 50, 64, 100]
    cases = [totient_sieve_case(n) for n in fixed]
    while len(cases) < count:
        cases.append(totient_sieve_case(TOTIENT_RNG.randint(0, 100)))
    return cases


def totient_factor_case(n, inverses):
    tried = []
    real = totient_module._divide_out

    def recorded(m, p):
        left, k = real(m, p)
        tried.append([p, k])
        return left, k

    def inverse(a):
        try:
            return totient_module.mod_inverse_euler(a, n)
        except ValueError:
            return "ValueError"

    totient_module._divide_out = recorded
    try:
        factors = [list(f) for f in totient_module.prime_factors(n)]
    except ValueError:
        factors = "ValueError"
    finally:
        totient_module._divide_out = real
    try:
        value = totient_module.phi(n)
    except ValueError:
        value = "ValueError"
    answers = [[a, inverse(a)] for a in inverses]
    return {"n": n, "tried": tried, "factors": factors, "phi": value, "inverses": answers}


def totient_factor_cases(count):
    fixed = [
        (360, [7, 6, -7]), (1, [0, 5]), (2, [1]), (97, [3, 96]), (1001, [10, 7]), (1024, [3, 2]), (65536, [3]),
        (99991, [12345]), (30030, [17, 13]), (99999, [2, 3]), (0, [3]), (-5, []), (12, [5, 4, 11, -1]), (49, [7, 48]),
    ]
    cases = [totient_factor_case(n, a) for n, a in fixed]
    while len(cases) < count:
        n = TOTIENT_RNG.choice([TOTIENT_RNG.randint(1, 100), TOTIENT_RNG.randint(1, 99999)])
        inverses = [TOTIENT_RNG.randint(-n, 2 * n) for _ in range(TOTIENT_RNG.randint(0, 3))]
        cases.append(totient_factor_case(n, inverses))
    return cases


def main():
    mr_random, mr_det = mr_cases(30)
    sections = {
        "euclid": euclid_cases(80),
        "modArith": mod_arith_cases(50),
        "modExp": mod_exp_cases(60),
        "draws": draws_cases(),
        "millerRabin": mr_random,
        "millerRabinDeterministic": mr_det,
        "crt": crt_cases(80),
        "sieve": sieve_cases(40),
        "totientSieve": totient_sieve_cases(30),
        "totientFactor": totient_factor_cases(50),
    }
    header = {
        "generator": "web/scripts/gen_numberTheory_fixtures.py",
        "reference": "Algorithms/Mathematical_Algorithms/Number_Theory (euclidean_algorithm.py, modular_arithmetic.py, modular_exponentiation.py, miller_rabin.py, chinese_remainder_theorem.py, sieve_of_eratosthenes.py, eulers_totient.py)",
    }
    parts = []
    for key, cases in sections.items():
        lines = [json.dumps(enc(c), separators=(",", ":")) for c in cases]
        parts.append(json.dumps(key) + ": [\n" + ",\n".join(lines) + "\n]")
    body = json.dumps(header)[:-1] + ",\n" + ",\n".join(parts) + "\n}\n"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(body, encoding="ascii")
    counts = ", ".join(f"{len(c)} {k}" for k, c in sections.items())
    print(f"wrote {counts} cases to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
