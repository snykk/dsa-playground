"""Generate golden specialized-technique fixtures from the repository's Python implementations.

The web visualizer re-implements the five topics of
Algorithms/Advanced_Algorithms/Specialized_Techniques in TypeScript: square root
decomposition (web/src/viz/algorithms/sqrtDecomposition.ts), Mo's algorithm
(mosAlgorithm.ts), the lowest common ancestor (lowestCommonAncestor.ts), heavy-light
decomposition (heavyLight.ts) and centroid decomposition (centroid.ts). These fixtures pin
each port to its Python reference:

- square root decomposition: the block size and block count, the block sums after the
  build, and after every operation the result or IndexError, the array and the block sums,
  plus the cells and block sums a query reads, in order (the failing index included);
- Mo's algorithm: the block size, the order process_queries visits the queries (the result
  of its own stable sort), every add and remove with the index it reads and the answer it
  returns, and the answers in input order;
- lowest common ancestor: parent, depth, levels and up of BinaryLiftingLCA; euler, first and
  sparse of EulerTourLCA; and for every lca, distance and kth_ancestor call on each class its
  result (or the exception's name) with the table cells it reads, in order;
- heavy-light decomposition: parent, depth, size, heavy, head and pos after build(root),
  the order dfs_size writes the sizes and decompose hands out the positions, and every lca
  and query_path result (or IndexError);
- centroid decomposition: every decompose(u, p) call in order with its component size, the
  sizes dfs_size writes, the centroid find_centroid returns, the final parent array and
  get_centroid_tree().

Every value is an integer, so the file does not depend on floating point.

Run from anywhere:

    python3 web/scripts/gen_specializedTechniques_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/specializedTechniques.json. CI regenerates the
file and fails if it changed, which means the two implementations drifted.
"""

import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TECH = ROOT / "Algorithms" / "Advanced_Algorithms" / "Specialized_Techniques"
for folder in ("Square_Root_Decomposition", "Mos_Algorithm", "Lowest_Common_Ancestor", "Heavy_Light_Decomposition", "Centroid_Decomposition"):
    sys.path.insert(0, str(TECH / folder / "Python"))

import mos_algorithm  # noqa: E402
from centroid_decomposition import CentroidDecomposition  # noqa: E402
from heavy_light_decomposition import HLD  # noqa: E402
from lowest_common_ancestor import BinaryLiftingLCA, EulerTourLCA  # noqa: E402
from mos_algorithm import MoSAlgorithm  # noqa: E402
from square_root_decomposition import SqrtDecomposition  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "specializedTechniques.json"
RNG = random.Random(20261115)


class LoggedList(list):
    """A list that records the indices read and the (index, value) pairs written while `on` is set."""

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
            self.writes.append([index, value])
        list.__setitem__(self, index, value)

    def start(self):
        self.reads = []
        self.writes = []
        self.on = True

    def stop(self):
        self.on = False


# ---------- square root decomposition ----------


class OrderedLog(list):
    """A list that appends every read, tagged, to a log shared with another list (so arr and blocks interleave)."""

    def __init__(self, items, tag, log):
        super().__init__(items)
        self.tag = tag
        self.log = log

    def __getitem__(self, index):
        self.log.append([self.tag, index])
        return list.__getitem__(self, index)


def query_logged(sd, left, right, log):
    """Run the repository's query with arr and blocks swapped for lists that log every read in order."""
    saved_arr, saved_blocks = sd.arr, sd.blocks
    sd.arr = OrderedLog(saved_arr, "a", log)
    sd.blocks = OrderedLog(saved_blocks, "b", log)
    try:
        return sd.query(left, right)
    finally:
        sd.arr, sd.blocks = saved_arr, saved_blocks


def sqrt_case(arr, ops):
    sd = SqrtDecomposition(arr)
    case = {"arr": arr, "ops": ops, "blockSize": sd.block_size, "blockCount": sd.block_count, "blocks": list(sd.blocks), "steps": []}
    for op in ops:
        step = {}
        log = []
        try:
            if op[0] == "query":
                step["result"] = query_logged(sd, op[1], op[2], log)
            else:
                sd.update(op[1], op[2])
                step["result"] = None
        except IndexError:
            step["error"] = "IndexError"
        if op[0] == "query":
            step["reads"] = log
        step["arr"] = list(sd.arr)
        step["blocks"] = list(sd.blocks)
        case["steps"].append(step)
    return case


def sqrt_ops(n, count):
    ops = []
    for _ in range(count):
        r = RNG.random()
        if r < 0.55 and n > 0:
            left = RNG.randrange(n)
            ops.append(["query", left, RNG.randrange(left, n)])
        elif r < 0.9 and n > 0:
            ops.append(["update", RNG.randrange(n), RNG.randint(-20, 40)])
        elif r < 0.95:
            # one past the end, or further: IndexError
            left = RNG.randrange(max(1, n))
            ops.append(["query", left, n + RNG.randint(0, 6)])
        else:
            ops.append(["update", n + RNG.randint(0, 6), RNG.randint(-5, 5)])
    return ops


def sqrt_cases(count):
    demo = list(range(1, 11))
    fixed = [
        (demo, [["query", 2, 7], ["update", 5, 20], ["query", 2, 7], ["query", 0, 9], ["query", 8, 9], ["query", 3, 9]]),
        ([1, 2, 1, 3, 2, 1, 4, 2, 3], [["query", 0, 4], ["query", 2, 7], ["query", 3, 8], ["query", 1, 5], ["update", 4, 10], ["query", 0, 4], ["query", 2, 7]]),
        ([7], [["query", 0, 0], ["update", 0, -3], ["query", 0, 0], ["update", 1, 5], ["query", 0, 1]]),
        ([], [["query", 0, 0], ["update", 0, 5]]),
        (list(range(20)), [["query", 0, 19], ["query", 4, 15], ["query", 6, 8], ["query", 5, 9], ["query", 19, 19], ["update", 12, -7], ["query", 3, 17]]),
        ([5, -3, 8, 0, 2, -6, 4, 9, -1, 7, 3, -2, 6, 1, -4, 5, 2], [["query", 0, 16], ["query", 15, 16], ["query", 4, 20], ["query", 0, 17], ["update", 16, 10], ["update", 17, 1], ["query", 10, 16]]),
        ([4, 4, 4, 4], [["query", 1, 2], ["query", 0, 3], ["update", 3, 0], ["query", 2, 3], ["query", 3, 4]]),
    ]
    cases = [sqrt_case(arr, ops) for arr, ops in fixed]
    while len(cases) < count:
        n = RNG.randint(0, 20)
        arr = [RNG.randint(-20, 40) for _ in range(n)]
        cases.append(sqrt_case(arr, sqrt_ops(n, RNG.randint(1, 10))))
    return cases


# ---------- Mo's algorithm ----------


def mo_case(arr, queries):
    mo = MoSAlgorithm(arr)
    mo.arr = LoggedList(arr)
    moves = []
    seen_order = []
    real_add, real_remove = mo.add, mo.remove

    def add(current_ans, value, freq):
        out = real_add(current_ans, value, freq)
        moves.append(["add", mo.arr.reads[-1], out])
        return out

    def remove(current_ans, value, freq):
        out = real_remove(current_ans, value, freq)
        moves.append(["remove", mo.arr.reads[-1], out])
        return out

    def logged_sorted(iterable, key=None):
        result = sorted(iterable, key=key)
        seen_order.extend(idx for idx, _ in result)
        return result

    mo.add, mo.remove = add, remove
    mos_algorithm.sorted = logged_sorted
    mo.arr.start()
    try:
        answers = mo.process_queries([tuple(q) for q in queries])
    finally:
        del mos_algorithm.sorted
        mo.arr.stop()
    return {"arr": arr, "queries": queries, "blockSize": mo.block_size, "order": seen_order, "moves": moves, "answers": answers}


def mo_cases(count):
    textbook = [1, 1, 2, 1, 3, 4, 3, 3, 4]
    fixed = [
        (textbook, [[0, 4], [1, 3], [2, 6], [0, 8]]),
        (textbook, [[0, 4], [6, 8], [1, 3], [5, 7], [2, 6]]),
        ([1, 2, 1, 3, 2, 1, 4, 2, 3], [[0, 4], [2, 7], [3, 8], [1, 5]]),
        ([1, 2, 1, 3, 2, 3, 4], [[5, 6], [0, 0], [2, 4], [0, 6], [3, 3]]),
        ([5, 5, 5, 5], [[0, 3]]),
        ([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3], [[0, 15], [4, 7], [0, 3], [5, 5], [12, 15], [1, 13], [8, 11], [2, 2]]),
        # equal (block, r) keys: the stable sort keeps the input order
        ([2, 7, 2, 7, 2, 7, 2, 7, 2], [[1, 5], [0, 5], [2, 5], [0, 2], [1, 2]]),
        ([4], [[0, 0], [0, 0]]),
    ]
    cases = [mo_case(arr, qs) for arr, qs in fixed]
    while len(cases) < count:
        n = RNG.randint(1, 16)
        arr = [RNG.randint(0, RNG.choice([3, 6, 9])) for _ in range(n)]
        queries = []
        for _ in range(RNG.randint(1, 8)):
            left = RNG.randrange(n)
            queries.append([left, RNG.randrange(left, n)])
        cases.append(mo_case(arr, queries))
    return cases


# ---------- trees ----------


def adjacency(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    return adj


def random_tree(n):
    """A random tree with random labels and a random edge order (so adjacency order varies)."""
    label = list(range(n))
    RNG.shuffle(label)
    edges = []
    for v in range(1, n):
        u = RNG.randrange(v) if RNG.random() < 0.7 else RNG.randrange(max(0, v - 2), v)
        edges.append([label[u], label[v]] if RNG.random() < 0.5 else [label[v], label[u]])
    RNG.shuffle(edges)
    return edges


def path_edges(n):
    return [[i, i + 1] for i in range(n - 1)]


def star_edges(n):
    return [[0, i] for i in range(1, n)]


DEMO = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [4, 6]]
OVERVIEW = [[0, 1], [0, 2], [1, 3], [1, 4], [3, 6], [3, 7], [2, 5], [5, 8]]
SAMPLE5 = [[0, 1], [0, 2], [1, 3], [1, 4]]
FAR7 = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [3, 6]]
# two children of equal size under 0 and under 1: the first in adjacency order wins
TIES = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [3, 7], [4, 8]]
BINARY15 = [[i, 2 * i + 1] for i in range(7)] + [[i, 2 * i + 2] for i in range(7)]


# ---------- lowest common ancestor ----------

# A generator of its own, so adding these cases left the other sections' random cases unchanged.
LCA_RNG = random.Random(20261122)
# The tree of the topic README and article: depths up to 4, and lca(9, 8) jumps both nodes at k = 1.
TEN = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [3, 6], [3, 7], [5, 8], [6, 9]]


class TaggedReads(list):
    """A table row that appends [tag, index] to a shared log on every read, so the reads of rows interleave in order."""

    def __init__(self, items, tag, log):
        super().__init__(items)
        self.tag = tag
        self.log = log

    def __getitem__(self, index):
        self.log.append([self.tag, index])
        return list.__getitem__(self, index)


def lca_calls(obj, rows_attr, ops):
    """Run every op on obj with each row of obj.<rows_attr> logging its reads; the result or the exception's name."""
    log = []
    setattr(obj, rows_attr, [TaggedReads(row, k, log) for k, row in enumerate(getattr(obj, rows_attr))])
    out = []
    for kind, a, b in ops:
        del log[:]
        try:
            if kind == "lca":
                result = obj.lca(a, b)
            elif kind == "dist":
                result = obj.distance(a, b)
            else:
                result = obj.kth_ancestor(a, b)
        except (IndexError, ValueError, AttributeError) as error:
            result = type(error).__name__
        out.append({"result": result, "reads": list(log)})
    setattr(obj, rows_attr, [list(row) for row in getattr(obj, rows_attr)])
    return out


def lca_case(n, edges, root, ops):
    lifting = BinaryLiftingLCA(n, edges, root)
    tour = EulerTourLCA(n, edges, root)
    return {
        "n": n,
        "edges": edges,
        "root": root,
        "ops": ops,
        "parent": list(lifting.parent),
        "depth": list(lifting.depth),
        "levels": lifting.levels,
        "up": [list(row) for row in lifting.up],
        "euler": list(tour.euler),
        "first": list(tour.first),
        "sparse": [list(row) for row in tour.sparse],
        "lifting": lca_calls(lifting, "up", ops),
        "tour": lca_calls(tour, "sparse", ops),
    }


def lca_ops(n, count):
    ops = []
    for _ in range(count):
        kind = LCA_RNG.choice(["lca", "lca", "dist", "kth"])
        a = LCA_RNG.randrange(n) if LCA_RNG.random() > 0.05 else n + LCA_RNG.randint(0, 3)
        b = LCA_RNG.randrange(n + 2) if kind == "kth" else LCA_RNG.randrange(n) if LCA_RNG.random() > 0.05 else n + LCA_RNG.randint(0, 3)
        ops.append([kind, a, b])
    return ops


def lca_cases(count):
    every = lambda n: [[k, u, v] for k in ("lca", "dist") for u in range(n) for v in range(n)] + [["kth", v, k] for v in range(n) for k in range(n + 1)]  # noqa: E731
    fixed = [
        (10, TEN, 0, [["lca", 9, 4], ["lca", 9, 8], ["dist", 9, 8], ["kth", 9, 3], ["kth", 9, 5], ["lca", 7, 9], ["lca", 3, 3], ["dist", 6, 7]]),
        (10, TEN, 0, [["lca", 1, 9], ["lca", 6, 6], ["kth", 8, 2], ["kth", 0, 0], ["dist", 4, 4]]),
        (10, TEN, 4, [["lca", 9, 8], ["lca", 0, 3], ["dist", 9, 8], ["kth", 8, 4]]),
        (7, DEMO, 0, every(7)),
        (5, SAMPLE5, 2, every(5)),
        (9, OVERVIEW, 0, [["lca", 6, 4], ["lca", 8, 7], ["dist", 6, 4], ["kth", 7, 2]]),
        (12, path_edges(12), 0, [["lca", 11, 4], ["lca", 0, 11], ["kth", 11, 7], ["dist", 3, 9]]),
        (12, path_edges(12), 6, [["lca", 0, 11], ["lca", 2, 4], ["dist", 0, 11], ["kth", 11, 5], ["kth", 0, 7]]),
        (12, star_edges(12), 0, [["lca", 3, 5], ["lca", 0, 7], ["dist", 3, 5], ["kth", 9, 1], ["kth", 9, 2]]),
        (12, star_edges(12), 5, [["lca", 3, 9], ["lca", 0, 7], ["dist", 3, 9]]),
        (1, [], 0, [["lca", 0, 0], ["dist", 0, 0], ["kth", 0, 0], ["kth", 0, 1], ["lca", 0, 1]]),
        (2, [[0, 1]], 1, [["lca", 0, 1], ["kth", 0, 1], ["kth", 0, 2], ["dist", 1, 0]]),
        (4, [[0, 1], [0, 2], [1, 3]], 0, [["lca", 3, 2], ["lca", 3, 7], ["dist", 9, 0], ["kth", 4, 0]]),
        (12, [[(v - 1) // 2, v] for v in range(1, 12)], 0, [["lca", 7, 10], ["lca", 11, 8], ["dist", 7, 11], ["kth", 11, 3]]),
    ]
    cases = [lca_case(n, edges, root, ops) for n, edges, root, ops in fixed]
    while len(cases) < count:
        n = LCA_RNG.randint(1, 12)
        edges = random_tree_from(LCA_RNG, n)
        cases.append(lca_case(n, edges, LCA_RNG.randrange(n), lca_ops(n, LCA_RNG.randint(1, 8))))
    return cases


def random_tree_from(rng, n):
    """random_tree with its own generator."""
    label = list(range(n))
    rng.shuffle(label)
    edges = []
    for v in range(1, n):
        u = rng.randrange(v) if rng.random() < 0.7 else rng.randrange(max(0, v - 2), v)
        edges.append([label[u], label[v]] if rng.random() < 0.5 else [label[v], label[u]])
    rng.shuffle(edges)
    return edges


# ---------- heavy-light decomposition ----------


def hld_case(n, edges, root, ops):
    hld = HLD(n, adjacency(n, edges))
    size_writes = []
    pos_writes = []
    real_dfs, real_decompose = hld.dfs_size, hld.decompose

    def dfs_size(r, p):
        hld.size = LoggedList(hld.size)
        hld.size.start()
        try:
            return real_dfs(r, p)
        finally:
            hld.size.stop()
            size_writes.extend(hld.size.writes)

    def decompose(r, h):
        hld.pos = LoggedList(hld.pos)
        hld.pos.start()
        try:
            return real_decompose(r, h)
        finally:
            hld.pos.stop()
            pos_writes.extend(u for u, _ in hld.pos.writes)

    hld.dfs_size, hld.decompose = dfs_size, decompose
    hld.build(root)
    results = []
    for kind, u, v in ops:
        try:
            results.append(hld.lca(u, v) if kind == "lca" else [list(s) for s in hld.query_path(u, v)])
        except IndexError:
            results.append("IndexError")
    return {
        "n": n,
        "edges": edges,
        "root": root,
        "parent": list(hld.parent),
        "depth": list(hld.depth),
        "size": list(hld.size),
        "heavy": list(hld.heavy),
        "head": list(hld.head),
        "pos": list(hld.pos),
        "sizeWrites": size_writes,
        "posOrder": pos_writes,
        "ops": ops,
        "results": results,
    }


def hld_ops(n, count):
    ops = []
    for _ in range(count):
        u, v = RNG.randrange(n), RNG.randrange(n)
        if RNG.random() < 0.06:
            v = n + RNG.randint(0, 3)
        ops.append([RNG.choice(["lca", "path"]), u, v])
    return ops


def hld_cases(count):
    every = lambda n: [[k, u, v] for k in ("lca", "path") for u in range(n) for v in range(n)]  # noqa: E731
    fixed = [
        (7, DEMO, 0, [["lca", 3, 6], ["path", 3, 6], ["path", 5, 6], ["lca", 6, 5], ["path", 0, 0], ["lca", 3, 7]]),
        (9, OVERVIEW, 0, [["lca", 6, 4], ["lca", 8, 7], ["path", 6, 4], ["path", 8, 7], ["path", 7, 8]]),
        (5, SAMPLE5, 0, every(5)),
        (7, FAR7, 0, every(7)),
        (9, TIES, 0, [["path", 7, 8], ["path", 8, 6], ["lca", 7, 6]]),
        (15, BINARY15, 0, [["path", 7, 14], ["path", 10, 12], ["lca", 11, 13], ["path", 0, 9]]),
        (16, path_edges(16), 0, [["path", 15, 3], ["lca", 0, 15], ["path", 7, 7]]),
        (16, path_edges(16), 9, [["path", 15, 3], ["lca", 0, 15], ["path", 0, 15]]),
        (16, star_edges(16), 0, [["path", 3, 9], ["lca", 15, 1], ["path", 0, 5]]),
        (16, star_edges(16), 5, [["path", 3, 9], ["lca", 15, 1], ["path", 0, 5]]),
        (1, [], 0, [["lca", 0, 0], ["path", 0, 0], ["lca", 0, 1]]),
        (7, DEMO, 4, [["lca", 3, 6], ["path", 3, 6], ["path", 5, 3]]),
    ]
    cases = [hld_case(n, edges, root, ops) for n, edges, root, ops in fixed]
    while len(cases) < count:
        n = RNG.randint(1, 16)
        cases.append(hld_case(n, random_tree(n), RNG.randrange(n), hld_ops(n, RNG.randint(1, 8))))
    return cases


# ---------- centroid decomposition ----------


def centroid_case(n, edges, root):
    cd = CentroidDecomposition(n, adjacency(n, edges))
    cd.size = LoggedList(cd.size)
    calls = []
    real_decompose, real_dfs, real_find = cd.decompose, cd.dfs_size, cd.find_centroid

    def decompose(u, p):
        calls.append({"u": u, "p": p})
        return real_decompose(u, p)

    def dfs_size(u, p):
        cd.size.start()
        try:
            total = real_dfs(u, p)
        finally:
            cd.size.stop()
        calls[-1]["total"] = total
        calls[-1]["sizeWrites"] = cd.size.writes
        return total

    def find_centroid(u, p, total):
        cd.size.start()
        try:
            c = real_find(u, p, total)
        finally:
            cd.size.stop()
        calls[-1]["sizeReads"] = cd.size.reads
        calls[-1]["centroid"] = c
        return c

    cd.decompose, cd.dfs_size, cd.find_centroid = decompose, dfs_size, find_centroid
    cd.build(root)
    return {"n": n, "edges": edges, "root": root, "calls": calls, "parent": list(cd.parent), "tree": cd.get_centroid_tree()}


def centroid_cases(count):
    fixed = [
        (7, DEMO, 0),
        (5, SAMPLE5, 0),
        (9, OVERVIEW, 0),
        (9, TIES, 0),
        (15, path_edges(15), 0),
        (16, path_edges(16), 0),
        (16, path_edges(16), 15),
        (16, star_edges(16), 0),
        (16, star_edges(16), 7),
        (15, BINARY15, 0),
        (2, [[0, 1]], 0),
        (2, [[0, 1]], 1),
        (1, [], 0),
        (7, DEMO, 6),
    ]
    cases = [centroid_case(n, edges, root) for n, edges, root in fixed]
    while len(cases) < count:
        n = RNG.randint(1, 16)
        cases.append(centroid_case(n, random_tree(n), RNG.randrange(n)))
    return cases


def main():
    sections = {
        "sqrtDecomposition": sqrt_cases(50),
        "mosAlgorithm": mo_cases(60),
        "heavyLight": hld_cases(60),
        "centroid": centroid_cases(60),
        "lowestCommonAncestor": lca_cases(60),
    }
    header = {
        "generator": "web/scripts/gen_specializedTechniques_fixtures.py",
        "reference": "Algorithms/Advanced_Algorithms/Specialized_Techniques (square_root_decomposition.py, mos_algorithm.py, heavy_light_decomposition.py, centroid_decomposition.py, lowest_common_ancestor.py)",
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
