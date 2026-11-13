#include <vector>
#include <unordered_set>
#include <queue>
#include <stack>
#include <tuple>
#include <string>
#include <algorithm>
using namespace std;

class EdgeList {
private:
    bool directed;
    bool weighted;
    vector<tuple<int, int, double>> edges;  // For weighted: (from, to, weight)
    vector<pair<int, int>> edges_unweighted;  // For unweighted: (from, to)
    unordered_set<int> vertices;

    void remove_edge_from_list(int from_vertex, int to_vertex) {
        if (weighted) {
            edges.erase(
                remove_if(edges.begin(), edges.end(),
                    [from_vertex, to_vertex](const tuple<int, int, double>& e) {
                        return get<0>(e) == from_vertex && get<1>(e) == to_vertex;
                    }),
                edges.end()
            );
        } else {
            edges_unweighted.erase(
                remove_if(edges_unweighted.begin(), edges_unweighted.end(),
                    [from_vertex, to_vertex](const pair<int, int>& e) {
                        return e.first == from_vertex && e.second == to_vertex;
                    }),
                edges_unweighted.end()
            );
        }
    }

public:
    EdgeList(bool directed = false, bool weighted = false) 
        : directed(directed), weighted(weighted) {}

    void add_edge(int from_vertex, int to_vertex, double weight = 1.0) {
        vertices.insert(from_vertex);
        vertices.insert(to_vertex);

        remove_edge(from_vertex, to_vertex);

        if (weighted) {
            edges.push_back({from_vertex, to_vertex, weight});
        } else {
            edges_unweighted.push_back({from_vertex, to_vertex});
        }

        if (!directed) {
            remove_edge_from_list(to_vertex, from_vertex);
            if (weighted) {
                edges.push_back({to_vertex, from_vertex, weight});
            } else {
                edges_unweighted.push_back({to_vertex, from_vertex});
            }
        }
    }

    void remove_edge(int from_vertex, int to_vertex) {
        remove_edge_from_list(from_vertex, to_vertex);
        if (!directed) {
            remove_edge_from_list(to_vertex, from_vertex);
        }
    }

    bool has_edge(int from_vertex, int to_vertex) {
        if (weighted) {
            for (const auto& e : edges) {
                if (get<0>(e) == from_vertex && get<1>(e) == to_vertex) {
                    return true;
                }
            }
        } else {
            for (const auto& e : edges_unweighted) {
                if (e.first == from_vertex && e.second == to_vertex) {
                    return true;
                }
            }
        }
        return false;
    }

    double get_weight(int from_vertex, int to_vertex) {
        if (!weighted) {
            return -1.0;  // Not a weighted graph
        }
        for (const auto& e : edges) {
            if (get<0>(e) == from_vertex && get<1>(e) == to_vertex) {
                return get<2>(e);
            }
        }
        return -1.0;  // Edge doesn't exist
    }

    vector<int> get_neighbors(int vertex) {
        vector<int> neighbors;
        unordered_set<int> seen;

        if (weighted) {
            for (const auto& e : edges) {
                if (get<0>(e) == vertex && seen.find(get<1>(e)) == seen.end()) {
                    neighbors.push_back(get<1>(e));
                    seen.insert(get<1>(e));
                }
            }
        } else {
            for (const auto& e : edges_unweighted) {
                if (e.first == vertex && seen.find(e.second) == seen.end()) {
                    neighbors.push_back(e.second);
                    seen.insert(e.second);
                }
            }
        }

        return neighbors;
    }

    int get_edge_count() {
        if (directed) {
            return weighted ? edges.size() : edges_unweighted.size();
        }
        // An undirected edge u-v is stored twice, but a self-loop u-u only once.
        int stored = 0;
        int loops = 0;
        if (weighted) {
            stored = edges.size();
            for (const auto& e : edges) {
                if (get<0>(e) == get<1>(e)) loops++;
            }
        } else {
            stored = edges_unweighted.size();
            for (const auto& e : edges_unweighted) {
                if (e.first == e.second) loops++;
            }
        }
        return (stored - loops) / 2 + loops;
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

                vector<int> neighbors = get_neighbors(vertex);
                for (int neighbor : neighbors) {
                    if (visited.find(neighbor) == visited.end()) {
                        q.push(neighbor);
                    }
                }
            }
        }

        return result;
    }
};

