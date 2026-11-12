"""
Bellman-Ford Algorithm Implementation

Bellman-Ford algorithm finds shortest paths from a source vertex to all other
vertices in a weighted graph, even with negative edge weights. It can also
detect negative cycles.
"""

from typing import List, Dict, Tuple, Optional


def bellman_ford(edges: List[Tuple[int, int, int]], num_vertices: int, start: int) -> Optional[Dict[int, int]]:
    """
    Bellman-Ford algorithm to find shortest distances from start to all vertices
    
    Args:
        edges: List of (u, v, weight) tuples representing edges
        num_vertices: Number of vertices in graph
        start: Starting vertex
        
    Returns:
        Dictionary mapping vertex to shortest distance, or None if negative cycle exists
        
    Time Complexity: O(V * E)
    Space Complexity: O(V)
    """
    distances = {i: float('inf') for i in range(num_vertices)}
    distances[start] = 0
    
    # Relax edges V-1 times
    for _ in range(num_vertices - 1):
        for u, v, weight in edges:
            if distances[u] != float('inf') and distances[u] + weight < distances[v]:
                distances[v] = distances[u] + weight
    
    # Check for negative cycles
    for u, v, weight in edges:
        if distances[u] != float('inf') and distances[u] + weight < distances[v]:
            return None  # Negative cycle detected
    
    return distances


def bellman_ford_with_path(edges: List[Tuple[int, int, int]], 
                           num_vertices: int, start: int, target: int) -> Optional[Tuple[int, List[int]]]:
    """
    Bellman-Ford algorithm to find shortest path from start to target
    
    Args:
        edges: List of (u, v, weight) tuples
        num_vertices: Number of vertices
        start: Starting vertex
        target: Target vertex
        
    Returns:
        Tuple of (distance, path) or None if no path or negative cycle exists
    """
    distances = {i: float('inf') for i in range(num_vertices)}
    distances[start] = 0
    previous = {i: -1 for i in range(num_vertices)}
    
    # Relax edges V-1 times
    for _ in range(num_vertices - 1):
        for u, v, weight in edges:
            if distances[u] != float('inf') and distances[u] + weight < distances[v]:
                distances[v] = distances[u] + weight
                previous[v] = u
    
    # Check for negative cycles
    for u, v, weight in edges:
        if distances[u] != float('inf') and distances[u] + weight < distances[v]:
            return None  # Negative cycle detected
    
    if distances[target] == float('inf'):
        return None  # No path exists
    
    # Reconstruct path
    path = []
    node = target
    while node != -1:
        path.append(node)
        node = previous[node]
    path.reverse()
    
    return (distances[target], path)


