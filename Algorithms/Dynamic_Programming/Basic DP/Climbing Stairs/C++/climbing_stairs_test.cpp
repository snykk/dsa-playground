#include <iostream>
#include <cassert>
#include <stdexcept>
#include "climbing_stairs.cpp"

void testSmallValues() {
    assert(climbingStairs(1) == 1);
    assert(climbingStairs(2) == 2);
    assert(climbingStairs(3) == 3);
    assert(climbingStairs(4) == 5);
    assert(climbingStairs(5) == 8);
    assert(climbingStairs(10) == 89);
    std::cout << "[ok] Small values" << std::endl;
}

void testLargeValues() {
    // ways(n) = F(n + 1)
    assert(climbingStairs(45) == 1836311903LL);
    assert(climbingStairs(90) == 4660046610375530309LL);
    std::cout << "[ok] Large values" << std::endl;
}

// Regression: ways(0) used to be 0; climbing zero stairs has exactly one way.
void testZeroSteps() {
    assert(climbingStairs(0) == 1);
    std::cout << "[ok] Zero steps is one way" << std::endl;
}

// Regression: negative n used to be returned unchanged (ways(-3) gave -3).
void testNegativeThrows() {
    bool threw = false;
    try {
        climbingStairs(-3);
    } catch (const std::invalid_argument&) {
        threw = true;
    }
    assert(threw);
    std::cout << "[ok] Negative n throws std::invalid_argument" << std::endl;
}

int main() {
    testSmallValues();
    testLargeValues();
    testZeroSteps();
    testNegativeThrows();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}
