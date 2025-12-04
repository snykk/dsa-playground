#include <vector>
#include <queue>
#include <stack>
#include <climits>
#include <algorithm>
using namespace std;

class AdjacencyMatrix {
private:
    int num_vertices;
    bool directed;
    bool weighted;
    vector<vector<double>> matrix;

public:
    AdjacencyMatrix(int num_vertices, bool directed = false, bool weighted = false)
        : num_vertices(num_vertices), directed(directed), weighted(weighted) {
        if (weighted) {
            matrix = vector<vector<double>>(num_vertices, vector<double>(num_vertices, INT_MAX));
            for (int i = 0; i < num_vertices; i++) {
                matrix[i][i] = 0;
            }
        } else {
            matrix = vector<vector<double>>(num_vertices, vector<double>(num_vertices, 0));
        }
    }

    void add_edge(int from_vertex, int to_vertex, double weight = 1.0) {
        if (from_vertex < 0 || from_vertex >= num_vertices ||
            to_vertex < 0 || to_vertex >= num_vertices) {
            return;
        }

        if (weighted) {
            matrix[from_vertex][to_vertex] = weight;
        } else {
            matrix[from_vertex][to_vertex] = 1;
        }

        if (!directed) {
            if (weighted) {
                matrix[to_vertex][from_vertex] = weight;
            } else {
                matrix[to_vertex][from_vertex] = 1;
            }
        }
    }

    void remove_edge(int from_vertex, int to_vertex) {
        if (from_vertex < 0 || from_vertex >= num_vertices ||
            to_vertex < 0 || to_vertex >= num_vertices) {
            return;
        }

        if (weighted) {
            matrix[from_vertex][to_vertex] = INT_MAX;
        } else {
            matrix[from_vertex][to_vertex] = 0;
        }

        if (!directed) {
            if (weighted) {
                matrix[to_vertex][from_vertex] = INT_MAX;
            } else {
                matrix[to_vertex][from_vertex] = 0;
            }
        }
    }

    bool has_edge(int from_vertex, int to_vertex) {
        if (from_vertex < 0 || from_vertex >= num_vertices ||
            to_vertex < 0 || to_vertex >= num_vertices) {
            return false;
        }

        if (weighted) {
            return matrix[from_vertex][to_vertex] != INT_MAX && 
                   matrix[from_vertex][to_vertex] != 0;
        } else {
            return matrix[from_vertex][to_vertex] == 1;
        }
    }

    double get_weight(int from_vertex, int to_vertex) {
        if (!weighted) {
            return -1.0;
        }
        if (from_vertex < 0 || from_vertex >= num_vertices ||
            to_vertex < 0 || to_vertex >= num_vertices) {
            return -1.0;
        }
        double weight = matrix[from_vertex][to_vertex];
        if (weight == INT_MAX || weight == 0) {
            return -1.0;
        }
        return weight;
    }

    vector<int> get_neighbors(int vertex) {
        vector<int> neighbors;
        if (vertex < 0 || vertex >= num_vertices) {
            return neighbors;
        }

        for (int i = 0; i < num_vertices; i++) {
            if (has_edge(vertex, i)) {
                neighbors.push_back(i);
            }
        }
        return neighbors;
    }

    vector<int> bfs(int start_vertex) {
        if (start_vertex < 0 || start_vertex >= num_vertices) {
            return vector<int>();
        }

        vector<bool> visited(num_vertices, false);
        queue<int> q;
        vector<int> result;

        visited[start_vertex] = true;
        q.push(start_vertex);

        while (!q.empty()) {
            int vertex = q.front();
            q.pop();
            result.push_back(vertex);

            vector<int> neighbors = get_neighbors(vertex);
            for (int neighbor : neighbors) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    q.push(neighbor);
                }
            }
        }

        return result;
    }

    vector<int> dfs(int start_vertex) {
        if (start_vertex < 0 || start_vertex >= num_vertices) {
            return vector<int>();
        }

        vector<bool> visited(num_vertices, false);
        stack<int> s;
        vector<int> result;

        s.push(start_vertex);

        while (!s.empty()) {
            int vertex = s.top();
            s.pop();

            if (!visited[vertex]) {
                visited[vertex] = true;
                result.push_back(vertex);

                vector<int> neighbors = get_neighbors(vertex);
                reverse(neighbors.begin(), neighbors.end());
                for (int neighbor : neighbors) {
                    if (!visited[neighbor]) {
                        s.push(neighbor);
                    }
                }
            }
        }

        return result;
    }
};

