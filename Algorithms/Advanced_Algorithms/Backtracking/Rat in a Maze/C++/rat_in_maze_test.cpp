#include <cassert>
#include <vector>
#include "rat_in_maze.cpp"

void testSolveMazeValid() {
    vector<vector<int>> maze = {
        {1, 0, 0, 0},
        {1, 1, 0, 1},
        {0, 1, 0, 0},
        {1, 1, 1, 1}
    };
    auto solution = solveMaze(maze);
    assert(solution.has_value());
    assert(solution.value()[0][0] == 1);
    assert(solution.value()[3][3] == 1);
}

void testSolveMazeNoSolution() {
    vector<vector<int>> maze = {
        {1, 0, 0, 0},
        {0, 0, 0, 0},
        {0, 0, 0, 0},
        {0, 0, 0, 1}
    };
    auto solution = solveMaze(maze);
    assert(!solution.has_value());
}

void testIsSafe() {
    vector<vector<int>> maze = {
        {1, 0, 0},
        {1, 1, 0},
        {0, 1, 1}
    };
    assert(isSafe(maze, 0, 0, 3));
    assert(!isSafe(maze, 0, 1, 3));  // Wall
    assert(!isSafe(maze, -1, 0, 3));  // Out of bounds
}

int main() {
    testSolveMazeValid();
    testSolveMazeNoSolution();
    testIsSafe();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

