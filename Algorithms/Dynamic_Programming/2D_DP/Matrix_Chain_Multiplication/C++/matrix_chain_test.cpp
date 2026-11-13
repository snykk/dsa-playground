#include <iostream>
#include <vector>
#include <cassert>
#include "matrix_chain.cpp"

void testClassic() {
    std::vector<int> dims = {10, 20, 30};
    assert(matrixChainMultiplication(dims) == 6000);
    assert(matrixChainMultiplication({30, 35, 15, 5, 10, 20, 25}) == 15125);  // CLRS 15.2
    assert(matrixChainMultiplication({40, 20, 30, 10, 30}) == 26000);
    assert(matrixChainMultiplication({10, 20, 30, 40, 30}) == 30000);
    assert(matrixChainMultiplication({1, 2, 3, 4, 3}) == 30);
    assert(matrixChainMultiplication({1, 2, 3, 4}) == 18);
    std::cout << "[ok] Classic chains" << std::endl;
}

// Regression: costs above INT_MAX used to overflow the int table (8e9 came out as -589934592).
void testLargeCostsDoNotOverflow() {
    assert(matrixChainMultiplication({2000, 2000, 2000}) == 8000000000LL);
    assert(matrixChainMultiplication({1000, 1000, 1000, 1000, 1000}) == 3000000000LL);
    std::cout << "[ok] Costs above INT_MAX" << std::endl;
}

// Regression: fewer than two matrices used to index dp out of bounds.
void testFewerThanTwoMatrices() {
    assert(matrixChainMultiplication({}) == 0);
    assert(matrixChainMultiplication({5}) == 0);
    assert(matrixChainMultiplication({5, 10}) == 0);  // a single matrix
    std::cout << "[ok] Fewer than two matrices" << std::endl;
}

int main() {
    testClassic();
    testLargeCostsDoNotOverflow();
    testFewerThanTwoMatrices();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}
