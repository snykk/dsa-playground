#include <iostream>
#include <vector>
#include <optional>

using namespace std;

bool isSafe(const vector<vector<int>>& maze, int x, int y, int n) {
    return x >= 0 && x < n && y >= 0 && y < n && maze[x][y] == 1;
}

bool solveMazeUtil(const vector<vector<int>>& maze, int x, int y, int n,
                   vector<vector<int>>& solution) {
    // Base case: reached destination
    if (x == n - 1 && y == n - 1) {
        solution[x][y] = 1;
        return true;
    }
    
    if (isSafe(maze, x, y, n)) {
        // Mark current cell as part of solution
        solution[x][y] = 1;
        
        // Move right
        if (solveMazeUtil(maze, x, y + 1, n, solution)) {
            return true;
        }
        
        // Move down
        if (solveMazeUtil(maze, x + 1, y, n, solution)) {
            return true;
        }
        
        // If none of the above work, backtrack
        solution[x][y] = 0;
        return false;
    }
    
    return false;
}

optional<vector<vector<int>>> solveMaze(const vector<vector<int>>& maze) {
    int n = maze.size();
    if (n == 0 || maze[0][0] == 0 || maze[n-1][n-1] == 0) {
        return nullopt;
    }
    
    vector<vector<int>> solution(n, vector<int>(n, 0));
    
    if (solveMazeUtil(maze, 0, 0, n, solution)) {
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
