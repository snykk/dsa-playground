#include <cassert>
#include <iostream>
#include "sliding_window.cpp"

int main() {
    // Test maxSumSubarray
    vector<int> arr1 = {1, 4, 2, 10, 23, 3, 1, 0, 20};
    assert(maxSumSubarray(arr1, 4) == 39);
    
    vector<int> arr2 = {100, 200, 300, 400};
    assert(maxSumSubarray(arr2, 2) == 700);
    
    vector<int> arr3 = {1, 2, 3};
    assert(maxSumSubarray(arr3, 5) == 0);
    // Regression: k <= 0 is rejected the same way in all three languages.
    assert(maxSumSubarray(arr3, 0) == 0);
    assert(maxSumSubarray(arr3, -1) == 0);
    assert(maxSumSubarray(vector<int>{-5, -2, -9}, 2) == -7);
    
    // Test longestSubstringKDistinct
    assert(longestSubstringKDistinct("eceba", 2) == 3);
    assert(longestSubstringKDistinct("aa", 1) == 2);
    assert(longestSubstringKDistinct("", 2) == 0);
    assert(longestSubstringKDistinct("a", 0) == 0);
    
    // Test minWindowSubstring
    assert(minWindowSubstring("ADOBECODEBANC", "ABC") == "BANC");
    assert(minWindowSubstring("a", "a") == "a");
    assert(minWindowSubstring("a", "aa") == "");
    assert(minWindowSubstring("", "a") == "");
    
    // Test longestSubstringNoRepeat
    assert(longestSubstringNoRepeat("abcabcbb") == 3);
    assert(longestSubstringNoRepeat("bbbbb") == 1);
    assert(longestSubstringNoRepeat("pwwkew") == 3);
    assert(longestSubstringNoRepeat("") == 0);
    
    cout << "All tests passed!" << endl;
    return 0;
}

