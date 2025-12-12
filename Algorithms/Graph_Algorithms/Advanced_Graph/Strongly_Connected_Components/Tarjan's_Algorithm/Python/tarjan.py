"""
Tarjan's Algorithm Implementation

Tarjan's algorithm finds all strongly connected components (SCCs) in a directed graph
using a single DFS pass. It's more efficient than Kosaraju's in terms of passes.
"""

from typing import List, Dict, Set, Optional


def tarjan_scc(graph: Dict[int, List[int]]) -> List[List[int]]:
    """
    Find all strongly connected components using Tarjan's algorithm
    
    Algorithm:
    - Uses DFS with low-link values
    - Maintains stack of vertices in current DFS path
    - When low-link equals discovery time, found SCC root
    
    Args:
        graph: Dictionary mapping vertex to list of neighbors (adjacency list)
        
    Returns:
        List of strongly connected components, each as a list of vertices
        
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    if not graph:
        return []
    
    index = 0
    indices = {}
    low_link = {}
    on_stack = set()
    stack = []
    sccs = []
    
    def strongconnect(vertex: int):
        nonlocal index
        
        # Set discovery index and low-link
        indices[vertex] = index
        low_link[vertex] = index
        index += 1
        
        stack.append(vertex)
        on_stack.add(vertex)
        
        # Visit all neighbors
        for neighbor in graph.get(vertex, []):
            if neighbor not in indices:
                # Neighbor not visited, recurse
                strongconnect(neighbor)
                low_link[vertex] = min(low_link[vertex], low_link[neighbor])
            elif neighbor in on_stack:
                # Neighbor is in stack, update low-link
                low_link[vertex] = min(low_link[vertex], indices[neighbor])
        
        # If vertex is root of SCC, pop stack
        if low_link[vertex] == indices[vertex]:
            component = []
            while True:
                w = stack.pop()
                on_stack.remove(w)
                component.append(w)
                if w == vertex:
                    break
            sccs.append(component)
    
    # Process all vertices
    for vertex in graph:
        if vertex not in indices:
            strongconnect(vertex)
    
    return sccs


def tarjan_scc_count(graph: Dict[int, List[int]]) -> int:
    """
    Count number of strongly connected components
    
    Args:
        graph: Dictionary mapping vertex to list of neighbors
        
    Returns:
        Number of strongly connected components
        
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    sccs = tarjan_scc(graph)
    return len(sccs)


def is_strongly_connected(graph: Dict[int, List[int]]) -> bool:
    """
    Check if graph is strongly connected (has only one SCC)
    
    Args:
        graph: Dictionary mapping vertex to list of neighbors
        
    Returns:
        True if graph is strongly connected, False otherwise
        
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    sccs = tarjan_scc(graph)
    return len(sccs) == 1


def tarjan_bridges(graph: Dict[int, List[int]]) -> List[tuple]:
    """
    Find bridges (critical edges) in undirected graph using Tarjan's algorithm
    
    A bridge is an edge whose removal increases number of connected components.
    
    Args:
        graph: Dictionary mapping vertex to list of neighbors (undirected)
        
    Returns:
        List of bridges as (u, v) tuples
        
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    if not graph:
        return []
    
    index = 0
    indices = {}
    low_link = {}
    bridges = []
    
    def dfs(vertex: int, parent: Optional[int] = None):
        nonlocal index
        
        indices[vertex] = index
        low_link[vertex] = index
        index += 1
        
        for neighbor in graph.get(vertex, []):
            if neighbor == parent:
                continue  # Skip parent edge
            
            if neighbor not in indices:
                dfs(neighbor, vertex)
                low_link[vertex] = min(low_link[vertex], low_link[neighbor])
                
                # Bridge found if low_link[neighbor] > indices[vertex]
                if low_link[neighbor] > indices[vertex]:
                    bridges.append((vertex, neighbor))
            else:
                # Back edge
                low_link[vertex] = min(low_link[vertex], indices[neighbor])
    
    for vertex in graph:
        if vertex not in indices:
            dfs(vertex)
    
    return bridges


def tarjan_articulation_points(graph: Dict[int, List[int]]) -> Set[int]:
    """
    Find articulation points (cut vertices) in undirected graph
    
    An articulation point is a vertex whose removal increases number of connected components.
    
    Args:
        graph: Dictionary mapping vertex to list of neighbors (undirected)
        
    Returns:
        Set of articulation point vertices
        
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    if not graph:
        return set()
    
    index = 0
    indices = {}
    low_link = {}
    articulation_points = set()
    children_count = {}
    
    def dfs(vertex: int, parent: Optional[int] = None, is_root: bool = False):
        nonlocal index
        
        indices[vertex] = index
        low_link[vertex] = index
        index += 1
        children_count[vertex] = 0
        
        for neighbor in graph.get(vertex, []):
            if neighbor == parent:
                continue
            
            if neighbor not in indices:
                children_count[vertex] += 1
                dfs(neighbor, vertex, False)
                low_link[vertex] = min(low_link[vertex], low_link[neighbor])
                
                # Articulation point conditions
                if not is_root and low_link[neighbor] >= indices[vertex]:
                    articulation_points.add(vertex)
            else:
                low_link[vertex] = min(low_link[vertex], indices[neighbor])
        
        # Root is articulation point if has more than one child
        if is_root and children_count[vertex] > 1:
            articulation_points.add(vertex)
    
    for vertex in graph:
        if vertex not in indices:
            dfs(vertex, None, True)
    
    return articulation_points


if __name__ == "__main__":
    # Example usage
    graph = {
        1: [2],
        2: [3],
        3: [1],  # Cycle: 1 -> 2 -> 3 -> 1
        4: [5],
        5: [6],
        6: [4]  # Cycle: 4 -> 5 -> 6 -> 4
    }
    
    print("Tarjan's Algorithm Example:")
    print(f"Graph: {graph}")
    
    # Find all SCCs
    sccs = tarjan_scc(graph)
    print(f"Strongly Connected Components: {sccs}")
    
    # Count SCCs
    count = tarjan_scc_count(graph)
    print(f"Number of SCCs: {count}")
    
    # Check if strongly connected
    is_sc = is_strongly_connected(graph)
    print(f"Is strongly connected: {is_sc}")
    
    # Find bridges in undirected graph
    undirected_graph = {
        1: [2, 3],
        2: [1],
        3: [1, 4],
        4: [3]
    }
    bridges = tarjan_bridges(undirected_graph)
    print(f"\nBridges: {bridges}")
    
    # Find articulation points
    ap = tarjan_articulation_points(undirected_graph)
    print(f"Articulation points: {ap}")

