#include <iostream>
#include <vector>
#include <cassert>
#include "lis.cpp"

int main() {
    std::vector<int> arr = {10, 9, 2, 5, 3, 7, 101, 18};
    assert(lisDP(arr) == 4);
    std::cout << "All tests passed! ✓" << std::endl;
    return 0;
}

