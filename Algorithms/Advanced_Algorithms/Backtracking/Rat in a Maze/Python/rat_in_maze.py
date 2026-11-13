"""
Rat in a Maze

Backtracking algorithm to find a path from source to destination in a maze.
"""

from typing import List, Optional, Tuple


def is_safe(maze: List[List[int]], x: int, y: int, n: int) -> bool:
    """Check if (x, y) is a valid position."""
    return 0 <= x < n and 0 <= y < n and maze[x][y] == 1


MOVES = ((0, 1), (1, 0), (0, -1), (-1, 0))  # right, down, left, up


def solve_maze_util(maze: List[List[int]], x: int, y: int, n: int,
                    solution: List[List[int]], visited: List[List[bool]]) -> bool:
    """Backtracking utility function (four directions, every cell entered at most once)."""
    if not is_safe(maze, x, y, n) or visited[x][y]:
        return False

    # Never enter this cell again, even after backtracking: a cell that failed once
    # fails again, so this keeps the search at O(n^2) instead of exponential.
    visited[x][y] = True
    solution[x][y] = 1

    # Base case: reached destination
    if x == n - 1 and y == n - 1:
        return True

    for dx, dy in MOVES:
        if solve_maze_util(maze, x + dx, y + dy, n, solution, visited):
            return True

    # No direction works: this cell is not on the path
    solution[x][y] = 0
    return False


def solve_maze(maze: List[List[int]]) -> Optional[List[List[int]]]:
    """
    Solve Rat in a Maze problem.

    Args:
        maze: nxn maze where 1 represents open path and 0 represents wall

    Returns:
        Matrix with 1 on the cells of a path from (0, 0) to (n-1, n-1) (moves: right,
        down, left, up), or None if there is no path, the maze is empty, or it is not square.
    """
    n = len(maze)
    if n == 0 or any(len(row) != n for row in maze):
        return None
    if maze[0][0] == 0 or maze[n-1][n-1] == 0:
        return None

    solution = [[0 for _ in range(n)] for _ in range(n)]
    visited = [[False for _ in range(n)] for _ in range(n)]

    if solve_maze_util(maze, 0, 0, n, solution, visited):
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
