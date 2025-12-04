"""
Adjacency List representation of a Graph.

An Adjacency List is a collection of lists where each list represents
the neighbors of a vertex. This is the most common representation for graphs.
"""

from typing import List, Optional, Set, Tuple
from collections import deque


class AdjacencyList:
    """Graph representation using Adjacency List.
    
    Adjacency List uses a dictionary/array of lists to represent graph edges.
    Each vertex has a list of its neighbors (and optionally weights).
    Supports both directed/undirected and weighted/unweighted graphs.
    
    Supports:
    - Add edge: O(1)
    - Remove edge: O(V)
    - Check edge: O(V)
    - Get neighbors: O(1) to get list, O(V) to iterate
    - Space: O(V + E)
    """
    
    def __init__(self, num_vertices: int = 0, directed: bool = False, weighted: bool = False):
        """Initialize Adjacency List.
        
        Args:
            num_vertices: Number of vertices (0 for dynamic)
            directed: If True, creates a directed graph. If False, creates undirected graph.
            weighted: If True, edges can have weights. If False, edges are unweighted.
        """
        self.directed = directed
        self.weighted = weighted
        self.adjacency_list = {}  # {vertex: [neighbors] or [(neighbor, weight), ...]}
        self.vertices = set()
        
        # Initialize vertices if num_vertices > 0
        if num_vertices > 0:
            for i in range(num_vertices):
                self.add_vertex(i)
    
    def add_vertex(self, vertex: int) -> None:
        """Add a vertex to the graph.
        
        Args:
            vertex: Vertex to add
        """
        if vertex not in self.vertices:
            self.vertices.add(vertex)
            self.adjacency_list[vertex] = []
    
    def add_edge(self, from_vertex: int, to_vertex: int, weight: float = 1.0) -> None:
        """Add an edge to the graph.
        
        Args:
            from_vertex: Source vertex
            to_vertex: Destination vertex
            weight: Weight of the edge (default: 1.0, ignored if unweighted)
        """
        # Add vertices if they don't exist
        self.add_vertex(from_vertex)
        self.add_vertex(to_vertex)
        
        # Remove existing edge if present
        self.remove_edge(from_vertex, to_vertex)
        
        # Add edge
        if self.weighted:
            self.adjacency_list[from_vertex].append((to_vertex, weight))
        else:
            if to_vertex not in self.adjacency_list[from_vertex]:
                self.adjacency_list[from_vertex].append(to_vertex)
        
        # For undirected graph, add reverse edge
        if not self.directed:
            self.remove_edge(to_vertex, from_vertex)
            if self.weighted:
                self.adjacency_list[to_vertex].append((from_vertex, weight))
            else:
                if from_vertex not in self.adjacency_list[to_vertex]:
                    self.adjacency_list[to_vertex].append(from_vertex)
    
    def remove_edge(self, from_vertex: int, to_vertex: int) -> None:
        """Remove an edge from the graph.
        
        Args:
            from_vertex: Source vertex
            to_vertex: Destination vertex
        """
        if from_vertex not in self.adjacency_list:
            return
        
        if self.weighted:
            self.adjacency_list[from_vertex] = [
                item for item in self.adjacency_list[from_vertex]
                if not (isinstance(item, tuple) and item[0] == to_vertex)
            ]
        else:
            if to_vertex in self.adjacency_list[from_vertex]:
                self.adjacency_list[from_vertex].remove(to_vertex)
        
        # For undirected graph, remove reverse edge
        if not self.directed:
            if to_vertex in self.adjacency_list:
                if self.weighted:
                    self.adjacency_list[to_vertex] = [
                        item for item in self.adjacency_list[to_vertex]
                        if not (isinstance(item, tuple) and item[0] == from_vertex)
                    ]
                else:
                    if from_vertex in self.adjacency_list[to_vertex]:
                        self.adjacency_list[to_vertex].remove(from_vertex)
    
    def has_edge(self, from_vertex: int, to_vertex: int) -> bool:
        """Check if an edge exists between two vertices.
        
        Args:
            from_vertex: Source vertex
            to_vertex: Destination vertex
            
        Returns:
            True if edge exists, False otherwise
        """
        if from_vertex not in self.adjacency_list:
            return False
        
        if self.weighted:
            return any(isinstance(item, tuple) and item[0] == to_vertex 
                      for item in self.adjacency_list[from_vertex])
        else:
            return to_vertex in self.adjacency_list[from_vertex]
    
    def get_weight(self, from_vertex: int, to_vertex: int) -> Optional[float]:
        """Get the weight of an edge.
        
        Args:
            from_vertex: Source vertex
            to_vertex: Destination vertex
            
        Returns:
            Weight of the edge, or None if edge doesn't exist or graph is unweighted
        """
        if not self.weighted or from_vertex not in self.adjacency_list:
            return None
        
        for item in self.adjacency_list[from_vertex]:
            if isinstance(item, tuple) and item[0] == to_vertex:
                return item[1]
        
        return None
    
    def get_neighbors(self, vertex: int) -> List[int]:
        """Get all neighbors of a vertex.
        
        Args:
            vertex: Vertex to get neighbors for
            
        Returns:
            List of neighbor vertices
        """
        if vertex not in self.adjacency_list:
            return []
        
        if self.weighted:
            return [item[0] for item in self.adjacency_list[vertex] if isinstance(item, tuple)]
        else:
            return self.adjacency_list[vertex].copy()
    
    def get_neighbors_with_weights(self, vertex: int) -> List[Tuple[int, float]]:
        """Get all neighbors with their edge weights.
        
        Args:
            vertex: Vertex to get neighbors for
            
        Returns:
            List of (neighbor, weight) tuples (or (neighbor, 1.0) if unweighted)
        """
        if vertex not in self.adjacency_list:
            return []
        
        if self.weighted:
            return [item for item in self.adjacency_list[vertex] if isinstance(item, tuple)]
        else:
            return [(neighbor, 1.0) for neighbor in self.adjacency_list[vertex]]
    
    def get_vertices(self) -> Set[int]:
        """Get all vertices in the graph.
        
        Returns:
            Set of all vertices
        """
        return self.vertices.copy()
    
    def get_edges(self) -> List[Tuple]:
        """Get all edges in the graph.
        
        Returns:
            List of edges (as tuples)
        """
        edges = []
        visited_edges = set()
        
        for from_vertex in self.adjacency_list:
            if self.weighted:
                for to_vertex, weight in self.adjacency_list[from_vertex]:
                    if not self.directed:
                        edge_key = tuple(sorted([from_vertex, to_vertex]))
                        if edge_key not in visited_edges:
                            edges.append((from_vertex, to_vertex, weight))
                            visited_edges.add(edge_key)
                    else:
                        edges.append((from_vertex, to_vertex, weight))
            else:
                for to_vertex in self.adjacency_list[from_vertex]:
                    if not self.directed:
                        edge_key = tuple(sorted([from_vertex, to_vertex]))
                        if edge_key not in visited_edges:
                            edges.append((from_vertex, to_vertex))
                            visited_edges.add(edge_key)
                    else:
                        edges.append((from_vertex, to_vertex))
        
        return edges
    
    def get_degree(self, vertex: int) -> int:
        """Get the degree of a vertex.
        
        Args:
            vertex: Vertex to get degree for
            
        Returns:
            Degree of the vertex
        """
        if vertex not in self.adjacency_list:
            return 0
        
        degree = len(self.adjacency_list[vertex])
        
        if self.directed:
            # Count in-degree
            in_degree = 0
            for v in self.adjacency_list:
                if self.weighted:
                    in_degree += sum(1 for item in self.adjacency_list[v] 
                                    if isinstance(item, tuple) and item[0] == vertex)
                else:
                    in_degree += sum(1 for neighbor in self.adjacency_list[v] if neighbor == vertex)
            return degree + in_degree
        
        return degree
    
    def bfs(self, start_vertex: int) -> List[int]:
        """Breadth-First Search traversal.
        
        Args:
            start_vertex: Starting vertex for BFS
            
        Returns:
            List of vertices in BFS order
        """
        if start_vertex not in self.vertices:
            return []
        
        visited = set()
        queue = deque([start_vertex])
        result = []
        
        visited.add(start_vertex)
        
        while queue:
            vertex = queue.popleft()
            result.append(vertex)
            
            neighbors = self.get_neighbors(vertex)
            for neighbor in neighbors:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        
        return result
    
    def dfs(self, start_vertex: int) -> List[int]:
        """Depth-First Search traversal (iterative).
        
        Args:
            start_vertex: Starting vertex for DFS
            
        Returns:
            List of vertices in DFS order
        """
        if start_vertex not in self.vertices:
            return []
        
        visited = set()
        stack = [start_vertex]
        result = []
        
        while stack:
            vertex = stack.pop()
            
            if vertex not in visited:
                visited.add(vertex)
                result.append(vertex)
                
                neighbors = self.get_neighbors(vertex)
                for neighbor in reversed(neighbors):
                    if neighbor not in visited:
                        stack.append(neighbor)
        
        return result
    
    def dfs_recursive(self, start_vertex: int) -> List[int]:
        """Depth-First Search traversal (recursive).
        
        Args:
            start_vertex: Starting vertex for DFS
            
        Returns:
            List of vertices in DFS order
        """
        if start_vertex not in self.vertices:
            return []
        
        visited = set()
        result = []
        
        def _dfs(vertex: int):
            visited.add(vertex)
            result.append(vertex)
            
            neighbors = self.get_neighbors(vertex)
            for neighbor in neighbors:
                if neighbor not in visited:
                    _dfs(neighbor)
        
        _dfs(start_vertex)
        return result
    
    def is_connected(self) -> bool:
        """Check if the graph is connected (for undirected graphs).
        
        Returns:
            True if graph is connected, False otherwise
        """
        if self.directed:
            raise ValueError("is_connected() is only for undirected graphs")
        
        if not self.vertices:
            return True
        
        start = next(iter(self.vertices))
        visited = set(self.bfs(start))
        return len(visited) == len(self.vertices)
    
    def __str__(self) -> str:
        """String representation of the graph."""
        graph_type = "Directed" if self.directed else "Undirected"
        weight_type = "Weighted" if self.weighted else "Unweighted"
        return f"{weight_type} {graph_type} Graph (Adjacency List) with {len(self.vertices)} vertices"
    
    def __repr__(self) -> str:
        """Detailed representation of the graph."""
        return f"AdjacencyList(vertices={len(self.vertices)}, directed={self.directed}, weighted={self.weighted})"

