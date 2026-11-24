/*
 * Lowest Common Ancestor (LCA)
 *
 * The lowest common ancestor of u and v in a rooted tree is the deepest node that has both
 * u and v in its subtree (a node is in its own subtree). Two classes answer many queries on
 * one fixed tree, given as n, a list of n - 1 edges on the nodes 0..n-1, and a root:
 *
 * - BinaryLiftingLCA: up[k][v] is the 2^k-th ancestor of v. O(n log n) to build, O(log n)
 *   per lca, distance or kthAncestor.
 * - EulerTourLCA: the Euler tour of a depth-first walk and a sparse table of the shallowest
 *   node over every power-of-two window of it. O(n log n) to build, O(1) per lca.
 *
 * Every walk over the tree is a loop with an explicit queue or stack, never recursion, so a
 * path of 10^5 nodes cannot overflow the call stack.
 */
#include <iostream>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

/** A tree hung from its root: adj in edge order, parent (-1 for the root) and depth. */
struct RootedTree {
    std::vector<std::vector<int>> adj;
    std::vector<int> parent;
    std::vector<int> depth;
};

/**
 * Checks that the edges form one tree on 0..n-1 and hangs it from root, breadth-first.
 * Throws std::invalid_argument for n < 1, a root or an endpoint outside 0..n-1, a number of
 * edges other than n - 1, or edges that do not reach every node from the root (with n - 1
 * edges, that means a cycle, a repeated edge or a loop, and the rest is a forest).
 */
RootedTree rootedTree(int n, const std::vector<std::pair<int, int>>& edges, int root) {
    if (n < 1) throw std::invalid_argument("a tree needs at least one node");
    if (root < 0 || root >= n) throw std::invalid_argument("root " + std::to_string(root) + " is not a node");
    if (static_cast<long long>(edges.size()) != n - 1LL) {
        throw std::invalid_argument("a tree on " + std::to_string(n) + " nodes has " + std::to_string(n - 1) + " edges");
    }
    RootedTree t;
    t.adj.assign(n, {});
    for (const auto& [u, v] : edges) {
        if (u < 0 || u >= n || v < 0 || v >= n) throw std::invalid_argument("an edge has an endpoint outside 0..n-1");
        t.adj[u].push_back(v);
        t.adj[v].push_back(u);
    }
    t.parent.assign(n, -1);
    t.depth.assign(n, 0);
    std::vector<bool> seen(n, false);
    seen[root] = true;
    std::vector<int> queue{root};
    for (std::size_t head = 0; head < queue.size(); ++head) {
        int u = queue[head];
        for (int v : t.adj[u]) {
            if (!seen[v]) {
                seen[v] = true;
                t.parent[v] = u;
                t.depth[v] = t.depth[u] + 1;
                queue.push_back(v);
            }
        }
    }
    if (static_cast<int>(queue.size()) != n) throw std::invalid_argument("the edges do not connect every node: not a tree");
    return t;
}

/** floor(log2 n) + 1 for n >= 1, with integers. */
inline int bitLength(int n) {
    int bits = 0;
    while (n > 0) {
        ++bits;
        n >>= 1;
    }
    return bits;
}

/**
 * LCA by binary lifting. The root is its own parent (up[k][root] == root for every k), so a
 * jump that would leave the tree stops at the root and the table needs no -1 checks.
 */
class BinaryLiftingLCA {
public:
    BinaryLiftingLCA(int n, const std::vector<std::pair<int, int>>& edges, int root = 0) : n_(n) {
        RootedTree t = rootedTree(n, edges, root);
        parent_ = std::move(t.parent);
        depth_ = std::move(t.depth);
        // floor(log2 n) + 1 levels: jumps 1, 2, ..., 2^(levels-1) add up to at least n - 1.
        levels_ = bitLength(n);
        up_.assign(levels_, std::vector<int>(n));
        for (int v = 0; v < n; ++v) up_[0][v] = parent_[v] == -1 ? root : parent_[v];
        for (int k = 1; k < levels_; ++k) {
            // Two jumps of 2^(k-1) make one jump of 2^k.
            for (int v = 0; v < n; ++v) up_[k][v] = up_[k - 1][up_[k - 1][v]];
        }
    }

    /** The ancestor k levels above v (v for k = 0), or -1 when k > depth(v). */
    int kthAncestor(int v, int k) const {
        check(v);
        if (k < 0) throw std::invalid_argument("k must be at least 0");
        if (k > depth_[v]) return -1;
        for (int level = 0; k > 0; ++level, k >>= 1) {
            if (k & 1) v = up_[level][v];
        }
        return v;
    }

    /** Lift the deeper node to the other's depth, then lift both while their ancestors differ. */
    int lca(int u, int v) const {
        check(u);
        check(v);
        if (depth_[u] < depth_[v]) std::swap(u, v);
        u = kthAncestor(u, depth_[u] - depth_[v]);
        if (u == v) return u;
        for (int k = levels_ - 1; k >= 0; --k) {
            if (up_[k][u] != up_[k][v]) {
                u = up_[k][u];
                v = up_[k][v];
            }
        }
        return up_[0][u];
    }

    /** Number of edges on the path from u to v. */
    int distance(int u, int v) const {
        int w = lca(u, v);
        return depth_[u] + depth_[v] - 2 * depth_[w];
    }

    int levels() const { return levels_; }
    const std::vector<int>& depth() const { return depth_; }
    const std::vector<int>& parent() const { return parent_; }
    /** up()[k][v] is the 2^k-th ancestor of v. */
    const std::vector<std::vector<int>>& up() const { return up_; }

private:
    int n_;
    int levels_ = 0;
    std::vector<int> parent_, depth_;
    std::vector<std::vector<int>> up_;

    void check(int v) const {
        if (v < 0 || v >= n_) throw std::out_of_range("node " + std::to_string(v) + " is not in the tree");
    }
};

/**
 * LCA by an Euler tour and a sparse table. Between first(u) and first(v) the walk stays in the
 * subtree of lca(u, v) and passes through it, so the LCA is the shallowest node of that range.
 */
class EulerTourLCA {
public:
    EulerTourLCA(int n, const std::vector<std::pair<int, int>>& edges, int root = 0) : n_(n) {
        RootedTree t = rootedTree(n, edges, root);
        parent_ = std::move(t.parent);
        depth_ = std::move(t.depth);
        euler_.push_back(root);
        first_.assign(n, -1);
        first_[root] = 0;
        // Children in adjacency order; next[u] is the next neighbour of u to try.
        std::vector<std::size_t> next(n, 0);
        std::vector<int> stack{root};
        while (!stack.empty()) {
            int u = stack.back();
            if (next[u] < t.adj[u].size()) {
                int v = t.adj[u][next[u]++];
                if (v != parent_[u]) {
                    first_[v] = static_cast<int>(euler_.size());
                    euler_.push_back(v);
                    stack.push_back(v);
                }
            } else {
                stack.pop_back();
                // Back in the parent after the whole subtree of u.
                if (!stack.empty()) euler_.push_back(stack.back());
            }
        }
        // sparse_[k][i] is the shallowest node of euler[i .. i + 2^k - 1].
        int m = static_cast<int>(euler_.size());
        sparse_.push_back(euler_);
        for (int k = 1; (1 << k) <= m; ++k) {
            const std::vector<int>& prev = sparse_[k - 1];
            int half = 1 << (k - 1);
            std::vector<int> row(m - (1 << k) + 1);
            for (int i = 0; i < static_cast<int>(row.size()); ++i) row[i] = shallower(prev[i], prev[i + half]);
            sparse_.push_back(std::move(row));
        }
    }

    /** The shallowest node of euler[first(u) .. first(v)], from two overlapping windows: O(1). */
    int lca(int u, int v) const {
        check(u);
        check(v);
        int left = first_[u], right = first_[v];
        if (left > right) std::swap(left, right);
        int k = bitLength(right - left + 1) - 1;
        return shallower(sparse_[k][left], sparse_[k][right - (1 << k) + 1]);
    }

    /** Number of edges on the path from u to v. */
    int distance(int u, int v) const {
        int w = lca(u, v);
        return depth_[u] + depth_[v] - 2 * depth_[w];
    }

    const std::vector<int>& depth() const { return depth_; }
    const std::vector<int>& parent() const { return parent_; }
    const std::vector<int>& euler() const { return euler_; }
    const std::vector<int>& first() const { return first_; }
    const std::vector<std::vector<int>>& sparse() const { return sparse_; }

private:
    int n_;
    std::vector<int> parent_, depth_, euler_, first_;
    std::vector<std::vector<int>> sparse_;

    /** The shallower of two nodes; on equal depths the left one. */
    int shallower(int a, int b) const { return depth_[a] <= depth_[b] ? a : b; }

    void check(int v) const {
        if (v < 0 || v >= n_) throw std::out_of_range("node " + std::to_string(v) + " is not in the tree");
    }
};

#ifndef IS_TEST_BUILD
int main() {
    /*
     *         0
     *       /   \
     *      1     2
     *     / \     \
     *    3   4     5
     *   / \         \
     *  6   7         8
     *  |
     *  9
     */
    std::vector<std::pair<int, int>> edges = {{0, 1}, {0, 2}, {1, 3}, {1, 4}, {2, 5}, {3, 6}, {3, 7}, {5, 8}, {6, 9}};
    BinaryLiftingLCA lifting(10, edges);
    EulerTourLCA tour(10, edges);
    std::cout << "euler:";
    for (int v : tour.euler()) std::cout << ' ' << v;
    std::cout << '\n';
    for (auto [u, v] : std::vector<std::pair<int, int>>{{9, 4}, {9, 8}, {7, 9}, {3, 3}}) {
        std::cout << "lca(" << u << ", " << v << ") = " << lifting.lca(u, v) << " (lifting), " << tour.lca(u, v)
                  << " (Euler tour); distance " << lifting.distance(u, v) << '\n';
    }
    std::cout << "kthAncestor(9, 3) = " << lifting.kthAncestor(9, 3) << '\n';
    std::cout << "kthAncestor(9, 5) = " << lifting.kthAncestor(9, 5) << '\n';
    return 0;
}
#endif  // IS_TEST_BUILD
