"""
Weighted Graph implementation supporting both weighted and unweighted graphs.

A Weighted Graph is a graph where edges have associated weights (costs).
- Weighted Graph: Edges have weights (e.g., distance, cost)
- Unweighted Graph: All edges have equal weight (default: 1)
"""

from typing import List, Tuple, Optional, Dict
from collections import deque


class WeightedGraph:
    """Weighted Graph implementation supporting both weighted and unweighted edges.
    
    Supports:
    - Add vertex: O(1)
    - Add edge: O(1)
    - Remove edge: O(V)
    - Check edge: O(V)
    - Get neighbors: O(V)
    - Get edge weight: O(V)
    - BFS/DFS traversal: O(V + E)
    """
    
    def __init__(self, directed: bool = False):
        """Initialize Weighted Graph.
        
        Args:
            directed: If True, creates a directed graph. If False, creates undirected graph.
        """
        self.directed = directed
        self.adjacency_list = {}  # {vertex: [(neighbor, weight), ...]}
        self.vertices = set()
    
    def add_vertex(self, vertex: int) -> None:
        """Add a vertex to the graph.
        
        Args:
            vertex: Vertex to add
        """
        if vertex not in self.vertices:
            self.vertices.add(vertex)
            self.adjacency_list[vertex] = []
    
    def add_edge(self, from_vertex: int, to_vertex: int, weight: float = 1.0) -> None:
        """Add a weighted edge between two vertices.
        
        Args:
            from_vertex: Source vertex
            to_vertex: Destination vertex
            weight: Weight of the edge (default: 1.0 for unweighted)
        """
        # Add vertices if they don't exist
        self.add_vertex(from_vertex)
        self.add_vertex(to_vertex)
        
        # Remove existing edge if present
        self.remove_edge(from_vertex, to_vertex)
        
        # Add edge with weight
        self.adjacency_list[from_vertex].append((to_vertex, weight))
        
        # For undirected graph, add reverse edge
        if not self.directed:
            self.remove_edge(to_vertex, from_vertex)
            self.adjacency_list[to_vertex].append((from_vertex, weight))
    
    def remove_edge(self, from_vertex: int, to_vertex: int) -> None:
        """Remove an edge between two vertices.
        
        Args:
            from_vertex: Source vertex
            to_vertex: Destination vertex
        """
        if from_vertex in self.adjacency_list:
            self.adjacency_list[from_vertex] = [
                (v, w) for v, w in self.adjacency_list[from_vertex] if v != to_vertex
            ]
        
        # For undirected graph, remove reverse edge
        if not self.directed:
            if to_vertex in self.adjacency_list:
                self.adjacency_list[to_vertex] = [
                    (v, w) for v, w in self.adjacency_list[to_vertex] if v != from_vertex
                ]
    
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
        return any(v == to_vertex for v, _ in self.adjacency_list[from_vertex])
    
    def get_weight(self, from_vertex: int, to_vertex: int) -> Optional[float]:
        """Get the weight of an edge.
        
        Args:
            from_vertex: Source vertex
            to_vertex: Destination vertex
            
        Returns:
            Weight of the edge, or None if edge doesn't exist
        """
        if from_vertex not in self.adjacency_list:
            return None
        
        for v, weight in self.adjacency_list[from_vertex]:
            if v == to_vertex:
                return weight
        
        return None
    
    def get_neighbors(self, vertex: int) -> List[int]:
        """Get all neighbors of a vertex.
        
        Args:
            vertex: Vertex to get neighbors for
            
        Returns:
            List of neighbor vertices
        """
        return [v for v, _ in self.adjacency_list.get(vertex, [])]
    
    def get_neighbors_with_weights(self, vertex: int) -> List[Tuple[int, float]]:
        """Get all neighbors with their edge weights.
        
        Args:
            vertex: Vertex to get neighbors for
            
        Returns:
            List of (neighbor, weight) tuples
        """
        return self.adjacency_list.get(vertex, [])
    
    def get_vertices(self) -> set:
        """Get all vertices in the graph.
        
        Returns:
            Set of all vertices
        """
        return self.vertices.copy()
    
    def get_edges(self) -> List[Tuple[int, int, float]]:
        """Get all edges with their weights.
        
        Returns:
            List of (from_vertex, to_vertex, weight) tuples
        """
        edges = []
        visited_edges = set()
        
        for from_vertex in self.adjacency_list:
            for to_vertex, weight in self.adjacency_list[from_vertex]:
                # For undirected graphs, avoid duplicate edges
                if not self.directed:
                    edge = tuple(sorted([from_vertex, to_vertex]))
                    if edge not in visited_edges:
                        edges.append((from_vertex, to_vertex, weight))
                        visited_edges.add(edge)
                else:
                    edges.append((from_vertex, to_vertex, weight))
        
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
                
                for neighbor, _ in self.adjacency_list.get(vertex, []):
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
                for neighbor, _ in reversed(self.adjacency_list.get(vertex, [])):
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
            
            for neighbor, _ in self.adjacency_list.get(vertex, []):
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
    
    def get_total_weight(self) -> float:
        """Get the total weight of all edges in the graph.
        
        Returns:
            Sum of all edge weights
        """
        total = 0.0
        visited_edges = set()
        
        for from_vertex in self.adjacency_list:
            for to_vertex, weight in self.adjacency_list[from_vertex]:
                if not self.directed:
                    edge = tuple(sorted([from_vertex, to_vertex]))
                    if edge not in visited_edges:
                        total += weight
                        visited_edges.add(edge)
                else:
                    total += weight
        
        return total
    
    def __str__(self) -> str:
        """String representation of the graph."""
        graph_type = "Directed" if self.directed else "Undirected"
        return f"Weighted {graph_type} Graph with {len(self.vertices)} vertices and {len(self.get_edges())} edges"
    
    def __repr__(self) -> str:
        """Detailed representation of the graph."""
        return f"WeightedGraph(directed={self.directed}, vertices={len(self.vertices)}, edges={len(self.get_edges())})"

