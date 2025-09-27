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

    std::cout << "All String Manipulation tests passed!" << std::endl;
}
