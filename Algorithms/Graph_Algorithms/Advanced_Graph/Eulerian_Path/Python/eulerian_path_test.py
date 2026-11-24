"""
Tests for eulerian_path: the existence test and Hierholzer's algorithm, directed and undirected.
"""

import random
import unittest

import eulerian_path
from eulerian_path import CIRCUIT, NONE, PATH, EulerWalk, eulerian_kind, eulerian_path as find_path

# Two triangles joined by the edge 0-3; 0 and 3 have odd degree.
EXAMPLE = [(0, 3), (0, 1), (1, 2), (2, 0), (3, 4), (4, 5), (5, 3)]
# Directed: 0 -> 1 -> 4 with the cycle 1 -> 2 -> 3 -> 1 hanging off 1.
DIRECTED_EXAMPLE = [(0, 1), (1, 4), (1, 2), (2, 3), (3, 1)]
# Konigsberg: land masses A=0, B=1, C=2, D=3 and the seven bridges.
KONIGSBERG = [(0, 1), (0, 1), (0, 2), (0, 2), (0, 3), (1, 3), (2, 3)]


def brute_force(n, edges, directed):
    """(has a path, has a circuit) by trying every trail from every vertex."""
    if not edges:
        return True, True
    adj = [[] for _ in range(n)]
    for e, (u, v) in enumerate(edges):
        adj[u].append((v, e))
        if not directed and u != v:
            adj[v].append((u, e))
    used = [False] * len(edges)
    found = {"path": False, "circuit": False}

    def extend(start, v, depth):
        if depth == len(edges):
            found["path"] = True
            if v == start:
                found["circuit"] = True
            return
        for w, e in adj[v]:
            if not used[e]:
                used[e] = True
                extend(start, w, depth + 1)
                used[e] = False

    for s in range(n):
        extend(s, s, 0)
    return found["path"], found["circuit"]


def expected_start(n, edges, directed):
    """The start the tie rule names, computed from scratch."""
    if directed:
        surplus = [0] * n
        for u, v in edges:
            surplus[u] += 1
            surplus[v] -= 1
        plus = [v for v in range(n) if surplus[v] > 0]
        if plus:
            return plus[0]
    else:
        degree = [0] * n
        for u, v in edges:
            degree[u] += 1
            degree[v] += 1
        odd = [v for v in range(n) if degree[v] % 2]
        if odd:
            return odd[0]
    return min(min(u, v) for u, v in edges)


def random_graph(rng, max_n, max_edges, directed):
    """1 to max_n vertices and up to max_edges random edges; loops and repeats come up often."""
    n = rng.randint(1, max_n)
    edges = []
    for _ in range(rng.randint(0, max_edges)):
        if edges and rng.random() < 0.1:
            edges.append(rng.choice(edges))
        elif rng.random() < 0.08:
            v = rng.randrange(n)
            edges.append((v, v))
        else:
            edges.append((rng.randrange(n), rng.randrange(n)))
    return n, edges


def random_walk_graph(rng, n, length, closed):
    """The edges of a random walk of the given length, shuffled: a graph with an Eulerian walk."""
    v = rng.randrange(n)
    first = v
    edges = []
    for k in range(length):
        w = first if closed and k == length - 1 else rng.randrange(n)
        edges.append((v, w))
        v = w
    rng.shuffle(edges)
    return edges


class WalkAssertions(unittest.TestCase):
    def assert_valid_walk(self, n, edges, directed, walk):
        """Every edge exactly once, and each edge starts where the one before it ends."""
        self.assertIsInstance(walk, EulerWalk)
        vertices, edge_ids = walk
        if not edges:
            self.assertEqual(walk, EulerWalk([], []))
            return
        # Lengths first, then assertTrue: a failure should not diff two lists of 10^5 entries.
        self.assertEqual(len(edge_ids), len(edges))
        self.assertEqual(len(vertices), len(edges) + 1)
        self.assertTrue(sorted(edge_ids) == list(range(len(edges))), "every edge exactly once")
        for i, e in enumerate(edge_ids):
            u, v = edges[e]
            step = (vertices[i], vertices[i + 1])
            if directed:
                self.assertEqual(step, (u, v), f"edge {e} walked against its direction")
            else:
                self.assertIn(step, [(u, v), (v, u)], f"edge {e} does not join {step}")


class TestWorkedExamples(WalkAssertions):
    def test_undirected_example(self):
        # The walk runs 0 -> 3 -> 4 -> 5 -> 3 and is stuck; backing up to 0, it walks the
        # triangle 0 -> 1 -> 2 -> 0, which lands in front of the part already finished.
        self.assertEqual(eulerian_kind(6, EXAMPLE), PATH)
        self.assertEqual(find_path(6, EXAMPLE), EulerWalk([0, 1, 2, 0, 3, 4, 5, 3], [1, 2, 3, 0, 4, 5, 6]))

    def test_directed_example(self):
        # 0 -> 1 -> 4 is stuck at 4; backing up to 1, the cycle 1 -> 2 -> 3 -> 1 is spliced in.
        self.assertEqual(eulerian_kind(5, DIRECTED_EXAMPLE, directed=True), PATH)
        self.assertEqual(find_path(5, DIRECTED_EXAMPLE, directed=True), EulerWalk([0, 1, 2, 3, 1, 4], [0, 2, 3, 4, 1]))

    def test_konigsberg_has_no_walk(self):
        # All four land masses have odd degree (5, 3, 3, 3).
        self.assertEqual(eulerian_kind(4, KONIGSBERG), NONE)
        self.assertIsNone(find_path(4, KONIGSBERG))

    def test_one_more_bridge_gives_a_path(self):
        # An eighth bridge B-C leaves A and D odd: a path from A to D.
        edges = KONIGSBERG + [(1, 2)]
        self.assertEqual(eulerian_kind(4, edges), PATH)
        walk = find_path(4, edges)
        self.assert_valid_walk(4, edges, False, walk)
        self.assertEqual((walk.vertices[0], walk.vertices[-1]), (0, 3))
        self.assertEqual(walk, EulerWalk([0, 1, 0, 2, 0, 3, 1, 2, 3], [0, 1, 2, 3, 4, 5, 7, 6]))

    def test_input_is_not_modified(self):
        edges = list(EXAMPLE)
        eulerian_kind(6, edges)
        find_path(6, edges)
        self.assertEqual(edges, EXAMPLE)

    def test_edges_may_be_any_iterable(self):
        self.assertEqual(eulerian_kind(6, iter(EXAMPLE)), PATH)
        self.assertEqual(find_path(6, (e for e in EXAMPLE)).vertices, [0, 1, 2, 0, 3, 4, 5, 3])


class TestTieRule(WalkAssertions):
    def test_undirected_path_starts_at_the_smaller_odd_vertex(self):
        # The edges are written from 2, but 0 is the smaller odd vertex.
        self.assertEqual(find_path(3, [(2, 1), (1, 0)]), EulerWalk([0, 1, 2], [1, 0]))

    def test_circuit_starts_at_the_smallest_vertex_with_an_edge(self):
        self.assertEqual(find_path(4, [(3, 1), (1, 2), (2, 3)]), EulerWalk([1, 3, 2, 1], [0, 2, 1]))
        self.assertEqual(find_path(5, [(4, 2), (2, 4)], directed=True), EulerWalk([2, 4, 2], [1, 0]))

    def test_directed_path_starts_where_out_exceeds_in(self):
        # 3 has out = 2 and in = 1, so the walk must start there, though 0 is smaller.
        edges = [(0, 1), (1, 3), (3, 0), (3, 2)]
        self.assertEqual(find_path(4, edges, directed=True), EulerWalk([3, 0, 1, 3, 2], [2, 0, 1, 3]))

    def test_edge_order_decides_the_walk(self):
        # A bowtie: two triangles share vertex 0. Each edge order gives its own circuit.
        bowtie = [(0, 1), (1, 2), (2, 0), (0, 3), (3, 4), (4, 0)]
        self.assertEqual(find_path(5, bowtie).vertices, [0, 1, 2, 0, 3, 4, 0])
        self.assertEqual(find_path(5, bowtie[::-1]).vertices, [0, 4, 3, 0, 2, 1, 0])

    def test_a_detour_is_spliced_in_where_it_starts(self):
        # 0 -> 1 -> 2 -> 0 uses vertex 1's first two edges; the triangle 1-3-4 is walked as a
        # detour from 1 and lands right after the first 1 in the result.
        edges = [(0, 1), (1, 2), (2, 0), (1, 3), (3, 4), (4, 1)]
        self.assertEqual(find_path(5, edges), EulerWalk([0, 1, 3, 4, 1, 2, 0], [0, 3, 4, 5, 1, 2]))


class TestEdgeCases(WalkAssertions):
    def test_no_vertices(self):
        self.assertEqual(eulerian_kind(0, []), CIRCUIT)
        self.assertEqual(find_path(0, []), EulerWalk([], []))
        self.assertEqual(find_path(0, [], directed=True), EulerWalk([], []))

    def test_every_vertex_isolated(self):
        # No edge to walk: the empty walk, for both kinds of graph.
        for directed in (False, True):
            self.assertEqual(eulerian_kind(4, [], directed), CIRCUIT)
            self.assertEqual(find_path(4, [], directed), EulerWalk([], []))

    def test_single_self_loop(self):
        for directed in (False, True):
            self.assertEqual(eulerian_kind(1, [(0, 0)], directed), CIRCUIT)
            self.assertEqual(find_path(1, [(0, 0)], directed), EulerWalk([0, 0], [0]))
            self.assertEqual(find_path(3, [(2, 2)], directed), EulerWalk([2, 2], [0]))

    def test_self_loop_adds_two_to_the_degree(self):
        # Vertex 1 has degree 4 with its loop, so 0 and 2 are the odd ones.
        edges = [(0, 1), (1, 1), (1, 2)]
        self.assertEqual(eulerian_kind(3, edges), PATH)
        self.assertEqual(find_path(3, edges), EulerWalk([0, 1, 1, 2], [0, 1, 2]))
        self.assertEqual(find_path(3, edges, directed=True), EulerWalk([0, 1, 1, 2], [0, 1, 2]))

    def test_parallel_edges_are_separate_edges(self):
        self.assertEqual(find_path(2, [(0, 1), (0, 1)]), EulerWalk([0, 1, 0], [0, 1]))
        self.assertEqual(find_path(2, [(0, 1), (0, 1), (0, 1)]), EulerWalk([0, 1, 0, 1], [0, 1, 2]))
        self.assertEqual(eulerian_kind(2, [(0, 1), (0, 1)], directed=True), NONE)
        self.assertEqual(find_path(2, [(0, 1), (1, 0), (0, 1)], directed=True), EulerWalk([0, 1, 0, 1], [0, 1, 2]))

    def test_isolated_vertices_play_no_part(self):
        self.assertEqual(find_path(6, [(3, 4)]), EulerWalk([3, 4], [0]))
        self.assertEqual(find_path(6, [(4, 3)], directed=True), EulerWalk([4, 3], [0]))
        self.assertEqual(find_path(9, [(7, 5), (5, 8), (8, 7)]), EulerWalk([5, 7, 8, 5], [0, 2, 1]))

    def test_disconnected_edge_set(self):
        # Every degree is even, but the edges form two triangles: no single walk takes both.
        two = [(0, 1), (1, 2), (2, 0), (3, 4), (4, 5), (5, 3)]
        self.assertEqual(eulerian_kind(6, two), NONE)
        self.assertIsNone(find_path(6, two))
        self.assertIsNone(find_path(6, two, directed=True))
        # A loop on its own counts as a component too.
        self.assertIsNone(find_path(3, [(0, 1), (1, 0), (2, 2)]))
        self.assertIsNone(find_path(3, [(0, 1), (1, 0), (2, 2)], directed=True))
        # Odd degrees that would allow a path, but in two pieces.
        self.assertIsNone(find_path(4, [(0, 1), (2, 3), (2, 3), (2, 3)]))

    def test_directed_weakly_but_not_strongly_connected(self):
        # Nothing leaves 3, so the graph is not strongly connected; a path still exists.
        edges = [(0, 1), (1, 2), (2, 0), (2, 3)]
        self.assertEqual(eulerian_kind(4, edges, directed=True), PATH)
        self.assertEqual(find_path(4, edges, directed=True), EulerWalk([2, 0, 1, 2, 3], [2, 0, 1, 3]))
        self.assertEqual(find_path(2, [(0, 1)], directed=True), EulerWalk([0, 1], [0]))

    def test_directed_degree_failures(self):
        self.assertEqual(eulerian_kind(3, [(0, 1), (0, 2)], directed=True), NONE)  # out - in = 2 at 0
        self.assertEqual(eulerian_kind(4, [(0, 1), (2, 3)], directed=True), NONE)  # two starts, two ends
        self.assertEqual(eulerian_kind(3, [(1, 0), (2, 0)], directed=True), NONE)  # in - out = 2 at 0
        # The same edges undirected are fine: a path 1 - 0 - 2.
        self.assertEqual(find_path(3, [(1, 0), (2, 0)]), EulerWalk([1, 0, 2], [0, 1]))

    def test_four_odd_vertices(self):
        k4 = [(0, 1), (0, 2), (0, 3), (1, 2), (1, 3), (2, 3)]
        self.assertEqual(eulerian_kind(4, k4), NONE)
        self.assertIsNone(find_path(4, k4))

    def test_invalid_input_raises(self):
        for fn in (eulerian_kind, find_path):
            for directed in (False, True):
                with self.assertRaises(ValueError):
                    fn(-1, [], directed)
                with self.assertRaises(ValueError):
                    fn(2, [(0, 2)], directed)
                with self.assertRaises(ValueError):
                    fn(2, [(-1, 0)], directed)
                with self.assertRaises(ValueError):
                    fn(0, [(0, 0)], directed)


class TestDeepGraphs(WalkAssertions):
    """10^5 edges in a row: a recursive Hierholzer would need 10^5 nested calls."""

    N = 100_000

    def test_long_undirected_cycle(self):
        n = self.N
        edges = [(i, (i + 1) % n) for i in range(n)]
        walk = find_path(n, edges)
        # assertTrue, not assertEqual: a failure should not diff two lists of 10^5 entries.
        self.assertTrue(walk.vertices == list(range(n)) + [0], "the walk goes round the cycle in edge order")
        self.assertTrue(walk.edge_ids == list(range(n)))

    def test_long_directed_path(self):
        n = self.N
        edges = [(i, i + 1) for i in range(n)]
        rng = random.Random(5)
        rng.shuffle(edges)
        walk = find_path(n + 1, edges, directed=True)
        self.assertTrue(walk.vertices == list(range(n + 1)), "the only walk: 0, 1, ..., n")
        self.assert_valid_walk(n + 1, edges, True, walk)

    def test_long_random_walks(self):
        rng = random.Random(1691)
        for closed in (False, True):
            for directed in (False, True):
                edges = random_walk_graph(rng, 300, self.N, closed)
                walk = find_path(300, edges, directed)
                self.assert_valid_walk(300, edges, directed, walk)


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
    """Hierholzer's walk is O(V + E) because ptr[v], the next entry of adj[v] to look at, only
    moves forward: every entry of every adjacency list is read exactly once. A walk that loses
    the pointer and scans adj[v] from the front each time it comes back to v reads the used
    entries again, which is quadratic on a vertex that is entered many times.
    """

    def setUp(self):
        real_adjacency = eulerian_path._adjacency

        def counted(n, edges, directed):
            return [CountingList(row) for row in real_adjacency(n, edges, directed)]

        eulerian_path._adjacency = counted
        self.addCleanup(setattr, eulerian_path, "_adjacency", real_adjacency)

    def reads(self, n, edges, directed):
        start = CountingList.reads
        walk = find_path(n, edges, directed)
        return CountingList.reads - start, walk

    def test_every_entry_is_read_exactly_once(self):
        rng = random.Random(4242)
        for _ in range(300):
            directed = rng.random() < 0.5
            n = rng.randint(1, 12)
            edges = random_walk_graph(rng, n, rng.randint(1, 60), rng.random() < 0.5)
            reads, walk = self.reads(n, edges, directed)
            self.assertIsNotNone(walk)
            self.assertEqual(reads, len(edges) if directed else 2 * len(edges), (n, edges, directed))

    def test_never_more_reads_than_entries(self):
        rng = random.Random(4243)
        for _ in range(300):
            directed = rng.random() < 0.5
            n, edges = random_graph(rng, 8, 20, directed)
            reads, _ = self.reads(n, edges, directed)
            self.assertLessEqual(reads, len(edges) if directed else 2 * len(edges), (n, edges, directed))

    def test_a_vertex_entered_many_times(self):
        # A flower: k triangles 0-a-b-0 share vertex 0, which the walk enters k times. A scan
        # from the front of adj[0] on every return would read about k^2 entries; the pointer
        # keeps it at 2E for the undirected flower and E for the directed one.
        k = 400
        petals = []
        for p in range(k):
            a, b = 2 * p + 1, 2 * p + 2
            petals += [(0, a), (a, b), (b, 0)]
        for directed in (False, True):
            reads, walk = self.reads(2 * k + 1, petals, directed)
            self.assertEqual(walk.vertices[0], 0)
            self.assertEqual(reads, len(petals) if directed else 2 * len(petals))

    def test_parallel_edges_and_loops(self):
        # 300 loops on one vertex and 301 parallel edges to another: one long adjacency list.
        edges = [(0, 0)] * 300 + [(0, 1)] * 301
        for directed in (False, True):
            reads, walk = self.reads(2, edges, directed)
            if directed:
                self.assertIsNone(walk)  # 0 -> 1 three hundred and one times: out - in = 301 at 0
            else:
                self.assertEqual(reads, 2 * len(edges))
                self.assertEqual((walk.vertices[0], walk.vertices[-1]), (0, 1))


class TestRandomGraphs(WalkAssertions):
    def check(self, n, edges, directed):
        has_path, has_circuit = brute_force(n, edges, directed)
        want = CIRCUIT if has_circuit else PATH if has_path else NONE
        kind = eulerian_kind(n, edges, directed)
        self.assertEqual(kind, want, (n, edges, directed))
        walk = find_path(n, edges, directed)
        if want == NONE:
            self.assertIsNone(walk)
            return
        self.assert_valid_walk(n, edges, directed, walk)
        if edges:
            self.assertEqual(walk.vertices[0], expected_start(n, edges, directed), "the tie rule's start")
            self.assertEqual(walk.vertices[0] == walk.vertices[-1], want == CIRCUIT)

    def test_small_undirected_graphs_against_brute_force(self):
        rng = random.Random(20261124)
        for _ in range(600):
            n, edges = random_graph(rng, 5, 7, False)
            self.check(n, edges, False)

    def test_small_directed_graphs_against_brute_force(self):
        rng = random.Random(20261125)
        for _ in range(600):
            n, edges = random_graph(rng, 5, 7, True)
            self.check(n, edges, True)

    def test_graphs_built_from_walks_against_brute_force(self):
        # Random graphs rarely pass the test; graphs made of one random walk always do.
        rng = random.Random(1693)
        for _ in range(300):
            directed = rng.random() < 0.5
            n = rng.randint(1, 5)
            edges = random_walk_graph(rng, n, rng.randint(1, 7), rng.random() < 0.5)
            self.check(n, edges, directed)

    def test_larger_walk_graphs_and_their_unions(self):
        rng = random.Random(2097)
        for _ in range(200):
            directed = rng.random() < 0.5
            n = rng.randint(2, 30)
            edges = random_walk_graph(rng, n, rng.randint(1, 150), rng.random() < 0.5)
            walk = find_path(n, edges, directed)
            self.assert_valid_walk(n, edges, directed, walk)
            self.assertEqual(walk.vertices[0], expected_start(n, edges, directed))
            # A second walk on vertices of their own: two components, so no walk at all.
            shifted = [(u + n, v + n) for u, v in random_walk_graph(rng, n, rng.randint(1, 20), True)]
            self.assertIsNone(find_path(2 * n, edges + shifted, directed))


if __name__ == "__main__":
    unittest.main()
