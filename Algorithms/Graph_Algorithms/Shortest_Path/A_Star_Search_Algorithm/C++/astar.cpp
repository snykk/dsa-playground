/**
 * A* Search Algorithm Implementation (C++)
 * Time Complexity: O(b^d) where b is branching factor, d is depth
 */

#include <vector>
#include <queue>
#include <unordered_map>
#include <functional>
#include <climits>

using namespace std;

struct Node {
    int vertex;
    int g_score;
    int f_score;
    vector<int> path;
    
    bool operator>(const Node& other) const {
        return f_score > other.f_score;
    }
};

pair<int, vector<int>> astar(
    const unordered_map<int, vector<pair<int, int>>>& graph,
    int start, int goal,
    function<int(int)> heuristic) {
    /**
     * A* search algorithm to find shortest path from start to goal
     * Optimal for any admissible heuristic on non-negative weights: a vertex is
     * re-expanded when a cheaper route to it is found later (no closed set).
     */
    priority_queue<Node, vector<Node>, greater<Node>> pq;
    unordered_map<int, int> g_scores;
    
    Node startNode;
    startNode.vertex = start;
    startNode.g_score = 0;
    startNode.f_score = heuristic(start);
    startNode.path = {start};
    
    pq.push(startNode);
    g_scores[start] = 0;
    
    while (!pq.empty()) {
        Node current = pq.top();
        pq.pop();
        
        if (current.vertex == goal) {
            return {current.g_score, current.path};
        }
        
        if (current.g_score > g_scores[current.vertex]) {
            continue;  // stale entry: a cheaper route to this vertex was found after this push
        }
        
        if (graph.find(current.vertex) != graph.end()) {
            for (const auto& [neighbor, weight] : graph.at(current.vertex)) {
                int tentative_g = current.g_score + weight;
                
                if (g_scores.find(neighbor) == g_scores.end() || 
                    tentative_g < g_scores[neighbor]) {
                    g_scores[neighbor] = tentative_g;
                    
                    Node neighborNode;
                    neighborNode.vertex = neighbor;
                    neighborNode.g_score = tentative_g;
                    neighborNode.f_score = tentative_g + heuristic(neighbor);
                    neighborNode.path = current.path;
                    neighborNode.path.push_back(neighbor);
                    
                    pq.push(neighborNode);
                }
            }
        }
    }
    
    return {-1, {}};  // No path found
}


