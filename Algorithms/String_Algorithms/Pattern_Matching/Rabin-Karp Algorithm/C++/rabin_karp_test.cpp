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

void testBytesAbove0x7F() {
    // Regression: char is signed, so bytes >= 0x80 made the initial hashes
    // negative while rolled hashes were normalized, and matches were lost.
    std::vector<int> a = rabinKarpSearch("a\xFF", "\xFF");
    assert(a.size() == 1 && a[0] == 1);
    std::vector<int> b = rabinKarpSearch("\xFF" "aa" "\xFF\xFF" "aa", "\xFF" "a");
    assert(b.size() == 2 && b[0] == 0 && b[1] == 4);
    // UTF-8 text: "caf\xC3\xA9" is "cafe" with an e-acute (2 bytes).
    std::vector<int> c = rabinKarpSearch("caf\xC3\xA9 caf\xC3\xA9", "caf\xC3\xA9");
    assert(c.size() == 2 && c[0] == 0 && c[1] == 6);
}

int main() {
    testBasicSearch();
    testMultipleOccurrences();
    testNoMatch();
    testEmptyPattern();
    testEmptyText();
    testPatternLongerThanText();
    testBytesAbove0x7F();
    
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

