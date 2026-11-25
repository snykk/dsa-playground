/**
 * Unit tests for Gaussian elimination. The pinned values (between the PINNED markers) were
 * computed by the Python implementation (gaussian_elimination.py): the modular results exactly,
 * the floating-point ones within a tolerance. The rest checks random systems with a known
 * solution, singular and inconsistent systems built on purpose, rank and determinant against
 * cofactor expansion, non-square systems, the pivoting example, the edge cases and the errors.
 */
#include <algorithm>
#include <cassert>
#include <climits>
#include <cmath>
#include <cstdint>
#include <functional>
#include <iostream>
#include <random>
#include <stdexcept>
#include <string>
#include <vector>

#include "gaussian_elimination.cpp"

namespace {

using FMat = std::vector<std::vector<double>>;
using IMat = std::vector<std::vector<int64_t>>;

struct PinnedMod {
    IMat A;
    std::vector<int64_t> b;
    uint64_t p;
    Kind kind;
    std::vector<uint64_t> x;
    int rank;
    std::vector<int> pivots;
    int swaps;
    long long updates;
};
struct PinnedDetMod {
    IMat A;
    uint64_t p;
    uint64_t det;
};
struct PinnedFloat {
    FMat A;
    std::vector<double> b;
    Kind kind;
    std::vector<double> x;
    int rank;
    std::vector<int> pivots;
    int swaps;
    long long updates;
};
struct PinnedDet {
    FMat A;
    double det;
};

// PINNED (generated from Python)
const std::vector<PinnedMod> PINNED_MOD = {
    {{{2, 1, -1}, {-3, -1, 2}, {-2, 1, 2}}, {8, -11, -3}, 7, Kind::Unique, {2, 3, 6}, 3, {0, 1, 2}, 0, 8},
    {{{2, 1, -1}, {-3, -1, 2}, {-2, 1, 2}}, {8, -11, -3}, 1000000007, Kind::Unique, {2, 3, 1000000006}, 3, {0, 1, 2}, 0, 8},
    {{{2, 1, -1}, {-3, -1, 2}, {-2, 1, 2}}, {8, -11, -3}, 2, Kind::Unique, {0, 1, 1}, 3, {0, 1, 2}, 1, 2},
    {{{2, 1, -1}, {-3, -1, 2}, {-2, 1, 2}}, {8, -11, -3}, 3, Kind::Unique, {2, 0, 2}, 3, {0, 1, 2}, 0, 5},
    {{{1, 2}, {2, 4}}, {3, 6}, 13, Kind::Infinite, {3, 0}, 1, {0}, 0, 2},
    {{{1, 2}, {2, 4}}, {3, 7}, 13, Kind::NoSolution, {}, 1, {0}, 0, 2},
    {{{5}}, {3}, 7, Kind::Unique, {2}, 1, {0}, 0, 0},
    {{{0}}, {0}, 5, Kind::Infinite, {0}, 0, {}, 0, 0},
    {{{0}}, {4}, 5, Kind::NoSolution, {}, 0, {}, 0, 0},
    {{{7}}, {3}, 7, Kind::NoSolution, {}, 0, {}, 0, 0},
    {{{0, 0, 0}, {0, 0, 0}}, {0, 0}, 11, Kind::Infinite, {0, 0, 0}, 0, {}, 0, 0},
    {{{0, 0}, {0, 0}, {0, 0}}, {0, 1, 0}, 11, Kind::NoSolution, {}, 0, {}, 0, 0},
    {{{1, 2, 3}, {0, 1, 4}, {5, 6, 0}}, {0, 0, 0}, 101, Kind::Unique, {0, 0, 0}, 3, {0, 1, 2}, 0, 5},
    {{{1, 2, 3}, {2, 4, 6}, {1, 0, 1}}, {0, 0, 0}, 101, Kind::Infinite, {0, 0, 0}, 2, {0, 1}, 1, 6},
    {{{1, 1}, {1, 2}, {2, 3}, {3, 5}}, {3, 5, 8, 13}, 1009, Kind::Unique, {1, 2}, 2, {0, 1}, 0, 8},
    {{{1, 1}, {1, 2}, {2, 3}, {3, 5}}, {3, 5, 8, 14}, 1009, Kind::NoSolution, {}, 2, {0, 1}, 0, 8},
    {{{1, 2, 3, 4}, {5, 6, 7, 8}}, {1, 2}, 1009, Kind::Infinite, {504, 253, 0, 0}, 2, {0, 1}, 0, 4},
    {{{1, 2, 3, 4}, {2, 4, 7, 9}}, {5, 11}, 1009, Kind::Infinite, {2, 0, 1, 0}, 2, {0, 2}, 0, 4},
    {{{-1, -2}, {-3, -4}}, {-5, -6}, 1000000007, Kind::Unique, {1000000003, 500000008}, 2, {0, 1}, 0, 2},
    {{{0, 1}, {1, 0}}, {2, 3}, 5, Kind::Unique, {3, 2}, 2, {0, 1}, 1, 0},
    {{{0, 1, 2}, {0, 2, 5}, {0, 3, 7}}, {1, 2, 3}, 13, Kind::Infinite, {0, 1, 0}, 2, {1, 2}, 0, 5},
    {{{3, 1}, {6, 2}}, {1, 2}, 3, Kind::Infinite, {0, 1}, 1, {1}, 0, 1},
    {{{-28, 36, -50, -45}, {36, 38, -33, 27}, {9, 12, -30, 47}, {6, 4, 49, 22}}, {-19, -41, 42, -50}, 998244353, Kind::Unique, {515992288, 296635012, 558304060, 649083976}, 4, {0, 1, 2, 3}, 0, 20},
    {{{9223372036854775807LL, 2, 3}, {5, -9223372036854775807LL, 7}, {11, 13, 9223372036854775806LL}}, {9223372036854775807LL, INT64_MIN, 1}, 2305843009213693951ULL, Kind::Unique, {2120702329641791514ULL, 2053378446161099725ULL, 353450388273631922ULL}, 3, {0, 1, 2}, 0, 8},
    {{{9223372036854775807LL, INT64_MIN, 3}, {5, 9223372036854775800LL, -11}, {-9223372036854775807LL, 13, 9223372036854775807LL}}, {1, 9223372036854775807LL, INT64_MIN}, 18446744073709551557ULL, Kind::Unique, {10136804533795096339ULL, 18128638826461175054ULL, 17401701131164709028ULL}, 3, {0, 1, 2}, 0, 8},
    {{{0, 0, 1, 1}, {0, 1, 1, 0}, {0, 1, 0, 1}, {1, 0, 1, 1}}, {1, 1, 0, 1}, 2, Kind::Infinite, {0, 0, 1, 0}, 3, {0, 1, 2}, 1, 5},
    {{{-9, 0, -8, -5, -9}, {0, 7, 5, 3, 6}, {3, 7, 4, -3, 1}, {-3, -4, -6, -3, 6}, {3, -3, -7, 4, -4}}, {4, 3, 6, -6, 5}, 13, Kind::Unique, {4, 1, 6, 4, 1}, 5, {0, 1, 2, 3, 4}, 0, 35},
    {{{-91, 24, 94, 6, 47}, {94, -75, -91, 26, -44}, {43, -6, 27, -57, 72}, {-63, 89, 20, 75, -17}}, {-91, -32, 4, -1}, 10007, Kind::Infinite, {6203, 8653, 5038, 537, 0}, 4, {0, 1, 2, 3}, 0, 26},
    {{{2, 7, 1}, {9, -7, -9}, {-7, -5, 8}, {-1, -2, 4}, {8, 7, -7}}, {-3, -8, 5, -8, -9}, 97, Kind::NoSolution, {}, 3, {0, 1, 2}, 0, 20},
    {{{2, 4, 6}, {1, 2, 3}, {3, 6, 9}}, {2, 1, 3}, 7, Kind::Infinite, {1, 0, 0}, 1, {0}, 0, 6},
    {{{2, 4, 6}, {1, 2, 3}, {3, 6, 9}}, {2, 1, 4}, 7, Kind::NoSolution, {}, 1, {0}, 0, 6},
    {{{1, 0, 0, 0}, {0, 0, 1, 0}, {0, 0, 0, 1}}, {4, 5, 6}, 1000003, Kind::Infinite, {4, 0, 5, 6}, 3, {0, 2, 3}, 0, 0},
    {{{1, 5, 0}, {6, 3, -3}, {3, -2, -3}, {5, -1, -3}, {2, 2, -1}}, {227, 147, -84, -35, 94}, 97, Kind::Unique, {2, 45, 0}, 3, {0, 1, 2}, 0, 20},
};
const std::vector<PinnedDetMod> PINNED_DET_MOD = {
    {{{2, 1, -1}, {-3, -1, 2}, {-2, 1, 2}}, 7, 6},
    {{{2, 1, -1}, {-3, -1, 2}, {-2, 1, 2}}, 1000000007, 1000000006},
    {{{0, 1}, {1, 0}}, 5, 4},
    {{{1, 2}, {2, 4}}, 13, 0},
    {{{-3}}, 7, 4},
    {{{0}}, 2, 0},
    {{{1, 1, 0}, {0, 1, 1}, {1, 0, 1}}, 2, 0},
    {{{75, 27, -14, 47}, {-1, 68, 68, -96}, {90, -65, 61, -50}, {79, -40, -45, 98}}, 998244353, 4733599},
    {{{9223372036854775807LL, INT64_MIN, 3}, {5, 9223372036854775800LL, -11}, {-9223372036854775807LL, 13, 9223372036854775807LL}}, 18446744073709551557ULL, 16140901064495876140ULL},
    {{{0, 0, 1}, {0, 1, 0}, {1, 0, 0}}, 1000003, 1000002},
};
const std::vector<PinnedFloat> PINNED_FLOAT = {
    {{{2.0, 1.0, -1.0}, {-3.0, -1.0, 2.0}, {-2.0, 1.0, 2.0}}, {8.0, -11.0, -3.0}, Kind::Unique, {2.0, 3.0000000000000004, -0.9999999999999999}, 3, {0, 1, 2}, 2, 8},
    {{{1e-08, 0.0, 1.0}, {1.0, 1e-08, 0.0}, {0.0, 1.0, 0.0}}, {1.0, 2.0, 3.0}, Kind::Unique, {1.99999997, 3.0, 0.9999999800000003}, 3, {0, 1, 2}, 2, 5},
    {{{1.0, 2.0}, {2.0, 4.0}}, {3.0, 6.0}, Kind::Infinite, {3.0, 0.0}, 1, {0}, 1, 2},
    {{{1.0, 2.0}, {2.0, 4.0}}, {3.0, 7.0}, Kind::NoSolution, {}, 1, {0}, 1, 2},
    {{{1.0, 1.0}, {1.0, 2.0}, {2.0, 3.0}, {3.0, 5.0}}, {3.0, 5.0, 8.0, 13.0}, Kind::Unique, {1.0, 2.0}, 2, {0, 1}, 2, 8},
    {{{1.0, 1.0}, {1.0, 2.0}, {2.0, 3.0}, {3.0, 5.0}}, {3.0, 5.0, 8.0, 14.0}, Kind::NoSolution, {}, 2, {0, 1}, 2, 8},
    {{{1.0, 2.0, 3.0, 4.0}, {2.0, 4.0, 7.0, 9.0}}, {5.0, 11.0}, Kind::Infinite, {2.0, 0.0, 1.0, 0.0}, 2, {0, 2}, 1, 4},
    {{{1.0, 1.0}, {-1.0, 1.0}}, {2.0, 0.0}, Kind::Unique, {1.0, 1.0}, 2, {0, 1}, 0, 2},
    {{{4.0}}, {2.0}, Kind::Unique, {0.5}, 1, {0}, 0, 0},
    {{{1e-10}}, {1.0}, Kind::NoSolution, {}, 0, {}, 0, 0},
    {{{0.0, 0.0}, {0.0, 0.0}}, {0.0, 0.0}, Kind::Infinite, {0.0, 0.0}, 0, {}, 0, 0},
    {{{0.5, -1.25, 2.0}, {3.0, 0.75, -1.0}, {-2.0, 4.0, 0.125}}, {1.0, -2.0, 3.0}, Kind::Unique, {-0.4800462695199537, 0.48120300751879697, 0.9207634470792365}, 3, {0, 1, 2}, 2, 8},
};
const std::vector<PinnedDet> PINNED_DET = {
    {{{2.0, 1.0, -1.0}, {-3.0, -1.0, 2.0}, {-2.0, 1.0, 2.0}}, -0.9999999999999993},
    {{{0.0, 1.0}, {1.0, 0.0}}, -1.0},
    {{{1.0, 2.0}, {2.0, 4.0}}, 0.0},
    {{{2.0, -1.0, 0.0, 3.0}, {1.0, 4.0, -2.0, 0.0}, {0.0, 5.0, 1.0, -1.0}, {3.0, 0.0, 2.0, 2.0}}, -74.0},
    {{{7.5}}, 7.5},
};
// END PINNED

const uint64_t P64 = 18446744073709551557ULL;  // the largest prime below 2^64
const std::vector<uint64_t> PRIMES = {2, 3, 5, 7, 13, 97, 1009, 998244353, 1000000007, 2305843009213693951ULL, P64};

bool near(double got, double want, double tol = EPS) {
    return std::fabs(got - want) <= tol * std::max(1.0, std::fabs(want));
}

bool nearAll(const std::vector<double>& got, const std::vector<double>& want, double tol = EPS) {
    if (got.size() != want.size()) return false;
    for (size_t i = 0; i < got.size(); i++) {
        if (!near(got[i], want[i], tol)) return false;
    }
    return true;
}

/** The determinant by cofactor expansion along the first row, exact in __int128 for small entries. */
__int128 detCofactor(const IMat& M) {
    size_t n = M.size();
    if (n == 1) return M[0][0];
    __int128 total = 0;
    for (size_t j = 0; j < n; j++) {
        if (M[0][j] == 0) continue;
        IMat minor;
        for (size_t r = 1; r < n; r++) {
            std::vector<int64_t> row;
            for (size_t c = 0; c < n; c++) {
                if (c != j) row.push_back(M[r][c]);
            }
            minor.push_back(row);
        }
        __int128 term = static_cast<__int128>(M[0][j]) * detCofactor(minor);
        total += (j % 2 ? -term : term);
    }
    return total;
}

/** a + b mod p for a, b in [0, p), without overflow for p near 2^64. */
uint64_t addMod(uint64_t a, uint64_t b, uint64_t p) {
    return a >= p - b ? a - (p - b) : a + b;
}

/** The determinant modulo p by cofactor expansion (entries already in [0, p)). */
uint64_t detCofactorMod(const std::vector<std::vector<uint64_t>>& M, uint64_t p) {
    size_t n = M.size();
    if (n == 1) return M[0][0] % p;
    uint64_t total = 0;
    for (size_t j = 0; j < n; j++) {
        if (M[0][j] == 0) continue;
        std::vector<std::vector<uint64_t>> minor;
        for (size_t r = 1; r < n; r++) {
            std::vector<uint64_t> row;
            for (size_t c = 0; c < n; c++) {
                if (c != j) row.push_back(M[r][c]);
            }
            minor.push_back(row);
        }
        uint64_t term = mulMod(M[0][j], detCofactorMod(minor, p), p);
        total = j % 2 ? subMod(total, term, p) : addMod(total, term, p);
    }
    return total;
}

/** Every k-subset of 0..n-1, in lexicographic order. */
void subsets(int n, int k, int start, std::vector<int>& cur, const std::function<void(const std::vector<int>&)>& visit) {
    if (static_cast<int>(cur.size()) == k) {
        visit(cur);
        return;
    }
    for (int i = start; i < n; i++) {
        cur.push_back(i);
        subsets(n, k, i + 1, cur, visit);
        cur.pop_back();
    }
}

/** The largest k with a k x k minor that is not zero (modulo p when p > 0). */
int rankBrute(const IMat& M, uint64_t p = 0) {
    int n = static_cast<int>(M.size());
    int m = static_cast<int>(M[0].size());
    for (int k = std::min(n, m); k > 0; k--) {
        bool found = false;
        std::vector<int> rows, cols;
        subsets(n, k, 0, rows, [&](const std::vector<int>& rs) {
            if (found) return;
            subsets(m, k, 0, cols, [&](const std::vector<int>& cs) {
                if (found) return;
                if (p == 0) {
                    IMat minor;
                    for (int r : rs) {
                        std::vector<int64_t> row;
                        for (int c : cs) row.push_back(M[r][c]);
                        minor.push_back(row);
                    }
                    found = detCofactor(minor) != 0;
                } else {
                    std::vector<std::vector<uint64_t>> minor;
                    for (int r : rs) {
                        std::vector<uint64_t> row;
                        for (int c : cs) row.push_back(reduceMod(M[r][c], p));
                        minor.push_back(row);
                    }
                    found = detCofactorMod(minor, p) != 0;
                }
            });
        });
        if (found) return k;
    }
    return 0;
}

FMat toDouble(const IMat& A) {
    FMat out;
    for (const auto& row : A) out.emplace_back(row.begin(), row.end());
    return out;
}

double residual(const FMat& A, const std::vector<double>& x, const std::vector<double>& b) {
    double worst = 0;
    for (size_t i = 0; i < A.size(); i++) {
        double s = 0;
        for (size_t j = 0; j < x.size(); j++) s += A[i][j] * x[j];
        worst = std::max(worst, std::fabs(s - b[i]));
    }
    return worst;
}

std::vector<uint64_t> matVecMod(const IMat& A, const std::vector<uint64_t>& x, uint64_t p) {
    std::vector<uint64_t> out;
    for (const auto& row : A) {
        uint64_t s = 0;
        for (size_t j = 0; j < x.size(); j++) {
            s = addMod(s, mulMod(reduceMod(row[j], p), x[j], p), p);
        }
        out.push_back(s);
    }
    return out;
}

/** A residue v in [0, p) as an int64 that reduces to it: v itself, or v - p past INT64_MAX. */
int64_t asInt64(uint64_t v, uint64_t p) {
    return v <= static_cast<uint64_t>(INT64_MAX) ? static_cast<int64_t>(v) : -static_cast<int64_t>(p - v);
}

template <typename F>
void expectThrow(F f, const std::string& needle) {
    try {
        f();
    } catch (const std::invalid_argument& e) {
        if (std::string(e.what()).find(needle) == std::string::npos) {
            std::cerr << "message \"" << e.what() << "\" lacks \"" << needle << "\"\n";
            assert(false);
        }
        return;
    }
    std::cerr << "expected std::invalid_argument containing \"" << needle << "\"\n";
    assert(false);
}

const FMat WORKED_A = {{2, 1, -1}, {-3, -1, 2}, {-2, 1, 2}};
const IMat WORKED_AI = {{2, 1, -1}, {-3, -1, 2}, {-2, 1, 2}};

/* ---------- floating point ---------- */

void testWorkedExample() {
    Solution s = solve(WORKED_A, {8, -11, -3});
    assert(s.kind == Kind::Unique && kindName(s.kind) == "unique");
    assert(s.rank == 3 && s.swaps == 2 && s.updates == 8);
    assert((s.pivotCols == std::vector<int>{0, 1, 2}));
    assert(nearAll(s.x, {2, 3, -1}));
    assert(near(determinant(WORKED_A), -1));
}

void testRandomSystemsWithAKnownSolution() {
    std::mt19937_64 rng(1);
    auto pick = [&](int lo, int hi) { return static_cast<int>(rng() % static_cast<uint64_t>(hi - lo + 1)) + lo; };
    int checked = 0;
    for (int trial = 0; trial < 400; trial++) {
        int n = pick(1, 6);
        IMat A(n, std::vector<int64_t>(n));
        for (auto& row : A)
            for (auto& v : row) v = pick(-9, 9);
        if (detCofactor(A) == 0) continue;
        std::vector<double> xTrue(n), b(n, 0);
        for (auto& v : xTrue) v = pick(-9, 9);
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++) b[i] += A[i][j] * xTrue[j];
        Solution s = solve(toDouble(A), b);
        assert(s.kind == Kind::Unique && s.rank == n);
        for (int j = 0; j < n; j++) assert(std::fabs(s.x[j] - xTrue[j]) <= EPS);
        checked++;
    }
    assert(checked > 300);
    std::uniform_real_distribution<double> real(-10, 10);
    for (int trial = 0; trial < 300; trial++) {
        int n = pick(1, 10);
        FMat A(n, std::vector<double>(n));
        for (auto& row : A)
            for (auto& v : row) v = real(rng);
        std::vector<double> xTrue(n), b(n, 0);
        for (auto& v : xTrue) v = real(rng);
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++) b[i] += A[i][j] * xTrue[j];
        Solution s = solve(A, b);
        assert(s.kind == Kind::Unique);
        assert(nearAll(s.x, xTrue, 1e-6));
        assert(residual(A, s.x, b) <= EPS);
    }
}

void testSingularAndInconsistentBuiltOnPurpose() {
    std::mt19937_64 rng(3);
    auto pick = [&](int lo, int hi) { return static_cast<int>(rng() % static_cast<uint64_t>(hi - lo + 1)) + lo; };
    for (int trial = 0; trial < 300; trial++) {
        int n = pick(2, 6), m = pick(2, 6);
        IMat A(n - 1, std::vector<int64_t>(m));
        for (auto& row : A)
            for (auto& v : row) v = pick(-5, 5);
        std::vector<int64_t> last(m, 0);
        for (int i = 0; i < n - 1; i++) {
            int w = pick(-3, 3);
            for (int j = 0; j < m; j++) last[j] += w * A[i][j];
        }
        A.push_back(last);
        std::vector<double> xTrue(m), b(n, 0);
        for (auto& v : xTrue) v = pick(-5, 5);
        for (int i = 0; i < n; i++)
            for (int j = 0; j < m; j++) b[i] += A[i][j] * xTrue[j];
        FMat Af = toDouble(A);
        Solution s = solve(Af, b);
        assert(s.kind != Kind::NoSolution && s.rank < n);
        assert(s.kind == (s.rank == m ? Kind::Unique : Kind::Infinite));
        assert(residual(Af, s.x, b) <= 1e-7);
        if (n <= 4 && m <= 4) assert(s.rank == rankBrute(A));
        b[n - 1] += 1;
        Solution bad = solve(Af, b);
        assert(bad.kind == Kind::NoSolution && bad.x.empty() && kindName(bad.kind) == "no solution");
    }
}

void testRankAndDeterminantAgainstBruteForce() {
    std::mt19937_64 rng(4);
    const int choices[] = {0, 0, 1, -1, 2, 3};
    for (int trial = 0; trial < 500; trial++) {
        int n = 1 + rng() % 4, m = 1 + rng() % 4;
        IMat A(n, std::vector<int64_t>(m));
        for (auto& row : A)
            for (auto& v : row) v = choices[rng() % 6];
        if (rng() % 10 < 3 && n > 1)
            for (int j = 0; j < m; j++) A[n - 1][j] = 2 * A[0][j];
        assert(solve(toDouble(A), std::vector<double>(n, 0)).rank == rankBrute(A));
    }
    for (int trial = 0; trial < 400; trial++) {
        int n = 1 + rng() % 6;
        IMat A(n, std::vector<int64_t>(n));
        for (auto& row : A)
            for (auto& v : row) v = static_cast<int64_t>(rng() % 19) - 9;
        if (rng() % 5 == 0 && n > 1) A[n - 1] = A[0];
        double want = static_cast<double>(detCofactor(A));
        assert(near(determinant(toDouble(A)), want));
    }
}

void testNonSquare() {
    FMat tall = {{1, 1}, {1, 2}, {2, 3}, {3, 5}};
    Solution s = solve(tall, {3, 5, 8, 13});
    assert(s.kind == Kind::Unique && s.rank == 2 && nearAll(s.x, {1, 2}));
    assert(solve(tall, {3, 5, 8, 14}).kind == Kind::NoSolution);
    s = solve({{1, 1}, {2, 2}, {3, 3}}, {2, 4, 6});
    assert(s.kind == Kind::Infinite && s.rank == 1 && (s.pivotCols == std::vector<int>{0}));
    s = solve({{1, 2, 3, 4}, {2, 4, 7, 9}}, {5, 11});
    assert(s.kind == Kind::Infinite && (s.pivotCols == std::vector<int>{0, 2}) && nearAll(s.x, {2, 0, 1, 0}));
    std::mt19937_64 rng(6);
    for (int trial = 0; trial < 200; trial++) {
        int n = 1 + rng() % 4;
        int m = n + 1 + rng() % (6 - n);
        FMat A(n, std::vector<double>(m));
        for (auto& row : A)
            for (auto& v : row) v = static_cast<double>(rng() % 11) - 5;
        std::vector<double> b(n);
        for (auto& v : b) v = static_cast<double>(rng() % 11) - 5;
        Solution w = solve(A, b);
        assert(w.kind != Kind::Unique);  // rank <= n < m
        if (w.kind == Kind::Infinite) assert(residual(A, w.x, b) <= 1e-7);
    }
}

void testThePivotingExample() {
    FMat P = {{1e-8, 0, 1}, {1, 1e-8, 0}, {0, 1, 0}};
    Solution naive = solveWithoutPivoting(P, {1, 2, 3});
    Solution good = solve(P, {1, 2, 3});
    assert(naive.kind == Kind::Unique && naive.swaps == 0);
    assert(std::fabs(naive.x[1] - 3) > 1);  // the last equation says x1 = 3
    // The same wrong digits as Python: the multiply and the subtraction are rounded separately.
    assert(nearAll(naive.x, {1.9999999545383673, 4.470348358154297, 0.9999999800000005}));
    assert(good.swaps == 2 && nearAll(good.x, {1.99999997, 3.0, 0.9999999800000003}, 1e-15));
    // On a diagonally dominant matrix both take the diagonal.
    FMat D = {{10, 1, 2}, {1, 12, -3}, {2, -1, 9}};
    assert(solve(D, {1, 2, 3}).x == solveWithoutPivoting(D, {1, 2, 3}).x);
    Solution z = solveWithoutPivoting({{0, 1}, {1, 0}}, {2, 3});
    assert(z.swaps == 1 && nearAll(z.x, {3, 2}));
}

void testToleranceAndTies() {
    Solution s = solve({{1e-10}}, {1});
    assert(s.kind == Kind::NoSolution && s.rank == 0);
    s = solve({{1e-10}}, {1}, 1e-12);
    assert(s.kind == Kind::Unique && near(s.x[0], 1e10));
    assert(solve({{1e-10}}, {1e-10}).kind == Kind::Infinite);
    assert(solve({{1, 1}, {-1, 1}}, {2, 0}).swaps == 0);  // a tie keeps the upper row
    assert(solve({{1, 2}, {3, 4}}, {5, 6}).swaps == 1);
}

void testEdgeCases() {
    Solution s = solve({{4}}, {2});
    assert(s.kind == Kind::Unique && s.x == std::vector<double>{0.5} && s.updates == 0);
    s = solve({{0}}, {0});
    assert(s.kind == Kind::Infinite && s.x == std::vector<double>{0.0} && s.rank == 0);
    assert(solve({{0}}, {3}).kind == Kind::NoSolution);
    assert(determinant({{-2.5}}) == -2.5 && determinant({{0}}) == 0.0);
    for (auto [n, m] : std::vector<std::pair<int, int>>{{1, 3}, {3, 1}, {3, 3}, {2, 5}}) {
        FMat Z(n, std::vector<double>(m, 0));
        Solution z = solve(Z, std::vector<double>(n, 0));
        assert(z.kind == Kind::Infinite && z.rank == 0 && z.updates == 0 && z.x == std::vector<double>(m, 0));
        std::vector<double> b(n, 0);
        b[n - 1] = 1;
        assert(solve(Z, b).kind == Kind::NoSolution);
    }
    s = solve({{1, 2}, {3, 4}}, {0, 0});
    assert(s.kind == Kind::Unique && nearAll(s.x, {0, 0}));
    s = solve({{1, 2, 3}, {2, 4, 6}, {1, 0, 1}}, {0, 0, 0});
    assert(s.kind == Kind::Infinite && s.rank == 2 && nearAll(s.x, {0, 0, 0}));
}

void testErrors() {
    expectThrow([] { solve({}, {}); }, "no rows");
    expectThrow([] { solve({{}}, {1}); }, "no columns");
    expectThrow([] { solve({{1, 2}, {3}}, {1, 2}); }, "row 1 of A has 1 entries");
    expectThrow([] { solveWithoutPivoting({{1, 2}, {3, 4}}, {1}); }, "b has 1 entries");
    expectThrow([] { determinant({{1, 2}}); }, "square");
    expectThrow([] { determinant({}); }, "no rows");
    expectThrow([] { solveMod({{1}}, {1}, 1); }, "at least 2");
    expectThrow([] { solveMod({{1}}, {1}, 0); }, "at least 2");
    expectThrow([] { solveMod({{1, 2}, {3}}, {1, 2}, 7); }, "row 1 of A");
    expectThrow([] { solveMod({{2}}, {1}, 4); }, "p must be prime");
    expectThrow([] { determinantMod({{3, 1}, {1, 1}}, 9); }, "p must be prime");
    expectThrow([] { determinantMod({{1, 2}}, 7); }, "square");
}

void testPinnedFloat() {
    for (const PinnedFloat& c : PINNED_FLOAT) {
        Solution s = solve(c.A, c.b);
        assert(s.kind == c.kind && s.rank == c.rank && s.pivotCols == c.pivots && s.swaps == c.swaps && s.updates == c.updates);
        assert(nearAll(s.x, c.x));
    }
    for (const PinnedDet& c : PINNED_DET) assert(near(determinant(c.A), c.det));
}

/* ---------- modulo a prime ---------- */

void testModWorkedExample() {
    ModSolution s = solveMod(WORKED_AI, {8, -11, -3}, 7);
    assert(s.kind == Kind::Unique && (s.x == std::vector<uint64_t>{2, 3, 6}) && s.updates == 8);
    assert(determinantMod(WORKED_AI, 7) == 6);
    assert(mulMod(5, 3, 7) == 1 && inverseMod(5, 7) == 3 && powMod(2, 10, 1000) == 24);
    assert(reduceMod(-1, 7) == 6 && reduceMod(INT64_MIN, P64) == P64 - 9223372036854775808ULL);
}

void testModRandomSystemsWithAKnownSolution() {
    std::mt19937_64 rng(7);
    for (uint64_t p : PRIMES) {
        for (int trial = 0; trial < 60; trial++) {
            int n = 1 + rng() % 6, m = 1 + rng() % 6;
            IMat A(n, std::vector<int64_t>(m));
            for (auto& row : A)
                for (auto& v : row) v = static_cast<int64_t>(rng());  // any int64, negative ones too
            std::vector<uint64_t> xTrue(m);
            for (auto& v : xTrue) v = rng() % p;
            std::vector<uint64_t> bu = matVecMod(A, xTrue, p);
            std::vector<int64_t> b;
            for (uint64_t v : bu) b.push_back(asInt64(v, p));
            ModSolution s = solveMod(A, b, p);
            assert(s.kind != Kind::NoSolution);
            assert(matVecMod(A, s.x, p) == bu);
            for (uint64_t v : s.x) assert(v < p);
            if (s.rank == m) assert(s.kind == Kind::Unique && s.x == xTrue);
            else assert(s.kind == Kind::Infinite);
        }
    }
}

void testModRankAndDeterminantAgainstBruteForce() {
    std::mt19937_64 rng(8);
    for (uint64_t p : {2ULL, 3ULL, 5ULL, 7ULL, 1009ULL}) {
        for (int trial = 0; trial < 150; trial++) {
            int n = 1 + rng() % 4, m = 1 + rng() % 4;
            IMat A(n, std::vector<int64_t>(m));
            for (auto& row : A)
                for (auto& v : row) v = rng() % 10 < 7 ? static_cast<int64_t>(rng() % p) : 0;
            assert(solveMod(A, std::vector<int64_t>(n, 0), p).rank == rankBrute(A, p));
        }
    }
    for (uint64_t p : PRIMES) {
        for (int trial = 0; trial < 40; trial++) {
            int n = 1 + rng() % 5;
            IMat A(n, std::vector<int64_t>(n));
            std::vector<std::vector<uint64_t>> R(n, std::vector<uint64_t>(n));
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++) {
                    A[i][j] = static_cast<int64_t>(rng());
                    R[i][j] = reduceMod(A[i][j], p);
                }
            assert(determinantMod(A, p) == detCofactorMod(R, p));
        }
    }
}

void testModSingularAndInconsistent() {
    std::mt19937_64 rng(10);
    for (uint64_t p : {5ULL, 13ULL, 998244353ULL}) {
        for (int trial = 0; trial < 80; trial++) {
            int n = 2 + rng() % 4, m = 1 + rng() % 5;
            IMat A(n, std::vector<int64_t>(m));
            for (int i = 0; i < n - 1; i++)
                for (auto& v : A[i]) v = static_cast<int64_t>(rng() % p);
            std::vector<uint64_t> w(n - 1);
            for (auto& v : w) v = rng() % p;
            for (int j = 0; j < m; j++) {
                uint64_t s = 0;
                for (int i = 0; i < n - 1; i++) s = addMod(s, mulMod(w[i], static_cast<uint64_t>(A[i][j]), p), p);
                A[n - 1][j] = static_cast<int64_t>(s);
            }
            std::vector<uint64_t> xTrue(m);
            for (auto& v : xTrue) v = rng() % p;
            std::vector<uint64_t> bu = matVecMod(A, xTrue, p);
            std::vector<int64_t> b(bu.begin(), bu.end());
            ModSolution s = solveMod(A, b, p);
            assert(s.rank < n && matVecMod(A, s.x, p) == bu);
            b[n - 1] = static_cast<int64_t>((bu[n - 1] + 1) % p);
            ModSolution bad = solveMod(A, b, p);
            assert(bad.kind == Kind::NoSolution && bad.x.empty());
        }
    }
}

void testModEdgeCases() {
    ModSolution s = solveMod({{5}}, {3}, 7);
    assert(s.kind == Kind::Unique && s.x == std::vector<uint64_t>{2});
    s = solveMod({{0}}, {0}, 5);
    assert(s.kind == Kind::Infinite && s.x == std::vector<uint64_t>{0} && s.rank == 0);
    assert(solveMod({{0}}, {4}, 5).kind == Kind::NoSolution);
    assert(solveMod({{7}}, {3}, 7).kind == Kind::NoSolution);
    assert(solveMod({{7}}, {14}, 7).kind == Kind::Infinite);
    assert((solveMod({{0, 0, 0}, {0, 0, 0}}, {0, 0}, 11).x == std::vector<uint64_t>{0, 0, 0}));
    assert(determinantMod({{0, 0}, {0, 0}}, 11) == 0 && determinantMod({{-3}}, 7) == 4);
    assert(determinantMod({{0, 1}, {1, 0}}, 5) == 4 && determinantMod({{0, 1}, {1, 0}}, 2) == 1);
    assert((solveMod({{1, 2, 3}, {0, 1, 4}, {5, 6, 0}}, {0, 0, 0}, 101).x == std::vector<uint64_t>{0, 0, 0}));
    assert(solveMod({{1, 2, 3}, {2, 4, 6}, {1, 0, 1}}, {0, 0, 0}, 101).kind == Kind::Infinite);
}

void testModPinned() {
    for (const PinnedMod& c : PINNED_MOD) {
        ModSolution s = solveMod(c.A, c.b, c.p);
        assert(s.kind == c.kind && s.x == c.x && s.rank == c.rank && s.pivotCols == c.pivots && s.swaps == c.swaps && s.updates == c.updates);
    }
    for (const PinnedDetMod& c : PINNED_DET_MOD) assert(determinantMod(c.A, c.p) == c.det);
}

/* ---------- the work ---------- */

void testWorkCount() {
    std::mt19937_64 rng(11);
    std::uniform_real_distribution<double> real(1, 2);
    for (long long n : {1, 2, 3, 5, 10, 20, 40, 80}) {
        FMat A(n, std::vector<double>(n));
        for (auto& row : A)
            for (auto& v : row) v = real(rng);
        assert(solve(A, std::vector<double>(n, 1)).updates == (n - 1) * n * (n + 1) / 3);
    }
    for (auto [n, m] : std::vector<std::pair<int, int>>{{5, 3}, {3, 5}, {8, 2}, {2, 8}}) {
        FMat A(n, std::vector<double>(m));
        for (auto& row : A)
            for (auto& v : row) v = real(rng);
        long long want = 0;
        for (int k = 0; k < std::min(n, m); k++) want += static_cast<long long>(n - 1 - k) * (m - k);
        assert(solve(A, std::vector<double>(n, 0)).updates == want);
    }
    for (int n : {1, 4, 9}) {
        FMat I(n, std::vector<double>(n, 0)), U(n, std::vector<double>(n, 0));
        for (int i = 0; i < n; i++)
            for (int j = i; j < n; j++) {
                U[i][j] = 1;
                if (i == j) I[i][j] = 1;
            }
        assert(solve(I, std::vector<double>(n, 1)).updates == 0);  // rows already zero are skipped
        assert(solve(U, std::vector<double>(n, 1)).updates == 0);
    }
    assert(solveMod({{1, 0, 0}, {0, 1, 0}, {0, 0, 1}}, {1, 2, 3}, 7).updates == 0);
}

}  // namespace

int main() {
    testWorkedExample();
    testRandomSystemsWithAKnownSolution();
    testSingularAndInconsistentBuiltOnPurpose();
    testRankAndDeterminantAgainstBruteForce();
    testNonSquare();
    testThePivotingExample();
    testToleranceAndTies();
    testEdgeCases();
    testErrors();
    testPinnedFloat();
    testModWorkedExample();
    testModRandomSystemsWithAKnownSolution();
    testModRankAndDeterminantAgainstBruteForce();
    testModSingularAndInconsistent();
    testModEdgeCases();
    testModPinned();
    testWorkCount();
    std::cout << "All Gaussian elimination tests passed\n";
    return 0;
}
