// Eulerian paths and circuits: a walk that uses every edge of a graph exactly once, found by
// Hierholzer's algorithm in O(V + E).
//
// The graph has n vertices, 0 .. n - 1, and a list of edges {u, v}, all undirected or all
// directed. Self-loops, parallel edges and isolated vertices are allowed. A walk exists when
// the degrees pass the test (undirected: 0 or 2 odd vertices; directed: every vertex balanced,
// or one with out = in + 1 and one with in = out + 1) and every edge lies in one (weakly)
// connected component; the walk itself checks the second condition.
//
// adj[v] lists v's edges in input order (an undirected edge in both ends' lists, a self-loop
// twice), and the walk always leaves v by the first edge of adj[v] it has not used yet, so the
// walk returned is the one the Python and Go versions return. The walk keeps its vertices in
// a vector instead of recursing, so a long walk cannot overflow the call stack.
#include <algorithm>
#include <cstddef>
#include <optional>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

using Edge = std::pair<int, int>;

enum class EulerKind { None, Path, Circuit };

struct EulerWalk {
    std::vector<int> vertices;  // E + 1 vertices, none when there is no edge
    std::vector<int> edgeIds;   // edgeIds[i]: the input index of the edge vertices[i] - vertices[i + 1]
};

namespace euler_detail {

struct Entry {
    int to;    // the other end
    int edge;  // the edge's index in the input
};

using Adjacency = std::vector<std::vector<Entry>>;

// adj[u] in edge order: a directed edge in its tail's list, an undirected edge in both ends'
// lists (a self-loop twice in its vertex's list).
inline Adjacency adjacency(int n, const std::vector<Edge>& edges, bool directed) {
    if (n < 0) throw std::invalid_argument("the number of vertices must be >= 0, got " + std::to_string(n));
    Adjacency adj(n);
    for (std::size_t e = 0; e < edges.size(); ++e) {
        int u = edges[e].first, v = edges[e].second;
        if (u < 0 || u >= n || v < 0 || v >= n) {
            throw std::invalid_argument("edge " + std::to_string(e) + " (" + std::to_string(u) + ", " + std::to_string(v) +
                                        ") is outside the graph: both ends must be in [0, " + std::to_string(n) + ")");
        }
        adj[u].push_back({v, static_cast<int>(e)});
        if (!directed) adj[v].push_back({u, static_cast<int>(e)});
    }
    return adj;
}

// The degree half of the test: the kind the degrees allow and where the walk must start (the
// smaller odd vertex, the vertex with out = in + 1, or the smallest vertex with an edge), or
// {None, -1}. With no edge it is {Circuit, -1}.
inline std::pair<EulerKind, int> degreeCheck(int n, const std::vector<Edge>& edges, bool directed) {
    if (edges.empty()) return {EulerKind::Circuit, -1};
    int first = n;
    for (const Edge& e : edges) first = std::min({first, e.first, e.second});
    if (directed) {
        std::vector<long long> surplus(n, 0);  // out-degree minus in-degree
        for (const Edge& e : edges) {
            ++surplus[e.first];
            --surplus[e.second];
        }
        int start = -1, starts = 0, ends = 0, unbalanced = 0;
        for (int v = 0; v < n; ++v) {
            if (surplus[v] != 0) ++unbalanced;
            if (surplus[v] == 1 && starts++ == 0) start = v;
            if (surplus[v] == -1) ++ends;
        }
        if (unbalanced == 0) return {EulerKind::Circuit, first};
        if (unbalanced == 2 && starts == 1 && ends == 1) return {EulerKind::Path, start};
        return {EulerKind::None, -1};
    }
    std::vector<long long> degree(n, 0);
    for (const Edge& e : edges) {
        ++degree[e.first];
        ++degree[e.second];  // a self-loop adds 2
    }
    std::vector<int> odd;
    for (int v = 0; v < n; ++v) {
        if (degree[v] % 2 == 1) odd.push_back(v);
    }
    if (odd.empty()) return {EulerKind::Circuit, first};
    if (odd.size() == 2) return {EulerKind::Path, odd[0]};
    return {EulerKind::None, -1};
}

// Hierholzer's algorithm from start. The stack holds the current walk; a vertex with no unused
// edge left is popped onto the result, and the walk backs up to the vertex before it, which may
// start a detour that comes back to it as a closed circuit. ptr[v] only moves forward, so each
// entry of adj is read once. The result is reversed at the end.
inline EulerWalk hierholzer(int start, const Adjacency& adj, std::size_t nEdges) {
    std::vector<bool> used(nEdges, false);
    std::vector<std::size_t> ptr(adj.size(), 0);
    std::vector<int> stack{start};  // the vertices of the current walk
    std::vector<int> via{-1};       // via[k]: the edge that led to stack[k]
    EulerWalk walk;
    while (!stack.empty()) {
        int v = stack.back();
        const std::vector<Entry>& row = adj[v];
        int taken = -1, to = -1;
        while (ptr[v] < row.size()) {
            const Entry& entry = row[ptr[v]++];
            if (!used[entry.edge]) {
                taken = entry.edge;
                to = entry.to;
                break;
            }
        }
        if (taken == -1) {
            // v has no unused edge left: it is finished, and the walk backs up one step.
            walk.vertices.push_back(v);
            stack.pop_back();
            if (via.back() != -1) walk.edgeIds.push_back(via.back());
            via.pop_back();
        } else {
            used[taken] = true;
            stack.push_back(to);
            via.push_back(taken);
        }
    }
    std::reverse(walk.vertices.begin(), walk.vertices.end());
    std::reverse(walk.edgeIds.begin(), walk.edgeIds.end());
    return walk;
}

inline std::pair<EulerKind, std::optional<EulerWalk>> solve(int n, const std::vector<Edge>& edges, bool directed) {
    Adjacency adj = adjacency(n, edges, directed);
    auto [kind, start] = degreeCheck(n, edges, directed);
    if (kind == EulerKind::None) return {EulerKind::None, std::nullopt};
    if (edges.empty()) return {EulerKind::Circuit, EulerWalk{}};
    EulerWalk walk = hierholzer(start, adj, edges.size());
    // The walk used only the edges of the start's component: if some are missing, they lie elsewhere.
    if (walk.edgeIds.size() < edges.size()) return {EulerKind::None, std::nullopt};
    return {kind, walk};
}

}  // namespace euler_detail

// Whether the graph has an Eulerian circuit (also when it has no edge), only an Eulerian path,
// or neither. O(V + E). Throws std::invalid_argument for n < 0 or an edge end out of range.
inline EulerKind eulerianKind(int n, const std::vector<Edge>& edges, bool directed = false) {
    return euler_detail::solve(n, edges, directed).first;
}

// A walk that uses every edge exactly once, a circuit whenever one exists; an EulerWalk with two
// empty vectors when there is no edge; std::nullopt when no such walk exists. O(V + E).
// Throws as eulerianKind does.
inline std::optional<EulerWalk> eulerianPath(int n, const std::vector<Edge>& edges, bool directed = false) {
    return euler_detail::solve(n, edges, directed).second;
}

#ifndef IS_TEST_BUILD
#include <iostream>

static void print(const char* name, const std::vector<int>& xs) {
    std::cout << name << " [";
    for (std::size_t i = 0; i < xs.size(); ++i) std::cout << (i ? ", " : "") << xs[i];
    std::cout << "]";
}

static void show(const char* title, int n, const std::vector<Edge>& edges, bool directed) {
    std::optional<EulerWalk> walk = eulerianPath(n, edges, directed);
    std::cout << title << ": ";
    if (!walk) {
        std::cout << "no Eulerian path" << std::endl;
        return;
    }
    print("vertices", walk->vertices);
    std::cout << ", ";
    print("edgeIds", walk->edgeIds);
    std::cout << std::endl;
}

int main() {
    // Two triangles joined by the edge 0-3: vertices 0 and 3 are odd, so a path from 0 to 3.
    show("Undirected", 6, {{0, 3}, {0, 1}, {1, 2}, {2, 0}, {3, 4}, {4, 5}, {5, 3}}, false);
    // vertices [0, 1, 2, 0, 3, 4, 5, 3], edgeIds [1, 2, 3, 0, 4, 5, 6]
    show("Directed", 5, {{0, 1}, {1, 4}, {1, 2}, {2, 3}, {3, 1}}, true);
    // vertices [0, 1, 2, 3, 1, 4], edgeIds [0, 2, 3, 4, 1]
    show("Konigsberg", 4, {{0, 1}, {0, 1}, {0, 2}, {0, 2}, {0, 3}, {1, 3}, {2, 3}}, false);
    // no Eulerian path
    return 0;
}
#endif  // !IS_TEST_BUILD
