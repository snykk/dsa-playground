#include <array>
#include <cassert>
#include <climits>
#include <cmath>
#include <deque>
#include <iostream>
#include <set>
#include <unordered_map>
#include <vector>
#include "dinic.cpp"

using Graph = std::unordered_map<int, std::unordered_map<int, int>>;
using Edge = std::array<int, 3>;  // u, v, capacity
using Ints = std::vector<int>;

const Graph kClassic = {
    {0, {{1, 16}, {2, 13}}},
    {1, {{2, 10}, {3, 12}}},
    {2, {{1, 4}, {4, 14}}},
    {3, {{2, 9}, {5, 20}}},
    {4, {{3, 7}, {5, 4}}}
};

Graph graphOf(const std::vector<Edge>& edges) {
    Graph g;
    for (const Edge& e : edges) g[e[0]][e[1]] = e[2];
    return g;
}

std::vector<Edge> edgesOf(const Graph& g) {
    std::vector<Edge> edges;
    for (const auto& row : g)
        for (const auto& e : row.second) edges.push_back({row.first, e.first, e.second});
    return edges;
}

// Edmonds-Karp on an edge list. Every edge is an arc of its own, so parallel and anti-parallel
// edges never share an entry; arc i ^ 1 is the reverse of arc i.
long long referenceMaxFlow(const std::vector<Edge>& edges, int source, int sink) {
    if (source == sink) return 0;
    std::vector<int> head;
    std::vector<long long> room;
    std::unordered_map<int, std::vector<int>> out;
    for (const Edge& e : edges) {
        out[e[0]].push_back(static_cast<int>(head.size()));
        head.push_back(e[1]);
        room.push_back(e[2]);
        out[e[1]].push_back(static_cast<int>(head.size()));
        head.push_back(e[0]);
        room.push_back(0);
    }
    long long flow = 0;
    while (true) {
        std::unordered_map<int, int> via{{source, -1}};
        std::deque<int> queue{source};
        while (!queue.empty() && via.count(sink) == 0) {
            int u = queue.front();
            queue.pop_front();
            for (int i : out[u]) {
                if (room[i] > 0 && via.count(head[i]) == 0) {
                    via[head[i]] = i;
                    queue.push_back(head[i]);
                }
            }
        }
        if (via.count(sink) == 0) return flow;
        long long bottleneck = LLONG_MAX;
        for (int v = sink; via[v] != -1; v = head[via[v] ^ 1]) bottleneck = std::min(bottleneck, room[via[v]]);
        for (int v = sink; via[v] != -1; v = head[via[v] ^ 1]) {
            room[via[v]] -= bottleneck;
            room[via[v] ^ 1] += bottleneck;
        }
        flow += bottleneck;
    }
}

// Capacity limits, conservation, the value, and a cut whose capacity equals the flow.
void assertMaximumFlow(const Graph& graph, int source, int sink, const DinicResult& r) {
    std::unordered_map<int, long long> balance;
    for (const auto& row : graph) {
        for (const auto& e : row.second) {
            long long f = r.flows.at(row.first).at(e.first);
            assert(f >= 0 && f <= e.second);
            balance[row.first] -= f;
            balance[e.first] += f;
        }
    }
    for (const auto& b : balance) {
        if (b.first != source && b.first != sink) assert(b.second == 0);
    }
    assert(balance[sink] == r.maxFlow && balance[source] == -r.maxFlow);
    std::set<int> side(r.sourceSide.begin(), r.sourceSide.end());
    assert(side.size() == r.sourceSide.size() && std::is_sorted(r.sourceSide.begin(), r.sourceSide.end()));
    assert(side.count(source) == 1 && side.count(sink) == 0);
    long long cut = 0;
    for (const auto& row : graph) {
        for (const auto& e : row.second) {
            bool fromS = side.count(row.first) == 1, toS = side.count(e.first) == 1;
            if (fromS && !toS) cut += e.second;
            if (!fromS && toS) assert(r.flows.at(row.first).at(e.first) == 0);
        }
    }
    assert(cut == r.maxFlow);
}

// ---------------------------------------------------------------- worked example and edge cases

void testClassic() {
    assert(dinic(kClassic, 0, 5) == 23);
    DinicResult r = dinicFlow(kClassic, 0, 5);
    assert(r.maxFlow == 23);
    assert(r.flows.at(0).at(1) == 12 && r.flows.at(0).at(2) == 11 && r.flows.at(1).at(2) == 0);
    assert(r.flows.at(1).at(3) == 12 && r.flows.at(2).at(1) == 0 && r.flows.at(2).at(4) == 11);
    assert(r.flows.at(3).at(2) == 0 && r.flows.at(3).at(5) == 19 && r.flows.at(4).at(3) == 7);
    assert(r.flows.at(4).at(5) == 4);
    assert(r.sourceSide == Ints({0, 1, 2, 4}));
    assert(r.phases == 3 && r.edgeVisits == 40);
    std::cout << "OK testClassic" << std::endl;
}

void testSameSourceSink() {
    assert(dinic({{0, {{1, 10}}}}, 0, 0) == 0);
    DinicResult r = dinicFlow({{0, {{1, 10}}}}, 0, 0);
    assert(r.maxFlow == 0 && r.flows.at(0).at(1) == 0 && r.sourceSide == Ints({0}));
    assert(r.phases == 0 && r.edgeVisits == 0);
    std::cout << "OK testSameSourceSink" << std::endl;
}

void testEmptyGraph() {
    assert(dinic({}, 0, 1) == 0);
    DinicResult r = dinicFlow({}, 0, 1);
    assert(r.flows.empty() && r.sourceSide == Ints({0}) && r.phases == 1 && r.edgeVisits == 0);
    std::cout << "OK testEmptyGraph" << std::endl;
}

void testSinkUnreachable() {
    Graph graph = {{0, {{1, 5}}}, {2, {{3, 5}}}};
    assert(dinic(graph, 0, 3) == 0);
    // One BFS, which reaches {0, 1}: no search runs.
    DinicResult r = dinicFlow(graph, 0, 3);
    assert(r.sourceSide == Ints({0, 1}) && r.phases == 1 && r.edgeVisits == 0);
    std::cout << "OK testSinkUnreachable" << std::endl;
}

void testSinkWithoutKey() {
    // The sink has no outgoing edges, so it is not a key of the map.
    assert(dinic({{0, {{1, 7}}}, {1, {{2, 3}}}}, 0, 2) == 3);
    std::cout << "OK testSinkWithoutKey" << std::endl;
}

void testSourceWithoutKey() {
    // 0 appears only as the head of an edge, so it has no edge to send along.
    DinicResult r = dinicFlow({{1, {{0, 5}, {2, 4}}}}, 0, 2);
    assert(r.maxFlow == 0 && r.sourceSide == Ints({0}) && r.phases == 1);
    std::cout << "OK testSourceWithoutKey" << std::endl;
}

void testAntiParallelEdges() {
    // 0 -> 1 and 1 -> 0 share their residual entries; the net flow goes to 0 -> 1.
    DinicResult r = dinicFlow({{0, {{1, 4}}}, {1, {{0, 6}, {2, 5}}}}, 0, 2);
    assert(r.maxFlow == 4 && r.flows.at(0).at(1) == 4 && r.flows.at(1).at(0) == 0 && r.flows.at(1).at(2) == 4);
    // 1 -> 2 carries flow first; the next phase cancels 2 of it through 2 -> 1's entry.
    Graph both = {{0, {{1, 2}, {2, 3}}}, {1, {{2, 2}, {3, 3}}}, {2, {{1, 2}, {3, 1}}}};
    assert(dinic(both, 0, 3) == 4 && referenceMaxFlow(edgesOf(both), 0, 3) == 4);
    std::cout << "OK testAntiParallelEdges" << std::endl;
}

void testZeroCapacity() {
    DinicResult r = dinicFlow({{0, {{1, 0}, {2, 3}}}, {1, {{3, 9}}}, {2, {{3, 9}}}}, 0, 3);
    assert(r.maxFlow == 3 && r.flows.at(0).at(1) == 0 && r.flows.at(2).at(3) == 3);
    assert(r.sourceSide == Ints({0}));
    std::cout << "OK testZeroCapacity" << std::endl;
}

void testParallelEdgesAreAddedUp() {
    // A map holds one capacity per edge, so parallel edges are given as their sum.
    std::vector<Edge> multigraph = {{0, 1, 3}, {0, 1, 4}, {1, 2, 2}, {1, 2, 2}, {1, 2, 1}, {0, 2, 1}};
    Graph graph;
    for (const Edge& e : multigraph) graph[e[0]][e[1]] += e[2];
    assert(graph.at(0).at(1) == 7 && graph.at(1).at(2) == 5);
    assert(dinic(graph, 0, 2) == 6 && referenceMaxFlow(multigraph, 0, 2) == 6);
    std::cout << "OK testParallelEdgesAreAddedUp" << std::endl;
}

void testSelfLoop() {
    DinicResult r = dinicFlow({{0, {{0, 5}, {1, 2}}}, {1, {{1, 9}, {2, 4}}}}, 0, 2);
    assert(r.maxFlow == 2 && r.flows.at(0).at(0) == 0 && r.flows.at(1).at(1) == 0);
    std::cout << "OK testSelfLoop" << std::endl;
}

void testDiamondWithCrossEdge() {
    // The cross edge 1 -> 2 joins two vertices of level 1, so the level graph leaves it out.
    Graph graph = {{0, {{1, 1000}, {2, 1000}}}, {1, {{2, 1}, {3, 1000}}}, {2, {{3, 1000}}}};
    DinicResult r = dinicFlow(graph, 0, 3);
    assert(r.maxFlow == 2000 && r.flows.at(1).at(2) == 0 && r.phases == 2);
    std::cout << "OK testDiamondWithCrossEdge" << std::endl;
}

void testNegativeAndLargeIds() {
    Graph graph = {{-5, {{1000000000, 4}, {7, 3}}}, {1000000000, {{-2, 5}}}, {7, {{-2, 1}}}};
    DinicResult r = dinicFlow(graph, -5, -2);
    assert(r.maxFlow == 5 && r.flows.at(-5).at(7) == 1 && r.sourceSide == Ints({-5, 7}));
    std::cout << "OK testNegativeAndLargeIds" << std::endl;
}

void testNoIntOverflow() {
    // Two disjoint paths of INT_MAX each: the total does not fit in an int.
    Graph graph = {{0, {{1, INT_MAX}, {2, INT_MAX}}}, {1, {{3, INT_MAX}}}, {2, {{3, INT_MAX}}}};
    assert(dinic(graph, 0, 3) == 4294967294LL);
    assert(dinicFlow(graph, 0, 3).flows.at(0).at(1) == INT_MAX);
    std::cout << "OK testNoIntOverflow" << std::endl;
}

void testLongPath() {
    // Each search walks the whole chain of 200000 vertices; the path is kept in a vector.
    const int n = 200000;
    Graph graph;
    for (int u = 0; u + 1 < n; ++u) graph[u][u + 1] = u == n / 2 ? 7 : 9;
    DinicResult r = dinicFlow(graph, 0, n - 1);
    assert(r.maxFlow == 7 && r.phases == 2);
    assert(static_cast<int>(r.sourceSide.size()) == n / 2 + 1 && r.sourceSide.back() == n / 2);
    std::cout << "OK testLongPath" << std::endl;
}

// ---------------------------------------------------------------- random networks

struct Lcg {
    unsigned long long s;
    int below(int n) {
        s = s * 6364136223846793005ULL + 1442695040888963407ULL;
        return static_cast<int>((s >> 33) % static_cast<unsigned long long>(n));
    }
};

struct Network {
    Graph graph;
    int source, sink;
};

// 2 to maxN vertices, random edges (some anti-parallel, some of capacity 0), a random source and sink.
Network randomNetwork(Lcg& rng, int maxN, int maxEdges) {
    int n = 2 + rng.below(maxN - 1);
    Network net{{}, rng.below(n), 0};
    int m = rng.below(maxEdges + 1);
    for (int i = 0; i < m; ++i) {
        int u = rng.below(n), v = rng.below(n);
        if (u != v) net.graph[u][v] = rng.below(10) == 0 ? 0 : 1 + rng.below(20);
    }
    net.sink = (net.source + 1 + rng.below(n - 1)) % n;
    return net;
}

void testRandomNetworksAgainstEdmondsKarp() {
    Lcg rng{20261124};
    for (int round = 0; round < 700; ++round) {
        Network net = round < 600 ? randomNetwork(rng, 9, 30) : randomNetwork(rng, 60, 400);
        DinicResult r = dinicFlow(net.graph, net.source, net.sink);
        assert(r.maxFlow == referenceMaxFlow(edgesOf(net.graph), net.source, net.sink));
        assert(dinic(net.graph, net.source, net.sink) == r.maxFlow);
        assertMaximumFlow(net.graph, net.source, net.sink, r);
    }
    std::cout << "OK testRandomNetworksAgainstEdmondsKarp" << std::endl;
}

// ---------------------------------------------------------------- unit networks

// The reduction: source -> every left vertex -> its right neighbours -> sink, capacity 1.
Network matchingNetwork(int nLeft, int nRight, const std::vector<std::pair<int, int>>& edges) {
    Network net{{}, nLeft + nRight, nLeft + nRight + 1};
    for (int u = 0; u < nLeft; ++u) net.graph[net.source][u] = 1;
    for (const auto& e : edges) net.graph[e.first][nLeft + e.second] = 1;
    for (int v = 0; v < nRight; ++v) net.graph[nLeft + v][net.sink] = 1;
    return net;
}

struct MatchingCase {
    int nLeft, nRight;
    std::vector<std::pair<int, int>> edges;
    int size;  // computed by kuhn and hopcroft_karp in Bipartite_Matching/Python/bipartite_matching.py
};

void testBipartiteReductions() {
    std::vector<std::pair<int, int>> k35, k53;
    for (int u = 0; u < 3; ++u)
        for (int v = 0; v < 5; ++v) k35.push_back({u, v});
    for (int u = 0; u < 5; ++u)
        for (int v = 0; v < 3; ++v) k53.push_back({u, v});
    const std::vector<MatchingCase> cases = {
        {4, 4, {{0, 1}, {0, 2}, {0, 3}, {1, 0}, {1, 1}, {2, 0}, {3, 1}}, 3},
        {3, 2, {}, 0},
        {2, 2, {{0, 0}, {0, 1}, {1, 0}, {1, 1}}, 2},
        {3, 5, k35, 3},
        {5, 3, k53, 3},
        {3, 2, {{0, 0}, {0, 0}, {1, 0}, {1, 1}, {1, 0}, {2, 1}, {2, 1}}, 2},
        {3, 3, {{0, 0}, {2, 1}, {2, 0}}, 2},
        {4, 1, {{0, 0}, {1, 0}, {2, 0}, {3, 0}}, 1},
        {6, 6, {{0, 0}, {1, 1}, {2, 2}, {3, 3}, {4, 4}, {0, 1}, {1, 2}, {2, 3}, {3, 4}, {4, 5}, {5, 0}}, 6},
        {7, 5, {{0, 0}, {1, 0}, {3, 4}, {1, 3}, {2, 0}, {2, 2}, {6, 0}, {0, 1}, {6, 3}, {2, 4}, {1, 4}, {0, 4}, {0, 1}, {5, 0}}, 5},
        {9, 9, {{8, 0}, {5, 1}, {2, 1}, {3, 8}, {7, 1}}, 3},
        {6, 6, {{3, 4}, {0, 1}, {5, 1}, {0, 1}, {2, 5}, {4, 4}}, 3},
    };
    for (const MatchingCase& c : cases) {
        Network net = matchingNetwork(c.nLeft, c.nRight, c.edges);
        DinicResult r = dinicFlow(net.graph, net.source, net.sink);
        assert(r.maxFlow == c.size);
        // The middle edges that carry flow form a matching of that size.
        std::set<int> lefts, rights;
        int pairs = 0;
        for (int u = 0; u < c.nLeft; ++u) {
            auto row = r.flows.find(u);
            if (row == r.flows.end()) continue;
            for (const auto& e : row->second) {
                if (e.second == 0) continue;
                ++pairs;
                lefts.insert(u);
                rights.insert(e.first);
            }
        }
        assert(pairs == c.size && static_cast<int>(lefts.size()) == c.size && static_cast<int>(rights.size()) == c.size);
    }
    std::cout << "OK testBipartiteReductions" << std::endl;
}

void testUnitNetworkPhases() {
    // On a unit network at most 2 sqrt(V) phases push flow, plus the last BFS.
    Lcg rng{1696};
    for (int round = 0; round < 100; ++round) {
        int nLeft = 1 + rng.below(40), nRight = 1 + rng.below(40);
        std::vector<std::pair<int, int>> edges;
        int m = rng.below(161);
        for (int i = 0; i < m; ++i) edges.push_back({rng.below(nLeft), rng.below(nRight)});
        Network net = matchingNetwork(nLeft, nRight, edges);
        DinicResult r = dinicFlow(net.graph, net.source, net.sink);
        assert(r.phases <= 2 * std::sqrt(static_cast<double>(nLeft + nRight + 2)) + 1);
    }
    std::cout << "OK testUnitNetworkPhases" << std::endl;
}

// ---------------------------------------------------------------- the current arc

// 0 -> 1 (capacity k); 1 -> k dead ends 2 .. k+1; 1 -> k+2 .. 2k+1 -> the sink 2k+2 (capacity 1).
// Vertex 1 meets the k dead ends before any vertex that leads on, and all k paths go through it.
Network comb(int k) {
    Network net{{}, 0, 2 * k + 2};
    net.graph[0][1] = k;
    for (int d = 2; d < k + 2; ++d) net.graph[1][d] = 1;
    for (int b = k + 2; b < 2 * k + 2; ++b) {
        net.graph[1][b] = 1;
        net.graph[b][2 * k + 2] = 1;
    }
    return net;
}

void testCurrentArc() {
    // Vertex 1's pointer passes the k dead ends once per phase, so the visits are 7k + 1.
    // A search that started every vertex at its first entry again would make about 2.5 k^2.
    for (int k : {10, 20, 40, 80, 160, 320}) {
        Network net = comb(k);
        DinicResult r = dinicFlow(net.graph, net.source, net.sink);
        assert(r.maxFlow == k && r.phases == 2 && r.edgeVisits == 7LL * k + 1);
    }
    std::cout << "OK testCurrentArc" << std::endl;
}

// ---------------------------------------------------------------- agreement with Python

// Outputs computed by running the Python implementation (dinic.py's dinic_flow): fixed cases
// first, then seeded random networks. flows lists the flow of each edge in the order of edges.
struct PythonCase {
    std::vector<Edge> edges;
    int source, sink;
    long long maxFlow;
    std::vector<long long> flows;
    Ints sourceSide;
    int phases;
    long long edgeVisits;
};

const std::vector<PythonCase> kPythonCases = {
    {{{0, 1, 16}, {0, 2, 13}, {1, 2, 10}, {1, 3, 12}, {2, 1, 4}, {2, 4, 14}, {3, 2, 9}, {3, 5, 20}, {4, 3, 7}, {4, 5, 4}}, 0, 5, 23, {12, 11, 0, 12, 0, 11, 0, 19, 7, 4}, {0, 1, 2, 4}, 3, 40},
    {{{0, 1, 1000}, {0, 2, 1000}, {1, 2, 1}, {1, 3, 1000}, {2, 3, 1000}}, 0, 3, 2000, {1000, 1000, 0, 1000, 1000}, {0}, 2, 10},
    {{{0, 1, 4}, {1, 0, 6}, {1, 2, 5}}, 0, 2, 4, {4, 0, 4}, {0}, 2, 4},
    {{{0, 1, 2}, {0, 2, 3}, {1, 2, 2}, {1, 3, 3}, {2, 1, 2}, {2, 3, 1}}, 0, 3, 4, {2, 2, 0, 3, 1, 1}, {0, 1, 2}, 3, 22},
    {{{0, 1, 0}, {0, 2, 3}, {1, 3, 9}, {2, 3, 9}}, 0, 3, 3, {0, 3, 0, 3}, {0}, 2, 5},
    {{{0, 1, 5}, {2, 3, 5}}, 0, 3, 0, {0, 0}, {0, 1}, 1, 0},
    {{{0, 1, 7}, {1, 2, 3}}, 0, 2, 3, {3, 3}, {0, 1}, 2, 5},
    {{{1, 0, 5}, {1, 2, 4}}, 0, 2, 0, {0, 0}, {0}, 1, 0},
    {{{0, 0, 5}, {0, 1, 2}, {1, 1, 9}, {1, 2, 4}}, 0, 2, 2, {0, 2, 0, 2}, {0}, 2, 6},
    {{{-5, 7, 3}, {-5, 1000000000, 4}, {7, -2, 1}, {1000000000, -2, 5}}, -5, -2, 5, {1, 4, 1, 4}, {-5, 7}, 2, 9},
    {{{0, 1, 10}}, 0, 0, 0, {0}, {0}, 0, 0},
    {{{0, 1, 4}, {1, 2, 1}, {1, 3, 1}, {1, 4, 1}, {1, 5, 1}, {1, 6, 1}, {1, 7, 1}, {1, 8, 1}, {1, 9, 1}, {6, 10, 1}, {7, 10, 1}, {8, 10, 1}, {9, 10, 1}}, 0, 10, 4, {4, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1}, {0}, 2, 29},
    {{{0, 5, 1}, {0, 6, 1}, {0, 7, 1}, {1, 4, 1}, {1, 5, 1}, {2, 4, 1}, {3, 5, 1}, {4, 9, 1}, {5, 9, 1}, {6, 9, 1}, {7, 9, 1}, {8, 0, 1}, {8, 1, 1}, {8, 2, 1}, {8, 3, 1}}, 8, 9, 3, {0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1}, {1, 2, 3, 4, 5, 8}, 3, 40},
    {{{0, 2, 14}, {0, 3, 9}, {1, 0, 13}, {2, 1, 7}, {2, 3, 15}, {3, 0, 19}, {3, 1, 20}}, 0, 3, 23, {14, 9, 0, 0, 14, 0, 0}, {0}, 3, 20},
    {{{0, 1, 14}, {0, 3, 11}, {0, 4, 13}, {0, 5, 7}, {1, 2, 8}, {1, 4, 0}, {2, 6, 2}, {3, 6, 11}, {4, 3, 7}, {4, 5, 19}, {4, 6, 10}, {5, 0, 7}, {6, 0, 17}, {6, 1, 18}, {6, 5, 6}}, 0, 6, 23, {2, 11, 10, 0, 2, 0, 2, 11, 0, 0, 10, 0, 0, 0, 0}, {0, 1, 2, 3, 4, 5}, 3, 50},
    {{{0, 4, 19}, {0, 5, 16}, {1, 2, 6}, {3, 5, 20}, {4, 0, 1}, {4, 3, 14}, {5, 0, 12}, {5, 1, 4}}, 0, 5, 30, {14, 16, 0, 14, 0, 14, 0, 0}, {0, 4}, 3, 15},
    {{{0, 1, 3}, {0, 2, 11}, {1, 3, 8}, {2, 1, 2}}, 0, 3, 5, {3, 2, 5, 2}, {0, 2}, 3, 17},
    {{{0, 1, 2}, {0, 3, 13}, {0, 5, 3}, {1, 4, 10}, {1, 5, 0}, {4, 5, 11}}, 0, 5, 5, {2, 0, 3, 2, 0, 2}, {0, 3}, 3, 19},
    {{{0, 1, 4}, {0, 2, 3}, {1, 0, 20}, {1, 2, 15}, {1, 3, 6}, {2, 1, 1}, {3, 1, 3}, {3, 2, 15}}, 0, 3, 5, {4, 1, 0, 0, 5, 1, 0, 0}, {0, 2}, 3, 19},
    {{{0, 1, 15}, {0, 2, 20}, {0, 4, 18}, {1, 0, 3}, {1, 3, 1}, {1, 4, 13}, {2, 1, 3}, {3, 0, 18}, {3, 1, 1}, {3, 4, 17}, {4, 0, 10}}, 0, 4, 32, {14, 0, 18, 0, 1, 13, 0, 0, 0, 1, 0}, {0, 1, 2}, 4, 44},
    {{{0, 1, 2}, {0, 2, 9}, {0, 3, 6}, {1, 2, 12}, {2, 0, 11}, {2, 3, 14}, {3, 1, 16}, {3, 2, 5}}, 0, 3, 17, {2, 9, 6, 2, 0, 11, 0, 0}, {0}, 4, 29},
    {{{0, 1, 13}, {0, 2, 10}, {0, 3, 6}, {1, 0, 10}, {1, 2, 20}, {1, 3, 20}, {2, 0, 2}, {2, 1, 4}, {3, 1, 0}, {3, 2, 0}}, 0, 3, 23, {13, 4, 6, 0, 0, 17, 0, 4, 0, 0}, {0, 2}, 4, 31},
    {{{0, 1, 13}, {0, 4, 8}, {1, 0, 2}, {1, 2, 11}, {1, 3, 12}, {2, 1, 3}, {3, 2, 0}, {3, 4, 7}, {4, 0, 11}, {4, 3, 10}}, 0, 4, 15, {7, 8, 0, 0, 7, 0, 0, 7, 0, 0}, {0, 1, 2, 3}, 3, 24},
    {{{0, 2, 15}, {0, 3, 1}, {0, 4, 14}, {0, 5, 5}, {1, 2, 7}, {2, 5, 3}, {3, 2, 17}, {3, 6, 6}, {4, 1, 9}, {4, 2, 1}, {4, 3, 0}, {4, 6, 18}, {5, 1, 0}, {5, 4, 3}, {6, 0, 18}, {6, 5, 19}}, 0, 6, 18, {0, 1, 14, 3, 0, 0, 0, 1, 0, 0, 0, 17, 0, 3, 0, 0}, {0, 2, 5}, 3, 56},
    {{{0, 1, 14}, {0, 2, 2}, {0, 3, 14}, {1, 0, 20}, {2, 0, 5}, {2, 3, 1}, {3, 1, 20}}, 0, 3, 15, {0, 1, 14, 0, 0, 1, 0}, {0, 1, 2}, 3, 17},
    {{{0, 3, 14}, {0, 4, 2}, {1, 2, 0}, {1, 4, 14}, {2, 0, 19}, {2, 1, 15}, {2, 3, 0}, {3, 1, 12}, {3, 4, 13}, {4, 0, 5}, {4, 1, 7}, {4, 2, 5}}, 0, 4, 16, {14, 2, 0, 1, 0, 0, 0, 1, 13, 0, 0, 0}, {0}, 4, 32},
    {{{0, 5, 18}, {0, 6, 4}, {1, 3, 20}, {1, 5, 7}, {2, 3, 0}, {2, 6, 11}, {3, 2, 20}, {5, 1, 1}, {6, 1, 17}, {6, 3, 6}}, 0, 6, 5, {1, 4, 1, 0, 0, 1, 1, 1, 0, 0}, {0, 5}, 3, 19},
    {{{0, 1, 5}, {0, 2, 1}, {0, 3, 1}, {1, 0, 17}, {1, 2, 5}, {1, 3, 18}, {2, 1, 13}, {3, 0, 12}, {3, 1, 0}, {3, 2, 3}}, 0, 3, 7, {5, 1, 1, 0, 0, 6, 1, 0, 0, 0}, {0}, 4, 29},
    {{{0, 1, 19}, {0, 2, 4}, {1, 2, 10}, {1, 4, 1}, {2, 4, 9}, {3, 0, 0}, {3, 1, 13}, {3, 2, 9}, {4, 0, 1}}, 0, 4, 10, {6, 4, 5, 1, 9, 0, 0, 0, 0}, {0, 1, 2}, 3, 30},
    {{{0, 1, 6}, {0, 4, 20}, {1, 0, 11}, {1, 2, 2}, {1, 4, 18}, {2, 0, 7}, {2, 1, 14}, {2, 4, 2}, {3, 1, 17}, {4, 1, 10}}, 0, 4, 26, {6, 20, 0, 0, 6, 0, 0, 0, 0, 0}, {0}, 3, 22},
    {{{0, 2, 17}, {0, 3, 3}, {1, 0, 16}, {2, 3, 18}, {3, 0, 3}, {3, 2, 9}}, 0, 3, 20, {17, 3, 0, 17, 0, 0}, {0}, 3, 12},
    {{{0, 3, 6}, {0, 4, 1}, {1, 0, 20}, {2, 1, 9}, {2, 5, 6}, {3, 1, 13}, {3, 2, 13}, {3, 5, 3}, {4, 1, 7}, {5, 2, 2}}, 0, 5, 6, {6, 0, 0, 0, 3, 0, 3, 3, 0, 0}, {0, 1, 4}, 3, 34},
    {{{0, 1, 13}, {0, 3, 10}, {1, 0, 3}, {1, 3, 9}, {2, 0, 1}, {2, 3, 7}, {3, 0, 15}}, 0, 3, 19, {9, 10, 0, 9, 0, 0, 0}, {0, 1}, 3, 13},
    {{{0, 1, 6}, {0, 4, 2}, {1, 4, 2}, {2, 4, 14}, {3, 2, 10}, {3, 4, 12}, {4, 0, 14}, {4, 2, 1}}, 0, 4, 4, {2, 2, 2, 0, 0, 0, 0, 0}, {0, 1}, 3, 11},
    {{{0, 2, 14}, {0, 4, 16}, {1, 2, 9}, {1, 3, 6}, {2, 4, 16}, {3, 0, 18}, {3, 2, 17}, {3, 4, 20}, {4, 1, 1}, {4, 2, 14}, {4, 3, 1}}, 0, 4, 30, {14, 16, 0, 0, 14, 0, 0, 0, 0, 0, 0}, {0}, 3, 16},
    {{{0, 1, 6}, {0, 3, 4}, {0, 4, 10}, {1, 2, 11}, {2, 3, 3}, {3, 4, 20}, {3, 6, 17}, {5, 3, 9}, {5, 6, 6}, {6, 2, 0}, {6, 5, 19}}, 0, 6, 7, {3, 4, 0, 3, 3, 0, 7, 0, 0, 0, 0}, {0, 1, 2, 4}, 3, 34},
    {{{0, 2, 13}, {0, 3, 8}, {1, 3, 11}, {2, 0, 17}, {2, 3, 4}, {3, 0, 16}, {3, 1, 0}, {3, 2, 12}}, 0, 3, 12, {4, 8, 0, 0, 4, 0, 0, 0}, {0, 2}, 3, 11},
    {{{0, 1, 20}, {0, 3, 0}, {0, 4, 3}, {0, 6, 18}, {1, 7, 16}, {2, 4, 10}, {2, 6, 9}, {3, 7, 19}, {4, 5, 11}, {5, 0, 11}, {5, 7, 17}, {6, 1, 9}, {7, 4, 7}, {7, 6, 14}}, 0, 7, 19, {16, 0, 3, 0, 16, 0, 0, 0, 3, 0, 3, 0, 0, 0}, {0, 1, 6}, 3, 40},
    {{{0, 4, 10}, {0, 7, 7}, {1, 2, 9}, {3, 0, 14}, {4, 1, 9}, {4, 3, 5}, {4, 5, 12}, {4, 7, 2}, {5, 1, 10}, {5, 2, 0}, {5, 4, 12}, {6, 0, 19}}, 0, 7, 9, {2, 7, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0}, {0, 1, 2, 3, 4, 5}, 3, 41},
    {{{0, 1, 20}, {0, 4, 12}, {1, 2, 16}, {1, 3, 18}, {2, 1, 4}, {2, 4, 15}, {3, 0, 14}, {3, 1, 1}, {4, 0, 15}, {4, 1, 19}, {4, 3, 7}}, 0, 4, 27, {15, 12, 15, 0, 0, 15, 0, 0, 0, 0, 0}, {0, 1, 2, 3}, 3, 28},
};

void testAgreementWithPython() {
    for (std::size_t i = 0; i < kPythonCases.size(); ++i) {
        const PythonCase& c = kPythonCases[i];
        DinicResult r = dinicFlow(graphOf(c.edges), c.source, c.sink);
        bool same = r.maxFlow == c.maxFlow && r.sourceSide == c.sourceSide && r.phases == c.phases &&
                    r.edgeVisits == c.edgeVisits;
        for (std::size_t k = 0; k < c.edges.size(); ++k) {
            same = same && r.flows.at(c.edges[k][0]).at(c.edges[k][1]) == c.flows[k];
        }
        if (!same) std::cerr << "agreement case " << i << " differs from Python\n";
        assert(same);
    }
    std::cout << "OK testAgreementWithPython (" << kPythonCases.size() << " cases)" << std::endl;
}

int main() {
    testClassic();
    testSameSourceSink();
    testEmptyGraph();
    testSinkUnreachable();
    testSinkWithoutKey();
    testSourceWithoutKey();
    testAntiParallelEdges();
    testZeroCapacity();
    testParallelEdgesAreAddedUp();
    testSelfLoop();
    testDiamondWithCrossEdge();
    testNegativeAndLargeIds();
    testNoIntOverflow();
    testLongPath();
    testRandomNetworksAgainstEdmondsKarp();
    testBipartiteReductions();
    testUnitNetworkPhases();
    testCurrentArc();
    testAgreementWithPython();
    std::cout << "All Dinic tests passed!" << std::endl;
    return 0;
}
