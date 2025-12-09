/**
 * Prim's Algorithm Implementation (C++)
 * Time Complexity: O(E log V) with binary heap
 */

#include <vector>
#include <queue>
#include <climits>
#include <tuple>
#include <utility>

std::vector<std::tuple<int, int, int>> primMST(
    const std::vector<std::vector<std::pair<int, int>>>& graph, int start) {
    
    if (graph.empty()) {
        return {};
    }
    
    int numVertices = graph.size();
    std::vector<bool> visited(numVertices, false);
    std::vector<std::tuple<int, int, int>> mst;
    
    // Priority queue: (weight, from_vertex, to_vertex)
    std::priority_queue<std::tuple<int, int, int>,
                        std::vector<std::tuple<int, int, int>>,
                        std::greater<std::tuple<int, int, int>>> pq;
    
    pq.push({0, start, start});
    
    while (!pq.empty() && mst.size() < static_cast<size_t>(numVertices - 1)) {
        auto [weight, from, to] = pq.top();
        pq.pop();
        
        if (visited[to]) {
            continue;
        }
        
        visited[to] = true;
        
        if (from != to) {
            mst.push_back({from, to, weight});
        }
        
        // Add neighbors to priority queue
        for (const auto& [neighbor, edgeWeight] : graph[to]) {
            if (!visited[neighbor]) {
                pq.push({edgeWeight, to, neighbor});
            }
        }
    }
    
    return mst;
}
