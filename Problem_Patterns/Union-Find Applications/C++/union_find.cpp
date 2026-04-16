/**
 * Union-Find (DSU) Implementation
 * 
 * Implements Disjoint Set Union with:
 * 1. Path Compression
 * 2. Union by Rank
 */

#include <vector>
#include <numeric>
#include <iostream>
#include <stdexcept>

class UnionFind {
private:
    std::vector<int> parent;
    std::vector<int> rank;
    int count;

public:
    // Initialization: O(n)
    UnionFind(int size) {
        if (size < 0) throw std::invalid_argument("Size cannot be negative");
        
        count = size;
        parent.resize(size);
        rank.resize(size, 1);
        
        // Initialize parent[i] = i
        std::iota(parent.begin(), parent.end(), 0);
    }

    // Find with Path Compression: O(α(n))
    int find(int x) {
        if (x < 0 || x >= static_cast<int>(parent.size())) {
            throw std::out_of_range("Element index out of bounds");
        }

        if (parent[x] != x) {
            parent[x] = find(parent[x]);
        }
        return parent[x];
    }

    // Union by Rank: O(α(n))
    bool unite(int x, int y) {
        int rootX = find(x);
        int rootY = find(y);

        if (rootX == rootY) {
            return false;
        }

        if (rank[rootX] > rank[rootY]) {
            parent[rootY] = rootX;
        } else if (rank[rootX] < rank[rootY]) {
            parent[rootX] = rootY;
        } else {
            parent[rootY] = rootX;
            rank[rootX]++;
        }

        count--;
        return true;
    }

    // Connected check
    bool connected(int x, int y) {
        return find(x) == find(y);
    }

    // Get number of disjoint sets
    int getCount() const {
        return count;
    }
};

#ifndef TESTING
int main() {
    std::cout << "=== Union-Find Example ===" << std::endl;
    
    int n = 5;
    UnionFind uf(n);
    std::cout << "Initial sets: " << uf.getCount() << std::endl;

    std::cout << "Union(0, 1)" << std::endl;
    uf.unite(0, 1);
    
    std::cout << "Union(2, 3)" << std::endl;
    uf.unite(2, 3);
    
    std::cout << "Union(0, 4)" << std::endl;
    uf.unite(0, 4);

    std::cout << "Sets count: " << uf.getCount() << std::endl;         // Expected: 2
    std::cout << "0 connected to 4? " << (uf.connected(0, 4) ? "Yes" : "No") << std::endl; // Yes
    std::cout << "0 connected to 3? " << (uf.connected(0, 3) ? "Yes" : "No") << std::endl; // No

    return 0;
}
#endif
