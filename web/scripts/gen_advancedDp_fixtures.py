"""Generate golden fixtures for the advanced dynamic-programming visualizations.

The web visualizer re-implements five topics in TypeScript (web/src/viz/algorithms/):
bitmaskDp.ts (traveling_salesman_dp), digitDp.ts (count_numbers_with_digit_sum), treeDp.ts
(tree_dp_max_independent_set, tree_dp_max_path_sum), graphDp.ts (dag_longest_path) and
convexHullTrick.ts (MonotonicCHT). These fixtures pin each port to the repository's Python
code in Algorithms/Dynamic_Programming/Advanced_DP and DP_Optimizations/Convex_Hull_Trick.

The functions keep their tables in local variables, so the generator watches them with
sys.settrace instead of changing them:

- tsp: every cell of the dp table (all 2^n masks) and the result, inf written as "inf";
- digit: every call of the inner dp(pos, tight, current_sum) in call order with its return
  value (memo hits and base cases included), the memo in insertion order, and the count;
- treeMis / treePath: the value each dfs(node) returns, in the order the calls return
  (post-order), with best1, best2 and max_sum after each call of the path version;
- dag: every call of dfs(node) and every return value in order, then the result or the
  ValueError message;
- cht: the deque of lines after every add_line and query, and every query's answer or error.

Run from anywhere:

    python3 web/scripts/gen_advancedDp_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/advancedDp.json. CI regenerates the file and
fails if it changed, which means the two implementations drifted.
"""

import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DP = ROOT / "Algorithms" / "Dynamic_Programming"
for folder in (
    "Advanced_DP/Bitmask_DP",
    "Advanced_DP/Digit_DP",
    "Advanced_DP/DP_on_Trees",
    "Advanced_DP/DP_on_Graphs",
    "DP_Optimizations/Convex_Hull_Trick",
):
    sys.path.insert(0, str(DP / folder / "Python"))

from bitmask_dp import traveling_salesman_dp  # noqa: E402
from cht import MonotonicCHT  # noqa: E402
from digit_dp import count_numbers_with_digit_sum  # noqa: E402
from graph_dp import dag_longest_path  # noqa: E402
from tree_dp import TreeNode, tree_dp_max_independent_set, tree_dp_max_path_sum  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "advancedDp.json"
INF = float("inf")


def num(v):
    """A number for JSON: infinities as strings (JSON has no Infinity)."""
    if v == INF:
        return "inf"
    if v == -INF:
        return "-inf"
    return v


class Watch:
    """sys.settrace helper: report call and return events of the given code objects."""

    def __init__(self, codes, on_call=None, on_return=None, on_exception=None):
        self.codes = set(codes)
        self.on_call = on_call
        self.on_return = on_return
        self.on_exception = on_exception

    def _local(self, frame, event, arg):
        if event == "return" and self.on_return:
            self.on_return(frame, arg)
        elif event == "exception" and self.on_exception:
            self.on_exception(frame, arg)
        return self._local

    def _global(self, frame, event, arg):
        if event == "call" and frame.f_code in self.codes:
            if self.on_call:
                self.on_call(frame)
            return self._local
        return None

    def run(self, fn, *args):
        sys.settrace(self._global)
        try:
            return fn(*args)
        finally:
            sys.settrace(None)


def inner_code(outer, name):
    """The code object of a function defined inside `outer`."""
    for const in outer.__code__.co_consts:
        if hasattr(const, "co_name") and const.co_name == name:
            return const
    raise LookupError(name)


# ---------- bitmask DP (TSP) ----------

TSP_FIXED = [
    [],
    [[0]],
    [[5]],
    [[0, 7], [7, 0]],
    [[0, 1, 4], [1, 0, 2], [4, 2, 0]],
    [[0, 1, INF], [1, 0, INF], [INF, INF, 0]],
    [[0, 10, 15, 20], [10, 0, 35, 25], [15, 35, 0, 30], [20, 25, 30, 0]],
    [[0, 2, 9, 10], [1, 0, 6, 4], [15, 7, 0, 8], [6, 3, 12, 0]],
    [[0, 3, INF, 4], [3, 0, 2, INF], [INF, 2, 0, 5], [4, INF, 5, 0]],
    [[0, -2, 3], [4, 0, -1], [2, 6, 0]],
]


def tsp_case(dist):
    seen = {}

    def on_return(frame, arg):
        seen["dp"] = frame.f_locals.get("dp")

    code = traveling_salesman_dp.__code__
    result = Watch([code], on_return=on_return).run(traveling_salesman_dp, dist)
    table = seen.get("dp") or []
    return {
        "dist": [[num(v) for v in row] for row in dist],
        "dp": [[num(v) for v in row] for row in table],
        "result": num(result),
    }


def tsp_cases(rng, count):
    cases = [tsp_case(d) for d in TSP_FIXED]
    while len(cases) < count:
        n = rng.randint(1, 6)
        symmetric = rng.random() < 0.5
        holes = rng.choice([0, 0, 0.15, 0.4])
        d = [[0] * n for _ in range(n)]
        for i in range(n):
            for j in range(n):
                if i == j:
                    d[i][j] = rng.choice([0, 0, 0, rng.randint(1, 9)])
                elif symmetric and j < i:
                    d[i][j] = d[j][i]
                else:
                    d[i][j] = INF if rng.random() < holes else rng.randint(-3, 40)
        cases.append(tsp_case(d))
    return cases


# ---------- digit DP ----------

DIGIT_FIXED = [(25, 5), (100, 5), (100, 10), (345, 6), (0, 0), (0, 3), (-1, 0), (-5, 3), (9, 9), (10, 1), (99, 19), (1000, 0), (4321, 9), (9999, 20), (505, 10), (2024, 8), (99999, 20), (12345, 15)]


def digit_case(n, target):
    calls = []
    stack = []
    memo_box = {}
    dp_code = inner_code(count_numbers_with_digit_sum, "dp")
    outer = count_numbers_with_digit_sum.__code__

    def on_call(frame):
        if frame.f_code is dp_code:
            loc = frame.f_locals
            calls.append([loc["pos"], 1 if loc["tight"] else 0, loc["current_sum"], None])
            stack.append(len(calls) - 1)

    def on_return(frame, arg):
        if frame.f_code is dp_code:
            calls[stack.pop()][3] = arg
        else:
            memo_box["memo"] = frame.f_locals.get("memo", {})

    count = Watch([dp_code, outer], on_call=on_call, on_return=on_return).run(count_numbers_with_digit_sum, n, target)
    memo = [[p, 1 if t else 0, s, v] for (p, t, s), v in memo_box.get("memo", {}).items()]
    return {"n": n, "target": target, "calls": calls, "memo": memo, "count": count}


def digit_cases(rng, count):
    cases = [digit_case(n, t) for n, t in DIGIT_FIXED]
    while len(cases) < count:
        n = rng.choice([rng.randint(-3, 99), rng.randint(0, 999), rng.randint(0, 9999), rng.randint(0, 99999)])
        cases.append(digit_case(n, rng.randint(0, 20)))
    return cases


# ---------- DP on trees ----------

TREE_FIXED = [
    None,
    [7, []],
    [10, [[20, []], [30, [[40, []]]]]],
    [1, [[2, [[4, []], [5, []]]], [3, []]]],
    [1, [[2, []], [3, []], [4, []]]],
    [-3, [[-1, []], [-2, []]]],
    [1, [[-6, []], [2, []], [3, []]]],
    [-5, []],
    [-3, [[-1, []]]],
    [5, [[4, [[3, []], [3, []]]], [4, [[3, []], [-9, []]]]]],
]


def build(spec, order):
    if spec is None:
        return None
    node = TreeNode(spec[0], [])
    order[id(node)] = len(order)
    node.children = [build(child, order) for child in spec[1]]
    return node


def random_tree(rng, size):
    nodes = [[rng.randint(-9, 30), []]]
    for _ in range(size - 1):
        parent = rng.choice(nodes[-4:] if rng.random() < 0.5 else nodes)
        child = [rng.randint(-9, 30), []]
        parent[1].append(child)
        nodes.append(child)
    return nodes[0]


def tree_case(spec, kind):
    order = {}
    root = build(spec, order)
    fn = tree_dp_max_independent_set if kind == "mis" else tree_dp_max_path_sum
    dfs_code = inner_code(fn, "dfs")
    calls = []

    def on_return(frame, arg):
        node = frame.f_locals.get("node")
        ident = order[id(node)] if node is not None else None
        if kind == "mis":
            calls.append([ident, arg[0], arg[1]])
        else:
            loc = frame.f_locals
            calls.append([ident, num(arg), num(loc.get("best1", 0)), num(loc.get("best2", 0)), num(loc.get("max_sum"))])

    result = Watch([dfs_code], on_return=on_return).run(fn, root)
    return {"tree": spec, "calls": calls, "result": num(result)}


def tree_cases(rng, kind, count):
    cases = [tree_case(s, kind) for s in TREE_FIXED]
    while len(cases) < count:
        cases.append(tree_case(random_tree(rng, rng.randint(1, 13)), kind))
    return cases


# ---------- DP on graphs ----------

DAG_FIXED = [
    ([(0, 1), (0, 2), (1, 3), (2, 3)], [], 0),
    ([(0, 1), (0, 2), (0, 3), (1, 2), (1, 4), (2, 4), (2, 5), (3, 5), (4, 6), (5, 6)], [], 0),
    ([(0, 1), (0, 2), (0, 3), (1, 2), (1, 4), (2, 4), (2, 5), (3, 5), (4, 6), (5, 6)], [], 3),
    ([], [], 5),
    ([(0, 1)], [], 0),
    ([(0, 1), (1, 2), (2, 0)], [], 0),
    ([(0, 0)], [], 0),
    ([(0, 1), (5, 6), (6, 5)], [], 0),
    ([("a", "b"), ("a", "c"), ("b", "d"), ("c", "d")], [], "a"),
    ([("a", "b"), ("b", "a")], [], "a"),
    ([(0, 1), (0, 1), (1, 2)], [3], 0),
]


def dag_case(edges, isolated, start):
    graph = {}
    for a, b in edges:
        graph.setdefault(a, []).append(b)
    for v in isolated:
        graph.setdefault(v, [])
    dfs_code = inner_code(dag_longest_path, "dfs")
    events = []
    raised = set()

    def on_call(frame):
        events.append(["call", str(frame.f_locals["node"])])

    def on_return(frame, arg):
        if id(frame) in raised:
            return
        events.append(["ret", str(frame.f_locals["node"]), arg])

    def on_exception(frame, arg):
        if not raised:
            events.append(["raise", str(frame.f_locals["node"])])
        raised.add(id(frame))

    case = {
        "edges": [[str(a), str(b)] for a, b in edges],
        "isolated": [str(v) for v in isolated],
        "start": str(start),
    }
    try:
        case["result"] = Watch([dfs_code], on_call=on_call, on_return=on_return, on_exception=on_exception).run(dag_longest_path, graph, start)
    except ValueError as err:
        case["error"] = str(err)
    case["events"] = events
    return case


def dag_cases(rng, count):
    cases = [dag_case(e, i, s) for e, i, s in DAG_FIXED]
    while len(cases) < count:
        n = rng.randint(1, 9)
        edges = []
        for _ in range(rng.randint(0, 14)):
            a, b = rng.randrange(n), rng.randrange(n)
            if a > b and rng.random() < 0.85:
                a, b = b, a
            if a == b and rng.random() < 0.8:
                continue
            edges.append((a, b))
        cases.append(dag_case(edges, [], rng.randrange(n)))
    return cases


# ---------- convex hull trick ----------

CHT_FIXED = [
    [("add", 3, 0), ("add", 2, 4), ("add", 1, 3), ("add", 0, 7)] + [("query", x) for x in range(7)],
    [("add", 2, 5), ("add", 1, 3), ("add", -1, 7)] + [("query", x) for x in (0, 1, 2, 3, 5, 10)],
    [("add", 2, 5), ("add", 2, 1), ("add", 2, 3), ("query", 0)],
    [("add", 5, 0), ("add", 3, 4), ("add", 3, 2), ("add", 3, 9), ("add", 1, 10), ("add", 1, 6), ("query", -5), ("query", 0), ("query", 4), ("query", 19)],
    [("query", 0)],
    [("add", 1, 0), ("query", 5), ("query", 2)],
    [("add", -1, 0), ("add", 2, 0), ("query", -3), ("query", 3)],
    [("add", 2, 3), ("query", 0), ("query", 5)],
]


def cht_case(ops):
    cht = MonotonicCHT()
    steps = []
    for op in ops:
        step = {}
        if op[0] == "add":
            cht.add_line(op[1], op[2])
        else:
            try:
                step["result"] = cht.query(op[1])
            except ValueError as err:
                step["error"] = str(err)
        step["lines"] = [list(line) for line in cht._lines]
        steps.append(step)
    return {"ops": [list(op) for op in ops], "steps": steps}


def cht_cases(rng, count):
    cases = [cht_case(ops) for ops in CHT_FIXED]
    while len(cases) < count:
        ops = []
        m = rng.randint(-2, 6)
        x = rng.randint(-8, 0)
        for _ in range(rng.randint(1, 14)):
            if rng.random() < 0.5:
                # Mostly non-increasing slopes (equal slopes too); now and then a broken order.
                m = m - rng.randint(0, 2) if rng.random() < 0.9 else m + rng.randint(1, 3)
                ops.append(("add", m, rng.randint(-20, 20)))
            else:
                x = x + rng.randint(0, 3) if rng.random() < 0.9 else x - rng.randint(1, 3)
                ops.append(("query", x))
        cases.append(cht_case(ops))
    return cases


def main():
    rng = random.Random(20261115)
    sections = {
        "tsp": tsp_cases(rng, 40),
        "digit": digit_cases(rng, 60),
        "treeMis": tree_cases(rng, "mis", 50),
        "treePath": tree_cases(rng, "path", 50),
        "dag": dag_cases(rng, 60),
        "cht": cht_cases(rng, 60),
    }
    header = {
        "generator": "web/scripts/gen_advancedDp_fixtures.py",
        "reference": "Algorithms/Dynamic_Programming/Advanced_DP (bitmask_dp.py, digit_dp.py, tree_dp.py, graph_dp.py); Algorithms/Dynamic_Programming/DP_Optimizations/Convex_Hull_Trick (cht.py)",
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
