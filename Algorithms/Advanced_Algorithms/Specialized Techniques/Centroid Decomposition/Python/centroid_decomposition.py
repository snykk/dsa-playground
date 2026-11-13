"""
Centroid Decomposition

Decomposes a tree by repeatedly removing centroids.
Used for solving tree problems efficiently.
"""

from typing import List, Set, Optional


class CentroidDecomposition:
    def __init__(self, n: int, adj: List[List[int]]):
        self.n = n
        self.adj = adj
        self.size = [0] * n
        self.removed = [False] * n
        self.parent = [-1] * n
    
    def dfs_size(self, u: int, p: int) -> int:
        """Calculate subtree sizes (iterative, so deep trees are safe)."""
        order = [u]
        par = {u: p}
        i = 0
        while i < len(order):
            x = order[i]
            i += 1
            self.size[x] = 1
            for v in self.adj[x]:
                if v != par[x] and not self.removed[v]:
                    par[v] = x
                    order.append(v)
        for x in reversed(order[1:]):
            self.size[par[x]] += self.size[x]
        return self.size[u]

    def find_centroid(self, u: int, p: int, total: int) -> int:
        """Find centroid of subtree (walk towards the heavy child)."""
        while True:
            for v in self.adj[u]:
                if v != p and not self.removed[v] and self.size[v] > total // 2:
                    p, u = u, v
                    break
            else:
                return u

    def decompose(self, u: int, p: int):
        """Decompose tree starting from centroid."""
        total = self.dfs_size(u, -1)
        centroid = self.find_centroid(u, -1, total)
        
        self.removed[centroid] = True
        self.parent[centroid] = p
        
        for v in self.adj[centroid]:
            if not self.removed[v]:
                self.decompose(v, centroid)
    
    def build(self, root: int = 0):
        """Build centroid decomposition (safe to call more than once)."""
        self.removed = [False] * self.n
        self.parent = [-1] * self.n
        self.decompose(root, -1)
    
    def get_centroid_tree(self) -> List[List[int]]:
        """Get centroid tree as adjacency list."""
        tree = [[] for _ in range(self.n)]
        for i in range(self.n):
            if self.parent[i] != -1:
                tree[self.parent[i]].append(i)
                tree[i].append(self.parent[i])
        return tree


def main():
    """Example usage."""
    print("Centroid Decomposition Examples:")
    print()
    
    n = 7
    adj = [
        [1, 2],
        [0, 3, 4],
        [0, 5],
        [1],
        [1, 6],
        [2],
        [4]
    ]
    
    cd = CentroidDecomposition(n, adj)
    cd.build(0)
    
    print("Centroid tree parent array:")
    print(cd.parent)
    print()
    
    centroid_tree = cd.get_centroid_tree()
    print("Centroid tree adjacency list:")
    for i, neighbors in enumerate(centroid_tree):
        if neighbors:
            print(f"  {i}: {neighbors}")


if __name__ == "__main__":
    main()
