"""Generate golden range-query fixtures from the repository's Python implementations.

The web visualizer re-implements five topics of Data_Structures/Non_Linear/Trees in
TypeScript: the bottom-up segment tree (web/src/viz/algorithms/segmentTree.ts), the lazy
segment tree (segmentTreeLazy.ts), the Fenwick tree (fenwickTree.ts), the sparse table
(sparseTable.ts) and the K-D tree (kdTree.ts). These fixtures pin each port to its Python
reference:

- segment tree: the whole tree array after the build and after every operation, every
  result or IndexError, and the tree positions a query adds (its canonical nodes);
- lazy segment tree: the tree and lazy arrays after every operation (so every tag and every
  push-down counts), each result, the (node, start, end) calls of the recursion in order and
  the nodes whose tag was pushed;
- Fenwick tree: the tree after the build and after every operation, every result or
  IndexError, and the cells an update writes or a sum reads, in order;
- sparse table: the table (with the cells the build never writes), the ValueError of a
  wrong kind, every query result or IndexError;
- K-D tree: the tree shape (point, axis, children) after the build and after every
  operation, every result, and the points a nearest search measures or a range search
  visits, in order (so the pruning counts).

Points of the K-D tree carry an id (their position in the input, inserts after the build),
so equal coordinates stay distinguishable. Every value is an integer, so the file does not
depend on floating point.

Run from anywhere:

    python3 web/scripts/gen_rangeQueries_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/rangeQueries.json. CI regenerates the file
and fails if it changed, which means the two implementations drifted.
"""

import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TREES = ROOT / "Data_Structures" / "Non_Linear" / "Trees"
for folder in ("Segment_Tree", "Segment_Tree_Lazy_Propagation", "Fenwick_Tree", "Sparse_Table", "K_D_Tree"):
    sys.path.insert(0, str(TREES / folder / "Python"))

import kd_tree  # noqa: E402
from fenwick_tree import FenwickTree  # noqa: E402
from segment_tree import SegmentTree  # noqa: E402
from segment_tree_lazy import LazySegmentTree  # noqa: E402
from sparse_table import SparseTable  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "rangeQueries.json"
RNG = random.Random(20261114)


class LoggedList(list):
    """A list that records the indices read and written while `on` is set."""

    def __init__(self, items):
        super().__init__(items)
        self.on = False
        self.reads = []
        self.writes = []

    def __getitem__(self, index):
        if self.on:
            self.reads.append(index)
        return list.__getitem__(self, index)

    def __setitem__(self, index, value):
        if self.on:
            self.writes.append(index)
        list.__setitem__(self, index, value)

    def start(self):
        self.reads = []
        self.writes = []
        self.on = True

    def stop(self):
        self.on = False


def run(call):
    """The result of call(), or {"error": name} when it raises."""
    try:
        return call(), None
    except (IndexError, ValueError) as e:
        return None, type(e).__name__


def outcome(result, error):
    return {"error": error} if error else {"result": result}


def rand_array(n, lo=-20, hi=40):
    return [RNG.randint(lo, hi) for _ in range(n)]


# ---------- segment tree (bottom-up, point assign) ----------


def segment_case(arr, ops):
    st = SegmentTree(arr)
    build = list(st.tree)
    tree = LoggedList(st.tree)
    st.tree = tree
    steps = []
    for op in ops:
        tree.start()
        if op[0] == "query":
            result, error = run(lambda: st.query(op[1], op[2]))
        elif op[0] == "update":
            result, error = run(lambda: st.update(op[1], op[2]))
        else:
            result, error = run(lambda: st.get(op[1]))
        tree.stop()
        step = outcome(result, error)
        step["tree"] = list(tree)
        if op[0] == "query" and not error:
            step["reads"] = tree.reads
        steps.append(step)
    return {"arr": arr, "size": st.size, "build": build, "ops": ops, "steps": steps}


def segment_ops(n, count):
    ops = []
    for _ in range(count):
        r = RNG.random()
        if r < 0.45:
            if RNG.random() < 0.15:
                lo = RNG.randint(-1, n)
                ops.append(["query", lo, RNG.randint(lo - 1, n)])
            else:
                lo = RNG.randint(0, n - 1)
                ops.append(["query", lo, RNG.randint(lo, n - 1)])
        elif r < 0.85:
            ops.append(["update", RNG.randint(0, n - 1) if RNG.random() < 0.9 else RNG.choice([-1, n]), RNG.randint(-30, 60)])
        else:
            ops.append(["get", RNG.randint(-1, n)])
    return ops


def segment_cases(count):
    fixed = [
        ([1, 3, 5, 7, 9, 11], [["query", 1, 4], ["update", 2, 10], ["query", 0, 2], ["get", 2], ["query", 0, 5]]),
        ([1, 3, 5, 7, 9, 11, 2, 4], [["query", 0, 7], ["query", 3, 3], ["query", 1, 6], ["update", 7, -4], ["query", 6, 7]]),
        ([5], [["query", 0, 0], ["update", 0, 10], ["query", 0, 0], ["get", 0]]),
        ([-4, 2, -7, 5, 1], [["query", 0, 4], ["query", 2, 3], ["update", 2, 10], ["query", 1, 3]]),
        ([1, 3, 5, 7, 9, 11], [["get", -1], ["query", -1, 2], ["query", 0, 6], ["query", 3, 2], ["update", 6, 1], ["query", 2, 3]]),
        ([], [["query", 0, 0], ["get", 0], ["update", 0, 1]]),
        (list(range(1, 17)), [["query", 0, 15], ["query", 1, 14], ["query", 5, 10], ["update", 15, 0], ["query", 8, 15]]),
        ([4, -1, 3], [["query", 0, 2], ["query", 1, 2], ["update", 1, 6], ["query", 0, 1]]),
    ]
    cases = [segment_case(arr, ops) for arr, ops in fixed]
    while len(cases) < count:
        n = RNG.randint(1, 16)
        cases.append(segment_case(rand_array(n), segment_ops(n, RNG.randint(1, 10))))
    return cases


# ---------- lazy segment tree (recursive, range add) ----------


def lazy_case(arr, ops):
    st = LazySegmentTree(arr)
    build = list(st.tree)
    visits = []
    pushes = []
    orig_update, orig_query, orig_push = st._update_range, st._query, st._push_down

    def update(node, start, end, left, right, val):
        visits.append([node, start, end])
        return orig_update(node, start, end, left, right, val)

    def query(node, start, end, left, right):
        visits.append([node, start, end])
        return orig_query(node, start, end, left, right)

    def push(node, start, end):
        if st.lazy[node] != 0:
            pushes.append(node)
        return orig_push(node, start, end)

    st._update_range, st._query, st._push_down = update, query, push
    steps = []
    for op in ops:
        del visits[:]
        del pushes[:]
        if op[0] == "add":
            result = st.update_range(op[1], op[2], op[3])
        else:
            result = st.query(op[1], op[2])
        steps.append({"result": result, "tree": list(st.tree), "lazy": list(st.lazy), "visits": list(visits), "pushes": list(pushes)})
    return {"arr": arr, "build": build, "ops": ops, "steps": steps}


def lazy_ops(n, count):
    ops = []
    for _ in range(count):
        if RNG.random() < 0.1:
            lo = RNG.randint(-3, n + 2)
            hi = RNG.randint(lo - 2, n + 3)
        else:
            lo = RNG.randint(0, n - 1)
            hi = RNG.randint(lo, n - 1)
        ops.append(["add", lo, hi, RNG.randint(-20, 20)] if RNG.random() < 0.5 else ["query", lo, hi])
    return ops


def lazy_cases(count):
    fixed = [
        ([1, 3, 5, 7, 9, 11], [["add", 1, 4, 3], ["query", 3, 3], ["query", 0, 5]]),
        ([1, 3, 5, 7, 9, 11], [["add", 0, 3, 2], ["add", 2, 5, 3], ["query", 2, 2], ["query", 4, 4], ["query", 0, 5]]),
        ([1, 3, 5, 7, 9, 11], [["add", 0, 5, 1], ["query", 0, 5], ["add", 0, 5, -1], ["query", 1, 3]]),
        ([42], [["query", 0, 0], ["add", 0, 0, 8], ["query", 0, 0]]),
        ([4, 8, 15, 16, 23, 42, 7, 1], [["add", -2, 3, 5], ["query", 2, 20], ["query", -5, -1], ["add", 6, 2, 9], ["query", 3, 1], ["query", 0, 7]]),
        ([], [["add", -1, 0, 5], ["query", -3, 5], ["query", 0, 0]]),
        (list(range(16)), [["add", 3, 12, 2], ["add", 5, 9, -1], ["query", 6, 6], ["query", 0, 15], ["add", 0, 15, 4], ["query", 7, 8]]),
        ([2, 2, 2], [["add", 1, 1, 6], ["add", 0, 2, 1], ["query", 1, 2], ["query", 0, 0]]),
    ]
    cases = [lazy_case(arr, ops) for arr, ops in fixed]
    while len(cases) < count:
        n = RNG.randint(1, 16)
        cases.append(lazy_case(rand_array(n), lazy_ops(n, RNG.randint(1, 10))))
    return cases


# ---------- Fenwick tree ----------


def fenwick_case(arr, ops):
    ft = FenwickTree(arr)
    tree = LoggedList(ft.tree)
    ft.tree = tree
    build = list(tree)
    steps = []
    for op in ops:
        tree.start()
        if op[0] == "update":
            result, error = run(lambda: ft.update(op[1], op[2]))
        elif op[0] == "prefix":
            result, error = run(lambda: ft.prefix_sum(op[1]))
        elif op[0] == "query":
            result, error = run(lambda: ft.query(op[1], op[2]))
        else:
            result, error = run(lambda: ft.get(op[1]))
        tree.stop()
        step = outcome(result, error)
        step["tree"] = list(tree)
        step["touched"] = tree.writes if op[0] == "update" else tree.reads
        steps.append(step)
    return {"arr": arr, "build": build, "ops": ops, "steps": steps}


def fenwick_ops(n, count):
    ops = []
    for _ in range(count):
        r = RNG.random()
        bad = RNG.random() < 0.1
        i = RNG.choice([-1, n]) if bad else RNG.randint(0, n - 1)
        if r < 0.35:
            ops.append(["update", i, RNG.randint(-20, 20)])
        elif r < 0.6:
            ops.append(["prefix", i])
        elif r < 0.85:
            j = RNG.randint(0, n - 1)
            ops.append(["query", i, j] if bad else ["query", min(i, j), max(i, j)])
        else:
            ops.append(["get", i])
    return ops


def fenwick_cases(count):
    fixed = [
        ([1, 3, 5, 7, 9, 11], [["prefix", 4], ["update", 2, 5], ["prefix", 4], ["query", 1, 4], ["get", 2]]),
        ([1, 3, 5, 7, 9, 11], [["update", -1, 5], ["update", 6, 5], ["prefix", 6], ["query", 3, 2], ["get", -1], ["query", 0, 5]]),
        ([5], [["query", 0, 0], ["update", 0, 5], ["query", 0, 0]]),
        ([-5, 3, -2, 8], [["query", 0, 3], ["update", 1, -10], ["query", 1, 2]]),
        ([], [["prefix", 0], ["update", 0, 1]]),
        (list(range(1, 17)), [["prefix", 15], ["prefix", 14], ["update", 0, 100], ["query", 7, 12], ["get", 8]]),
        ([3, 1, 4, 1, 5, 9, 2], [["query", 0, 6], ["update", 3, 2], ["get", 3], ["prefix", 0]]),
    ]
    cases = [fenwick_case(arr, ops) for arr, ops in fixed]
    while len(cases) < count:
        n = RNG.randint(1, 16)
        cases.append(fenwick_case(rand_array(n), fenwick_ops(n, RNG.randint(1, 10))))
    return cases


# ---------- sparse table ----------


def sparse_case(arr, kind, ops):
    st, error = run(lambda: SparseTable(arr, kind))
    if error:
        return {"arr": arr, "kind": kind, "error": error, "ops": ops, "steps": []}
    steps = []
    for op in ops:
        if op[0] == "query":
            result, error = run(lambda: st.query(op[1], op[2]))
        else:
            result, error = run(lambda: st.get(op[1]))
        steps.append(outcome(result, error))
    return {"arr": arr, "kind": kind, "logN": st.log_n, "table": st.table, "ops": ops, "steps": steps}


def sparse_ops(n, count):
    ops = []
    for _ in range(count):
        if RNG.random() < 0.85:
            ops.append(["query", RNG.randint(-1, n) if RNG.random() < 0.1 else RNG.randint(0, n - 1), RNG.randint(0, n - 1)])
        else:
            ops.append(["get", RNG.randint(-1, n)])
    return ops


def sparse_cases(count):
    ten = [1, 3, 5, 7, 9, 11, 2, 4, 6, 8]
    fixed = [
        (ten, "min", [["query", 2, 8], ["query", 0, 2], ["query", 6, 9], ["query", 0, 9], ["query", 5, 2], ["get", 5]]),
        (ten, "max", [["query", 2, 8], ["query", 1, 3], ["query", 0, 5], ["query", 6, 9]]),
        ([5], "min", [["query", 0, 0], ["get", 0]]),
        ([], "min", [["query", 0, 0], ["get", 0]]),
        ([], "max", [["query", 0, 0]]),
        ([5, 1, 9], "sum", [["query", 0, 2]]),
        ([4, 2, 7], "min", [["query", -1, 1], ["query", 0, 3], ["query", 2, 0], ["get", 3]]),
        (list(range(16, 0, -1)), "min", [["query", 0, 15], ["query", 3, 11], ["query", 7, 8]]),
        ([3, 3, 1, 3, 3], "max", [["query", 0, 4], ["query", 2, 2], ["query", 1, 3]]),
    ]
    cases = [sparse_case(arr, kind, ops) for arr, kind, ops in fixed]
    while len(cases) < count:
        n = RNG.randint(1, 16)
        kind = RNG.choice(["min", "max"])
        cases.append(sparse_case(rand_array(n, -50, 99), kind, sparse_ops(n, RNG.randint(1, 8))))
    return cases


# ---------- K-D tree ----------


class P(tuple):
    """A 2D point with an id; indexing is logged while a range search runs."""

    log = None

    def __new__(cls, xy, pid):
        p = super().__new__(cls, xy)
        p.pid = pid
        return p

    def __getitem__(self, index):
        if P.log is not None and (not P.log or P.log[-1] != self.pid):
            P.log.append(self.pid)
        return tuple.__getitem__(self, index)


def kd_shape(node):
    if node is None:
        return None
    return [node.point.pid, list(node.point), node.axis, kd_shape(node.left), kd_shape(node.right)]


def kd_case(points, ops):
    pts = [P(p, i) for i, p in enumerate(points)]
    tree = kd_tree.KDTree(pts)
    build = kd_shape(tree._root)
    measured = []
    original = kd_tree._squared_distance

    def logged(a, b):
        measured.append(b.pid)
        return original(a, b)

    kd_tree._squared_distance = logged
    next_id = len(points)
    steps = []
    try:
        for op in ops:
            if op[0] == "insert":
                tree.insert(P(op[1], next_id))
                next_id += 1
                steps.append({"result": None, "tree": kd_shape(tree._root)})
            elif op[0] == "nearest":
                del measured[:]
                best = tree.nearest(tuple(op[1]))
                steps.append({"result": None if best is None else best.pid, "visits": list(measured), "tree": kd_shape(tree._root)})
            else:
                P.log = []
                found = tree.range_search(tuple(op[1]), tuple(op[2]))
                visits, P.log = P.log, None
                steps.append({"result": [p.pid for p in found], "visits": visits, "tree": kd_shape(tree._root)})
    finally:
        kd_tree._squared_distance = original
        P.log = None
    return {"points": points, "build": build, "ops": ops, "steps": steps}


def rand_point():
    return [RNG.randint(0, 9), RNG.randint(0, 9)]


def kd_ops(count, room):
    ops = []
    for _ in range(count):
        r = RNG.random()
        if r < 0.25 and room > 0:
            ops.append(["insert", rand_point()])
            room -= 1
        elif r < 0.65:
            ops.append(["nearest", rand_point()])
        else:
            a, b = rand_point(), rand_point()
            box = [[min(a[0], b[0]), min(a[1], b[1])], [max(a[0], b[0]), max(a[1], b[1])]]
            ops.append(["range", *box] if RNG.random() < 0.9 else ["range", b, a])
    return ops


def kd_cases(count):
    textbook = [[7, 2], [5, 4], [9, 6], [2, 3], [4, 7], [8, 1]]
    fixed = [
        (textbook, [["nearest", [1, 3]], ["nearest", [6, 5]], ["range", [3, 3], [8, 7]], ["range", [0, 0], [9, 9]], ["nearest", [9, 9]]]),
        (textbook, [["insert", [3, 6]], ["insert", [7, 5]], ["nearest", [6, 6]], ["range", [2, 4], [7, 7]]]),
        ([], [["nearest", [1, 1]], ["range", [0, 0], [9, 9]], ["insert", [5, 5]], ["insert", [2, 8]], ["nearest", [1, 1]]]),
        ([], [["insert", [i, i]] for i in range(8)] + [["nearest", [9, 9]], ["nearest", [0, 0]], ["range", [2, 2], [5, 5]]]),
        ([[3, 3], [3, 3], [3, 5], [3, 1], [5, 3], [1, 3]], [["nearest", [3, 4]], ["nearest", [3, 3]], ["range", [3, 3], [3, 3]], ["insert", [3, 3]]]),
        ([[1, 1], [2, 2], [3, 3]], [["nearest", [2, 2]], ["range", [10, 10], [20, 20]], ["range", [5, 5], [1, 1]]]),
        ([[0, 0], [9, 9], [0, 9], [9, 0], [5, 5], [4, 4], [6, 6], [5, 0], [0, 5], [9, 5]], [["nearest", [7, 7]], ["nearest", [2, 1]], ["range", [3, 3], [6, 6]]]),
    ]
    cases = [kd_case(points, ops) for points, ops in fixed]
    while len(cases) < count:
        m = RNG.randint(0, 9)
        cases.append(kd_case([rand_point() for _ in range(m)], kd_ops(RNG.randint(1, 8), 10 - m)))
    return cases


def main():
    sections = {
        "segmentTree": segment_cases(60),
        "lazySegmentTree": lazy_cases(60),
        "fenwick": fenwick_cases(60),
        "sparseTable": sparse_cases(60),
        "kdTree": kd_cases(80),
    }
    header = {
        "generator": "web/scripts/gen_rangeQueries_fixtures.py",
        "reference": "Data_Structures/Non_Linear/Trees (segment_tree.py, segment_tree_lazy.py, fenwick_tree.py, sparse_table.py, kd_tree.py)",
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
