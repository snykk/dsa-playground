#include <iostream>
#include <vector>
#include <cassert>
#include "coin_change.cpp"

int main() {
    std::vector<int> coins = {1, 2, 5};
    assert(coinChangeMinCoins(coins, 11) == 3);
    std::cout << "All tests passed! ✓" << std::endl;
    return 0;
}

