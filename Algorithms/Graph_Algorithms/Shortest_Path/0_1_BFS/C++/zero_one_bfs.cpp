// 0-1 BFS: single-source shortest paths when every edge weight is 0 or 1.
//
// The graph has numVertices vertices, numbered 0 .. numVertices - 1, and a list of directed
// edges {u, v, weight} with weight 0 or 1; an undirected graph is given as both directions.
// A std::deque of (distance, vertex) entries replaces Dijkstra's priority queue: relaxing an
// edge of weight 0 pushes the vertex to the front, an edge of weight 1 to the back. The deque
// then holds at most two distances, d and d + 1, in order, so the front entry always has the
// smallest distance, at O(1) per push and pop: O(V + E) in total.
//
// An unreachable vertex has distance -1 and parent -1; the source has parent -1 too. adj[u]
// keeps u's edges in the order given and the search relaxes them in that order, so the parent
// array is the one the Python and Go versions return.
#include <cstddef>
#include <deque>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

struct Edge {
    int u, v, weight;
};

struct ShortestPaths {
    std::vector<int> dist;    // dist[v]: length of a shortest path from the source, or -1
    std::vector<int> parent;  // parent[v]: the vertex before v on that path, or -1
};

namespace zero_one_bfs_detail {

using Adjacency = std::vector<std::vector<std::pair<int, int>>>;  // adj[u]: (v, weight) in edge order

// Work done by one search, for the tests: every pop (stale ones included), the stale pops,
// and every adjacency entry read.
struct Counters {
    long long pops = 0;
    long long stalePops = 0;
    long long edgeScans = 0;
};

// Checks the whole input first, then builds adj.
inline Adjacency adjacency(const std::vector<Edge>& edges, int numVertices, int start) {
    if (numVertices < 0) {
        throw std::invalid_argument("numVertices must be >= 0, got " + std::to_string(numVertices));
    }
    Adjacency adj(numVertices);
    for (const Edge& e : edges) {
        std::string edge = "edge (" + std::to_string(e.u) + ", " + std::to_string(e.v) + ", " + std::to_string(e.weight) + ")";
        if (e.u < 0 || e.u >= numVertices || e.v < 0 || e.v >= numVertices) {
            throw std::invalid_argument(edge + " has an endpoint outside [0, " + std::to_string(numVertices) + ")");
        }
        if (e.weight != 0 && e.weight != 1) {
            throw std::invalid_argument(edge + " has weight " + std::to_string(e.weight) + "; 0-1 BFS takes weights 0 and 1 only");
        }
        adj[e.u].push_back({e.v, e.weight});
    }
    if (start < 0 || start >= numVertices) {
        throw std::invalid_argument("start " + std::to_string(start) + " is not a vertex: it must be in [0, " +
                                    std::to_string(numVertices) + ")");
    }
    return adj;
}

// The 0-1 BFS itself. counters may be null.
inline ShortestPaths search(const Adjacency& adj, int start, Counters* counters = nullptr) {
    const int n = static_cast<int>(adj.size());
    ShortestPaths r{std::vector<int>(n, -1), std::vector<int>(n, -1)};
    r.dist[start] = 0;
    std::deque<std::pair<int, int>> queue{{0, start}};
    while (!queue.empty()) {
        auto [d, u] = queue.front();
        queue.pop_front();
        if (counters) counters->pops++;
        if (d > r.dist[u]) {
            // Stale: u was pushed again with a smaller distance, and that entry was processed.
            if (counters) counters->stalePops++;
            continue;
        }
        for (const auto& [v, w] : adj[u]) {
            if (counters) counters->edgeScans++;
            int nd = d + w;
            if (r.dist[v] == -1 || nd < r.dist[v]) {
                r.dist[v] = nd;
                r.parent[v] = u;
                if (w == 0) {
                    queue.push_front({nd, v});  // the same distance as u: before every d + 1
                } else {
                    queue.push_back({nd, v});  // one more than u: behind everything
                }
            }
        }
    }
    return r;
}

}  // namespace zero_one_bfs_detail

// Shortest distances and parents from start. Self-loops and parallel edges are allowed.
// Distances are at most V - 1, so int cannot overflow.
// Throws std::invalid_argument for a negative numVertices, an endpoint out of range, a weight
// other than 0 or 1, or a start that is not a vertex (so numVertices == 0 always throws).
inline ShortestPaths zeroOneBfs(const std::vector<Edge>& edges, int numVertices, int start) {
    using namespace zero_one_bfs_detail;
    return search(adjacency(edges, numVertices, start), start);
}

// The path start, ..., target along a parent array from zeroOneBfs(..., start): {start} when
// target == start, {} when target is unreachable. Throws std::invalid_argument when start or
// target is outside [0, parent.size()).
inline std::vector<int> pathTo(const std::vector<int>& parent, int start, int target) {
    const int n = static_cast<int>(parent.size());
    if (start < 0 || start >= n || target < 0 || target >= n) {
        throw std::invalid_argument("start " + std::to_string(start) + " and target " + std::to_string(target) +
                                    " must be in [0, " + std::to_string(n) + ")");
    }
    if (target == start) return {start};
    if (parent[target] == -1) return {};
    std::vector<int> path{target};
    while (path.back() != start) path.push_back(parent[path.back()]);
    return std::vector<int>(path.rbegin(), path.rend());
}

// The distance from start to target and one shortest path, or {-1, {}} when there is none.
// The search runs to the end; throws as zeroOneBfs does, or for a target that is not a vertex.
inline std::pair<int, std::vector<int>> zeroOneBfsWithPath(const std::vector<Edge>& edges, int numVertices, int start,
                                                           int target) {
    ShortestPaths r = zeroOneBfs(edges, numVertices, start);
    if (target < 0 || target >= numVertices) {
        throw std::invalid_argument("target " + std::to_string(target) + " is not a vertex: it must be in [0, " +
                                    std::to_string(numVertices) + ")");
    }
    return {r.dist[target], pathTo(r.parent, start, target)};
}

// The 0-1 graph of a grid of '.' (road) and '#' (wall): cell (r, c) is vertex r * cols + c,
// and for every cell in row-major order and every neighbour up, down, left, right there is an
// edge into the neighbour of weight 0 for a road and 1 for a wall. Throws std::invalid_argument
// for an empty grid, rows of different lengths or another character.
inline std::vector<Edge> gridEdges(const std::vector<std::string>& grid) {
    if (grid.empty() || grid[0].empty()) throw std::invalid_argument("the grid needs at least one row and one column");
    const int rows = static_cast<int>(grid.size());
    const int cols = static_cast<int>(grid[0].size());
    for (int r = 0; r < rows; ++r) {
        if (static_cast<int>(grid[r].size()) != cols) {
            throw std::invalid_argument("row " + std::to_string(r) + " has " + std::to_string(grid[r].size()) +
                                        " cells, row 0 has " + std::to_string(cols));
        }
        for (char ch : grid[r]) {
            if (ch != '.' && ch != '#') {
                throw std::invalid_argument(std::string("cell '") + ch + "' in row " + std::to_string(r) +
                                            ": use '.' for a road and '#' for a wall");
            }
        }
    }
    const int dr[] = {-1, 1, 0, 0};
    const int dc[] = {0, 0, -1, 1};
    std::vector<Edge> edges;
    for (int r = 0; r < rows; ++r) {
        for (int c = 0; c < cols; ++c) {
            for (int k = 0; k < 4; ++k) {
                int nr = r + dr[k], nc = c + dc[k];
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    edges.push_back({r * cols + c, nr * cols + nc, grid[nr][nc] == '#' ? 1 : 0});
                }
            }
        }
    }
    return edges;
}

// The fewest walls to break to walk from start to goal ({row, col}), moving up, down, left or
// right. Entering a road costs 0 and a wall 1; the start cell is free even when it is a wall.
// Throws as gridEdges does, or for a start or goal outside the grid.
inline int minWallBreaks(const std::vector<std::string>& grid, std::pair<int, int> start, std::pair<int, int> goal) {
    std::vector<Edge> edges = gridEdges(grid);
    const int rows = static_cast<int>(grid.size());
    const int cols = static_cast<int>(grid[0].size());
    for (auto cell : {start, goal}) {
        if (cell.first < 0 || cell.first >= rows || cell.second < 0 || cell.second >= cols) {
            throw std::invalid_argument("cell (" + std::to_string(cell.first) + ", " + std::to_string(cell.second) +
                                        ") is outside the " + std::to_string(rows) + " x " + std::to_string(cols) + " grid");
        }
    }
    ShortestPaths r = zeroOneBfs(edges, rows * cols, start.first * cols + start.second);
    return r.dist[goal.first * cols + goal.second];
}

#ifndef IS_TEST_BUILD
#include <iostream>

static void print(const char* name, const std::vector<int>& xs) {
    std::cout << name << " [";
    for (std::size_t i = 0; i < xs.size(); ++i) std::cout << (i ? ", " : "") << xs[i];
    std::cout << "]\n";
}

int main() {
    // A to G are vertices 0 to 6. B is first reached by A->B (weight 1), then more cheaply by
    // A->C->B (0 + 0), so its first deque entry goes stale. Nothing leads to G.
    std::vector<Edge> example = {{0, 1, 1}, {0, 2, 0}, {2, 1, 0}, {1, 3, 1}, {2, 4, 1},
                                 {4, 3, 0}, {4, 5, 1}, {3, 5, 1}, {6, 0, 1}};
    ShortestPaths r = zeroOneBfs(example, 7, 0);
    print("dist:  ", r.dist);    // [0, 0, 0, 1, 1, 2, -1]
    print("parent:", r.parent);  // [-1, 2, 0, 1, 2, 4, -1]
    auto [d, path] = zeroOneBfsWithPath(example, 7, 0, 5);
    std::cout << "distance to 5: " << d << ", ";
    print("path", path);  // 2, [0, 2, 4, 5]
    std::vector<std::string> city = {"...#.#.", "##.#.#.", "...#.#.", ".###.#.", ".....#."};
    std::cout << "walls to break: " << minWallBreaks(city, {0, 0}, {4, 6}) << "\n";  // 1
    return 0;
}
#endif  // !IS_TEST_BUILD
