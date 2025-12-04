"""
Graph implementation supporting Directed and Undirected graphs.

A Graph is a collection of vertices (nodes) connected by edges.
- Directed Graph: Edges have direction (A -> B)
- Undirected Graph: Edges are bidirectional (A <-> B)
"""

from typing import List, Tuple, Optional, Set
from collections import deque


class Graph:
    """Graph implementation supporting both directed and undirected graphs.
    
    Supports:
    - Add vertex: O(1)
    - Add edge: O(1)
    - Remove edge: O(V)
    - Check edge: O(V)
    - Get neighbors: O(V)
    - BFS/DFS traversal: O(V + E)
    """
    
    def __init__(self, directed: bool = False):
        """Initialize Graph.
        
        Args:
            directed: If True, creates a directed graph. If False, creates undirected graph.
        """
        self.directed = directed
        self.adjacency_list = {}  # {vertex: [neighbors]}
        self.vertices = set()
    
    def add_vertex(self, vertex: int) -> None:
        """Add a vertex to the graph.
        
        Args:
            vertex: Vertex to add
        """
        if vertex not in self.vertices:
            self.vertices.add(vertex)
            self.adjacency_list[vertex] = []
    
    def add_edge(self, from_vertex: int, to_vertex: int) -> None:
        """Add an edge between two vertices.
        
        Args:
            from_vertex: Source vertex
            to_vertex: Destination vertex
        """
        # Add vertices if they don't exist
        self.add_vertex(from_vertex)
        self.add_vertex(to_vertex)
        
        # Add edge
        if to_vertex not in self.adjacency_list[from_vertex]:
            self.adjacency_list[from_vertex].append(to_vertex)
        
        # For undirected graph, add reverse edge
        if not self.directed:
            if from_vertex not in self.adjacency_list[to_vertex]:
                self.adjacency_list[to_vertex].append(from_vertex)
    
    def remove_edge(self, from_vertex: int, to_vertex: int) -> None:
        """Remove an edge between two vertices.
        
        Args:
            from_vertex: Source vertex
            to_vertex: Destination vertex
        """
        if from_vertex in self.adjacency_list and to_vertex in self.adjacency_list[from_vertex]:
            self.adjacency_list[from_vertex].remove(to_vertex)
        
        # For undirected graph, remove reverse edge
        if not self.directed:
            if to_vertex in self.adjacency_list and from_vertex in self.adjacency_list[to_vertex]:
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
        return to_vertex in self.adjacency_list[from_vertex]
    
    def get_neighbors(self, vertex: int) -> List[int]:
        """Get all neighbors of a vertex.
        
        Args:
            vertex: Vertex to get neighbors for
            
        Returns:
            List of neighbor vertices
        """
        return self.adjacency_list.get(vertex, [])
    
    def get_vertices(self) -> Set[int]:
        """Get all vertices in the graph.
        
        Returns:
            Set of all vertices
        """
        return self.vertices.copy()
    
    def get_edges(self) -> List[Tuple[int, int]]:
        """Get all edges in the graph.
        
        Returns:
            List of (from_vertex, to_vertex) tuples
        """
        edges = []
        visited_edges = set()
        
        for from_vertex in self.adjacency_list:
            for to_vertex in self.adjacency_list[from_vertex]:
                # For undirected graphs, avoid duplicate edges
                if not self.directed:
                    edge = tuple(sorted([from_vertex, to_vertex]))
                    if edge not in visited_edges:
                        edges.append((from_vertex, to_vertex))
                        visited_edges.add(edge)
                else:
                    edges.append((from_vertex, to_vertex))
        
        return edges
    
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
        
        while queue:
            vertex = queue.popleft()
            if vertex not in visited:
                visited.add(vertex)
                result.append(vertex)
                
                for neighbor in self.adjacency_list.get(vertex, []):
                    if neighbor not in visited:
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
                
                # Add neighbors in reverse order to maintain left-to-right traversal
                for neighbor in reversed(self.adjacency_list.get(vertex, [])):
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
            
            for neighbor in self.adjacency_list.get(vertex, []):
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
        
        # Start BFS from first vertex
        start = next(iter(self.vertices))
        visited = set(self.bfs(start))
        
        return len(visited) == len(self.vertices)
    
    def get_degree(self, vertex: int) -> int:
        """Get the degree of a vertex (number of edges connected to it).
        
        Args:
            vertex: Vertex to get degree for
            
        Returns:
            Degree of the vertex
        """
        if vertex not in self.adjacency_list:
            return 0
        
        degree = len(self.adjacency_list[vertex])
        
        # For undirected graphs, degree is just the number of neighbors
        # For directed graphs, we might want in-degree + out-degree
        if self.directed:
            # Count in-degree
            in_degree = sum(1 for v in self.adjacency_list.values() if vertex in v)
            return degree + in_degree
        
        return degree
    
    def __str__(self) -> str:
        """String representation of the graph."""
        graph_type = "Directed" if self.directed else "Undirected"
        return f"{graph_type} Graph with {len(self.vertices)} vertices and {len(self.get_edges())} edges"
    
    def __repr__(self) -> str:
        """Detailed representation of the graph."""
        return f"Graph(directed={self.directed}, vertices={len(self.vertices)}, edges={len(self.get_edges())})"

