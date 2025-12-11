"""
BFS (Breadth-First Search) Implementation

BFS is a graph traversal algorithm that explores all vertices at the current
depth level before moving to vertices at the next depth level.
"""

from typing import List, Dict, Set, Optional
from collections import deque


def bfs_adjacency_list(graph: Dict[int, List[int]], start: int) -> List[int]:
    """
    BFS traversal using adjacency list representation
    
    Args:
        graph: Dictionary mapping vertex to list of neighbors
        start: Starting vertex for traversal
        
    Returns:
        List of vertices in BFS order
        
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    if start not in graph:
        return []
    
    visited = set()
    queue = deque([start])
    result = []
    
    visited.add(start)
    
    while queue:
        vertex = queue.popleft()
        result.append(vertex)
        
        # Visit all neighbors
        for neighbor in graph.get(vertex, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    
    return result


def bfs_with_path(graph: Dict[int, List[int]], start: int, target: int) -> Optional[List[int]]:
    """
    BFS to find shortest path from start to target (unweighted graph)
    
    Args:
        graph: Dictionary mapping vertex to list of neighbors
        start: Starting vertex
        target: Target vertex
        
    Returns:
        Shortest path as list of vertices, or None if no path exists
        
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    if start == target:
        return [start]
    
    if start not in graph or target not in graph:
        return None
    
    visited = set()
    queue = deque([(start, [start])])
    visited.add(start)
    
    while queue:
        vertex, path = queue.popleft()
        
        for neighbor in graph.get(vertex, []):
            if neighbor == target:
                return path + [neighbor]
            
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
    
    return None


def bfs_level_order(graph: Dict[int, List[int]], start: int) -> List[List[int]]:
    """
    BFS traversal returning vertices grouped by level
    
    Args:
        graph: Dictionary mapping vertex to list of neighbors
        start: Starting vertex
        
    Returns:
        List of lists, where each inner list contains vertices at that level
        
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    if start not in graph:
        return []
    
    visited = set()
    queue = deque([start])
    result = []
    visited.add(start)
    
    while queue:
        level_size = len(queue)
        level = []
        
        for _ in range(level_size):
            vertex = queue.popleft()
            level.append(vertex)
            
            for neighbor in graph.get(vertex, []):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        
        result.append(level)
    
    return result


def bfs_connected_components(graph: Dict[int, List[int]]) -> List[List[int]]:
    """
    Find all connected components using BFS
    
    Args:
        graph: Dictionary mapping vertex to list of neighbors
        
    Returns:
        List of connected components, each as a list of vertices
        
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    visited = set()
    components = []
    
    for vertex in graph:
        if vertex not in visited:
            component = bfs_adjacency_list(graph, vertex)
            components.append(component)
            visited.update(component)
    
    return components


def bfs_shortest_distance(graph: Dict[int, List[int]], start: int) -> Dict[int, int]:
    """
    Find shortest distance from start to all reachable vertices (unweighted)
    
    Args:
        graph: Dictionary mapping vertex to list of neighbors
        start: Starting vertex
        
    Returns:
        Dictionary mapping vertex to distance from start
        
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    if start not in graph:
        return {}
    
    distances = {start: 0}
    queue = deque([start])
    
    while queue:
        vertex = queue.popleft()
        current_distance = distances[vertex]
        
        for neighbor in graph.get(vertex, []):
            if neighbor not in distances:
                distances[neighbor] = current_distance + 1
                queue.append(neighbor)
    
    return distances

