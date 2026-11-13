#include <cassert>
#include <iostream>
#include "main.cpp"

int main(){
    assert(access_char("hello",1)=='e');
    assert(string_length("hello")==5);
    auto v = traverse_string("abc");
    assert(v.size()==3 && v[0]=='a');
    assert(concatenate("abc","def")=="abcdef");
    assert(substring("abcdef",1,4)=="bcd");

    // Regression: end < start used to wrap to a huge count and return the whole tail
    assert(substring("abcdef",3,1)=="");
    assert(substring("abcdef",3,3)=="");
    assert(substring("abcdef",0,99)=="abcdef");   // end clamped
    assert(substring("abcdef",9,12)=="");          // start past the end
    assert(substring("abcdef",-2,2)=="ab");        // negative start clamped to 0
    assert(substring("",0,0)=="");

    // Empty strings and byte semantics: "e" with an acute accent is 2 bytes in UTF-8
    assert(string_length("")==0);
    assert(traverse_string("").empty());
    assert(concatenate("","")=="");
    assert(string_length("h\xc3\xa9llo")==6);

    std::cout << "All Introduction to String tests passed!" << std::endl;
}
