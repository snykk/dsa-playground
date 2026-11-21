"""
Kruskal's Algorithm Implementation

Finds Minimum Spanning Tree (MST) of a connected, undirected graph
by adding edges in increasing order of weight, avoiding cycles.
"""


class UnionFind:
    """Union-Find (Disjoint Set) data structure for cycle detection"""
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
    
    def find(self, x):
        """Find root with path compression"""
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]
    
    def union(self, x, y):
        """Union by rank"""
        root_x = self.find(x)
        root_y = self.find(y)
        
        if root_x == root_y:
            return False  # Already in same set (creates cycle)
        
        # Union by rank
        if self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
        elif self.rank[root_x] > self.rank[root_y]:
            self.parent[root_y] = root_x
        else:
            self.parent[root_y] = root_x
            self.rank[root_x] += 1
        
        return True


def kruskal_mst(edges, num_vertices):
    """
    Find MST using Kruskal's algorithm
    
    Args:
        edges: List of tuples (u, v, weight) representing edges
        num_vertices: Number of vertices in graph
        
    Returns:
        Tuple of (mst_edges, total_weight)
        
    Time Complexity: O(E log E) or O(E log V)
    Space Complexity: O(V + E) (the sorted copy of the edges)
    """
    if num_vertices == 0:
        return [], 0
    
    # Sort edges by weight
    sorted_edges = sorted(edges, key=lambda x: x[2])
    
    uf = UnionFind(num_vertices)
    mst = []
    total_weight = 0
    
    for u, v, weight in sorted_edges:
        # If adding this edge doesn't create cycle, add it
        if uf.union(u, v):
            mst.append((u, v, weight))
            total_weight += weight
            
            # MST has V-1 edges
            if len(mst) == num_vertices - 1:
                break
    
    return mst, total_weight


def kruskal_mst_with_details(edges, num_vertices):
    """
    Kruskal's with detailed information
    
    Returns:
        Dictionary with mst_edges, total_weight, and connected status
    """
    mst, total_weight = kruskal_mst(edges, num_vertices)
    
    # Check if graph is connected (MST should have V-1 edges)
    is_connected = len(mst) == num_vertices - 1
    
    return {
        'mst_edges': mst,
        'total_weight': total_weight,
        'is_connected': is_connected,
        'num_edges_in_mst': len(mst)
    }

