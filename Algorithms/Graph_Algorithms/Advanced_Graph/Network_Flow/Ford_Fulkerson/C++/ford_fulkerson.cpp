/**
 * Ford-Fulkerson Algorithm Implementation (C++)
 *
 * Capacities are int; the residual graph and the flow total are long long so that
 * several large paths cannot overflow. Vertex ids can be any int.
 */

#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <climits>
#include <algorithm>

using ResidualGraph = std::unordered_map<int, std::unordered_map<int, long long>>;

// Iterative DFS for an augmenting path. Returns the vertices from source to sink,
// or an empty vector when the sink cannot be reached.
std::vector<int> dfsFindPath(const ResidualGraph& residual, int source, int sink) {
    using Neighbors = std::unordered_map<int, long long>;
    static const Neighbors none;
    auto neighborsOf = [&](int u) -> const Neighbors& {
        auto it = residual.find(u);
        return it == residual.end() ? none : it->second;
    };

    std::unordered_map<int, int> parent;
    parent[source] = source;
    std::vector<std::pair<int, Neighbors::const_iterator>> stack;
    stack.push_back({source, neighborsOf(source).begin()});

    while (!stack.empty()) {
        int u = stack.back().first;
        auto& it = stack.back().second;
        if (it == neighborsOf(u).end()) {
            stack.pop_back();
            continue;
        }
        int v = it->first;
        long long capacity = it->second;
        ++it;
        if (capacity > 0 && parent.find(v) == parent.end()) {
            parent[v] = u;
            if (v == sink) {
                std::vector<int> path = {sink};
                while (path.back() != source) path.push_back(parent[path.back()]);
                std::reverse(path.begin(), path.end());
                return path;
            }
            stack.push_back({v, neighborsOf(v).begin()});
        }
    }
    return {};
}

long long fordFulkerson(const std::unordered_map<int, std::unordered_map<int, int>>& graph,
                        int source, int sink) {
    if (source == sink) {
        return 0;
    }

    // Residual graph: forward capacities plus a 0-capacity reverse entry per edge.
    ResidualGraph residual;
    for (const auto& u_pair : graph) {
        residual[u_pair.first];  // keep vertices without outgoing edges
        for (const auto& v_pair : u_pair.second) {
            residual[u_pair.first][v_pair.first] += v_pair.second;
            residual[v_pair.first][u_pair.first] += 0;
        }
    }

    long long maxFlow = 0;

    while (true) {
        std::vector<int> path = dfsFindPath(residual, source, sink);
        if (path.empty()) {
            break;
        }

        // Find minimum capacity
        long long minCapacity = LLONG_MAX;
        for (size_t i = 0; i + 1 < path.size(); i++) {
            minCapacity = std::min(minCapacity, residual[path[i]][path[i + 1]]);
        }

        // Update residual graph
        for (size_t i = 0; i + 1 < path.size(); i++) {
            residual[path[i]][path[i + 1]] -= minCapacity;
            residual[path[i + 1]][path[i]] += minCapacity;
        }

        maxFlow += minCapacity;
    }

    return maxFlow;
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

    std::cout << "Ford-Fulkerson Algorithm Example:" << std::endl;
    std::cout << "Maximum flow: " << fordFulkerson(graph, 0, 5) << std::endl;  // 23
    return 0;
}
#endif  // !IS_TEST_BUILD
