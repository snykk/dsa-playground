#include <cassert>
#include <vector>
#include "n_queens.cpp"

bool isSafe(const vector<vector<int>>& board, int row, int col, int n);

static bool isValidBoard(const vector<vector<int>>& b) {
    int n = b.size();
    vector<pair<int, int>> q;
    for (int r = 0; r < n; r++)
        for (int c = 0; c < n; c++)
            if (b[r][c] == 1) q.push_back({r, c});
    if ((int)q.size() != n) return false;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (q[i].first == q[j].first || q[i].second == q[j].second ||
                abs(q[i].first - q[j].first) == abs(q[i].second - q[j].second))
                return false;
    return true;
}

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

void testCountsMatchOeis() {
    int expected[] = {1, 1, 0, 0, 2, 10, 4, 40, 92, 352};  // A000170
    for (int n = 0; n < 10; n++) {
        assert((int)solveNQueens(n, true).size() == expected[n]);
    }
}

void testNoSolutionFor2And3() {
    assert(solveNQueens(2).empty());
    assert(solveNQueens(3).empty());
}

void testBoardsAreValid() {
    for (const auto& b : solveNQueens(6, true)) assert(isValidBoard(b));
    assert(isValidBoard(solveNQueens(8)[0]));
}

void testFirstSolutionIsLexicographicallyFirst() {
    auto b = solveNQueens(4)[0];
    int cols[4];
    for (int r = 0; r < 4; r++)
        for (int c = 0; c < 4; c++)
            if (b[r][c] == 1) cols[r] = c;
    assert(cols[0] == 1 && cols[1] == 3 && cols[2] == 0 && cols[3] == 2);
}

int main() {
    testN4Solutions();
    testN4FirstSolution();
    testN8HasSolutions();
    testIsSafe();
    testCountsMatchOeis();
    testNoSolutionFor2And3();
    testBoardsAreValid();
    testFirstSolutionIsLexicographicallyFirst();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

