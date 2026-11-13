// Tarjan's algorithm for bridges & articulation points in an undirected graph.
// Single O(V + E) DFS (iterative, with an explicit stack); uses edge-indexed
// parent tracking to handle parallel edges.

#ifndef TARJAN_BRIDGES_H
#define TARJAN_BRIDGES_H

#include <algorithm>
#include <cstddef>
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
            if (disc_[i] == -1) dfs(i, bridge_set, ap_set);
        }
        TarjanResult result;
        result.bridges.assign(bridge_set.begin(), bridge_set.end());
        result.articulations.assign(ap_set.begin(), ap_set.end());
        return result;
    }

 private:
    // One frame per active call of the recursive formulation dfs(u, parent_edge).
    struct Frame {
        int u;
        int parent_edge;
        std::size_t next;  // next index into adj_[u]
        int children;      // DFS-tree children found so far
    };

    // Iterative DFS from root with an explicit stack of frames, so a long path
    // (10^5+ vertices) cannot overflow the call stack.
    void dfs(int root,
             std::set<std::pair<int, int>>& bridges,
             std::set<int>& articulations) {
        disc_[root] = low_[root] = timer_++;
        std::vector<Frame> stack{{root, -1, 0, 0}};
        while (!stack.empty()) {
            Frame& f = stack.back();
            if (f.next < adj_[f.u].size()) {
                auto [v, eid] = adj_[f.u][f.next++];
                if (eid == f.parent_edge) continue;   // the edge we came in on
                if (disc_[v] == -1) {                 // tree edge: descend into v
                    ++f.children;
                    disc_[v] = low_[v] = timer_++;
                    stack.push_back({v, eid, 0, 0});  // f is invalid from here on
                } else {                              // back edge
                    low_[f.u] = std::min(low_[f.u], disc_[v]);
                }
                continue;
            }
            // f.u is finished: return to its parent, as after a recursive call
            const Frame done = f;
            stack.pop_back();
            if (!stack.empty()) {
                const Frame& p = stack.back();
                low_[p.u] = std::min(low_[p.u], low_[done.u]);
                if (low_[done.u] > disc_[p.u]) {
                    bridges.insert({std::min(p.u, done.u), std::max(p.u, done.u)});
                }
                if (p.parent_edge != -1 && low_[done.u] >= disc_[p.u]) {
                    articulations.insert(p.u);
                }
            } else if (done.children > 1) {           // root with >= 2 children
                articulations.insert(done.u);
            }
        }
    }

    int n_;
    std::vector<std::vector<std::pair<int, int>>> adj_;  // (neighbor, edge_id)
    std::vector<int> disc_, low_;
    int timer_;
};

#endif  // TARJAN_BRIDGES_H
