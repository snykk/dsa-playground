/**
 * Test cases for Fractional Knapsack (C++)
 */

#include <iostream>
#include <vector>
#include <cassert>
#include <iomanip>
#include <cmath>
#include "fractional_knapsack.cpp"

void testBasicKnapsack() {
    std::vector<std::pair<double, double>> items = {{60, 10}, {100, 20}, {120, 30}};
    double capacity = 50;
    double result = fractionalKnapsack(items, capacity);
    assert(std::abs(result - 240.0) < 0.01);
    std::cout << "Basic knapsack test passed" << std::endl;
}

void testAllItemsFit() {
    std::vector<std::pair<double, double>> items = {{10, 5}, {20, 10}};
    double capacity = 20;
    double result = fractionalKnapsack(items, capacity);
    assert(std::abs(result - 30.0) < 0.01);
    std::cout << "All items fit test passed" << std::endl;
}

// Regression: a zero-weight item made the total NaN (0 * (0 / 0)).
// It uses no capacity, so it is always taken whole.
void testZeroWeightItem() {
    std::vector<std::pair<double, double>> items = {{10, 0}, {60, 10}};
    double result = fractionalKnapsack(items, 5);
    assert(std::abs(result - 40.0) < 1e-9);

    std::vector<std::pair<double, double>> worthless = {{0, 0}, {60, 10}};
    result = fractionalKnapsack(worthless, 5);
    assert(!std::isnan(result));
    assert(std::abs(result - 30.0) < 1e-9);
    std::cout << "Zero-weight item test passed" << std::endl;
}

int main() {
    std::cout << "Running Fractional Knapsack tests..." << std::endl;
    std::cout << std::fixed << std::setprecision(2);
    testBasicKnapsack();
    testAllItemsFit();
    testZeroWeightItem();
    std::cout << "\nAll tests passed!" << std::endl;
    return 0;
}

