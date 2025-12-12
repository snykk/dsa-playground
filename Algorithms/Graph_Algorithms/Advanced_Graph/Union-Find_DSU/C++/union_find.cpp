/**
 * Union-Find (Disjoint Set Union - DSU) Implementation (C++)
 */

#include <vector>
#include <numeric>

class UnionFind {
private:
    std::vector<int> parent;
    std::vector<int> rank;
    int count;

public:
    UnionFind(int n) : parent(n), rank(n, 0), count(n) {
        std::iota(parent.begin(), parent.end(), 0);
    }
    
    int find(int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]);  // Path compression
        }
        return parent[x];
    }
    
    bool unite(int x, int y) {
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
        
        count--;
        return true;
    }
    
    bool connected(int x, int y) {
        return find(x) == find(y);
    }
    
    int getCount() const {
        return count;
    }
};

bool unionFindCycleDetection(const std::vector<std::pair<int, int>>& edges, int n) {
    UnionFind uf(n);
    
    for (const auto& edge : edges) {
        if (!uf.unite(edge.first, edge.second)) {
            return true;  // Cycle detected
        }
    }
    
    return false;
}

// Example usage (uncomment to use)
/*
#include <iostream>
int main() {
    std::cout << "Union-Find Example:" << std::endl;
    
    UnionFind uf(5);
    std::cout << "Initial count: " << uf.getCount() << std::endl;  // 5
    
    uf.unite(0, 1);
    std::cout << "After union(0,1): count=" << uf.getCount() 
              << ", connected(0,1)=" << (uf.connected(0, 1) ? "true" : "false") << std::endl;
    
    uf.unite(2, 3);
    std::cout << "After union(2,3): count=" << uf.getCount() << std::endl;
    
    uf.unite(1, 2);
    std::cout << "After union(1,2): count=" << uf.getCount() 
              << ", connected(0,3)=" << (uf.connected(0, 3) ? "true" : "false") << std::endl;
    
    // Cycle detection
    std::cout << "\nCycle Detection Example:" << std::endl;
    std::vector<std::pair<int, int>> edges = {{0, 1}, {1, 2}, {2, 0}};
    bool hasCycle = unionFindCycleDetection(edges, 3);
    std::cout << "Graph with cycle: " << (hasCycle ? "true" : "false") << std::endl;
    
    return 0;
}
*/

