"""
Tests for Dinic's algorithm: the value, the flow on every edge, the minimum cut, the phases
and the work of the current-arc pointer.
"""

import math
import random
import unittest
from collections import deque

import dinic as dinic_module
from dinic import dinic, dinic_flow

CLASSIC = {
    0: {1: 16, 2: 13},
    1: {2: 10, 3: 12},
    2: {1: 4, 4: 14},
    3: {2: 9, 5: 20},
    4: {3: 7, 5: 4}
}

# Bipartite graphs (n_left, n_right, edges) and the size of a maximum matching, computed by
# kuhn and hopcroft_karp in Bipartite_Matching/Python/bipartite_matching.py.
MATCHING_CASES = [
    (4, 4, [(0, 1), (0, 2), (0, 3), (1, 0), (1, 1), (2, 0), (3, 1)], 3),
    (3, 2, [], 0),
    (2, 2, [(0, 0), (0, 1), (1, 0), (1, 1)], 2),
    (3, 5, [(u, v) for u in range(3) for v in range(5)], 3),
    (5, 3, [(u, v) for u in range(5) for v in range(3)], 3),
    (3, 2, [(0, 0), (0, 0), (1, 0), (1, 1), (1, 0), (2, 1), (2, 1)], 2),
    (3, 3, [(0, 0), (2, 1), (2, 0)], 2),
    (4, 1, [(0, 0), (1, 0), (2, 0), (3, 0)], 1),
    (6, 6, [(0, 0), (1, 1), (2, 2), (3, 3), (4, 4), (0, 1), (1, 2), (2, 3), (3, 4), (4, 5), (5, 0)], 6),
    (7, 5, [(0, 0), (1, 0), (3, 4), (1, 3), (2, 0), (2, 2), (6, 0), (0, 1), (6, 3), (2, 4), (1, 4), (0, 4),
            (0, 1), (5, 0)], 5),
    (9, 9, [(8, 0), (5, 1), (2, 1), (3, 8), (7, 1)], 3),
    (6, 6, [(3, 4), (0, 1), (5, 1), (0, 1), (2, 5), (4, 4)], 3),
]


def reference_max_flow(edges, source, sink):
    """Edmonds-Karp on an edge list. Every (u, v, capacity) is an arc of its own, so parallel
    and anti-parallel edges never share an entry; arc i ^ 1 is the reverse of arc i."""
    if source == sink:
        return 0
    head, room, out = [], [], {}
    for u, v, c in edges:
        for a, b, r in ((u, v, c), (v, u, 0)):
            out.setdefault(a, []).append(len(head))
            head.append(b)
            room.append(r)
    flow = 0
    while True:
        via = {source: None}
        queue = deque([source])
        while queue and sink not in via:
            u = queue.popleft()
            for i in out.get(u, []):
                if room[i] > 0 and head[i] not in via:
                    via[head[i]] = i
                    queue.append(head[i])
        if sink not in via:
            return flow
        arcs = []
        v = sink
        while via[v] is not None:
            arcs.append(via[v])
            v = head[via[v] ^ 1]
        bottleneck = min(room[i] for i in arcs)
        for i in arcs:
            room[i] -= bottleneck
            room[i ^ 1] += bottleneck
        flow += bottleneck


def as_edges(graph):
    return [(u, v, c) for u, row in graph.items() for v, c in row.items()]


def vertices_of(graph, source, sink):
    vs = {source, sink}
    for u, row in graph.items():
        vs.add(u)
        vs.update(row)
    return vs


def random_network(rng, max_n, max_edges):
    """2 to max_n vertices, random edges (some anti-parallel, some of capacity 0), a random source and sink."""
    n = rng.randint(2, max_n)
    graph = {}
    for _ in range(rng.randint(0, max_edges)):
        u, v = rng.randrange(n), rng.randrange(n)
        if u != v:
            graph.setdefault(u, {})[v] = 0 if rng.random() < 0.1 else rng.randint(1, 20)
    source = rng.randrange(n)
    sink = rng.choice([x for x in range(n) if x != source])
    return graph, source, sink


def comb(k):
    """0 -> 1 (capacity k); 1 -> k dead ends 2 .. k+1; 1 -> k+2 .. 2k+1 -> the sink 2k+2 (capacity 1 each).

    Every vertex tries its entries in increasing order, so vertex 1 meets the k dead ends
    before any vertex that leads on. All k augmenting paths go through vertex 1.
    """
    graph = {0: {1: k}, 1: {}}
    for d in range(2, k + 2):
        graph[1][d] = 1
    for b in range(k + 2, 2 * k + 2):
        graph[1][b] = 1
        graph[b] = {2 * k + 2: 1}
    return graph, 0, 2 * k + 2


def matching_network(n_left, n_right, edges):
    """The reduction: source -> every left vertex -> its right neighbours -> sink, capacity 1."""
    source, sink = n_left + n_right, n_left + n_right + 1
    graph = {source: {u: 1 for u in range(n_left)}}
    for u, v in edges:
        graph.setdefault(u, {})[n_left + v] = 1
    for v in range(n_right):
        graph.setdefault(n_left + v, {})[sink] = 1
    return graph, source, sink


class Recorder:
    """Wrap the module's helpers to watch every phase: its levels, its searches and their pushes."""

    def __init__(self, test):
        self.phases = []
        real_bfs, real_find, real_push = dinic_module._bfs_levels, dinic_module._find_path, dinic_module._push

        def bfs(residual, adj, source):
            level = real_bfs(residual, adj, source)
            self.phases.append({"level": dict(level), "residual": {u: dict(r) for u, r in residual.items()},
                                "entries": sum(len(row) for row in adj.values()), "searches": []})
            return level

        def find(residual, adj, level, current, source, sink):
            path, visits = real_find(residual, adj, level, current, source, sink)
            self.phases[-1]["searches"].append({"path": path, "visits": visits})
            return path, visits

        def push(residual, path):
            pushed = real_push(residual, path)
            self.phases[-1]["searches"][-1]["pushed"] = pushed
            return pushed

        dinic_module._bfs_levels, dinic_module._find_path, dinic_module._push = bfs, find, push
        test.addCleanup(setattr, dinic_module, "_bfs_levels", real_bfs)
        test.addCleanup(setattr, dinic_module, "_find_path", real_find)
        test.addCleanup(setattr, dinic_module, "_push", real_push)


class TestWorkedExample(unittest.TestCase):
    def test_value(self):
        self.assertEqual(dinic(CLASSIC, 0, 5), 23)

    def test_flows_cut_and_counts(self):
        result = dinic_flow(CLASSIC, 0, 5)
        self.assertEqual(result.max_flow, 23)
        self.assertEqual(result.flows, {0: {1: 12, 2: 11}, 1: {2: 0, 3: 12}, 2: {1: 0, 4: 11},
                                        3: {2: 0, 5: 19}, 4: {3: 7, 5: 4}})
        self.assertEqual(result.source_side, [0, 1, 2, 4])
        self.assertEqual(result.phases, 3)
        self.assertEqual(result.edge_visits, 40)

    def test_phases(self):
        # Phase 1 (sink at level 3) takes 0-1-3-5 and 0-2-4-5; phase 2 (level 4) takes
        # 0-2-4-3-5; the third BFS reaches {0, 1, 2, 4} and not the sink.
        rec = Recorder(self)
        dinic(CLASSIC, 0, 5)
        self.assertEqual([p["level"].get(5) for p in rec.phases], [3, 4, None])
        self.assertEqual([p["level"] for p in rec.phases][0], {0: 0, 1: 1, 2: 1, 3: 2, 4: 2, 5: 3})
        paths = [[(s["path"], s.get("pushed")) for s in p["searches"]] for p in rec.phases]
        self.assertEqual(paths, [
            [([0, 1, 3, 5], 12), ([0, 2, 4, 5], 4), (None, None)],
            [([0, 2, 4, 3, 5], 7), (None, None)],
            [],
        ])
        self.assertEqual([[s["visits"] for s in p["searches"]] for p in rec.phases], [[8, 10, 3], [15, 4], []])

    def test_input_is_not_modified(self):
        graph = {0: {1: 3}, 1: {2: 2}}
        dinic(graph, 0, 2)
        dinic_flow(graph, 0, 2)
        self.assertEqual(graph, {0: {1: 3}, 1: {2: 2}})


class TestEdgeCases(unittest.TestCase):
    def test_same_source_and_sink(self):
        self.assertEqual(dinic({0: {1: 10}}, 0, 0), 0)
        self.assertEqual(dinic_flow({0: {1: 10}}, 0, 0), (0, {0: {1: 0}}, [0], 0, 0))

    def test_empty_graph(self):
        self.assertEqual(dinic({}, 0, 1), 0)
        self.assertEqual(dinic_flow({}, 0, 1), (0, {}, [0], 1, 0))

    def test_sink_unreachable(self):
        self.assertEqual(dinic({0: {1: 5}, 2: {3: 5}}, 0, 3), 0)
        # One BFS, which reaches {0, 1}: no search runs.
        self.assertEqual(dinic_flow({0: {1: 5}, 2: {3: 5}}, 0, 3),
                         (0, {0: {1: 0}, 2: {3: 0}}, [0, 1], 1, 0))

    def test_sink_without_key(self):
        self.assertEqual(dinic({0: {1: 7}, 1: {2: 3}}, 0, 2), 3)

    def test_source_without_key(self):
        # 0 appears only as the head of an edge, so it has no edge to send along.
        self.assertEqual(dinic_flow({1: {0: 5, 2: 4}}, 0, 2), (0, {1: {0: 0, 2: 0}}, [0], 1, 0))

    def test_anti_parallel_edges(self):
        # 0 -> 1 and 1 -> 0 share their residual entries; the net flow goes to 0 -> 1.
        result = dinic_flow({0: {1: 4}, 1: {0: 6, 2: 5}}, 0, 2)
        self.assertEqual(result.max_flow, 4)
        self.assertEqual(result.flows, {0: {1: 4}, 1: {0: 0, 2: 4}})

    def test_flow_through_both_anti_parallel_edges(self):
        # 1 -> 2 carries flow first; the next phase cancels 2 of it through 2 -> 1's entry.
        graph = {0: {1: 2, 2: 3}, 1: {2: 2, 3: 3}, 2: {1: 2, 3: 1}}
        self.assertEqual(dinic(graph, 0, 3), 4)
        self.assertEqual(reference_max_flow(as_edges(graph), 0, 3), 4)

    def test_zero_capacity_edge(self):
        result = dinic_flow({0: {1: 0, 2: 3}, 1: {3: 9}, 2: {3: 9}}, 0, 3)
        self.assertEqual(result.max_flow, 3)
        self.assertEqual(result.flows, {0: {1: 0, 2: 3}, 1: {3: 0}, 2: {3: 3}})
        # 0 -> 2 is full and 0 -> 1 has no room: the source is alone on its side.
        self.assertEqual(result.source_side, [0])

    def test_parallel_edges_are_added_up(self):
        # A dict holds one capacity per edge, so parallel edges are given as their sum.
        multigraph = [(0, 1, 3), (0, 1, 4), (1, 2, 2), (1, 2, 2), (1, 2, 1), (0, 2, 1)]
        graph = {}
        for u, v, c in multigraph:
            graph.setdefault(u, {})
            graph[u][v] = graph[u].get(v, 0) + c
        self.assertEqual(graph, {0: {1: 7, 2: 1}, 1: {2: 5}})
        self.assertEqual(dinic(graph, 0, 2), 6)
        self.assertEqual(reference_max_flow(multigraph, 0, 2), 6)

    def test_self_loop_carries_nothing(self):
        result = dinic_flow({0: {0: 5, 1: 2}, 1: {1: 9, 2: 4}}, 0, 2)
        self.assertEqual(result.max_flow, 2)
        self.assertEqual(result.flows, {0: {0: 0, 1: 2}, 1: {1: 0, 2: 2}})

    def test_diamond_with_cross_edge(self):
        graph = {0: {1: 1000, 2: 1000}, 1: {2: 1, 3: 1000}, 2: {3: 1000}}
        result = dinic_flow(graph, 0, 3)
        self.assertEqual(result.max_flow, 2000)
        # The cross edge 1 -> 2 joins two vertices of level 1, so the level graph leaves it out.
        self.assertEqual(result.flows[1][2], 0)
        self.assertEqual(result.phases, 2)

    def test_negative_and_large_vertex_ids(self):
        graph = {-5: {10 ** 9: 4, 7: 3}, 10 ** 9: {-2: 5}, 7: {-2: 1}}
        result = dinic_flow(graph, -5, -2)
        self.assertEqual(result.max_flow, 5)
        self.assertEqual(result.flows, {-5: {10 ** 9: 4, 7: 1}, 10 ** 9: {-2: 4}, 7: {-2: 1}})
        self.assertEqual(result.source_side, [-5, 7])

    def test_long_path_needs_no_recursion(self):
        # Each search walks the whole chain: a recursive DFS would need 5000 levels.
        n = 5000
        graph = {u: {u + 1: 7 if u == n // 2 else 9} for u in range(n - 1)}
        result = dinic_flow(graph, 0, n - 1)
        self.assertEqual(result.max_flow, 7)
        self.assertEqual(result.source_side, list(range(n // 2 + 1)))
        self.assertEqual(result.phases, 2)


class TestAgainstEdmondsKarp(unittest.TestCase):
    def assert_maximum_flow(self, graph, source, sink, result):
        """Capacity limits, conservation, the value, and a cut whose capacity equals the flow."""
        self.assertEqual(set(result.flows), set(graph))
        balance = {v: 0 for v in vertices_of(graph, source, sink)}
        for u, row in graph.items():
            self.assertEqual(set(result.flows[u]), set(row))
            for v, capacity in row.items():
                f = result.flows[u][v]
                self.assertGreaterEqual(f, 0)
                self.assertLessEqual(f, capacity)
                balance[u] -= f
                balance[v] += f
        for v, b in balance.items():
            if v not in (source, sink):
                self.assertEqual(b, 0, f"flow is not conserved at {v}")
        self.assertEqual(balance[sink], result.max_flow)
        self.assertEqual(balance[source], -result.max_flow)
        side = set(result.source_side)
        self.assertEqual(result.source_side, sorted(side))
        self.assertIn(source, side)
        self.assertNotIn(sink, side)
        cut = sum(c for u, row in graph.items() for v, c in row.items() if u in side and v not in side)
        self.assertEqual(cut, result.max_flow)
        # Edges back into the source side carry nothing.
        for u, row in graph.items():
            for v in row:
                if u not in side and v in side:
                    self.assertEqual(result.flows[u][v], 0)

    def test_random_networks(self):
        rng = random.Random(20261124)
        for _ in range(600):
            graph, source, sink = random_network(rng, 9, 30)
            result = dinic_flow(graph, source, sink)
            want = reference_max_flow(as_edges(graph), source, sink)
            self.assertEqual(result.max_flow, want, (graph, source, sink))
            self.assertEqual(dinic(graph, source, sink), want)
            self.assert_maximum_flow(graph, source, sink, result)

    def test_larger_random_networks(self):
        rng = random.Random(1694)
        for _ in range(60):
            graph, source, sink = random_network(rng, 60, 400)
            result = dinic_flow(graph, source, sink)
            self.assertEqual(result.max_flow, reference_max_flow(as_edges(graph), source, sink))
            self.assert_maximum_flow(graph, source, sink, result)

    def test_source_side_is_what_the_source_still_reaches(self):
        # Every maximum flow leaves the same set reachable, so the side does not depend on the paths.
        rng = random.Random(1695)
        for _ in range(200):
            graph, source, sink = random_network(rng, 9, 30)
            result = dinic_flow(graph, source, sink)
            residual = {}
            for u, row in graph.items():
                for v, c in row.items():
                    f = result.flows[u][v]
                    residual[(u, v)] = residual.get((u, v), 0) + c - f
                    residual[(v, u)] = residual.get((v, u), 0) + f
            reach, todo = {source}, [source]
            while todo:
                u = todo.pop()
                for (a, b), r in residual.items():
                    if a == u and r > 0 and b not in reach:
                        reach.add(b)
                        todo.append(b)
            self.assertEqual(result.source_side, sorted(reach))


class TestPhases(unittest.TestCase):
    def test_levels_grow_and_each_phase_blocks(self):
        rng = random.Random(4242)
        for _ in range(300):
            graph, source, sink = random_network(rng, 9, 30)
            rec = Recorder(self)
            result = dinic_flow(graph, source, sink)
            self.assertEqual(len(rec.phases), result.phases)
            self.assertNotIn(sink, rec.phases[-1]["level"])
            self.assertEqual(rec.phases[-1]["searches"], [])
            sink_levels = [p["level"][sink] for p in rec.phases[:-1]]
            self.assertEqual(sink_levels, sorted(set(sink_levels)), "the sink's level must grow every phase")
            self.assertLessEqual(result.phases, len(vertices_of(graph, source, sink)))
            for k, p in enumerate(rec.phases[:-1]):
                *paths, last = p["searches"]
                self.assertIsNone(last["path"])
                self.assertTrue(paths, "a phase whose BFS reaches the sink pushes something")
                for s in paths:
                    self.assertEqual(len(s["path"]), p["level"][sink] + 1, "every path is a shortest one")
                    self.assertGreater(s["pushed"], 0)
                # Blocking: with the residual graph the next BFS starts from, no path climbs the levels.
                after = rec.phases[k + 1]["residual"]
                level = p["level"]
                reach, todo = {source}, [source]
                while todo:
                    u = todo.pop()
                    for v, r in after.get(u, {}).items():
                        if r > 0 and level.get(v) == level[u] + 1 and v not in reach:
                            reach.add(v)
                            todo.append(v)
                self.assertNotIn(sink, reach, "the flow of a phase must be blocking")
            self.assertEqual(sum(s.get("pushed", 0) for p in rec.phases for s in p["searches"]), result.max_flow)


class CountingList(list):
    """A list that counts how many of its entries are read, by index or by iteration."""

    reads = 0

    def __getitem__(self, i):
        CountingList.reads += 1
        return list.__getitem__(self, i)

    def __iter__(self):
        for x in list.__iter__(self):
            CountingList.reads += 1
            yield x


class TestCurrentArc(unittest.TestCase):
    """Within a phase every residual entry is passed over at most once.

    A search looks at an entry and either moves past it or steps through it. Moving past an
    entry, or backing out of a dead end through it, happens at most once per entry and phase;
    stepping through it again only happens on a path that reached the sink. So the visits of a
    phase are at most (entries) + (paths of the phase) x (the sink's level). Without the
    current-arc pointer, every search starts each vertex at its first entry again, and the
    comb below costs about 2.5 k^2 visits instead of 7k + 1.
    """

    def test_edge_visits_counts_the_reads_of_adj(self):
        real = dinic_module._neighbours
        dinic_module._neighbours = lambda residual: {u: CountingList(row) for u, row in real(residual).items()}
        self.addCleanup(setattr, dinic_module, "_neighbours", real)
        real_bfs = dinic_module._bfs_levels
        bfs_reads = [0]

        def bfs(*args):
            start = CountingList.reads
            level = real_bfs(*args)
            bfs_reads[0] += CountingList.reads - start
            return level

        dinic_module._bfs_levels = bfs
        self.addCleanup(setattr, dinic_module, "_bfs_levels", real_bfs)
        rng = random.Random(77)
        for _ in range(200):
            graph, source, sink = random_network(rng, 9, 30)
            CountingList.reads = 0
            bfs_reads[0] = 0
            result = dinic_flow(graph, source, sink)
            self.assertEqual(CountingList.reads - bfs_reads[0], result.edge_visits)

    def test_visits_per_phase_are_bounded(self):
        rng = random.Random(9)
        cases = [random_network(rng, 9, 30) for _ in range(300)] + [comb(30)]
        for graph, source, sink in cases:
            rec = Recorder(self)
            dinic_flow(graph, source, sink)
            for p in rec.phases[:-1]:
                visits = sum(s["visits"] for s in p["searches"])
                paths = len(p["searches"]) - 1
                self.assertLessEqual(visits, p["entries"] + paths * p["level"][sink])

    def test_comb_grows_linearly(self):
        # Phase 1 pushes k paths 0-1-b-sink; the second BFS stops at 0. Vertex 1's pointer
        # passes the k dead ends once, so the visits are 7k + 1, not about 2.5 k^2.
        for k in (10, 20, 40, 80, 160, 320):
            graph, source, sink = comb(k)
            result = dinic_flow(graph, source, sink)
            self.assertEqual((result.max_flow, result.phases, result.edge_visits), (k, 2, 7 * k + 1))


class TestUnitNetworks(unittest.TestCase):
    def test_bipartite_reduction_matches_the_matching_code(self):
        for n_left, n_right, edges, size in MATCHING_CASES:
            graph, source, sink = matching_network(n_left, n_right, edges)
            result = dinic_flow(graph, source, sink)
            self.assertEqual(result.max_flow, size, (n_left, n_right, edges))
            # The middle edges that carry flow form a matching of that size.
            pairs = [(u, v - n_left) for u in range(n_left) for v, f in result.flows.get(u, {}).items() if f]
            self.assertEqual(len(pairs), size)
            self.assertEqual(len({u for u, _ in pairs}), size)
            self.assertEqual(len({v for _, v in pairs}), size)
            self.assertTrue(set(pairs) <= set(edges))

    def test_few_phases(self):
        # On a unit network at most 2 sqrt(V) phases push flow, plus the last BFS.
        rng = random.Random(1696)
        for _ in range(100):
            n_left, n_right = rng.randint(1, 40), rng.randint(1, 40)
            edges = [(rng.randrange(n_left), rng.randrange(n_right)) for _ in range(rng.randint(0, 160))]
            graph, source, sink = matching_network(n_left, n_right, edges)
            v = n_left + n_right + 2
            self.assertLessEqual(dinic_flow(graph, source, sink).phases, 2 * math.sqrt(v) + 1)


if __name__ == '__main__':
    unittest.main()
