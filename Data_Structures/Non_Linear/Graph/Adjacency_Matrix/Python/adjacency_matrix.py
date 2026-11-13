"""
Adjacency Matrix representation of a Graph.

An Adjacency Matrix is a 2D array where matrix[i][j] represents an edge
from vertex i to vertex j. For unweighted graphs, values are 0 or 1.
For weighted graphs, values are edge weights (or infinity if no edge).
"""

from typing import List, Optional, Set
from collections import deque


class AdjacencyMatrix:
    """Graph representation using Adjacency Matrix.
    
    Adjacency Matrix uses a 2D array to represent graph edges.
    Supports both directed/undirected and weighted/unweighted graphs.
    
    Supports:
    - Add edge: O(1)
    - Remove edge: O(1)
    - Check edge: O(1)
    - Get neighbors: O(V)
    - Space: O(V^2) (plus a V x V presence table)
    """
    
    def __init__(self, num_vertices: int, directed: bool = False, weighted: bool = False):
        """Initialize Adjacency Matrix.
        
        Args:
            num_vertices: Number of vertices in the graph
            directed: If True, creates a directed graph. If False, creates undirected graph.
            weighted: If True, edges can have weights. If False, edges are unweighted.
        """
        self.num_vertices = num_vertices
        self.directed = directed
        self.weighted = weighted
        
        # Initialize matrix
        if weighted:
            # For weighted: use infinity for no edge
            self.matrix = [[float('inf')] * num_vertices for _ in range(num_vertices)]
            # Diagonal is 0 (distance from vertex to itself)
            for i in range(num_vertices):
                self.matrix[i][i] = 0
        else:
            # For unweighted: use 0 for no edge, 1 for edge
            self.matrix = [[0] * num_vertices for _ in range(num_vertices)]
        
        # Weighted graphs need a separate presence table: weight 0 (or any value)
        # must stay distinguishable from "no edge".
        self.present = [[False] * num_vertices for _ in range(num_vertices)]
    
    def add_edge(self, from_vertex: int, to_vertex: int, weight: float = 1.0) -> None:
        """Add an edge to the graph.
        
        Args:
            from_vertex: Source vertex (0-indexed)
            to_vertex: Destination vertex (0-indexed)
            weight: Weight of the edge (default: 1.0, ignored if unweighted)
        """
        if not (0 <= from_vertex < self.num_vertices and 0 <= to_vertex < self.num_vertices):
            raise ValueError(f"Vertices must be in range [0, {self.num_vertices})")
        
        self._set_cell(from_vertex, to_vertex, weight)

        # For undirected graph, add reverse edge
        if not self.directed:
            self._set_cell(to_vertex, from_vertex, weight)

    def _set_cell(self, u: int, v: int, weight: float) -> None:
        self.present[u][v] = True
        self.matrix[u][v] = weight if self.weighted else 1

    def _clear_cell(self, u: int, v: int) -> None:
        self.present[u][v] = False
        if self.weighted:
            self.matrix[u][v] = 0 if u == v else float('inf')
        else:
            self.matrix[u][v] = 0
    
    def remove_edge(self, from_vertex: int, to_vertex: int) -> None:
        """Remove an edge from the graph.
        
        Args:
            from_vertex: Source vertex
            to_vertex: Destination vertex
        """
        if not (0 <= from_vertex < self.num_vertices and 0 <= to_vertex < self.num_vertices):
            return
        
        self._clear_cell(from_vertex, to_vertex)

        # For undirected graph, remove reverse edge
        if not self.directed:
            self._clear_cell(to_vertex, from_vertex)
    
    def has_edge(self, from_vertex: int, to_vertex: int) -> bool:
        """Check if an edge exists between two vertices.
        
        Args:
            from_vertex: Source vertex
            to_vertex: Destination vertex
            
        Returns:
            True if edge exists, False otherwise
        """
        if not (0 <= from_vertex < self.num_vertices and 0 <= to_vertex < self.num_vertices):
            return False
        
        return self.present[from_vertex][to_vertex]
    
    def get_weight(self, from_vertex: int, to_vertex: int) -> Optional[float]:
        """Get the weight of an edge.
        
        Args:
            from_vertex: Source vertex
            to_vertex: Destination vertex
            
        Returns:
            Weight of the edge, or None if edge doesn't exist or graph is unweighted
        """
        if not self.weighted:
            return None
        
        if not (0 <= from_vertex < self.num_vertices and 0 <= to_vertex < self.num_vertices):
            return None
        
        if not self.present[from_vertex][to_vertex]:
            return None

        return self.matrix[from_vertex][to_vertex]
    
    def get_neighbors(self, vertex: int) -> List[int]:
        """Get all neighbors of a vertex.
        
        Args:
            vertex: Vertex to get neighbors for
            
        Returns:
            List of neighbor vertices
        """
        if not (0 <= vertex < self.num_vertices):
            return []
        
        neighbors = []
        for i in range(self.num_vertices):
            if self.has_edge(vertex, i):
                neighbors.append(i)
        
        return neighbors
    
    def get_degree(self, vertex: int) -> int:
        """Get the degree of a vertex.
        
        Args:
            vertex: Vertex to get degree for
            
        Returns:
            Degree of the vertex
        """
        if not (0 <= vertex < self.num_vertices):
            return 0
        
        degree = 0
        for i in range(self.num_vertices):
            if self.has_edge(vertex, i):
                degree += 1
        
        if self.directed:
            # Count in-degree
            in_degree = 0
            for i in range(self.num_vertices):
                if self.has_edge(i, vertex):
                    in_degree += 1
            return degree + in_degree
        
        return degree
    
    def bfs(self, start_vertex: int) -> List[int]:
        """Breadth-First Search traversal.
        
        Args:
            start_vertex: Starting vertex for BFS
            
        Returns:
            List of vertices in BFS order
        """
        if not (0 <= start_vertex < self.num_vertices):
            return []
        
        visited = [False] * self.num_vertices
        queue = deque([start_vertex])
        result = []
        
        visited[start_vertex] = True
        
        while queue:
            vertex = queue.popleft()
            result.append(vertex)
            
            for neighbor in self.get_neighbors(vertex):
                if not visited[neighbor]:
                    visited[neighbor] = True
                    queue.append(neighbor)
        
        return result
    
    def dfs(self, start_vertex: int) -> List[int]:
        """Depth-First Search traversal (iterative).
        
        Args:
            start_vertex: Starting vertex for DFS
            
        Returns:
            List of vertices in DFS order
        """
        if not (0 <= start_vertex < self.num_vertices):
            return []
        
        visited = [False] * self.num_vertices
        stack = [start_vertex]
        result = []
        
        while stack:
            vertex = stack.pop()
            
            if not visited[vertex]:
                visited[vertex] = True
                result.append(vertex)
                
                # Add neighbors in reverse order
                neighbors = self.get_neighbors(vertex)
                for neighbor in reversed(neighbors):
                    if not visited[neighbor]:
                        stack.append(neighbor)
        
        return result
    
    def dfs_recursive(self, start_vertex: int) -> List[int]:
        """Depth-First Search traversal (recursive).
        
        Args:
            start_vertex: Starting vertex for DFS
            
        Returns:
            List of vertices in DFS order
        """
        if not (0 <= start_vertex < self.num_vertices):
            return []
        
        visited = [False] * self.num_vertices
        result = []
        
        def _dfs(vertex: int):
            visited[vertex] = True
            result.append(vertex)
            
            for neighbor in self.get_neighbors(vertex):
                if not visited[neighbor]:
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
        
        if self.num_vertices == 0:
            return True
        
        visited = set(self.bfs(0))
        return len(visited) == self.num_vertices
    
    def get_matrix(self) -> List[List[float]]:
        """Get the adjacency matrix.
        
        Returns:
            2D list representing the adjacency matrix
        """
        return [row[:] for row in self.matrix]  # Return copy
    
    def __str__(self) -> str:
        """String representation of the graph."""
        graph_type = "Directed" if self.directed else "Undirected"
        weight_type = "Weighted" if self.weighted else "Unweighted"
        return f"{weight_type} {graph_type} Graph (Adjacency Matrix) with {self.num_vertices} vertices"
    
    def __repr__(self) -> str:
        """Detailed representation of the graph."""
        return f"AdjacencyMatrix(vertices={self.num_vertices}, directed={self.directed}, weighted={self.weighted})"

