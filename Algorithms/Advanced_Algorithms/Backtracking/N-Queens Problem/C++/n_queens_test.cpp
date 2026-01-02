#include <cassert>
#include <vector>
#include "n_queens.cpp"

bool isSafe(const vector<vector<int>>& board, int row, int col, int n);

void testN4Solutions() {
    auto solutions = solveNQueens(4, true);
    assert(solutions.size() == 2);  // 4-queens has 2 solutions
}

void testN4FirstSolution() {
    auto solutions = solveNQueens(4, false);
    assert(solutions.size() == 1);
    assert(solutions[0].size() == 4);
    assert(solutions[0][0].size() == 4);
}

void testN8HasSolutions() {
    auto solutions = solveNQueens(8, false);
    assert(!solutions.empty());
}

void testIsSafe() {
    vector<vector<int>> board(4, vector<int>(4, 0));
    assert(isSafe(board, 0, 0, 4));
    
    board[0][0] = 1;
    assert(!isSafe(board, 1, 0, 4));  // Same column
    assert(!isSafe(board, 1, 1, 4));  // Diagonal
}

int main() {
    testN4Solutions();
    testN4FirstSolution();
    testN8HasSolutions();
    testIsSafe();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

