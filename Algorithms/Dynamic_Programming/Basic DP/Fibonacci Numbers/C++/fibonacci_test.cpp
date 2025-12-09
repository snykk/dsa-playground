/**
 * Test cases for Fibonacci Numbers (C++)
 */

#include <iostream>
#include <cassert>
#include "fibonacci.cpp"

void testBaseCases() {
    assert(fibonacciTabulation(0) == 0);
    assert(fibonacciTabulation(1) == 1);
    std::cout << "✓ Base cases test passed" << std::endl;
}

void testSmallValues() {
    assert(fibonacciTabulation(5) == 5);
    assert(fibonacciTabulation(10) == 55);
    std::cout << "✓ Small values test passed" << std::endl;
}

void testOptimized() {
    assert(fibonacciOptimized(10) == 55);
    assert(fibonacciOptimized(20) == 6765);
    std::cout << "✓ Optimized test passed" << std::endl;
}

void testMemoization() {
    assert(fibonacciMemoization(10) == 55);
    std::cout << "✓ Memoization test passed" << std::endl;
}

int main() {
    std::cout << "Running Fibonacci tests..." << std::endl;
    testBaseCases();
    testSmallValues();
    testOptimized();
    testMemoization();
    std::cout << "\nAll tests passed! ✓" << std::endl;
    return 0;
}

