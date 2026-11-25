/**
 * Gaussian Elimination (C++)
 *
 * Solves A x = b, n equations in m unknowns, by reducing the augmented matrix [A | b] to row
 * echelon form and substituting back from the last pivot up.
 *
 * - solve: doubles with partial pivoting. The pivot of a column is the entry of largest
 *   absolute value at or below the current row (the upper row wins a tie), and |v| <= eps
 *   (EPS = 1e-9 by default) counts as zero. solveWithoutPivoting takes the first entry that is
 *   not zero instead, to show why pivoting matters.
 * - solveMod: exact arithmetic modulo a prime p up to 2^64 - 1. The pivot is the first nonzero
 *   entry; dividing by it multiplies by its inverse a^(p - 2) mod p (Fermat). Products go
 *   through mulMod, which multiplies in unsigned __int128 (a GCC and Clang extension).
 *
 * Both report Kind::NoSolution (a row reads 0 = c, c not zero), Kind::Unique or Kind::Infinite
 * (a column without a pivot: its unknown is free and set to 0 in x). determinant and
 * determinantMod: the product of the pivots, negated once per row swap.
 *
 * Invalid input throws std::invalid_argument: an empty or ragged A, a b of the wrong length, a
 * matrix that is not square for a determinant, p < 2, or a pivot with no inverse (p not prime).
 */

#include <cmath>
#include <cstdint>
#include <iostream>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

// Round a * b and then the subtraction, as two steps, the way Python and Go do here: a compiler
// may otherwise fuse them into one FMA instruction (clang does on arm64 by default), which
// changes the last bits and, in the example without pivoting, the wrong answer itself.
#if defined(__clang__)
#pragma clang fp contract(off)
#elif defined(__GNUC__)
#pragma GCC optimize("fp-contract=off")
#endif

constexpr double EPS = 1e-9;

enum class Kind { NoSolution, Unique, Infinite };

/** "no solution", "unique" or "infinite": the same names as the Python and Go versions. */
std::string kindName(Kind k) {
    switch (k) {
        case Kind::NoSolution:
            return "no solution";
        case Kind::Unique:
            return "unique";
        default:
            return "infinite";
    }
}

/** What solve and solveWithoutPivoting return. x is empty for Kind::NoSolution. */
struct Solution {
    Kind kind = Kind::NoSolution;
    std::vector<double> x;       // one solution, free unknowns 0
    int rank = 0;                // the number of pivots: the rank of A
    std::vector<int> pivotCols;  // the column of each pivot row, increasing
    int swaps = 0;               // row swaps made while choosing pivots
    long long updates = 0;       // entries the forward elimination recomputed: the work
};

/** What solveMod returns: the same fields, x in [0, p). */
struct ModSolution {
    Kind kind = Kind::NoSolution;
    std::vector<uint64_t> x;
    int rank = 0;
    std::vector<int> pivotCols;
    int swaps = 0;
    long long updates = 0;
};

namespace detail {

/** Throws unless A is n x m with n, m >= 1 and b has n entries. */
template <typename T>
void checkShape(const std::vector<std::vector<T>>& A, size_t bSize) {
    if (A.empty()) throw std::invalid_argument("A has no rows: a system needs at least one equation");
    size_t m = A[0].size();
    if (m == 0) throw std::invalid_argument("A has no columns: a system needs at least one unknown");
    for (size_t i = 0; i < A.size(); i++) {
        if (A[i].size() != m) {
            throw std::invalid_argument("row " + std::to_string(i) + " of A has " + std::to_string(A[i].size()) + " entries, but row 0 has " +
                                        std::to_string(m));
        }
    }
    if (bSize != A.size()) {
        throw std::invalid_argument("b has " + std::to_string(bSize) + " entries, but A has " + std::to_string(A.size()) + " rows");
    }
}

template <typename T>
void checkSquare(const std::vector<std::vector<T>>& A) {
    if (A.empty()) throw std::invalid_argument("A has no rows: the determinant needs a square matrix of size at least 1");
    for (size_t i = 0; i < A.size(); i++) {
        if (A[i].size() != A.size()) {
            throw std::invalid_argument("row " + std::to_string(i) + " of A has " + std::to_string(A[i].size()) + " entries, but A has " +
                                        std::to_string(A.size()) + " rows: the determinant needs a square matrix");
        }
    }
}

struct Echelon {
    std::vector<int> pivotCols;
    std::vector<uint64_t> inverses;  // modular version only: one inverse per pivot
    int swaps = 0;
    long long updates = 0;
};

/**
 * Row echelon form of M in place, pivots in columns 0..cols-1. With partial pivoting the pivot
 * is the largest |v| at or below row (strict >, so the upper row wins a tie); without it, the
 * first entry with |v| > eps. A row whose entry is already 0 is skipped.
 */
inline Echelon forward(std::vector<std::vector<double>>& M, int cols, double eps, bool partial) {
    Echelon e;
    int n = static_cast<int>(M.size());
    int row = 0;
    for (int col = 0; col < cols && row < n; col++) {
        int pick = -1;
        if (partial) {
            int best = row;
            for (int r = row + 1; r < n; r++) {
                if (std::fabs(M[r][col]) > std::fabs(M[best][col])) best = r;
            }
            if (std::fabs(M[best][col]) > eps) pick = best;
        } else {
            for (int r = row; r < n && pick < 0; r++) {
                if (std::fabs(M[r][col]) > eps) pick = r;
            }
        }
        if (pick < 0) continue;  // no pivot: col is a free column
        if (pick != row) {
            std::swap(M[row], M[pick]);
            e.swaps++;
        }
        int width = static_cast<int>(M[row].size());
        for (int target = row + 1; target < n; target++) {
            if (M[target][col] == 0.0) continue;  // already zero: nothing to subtract
            double factor = M[target][col] / M[row][col];
            M[target][col] = 0.0;
            for (int c = col + 1; c < width; c++) M[target][c] -= factor * M[row][c];
            e.updates += width - col - 1;
        }
        e.pivotCols.push_back(col);
        row++;
    }
    return e;
}

inline Solution solveFloat(const std::vector<std::vector<double>>& A, const std::vector<double>& b, double eps, bool partial) {
    checkShape(A, b.size());
    int n = static_cast<int>(A.size());
    int m = static_cast<int>(A[0].size());
    std::vector<std::vector<double>> M(A);
    for (int i = 0; i < n; i++) M[i].push_back(b[i]);
    Echelon e = forward(M, m, eps, partial);
    Solution s;
    s.rank = static_cast<int>(e.pivotCols.size());
    s.pivotCols = e.pivotCols;
    s.swaps = e.swaps;
    s.updates = e.updates;
    for (int r = s.rank; r < n; r++) {
        if (std::fabs(M[r][m]) > eps) {  // the row reads 0 = M[r][m]
            s.kind = Kind::NoSolution;
            return s;
        }
    }
    s.x.assign(m, 0.0);
    for (int i = s.rank - 1; i >= 0; i--) {
        int c = e.pivotCols[i];
        double sum = M[i][m];
        for (int j = c + 1; j < m; j++) sum -= M[i][j] * s.x[j];
        s.x[c] = sum / M[i][c];
    }
    s.kind = s.rank == m ? Kind::Unique : Kind::Infinite;
    return s;
}

}  // namespace detail

/**
 * Solve A x = b in doubles with partial pivoting; |v| <= eps counts as zero. Throws
 * std::invalid_argument for an empty or ragged A or a b of the wrong length.
 * Time: O(min(n, m) * n * m), O(n^3) for a square system.
 */
Solution solve(const std::vector<std::vector<double>>& A, const std::vector<double>& b, double eps = EPS) {
    return detail::solveFloat(A, b, eps, true);
}

/** Like solve, but the pivot is the first entry with |v| > eps, however small. */
Solution solveWithoutPivoting(const std::vector<std::vector<double>>& A, const std::vector<double>& b, double eps = EPS) {
    return detail::solveFloat(A, b, eps, false);
}

/** det(A) for a square A: the product of the pivots with partial pivoting, negated per swap; 0 without a full set. */
double determinant(const std::vector<std::vector<double>>& A, double eps = EPS) {
    detail::checkSquare(A);
    int n = static_cast<int>(A.size());
    std::vector<std::vector<double>> M(A);
    detail::Echelon e = detail::forward(M, n, eps, true);
    if (static_cast<int>(e.pivotCols.size()) < n) return 0.0;
    double det = e.swaps % 2 ? -1.0 : 1.0;
    for (int i = 0; i < n; i++) det *= M[i][i];
    return det;
}

/* ---------- modulo a prime ---------- */

/** a * b mod m for any 64-bit values, m >= 1: the product is taken in 128 bits. */
uint64_t mulMod(uint64_t a, uint64_t b, uint64_t m) {
    return static_cast<uint64_t>(static_cast<unsigned __int128>(a) * b % m);
}

/** base^exp mod m by square and multiply, m >= 1. */
uint64_t powMod(uint64_t base, uint64_t exp, uint64_t m) {
    uint64_t result = 1 % m;
    base %= m;
    while (exp > 0) {
        if (exp & 1) result = mulMod(result, base, m);
        base = mulMod(base, base, m);
        exp >>= 1;
    }
    return result;
}

/** v mod p in [0, p), as Python's % gives it, for any int64 v (INT64_MIN included). */
uint64_t reduceMod(int64_t v, uint64_t p) {
    __int128 r = static_cast<__int128>(v) % static_cast<__int128>(p);
    if (r < 0) r += p;
    return static_cast<uint64_t>(r);
}

/** a - b mod p for a, b in [0, p), without overflow for p near 2^64. */
inline uint64_t subMod(uint64_t a, uint64_t b, uint64_t p) {
    return a >= b ? a - b : a + (p - b);
}

/**
 * The inverse of a nonzero a modulo a prime p: a^(p - 2) mod p (Fermat's little theorem). The
 * result is checked; if a * inverse is not 1, p was not prime and std::invalid_argument says so.
 */
uint64_t inverseMod(uint64_t a, uint64_t p) {
    uint64_t inv = powMod(a, p - 2, p);
    if (mulMod(a, inv, p) != 1) {
        throw std::invalid_argument(std::to_string(a) + " has no inverse modulo " + std::to_string(p) + " by Fermat's little theorem: p must be prime");
    }
    return inv;
}

namespace detail {

inline void checkModulus(uint64_t p) {
    if (p < 2) throw std::invalid_argument("p = " + std::to_string(p) + ": the modulus must be a prime, so at least 2");
}

/** Row echelon form modulo p in place: the first nonzero entry is the pivot, one inverse per pivot. */
inline Echelon forwardMod(std::vector<std::vector<uint64_t>>& M, int cols, uint64_t p) {
    Echelon e;
    int n = static_cast<int>(M.size());
    int row = 0;
    for (int col = 0; col < cols && row < n; col++) {
        int pick = -1;
        for (int r = row; r < n && pick < 0; r++) {
            if (M[r][col] != 0) pick = r;
        }
        if (pick < 0) continue;
        if (pick != row) {
            std::swap(M[row], M[pick]);
            e.swaps++;
        }
        uint64_t inv = inverseMod(M[row][col], p);
        int width = static_cast<int>(M[row].size());
        for (int target = row + 1; target < n; target++) {
            if (M[target][col] == 0) continue;
            uint64_t factor = mulMod(M[target][col], inv, p);
            M[target][col] = 0;
            for (int c = col + 1; c < width; c++) M[target][c] = subMod(M[target][c], mulMod(factor, M[row][c], p), p);
            e.updates += width - col - 1;
        }
        e.pivotCols.push_back(col);
        e.inverses.push_back(inv);
        row++;
    }
    return e;
}

}  // namespace detail

/**
 * Solve A x = b modulo a prime p, exactly; entries are reduced into [0, p) first (negative ones
 * too). Throws std::invalid_argument for p < 2, an empty or ragged A, a b of the wrong length,
 * or a pivot with no inverse (p not prime; primality itself is not tested).
 */
ModSolution solveMod(const std::vector<std::vector<int64_t>>& A, const std::vector<int64_t>& b, uint64_t p) {
    detail::checkModulus(p);
    detail::checkShape(A, b.size());
    int n = static_cast<int>(A.size());
    int m = static_cast<int>(A[0].size());
    std::vector<std::vector<uint64_t>> M(n, std::vector<uint64_t>(m + 1));
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) M[i][j] = reduceMod(A[i][j], p);
        M[i][m] = reduceMod(b[i], p);
    }
    detail::Echelon e = detail::forwardMod(M, m, p);
    ModSolution s;
    s.rank = static_cast<int>(e.pivotCols.size());
    s.pivotCols = e.pivotCols;
    s.swaps = e.swaps;
    s.updates = e.updates;
    for (int r = s.rank; r < n; r++) {
        if (M[r][m] != 0) {
            s.kind = Kind::NoSolution;
            return s;
        }
    }
    s.x.assign(m, 0);
    for (int i = s.rank - 1; i >= 0; i--) {
        int c = e.pivotCols[i];
        uint64_t sum = M[i][m];
        for (int j = c + 1; j < m; j++) sum = subMod(sum, mulMod(M[i][j], s.x[j], p), p);
        s.x[c] = mulMod(sum, e.inverses[i], p);
    }
    s.kind = s.rank == m ? Kind::Unique : Kind::Infinite;
    return s;
}

/** det(A) mod p in [0, p) for a square A: the product of the pivots, negated per swap. */
uint64_t determinantMod(const std::vector<std::vector<int64_t>>& A, uint64_t p) {
    detail::checkModulus(p);
    detail::checkSquare(A);
    int n = static_cast<int>(A.size());
    std::vector<std::vector<uint64_t>> M(n, std::vector<uint64_t>(n));
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) M[i][j] = reduceMod(A[i][j], p);
    }
    detail::Echelon e = detail::forwardMod(M, n, p);
    if (static_cast<int>(e.pivotCols.size()) < n) return 0;
    uint64_t det = e.swaps % 2 ? p - 1 : 1;
    for (int i = 0; i < n; i++) det = mulMod(det, M[i][i], p);
    return det;
}

#ifndef IS_TEST_BUILD
namespace {
template <typename T>
void printVector(const std::vector<T>& v) {
    std::cout << '[';
    for (size_t i = 0; i < v.size(); i++) std::cout << (i ? ", " : "") << v[i];
    std::cout << ']';
}
}  // namespace

int main() {
    std::vector<std::vector<double>> A = {{2, 1, -1}, {-3, -1, 2}, {-2, 1, 2}};
    std::vector<double> b = {8, -11, -3};
    Solution s = solve(A, b);
    std::cout.precision(17);
    std::cout << "solve: " << kindName(s.kind) << ", x = ";
    printVector(s.x);
    std::cout << ", rank " << s.rank << ", swaps " << s.swaps << ", updates " << s.updates << '\n';
    std::cout << "determinant: " << determinant(A) << '\n';
    ModSolution sm = solveMod({{2, 1, -1}, {-3, -1, 2}, {-2, 1, 2}}, {8, -11, -3}, 7);
    std::cout << "solveMod(p = 7): " << kindName(sm.kind) << ", x = ";
    printVector(sm.x);
    std::cout << '\n';
    std::cout << "determinantMod(p = 7): " << determinantMod({{2, 1, -1}, {-3, -1, 2}, {-2, 1, 2}}, 7) << '\n';
    std::vector<std::vector<double>> P = {{1e-8, 0, 1}, {1, 1e-8, 0}, {0, 1, 0}};
    std::cout << "pivoting example, without pivoting: ";
    printVector(solveWithoutPivoting(P, {1, 2, 3}).x);
    std::cout << "\npivoting example, partial pivoting: ";
    printVector(solve(P, {1, 2, 3}).x);
    std::cout << '\n';
    return 0;
}
#endif
