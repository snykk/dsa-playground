"""Generate golden fixtures for the greedy visualizations from the repository's Python code.

The web visualizer re-implements Kruskal, Prim, activity selection and fractional
knapsack in TypeScript. These fixtures pin each port to its reference implementation
in Algorithms/Greedy (tie-breaking included). Run from anywhere:

    python3 web/scripts/gen_greedy_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/greedy.json. CI regenerates the file
and fails if it changed, which means the two implementations drifted.
"""

import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GREEDY = ROOT / "Algorithms" / "Greedy"
MST = ROOT / "Algorithms" / "Graph_Algorithms" / "Minimum_Spanning_Tree"
for folder in (
    MST / "Kruskals_Algorithm" / "Python",
    MST / "Prims_Algorithm" / "Python",
    GREEDY / "Activity_Selection" / "Python",
    GREEDY / "Fractional_Knapsack" / "Python",
):
    sys.path.insert(0, str(folder))

from activity_selection import activity_selection, activity_selection_recursive  # noqa: E402
from fractional_knapsack import fractional_knapsack, fractional_knapsack_value_only  # noqa: E402
from kruskal import kruskal_mst  # noqa: E402
from prim import prim_mst_edge_list  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "greedy.json"


def random_graph(rng):
    """Undirected graph, one edge per pair, every vertex 0..n-1 used by some edge."""
    n = rng.randint(2, 9)
    pairs = set()
    edges = []
    for _ in range(rng.randint(1, 2 * n)):
        u, v = rng.randrange(n), rng.randrange(n)
        if u == v or (min(u, v), max(u, v)) in pairs:
            continue
        pairs.add((min(u, v), max(u, v)))
        # Small weight range so ties (and their tie-breaking) are common.
        edges.append([u, v, rng.randint(-5, 12)])
    if not edges:
        edges.append([0, 1, rng.randint(-5, 12)])
    used = sorted({x for e in edges for x in e[:2]})
    rename = {old: new for new, old in enumerate(used)}
    return len(used), [[rename[u], rename[v], w] for u, v, w in edges]


def mst_cases(rng, count):
    cases = []
    for _ in range(count):
        n, edges = random_graph(rng)
        start = rng.randrange(n)
        k_mst, k_total = kruskal_mst([tuple(e) for e in edges], n)
        p_mst, p_total = prim_mst_edge_list([tuple(e) for e in edges], n, start)
        cases.append(
            {
                "n": n,
                "edges": edges,
                "start": start,
                "kruskal": [list(e) for e in k_mst],
                "kruskal_total": k_total,
                "prim": [list(e) for e in p_mst],
                "prim_total": p_total,
            }
        )
    return cases


def activity_cases(rng, count):
    cases = []
    for _ in range(count):
        acts = []
        for _ in range(rng.randint(1, 12)):
            start = rng.randint(-6, 14)
            acts.append([start, start + rng.randint(1, 6)])
        selected = activity_selection([tuple(a) for a in acts])
        # The recursive variant must agree now that it no longer uses -1 as a sentinel.
        assert activity_selection_recursive([tuple(a) for a in acts]) == selected
        cases.append({"activities": acts, "selected": selected})
    return cases


def knapsack_cases(rng, count):
    cases = []
    for _ in range(count):
        items = []
        for _ in range(rng.randint(1, 7)):
            weight = 0 if rng.random() < 0.12 else rng.randint(1, 15)
            items.append([rng.randint(0, 60), weight])  # (value, weight) like the Python API
        capacity = rng.randint(1, 40)
        total, selected = fractional_knapsack([tuple(i) for i in items], capacity)
        assert abs(fractional_knapsack_value_only([tuple(i) for i in items], capacity) - total) < 1e-9
        cases.append(
            {
                "capacity": capacity,
                "items": items,
                "total": total,
                "selected": [list(s) for s in selected],
            }
        )
    return cases


def main():
    rng = random.Random(20261110)
    sections = {
        "mst": mst_cases(rng, 120),
        "activity": activity_cases(rng, 120),
        "knapsack": knapsack_cases(rng, 120),
    }
    header = {
        "generator": "web/scripts/gen_greedy_fixtures.py",
        "reference": "Algorithms/Greedy (activity_selection.py, fractional_knapsack.py) and Algorithms/Graph_Algorithms/Minimum_Spanning_Tree (kruskal.py, prim.py)",
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
