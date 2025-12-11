"""
Dijkstra's Algorithm Implementation

Dijkstra's algorithm finds shortest paths from a source vertex to all other
vertices in a weighted graph with non-negative edge weights.
"""

from typing import List, Dict, Tuple, Optional
import heapq


def dijkstra(graph: Dict[int, List[Tuple[int, int]]], start: int) -> Dict[int, int]:
    """
    Dijkstra's algorithm to find shortest distances from start to all vertices
    
    Args:
        graph: Dictionary mapping vertex to list of (neighbor, weight) tuples
        start: Starting vertex
        
    Returns:
        Dictionary mapping vertex to shortest distance from start
        
    Time Complexity: O((V + E) log V) with binary heap
    Space Complexity: O(V)
    """
    distances = {v: float('inf') for v in graph}
    distances[start] = 0
    
    # Priority queue: (distance, vertex)
    pq = [(0, start)]
    visited = set()
    
    while pq:
        current_dist, current = heapq.heappop(pq)
        
        if current in visited:
            continue
        
        visited.add(current)
        
        # Update distances to neighbors
        for neighbor, weight in graph.get(current, []):
            if neighbor in visited:
                continue
            
            new_dist = current_dist + weight
            if new_dist < distances[neighbor]:
                distances[neighbor] = new_dist
                heapq.heappush(pq, (new_dist, neighbor))
    
    return distances


def dijkstra_with_path(graph: Dict[int, List[Tuple[int, int]]], 
                       start: int, target: int) -> Optional[Tuple[int, List[int]]]:
    """
    Dijkstra's algorithm to find shortest path from start to target
    
    Args:
        graph: Dictionary mapping vertex to list of (neighbor, weight) tuples
        start: Starting vertex
        target: Target vertex
        
    Returns:
        Tuple of (distance, path) or None if no path exists
        
    Time Complexity: O((V + E) log V)
    Space Complexity: O(V)
    """
    distances = {v: float('inf') for v in graph}
    distances[start] = 0
    previous = {v: None for v in graph}
    
    pq = [(0, start)]
    visited = set()
    
    while pq:
        current_dist, current = heapq.heappop(pq)
        
        if current == target:
            # Reconstruct path
            path = []
            node = target
            while node is not None:
                path.append(node)
                node = previous[node]
            path.reverse()
            return (current_dist, path)
        
        if current in visited:
            continue
        
        visited.add(current)
        
        for neighbor, weight in graph.get(current, []):
            if neighbor in visited:
                continue
            
            new_dist = current_dist + weight
            if new_dist < distances[neighbor]:
                distances[neighbor] = new_dist
                previous[neighbor] = current
                heapq.heappush(pq, (new_dist, neighbor))
    
    return None  # No path found


def dijkstra_all_pairs(graph: Dict[int, List[Tuple[int, int]]]) -> Dict[int, Dict[int, int]]:
    """
    Find shortest distances between all pairs using Dijkstra's
    
    Args:
        graph: Dictionary mapping vertex to list of (neighbor, weight) tuples
        
    Returns:
        Dictionary mapping (source, target) to shortest distance
        
    Time Complexity: O(V * (V + E) log V)
    Space Complexity: O(V²)
    """
    all_distances = {}
    
    for start in graph:
        all_distances[start] = dijkstra(graph, start)
    
    return all_distances

