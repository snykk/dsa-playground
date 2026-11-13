#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <stack>
#include <algorithm>
#include <climits>
#include <string>
using namespace std;

class WeightedGraph {
private:
    bool directed;
    unordered_map<int, vector<pair<int, double>>> adjacency_list;
    unordered_set<int> vertices;

public:
    WeightedGraph(bool directed = false) : directed(directed) {}

    void add_vertex(int vertex) {
        if (vertices.find(vertex) == vertices.end()) {
            vertices.insert(vertex);
            adjacency_list[vertex] = vector<pair<int, double>>();
        }
    }

    void add_edge(int from_vertex, int to_vertex, double weight = 1.0) {
        add_vertex(from_vertex);
        add_vertex(to_vertex);

        // Replace an existing edge in this direction only
        remove_one_way(from_vertex, to_vertex);

        adjacency_list[from_vertex].push_back({to_vertex, weight});

        if (!directed) {
            remove_one_way(to_vertex, from_vertex);
            adjacency_list[to_vertex].push_back({from_vertex, weight});
        }
    }

    // Removes from -> to and, on an undirected graph, to -> from as well.
    void remove_edge(int from_vertex, int to_vertex) {
        remove_one_way(from_vertex, to_vertex);
        if (!directed) {
            remove_one_way(to_vertex, from_vertex);
        }
    }

private:
    void remove_one_way(int from_vertex, int to_vertex) {
        if (adjacency_list.find(from_vertex) != adjacency_list.end()) {
            vector<pair<int, double>>& neighbors = adjacency_list[from_vertex];
            neighbors.erase(
                remove_if(neighbors.begin(), neighbors.end(),
                    [to_vertex](const pair<int, double>& p) { return p.first == to_vertex; }),
                neighbors.end()
            );
        }
    }

public:
    bool has_edge(int from_vertex, int to_vertex) {
        if (adjacency_list.find(from_vertex) == adjacency_list.end()) {
            return false;
        }
        for (const auto& pair : adjacency_list[from_vertex]) {
            if (pair.first == to_vertex) {
                return true;
            }
        }
        return false;
    }

    double get_weight(int from_vertex, int to_vertex) {
        if (adjacency_list.find(from_vertex) == adjacency_list.end()) {
            return -1.0;  // Indicates edge doesn't exist
        }
        for (const auto& pair : adjacency_list[from_vertex]) {
            if (pair.first == to_vertex) {
                return pair.second;
            }
        }
        return -1.0;
    }

    vector<int> get_neighbors(int vertex) {
        vector<int> neighbors;
        if (adjacency_list.find(vertex) != adjacency_list.end()) {
            for (const auto& pair : adjacency_list[vertex]) {
                neighbors.push_back(pair.first);
            }
        }
        return neighbors;
    }

    vector<int> bfs(int start_vertex) {
        if (vertices.find(start_vertex) == vertices.end()) {
            return vector<int>();
        }

        unordered_set<int> visited;
        queue<int> q;
        vector<int> result;

        q.push(start_vertex);

        while (!q.empty()) {
            int vertex = q.front();
            q.pop();

            if (visited.find(vertex) == visited.end()) {
                visited.insert(vertex);
                result.push_back(vertex);

                for (const auto& pair : adjacency_list[vertex]) {
                    int neighbor = pair.first;
                    if (visited.find(neighbor) == visited.end()) {
                        q.push(neighbor);
                    }
                }
            }
        }

        return result;
    }

    double get_total_weight() {
        double total = 0.0;
        unordered_set<string> visited_edges;

        for (const auto& pair : adjacency_list) {
            int from_vertex = pair.first;
            for (const auto& edge : pair.second) {
                int to_vertex = edge.first;
                double weight = edge.second;

                if (!directed) {
                    string edge_key = to_string(min(from_vertex, to_vertex)) + "-" + to_string(max(from_vertex, to_vertex));
                    if (visited_edges.find(edge_key) == visited_edges.end()) {
                        total += weight;
                        visited_edges.insert(edge_key);
                    }
                } else {
                    total += weight;
                }
            }
        }

        return total;
    }
};

