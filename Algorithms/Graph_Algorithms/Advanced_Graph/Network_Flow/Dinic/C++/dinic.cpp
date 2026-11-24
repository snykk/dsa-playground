// Maximum flow with Dinic's algorithm: level graphs and blocking flows.
//
// Each phase runs one BFS from the source over the residual graph and gives every vertex it
// reaches a level, its distance in residual edges. Then depth-first searches push a blocking
// flow through the level graph, stepping only from level d to level d + 1, until no such path
// reaches the sink. A current-arc pointer per vertex remembers which residual entry to try
// next, so within one phase each entry is passed over at most once. The run stops when the BFS
// no longer reaches the sink; the vertices it did reach are the source side of a minimum cut.
//
// The input is the one edmondsKarp takes, graph[u][v] = capacity, and the residual graph is a
// map of maps as well. Every search tries the residual entries of a vertex in increasing order
// of the neighbour, so the result is the one the Python and Go versions return. Capacities are
// int, but the residual graph and the flows are long long, so a sum of large paths cannot
// overflow.
#include <algorithm>
#include <cstddef>
#include <deque>
#include <unordered_map>
#include <vector>

struct DinicResult {
    long long maxFlow = 0;
    // flows[u][v]: the flow on the edge u -> v, for every edge of the input graph.
    std::unordered_map<int, std::unordered_map<int, long long>> flows;
    // The vertices the last BFS reached, in increasing order: the source side of a minimum cut.
    std::vector<int> sourceSide;
    // BFS runs, the last one (which no longer reaches the sink) included.
    int phases = 0;
    // Residual entries the depth-first searches looked at, over all phases.
    long long edgeVisits = 0;
};

namespace dinic_detail {

using Graph = std::unordered_map<int, std::unordered_map<int, int>>;
using Residual = std::unordered_map<int, std::unordered_map<int, long long>>;
using Adjacency = std::unordered_map<int, std::vector<int>>;
using Levels = std::unordered_map<int, int>;

// Copy the capacities and add a 0-capacity reverse entry for every edge without one.
inline Residual buildResidual(const Graph& graph) {
    Residual residual;
    for (const auto& row : graph) {
        residual[row.first];  // keep vertices without outgoing edges
        for (const auto& edge : row.second) {
            residual[row.first][edge.first] += edge.second;
            residual[edge.first][row.first] += 0;
        }
    }
    return residual;
}

// adj[u]: the residual entries of u in increasing order, the order every search tries.
inline Adjacency neighbours(const Residual& residual) {
    Adjacency adj;
    for (const auto& row : residual) {
        std::vector<int>& list = adj[row.first];
        for (const auto& entry : row.second) list.push_back(entry.first);
        std::sort(list.begin(), list.end());
    }
    return adj;
}

// level[v]: the fewest residual edges with room on a path from the source to v, for every
// vertex the BFS reaches.
inline Levels bfsLevels(const Residual& residual, const Adjacency& adj, int source) {
    Levels level{{source, 0}};
    std::deque<int> queue{source};
    while (!queue.empty()) {
        int u = queue.front();
        queue.pop_front();
        auto row = adj.find(u);
        if (row == adj.end()) continue;
        const auto& room = residual.at(u);
        for (int v : row->second) {
            if (level.count(v) == 0 && room.at(v) > 0) {
                level[v] = level[u] + 1;
                queue.push_back(v);
            }
        }
    }
    return level;
}

// One depth-first search from the source through the level graph. It steps from u to v only
// when residual[u][v] > 0 and level[v] == level[u] + 1, and each vertex resumes at current[u],
// its current arc: an entry that cannot be used now cannot be used later in the phase either,
// so the pointer only moves forward. A vertex whose pointer reaches the end is a dead end: it
// is popped, and the vertex before it moves past the entry that led there. Returns whether
// the sink was reached (the path is then in `path`) and adds the entries it looked at to
// `visits`.
inline bool findPath(const Residual& residual, const Adjacency& adj, const Levels& level,
                     std::unordered_map<int, std::size_t>& current, int source, int sink, std::vector<int>& path,
                     long long& visits) {
    path.assign(1, source);
    while (!path.empty()) {
        int u = path.back();
        if (u == sink) return true;
        const std::vector<int>& row = adj.at(u);
        const auto& room = residual.at(u);
        int levelU = level.at(u);
        std::size_t& arc = current[u];
        bool stepped = false;
        while (arc < row.size()) {
            int v = row[arc];
            ++visits;
            auto lv = level.find(v);
            if (room.at(v) > 0 && lv != level.end() && lv->second == levelU + 1) {
                path.push_back(v);
                stepped = true;
                break;
            }
            ++arc;
        }
        if (!stepped) {
            // A dead end for the rest of the phase: back up and skip the entry that led here.
            path.pop_back();
            if (!path.empty()) ++current[path.back()];
        }
    }
    return false;
}

// Push the bottleneck of the path along it and return the bottleneck.
inline long long push(Residual& residual, const std::vector<int>& path) {
    long long bottleneck = residual[path[0]][path[1]];
    for (std::size_t k = 1; k + 1 < path.size(); ++k) {
        bottleneck = std::min(bottleneck, residual[path[k]][path[k + 1]]);
    }
    for (std::size_t k = 0; k + 1 < path.size(); ++k) {
        residual[path[k]][path[k + 1]] -= bottleneck;
        residual[path[k + 1]][path[k]] += bottleneck;
    }
    return bottleneck;
}

struct Run {
    long long maxFlow = 0;
    Residual residual;
    Levels level;  // the levels of the last BFS
    int phases = 0;
    long long edgeVisits = 0;
};

inline Run run(const Graph& graph, int source, int sink) {
    Run r;
    r.residual = buildResidual(graph);
    Adjacency adj = neighbours(r.residual);
    std::vector<int> path;
    while (true) {
        r.level = bfsLevels(r.residual, adj, source);
        ++r.phases;
        if (r.level.count(sink) == 0) return r;
        std::unordered_map<int, std::size_t> current;
        while (findPath(r.residual, adj, r.level, current, source, sink, path, r.edgeVisits)) {
            r.maxFlow += push(r.residual, path);
        }
    }
}

}  // namespace dinic_detail

// The maximum flow from source to sink; 0 when source == sink or the sink cannot be reached.
// O(V^2 E) time; O(E sqrt(V)) on unit networks. O(V + E) space.
long long dinic(const std::unordered_map<int, std::unordered_map<int, int>>& graph, int source, int sink) {
    if (source == sink) return 0;
    return dinic_detail::run(graph, source, sink).maxFlow;
}

// The maximum flow, the flow on every edge, the source side of a minimum cut and the work
// done. Two anti-parallel edges share their residual entries, so only their net flow is
// defined: it is given to the edge it runs along, and the other edge gets 0. When
// source == sink nothing is sent: every flow is 0, phases and edgeVisits are 0 and
// sourceSide is {source}.
DinicResult dinicFlow(const std::unordered_map<int, std::unordered_map<int, int>>& graph, int source, int sink) {
    DinicResult result;
    if (source == sink) {
        for (const auto& row : graph) {
            for (const auto& edge : row.second) result.flows[row.first][edge.first] = 0;
        }
        result.sourceSide = {source};
        return result;
    }
    dinic_detail::Run r = dinic_detail::run(graph, source, sink);
    for (const auto& row : graph) {
        auto& flows = result.flows[row.first];
        for (const auto& edge : row.second) {
            flows[edge.first] = std::max(0LL, edge.second - r.residual[row.first][edge.first]);
        }
    }
    for (const auto& entry : r.level) result.sourceSide.push_back(entry.first);
    std::sort(result.sourceSide.begin(), result.sourceSide.end());
    result.maxFlow = r.maxFlow;
    result.phases = r.phases;
    result.edgeVisits = r.edgeVisits;
    return result;
}

#ifndef IS_TEST_BUILD
#include <iostream>
int main() {
    std::unordered_map<int, std::unordered_map<int, int>> graph = {
        {0, {{1, 16}, {2, 13}}},
        {1, {{2, 10}, {3, 12}}},
        {2, {{1, 4}, {4, 14}}},
        {3, {{2, 9}, {5, 20}}},
        {4, {{3, 7}, {5, 4}}}
    };

    std::cout << "Dinic's Algorithm Example:" << std::endl;
    std::cout << "Maximum flow: " << dinic(graph, 0, 5) << std::endl;  // 23

    DinicResult result = dinicFlow(graph, 0, 5);
    std::cout << "Source side of a minimum cut:";
    for (int v : result.sourceSide) std::cout << ' ' << v;  // 0 1 2 4
    std::cout << std::endl;
    std::cout << "Phases: " << result.phases << ", edge visits: " << result.edgeVisits << std::endl;  // 3, 40
    return 0;
}
#endif  // !IS_TEST_BUILD
