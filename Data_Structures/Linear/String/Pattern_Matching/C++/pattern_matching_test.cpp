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

    // Regression: an empty pattern made kmp_search read lps[-1] and crash.
    auto res3 = kmp_search(text,"");
    assert(res3==naive_search(text,""));
    assert((int)res3.size()==(int)text.size()+1 && res3.front()==0 && res3.back()==(int)text.size());
    assert(kmp_search("","")==vector<int>{0});

    // Pattern longer than the text, overlapping matches.
    assert(kmp_search("ab","abc").empty() && naive_search("ab","abc").empty());
    assert(kmp_search("aaaa","aa")==(vector<int>{0,1,2}));
    assert(naive_search("aaaa","aa")==(vector<int>{0,1,2}));

    std::cout << "Pattern Matching tests passed!" << std::endl;
}
