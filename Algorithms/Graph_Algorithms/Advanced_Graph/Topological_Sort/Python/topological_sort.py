"""
Topological Sort Implementation

Topological sort is a linear ordering of vertices in a directed acyclic graph (DAG)
such that for every directed edge (u, v), vertex u comes before v in the ordering.
"""

from typing import List, Dict, Set, Optional
from collections import deque


def topological_sort_kahn(graph: Dict[int, List[int]]) -> Optional[List[int]]:
    """
    Topological sort using Kahn's algorithm (BFS-based)
    
    Args:
        graph: Dictionary mapping vertex to list of neighbors (adjacency list)
        
    Returns:
        Topological ordering as list of vertices, or None if cycle detected
        
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    if not graph:
        return []
    
    # Calculate in-degrees
    in_degree = {v: 0 for v in graph}
    for vertex in graph:
        for neighbor in graph[vertex]:
            if neighbor in in_degree:
                in_degree[neighbor] += 1
            else:
                in_degree[neighbor] = 1
    
    # Find all vertices with in-degree 0
    queue = deque([v for v in in_degree if in_degree[v] == 0])
    result = []
    
    while queue:
        vertex = queue.popleft()
        result.append(vertex)
        
        # Reduce in-degree of neighbors
        for neighbor in graph.get(vertex, []):
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    
    # Check for cycle (if result doesn't contain all vertices)
    if len(result) != len(in_degree):
        return None  # Cycle detected
    
    return result


def topological_sort_dfs(graph: Dict[int, List[int]]) -> Optional[List[int]]:
    """
    Topological sort using DFS-based algorithm
    
    Args:
        graph: Dictionary mapping vertex to list of neighbors (adjacency list)
        
    Returns:
        Topological ordering as list of vertices, or None if cycle detected
        
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    if not graph:
        return []
    
    visited = set()
    rec_stack = set()  # vertices on the current DFS path
    result = []
    
    # Iterative DFS: an explicit stack of (vertex, neighbor iterator) visits vertices
    # in the same order as the recursive version, without Python's recursion limit
    # (a recursive DFS fails on a chain of about 1000 vertices).
    for start in graph:
        if start in visited:
            continue
        visited.add(start)
        rec_stack.add(start)
        stack = [(start, iter(graph.get(start, [])))]
        while stack:
            vertex, neighbors = stack[-1]
            for neighbor in neighbors:
                if neighbor not in visited:
                    visited.add(neighbor)
                    rec_stack.add(neighbor)
                    stack.append((neighbor, iter(graph.get(neighbor, []))))
                    break
                if neighbor in rec_stack:
                    # Back edge found - cycle detected
                    return None
            else:
                # Every neighbor is finished, so the vertex is finished too
                stack.pop()
                rec_stack.remove(vertex)
                result.append(vertex)
    
    # Reverse result (DFS gives reverse topological order)
    return result[::-1]


def topological_sort_all_orders(graph: Dict[int, List[int]]) -> List[List[int]]:
    """
    Find all possible topological orderings (backtracking)
    
    Args:
        graph: Dictionary mapping vertex to list of neighbors
        
    Returns:
        List of all possible topological orderings
        
    Time Complexity: O(V! * E) in worst case
    Space Complexity: O(V)
    """
    if not graph:
        return [[]]
    
    # Calculate in-degrees
    in_degree = {v: 0 for v in graph}
    for vertex in graph:
        for neighbor in graph[vertex]:
            if neighbor in in_degree:
                in_degree[neighbor] += 1
            else:
                in_degree[neighbor] = 1
    
    result = []
    
    # in_degree holds every vertex, including those that only appear as neighbors
    # (they are not keys of graph), so iterate over it rather than over graph.
    def backtrack(current_order: List[int], current_in_degree: Dict[int, int]):
        if len(current_order) == len(in_degree):
            result.append(current_order[:])
            return
        
        # Find all vertices with in-degree 0 that haven't been added
        candidates = [v for v in in_degree
                     if v not in current_order and current_in_degree[v] == 0]
        
        for vertex in candidates:
            # Add vertex to order
            current_order.append(vertex)
            
            # Update in-degrees
            for neighbor in graph.get(vertex, []):
                current_in_degree[neighbor] -= 1
            
            # Recurse
            backtrack(current_order, current_in_degree)
            
            # Backtrack
            current_order.pop()
            for neighbor in graph.get(vertex, []):
                current_in_degree[neighbor] += 1
    
    backtrack([], in_degree.copy())
    return result


def is_dag(graph: Dict[int, List[int]]) -> bool:
    """
    Check if graph is a Directed Acyclic Graph (DAG)
    
    Args:
        graph: Dictionary mapping vertex to list of neighbors
        
    Returns:
        True if graph is DAG, False otherwise
        
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    return topological_sort_kahn(graph) is not None


def longest_path_dag(graph: Dict[int, List[int]], weights: Dict[tuple, int],
                     source: Optional[int] = None) -> Dict[int, int]:
    """
    Find longest path in DAG using topological sort
    
    Args:
        graph: Dictionary mapping vertex to list of neighbors
        weights: Dictionary mapping (u, v) edge to weight (missing edges weigh 1)
        source: Start vertex. If None, a path may start at any vertex with no
            incoming edges, so every vertex gets the longest path ending there.
        
    Returns:
        Dictionary mapping every vertex (including vertices that only appear as
        neighbors) to its longest path distance from the source(s); -inf if the
        vertex cannot be reached from source. Empty dict if the graph has a cycle.
        
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    topo_order = topological_sort_kahn(graph)
    if topo_order is None:
        return {}  # Not a DAG
    
    # Initialize distances to negative infinity, one entry per vertex
    # (topo_order also holds the vertices that only appear as neighbors)
    distances = {v: float('-inf') for v in graph}
    for v in topo_order:
        distances.setdefault(v, float('-inf'))
    if source is None:
        has_incoming = {v for neighbors in graph.values() for v in neighbors}
        for v in topo_order:
            if v not in has_incoming:
                distances[v] = 0  # Every source vertex can start a path
    elif source in distances:
        distances[source] = 0
    else:
        raise ValueError(f"source {source} is not a vertex of the graph")
    
    # Process vertices in topological order
    for u in topo_order:
        if distances[u] == float('-inf'):
            continue
        
        for v in graph.get(u, []):
            edge_weight = weights.get((u, v), 1)
            if distances[v] < distances[u] + edge_weight:
                distances[v] = distances[u] + edge_weight
    
    return distances


if __name__ == "__main__":
    # Example usage
    graph = {
        1: [2, 4],
        2: [3],
        3: [],
        4: []
    }
    
    print("Topological Sort Example:")
    print(f"Graph: {graph}")
    
    # Kahn's algorithm
    order = topological_sort_kahn(graph)
    print(f"Topological order (Kahn's): {order}")
    
    # DFS-based
    order_dfs = topological_sort_dfs(graph)
    print(f"Topological order (DFS): {order_dfs}")
    
    # Check if DAG
    print(f"Is DAG: {is_dag(graph)}")
    
    # Graph with cycle
    graph_cycle = {
        1: [2],
        2: [3],
        3: [1]  # Cycle
    }
    print(f"\nGraph with cycle: {graph_cycle}")
    order_cycle = topological_sort_kahn(graph_cycle)
    print(f"Topological order: {order_cycle} (None if cycle detected)")
    print(f"Is DAG: {is_dag(graph_cycle)}")

