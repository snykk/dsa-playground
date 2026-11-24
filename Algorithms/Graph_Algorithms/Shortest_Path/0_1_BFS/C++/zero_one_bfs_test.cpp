// Tests for zero_one_bfs.cpp: the worked example, edge cases, invalid input, the grid example,
// random graphs against Dijkstra, counted work, and 40 graphs pinned to the Python outputs.
#include <algorithm>
#include <cassert>
#include <cstdint>
#include <functional>
#include <iostream>
#include <queue>
#include <string>
#include <utility>
#include <vector>

#include "zero_one_bfs.cpp"

using Ints = std::vector<int>;

// A to G are vertices 0 to 6. B is first reached by A->B (1), then by A->C->B (0 + 0).
const std::vector<Edge> kExample = {{0, 1, 1}, {0, 2, 0}, {2, 1, 0}, {1, 3, 1}, {2, 4, 1},
                                    {4, 3, 0}, {4, 5, 1}, {3, 5, 1}, {6, 0, 1}};

// Roads '.' cost 0 to enter, walls '#' cost 1. Column 5 is a wall from top to bottom.
const std::vector<std::string> kCity = {"...#.#.", "##.#.#.", "...#.#.", ".###.#.", ".....#."};

template <typename F>
bool throwsInvalidArgument(F f) {
    try {
        f();
    } catch (const std::invalid_argument&) {
        return true;
    }
    return false;
}

// ---------------------------------------------------------------- references

// Plain Dijkstra with a binary heap; -1 for an unreachable vertex.
Ints dijkstraReference(const std::vector<Edge>& edges, int n, int start) {
    std::vector<std::vector<std::pair<int, int>>> adj(n);
    for (const Edge& e : edges) adj[e.u].push_back({e.v, e.weight});
    Ints dist(n, -1);
    std::priority_queue<std::pair<int, int>, std::vector<std::pair<int, int>>, std::greater<>> heap;
    heap.push({0, start});
    while (!heap.empty()) {
        auto [d, u] = heap.top();
        heap.pop();
        if (dist[u] != -1) continue;
        dist[u] = d;
        for (auto [v, w] : adj[u]) {
            if (dist[v] == -1) heap.push({d + w, v});
        }
    }
    return dist;
}

// A small linear congruential generator, so the random graphs are the same on every platform.
struct Lcg {
    std::uint64_t state;
    explicit Lcg(std::uint64_t seed) : state(seed) {}
    int below(int n) {
        state = state * 6364136223846793005ULL + 1442695040888963407ULL;
        return static_cast<int>((state >> 33) % static_cast<std::uint64_t>(n));
    }
};

struct Graph {
    int n;
    std::vector<Edge> edges;
    int start;
};

Graph randomGraph(Lcg& rng, int maxN, int maxEdges) {
    Graph g{1 + rng.below(maxN), {}, 0};
    int m = rng.below(maxEdges + 1);
    for (int k = 0; k < m; ++k) g.edges.push_back({rng.below(g.n), rng.below(g.n), rng.below(2)});
    g.start = rng.below(g.n);
    return g;
}

// ---------------------------------------------------------------- the worked example

void testWorkedExample() {
    ShortestPaths r = zeroOneBfs(kExample, 7, 0);
    assert((r.dist == Ints{0, 0, 0, 1, 1, 2, -1}));
    assert((r.parent == Ints{-1, 2, 0, 1, 2, 4, -1}));
    assert((pathTo(r.parent, 0, 5) == Ints{0, 2, 4, 5}));
    assert((pathTo(r.parent, 0, 3) == Ints{0, 2, 1, 3}));
    assert((pathTo(r.parent, 0, 0) == Ints{0}));
    assert(pathTo(r.parent, 0, 6).empty());
    auto [d, path] = zeroOneBfsWithPath(kExample, 7, 0, 5);
    assert(d == 2 && (path == Ints{0, 2, 4, 5}));
    auto [d6, path6] = zeroOneBfsWithPath(kExample, 7, 0, 6);
    assert(d6 == -1 && path6.empty());
    ShortestPaths fromG = zeroOneBfs(kExample, 7, 6);
    assert((fromG.dist == Ints{1, 1, 1, 2, 2, 3, 0}));
    assert((fromG.parent == Ints{6, 2, 0, 1, 2, 4, -1}));
    std::cout << "OK testWorkedExample" << std::endl;
}

void testWorkedExampleCounts() {
    // Seven pops, one of them B's stale entry; every edge but G->A is read once.
    zero_one_bfs_detail::Counters c;
    zero_one_bfs_detail::search(zero_one_bfs_detail::adjacency(kExample, 7, 0), 0, &c);
    assert(c.pops == 7 && c.stalePops == 1 && c.edgeScans == 8);
    std::cout << "OK testWorkedExampleCounts" << std::endl;
}

// ---------------------------------------------------------------- edge cases

void testSmallGraphs() {
    ShortestPaths one = zeroOneBfs({}, 1, 0);
    assert((one.dist == Ints{0}) && (one.parent == Ints{-1}));
    ShortestPaths none = zeroOneBfs({}, 3, 1);
    assert((none.dist == Ints{-1, 0, -1}) && (none.parent == Ints{-1, -1, -1}));
    auto [d, path] = zeroOneBfsWithPath({}, 3, 1, 2);
    assert(d == -1 && path.empty());
    std::cout << "OK testSmallGraphs" << std::endl;
}

void testUnreachableVertices() {
    std::vector<Edge> edges = {{0, 1, 1}, {2, 0, 0}, {3, 1, 1}};
    ShortestPaths r = zeroOneBfs(edges, 5, 0);
    assert((r.dist == Ints{0, 1, -1, -1, -1}) && (r.parent == Ints{-1, 0, -1, -1, -1}));
    for (int target : {2, 3, 4}) {
        auto [d, path] = zeroOneBfsWithPath(edges, 5, 0, target);
        assert(d == -1 && path.empty());
    }
    std::cout << "OK testUnreachableVertices" << std::endl;
}

void testSelfLoopsZeroCyclesParallelEdges() {
    std::vector<Edge> looped = {{0, 0, 0}, {0, 0, 1}, {0, 1, 1}, {1, 1, 0}, {1, 2, 0}, {2, 2, 1}};
    ShortestPaths r = zeroOneBfs(looped, 3, 0);
    assert((r.dist == Ints{0, 1, 1}) && (r.parent == Ints{-1, 0, 1}));

    std::vector<Edge> cycle = {{0, 1, 0}, {1, 2, 0}, {2, 0, 0}, {2, 3, 1}};
    r = zeroOneBfs(cycle, 4, 1);
    assert((r.dist == Ints{0, 0, 0, 1}) && (r.parent == Ints{2, -1, 1, 2}));

    r = zeroOneBfs({{0, 1, 1}, {0, 1, 0}}, 2, 0);
    assert((r.dist == Ints{0, 0}) && (r.parent == Ints{-1, 0}));
    r = zeroOneBfs({{0, 1, 1}, {0, 1, 1}, {0, 2, 0}, {2, 1, 1}}, 3, 0);
    assert((r.dist == Ints{0, 1, 0}) && (r.parent == Ints{-1, 0, 0}));
    std::cout << "OK testSelfLoopsZeroCyclesParallelEdges" << std::endl;
}

void testTiesKeepTheFirstParent() {
    // Back pushes come out in push order, front pushes in reverse.
    ShortestPaths back = zeroOneBfs({{0, 1, 1}, {0, 2, 1}, {1, 3, 0}, {2, 3, 0}}, 4, 0);
    assert((back.dist == Ints{0, 1, 1, 1}) && (back.parent == Ints{-1, 0, 0, 1}));
    ShortestPaths front = zeroOneBfs({{0, 1, 0}, {0, 2, 0}, {1, 3, 1}, {2, 3, 1}}, 4, 0);
    assert((front.dist == Ints{0, 0, 0, 1}) && (front.parent == Ints{-1, 0, 0, 2}));
    std::cout << "OK testTiesKeepTheFirstParent" << std::endl;
}

void testInvalidInputThrows() {
    for (int w : {2, -1, 7}) {
        assert(throwsInvalidArgument([&] { zeroOneBfs({{0, 1, 0}, {1, 0, w}}, 2, 0); }));
    }
    assert(throwsInvalidArgument([] { zeroOneBfs({}, -1, 0); }));
    assert(throwsInvalidArgument([] { zeroOneBfs({}, 0, 0); }));
    assert(throwsInvalidArgument([] { zeroOneBfs({{0, 2, 0}}, 2, 0); }));
    assert(throwsInvalidArgument([] { zeroOneBfs({{-1, 0, 1}}, 2, 0); }));
    assert(throwsInvalidArgument([] { zeroOneBfs({}, 2, 2); }));
    assert(throwsInvalidArgument([] { zeroOneBfs({}, 2, -1); }));
    assert(throwsInvalidArgument([] { zeroOneBfs({{0, 1, 0}, {2, 3, 5}}, 4, 0); }));  // unreachable, still checked
    assert(throwsInvalidArgument([] { zeroOneBfsWithPath(kExample, 7, 0, 7); }));
    assert(throwsInvalidArgument([] { pathTo({-1, 0}, 0, 2); }));
    assert(throwsInvalidArgument([] { pathTo({-1, 0}, 3, 1); }));
    std::cout << "OK testInvalidInputThrows" << std::endl;
}

void testLongChain() {
    // 200000 vertices in a line of alternating weights.
    const int n = 200000;
    std::vector<Edge> edges;
    for (int i = 0; i + 1 < n; ++i) edges.push_back({i, i + 1, i % 2});
    ShortestPaths r = zeroOneBfs(edges, n, 0);
    assert(r.dist[n - 1] == (n - 1) / 2);
    assert(static_cast<int>(pathTo(r.parent, 0, n - 1).size()) == n);
    std::cout << "OK testLongChain" << std::endl;
}

// ---------------------------------------------------------------- the grid

void testGrid() {
    assert(minWallBreaks(kCity, {0, 0}, {4, 6}) == 1);
    assert(minWallBreaks(kCity, {0, 0}, {4, 4}) == 0);
    assert(minWallBreaks(kCity, {0, 6}, {0, 0}) == 1);
    const int cols = 7;
    ShortestPaths r = zeroOneBfs(gridEdges(kCity), 35, 0);
    Ints path = pathTo(r.parent, 0, 34);
    Ints want;
    for (auto [row, col] : std::vector<std::pair<int, int>>{{0, 0}, {0, 1}, {0, 2}, {1, 2}, {2, 2}, {2, 1}, {2, 0}, {3, 0},
                                                            {4, 0}, {4, 1}, {4, 2}, {4, 3}, {4, 4}, {4, 5}, {4, 6}}) {
        want.push_back(row * cols + col);
    }
    assert(path == want);

    std::vector<Edge> small = gridEdges({".#", ".."});
    std::vector<Edge> expected = {{0, 2, 0}, {0, 1, 1}, {1, 3, 0}, {1, 0, 0}, {2, 0, 0}, {2, 3, 0}, {3, 1, 1}, {3, 2, 0}};
    assert(small.size() == expected.size());
    for (std::size_t i = 0; i < small.size(); ++i) {
        assert(small[i].u == expected[i].u && small[i].v == expected[i].v && small[i].weight == expected[i].weight);
    }

    assert(minWallBreaks({"."}, {0, 0}, {0, 0}) == 0);
    assert(minWallBreaks({"#"}, {0, 0}, {0, 0}) == 0);
    assert(minWallBreaks({"#####"}, {0, 0}, {0, 4}) == 4);
    assert(minWallBreaks({"####", "####", "####"}, {0, 0}, {2, 3}) == 5);
    assert(throwsInvalidArgument([] { minWallBreaks({}, {0, 0}, {0, 0}); }));
    assert(throwsInvalidArgument([] { minWallBreaks({""}, {0, 0}, {0, 0}); }));
    assert(throwsInvalidArgument([] { minWallBreaks({"..", "."}, {0, 0}, {0, 0}); }));
    assert(throwsInvalidArgument([] { minWallBreaks({".x"}, {0, 0}, {0, 0}); }));
    assert(throwsInvalidArgument([] { minWallBreaks({".."}, {0, 2}, {0, 0}); }));
    assert(throwsInvalidArgument([] { minWallBreaks({".."}, {0, 0}, {1, 0}); }));
    std::cout << "OK testGrid" << std::endl;
}

// ---------------------------------------------------------------- random graphs and work

void testRandomGraphsAgainstDijkstra() {
    Lcg rng(20261124);
    for (int t = 0; t < 2000; ++t) {
        Graph g = randomGraph(rng, 12, 36);
        ShortestPaths r = zeroOneBfs(g.edges, g.n, g.start);
        assert(r.dist == dijkstraReference(g.edges, g.n, g.start));
        for (int v = 0; v < g.n; ++v) {
            if (v == g.start || r.dist[v] == -1) {
                assert(r.parent[v] == -1);
                continue;
            }
            // The parent edge is on a shortest path: some edge parent -> v has the right weight.
            bool found = false;
            for (const Edge& e : g.edges) found |= e.u == r.parent[v] && e.v == v && r.dist[e.u] + e.weight == r.dist[v];
            assert(found);
        }
    }
    std::cout << "OK testRandomGraphsAgainstDijkstra (2000 graphs)" << std::endl;
}

void testWorkIsLinear() {
    using namespace zero_one_bfs_detail;
    Lcg rng(606);
    for (int t = 0; t < 500; ++t) {
        Graph g = randomGraph(rng, 30, 120);
        Counters c;
        search(adjacency(g.edges, g.n, g.start), g.start, &c);
        long long e = static_cast<long long>(g.edges.size());
        assert(c.pops <= 2LL * g.n - 1 && c.pops <= e + 1 && c.edgeScans <= e);
    }
    // Every vertex pushed twice: the worst case for pops, exactly 2V - 1.
    for (int n : {10, 1000, 100000}) {
        std::vector<Edge> edges;
        for (int v = 1; v < n; ++v) edges.push_back({0, v, 1});
        edges.push_back({0, 1, 0});
        for (int v = 1; v + 1 < n; ++v) edges.push_back({v, v + 1, 0});
        Counters c;
        search(adjacency(edges, n, 0), 0, &c);
        assert(c.pops == 2LL * n - 1 && c.stalePops == n - 1 && c.edgeScans == static_cast<long long>(edges.size()));
    }
    // Growing random graphs with E = 4V: the work stays a fixed share of V + E.
    double lo = 1e9, hi = 0;
    for (int n : {1000, 4000, 16000, 64000}) {
        Lcg g(n);
        std::vector<Edge> edges;
        for (int k = 0; k < 4 * n; ++k) edges.push_back({g.below(n), g.below(n), g.below(2)});
        Counters c;
        search(adjacency(edges, n, edges[0].u), edges[0].u, &c);  // a source with an edge out
        double ratio = static_cast<double>(c.pops + c.edgeScans) / (n + 4.0 * n);
        lo = std::min(lo, ratio);
        hi = std::max(hi, ratio);
    }
    assert(hi < 2.0 && hi - lo < 0.05);
    std::cout << "OK testWorkIsLinear" << std::endl;
}

// ---------------------------------------------------------------- agreement with Python

// Outputs computed by running the Python implementation (zero_one_bfs.py), whose distances
// equal those of the repository's dijkstra.py: fixed cases first, then seeded random graphs
// with self-loops and repeated edges.
struct PythonCase {
    int n;
    std::vector<Edge> edges;
    int start;
    Ints dist, parent;
};

const std::vector<PythonCase> kPythonCases = {
    {7, {{0, 1, 1}, {0, 2, 0}, {2, 1, 0}, {1, 3, 1}, {2, 4, 1}, {4, 3, 0}, {4, 5, 1}, {3, 5, 1}, {6, 0, 1}}, 0, {0, 0, 0, 1, 1, 2, -1}, {-1, 2, 0, 1, 2, 4, -1}},
    {7, {{0, 1, 1}, {0, 2, 0}, {2, 1, 0}, {1, 3, 1}, {2, 4, 1}, {4, 3, 0}, {4, 5, 1}, {3, 5, 1}, {6, 0, 1}}, 6, {1, 1, 1, 2, 2, 3, 0}, {6, 2, 0, 1, 2, 4, -1}},
    {1, {}, 0, {0}, {-1}},
    {3, {}, 1, {-1, 0, -1}, {-1, -1, -1}},
    {5, {{0, 1, 1}, {2, 0, 0}, {3, 1, 1}}, 0, {0, 1, -1, -1, -1}, {-1, 0, -1, -1, -1}},
    {3, {{0, 0, 0}, {0, 0, 1}, {0, 1, 1}, {1, 1, 0}, {1, 2, 0}, {2, 2, 1}}, 0, {0, 1, 1}, {-1, 0, 1}},
    {4, {{0, 1, 0}, {1, 2, 0}, {2, 0, 0}, {2, 3, 1}}, 1, {0, 0, 0, 1}, {2, -1, 1, 2}},
    {2, {{0, 1, 1}, {0, 1, 0}}, 0, {0, 0}, {-1, 0}},
    {3, {{0, 1, 1}, {0, 1, 1}, {0, 2, 0}, {2, 1, 1}}, 0, {0, 1, 0}, {-1, 0, 0}},
    {4, {{0, 1, 1}, {0, 2, 1}, {1, 3, 0}, {2, 3, 0}}, 0, {0, 1, 1, 1}, {-1, 0, 0, 1}},
    {4, {{0, 1, 0}, {0, 2, 0}, {1, 3, 1}, {2, 3, 1}}, 0, {0, 0, 0, 1}, {-1, 0, 0, 2}},
    {4, {{0, 1, 1}, {0, 2, 1}, {0, 3, 1}, {0, 1, 0}, {1, 2, 0}, {2, 3, 0}}, 0, {0, 0, 0, 0}, {-1, 0, 1, 2}},
    {1, {{0, 0, 0}, {0, 0, 1}, {0, 0, 1}, {0, 0, 1}, {0, 0, 0}, {0, 0, 1}, {0, 0, 1}, {0, 0, 0}, {0, 0, 1}, {0, 0, 0}, {0, 0, 1}}, 0, {0}, {-1}},
    {2, {{0, 1, 1}, {1, 1, 0}, {1, 1, 1}, {1, 1, 0}, {1, 1, 1}, {0, 1, 0}, {1, 1, 1}, {0, 1, 1}, {1, 0, 1}, {1, 1, 0}, {0, 1, 0}, {0, 0, 0}, {1, 1, 0}, {0, 0, 1}}, 1, {1, 0}, {1, -1}},
    {2, {{0, 1, 1}, {1, 0, 0}, {1, 0, 0}, {1, 1, 1}, {1, 1, 0}, {0, 0, 0}, {0, 0, 0}, {0, 1, 0}, {0, 0, 0}, {1, 1, 0}, {1, 1, 0}}, 1, {0, 0}, {1, -1}},
    {4, {{3, 2, 1}}, 3, {-1, -1, 1, 0}, {-1, -1, 3, -1}},
    {5, {{0, 3, 0}, {2, 2, 0}, {4, 2, 1}, {1, 3, 1}, {0, 3, 0}, {3, 3, 1}, {0, 4, 1}, {0, 1, 1}}, 0, {0, 1, 2, 0, 1}, {-1, 0, 4, 0, 0}},
    {4, {{2, 0, 0}, {1, 3, 0}, {2, 1, 0}, {3, 0, 1}, {3, 2, 0}, {0, 0, 1}, {3, 1, 0}, {3, 0, 1}, {3, 3, 0}, {2, 1, 1}, {0, 3, 0}, {1, 2, 0}}, 3, {0, 0, 0, 0}, {2, 3, 3, -1}},
    {4, {{1, 1, 0}, {3, 3, 0}, {3, 0, 1}, {3, 1, 1}, {3, 3, 0}, {0, 3, 0}, {1, 0, 1}, {2, 2, 1}, {3, 0, 0}, {1, 3, 1}, {3, 0, 0}, {1, 3, 0}, {2, 2, 1}}, 0, {0, 1, -1, 0}, {-1, 3, -1, 0}},
    {6, {}, 2, {-1, -1, 0, -1, -1, -1}, {-1, -1, -1, -1, -1, -1}},
    {2, {{1, 0, 1}}, 1, {1, 0}, {1, -1}},
    {5, {}, 3, {-1, -1, -1, 0, -1}, {-1, -1, -1, -1, -1}},
    {1, {{0, 0, 0}}, 0, {0}, {-1}},
    {7, {{0, 4, 0}, {5, 4, 0}}, 1, {-1, 0, -1, -1, -1, -1, -1}, {-1, -1, -1, -1, -1, -1, -1}},
    {4, {{3, 2, 1}, {1, 1, 1}, {0, 1, 1}, {1, 1, 0}, {2, 0, 0}, {3, 1, 1}, {1, 2, 1}, {3, 0, 1}, {0, 1, 0}}, 3, {1, 1, 1, 0}, {3, 3, 3, -1}},
    {3, {{0, 0, 1}}, 2, {-1, -1, 0}, {-1, -1, -1}},
    {2, {{0, 1, 1}, {1, 0, 0}, {0, 0, 1}, {0, 0, 1}, {1, 1, 0}, {1, 0, 0}, {1, 1, 0}, {0, 1, 0}, {1, 1, 0}, {0, 1, 0}, {0, 1, 1}, {1, 1, 1}, {0, 0, 1}, {0, 0, 1}, {1, 1, 0}}, 1, {0, 0}, {1, -1}},
    {3, {{2, 2, 0}, {2, 0, 1}, {2, 0, 1}, {0, 0, 1}, {1, 0, 0}, {2, 2, 1}, {1, 0, 0}, {2, 0, 1}, {1, 2, 0}, {2, 1, 1}, {1, 2, 1}, {1, 0, 0}, {2, 1, 1}}, 2, {1, 1, 0}, {2, 2, -1}},
    {3, {{1, 1, 0}, {0, 2, 1}, {0, 1, 0}, {0, 2, 1}, {1, 2, 0}, {1, 1, 0}, {0, 2, 1}, {1, 2, 1}, {1, 2, 0}, {2, 1, 0}, {2, 0, 1}, {1, 0, 0}, {1, 1, 1}, {1, 2, 1}, {2, 0, 0}, {2, 0, 0}, {2, 1, 1}, {2, 0, 0}}, 0, {0, 0, 0}, {-1, 0, 1}},
    {5, {{1, 4, 1}, {2, 2, 0}, {3, 0, 0}, {2, 4, 1}, {0, 0, 1}, {4, 4, 0}, {1, 3, 1}, {0, 0, 0}, {1, 3, 0}, {1, 3, 0}, {2, 0, 0}, {0, 0, 1}}, 0, {0, -1, -1, -1, -1}, {-1, -1, -1, -1, -1}},
    {2, {{0, 1, 1}, {0, 0, 0}, {0, 0, 1}, {0, 1, 1}, {0, 1, 1}, {0, 1, 1}, {0, 1, 0}, {0, 0, 1}, {0, 0, 0}, {0, 1, 1}, {1, 1, 0}, {0, 1, 1}, {0, 1, 1}, {1, 1, 1}, {1, 0, 0}}, 0, {0, 0}, {-1, 0}},
    {3, {{1, 2, 1}, {1, 1, 1}, {0, 1, 0}}, 1, {-1, 0, 1}, {-1, -1, 1}},
    {6, {}, 5, {-1, -1, -1, -1, -1, 0}, {-1, -1, -1, -1, -1, -1}},
    {5, {}, 1, {-1, 0, -1, -1, -1}, {-1, -1, -1, -1, -1}},
    {6, {{2, 5, 0}, {5, 2, 0}}, 2, {-1, -1, 0, -1, -1, 0}, {-1, -1, -1, -1, -1, 2}},
    {5, {{3, 4, 0}, {0, 0, 0}, {2, 1, 0}}, 4, {-1, -1, -1, -1, 0}, {-1, -1, -1, -1, -1}},
    {5, {{4, 0, 1}, {3, 0, 1}, {3, 0, 0}, {4, 3, 0}, {3, 1, 1}, {2, 0, 0}, {2, 3, 1}}, 1, {-1, 0, -1, -1, -1}, {-1, -1, -1, -1, -1}},
    {5, {{0, 3, 0}, {1, 4, 0}, {2, 3, 1}, {0, 1, 1}}, 1, {-1, 0, -1, -1, 0}, {-1, -1, -1, -1, 1}},
    {2, {{0, 1, 1}, {1, 0, 1}, {0, 0, 0}, {0, 0, 0}, {0, 0, 0}, {0, 0, 1}, {0, 0, 0}, {0, 1, 1}, {1, 0, 1}, {1, 0, 0}, {1, 1, 1}, {0, 0, 1}}, 1, {0, 0}, {1, -1}},
    {6, {{4, 2, 0}, {1, 3, 1}, {5, 1, 1}, {1, 4, 0}, {5, 3, 1}, {0, 5, 1}, {4, 2, 1}, {0, 5, 1}, {1, 3, 1}}, 3, {-1, -1, -1, 0, -1, -1}, {-1, -1, -1, -1, -1, -1}},
};

void testAgreementWithPython() {
    for (std::size_t i = 0; i < kPythonCases.size(); ++i) {
        const PythonCase& c = kPythonCases[i];
        ShortestPaths r = zeroOneBfs(c.edges, c.n, c.start);
        bool same = r.dist == c.dist && r.parent == c.parent;
        if (!same) std::cerr << "agreement case " << i << " differs from Python\n";
        assert(same);
    }
    std::cout << "OK testAgreementWithPython (" << kPythonCases.size() << " cases)" << std::endl;
}

int main() {
    testWorkedExample();
    testWorkedExampleCounts();
    testSmallGraphs();
    testUnreachableVertices();
    testSelfLoopsZeroCyclesParallelEdges();
    testTiesKeepTheFirstParent();
    testInvalidInputThrows();
    testLongChain();
    testGrid();
    testRandomGraphsAgainstDijkstra();
    testWorkIsLinear();
    testAgreementWithPython();
    std::cout << "All 0-1 BFS tests passed!" << std::endl;
    return 0;
}
