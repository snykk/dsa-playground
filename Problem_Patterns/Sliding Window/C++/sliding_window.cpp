#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>
#include <climits>

using namespace std;

/**
 * Find maximum sum of subarray of size k using fixed sliding window.
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */
int maxSumSubarray(const vector<int>& arr, int k) {
    if (arr.size() < k) {
        return 0;
    }
    
    // Calculate sum of first window
    int windowSum = 0;
    for (int i = 0; i < k; i++) {
        windowSum += arr[i];
    }
    
    int maxSum = windowSum;
    
    // Slide the window
    for (int i = k; i < arr.size(); i++) {
        windowSum = windowSum - arr[i - k] + arr[i];
        maxSum = max(maxSum, windowSum);
    }
    
    return maxSum;
}

/**
 * Find length of longest substring with at most k distinct characters.
 * Time Complexity: O(n)
 * Space Complexity: O(k)
 */
int longestSubstringKDistinct(const string& s, int k) {
    if (s.empty() || k == 0) {
        return 0;
    }
    
    unordered_map<char, int> charCount;
    int left = 0;
    int maxLen = 0;
    
    for (int right = 0; right < s.length(); right++) {
        charCount[s[right]]++;
        
        // Shrink window if distinct chars exceed k
        while (charCount.size() > k) {
            charCount[s[left]]--;
            if (charCount[s[left]] == 0) {
                charCount.erase(s[left]);
            }
            left++;
        }
        
        maxLen = max(maxLen, right - left + 1);
    }
    
    return maxLen;
}

/**
 * Find minimum window substring containing all characters of t.
 * Time Complexity: O(|s| + |t|)
 * Space Complexity: O(|s| + |t|)
 */
string minWindowSubstring(const string& s, const string& t) {
    if (s.empty() || t.empty() || s.length() < t.length()) {
        return "";
    }
    
    // Count characters in t
    unordered_map<char, int> need;
    for (char c : t) {
        need[c]++;
    }
    
    unordered_map<char, int> window;
    int left = 0;
    int valid = 0;
    int start = 0;
    int minLen = INT_MAX;
    
    for (int right = 0; right < s.length(); right++) {
        char c = s[right];
        
        // Add to window
        if (need.count(c)) {
            window[c]++;
            if (window[c] == need[c]) {
                valid++;
            }
        }
        
        // Shrink window
        while (valid == need.size()) {
            // Update minimum window
            if (right - left + 1 < minLen) {
                start = left;
                minLen = right - left + 1;
            }
            
            // Remove left character
            char leftChar = s[left];
            if (need.count(leftChar)) {
                if (window[leftChar] == need[leftChar]) {
                    valid--;
                }
                window[leftChar]--;
            }
            left++;
        }
    }
    
    return minLen == INT_MAX ? "" : s.substr(start, minLen);
}

/**
 * Find length of longest substring without repeating characters.
 * Time Complexity: O(n)
 * Space Complexity: O(min(n, m)) where m is charset size
 */
int longestSubstringNoRepeat(const string& s) {
    unordered_map<char, int> charIndex;
    int left = 0;
    int maxLen = 0;
    
    for (int right = 0; right < s.length(); right++) {
        // If character seen before and within current window
        if (charIndex.count(s[right]) && charIndex[s[right]] >= left) {
            left = charIndex[s[right]] + 1;
        }
        
        charIndex[s[right]] = right;
        maxLen = max(maxLen, right - left + 1);
    }
    
    return maxLen;
}

#ifndef TESTING
#ifndef IS_TEST_BUILD
int main() {
    cout << "Sliding Window Examples:" << endl;
    cout << endl;
    
    // Fixed window: Maximum sum subarray
    vector<int> arr = {1, 4, 2, 10, 23, 3, 1, 0, 20};
    int k = 4;
    int result = maxSumSubarray(arr, k);
    cout << "Maximum sum of subarray of size " << k << ": " << result << endl;
    cout << endl;
    
    // Variable window: Longest substring with k distinct
    string s = "eceba";
    k = 2;
    result = longestSubstringKDistinct(s, k);
    cout << "Longest substring with " << k << " distinct chars: " << result << endl;
    cout << endl;
    
    // Minimum window substring
    s = "ADOBECODEBANC";
    string t = "ABC";
    string resultStr = minWindowSubstring(s, t);
    cout << "Minimum window containing '" << t << "': '" << resultStr << "'" << endl;
    cout << endl;
    
    // Longest substring without repeat
    s = "abcabcbb";
    result = longestSubstringNoRepeat(s);
    cout << "Longest substring without repeat: " << result << endl;
    
    return 0;
}
#endif
#endif  // !IS_TEST_BUILD
