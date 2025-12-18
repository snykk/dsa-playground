/**
 * Unit tests for Naive Pattern Search
 */

#include <cassert>
#include <vector>
#include <string>
#include <iostream>
#include "naive_pattern_search.cpp"

void testBasicSearch() {
    std::string text = "ABABDABACDABABCABC";
    std::string pattern = "ABABCABC";
    std::vector<int> result = naivePatternSearch(text, pattern);
    assert(result.size() == 1);
    assert(result[0] == 10);
}

void testMultipleOccurrences() {
    std::string text = "AABAACAADAABAABA";
    std::string pattern = "AABA";
    std::vector<int> result = naivePatternSearch(text, pattern);
    assert(result.size() == 3);
    assert(result[0] == 0);
    assert(result[1] == 9);
    assert(result[2] == 12);
}

void testNoMatch() {
    std::string text = "ABCDEFG";
    std::string pattern = "XYZ";
    std::vector<int> result = naivePatternSearch(text, pattern);
    assert(result.empty());
}

void testPatternLongerThanText() {
    std::string text = "ABC";
    std::string pattern = "ABCDEF";
    std::vector<int> result = naivePatternSearch(text, pattern);
    assert(result.empty());
}

void testEmptyPattern() {
    std::string text = "ABCDEF";
    std::string pattern = "";
    std::vector<int> result = naivePatternSearch(text, pattern);
    assert(result.empty());
}

void testEmptyText() {
    std::string text = "";
    std::string pattern = "ABC";
    std::vector<int> result = naivePatternSearch(text, pattern);
    assert(result.empty());
}

void testPatternEqualsText() {
    std::string text = "ABC";
    std::string pattern = "ABC";
    std::vector<int> result = naivePatternSearch(text, pattern);
    assert(result.size() == 1);
    assert(result[0] == 0);
}

void testSingleCharacter() {
    std::string text = "AAAAA";
    std::string pattern = "A";
    std::vector<int> result = naivePatternSearch(text, pattern);
    assert(result.size() == 5);
}

void testCount() {
    std::string text = "AABAACAADAABAABA";
    std::string pattern = "AABA";
    int count = naivePatternSearchCount(text, pattern);
    assert(count == 3);
}

void testFirstOccurrence() {
    std::string text = "AABAACAADAABAABA";
    std::string pattern = "AABA";
    int first = naivePatternSearchFirst(text, pattern);
    assert(first == 0);
}

void testFirstOccurrenceNotFound() {
    std::string text = "ABCDEF";
    std::string pattern = "XYZ";
    int first = naivePatternSearchFirst(text, pattern);
    assert(first == -1);
}

int main() {
    testBasicSearch();
    testMultipleOccurrences();
    testNoMatch();
    testPatternLongerThanText();
    testEmptyPattern();
    testEmptyText();
    testPatternEqualsText();
    testSingleCharacter();
    testCount();
    testFirstOccurrence();
    testFirstOccurrenceNotFound();
    
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

