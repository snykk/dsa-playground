"""Generate golden fixtures for the network-flow, 2-SAT, matching and Eulerian-path visualizations from the repository's Python code.

The web visualizer re-implements Ford-Fulkerson, Edmonds-Karp, the 2-SAT solver, Kuhn's
algorithm, Hopcroft-Karp and Dinic's algorithm in TypeScript (web/src/viz/algorithms/fordFulkerson.ts,
edmondsKarp.ts, twoSat.ts, bipartiteMatching.ts and dinic.ts). These fixtures pin each port to its
reference in Algorithms/Graph_Algorithms/Advanced_Graph. Hierholzer's algorithm
(eulerianPath.ts, from Eulerian_Path/Python/eulerian_path.py) is pinned the same way:

- flow: for every network (edges in dict order, source, sink), Ford-Fulkerson's augmenting
  paths and bottlenecks (ford_fulkerson_with_path), the vertices each DFS reached in the
  order _find_path added them to `parent`, the final residual dict (rows and entries in dict
  order) and min_cut's two sides; Edmonds-Karp's paths and min_capacity values, the parent
  dict of every BFS in insertion order, its final residual dict and its value.
- twosat: for every formula (n and the add_clause calls), which calls raised IndexError,
  whether solve() raised, solve()'s answer and assignment, and the Tarjan component id of
  every node.
- matching: for every bipartite graph (n_left, n_right and the edges in order), kuhn's size
  and match_left, and for each root the augmenting path it flipped (left and right vertices
  in turn) or null, and the right vertices its search marked seen; hopcroft_karp's size and
  match_left, and for each phase the last layer and the dist list _bfs_layers left, then each
  root's path or null and dist after its search; min_vertex_cover's two lists.
- dinic: for every network (edges in dict order, source, sink), each phase's level dict in
  BFS order and, for each _find_path call, the path or null, the entries it looked at and
  what _push returned; the final residual dict, and dinic_flow's value, flows (rows and
  entries in graph order), source side, phases and edge visits.
- euler: for every graph (n, directed and the edges in order), the (kind, start) that
  _degree_check returned, the vertices and edge_ids that _hierholzer returned (the walk of the
  start's component, null when the degree check failed or there is no edge), eulerian_kind's
  answer and eulerian_path's walk or null.

The values that the functions keep to themselves (a DFS's parent dict, edmonds_karp's
residual dict and the BFS parents, solve()'s comp list, the matching searches' stack, path
and dist lists, dinic's levels, searches and residual dict) are read with sys.setprofile when
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
for folder in ("Network_Flow/Ford_Fulkerson/Python", "Network_Flow/Edmonds_Karp/Python", "2_SAT/Python", "Bipartite_Matching/Python",
               "Network_Flow/Dinic/Python"):
    sys.path.insert(0, str(ADV / folder))
sys.path.insert(0, str(ADV / "Eulerian_Path" / "Python"))

import bipartite_matching as bm_module  # noqa: E402
import dinic as dinic_module  # noqa: E402
import edmonds_karp as ek_module  # noqa: E402
import eulerian_path as eu_module  # noqa: E402
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


def dinic_case(edges, source, sink):
    """Run dinic_flow; record every phase's levels and every search, and the final residual dict."""
    graph = {}
    for u, v, c in edges:
        graph.setdefault(u, {})[v] = c
    phases = []
    residual = []

    def profile(frame, event, arg):
        if event != "return":
            return
        name = frame.f_code.co_name
        if name == "_bfs_levels":
            phases.append({"level": [[v, d] for v, d in arg.items()], "searches": []})
        elif name == "_find_path":
            path, visits = arg
            phases[-1]["searches"].append({"path": path, "visits": visits, "pushed": None})
        elif name == "_push":
            phases[-1]["searches"][-1]["pushed"] = arg
        elif name == "_run":
            residual.extend(rows(arg[1]))

    sys.setprofile(profile)
    try:
        result = dinic_module.dinic_flow(graph, source, sink)
    finally:
        sys.setprofile(None)
    assert result.max_flow == dinic_module.dinic(graph, source, sink)
    return {
        "edges": [list(e) for e in edges],
        "source": source,
        "sink": sink,
        "max_flow": result.max_flow,
        "phases": phases,
        "residual": residual,
        "flows": rows(result.flows),
        "source_side": result.source_side,
        "phase_count": result.phases,
        "edge_visits": result.edge_visits,
    }


HAND_DINIC = [
    # The visualization's examples, in the same edge order.
    ("0->1 16, 0->2 13, 1->2 10, 1->3 12, 2->1 4, 2->4 14, 3->2 9, 3->5 20, 4->3 7, 4->5 4", 0, 5),
    ("0->1 2, 1->2 1, 1->3 1, 1->4 1, 1->5 1, 4->6 1, 5->6 1", 0, 6),
    ("0->1 1, 0->2 1, 0->3 1, 1->4 1, 1->5 1, 2->4 1, 3->5 1, 3->6 1, 4->7 1, 5->7 1, 6->7 1", 0, 7),
    ("0->1 10, 0->2 10, 1->2 1, 1->3 10, 2->3 10", 0, 3),
    ("0->1 4, 1->0 6, 1->2 5", 0, 2),
    ("0->1 5, 2->3 5", 0, 3),
    # The repository tests: flow through both anti-parallel edges, a zero capacity, a sink and a
    # source without a key, the 1000/1 diamond (99 here). The second example is the comb, k = 2.
    ("0->1 2, 0->2 3, 1->2 2, 1->3 3, 2->1 2, 2->3 1", 0, 3),
    ("0->1 0, 0->2 3, 1->3 9, 2->3 9", 0, 3),
    ("0->1 7, 1->2 3", 0, 2),
    ("1->0 5, 1->2 4", 0, 2),
    ("0->1 99, 0->2 99, 1->2 1, 1->3 99, 2->3 99", 0, 3),
    # source == sink.
    ("0->1 5, 1->2 5", 1, 1),
]


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


def matching_path(stack, through):
    """The flipped augmenting path as left and right vertices in turn: u0, v0, u1, v1, ..."""
    path = []
    for u, v in zip(stack, through):
        path += [u, v]
    return path


def matching_case(n_left, n_right, edges):
    """Run kuhn, hopcroft_karp and min_vertex_cover; record every search they make."""
    roots = []
    phases = []

    def profile(frame, event, arg):
        if event != "return":
            return
        name = frame.f_code.co_name
        loc = frame.f_locals
        if name == "_kuhn_augment":
            root = loc["root"]
            roots.append({
                "root": root,
                "path": matching_path(loc["stack"], loc["through"]) if arg else None,
                "seen": [v for v, mark in enumerate(loc["seen"]) if mark == root],
            })
        elif name == "_bfs_layers":
            phases.append({"last": arg, "dist": list(loc["dist"]), "augments": []})
        elif name == "_hk_augment":
            phases[-1]["augments"].append({
                "root": loc["root"],
                "path": matching_path(loc["stack"], loc["through"]) if arg else None,
                "dist": list(loc["dist"]),
            })

    sys.setprofile(profile)
    try:
        k_size, k_match = bm_module.kuhn(n_left, n_right, edges)
        h_size, h_match = bm_module.hopcroft_karp(n_left, n_right, edges)
    finally:
        sys.setprofile(None)
    cover_left, cover_right = bm_module.min_vertex_cover(n_left, n_right, edges)
    return {
        "n_left": n_left,
        "n_right": n_right,
        "edges": [list(e) for e in edges],
        "kuhn": {"size": k_size, "match_left": k_match, "roots": roots},
        "hk": {"size": h_size, "match_left": h_match, "phases": phases},
        "cover": [cover_left, cover_right],
    }


HAND_MATCHING = [
    # The visualization's examples.
    (4, 4, [(0, 1), (0, 2), (0, 3), (1, 0), (1, 1), (2, 0), (3, 1)]),
    (4, 4, [(0, 0), (0, 1), (1, 1), (1, 2), (2, 2), (2, 3), (3, 0)]),
    (4, 4, [(0, 1), (0, 2), (1, 0), (1, 3), (2, 0), (3, 1)]),
    (3, 3, [(u, v) for u in range(3) for v in range(3)]),
    (4, 3, [(0, 0), (1, 0), (2, 0), (2, 1)]),
    # The repository tests: no edges, empty sides, duplicates, K3,5 and K5,3, K2,2 in both
    # orders, vertices without neighbours, stars.
    (3, 2, []),
    (0, 3, []),
    (2, 0, []),
    (1, 1, [(0, 0)]),
    (3, 2, [(0, 0), (0, 0), (1, 0), (1, 1), (1, 0), (2, 1), (2, 1)]),
    (3, 5, [(u, v) for u in range(3) for v in range(5)]),
    (5, 3, [(u, v) for u in range(5) for v in range(3)]),
    (2, 2, [(0, 0), (0, 1), (1, 0), (1, 1)]),
    (2, 2, [(1, 1), (1, 0), (0, 1), (0, 0)]),
    (3, 3, [(0, 0), (2, 1), (2, 0)]),
    (4, 1, [(u, 0) for u in range(4)]),
    (6, 6, [(u, u) for u in range(5)] + [(u, u + 1) for u in range(5)] + [(5, 0)]),
]


def random_matching(rng):
    """1 to 7 vertices a side, up to 20 random edges; a repeated edge now and then."""
    n_left = rng.randint(1, 7)
    n_right = rng.randint(1, 7)
    edges = []
    for _ in range(rng.randint(0, 20)):
        if edges and rng.random() < 0.08:
            edges.append(rng.choice(edges))
        else:
            edges.append((rng.randrange(n_left), rng.randrange(n_right)))
    return n_left, n_right, edges


def euler_case(n, directed, edges):
    """Run eulerian_path and eulerian_kind; record the degree check and the walk _hierholzer returned."""
    seen = {}

    def profile(frame, event, arg):
        if event != "return":
            return
        name = frame.f_code.co_name
        if name == "_degree_check":
            seen["degrees"] = {"kind": arg[0], "start": arg[1]}
        elif name == "_hierholzer":
            seen["walked"] = {"vertices": list(arg[0]), "edge_ids": list(arg[1])}

    sys.setprofile(profile)
    try:
        walk = eu_module.eulerian_path(n, edges, directed)
    finally:
        sys.setprofile(None)
    return {
        "n": n,
        "directed": directed,
        "edges": [list(e) for e in edges],
        "degrees": seen["degrees"],
        "walked": seen.get("walked"),
        "kind": eu_module.eulerian_kind(n, edges, directed),
        "walk": None if walk is None else {"vertices": walk.vertices, "edge_ids": walk.edge_ids},
    }


HAND_EULER = [
    # The visualization's examples.
    (6, False, [(0, 3), (0, 1), (1, 2), (2, 0), (3, 4), (4, 5), (5, 3)]),
    (5, True, [(0, 1), (1, 4), (1, 2), (2, 3), (3, 1)]),
    (5, False, [(0, 1), (1, 2), (2, 3), (3, 0), (0, 2), (1, 3), (2, 4), (3, 4)]),
    (4, True, [(0, 1), (1, 2), (2, 0), (2, 3)]),
    (4, False, [(0, 1), (0, 2), (0, 3), (1, 2), (1, 3), (2, 3)]),
    (7, False, [(0, 1), (1, 2), (2, 0), (3, 4), (4, 5), (5, 3)]),
    # The repository tests: Konigsberg and an eighth bridge, no edges, loops, parallel edges,
    # isolated vertices, the tie rule, degree failures.
    (4, False, [(0, 1), (0, 1), (0, 2), (0, 2), (0, 3), (1, 3), (2, 3)]),
    (4, False, [(0, 1), (0, 1), (0, 2), (0, 2), (0, 3), (1, 3), (2, 3), (1, 2)]),
    (0, False, []),
    (4, True, []),
    (1, False, [(0, 0)]),
    (1, True, [(0, 0)]),
    (3, False, [(0, 1), (1, 1), (1, 2)]),
    (2, False, [(0, 1), (0, 1), (0, 1)]),
    (2, True, [(0, 1), (1, 0), (0, 1)]),
    (6, False, [(3, 4)]),
    (3, False, [(0, 1), (1, 0), (2, 2)]),
    (4, True, [(0, 1), (1, 3), (3, 0), (3, 2)]),
    (3, False, [(2, 1), (1, 0)]),
    (5, False, [(0, 1), (1, 2), (2, 0), (0, 3), (3, 4), (4, 0)]),
    (5, False, [(0, 1), (1, 2), (2, 0), (1, 3), (3, 4), (4, 1)]),
    (3, True, [(0, 1), (0, 2)]),
    (4, True, [(0, 1), (2, 3)]),
]


def random_euler(rng):
    """1 to 8 vertices, directed or not; mostly the edges of one random walk, else random edges
    with loops and repeats, so all three answers come up."""
    directed = rng.random() < 0.5
    n = rng.randint(1, 8)
    if rng.random() < 0.6:
        v = rng.randrange(n)
        first = v
        length = rng.randint(1, 16)
        closed = rng.random() < 0.5
        edges = []
        for k in range(length):
            w = first if closed and k == length - 1 else rng.randrange(n)
            edges.append((v, w))
            v = w
        rng.shuffle(edges)
    else:
        edges = []
        for _ in range(rng.randint(0, 12)):
            if edges and rng.random() < 0.1:
                edges.append(rng.choice(edges))
            else:
                edges.append((rng.randrange(n), rng.randrange(n)))
    return n, directed, edges


def main():
    rng = random.Random(20261115)
    flow = [flow_case(parse_edges(text), s, t) for text, s, t in HAND_FLOW]
    flow += [flow_case(*random_flow(rng)) for _ in range(140)]
    sat = [sat_case(n, clauses) for n, clauses in HAND_SAT]
    sat += [sat_case(*random_sat(rng)) for _ in range(160)]
    # A generator of its own, so the earlier sections keep their random cases.
    matching_rng = random.Random(20261122)
    matching = [matching_case(*case) for case in HAND_MATCHING]
    matching += [matching_case(*random_matching(matching_rng)) for _ in range(160)]
    # Dinic: a generator of its own as well.
    dinic_rng = random.Random(20261124)
    dinic = [dinic_case(parse_edges(text), s, t) for text, s, t in HAND_DINIC]
    dinic += [dinic_case(*random_flow(dinic_rng)) for _ in range(140)]
    sections = {"flow": flow, "twosat": sat, "matching": matching, "dinic": dinic}
    # Euler: a generator of its own, so the earlier sections keep their random cases.
    euler_rng = random.Random(20261124)
    sections["euler"] = [euler_case(*case) for case in HAND_EULER] + [euler_case(*random_euler(euler_rng)) for _ in range(160)]
    header = {
        "generator": "web/scripts/gen_advancedGraph_fixtures.py",
        "reference": "Algorithms/Graph_Algorithms/Advanced_Graph (Network_Flow/Ford_Fulkerson/Python/ford_fulkerson.py, Network_Flow/Edmonds_Karp/Python/edmonds_karp.py, 2_SAT/Python/two_sat.py, Bipartite_Matching/Python/bipartite_matching.py, Network_Flow/Dinic/Python/dinic.py, Eulerian_Path/Python/eulerian_path.py)",
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
