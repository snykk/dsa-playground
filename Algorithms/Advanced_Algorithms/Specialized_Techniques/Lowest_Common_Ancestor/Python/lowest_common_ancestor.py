"""
Lowest Common Ancestor (LCA)

The lowest common ancestor of u and v in a rooted tree is the deepest node that has both u
and v in its subtree (a node is in its own subtree, so lca(u, u) == u, and lca(u, v) == u
when u is an ancestor of v). Two classes answer many queries on one fixed tree:

- BinaryLiftingLCA: up[k][v] is the 2^k-th ancestor of v. O(n log n) to build, O(log n)
  per query. It also gives kth_ancestor(v, k).
- EulerTourLCA: the Euler tour of a depth-first walk and a sparse table that keeps the
  shallowest node of every power-of-two window of it. O(n log n) to build, O(1) per query.

Both take the tree as n, a list of n - 1 edges (u, v) on the nodes 0..n-1, and a root, and
both give distance(u, v) = depth[u] + depth[v] - 2 * depth[lca(u, v)] (edges on the path).
Every walk over the tree is a loop with an explicit queue or stack, never recursion, so a
path of 10^5 nodes does not hit Python's recursion limit.
"""

from typing import List, Sequence, Tuple


def rooted_tree(n: int, edges: Sequence[Sequence[int]], root: int) -> Tuple[List[List[int]], List[int], List[int]]:
    """Check that the edges form one tree on 0..n-1 and hang it from root.

    Returns (adj, parent, depth): adj[u] lists the neighbours of u in the order their edges
    appear in `edges`, parent[root] is -1, and depth[root] is 0. The walk is breadth-first.

    Raises:
        ValueError: n < 1, a root or an endpoint outside 0..n-1, a number of edges other
            than n - 1, or edges that do not connect every node (with n - 1 edges, that
            means a cycle, a repeated edge or a loop somewhere, and the rest is a forest).
    """
    if n < 1:
        raise ValueError("a tree needs at least one node")
    if not 0 <= root < n:
        raise ValueError(f"root {root} is not a node of 0..{n - 1}")
    if len(edges) != n - 1:
        raise ValueError(f"a tree on {n} nodes has {n - 1} edges, got {len(edges)}")
    adj: List[List[int]] = [[] for _ in range(n)]
    for u, v in edges:
        if not (0 <= u < n and 0 <= v < n):
            raise ValueError(f"edge ({u}, {v}) has an endpoint outside 0..{n - 1}")
        adj[u].append(v)
        adj[v].append(u)
    parent = [-1] * n
    depth = [0] * n
    seen = [False] * n
    seen[root] = True
    queue = [root]
    head = 0
    while head < len(queue):
        u = queue[head]
        head += 1
        for v in adj[u]:
            if not seen[v]:
                seen[v] = True
                parent[v] = u
                depth[v] = depth[u] + 1
                queue.append(v)
    if len(queue) != n:
        raise ValueError(f"the edges reach {len(queue)} of the {n} nodes from the root: not a tree")
    return adj, parent, depth


class BinaryLiftingLCA:
    """LCA by binary lifting: up[k][v] is the 2^k-th ancestor of v.

    The root is its own parent (up[k][root] == root for every k), so a jump that would leave
    the tree stops at the root and the table needs no -1 checks.
    """

    def __init__(self, n: int, edges: Sequence[Sequence[int]], root: int = 0):
        """Build the table in O(n log n). Raises ValueError unless the edges form a tree."""
        _, self.parent, self.depth = rooted_tree(n, edges, root)
        self.n = n
        self.root = root
        # floor(log2 n) + 1 levels give jumps 1, 2, ..., 2^(levels-1), together
        # 2^levels - 1 >= n - 1, the largest possible depth.
        self.levels = n.bit_length()
        self.up = [[root if p == -1 else p for p in self.parent]]
        for k in range(1, self.levels):
            prev = self.up[k - 1]
            # Two jumps of 2^(k-1) make one jump of 2^k.
            self.up.append([prev[prev[v]] for v in range(n)])

    def _check(self, v: int) -> None:
        if not 0 <= v < self.n:
            raise IndexError(f"node {v} is not in 0..{self.n - 1}")

    def kth_ancestor(self, v: int, k: int) -> int:
        """The ancestor k levels above v (v itself for k = 0), or -1 when k > depth[v].

        One jump per 1 bit of k: O(log n). Raises IndexError for a node outside 0..n-1
        and ValueError for k < 0.
        """
        self._check(v)
        if k < 0:
            raise ValueError("k must be at least 0")
        if k > self.depth[v]:
            return -1
        level = 0
        while k:
            if k & 1:
                v = self.up[level][v]
            k >>= 1
            level += 1
        return v

    def lca(self, u: int, v: int) -> int:
        """Lift the deeper node to the other's depth, then lift both while their ancestors differ."""
        self._check(u)
        self._check(v)
        if self.depth[u] < self.depth[v]:
            u, v = v, u
        u = self.kth_ancestor(u, self.depth[u] - self.depth[v])
        if u == v:
            return u
        for k in range(self.levels - 1, -1, -1):
            # Equal ancestors are common, but maybe not the lowest: jump only while they differ.
            if self.up[k][u] != self.up[k][v]:
                u = self.up[k][u]
                v = self.up[k][v]
        return self.up[0][u]

    def distance(self, u: int, v: int) -> int:
        """Number of edges on the path from u to v."""
        w = self.lca(u, v)
        return self.depth[u] + self.depth[v] - 2 * self.depth[w]


class EulerTourLCA:
    """LCA by an Euler tour and a sparse table of the shallowest node over the tour.

    euler lists the nodes in the order a depth-first walk enters them and comes back to
    them: 2n - 1 entries. first[v] is the index where v first appears. Between first[u] and
    first[v] the walk stays inside the subtree of lca(u, v) and passes through lca(u, v)
    itself, so the LCA is the shallowest node of that range.
    """

    def __init__(self, n: int, edges: Sequence[Sequence[int]], root: int = 0):
        """Build the tour and the sparse table in O(n log n). Raises ValueError unless the edges form a tree."""
        adj, self.parent, self.depth = rooted_tree(n, edges, root)
        self.n = n
        self.root = root
        self.euler: List[int] = [root]
        self.first = [-1] * n
        self.first[root] = 0
        # Children are visited in adjacency order; nxt[u] is the next neighbour of u to try.
        nxt = [0] * n
        stack = [root]
        while stack:
            u = stack[-1]
            if nxt[u] < len(adj[u]):
                v = adj[u][nxt[u]]
                nxt[u] += 1
                if v != self.parent[u]:
                    self.first[v] = len(self.euler)
                    self.euler.append(v)
                    stack.append(v)
            else:
                stack.pop()
                if stack:
                    # Back in the parent after the whole subtree of u.
                    self.euler.append(stack[-1])
        # sparse[k][i] is the shallowest node of euler[i .. i + 2^k - 1].
        m = len(self.euler)
        self.sparse = [list(self.euler)]
        k = 1
        while (1 << k) <= m:
            prev = self.sparse[k - 1]
            half = 1 << (k - 1)
            self.sparse.append([self._shallower(prev[i], prev[i + half]) for i in range(m - (1 << k) + 1)])
            k += 1

    def _shallower(self, a: int, b: int) -> int:
        """The shallower of two nodes; on equal depths the left one (a)."""
        return a if self.depth[a] <= self.depth[b] else b

    def lca(self, u: int, v: int) -> int:
        """The shallowest node of euler[first[u] .. first[v]], from two overlapping windows: O(1)."""
        for x in (u, v):
            if not 0 <= x < self.n:
                raise IndexError(f"node {x} is not in 0..{self.n - 1}")
        left, right = self.first[u], self.first[v]
        if left > right:
            left, right = right, left
        k = (right - left + 1).bit_length() - 1
        return self._shallower(self.sparse[k][left], self.sparse[k][right - (1 << k) + 1])

    def distance(self, u: int, v: int) -> int:
        """Number of edges on the path from u to v."""
        w = self.lca(u, v)
        return self.depth[u] + self.depth[v] - 2 * self.depth[w]


def main() -> None:
    """Both methods on a tree of 10 nodes rooted at 0.

            0
          /   \\
         1     2
        / \\     \\
       3   4     5
      / \\         \\
     6   7         8
     |
     9
    """
    edges = [(0, 1), (0, 2), (1, 3), (1, 4), (2, 5), (3, 6), (3, 7), (5, 8), (6, 9)]
    lifting = BinaryLiftingLCA(10, edges)
    tour = EulerTourLCA(10, edges)
    print("depth:", lifting.depth)
    for k, row in enumerate(lifting.up):
        print(f"up[{k}] (2^{k} = {1 << k} up):", row)
    print("euler:", tour.euler)
    print("first:", tour.first)
    for u, v in [(9, 4), (9, 8), (7, 9), (3, 3)]:
        print(f"lca({u}, {v}) = {lifting.lca(u, v)} (lifting), {tour.lca(u, v)} (Euler tour); distance {lifting.distance(u, v)}")
    print("kth_ancestor(9, 3) =", lifting.kth_ancestor(9, 3))
    print("kth_ancestor(9, 5) =", lifting.kth_ancestor(9, 5))


if __name__ == "__main__":
    main()
