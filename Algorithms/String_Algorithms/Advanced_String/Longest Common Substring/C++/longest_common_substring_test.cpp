/**
 * Unit tests for Longest Common Substring
 */

#include <cassert>
#include <string>
#include <iostream>
#include "longest_common_substring.cpp"

void testBasic() {
    std::string s1 = "ABABC";
    std::string s2 = "BABCA";
    std::string result = longestCommonSubstring(s1, s2);
    assert(result == "BABC" || result == "ABCA");
    assert(result.length() == 4);
}

void testNoCommonSubstring() {
    std::string s1 = "ABC";
    std::string s2 = "XYZ";
    std::string result = longestCommonSubstring(s1, s2);
    assert(result.empty());
}

void testIdenticalStrings() {
    std::string s1 = "ABCD";
    std::string s2 = "ABCD";
    std::string result = longestCommonSubstring(s1, s2);
    assert(result == "ABCD");
}

void testSingleCharCommon() {
    std::string s1 = "ABCD";
    std::string s2 = "EFGC";
    std::string result = longestCommonSubstring(s1, s2);
    assert(result == "C");
}

void testEmptyString() {
    std::string s1 = "";
    std::string s2 = "ABC";
    std::string result = longestCommonSubstring(s1, s2);
    assert(result.empty());
}

void testBothEmpty() {
    std::string s1 = "";
    std::string s2 = "";
    std::string result = longestCommonSubstring(s1, s2);
    assert(result.empty());
}

int main() {
    testBasic();
    testNoCommonSubstring();
    testIdenticalStrings();
    testSingleCharCommon();
    testEmptyString();
    testBothEmpty();
    
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

