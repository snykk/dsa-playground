#include <iostream>
#include <cassert>
#include "climbing_stairs.cpp"

int main() {
    assert(climbingStairs(3) == 3);
    assert(climbingStairs(5) == 8);
    std::cout << "All tests passed! ✓" << std::endl;
    return 0;
}

