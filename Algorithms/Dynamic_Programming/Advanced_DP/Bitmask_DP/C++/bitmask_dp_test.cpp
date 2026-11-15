/**
 * Test cases for Bitmask DP (C++)
 */

#include <algorithm>
#include <cassert>
#include <iostream>
#include <numeric>
#include <random>
#include <vector>
#include "bitmask_dp.cpp"

using Matrix = std::vector<std::vector<double>>;

void testTspSmall() {
    Matrix distances = {
        {0, 10, 15, 20},
        {10, 0, 35, 25},
        {15, 35, 0, 30},
        {20, 25, 30, 0},
    };
    assert(travelingSalesmanDp(distances) == 80);
    std::cout << "[PASS] TSP small test passed" << std::endl;
}

void testNoTourIsInfinite() {
    // A city with no edges to the others: no tour exists (not a free tour).
    Matrix distances = {{0, 1, kInfinity}, {1, 0, kInfinity}, {kInfinity, kInfinity, 0}};
    assert(travelingSalesmanDp(distances) == kInfinity);
    std::cout << "[PASS] No tour is infinite test passed" << std::endl;
}

void testTrivialSizes() {
    assert(travelingSalesmanDp({}) == 0);
    assert(travelingSalesmanDp({{0}}) == 0);
    assert(travelingSalesmanDp({{0, 7}, {7, 0}}) == 14);
    std::cout << "[PASS] Trivial sizes test passed" << std::endl;
}

void testTriangle() {
    assert(travelingSalesmanDp({{0, 1, 4}, {1, 0, 2}, {4, 2, 0}}) == 7);
    std::cout << "[PASS] Triangle test passed" << std::endl;
}

void testAgreesWithPython() {
    // Expected values printed by the Python traveling_salesman_dp on the same matrices.
    assert(travelingSalesmanDp({{5}}) == 5);  // one city: its self-distance closes the tour
    Matrix asymmetricFloats = {
        {0, 1.5, 2.25, 9.0, 0.1},
        {3.0, 0, 0.7, 4.4, 2.0},
        {1.1, 6.0, 0, 0.3, 5.5},
        {2.2, 0.9, 7.1, 0, 1.3},
        {0.4, 3.3, 2.8, 6.6, 0},
    };
    assert(travelingSalesmanDp(asymmetricFloats) == 4.2);
    Matrix six = {
        {0, 12, 29, 22, 13, 24},
        {12, 0, 19, 3, 25, 6},
        {29, 19, 0, 21, 23, 28},
        {22, 3, 21, 0, 4, 5},
        {13, 25, 23, 4, 0, 16},
        {24, 6, 28, 5, 16, 0},
    };
    assert(travelingSalesmanDp(six) == 76);
    const double inf = kInfinity;
    Matrix oneCycleOnly = {{0, 2, inf, inf}, {inf, 0, 3, inf}, {inf, inf, 0, 4}, {5, inf, inf, 0}};
    assert(travelingSalesmanDp(oneCycleOnly) == 14);
    std::cout << "[PASS] Agrees with Python test passed" << std::endl;
}

// Cheapest tour by trying every order of cities 1..n-1.
double bruteForceTour(const Matrix& distances) {
    const int n = static_cast<int>(distances.size());
    std::vector<int> order(n - 1);
    std::iota(order.begin(), order.end(), 1);
    double best = kInfinity;
    do {
        double cost = 0;
        int at = 0;
        for (int city : order) {
            cost += distances[at][city];
            at = city;
        }
        best = std::min(best, cost + distances[at][0]);
    } while (std::next_permutation(order.begin(), order.end()));
    return best;
}

void testMatchesBruteForce() {
    std::mt19937 rng(20261115);
    for (int trial = 0; trial < 300; ++trial) {
        const int n = 1 + static_cast<int>(rng() % 8);
        Matrix distances(n, std::vector<double>(n));
        for (int i = 0; i < n; ++i) {
            for (int j = 0; j < n; ++j) {
                // About one edge in six is missing; the matrix is not symmetric.
                distances[i][j] = rng() % 6 == 0 ? kInfinity : static_cast<double>(rng() % 50);
            }
        }
        assert(travelingSalesmanDp(distances) == bruteForceTour(distances));
    }
    std::cout << "[PASS] Matches brute force test passed" << std::endl;
}

int main() {
    std::cout << "Running Bitmask DP tests..." << std::endl;
    testTspSmall();
    testNoTourIsInfinite();
    testTrivialSizes();
    testTriangle();
    testAgreesWithPython();
    testMatchesBruteForce();
    std::cout << "\nAll tests passed!" << std::endl;
    return 0;
}
