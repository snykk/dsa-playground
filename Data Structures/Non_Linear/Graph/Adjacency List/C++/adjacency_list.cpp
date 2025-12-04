#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <stack>
#include <algorithm>
using namespace std;

class AdjacencyList {
private:
    bool directed;
    bool weighted;
    unordered_map<int, vector<int>> adjacency_list_unweighted;
    unordered_map<int, vector<pair<int, double>>> adjacency_list_weighted;
    unordered_set<int> vertices;

public:
    AdjacencyList(bool directed = false, bool weighted = false)
        : directed(directed), weighted(weighted) {}

    void add_vertex(int vertex) {
        if (vertices.find(vertex) == vertices.end()) {
            vertices.insert(vertex);
            if (weighted) {
                adjacency_list_weighted[vertex] = vector<pair<int, double>>();
            } else {
                adjacency_list_unweighted[vertex] = vector<int>();
            }
        }
    }

    void add_edge(int from_vertex, int to_vertex, double weight = 1.0) {
        add_vertex(from_vertex);
        add_vertex(to_vertex);

        remove_edge(from_vertex, to_vertex);

        if (weighted) {
            adjacency_list_weighted[from_vertex].push_back({to_vertex, weight});
        } else {
            if (find(adjacency_list_unweighted[from_vertex].begin(),
                    adjacency_list_unweighted[from_vertex].end(), to_vertex) ==
                adjacency_list_unweighted[from_vertex].end()) {
                adjacency_list_unweighted[from_vertex].push_back(to_vertex);
            }
        }

        if (!directed) {
            remove_edge(to_vertex, from_vertex);
            if (weighted) {
                adjacency_list_weighted[to_vertex].push_back({from_vertex, weight});
            } else {
                if (find(adjacency_list_unweighted[to_vertex].begin(),
                        adjacency_list_unweighted[to_vertex].end(), from_vertex) ==
                    adjacency_list_unweighted[to_vertex].end()) {
                    adjacency_list_unweighted[to_vertex].push_back(from_vertex);
                }
            }
        }
    }

    void remove_edge(int from_vertex, int to_vertex) {
        if (weighted) {
            if (adjacency_list_weighted.find(from_vertex) != adjacency_list_weighted.end()) {
                adjacency_list_weighted[from_vertex].erase(
                    remove_if(adjacency_list_weighted[from_vertex].begin(),
                             adjacency_list_weighted[from_vertex].end(),
                             [to_vertex](const pair<int, double>& p) { return p.first == to_vertex; }),
                    adjacency_list_weighted[from_vertex].end()
                );
            }
        } else {
            if (adjacency_list_unweighted.find(from_vertex) != adjacency_list_unweighted.end()) {
                adjacency_list_unweighted[from_vertex].erase(
                    remove(adjacency_list_unweighted[from_vertex].begin(),
                          adjacency_list_unweighted[from_vertex].end(), to_vertex),
                    adjacency_list_unweighted[from_vertex].end()
                );
            }
        }
    }

    bool has_edge(int from_vertex, int to_vertex) {
        if (weighted) {
            if (adjacency_list_weighted.find(from_vertex) == adjacency_list_weighted.end()) {
                return false;
            }
            for (const auto& pair : adjacency_list_weighted[from_vertex]) {
                if (pair.first == to_vertex) {
                    return true;
                }
            }
        } else {
            if (adjacency_list_unweighted.find(from_vertex) == adjacency_list_unweighted.end()) {
                return false;
            }
            return find(adjacency_list_unweighted[from_vertex].begin(),
                       adjacency_list_unweighted[from_vertex].end(), to_vertex) !=
                   adjacency_list_unweighted[from_vertex].end();
        }
        return false;
    }

    vector<int> get_neighbors(int vertex) {
        vector<int> neighbors;
        if (weighted) {
            if (adjacency_list_weighted.find(vertex) != adjacency_list_weighted.end()) {
                for (const auto& pair : adjacency_list_weighted[vertex]) {
                    neighbors.push_back(pair.first);
                }
            }
        } else {
            if (adjacency_list_unweighted.find(vertex) != adjacency_list_unweighted.end()) {
                return adjacency_list_unweighted[vertex];
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

        visited.insert(start_vertex);
        q.push(start_vertex);

        while (!q.empty()) {
            int vertex = q.front();
            q.pop();
            result.push_back(vertex);

            vector<int> neighbors = get_neighbors(vertex);
            for (int neighbor : neighbors) {
                if (visited.find(neighbor) == visited.end()) {
                    visited.insert(neighbor);
                    q.push(neighbor);
                }
            }
        }

        return result;
    }
};

