#include <iostream>
#include <vector>
#include <cassert>
#include "knapsack_01.cpp"

int main() {
    std::vector<int> weights = {1, 3, 4, 5};
    std::vector<int> values = {1, 4, 5, 7};
    assert(knapsack01(weights, values, 7) == 9);
    assert(knapsack01({10, 20, 30}, {60, 100, 120}, 50) == 220);  // greedy by ratio gives 160
    assert(knapsack01({1, 2}, {5, 6}, 0) == 0);
    assert(knapsack01({0, 2}, {5, 6}, 0) == 5);                   // weightless items are free
    assert(knapsack01({5}, {9}, 4) == 0);
    assert(knapsack01({4}, {9}, 4) == 9);
    assert(knapsack01({}, {}, 10) == 0);
    std::cout << "All tests passed! OK" << std::endl;
    return 0;
}

