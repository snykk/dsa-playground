"""Generate golden fixtures for the graph-structure visualizations from the repository's Python code.

The web visualizer re-implements Kahn's topological sort, Kosaraju's and Tarjan's SCC
algorithms, Tarjan's bridges / articulation points and union-find in TypeScript
(web/src/viz/algorithms/graphStructure.ts and unionFind.ts). These fixtures pin each
port to its reference in Algorithms/Graph_Algorithms/Advanced_Graph: the order Kahn
produces (or None for a cycle), the components in emission order with members in
discovery order, the bridge / cut-vertex lists, and parent / rank / count after every
union-find operation. Run from anywhere:

    python3 web/scripts/gen_graphStructure_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/graphStructure.json. CI regenerates the
file and fails if it changed, which means the two implementations drifted.
"""

import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ADV = ROOT / "Algorithms" / "Graph_Algorithms" / "Advanced_Graph"
for folder in (
    "Topological_Sort/Python",
    "Strongly_Connected_Components/Kosarajus_Algorithm/Python",
    "Strongly_Connected_Components/Tarjans_Algorithm/Python",
    "Tarjan_Bridges_Articulation/Python",
    "Union_Find_DSU/Python",
):
    sys.path.insert(0, str(ADV / folder))

from kosaraju import kosaraju_scc  # noqa: E402
from tarjan import tarjan_scc  # noqa: E402
from tarjan_bridges import find_bridges_and_articulations  # noqa: E402
from topological_sort import topological_sort_kahn  # noqa: E402
from union_find import UnionFind  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "graphStructure.json"


def compact(n, edges):
    """Rename vertices so every id 0..n-1 is used by some edge (the TS parser only sees edge endpoints)."""
    used = sorted({x for e in edges for x in e[:2]})
    rename = {old: new for new, old in enumerate(used)}
    return len(used), [[rename[u], rename[v]] for u, v in edges]


def digraph_cases(rng, count):
    cases = []
    for _ in range(count):
        n = rng.randint(2, 8)
        # Roughly half the graphs are DAGs (edges only go forward in a random order).
        order = list(range(n))
        rng.shuffle(order)
        dag = rng.random() < 0.5
        pairs = set()
        for _ in range(rng.randint(1, 2 * n)):
            u, v = rng.randrange(n), rng.randrange(n)
            if u == v:
                continue
            if dag and order.index(u) > order.index(v):
                u, v = v, u
            pairs.add((u, v))
        edges = sorted(pairs) or [(0, 1)]
        n, edges = compact(n, edges)
        graph = {v: sorted(b for a, b in edges if a == v) for v in range(n)}
        cases.append(
            {
                "n": n,
                "edges": edges,
                "kahn": topological_sort_kahn(graph),
                "kosaraju": kosaraju_scc(graph),
                "tarjan": tarjan_scc(graph),
            }
        )
    return cases


def undirected_cases(rng, count):
    cases = []
    for _ in range(count):
        n = rng.randint(2, 8)
        edges = []
        for _ in range(rng.randint(1, 2 * n)):
            u, v = rng.randrange(n), rng.randrange(n)
            if u != v:
                edges.append((u, v))  # parallel edges stay: they are never bridges
        if not edges:
            edges = [(0, 1)]
        n, edges = compact(n, edges)
        bridges, cuts = find_bridges_and_articulations(n, [tuple(e) for e in edges])
        cases.append({"n": n, "edges": edges, "bridges": [list(b) for b in bridges], "cuts": cuts})
    return cases


def dsu_cases(rng, count):
    cases = []
    for _ in range(count):
        n = rng.randint(2, 10)
        uf = UnionFind(n)
        ops = []
        steps = []
        for _ in range(rng.randint(1, 14)):
            kind = rng.choice(["union", "union", "find", "connected"])
            x, y = rng.randrange(n), rng.randrange(n)
            if kind == "find":
                ops.append([kind, x])
                result = uf.find(x)
            elif kind == "union":
                ops.append([kind, x, y])
                result = uf.union(x, y)
            else:
                ops.append([kind, x, y])
                result = uf.connected(x, y)
            steps.append({"result": result, "parent": list(uf.parent), "rank": list(uf.rank), "count": uf.count})
        cases.append({"n": n, "ops": ops, "steps": steps})
    return cases


def main():
    rng = random.Random(20261111)
    sections = {
        "digraph": digraph_cases(rng, 150),
        "undirected": undirected_cases(rng, 150),
        "dsu": dsu_cases(rng, 120),
    }
    header = {
        "generator": "web/scripts/gen_graphStructure_fixtures.py",
        "reference": "Algorithms/Graph_Algorithms/Advanced_Graph (topological_sort.py, kosaraju.py, tarjan.py, tarjan_bridges.py, union_find.py)",
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
