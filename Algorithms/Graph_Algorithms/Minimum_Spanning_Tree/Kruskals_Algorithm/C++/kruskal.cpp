/**
 * Kruskal's Algorithm Implementation (C++)
 * Time Complexity: O(E log E)
 */

#include <vector>
#include <algorithm>
#include <tuple>

class UnionFind {
private:
    std::vector<int> parent;
    std::vector<int> rank;
    
public:
    UnionFind(int n) : parent(n), rank(n, 0) {
        for (int i = 0; i < n; ++i) {
            parent[i] = i;
        }
    }
    
    int find(int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]);  // Path compression
        }
        return parent[x];
    }
    
    bool unionSets(int x, int y) {
        int rootX = find(x);
        int rootY = find(y);
        
        if (rootX == rootY) {
            return false;  // Already in same set
        }
        
        // Union by rank
        if (rank[rootX] < rank[rootY]) {
            parent[rootX] = rootY;
        } else if (rank[rootX] > rank[rootY]) {
            parent[rootY] = rootX;
        } else {
            parent[rootY] = rootX;
            rank[rootX]++;
        }
        return true;
    }
};

std::vector<std::tuple<int, int, int>> kruskalMST(
    std::vector<std::tuple<int, int, int>>& edges, int numVertices) {
    
    if (numVertices == 0) {
        return {};
    }
    
    // Sort edges by weight
    std::sort(edges.begin(), edges.end(),
              [](const auto& a, const auto& b) {
                  return std::get<2>(a) < std::get<2>(b);
              });
    
    UnionFind uf(numVertices);
    std::vector<std::tuple<int, int, int>> mst;
    
    for (const auto& edge : edges) {
        int u = std::get<0>(edge);
        int v = std::get<1>(edge);
        
        if (uf.unionSets(u, v)) {
            mst.push_back(edge);
            
            // MST has V-1 edges
            if (mst.size() == static_cast<size_t>(numVertices - 1)) {
                break;
            }
        }
    }
    
    return mst;
}
