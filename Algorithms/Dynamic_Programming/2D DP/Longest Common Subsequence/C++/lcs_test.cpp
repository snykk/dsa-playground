#include <iostream>
#include <string>
#include <cassert>
#include "lcs.cpp"

int main() {
    assert(lcsLength("ABCDGH", "AEDFHR") == 3);
    std::cout << "All tests passed! ✓" << std::endl;
    return 0;
}

