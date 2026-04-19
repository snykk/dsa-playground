/**
 * Unit tests for Z-Algorithm.
 */
#include <algorithm>
#include <cassert>
#include <iostream>
#include <string>
#include <vector>

#include "z_algorithm.cpp"

void testBasicSearch() {
    std::vector<int> result = zAlgorithmSearch("ABABDABACDABABCABC", "ABABCABC");
    assert(result.size() == 1);
    assert(result[0] == 10);
}

void testMultipleOccurrences() {
    std::vector<int> result = zAlgorithmSearch("AABAACAADAABAABA", "AABA");
    assert(result.size() == 3);
    assert(result[0] == 0);
    assert(result[1] == 9);
    assert(result[2] == 12);
}

void testNoMatch() {
    std::vector<int> result = zAlgorithmSearch("ABCDEFG", "XYZ");
    assert(result.empty());
}

void testZArrayClassic() {
    std::vector<int> z = buildZArray("aabxaabxcaabxaabxay");
    assert(z[0] == 0);
    assert(z[4] == 4);
    assert(z[9] == 8);
}

void testZArrayAllSame() {
    // For "aaaa" expect Z = [0, 3, 2, 1]
    std::vector<int> z = buildZArray("aaaa");
    assert(z.size() == 4);
    assert(z[0] == 0);
    assert(z[1] == 3);
    assert(z[2] == 2);
    assert(z[3] == 1);
}

void testZArrayNoRepetition() {
    std::vector<int> z = buildZArray("abcdef");
    for (int v : z) {
        assert(v == 0);
    }
}

void testSingleCharacter() {
    std::vector<int> z = buildZArray("a");
    assert(z.size() == 1);
    assert(z[0] == 0);
}

void testEmptyPattern() {
    assert(zAlgorithmSearch("ABCDEF", "").empty());
}

void testEmptyText() {
    assert(zAlgorithmSearch("", "ABC").empty());
}

void testPatternLongerThanText() {
    assert(zAlgorithmSearch("ABC", "ABCDEF").empty());
}

void testOverlappingMatches() {
    // "aaa" appears at index 0 and 1 in "aaaa"
    std::vector<int> result = zAlgorithmSearch("aaaa", "aaa");
    assert(result.size() == 2);
    assert(result[0] == 0);
    assert(result[1] == 1);
}

void testPatternAtEnd() {
    std::vector<int> result = zAlgorithmSearch("hellohello", "hello");
    assert(result.size() == 2);
    assert(result[0] == 0);
    assert(result[1] == 5);
}

void testSingleCharacterPattern() {
    std::vector<int> result = zAlgorithmSearch("banana", "a");
    assert(result.size() == 3);
    assert(result[0] == 1);
    assert(result[1] == 3);
    assert(result[2] == 5);
}

void testWholeTextMatches() {
    std::vector<int> result = zAlgorithmSearch("abc", "abc");
    assert(result.size() == 1);
    assert(result[0] == 0);
}

int main() {
    testBasicSearch();
    testMultipleOccurrences();
    testNoMatch();
    testZArrayClassic();
    testZArrayAllSame();
    testZArrayNoRepetition();
    testSingleCharacter();
    testEmptyPattern();
    testEmptyText();
    testPatternLongerThanText();
    testOverlappingMatches();
    testPatternAtEnd();
    testSingleCharacterPattern();
    testWholeTextMatches();

    std::cout << "All 14 tests passed!" << std::endl;
    return 0;
}
