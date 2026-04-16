/**
 * Disjoint Set Union (DSU) Data Structure (C++)
 *
 * Standalone DSU focused on the data-structure perspective: core operations,
 * path compression, union by rank, component counting and enumeration.
 *
 * For graph-algorithm applications see
 * Algorithms/Graph_Algorithms/Advanced_Graph/Union-Find_DSU/.
 */

#include <vector>
#include <numeric>
#include <unordered_map>

class DSU {
private:
    std::vector<int> parent;
    std::vector<int> rnk;   // "rnk" to avoid conflict with std::rank
    std::vector<int> sz;
    int componentCount;

public:
    /**
     * Initialize n singleton sets {0}, {1}, ..., {n-1}.
     * Time:  O(n)
     * Space: O(n)
     */
    DSU(int n) : parent(n), rnk(n, 0), sz(n, 1), componentCount(n) {
        std::iota(parent.begin(), parent.end(), 0);
    }

    /**
     * Return the representative (root) of the set containing x.
     * Uses path compression.
     * Time: O(alpha(n)) amortized
     */
    int find(int x) {
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
