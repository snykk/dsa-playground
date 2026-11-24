#include <algorithm>
#include <cassert>
#include <iostream>
#include <optional>
#include <stdexcept>
#include <utility>
#include <vector>
#include "eulerian_path.cpp"

using Ints = std::vector<int>;

// Two triangles joined by the edge 0-3; 0 and 3 have odd degree.
const std::vector<Edge> kExample = {{0, 3}, {0, 1}, {1, 2}, {2, 0}, {3, 4}, {4, 5}, {5, 3}};
// Directed: 0 -> 1 -> 4 with the cycle 1 -> 2 -> 3 -> 1 hanging off 1.
const std::vector<Edge> kDirectedExample = {{0, 1}, {1, 4}, {1, 2}, {2, 3}, {3, 1}};
// Konigsberg: land masses A=0, B=1, C=2, D=3 and the seven bridges.
const std::vector<Edge> kKonigsberg = {{0, 1}, {0, 1}, {0, 2}, {0, 2}, {0, 3}, {1, 3}, {2, 3}};

bool walkIs(const std::optional<EulerWalk>& walk, const Ints& vertices, const Ints& edgeIds) {
    return walk && walk->vertices == vertices && walk->edgeIds == edgeIds;
}

// Every edge exactly once, and each edge starts where the one before it ends.
void assertValidWalk(const std::vector<Edge>& edges, bool directed, const EulerWalk& walk) {
    if (edges.empty()) {
        assert(walk.vertices.empty() && walk.edgeIds.empty());
        return;
    }
    assert(walk.vertices.size() == edges.size() + 1 && walk.edgeIds.size() == edges.size());
    std::vector<bool> seen(edges.size(), false);
    for (std::size_t i = 0; i < walk.edgeIds.size(); ++i) {
        int e = walk.edgeIds[i];
        assert(e >= 0 && e < static_cast<int>(edges.size()) && !seen[e]);
        seen[e] = true;
        int a = walk.vertices[i], b = walk.vertices[i + 1];
        int u = edges[e].first, v = edges[e].second;
        assert((a == u && b == v) || (!directed && a == v && b == u));
    }
}

void testWorkedExamples() {
    assert(eulerianKind(6, kExample) == EulerKind::Path);
    assert(walkIs(eulerianPath(6, kExample), {0, 1, 2, 0, 3, 4, 5, 3}, {1, 2, 3, 0, 4, 5, 6}));
    assert(eulerianKind(5, kDirectedExample, true) == EulerKind::Path);
    assert(walkIs(eulerianPath(5, kDirectedExample, true), {0, 1, 2, 3, 1, 4}, {0, 2, 3, 4, 1}));
    assert(eulerianKind(4, kKonigsberg) == EulerKind::None);
    assert(!eulerianPath(4, kKonigsberg));
    std::vector<Edge> eighth = kKonigsberg;
    eighth.push_back({1, 2});  // B-C leaves A and D odd: a path from A to D
    assert(walkIs(eulerianPath(4, eighth), {0, 1, 0, 2, 0, 3, 1, 2, 3}, {0, 1, 2, 3, 4, 5, 7, 6}));
    std::cout << "OK testWorkedExamples" << std::endl;
}

void testTieRule() {
    assert(walkIs(eulerianPath(3, {{2, 1}, {1, 0}}), {0, 1, 2}, {1, 0}));  // the smaller odd vertex
    assert(walkIs(eulerianPath(4, {{3, 1}, {1, 2}, {2, 3}}), {1, 3, 2, 1}, {0, 2, 1}));
    assert(walkIs(eulerianPath(5, {{4, 2}, {2, 4}}, true), {2, 4, 2}, {1, 0}));
    assert(walkIs(eulerianPath(4, {{0, 1}, {1, 3}, {3, 0}, {3, 2}}, true), {3, 0, 1, 3, 2}, {2, 0, 1, 3}));
    std::vector<Edge> bowtie = {{0, 1}, {1, 2}, {2, 0}, {0, 3}, {3, 4}, {4, 0}};
    assert(eulerianPath(5, bowtie)->vertices == Ints({0, 1, 2, 0, 3, 4, 0}));
    std::reverse(bowtie.begin(), bowtie.end());
    assert(eulerianPath(5, bowtie)->vertices == Ints({0, 4, 3, 0, 2, 1, 0}));
    std::cout << "OK testTieRule" << std::endl;
}

void testEdgeCases() {
    for (bool directed : {false, true}) {
        // No vertices, or only isolated ones: the empty walk.
        for (int n : {0, 4}) {
            assert(eulerianKind(n, {}, directed) == EulerKind::Circuit);
            assert(walkIs(eulerianPath(n, {}, directed), {}, {}));
        }
        // A single self-loop.
        assert(eulerianKind(1, {{0, 0}}, directed) == EulerKind::Circuit);
        assert(walkIs(eulerianPath(1, {{0, 0}}, directed), {0, 0}, {0}));
        assert(walkIs(eulerianPath(3, {{2, 2}}, directed), {2, 2}, {0}));
        assert(walkIs(eulerianPath(3, {{0, 1}, {1, 1}, {1, 2}}, directed), {0, 1, 1, 2}, {0, 1, 2}));
        // Isolated vertices play no part.
        assert(walkIs(eulerianPath(6, {{3, 4}}, directed), {3, 4}, {0}));
        // A disconnected edge set: even degrees, two triangles.
        assert(!eulerianPath(6, {{0, 1}, {1, 2}, {2, 0}, {3, 4}, {4, 5}, {5, 3}}, directed));
        assert(eulerianKind(3, {{0, 1}, {1, 0}, {2, 2}}, directed) == EulerKind::None);
    }
    // Parallel edges are separate edges.
    assert(walkIs(eulerianPath(2, {{0, 1}, {0, 1}}), {0, 1, 0}, {0, 1}));
    assert(walkIs(eulerianPath(2, {{0, 1}, {0, 1}, {0, 1}}), {0, 1, 0, 1}, {0, 1, 2}));
    assert(eulerianKind(2, {{0, 1}, {0, 1}}, true) == EulerKind::None);
    assert(!eulerianPath(4, {{0, 1}, {2, 3}, {2, 3}, {2, 3}}));
    // Directed, weakly but not strongly connected: nothing leaves 3.
    assert(eulerianKind(4, {{0, 1}, {1, 2}, {2, 0}, {2, 3}}, true) == EulerKind::Path);
    assert(walkIs(eulerianPath(4, {{0, 1}, {1, 2}, {2, 0}, {2, 3}}, true), {2, 0, 1, 2, 3}, {2, 0, 1, 3}));
    // Directed degree failures; the same edges undirected are fine.
    assert(eulerianKind(3, {{0, 1}, {0, 2}}, true) == EulerKind::None);
    assert(eulerianKind(4, {{0, 1}, {2, 3}}, true) == EulerKind::None);
    assert(walkIs(eulerianPath(3, {{1, 0}, {2, 0}}), {1, 0, 2}, {0, 1}));
    // Four odd vertices.
    assert(eulerianKind(4, {{0, 1}, {0, 2}, {0, 3}, {1, 2}, {1, 3}, {2, 3}}) == EulerKind::None);
    std::cout << "OK testEdgeCases" << std::endl;
}

bool throwsInvalid(int n, const std::vector<Edge>& edges, bool directed, bool kind) {
    try {
        if (kind) eulerianKind(n, edges, directed);
        else eulerianPath(n, edges, directed);
    } catch (const std::invalid_argument&) {
        return true;
    }
    return false;
}

void testInvalidInputThrows() {
    for (bool directed : {false, true}) {
        for (bool kind : {false, true}) {
            assert(throwsInvalid(-1, {}, directed, kind));
            assert(throwsInvalid(2, {{0, 2}}, directed, kind));
            assert(throwsInvalid(2, {{-1, 0}}, directed, kind));
            assert(throwsInvalid(0, {{0, 0}}, directed, kind));
            assert(!throwsInvalid(2, {{1, 1}}, directed, kind));
        }
    }
    std::cout << "OK testInvalidInputThrows" << std::endl;
}

void testDeepGraphs() {
    // 10^6 edges in a row: a recursive Hierholzer would need 10^6 nested calls.
    const int n = 1000000;
    std::vector<Edge> cycle;
    for (int i = 0; i < n; ++i) cycle.push_back({i, (i + 1) % n});
    std::optional<EulerWalk> walk = eulerianPath(n, cycle);
    assert(walk && walk->vertices.size() == static_cast<std::size_t>(n) + 1);
    for (int i = 0; i < n; ++i) assert(walk->vertices[i] == i && walk->edgeIds[i] == i);
    assert(walk->vertices[n] == 0);
    std::vector<Edge> path;
    for (int i = n - 1; i >= 0; --i) path.push_back({i, i + 1});  // written backwards
    walk = eulerianPath(n + 1, path, true);
    assert(walk);
    for (int i = 0; i <= n; ++i) assert(walk->vertices[i] == i);
    assertValidWalk(path, true, *walk);
    std::cout << "OK testDeepGraphs" << std::endl;
}

// ---------------------------------------------------------------- random graphs

struct Lcg {
    unsigned long long s;
    int below(int n) {
        s = s * 6364136223846793005ULL + 1442695040888963407ULL;
        return static_cast<int>((s >> 33) % static_cast<unsigned long long>(n));
    }
};

// Trails from every start vertex: sets hasPath and hasCircuit.
void extend(const std::vector<Edge>& edges, bool directed, std::vector<bool>& used, int start, int v, std::size_t depth,
            bool& hasPath, bool& hasCircuit) {
    if (depth == edges.size()) {
        hasPath = true;
        if (v == start) hasCircuit = true;
        return;
    }
    for (std::size_t e = 0; e < edges.size(); ++e) {
        if (used[e]) continue;
        int next = -1;
        if (edges[e].first == v) next = edges[e].second;
        else if (!directed && edges[e].second == v) next = edges[e].first;
        if (next == -1) continue;
        used[e] = true;
        extend(edges, directed, used, start, next, depth + 1, hasPath, hasCircuit);
        used[e] = false;
    }
}

EulerKind bruteForceKind(int n, const std::vector<Edge>& edges, bool directed) {
    if (edges.empty()) return EulerKind::Circuit;
    bool hasPath = false, hasCircuit = false;
    std::vector<bool> used(edges.size(), false);
    for (int s = 0; s < n; ++s) extend(edges, directed, used, s, s, 0, hasPath, hasCircuit);
    return hasCircuit ? EulerKind::Circuit : hasPath ? EulerKind::Path : EulerKind::None;
}

// The edges of a random walk, shuffled: always a graph with an Eulerian walk.
std::vector<Edge> walkGraph(Lcg& rng, int n, int length, bool closed) {
    int v = rng.below(n), first = v;
    std::vector<Edge> edges;
    for (int k = 0; k < length; ++k) {
        int w = closed && k == length - 1 ? first : rng.below(n);
        edges.push_back({v, w});
        v = w;
    }
    for (int i = static_cast<int>(edges.size()) - 1; i > 0; --i) std::swap(edges[i], edges[rng.below(i + 1)]);
    return edges;
}

void testRandomGraphsAgainstBruteForce() {
    Lcg rng{20261124};
    for (int round = 0; round < 1500; ++round) {
        bool directed = round % 2 == 1;
        int n = 1 + rng.below(5);
        std::vector<Edge> edges;
        if (round % 3 == 0) {
            edges = walkGraph(rng, n, 1 + rng.below(7), rng.below(2) == 1);
        } else {
            int m = rng.below(8);
            for (int i = 0; i < m; ++i) edges.push_back({rng.below(n), rng.below(n)});
        }
        EulerKind want = bruteForceKind(n, edges, directed);
        assert(eulerianKind(n, edges, directed) == want);
        std::optional<EulerWalk> walk = eulerianPath(n, edges, directed);
        assert(walk.has_value() == (want != EulerKind::None));
        if (walk) {
            assertValidWalk(edges, directed, *walk);
            if (!edges.empty()) assert((walk->vertices.front() == walk->vertices.back()) == (want == EulerKind::Circuit));
        }
    }
    std::cout << "OK testRandomGraphsAgainstBruteForce" << std::endl;
}

// ---------------------------------------------------------------- agreement with Python

// Outputs computed by running the Python implementation (eulerian_path.py): fixed cases first,
// then seeded random graphs, most of them built from one random walk.
struct PythonCase {
    int n;
    bool directed;
    std::vector<Edge> edges;
    EulerKind kind;
    bool found;
    Ints vertices, edgeIds;
};

const std::vector<PythonCase> kPythonCases = {
    {6, false, {{0, 3}, {0, 1}, {1, 2}, {2, 0}, {3, 4}, {4, 5}, {5, 3}}, EulerKind::Path, true, {0, 1, 2, 0, 3, 4, 5, 3}, {1, 2, 3, 0, 4, 5, 6}},
    {5, true, {{0, 1}, {1, 4}, {1, 2}, {2, 3}, {3, 1}}, EulerKind::Path, true, {0, 1, 2, 3, 1, 4}, {0, 2, 3, 4, 1}},
    {4, false, {{0, 1}, {0, 1}, {0, 2}, {0, 2}, {0, 3}, {1, 3}, {2, 3}}, EulerKind::None, false, {}, {}},
    {4, false, {{0, 1}, {0, 1}, {0, 2}, {0, 2}, {0, 3}, {1, 3}, {2, 3}, {1, 2}}, EulerKind::Path, true, {0, 1, 0, 2, 0, 3, 1, 2, 3}, {0, 1, 2, 3, 4, 5, 7, 6}},
    {0, false, {}, EulerKind::Circuit, true, {}, {}},
    {4, true, {}, EulerKind::Circuit, true, {}, {}},
    {1, false, {{0, 0}}, EulerKind::Circuit, true, {0, 0}, {0}},
    {1, true, {{0, 0}}, EulerKind::Circuit, true, {0, 0}, {0}},
    {3, false, {{0, 1}, {1, 1}, {1, 2}}, EulerKind::Path, true, {0, 1, 1, 2}, {0, 1, 2}},
    {2, false, {{0, 1}, {0, 1}, {0, 1}}, EulerKind::Path, true, {0, 1, 0, 1}, {0, 1, 2}},
    {2, true, {{0, 1}, {1, 0}, {0, 1}}, EulerKind::Path, true, {0, 1, 0, 1}, {0, 1, 2}},
    {6, false, {{3, 4}}, EulerKind::Path, true, {3, 4}, {0}},
    {6, false, {{0, 1}, {1, 2}, {2, 0}, {3, 4}, {4, 5}, {5, 3}}, EulerKind::None, false, {}, {}},
    {4, true, {{0, 1}, {1, 2}, {2, 0}, {2, 3}}, EulerKind::Path, true, {2, 0, 1, 2, 3}, {2, 0, 1, 3}},
    {4, true, {{0, 1}, {1, 3}, {3, 0}, {3, 2}}, EulerKind::Path, true, {3, 0, 1, 3, 2}, {2, 0, 1, 3}},
    {3, false, {{2, 1}, {1, 0}}, EulerKind::Path, true, {0, 1, 2}, {1, 0}},
    {5, false, {{0, 1}, {1, 2}, {2, 0}, {0, 3}, {3, 4}, {4, 0}}, EulerKind::Circuit, true, {0, 1, 2, 0, 3, 4, 0}, {0, 1, 2, 3, 4, 5}},
    {5, false, {{4, 0}, {3, 4}, {0, 3}, {2, 0}, {1, 2}, {0, 1}}, EulerKind::Circuit, true, {0, 4, 3, 0, 2, 1, 0}, {0, 1, 2, 3, 4, 5}},
    {5, false, {{0, 1}, {1, 2}, {2, 0}, {1, 3}, {3, 4}, {4, 1}}, EulerKind::Circuit, true, {0, 1, 3, 4, 1, 2, 0}, {0, 3, 4, 5, 1, 2}},
    {3, true, {{0, 1}, {0, 2}}, EulerKind::None, false, {}, {}},
    {6, false, {{5, 5}}, EulerKind::Circuit, true, {5, 5}, {0}},
    {5, false, {{4, 1}, {3, 4}, {1, 0}}, EulerKind::Path, true, {0, 1, 4, 3}, {2, 0, 1}},
    {1, false, {{0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}}, EulerKind::Circuit, true, {0, 0, 0, 0, 0, 0, 0}, {0, 1, 2, 3, 4, 5}},
    {5, false, {{1, 4}, {0, 4}, {2, 0}, {4, 1}, {4, 2}}, EulerKind::Circuit, true, {0, 4, 1, 4, 2, 0}, {1, 0, 3, 4, 2}},
    {5, false, {{3, 3}, {4, 4}, {3, 1}, {2, 1}}, EulerKind::None, false, {}, {}},
    {2, false, {{1, 0}, {0, 1}, {1, 1}, {0, 1}, {1, 1}, {1, 0}, {0, 1}, {0, 0}}, EulerKind::Path, true, {0, 1, 0, 1, 1, 1, 0, 0, 1}, {0, 1, 3, 2, 4, 5, 7, 6}},
    {3, true, {{1, 2}, {1, 0}, {2, 1}}, EulerKind::Path, true, {1, 2, 1, 0}, {0, 2, 1}},
    {5, true, {{1, 4}, {4, 1}}, EulerKind::Circuit, true, {1, 4, 1}, {0, 1}},
    {4, true, {{0, 3}, {3, 0}}, EulerKind::Circuit, true, {0, 3, 0}, {0, 1}},
    {3, true, {{1, 1}, {0, 1}, {0, 2}, {1, 0}, {1, 0}, {0, 1}, {2, 0}}, EulerKind::Circuit, true, {0, 1, 1, 0, 2, 0, 1, 0}, {1, 0, 3, 2, 6, 5, 4}},
    {3, false, {{0, 2}}, EulerKind::Path, true, {0, 2}, {0}},
    {2, true, {{1, 1}, {1, 0}, {0, 0}, {1, 1}, {1, 1}, {0, 1}, {0, 1}, {0, 0}, {1, 0}}, EulerKind::Circuit, true, {0, 0, 1, 1, 0, 1, 1, 1, 0, 0}, {2, 5, 0, 1, 6, 3, 4, 8, 7}},
    {2, false, {{0, 0}, {0, 1}, {1, 0}}, EulerKind::Circuit, true, {0, 0, 1, 0}, {0, 1, 2}},
    {5, false, {{1, 1}, {1, 4}, {4, 3}, {4, 1}, {3, 4}}, EulerKind::Circuit, true, {1, 1, 4, 3, 4, 1}, {0, 1, 2, 4, 3}},
    {6, false, {{2, 2}, {2, 4}, {4, 5}, {1, 2}, {1, 4}, {4, 0}}, EulerKind::Path, true, {0, 4, 2, 2, 1, 4, 5}, {5, 1, 0, 3, 4, 2}},
    {6, false, {{1, 2}, {5, 1}, {3, 5}, {2, 3}, {0, 5}, {5, 0}}, EulerKind::Circuit, true, {0, 5, 1, 2, 3, 5, 0}, {4, 1, 0, 3, 2, 5}},
    {6, false, {{5, 5}, {2, 4}}, EulerKind::None, false, {}, {}},
    {4, true, {{0, 3}, {3, 1}, {1, 2}, {2, 0}, {2, 3}, {2, 1}, {3, 2}}, EulerKind::Path, true, {2, 0, 3, 1, 2, 3, 2, 1}, {3, 0, 1, 2, 4, 6, 5}},
    {3, true, {{2, 2}, {1, 2}, {2, 2}}, EulerKind::Path, true, {1, 2, 2, 2}, {1, 0, 2}},
    {5, true, {{4, 4}, {1, 4}, {3, 2}, {2, 0}, {1, 3}, {0, 1}, {3, 1}, {4, 4}}, EulerKind::Path, true, {3, 2, 0, 1, 3, 1, 4, 4, 4}, {2, 3, 5, 4, 6, 1, 0, 7}},
};

void testAgreementWithPython() {
    for (std::size_t i = 0; i < kPythonCases.size(); ++i) {
        const PythonCase& c = kPythonCases[i];
        std::optional<EulerWalk> walk = eulerianPath(c.n, c.edges, c.directed);
        bool same = eulerianKind(c.n, c.edges, c.directed) == c.kind && walk.has_value() == c.found &&
                    (!walk || (walk->vertices == c.vertices && walk->edgeIds == c.edgeIds));
        if (!same) std::cerr << "agreement case " << i << " differs from Python\n";
        assert(same);
    }
    std::cout << "OK testAgreementWithPython (" << kPythonCases.size() << " cases)" << std::endl;
}

int main() {
    testWorkedExamples();
    testTieRule();
    testEdgeCases();
    testInvalidInputThrows();
    testDeepGraphs();
    testRandomGraphsAgainstBruteForce();
    testAgreementWithPython();
    std::cout << "All Eulerian path tests passed!" << std::endl;
    return 0;
}
