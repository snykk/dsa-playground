#include <iostream>
#include <cassert>
#include "suffix_array.cpp"

void testSearch() {
    SuffixArray sa("banana");
    vector<int> result = sa.search("ana");
    assert((result == vector<int>{1, 3}));
    assert((sa.search("a") == vector<int>{1, 3, 5}));
    assert((sa.search("nan") == vector<int>{2}));
    assert(sa.search("xyz").empty());
    assert(sa.search("bananas").empty());
    cout << "testSearch passed" << endl;
}

void testEdgeCases() {
    SuffixArray sa("banana");
    // The empty pattern is a prefix of every suffix: every start index 0..n-1.
    assert((sa.search("") == vector<int>{0, 1, 2, 3, 4, 5}));
    SuffixArray empty("");
    assert(empty.search("a").empty());
    cout << "testEdgeCases passed" << endl;
}

int main() {
    cout << "Running Suffix Array tests..." << endl;
    testSearch();
    testEdgeCases();
    cout << "\nAll tests passed!" << endl;
    return 0;
}
