"""Generate golden heap and graph-representation fixtures from the repository's Python code.

The web visualizer re-implements these topics in TypeScript: the min and max heap
(web/src/viz/algorithms/binaryHeap.ts), the Fibonacci heap (fibonacciHeap.ts) and the five
graph representations (graphRepresentations.ts: AdjacencyList, AdjacencyMatrix, EdgeList,
Graph and WeightedGraph). These fixtures pin each port to its reference in
Data_Structures/Non_Linear/Heaps and Data_Structures/Non_Linear/Graph:

- binary heaps: the array after the constructor (bottom-up heapify) and after every
  operation, and every return value or exception, so the sift order and the tie rules count;
- Fibonacci heap: after every operation, every tree (key, degree, marked, children in
  child-ring order) in root-list order starting at min_node, the count and the return value,
  so the splice position, the consolidation order, the choice of min_node, the cuts, the
  cascading cuts and the marks count. decrease_key and delete name their handle by its index
  in insert order (the keys of a merge included), so a stale handle can be pinned too;
- graph representations: after every operation, the stored form as Python prints it (the
  dict of lists, the matrix and its presence table, the list of edge tuples) and the repr of
  the return value or the exception name, so int / float weights, list order and the
  "remove first, then append" rules count.

Run from anywhere:

    python3 web/scripts/gen_heapsGraphs_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/heapsGraphs.json. CI regenerates the file and
fails if it changed, which means the two implementations drifted.
"""

import json
import random
import sys
from pathlib import Path

sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parents[2]
NL = ROOT / "Data_Structures" / "Non_Linear"
for folder in (
    "Heaps/Min_Heap/Python",
    "Heaps/Max_Heap/Python",
    "Heaps/Fibonacci_Heap/Python",
    "Graph/Adjacency_List/Python",
    "Graph/Adjacency_Matrix/Python",
    "Graph/Edge_List/Python",
    "Graph/Directed_and_Undirected/Python",
    "Graph/Weighted_and_Unweighted/Python",
):
    sys.path.insert(0, str(NL / folder))

from adjacency_list import AdjacencyList  # noqa: E402
from adjacency_matrix import AdjacencyMatrix  # noqa: E402
from edge_list import EdgeList  # noqa: E402
from fibonacci_heap import FibonacciHeap  # noqa: E402
from graph import Graph  # noqa: E402
from max_heap import MaxHeap  # noqa: E402
from min_heap import MinHeap  # noqa: E402
from weighted_graph import WeightedGraph  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "heapsGraphs.json"
RNG = random.Random(20261114)


# ---------- binary heaps ----------

HEAP_FIXED = [
    (None, [["insert", 5], ["insert", 3], ["insert", 8], ["insert", 1], ["extract"], ["peek"], ["size"]]),
    ([9, 5, 7, 1, 3, 8, 2], [["extract"], ["extract"], ["insert", 0], ["peek"]]),
    ([1, 3, 2, 5, 9, 8, 7], [["extract"], ["extract"], ["extract"], ["extract"], ["extract"], ["extract"], ["extract"], ["extract"], ["is_empty"]]),
    (None, [["extract"], ["peek"], ["insert", 4], ["insert", 4], ["insert", 4], ["extract"], ["clear"], ["is_empty"], ["size"]]),
    ([2, 2, 1, 1, 3, 3, 2], [["insert", 2], ["extract"], ["extract"], ["extract"]]),
    ([], [["insert", -5], ["insert", 999], ["insert", -99], ["extract"]]),
    ([7], [["extract"], ["extract"]]),
    ([15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1], [["extract"], ["extract"], ["insert", 16], ["insert", 0]]),
]


def heap_ops(live, count):
    ops = []
    for _ in range(count):
        r = RNG.random()
        if (r < 0.55 and live < 15) or live == 0 and r < 0.8:
            ops.append(["insert", RNG.randint(-5, 20)])
            live += 1
        elif r < 0.85:
            ops.append(["extract"])
            live = max(0, live - 1)
        elif r < 0.92:
            ops.append(["peek"])
        elif r < 0.96:
            ops.append(["size"])
        elif r < 0.98:
            ops.append(["is_empty"])
        else:
            ops.append(["clear"])
            live = 0
    return ops


def heap_case(cls, build, ops):
    heap = cls() if build is None else cls(build)
    initial = list(heap.heap)
    extract = heap.extract_min if cls is MinHeap else heap.extract_max
    steps = []
    for op in ops:
        result = error = None
        try:
            if op[0] == "insert":
                result = repr(heap.insert(op[1]))
            elif op[0] == "extract":
                result = repr(extract())
            elif op[0] == "peek":
                result = repr(heap.peek())
            elif op[0] == "size":
                result = repr(heap.size())
            elif op[0] == "is_empty":
                result = repr(heap.is_empty())
            else:
                result = repr(heap.clear())
        except IndexError:
            error = "IndexError"
        steps.append({"result": result, "error": error, "heap": list(heap.heap)})
    return {"build": build, "ops": ops, "initial": initial, "steps": steps}


def heap_cases(cls, count):
    cases = [heap_case(cls, build, ops) for build, ops in HEAP_FIXED]
    while len(cases) < count:
        build = None
        if RNG.random() < 0.5:
            build = [RNG.randint(-5, 20) for _ in range(RNG.randint(0, 15))]
        live = len(build) if build else 0
        cases.append(heap_case(cls, build, heap_ops(live, RNG.randint(1, 25))))
    return cases


# ---------- Fibonacci heap ----------


def ring(start):
    out = []
    if start is None:
        return out
    cur = start
    while True:
        out.append(cur)
        cur = cur.right
        if cur is start:
            return out


def dump(node):
    return [node.key, node.degree, node.marked, [dump(c) for c in ring(node.child)]]


FIB_FIXED = [
    [["insert", k] for k in (5, 3, 7, 1, 9, 2, 8)] + [["extract"], ["extract"], ["peek"], ["size"]],
    [["insert", k] for k in range(1, 16)] + [["extract"]] * 6,
    [["extract"], ["peek"], ["insert", 4], ["insert", 4], ["insert", 4], ["insert", 4], ["extract"], ["extract"], ["is_empty"], ["clear"], ["is_empty"]],
    [["build", [3, 1, 2]], ["insert", 2], ["insert", 1], ["extract"], ["extract"], ["extract"]],
    [["insert", k] for k in (9, 8, 7, 6, 5, 4, 3, 2, 1)] + [["extract"], ["insert", 0], ["extract"], ["extract"]],
]

# decrease_key, delete and merge: the cases of the topic README, the article and the
# visualizer's examples, then the edge cases. Handles are numbered in insert order.
FIB_HANDLE_FIXED = [
    # the cascading cut of the README trace
    [["insert", k] for k in range(9)] + [["extract"], ["decrease_key", 8, 0], ["decrease_key", 6, 3], ["decrease_key", 7, 1], ["extract"], ["extract"]],
    # delete: a cascade, then a leaf whose parent is marked
    [["insert", k] for k in range(9)] + [["extract"], ["decrease_key", 6, 0], ["delete", 7], ["delete", 4], ["extract"]],
    # merge into a heap, into an empty heap, an empty other, a tie
    [["insert", 5], ["insert", 3], ["insert", 7], ["merge", [4, 1, 6]], ["extract"], ["merge", []], ["merge", [1]], ["extract"], ["extract"]],
    [["merge", [8, 2, 5]], ["merge", []], ["extract"], ["delete", 0]],
    # errors: build, empty heap, a stale handle, a larger key, deleting twice, a cleared handle
    [["build", [3, 1, 2]], ["extract"], ["insert", 4], ["insert", 9], ["extract"], ["decrease_key", 0, 1], ["decrease_key", 1, 12],
     ["delete", 1], ["delete", 1], ["insert", 6], ["clear"], ["decrease_key", 2, 0], ["is_empty"]],
    # equal keys: decrease to the same key, a tie with min_node, delete among duplicates
    [["insert", 4], ["insert", 4], ["insert", 4], ["decrease_key", 1, 4], ["delete", 1], ["extract"], ["decrease_key", 2, 4], ["extract"]],
    # a cascade that climbs two levels in a tree of 16 nodes
    [["insert", k] for k in range(15)] + [["extract"], ["decrease_key", 14, 0], ["decrease_key", 12, 0], ["decrease_key", 8, 0], ["decrease_key", 13, 0], ["extract"]],
    # the script that the C++ and Go tests pin as well
    [["insert", k] for k in (5, 3, 7, 1, 9, 2, 8, 6, 4, 0)]
    + [["extract"], ["decrease_key", 4, 0], ["decrease_key", 6, 2], ["decrease_key", 0, 5], ["decrease_key", 1, 4], ["delete", 2],
       ["merge", [4, 1, 10]], ["extract"], ["delete", 11], ["decrease_key", 12, -1], ["extract"], ["decrease_key", 7, -2],
       ["delete", 8], ["extract"], ["delete", 9], ["peek"]],
]


def fib_ops(count):
    ops = []
    live = 0
    for _ in range(count):
        r = RNG.random()
        if (r < 0.6 and live < 15) or live == 0 and r < 0.85:
            ops.append(["insert", RNG.randint(-3, 12)])
            live += 1
        elif r < 0.9:
            ops.append(["extract"])
            live = max(0, live - 1)
        elif r < 0.95:
            ops.append(["peek"])
        elif r < 0.98:
            ops.append(["size"])
        else:
            ops.append(["clear"])
            live = 0
    return ops


def fib_case(ops):
    heap = FibonacciHeap()
    handles = []
    steps = []
    for op in ops:
        result = error = None
        try:
            if op[0] == "build":
                FibonacciHeap(op[1])
            elif op[0] == "insert":
                handles.append(heap.insert(op[1]))
                result = repr(handles[-1])
            elif op[0] == "decrease_key":
                result = repr(heap.decrease_key(handles[op[1]], op[2]))
            elif op[0] == "delete":
                result = repr(heap.delete(handles[op[1]]))
            elif op[0] == "merge":
                other = FibonacciHeap()
                handles.extend(other.insert(k) for k in op[1])
                result = repr(heap.merge(other))
            elif op[0] == "extract":
                result = repr(heap.extract_min())
            elif op[0] == "peek":
                result = repr(heap.peek())
            elif op[0] == "size":
                result = repr(heap.size())
            elif op[0] == "is_empty":
                result = repr(heap.is_empty())
            else:
                result = repr(heap.clear())
        except IndexError:
            error = "IndexError"
        except TypeError:
            error = "TypeError"
        except ValueError:
            error = "ValueError"
        steps.append({"result": result, "error": error, "roots": [dump(n) for n in ring(heap.min_node)], "count": heap.count})
    return {"ops": ops, "steps": steps}


def fib_handle_ops(rng, count):
    """A random script with handles, run on a real heap so that it stays within 15 keys."""
    heap = FibonacciHeap()
    handles = []
    ops = []
    while len(ops) < count:
        r = rng.random()
        if (r < 0.4 and heap.count < 15) or heap.count == 0 and r < 0.8:
            op = ["insert", rng.randint(-3, 12)]
        elif r < 0.6 and handles:
            h = rng.randrange(len(handles))
            # Mostly a real decrease; sometimes a larger key, which raises ValueError.
            op = ["decrease_key", h, handles[h].key + (1 if rng.random() < 0.1 else -rng.randint(0, 6))]
        elif r < 0.7 and handles:
            op = ["delete", rng.randrange(len(handles))]
        elif r < 0.78 and heap.count < 12:
            op = ["merge", [rng.randint(-3, 12) for _ in range(rng.randint(0, 3))]]
        elif r < 0.95:
            op = ["extract"]
        elif r < 0.98:
            op = ["peek"]
        else:
            op = ["clear"]
        try:
            if op[0] == "insert":
                handles.append(heap.insert(op[1]))
            elif op[0] == "decrease_key":
                heap.decrease_key(handles[op[1]], op[2])
            elif op[0] == "delete":
                heap.delete(handles[op[1]])
            elif op[0] == "merge":
                other = FibonacciHeap()
                handles.extend(other.insert(k) for k in op[1])
                heap.merge(other)
            elif op[0] == "extract":
                heap.extract_min()
            elif op[0] == "peek":
                heap.peek()
            else:
                heap.clear()
        except (IndexError, ValueError):
            pass
        ops.append(op)
    return ops


def fib_cases(count):
    cases = [fib_case(ops) for ops in FIB_FIXED]
    while len(cases) < count:
        cases.append(fib_case(fib_ops(RNG.randint(1, 30))))
    # The handle cases draw from their own generator, so the cases above and the graph
    # cases below keep the random numbers they always had.
    rng = random.Random(20261122)
    cases += [fib_case(ops) for ops in FIB_HANDLE_FIXED]
    for _ in range(80):
        cases.append(fib_case(fib_handle_ops(rng, rng.randint(1, 30))))
    return cases


# ---------- graph representations ----------

CLASSES = {"list": AdjacencyList, "matrix": AdjacencyMatrix, "edges": EdgeList, "graph": Graph, "weighted": WeightedGraph}


def make_graph(mode, directed, weighted, n):
    if mode == "list":
        return AdjacencyList(n or 0, directed=directed, weighted=weighted)
    if mode == "matrix":
        return AdjacencyMatrix(n, directed=directed, weighted=weighted)
    if mode == "edges":
        return EdgeList(directed=directed, weighted=weighted)
    if mode == "graph":
        return Graph(directed=directed)
    return WeightedGraph(directed=directed)


def stored(mode, g):
    """The stored form as Python prints it."""
    if mode == "matrix":
        return repr(g.matrix) + " " + repr(g.present)
    if mode == "edges":
        return repr(g.edges) + " " + repr(sorted(g.vertices))
    return repr(list(g.adjacency_list.items()))


def weight_value(text):
    return float(text) if "." in text else int(text)


def graph_case(mode, directed, weighted, n, ops):
    g = make_graph(mode, directed, weighted, n)
    initial = stored(mode, g)
    steps = []
    for op in ops:
        kind, args = op[0], op[1:]
        result = error = None
        try:
            method = getattr(g, kind)
            if kind == "add_edge":
                u, v, w = args
                result = repr(method(u, v) if w is None else method(u, v, weight_value(w)))
            else:
                result = repr(method(*args))
        except (AttributeError, TypeError, ValueError) as exc:
            error = type(exc).__name__
        steps.append({"result": result, "error": error, "state": stored(mode, g)})
    return {"mode": mode, "directed": directed, "weighted": weighted, "n": n, "ops": ops, "initial": initial, "steps": steps}


def e(u, v, w=None):
    return ["add_edge", u, v, w]


SHARED_FIXED = [
    # (directed, weighted, n, ops): run on AdjacencyList, AdjacencyMatrix and EdgeList alike
    (False, False, 4, [e(0, 1), e(0, 2), e(1, 2), e(2, 3), ["has_edge", 1, 0], ["get_neighbors", 2], ["remove_edge", 0, 2], ["has_edge", 2, 0], ["get_degree", 2], ["get_edge_count"]]),
    (True, True, 4, [e(0, 1, "4"), e(1, 2, "2.5"), e(2, 0, "1"), e(0, 1, "7"), e(1, 0), ["get_weight", 0, 1], ["get_weight", 1, 0], ["get_degree", 0], ["get_neighbors", 1], ["remove_edge", 1, 0], ["get_edge_count"]]),
    (False, True, 3, [e(0, 1, "0"), e(1, 1, "3"), e(1, 2, "-1"), ["has_edge", 0, 1], ["get_weight", 0, 1], ["get_weight", 1, 1], ["get_edge_count"], ["remove_edge", 1, 1], ["get_edge_count"], ["get_degree", 1]]),
    (False, False, 3, [e(0, 0), e(0, 1), e(0, 1), e(1, 0), ["get_edge_count"], ["get_degree", 0], ["remove_edge", 2, 0], ["remove_edge", 0, 1], ["has_edge", 1, 0]]),
    (False, False, 3, [e(0, 5), e(2, 1, "9"), ["has_edge", 7, 1], ["remove_edge", 0, 9], ["add_vertex", 6], ["get_neighbors", 9], ["get_weight", 2, 1], ["get_total_weight"]]),
    (True, False, 4, [e(0, 1), e(1, 0), e(2, 2), e(3, 2), ["get_degree", 2], ["get_degree", 0], ["get_neighbors", 0], ["has_edge", 1, 0], ["remove_edge", 0, 1], ["has_edge", 1, 0]]),
]

GRAPH_FIXED = [
    (False, None, [e(0, 1), e(0, 2), e(1, 2), e(0, 1), e(2, 2), ["get_neighbors", 2], ["get_degree", 2], ["remove_edge", 1, 2], ["has_edge", 2, 1]]),
    (True, None, [e(0, 1), e(1, 2), e(2, 0), e(0, 1), e(1, 1), ["get_degree", 1], ["get_degree", 0], ["has_edge", 1, 0], ["remove_edge", 2, 0], ["get_neighbors", 2]]),
    (False, None, [["add_vertex", 3], ["add_vertex", 3], e(3, 4, "2"), ["get_weight", 3, 4], ["remove_edge", 5, 3], ["get_edge_count"], ["get_degree", 9]]),
]

WEIGHTED_FIXED = [
    (False, None, [e(0, 1, "4"), e(1, 2, "2.5"), e(0, 2), e(0, 1, "1"), ["get_weight", 1, 0], ["get_total_weight"], e(2, 2, "0.1"), ["get_total_weight"], ["remove_edge", 0, 1], ["get_total_weight"]]),
    (True, None, [e(0, 1, "3"), e(1, 0, "5"), e(0, 1, "0.5"), ["get_weight", 0, 1], ["get_weight", 1, 0], ["get_total_weight"], ["has_edge", 2, 0], ["get_neighbors", 0], ["get_degree", 0]]),
    (False, None, [["add_vertex", 4], e(4, 4), e(0, 4, "-2"), ["get_total_weight"], ["remove_edge", 4, 4], ["get_neighbors", 4]]),
]

WEIGHTS = [None, None, "1", "2", "3", "5", "2.5", "0", "-1", "1.0", "0.1", "0.2"]


def random_graph_ops(mode, directed, top, count):
    """A random script; at most 12 live edges, as the visualizer allows."""
    ops = []
    live = set()
    for _ in range(count):
        u, v = RNG.randint(0, top), RNG.randint(0, top)
        key = (u, v) if directed else (min(u, v), max(u, v))
        r = RNG.random()
        if r < 0.45 and (key in live or len(live) < 12):
            w = RNG.choice(WEIGHTS)
            if mode == "graph" and RNG.random() < 0.9:
                w = None
            ops.append(e(u, v, w))
            live.add(key)
        elif r < 0.6:
            ops.append(["remove_edge", u, v])
            live.discard(key)
        elif r < 0.7:
            ops.append(["has_edge", u, v])
        elif r < 0.77:
            ops.append(["get_weight", u, v])
        elif r < 0.84:
            ops.append(["get_neighbors", u])
        elif r < 0.9:
            ops.append(["get_degree", u])
        elif r < 0.94:
            ops.append(["add_vertex", u])
        elif r < 0.97:
            ops.append(["get_edge_count"])
        else:
            ops.append(["get_total_weight"])
    return ops


def graph_cases():
    cases = []
    for directed, weighted, n, ops in SHARED_FIXED:
        for mode in ("list", "matrix", "edges"):
            cases.append(graph_case(mode, directed, weighted, n, ops))
    for directed, n, ops in GRAPH_FIXED:
        cases.append(graph_case("graph", directed, False, n, ops))
    for directed, n, ops in WEIGHTED_FIXED:
        cases.append(graph_case("weighted", directed, True, n, ops))
    for mode in ("list", "matrix", "edges", "graph", "weighted"):
        for _ in range(24):
            directed = RNG.random() < 0.5
            weighted = mode == "weighted" or (mode != "graph" and RNG.random() < 0.5)
            n = RNG.randint(2, 6) if mode == "matrix" else (RNG.choice([None, None, 3, 5]) if mode == "list" else None)
            top = 6 if mode == "matrix" else 5
            cases.append(graph_case(mode, directed, weighted, n, random_graph_ops(mode, directed, top, RNG.randint(1, 24))))
    return cases


def main():
    sections = {
        "minHeap": heap_cases(MinHeap, 60),
        "maxHeap": heap_cases(MaxHeap, 60),
        "fibonacciHeap": fib_cases(80),
        "graphs": graph_cases(),
    }
    header = {
        "generator": "web/scripts/gen_heapsGraphs_fixtures.py",
        "reference": "Data_Structures/Non_Linear/Heaps (min_heap.py, max_heap.py, fibonacci_heap.py); Data_Structures/Non_Linear/Graph (adjacency_list.py, adjacency_matrix.py, edge_list.py, graph.py, weighted_graph.py)",
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
