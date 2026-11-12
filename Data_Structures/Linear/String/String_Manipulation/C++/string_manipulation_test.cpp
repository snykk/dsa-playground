#include <cassert>
#include <vector>
#include <string>
#include <iostream>
#include "string_manipulation.cpp"

int main(){
    assert(reverse_string("hello")=="olleh");
    assert(is_palindrome("level"));
    assert(!is_palindrome("hello"));
    assert(count_vowels("hello")==2);
    assert(replace_char("hello",'l','x')=="hexxo");
    assert(to_upper("abc")=="ABC");
    assert(to_lower("ABC")=="abc");

    auto lst = split_string("a b c");
    assert(lst.size()==3 && lst[0]=="a");
    assert(join_string(lst,"-")=="a-b-c");

    // split keeps empty fields, like Python and Go (it used to drop a trailing one)
    assert((split_string("") == vector<string>{""}));
    assert((split_string("a b ") == vector<string>{"a", "b", ""}));
    assert((split_string("a  b") == vector<string>{"a", "", "b"}));
    assert((split_string(",a,", ',') == vector<string>{"", "a", ""}));
    assert((split_string("abc") == vector<string>{"abc"}));
    assert(join_string({}, "-")=="");
    assert(join_string({"x"}, "-")=="x");
    assert(join_string(split_string("a b "), " ")=="a b ");

    // Palindromes: empty, single, even, odd, case sensitive
    assert(is_palindrome(""));
    assert(is_palindrome("a"));
    assert(is_palindrome("abba"));
    assert(is_palindrome("racecar"));
    assert(!is_palindrome("abca"));
    assert(!is_palindrome("Aa"));

    // Case conversion leaves bytes >= 0x80 (UTF-8) untouched: it uses unsigned char
    assert(to_upper("caf\xc3\xa9 mixed 123")=="CAF\xc3\xa9 MIXED 123");
    assert(to_lower("CAF\xc3\x89")=="caf\xc3\x89");
    assert(to_upper("")=="");

    // Reverse and vowels on edge inputs
    assert(reverse_string("")=="");
    assert(reverse_string("a")=="a");
    assert(count_vowels("")==0);
    assert(count_vowels("AEIOUaeiou")==10);
    assert(replace_char("", 'a', 'b')=="");
    assert(replace_char("aaa", 'a', 'b')=="bbb");

    std::cout << "All String Manipulation tests passed!" << std::endl;
}
