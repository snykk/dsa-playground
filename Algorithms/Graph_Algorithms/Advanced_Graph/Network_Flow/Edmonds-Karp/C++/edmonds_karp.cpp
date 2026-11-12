#include <vector>
#include <unordered_map>
#include <queue>
#include <climits>
#include <algorithm>

// Maximum flow with Edmonds-Karp (Ford-Fulkerson with BFS augmenting paths).
// Capacities are int, but the residual graph and the flow total are long long,
// so the sum of several large paths cannot overflow.
long long edmondsKarp(const std::unordered_map<int, std::unordered_map<int, int>>& graph,
                      int source, int sink) {
    if (source == sink) return 0;

    // Residual graph: forward capacities plus a 0-capacity reverse entry per edge.
    std::unordered_map<int, std::unordered_map<int, long long>> residual;
    for (const auto& u_pair : graph) {
        residual[u_pair.first];  // keep vertices without outgoing edges
        for (const auto& v_pair : u_pair.second) {
            residual[u_pair.first][v_pair.first] += v_pair.second;
            residual[v_pair.first][u_pair.first] += 0;
        }
    }

    long long maxFlow = 0;

    while (true) {
        // BFS from the source over edges with positive residual capacity.
        std::unordered_map<int, int> parent;
        std::queue<int> q;
        q.push(source);
        parent[source] = source;

        while (!q.empty() && parent.find(sink) == parent.end()) {
            int u = q.front();
            q.pop();
            for (const auto& edge : residual[u]) {
                int v = edge.first;
                if (edge.second > 0 && parent.find(v) == parent.end()) {
                    parent[v] = u;
                    q.push(v);
                }
            }
        }
        if (parent.find(sink) == parent.end()) break;  // no augmenting path left

        // Bottleneck of the path, then push it.
        long long pathFlow = LLONG_MAX;
        for (int v = sink; v != source; v = parent[v]) {
            pathFlow = std::min(pathFlow, residual[parent[v]][v]);
        }
        for (int v = sink; v != source; v = parent[v]) {
            residual[parent[v]][v] -= pathFlow;
            residual[v][parent[v]] += pathFlow;
        }
        maxFlow += pathFlow;
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

    std::cout << "Edmonds-Karp Algorithm Example:" << std::endl;
    std::cout << "Maximum flow: " << edmondsKarp(graph, 0, 5) << std::endl;  // 23
    return 0;
}
#endif  // !IS_TEST_BUILD
