// Tarjan's algorithm for bridges & articulation points in an undirected graph.
// Single O(V + E) DFS; uses edge-indexed parent tracking to handle parallel edges.

#ifndef TARJAN_BRIDGES_H
#define TARJAN_BRIDGES_H

#include <algorithm>
#include <set>
#include <utility>
#include <vector>

struct TarjanResult {
    std::vector<std::pair<int, int>> bridges;
    std::vector<int> articulations;
};

class TarjanBridges {
 public:
    TarjanBridges(int n, const std::vector<std::pair<int, int>>& edges)
        : n_(n), disc_(n, -1), low_(n, -1), timer_(0) {
        adj_.resize(n);
        for (int i = 0; i < static_cast<int>(edges.size()); ++i) {
            int u = edges[i].first, v = edges[i].second;
            adj_[u].push_back({v, i});
            adj_[v].push_back({u, i});
        }
    }

    TarjanResult compute() {
        std::set<std::pair<int, int>> bridge_set;
        std::set<int> ap_set;
        for (int i = 0; i < n_; ++i) {
            if (disc_[i] == -1) dfs(i, -1, bridge_set, ap_set);
        }
        TarjanResult result;
        result.bridges.assign(bridge_set.begin(), bridge_set.end());
        result.articulations.assign(ap_set.begin(), ap_set.end());
        return result;
    }

 private:
    void dfs(int u, int parent_edge,
             std::set<std::pair<int, int>>& bridges,
             std::set<int>& articulations) {
        disc_[u] = low_[u] = timer_++;
        int children = 0;
        for (auto& [v, eid] : adj_[u]) {
            if (eid == parent_edge) continue;
            if (disc_[v] == -1) {                 // tree edge
                ++children;
                dfs(v, eid, bridges, articulations);
                low_[u] = std::min(low_[u], low_[v]);
                if (low_[v] > disc_[u]) {
                    bridges.insert({std::min(u, v), std::max(u, v)});
                }
                if (parent_edge != -1 && low_[v] >= disc_[u]) {
                    articulations.insert(u);
                }
            } else {                              // back edge
                low_[u] = std::min(low_[u], disc_[v]);
            }
        }
        if (parent_edge == -1 && children > 1) {
            articulations.insert(u);
        }
    }

    int n_;
    std::vector<std::vector<std::pair<int, int>>> adj_;  // (neighbor, edge_id)
    std::vector<int> disc_, low_;
    int timer_;
};

#endif  // TARJAN_BRIDGES_H
