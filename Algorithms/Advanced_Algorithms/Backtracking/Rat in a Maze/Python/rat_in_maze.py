"""
Rat in a Maze

Backtracking algorithm to find a path from source to destination in a maze.
"""

from typing import List, Optional, Tuple


def is_safe(maze: List[List[int]], x: int, y: int, n: int) -> bool:
    """Check if (x, y) is a valid position."""
    return 0 <= x < n and 0 <= y < n and maze[x][y] == 1


def solve_maze_util(maze: List[List[int]], x: int, y: int, n: int, 
                    solution: List[List[int]]) -> bool:
    """Backtracking utility function."""
    # Base case: reached destination
    if x == n - 1 and y == n - 1:
        solution[x][y] = 1
        return True
    
    if is_safe(maze, x, y, n):
        # Mark current cell as part of solution
        solution[x][y] = 1
        
        # Move right
        if solve_maze_util(maze, x, y + 1, n, solution):
            return True
        
        # Move down
        if solve_maze_util(maze, x + 1, y, n, solution):
            return True
        
        # If none of the above work, backtrack
        solution[x][y] = 0
        return False
    
    return False


def solve_maze(maze: List[List[int]]) -> Optional[List[List[int]]]:
    """
    Solve Rat in a Maze problem.
    
    Args:
        maze: N×N maze where 1 represents open path and 0 represents wall
        
    Returns:
        Solution path matrix if solution exists, None otherwise
    """
    n = len(maze)
    if n == 0 or maze[0][0] == 0 or maze[n-1][n-1] == 0:
        return None
    
    solution = [[0 for _ in range(n)] for _ in range(n)]
    
    if solve_maze_util(maze, 0, 0, n, solution):
        return solution
    
    return None


def print_solution(solution: List[List[int]]) -> None:
    """Print solution path."""
    n = len(solution)
    for i in range(n):
        for j in range(n):
            print(solution[i][j], end=" ")
        print()


def main():
    """Example usage."""
    print("Rat in a Maze Examples:")
    print()
    
    maze = [
        [1, 0, 0, 0],
        [1, 1, 0, 1],
        [0, 1, 0, 0],
        [1, 1, 1, 1]
    ]
    
    print("Maze:")
    for row in maze:
        print(row)
    print()
    
    solution = solve_maze(maze)
    if solution:
        print("Solution path:")
        print_solution(solution)
    else:
        print("No solution exists")


if __name__ == "__main__":
    main()
