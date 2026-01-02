#include <iostream>
#include <vector>
#include <optional>

using namespace std;

bool isValid(const vector<vector<int>>& board, int row, int col, int num) {
    // Check row
    for (int j = 0; j < 9; j++) {
        if (board[row][j] == num) {
            return false;
        }
    }
    
    // Check column
    for (int i = 0; i < 9; i++) {
        if (board[i][col] == num) {
            return false;
        }
    }
    
    // Check 3x3 box
    int boxRow = (row / 3) * 3;
    int boxCol = (col / 3) * 3;
    for (int i = boxRow; i < boxRow + 3; i++) {
        for (int j = boxCol; j < boxCol + 3; j++) {
            if (board[i][j] == num) {
                return false;
            }
        }
    }
    
    return true;
}

optional<pair<int, int>> findEmpty(const vector<vector<int>>& board) {
    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            if (board[i][j] == 0) {
                return make_pair(i, j);
            }
        }
    }
    return nullopt;
}

bool solveSudoku(vector<vector<int>>& board) {
    auto empty = findEmpty(board);
    if (!empty.has_value()) {
        return true;  // Puzzle solved
    }
    
    int row = empty->first;
    int col = empty->second;
    
    for (int num = 1; num <= 9; num++) {
        if (isValid(board, row, col, num)) {
            board[row][col] = num;
            
            if (solveSudoku(board)) {
                return true;
            }
            
            // Backtrack
            board[row][col] = 0;
        }
    }
    
    return false;
}

void printBoard(const vector<vector<int>>& board) {
    for (int i = 0; i < 9; i++) {
        if (i % 3 == 0 && i != 0) {
            cout << "- - - - - - - - - - -" << endl;
        }
        for (int j = 0; j < 9; j++) {
            if (j % 3 == 0 && j != 0) {
                cout << "| ";
            }
            cout << (board[i][j] == 0 ? "." : to_string(board[i][j])) << " ";
        }
        cout << endl;
    }
}

int main() {
    cout << "Sudoku Solver Examples:" << endl;
    cout << endl;
    
    vector<vector<int>> board = {
        {5, 3, 0, 0, 7, 0, 0, 0, 0},
        {6, 0, 0, 1, 9, 5, 0, 0, 0},
        {0, 9, 8, 0, 0, 0, 0, 6, 0},
        {8, 0, 0, 0, 6, 0, 0, 0, 3},
        {4, 0, 0, 8, 0, 3, 0, 0, 1},
        {7, 0, 0, 0, 2, 0, 0, 0, 6},
        {0, 6, 0, 0, 0, 0, 2, 8, 0},
        {0, 0, 0, 4, 1, 9, 0, 0, 5},
        {0, 0, 0, 0, 8, 0, 0, 7, 9}
    };
    
    cout << "Original puzzle:" << endl;
    printBoard(board);
    cout << endl;
    
    if (solveSudoku(board)) {
        cout << "Solution:" << endl;
        printBoard(board);
    } else {
        cout << "No solution exists" << endl;
    }
    
    return 0;
}
