#include <algorithm>
#include <cassert>
#include <deque>
#include <iostream>
#include <set>
#include <stdexcept>
#include <vector>
#include "bipartite_matching.cpp"

// L0 reaches R1, R2 and R3; L1, L2 and L3 reach only R0 and R1, so one of them stays free.
const std::vector<Edge> kExample = {{0, 1}, {0, 2}, {0, 3}, {1, 0}, {1, 1}, {2, 0}, {3, 1}};

using Ints = std::vector<int>;

void testWorkedExample() {
    Matching k = kuhn(4, 4, kExample);
    assert(k.size == 3 && k.matchLeft == Ints({2, 1, 0, -1}));
    Matching h = hopcroftKarp(4, 4, kExample);
    assert(h.size == 3 && h.matchLeft == Ints({2, 0, -1, 1}));
    VertexCover c = minVertexCover(4, 4, kExample);
    assert(c.left == Ints({0}) && c.right == Ints({0, 1}));
    std::cout << "OK testWorkedExample" << std::endl;
}

void testNoEdges() {
    for (const Matching& m : {kuhn(3, 2, {}), hopcroftKarp(3, 2, {})}) {
        assert(m.size == 0 && m.matchLeft == Ints({-1, -1, -1}));
    }
    VertexCover c = minVertexCover(3, 2, {});
    assert(c.left.empty() && c.right.empty());
    std::cout << "OK testNoEdges" << std::endl;
}

void testEmptySides() {
    for (const Matching& m : {kuhn(0, 3, {}), hopcroftKarp(0, 3, {}), kuhn(0, 0, {}), hopcroftKarp(0, 0, {})}) {
        assert(m.size == 0 && m.matchLeft.empty());
    }
    for (const Matching& m : {kuhn(2, 0, {}), hopcroftKarp(2, 0, {})}) {
        assert(m.size == 0 && m.matchLeft == Ints({-1, -1}));
    }
    assert(minVertexCover(0, 3, {}).right.empty());
    assert(minVertexCover(2, 0, {}).left.empty());
    std::cout << "OK testEmptySides" << std::endl;
}

void testSingleEdge() {
    assert(kuhn(1, 1, {{0, 0}}).matchLeft == Ints({0}));
    assert(hopcroftKarp(1, 1, {{0, 0}}).matchLeft == Ints({0}));
    assert(minVertexCover(1, 1, {{0, 0}}).left == Ints({0}));
    std::cout << "OK testSingleEdge" << std::endl;
}

void testDuplicateEdgesChangeNothing() {
    std::vector<Edge> plain = {{0, 0}, {1, 0}, {1, 1}, {2, 1}};
    std::vector<Edge> doubled = {{0, 0}, {0, 0}, {1, 0}, {1, 1}, {1, 0}, {2, 1}, {2, 1}};
    assert(kuhn(3, 2, doubled).matchLeft == kuhn(3, 2, plain).matchLeft);
    assert(kuhn(3, 2, doubled).matchLeft == Ints({0, 1, -1}));
    assert(hopcroftKarp(3, 2, doubled).matchLeft == Ints({0, 1, -1}));
    assert(minVertexCover(3, 2, doubled).right == Ints({0, 1}));
    std::cout << "OK testDuplicateEdgesChangeNothing" << std::endl;
}

void testCompleteBipartiteGraph() {
    // Kuhn's root k first asks for R0 and pushes every earlier left vertex one place along;
    // Hopcroft-Karp's first phase gives each left vertex the first free right vertex.
    std::vector<Edge> k35;
    for (int u = 0; u < 3; ++u)
        for (int v = 0; v < 5; ++v) k35.push_back({u, v});
    assert(kuhn(3, 5, k35).matchLeft == Ints({2, 1, 0}));
    assert(hopcroftKarp(3, 5, k35).matchLeft == Ints({0, 1, 2}));
    assert(minVertexCover(3, 5, k35).left == Ints({0, 1, 2}));
    std::cout << "OK testCompleteBipartiteGraph" << std::endl;
}

void testVerticesWithoutNeighbours() {
    // L1 and R2 have no edge.
    std::vector<Edge> edges = {{0, 0}, {2, 1}, {2, 0}};
    assert(kuhn(3, 3, edges).matchLeft == Ints({0, -1, 1}));
    assert(hopcroftKarp(3, 3, edges).matchLeft == Ints({0, -1, 1}));
    VertexCover c = minVertexCover(3, 3, edges);
    assert(c.left == Ints({0, 2}) && c.right.empty());
    std::cout << "OK testVerticesWithoutNeighbours" << std::endl;
}

bool throwsInvalid(int nLeft, int nRight, const std::vector<Edge>& edges, int which) {
    try {
        if (which == 0) kuhn(nLeft, nRight, edges);
        if (which == 1) hopcroftKarp(nLeft, nRight, edges);
        if (which == 2) minVertexCover(nLeft, nRight, edges);
    } catch (const std::invalid_argument&) {
        return true;
    }
    return false;
}

void testInvalidInputThrows() {
    for (int which = 0; which < 3; ++which) {
        assert(throwsInvalid(-1, 2, {}, which));
        assert(throwsInvalid(2, -1, {}, which));
        assert(throwsInvalid(2, 2, {{2, 0}}, which));
        assert(throwsInvalid(2, 2, {{0, 2}}, which));
        assert(throwsInvalid(2, 2, {{-1, 0}}, which));
        assert(throwsInvalid(2, 0, {{0, 0}}, which));
        assert(!throwsInvalid(2, 2, {{1, 1}}, which));
    }
    std::cout << "OK testInvalidInputThrows" << std::endl;
}

void testLongAugmentingPath() {
    // L(n-1) reaches only R0: its path runs L(n-1) - R0 - L0 - R1 - ... - L(n-2) - R(n-1).
    const int n = 200000;
    std::vector<Edge> edges;
    for (int u = 0; u + 1 < n; ++u) edges.push_back({u, u});
    for (int u = 0; u + 1 < n; ++u) edges.push_back({u, u + 1});
    edges.push_back({n - 1, 0});
    Ints want(n);
    for (int u = 0; u + 1 < n; ++u) want[u] = u + 1;
    want[n - 1] = 0;
    Matching k = kuhn(n, n, edges);
    assert(k.size == n && k.matchLeft == want);
    Matching h = hopcroftKarp(n, n, edges);
    assert(h.size == n && h.matchLeft == want);
    VertexCover c = minVertexCover(n, n, edges);
    assert(static_cast<int>(c.left.size() + c.right.size()) == n);
    std::cout << "OK testLongAugmentingPath" << std::endl;
}

// ---------------------------------------------------------------- random graphs

struct Lcg {
    unsigned long long s;
    int below(int n) {
        s = s * 6364136223846793005ULL + 1442695040888963407ULL;
        return static_cast<int>((s >> 33) % static_cast<unsigned long long>(n));
    }
};

struct Graph {
    int nLeft, nRight;
    std::vector<Edge> edges;
};

Graph randomGraph(Lcg& rng, int maxSide, int maxEdges) {
    Graph g{1 + rng.below(maxSide), 1 + rng.below(maxSide), {}};
    int m = rng.below(maxEdges + 1);
    for (int i = 0; i < m; ++i) g.edges.push_back({rng.below(g.nLeft), rng.below(g.nRight)});
    return g;
}

// The largest matching, trying every choice for each left vertex in turn.
int bruteMaxMatching(const Graph& g, int u, unsigned used) {
    if (u == g.nLeft) return 0;
    int best = bruteMaxMatching(g, u + 1, used);
    for (const Edge& e : g.edges) {
        if (e.first == u && !(used & (1u << e.second))) {
            best = std::max(best, 1 + bruteMaxMatching(g, u + 1, used | (1u << e.second)));
        }
    }
    return best;
}

// Edmonds-Karp on the reduction: source -> every left vertex -> right vertex -> sink, capacity 1.
int reductionMaxFlow(const Graph& g) {
    int n = g.nLeft + g.nRight + 2, source = n - 2, sink = n - 1;
    std::vector<std::vector<int>> cap(n, std::vector<int>(n, 0));
    for (int u = 0; u < g.nLeft; ++u) cap[source][u] = 1;
    for (int v = 0; v < g.nRight; ++v) cap[g.nLeft + v][sink] = 1;
    for (const Edge& e : g.edges) cap[e.first][g.nLeft + e.second] = 1;
    int flow = 0;
    while (true) {
        std::vector<int> parent(n, -1);
        parent[source] = source;
        std::deque<int> queue{source};
        while (!queue.empty() && parent[sink] == -1) {
            int a = queue.front();
            queue.pop_front();
            for (int b = 0; b < n; ++b) {
                if (cap[a][b] > 0 && parent[b] == -1) {
                    parent[b] = a;
                    queue.push_back(b);
                }
            }
        }
        if (parent[sink] == -1) return flow;
        for (int b = sink; b != source; b = parent[b]) {
            --cap[parent[b]][b];
            ++cap[b][parent[b]];
        }
        ++flow;
    }
}

void assertValidMatching(const Graph& g, const Matching& m) {
    assert(static_cast<int>(m.matchLeft.size()) == g.nLeft);
    std::set<Edge> edgeSet(g.edges.begin(), g.edges.end());
    std::set<int> used;
    int matched = 0;
    for (int u = 0; u < g.nLeft; ++u) {
        int v = m.matchLeft[u];
        if (v == -1) continue;
        ++matched;
        assert(edgeSet.count({u, v}) == 1);
        assert(used.insert(v).second);  // no right vertex twice
    }
    assert(matched == m.size);
}

void assertValidCover(const Graph& g, const VertexCover& c, int size) {
    assert(static_cast<int>(c.left.size() + c.right.size()) == size);
    std::set<int> left(c.left.begin(), c.left.end()), right(c.right.begin(), c.right.end());
    assert(left.size() == c.left.size() && right.size() == c.right.size());
    for (const Edge& e : g.edges) assert(left.count(e.first) || right.count(e.second));
}

void testRandomGraphsAgainstBruteForceAndFlow() {
    Lcg rng{20261122};
    for (int round = 0; round < 600; ++round) {
        bool small = round < 400;
        Graph g = small ? randomGraph(rng, 6, 20) : randomGraph(rng, 30, 150);
        int want = small ? bruteMaxMatching(g, 0, 0) : reductionMaxFlow(g);
        if (small) assert(want == reductionMaxFlow(g));
        Matching k = kuhn(g.nLeft, g.nRight, g.edges);
        Matching h = hopcroftKarp(g.nLeft, g.nRight, g.edges);
        assert(k.size == want && h.size == want);
        assertValidMatching(g, k);
        assertValidMatching(g, h);
        assertValidCover(g, minVertexCover(g.nLeft, g.nRight, g.edges), want);
    }
    std::cout << "OK testRandomGraphsAgainstBruteForceAndFlow" << std::endl;
}

// ---------------------------------------------------------------- agreement with Python

// Outputs computed by running the Python implementation (bipartite_matching.py): fixed cases
// first, then seeded random graphs with repeated edges.
struct PythonCase {
    int nLeft, nRight;
    std::vector<Edge> edges;
    int size;
    Ints kuhnMatch, hopcroftKarpMatch, coverLeft, coverRight;
};

const std::vector<PythonCase> kPythonCases = {
    {4, 4, {{0, 1}, {0, 2}, {0, 3}, {1, 0}, {1, 1}, {2, 0}, {3, 1}}, 3, {2, 1, 0, -1}, {2, 0, -1, 1}, {0}, {0, 1}},
    {2, 2, {{0, 0}, {0, 1}, {1, 0}, {1, 1}}, 2, {1, 0}, {0, 1}, {0, 1}, {}},
    {2, 2, {{1, 1}, {1, 0}, {0, 1}, {0, 0}}, 2, {0, 1}, {1, 0}, {0, 1}, {}},
    {3, 5, {{0, 0}, {0, 1}, {0, 2}, {0, 3}, {0, 4}, {1, 0}, {1, 1}, {1, 2}, {1, 3}, {1, 4}, {2, 0}, {2, 1}, {2, 2}, {2, 3}, {2, 4}}, 3, {2, 1, 0}, {0, 1, 2}, {0, 1, 2}, {}},
    {5, 3, {{0, 0}, {0, 1}, {0, 2}, {1, 0}, {1, 1}, {1, 2}, {2, 0}, {2, 1}, {2, 2}, {3, 0}, {3, 1}, {3, 2}, {4, 0}, {4, 1}, {4, 2}}, 3, {2, 1, 0, -1, -1}, {0, 1, 2, -1, -1}, {}, {0, 1, 2}},
    {3, 2, {{0, 0}, {0, 0}, {1, 0}, {1, 1}, {1, 0}, {2, 1}, {2, 1}}, 2, {0, 1, -1}, {0, 1, -1}, {}, {0, 1}},
    {3, 3, {{0, 0}, {2, 1}, {2, 0}}, 2, {0, -1, 1}, {0, -1, 1}, {0, 2}, {}},
    {4, 1, {{0, 0}, {1, 0}, {2, 0}, {3, 0}}, 1, {0, -1, -1, -1}, {0, -1, -1, -1}, {}, {0}},
    {5, 5, {{0, 0}, {0, 1}, {1, 0}, {2, 1}, {2, 2}, {3, 2}, {3, 3}, {4, 3}, {4, 4}}, 5, {1, 0, 2, 3, 4}, {1, 0, 2, 3, 4}, {0, 1, 2, 3, 4}, {}},
    {6, 6, {{5, 0}, {0, 0}, {1, 1}, {2, 2}, {3, 3}, {4, 4}, {0, 1}, {1, 2}, {2, 3}, {3, 4}, {4, 5}}, 6, {1, 2, 3, 4, 5, 0}, {1, 2, 3, 4, 5, 0}, {0, 1, 2, 3, 4, 5}, {}},
    {5, 5, {{3, 4}, {0, 0}, {3, 0}, {1, 3}}, 3, {0, 3, -1, 4, -1}, {0, 3, -1, 4, -1}, {0, 1, 3}, {}},
    {4, 6, {{1, 5}, {2, 2}, {3, 4}, {2, 5}, {3, 2}, {2, 1}, {3, 4}, {2, 4}}, 3, {-1, 5, 2, 4}, {-1, 5, 2, 4}, {1, 2, 3}, {}},
    {6, 4, {{1, 2}, {4, 1}, {3, 1}, {4, 3}, {2, 0}, {0, 3}, {2, 3}, {1, 1}, {4, 2}, {5, 3}}, 4, {3, 2, 0, 1, -1, -1}, {3, 2, 0, 1, -1, -1}, {2}, {1, 2, 3}},
    {3, 2, {{2, 0}, {2, 1}, {2, 0}, {1, 0}, {2, 1}, {1, 1}, {0, 1}, {2, 1}, {2, 1}}, 2, {1, 0, -1}, {1, 0, -1}, {}, {0, 1}},
    {4, 1, {{1, 0}, {1, 0}, {2, 0}, {0, 0}, {0, 0}, {1, 0}, {2, 0}}, 1, {0, -1, -1, -1}, {0, -1, -1, -1}, {}, {0}},
    {4, 6, {{1, 5}, {3, 1}, {1, 1}, {3, 5}}, 2, {-1, 5, -1, 1}, {-1, 5, -1, 1}, {1, 3}, {}},
    {3, 1, {{2, 0}, {1, 0}}, 1, {-1, 0, -1}, {-1, 0, -1}, {}, {0}},
    {2, 3, {{0, 1}, {0, 0}}, 1, {1, -1}, {1, -1}, {0}, {}},
    {5, 4, {{2, 1}, {4, 3}, {0, 1}, {3, 2}}, 3, {1, -1, -1, 2, 3}, {1, -1, -1, 2, 3}, {3, 4}, {1}},
    {6, 1, {{4, 0}, {5, 0}, {5, 0}, {0, 0}, {1, 0}, {1, 0}, {0, 0}, {4, 0}, {1, 0}, {4, 0}, {3, 0}, {4, 0}, {0, 0}, {0, 0}}, 1, {0, -1, -1, -1, -1, -1}, {0, -1, -1, -1, -1, -1}, {}, {0}},
    {4, 1, {{1, 0}}, 1, {-1, 0, -1, -1}, {-1, 0, -1, -1}, {1}, {}},
    {1, 3, {{0, 1}, {0, 0}, {0, 2}, {0, 2}, {0, 2}}, 1, {1}, {1}, {0}, {}},
    {1, 4, {{0, 0}, {0, 3}, {0, 3}, {0, 0}, {0, 1}, {0, 1}, {0, 0}}, 1, {0}, {0}, {0}, {}},
    {4, 3, {{0, 0}, {1, 2}, {0, 1}, {2, 2}}, 2, {0, 2, -1, -1}, {0, 2, -1, -1}, {0}, {2}},
    {3, 4, {{1, 2}, {2, 3}, {1, 2}, {2, 3}, {0, 2}}, 2, {2, -1, 3}, {2, -1, 3}, {2}, {2}},
    {1, 1, {{0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}}, 1, {0}, {0}, {0}, {}},
    {6, 6, {{3, 5}, {0, 5}}, 1, {5, -1, -1, -1, -1, -1}, {5, -1, -1, -1, -1, -1}, {}, {5}},
    {1, 1, {{0, 0}, {0, 0}}, 1, {0}, {0}, {0}, {}},
    {2, 2, {{1, 1}, {1, 0}, {1, 0}, {0, 0}, {1, 0}, {1, 1}}, 2, {0, 1}, {0, 1}, {0, 1}, {}},
    {1, 5, {{0, 0}, {0, 1}, {0, 4}, {0, 4}, {0, 3}, {0, 0}, {0, 0}, {0, 1}, {0, 3}, {0, 2}, {0, 4}, {0, 4}}, 1, {0}, {0}, {0}, {}},
    {2, 4, {{0, 0}, {1, 0}, {1, 2}, {1, 2}, {0, 1}, {0, 1}, {0, 1}, {1, 3}}, 2, {1, 0}, {0, 2}, {0, 1}, {}},
    {3, 5, {{1, 4}, {2, 2}, {0, 1}, {2, 2}, {1, 4}}, 3, {1, 4, 2}, {1, 4, 2}, {0, 1, 2}, {}},
    {6, 2, {{2, 0}, {4, 0}}, 1, {-1, -1, 0, -1, -1, -1}, {-1, -1, 0, -1, -1, -1}, {}, {0}},
    {4, 3, {{3, 2}, {3, 0}, {0, 2}, {0, 0}, {3, 0}, {3, 2}, {2, 2}, {3, 0}}, 2, {0, -1, 2, -1}, {2, -1, -1, 0}, {}, {0, 2}},
    {2, 3, {{1, 0}, {1, 2}, {1, 1}, {0, 1}}, 2, {1, 0}, {1, 0}, {0, 1}, {}},
    {3, 5, {{0, 2}, {2, 1}, {0, 0}, {0, 3}, {2, 0}}, 2, {2, -1, 1}, {2, -1, 1}, {0, 2}, {}},
    {1, 4, {{0, 0}, {0, 3}}, 1, {0}, {0}, {0}, {}},
    {6, 3, {{1, 2}, {3, 1}, {0, 0}, {3, 2}, {3, 0}, {5, 1}, {0, 0}, {3, 1}, {3, 2}}, 3, {0, 2, -1, 1, -1, -1}, {0, 2, -1, 1, -1, -1}, {}, {0, 1, 2}},
    {2, 5, {{0, 2}, {0, 0}, {1, 2}, {0, 3}, {1, 4}, {0, 1}, {1, 0}, {0, 0}, {0, 0}, {1, 3}, {0, 0}}, 2, {0, 2}, {2, 4}, {0, 1}, {}},
    {5, 6, {{4, 1}, {1, 1}, {4, 1}, {0, 0}, {1, 1}, {3, 1}, {2, 2}, {3, 1}, {0, 0}, {3, 5}, {1, 4}, {0, 2}, {4, 1}}, 5, {0, 4, 2, 5, 1}, {0, 4, 2, 5, 1}, {0, 1, 2, 3, 4}, {}},
};

void testAgreementWithPython() {
    for (std::size_t i = 0; i < kPythonCases.size(); ++i) {
        const PythonCase& c = kPythonCases[i];
        Matching k = kuhn(c.nLeft, c.nRight, c.edges);
        Matching h = hopcroftKarp(c.nLeft, c.nRight, c.edges);
        VertexCover cover = minVertexCover(c.nLeft, c.nRight, c.edges);
        bool same = k.size == c.size && k.matchLeft == c.kuhnMatch && h.size == c.size &&
                    h.matchLeft == c.hopcroftKarpMatch && cover.left == c.coverLeft && cover.right == c.coverRight;
        if (!same) std::cerr << "agreement case " << i << " differs from Python\n";
        assert(same);
    }
    std::cout << "OK testAgreementWithPython (" << kPythonCases.size() << " cases)" << std::endl;
}

int main() {
    testWorkedExample();
    testNoEdges();
    testEmptySides();
    testSingleEdge();
    testDuplicateEdgesChangeNothing();
    testCompleteBipartiteGraph();
    testVerticesWithoutNeighbours();
    testInvalidInputThrows();
    testLongAugmentingPath();
    testRandomGraphsAgainstBruteForceAndFlow();
    testAgreementWithPython();
    std::cout << "All bipartite matching tests passed!" << std::endl;
    return 0;
}
