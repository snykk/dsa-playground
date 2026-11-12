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

void testSuffixesAndLcp() {
    std::vector<int> sa = buildSuffixArray("banana");
    std::vector<std::string> want = {"a", "ana", "anana", "banana", "na", "nana"};
    assert(getSuffixes(sa, "banana") == want);
    assert(longestCommonPrefix("banana", 0, 3) == 0);
    assert(longestCommonPrefix("banana", 1, 1) == 5);
    assert(longestCommonPrefix("banana", 3, 1) == 3);
}

void testClassView() {
    SuffixArray sa("banana");
    assert((sa.suffixArray == std::vector<int>{5, 3, 1, 0, 4, 2}));
    assert((sa.search("ana") == std::vector<int>{1, 3}));
    assert((sa.search("nan") == std::vector<int>{2}));
    assert((sa.search("") == std::vector<int>{0, 1, 2, 3, 4, 5}));
    assert(sa.getSuffixes()[0] == "a");
    assert(sa.longestCommonPrefix(3, 1) == 3);
    assert(SuffixArray("").search("a").empty());
}

void testRandomAgainstBruteForce() {
    unsigned state = 12345;
    auto next = [&](unsigned mod) { state = state * 1103515245u + 12345u; return (state >> 16) % mod; };
    for (int iter = 0; iter < 300; iter++) {
        std::string text;
        int len = next(13);
        for (int i = 0; i < len; i++) text += char('a' + next(2));
        std::vector<int> sa = buildSuffixArray(text);
        std::vector<int> order(len);
        for (int i = 0; i < len; i++) order[i] = i;
        std::sort(order.begin(), order.end(),
                  [&](int a, int b) { return text.substr(a) < text.substr(b); });
        assert(sa == order);
        for (int q = 0; q < 8; q++) {
            std::string pat;
            int pl = next(5);
            for (int i = 0; i < pl; i++) pat += char('a' + next(3));
            std::vector<int> want;
            for (int i = 0; i < len; i++)
                if (text.compare(i, pat.size(), pat) == 0) want.push_back(i);
            assert(searchPattern(sa, text, pat) == want);
        }
    }
}

int main() {
    testBuildSuffixArray();
    testSearchPattern();
    testSearchPatternNotFound();
    testSearchPatternSingleChar();
    testEmptyString();
    testBananaOrderAndExactResults();
    testSuffixesAndLcp();
    testClassView();
    testRandomAgainstBruteForce();

    std::cout << "All tests passed!" << std::endl;
    return 0;
}

