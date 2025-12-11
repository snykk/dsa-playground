"""
A* Search Algorithm Implementation

A* is an informed search algorithm that finds the shortest path from a start
node to a goal node using a heuristic function to guide the search.
"""

from typing import List, Dict, Tuple, Optional, Callable
import heapq


def astar(graph: Dict[int, List[Tuple[int, int]]], 
          start: int, 
          goal: int,
          heuristic: Callable[[int], int]) -> Optional[Tuple[int, List[int]]]:
    """
    A* search algorithm to find shortest path from start to goal
    
    Args:
        graph: Dictionary mapping vertex to list of (neighbor, weight) tuples
        start: Starting vertex
        goal: Goal vertex
        heuristic: Heuristic function h(n) that estimates distance from n to goal
        
    Returns:
        Tuple of (distance, path) or None if no path exists
        
    Time Complexity: O(b^d) where b is branching factor, d is depth
    Space Complexity: O(b^d)
    """
    # Priority queue: (f_score, g_score, vertex, path)
    # f_score = g_score + h_score
    pq = [(0, 0, start, [start])]
    visited = set()
    g_scores = {start: 0}
    
    while pq:
        f_score, g_score, current, path = heapq.heappop(pq)
        
        if current == goal:
            return (g_score, path)
        
        if current in visited:
            continue
        
        visited.add(current)
        
        for neighbor, weight in graph.get(current, []):
            if neighbor in visited:
                continue
            
            tentative_g = g_score + weight
            
            if neighbor not in g_scores or tentative_g < g_scores[neighbor]:
                g_scores[neighbor] = tentative_g
                h_score = heuristic(neighbor)
                f_score = tentative_g + h_score
                
                new_path = path + [neighbor]
                heapq.heappush(pq, (f_score, tentative_g, neighbor, new_path))
    
    return None  # No path found


def manhattan_distance(pos1: Tuple[int, int], pos2: Tuple[int, int]) -> int:
    """
    Manhattan distance heuristic for grid-based problems
    """
    return abs(pos1[0] - pos2[0]) + abs(pos1[1] - pos2[1])


def euclidean_distance(pos1: Tuple[int, int], pos2: Tuple[int, int]) -> float:
    """
    Euclidean distance heuristic
    """
    return ((pos1[0] - pos2[0]) ** 2 + (pos1[1] - pos2[1]) ** 2) ** 0.5


