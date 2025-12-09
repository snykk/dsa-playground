/**
 * Test cases for Fractional Knapsack (C++)
 */

#include <iostream>
#include <vector>
#include <cassert>
#include <iomanip>
#include "fractional_knapsack.cpp"

void testBasicKnapsack() {
    std::vector<std::pair<double, double>> items = {{60, 10}, {100, 20}, {120, 30}};
    double capacity = 50;
    double result = fractionalKnapsack(items, capacity);
    assert(std::abs(result - 240.0) < 0.01);
    std::cout << "✓ Basic knapsack test passed" << std::endl;
}

void testAllItemsFit() {
    std::vector<std::pair<double, double>> items = {{10, 5}, {20, 10}};
    double capacity = 20;
    double result = fractionalKnapsack(items, capacity);
    assert(std::abs(result - 30.0) < 0.01);
    std::cout << "✓ All items fit test passed" << std::endl;
}

int main() {
    std::cout << "Running Fractional Knapsack tests..." << std::endl;
    std::cout << std::fixed << std::setprecision(2);
    testBasicKnapsack();
    testAllItemsFit();
    std::cout << "\nAll tests passed! ✓" << std::endl;
    return 0;
}

