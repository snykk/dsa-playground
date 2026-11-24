"""
Tests for bipartite_matching: Kuhn's algorithm, Hopcroft-Karp and Konig's vertex cover.
"""

import random
import unittest
from collections import deque
from functools import lru_cache
from itertools import combinations

import bipartite_matching
from bipartite_matching import hopcroft_karp, kuhn, min_vertex_cover

# L0 reaches R1, R2 and R3; L1, L2 and L3 reach only R0 and R1, so one of them stays free.
EXAMPLE = [(0, 1), (0, 2), (0, 3), (1, 0), (1, 1), (2, 0), (3, 1)]


def brute_max_matching(n_left, n_right, edges):
    """The largest matching, by trying every choice for each left vertex in turn."""
    adj = [sorted({v for u, v in edges if u == x}) for x in range(n_left)]

    @lru_cache(maxsize=None)
    def best(u, used):
        if u == n_left:
            return 0
        result = best(u + 1, used)
        for v in adj[u]:
            if not used & (1 << v):
                result = max(result, 1 + best(u + 1, used | (1 << v)))
        return result

    return best(0, 0)


def brute_min_cover_size(n_left, n_right, edges):
    """The size of the smallest vertex set that touches every edge, by trying every set."""
    vertices = [("L", u) for u in range(n_left)] + [("R", v) for v in range(n_right)]
    for k in range(len(vertices) + 1):
        for chosen in combinations(vertices, k):
            picked = set(chosen)
            if all(("L", u) in picked or ("R", v) in picked for u, v in edges):
                return k
    raise AssertionError("the whole vertex set is always a cover")


def reduction_max_flow(n_left, n_right, edges):
    """Edmonds-Karp on the flow network of the reduction: source -> left -> right -> sink, capacity 1."""
    source, sink = n_left + n_right, n_left + n_right + 1
    cap = {x: {} for x in range(n_left + n_right + 2)}

    def add(a, b):
        cap[a][b] = 1
        cap[b].setdefault(a, 0)

    for u in range(n_left):
        add(source, u)
    for v in range(n_right):
        add(n_left + v, sink)
    for u, v in edges:
        add(u, n_left + v)
    flow = 0
    while True:
        parent = {source: None}
        queue = deque([source])
        while queue and sink not in parent:
            a = queue.popleft()
            for b, c in cap[a].items():
                if c > 0 and b not in parent:
                    parent[b] = a
                    queue.append(b)
        if sink not in parent:
            return flow
        b = sink
        while parent[b] is not None:
            a = parent[b]
            cap[a][b] -= 1
            cap[b][a] += 1
            b = a
        flow += 1


def random_graph(rng, max_side, max_edges):
    """1 to max_side vertices a side (now and then none), and up to max_edges random edges, repeats included."""
    n_left = 0 if rng.random() < 0.05 else rng.randint(1, max_side)
    n_right = 0 if rng.random() < 0.05 else rng.randint(1, max_side)
    if n_left == 0 or n_right == 0:
        return n_left, n_right, []
    edges = [(rng.randrange(n_left), rng.randrange(n_right)) for _ in range(rng.randint(0, max_edges))]
    return n_left, n_right, edges


class TestWorkedExample(unittest.TestCase):
    def test_kuhn(self):
        # L2's search goes L2 - R0 - L1 - R1 - L0 - R2; L3 finds no augmenting path.
        self.assertEqual(kuhn(4, 4, EXAMPLE), (3, [2, 1, 0, -1]))

    def test_hopcroft_karp(self):
        # Phase 1 matches L0 - R1 and L1 - R0; phase 2 takes L3 - R1 - L0 - R2, and L2 is a dead end.
        self.assertEqual(hopcroft_karp(4, 4, EXAMPLE), (3, [2, 0, -1, 1]))

    def test_min_vertex_cover(self):
        self.assertEqual(min_vertex_cover(4, 4, EXAMPLE), ([0], [0, 1]))

    def test_input_is_not_modified(self):
        edges = list(EXAMPLE)
        kuhn(4, 4, edges)
        hopcroft_karp(4, 4, edges)
        min_vertex_cover(4, 4, edges)
        self.assertEqual(edges, EXAMPLE)

    def test_edges_may_be_any_iterable(self):
        self.assertEqual(kuhn(4, 4, iter(EXAMPLE)), (3, [2, 1, 0, -1]))
        self.assertEqual(hopcroft_karp(4, 4, (e for e in EXAMPLE)), (3, [2, 0, -1, 1]))
        self.assertEqual(min_vertex_cover(4, 4, iter(EXAMPLE)), ([0], [0, 1]))


class TestEdgeCases(unittest.TestCase):
    def test_no_edges(self):
        self.assertEqual(kuhn(3, 2, []), (0, [-1, -1, -1]))
        self.assertEqual(hopcroft_karp(3, 2, []), (0, [-1, -1, -1]))
        self.assertEqual(min_vertex_cover(3, 2, []), ([], []))

    def test_empty_left_side(self):
        self.assertEqual(kuhn(0, 3, []), (0, []))
        self.assertEqual(hopcroft_karp(0, 3, []), (0, []))
        self.assertEqual(min_vertex_cover(0, 3, []), ([], []))

    def test_empty_right_side(self):
        self.assertEqual(kuhn(2, 0, []), (0, [-1, -1]))
        self.assertEqual(hopcroft_karp(2, 0, []), (0, [-1, -1]))
        self.assertEqual(min_vertex_cover(2, 0, []), ([], []))

    def test_both_sides_empty(self):
        self.assertEqual(kuhn(0, 0, []), (0, []))
        self.assertEqual(hopcroft_karp(0, 0, []), (0, []))
        self.assertEqual(min_vertex_cover(0, 0, []), ([], []))

    def test_single_edge(self):
        self.assertEqual(kuhn(1, 1, [(0, 0)]), (1, [0]))
        self.assertEqual(hopcroft_karp(1, 1, [(0, 0)]), (1, [0]))
        self.assertEqual(min_vertex_cover(1, 1, [(0, 0)]), ([0], []))

    def test_duplicate_edges_change_nothing(self):
        plain = [(0, 0), (1, 0), (1, 1), (2, 1)]
        doubled = [(0, 0), (0, 0), (1, 0), (1, 1), (1, 0), (2, 1), (2, 1)]
        self.assertEqual(kuhn(3, 2, doubled), kuhn(3, 2, plain))
        self.assertEqual(kuhn(3, 2, doubled), (2, [0, 1, -1]))
        self.assertEqual(hopcroft_karp(3, 2, doubled), hopcroft_karp(3, 2, plain))
        self.assertEqual(hopcroft_karp(3, 2, doubled), (2, [0, 1, -1]))
        self.assertEqual(min_vertex_cover(3, 2, doubled), ([], [0, 1]))

    def test_complete_bipartite_graph(self):
        # Kuhn's root k first asks for R0 and pushes every earlier left vertex one place along;
        # Hopcroft-Karp's first phase gives each left vertex the first free right vertex.
        k35 = [(u, v) for u in range(3) for v in range(5)]
        self.assertEqual(kuhn(3, 5, k35), (3, [2, 1, 0]))
        self.assertEqual(hopcroft_karp(3, 5, k35), (3, [0, 1, 2]))
        self.assertEqual(min_vertex_cover(3, 5, k35), ([0, 1, 2], []))
        k53 = [(u, v) for u in range(5) for v in range(3)]
        self.assertEqual(kuhn(5, 3, k53), (3, [2, 1, 0, -1, -1]))
        self.assertEqual(hopcroft_karp(5, 3, k53), (3, [0, 1, 2, -1, -1]))
        self.assertEqual(min_vertex_cover(5, 3, k53), ([], [0, 1, 2]))

    def test_edge_order_and_algorithm_decide_the_matching(self):
        # One graph, two edge orders, two algorithms: two different maximum matchings.
        k22 = [(0, 0), (0, 1), (1, 0), (1, 1)]
        self.assertEqual(kuhn(2, 2, k22), (2, [1, 0]))
        self.assertEqual(hopcroft_karp(2, 2, k22), (2, [0, 1]))
        self.assertEqual(kuhn(2, 2, k22[::-1]), (2, [0, 1]))
        self.assertEqual(hopcroft_karp(2, 2, k22[::-1]), (2, [1, 0]))

    def test_vertices_without_neighbours(self):
        # L1 and R2 have no edge; they stay unmatched and out of the cover.
        edges = [(0, 0), (2, 1), (2, 0)]
        self.assertEqual(kuhn(3, 3, edges), (2, [0, -1, 1]))
        self.assertEqual(hopcroft_karp(3, 3, edges), (2, [0, -1, 1]))
        self.assertEqual(min_vertex_cover(3, 3, edges), ([0, 2], []))

    def test_star_has_a_matching_of_one(self):
        star = [(0, v) for v in range(4)]
        self.assertEqual(kuhn(1, 4, star), (1, [0]))
        self.assertEqual(min_vertex_cover(1, 4, star), ([0], []))
        star = [(u, 0) for u in range(4)]
        self.assertEqual(kuhn(4, 1, star), (1, [0, -1, -1, -1]))
        self.assertEqual(hopcroft_karp(4, 1, star), (1, [0, -1, -1, -1]))
        self.assertEqual(min_vertex_cover(4, 1, star), ([], [0]))

    def test_invalid_input_raises(self):
        for fn in (kuhn, hopcroft_karp, min_vertex_cover):
            with self.assertRaises(ValueError):
                fn(-1, 2, [])
            with self.assertRaises(ValueError):
                fn(2, -1, [])
            with self.assertRaises(ValueError):
                fn(2, 2, [(2, 0)])
            with self.assertRaises(ValueError):
                fn(2, 2, [(0, 2)])
            with self.assertRaises(ValueError):
                fn(2, 2, [(-1, 0)])
            with self.assertRaises(ValueError):
                fn(2, 0, [(0, 0)])


class TestLongAugmentingPath(unittest.TestCase):
    def test_no_recursion_limit(self):
        # L(n-1) reaches only R0, so its augmenting path runs through every vertex:
        # L(n-1) - R0 - L0 - R1 - L1 - ... - L(n-2) - R(n-1). A recursive DFS would need n levels.
        n = 3000
        edges = [(u, u) for u in range(n - 1)] + [(u, u + 1) for u in range(n - 1)] + [(n - 1, 0)]
        want = (n, list(range(1, n)) + [0])
        self.assertEqual(kuhn(n, n, edges), want)
        self.assertEqual(hopcroft_karp(n, n, edges), want)
        left, right = min_vertex_cover(n, n, edges)
        self.assertEqual(len(left) + len(right), n)


class TestHopcroftKarpPhases(unittest.TestCase):
    """Watch the phases through the module's own helpers: every path of a phase is a shortest one."""

    def phases(self, n_left, n_right, edges):
        phases = []
        real_bfs, real_augment = bipartite_matching._bfs_layers, bipartite_matching._hk_augment

        def bfs(adj, match_left, match_right, dist):
            last = real_bfs(adj, match_left, match_right, dist)
            phases.append({"last": last, "paths": []})
            return last

        def augment(root, adj, match_left, match_right, dist):
            before = list(match_left)
            found = real_augment(root, adj, match_left, match_right, dist)
            # Flipping a path gives every left vertex on it a new partner, and no other one.
            changed = {u for u, v in enumerate(match_left) if v != before[u]}
            self.assertEqual(bool(changed), found)
            if found:
                phases[-1]["paths"].append(changed)
            return found

        bipartite_matching._bfs_layers, bipartite_matching._hk_augment = bfs, augment
        try:
            size, _ = hopcroft_karp(n_left, n_right, edges)
        finally:
            bipartite_matching._bfs_layers, bipartite_matching._hk_augment = real_bfs, real_augment
        return size, phases

    def test_worked_example(self):
        size, phases = self.phases(4, 4, EXAMPLE)
        self.assertEqual([p["last"] for p in phases], [0, 1, -1])
        self.assertEqual([p["paths"] for p in phases], [[{0}, {1}], [{0, 3}], []])

    def test_vertex_disjoint_shortest_paths_that_grow(self):
        rng = random.Random(1139)
        for _ in range(200):
            n_left, n_right, edges = random_graph(rng, 25, 90)
            size, phases = self.phases(n_left, n_right, edges)
            self.assertEqual(phases[-1], {"last": -1, "paths": []})
            lasts = [p["last"] for p in phases[:-1]]
            self.assertEqual(lasts, sorted(set(lasts)), "shortest augmenting paths must grow")
            for p in phases[:-1]:
                self.assertTrue(p["paths"], "a phase with layers finds at least one path")
                for path in p["paths"]:
                    self.assertEqual(len(path), p["last"] + 1)
                touched = [u for path in p["paths"] for u in path]
                self.assertEqual(len(touched), len(set(touched)), "paths of a phase share no vertex")
            self.assertEqual(sum(len(p["paths"]) for p in phases), size)


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


class TestOperationCounts(unittest.TestCase):
    """The time bounds rest on one fact each, checked here by counting reads of adj entries.

    One Kuhn search enters each left vertex at most once, so it reads each entry at most once:
    O(E) per search. In one Hopcroft-Karp phase the BFS reads each entry at most once, and so
    do all the DFSs of the phase together, since a dead end and a flipped path are never
    entered again: O(V + E) per phase.
    """

    def setUp(self):
        real_adjacency = bipartite_matching._adjacency

        def counted(n_left, n_right, edges):
            return [CountingList(row) for row in real_adjacency(n_left, n_right, edges)]

        bipartite_matching._adjacency = counted
        self.addCleanup(setattr, bipartite_matching, "_adjacency", real_adjacency)

    def graphs(self):
        rng = random.Random(4242)
        graphs = [random_graph(rng, 25, 90) for _ in range(300)]
        graphs.append((40, 40, [(u, v) for u in range(40) for v in range(40)]))
        n = 300
        graphs.append((n, n, [(u, u) for u in range(n - 1)] + [(u, u + 1) for u in range(n - 1)] + [(n - 1, 0)]))
        return graphs

    def test_one_kuhn_search_reads_each_entry_at_most_once(self):
        real_augment = bipartite_matching._kuhn_augment
        reads = []

        def augment(*args):
            start = CountingList.reads
            found = real_augment(*args)
            reads.append(CountingList.reads - start)
            return found

        bipartite_matching._kuhn_augment = augment
        self.addCleanup(setattr, bipartite_matching, "_kuhn_augment", real_augment)
        for n_left, n_right, edges in self.graphs():
            reads.clear()
            kuhn(n_left, n_right, edges)
            self.assertEqual(len(reads), n_left)
            self.assertLessEqual(max(reads, default=0), len(edges), (n_left, n_right, edges))

    def test_one_hopcroft_karp_phase_reads_each_entry_at_most_twice(self):
        real_bfs = bipartite_matching._bfs_layers
        marks = []  # (reads when a BFS starts, reads when it returns)

        def bfs(*args):
            start = CountingList.reads
            last = real_bfs(*args)
            marks.append((start, CountingList.reads))
            return last

        bipartite_matching._bfs_layers = bfs
        self.addCleanup(setattr, bipartite_matching, "_bfs_layers", real_bfs)
        for n_left, n_right, edges in self.graphs():
            marks.clear()
            hopcroft_karp(n_left, n_right, edges)
            ends = [start for start, _ in marks[1:]] + [CountingList.reads]
            for (start, bfs_end), phase_end in zip(marks, ends):
                self.assertLessEqual(bfs_end - start, len(edges), "the BFS of a phase")
                self.assertLessEqual(phase_end - bfs_end, len(edges), "the DFSs of a phase together")


class TestRandomGraphs(unittest.TestCase):
    def assert_valid_matching(self, n_left, n_right, edges, size, match_left):
        self.assertEqual(len(match_left), n_left)
        edge_set = set(edges)
        partners = [v for v in match_left if v != -1]
        self.assertEqual(len(partners), size)
        self.assertEqual(len(set(partners)), size, "a right vertex is used twice")
        for u, v in enumerate(match_left):
            if v != -1:
                self.assertIn((u, v), edge_set)

    def assert_valid_cover(self, edges, size, cover):
        left, right = cover
        self.assertEqual(left, sorted(set(left)))
        self.assertEqual(right, sorted(set(right)))
        self.assertEqual(len(left) + len(right), size)
        left_set, right_set = set(left), set(right)
        for u, v in edges:
            self.assertTrue(u in left_set or v in right_set, f"edge ({u}, {v}) is not covered")

    def test_small_graphs_against_brute_force(self):
        rng = random.Random(20261122)
        for _ in range(400):
            n_left, n_right, edges = random_graph(rng, 6, 20)
            want = brute_max_matching(n_left, n_right, edges)
            k_size, k_match = kuhn(n_left, n_right, edges)
            h_size, h_match = hopcroft_karp(n_left, n_right, edges)
            self.assertEqual(k_size, want, (n_left, n_right, edges))
            self.assertEqual(h_size, want, (n_left, n_right, edges))
            self.assert_valid_matching(n_left, n_right, edges, k_size, k_match)
            self.assert_valid_matching(n_left, n_right, edges, h_size, h_match)
            self.assert_valid_cover(edges, want, min_vertex_cover(n_left, n_right, edges))

    def test_cover_is_minimum_on_tiny_graphs(self):
        rng = random.Random(7)
        for _ in range(150):
            n_left, n_right, edges = random_graph(rng, 4, 9)
            left, right = min_vertex_cover(n_left, n_right, edges)
            self.assertEqual(len(left) + len(right), brute_min_cover_size(n_left, n_right, edges))

    def test_larger_graphs_against_the_flow_reduction(self):
        rng = random.Random(1696)
        for _ in range(120):
            n_left, n_right, edges = random_graph(rng, 30, 150)
            want = reduction_max_flow(n_left, n_right, edges)
            k_size, k_match = kuhn(n_left, n_right, edges)
            h_size, h_match = hopcroft_karp(n_left, n_right, edges)
            self.assertEqual(k_size, want)
            self.assertEqual(h_size, want)
            self.assert_valid_matching(n_left, n_right, edges, k_size, k_match)
            self.assert_valid_matching(n_left, n_right, edges, h_size, h_match)
            self.assert_valid_cover(edges, want, min_vertex_cover(n_left, n_right, edges))


if __name__ == "__main__":
    unittest.main()
