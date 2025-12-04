#include <iostream>
#include <cassert>
#include "suffix_tree.cpp"

void testSearch() {
    SuffixTree st("banana");
    vector<int> result = st.search("ana");
    assert(result.size() > 0);
    cout << "testSearch passed" << endl;
}

int main() {
    cout << "Running Suffix Tree tests..." << endl;
    testSearch();
    cout << "\nAll tests passed! ✓" << endl;
    return 0;
}


