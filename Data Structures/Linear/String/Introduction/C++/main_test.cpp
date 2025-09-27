#include <cassert>
#include <iostream>
#include "introduction.cpp"

int main(){
    assert(access_char("hello",1)=='e');
    assert(string_length("hello")==5);
    auto v = traverse_string("abc");
    assert(v.size()==3 && v[0]=='a');
    assert(concatenate("abc","def")=="abcdef");
    assert(substring("abcdef",1,4)=="bcd");

    std::cout << "All Introduction to String tests passed!" << std::endl;
}
