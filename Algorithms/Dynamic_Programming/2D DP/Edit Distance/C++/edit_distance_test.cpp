#include <iostream>
#include <string>
#include <cassert>
#include "edit_distance.cpp"

int main() {
    assert(editDistance("kitten", "sitting") == 3);
    std::cout << "All tests passed! ✓" << std::endl;
    return 0;
}

