#include <iostream>
#include <vector>
#include <cassert>
#include "matrix_chain.cpp"

int main() {
    std::vector<int> dims = {10, 20, 30};
    assert(matrixChainMultiplication(dims) == 6000);
    std::cout << "All tests passed! ✓" << std::endl;
    return 0;
}

