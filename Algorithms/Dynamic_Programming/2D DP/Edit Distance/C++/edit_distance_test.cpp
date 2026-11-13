#include <iostream>
#include <string>
#include <cassert>
#include "edit_distance.cpp"

void testClassic() {
    assert(editDistance("kitten", "sitting") == 3);
    assert(editDistance("horse", "ros") == 3);
    assert(editDistance("intention", "execution") == 5);
    assert(editDistance("sunday", "saturday") == 3);
    assert(editDistance("flaw", "lawn") == 2);
    assert(editDistance("cat", "feline") == 6);  // no shared letters
    std::cout << "[ok] Classic cases" << std::endl;
}

void testEdgeCases() {
    assert(editDistance("", "") == 0);  // both empty
    assert(editDistance("abc", "") == 3);  // delete everything
    assert(editDistance("", "abc") == 3);  // insert everything
    assert(editDistance("abc", "abc") == 0);  // identical
    assert(editDistance("a", "b") == 1);  // one replacement
    assert(editDistance("ab", "ba") == 2);  // no transpositions in Levenshtein
    std::cout << "[ok] Edge cases" << std::endl;
}

void testSymmetric() {
    assert(editDistance("sitting", "kitten") == editDistance("kitten", "sitting"));
    assert(editDistance("lawn", "flaw") == editDistance("flaw", "lawn"));
    std::cout << "[ok] Symmetric" << std::endl;
}

int main() {
    testClassic();
    testEdgeCases();
    testSymmetric();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}
