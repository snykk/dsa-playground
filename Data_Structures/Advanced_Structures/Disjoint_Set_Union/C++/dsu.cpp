/**
 * Disjoint Set Union (DSU) Data Structure (C++)
 *
 * Standalone DSU focused on the data-structure perspective: core operations,
 * path compression, union by rank, component counting and enumeration.
 *
 * Also includes the graph-algorithm view: connected components, cycle
 * detection in an undirected graph and Kruskal's MST.
 */

#include <vector>
#include <stdexcept>
#include <algorithm>
#include <array>
#include <numeric>
#include <unordered_map>

class DSU {
private:
    std::vector<int> parent;
    std::vector<int> rnk;   // "rnk" to avoid conflict with std::rank
    std::vector<int> sz;
    int componentCount;

    static int checkedSize(int n) {
        if (n < 0) throw std::invalid_argument("n must be non-negative");
        return n;
    }

public:
    /**
     * Initialize n singleton sets {0}, {1}, ..., {n-1}.
     * Time:  O(n)
     * Space: O(n)
     */
    explicit DSU(int n) : parent(checkedSize(n)), rnk(n, 0), sz(n, 1), componentCount(n) {
        std::iota(parent.begin(), parent.end(), 0);
    }

    /**
     * Return the representative (root) of the set containing x.
     * Uses path compression.
     * Time: O(alpha(n)) amortized
     */
    int find(int x) {
        if (x < 0 || x >= (int)parent.size()) {
            throw std::out_of_range("element out of range");
        }
        if (parent[x] != x) {
            parent[x] = find(parent[x]);
        }
        return parent[x];
    }

    /**
     * Merge the sets containing x and y using union by rank.
     * Returns true if a merge occurred, false if already in the same set.
     * Time: O(alpha(n)) amortized
     */
    bool unite(int x, int y) {
        int rootX = find(x);
        int rootY = find(y);

        if (rootX == rootY) {
            return false;
        }

        if (rnk[rootX] < rnk[rootY]) {
            parent[rootX] = rootY;
            sz[rootY] += sz[rootX];
        } else if (rnk[rootX] > rnk[rootY]) {
            parent[rootY] = rootX;
            sz[rootX] += sz[rootY];
        } else {
            parent[rootY] = rootX;
            sz[rootX] += sz[rootY];
            rnk[rootX]++;
        }

        componentCount--;
        return true;
    }

    /**
     * Check whether x and y belong to the same set.
     * Time: O(alpha(n)) amortized
     */
    bool connected(int x, int y) {
        return find(x) == find(y);
    }

    /**
     * Return the current number of disjoint sets.
     * Time: O(1)
     */
    int getComponentCount() const {
        return componentCount;
    }

    /** Alias of getComponentCount. */
    int getCount() const {
        return componentCount;
    }

    /**
     * Return a mapping from each root to the list of elements in its set.
     * Time: O(n)
     */
    std::unordered_map<int, std::vector<int>> getComponents() {
        std::unordered_map<int, std::vector<int>> components;
        for (int i = 0; i < (int)parent.size(); i++) {
            components[find(i)].push_back(i);
        }
        return components;
    }

    /**
     * Return the size of the set containing x.
     * Time: O(alpha(n)) amortized
     */
    int getSize(int x) {
        return sz[find(x)];
    }

    /**
     * Return direct parent of x (for testing path compression).
     */
    int getParent(int x) const {
        return parent[x];
    }
};

using UnionFind = DSU;

/**
 * Connected components of an undirected graph on vertices 0..n-1.
 * Time: O(E alpha(n) + n)
 */
std::vector<std::vector<int>> connectedComponents(const std::vector<std::pair<int, int>>& edges, int n) {
    DSU dsu(n);
    for (const auto& e : edges) dsu.unite(e.first, e.second);
    std::vector<std::vector<int>> result;
    for (auto& kv : dsu.getComponents()) result.push_back(kv.second);
    return result;
}

/**
 * True if the undirected graph has a cycle (self-loops and parallel edges count).
 * Time: O(E alpha(n))
 */
bool hasCycle(const std::vector<std::pair<int, int>>& edges, int n) {
    DSU dsu(n);
    for (const auto& e : edges) {
        if (!dsu.unite(e.first, e.second)) return true;
    }
    return false;
}

/**
 * Kruskal's minimum spanning forest; edges are {u, v, weight}.
 * Time: O(E log E + E alpha(n))
 */
std::vector<std::array<int, 3>> kruskalMST(std::vector<std::array<int, 3>> edges, int n) {
    std::sort(edges.begin(), edges.end(),
              [](const std::array<int, 3>& a, const std::array<int, 3>& b) { return a[2] < b[2]; });
    DSU dsu(n);
    std::vector<std::array<int, 3>> mst;
    for (const auto& e : edges) {
        if (dsu.unite(e[0], e[1])) mst.push_back(e);
    }
    return mst;
}
