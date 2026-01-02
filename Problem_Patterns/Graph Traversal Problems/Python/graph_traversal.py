"""
Graph Traversal Algorithms Implementation

This module contains implementations of:
1. Breadth-First Search (BFS) for shortest path in unweighted graph
2. Depth-First Search (DFS) for connectivity and traversal
3. Flood Fill (Grid Traversal) for finding connected components in 2D grid
4. Topological Sort for directed acyclic graphs
"""

from collections import deque
from typing import List, Dict, Set, Optional

# Graph represented as Adjacency List: Dict[int, List[int]]

def bfs_shortest_path(graph: Dict[int, List[int]], start: int, target: int) -> int:
    """
    Find shortest path distance from start to target using BFS.
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    
    Args:
        graph: Adjacency list
        start: Start node
        target: Target node
        
    Returns:
        Shortest distance (number of edges), or -1 if not reachable
    """
    if start not in graph or target not in graph:
        return -1
    if start == target:
        return 0

    queue = deque([(start, 0)])
    visited = {start}

    while queue:
        node, dist = queue.popleft()
        
        if node == target:
            return dist
        
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, dist + 1))
                
    return -1


def dfs_recursive(graph: Dict[int, List[int]], node: int, visited: Set[int], result: List[int]):
    """
    Helper function for recursive DFS traversal.
    """
    visited.add(node)
    result.append(node)
    
    for neighbor in graph.get(node, []):
        if neighbor not in visited:
            dfs_recursive(graph, neighbor, visited, result)


def get_dfs_traversal(graph: Dict[int, List[int]], start: int) -> List[int]:
    """
    Perform DFS traversal starting from start node.
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """
    visited = set()
    result = []
    if start in graph:
        dfs_recursive(graph, start, visited, result)
    return result


def num_islands(grid: List[List[str]]) -> int:
    """
    Count number of islands (connected '1's) in a binary grid using Flood Fill (DFS/BFS).
    Time Complexity: O(R * C)
    Space Complexity: O(R * C) (recursion stack)
    """
    if not grid or not grid[0]:
        return 0
        
    rows, cols = len(grid), len(grid[0])
    count = 0
    
    def dfs(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != '1':
            return
        
        grid[r][c] = '0' # Mark as visited (sink the island)
        
        # Explore 4 directions
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)
        
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                count += 1
                dfs(r, c)
                
    return count


def topological_sort(n: int, edges: List[List[int]]) -> List[int]:
    """
    Perform Topological Sort using Kahn's Algorithm (BFS).
    Time Complexity: O(V + E)
    Space Complexity: O(V + E)
    
    Args:
        n: Number of nodes (0 to n-1)
        edges: List of directed edges [u, v] (u -> v)
        
    Returns:
        Topological ordering, or empty list if cycle detected
    """
    if n <= 0:
        return []
        
    adj = {i: [] for i in range(n)}
    in_degree = {i: 0 for i in range(n)}
    
    for u, v in edges:
        adj[u].append(v)
        in_degree[v] += 1
        
    queue = deque([node for node in range(n) if in_degree[node] == 0])
    result = []
    
    while queue:
        node = queue.popleft()
        result.append(node)
        
        for neighbor in adj[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
                
    if len(result) != n:
        return [] # Cycle detected
        
    return result


def main():
    print("=== BFS Shortest Path ===")
    graph = {
        0: [1, 2],
        1: [0, 3],
        2: [0, 3],
        3: [1, 2, 4],
        4: [3]
    }
    dist = bfs_shortest_path(graph, 0, 4)
    print(f"Shortest path from 0 to 4: {dist}") # Expected: 2 (0->1->3->4 or 0->2->3->4 is 3 edges, wait. 0->1->3->4: dist 3. 0->2->3->4: dist 3. Ah, bfs goes level by level. 0(0)->1(1)->3(2)->4(3). Correct dist is 3.)
    
    print("\n=== DFS Traversal ===")
    order = get_dfs_traversal(graph, 0)
    print(f"DFS starting from 0: {order}")
    
    print("\n=== Number of Islands ===")
    grid = [
        ["1","1","0","0","0"],
        ["1","1","0","0","0"],
        ["0","0","1","0","0"],
        ["0","0","0","1","1"]
    ]
    # Copy grid to avoid modification if needed for display, but function modifies it
    print(f"Islands count: {num_islands([row[:] for row in grid])}") # Expected: 3
    
    print("\n=== Topological Sort ===")
    # 5 --0--> 4, 0 --1--> 2, 1 --3--> 3, etc.
    # Course Schedule example: 
    # 4 courses: 0, 1, 2, 3
    # 1 -> 0, 2 -> 0, 3 -> 1, 3 -> 2
    n = 4
    edges = [[1, 0], [2, 0], [3, 1], [3, 2]]
    topo = topological_sort(n, edges)
    print(f"Topological Sort: {topo}") # Expected: [3, 1, 2, 0] or [3, 2, 1, 0]

if __name__ == "__main__":
    main()
