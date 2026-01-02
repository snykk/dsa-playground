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
        """Calculate subtree sizes."""
        self.size[u] = 1
        for v in self.adj[u]:
            if v != p and not self.removed[v]:
                self.size[u] += self.dfs_size(v, u)
        return self.size[u]
    
    def find_centroid(self, u: int, p: int, total: int) -> int:
        """Find centroid of subtree."""
        for v in self.adj[u]:
            if v != p and not self.removed[v] and self.size[v] > total // 2:
                return self.find_centroid(v, u, total)
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
        """Build centroid decomposition."""
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
