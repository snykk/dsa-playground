#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

bool isSafe(const vector<vector<int>>& board, int row, int col, int n) {
    // Check column
    for (int i = 0; i < row; i++) {
        if (board[i][col] == 1) {
            return false;
        }
    }
    
    // Check upper-left diagonal
    for (int i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
        if (board[i][j] == 1) {
            return false;
        }
    }
    
    // Check upper-right diagonal
    for (int i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
        if (board[i][j] == 1) {
            return false;
        }
    }
    
    return true;
}

bool solveNQueensUtil(vector<vector<int>>& board, int row, int n, vector<vector<vector<int>>>& solutions, bool findAll) {
    if (row == n) {
        solutions.push_back(board);
        return !findAll;  // Return true to stop if finding first solution only
    }
    
    for (int col = 0; col < n; col++) {
        if (isSafe(board, row, col, n)) {
            board[row][col] = 1;
            
            if (solveNQueensUtil(board, row + 1, n, solutions, findAll)) {
                return true;
            }
            
            // Backtrack
            board[row][col] = 0;
        }
    }
    
    return false;
}

vector<vector<vector<int>>> solveNQueens(int n, bool findAll = false) {
    vector<vector<int>> board(n, vector<int>(n, 0));
    vector<vector<vector<int>>> solutions;
    
    solveNQueensUtil(board, 0, n, solutions, findAll);
    
    return solutions;
}

void printSolution(const vector<vector<int>>& board) {
    int n = board.size();
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            cout << (board[i][j] == 1 ? "Q " : ". ");
        }
        cout << endl;
    }
}

#ifndef TESTING
#ifndef IS_TEST_BUILD
int main() {
    cout << "N-Queens Problem Examples:" << endl;
    cout << endl;
    
    int n = 4;
    cout << "Solving " << n << "-Queens problem:" << endl;
    auto solutions = solveNQueens(n, true);
    cout << "Found " << solutions.size() << " solution(s)" << endl;
    
    if (!solutions.empty()) {
        cout << "\nFirst solution:" << endl;
        printSolution(solutions[0]);
    }
    
    return 0;
}
#endif
#endif  // !IS_TEST_BUILD
