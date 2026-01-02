"""
Union-Find (Disjoint Set Union) Implementation

This module contains the UnionFind class with optimizations:
1. Path Compression
2. Union by Rank
"""

class UnionFind:
    """
    Disjoint Set Union (DSU) with Path Compression and Union by Rank.
    Time Complexity:
        - Construction: O(n)
        - Find: O(α(n))
        - Union: O(α(n))
    Space Complexity: O(n)
    """

    def __init__(self, size: int):
        """
        Initialize DSU with 'size' elements.
        
        Args:
            size: Number of elements (0 to size-1)
        """
        if size < 0:
            raise ValueError("Size cannot be negative")
        
        # Parent array: parent[i] points to parent of i
        self.parent = list(range(size))
        # Rank array: approximate height of tree
        self.rank = [1] * size
        # Count of disjoint sets
        self.count = size

    def find(self, x: int) -> int:
        """
        Find the representative (root) of the set containing x.
        Applies Path Compression.
        
        Args:
            x: Element to find
            
        Returns:
            Root representative of x
        """
        if x < 0 or x >= len(self.parent):
            raise ValueError("Element index out of bounds")

        if self.parent[x] != x:
            # Path compression: point directly to root
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x: int, y: int) -> bool:
        """
        Unite the sets containing x and y.
        Applies Union by Rank.
        
        Args:
            x: First element
            y: Second element
            
        Returns:
            True if merged (were in different sets), False if already same set.
        """
        root_x = self.find(x)
        root_y = self.find(y)

        if root_x == root_y:
            return False  # Already in same set

        # Union by Rank: attach smaller tree to larger tree
        if self.rank[root_x] > self.rank[root_y]:
            self.parent[root_y] = root_x
        elif self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
        else:
            self.parent[root_y] = root_x
            self.rank[root_x] += 1

        self.count -= 1
        return True

    def connected(self, x: int, y: int) -> bool:
        """
        Check if x and y are in the same set.
        
        Args:
            x: First element
            y: Second element
            
        Returns:
            True if connected, False otherwise
        """
        return self.find(x) == self.find(y)

    def get_count(self) -> int:
        """Get number of disjoint sets."""
        return self.count


def count_components(n: int, edges: list[list[int]]) -> int:
    """
    Example application: Count Connected Components in an undirected graph.
    
    Args:
        n: Number of nodes
        edges: List of edges [u, v]
        
    Returns:
        Number of connected components
    """
    uf = UnionFind(n)
    for u, v in edges:
        uf.union(u, v)
    return uf.get_count()


def main():
    """Example usage of Union-Find."""
    print("=== Union-Find Example ===")
    
    # 5 elements: 0, 1, 2, 3, 4
    n = 5
    uf = UnionFind(n)
    print(f"Initial sets: {uf.get_count()}") # 5
    
    print("Union(0, 1)")
    uf.union(0, 1)
    
    print("Union(2, 3)")
    uf.union(2, 3)
    
    print("Union(0, 4)")
    uf.union(0, 4)
    
    # Sets: {0, 1, 4}, {2, 3}
    print(f"Sets count: {uf.get_count()}") # 2
    
    print(f"0 connected to 4? {uf.connected(0, 4)}") # True
    print(f"0 connected to 3? {uf.connected(0, 3)}") # False
    
    print("Union(1, 2)")
    uf.union(1, 2)
    # All connected now
    print(f"Sets count after merging all: {uf.get_count()}") # 1


if __name__ == "__main__":
    main()
