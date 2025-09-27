#include <cassert>
#include <vector>
#include <string>
#include <iostream>
#include "pattern_matching.cpp"

int main(){
    string text="ababcabcabc", pattern="abc";

    auto res1 = naive_search(text,pattern);
    assert(res1.size()==3 && res1[0]==2 && res1[1]==5 && res1[2]==8);

    auto res2 = kmp_search(text,pattern);
    assert(res2==res1);

    std::cout << "Pattern Matching tests passed!" << std::endl;
}
