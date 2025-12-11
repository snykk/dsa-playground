"""
DFS (Depth-First Search) Implementation

DFS is a graph traversal algorithm that explores as far as possible along
each branch before backtracking.
"""

from typing import List, Dict, Set, Optional


def dfs_adjacency_list(graph: Dict[int, List[int]], start: int) -> List[int]:
    """
    DFS traversal using adjacency list (iterative)
    
    Args:
        graph: Dictionary mapping vertex to list of neighbors
        start: Starting vertex for traversal
        
    Returns:
        List of vertices in DFS order
        
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    if start not in graph:
        return []
    
    visited = set()
    stack = [start]
    result = []
    
    while stack:
        vertex = stack.pop()
        
        if vertex not in visited:
            visited.add(vertex)
            result.append(vertex)
            
            # Add neighbors in reverse order to maintain left-to-right traversal
            for neighbor in reversed(graph.get(vertex, [])):
                if neighbor not in visited:
                    stack.append(neighbor)
    
    return result


def dfs_recursive(graph: Dict[int, List[int]], start: int) -> List[int]:
    """
    DFS traversal using recursion
    
    Args:
        graph: Dictionary mapping vertex to list of neighbors
        start: Starting vertex for traversal
        
    Returns:
        List of vertices in DFS order
        
    Time Complexity: O(V + E)
    Space Complexity: O(V) for recursion stack
    """
    if start not in graph:
        return []
    
    visited = set()
    result = []
    
    def _dfs(vertex: int):
        visited.add(vertex)
        result.append(vertex)
        
        for neighbor in graph.get(vertex, []):
            if neighbor not in visited:
                _dfs(neighbor)
    
    _dfs(start)
    return result


def dfs_with_path(graph: Dict[int, List[int]], start: int, target: int) -> Optional[List[int]]:
    """
    DFS to find path from start to target
    
    Args:
        graph: Dictionary mapping vertex to list of neighbors
        start: Starting vertex
        target: Target vertex
        
    Returns:
        Path as list of vertices, or None if no path exists
        
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    if start == target:
        return [start]
    
    if start not in graph or target not in graph:
        return None
    
    visited = set()
    stack = [(start, [start])]
    
    while stack:
        vertex, path = stack.pop()
        
        if vertex == target:
            return path
        
        if vertex not in visited:
            visited.add(vertex)
            
            for neighbor in reversed(graph.get(vertex, [])):
                if neighbor not in visited:
                    stack.append((neighbor, path + [neighbor]))
    
    return None


def dfs_connected_components(graph: Dict[int, List[int]]) -> List[List[int]]:
    """
    Find all connected components using DFS
    
    Args:
        graph: Dictionary mapping vertex to list of neighbors
        
    Returns:
        List of connected components, each as a list of vertices
        
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    visited = set()
    components = []
    
    def _dfs_component(vertex: int, component: List[int]):
        visited.add(vertex)
        component.append(vertex)
        
        for neighbor in graph.get(vertex, []):
            if neighbor not in visited:
                _dfs_component(neighbor, component)
    
    for vertex in graph:
        if vertex not in visited:
            component = []
            _dfs_component(vertex, component)
            components.append(component)
    
    return components


def dfs_detect_cycle(graph: Dict[int, List[int]], directed: bool = False) -> bool:
    """
    Detect cycle in graph using DFS
    
    Args:
        graph: Dictionary mapping vertex to list of neighbors
        directed: Whether graph is directed
        
    Returns:
        True if cycle exists, False otherwise
        
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    visited = set()
    rec_stack = set() if directed else set()
    
    def _has_cycle(vertex: int, parent: Optional[int] = None) -> bool:
        visited.add(vertex)
        if directed:
            rec_stack.add(vertex)
        
        for neighbor in graph.get(vertex, []):
            if neighbor not in visited:
                if _has_cycle(neighbor, vertex if not directed else None):
                    return True
            elif directed:
                if neighbor in rec_stack:
                    return True
            elif neighbor != parent:
                return True
        
        if directed:
            rec_stack.remove(vertex)
        return False
    
    for vertex in graph:
        if vertex not in visited:
            if _has_cycle(vertex):
                return True
    
    return False


def dfs_topological_sort(graph: Dict[int, List[int]]) -> Optional[List[int]]:
    """
    Topological sort using DFS (for DAG)
    
    Args:
        graph: Dictionary mapping vertex to list of neighbors (directed graph)
        
    Returns:
        Topological order as list, or None if cycle exists
        
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    visited = set()
    rec_stack = set()
    result = []
    
    def _dfs(vertex: int) -> bool:
        if vertex in rec_stack:
            return False  # Cycle detected
        
        if vertex in visited:
            return True
        
        visited.add(vertex)
        rec_stack.add(vertex)
        
        for neighbor in graph.get(vertex, []):
            if not _dfs(neighbor):
                return False
        
        rec_stack.remove(vertex)
        result.append(vertex)
        return True
    
    for vertex in graph:
        if vertex not in visited:
            if not _dfs(vertex):
                return None
    
    return result[::-1]  # Reverse to get topological order

