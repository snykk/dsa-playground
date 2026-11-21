"""
Prim's Algorithm Implementation

Finds Minimum Spanning Tree (MST) by starting from a vertex and
repeatedly adding minimum weight edge that connects to unvisited vertex.
"""

import heapq


def prim_mst_adjacency_list(graph, start=0):
    """
    Find MST using Prim's algorithm (adjacency list representation)
    
    Args:
        graph: Dictionary {vertex: [(neighbor, weight), ...]}
        start: Starting vertex
        
    Returns:
        Tuple of (mst_edges, total_weight)
        
    Time Complexity: O(E log V) with binary heap
    Space Complexity: O(V + E) (the lazy heap holds up to E entries)
    """
    if not graph:
        return [], 0
    
    visited = set()
    mst = []
    total_weight = 0
    
    # Priority queue: (weight, from_vertex, to_vertex)
    heap = [(0, start, start)]
    
    # No vertex-count guard: a vertex that appears only in neighbor lists is not a
    # key of graph, so len(graph) would stop the loop before it was added.
    while heap:
        weight, from_vertex, to_vertex = heapq.heappop(heap)
        
        if to_vertex in visited:
            continue
        
        visited.add(to_vertex)
        
        if from_vertex != to_vertex:
            mst.append((from_vertex, to_vertex, weight))
            total_weight += weight
        
        # Add neighbors to heap
        for neighbor, edge_weight in graph.get(to_vertex, []):
            if neighbor not in visited:
                heapq.heappush(heap, (edge_weight, to_vertex, neighbor))
    
    return mst, total_weight


def prim_mst_edge_list(edges, num_vertices, start=0):
    """
    Find MST using Prim's algorithm (edge list representation)
    
    Args:
        edges: List of tuples (u, v, weight)
        num_vertices: Number of vertices
        start: Starting vertex
        
    Returns:
        Tuple of (mst_edges, total_weight)
    """
    if num_vertices == 0:
        return [], 0
    
    # Build adjacency list
    graph = {i: [] for i in range(num_vertices)}
    for u, v, weight in edges:
        graph[u].append((v, weight))
        graph[v].append((u, weight))
    
    return prim_mst_adjacency_list(graph, start)


def prim_mst_adjacency_matrix(matrix, start=0):
    """
    Find MST using Prim's algorithm (adjacency matrix representation)
    
    Args:
        matrix: 2D list representing adjacency matrix (0 = no edge; any
            other value, negative weights included, is an edge weight)
        start: Starting vertex
        
    Returns:
        Tuple of (mst_edges, total_weight)
    """
    num_vertices = len(matrix)
    if num_vertices == 0:
        return [], 0
    
    visited = [False] * num_vertices
    mst = []
    total_weight = 0
    
    # Key values for each vertex (minimum weight to connect)
    key = [float('inf')] * num_vertices
    parent = [-1] * num_vertices
    
    key[start] = 0
    
    for _ in range(num_vertices):
        # Find vertex with minimum key not yet in MST
        u = -1
        min_key = float('inf')
        for v in range(num_vertices):
            if not visited[v] and key[v] < min_key:
                min_key = key[v]
                u = v
        
        if u == -1:
            break
        
        visited[u] = True
        
        if parent[u] != -1:
            mst.append((parent[u], u, key[u]))
            total_weight += key[u]
        
        # Update key values of adjacent vertices (0 = no edge, so a
        # negative weight is still an edge)
        for v in range(num_vertices):
            if (not visited[v] and matrix[u][v] != 0 and
                matrix[u][v] < key[v]):
                key[v] = matrix[u][v]
                parent[v] = u
    
    return mst, total_weight

