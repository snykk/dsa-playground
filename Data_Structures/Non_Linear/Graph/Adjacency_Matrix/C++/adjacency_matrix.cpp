#include <vector>
#include <queue>
#include <stack>
#include <limits>
#include <algorithm>
using namespace std;

class AdjacencyMatrix {
private:
    int num_vertices;
    bool directed;
    bool weighted;
    vector<vector<double>> matrix;
    // present[i][j] tells whether the edge exists, so any weight (0, negative, huge) is a valid weight.
    vector<vector<bool>> present;
    static constexpr double NO_EDGE = numeric_limits<double>::infinity();

    void set_cell(int u, int v, double weight) {
        present[u][v] = true;
        matrix[u][v] = weighted ? weight : 1;
    }

    void clear_cell(int u, int v) {
        present[u][v] = false;
        matrix[u][v] = weighted ? (u == v ? 0 : NO_EDGE) : 0;
    }

public:
    AdjacencyMatrix(int num_vertices, bool directed = false, bool weighted = false)
        : num_vertices(num_vertices), directed(directed), weighted(weighted) {
        if (weighted) {
            matrix = vector<vector<double>>(num_vertices, vector<double>(num_vertices, NO_EDGE));
            for (int i = 0; i < num_vertices; i++) {
                matrix[i][i] = 0;
            }
        } else {
            matrix = vector<vector<double>>(num_vertices, vector<double>(num_vertices, 0));
        }
        present = vector<vector<bool>>(num_vertices, vector<bool>(num_vertices, false));
    }

    void add_edge(int from_vertex, int to_vertex, double weight = 1.0) {
        if (from_vertex < 0 || from_vertex >= num_vertices ||
            to_vertex < 0 || to_vertex >= num_vertices) {
            return;
        }

        set_cell(from_vertex, to_vertex, weight);
        if (!directed) {
            set_cell(to_vertex, from_vertex, weight);
        }
    }

    void remove_edge(int from_vertex, int to_vertex) {
        if (from_vertex < 0 || from_vertex >= num_vertices ||
            to_vertex < 0 || to_vertex >= num_vertices) {
            return;
        }

        clear_cell(from_vertex, to_vertex);
        if (!directed) {
            clear_cell(to_vertex, from_vertex);
        }
    }

    bool has_edge(int from_vertex, int to_vertex) {
        if (from_vertex < 0 || from_vertex >= num_vertices ||
            to_vertex < 0 || to_vertex >= num_vertices) {
            return false;
        }

        return present[from_vertex][to_vertex];
    }

    double get_weight(int from_vertex, int to_vertex) {
        if (!weighted) {
            return -1.0;
        }
        if (from_vertex < 0 || from_vertex >= num_vertices ||
            to_vertex < 0 || to_vertex >= num_vertices) {
            return -1.0;
        }
        if (!present[from_vertex][to_vertex]) {
            return -1.0;
        }
        return matrix[from_vertex][to_vertex];
    }

    // Unambiguous weight lookup: returns false when the edge is absent or the graph is
    // unweighted. Prefer it over get_weight, whose -1.0 is also a legal weight.
    bool try_get_weight(int from_vertex, int to_vertex, double& out) {
        if (!weighted || !has_edge(from_vertex, to_vertex)) {
            return false;
        }
        out = matrix[from_vertex][to_vertex];
        return true;
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

