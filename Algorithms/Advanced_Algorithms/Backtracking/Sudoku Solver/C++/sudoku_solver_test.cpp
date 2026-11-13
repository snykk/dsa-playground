#include <cassert>
#include <vector>
#include "sudoku_solver.cpp"

static const vector<vector<int>> SOLUTION = {
    {5, 3, 4, 6, 7, 8, 9, 1, 2},
    {6, 7, 2, 1, 9, 5, 3, 4, 8},
    {1, 9, 8, 3, 4, 2, 5, 6, 7},
    {8, 5, 9, 7, 6, 1, 4, 2, 3},
    {4, 2, 6, 8, 5, 3, 7, 9, 1},
    {7, 1, 3, 9, 2, 4, 8, 5, 6},
    {9, 6, 1, 5, 3, 7, 2, 8, 4},
    {2, 8, 7, 4, 1, 9, 6, 3, 5},
    {3, 4, 5, 2, 8, 6, 1, 7, 9}
};

static const vector<vector<int>> PUZZLE = {
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

static bool isCompleteValidGrid(const vector<vector<int>>& b) {
    for (int i = 0; i < 9; i++) {
        int rowMask = 0, colMask = 0, boxMask = 0;
        for (int j = 0; j < 9; j++) {
            rowMask |= 1 << b[i][j];
            colMask |= 1 << b[j][i];
            boxMask |= 1 << b[3 * (i / 3) + j / 3][3 * (i % 3) + j % 3];
        }
        if (rowMask != 0x3FE || colMask != 0x3FE || boxMask != 0x3FE) return false;
    }
    return true;
}

void testSolveValidSudoku() {
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
    assert(solveSudoku(board));
    // Check that all cells are filled
    for (const auto& row : board) {
        for (int cell : row) {
            assert(cell != 0);
        }
    }
}

void testIsValid() {
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
    assert(isValid(board, 0, 2, 1));
    assert(!isValid(board, 0, 2, 5));  // Already in row
    assert(!isValid(board, 0, 2, 6));  // Already in column
}

void testSolutionIsExactAndKeepsGivens() {
    auto board = PUZZLE;
    assert(solveSudoku(board));
    assert(board == SOLUTION);
    assert(isCompleteValidGrid(board));
}

void testRejectsDuplicateInRow() {
    auto board = SOLUTION;
    board[0][0] = board[0][1];
    auto before = board;
    assert(!solveSudoku(board));
    assert(board == before);
}

void testRejectsConflictingGivensWithBlanks() {
    int cases[3][4] = {{0, 0, 0, 5}, {0, 0, 5, 0}, {0, 0, 2, 2}};
    for (auto& c : cases) {
        vector<vector<int>> board(9, vector<int>(9, 0));
        board[c[0]][c[1]] = 7;
        board[c[2]][c[3]] = 7;
        auto before = board;
        assert(!solveSudoku(board));
        assert(board == before);
    }
}

void testRejectsOutOfRangeAndBadShape() {
    auto board = PUZZLE;
    board[4][4] = 10;
    assert(!isValidPuzzle(board));
    board[4][4] = -1;
    assert(!solveSudoku(board));
    vector<vector<int>> few(8, vector<int>(9, 0));
    assert(!solveSudoku(few));
    vector<vector<int>> narrow(9, vector<int>(8, 0));
    assert(!solveSudoku(narrow));
}

void testUnsolvablePuzzleRestoresBoard() {
    vector<vector<int>> board(9, vector<int>(9, 0));
    for (int j = 0; j < 8; j++) board[0][j] = j + 1;
    board[1][8] = 9;  // cell (0, 8) needs a 9, but column 8 already has one
    auto before = board;
    assert(isValidPuzzle(board));
    assert(!solveSudoku(board));
    assert(board == before);
}

void testSolvedAndEmptyBoards() {
    auto board = SOLUTION;
    assert(solveSudoku(board));
    assert(board == SOLUTION);
    vector<vector<int>> empty(9, vector<int>(9, 0));
    assert(solveSudoku(empty));
    assert(isCompleteValidGrid(empty));
}

int main() {
    testSolveValidSudoku();
    testIsValid();
    testSolutionIsExactAndKeepsGivens();
    testRejectsDuplicateInRow();
    testRejectsConflictingGivensWithBlanks();
    testRejectsOutOfRangeAndBadShape();
    testUnsolvablePuzzleRestoresBoard();
    testSolvedAndEmptyBoards();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

