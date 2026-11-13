"""
Edmonds-Karp Algorithm Implementation

Edmonds-Karp algorithm finds the maximum flow in a flow network.
It's a variant of Ford-Fulkerson that uses BFS to find shortest augmenting paths,
guaranteeing polynomial time complexity.
"""

from typing import Dict, List, Tuple, Optional
from collections import deque


def edmonds_karp(graph: Dict[int, Dict[int, int]], source: int, sink: int) -> int:
    """
    Find maximum flow using Edmonds-Karp algorithm (BFS-based)
    
    Args:
        graph: Dictionary mapping vertex to dictionary of (neighbor, capacity) pairs
        source: Source vertex
        sink: Sink vertex
        
    Returns:
        Maximum flow value
        
    Time Complexity: O(V * E^2)
    Space Complexity: O(V + E)
    """
    if source == sink:
        return 0
    
    # Create residual graph
    residual = {u: {v: cap for v, cap in neighbors.items()} 
                for u, neighbors in graph.items()}
    
    # Add reverse edges
    for u in graph:
        for v in graph[u]:
            if v not in residual:
                residual[v] = {}
            if u not in residual[v]:
                residual[v][u] = 0
    
    max_flow = 0
    
    def bfs_find_path() -> Optional[Tuple[List[int], int]]:
        """BFS to find shortest augmenting path"""
        parent = {}
        queue = deque([source])
        visited = {source}
        
        while queue:
            u = queue.popleft()
            
            if u == sink:
                # Reconstruct path
                path = []
                v = sink
                while v is not None:
                    path.append(v)
                    v = parent.get(v)
                path.reverse()
                
                # Find minimum capacity
                min_capacity = float('inf')
                for i in range(len(path) - 1):
                    min_capacity = min(min_capacity, residual[path[i]][path[i + 1]])
                
                return path, min_capacity
            
            for v, capacity in residual.get(u, {}).items():
                if v not in visited and capacity > 0:
                    visited.add(v)
                    parent[v] = u
                    queue.append(v)
        
        return None
    
    # Find augmenting paths using BFS
    while True:
        result = bfs_find_path()
        if not result:
            break
        
        path, min_capacity = result
        
        # Update residual graph
        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            residual[u][v] -= min_capacity
            residual[v][u] += min_capacity
        
        max_flow += min_capacity
    
    return max_flow


if __name__ == "__main__":
    # Example usage
    graph = {
        0: {1: 16, 2: 13},
        1: {2: 10, 3: 12},
        2: {1: 4, 4: 14},
        3: {2: 9, 5: 20},
        4: {3: 7, 5: 4}
    }
    
    print("Edmonds-Karp Algorithm Example:")
    print(f"Graph: {graph}")
    
    max_flow = edmonds_karp(graph, 0, 5)
    print(f"Maximum flow: {max_flow}")  # 23

