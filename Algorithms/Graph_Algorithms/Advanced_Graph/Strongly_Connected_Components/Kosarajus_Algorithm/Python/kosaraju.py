"""
Kosaraju's Algorithm Implementation

Kosaraju's algorithm finds all strongly connected components (SCCs) in a directed graph.
A strongly connected component is a maximal set of vertices where every vertex is
reachable from every other vertex in the component.
"""

from typing import List, Dict, Set


def kosaraju_scc(graph: Dict[int, List[int]]) -> List[List[int]]:
    """
    Find all strongly connected components using Kosaraju's algorithm
    
    Algorithm:
    1. Perform DFS on original graph, record finish times
    2. Reverse the graph
    3. Perform DFS on reversed graph in order of decreasing finish times
    
    Args:
        graph: Dictionary mapping vertex to list of neighbors (adjacency list)
        
    Returns:
        List of strongly connected components, each as a list of vertices
        
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    if not graph:
        return []
    
    visited = set()
    finish_order = []
    
    # Both DFS passes are iterative: an explicit stack of neighbor iterators visits
    # vertices in the same order as recursion would, without Python's recursion
    # limit (a recursive DFS fails on a path of about 1000 vertices).
    
    # Step 1: First DFS to get finish times
    def dfs1(start: int):
        visited.add(start)
        stack = [(start, iter(graph.get(start, [])))]
        while stack:
            vertex, neighbors = stack[-1]
            for neighbor in neighbors:
                if neighbor not in visited:
                    visited.add(neighbor)
                    stack.append((neighbor, iter(graph.get(neighbor, []))))
                    break
            else:
                stack.pop()
                finish_order.append(vertex)  # vertex is finished
    
    for vertex in graph:
        if vertex not in visited:
            dfs1(vertex)
    
    # Step 2: Reverse the graph (a vertex that only appears as a neighbor is not a
    # key of graph, so create its entry on first use)
    reversed_graph = {v: [] for v in graph}
    for vertex in graph:
        for neighbor in graph[vertex]:
            reversed_graph.setdefault(neighbor, []).append(vertex)
    
    # Step 3: Second DFS on reversed graph
    visited.clear()
    sccs = []
    
    def dfs2(start: int, component: List[int]):
        visited.add(start)
        component.append(start)
        stack = [iter(reversed_graph.get(start, []))]
        while stack:
            for neighbor in stack[-1]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    component.append(neighbor)
                    stack.append(iter(reversed_graph.get(neighbor, [])))
                    break
            else:
                stack.pop()
    
    # Process in reverse finish order
    for vertex in reversed(finish_order):
        if vertex not in visited:
            component = []
            dfs2(vertex, component)
            sccs.append(component)
    
    return sccs


def kosaraju_scc_count(graph: Dict[int, List[int]]) -> int:
    """
    Count number of strongly connected components
    
    Args:
        graph: Dictionary mapping vertex to list of neighbors
        
    Returns:
        Number of strongly connected components
        
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    sccs = kosaraju_scc(graph)
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
    sccs = kosaraju_scc(graph)
    return len(sccs) == 1


def kosaraju_condensation_graph(graph: Dict[int, List[int]]) -> Dict[int, List[int]]:
    """
    Build condensation graph (DAG of SCCs)
    
    Args:
        graph: Original graph
        
    Returns:
        Condensation graph where each vertex represents an SCC
        Maps SCC index to list of SCC indices it connects to
        
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    sccs = kosaraju_scc(graph)
    
    # Map each vertex to its SCC index
    vertex_to_scc = {}
    for scc_idx, scc in enumerate(sccs):
        for vertex in scc:
            vertex_to_scc[vertex] = scc_idx
    
    # Build condensation graph
    condensation = {i: set() for i in range(len(sccs))}
    
    for vertex in graph:
        scc_from = vertex_to_scc[vertex]
        for neighbor in graph.get(vertex, []):
            scc_to = vertex_to_scc[neighbor]
            if scc_from != scc_to:
                condensation[scc_from].add(scc_to)
    
    # Convert sets to lists
    return {k: list(v) for k, v in condensation.items()}


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
    
    print("Kosaraju's Algorithm Example:")
    print(f"Graph: {graph}")
    
    # Find all SCCs
    sccs = kosaraju_scc(graph)
    print(f"Strongly Connected Components: {sccs}")
    
    # Count SCCs
    count = kosaraju_scc_count(graph)
    print(f"Number of SCCs: {count}")
    
    # Check if strongly connected
    is_sc = is_strongly_connected(graph)
    print(f"Is strongly connected: {is_sc}")
    
    # Strongly connected graph
    graph_sc = {1: [2], 2: [3], 3: [1]}
    print(f"\nStrongly connected graph: {graph_sc}")
    print(f"Is strongly connected: {is_strongly_connected(graph_sc)}")

