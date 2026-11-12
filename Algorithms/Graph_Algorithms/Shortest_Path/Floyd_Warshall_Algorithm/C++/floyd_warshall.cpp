/**
 * Floyd-Warshall Algorithm Implementation (C++)
 * Time Complexity: O(V^3)
 * Distances are long long (LLONG_MAX = no path) so sums of large weights cannot overflow.
 */

#include <vector>
#include <climits>
#include <algorithm>

using namespace std;

vector<vector<long long>> floydWarshall(
    const vector<vector<pair<int, int>>>& graph, int numVertices) {
    /**
     * Floyd-Warshall algorithm to find shortest distances between all pairs
     * graph: adjacency list representation (graph[u] = [(v, weight), ...]);
     *        it may have fewer rows than numVertices (missing rows have no edges)
     * Returns an empty matrix if a negative cycle exists
     */
    vector<vector<long long>> dist(numVertices, vector<long long>(numVertices, LLONG_MAX));

    // Initialize distance matrix
    for (int i = 0; i < numVertices; ++i) {
        dist[i][i] = 0;
    }

    // Initialize with direct edges; keep the cheapest of parallel edges, and a
    // positive self-loop never raises dist[u][u] above 0
    int rows = min(numVertices, static_cast<int>(graph.size()));
    for (int u = 0; u < rows; ++u) {
        for (const auto& [v, weight] : graph[u]) {
            long long& cell = dist[u].at(v);  // throws std::out_of_range for a bad endpoint
            cell = min(cell, static_cast<long long>(weight));
        }
    }

    // Floyd-Warshall algorithm
    for (int k = 0; k < numVertices; ++k) {
        for (int i = 0; i < numVertices; ++i) {
            for (int j = 0; j < numVertices; ++j) {
                if (dist[i][k] != LLONG_MAX && dist[k][j] != LLONG_MAX) {
                    dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);
                }
            }
        }
        // Check for negative cycles after every round, before values can run away
        for (int i = 0; i < numVertices; ++i) {
            if (dist[i][i] < 0) {
                return {};  // Negative cycle detected
            }
        }
    }

    return dist;
}

