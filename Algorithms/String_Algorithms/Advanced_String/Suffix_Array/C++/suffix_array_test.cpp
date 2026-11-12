/**
 * Unit tests for Suffix Array
 */

#include <cassert>
#include <vector>
#include <string>
#include <iostream>
#include <algorithm>
#include "suffix_array.cpp"

void testBuildSuffixArray() {
    std::string text = "banana";
    std::vector<int> sa = buildSuffixArray(text);
    assert(sa.size() == 6);
    // Verify all indices are present
    std::vector<bool> found(6, false);
    for (int idx : sa) {
        assert(idx >= 0 && idx < 6);
        found[idx] = true;
    }
    for (bool f : found) {
        assert(f);
    }
}

void testSearchPattern() {
    std::string text = "banana";
    std::vector<int> sa = buildSuffixArray(text);
    std::string pattern = "ana";
    std::vector<int> result = searchPattern(sa, text, pattern);
    assert(result.size() == 2);
    // Verify indices are correct
    std::sort(result.begin(), result.end());
    assert(result[0] == 1 || result[0] == 3);
    assert(result[1] == 1 || result[1] == 3);
}

void testSearchPatternNotFound() {
    std::string text = "banana";
    std::vector<int> sa = buildSuffixArray(text);
    std::string pattern = "xyz";
    std::vector<int> result = searchPattern(sa, text, pattern);
    assert(result.empty());
}

void testSearchPatternSingleChar() {
    std::string text = "banana";
    std::vector<int> sa = buildSuffixArray(text);
    std::string pattern = "a";
    std::vector<int> result = searchPattern(sa, text, pattern);
    assert(result.size() == 3);
}

void testEmptyString() {
    std::string text = "";
    std::vector<int> sa = buildSuffixArray(text);
    assert(sa.empty());
}

void testBananaOrderAndExactResults() {
    std::string text = "banana";
    std::vector<int> sa = buildSuffixArray(text);
    assert((sa == std::vector<int>{5, 3, 1, 0, 4, 2}));
    assert((searchPattern(sa, text, "ana") == std::vector<int>{1, 3}));
    assert((searchPattern(sa, text, "a") == std::vector<int>{1, 3, 5}));
    assert(searchPattern(sa, text, "bananas").empty());
    // The empty pattern is a prefix of every suffix: indices 0..n-1.
    assert((searchPattern(sa, text, "") == std::vector<int>{0, 1, 2, 3, 4, 5}));
    std::vector<int> aaaa = buildSuffixArray("aaaa");
    assert((searchPattern(aaaa, "aaaa", "aa") == std::vector<int>{0, 1, 2}));
    assert(searchPattern(std::vector<int>{}, "", "a").empty());
}

int main() {
    testBuildSuffixArray();
    testSearchPattern();
    testSearchPatternNotFound();
    testSearchPatternSingleChar();
    testEmptyString();
    testBananaOrderAndExactResults();
    
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

