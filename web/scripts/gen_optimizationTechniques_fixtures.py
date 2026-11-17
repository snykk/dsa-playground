"""Generate golden fixtures for the optimization-technique visualizations.

The web visualizer re-implements four topics of Utilities/Optimization_Techniques in
TypeScript (web/src/viz/algorithms/): precomputation.ts (Factorials, compute_spf and
factorize, PrefixSum2D, LCA), bitmasking.ts (enumerate_subsets, subsets_of_size_k, sos_dp),
fastIo.ts (fast_int / fast_ints / fast_print with solve(), BufferedInput and BufferedOutput,
demo_all_at_once with AllInputReader) and modularTricks.ts (lucas_nCr with Factorials(p - 1, p)).
These fixtures pin each port to the repository's Python code. Local variables are read with
sys.settrace, and the I/O functions run on counting replacements of sys.stdin and sys.stdout,
so no topic file is changed:

- factorials / modularFactorials: fact and inv_fact of both Factorials classes, the number of
  loop steps and multiplications of the one power() call, and every nCr / nPr answer or error;
- spf: the spf list, every outer i (prime or skipped) and every inner j (marked or kept) in
  loop order, and every factorize answer or error;
- prefix2d: the whole prefix table and every rect_sum answer or error;
- lca: every (u, p, d) the DFS pops, depth, the parent table, and for every query each test of
  the lifting loop and of the descending loop with u and v, then the answer or error;
- submasks: every submask in yield order; ksubsets: every mask of Gosper's loop with its c and
  r, the last one (which fails the loop test) included;
- sos: every addition (bit, mask, both operands) in loop order and the final dp;
- fastio: for each of the three programs, every call into sys.stdin and sys.stdout with the
  text it returned or wrote, every value the program read, and the exception that stopped it;
- lucas: the Factorials(p - 1, p) table, every call and return of _lucas, every small binomial
  read from the table, and the answer or the ValueError.

Run from anywhere:

    python3 web/scripts/gen_optimizationTechniques_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/optimizationTechniques.json. CI regenerates
the file and fails if it changed, which means the two implementations drifted.
"""

import importlib.util
import inspect
import io
import json
import random
import sys
from pathlib import Path

sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parents[2]
OPT = ROOT / "Utilities" / "Optimization_Techniques"
OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "optimizationTechniques.json"


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


precomputation = load("precomputation", OPT / "Precomputation" / "Python" / "precomputation.py")
bitmasking = load("bitmasking", OPT / "Bitmasking" / "Python" / "bitmasking.py")
fast_io = load("fast_io", OPT / "Fast_IO" / "Python" / "fast_io.py")
modular_tricks = load("modular_tricks", OPT / "Modular_Arithmetic_Tricks" / "Python" / "modular_tricks.py")


# ---------- sys.settrace helpers ----------


def line_of(fn, text):
    """The absolute line number of the first source line of fn that contains `text`."""
    lines, start = inspect.getsourcelines(fn)
    for k, line in enumerate(lines):
        if text in line:
            return start + k
    raise LookupError(text)


def trace_lines(codes, on_line, fn, *args):
    """Call fn(*args) and report every line event (frame, lineno) inside the given code objects."""
    codes = set(codes)

    def local(frame, event, arg):
        if event == "line":
            on_line(frame, frame.f_lineno)
        return local

    def tracer(frame, event, arg):
        return local if frame.f_code in codes else None

    sys.settrace(tracer)
    try:
        return fn(*args)
    finally:
        sys.settrace(None)


def error_of(exc):
    return [type(exc).__name__, str(exc)]


# ---------- Factorials (both classes) ----------


def power_steps(module, base, exp, mod):
    """Run module.power and count its loop steps and multiplications into the result."""
    loop = line_of(module.power, "while exp > 0")
    mult = line_of(module.power, "result = result * base")
    counts = {"steps": 0, "mults": 0}

    def on_line(frame, lineno):
        if lineno == loop and frame.f_locals["exp"] > 0:
            counts["steps"] += 1
        elif lineno == mult:
            counts["mults"] += 1

    value = trace_lines([module.power.__code__], on_line, module.power, base, exp, mod)
    return value, counts["steps"], counts["mults"]


def factorial_case(module, n, mod, queries):
    try:
        f = module.Factorials(n, mod)
    except Exception as exc:  # Factorials(-1) reads fact[-1] of an empty list
        return {"n": n, "mod": mod, "queries": queries, "error": error_of(exc)}
    value, steps, mults = power_steps(module, f.fact[n], mod - 2, mod)
    assert value == f.inv_fact[n]
    answers = []
    for kind, a, b in queries:
        try:
            answers.append(f.nCr(a, b) if kind == "nCr" else f.nPr(a, b))
        except Exception as exc:
            answers.append(error_of(exc))
    return {
        "n": n,
        "mod": mod,
        "queries": queries,
        "fact": f.fact,
        "invFact": f.inv_fact,
        "power": [value, steps, mults],
        "answers": answers,
    }


FACTORIAL_FIXED = [
    (10, 10**9 + 7, [["nCr", 10, 3], ["nPr", 10, 3], ["nCr", 5, 7], ["nCr", 5, -1], ["nCr", 12, 2], ["nCr", 0, 0]]),
    (12, 10**9 + 7, [["nCr", 12, 6], ["nPr", 12, 12], ["nCr", 11, 4]]),
    (7, 5, [["nCr", 4, 2], ["nCr", 7, 3], ["nPr", 3, 1]]),
    (6, 7, [["nCr", 6, 3], ["nCr", 4, 2], ["nPr", 6, 2]]),
    (6, 13, [["nCr", 6, 2], ["nPr", 5, 5]]),
    (0, 10**9 + 7, [["nCr", 0, 0], ["nCr", 1, 0]]),
    (5, 12, [["nCr", 5, 2], ["nCr", 4, 1]]),
    (4, 2, [["nCr", 4, 2], ["nCr", 1, 1]]),
    (-1, 10**9 + 7, []),
    (9, 998244353, [["nCr", 9, 4], ["nPr", 9, 0]]),
    (12, 2147483647, [["nCr", 12, 5]]),
]


def factorial_cases(module, rng, count):
    cases = [factorial_case(module, n, mod, q) for n, mod, q in FACTORIAL_FIXED]
    mods = [10**9 + 7, 998244353, 13, 11, 7, 5, 3, 2, 17, 19, 23, 10, 9, 101, 2147483647]
    while len(cases) < count:
        n = rng.randint(0, 12)
        mod = rng.choice(mods)
        queries = []
        for _ in range(rng.randint(0, 6)):
            queries.append([rng.choice(["nCr", "nCr", "nPr"]), rng.randint(-1, 14), rng.randint(-2, 14)])
        cases.append(factorial_case(module, n, mod, queries))
    return cases


# ---------- smallest prime factors ----------


def spf_case(n, queries):
    fn = precomputation.compute_spf
    outer = line_of(fn, "if spf[i] == i")
    inner = line_of(fn, "if spf[j] == j")
    events = []

    def on_line(frame, lineno):
        loc = frame.f_locals
        if lineno == outer:
            events.append(["i", loc["i"], loc["spf"][loc["i"]] == loc["i"]])
        elif lineno == inner:
            events.append(["j", loc["i"], loc["j"], loc["spf"][loc["j"]] == loc["j"]])

    spf = trace_lines([fn.__code__], on_line, fn, n)
    answers = []
    for x in queries:
        try:
            answers.append([[p, c] for p, c in precomputation.factorize(x, spf)])
        except Exception as exc:
            answers.append(error_of(exc))
    return {"n": n, "queries": queries, "spf": spf, "events": events, "answers": answers}


def spf_cases(rng, count):
    fixed = [
        (60, [60, 45, 97, 1, 0]),
        (30, [12, 29, 16, 30]),
        (99, [84, 97, 64, 99, 1]),
        (1, [1, 0]),
        (0, [0]),
        (2, [2, 3]),
        (49, [49, 48, 50]),
        (25, [-4, 24]),
    ]
    cases = [spf_case(n, q) for n, q in fixed]
    while len(cases) < count:
        n = rng.randint(0, 99)
        queries = [rng.randint(-2, n + 3) for _ in range(rng.randint(0, 6))]
        cases.append(spf_case(n, queries))
    return cases


# ---------- 2D prefix sums ----------


def prefix2d_case(grid, queries):
    ps = precomputation.PrefixSum2D(grid)
    answers = []
    for q in queries:
        try:
            answers.append(ps.rect_sum(*q))
        except Exception as exc:
            answers.append(error_of(exc))
    return {"grid": grid, "queries": queries, "prefix": ps.prefix, "answers": answers}


def prefix2d_cases(rng, count):
    fixed = [
        ([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 1, 2, 2], [0, 0, 2, 2], [0, 1, 1, 2], [2, 0, 2, 0]]),
        ([[3, 0, 1, 4, 2], [5, 6, 3, 2, 1], [1, 2, 0, 1, 5], [4, 1, 0, 1, 7]], [[1, 1, 2, 3], [0, 0, 3, 4], [3, 4, 3, 4]]),
        ([[5]], [[0, 0, 0, 0], [0, 0, 1, 1]]),
        ([[-2, 4], [7, -5], [0, 3]], [[0, 0, 2, 1], [1, 0, 2, 1], [0, 1, 3, 1]]),
        ([[1, 1, 1, 1, 1, 1]], [[0, 2, 0, 4], [0, 0, 0, 6]]),
    ]
    cases = [prefix2d_case(g, q) for g, q in fixed]
    while len(cases) < count:
        n, m = rng.randint(1, 6), rng.randint(1, 6)
        grid = [[rng.randint(-20, 30) for _ in range(m)] for _ in range(n)]
        queries = []
        for _ in range(rng.randint(0, 6)):
            r1, r2 = sorted([rng.randint(0, n), rng.randint(0, n)])
            c1, c2 = sorted([rng.randint(0, m), rng.randint(0, m)])
            queries.append([r1, c1, r2, c2])
        cases.append(prefix2d_case(grid, queries))
    return cases


# ---------- LCA with binary lifting ----------


def lca_case(n, edges, root, queries):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    init = precomputation.LCA.__init__
    pop_line = line_of(init, "if visited[u]:")
    pops = []

    def on_init(frame, lineno):
        if lineno == pop_line:
            loc = frame.f_locals
            pops.append([loc["u"], loc["p"], loc["d"]])

    lca = precomputation.LCA.__new__(precomputation.LCA)
    trace_lines([init.__code__], on_init, init, lca, n, adj, root)
    query = precomputation.LCA.query
    lift_line = line_of(query, "if (diff >> i) & 1:")
    down_line = line_of(query, "if self.parent[u][i] != self.parent[v][i]:")
    answers = []
    for u, v in queries:
        steps = []

        def on_query(frame, lineno):
            loc = frame.f_locals
            if lineno == lift_line:
                steps.append(["lift", loc["i"], loc["u"]])
            elif lineno == down_line:
                steps.append(["down", loc["i"], loc["u"], loc["v"]])

        try:
            answers.append([trace_lines([query.__code__], on_query, query, lca, u, v), steps])
        except Exception as exc:
            answers.append([error_of(exc), steps])
    return {"n": n, "edges": edges, "root": root, "queries": queries, "log": lca.LOG, "pops": pops, "depth": lca.depth, "parent": lca.parent, "answers": answers}


def random_tree(rng, n):
    edges = []
    for v in range(1, n):
        edges.append([rng.randint(0, v - 1), v])
    rng.shuffle(edges)
    labels = list(range(n))
    rng.shuffle(labels)
    return [[labels[a], labels[b]] if rng.random() < 0.5 else [labels[b], labels[a]] for a, b in edges]


def lca_cases(rng, count):
    fixed = [
        (6, [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5]], 0, [[3, 4], [3, 5], [1, 3], [4, 4], [5, 0]]),
        (12, [[i, i + 1] for i in range(11)], 0, [[10, 4], [11, 0], [7, 7]]),
        (1, [], 0, [[0, 0]]),
        (9, [[0, 1], [0, 2], [1, 3], [1, 4], [3, 5], [3, 6], [2, 7], [7, 8]], 0, [[5, 6], [6, 4], [8, 5], [9, 1]]),
        (8, [[4, 0], [4, 7], [0, 1], [7, 2], [2, 3], [3, 5], [3, 6]], 4, [[1, 6], [5, 6], [2, 4]]),
        (2, [[0, 1]], 1, [[0, 1], [1, 1]]),
    ]
    cases = [lca_case(*c) for c in fixed]
    while len(cases) < count:
        n = rng.randint(1, 12)
        edges = random_tree(rng, n)
        root = rng.randint(0, n - 1)
        queries = [[rng.randint(0, n - 1), rng.randint(0, n - 1)] for _ in range(rng.randint(0, 6))]
        cases.append(lca_case(n, edges, root, queries))
    return cases


# ---------- bitmasking ----------


def submask_cases():
    masks = [0b1011, 0, 1, 0b111, 0b101, 0b10110, 0b11111111, 0b10000000, 0b1010101, 0b110011, 0b1111, 0b100100]
    return [{"mask": m, "subs": list(bitmasking.enumerate_subsets(m))} for m in masks]


def ksubset_case(n, k):
    fn = bitmasking.subsets_of_size_k
    loop = line_of(fn, "while mask < (1 << n)")
    steps = []

    def on_line(frame, lineno):
        if lineno == loop:
            loc = frame.f_locals
            steps.append([loc["mask"], loc.get("c"), loc.get("r")])

    out = []

    def collect():
        for m in fn(n, k):
            out.append(m)

    trace_lines([fn.__code__], on_line, collect)
    return {"n": n, "k": k, "masks": out, "steps": steps}


def ksubset_cases():
    pairs = [(4, 2), (5, 3), (3, 3), (2, 3), (4, 0), (0, 0), (1, 1), (6, 1), (6, 5), (8, 4), (5, 2), (7, 3), (3, 1), (8, 8), (8, 0)]
    return [ksubset_case(n, k) for n, k in pairs]


def sos_case(a):
    fn = bitmasking.sos_dp
    add = line_of(fn, "dp[mask] += dp[mask ^ (1 << i)]")
    adds = []

    def on_line(frame, lineno):
        if lineno == add:
            loc = frame.f_locals
            i, mask, dp = loc["i"], loc["mask"], loc["dp"]
            adds.append([i, mask, dp[mask], dp[mask ^ (1 << i)]])

    result = trace_lines([fn.__code__], on_line, fn, list(a))
    return {"a": a, "adds": adds, "dp": result}


def sos_cases(rng, count):
    fixed = [[1, 2, 3, 4], [1, 2, 3, 4, 5, 6], [], [7], [3, -1], [1] * 8, [5, 0, -2, 7, 1, 1, 3], list(range(16)), [2, 9, -4, 0, 6]]
    cases = [sos_case(a) for a in fixed]
    while len(cases) < count:
        cases.append(sos_case([rng.randint(-9, 20) for _ in range(rng.randint(0, 16))]))
    return cases


# ---------- fast I/O ----------


class CountingStdin(io.StringIO):
    """sys.stdin replacement: records every readline() and read() call and what it returned."""

    def __init__(self, text, calls):
        super().__init__(text)
        self.calls = calls

    def readline(self, *args):
        line = super().readline(*args)
        self.calls.append(["readline", line])
        return line

    def read(self, *args):
        data = super().read(*args)
        self.calls.append(["read", data])
        return data


class CountingStdout(io.StringIO):
    """sys.stdout replacement: records the text of every write() call."""

    def __init__(self, writes):
        super().__init__()
        self.writes = writes

    def write(self, text):
        self.writes.append(text)
        return super().write(text)


def run_program(text, program):
    calls, writes, reads = [], [], []
    old_in, old_out = sys.stdin, sys.stdout
    saved = {name: getattr(fast_io, name) for name in ("fast_int", "fast_ints", "AllInputReader")}

    def recorded(name, fn):
        def wrapper(*args):
            value = fn(*args)
            reads.append([name, value])
            return value

        return wrapper

    class RecordingAllInputReader(saved["AllInputReader"]):
        def next(self):
            value = super().next()
            reads.append(["next", value])
            return value

        def next_n(self, n):
            value = super().next_n(n)
            reads.append(["next_n", value])
            return value

    tokens = None
    error = None
    sys.stdin, sys.stdout = CountingStdin(text, calls), CountingStdout(writes)
    try:
        if program == "lines":
            # main() with its multi-test lines: t = fast_int(); for _ in range(t): solve()
            fast_io.fast_int = recorded("fast_int", saved["fast_int"])
            fast_io.fast_ints = recorded("fast_ints", saved["fast_ints"])
            t = fast_io.fast_int()
            for _ in range(t):
                fast_io.solve()
        elif program == "buffered":
            # demo_buffered_io(), one test case per round: BufferedInput and BufferedOutput
            reader = fast_io.BufferedInput()
            tokens = list(reader.buffer)
            writer = fast_io.BufferedOutput()
            t = reader.next_int()
            reads.append(["next_int", t])
            for _ in range(t):
                n = reader.next_int()
                reads.append(["next_int", n])
                a = reader.next_ints(n)
                reads.append(["next_ints", a])
                writer.write(sum(a))
            writer.flush()
        else:
            fast_io.AllInputReader = RecordingAllInputReader
            fast_io.demo_all_at_once()
    except Exception as exc:
        error = error_of(exc)
    finally:
        sys.stdin, sys.stdout = old_in, old_out
        for name, fn in saved.items():
            setattr(fast_io, name, fn)
    out = {"calls": calls, "reads": reads, "writes": writes, "error": error}
    if tokens is not None:
        out["tokens"] = tokens
    return out


FASTIO_FIXED = [
    "2\n3\n1 2 3\n2\n10 20\n",
    "",
    "1\n4\n1 2\n3 4\n",
    "2 3\n1 2 3\n",
    "3\n1\n5\n",
    "1\n5\n1 2\n",
    "5\n1\n7\n2\n1 2\n1\n4\n3\n1 1 1\n1\n9\n",
    "1\n\n2\n3 4\n",
    "1\n2\n4 x\n",
    "2\n0\n\n1\n-7\n",
    "1\n3\n10 20 30 40\n",
    "0\n",
    " 1 \n 2 \n 5   6 \n",
    "1\n2\n+5 007\n",
    "2\n-1\n5\n3\n",
    "3\n-4\n",
    "1\n1\n7\n1\n2\n",
]


def fastio_cases(rng, count):
    texts = list(FASTIO_FIXED)
    while len(texts) < count:
        t = rng.randint(0, 4)
        lines = [str(t)]
        for _ in range(t + rng.choice([0, 0, 0, -1, 1])):
            n = rng.randint(0, 4)
            values = [str(rng.randint(-99, 999)) for _ in range(n + rng.choice([0, 0, 0, -1, 1]))]
            lines.append(str(n))
            if rng.random() < 0.15 and len(values) > 1:
                lines.append(" ".join(values[:1]))
                lines.append(" ".join(values[1:]))
            else:
                lines.append(" ".join(values))
        texts.append("".join(line + "\n" for line in lines))
    return [{"stdin": text, "lines": run_program(text, "lines"), "buffered": run_program(text, "buffered"), "all": run_program(text, "all")} for text in texts]


# ---------- Lucas ----------


def lucas_case(n, r, p, table=None):
    mt = modular_tricks
    try:
        f = mt.Factorials(p - 1, p) if table is None else mt.Factorials(*table)
    except Exception as exc:
        return {"n": str(n), "r": str(r), "p": p, "table": table, "error": error_of(exc)}
    events = []

    def local(frame, event, arg):
        if event == "return":
            loc = frame.f_locals
            if frame.f_code is mt._lucas.__code__:
                events.append(["ret", str(loc["n"]), str(loc["r"]), arg])
            else:
                events.append(["ncr", loc["n"], loc["r"], arg])
        return local

    def tracer(frame, event, arg):
        code = frame.f_code
        if code is mt._lucas.__code__:
            events.append(["call", str(frame.f_locals["n"]), str(frame.f_locals["r"])])
            return local
        if code is mt.Factorials.nCr.__code__:
            return local
        return None

    sys.settrace(tracer)
    try:
        result, error = mt.lucas_nCr(n, r, p, f), None
    except Exception as exc:
        result, error = None, error_of(exc)
    finally:
        sys.settrace(None)
    case = {"n": str(n), "r": str(r), "p": p, "table": table, "result": result, "events": events, "error": error}
    if table is None:
        case["fact"] = f.fact
        case["invFact"] = f.inv_fact
    return case


PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]


def lucas_cases(rng, count):
    fixed = [
        (100, 37, 37, None),
        (36, 18, 37, None),
        (1000, 500, 13, None),
        (10**18, 5, 13, None),
        (5, 9, 7, None),
        (12345, 0, 37, None),
        (6, 3, 2, None),
        (1000000, 999, 31, None),
        (36, 18, 37, [36]),
        (36, 18, 37, [10, 37]),
        (36, 18, 37, [40, 37]),
        (-3, 2, 7, None),
        (7, -1, 7, None),
        (999999999999999999, 123456789012345678, 37, None),
        (49, 7, 7, None),
        (48, 7, 7, None),
    ]
    cases = [lucas_case(*c) for c in fixed]
    while len(cases) < count:
        p = rng.choice(PRIMES)
        digits = rng.randint(1, 10)
        n = rng.randint(0, min(p**digits - 1, 10**18))
        r = rng.randint(0, n) if rng.random() < 0.85 else rng.randint(-2, n + 5)
        cases.append(lucas_case(n, r, p))
    return cases


def main():
    rng = random.Random(20261116)
    sections = {
        "factorials": factorial_cases(precomputation, random.Random(1), 40),
        "modularFactorials": factorial_cases(modular_tricks, random.Random(1), 40),
        "spf": spf_cases(rng, 40),
        "prefix2d": prefix2d_cases(rng, 40),
        "lca": lca_cases(random.Random(5), 40),
        "submasks": submask_cases(),
        "ksubsets": ksubset_cases(),
        "sos": sos_cases(rng, 40),
        "fastio": fastio_cases(rng, 40),
        "lucas": lucas_cases(rng, 60),
    }
    header = {
        "generator": "web/scripts/gen_optimizationTechniques_fixtures.py",
        "reference": "Utilities/Optimization_Techniques (precomputation.py, bitmasking.py, fast_io.py, modular_tricks.py)",
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
