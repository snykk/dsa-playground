"""
Tests for zero_one_bfs: 0-1 BFS with a deque, its parent array and paths, and the grid example.
"""

import heapq
import random
import unittest
from collections import deque

import zero_one_bfs as module
from zero_one_bfs import grid_edges, min_wall_breaks, path_to, zero_one_bfs, zero_one_bfs_with_path

# A to G are vertices 0 to 6. B is first reached by A->B (1), then by A->C->B (0 + 0).
EXAMPLE = [(0, 1, 1), (0, 2, 0), (2, 1, 0), (1, 3, 1), (2, 4, 1), (4, 3, 0), (4, 5, 1), (3, 5, 1), (6, 0, 1)]

# Roads '.' cost 0 to enter, walls '#' cost 1. Column 5 is a wall from top to bottom.
CITY = ["...#.#.", "##.#.#.", "...#.#.", ".###.#.", ".....#."]


def dijkstra_reference(edges, n, start):
    """Plain Dijkstra with a binary heap; -1 for an unreachable vertex."""
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    dist = [None] * n
    heap = [(0, start)]
    while heap:
        d, u = heapq.heappop(heap)
        if dist[u] is not None:
            continue
        dist[u] = d
        for v, w in adj[u]:
            if dist[v] is None:
                heapq.heappush(heap, (d + w, v))
    return [-1 if d is None else d for d in dist]


def bfs_hops(edges, n, start):
    """Plain BFS: the fewest edges from start, -1 when unreachable."""
    adj = [[] for _ in range(n)]
    for u, v, _ in edges:
        adj[u].append(v)
    dist = [-1] * n
    dist[start] = 0
    queue = deque([start])
    while queue:
        u = queue.popleft()
        for v in adj[u]:
            if dist[v] == -1:
                dist[v] = dist[u] + 1
                queue.append(v)
    return dist


def random_graph(rng, max_n, max_edges, zero_share=0.5):
    """1 to max_n vertices and up to max_edges directed 0/1 edges; self-loops and repeats included."""
    n = rng.randint(1, max_n)
    edges = []
    for _ in range(rng.randint(0, max_edges)):
        if edges and rng.random() < 0.05:
            edges.append(rng.choice(edges))  # a parallel copy
        else:
            edges.append((rng.randrange(n), rng.randrange(n), 0 if rng.random() < zero_share else 1))
    return n, edges, rng.randrange(n)


class RecordingDeque(deque):
    """A deque that records every push and pop, and checks the 0-1 BFS invariant on each push.

    The invariant: the distances in the deque never decrease from front to back, and the last
    exceeds the first by at most 1. A pop keeps it, so checking each push against the two ends
    checks it at every moment, in O(1) per push.
    """

    instances = []

    def __init__(self, *args):
        super().__init__(*args)
        self.events = [("push", d, v) for d, v in self]
        self.violations = []
        RecordingDeque.instances.append(self)

    def popleft(self):
        item = super().popleft()
        self.events.append(("pop",) + item)
        return item

    def appendleft(self, item):
        if self and not (item[0] <= self[0][0] and self[-1][0] - item[0] <= 1):
            self.violations.append(("front", item, self[0], self[-1]))
        self.events.append(("front",) + item)
        super().appendleft(item)

    def append(self, item):
        if self and not (self[-1][0] <= item[0] and item[0] - self[0][0] <= 1):
            self.violations.append(("back", item, self[0], self[-1]))
        self.events.append(("back",) + item)
        super().append(item)


class CountingList(list):
    """A list that counts how many of its entries are read by iteration."""

    reads = 0

    def __iter__(self):
        for x in list.__iter__(self):
            CountingList.reads += 1
            yield x


class Instrumented(unittest.TestCase):
    """Runs zero_one_bfs with the recording deque and the counting adjacency lists."""

    def setUp(self):
        real_deque, real_adjacency = module.deque, module._adjacency

        def counted(edges, n, start):
            return [CountingList(row) for row in real_adjacency(edges, n, start)]

        module.deque, module._adjacency = RecordingDeque, counted
        self.addCleanup(setattr, module, "deque", real_deque)
        self.addCleanup(setattr, module, "_adjacency", real_adjacency)

    def run_recorded(self, edges, n, start):
        RecordingDeque.instances.clear()
        CountingList.reads = 0
        dist, parent = zero_one_bfs(edges, n, start)
        (queue,) = RecordingDeque.instances
        return dist, parent, queue, CountingList.reads


class TestWorkedExample(unittest.TestCase):
    def test_distances_and_parents(self):
        dist, parent = zero_one_bfs(EXAMPLE, 7, 0)
        self.assertEqual(dist, [0, 0, 0, 1, 1, 2, -1])
        self.assertEqual(parent, [-1, 2, 0, 1, 2, 4, -1])

    def test_paths(self):
        want = {0: (0, [0]), 1: (0, [0, 2, 1]), 2: (0, [0, 2]), 3: (1, [0, 2, 1, 3]), 4: (1, [0, 2, 4]), 5: (2, [0, 2, 4, 5]), 6: (-1, [])}
        for target, expected in want.items():
            self.assertEqual(zero_one_bfs_with_path(EXAMPLE, 7, 0, target), expected)
        _, parent = zero_one_bfs(EXAMPLE, 7, 0)
        self.assertEqual(path_to(parent, 0, 5), [0, 2, 4, 5])

    def test_other_sources(self):
        self.assertEqual(zero_one_bfs(EXAMPLE, 7, 6), ([1, 1, 1, 2, 2, 3, 0], [6, 2, 0, 1, 2, 4, -1]))
        self.assertEqual(zero_one_bfs(EXAMPLE, 7, 4), ([-1, -1, -1, 0, 0, 1, -1], [-1, -1, -1, 4, -1, 4, -1]))

    def test_input_is_not_modified_and_may_be_any_iterable(self):
        edges = list(EXAMPLE)
        zero_one_bfs(edges, 7, 0)
        self.assertEqual(edges, EXAMPLE)
        self.assertEqual(zero_one_bfs(iter(EXAMPLE), 7, 0), zero_one_bfs(EXAMPLE, 7, 0))
        self.assertEqual(zero_one_bfs((e for e in EXAMPLE), 7, 0)[0], [0, 0, 0, 1, 1, 2, -1])


class TestDequeTrace(Instrumented):
    def test_worked_example_trace(self):
        # Front pushes for 0 edges, back pushes for 1 edges, and B's first entry goes stale.
        _, _, queue, reads = self.run_recorded(EXAMPLE, 7, 0)
        self.assertEqual(queue.events, [
            ("push", 0, 0),
            ("pop", 0, 0), ("back", 1, 1), ("front", 0, 2),
            ("pop", 0, 2), ("front", 0, 1), ("back", 1, 4),
            ("pop", 0, 1), ("back", 1, 3),
            ("pop", 1, 1),
            ("pop", 1, 4), ("back", 2, 5),
            ("pop", 1, 3),
            ("pop", 2, 5),
        ])
        self.assertEqual(queue.violations, [])
        self.assertEqual(reads, 8)  # every edge but G->A, whose tail is never reached

    def test_invariant_on_random_graphs(self):
        # At every pop the deque holds distances d .. d + 1 in order, stale entries included.
        rng = random.Random(101)
        for _ in range(400):
            n, edges, start = random_graph(rng, 12, 40)
            dist, _, queue, _ = self.run_recorded(edges, n, start)
            self.assertEqual(queue.violations, [], (n, edges, start))
            pops = [(d, v) for kind, d, v in queue.events if kind == "pop"]
            self.assertEqual([d for d, _ in pops], sorted(d for d, _ in pops), "pops come out by distance")
            processed = [v for d, v in pops if d == dist[v]]
            self.assertEqual(len(processed), len(set(processed)), "a vertex is processed once")
            self.assertEqual(sorted(processed), [v for v in range(n) if dist[v] != -1])

    def test_a_vertex_is_pushed_at_most_twice(self):
        rng = random.Random(202)
        for _ in range(400):
            n, edges, start = random_graph(rng, 12, 40)
            _, _, queue, _ = self.run_recorded(edges, n, start)
            pushes = [v for kind, _, v in queue.events if kind != "pop"]
            for v in range(n):
                self.assertLessEqual(pushes.count(v), 2, (n, edges, start))

    def test_stale_entries_are_skipped(self):
        # 0 reaches 1, 2 and 3 by weight 1 first, then 0->1->2->3 by weight 0:
        # every vertex but the source is pushed twice, and three entries go stale.
        edges = [(0, 1, 1), (0, 2, 1), (0, 3, 1), (0, 1, 0), (1, 2, 0), (2, 3, 0)]
        dist, parent, queue, _ = self.run_recorded(edges, 4, 0)
        self.assertEqual(dist, [0, 0, 0, 0])
        self.assertEqual(parent, [-1, 0, 1, 2])
        pops = [(d, v) for kind, d, v in queue.events if kind == "pop"]
        self.assertEqual(pops, [(0, 0), (0, 1), (0, 2), (0, 3), (1, 1), (1, 2), (1, 3)])
        stale = [(d, v) for d, v in pops if d > dist[v]]
        self.assertEqual(stale, [(1, 1), (1, 2), (1, 3)])


class TestEdgeCases(unittest.TestCase):
    def test_single_vertex(self):
        self.assertEqual(zero_one_bfs([], 1, 0), ([0], [-1]))
        self.assertEqual(zero_one_bfs_with_path([], 1, 0, 0), (0, [0]))

    def test_no_edges(self):
        self.assertEqual(zero_one_bfs([], 3, 1), ([-1, 0, -1], [-1, -1, -1]))
        self.assertEqual(zero_one_bfs_with_path([], 3, 1, 2), (-1, []))

    def test_unreachable_vertices(self):
        # 2 and 3 only point into the reachable part; 4 has no edge at all.
        edges = [(0, 1, 1), (2, 0, 0), (3, 1, 1)]
        self.assertEqual(zero_one_bfs(edges, 5, 0), ([0, 1, -1, -1, -1], [-1, 0, -1, -1, -1]))
        for target in (2, 3, 4):
            self.assertEqual(zero_one_bfs_with_path(edges, 5, 0, target), (-1, []))

    def test_self_loops_change_nothing(self):
        plain = [(0, 1, 1), (1, 2, 0)]
        looped = [(0, 0, 0), (0, 0, 1), (0, 1, 1), (1, 1, 0), (1, 2, 0), (2, 2, 1)]
        self.assertEqual(zero_one_bfs(looped, 3, 0), zero_one_bfs(plain, 3, 0))
        self.assertEqual(zero_one_bfs(looped, 3, 0), ([0, 1, 1], [-1, 0, 1]))

    def test_zero_weight_cycle(self):
        # 0 -> 1 -> 2 -> 0 all weigh 0: every vertex is at distance 0 and the search stops.
        edges = [(0, 1, 0), (1, 2, 0), (2, 0, 0), (2, 3, 1)]
        self.assertEqual(zero_one_bfs(edges, 4, 0), ([0, 0, 0, 1], [-1, 0, 1, 2]))
        self.assertEqual(zero_one_bfs(edges, 4, 1), ([0, 0, 0, 1], [2, -1, 1, 2]))

    def test_parallel_edges(self):
        # The 0 copy wins whatever its position; equal copies keep the first parent.
        self.assertEqual(zero_one_bfs([(0, 1, 1), (0, 1, 0)], 2, 0), ([0, 0], [-1, 0]))
        self.assertEqual(zero_one_bfs([(0, 1, 0), (0, 1, 1)], 2, 0), ([0, 0], [-1, 0]))
        self.assertEqual(zero_one_bfs([(0, 1, 1), (0, 1, 1), (0, 2, 0), (2, 1, 1)], 3, 0), ([0, 1, 0], [-1, 0, 0]))

    def test_ties_keep_the_first_parent(self):
        # Back pushes come out in push order: 1 is processed before 2, so 1 becomes 3's parent
        # and the equal offer from 2 changes nothing.
        edges = [(0, 1, 1), (0, 2, 1), (1, 3, 0), (2, 3, 0)]
        self.assertEqual(zero_one_bfs(edges, 4, 0), ([0, 1, 1, 1], [-1, 0, 0, 1]))
        # Front pushes come out in reverse: 2 is pushed in front of 1, so 2 is processed first.
        edges = [(0, 1, 0), (0, 2, 0), (1, 3, 1), (2, 3, 1)]
        self.assertEqual(zero_one_bfs(edges, 4, 0), ([0, 0, 0, 1], [-1, 0, 0, 2]))

    def test_undirected_graph_as_both_directions(self):
        undirected = [(0, 1, 1), (1, 2, 0), (2, 3, 1), (0, 3, 1)]
        both = [e for u, v, w in undirected for e in ((u, v, w), (v, u, w))]
        self.assertEqual(zero_one_bfs(both, 4, 2), ([1, 0, 0, 1], [1, 2, -1, 2]))

    def test_all_weights_one_is_plain_bfs(self):
        rng = random.Random(303)
        for _ in range(200):
            n, edges, start = random_graph(rng, 15, 45, zero_share=0.0)
            self.assertEqual(zero_one_bfs(edges, n, start)[0], bfs_hops(edges, n, start))

    def test_all_weights_zero_is_reachability(self):
        rng = random.Random(404)
        for _ in range(200):
            n, edges, start = random_graph(rng, 15, 45, zero_share=1.0)
            want = [0 if d != -1 else -1 for d in bfs_hops(edges, n, start)]
            self.assertEqual(zero_one_bfs(edges, n, start)[0], want)

    def test_long_chain(self):
        # 200000 vertices in a line of alternating weights: no recursion, linear work.
        n = 200000
        edges = [(i, i + 1, i % 2) for i in range(n - 1)]
        dist, parent = zero_one_bfs(edges, n, 0)
        self.assertEqual(dist[-1], (n - 1) // 2)
        self.assertEqual(len(path_to(parent, 0, n - 1)), n)


class TestInvalidInput(unittest.TestCase):
    def test_weights_other_than_0_and_1_raise(self):
        for w in (2, -1, 7, 0.5, 1.0, "1", None):
            with self.assertRaises(ValueError, msg=repr(w)):
                zero_one_bfs([(0, 1, 0), (1, 0, w)], 2, 0)

    def test_bad_graph_raises(self):
        with self.assertRaises(ValueError):
            zero_one_bfs([], -1, 0)
        with self.assertRaises(ValueError):
            zero_one_bfs([], 0, 0)  # no vertex can be the start
        with self.assertRaises(ValueError):
            zero_one_bfs([(0, 2, 0)], 2, 0)
        with self.assertRaises(ValueError):
            zero_one_bfs([(-1, 0, 1)], 2, 0)
        with self.assertRaises(ValueError):
            zero_one_bfs([], 2, 2)
        with self.assertRaises(ValueError):
            zero_one_bfs([], 2, -1)

    def test_an_unreachable_bad_edge_still_raises(self):
        # The whole input is checked first, not only the edges the search happens to read.
        with self.assertRaises(ValueError):
            zero_one_bfs([(0, 1, 0), (2, 3, 5)], 4, 0)

    def test_bad_target_raises(self):
        with self.assertRaises(ValueError):
            zero_one_bfs_with_path(EXAMPLE, 7, 0, 7)
        with self.assertRaises(ValueError):
            zero_one_bfs_with_path(EXAMPLE, 7, 0, -1)
        with self.assertRaises(ValueError):
            path_to([-1, 0], 0, 2)
        with self.assertRaises(ValueError):
            path_to([-1, 0], 3, 1)


class TestAgainstDijkstra(unittest.TestCase):
    def assert_shortest_path_tree(self, edges, n, start, dist, parent):
        weights = {}
        for u, v, w in edges:
            weights[(u, v)] = min(w, weights.get((u, v), 1))
        for v in range(n):
            if v == start or dist[v] == -1:
                self.assertEqual(parent[v], -1)
                continue
            p = parent[v]
            self.assertIn((p, v), weights)
            self.assertEqual(dist[p] + weights[(p, v)], dist[v], "the parent edge is on a shortest path")
            path = path_to(parent, start, v)
            self.assertEqual((path[0], path[-1]), (start, v))
            self.assertEqual(sum(weights[(a, b)] for a, b in zip(path, path[1:])), dist[v])

    def test_small_random_graphs(self):
        rng = random.Random(20261124)
        for _ in range(1500):
            n, edges, start = random_graph(rng, 10, 30)
            dist, parent = zero_one_bfs(edges, n, start)
            self.assertEqual(dist, dijkstra_reference(edges, n, start), (n, edges, start))
            self.assert_shortest_path_tree(edges, n, start, dist, parent)

    def test_larger_random_graphs(self):
        for seed in range(1, 41):
            rng = random.Random(seed)
            n = rng.randint(50, 400)
            edges = [(rng.randrange(n), rng.randrange(n), rng.randint(0, 1)) for _ in range(rng.randint(0, 4 * n))]
            start = rng.randrange(n)
            dist, parent = zero_one_bfs(edges, n, start)
            self.assertEqual(dist, dijkstra_reference(edges, n, start), seed)
            self.assert_shortest_path_tree(edges, n, start, dist, parent)

    def test_zero_heavy_and_one_heavy_graphs(self):
        rng = random.Random(55)
        for share in (0.05, 0.3, 0.7, 0.95):
            for _ in range(150):
                n, edges, start = random_graph(rng, 20, 60, zero_share=share)
                self.assertEqual(zero_one_bfs(edges, n, start)[0], dijkstra_reference(edges, n, start))


class TestOperationCounts(Instrumented):
    """O(V + E): at most 2V - 1 and at most E + 1 pops, and each adjacency entry read once."""

    def check(self, edges, n, start):
        _, _, queue, reads = self.run_recorded(edges, n, start)
        self.assertEqual(queue.violations, [])
        pops = sum(1 for kind, _, _ in queue.events if kind == "pop")
        self.assertLessEqual(pops, 2 * n - 1)
        self.assertLessEqual(pops, len(edges) + 1)
        self.assertLessEqual(reads, len(edges))
        return pops, reads

    def test_bounds_on_random_graphs(self):
        rng = random.Random(606)
        for _ in range(500):
            n, edges, start = random_graph(rng, 30, 120)
            self.check(edges, n, start)

    def test_growing_graphs(self):
        # Random graphs with E = 4V: pops plus edge reads stay a fixed share of V + E (about
        # 1.04 here; the bound is 2), while V + E grows sixteenfold.
        ratios = []
        for n in (1000, 2000, 4000, 8000, 16000):
            rng = random.Random(n)
            edges = [(rng.randrange(n), rng.randrange(n), rng.randint(0, 1)) for _ in range(4 * n)]
            pops, reads = self.check(edges, n, 0)
            ratios.append((pops + reads) / (n + len(edges)))
        self.assertLess(max(ratios), 2.0)
        self.assertLess(max(ratios) - min(ratios), 0.05)

    def test_every_vertex_pushed_twice(self):
        # The worst case for pops: n - 1 back pushes from the source, then a 0 chain improves them all.
        for n in (10, 100, 1000, 10000):
            edges = [(0, v, 1) for v in range(1, n)] + [(0, 1, 0)] + [(v, v + 1, 0) for v in range(1, n - 1)]
            pops, reads = self.check(edges, n, 0)
            self.assertEqual(pops, 2 * n - 1)
            self.assertEqual(reads, len(edges))


class TestGrid(unittest.TestCase):
    def test_city(self):
        # Column 5 is walls from top to bottom: one break is needed, and the roads lead to it.
        self.assertEqual(min_wall_breaks(CITY, (0, 0), (4, 6)), 1)
        self.assertEqual(min_wall_breaks(CITY, (0, 0), (4, 4)), 0)
        self.assertEqual(min_wall_breaks(CITY, (0, 6), (0, 0)), 1)

    def test_city_path(self):
        rows, cols = len(CITY), len(CITY[0])
        dist, parent = zero_one_bfs(grid_edges(CITY), rows * cols, 0)
        cells = [divmod(x, cols) for x in path_to(parent, 0, rows * cols - 1)]
        self.assertEqual(cells, [(0, 0), (0, 1), (0, 2), (1, 2), (2, 2), (2, 1), (2, 0), (3, 0),
                                 (4, 0), (4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6)])
        self.assertEqual([CITY[r][c] for r, c in cells].count("#"), 1)
        self.assertEqual([dist[r * cols + c] for r, c in [(0, 3), (0, 4), (0, 5), (3, 1)]], [1, 0, 1, 1])

    def test_grid_edges_order(self):
        # Cell 0 has neighbours down (2) and right (1); weights are the cost of entering them.
        self.assertEqual(grid_edges([".#", ".."]), [
            (0, 2, 0), (0, 1, 1),
            (1, 3, 0), (1, 0, 0),
            (2, 0, 0), (2, 3, 0),
            (3, 1, 1), (3, 2, 0),
        ])

    def test_small_grids(self):
        self.assertEqual(min_wall_breaks(["."], (0, 0), (0, 0)), 0)
        self.assertEqual(min_wall_breaks(["#"], (0, 0), (0, 0)), 0)  # the start cell is free
        self.assertEqual(min_wall_breaks(["#####"], (0, 0), (0, 4)), 4)
        self.assertEqual(min_wall_breaks(["#.#"], (0, 1), (0, 2)), 1)
        self.assertEqual(min_wall_breaks(["....", "....", "...."], (0, 0), (2, 3)), 0)
        self.assertEqual(min_wall_breaks(["####", "####", "####"], (0, 0), (2, 3)), 5)

    def test_random_grids_against_dijkstra(self):
        rng = random.Random(2290)
        for _ in range(300):
            rows, cols = rng.randint(1, 7), rng.randint(1, 7)
            grid = ["".join("#" if rng.random() < 0.4 else "." for _ in range(cols)) for _ in range(rows)]
            start = (rng.randrange(rows), rng.randrange(cols))
            goal = (rng.randrange(rows), rng.randrange(cols))
            want = dijkstra_reference(grid_edges(grid), rows * cols, start[0] * cols + start[1])[goal[0] * cols + goal[1]]
            self.assertEqual(min_wall_breaks(grid, start, goal), want, (grid, start, goal))

    def test_bad_grids_raise(self):
        for grid in ([], [""], ["..", "."], [".x"], ["S."]):
            with self.assertRaises(ValueError, msg=repr(grid)):
                min_wall_breaks(grid, (0, 0), (0, 0))
        for start, goal in (((0, 2), (0, 0)), ((0, 0), (1, 0)), ((-1, 0), (0, 0)), ((0, 0), (0, -1))):
            with self.assertRaises(ValueError):
                min_wall_breaks([".."], start, goal)


if __name__ == "__main__":
    unittest.main()
