/**
 * Test cases for Fibonacci Numbers (C++)
 */

#include <iostream>
#include <cassert>
#include <stdexcept>
#include "fibonacci.cpp"

void testBaseCases() {
    assert(fibonacciTabulation(0) == 0);
    assert(fibonacciTabulation(1) == 1);
    assert(fibonacciOptimized(0) == 0);
    assert(fibonacciOptimized(1) == 1);
    assert(fibonacciMemoization(0) == 0);
    assert(fibonacciMemoization(1) == 1);
    std::cout << "[ok] Base cases test passed" << std::endl;
}

void testSmallValues() {
    assert(fibonacciTabulation(5) == 5);
    assert(fibonacciTabulation(10) == 55);
    std::cout << "[ok] Small values test passed" << std::endl;
}

void testOptimized() {
    assert(fibonacciOptimized(10) == 55);
    assert(fibonacciOptimized(20) == 6765);
    std::cout << "[ok] Optimized test passed" << std::endl;
}

void testMemoization() {
    assert(fibonacciMemoization(10) == 55);
    std::cout << "[ok] Memoization test passed" << std::endl;
}

void testLargeValues() {
    // F(92) is the largest Fibonacci number that fits in a signed 64-bit integer.
    assert(fibonacciTabulation(50) == 12586269025LL);
    assert(fibonacciOptimized(90) == 2880067194370816120LL);
    assert(fibonacciTabulation(92) == 7540113804746346429LL);
    assert(fibonacciOptimized(92) == 7540113804746346429LL);
    assert(fibonacciMemoization(92) == 7540113804746346429LL);
    std::cout << "[ok] Large values test passed" << std::endl;
}

void testApproachesAgree() {
    for (int n = 0; n <= 92; ++n) {
        long long expected = fibonacciTabulation(n);
        assert(fibonacciOptimized(n) == expected);
        assert(fibonacciMemoization(n) == expected);
        if (n >= 2) {
            assert(expected == fibonacciTabulation(n - 1) + fibonacciTabulation(n - 2));
        }
    }
    std::cout << "[ok] Approaches agree for n = 0..92" << std::endl;
}

template <typename F>
bool throwsInvalidArgument(F f) {
    try {
        f();
    } catch (const std::invalid_argument&) {
        return true;
    }
    return false;
}

// Regression: negative n used to be returned unchanged (F(-5) gave -5).
void testNegativeThrows() {
    for (int n : {-1, -5}) {
        assert(throwsInvalidArgument([n] { fibonacciTabulation(n); }));
        assert(throwsInvalidArgument([n] { fibonacciOptimized(n); }));
        assert(throwsInvalidArgument([n] { fibonacciMemoization(n); }));
    }
    std::cout << "[ok] Negative n throws std::invalid_argument" << std::endl;
}

int main() {
    std::cout << "Running Fibonacci tests..." << std::endl;
    testBaseCases();
    testSmallValues();
    testOptimized();
    testMemoization();
    testLargeValues();
    testApproachesAgree();
    testNegativeThrows();
    std::cout << "\nAll tests passed!" << std::endl;
    return 0;
}
