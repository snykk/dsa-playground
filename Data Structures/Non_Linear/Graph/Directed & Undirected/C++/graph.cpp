#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <stack>
#include <algorithm>
using namespace std;

class Graph {
private:
    bool directed;
    unordered_map<int, vector<int>> adjacency_list;
    unordered_set<int> vertices;

public:
    Graph(bool directed = false) : directed(directed) {}

    void add_vertex(int vertex) {
        if (vertices.find(vertex) == vertices.end()) {
            vertices.insert(vertex);
            adjacency_list[vertex] = vector<int>();
        }
    }

    void add_edge(int from_vertex, int to_vertex) {
        add_vertex(from_vertex);
        add_vertex(to_vertex);

        // Check if edge already exists
        vector<int>& neighbors = adjacency_list[from_vertex];
        if (find(neighbors.begin(), neighbors.end(), to_vertex) == neighbors.end()) {
            neighbors.push_back(to_vertex);
        }

        // For undirected graph, add reverse edge
        if (!directed) {
            vector<int>& reverse_neighbors = adjacency_list[to_vertex];
            if (find(reverse_neighbors.begin(), reverse_neighbors.end(), from_vertex) == reverse_neighbors.end()) {
                reverse_neighbors.push_back(from_vertex);
            }
        }
    }

    void remove_edge(int from_vertex, int to_vertex) {
        if (adjacency_list.find(from_vertex) != adjacency_list.end()) {
            vector<int>& neighbors = adjacency_list[from_vertex];
            neighbors.erase(remove(neighbors.begin(), neighbors.end(), to_vertex), neighbors.end());
        }

        // For undirected graph, remove reverse edge
        if (!directed) {
            if (adjacency_list.find(to_vertex) != adjacency_list.end()) {
                vector<int>& reverse_neighbors = adjacency_list[to_vertex];
                reverse_neighbors.erase(remove(reverse_neighbors.begin(), reverse_neighbors.end(), from_vertex), reverse_neighbors.end());
            }
        }
    }

    bool has_edge(int from_vertex, int to_vertex) {
        if (adjacency_list.find(from_vertex) == adjacency_list.end()) {
            return false;
        }
        vector<int>& neighbors = adjacency_list[from_vertex];
        return find(neighbors.begin(), neighbors.end(), to_vertex) != neighbors.end();
    }

    vector<int> get_neighbors(int vertex) {
        if (adjacency_list.find(vertex) == adjacency_list.end()) {
            return vector<int>();
        }
        return adjacency_list[vertex];
    }

    unordered_set<int> get_vertices() {
        return vertices;
    }

    vector<pair<int, int>> get_edges() {
        vector<pair<int, int>> edges;
        unordered_set<string> visited_edges;

        for (auto& pair : adjacency_list) {
            int from_vertex = pair.first;
            for (int to_vertex : pair.second) {
                if (!directed) {
                    // For undirected, avoid duplicate edges
                    string edge_key = to_string(min(from_vertex, to_vertex)) + "-" + to_string(max(from_vertex, to_vertex));
                    if (visited_edges.find(edge_key) == visited_edges.end()) {
                        edges.push_back({from_vertex, to_vertex});
                        visited_edges.insert(edge_key);
                    }
                } else {
                    edges.push_back({from_vertex, to_vertex});
                }
            }
        }

        return edges;
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

                for (int neighbor : adjacency_list[vertex]) {
                    if (visited.find(neighbor) == visited.end()) {
                        q.push(neighbor);
                    }
                }
            }
        }

        return result;
    }

    vector<int> dfs(int start_vertex) {
        if (vertices.find(start_vertex) == vertices.end()) {
            return vector<int>();
        }

        unordered_set<int> visited;
        stack<int> s;
        vector<int> result;

        s.push(start_vertex);

        while (!s.empty()) {
            int vertex = s.top();
            s.pop();

            if (visited.find(vertex) == visited.end()) {
                visited.insert(vertex);
                result.push_back(vertex);

                // Add neighbors in reverse order
                vector<int> neighbors = adjacency_list[vertex];
                reverse(neighbors.begin(), neighbors.end());
                for (int neighbor : neighbors) {
                    if (visited.find(neighbor) == visited.end()) {
                        s.push(neighbor);
                    }
                }
            }
        }

        return result;
    }

    bool is_connected() {
        if (directed) {
            throw invalid_argument("is_connected() is only for undirected graphs");
        }

        if (vertices.empty()) {
            return true;
        }

        int start = *vertices.begin();
        vector<int> visited_vertices = bfs(start);
        return visited_vertices.size() == vertices.size();
    }

    int get_degree(int vertex) {
        if (adjacency_list.find(vertex) == adjacency_list.end()) {
            return 0;
        }

        int degree = adjacency_list[vertex].size();

        if (directed) {
            // Count in-degree
            int in_degree = 0;
            for (auto& pair : adjacency_list) {
                for (int v : pair.second) {
                    if (v == vertex) {
                        in_degree++;
                    }
                }
            }
            return degree + in_degree;
        }

        return degree;
    }
};

