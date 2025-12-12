"""
Ford-Fulkerson Algorithm Implementation

Ford-Fulkerson algorithm finds the maximum flow in a flow network.
It uses DFS to find augmenting paths and updates flow along these paths.
"""

from typing import Dict, List, Tuple, Optional, Set


def ford_fulkerson(graph: Dict[int, Dict[int, int]], source: int, sink: int) -> int:
    """
    Find maximum flow using Ford-Fulkerson algorithm with DFS
    
    Args:
        graph: Dictionary mapping vertex to dictionary of (neighbor, capacity) pairs
        source: Source vertex
        sink: Sink vertex
        
    Returns:
        Maximum flow value
        
    Time Complexity: O(E × max_flow) in worst case
    Space Complexity: O(V + E)
    """
    if source == sink:
        return 0
    
    # Create residual graph (copy of original graph)
    residual = {u: {v: cap for v, cap in neighbors.items()} 
                for u, neighbors in graph.items()}
    
    # Add reverse edges with capacity 0
    for u in graph:
        for v in graph[u]:
            if v not in residual:
                residual[v] = {}
            if u not in residual[v]:
                residual[v][u] = 0
    
    max_flow = 0
    
    def dfs_find_path(u: int, visited: Set[int], path: List[int]) -> Optional[List[int]]:
        """DFS to find augmenting path"""
        if u == sink:
            return path
        
        visited.add(u)
        
        for v, capacity in residual.get(u, {}).items():
            if v not in visited and capacity > 0:
                result = dfs_find_path(v, visited, path + [v])
                if result:
                    return result
        
        return None
    
    # Find augmenting paths until no more exist
    while True:
        visited = set()
        path = dfs_find_path(source, visited, [source])
        
        if not path:
            break
        
        # Find minimum capacity along path
        min_capacity = float('inf')
        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            min_capacity = min(min_capacity, residual[u][v])
        
        # Update residual graph
        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            residual[u][v] -= min_capacity
            residual[v][u] += min_capacity
        
        max_flow += min_capacity
    
    return max_flow


def ford_fulkerson_with_path(graph: Dict[int, Dict[int, int]], 
                             source: int, sink: int) -> Tuple[int, List[List[int]]]:
    """
    Find maximum flow and return augmenting paths used
    
    Args:
        graph: Dictionary mapping vertex to dictionary of (neighbor, capacity) pairs
        source: Source vertex
        sink: Sink vertex
        
    Returns:
        Tuple of (max_flow, list of augmenting paths)
        
    Time Complexity: O(E × max_flow)
    Space Complexity: O(V + E)
    """
    if source == sink:
        return 0, []
    
    residual = {u: {v: cap for v, cap in neighbors.items()} 
                for u, neighbors in graph.items()}
    
    for u in graph:
        for v in graph[u]:
            if v not in residual:
                residual[v] = {}
            if u not in residual[v]:
                residual[v][u] = 0
    
    max_flow = 0
    paths = []
    
    def dfs_find_path(u: int, visited: Set[int], path: List[int]) -> Optional[Tuple[List[int], int]]:
        """DFS to find augmenting path with capacity"""
        if u == sink:
            return (path, float('inf'))
        
        visited.add(u)
        
        for v, capacity in residual.get(u, {}).items():
            if v not in visited and capacity > 0:
                result = dfs_find_path(v, visited, path + [v])
                if result:
                    path_result, min_cap = result
                    return (path_result, min(min_cap, capacity))
        
        return None
    
    while True:
        visited = set()
        result = dfs_find_path(source, visited, [source])
        
        if not result:
            break
        
        path, min_capacity = result
        
        # Update residual graph
        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            residual[u][v] -= min_capacity
            residual[v][u] += min_capacity
        
        max_flow += min_capacity
        paths.append((path, min_capacity))
    
    return max_flow, paths


def min_cut(graph: Dict[int, Dict[int, int]], source: int, sink: int) -> Tuple[int, Set[int], Set[int]]:
    """
    Find minimum cut (max-flow min-cut theorem)
    
    Args:
        graph: Dictionary mapping vertex to dictionary of (neighbor, capacity) pairs
        source: Source vertex
        sink: Sink vertex
        
    Returns:
        Tuple of (min_cut_value, source_side, sink_side)
        
    Time Complexity: O(E × max_flow)
    Space Complexity: O(V + E)
    """
    # Find max flow and get residual graph
    if source == sink:
        return 0, {source}, set()
    
    residual = {u: {v: cap for v, cap in neighbors.items()} 
                for u, neighbors in graph.items()}
    
    for u in graph:
        for v in graph[u]:
            if v not in residual:
                residual[v] = {}
            if u not in residual[v]:
                residual[v][u] = 0
    
    max_flow = 0
    
    def dfs_find_path(u: int, visited: Set[int], path: List[int]) -> Optional[List[int]]:
        if u == sink:
            return path
        visited.add(u)
        for v, capacity in residual.get(u, {}).items():
            if v not in visited and capacity > 0:
                result = dfs_find_path(v, visited, path + [v])
                if result:
                    return result
        return None
    
    # Find max flow
    while True:
        visited = set()
        path = dfs_find_path(source, visited, [source])
        if not path:
            break
        
        min_capacity = float('inf')
        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            min_capacity = min(min_capacity, residual[u][v])
        
        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            residual[u][v] -= min_capacity
            residual[v][u] += min_capacity
        
        max_flow += min_capacity
    
    # Find reachable vertices from source in residual graph
    def dfs_reachable(u: int, visited: Set[int]):
        visited.add(u)
        for v, capacity in residual.get(u, {}).items():
            if v not in visited and capacity > 0:
                dfs_reachable(v, visited)
    
    reachable = set()
    dfs_reachable(source, reachable)
    
    source_side = reachable
    sink_side = set(graph.keys()) - reachable
    
    return max_flow, source_side, sink_side


if __name__ == "__main__":
    # Example usage
    graph = {
        0: {1: 16, 2: 13},
        1: {2: 10, 3: 12},
        2: {1: 4, 4: 14},
        3: {2: 9, 5: 20},
        4: {3: 7, 5: 4}
    }
    
    print("Ford-Fulkerson Algorithm Example:")
    print(f"Graph: {graph}")
    
    # Find maximum flow
    max_flow = ford_fulkerson(graph, 0, 5)
    print(f"Maximum flow: {max_flow}")  # 23
    
    # Find minimum cut
    cut_value, source_side, sink_side = min_cut(graph, 0, 5)
    print(f"Minimum cut value: {cut_value}")
    print(f"Source side: {source_side}")
    print(f"Sink side: {sink_side}")

