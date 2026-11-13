"""
Floyd-Warshall Algorithm Implementation

Floyd-Warshall algorithm finds shortest paths between all pairs of vertices
in a weighted graph. It works with negative edge weights but not negative cycles.
"""

from typing import List, Dict, Tuple, Optional
import sys


def floyd_warshall(graph: Dict[int, List[Tuple[int, int]]], num_vertices: int) -> Optional[List[List[int]]]:
    """
    Floyd-Warshall algorithm to find shortest distances between all pairs
    
    Args:
        graph: Dictionary mapping vertex to list of (neighbor, weight) tuples
        num_vertices: Number of vertices in graph
        
    Returns:
        2D list where dist[i][j] is shortest distance from i to j
        (sys.maxsize if j is unreachable from i), or None if a negative cycle exists
        
    Time Complexity: O(V^3)
    Space Complexity: O(V^2)
    """
    # Initialize distance matrix
    dist = [[sys.maxsize] * num_vertices for _ in range(num_vertices)]
    
    # Distance from vertex to itself is 0
    for i in range(num_vertices):
        dist[i][i] = 0
    
    # Initialize with direct edges; keep the cheapest of parallel edges, and a
    # positive self-loop never raises dist[u][u] above 0
    for u in graph:
        for v, weight in graph[u]:
            dist[u][v] = min(dist[u][v], weight)
    
    # Floyd-Warshall algorithm
    for k in range(num_vertices):
        for i in range(num_vertices):
            for j in range(num_vertices):
                if dist[i][k] != sys.maxsize and dist[k][j] != sys.maxsize:
                    dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
    
    # Check for negative cycles
    for i in range(num_vertices):
        if dist[i][i] < 0:
            return None  # Negative cycle detected
    
    return dist


def floyd_warshall_path(graph: Dict[int, List[Tuple[int, int]]], 
                        num_vertices: int) -> Optional[Tuple[List[List[int]], List[List[int]]]]:
    """
    Floyd-Warshall with path reconstruction
    
    Returns:
        Tuple of (distance matrix, next matrix for path reconstruction),
        or None if a negative cycle exists
    """
    dist = [[sys.maxsize] * num_vertices for _ in range(num_vertices)]
    next_vertex = [[-1] * num_vertices for _ in range(num_vertices)]
    
    for i in range(num_vertices):
        dist[i][i] = 0
        next_vertex[i][i] = i
    
    for u in graph:
        for v, weight in graph[u]:
            if weight < dist[u][v]:  # cheapest parallel edge; positive self-loops keep 0
                dist[u][v] = weight
                next_vertex[u][v] = v
    
    for k in range(num_vertices):
        for i in range(num_vertices):
            for j in range(num_vertices):
                if dist[i][k] != sys.maxsize and dist[k][j] != sys.maxsize:
                    if dist[i][j] > dist[i][k] + dist[k][j]:
                        dist[i][j] = dist[i][k] + dist[k][j]
                        next_vertex[i][j] = next_vertex[i][k]
    
    # Check for negative cycles (the next pointers would cycle forever)
    for i in range(num_vertices):
        if dist[i][i] < 0:
            return None  # Negative cycle detected
    
    return dist, next_vertex


def reconstruct_path(next_vertex: List[List[int]], start: int, end: int) -> Optional[List[int]]:
    """
    Reconstruct path from next_vertex matrix
    
    Returns None if there is no path, or if the next pointers do not reach end
    within V - 1 steps (they cycle, which only a negative cycle can cause).
    """
    if next_vertex[start][end] == -1:
        return None
    
    path = [start]
    while start != end:
        if len(path) >= len(next_vertex):
            return None  # a simple path has at most V vertices
        start = next_vertex[start][end]
        if start == -1:
            return None
        path.append(start)
    
    return path


