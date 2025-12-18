/**
 * Unit tests for Rabin-Karp Algorithm
 */

#include <cassert>
#include <vector>
#include <string>
#include <iostream>
#include "rabin_karp.cpp"

void testBasicSearch() {
    std::string text = "ABABDABACDABABCABC";
    std::string pattern = "ABABCABC";
    std::vector<int> result = rabinKarpSearch(text, pattern);
    assert(result.size() == 1);
    assert(result[0] == 10);
}

void testMultipleOccurrences() {
    std::string text = "AABAACAADAABAABA";
    std::string pattern = "AABA";
    std::vector<int> result = rabinKarpSearch(text, pattern);
    assert(result.size() == 3);
    assert(result[0] == 0);
    assert(result[1] == 9);
    assert(result[2] == 12);
}

void testNoMatch() {
    std::string text = "ABCDEFG";
    std::string pattern = "XYZ";
    std::vector<int> result = rabinKarpSearch(text, pattern);
    assert(result.empty());
}

void testEmptyPattern() {
    std::string text = "ABCDEF";
    std::string pattern = "";
    std::vector<int> result = rabinKarpSearch(text, pattern);
    assert(result.empty());
}

void testEmptyText() {
    std::string text = "";
    std::string pattern = "ABC";
    std::vector<int> result = rabinKarpSearch(text, pattern);
    assert(result.empty());
}

void testPatternLongerThanText() {
    std::string text = "ABC";
    std::string pattern = "ABCDEF";
    std::vector<int> result = rabinKarpSearch(text, pattern);
    assert(result.empty());
}

int main() {
    testBasicSearch();
    testMultipleOccurrences();
    testNoMatch();
    testEmptyPattern();
    testEmptyText();
    testPatternLongerThanText();
    
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

