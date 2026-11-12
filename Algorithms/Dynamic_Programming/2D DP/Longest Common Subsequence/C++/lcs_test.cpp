#include <iostream>
#include <string>
#include <cassert>
#include "lcs.cpp"

int main() {
    assert(lcsLength("ABCDGH", "AEDFHR") == 3);
    assert(lcsLength("ABCBDAB", "BDCAB") == 4);
    assert(lcsLength("AGGTAB", "GXTXAYB") == 4);
    assert(lcsLength("", "abc") == 0);
    assert(lcsLength("abc", "cba") == 1);
    assert(lcsLength("AAAA", "AA") == 2);
    assert(lcsLength("abc", "abc") == 3);
    std::cout << "All tests passed! OK" << std::endl;
    return 0;
}

