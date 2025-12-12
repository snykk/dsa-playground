"""
Union-Find (Disjoint Set Union - DSU) Implementation

Union-Find is a data structure that efficiently tracks disjoint sets and supports
union and find operations. It's used in many graph algorithms like Kruskal's MST.
"""

from typing import List, Dict, Set


class UnionFind:
    """
    Union-Find (Disjoint Set Union) data structure
    
    Supports:
    - find(x): Find root of set containing x
    - union(x, y): Union sets containing x and y
    - connected(x, y): Check if x and y are in same set
    - count: Number of disjoint sets
    """
    
    def __init__(self, n: int):
        """
        Initialize Union-Find for n elements
        
        Args:
            n: Number of elements (0 to n-1)
        """
        self.parent = list(range(n))
        self.rank = [0] * n
        self.count = n  # Number of disjoint sets
    
    def find(self, x: int) -> int:
        """
        Find root of set containing x with path compression
        
        Args:
            x: Element to find
            
        Returns:
            Root of set containing x
            
        Time Complexity: O(α(n)) amortized (inverse Ackermann function)
        """
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # Path compression
        return self.parent[x]
    
    def union(self, x: int, y: int) -> bool:
        """
        Union sets containing x and y using union by rank
        
        Args:
            x: First element
            y: Second element
            
        Returns:
            True if union occurred, False if already in same set
            
        Time Complexity: O(α(n)) amortized
        """
        root_x = self.find(x)
        root_y = self.find(y)
        
        if root_x == root_y:
            return False  # Already in same set
        
        # Union by rank
        if self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
        elif self.rank[root_x] > self.rank[root_y]:
            self.parent[root_y] = root_x
        else:
            self.parent[root_y] = root_x
            self.rank[root_x] += 1
        
        self.count -= 1
        return True
    
    def connected(self, x: int, y: int) -> bool:
        """
        Check if x and y are in same set
        
        Args:
            x: First element
            y: Second element
            
        Returns:
            True if x and y are in same set, False otherwise
            
        Time Complexity: O(α(n)) amortized
        """
        return self.find(x) == self.find(y)
    
    def get_count(self) -> int:
        """
        Get number of disjoint sets
        
        Returns:
            Number of disjoint sets
        """
        return self.count
    
    def get_components(self) -> Dict[int, List[int]]:
        """
        Get all components (sets) as dictionary mapping root to list of elements
        
        Returns:
            Dictionary mapping root to list of elements in that set
            
        Time Complexity: O(n)
        """
        components = {}
        for i in range(len(self.parent)):
            root = self.find(i)
            if root not in components:
                components[root] = []
            components[root].append(i)
        return components


def union_find_connected_components(edges: List[tuple], n: int) -> List[List[int]]:
    """
    Find connected components in undirected graph using Union-Find
    
    Args:
        edges: List of (u, v) tuples representing edges
        n: Number of vertices (0 to n-1)
        
    Returns:
        List of connected components, each as list of vertices
        
    Time Complexity: O(E × α(n))
    Space Complexity: O(n)
    """
    uf = UnionFind(n)
    
    for u, v in edges:
        uf.union(u, v)
    
    components = uf.get_components()
    return list(components.values())


def union_find_cycle_detection(edges: List[tuple], n: int) -> bool:
    """
    Detect cycle in undirected graph using Union-Find
    
    Args:
        edges: List of (u, v) tuples representing edges
        n: Number of vertices
        
    Returns:
        True if cycle detected, False otherwise
        
    Time Complexity: O(E × α(n))
    Space Complexity: O(n)
    """
    uf = UnionFind(n)
    
    for u, v in edges:
        if not uf.union(u, v):
            return True  # Cycle detected (edge connects vertices in same set)
    
    return False


def union_find_kruskal_mst(edges: List[tuple], n: int) -> List[tuple]:
    """
    Find Minimum Spanning Tree using Kruskal's algorithm with Union-Find
    
    Args:
        edges: List of (u, v, weight) tuples representing weighted edges
        n: Number of vertices
        
    Returns:
        List of edges in MST as (u, v, weight) tuples
        
    Time Complexity: O(E log E + E × α(n))
    Space Complexity: O(n)
    """
    # Sort edges by weight
    sorted_edges = sorted(edges, key=lambda x: x[2])
    
    uf = UnionFind(n)
    mst = []
    
    for u, v, weight in sorted_edges:
        if uf.union(u, v):
            mst.append((u, v, weight))
            if len(mst) == n - 1:
                break  # MST complete
    
    return mst


def union_find_largest_component(edges: List[tuple], n: int) -> List[int]:
    """
    Find largest connected component using Union-Find
    
    Args:
        edges: List of (u, v) tuples representing edges
        n: Number of vertices
        
    Returns:
        List of vertices in largest component
        
    Time Complexity: O(E × α(n))
    Space Complexity: O(n)
    """
    uf = UnionFind(n)
    
    for u, v in edges:
        uf.union(u, v)
    
    components = uf.get_components()
    if not components:
        return []
    
    largest = max(components.values(), key=len)
    return largest


if __name__ == "__main__":
    # Example usage
    print("Union-Find Example:")
    
    # Basic Union-Find operations
    uf = UnionFind(5)
    print(f"Initial count: {uf.get_count()}")  # 5
    
    uf.union(0, 1)
    print(f"After union(0,1): count={uf.get_count()}, connected(0,1)={uf.connected(0, 1)}")
    
    uf.union(2, 3)
    print(f"After union(2,3): count={uf.get_count()}, connected(2,3)={uf.connected(2, 3)}")
    
    uf.union(1, 2)
    print(f"After union(1,2): count={uf.get_count()}, connected(0,3)={uf.connected(0, 3)}")
    
    # Cycle detection
    print("\nCycle Detection Example:")
    edges = [(0, 1), (1, 2), (2, 0)]  # Triangle
    has_cycle = union_find_cycle_detection(edges, 3)
    print(f"Graph with cycle: {has_cycle}")  # True
    
    edges_no_cycle = [(0, 1), (1, 2)]
    has_cycle = union_find_cycle_detection(edges_no_cycle, 3)
    print(f"Graph without cycle: {has_cycle}")  # False

