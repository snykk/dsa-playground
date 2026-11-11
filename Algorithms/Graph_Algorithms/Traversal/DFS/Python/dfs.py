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
    Space Complexity: O(V + E) (a vertex is marked when popped, so the stack
    can hold one entry per edge)
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


def _dfs_preorder(graph: Dict[int, List[int]], start: int, visited: Set[int]) -> List[int]:
    """
    Vertices reachable from start that are not in visited, in the order a
    recursive DFS discovers them; adds them to visited.

    The recursion is simulated with an explicit stack of neighbor iterators
    (one per active call), so a long path cannot hit Python's recursion limit
    (about 1000 nested calls by default).
    """
    visited.add(start)
    order = [start]
    stack = [iter(graph.get(start, []))]

    while stack:
        for neighbor in stack[-1]:
            if neighbor not in visited:
                # "Recursive call": the next loop iteration continues inside neighbor
                visited.add(neighbor)
                order.append(neighbor)
                stack.append(iter(graph.get(neighbor, [])))
                break
        else:
            stack.pop()  # every neighbor handled: "return" to the caller

    return order


def dfs_recursive(graph: Dict[int, List[int]], start: int) -> List[int]:
    """
    DFS traversal in recursive order

    Visits vertices exactly as the textbook recursive DFS does; the recursion
    is simulated with an explicit stack, so deep graphs do not raise
    RecursionError.
    
    Args:
        graph: Dictionary mapping vertex to list of neighbors
        start: Starting vertex for traversal
        
    Returns:
        List of vertices in DFS order
        
    Time Complexity: O(V + E)
    Space Complexity: O(V) for the (simulated) recursion stack
    """
    if start not in graph:
        return []
    
    return _dfs_preorder(graph, start, set())


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
    Space Complexity: O(V + E) (the stack can hold one entry per edge)
    """
    if start == target:
        return [start]
    
    # The target does not have to be a key: a vertex without outgoing edges
    # may appear only in neighbor lists.
    if start not in graph:
        return None
    
    # Stack entries are (vertex, vertex that pushed it). parent[v] is recorded
    # when v is popped and visited (the dict doubles as the visited set), so
    # the path is rebuilt once from the target instead of being copied into
    # every stack entry.
    parent = {}
    stack = [(start, None)]
    
    while stack:
        vertex, via = stack.pop()
        
        if vertex == target:
            path = [vertex]
            while via != start:
                path.append(via)
                via = parent[via]
            path.append(start)
            path.reverse()
            return path
        
        if vertex not in parent:
            parent[vertex] = via
            
            for neighbor in reversed(graph.get(vertex, [])):
                if neighbor not in parent:
                    stack.append((neighbor, vertex))
    
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
    
    for vertex in graph:
        if vertex not in visited:
            components.append(_dfs_preorder(graph, vertex, visited))
    
    return components


def dfs_detect_cycle(graph: Dict[int, List[int]], directed: bool = False) -> bool:
    """
    Detect cycle in graph using DFS
    
    The recursion is simulated with an explicit stack of
    (vertex, parent, neighbor iterator) frames, so deep graphs do not raise
    RecursionError.
    
    Args:
        graph: Dictionary mapping vertex to list of neighbors
        directed: Whether graph is directed
        
    Returns:
        True if cycle exists, False otherwise
        
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    visited = set()
    rec_stack = set()  # vertices on the current DFS path (directed graphs)
    
    for root in graph:
        if root in visited:
            continue

        visited.add(root)
        if directed:
            rec_stack.add(root)
        # parent is None for the root (and unused for directed graphs)
        stack = [(root, None, iter(graph.get(root, [])))]
        
        while stack:
            vertex, parent, neighbors = stack[-1]
            for neighbor in neighbors:
                if neighbor not in visited:
                    # "Recursive call" on neighbor
                    visited.add(neighbor)
                    if directed:
                        rec_stack.add(neighbor)
                    stack.append((neighbor, None if directed else vertex,
                                  iter(graph.get(neighbor, []))))
                    break
                elif directed:
                    if neighbor in rec_stack:
                        return True
                elif neighbor != parent:
                    return True
            else:
                # Every neighbor handled: "return" from vertex
                stack.pop()
                if directed:
                    rec_stack.remove(vertex)
    
    return False


def dfs_topological_sort(graph: Dict[int, List[int]]) -> Optional[List[int]]:
    """
    Topological sort using DFS (for DAG)
    
    The recursion is simulated with an explicit stack of
    (vertex, neighbor iterator) frames, so deep graphs do not raise
    RecursionError.
    
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
    
    for root in graph:
        if root in visited:
            continue
        
        visited.add(root)
        rec_stack.add(root)
        stack = [(root, iter(graph.get(root, [])))]
        
        while stack:
            vertex, neighbors = stack[-1]
            for neighbor in neighbors:
                if neighbor in rec_stack:
                    return None  # Back edge: cycle detected
        
                if neighbor not in visited:
                    # "Recursive call" on neighbor
                    visited.add(neighbor)
                    rec_stack.add(neighbor)
                    stack.append((neighbor, iter(graph.get(neighbor, []))))
                    break
            else:
                # Every neighbor finished: vertex is finished too
                stack.pop()
                rec_stack.remove(vertex)
                result.append(vertex)
    
    return result[::-1]  # Reverse to get topological order

