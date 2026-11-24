"""Generate golden fixtures for the shortest-path visualizations from the repository's Python code.

The web visualizer re-implements Bellman-Ford, Floyd-Warshall, A* and 0-1 BFS in TypeScript.
These fixtures pin each port to its reference implementation in
Algorithms/Graph_Algorithms/Shortest_Path. For 0-1 BFS (section "bfs01") they hold dist,
parent and every deque event of zero_one_bfs.py: the start entry, each pop (stale ones
included) and each push to the front or the back, recorded by a deque subclass put in place
of the module's deque while it runs. Run from anywhere:

    python3 web/scripts/gen_shortestPaths_fixtures.py

CI regenerates the file and fails if it changed, which means the two implementations drifted.
Unreachable distances are written as null; a detected negative cycle is a null result.
0-1 BFS keeps the code's own -1 for an unreachable vertex.
"""

import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SP = ROOT / "Algorithms" / "Graph_Algorithms" / "Shortest_Path"
for folder in ("Bellman_Ford_Algorithm", "Floyd_Warshall_Algorithm", "A_Star_Search_Algorithm", "0_1_BFS"):
    sys.path.insert(0, str(SP / folder / "Python"))

from astar import astar, manhattan_distance  # noqa: E402
from bellman_ford import bellman_ford  # noqa: E402
from floyd_warshall import floyd_warshall  # noqa: E402
import zero_one_bfs as bfs01_module  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "shortestPaths.json"


def random_digraph(rng):
    """Directed multigraph (parallel edges allowed, no self-loops); every vertex 0..n-1 is used."""
    n = rng.randint(2, 6)
    edges = []
    for _ in range(rng.randint(1, 2 * n + 2)):
        u, v = rng.randrange(n), rng.randrange(n)
        if u != v:
            edges.append([u, v, rng.randint(-3, 9)])
    if not edges:
        edges.append([0, 1, rng.randint(-3, 9)])
    used = sorted({x for e in edges for x in e[:2]})
    rename = {old: new for new, old in enumerate(used)}
    return len(used), [[rename[u], rename[v], w] for u, v, w in edges]


def inf_to_none(x):
    return None if x is None or x == float("inf") or x >= sys.maxsize else x


def bellman_cases(rng, count):
    cases = []
    for k in range(count):
        n, edges = random_digraph(rng)
        if k % 3:  # two thirds without negative edges worth worrying about: mostly small negatives
            edges = [[u, v, w if rng.random() < 0.3 else abs(w)] for u, v, w in edges]
        start = rng.randrange(n)
        dist = bellman_ford([tuple(e) for e in edges], n, start)
        cases.append(
            {
                "n": n,
                "edges": edges,
                "start": start,
                "dist": None if dist is None else [inf_to_none(dist[i]) for i in range(n)],
            }
        )
    return cases


def floyd_cases(rng, count):
    cases = []
    for k in range(count):
        n, edges = random_digraph(rng)
        if k % 3:
            edges = [[u, v, w if rng.random() < 0.3 else abs(w)] for u, v, w in edges]
        graph = {}
        for u, v, w in edges:
            graph.setdefault(u, []).append((v, w))
        dist = floyd_warshall(graph, n)
        cases.append(
            {
                "n": n,
                "edges": edges,
                "dist": None if dist is None else [[inf_to_none(x) for x in row] for row in dist],
            }
        )
    return cases


def random_map(rng):
    rows, cols = rng.randint(2, 7), rng.randint(2, 8)
    wall_rate = rng.choice([0.1, 0.25, 0.4])
    cost = [[1 if rng.random() > 0.2 else rng.randint(2, 9) for _ in range(cols)] for _ in range(rows)]
    wall = [[rng.random() < wall_rate for _ in range(cols)] for _ in range(rows)]
    cells = rng.sample(range(rows * cols), 2)
    start, goal = cells
    wall[start // cols][start % cols] = False
    wall[goal // cols][goal % cols] = False
    cost[goal // cols][goal % cols] = 1  # the map text cannot encode a cost for the G cell
    return rows, cols, wall, cost, start, goal


def astar_cases(rng, count):
    cases = []
    for _ in range(count):
        rows, cols, wall, cost, start, goal = random_map(rng)
        text = []
        for r in range(rows):
            line = ""
            for c in range(cols):
                i = r * cols + c
                if i == start:
                    line += "S"
                elif i == goal:
                    line += "G"
                elif wall[r][c]:
                    line += "#"
                else:
                    line += str(cost[r][c]) if cost[r][c] > 1 else "."
            text.append(line)
        graph = {}
        for r in range(rows):
            for c in range(cols):
                if wall[r][c]:
                    continue
                edges = []
                for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                    r1, c1 = r + dr, c + dc
                    if 0 <= r1 < rows and 0 <= c1 < cols and not wall[r1][c1]:
                        edges.append((r1 * cols + c1, cost[r1][c1]))
                graph[r * cols + c] = edges
        gr, gc = divmod(goal, cols)
        result = astar(graph, start, goal, lambda v: manhattan_distance(divmod(v, cols), (gr, gc)))
        cases.append(
            {
                "map": "/".join(text),
                "result": None if result is None else {"cost": result[0], "path": result[1]},
            }
        )
    return cases


class RecordingDeque(bfs01_module.deque):
    """The module's deque, recording [kind, distance, vertex] for every push and pop."""

    events = None

    def __init__(self, *args):
        super().__init__(*args)
        RecordingDeque.events = [["push", d, v] for d, v in self]

    def popleft(self):
        d, v = super().popleft()
        RecordingDeque.events.append(["pop", d, v])
        return d, v

    def appendleft(self, item):
        RecordingDeque.events.append(["front", item[0], item[1]])
        super().appendleft(item)

    def append(self, item):
        RecordingDeque.events.append(["back", item[0], item[1]])
        super().append(item)


def bfs01_case(n, edges, start):
    real = bfs01_module.deque
    bfs01_module.deque = RecordingDeque
    try:
        dist, parent = bfs01_module.zero_one_bfs([tuple(e) for e in edges], n, start)
    finally:
        bfs01_module.deque = real
    return {"n": n, "edges": [list(e) for e in edges], "start": start, "dist": dist, "parent": parent, "events": RecordingDeque.events}


HAND_BFS01 = [
    # The visualization's examples, letters A.. as vertices 0.., undirected edges as both directions.
    (7, [(0, 1, 1), (0, 2, 0), (2, 1, 0), (1, 3, 1), (2, 4, 1), (4, 3, 0), (4, 5, 1), (3, 5, 1), (6, 0, 1)], 0),
    (4, [(0, 1, 1), (0, 2, 1), (0, 3, 1), (0, 1, 0), (1, 2, 0), (2, 3, 0)], 0),
    (4, [(0, 1, 0), (1, 2, 0), (2, 0, 0), (2, 3, 1)], 0),
    # The repository tests: one vertex, no edges, unreachable vertices, self-loops, parallel
    # edges, ties in both deque directions.
    (1, [], 0),
    (3, [], 1),
    (5, [(0, 1, 1), (2, 0, 0), (3, 1, 1)], 0),
    (3, [(0, 0, 0), (0, 0, 1), (0, 1, 1), (1, 1, 0), (1, 2, 0), (2, 2, 1)], 0),
    (2, [(0, 1, 1), (0, 1, 0)], 0),
    (4, [(0, 1, 1), (0, 2, 1), (1, 3, 0), (2, 3, 0)], 0),
    (4, [(0, 1, 0), (0, 2, 0), (1, 3, 1), (2, 3, 1)], 0),
]


def random_bfs01(rng):
    """1 to 9 vertices, up to 20 directed edges of weight 0 or 1; self-loops and repeats now and then."""
    n = rng.randint(1, 9)
    edges = []
    for _ in range(rng.randint(0, 20)):
        if edges and rng.random() < 0.08:
            edges.append(rng.choice(edges))
        else:
            edges.append((rng.randrange(n), rng.randrange(n), rng.randint(0, 1)))
    return n, edges, rng.randrange(n)


def main():
    rng = random.Random(20261111)
    sections = {
        "bellman": bellman_cases(rng, 150),
        "floyd": floyd_cases(rng, 150),
        "astar": astar_cases(rng, 150),
    }
    # A generator of its own, so the earlier sections keep their random cases.
    bfs01_rng = random.Random(20261124)
    sections["bfs01"] = [bfs01_case(*case) for case in HAND_BFS01]
    sections["bfs01"] += [bfs01_case(*random_bfs01(bfs01_rng)) for _ in range(150)]
    header = {
        "generator": "web/scripts/gen_shortestPaths_fixtures.py",
        "reference": "Algorithms/Graph_Algorithms/Shortest_Path (bellman_ford.py, floyd_warshall.py, astar.py, 0_1_BFS/Python/zero_one_bfs.py)",
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
