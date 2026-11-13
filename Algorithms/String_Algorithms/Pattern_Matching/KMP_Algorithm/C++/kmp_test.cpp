/**
 * Unit tests for KMP Algorithm
 */

#include <cassert>
#include <vector>
#include <string>
#include <iostream>
#include "kmp.cpp"

void testBasicSearch() {
    std::string text = "ABABDABACDABABCABC";
    std::string pattern = "ABABCABC";
    std::vector<int> result = kmpSearch(text, pattern);
    assert(result.size() == 1);
    assert(result[0] == 10);
}

void testMultipleOccurrences() {
    std::string text = "AABAACAADAABAABA";
    std::string pattern = "AABA";
    std::vector<int> result = kmpSearch(text, pattern);
    assert(result.size() == 3);
    assert(result[0] == 0);
    assert(result[1] == 9);
    assert(result[2] == 12);
}

void testNoMatch() {
    std::string text = "ABCDEFG";
    std::string pattern = "XYZ";
    std::vector<int> result = kmpSearch(text, pattern);
    assert(result.empty());
}

void testLPSArray() {
    std::string pattern = "ABABCABC";
    std::vector<int> lps = buildLPS(pattern);
    std::vector<int> expected = {0, 0, 1, 2, 0, 1, 2, 0};
    assert(lps.size() == expected.size());
    for (size_t i = 0; i < lps.size(); i++) {
        assert(lps[i] == expected[i]);
    }
}

void testLPSAAAA() {
    std::string pattern = "AAAA";
    std::vector<int> lps = buildLPS(pattern);
    std::vector<int> expected = {0, 1, 2, 3};
    assert(lps.size() == expected.size());
    for (size_t i = 0; i < lps.size(); i++) {
        assert(lps[i] == expected[i]);
    }
}

void testCount() {
    std::string text = "AABAACAADAABAABA";
    std::string pattern = "AABA";
    int count = kmpSearchCount(text, pattern);
    assert(count == 3);
}

void testFirstOccurrence() {
    std::string text = "AABAACAADAABAABA";
    std::string pattern = "AABA";
    int first = kmpSearchFirst(text, pattern);
    assert(first == 0);
}

void testFirstOccurrenceNotFound() {
    std::string text = "ABCDEF";
    std::string pattern = "XYZ";
    int first = kmpSearchFirst(text, pattern);
    assert(first == -1);
}

void testEmptyPattern() {
    std::string text = "ABCDEF";
    std::string pattern = "";
    std::vector<int> result = kmpSearch(text, pattern);
    assert(result.empty());
}

void testEmptyText() {
    std::string text = "";
    std::string pattern = "ABC";
    std::vector<int> result = kmpSearch(text, pattern);
    assert(result.empty());
}

void testOverlapsAndEdges() {
    assert((kmpSearch("aaaa", "aa") == std::vector<int>{0, 1, 2}));
    assert((kmpSearch("ABABABA", "ABABA") == std::vector<int>{0, 2}));
    assert(kmpSearch("AB", "ABC").empty());
    assert((kmpSearch("xxabc", "abc") == std::vector<int>{2}));
    assert((buildLPS("ABABAC") == std::vector<int>{0, 0, 1, 2, 3, 0}));
}

int main() {
    testBasicSearch();
    testMultipleOccurrences();
    testNoMatch();
    testLPSArray();
    testLPSAAAA();
    testCount();
    testFirstOccurrence();
    testFirstOccurrenceNotFound();
    testEmptyPattern();
    testEmptyText();
    testOverlapsAndEdges();
    
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

