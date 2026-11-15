"""Generate golden fixtures for the network-flow and 2-SAT visualizations from the repository's Python code.

The web visualizer re-implements Ford-Fulkerson, Edmonds-Karp and the 2-SAT solver in
TypeScript (web/src/viz/algorithms/fordFulkerson.ts, edmondsKarp.ts and twoSat.ts). These
fixtures pin each port to its reference in Algorithms/Graph_Algorithms/Advanced_Graph:

- flow: for every network (edges in dict order, source, sink), Ford-Fulkerson's augmenting
  paths and bottlenecks (ford_fulkerson_with_path), the vertices each DFS reached in the
  order _find_path added them to `parent`, the final residual dict (rows and entries in dict
  order) and min_cut's two sides; Edmonds-Karp's paths and min_capacity values, the parent
  dict of every BFS in insertion order, its final residual dict and its value.
- twosat: for every formula (n and the add_clause calls), which calls raised IndexError,
  whether solve() raised, solve()'s answer and assignment, and the Tarjan component id of
  every node.

The values that the functions keep to themselves (a DFS's parent dict, edmonds_karp's
residual dict and the BFS parents, solve()'s comp list) are read with sys.setprofile when
the inner function returns. Run from anywhere:

    python3 web/scripts/gen_advancedGraph_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/advancedGraph.json. CI regenerates the file
and fails if it changed, which means the two implementations drifted.
"""

import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ADV = ROOT / "Algorithms" / "Graph_Algorithms" / "Advanced_Graph"
for folder in ("Network_Flow/Ford_Fulkerson/Python", "Network_Flow/Edmonds_Karp/Python", "2_SAT/Python"):
    sys.path.insert(0, str(ADV / folder))

import edmonds_karp as ek_module  # noqa: E402
import ford_fulkerson as ff_module  # noqa: E402
from two_sat import TwoSAT  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "advancedGraph.json"


def rows(residual):
    return [[u, [[v, c] for v, c in row.items()]] for u, row in residual.items()]


def flow_case(edges, source, sink):
    graph = {}
    for u, v, c in edges:
        graph.setdefault(u, {})[v] = c

    searches = []

    def profile(frame, event, arg):
        if event == "return" and frame.f_code.co_name == "_find_path":
            searches.append(list(frame.f_locals["parent"].keys()))

    if source == sink:
        ff_flow, ff_paths = ff_module.ford_fulkerson_with_path(graph, source, sink)
        ff_residual = []
    else:
        sys.setprofile(profile)
        try:
            ff_flow, ff_paths, residual = ff_module._run(graph, source, sink)
        finally:
            sys.setprofile(None)
        ff_residual = rows(residual)
        assert (ff_flow, ff_paths) == ff_module.ford_fulkerson_with_path(graph, source, sink)
    cut_value, side_s, side_t = ff_module.min_cut(graph, source, sink)

    ek_searches = []
    ek_paths = []
    ek_residual = []

    def ek_profile(frame, event, arg):
        if event != "return":
            return
        if frame.f_code.co_name == "bfs_find_path":
            ek_searches.append(list(frame.f_locals["parent"].keys()))
            if arg is not None:
                ek_paths.append([list(arg[0]), arg[1]])
        elif frame.f_code.co_name == "edmonds_karp" and "residual" in frame.f_locals:
            ek_residual.extend(rows(frame.f_locals["residual"]))

    sys.setprofile(ek_profile)
    try:
        ek_flow = ek_module.edmonds_karp(graph, source, sink)
    finally:
        sys.setprofile(None)

    return {
        "edges": [list(e) for e in edges],
        "source": source,
        "sink": sink,
        "ff": {
            "max_flow": ff_flow,
            "paths": [[list(p), b] for p, b in ff_paths],
            "searches": searches,
            "residual": ff_residual,
            "cut": [cut_value, sorted(side_s), sorted(side_t)],
        },
        "ek": {"max_flow": ek_flow, "paths": ek_paths, "searches": ek_searches, "residual": ek_residual},
    }


def parse_edges(text):
    edges = []
    for item in text.split(","):
        left, cap = item.strip().rsplit(" ", 1)
        u, v = left.split("->")
        edges.append((int(u), int(v), int(cap)))
    return edges


HAND_FLOW = [
    # The visualization's examples, in the same edge order.
    ("0->1 16, 0->2 13, 1->2 10, 1->3 12, 2->1 4, 2->4 14, 3->2 9, 3->5 20, 4->3 7, 4->5 4", 0, 5),
    ("0->1 10, 0->2 10, 1->2 1, 1->3 10, 2->3 10", 0, 3),
    ("0->1 4, 1->0 6, 1->2 5", 0, 2),
    ("0->1 0, 0->2 3, 1->3 9, 2->3 9", 0, 3),
    ("0->1 5, 2->3 5", 0, 3),
    # The repository tests: the small network, a sink without a key, the 1000/1 diamond in both orders.
    ("0->1 10, 0->2 5, 1->3 5, 1->4 3, 2->4 7, 3->5 8, 4->5 6", 0, 5),
    ("0->1 7, 1->2 3", 0, 2),
    ("0->1 99, 0->2 99, 1->3 99, 1->2 1, 2->3 99", 0, 3),
    ("0->1 99, 0->2 99, 1->2 1, 1->3 99, 2->3 99", 0, 3),
    # source == sink, and a source that only appears as the head of an edge.
    ("0->1 5, 1->2 5", 1, 1),
    ("1->0 5, 1->2 4", 0, 2),
]


def random_flow(rng):
    n = rng.randint(2, 7)
    pairs = {}
    for _ in range(rng.randint(1, 12)):
        u, v = rng.randrange(n), rng.randrange(n)
        if u != v and (u, v) not in pairs:
            pairs[(u, v)] = rng.choice([0, 1, 2, 3, 5, 8, 12]) if rng.random() < 0.85 else rng.randint(0, 12)
    if not pairs:
        pairs[(0, 1)] = rng.randint(1, 9)
    edges = [(u, v, c) for (u, v), c in pairs.items()]
    rng.shuffle(edges)
    used = []
    for u, v, _ in edges:
        for x in (u, v):
            if x not in used:
                used.append(x)
    source = used[0] if rng.random() < 0.6 else rng.choice(used)
    sink = rng.choice([x for x in used if x != source])
    return edges, source, sink


def sat_case(n, clauses):
    """Run TwoSAT(n) with add_clause for every pair; record what raised, the answer and comp."""
    solver = TwoSAT(n)
    raised = []
    for i, (a, b) in enumerate(clauses):
        try:
            solver.add_clause(a, b)
        except IndexError:
            raised.append(i)
    comp = []

    def profile(frame, event, arg):
        if event == "return" and frame.f_code.co_name == "solve":
            comp.extend(frame.f_locals["comp"])

    sys.setprofile(profile)
    try:
        ok, assignment = solver.solve()
        solve_raised = False
    except IndexError:
        ok, assignment, solve_raised = None, None, True
    finally:
        sys.setprofile(None)
    return {
        "n": n,
        "clauses": [list(c) for c in clauses],
        "raised": raised,
        "solve_raised": solve_raised,
        "ok": ok,
        "assignment": assignment,
        "comp": comp,
    }


HAND_SAT = [
    # The visualization's examples (implies(a, b) is add_clause(a ^ 1, b), force_true(a) is add_clause(a, a)).
    (2, [(0, 2), (1, 2), (1, 3)]),
    (2, [(0, 2), (0, 3), (1, 2), (1, 3)]),
    (4, [(1, 2), (3, 4), (5, 6), (0, 0)]),
    (2, [(1, 2), (3, 1), (0, 0)]),
    (3, [(0, 1), (2, 4), (5, 5)]),
    # The repository tests.
    (2, [(0, 2)]),
    (1, [(0, 1)]),
    (1, [(0, 0)]),
    (1, [(1, 1)]),
    (1, [(0, 0), (1, 1)]),
    (5, []),
    (3, [(0, 3), (1, 4), (2, 4)]),
    # Literals past 2n: IndexError before or after the first append.
    (2, [(0, 2), (0, 6), (2, 2)]),
    (1, [(6, 0), (0, 0)]),
    (2, [(9, 1), (2, 3)]),
]


def random_sat(rng):
    n = rng.randint(1, 6)
    clauses = []
    for _ in range(rng.randint(0, 16)):
        a = rng.randrange(2 * n)
        r = rng.random()
        b = a if r < 0.06 else a ^ 1 if r < 0.1 else rng.randrange(2 * n)
        clauses.append((a, b))
    return n, clauses


def main():
    rng = random.Random(20261115)
    flow = [flow_case(parse_edges(text), s, t) for text, s, t in HAND_FLOW]
    flow += [flow_case(*random_flow(rng)) for _ in range(140)]
    sat = [sat_case(n, clauses) for n, clauses in HAND_SAT]
    sat += [sat_case(*random_sat(rng)) for _ in range(160)]
    sections = {"flow": flow, "twosat": sat}
    header = {
        "generator": "web/scripts/gen_advancedGraph_fixtures.py",
        "reference": "Algorithms/Graph_Algorithms/Advanced_Graph (Network_Flow/Ford_Fulkerson/Python/ford_fulkerson.py, Network_Flow/Edmonds_Karp/Python/edmonds_karp.py, 2_SAT/Python/two_sat.py)",
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
