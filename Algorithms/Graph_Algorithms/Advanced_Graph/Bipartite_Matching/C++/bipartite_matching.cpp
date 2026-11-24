// Maximum matching in an unweighted bipartite graph: Kuhn's algorithm, Hopcroft-Karp, and a
// minimum vertex cover by Konig's theorem.
//
// The graph has nLeft vertices on the left (0 .. nLeft - 1), nRight on the right
// (0 .. nRight - 1) and a list of edges {u, v}, each joining left vertex u to right vertex v.
// adj[u] lists u's right neighbours in edge order, and every search tries them in that order,
// so the matching returned is the one the Python and Go versions return.
//
// The depth-first searches keep their path in vectors instead of recursing, so a long
// augmenting path cannot overflow the call stack.
#include <cstddef>
#include <deque>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

struct Matching {
    int size = 0;
    std::vector<int> matchLeft;  // the partner of each left vertex, or -1
};

struct VertexCover {
    std::vector<int> left;   // left vertices in the cover, increasing
    std::vector<int> right;  // right vertices in the cover, increasing
};

using Edge = std::pair<int, int>;

namespace bipartite_detail {

using Adjacency = std::vector<std::vector<int>>;

// adj[u]: the right neighbours of left vertex u, in edge order (a duplicate edge stays).
inline Adjacency adjacency(int nLeft, int nRight, const std::vector<Edge>& edges) {
    if (nLeft < 0 || nRight < 0) {
        throw std::invalid_argument("side sizes must be >= 0, got nLeft=" + std::to_string(nLeft) +
                                    ", nRight=" + std::to_string(nRight));
    }
    Adjacency adj(nLeft);
    for (const Edge& e : edges) {
        if (e.first < 0 || e.first >= nLeft || e.second < 0 || e.second >= nRight) {
            throw std::invalid_argument("edge (" + std::to_string(e.first) + ", " + std::to_string(e.second) +
                                        ") is outside the graph: u must be in [0, " + std::to_string(nLeft) +
                                        ") and v in [0, " + std::to_string(nRight) + ")");
        }
        adj[e.first].push_back(e.second);
    }
    return adj;
}

// Flip the augmenting path stack[0] - through[0] - stack[1] - ... - through.back(): every left
// vertex on it takes the right vertex after it, and the matching grows by one.
inline void flip(const std::vector<int>& stack, const std::vector<int>& through, std::vector<int>& matchLeft,
                 std::vector<int>& matchRight) {
    for (std::size_t k = 0; k < stack.size(); ++k) {
        matchLeft[stack[k]] = through[k];
        matchRight[through[k]] = stack[k];
    }
}

// Kuhn's DFS from the free left vertex root. seen[v] == root marks the right vertices this
// search has tried, so nothing is cleared between roots.
inline bool kuhnAugment(int root, const Adjacency& adj, std::vector<int>& matchLeft, std::vector<int>& matchRight,
                        std::vector<int>& seen) {
    std::vector<int> stack{root};  // left vertices on the current alternating path
    std::vector<std::size_t> nextEdge{0};
    std::vector<int> through;  // through[k]: the right vertex between stack[k] and stack[k + 1]
    while (!stack.empty()) {
        int u = stack.back();
        if (nextEdge.back() == adj[u].size()) {
            stack.pop_back();
            nextEdge.pop_back();
            if (!through.empty()) through.pop_back();
            continue;
        }
        int v = adj[u][nextEdge.back()++];
        if (seen[v] == root) continue;
        seen[v] = root;
        through.push_back(v);
        if (matchRight[v] == -1) {
            flip(stack, through, matchLeft, matchRight);
            return true;
        }
        stack.push_back(matchRight[v]);  // v is taken: ask its partner to move
        nextEdge.push_back(0);
    }
    return false;
}

// Hopcroft-Karp's BFS: layer 0 is every free left vertex; a matched right vertex next to
// layer d puts its partner in layer d + 1. It stops at the first free right vertex: the layer
// of its neighbour is the last one. Returns that layer, or -1 when no augmenting path is left.
inline int bfsLayers(const Adjacency& adj, const std::vector<int>& matchLeft, const std::vector<int>& matchRight,
                     std::vector<int>& dist) {
    std::deque<int> queue;
    for (std::size_t u = 0; u < adj.size(); ++u) {
        dist[u] = matchLeft[u] == -1 ? 0 : -1;
        if (matchLeft[u] == -1) queue.push_back(static_cast<int>(u));
    }
    while (!queue.empty()) {
        int u = queue.front();
        queue.pop_front();
        for (int v : adj[u]) {
            int w = matchRight[v];
            if (w == -1) {
                int last = dist[u];
                for (int& d : dist) {
                    if (d > last) d = -1;  // past the last layer: on no shortest augmenting path
                }
                return last;
            }
            if (dist[w] == -1) {
                dist[w] = dist[u] + 1;
                queue.push_back(w);
            }
        }
    }
    return -1;
}

// Hopcroft-Karp's DFS: from u, only to a partner in layer dist[u] + 1. A free right vertex is
// only ever next to the last layer, so reaching one gives a shortest augmenting path. A left
// vertex whose search fails gets dist -1 and is not entered again in this phase.
inline bool hkAugment(int root, const Adjacency& adj, std::vector<int>& matchLeft, std::vector<int>& matchRight,
                      std::vector<int>& dist) {
    std::vector<int> stack{root};
    std::vector<std::size_t> nextEdge{0};
    std::vector<int> through;
    while (!stack.empty()) {
        int u = stack.back();
        if (nextEdge.back() == adj[u].size()) {
            dist[u] = -1;  // a dead end for the rest of this phase
            stack.pop_back();
            nextEdge.pop_back();
            if (!through.empty()) through.pop_back();
            continue;
        }
        int v = adj[u][nextEdge.back()++];
        int w = matchRight[v];
        if (w == -1) {
            through.push_back(v);
            flip(stack, through, matchLeft, matchRight);
            return true;
        }
        if (dist[w] == dist[u] + 1) {
            through.push_back(v);
            stack.push_back(w);
            nextEdge.push_back(0);
        }
    }
    return false;
}

// The Hopcroft-Karp matching, with matchRight for the vertex cover.
inline Matching runHopcroftKarp(const Adjacency& adj, int nRight, std::vector<int>& matchRight) {
    int nLeft = static_cast<int>(adj.size());
    Matching result;
    result.matchLeft.assign(nLeft, -1);
    matchRight.assign(nRight, -1);
    std::vector<int> dist(nLeft, -1);
    while (bfsLayers(adj, result.matchLeft, matchRight, dist) != -1) {
        for (int root = 0; root < nLeft; ++root) {
            if (result.matchLeft[root] == -1 && hkAugment(root, adj, result.matchLeft, matchRight, dist)) {
                ++result.size;
            }
        }
    }
    return result;
}

}  // namespace bipartite_detail

// Maximum matching with Kuhn's algorithm: one DFS for an augmenting path from each left vertex,
// in order 0, 1, ..., nLeft - 1. O(V * E) time, O(V + E) space.
// Throws std::invalid_argument for a negative side size or an edge endpoint out of range.
inline Matching kuhn(int nLeft, int nRight, const std::vector<Edge>& edges) {
    using namespace bipartite_detail;
    Adjacency adj = adjacency(nLeft, nRight, edges);
    Matching result;
    result.matchLeft.assign(nLeft, -1);
    std::vector<int> matchRight(nRight, -1);
    std::vector<int> seen(nRight, -1);
    for (int root = 0; root < nLeft; ++root) {
        if (kuhnAugment(root, adj, result.matchLeft, matchRight, seen)) ++result.size;
    }
    return result;
}

// Maximum matching with Hopcroft-Karp: phases of one BFS (the layers) and one DFS from each
// free left vertex, taking vertex-disjoint shortest augmenting paths. O(E * sqrt(V)) time,
// O(V + E) space. Throws as kuhn does.
inline Matching hopcroftKarp(int nLeft, int nRight, const std::vector<Edge>& edges) {
    using namespace bipartite_detail;
    Adjacency adj = adjacency(nLeft, nRight, edges);
    std::vector<int> matchRight;
    return runHopcroftKarp(adj, nRight, matchRight);
}

// A minimum vertex cover by Konig's theorem, from the Hopcroft-Karp matching. Z is the set of
// vertices reachable from the free left vertices by alternating paths; the cover is the left
// vertices outside Z and the right vertices inside it, as many as the matching has edges.
// Throws as kuhn does.
inline VertexCover minVertexCover(int nLeft, int nRight, const std::vector<Edge>& edges) {
    using namespace bipartite_detail;
    Adjacency adj = adjacency(nLeft, nRight, edges);
    std::vector<int> matchRight;
    Matching m = runHopcroftKarp(adj, nRight, matchRight);
    std::vector<bool> leftInZ(nLeft), rightInZ(nRight, false);
    std::vector<int> stack;
    for (int u = 0; u < nLeft; ++u) {
        leftInZ[u] = m.matchLeft[u] == -1;
        if (leftInZ[u]) stack.push_back(u);
    }
    while (!stack.empty()) {
        int u = stack.back();
        stack.pop_back();
        for (int v : adj[u]) {
            if (rightInZ[v]) continue;
            rightInZ[v] = true;
            int w = matchRight[v];  // matched, or the matching would not be maximum
            if (!leftInZ[w]) {
                leftInZ[w] = true;
                stack.push_back(w);
            }
        }
    }
    VertexCover cover;
    for (int u = 0; u < nLeft; ++u) {
        if (!leftInZ[u]) cover.left.push_back(u);
    }
    for (int v = 0; v < nRight; ++v) {
        if (rightInZ[v]) cover.right.push_back(v);
    }
    return cover;
}

#ifndef IS_TEST_BUILD
#include <iostream>

static void print(const char* name, const std::vector<int>& xs) {
    std::cout << name << " [";
    for (std::size_t i = 0; i < xs.size(); ++i) std::cout << (i ? ", " : "") << xs[i];
    std::cout << "]";
}

int main() {
    // Four left and four right vertices; L1, L2 and L3 reach only R0 and R1.
    std::vector<Edge> example = {{0, 1}, {0, 2}, {0, 3}, {1, 0}, {1, 1}, {2, 0}, {3, 1}};
    Matching k = kuhn(4, 4, example);
    Matching h = hopcroftKarp(4, 4, example);
    VertexCover c = minVertexCover(4, 4, example);
    std::cout << "Kuhn: size " << k.size << ", ";
    print("matchLeft", k.matchLeft);  // size 3, [2, 1, 0, -1]
    std::cout << "\nHopcroft-Karp: size " << h.size << ", ";
    print("matchLeft", h.matchLeft);  // size 3, [2, 0, -1, 1]
    std::cout << "\nMinimum vertex cover: ";
    print("left", c.left);  // [0]
    std::cout << ", ";
    print("right", c.right);  // [0, 1]
    std::cout << std::endl;
    return 0;
}
#endif  // !IS_TEST_BUILD
