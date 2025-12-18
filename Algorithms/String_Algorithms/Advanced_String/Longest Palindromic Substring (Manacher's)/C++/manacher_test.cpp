/**
 * Unit tests for Manacher's Algorithm
 */

#include <cassert>
#include <string>
#include <iostream>
#include "manacher.cpp"

void testBasic() {
    std::string s = "babad";
    std::string result = manacher(s);
    assert(result == "bab" || result == "aba");
    assert(result.length() == 3);
}

void testSingleChar() {
    std::string s = "a";
    std::string result = manacher(s);
    assert(result == "a");
}

void testAllSameChar() {
    std::string s = "aaaa";
    std::string result = manacher(s);
    assert(result == "aaaa");
}

void testNoPalindrome() {
    std::string s = "abc";
    std::string result = manacher(s);
    assert(result.length() == 1);
    assert(result == "a" || result == "b" || result == "c");
}

void testLongPalindrome() {
    std::string s = "racecar";
    std::string result = manacher(s);
    assert(result == "racecar");
}

void testEmptyString() {
    std::string s = "";
    std::string result = manacher(s);
    assert(result.empty());
}

void testTwoChars() {
    std::string s = "aa";
    std::string result = manacher(s);
    assert(result == "aa");
}

int main() {
    testBasic();
    testSingleChar();
    testAllSameChar();
    testNoPalindrome();
    testLongPalindrome();
    testEmptyString();
    testTwoChars();
    
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

