"""
Graph Coloring

Backtracking algorithm to color a graph with minimum number of colors such that
no two adjacent vertices have the same color.
"""

from typing import List, Optional


def is_safe(graph: List[List[int]], v: int, color: List[int], c: int) -> bool:
    """Check if color c can be assigned to vertex v."""
    for i in range(len(graph)):
        if graph[v][i] == 1 and color[i] == c:
            return False
    return True


def graph_coloring_util(graph: List[List[int]], m: int, color: List[int], v: int) -> bool:
    """Backtracking utility function."""
    n = len(graph)
    if v == n:
        return True
    
    for c in range(1, m + 1):
        if is_safe(graph, v, color, c):
            color[v] = c
            
            if graph_coloring_util(graph, m, color, v + 1):
                return True
            
            # Backtrack
            color[v] = 0
    
    return False


def graph_coloring(graph: List[List[int]], m: int) -> Optional[List[int]]:
    """
    Color graph with m colors using backtracking.
    
    Args:
        graph: Adjacency matrix representation of graph
        m: Number of colors available
        
    Returns:
        Color assignment list if solution exists, None otherwise
    """
    n = len(graph)
    color = [0] * n
    
    if graph_coloring_util(graph, m, color, 0):
        return color
    
    return None


def chromatic_number(graph: List[List[int]]) -> int:
    """
    Find the chromatic number (minimum number of colors needed).
    
    Args:
        graph: Adjacency matrix representation of graph
        
    Returns:
        Minimum number of colors needed
    """
    n = len(graph)
    for m in range(1, n + 1):
        if graph_coloring(graph, m) is not None:
            return m
    return n


def main():
    """Example usage."""
    print("Graph Coloring Examples:")
    print()
    
    # Example graph (adjacency matrix)
    graph = [
        [0, 1, 1, 1],
        [1, 0, 1, 0],
        [1, 1, 0, 1],
        [1, 0, 1, 0]
    ]
    
    print("Graph adjacency matrix:")
    for row in graph:
        print(row)
    print()
    
    m = 3
    color = graph_coloring(graph, m)
    if color:
        print(f"Graph can be colored with {m} colors:")
        print(f"Color assignment: {color}")
    else:
        print(f"Graph cannot be colored with {m} colors")
    
    print(f"\nChromatic number: {chromatic_number(graph)}")


if __name__ == "__main__":
    main()
