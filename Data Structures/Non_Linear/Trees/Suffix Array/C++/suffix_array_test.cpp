#include <iostream>
#include <cassert>
#include "suffix_array.cpp"

void testSearch() {
    SuffixArray sa("banana");
    vector<int> result = sa.search("ana");
    assert(result.size() == 2);
    assert(result[0] == 1 || result[1] == 1);
    cout << "testSearch passed" << endl;
}

int main() {
    cout << "Running Suffix Array tests..." << endl;
    testSearch();
    cout << "\nAll tests passed! ✓" << endl;
    return 0;
}

