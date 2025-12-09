#include <iostream>
#include <vector>
#include <cassert>
#include "knapsack_01.cpp"

int main() {
    std::vector<int> weights = {1, 3, 4, 5};
    std::vector<int> values = {1, 4, 5, 7};
    assert(knapsack01(weights, values, 7) == 9);
    std::cout << "All tests passed! ✓" << std::endl;
    return 0;
}

