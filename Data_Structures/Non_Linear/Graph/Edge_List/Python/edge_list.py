"""
Edge List representation of a Graph.

An Edge List is a simple way to represent a graph by storing all edges in a list.
Each edge is represented as a tuple (from_vertex, to_vertex) or (from_vertex, to_vertex, weight).
"""

from typing import List, Tuple, Optional, Set
from collections import deque


class EdgeList:
    """Graph representation using Edge List.
    
    Edge List stores all edges in a simple list structure.
    Supports both directed/undirected and weighted/unweighted graphs.
    
    Supports:
    - Add edge: O(E) (an existing edge is replaced first)
    - Remove edge: O(E)
    - Check edge: O(E)
    - Get neighbors: O(E)
    - Get all edges: O(E) (a copy is returned)
    """
    
    def __init__(self, directed: bool = False, weighted: bool = False):
        """Initialize Edge List.
        
        Args:
            directed: If True, creates a directed graph. If False, creates undirected graph.
            weighted: If True, edges can have weights. If False, edges are unweighted.
        """
        self.directed = directed
        self.weighted = weighted
        self.edges: List[Tuple] = []  # List of edges
        self.vertices: Set[int] = set()
    
    def add_edge(self, from_vertex: int, to_vertex: int, weight: Optional[float] = None) -> None:
        """Add an edge to the graph.
        
        Args:
            from_vertex: Source vertex
            to_vertex: Destination vertex
            weight: Weight of the edge (required if weighted=True, ignored if weighted=False)
        """
        # Add vertices
        self.vertices.add(from_vertex)
        self.vertices.add(to_vertex)
        
        # Remove existing edge if present
        self.remove_edge(from_vertex, to_vertex)
        
        # Add edge
        if self.weighted:
            if weight is None:
                weight = 1.0  # Default weight
            edge = (from_vertex, to_vertex, weight)
        else:
            edge = (from_vertex, to_vertex)
        
        self.edges.append(edge)
        
        # For undirected graph, add reverse edge
        if not self.directed:
            if self.weighted:
                reverse_edge = (to_vertex, from_vertex, weight)
            else:
                reverse_edge = (to_vertex, from_vertex)
            
            # Remove existing reverse edge if present
            self._remove_edge_from_list(to_vertex, from_vertex)
            self.edges.append(reverse_edge)
    
    def remove_edge(self, from_vertex: int, to_vertex: int) -> None:
        """Remove an edge from the graph.
        
        Args:
            from_vertex: Source vertex
            to_vertex: Destination vertex
        """
        self._remove_edge_from_list(from_vertex, to_vertex)
        
        # For undirected graph, remove reverse edge
        if not self.directed:
            self._remove_edge_from_list(to_vertex, from_vertex)
    
    def _remove_edge_from_list(self, from_vertex: int, to_vertex: int) -> None:
        """Helper method to remove edge from the list.
        
        Args:
            from_vertex: Source vertex
            to_vertex: Destination vertex
        """
        if self.weighted:
            self.edges = [e for e in self.edges if not (len(e) == 3 and e[0] == from_vertex and e[1] == to_vertex)]
        else:
            self.edges = [e for e in self.edges if not (len(e) == 2 and e[0] == from_vertex and e[1] == to_vertex)]
    
    def has_edge(self, from_vertex: int, to_vertex: int) -> bool:
        """Check if an edge exists between two vertices.
        
        Args:
            from_vertex: Source vertex
            to_vertex: Destination vertex
            
        Returns:
            True if edge exists, False otherwise
        """
        if self.weighted:
            return any(e[0] == from_vertex and e[1] == to_vertex for e in self.edges)
        else:
            return any(e[0] == from_vertex and e[1] == to_vertex for e in self.edges)
    
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
        
        for edge in self.edges:
            if len(edge) == 3 and edge[0] == from_vertex and edge[1] == to_vertex:
                return edge[2]
        
        return None
    
    def get_neighbors(self, vertex: int) -> List[int]:
        """Get all neighbors of a vertex.
        
        Args:
            vertex: Vertex to get neighbors for
            
        Returns:
            List of neighbor vertices
        """
        neighbors = []
        seen = set()
        
        for edge in self.edges:
            if self.weighted:
                from_v, to_v = edge[0], edge[1]
            else:
                from_v, to_v = edge[0], edge[1]
            
            if from_v == vertex and to_v not in seen:
                neighbors.append(to_v)
                seen.add(to_v)
        
        return neighbors
    
    def get_edges(self) -> List[Tuple]:
        """Get all edges in the graph.
        
        Returns:
            List of edges (as tuples)
        """
        return self.edges.copy()
    
    def get_vertices(self) -> Set[int]:
        """Get all vertices in the graph.
        
        Returns:
            Set of all vertices
        """
        return self.vertices.copy()
    
    def get_edge_count(self) -> int:
        """Get the number of edges.
        
        Returns:
            Number of edges
        """
        if self.directed:
            return len(self.edges)
        else:
            # An undirected edge u-v is stored twice, but a self-loop u-u only once
            loops = sum(1 for e in self.edges if e[0] == e[1])
            return (len(self.edges) - loops) // 2 + loops
    
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
                
                neighbors = self.get_neighbors(vertex)
                for neighbor in neighbors:
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
        
        # Start BFS from first vertex
        start = next(iter(self.vertices))
        visited = set(self.bfs(start))
        
        return len(visited) == len(self.vertices)
    
    def to_adjacency_list(self) -> dict:
        """Convert Edge List to Adjacency List representation.
        
        Returns:
            Dictionary mapping vertex to list of neighbors (or (neighbor, weight) if weighted)
        """
        adj_list = {}
        
        for edge in self.edges:
            if self.weighted:
                from_v, to_v, weight = edge
            else:
                from_v, to_v = edge
                weight = None
            
            if from_v not in adj_list:
                adj_list[from_v] = []
            
            if self.weighted:
                adj_list[from_v].append((to_v, weight))
            else:
                adj_list[from_v].append(to_v)
        
        return adj_list
    
    def __str__(self) -> str:
        """String representation of the graph."""
        graph_type = "Directed" if self.directed else "Undirected"
        weight_type = "Weighted" if self.weighted else "Unweighted"
        return f"{weight_type} {graph_type} Graph (Edge List) with {len(self.vertices)} vertices and {self.get_edge_count()} edges"
    
    def __repr__(self) -> str:
        """Detailed representation of the graph."""
        return f"EdgeList(directed={self.directed}, weighted={self.weighted}, vertices={len(self.vertices)}, edges={self.get_edge_count()})"

