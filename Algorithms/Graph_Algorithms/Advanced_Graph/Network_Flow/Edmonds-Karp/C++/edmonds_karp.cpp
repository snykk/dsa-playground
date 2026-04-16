#include <vector>
#include <unordered_map>
#include <queue>
#include <climits>
#include <algorithm>

int edmondsKarp(const std::unordered_map<int, std::unordered_map<int, int>>& graph,
                int source, int sink) {
    if (source == sink) return 0;
    
    auto residual = graph;
    for (const auto& u_pair : graph) {
        for (const auto& v_pair : u_pair.second) {
            if (residual.find(v_pair.first) == residual.end() ||
                residual[v_pair.first].find(u_pair.first) == residual[v_pair.first].end()) {
                residual[v_pair.first][u_pair.first] = 0;
            }
        }
    }
    
    int maxFlow = 0;
    
    while (true) {
        std::unordered_map<int, int> parent;
        std::queue<int> q;
        q.push(source);
        parent[source] = -1;
        
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            
            auto it = residual.find(u);
            if (it != residual.end()) {
                for (const auto& edge : it->second) {
                    int v = edge.first;
                    int cap = edge.second;
                    if (parent.find(v) == parent.end() && cap > 0) {
                        parent[v] = u;
                        if (v == sink) {
                            int pathFlow = INT_MAX;
                            for (int v = sink; v != source; v = parent[v]) {
                                int u = parent[v];
                                pathFlow = std::min(pathFlow, residual[u][v]);
                            }
                            for (int v = sink; v != source; v = parent[v]) {
                                int u = parent[v];
                                residual[u][v] -= pathFlow;
                                residual[v][u] += pathFlow;
                            }
                            maxFlow += pathFlow;
                            goto next_iteration;
                        }
                        q.push(v);
                    }
                }
            }
        }
        break;
        next_iteration:;
    }
    
    return maxFlow;
}

// Example usage (uncomment to use)
/*
#include <iostream>
#ifndef TESTING
int main() {
    std::unordered_map<int, std::unordered_map<int, int>> graph = {
        {0, {{1, 16}, {2, 13}}},
        {1, {{2, 10}, {3, 12}}},
        {2, {{1, 4}, {4, 14}}},
        {3, {{2, 9}, {5, 20}}},
        {4, {{3, 7}, {5, 4}}}
    };
    
    std::cout << "Edmonds-Karp Algorithm Example:" << std::endl;
    int maxFlow = edmondsKarp(graph, 0, 5);
    std::cout << "Maximum flow: " << maxFlow << std::endl;  // 23
    
    return 0;
}
#endif
*/

