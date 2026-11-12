#include <iostream>
#include <vector>
#include <optional>

using namespace std;

bool isSafe(const vector<vector<int>>& maze, int x, int y, int n) {
    return x >= 0 && x < n && y >= 0 && y < n && maze[x][y] == 1;
}

// Moves in order: right, down, left, up.
static const int DX[4] = {0, 1, 0, -1};
static const int DY[4] = {1, 0, -1, 0};

// Four directions; every cell is entered at most once, so the search is O(n^2).
// A cell that failed once fails again, so it stays in `visited` after backtracking.
bool solveMazeUtil(const vector<vector<int>>& maze, int x, int y, int n,
                   vector<vector<int>>& solution, vector<vector<bool>>& visited) {
    if (!isSafe(maze, x, y, n) || visited[x][y]) {
        return false;
    }

    visited[x][y] = true;
    solution[x][y] = 1;

    // Base case: reached destination
    if (x == n - 1 && y == n - 1) {
        return true;
    }

    for (int d = 0; d < 4; d++) {
        if (solveMazeUtil(maze, x + DX[d], y + DY[d], n, solution, visited)) {
            return true;
        }
    }

    // No direction works: this cell is not on the path
    solution[x][y] = 0;
    return false;
}

optional<vector<vector<int>>> solveMaze(const vector<vector<int>>& maze) {
    int n = maze.size();
    if (n == 0) {
        return nullopt;
    }
    for (const auto& row : maze) {
        if ((int)row.size() != n) {
            return nullopt;  // only square mazes are supported
        }
    }
    if (maze[0][0] == 0 || maze[n-1][n-1] == 0) {
        return nullopt;
    }

    vector<vector<int>> solution(n, vector<int>(n, 0));
    vector<vector<bool>> visited(n, vector<bool>(n, false));

    if (solveMazeUtil(maze, 0, 0, n, solution, visited)) {
        return solution;
    }

    return nullopt;
}

void printSolution(const vector<vector<int>>& solution) {
    int n = solution.size();
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            cout << solution[i][j] << " ";
        }
        cout << endl;
    }
}

#ifndef TESTING
#ifndef IS_TEST_BUILD
int main() {
    cout << "Rat in a Maze Examples:" << endl;
    cout << endl;
    
    vector<vector<int>> maze = {
        {1, 0, 0, 0},
        {1, 1, 0, 1},
        {0, 1, 0, 0},
        {1, 1, 1, 1}
    };
    
    cout << "Maze:" << endl;
    for (const auto& row : maze) {
        for (int cell : row) {
            cout << cell << " ";
        }
        cout << endl;
    }
    cout << endl;
    
    auto solution = solveMaze(maze);
    if (solution.has_value()) {
        cout << "Solution path:" << endl;
        printSolution(solution.value());
    } else {
        cout << "No solution exists" << endl;
    }
    
    return 0;
}
#endif
#endif  // !IS_TEST_BUILD
