"""
Heavy-Light Decomposition (HLD)

Decomposes a tree into chains for efficient path queries.
Used for answering queries on paths in trees efficiently.
"""

from typing import List, Tuple, Optional


class HLD:
    def __init__(self, n: int, adj: List[List[int]]):
        self.n = n
        self.adj = adj
        self.parent = [-1] * n
        self.depth = [0] * n
        self.size = [0] * n
        self.heavy = [-1] * n
        self.head = [0] * n
        self.pos = [0] * n
        self.cur_pos = 0
    
    def dfs_size(self, root: int, p: int) -> int:
        """Calculate subtree sizes, depths and heavy children (iterative)."""
        self.parent[root] = p
        self.depth[root] = 0
        order = [root]
        for u in order:
            self.size[u] = 1
            for v in self.adj[u]:
                if v != self.parent[u]:
                    self.parent[v] = u
                    self.depth[v] = self.depth[u] + 1
                    order.append(v)
        for u in reversed(order):
            if self.parent[u] != -1 and u != root:
                self.size[self.parent[u]] += self.size[u]
        for u in order:
            max_size = 0
            for v in self.adj[u]:
                if v != self.parent[u] and self.size[v] > max_size:
                    max_size = self.size[v]
                    self.heavy[u] = v
        return self.size[root]

    def decompose(self, root: int, h: int):
        """Decompose tree into chains (iterative pre-order, heavy child first)."""
        stack = [(root, h)]
        while stack:
            u, head = stack.pop()
            self.head[u] = head
            self.pos[u] = self.cur_pos
            self.cur_pos += 1
            for v in reversed(self.adj[u]):
                if v != self.parent[u] and v != self.heavy[u]:
                    stack.append((v, v))
            if self.heavy[u] != -1:
                stack.append((self.heavy[u], head))

    def build(self, root: int = 0):
        """Build HLD structure (safe to call more than once)."""
        self.parent = [-1] * self.n
        self.depth = [0] * self.n
        self.size = [0] * self.n
        self.heavy = [-1] * self.n
        self.cur_pos = 0
        self.dfs_size(root, -1)
        self.decompose(root, root)

    def lca(self, u: int, v: int) -> int:
        """Find Lowest Common Ancestor."""
        while self.head[u] != self.head[v]:
            if self.depth[self.head[u]] < self.depth[self.head[v]]:
                u, v = v, u
            u = self.parent[self.head[u]]
        
        if self.depth[u] > self.depth[v]:
            u, v = v, u
        
        return u
    
    def query_path(self, u: int, v: int) -> List[int]:
        """Get path from u to v as list of segments."""
        path = []
        
        while self.head[u] != self.head[v]:
            if self.depth[self.head[u]] < self.depth[self.head[v]]:
                u, v = v, u
            
            path.append((self.pos[self.head[u]], self.pos[u]))
            u = self.parent[self.head[u]]
        
        if self.depth[u] > self.depth[v]:
            u, v = v, u
        
        path.append((self.pos[u], self.pos[v]))
        return path


def main():
    """Example usage."""
    print("Heavy-Light Decomposition Examples:")
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
    
    hld = HLD(n, adj)
    hld.build(0)
    
    print("HLD structure:")
    print(f"Head: {hld.head}")
    print(f"Position: {hld.pos}")
    print(f"Depth: {hld.depth}")
    print()
    
    u, v = 3, 6
    lca = hld.lca(u, v)
    print(f"LCA of {u} and {v}: {lca}")
    
    path = hld.query_path(u, v)
    print(f"Path from {u} to {v}: {path}")


if __name__ == "__main__":
    main()
