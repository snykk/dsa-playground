"""Generate golden fixtures for the complexity-analysis visualizations.

The web visualizer ports the example functions of Complexity_Analysis to TypeScript
(web/src/viz/algorithms/): bigONotation.ts, bigOmega.ts and bigTheta.ts count the basic
operation of every example for each n of a growth chart, spaceComplexity.ts follows the call
stack and the lists of space_complexity.py, and amortizedAnalysis.ts replays DynamicArray,
BinaryCounter and the three demos of amortized_analysis.py. These fixtures pin each port to
the Python code. The topic code is never edited: the generator counts by tracing and wrapping.

- bigO / bigOmega / bigTheta: for every example (and case) and every n the chart allows, the
  count of the basic operation and the return value. Lines such as `count += 1` are counted
  with sys.settrace (an extend counts the elements it copies); comparisons are counted by
  elements whose __eq__ / __lt__ / __gt__ count themselves; calls of a recursive function by
  wrapping its module-level name, which the recursion goes through.
- space: every call (its argument, or len of a list argument, and its depth), the frames and
  the list cells alive at every return, the peaks and the result. Cells are counted by walking
  the locals of the live frames of the example: every list they reach once (nested lists too),
  except the input list.
- dynamicArray: size, capacity, copies and data after every append, with the actual cost and
  bank of accounting_method_example and the potential and amortized cost of
  potential_method_example, both replayed on the real class; demos: what the four demo
  functions print; counter: bits, flips and value after every increment.

Run from anywhere:

    python3 web/scripts/gen_complexity_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/complexity.json. CI regenerates the file and
fails if it changed, which means the two implementations drifted.
"""

import contextlib
import inspect
import io
import json
import random
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CA = ROOT / "Complexity_Analysis"
for folder in (
    "Time_Complexity/Big_O_Notation",
    "Time_Complexity/Big_Omega",
    "Time_Complexity/Big_Theta",
    "Space_Complexity",
    "Amortized_Analysis",
):
    sys.path.insert(0, str(CA / folder / "Python"))

import amortized_analysis as am  # noqa: E402
import big_o_notation as bo  # noqa: E402
import big_omega as bm  # noqa: E402
import big_theta as bt  # noqa: E402
import space_complexity as sc  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "complexity.json"
RNG = random.Random(20261116)

# The largest n each growth chart allows (bigONotation.ts, bigOmega.ts, bigTheta.ts).
MAX_N = 40
MAX_FIB_CALLS_N = 25
MAX_PERM_N = 8


# ---------- counting helpers ----------


def line_numbers(fn, needles):
    """The line of fn whose text contains each needle (each must match exactly one line)."""
    lines, start = inspect.getsourcelines(fn)
    out = []
    for needle in needles:
        hits = [start + k for k, text in enumerate(lines) if needle in text]
        if len(hits) != 1:
            raise LookupError(f"{fn.__name__}: {needle!r} matches lines {hits}")
        out.append(hits[0])
    return out


def count_lines(fn, args, rules):
    """Call fn(*args) and add up the line events of the given lines: rules = [(needle, weight)],
    where weight(locals) is what one execution counts (None counts 1). Recursive calls go
    through the same code object, so they are counted too."""
    code = fn.__code__
    weights = dict(zip(line_numbers(fn, [r[0] for r in rules]), [r[1] for r in rules]))
    total = [0]

    def local(frame, event, arg):
        if event == "line" and frame.f_lineno in weights:
            weight = weights[frame.f_lineno]
            total[0] += 1 if weight is None else weight(frame.f_locals)
        return local

    def tracer(frame, event, arg):
        return local if frame.f_code is code else None

    sys.settrace(tracer)
    try:
        result = fn(*args)
    finally:
        sys.settrace(None)
    return result, total[0]


class Key:
    """An element that counts every comparison it takes part in."""

    count = 0
    __hash__ = None

    def __init__(self, value):
        self.value = value

    @staticmethod
    def raw(other):
        return other.value if isinstance(other, Key) else other

    def __eq__(self, other):
        Key.count += 1
        return self.value == Key.raw(other)

    def __lt__(self, other):
        Key.count += 1
        return self.value < Key.raw(other)

    def __gt__(self, other):
        Key.count += 1
        return self.value > Key.raw(other)


def count_compares(fn, args):
    Key.count = 0
    result = fn(*args)
    return result, Key.count


def keys(values):
    return [Key(v) for v in values]


def raw_list(values):
    return [v.value if isinstance(v, Key) else v for v in values]


def count_calls(module, name, args):
    """Count the calls of a recursive function by wrapping its module-level name."""
    original = getattr(module, name)
    calls = [0]

    def wrapper(*a):
        calls[0] += 1
        return original(*a)

    setattr(module, name, wrapper)
    try:
        result = wrapper(*args)
    finally:
        setattr(module, name, original)
    return result, calls[0]


MERGE_WRITES = [
    ("result.append(left[i])", None),
    ("result.append(right[j])", None),
    ("result.extend(left[i:])", lambda loc: len(loc["left"]) - loc["i"]),
    ("result.extend(right[j:])", lambda loc: len(loc["right"]) - loc["j"]),
]


# ---------- growth charts ----------


def big_o_run(name, case, n):
    if name == "constant_time_example":
        return count_lines(bo.constant_time_example, (n,), [("return 42", None)])
    if name == "logarithmic_time_example":
        return count_lines(bo.logarithmic_time_example, (n,), [("i = i // 2", None)])
    if name == "linear_time_example":
        return count_lines(bo.linear_time_example, (list(range(n)),), [("total += element", None)])
    if name == "linearithmic_time_example":
        return count_lines(bo.linearithmic_time_example, (list(range(n, 0, -1)),), MERGE_WRITES)
    if name == "quadratic_time_example":
        pairs, ops = count_lines(bo.quadratic_time_example, (list(range(n)),), [("pairs.append", None)])
        return len(pairs), ops
    if name == "cubic_time_example":
        return count_lines(bo.cubic_time_example, (n,), [("count += 1", None)])
    if name == "exponential_time_example":
        return count_calls(bo, "exponential_time_example", (n,))
    if name == "factorial_time_example":
        perms, ops = count_lines(bo.factorial_time_example, (n,), [("result.append(perm[:i]", lambda loc: len(loc["perm"]) + 1)])
        return [len(perms), perms[:6]], ops
    raise KeyError(name)


BIG_O = [
    ("constant_time_example", MAX_N),
    ("logarithmic_time_example", MAX_N),
    ("linear_time_example", MAX_N),
    ("linearithmic_time_example", MAX_N),
    ("quadratic_time_example", MAX_N),
    ("cubic_time_example", MAX_N),
    ("exponential_time_example", MAX_FIB_CALLS_N),
    ("factorial_time_example", MAX_PERM_N),
]


def big_omega_run(name, case, n):
    if name == "linear_search_best_case":
        target = -1 if case == "worst" else 0
        return count_compares(bm.linear_search_best_case, (keys(range(n)), target))
    if name == "bubble_sort_best_case":
        values = range(n, 0, -1) if case == "worst" else range(n)
        result, ops = count_compares(bm.bubble_sort_best_case, (keys(values),))
        return raw_list(result), ops
    if name == "quick_sort_best_case":
        values = range(n) if case == "distinct" else [7] * n
        result, ops = count_compares(bm.quick_sort_best_case, (keys(values),))
        return raw_list(result), ops
    if name == "matrix_traversal_lower_bound":
        matrix = [[i * n + j for j in range(n)] for i in range(n)]
        return count_lines(bm.matrix_traversal_lower_bound, (matrix,), [("total += element", None)])
    raise KeyError(name)


BIG_OMEGA = [
    ("linear_search_best_case", "best"),
    ("linear_search_best_case", "worst"),
    ("bubble_sort_best_case", "best"),
    ("bubble_sort_best_case", "worst"),
    ("quick_sort_best_case", "best"),
    ("quick_sort_best_case", "distinct"),
    ("matrix_traversal_lower_bound", None),
]


def big_theta_run(name, case, n):
    if name == "tight_bound_example":
        return count_lines(bt.tight_bound_example, (list(range(n)),), [("total += element", None)])
    if name == "merge_sort_example":
        return count_lines(bt.merge_sort_example, (list(range(n, 0, -1)),), MERGE_WRITES)
    if name == "binary_search_example":
        target = (n - 1) // 2 if case == "best" else n
        return count_compares(bt.binary_search_example, (keys(range(n)), target))
    if name == "matrix_multiplication_naive":
        a = [[i * n + j + 1 for j in range(n)] for i in range(n)]
        b = [[i * n + j + 1 for j in range(n)] for i in range(n)]
        product, ops = count_lines(bt.matrix_multiplication_naive, (a, b), [("C[i][j] += A[i][k] * B[k][j]", None)])
        return sum(sum(row) for row in product), ops
    raise KeyError(name)


BIG_THETA = [
    ("tight_bound_example", None),
    ("merge_sort_example", None),
    ("binary_search_example", "best"),
    ("binary_search_example", "worst"),
    ("matrix_multiplication_naive", None),
]


def growth_case(run, name, case, top):
    ns = list(range(1, top + 1))
    ops, results = [], []
    for n in ns:
        result, count = run(name, case, n)
        ops.append(count)
        results.append(result)
    entry = {"fn": name}
    if case is not None:
        entry["case"] = case
    entry.update({"n": [ns[0], ns[-1]], "ops": ops, "results": results})
    return entry


# ---------- space ----------


def measure_space(fn, args):
    """Run fn(*args) under sys.settrace and follow its frames and the lists they reach."""
    code = fn.__code__
    stack = []
    calls = []
    returns = []
    peak = {"depth": 0, "cells": 0, "total": 0}
    inputs = {id(a) for a in args if isinstance(a, list)}

    def cells():
        seen = set(inputs)
        total = 0
        todo = [v for frame in stack for v in frame.f_locals.values()]
        while todo:
            v = todo.pop()
            if isinstance(v, list) and id(v) not in seen:
                seen.add(id(v))
                total += len(v)
                todo.extend(v)
        return total

    def look():
        c = cells()
        d = len(stack)
        peak["depth"] = max(peak["depth"], d)
        peak["cells"] = max(peak["cells"], c)
        peak["total"] = max(peak["total"], d + c)
        return c

    def local(frame, event, arg):
        if event == "line":
            look()
        elif event == "return":
            returns.append([len(stack), look()])
            stack.pop()
        return local

    def tracer(frame, event, arg):
        if frame.f_code is not code:
            return None
        stack.append(frame)
        first = frame.f_locals[code.co_varnames[0]]
        calls.append([len(first) if isinstance(first, list) else first, len(stack)])
        return local

    sys.settrace(tracer)
    try:
        result = fn(*args)
    finally:
        sys.settrace(None)
    return {"calls": calls, "returns": returns, "peak": peak, "result": result}


SPACE_FUNCTIONS = {
    "fib": sc.recursive_fibonacci_naive,
    "log": sc.logarithmic_space_example,
    "constant": sc.constant_space_example,
    "linear": sc.linear_space_example,
    "quadratic": sc.quadratic_space_example,
    "reverse": sc.in_place_reverse,
    "merge": sc.merge_sort_space,
}


def space_case(example, arg):
    fn = SPACE_FUNCTIONS[example]
    given = list(arg) if isinstance(arg, list) else arg
    out = measure_space(fn, (given,))
    return {"example": example, "arg": arg, **out}


def space_cases():
    cases = [space_case("fib", n) for n in range(0, 11)]
    cases += [space_case("log", n) for n in list(range(0, 21)) + [31, 32, 33, 47, 63, 64]]
    cases += [space_case("constant", n) for n in (0, 1, 2, 5, 10, 20)]
    cases += [space_case("linear", n) for n in (0, 1, 2, 8, 16)]
    cases += [space_case("quadratic", n) for n in range(0, 7)]
    reverse = [[], [1], [1, 2], [1, 2, 3], [1, 2, 3, 4, 5, 6, 7, 8], list(range(16, 0, -1))]
    reverse += [[RNG.randint(-20, 99) for _ in range(RNG.randint(0, 16))] for _ in range(6)]
    cases += [space_case("reverse", a) for a in reverse]
    merge = [[], [42], [2, 1], [1, 2], [5, 1, 5, 1], [3, 3, 3], [38, 27, 43, 3, 9, 82, 10], list(range(8, 0, -1)), list(range(1, 9))]
    merge += [[RNG.randint(-20, 99) for _ in range(RNG.randint(0, 8))] for _ in range(24)]
    cases += [space_case("merge", a) for a in merge]
    return cases


# ---------- amortized analysis ----------


def array_case(capacity, appends):
    """DynamicArray(capacity) and appends, with the accounting and potential demos replayed."""
    arr = am.DynamicArray(capacity)
    bank = 0
    prev = 2 * arr.size - arr.capacity
    steps = []
    for i in range(appends):
        copies_before = arr.copies
        old_capacity = arr.capacity
        arr.append(i)
        actual = 1 + (arr.copies - copies_before)  # accounting_method_example
        bank += 3 - actual
        current = 2 * arr.size - arr.capacity  # potential_method_example
        actual_p = old_capacity + 1 if arr.capacity > old_capacity else 1
        if actual_p != actual:
            raise AssertionError((capacity, i, actual, actual_p))
        steps.append(
            {
                "size": arr.size,
                "capacity": arr.capacity,
                "copies": arr.copies,
                "data": list(arr.data),
                "actual": actual,
                "bank": bank,
                "phi": current,
                "amortized": actual_p + (current - prev),
            }
        )
        prev = current
    return {"capacity": capacity, "appends": appends, "phi0": 2 * 0 - capacity, "steps": steps}


def final_capacity(capacity, appends):
    cap = capacity
    for size in range(appends):
        if size >= cap:
            cap = max(1, cap * 2)
    return cap


def array_cases():
    cases = []
    for capacity in range(0, 13):
        for appends in (1, 2, 5, 8, 10, 13, 16, 20, 24):
            if final_capacity(capacity, appends) <= 24:
                cases.append(array_case(capacity, appends))
    return cases


def counter_case(n_bits, increments):
    counter = am.BinaryCounter(n_bits)
    steps = []
    for _ in range(increments):
        counter.increment()
        steps.append({"bits": list(counter.bits), "flips": counter.flips, "value": counter.get_value()})
    return {"bits": n_bits, "increments": increments, "steps": steps}


def counter_cases():
    return [counter_case(b, n) for b in range(1, 11) for n in (1, 4, 10, 16, 40)]


def demo_output(fn):
    buffer = io.StringIO()
    with contextlib.redirect_stdout(buffer):
        fn()
    return buffer.getvalue().splitlines()


def demos():
    aggregate = demo_output(am.aggregate_method_example)
    accounting = demo_output(am.accounting_method_example)
    potential = demo_output(am.potential_method_example)
    counter = demo_output(am.binary_counter_example)
    return {
        "aggregate": [[int(x) for x in m.groups()] for m in map(re.compile(r"Append (\d+): size=(\d+), capacity=(\d+)").search, aggregate) if m],
        "accounting": [
            [int(m.group(1)), m.group(2), int(m.group(3)), int(m.group(4)), int(m.group(5))]
            for m in map(re.compile(r"Append (\d+): (\w+) \(actual=(\d+), charged=(\d+), bank=(-?\d+)\)").search, accounting)
            if m
        ],
        "accountingTotal": [line.strip() for line in accounting if line.startswith("Total actual cost")],
        "potential": [
            [int(m.group(1)), m.group(2), int(m.group(3)), m.group(4)]
            for m in map(re.compile(r"Append (\d+): (\w+) \(actual=(\d+), amortized=(-?[\d.]+)\)").search, potential)
            if m
        ],
        "counter": [
            [int(m.group(1)), int(m.group(2)), int(m.group(3)), m.group(4)]
            for m in map(re.compile(r"(\d+)\. (\d+) -> (\d+) \(binary: ([01]+)\)").search, counter)
            if m
        ],
    }


def main():
    sections = {
        "bigO": [growth_case(big_o_run, name, None, top) for name, top in BIG_O],
        "bigOmega": [growth_case(big_omega_run, name, case, MAX_N) for name, case in BIG_OMEGA],
        "bigTheta": [growth_case(big_theta_run, name, case, MAX_N) for name, case in BIG_THETA],
        "space": space_cases(),
        "dynamicArray": array_cases(),
        "counter": counter_cases(),
    }
    header = {
        "generator": "web/scripts/gen_complexity_fixtures.py",
        "reference": "Complexity_Analysis (big_o_notation.py, big_omega.py, big_theta.py, space_complexity.py, amortized_analysis.py)",
        "demos": demos(),
    }
    parts = []
    for key, cases in sections.items():
        lines = [json.dumps(c, separators=(",", ":")) for c in cases]
        parts.append(json.dumps(key) + ": [\n" + ",\n".join(lines) + "\n]")
    body = json.dumps(header, separators=(",", ":"))[:-1] + ",\n" + ",\n".join(parts) + "\n}\n"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(body, encoding="ascii")
    counts = ", ".join(f"{len(c)} {k}" for k, c in sections.items())
    print(f"wrote {counts} cases to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
