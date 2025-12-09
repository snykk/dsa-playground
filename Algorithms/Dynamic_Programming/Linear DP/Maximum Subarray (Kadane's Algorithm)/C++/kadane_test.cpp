#include <iostream>
#include <vector>
#include <cassert>
#include "kadane.cpp"

int main() {
    std::vector<int> arr = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
    assert(kadaneAlgorithm(arr) == 6);
    std::cout << "All tests passed! ✓" << std::endl;
    return 0;
}

