// Tests for the lowest common ancestor: binary lifting and the Euler tour with a sparse table.
// The tables of the 10-node tree are the ones the Python implementation computes; both classes
// are also checked against a naive LCA (walk up one parent at a time) on every labelled tree
// with up to 6 nodes and on random trees with a fixed seed.
#include <algorithm>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <stdexcept>
#include <utility>
#include <vector>

#include "lowest_common_ancestor.cpp"

using Edges = std::vector<std::pair<int, int>>;

static const Edges kEdges10 = {{0, 1}, {0, 2}, {1, 3}, {1, 4}, {2, 5}, {3, 6}, {3, 7}, {5, 8}, {6, 9}};

/** Parents and depths from a breadth-first walk, and the LCA by walking up one parent at a time. */
struct Naive {
    std::vector<int> parent, depth;

    Naive(int n, const Edges& edges, int root) : parent(n, -1), depth(n, 0) {
        std::vector<std::vector<int>> adj(n);
        for (const auto& [u, v] : edges) {
            adj[u].push_back(v);
            adj[v].push_back(u);
        }
        std::vector<bool> seen(n, false);
        seen[root] = true;
        std::vector<int> order{root};
        for (std::size_t i = 0; i < order.size(); ++i) {
            for (int v : adj[order[i]]) {
                if (!seen[v]) {
                    seen[v] = true;
                    parent[v] = order[i];
                    depth[v] = depth[order[i]] + 1;
                    order.push_back(v);
                }
            }
        }
    }

    int lca(int u, int v) const {
        while (depth[u] > depth[v]) u = parent[u];
        while (depth[v] > depth[u]) v = parent[v];
        while (u != v) {
            u = parent[u];
            v = parent[v];
        }
        return u;
    }

    int kthAncestor(int v, int k) const {
        for (int i = 0; i < k && v != -1; ++i) v = parent[v];
        return v;
    }

    int distance(int u, int v) const { return depth[u] + depth[v] - 2 * depth[lca(u, v)]; }
};

/** A small linear congruential generator, so the random trees are the same on every platform. */
struct Lcg {
    std::uint32_t state;
    explicit Lcg(std::uint32_t seed) : state(seed) {}
    int below(int bound) {
        state = state * 1664525u + 1013904223u;
        return static_cast<int>((state >> 8) % static_cast<std::uint32_t>(bound));
    }
};

Edges randomTree(Lcg& rng, int n) {
    std::vector<int> label(n);
    for (int i = 0; i < n; ++i) label[i] = i;
    for (int i = n - 1; i > 0; --i) std::swap(label[i], label[rng.below(i + 1)]);
    Edges edges;
    for (int v = 1; v < n; ++v) {
        int u = rng.below(10) < 6 ? rng.below(v) : std::max(0, v - 1 - rng.below(2));
        if (rng.below(2)) edges.push_back({label[u], label[v]});
        else edges.push_back({label[v], label[u]});
    }
    for (int i = static_cast<int>(edges.size()) - 1; i > 0; --i) std::swap(edges[i], edges[rng.below(i + 1)]);
    return edges;
}

/** Decode a Pruefer sequence into the edges of a labelled tree on n >= 3 nodes. */
Edges pruferTree(int n, const std::vector<int>& seq) {
    std::vector<int> degree(n, 1);
    for (int x : seq) ++degree[x];
    Edges edges;
    for (int x : seq) {
        int leaf = 0;
        while (degree[leaf] != 1) ++leaf;
        edges.push_back({leaf, x});
        --degree[leaf];
        --degree[x];
    }
    int u = -1, v = -1;
    for (int i = 0; i < n; ++i) {
        if (degree[i] == 1) (u == -1 ? u : v) = i;
    }
    edges.push_back({u, v});
    return edges;
}

void checkAgainstNaive(int n, const Edges& edges, int root, bool allPairs, Lcg* rng) {
    Naive naive(n, edges, root);
    BinaryLiftingLCA lifting(n, edges, root);
    EulerTourLCA tour(n, edges, root);
    assert(lifting.depth() == naive.depth);
    assert(lifting.parent() == naive.parent);
    assert(static_cast<int>(tour.euler().size()) == 2 * n - 1);
    auto query = [&](int u, int v) {
        int want = naive.lca(u, v);
        assert(lifting.lca(u, v) == want);
        assert(tour.lca(u, v) == want);
        assert(lifting.distance(u, v) == naive.distance(u, v));
        assert(tour.distance(u, v) == naive.distance(u, v));
    };
    if (allPairs) {
        for (int u = 0; u < n; ++u) {
            for (int v = 0; v < n; ++v) query(u, v);
            for (int k = 0; k <= n; ++k) assert(lifting.kthAncestor(u, k) == naive.kthAncestor(u, k));
        }
    } else {
        for (int q = 0; q < 40; ++q) query(rng->below(n), rng->below(n));
        for (int q = 0; q < 20; ++q) {
            int v = rng->below(n), k = rng->below(n + 2);
            assert(lifting.kthAncestor(v, k) == naive.kthAncestor(v, k));
        }
    }
}

void testDemoTables() {
    BinaryLiftingLCA lifting(10, kEdges10);
    EulerTourLCA tour(10, kEdges10);
    assert((lifting.depth() == std::vector<int>{0, 1, 1, 2, 2, 2, 3, 3, 3, 4}));
    assert(lifting.levels() == 4);
    std::vector<std::vector<int>> up = {
        {0, 0, 0, 1, 1, 2, 3, 3, 5, 6},
        {0, 0, 0, 0, 0, 0, 1, 1, 2, 3},
        std::vector<int>(10, 0),
        std::vector<int>(10, 0),
    };
    assert(lifting.up() == up);
    assert((tour.euler() == std::vector<int>{0, 1, 3, 6, 9, 6, 3, 7, 3, 1, 4, 1, 0, 2, 5, 8, 5, 2, 0}));
    assert((tour.first() == std::vector<int>{0, 1, 13, 2, 10, 14, 3, 7, 15, 4}));
    std::vector<std::vector<int>> sparse = {
        {0, 1, 3, 6, 9, 6, 3, 7, 3, 1, 4, 1, 0, 2, 5, 8, 5, 2, 0},
        {0, 1, 3, 6, 6, 3, 3, 3, 1, 1, 1, 0, 0, 2, 5, 5, 2, 0},
        {0, 1, 3, 3, 3, 3, 1, 1, 1, 0, 0, 0, 0, 2, 2, 0},
        {0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0},
        {0, 0, 0, 0},
    };
    assert(tour.sparse() == sparse);
}

void testDemoQueries() {
    BinaryLiftingLCA lifting(10, kEdges10);
    EulerTourLCA tour(10, kEdges10);
    struct Case { int u, v, lca, dist; };
    for (Case c : std::vector<Case>{{9, 4, 1, 4}, {9, 8, 0, 7}, {7, 9, 3, 3}, {6, 7, 3, 2}, {8, 5, 5, 1}}) {
        assert(lifting.lca(c.u, c.v) == c.lca && lifting.lca(c.v, c.u) == c.lca);
        assert(tour.lca(c.u, c.v) == c.lca && tour.lca(c.v, c.u) == c.lca);
        assert(lifting.distance(c.u, c.v) == c.dist && tour.distance(c.u, c.v) == c.dist);
    }
    std::vector<int> ninth = {9, 6, 3, 1, 0, -1, -1};
    for (int k = 0; k < 7; ++k) assert(lifting.kthAncestor(9, k) == ninth[k]);
    assert(lifting.kthAncestor(8, 2) == 2);
    assert(lifting.kthAncestor(0, 1) == -1);
    assert(lifting.kthAncestor(4, 1000000000) == -1);
    for (int v = 0; v < 10; ++v) {
        assert(lifting.lca(v, v) == v && tour.lca(v, v) == v);
        assert(lifting.lca(0, v) == 0 && tour.lca(0, v) == 0);
    }
    // u is an ancestor of v, in both argument orders
    assert(lifting.lca(1, 9) == 1 && tour.lca(9, 1) == 1);
    assert(lifting.lca(2, 8) == 2 && tour.lca(2, 8) == 2);
}

void testAnotherRoot() {
    BinaryLiftingLCA lifting(10, kEdges10, 4);
    EulerTourLCA tour(10, kEdges10, 4);
    assert((tour.euler() == std::vector<int>{4, 1, 0, 2, 5, 8, 5, 2, 0, 1, 3, 6, 9, 6, 3, 7, 3, 1, 4}));
    assert(lifting.lca(9, 8) == 1 && tour.lca(9, 8) == 1);
    assert(lifting.lca(0, 3) == 1 && tour.lca(0, 3) == 1);
    assert(lifting.distance(9, 8) == 7 && tour.distance(9, 8) == 7);
}

void testEveryTreeUpToSixNodes() {
    int trees = 0;
    for (int n = 1; n <= 6; ++n) {
        std::vector<Edges> all;
        if (n == 1) all.push_back({});
        else if (n == 2) all.push_back({{0, 1}});
        else {
            std::vector<int> seq(n - 2, 0);
            while (true) {
                all.push_back(pruferTree(n, seq));
                int i = 0;
                while (i < n - 2 && ++seq[i] == n) seq[i++] = 0;
                if (i == n - 2) break;
            }
        }
        for (const Edges& edges : all) {
            ++trees;
            for (int root = 0; root < n; ++root) checkAgainstNaive(n, edges, root, true, nullptr);
        }
    }
    assert(trees == 1 + 1 + 3 + 16 + 125 + 1296);
}

void testRandomTrees() {
    Lcg rng(2026);
    for (int t = 0; t < 300; ++t) {
        int n = 1 + rng.below(120);
        Edges edges = randomTree(rng, n);
        checkAgainstNaive(n, edges, rng.below(n), false, &rng);
    }
}

void testSingleNodeAndTwoNodes() {
    BinaryLiftingLCA lifting(1, {});
    EulerTourLCA tour(1, {});
    assert(lifting.up() == std::vector<std::vector<int>>{{0}});
    assert(tour.euler() == std::vector<int>{0});
    assert(tour.sparse() == std::vector<std::vector<int>>{{0}});
    assert(lifting.lca(0, 0) == 0 && tour.lca(0, 0) == 0);
    assert(lifting.distance(0, 0) == 0 && tour.distance(0, 0) == 0);
    assert(lifting.kthAncestor(0, 0) == 0 && lifting.kthAncestor(0, 1) == -1);
    for (int root = 0; root < 2; ++root) {
        BinaryLiftingLCA l2(2, {{0, 1}}, root);
        EulerTourLCA t2(2, {{0, 1}}, root);
        assert((t2.euler() == std::vector<int>{root, 1 - root, root}));
        assert(l2.lca(0, 1) == root && t2.lca(1, 0) == root);
        assert(l2.kthAncestor(1 - root, 1) == root);
    }
}

void testStar() {
    const int n = 50;
    Edges edges;
    for (int i = 1; i < n; ++i) edges.push_back({0, i});
    for (int root : {0, 17}) checkAgainstNaive(n, edges, root, true, nullptr);
    EulerTourLCA tour(n, edges);
    assert((std::vector<int>(tour.euler().begin(), tour.euler().begin() + 5) == std::vector<int>{0, 1, 0, 2, 0}));
}

void testPathOf100000NodesDoesNotRecurse() {
    const int n = 100000;
    Edges edges;
    for (int i = 0; i + 1 < n; ++i) edges.push_back({i, i + 1});
    BinaryLiftingLCA lifting(n, edges);
    EulerTourLCA tour(n, edges);
    assert(lifting.depth()[n - 1] == n - 1);
    assert(static_cast<int>(tour.euler().size()) == 2 * n - 1);
    assert(lifting.lca(n - 1, 0) == 0 && tour.lca(n - 1, 0) == 0);
    assert(lifting.lca(n - 1, 54321) == 54321 && tour.lca(n - 1, 54321) == 54321);
    assert(lifting.lca(77777, 12345) == 12345 && tour.lca(77777, 12345) == 12345);
    assert(lifting.distance(n - 1, 0) == n - 1 && tour.distance(n - 1, 0) == n - 1);
    assert(lifting.kthAncestor(n - 1, n - 1) == 0);
    assert(lifting.kthAncestor(n - 1, 65537) == n - 1 - 65537);
    assert(lifting.kthAncestor(n - 1, n) == -1);
    BinaryLiftingLCA middle(n, edges, n / 2);
    EulerTourLCA middleTour(n, edges, n / 2);
    assert(middle.lca(0, n - 1) == n / 2 && middleTour.lca(0, n - 1) == n / 2);
    assert(middleTour.lca(10, 20) == 20);
}

template <typename F>
bool throwsInvalid(F f) {
    try {
        f();
    } catch (const std::invalid_argument&) {
        return true;
    }
    return false;
}

template <typename F>
bool throwsOutOfRange(F f) {
    try {
        f();
    } catch (const std::out_of_range&) {
        return true;
    }
    return false;
}

void assertNotATree(int n, const Edges& edges, int root = 0) {
    assert(throwsInvalid([&] { (void)BinaryLiftingLCA(n, edges, root); }));
    assert(throwsInvalid([&] { (void)EulerTourLCA(n, edges, root); }));
}

void testInvalidInput() {
    assertNotATree(0, {});                              // no nodes
    assertNotATree(3, {{0, 1}, {1, 2}}, 3);             // root outside the tree
    assertNotATree(3, {{0, 1}, {1, 2}}, -1);
    assertNotATree(3, {{0, 1}, {1, 3}});                // endpoint outside the tree
    assertNotATree(3, {{0, 1}, {-1, 2}});
    assertNotATree(4, {{0, 1}, {2, 3}});                // a forest: too few edges
    assertNotATree(3, {{0, 1}, {1, 2}, {2, 0}});        // a cycle: too many edges
    assertNotATree(4, {{0, 1}, {1, 2}, {2, 0}});        // n - 1 edges: a triangle and a lone node
    assertNotATree(3, {{0, 1}, {0, 1}});                // the same edge twice
    assertNotATree(3, {{0, 1}, {2, 2}});                // a loop
    assertNotATree(4, {{1, 2}, {2, 3}, {3, 1}}, 0);     // the root sees only itself

    BinaryLiftingLCA lifting(3, {{0, 1}, {1, 2}});
    EulerTourLCA tour(3, {{0, 1}, {1, 2}});
    for (const auto& pair : Edges{{3, 0}, {0, 3}, {-1, 0}, {0, -1}}) {
        int u = pair.first, v = pair.second;
        assert(throwsOutOfRange([&] { lifting.lca(u, v); }));
        assert(throwsOutOfRange([&] { tour.lca(u, v); }));
        assert(throwsOutOfRange([&] { lifting.distance(u, v); }));
        assert(throwsOutOfRange([&] { tour.distance(u, v); }));
    }
    assert(throwsOutOfRange([&] { lifting.kthAncestor(3, 0); }));
    assert(throwsOutOfRange([&] { lifting.kthAncestor(-1, 0); }));
    assert(throwsInvalid([&] { lifting.kthAncestor(2, -1); }));
}

int main() {
    testDemoTables();
    testDemoQueries();
    testAnotherRoot();
    testEveryTreeUpToSixNodes();
    testRandomTrees();
    testSingleNodeAndTwoNodes();
    testStar();
    testPathOf100000NodesDoesNotRecurse();
    testInvalidInput();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}
