#include <iostream>
#include <vector>
#include <cassert>
#include <stdexcept>
#include "coin_change.cpp"

void testClassic() {
    std::vector<int> coins = {1, 2, 5};
    assert(coinChangeMinCoins(coins, 11) == 3);  // 5 + 5 + 1
    assert(coinChangeMinCoins({2, 5, 10, 1}, 27) == 4);  // 10 + 10 + 5 + 2
    assert(coinChangeMinCoins({186, 419, 83, 408}, 6249) == 20);
    assert(coinChangeMinCoins({1}, 7) == 7);
    std::cout << "[ok] Classic cases" << std::endl;
}

void testEdgeCases() {
    assert(coinChangeMinCoins({1, 2, 5}, 0) == 0);  // no coins needed
    assert(coinChangeMinCoins({}, 0) == 0);
    assert(coinChangeMinCoins({2}, 3) == -1);  // odd amount, even coin
    assert(coinChangeMinCoins({5}, 3) == -1);  // every coin is too large
    assert(coinChangeMinCoins({}, 5) == -1);  // no coins at all
    std::cout << "[ok] Edge cases" << std::endl;
}

// Regression: a negative amount used to throw std::length_error from the vector.
void testNegativeAmountThrows() {
    bool threw = false;
    try {
        coinChangeMinCoins({1, 2, 5}, -1);
    } catch (const std::invalid_argument&) {
        threw = true;
    }
    assert(threw);
    std::cout << "[ok] Negative amount throws std::invalid_argument" << std::endl;
}

int main() {
    testClassic();
    testEdgeCases();
    testNegativeAmountThrows();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}
