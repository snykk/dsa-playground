/**
 * Unit tests for Boyer-Moore Algorithm
 */

#include <cassert>
#include <vector>
#include <string>
#include <iostream>
#include "boyer_moore.cpp"

void testBasicSearch() {
    std::string text = "ABABDABACDABABCABC";
    std::string pattern = "ABABCABC";
    std::vector<int> result = boyerMooreSearch(text, pattern);
    assert(result.size() == 1);
    assert(result[0] == 10);
}

void testMultipleOccurrences() {
    std::string text = "AABAACAADAABAABA";
    std::string pattern = "AABA";
    std::vector<int> result = boyerMooreSearch(text, pattern);
    assert(result.size() == 3);
    assert(result[0] == 0);
    assert(result[1] == 9);
    assert(result[2] == 12);
}

void testNoMatch() {
    std::string text = "ABCDEFG";
    std::string pattern = "XYZ";
    std::vector<int> result = boyerMooreSearch(text, pattern);
    assert(result.empty());
}

void testEmptyPattern() {
    std::string text = "ABCDEF";
    std::string pattern = "";
    std::vector<int> result = boyerMooreSearch(text, pattern);
    assert(result.empty());
}

void testEmptyText() {
    std::string text = "";
    std::string pattern = "ABC";
    std::vector<int> result = boyerMooreSearch(text, pattern);
    assert(result.empty());
}

void testPatternLongerThanText() {
    std::string text = "ABC";
    std::string pattern = "ABCDEF";
    std::vector<int> result = boyerMooreSearch(text, pattern);
    assert(result.empty());
}

void testBadCharTable() {
    std::string pattern = "ABC";
    auto table = buildBadCharTable(pattern);
    assert(table['A'] == 0);
    assert(table['B'] == 1);
    assert(table['C'] == 2);
}

void testLookupOfAbsentCharDoesNotInsert() {
    // Regression: the shift after a match read badChar[c] (operator[]), which
    // inserted an absent c with index 0: the shift was m instead of m + 1 and
    // the polluted table shrank later bad-character shifts as well.
    const auto table = buildBadCharTable("ABC");
    assert(lastOccurrence(table, 'X') == -1);
    assert(lastOccurrence(table, 'C') == 2);
    assert(table.size() == 3);
    // The audit's input: every match is followed by the absent 'X', so the
    // pattern jumps m + 1 = 4 after each match.
    std::string text;
    for (int k = 0; k < 1000; k++) {
        text += "ABCX";
    }
    std::vector<int> result = boyerMooreSearch(text, "ABC");
    assert(result.size() == 1000);
    for (int k = 0; k < 1000; k++) {
        assert(result[k] == 4 * k);
    }
}

void testTextbookAndOverlaps() {
    assert((boyerMooreSearch("HERE IS A SIMPLE EXAMPLE", "EXAMPLE") == std::vector<int>{17}));
    assert((boyerMooreSearch("aaaa", "aa") == std::vector<int>{0, 1, 2}));
    assert((boyerMooreSearch("xxabc", "abc") == std::vector<int>{2}));
}

int main() {
    testBasicSearch();
    testMultipleOccurrences();
    testNoMatch();
    testEmptyPattern();
    testEmptyText();
    testPatternLongerThanText();
    testBadCharTable();
    testTextbookAndOverlaps();
    testLookupOfAbsentCharDoesNotInsert();
    
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

