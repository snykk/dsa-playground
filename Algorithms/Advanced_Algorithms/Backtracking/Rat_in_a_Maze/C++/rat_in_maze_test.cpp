#include <cassert>
#include <vector>
#include "rat_in_maze.cpp"

// Marked cells are open, include both corners and connect them through marked cells.
static bool pathIsValid(const vector<vector<int>>& maze, const vector<vector<int>>& sol) {
    int n = maze.size();
    if (sol[0][0] != 1 || sol[n-1][n-1] != 1) return false;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            if (sol[i][j] == 1 && maze[i][j] != 1) return false;
    vector<vector<bool>> seen(n, vector<bool>(n, false));
    vector<pair<int, int>> stack = {{0, 0}};
    seen[0][0] = true;
    int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
    while (!stack.empty()) {
        auto [x, y] = stack.back();
        stack.pop_back();
        for (int d = 0; d < 4; d++) {
            int nx = x + dx[d], ny = y + dy[d];
            if (nx >= 0 && nx < n && ny >= 0 && ny < n && sol[nx][ny] == 1 && !seen[nx][ny]) {
                seen[nx][ny] = true;
                stack.push_back({nx, ny});
            }
        }
    }
    return seen[n-1][n-1];
}

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

void testPathNeedingUpAndLeftMoves() {
    vector<vector<int>> maze = {
        {1, 0, 1, 1, 1},
        {1, 0, 1, 0, 1},
        {1, 0, 1, 0, 1},
        {1, 1, 1, 0, 1},
        {0, 0, 0, 0, 1}
    };
    auto solution = solveMaze(maze);
    assert(solution.has_value());
    assert(pathIsValid(maze, solution.value()));
}

void testReturnedPathIsValid() {
    vector<vector<int>> maze = {
        {1, 0, 0, 0},
        {1, 1, 0, 1},
        {0, 1, 0, 0},
        {1, 1, 1, 1}
    };
    assert(pathIsValid(maze, solveMaze(maze).value()));
}

void testUnreachableDestinationIsFast() {
    int n = 30;
    vector<vector<int>> maze(n, vector<int>(n, 1));
    maze[n - 2][n - 1] = 0;
    maze[n - 1][n - 2] = 0;
    assert(!solveMaze(maze).has_value());
}

void testEdgeCases() {
    assert(solveMaze({{1}}).value()[0][0] == 1);
    assert(!solveMaze({{0}}).has_value());
    assert(!solveMaze({}).has_value());
    assert(!solveMaze({{1, 1, 1}, {1, 1, 1}}).has_value());  // not square
}

int main() {
    testSolveMazeValid();
    testSolveMazeNoSolution();
    testIsSafe();
    testPathNeedingUpAndLeftMoves();
    testReturnedPathIsValid();
    testUnreachableDestinationIsFast();
    testEdgeCases();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

