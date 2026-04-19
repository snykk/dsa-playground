#include "aho_corasick.h"

#include <algorithm>
#include <cassert>
#include <iostream>
#include <set>
#include <string>

using MatchSet = std::set<std::pair<int, std::string>>;

MatchSet asMatchSet(const AhoCorasick& ac,
                    const std::vector<std::pair<int, int>>& matches) {
    MatchSet result;
    for (auto& [end_idx, pid] : matches) {
        result.insert({end_idx, ac.pattern(pid)});
    }
    return result;
}

void testSinglePatternMatch() {
    AhoCorasick ac({"abc"});
    auto res = asMatchSet(ac, ac.search("xxabcxx"));
    assert(res.size() == 1);
    assert(res.count({4, "abc"}) == 1);
}

void testNoMatch() {
    AhoCorasick ac({"abc", "def"});
    assert(ac.search("xyz").empty());
}

void testEmptyText() {
    AhoCorasick ac({"abc"});
    assert(ac.search("").empty());
}

void testEmptyPatterns() {
    AhoCorasick ac({});
    assert(ac.search("hello").empty());
}

void testClassicUshers() {
    AhoCorasick ac({"he", "she", "his", "hers"});
    auto res = asMatchSet(ac, ac.search("ushers"));
    MatchSet expected = {{3, "she"}, {3, "he"}, {5, "hers"}};
    assert(res == expected);
}

void testOverlappingPatterns() {
    AhoCorasick ac({"ab", "bc", "abc"});
    auto res = asMatchSet(ac, ac.search("abcabc"));
    MatchSet expected = {
        {1, "ab"}, {2, "bc"}, {2, "abc"},
        {4, "ab"}, {5, "bc"}, {5, "abc"},
    };
    assert(res == expected);
}

void testPatternIsPrefixOfAnother() {
    AhoCorasick ac({"ab", "abab", "aba"});
    auto res = asMatchSet(ac, ac.search("ababab"));
    MatchSet expected = {
        {1, "ab"}, {2, "aba"}, {3, "ab"}, {3, "abab"},
        {4, "aba"}, {5, "ab"}, {5, "abab"},
    };
    assert(res == expected);
}

void testSingleCharacterPatterns() {
    AhoCorasick ac({"a", "b"});
    auto res = asMatchSet(ac, ac.search("aabba"));
    MatchSet expected = {
        {0, "a"}, {1, "a"}, {2, "b"}, {3, "b"}, {4, "a"},
    };
    assert(res == expected);
}

void testLongPattern() {
    AhoCorasick ac({"abcdefgh"});
    auto res = asMatchSet(ac, ac.search("xxabcdefghxx"));
    MatchSet expected = {{9, "abcdefgh"}};
    assert(res == expected);
}

int main() {
    testSinglePatternMatch();
    testNoMatch();
    testEmptyText();
    testEmptyPatterns();
    testClassicUshers();
    testOverlappingPatterns();
    testPatternIsPrefixOfAnother();
    testSingleCharacterPatterns();
    testLongPattern();
    std::cout << "All 9 tests passed!" << std::endl;
    return 0;
}
